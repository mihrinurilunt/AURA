from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from services.inventory_ai import analyze_inventory_service
from services.campaign_ai import generate_campaign

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# MODELS
# -------------------------

class Product(BaseModel):
    id: str
    name: str
    category: str
    price: float
    stock: int
    description: str
    imageUrl: str
    active: bool


# -------------------------
# ENDPOINT 1 - INVENTORY ANALYSIS
# -------------------------

@app.post("/satici-asistani")
async def analyze_inventory(products: List[Product]):
    return analyze_inventory_service(products)


# -------------------------
# ENDPOINT 2 - CAMPAIGN AI
# -------------------------

@app.post("/ai/campaign-suggestion")
async def campaign_suggestion(payload: dict):
    try:
        return generate_campaign(payload)
    except Exception:
        return {
            "headline": "AI şu an çalışmıyor",
            "body": "Lütfen daha sonra tekrar deneyin",
            "tags": [],
            "secondary": []
        }