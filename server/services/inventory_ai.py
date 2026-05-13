"""
AURA — Inventory AI Servisi
============================
Stok ve envanter ile ilgili üç AI işlevi:

1. check_low_stock() — Düşük stok tespiti, Claude ile "şimdi al" önerisi
2. generate_stock_commentary() — Dashboard stok uyarı banner'ı için kısa yorum
3. generate_daily_report() — Gün sonu: satış özeti + anomaliler + yarın önerileri

Kullanıldığı endpoint'ler:
  GET /ai/inventory/analysis      → generate_stock_commentary()
  GET /ai/inventory/daily-report  → generate_daily_report()
  Scheduler (her saat)           → check_low_stock()
  Scheduler (23:00)              → generate_daily_report()
"""

import os
import httpx
from datetime import date


ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
MODEL = "claude-sonnet-4-20250514"

LOW_STOCK_THRESHOLD = 10  # Bu değerin altı "düşük stok"


async def _call_claude(prompt: str, max_tokens: int = 400) -> str:
    """Claude API'ye basit istek atan yardımcı fonksiyon."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return "AI analizi için ANTHROPIC_API_KEY gereklidir."

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    payload = {
        "model": MODEL,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }

    async with httpx.AsyncClient(timeout=25.0) as client:
        resp = await client.post(ANTHROPIC_API_URL, json=payload, headers=headers)

    if resp.status_code != 200:
        return f"AI yanıt üretemedi (Hata: {resp.status_code})"

    data = resp.json()
    return data["content"][0]["text"].strip()


async def check_low_stock(products: list[dict]) -> list[dict]:
    """
    Düşük stoklu ürünleri tespit eder.
    Her biri için Claude ile "şu ürünü şimdi sipariş ver çünkü..." önerisi üretir.
    Gerçekte: push notification veya dashboard banner.
    """
    low_stock_items = [
        p for p in products
        if p.get("stock", 0) <= LOW_STOCK_THRESHOLD
    ]

    alerts = []
    for product in low_stock_items:
        velocity = product.get("monthly_sales", [])
        avg = sum(velocity) / max(len(velocity), 1) if velocity else 0
        days_left = round(product["stock"] / max(avg / 30, 0.1))

        prompt = f"""AURA mağazası için stok uyarısı yazıyorsun.

Ürün: {product['name']}
Kalan stok: {product['stock']} adet
Aylık ortalama satış: {avg:.0f} adet
Tahminen {days_left} günde tükenir.

Girişimciye kısa (1 cümle) ve motive edici bir uyarı yaz.
Örnek: "El Örgüsü Yün Çorap yaklaşık 12 günde bitecek, hemen sipariş ver!"
Sadece uyarı cümlesini yaz."""

        suggestion = await _call_claude(prompt, max_tokens=100)

        alert = {
            "product_id": product["id"],
            "product_name": product["name"],
            "stock": product["stock"],
            "days_until_empty": days_left,
            "ai_suggestion": suggestion,
        }
        alerts.append(alert)
        print(f"[STOK UYARI] {suggestion}")

    return alerts


async def generate_stock_commentary(
    products: list[dict],
    orders: list[dict],
) -> str:
    """
    Dashboard'daki AI stok uyarı banner'ı için tek paragraf yorum.
    Düşük stok + en çok satan ürünlere odaklanır.
    """
    low_stock = [p for p in products if p.get("stock", 0) <= LOW_STOCK_THRESHOLD]
    best_seller = max(products, key=lambda p: sum(p.get("monthly_sales", [0])), default=None)

    product_summary = "\n".join([
        f"- {p['name']}: {p['stock']} adet kaldı"
        for p in low_stock[:3]
    ])

    best_info = (
        f"En çok satan: {best_seller['name']} ({sum(best_seller.get('monthly_sales', []))} aylık toplam)"
        if best_seller else ""
    )

    prompt = f"""AURA mağazası için stok durumu özeti yaz.

Kritik stok seviyeleri:
{product_summary if product_summary else "Tüm stoklar yeterli."}

{best_info}

Girişimciye yönelik kısa (2 cümle), net ve aksiyon odaklı bir özet yaz.
Sadece özeti yaz."""

    return await _call_claude(prompt, max_tokens=150)


async def generate_daily_report(
    orders: list[dict],
    products: list[dict],
) -> str:
    """
    Her gece 23:00'de çalışır.
    Bugünün satışlarını, anomalileri ve yarın için önerileri özetler.
    """
    today = date.today().isoformat()
    today_orders = [o for o in orders if o.get("date", "") == today]
    today_revenue = sum(o.get("total_price", 0) for o in today_orders)

    delivered_today = [o for o in today_orders if o.get("status") == "teslim_edildi"]
    delayed_today = [o for o in orders if o.get("is_delayed")]

    low_stock = [p for p in products if p.get("stock", 0) <= LOW_STOCK_THRESHOLD]

    # Kategori bazlı satış
    from collections import Counter
    categories = Counter(o.get("category", "Diğer") for o in today_orders)
    cat_summary = ", ".join(f"{k}: {v} adet" for k, v in categories.most_common())

    prompt = f"""AURA mağazası gün sonu raporu ({today}).

Bugünün verileri:
- Toplam yeni sipariş: {len(today_orders)}
- Günlük ciro: {today_revenue:.0f} TL
- Teslim edilen: {len(delivered_today)} sipariş
- Geciken kargo sayısı: {len(delayed_today)}
- Kategori bazlı satış: {cat_summary if cat_summary else "Veri yok"}
- Kritik stok altındaki ürün sayısı: {len(low_stock)}

Girişimciye yönelik bir gün sonu raporu yaz:
1. Bugünün özeti (olumlu bir şey vurgula)
2. Dikkat edilmesi gereken bir anomali (varsa)
3. Yarın için bir öneri

Max 5 cümle, sıcak ve motive edici ton, Türkçe."""

    return await _call_claude(prompt, max_tokens=400)