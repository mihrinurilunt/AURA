/**
 * AURA — Frontend API İstemcisi
 * ==============================
 * Tüm FastAPI çağrıları buradan yapılır.
 * Bileşenler direkt fetch yazmak yerine bu fonksiyonları kullanır.
 *
 * Kullanım:
 *   import { api } from '@/lib/api'
 *   const orders = await api.getOrders()
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Bilinmeyen hata' }))
    throw new Error(error.detail || `HTTP ${res.status}`)
  }

  return res.json()
}

// ---------------------------------------------------------------------------
// Siparişler
// ---------------------------------------------------------------------------
export const getOrders = () =>
  request<{ orders: Order[] }>('/orders').then(r => r.orders)

export const getOrder = (orderId: string) =>
  request<Order>(`/orders/${orderId}`)

export const cancelOrder = (orderId: string, reason?: string) =>
  request<{ success: boolean }>(`/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, reason }),
  })

export const cancelOrderWithAiMessage = (
  orderNumber: string,
  customerName: string,
  productName: string,
  reason: string,
  customReason?: string,
) =>
  request<{ success: boolean; aiMessage: string }>(`/orders/${orderNumber}/cancel`, {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderNumber,
      reason: customReason || reason,
    }),
  })

// ---------------------------------------------------------------------------
// Ürünler
// ---------------------------------------------------------------------------
export const getProducts = () =>
  request<{ products: Product[] }>('/products').then(r => r.products)

export const getProduct = (productId: string) =>
  request<Product>(`/products/${productId}`)

export const createProduct = (data: Omit<Product, 'id'>) =>
  request<{ success: boolean; product: Product }>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateProduct = (productId: string, data: Partial<Product>) =>
  request<{ success: boolean; product: Product }>(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const deleteProduct = (productId: string) =>
  request<{ success: boolean }>(`/products/${productId}`, { method: 'DELETE' })

// ---------------------------------------------------------------------------
// Müşteriler
// ---------------------------------------------------------------------------
export const getCustomers = () =>
  request<{ customers: Customer[] }>('/customers').then(r => r.customers)

export const getCustomer = (customerId: string) =>
  request<Customer & { orders: Order[] }>(`/customers/${customerId}`)

// ---------------------------------------------------------------------------
// Kargo
// ---------------------------------------------------------------------------
export const getShipments = () =>
  request<{ shipments: Shipment[] }>('/shipping').then(r => r.shipments)

export const triggerDelayAlert = (shipmentId: string) =>
  request<{
    success: boolean
    draft_message: string
    customer: Customer
    shipment_id: string
  }>(`/shipping/${shipmentId}/alert`, { method: 'POST' })

export const approveAndSendMessage = (data: {
  customer_id: string
  message: string
  order_id: string
}) =>
  request<{ success: boolean }>('/shipping/approve-message', {
    method: 'POST',
    body: JSON.stringify(data),
  })

// ---------------------------------------------------------------------------
// Analitik
// ---------------------------------------------------------------------------
export const getAnalyticsSummary = () =>
  request<AnalyticsSummary>('/analytics/summary')

export const getSalesByMonth = () =>
  request<{ monthly_sales: Record<string, number> }>('/analytics/sales-by-month')

// ---------------------------------------------------------------------------
// AI — Chat (Streaming)
// ---------------------------------------------------------------------------
export async function streamChatDraft(
  customerId: string,
  message: string,
  history: { role: string; content: string }[],
  onChunk: (text: string) => void,
  onDone: () => void,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_id: customerId,
      message,
      conversation_history: history,
    }),
  })

  if (!res.ok || !res.body) {
    onChunk('[AI yanıt üretemedi]')
    onDone()
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const text = line.slice(6)
        if (text) onChunk(text)
      }
    }
  }

  onDone()
}

// Streaming istemiyorsan
export const getChatDraft = (
  customerId: string,
  message: string,
  history: { role: string; content: string }[] = [],
) =>
  request<{ draft: string }>('/ai/chat/simple', {
    method: 'POST',
    body: JSON.stringify({
      customer_id: customerId,
      message,
      conversation_history: history,
    }),
  })

export const getConversations = () =>
  request<{ conversations: APIConversation[] }>('/conversations').then(r => r.conversations)

// ---------------------------------------------------------------------------
// AI — Kampanya
// ---------------------------------------------------------------------------
export const getCampaignSuggestion = (productId: string) =>
  request<{ product_id: string; suggestion: string }>(`/ai/campaign/${productId}`)

// ---------------------------------------------------------------------------
// AI — Stok
// ---------------------------------------------------------------------------
export const getInventoryAnalysis = () =>
  request<{ commentary: string }>('/ai/inventory/analysis')

export const getDailyReport = () =>
  request<{ report: string }>('/ai/inventory/daily-report')

// ---------------------------------------------------------------------------
// Tip tanımları
// ---------------------------------------------------------------------------
export interface Order {
  id: string
  customer_id: string
  customer_name: string
  product_id: string
  product_name: string
  product_image?: string
  category: string
  quantity: number
  total_price: number
  date: string
  status: 'siparis_alindi' | 'kargoda' | 'teslim_edildi' | 'iptal'
  tracking_number?: string
  carrier?: string
  is_delayed?: boolean
  delay_hours?: number
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  description?: string
  image_url?: string
  monthly_sales?: number[]
  low_stock_alert?: boolean
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  total_orders: number
  last_order: string
}

export interface Shipment {
  id: string
  order_id: string
  customer_id: string
  tracking_number: string
  carrier: string
  status: string
  steps: string[]
  is_delayed: boolean
  delay_hours: number
  last_update: string
}

export interface APIConversation {
  id: string
  customer_id: string
  message: string
  response: string
  timestamp: string
}

export interface Conversation {
  id: string
  customerName: string
  avatarUrl: string
  lastPreview: string
  lastTime: string
  unreadCount: number
  orderCount: number
  lastOrderDate: string
  messages: any[]
}

export interface AnalyticsSummary {
  total_sales: number
  total_customers: number
  active_products: number
  monthly_revenue: number
  in_cargo_count: number
  order_distribution: {
    sold_pct: number
    cargo_pct: number
    stock_pct: number
  }
}



// Default export — tek obje olarak da kullanılabilir
export const api = {
  getOrders,
  getOrder,
  cancelOrder,
  cancelOrderWithAiMessage,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCustomers,
  getCustomer,
  getShipments,
  triggerDelayAlert,
  approveAndSendMessage,
  getAnalyticsSummary,
  getSalesByMonth,
  streamChatDraft,
  getChatDraft,
  getCampaignSuggestion,
  getInventoryAnalysis,
  getDailyReport,
}