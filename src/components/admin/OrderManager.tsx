import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { orderApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Package, Eye, MapPin, Phone, Mail, User,
  ChevronLeft, ChevronRight, Calendar, CreditCard, Truck,
} from "lucide-react";

interface OrderItem {
  product: string | { _id: string; name: string; slug: string; price: number; salePrice: number; image: string };
  productName: string;
  quantity: number;
  pricePerItem: number;
  originalPrice: number;
  totalForItem: number;
}

interface DeliverTo {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  landmark?: string;
}

interface Order {
  _id: string;
  orderId: string;
  user: { _id: string; name: string; phone?: string; email?: string };
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  placedAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  outForDeliveryAt: string | null;
  deliveredAt: string | null;
  estimatedDeliveryDate: string;
  deliverTo: DeliverTo;
  items: OrderItem[];
  subtotal: number;
  shippingCharge: number;
  total: number;
}

const statusColors: Record<string, string> = {
  order_placed: "bg-blue-100 text-blue-800 border-blue-200",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  shipped: "bg-violet-100 text-violet-800 border-violet-200",
  out_for_delivery: "bg-amber-100 text-amber-800 border-amber-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusOptions = [
  "order_placed", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled",
];

const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const formatStatus = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const OrderManager = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const limit = 20;

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.list({ page, limit });
      setOrders(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      toast({ title: "Failed to load orders", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, [page]);

  const viewDetail = async (orderId: string) => {
    setDetailLoading(true);
    try {
      const res = await orderApi.getDetail(orderId);
      setSelectedOrder(res.data);
    } catch (e) {
      toast({ title: "Failed to load order", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await orderApi.updateStatus(orderId, newStatus);
      toast({ title: "Status updated", description: `Order status changed to ${formatStatus(newStatus)}` });
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
      loadOrders();
    } catch (e) {
      toast({ title: "Failed to update status", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Orders ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No orders found.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{order.orderId}</span>
                      <Badge variant="outline" className={statusColors[order.status] || ""}>{formatStatus(order.status)}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{order.user.name}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(order.placedAt)}</span>
                      <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" />{order.paymentMethod.replace(/_/g, " ")}</span>
                    </div>
                    <p className="text-sm font-medium">₹{order.total.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={order.status}
                      onValueChange={(val) => handleStatusChange(order._id, val)}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger className="w-[160px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s} value={s}>{formatStatus(s)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => viewDetail(order._id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {detailLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between gap-2 flex-wrap">
                  <span>{selectedOrder.orderId}</span>
                  <Badge variant="outline" className={statusColors[selectedOrder.status] || ""}>{formatStatus(selectedOrder.status)}</Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                {/* Status Update */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Update Status:</span>
                  <Select value={selectedOrder.status} onValueChange={(val) => handleStatusChange(selectedOrder._id, val)} disabled={updatingStatus}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => <SelectItem key={s} value={s}>{formatStatus(s)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {updatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>

                <Separator />

                {/* Customer Info */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><User className="w-4 h-4" />Customer</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>{selectedOrder.user.name}</span>
                    {selectedOrder.user.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{selectedOrder.user.phone}</span>}
                  </div>
                </div>

                <Separator />

                {/* Delivery Address */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><MapPin className="w-4 h-4" />Delivery Address</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p className="font-medium text-foreground">{selectedOrder.deliverTo.fullName}</p>
                    <p>{selectedOrder.deliverTo.addressLine1}</p>
                    {selectedOrder.deliverTo.addressLine2 && <p>{selectedOrder.deliverTo.addressLine2}</p>}
                    <p>{selectedOrder.deliverTo.city}, {selectedOrder.deliverTo.state} - {selectedOrder.deliverTo.pincode}</p>
                    {selectedOrder.deliverTo.landmark && <p>Landmark: {selectedOrder.deliverTo.landmark}</p>}
                    <div className="flex gap-4 pt-1">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{selectedOrder.deliverTo.phone}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{selectedOrder.deliverTo.email}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Items */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Items ({selectedOrder.items.length})</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => {
                      const product = typeof item.product === "object" ? item.product : null;
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                          {product?.image && (
                            <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{product?.name || item.productName}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.pricePerItem}</p>
                          </div>
                          <p className="font-semibold text-sm">₹{item.totalForItem}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{selectedOrder.subtotal}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{selectedOrder.shippingCharge === 0 ? "Free" : `₹${selectedOrder.shippingCharge}`}</span></div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base"><span>Total</span><span>₹{selectedOrder.total}</span></div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Truck className="w-4 h-4" />Timeline</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Placed: {formatDate(selectedOrder.placedAt)}</p>
                    <p>Confirmed: {formatDate(selectedOrder.confirmedAt)}</p>
                    <p>Shipped: {formatDate(selectedOrder.shippedAt)}</p>
                    <p>Out for Delivery: {formatDate(selectedOrder.outForDeliveryAt)}</p>
                    <p>Delivered: {formatDate(selectedOrder.deliveredAt)}</p>
                    <p>Est. Delivery: {formatDate(selectedOrder.estimatedDeliveryDate)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManager;
