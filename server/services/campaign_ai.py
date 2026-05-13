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

from services.gemini_client import generate_text

async def generate_campaign_suggestion(product, all_products, product_orders, all_orders) -> str:
    velocity = _calculate_velocity(product)
    together_ids = _find_frequently_bought_together(product["id"], all_orders)
    together_names = [p["name"] for p in all_products if p["id"] in together_ids]
    total_sold = sum(o.get("quantity", 1) for o in product_orders)

    prompt = f"""AURA mağazası için kampanya önerisi yaz.

    Ürün: {product['name']} ({product['category']})
    Fiyat: {product['price']} TL | Stok: {product['stock']} adet
    Toplam satılan: {total_sold} adet | Trend: {velocity}
    Birlikte alınan ürünler: {', '.join(together_names) if together_names else 'henüz veri yok'}

    Somut kampanya önerisi yaz (max 3 cümle, Türkçe):
    - Varsa çapraz satış fırsatı
    - Fiyat/kampanya stratejisi  
    - Stok durumuna göre aciliyet
    Sadece öneriyi yaz."""

    return await generate_text(prompt, max_tokens=250)