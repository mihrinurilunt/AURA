import type {
  CampaignSuggestion,
  Conversation,
  Order,
  Product,
  ProductInput,
  Shipment,
} from "@/types";
import {
  getDefaultCampaignSuggestion,
  mockConversations,
  mockOrders,
  mockProducts,
  mockShipments,
} from "@/lib/mock-data";

/** GET /api/orders */
export async function getOrders(): Promise<Order[]> {
  return mockOrders;
}

/** GET /api/products */
export async function getProducts(): Promise<Product[]> {
  return mockProducts;
}

/** POST /api/products */
export async function createProduct(data: ProductInput): Promise<Product> {
  const id = `PRD-${Date.now().toString(36).toUpperCase()}`;
  return {
    id,
    name: data.name,
    category: data.category,
    price: data.price,
    stock: data.stock,
    description: data.description,
    imageUrl:
      data.imageUrl ??
      `https://picsum.photos/seed/${encodeURIComponent(id)}/400/400`,
    active: data.active,
  };
}

/** GET /api/chat/conversations */
export async function getConversations(): Promise<Conversation[]> {
  return mockConversations;
}

/** POST /api/chat/ai-draft */
export async function getAiDraft(
  message: string,
  orderId?: string,
): Promise<string> {
  const lower = message.toLowerCase();
  if (
    lower.includes("ezilmiş") ||
    lower.includes("kırılmış") ||
    lower.includes("hayal kırıklığı")
  ) {
    return "Merhaba, yaşattığımız mağduriyet için özür dilerim. Ücretsiz değişim veya iade için hemen size özel bir çözüm linki paylaşıyorum." +
      (orderId ? ` (Sipariş: ${orderId})` : "");
  }
  if (lower.includes("kargo") || lower.includes("ne zaman")) {
    return "Merhaba, siparişiniz bugün içinde kargoya verilecek; takip numarasını mesajınıza ileteceğim.";
  }
  return "Merhaba, mesajınız için teşekkürler. Talebinizi not aldım ve en kısa sürede size dönüş yapacağım." +
    (orderId ? ` Referans: ${orderId}` : "");
}

/** GET /api/shipping/shipments */
export async function getShipments(): Promise<Shipment[]> {
  return mockShipments;
}

/** POST /api/ai/campaign-suggestion */
export async function getCampaignSuggestion(
  productId: string,
): Promise<CampaignSuggestion> {
  return getDefaultCampaignSuggestion(productId);
}
