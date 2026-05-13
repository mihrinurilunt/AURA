"""
AURA — FastAPI Backend
======================
Ana giriş noktası. Tüm route'lar burada toplanır.
Çalıştırmak için: uvicorn server.main:app --reload --port 8000
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from services.chat_ai import generate_chat_draft
from services.campaign_ai import generate_campaign_suggestion
from services.shipping_ai import check_delayed_shipments, generate_delay_message
from services.inventory_ai import check_low_stock, generate_daily_report

load_dotenv()

# ---------------------------------------------------------------------------
# Mock veri deposu (gerçek DB gelince burası değişir)
# ---------------------------------------------------------------------------
from mock_store import orders, products, customers, shipments

# ---------------------------------------------------------------------------
# Scheduler: otomatik tetikleyiciler
# ---------------------------------------------------------------------------
scheduler = AsyncIOScheduler()


async def scheduled_shipping_check():
    """Her 30 dakikada bir kargo gecikmelerini kontrol eder."""
    print("[Scheduler] Kargo gecikme kontrolü çalışıyor...")
    await check_delayed_shipments(shipments, orders, customers)


async def scheduled_daily_report():
    """Her gece 23:00'de gün sonu raporu üretir."""
    print("[Scheduler] Gün sonu raporu üretiliyor...")
    report = await generate_daily_report(orders, products)
    print(f"[Scheduler] Rapor hazır:\n{report}")


async def scheduled_stock_check():
    """Her saatte bir stok eşiklerini kontrol eder."""
    print("[Scheduler] Stok kontrolü çalışıyor...")
    await check_low_stock(products)

async def normalize_order(order):
    return {
        **order,
        "items": order.get("items") or [],
        "customer": order.get("customer") or {
            "name": "Unknown",
            "avatarUrl": ""
        }
    }

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Uygulama başlarken scheduler'ı başlat
    scheduler.add_job(scheduled_shipping_check, "interval", minutes=30)
    scheduler.add_job(scheduled_stock_check, "interval", hours=1)
    scheduler.add_job(scheduled_daily_report, "cron", hour=23, minute=0)
    scheduler.start()
    print("[AURA] Scheduler başlatıldı.")
    yield
    scheduler.shutdown()
    print("[AURA] Scheduler kapatıldı.")


# ---------------------------------------------------------------------------
# Uygulama
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AURA API",
    description="Kadın girişimciler için AI destekli e-ticaret backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic modeller
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    customer_id: str
    message: str
    conversation_history: list[dict] = []


class CampaignRequest(BaseModel):
    product_id: str


class DelayMessageRequest(BaseModel):
    shipment_id: str
    customer_id: str
    order_id: str


class ApproveMessageRequest(BaseModel):
    customer_id: str
    message: str
    order_id: str


class CancelOrderRequest(BaseModel):
    order_id: str
    reason: Optional[str] = "Sipariş iptal edildi"


class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    stock: int
    description: Optional[str] = ""
    image_url: Optional[str] = ""


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

from typing import List, Optional

class Customer(BaseModel):
    name: str
    avatarUrl: Optional[str] = None

class OrderItem(BaseModel):
    name: str
    imageUrl: Optional[str] = None

class Order(BaseModel):
    id: str
    orderNumber: str
    customer: Customer
    items: List[OrderItem] = []
    category: str
    totalQuantity: int
    date: str
    status: str
# ---------------------------------------------------------------------------
# SAĞLIK KONTROLÜ
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {"status": "ok", "service": "AURA API", "version": "1.0.0"}


@app.get("/health")
async def health():
    api_key_set = bool(os.getenv("ANTHROPIC_API_KEY"))
    return {
        "status": "ok",
        "anthropic_api_key_configured": api_key_set,
        "scheduler_running": scheduler.running,
    }


# ---------------------------------------------------------------------------
# SİPARİŞLER
# ---------------------------------------------------------------------------
@app.get("/orders")
async def get_orders():
    """Tüm siparişleri döner. Frontend ana sayfa tablosu için kullanılır."""
    return {"orders": orders}

@app.get("/orders", response_model=dict)
async def get_orders():
    return {
        "orders": orders or []
    }

