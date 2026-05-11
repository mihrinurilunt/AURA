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
  | "preparing"
  | "shipped"
  | "out_for_delivery"
  | "delivered";

export interface Shipment {
  id: string;
  customerName: string;
  orderNumber: string;
  productName: string;
  carrier: string;
  trackingNumber: string;
  currentStep: ShipmentStep;
  delayed: boolean;
}

export interface CampaignSuggestion {
  headline: string;
  body: string;
  tags: string[];
  secondary: Array<{ title: string; body: string }>;
}
