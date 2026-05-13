"""
AURA — Chat AI Servisi
=======================
Müşteri mesajını + sipariş geçmişini alır, Claude API'ye gönderir.
Girişimciye göstermek için taslak yanıt üretir (streaming).

Kullanıldığı endpoint: POST /ai/chat
"""

import os
import json
import httpx
from typing import AsyncGenerator


ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
MODEL = "claude-sonnet-4-20250514"


def _build_system_prompt(customer: dict | None, customer_orders: list[dict]) -> str:
    """
    Müşteri bağlamıyla zenginleştirilmiş sistem prompt'u oluşturur.
    """
    customer_info = ""
    if customer:
        customer_info = f"""
Müşteri bilgileri:
- Ad: {customer.get('name', 'Bilinmiyor')}
- Telefon: {customer.get('phone', '-')}
- Toplam sipariş sayısı: {customer.get('total_orders', 0)}
- Son sipariş tarihi: {customer.get('last_order', '-')}
"""

    orders_info = ""
    if customer_orders:
        orders_info = "Müşterinin siparişleri:\n"
        for o in customer_orders[:5]:  # En fazla 5 sipariş
            orders_info += (
                f"- Sipariş {o['id']}: {o['product_name']} | "
                f"Durum: {o['status']} | Tarih: {o['date']}\n"
            )

    return f"""Sen AURA mağazasının müşteri hizmetleri asistanısın.
AURA, el yapımı ve özel tasarım kadın ürünleri satan bir e-ticaret mağazasıdır.

{customer_info}
{orders_info}

Görevin: Girişimcinin müşteriye göndereceği yanıt taslağını hazırlamak.
- Sıcak, samimi ve profesyonel bir ton kullan
- Türkçe yaz, kısa ve net ol (max 3 cümle)
- Müşterinin sorununu veya isteğini doğrudan ele al
- Eğer kargo/sipariş sorusu varsa elimizdeki bilgileri kullan
- Sadece taslak yanıtı yaz, başka açıklama ekleme
"""


async def generate_chat_draft(
    customer: dict | None,
    customer_orders: list[dict],
    message: str,
    history: list[dict],
) -> AsyncGenerator[str, None]:
    """
    Claude API'ye streaming isteği gönderir.
    SSE formatında chunk'ları yield eder: "data: <metin>\n\n"
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        yield "data: [AI devre dışı — ANTHROPIC_API_KEY eksik]\n\n"
        return

    system_prompt = _build_system_prompt(customer, customer_orders)

    # Konuşma geçmişini Anthropic formatına çevir
    messages = []
    for h in history[-10:]:  # Son 10 mesaj
        messages.append({
            "role": h.get("role", "user"),
            "content": h.get("content", ""),
        })
    messages.append({"role": "user", "content": message})

    payload = {
        "model": MODEL,
        "max_tokens": 512,
        "system": system_prompt,
        "messages": messages,
        "stream": True,
    }

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        async with client.stream("POST", ANTHROPIC_API_URL, json=payload, headers=headers) as resp:
            if resp.status_code != 200:
                error_body = await resp.aread()
                yield f"data: [API Hatası: {resp.status_code}]\n\n"
                return

            async for line in resp.aiter_lines():
                if not line or not line.startswith("data: "):
                    continue
                raw = line[6:]
                if raw == "[DONE]":
                    break
                try:
                    event = json.loads(raw)
                    if event.get("type") == "content_block_delta":
                        delta = event.get("delta", {})
                        text = delta.get("text", "")
                        if text:
                            yield f"data: {text}\n\n"
                except json.JSONDecodeError:
                    continue