@app.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = next((o for o in orders if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    return order


@app.delete("/orders/{order_id}")
async def cancel_order(order_id: str, body: CancelOrderRequest, background_tasks: BackgroundTasks):
    """
    Siparişi iptal eder. 
    İptal sonrası Claude ile müşteriye özür mesajı taslağı üretir (arka planda).
    """
    order = next((o for o in orders if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")

    order["status"] = "iptal"
    order["cancel_reason"] = body.reason

    # Stok güncelle
    product = next((p for p in products if p["id"] == order.get("product_id")), None)
    if product:
        product["stock"] = product.get("stock", 0) + order.get("quantity", 1)

    return {
        "success": True,
        "message": "Sipariş iptal edildi",
        "order_id": order_id,
    }


# ---------------------------------------------------------------------------
# ÜRÜNLER
# ---------------------------------------------------------------------------
@app.get("/products")
async def get_products():
    """Tüm ürünleri döner. Dashboard envanter tablosu için kullanılır."""
    return {"products": products}


@app.get("/products/{product_id}")
async def get_product(product_id: str):
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return product


@app.post("/products")
async def create_product(body: ProductCreate):
    """Yeni ürün ekler."""
    import uuid
    new_product = {
        "id": f"PRD-{str(uuid.uuid4())[:6].upper()}",
        **body.model_dump(),
    }
    products.append(new_product)
    return {"success": True, "product": new_product}


@app.put("/products/{product_id}")
async def update_product(product_id: str, body: ProductUpdate):
    """Ürün bilgilerini günceller. Ürün sayfasındaki form buraya POST eder."""
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    update_data = body.model_dump(exclude_none=True)
    product.update(update_data)
    return {"success": True, "product": product}


@app.delete("/products/{product_id}")
async def delete_product(product_id: str):
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    products.remove(product)
    return {"success": True}


# ---------------------------------------------------------------------------
# MÜŞTERİLER
# ---------------------------------------------------------------------------
@app.get("/customers")
async def get_customers():
    return {"customers": customers}


@app.get("/customers/{customer_id}")
async def get_customer(customer_id: str):
    customer = next((c for c in customers if c["id"] == customer_id), None)
    if not customer:
        raise HTTPException(status_code=404, detail="Müşteri bulunamadı")
    # Müşteriye ait siparişleri de ekle
    customer_orders = [o for o in orders if o.get("customer_id") == customer_id]
    return {**customer, "orders": customer_orders}


# ---------------------------------------------------------------------------
# KARGO
# ---------------------------------------------------------------------------
@app.get("/shipping")
async def get_shipments():
    """Tüm kargo takip verilerini döner."""
    return {"shipments": shipments}


@app.get("/shipping/{shipment_id}")
async def get_shipment(shipment_id: str):
    shipment = next((s for s in shipments if s["id"] == shipment_id), None)
    if not shipment:
        raise HTTPException(status_code=404, detail="Kargo bulunamadı")
    return shipment


@app.post("/shipping/{shipment_id}/alert")
async def trigger_delay_alert(shipment_id: str):
    """
    Manuel olarak kargo gecikme uyarısı tetikler.
    Frontend'deki 'Müşteriye Bildir' butonu buraya istek atar.
    """
    shipment = next((s for s in shipments if s["id"] == shipment_id), None)
    if not shipment:
        raise HTTPException(status_code=404, detail="Kargo bulunamadı")

    order = next((o for o in orders if o["id"] == shipment.get("order_id")), None)
    customer = next((c for c in customers if c["id"] == shipment.get("customer_id")), None)

    if not order or not customer:
        raise HTTPException(status_code=400, detail="Sipariş veya müşteri bulunamadı")

    # AI ile gecikme mesajı üret
    message = await generate_delay_message(
        customer_name=customer["name"],
        order_id=order["id"],
        product_name=order.get("product_name", "ürününüz"),
        delay_hours=shipment.get("delay_hours", 24),
    )

    return {
        "success": True,
        "draft_message": message,
        "customer": customer,
        "shipment_id": shipment_id,
    }


@app.post("/shipping/approve-message")
async def approve_and_send_message(body: ApproveMessageRequest):
    """
    Girişimci AI taslağını onayladıktan sonra mesajı 'gönderir'.
    Gerçek SMS/e-posta entegrasyonu buraya eklenir.
    """
    # Gerçek entegrasyonda burada Twilio / SendGrid çağrısı yapılır
    print(f"[MSG] {body.customer_id} müşterisine gönderildi: {body.message}")
    return {
        "success": True,
        "sent_to": body.customer_id,
        "order_id": body.order_id,
        "message_preview": body.message[:80] + "...",
    }


# ---------------------------------------------------------------------------
# AI — CHAT (streaming)
# ---------------------------------------------------------------------------
@app.get("/conversations")
async def get_conversations():
    """Tüm sohbet geçmişini döner. Chat sayfasındaki geçmiş sohbetler listesi için kullanılır."""
    # Gerçek uygulamada DB'den çekilir
    conversations = []
    for c in customers:
        customer_orders = [o for o in orders if o.get("customer_id") == c["id"]]
        last_message = f"{len(customer_orders)} sipariş"
        last_time = max((o.get("date", "") for o in customer_orders), default="")
        conversations.append({
            "id": f"conv-{c['id']}",
            "customer_id": c["id"],
            "message": "",
            "response": "",
            "timestamp": last_time,
            "customerName": c["name"],
            "avatarUrl": c.get("avatar_url", "/avatars/default.png"),
            "lastPreview": last_message,
            "lastTime": last_time,
        })
    return {"conversations": conversations}

@app.post("/ai/chat")
async def ai_chat(body: ChatRequest):
    """
    Müşteri mesajına AI taslak yanıt üretir.
    SSE (Server-Sent Events) ile stream eder.
    """
    customer = next((c for c in customers if c["id"] == body.customer_id), None)
    customer_orders = [o for o in orders if o.get("customer_id") == body.customer_id]

    return StreamingResponse(
        generate_chat_draft(
            customer=customer,
            customer_orders=customer_orders,
            message=body.message,
            history=body.conversation_history,
        ),
        media_type="text/event-stream",
    )


@app.post("/ai/chat/simple")
async def ai_chat_simple(body: ChatRequest):
    """
    Streaming istemiyorsan bu endpoint'i kullan. Tam yanıtı tek seferde döner.
    """
    customer = next((c for c in customers if c["id"] == body.customer_id), None)
    customer_orders = [o for o in orders if o.get("customer_id") == body.customer_id]

    result = ""
    async for chunk in generate_chat_draft(
        customer=customer,
        customer_orders=customer_orders,
        message=body.message,
        history=body.conversation_history,
    ):
        if chunk.startswith("data: "):
            result += chunk[6:].strip()

    return {"draft": result}


# ---------------------------------------------------------------------------
# AI — KAMPANYA ÖNERİSİ
# ---------------------------------------------------------------------------
@app.get("/ai/campaign/{product_id}")
async def ai_campaign(product_id: str):
    """
    Ürün sayfasındaki AI Kampanya Önerisi kutusu bu endpoint'i çağırır.
    Son 90 günün satış verisine bakarak çapraz satış + kampanya önerisi üretir.
    """
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    # Bu ürünle ilgili siparişleri filtrele
    product_orders = [o for o in orders if o.get("product_id") == product_id]

    suggestion = await generate_campaign_suggestion(
        product=product,
        all_products=products,
        product_orders=product_orders,
        all_orders=orders,
    )

    return {"product_id": product_id, "suggestion": suggestion}


# ---------------------------------------------------------------------------
# AI — STOK ANALİZİ
# ---------------------------------------------------------------------------
@app.get("/ai/inventory/analysis")
async def ai_inventory_analysis():
    """
    Dashboard'daki stok uyarı banner'ı için AI analizi.
    Düşük stok + satış hızına bakarak yorum üretir.
    """
    from server.services.inventory_ai import generate_stock_commentary
    commentary = await generate_stock_commentary(products, orders)
    return {"commentary": commentary}


@app.get("/ai/inventory/daily-report")
async def ai_daily_report():
    """Gün sonu satış raporu — manuel tetiklemek için."""
    report = await generate_daily_report(orders, products)
    return {"report": report}


# ---------------------------------------------------------------------------
# ANALİTİK
# ---------------------------------------------------------------------------
@app.get("/analytics/summary")
async def get_analytics_summary():
    """
    Dashboard KPI kartları için özet.
    Toplam satış, müşteri sayısı, aktif ürün, aylık gelir.
    """
    delivered = [o for o in orders if o.get("status") == "teslim_edildi"]
    in_cargo = [o for o in orders if o.get("status") == "kargoda"]
    total_revenue = sum(o.get("total_price", 0) for o in delivered)

    return {
        "total_sales": len(delivered),
        "total_customers": len(set(o.get("customer_id") for o in orders)),
        "active_products": len([p for p in products if p.get("stock", 0) > 0]),
        "monthly_revenue": total_revenue,
        "in_cargo_count": len(in_cargo),
        "order_distribution": {
            "sold_pct": round(len(delivered) / max(len(orders), 1) * 100),
            "cargo_pct": round(len(in_cargo) / max(len(orders), 1) * 100),
            "stock_pct": round(
                len([o for o in orders if o.get("status") == "siparis_alindi"])
                / max(len(orders), 1)
                * 100
            ),
        },
    }


@app.get("/analytics/sales-by-month")
async def get_sales_by_month():
    """Aylık satış grafiği için veri."""
    from collections import defaultdict
    monthly = defaultdict(int)
    for order in orders:
        if order.get("status") == "teslim_edildi":
            date = order.get("date", "")
            if date:
                month = date[:7]  # "2026-05"
                monthly[month] += order.get("quantity", 1)
    return {"monthly_sales": dict(sorted(monthly.items()))}