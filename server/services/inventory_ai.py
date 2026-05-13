"""
AURA — Inventory AI Servisi (Gemini Refactor)
=============================================

İşlevler:
1. check_low_stock()
2. generate_stock_commentary()
3. generate_daily_report()
"""

from datetime import date
from collections import Counter

from services.gemini_client import generate_text

LOW_STOCK_THRESHOLD = 10


async def _call_gemini(prompt: str, max_tokens: int = 400) -> str:
    """
    Merkezi Gemini text üretim wrapper'ı.
    """
    return await generate_text(prompt, max_tokens)


async def check_low_stock(products: list[dict]) -> list[dict]:
    """
    Kritik stok ürünlerini tespit eder
    ve AI destekli öneri üretir.
    """

    low_stock_items = [
        p for p in products
        if p.get("stock", 0) <= LOW_STOCK_THRESHOLD
    ]

    alerts = []

    for product in low_stock_items:

        velocity = product.get("monthly_sales", [])

        avg = (
            sum(velocity) / max(len(velocity), 1)
            if velocity else 0
        )

        days_left = round(
            product["stock"] / max(avg / 30, 0.1)
        )

        prompt = f"""
Sen AURA mağazasının envanter danışmanısın.

Ürün bilgileri:
- Ürün: {product['name']}
- Kalan stok: {product['stock']} adet
- Aylık ortalama satış: {avg:.0f} adet
- Tahmini tükenme süresi: {days_left} gün

Kurallar:
- Türkçe yaz
- Tek cümle yaz
- Kısa ve aksiyon odaklı ol
- Girişimciyi motive et
- Sadece uyarıyı yaz
"""

        try:
            suggestion = await _call_gemini(
                prompt,
                max_tokens=100
            )

        except Exception:
            suggestion = (
                f"{product['name']} yaklaşık "
                f"{days_left} gün içinde tükenebilir, "
                "stok yenilemesi önerilir."
            )

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
    Dashboard AI stok banner özeti üretir.
    """

    low_stock = [
        p for p in products
        if p.get("stock", 0) <= LOW_STOCK_THRESHOLD
    ]

    best_seller = max(
        products,
        key=lambda p: sum(p.get("monthly_sales", [0])),
        default=None,
    )

    product_summary = "\n".join([
        f"- {p['name']}: {p['stock']} adet kaldı"
        for p in low_stock[:3]
    ])

    best_info = (
        f"En çok satan ürün: "
        f"{best_seller['name']} "
        f"({sum(best_seller.get('monthly_sales', []))} satış)"
        if best_seller else ""
    )

    prompt = f"""
AURA mağazası için stok değerlendirme özeti yaz.

Kritik stok ürünleri:
{product_summary if product_summary else "Kritik stok yok"}

{best_info}

Kurallar:
- Türkçe yaz
- Maksimum 2 cümle
- Net ve aksiyon odaklı ol
- Dashboard banner formatına uygun yaz
- Sadece özeti yaz
"""

    try:
        return await _call_gemini(prompt, max_tokens=150)

    except Exception:
        return (
            "Bazı ürünlerde kritik stok seviyeleri tespit edildi. "
            "En çok satan ürünlerin stoklarının kontrol edilmesi önerilir."
        )


async def generate_daily_report(
    orders: list[dict],
    products: list[dict],
) -> str:
    """
    Gün sonu AI raporu üretir.
    """

    today = date.today().isoformat()

    today_orders = [
        o for o in orders
        if o.get("date", "") == today
    ]

    today_revenue = sum(
        o.get("total_price", 0)
        for o in today_orders
    )

    delivered_today = [
        o for o in today_orders
        if o.get("status") == "teslim_edildi"
    ]

    delayed_today = [
        o for o in orders
        if o.get("is_delayed")
    ]

    low_stock = [
        p for p in products
        if p.get("stock", 0) <= LOW_STOCK_THRESHOLD
    ]

    categories = Counter(
        o.get("category", "Diğer")
        for o in today_orders
    )

    cat_summary = ", ".join(
        f"{k}: {v} adet"
        for k, v in categories.most_common()
    )

    prompt = f"""
AURA mağazası için gün sonu raporu hazırla.

Tarih: {today}

Veriler:
- Yeni sipariş: {len(today_orders)}
- Günlük ciro: {today_revenue:.0f} TL
- Teslim edilen sipariş: {len(delivered_today)}
- Geciken kargo: {len(delayed_today)}
- Kritik stok ürün sayısı: {len(low_stock)}
- Kategori satışları: {cat_summary if cat_summary else "Veri yok"}

Kurallar:
1. Günün olumlu özetini yap
2. Varsa dikkat edilmesi gereken durumu belirt
3. Yarın için öneri ver
4. Maksimum 5 cümle yaz
5. Türkçe yaz
6. Motive edici ama profesyonel ton kullan
"""

    try:
        return await _call_gemini(prompt, max_tokens=400)

    except Exception:
        return (
            "Bugün mağazada aktif satış hareketliliği gözlemlendi. "
            "Kritik stok seviyelerindeki ürünlerin takip edilmesi "
            "ve yarın için stok planlaması yapılması önerilir."
        )