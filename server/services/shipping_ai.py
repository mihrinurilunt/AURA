"""
AURA — Shipping AI Servisi (Gemini Refactor)
"""

from datetime import datetime, timezone
from services.gemini_client import generate_text


async def generate_delay_message(
    customer_name: str,
    order_id: str,
    product_name: str,
    delay_hours: int,
) -> str:
    """
    Gemini ile müşteriye özel gecikme mesajı üretir.
    """

    delay_text = (
        f"{delay_hours} saat"
        if delay_hours < 48
        else f"{delay_hours // 24} gün"
    )

    prompt = f"""
Sen AURA el yapımı ürünler mağazasının müşteri destek asistanısın.

Müşteri bilgileri:
- Müşteri adı: {customer_name}
- Sipariş no: {order_id}
- Ürün: {product_name}
- Gecikme süresi: {delay_text}

Kurallar:
- Türkçe yaz
- Maksimum 3 cümle
- "Sayın {customer_name}" ile başla
- Sıcak ve profesyonel ton kullan
- Gecikmeyi kabul et
- Panik yaratma
- SMS formatına uygun olsun
- Emoji kullanma
- Sadece mesaj metnini yaz
"""

    try:
        response = await generate_text(prompt, max_tokens=200)

        if not response or "AI yanıt üretemedi" in response:
            raise ValueError("Gemini fallback tetiklendi")

        return response.strip()

    except Exception:
        # Güvenli fallback mesaj
        return (
            f"Sayın {customer_name}, "
            f"{order_id} numaralı siparişinizde beklenmedik bir gecikme yaşanmaktadır. "
            "Siparişiniz en kısa sürede size ulaştırılacaktır."
        )


async def check_delayed_shipments(
    shipments: list[dict],
    orders: list[dict],
    customers: list[dict],
) -> list[dict]:
    """
    48+ saat geciken kargoları kontrol eder
    ve AI destekli mesaj üretir.
    """

    delayed_alerts = []

    for shipment in shipments:

        if not shipment.get("is_delayed"):
            continue

        # Daha önce mesaj üretildiyse tekrar üretme
        if shipment.get("delay_message_sent"):
            continue

        delay_hours = shipment.get("delay_hours", 0)

        if delay_hours < 48:
            continue

        order = next(
            (o for o in orders if o["id"] == shipment.get("order_id")),
            None,
        )

        customer = next(
            (c for c in customers if c["id"] == shipment.get("customer_id")),
            None,
        )

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

        print(
            f"[KARGO GECİKME UYARISI]\n"
            f"Müşteri: {customer['name']}\n"
            f"Sipariş: {order['id']}\n"
            f"Mesaj: {message}\n"
        )

    return delayed_alerts