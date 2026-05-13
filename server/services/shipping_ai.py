"""
AURA — Shipping AI Servisi
===========================
İki farklı işlev:

1. check_delayed_shipments() — Scheduler tarafından otomatik çağrılır.
   Tüm kargoları tarar, 48+ saat hareketsiz olanları tespit eder,
   girişimciye bildirim atar (şimdilik print, gerçekte push notification).

2. generate_delay_message() — Manuel tetikleyici veya scheduler tarafından çağrılır.
   Claude ile o müşteriye özel, kişisel özür mesajı yazar.
   Girişimci onayladıktan sonra /shipping/approve-message endpoint'i ile gönderilir.

Kullanıldığı endpoint'ler:
  POST /shipping/{shipment_id}/alert  → generate_delay_message()
  POST /shipping/approve-message      → mesajı "gönderir"
  Scheduler (her 30dk)               → check_delayed_shipments()
"""

import os
import json
from datetime import datetime, timezone
import httpx


ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
MODEL = "claude-sonnet-4-20250514"


async def generate_delay_message(
    customer_name: str,
    order_id: str,
    product_name: str,
    delay_hours: int,
) -> str:
    """
    Claude ile müşteriye özel, sıcak ve özür içeren bir gecikme mesajı yazar.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return (
            f"Sayın {customer_name}, {order_id} numaralı siparişiniz "
            f"({product_name}) beklenmedik bir gecikme yaşıyor. "
            "Kısa süre içinde size ulaşacaktır. Anlayışınız için teşekkür ederiz."
        )

    delay_text = (
        f"{delay_hours} saat"
        if delay_hours < 48
        else f"{delay_hours // 24} gün"
    )

    prompt = f"""AURA el yapımı ürünler mağazası adına müşteriye kargo gecikme mesajı yazacaksın.

Müşteri adı: {customer_name}
Sipariş no: {order_id}
Ürün: {product_name}
Gecikme süresi: {delay_text}

Kurallar:
- Sıcak, özür diler ama panikletmez bir ton
- Türkçe, kısa (max 3 cümle)
- "Sayın {customer_name}" ile başla
- Gecikmeyi kabul et, ama mağazanın özenini vurgula
- SMS'te iyi görünsün, emoji kullanma
- Sadece mesaj metnini yaz"""

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    payload = {
        "model": MODEL,
        "max_tokens": 200,
        "messages": [{"role": "user", "content": prompt}],
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(ANTHROPIC_API_URL, json=payload, headers=headers)

    if resp.status_code != 200:
        # Fallback mesaj
        return (
            f"Sayın {customer_name}, {order_id} numaralı siparişiniz "
            f"beklenmedik bir gecikme yaşıyor. En kısa sürede ulaşacaktır."
        )

    data = resp.json()
    return data["content"][0]["text"].strip()


async def check_delayed_shipments(
    shipments: list[dict],
    orders: list[dict],
    customers: list[dict],
) -> list[dict]:
    """
    Scheduler tarafından her 30 dakikada çağrılır.
    48+ saat hareketsiz kargolar için gecikme mesajı üretir,
    girişimciye onay için sunar (gerçekte push notification).

    Returns: Gecikme tespit edilen kargo listesi + üretilen mesajlar
    """
    delayed_alerts = []

    for shipment in shipments:
        if not shipment.get("is_delayed"):
            continue

        # Zaten mesaj gönderilmişse tekrar üretme
        if shipment.get("delay_message_sent"):
            continue

        delay_hours = shipment.get("delay_hours", 0)
        if delay_hours < 48:
            continue

        order = next((o for o in orders if o["id"] == shipment.get("order_id")), None)
        customer = next((c for c in customers if c["id"] == shipment.get("customer_id")), None)

        if not order or not customer:
            continue

        message = await generate_delay_message(
            customer_name=customer["name"],
            order_id=order["id"],
            product_name=order.get("product_name", "ürününüz"),
            delay_hours=delay_hours,
        )

        alert = {
            "shipment_id": shipment["id"],
            "order_id": order["id"],
            "customer_id": customer["id"],
            "customer_name": customer["name"],
            "delay_hours": delay_hours,
            "draft_message": message,
            "detected_at": datetime.now(timezone.utc).isoformat(),
        }

        delayed_alerts.append(alert)

        # Gerçekte burada: push notification / webhook / websocket ile
        # girişimcinin paneline bildirim gönderilir
        print(
            f"[KARGO GECİKME UYARISI] {customer['name']} — {order['id']}\n"
            f"Taslak mesaj: {message}\n"
        )

    return delayed_alerts