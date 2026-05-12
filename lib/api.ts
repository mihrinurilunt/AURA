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
  const response = await fetch('/api/products');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
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
    daily_avg_sales: 0,
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

/** POST /api/orders/{id}/cancel */
export async function cancelOrderWithAiMessage(
  orderId: string,
  customerName: string,
  productName: string,
  reason: string,
  customReason?: string,
): Promise<{ aiMessage: string; success: boolean }> {
  const reasonMap: Record<string, string> = {
    "Stok tükendi": "stock",
    "Ürün hasarlı / kalite sorunu": "damaged",
    "Kargo sorunu": "shipping",
    "Satıcı kaynaklı hata": "seller",
    Diğer: "other",
  };

  const messages: Record<string, string> = {
    stock: `Merhaba ${customerName},\n\n${orderId} numaralı siparişiniz maalesef iptal edilmiştir.\n\nSipariş ettiğiniz "${productName}" ürünü, anlık stok güncellemesindeki bir aksaklık nedeniyle tükendi. Bu durumun yarattığı hayal kırıklığı için içtenlikle özür dileriz.\n\nÖdemeniz 1-3 iş günü içinde kartınıza iade edilecektir. Ürün tekrar stoğa girdiğinde sizi öncelikli olarak bilgilendireceğiz.\n\nHerhangi bir sorunuz için bize ulaşmaktan çekinmeyin. İyi günler dileriz! 🌸`,

    damaged: `Merhaba ${customerName},\n\n${orderId} numaralı siparişinizle ilgili önemli bir güncelleme paylaşmak istiyoruz.\n\nKalite kontrol sürecimizde "${productName}" ürününün standartlarımızı karşılamadığı tespit edildi ve siparişiniz iptal edildi. Yüksek kalite anlayışımızdan ödün vermemek için aldığımız bu kararı anlayışla karşılayacağınızı umuyoruz.\n\nÖdemeniz tam olarak iade edilecek, ayrıca bir sonraki alışverişinizde kullanabileceğiniz %10 indirim kodu hesabınıza tanımlanacaktır.\n\nDeğerli müşterimiz olduğunuz için teşekkür ederiz! 💜`,

    shipping: `Merhaba ${customerName},\n\n${orderId} numaralı siparişinizde kargo sürecinde beklenmedik bir sorun yaşandı ve siparişiniz iptal edilmek zorunda kalındı.\n\nKargo partnerimizden kaynaklanan bu aksaklık için özür dileriz. Ödemeniz 1-3 iş günü içinde tam olarak iade edilecek, bir sonraki siparişinizde ücretsiz kargo hakkı size tanınacaktır.\n\nSorularınız için her zaman buradayız! 🌸`,

    seller: `Merhaba ${customerName},\n\n${orderId} numaralı siparişinizin iptal edilmesi gerekti. Tamamen bizden kaynaklanan bir operasyonel aksaklık yaşandı ve bunun sizi etkilemesi bizi çok üzdü.\n\nÖdemeniz derhal iade sürecine alınmış olup 1-3 iş günü içinde hesabınıza geçecektir. Yaşattığımız mağduriyet için özür diler, bir sonraki alışverişinizde %15 indirim sunmak isteriz.\n\nDeğerli geri bildirimleriniz için kapımız her zaman açık! 💜`,

    other: `Merhaba ${customerName},\n\n${orderId} numaralı siparişinizin${customReason ? ` (${customReason})` : ""} iptal edilmesi gerekti. Bu durum için özür dileriz.\n\nÖdemeniz 1-3 iş günü içinde iade edilecektir. Herhangi bir sorunuz olursa lütfen bizimle iletişime geçin.\n\nAnlayışınız için teşekkür ederiz! 🌸`,
  };

  const type = reasonMap[reason] || "other";
  return {
    aiMessage: messages[type],
    success: true,
  };
}

/** GET /api/shipping/shipments */
export async function getShipments(): Promise<Shipment[]> {
  return mockShipments;
}

/** POST /api/ai/campaign-suggestion */

export async function getCampaignSuggestion(
  productId: string,
): Promise<CampaignSuggestion> {

  const res = await fetch("http://127.0.0.1:8000/ai/campaign-suggestion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product: {
        id: productId,
      },
    }),
  });

  if (!res.ok) {
    throw new Error("Campaign API error");
  }

  return await res.json();
}
