"""
Müşteri mesajına Gemini ile taslak yanıt üretir.
SSE stream yerine basit JSON döner (daha stabil).
"""
import os
from services.gemini_client import generate_text

async def generate_chat_draft(
    customer: dict | None,
    customer_orders: list[dict],
    message: str,
    history: list[dict],
) -> str:
    customer_name = customer["name"] if customer else "Müşteri"
    orders_text = ""
    if customer_orders:
        orders_text = "Müşteri siparişleri:\n"
        for o in customer_orders[:3]:
            orders_text += f"- {o['id']}: {o['product_name']} ({o['status']})\n"

    prompt = f"""Sen AURA mağazasının müşteri hizmetleri asistanısın.
AURA el yapımı kadın ürünleri satan bir e-ticaret mağazasıdır.

Müşteri adı: {customer_name}
{orders_text}

Müşteri mesajı: {message}

Bu müşteriye gönderilecek kısa, sıcak, profesyonel Türkçe yanıt taslağını yaz.
Maksimum 3 cümle. Sadece yanıt metnini yaz."""

    return await generate_text(prompt, max_tokens=200)