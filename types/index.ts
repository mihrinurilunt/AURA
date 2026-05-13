export type OrderStatus = "received" | "shipping" | "delivered";

export interface OrderCustomer {
  name: string;
  avatarUrl: string;
}

export interface OrderLineItem {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderLineItem[];
  /** Birincil kategori (tablo için) */
  category: string;
  totalQuantity: number;
  /** Stok analizi ve iptal akışı için birincil ürün */
  productId: string;
  /** Birincil satır adedi */
  quantity: number;
  date: string;
  status: OrderStatus;
}

export type ProductCategory =
  | "Çorap"
  | "Şal"
  | "Takı"
  | "Çanta"
  | "Diğer";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  active: boolean;
  daily_avg_sales: number;
}

export interface ProductInput {
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description: string;
  imageUrl?: string;
  active: boolean;
}

export type MessageRole = "customer" | "owner";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  time: string;
  /** Müşteri mesajları için AI taslak metni */
  aiDraft?: string;
}

export interface Conversation {
  id: string;
  customerName: string;
  avatarUrl: string;
  lastPreview: string;
  lastTime: string;
  unreadCount: number;
  orderCount: number;
  lastOrderDate: string;
  messages: ChatMessage[];
}

export interface MonthlySalesPoint {
  month: string;
  Çorap: number;
  Şal: number;
  Takı: number;
  Diğer: number;
}

export type ShipmentStep =
  | "hazirlaniyor"
  | "kargoya_verildi"
  | "dagitimda"
  | "teslim_edildi";

export interface Shipment {
  id: string;
  order_id: string;
  customer_id: string;
  customer_name?: string;
  product_name?: string;
  order_status?: string;
  carrier: string;
  tracking_number: string;
  status: string;
  steps: ShipmentStep[];
  is_delayed: boolean;
  delay_hours: number;
  last_update: string;
}

export interface CampaignSuggestion {
  headline: string;
  body: string;
  tags: string[];
  secondary: Array<{ title: string; body: string }>;
}
