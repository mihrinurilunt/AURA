"""
AURA — Campaign AI Servisi
===========================
Bir ürünün satış verisini + diğer ürünleri analiz ederek
çapraz satış fırsatları ve kampanya önerileri üretir.

Kullanıldığı endpoint: GET /ai/campaign/{product_id}
Kullanıldığı sayfa: Ürün Yönetimi sayfasındaki "AI Kampanya Önerisi" kutusu
"""

import os
import json
import httpx
from collections import Counter
from dotenv import load_dotenv
from pathlib import Path


load_dotenv("/Users/mihrinur/Desktop/aur_cursor/aura/.env.local")
API_KEY = os.getenv("GEMINI_API_KEY")
print("API KEY:", os.getenv("GEMINI_API_KEY"))
# GEMINI endpoint (DOĞRU FORMAT)
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-1.5-flash:generateContent"
)


def _find_frequently_bought_together(
    product_id: str, all_orders: list[dict]
) -> list[str]:
    """
    Aynı müşterilerin başka hangi ürünleri satın aldığını bulur.
    (Gerçek bir 'sıkça birlikte satın alındı' analizi)
    """
    # Bu ürünü alan müşterileri bul
    buyers = {o["customer_id"] for o in all_orders if o.get("product_id") == product_id}
    if not buyers:
        return []

    # Bu müşterilerin aldığı diğer ürünler
    other_products = [
        o["product_id"]
        for o in all_orders
        if o.get("customer_id") in buyers and o.get("product_id") != product_id
    ]

    # En sık birlikte alınanlar
    counter = Counter(other_products)
    return [pid for pid, _ in counter.most_common(3)]


def _calculate_velocity(product: dict) -> str:
    """Ürünün satış hızını hesaplar."""
    monthly = product.get("monthly_sales", [])
    if len(monthly) < 2:
        return "yeterli veri yok"
    recent = monthly[-2:]
    if recent[-1] > recent[-2]:
        pct = round((recent[-1] - recent[-2]) / max(recent[-2], 1) * 100)
        return f"artıyor (+%{pct} son ay)"
    elif recent[-1] < recent[-2]:
        pct = round((recent[-2] - recent[-1]) / max(recent[-2], 1) * 100)
        return f"düşüyor (-%{pct} son ay)"
    return "sabit"


async def generate_campaign_suggestion(
    product: dict,
    all_products: list[dict],
    product_orders: list[dict],
    all_orders: list[dict],
) -> str:
    """
    Ürün verisi + satış analizi ile GEMINI'dan kampanya önerisi alır.
    """
    # API KEY
    if not API_KEY:
        return "❌ GEMINI_API_KEY bulunamadı (.env kontrol et)"

    # Analiz verisi hazırla
    velocity = _calculate_velocity(product)
    together_ids = _find_frequently_bought_together(product["id"], all_orders)
    together_products = [
        p["name"] for p in all_products if p["id"] in together_ids
    ]

    total_sold = sum(o.get("quantity", 1) for o in product_orders)
    monthly_avg = (
        sum(product.get("monthly_sales", [])) / max(len(product.get("monthly_sales", [])), 1)
    )

    context = f"""
Ürün adı: {product['name']}
Kategori: {product['category']}
Fiyat: {product['price']} TL
Mevcut stok: {product['stock']} adet
Toplam satılan: {total_sold} adet
Aylık ortalama satış: {monthly_avg:.0f} adet
Satış trendi: {velocity}
Bu ürünle sıkça birlikte alınan ürünler: {', '.join(together_products) if together_products else 'henüz yeterli veri yok'}
Tüm ürünler: {', '.join(p['name'] for p in all_products[:8])}
"""

    prompt = f"""Sen AURA e-ticaret mağazasının büyüme danışmanısın.
Aşağıdaki ürün verilerini analiz et ve somut kampanya önerileri yap.

{context}

Şunları içeren kısa bir öneri yaz (max 4 cümle, Türkçe):
1. Varsa çapraz satış fırsatı (hangi ürünlerle birlikte satılsın)
2. Fiyat veya kampanya stratejisi
3. Stok durumuna göre aciliyet önerisi

Sadece öneriyi yaz, giriş cümlesi ekleme."""

    url = f"{GEMINI_URL}?key={API_KEY}"

    headers = { 
    "Content-Type": "application/json"
    }

    payload = {
    "contents": [
        {
            "parts": [
                {"text": prompt}
            ]
        }
    ]
}

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(
            f"{url}?key={API_KEY}",
            json=payload
    )


    data = resp.json()
    candidates = data.get("candidates", [])

    if not candidates:
        return "AI yanıt üretemedi"

    text = candidates[0]["content"]["parts"][0]["text"]
    return text.strip()