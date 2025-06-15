"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getOrders, updateOrderStatus } from "@/app/actions/order";
import { format } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";
import debounce from "lodash/debounce";

interface OrderProduct {
  productId: string | null;
  name: string | null;
  image: string | null;
  size: string | null;
  qty: number | null;
  price: number | null;
  productCompletedAt: Date | null;
}

interface Order {
  id: string;
  products: OrderProduct[];
  total: number;
  status: string | null;
  isPaid: boolean;
  paymentMethod: string | null;
  shippingAddress: {
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    country: string | null;
  } | null;
  user: {
    username: string;
    email: string;
  };
  couponApplied: string | null;
  totalBeforeDiscount: number | null;
  shippingPrice: number;
  taxPrice: number | null;
  createdAt: Date;
  paidAt: Date | null;
  deliveredAt: Date | null;
  paymentResult: {
    id: string | null;
    status: string | null;
    email: string | null;
  } | null;
}

interface OrderFilters {
  searchQuery?: string;
  dateRange?: string;
  paymentStatus?: string;
  paymentMethod?: string;
}

const dateRangeOptions = [
  { value: "all", label: "All Orders" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Today & Yesterday" },
  { value: "2days", label: "Last 2 Days" },
  { value: "1week", label: "Last Week" },
  { value: "15days", label: "Last 15 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "2months", label: "Last 2 Months" },
  { value: "5months", label: "Last 5 Months" },
  { value: "10months", label: "Last 10 Months" },
  { value: "12months", label: "Last 12 Months" },
];

const orderStatusOptions = [
  "Not Processed",
  "Processing",
  "Dispatched",
  "Cancelled",
  "Delivered",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchOrders(filters: OrderFilters = {}) {
    setIsLoading(true);
    const result = await getOrders(filters);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      setOrders(result.orders);
    }
    setIsLoading(false);
  }

  // Create a debounced version of fetchOrders
  const debouncedFetch = useCallback(
    debounce((filters: OrderFilters) => {
      fetchOrders(filters);
    }, 300),
    []
  );

  // Effect to handle filter changes
  useEffect(() => {
    debouncedFetch({
      searchQuery,
      dateRange,
      paymentStatus,
      paymentMethod,
    });
  }, [searchQuery, dateRange, paymentStatus, paymentMethod, debouncedFetch]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const result = await updateOrderStatus(orderId, newStatus);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Order status updated successfully");
      fetchOrders({
        searchQuery,
        dateRange,
        paymentStatus,
        paymentMethod,
      }); // Refresh orders list with current filters
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Orders Management</h1>

      {/* Filters Section */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Order ID</label>
            <Input
              placeholder="Enter order ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Status</label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">No Filter</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="not_paid">Not Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">No Filter</SelectItem>
                <SelectItem value="cod">COD</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.user.username}</TableCell>
                <TableCell>
                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="capitalize">
                  {order.paymentMethod}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      order.isPaid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Not Paid"}
                  </span>
                </TableCell>
                <TableCell>₹{order.total}</TableCell>
                <TableCell className="capitalize">{order.status}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Detailed information about the order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p>{selectedOrder.user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{selectedOrder.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p>
                      {selectedOrder.shippingAddress?.firstName}{" "}
                      {selectedOrder.shippingAddress?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{selectedOrder.shippingAddress?.phoneNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p>{selectedOrder.shippingAddress?.address1}</p>
                    {selectedOrder.shippingAddress?.address2 && (
                      <p>{selectedOrder.shippingAddress?.address2}</p>
                    )}
                    <p>
                      {selectedOrder.shippingAddress?.city},{" "}
                      {selectedOrder.shippingAddress?.state}{" "}
                      {selectedOrder.shippingAddress?.zipCode}
                    </p>
                    <p>{selectedOrder.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Order Status</h3>
                <Select
                  value={selectedOrder.status || "Not Processed"}
                  onValueChange={(value) =>
                    handleStatusChange(selectedOrder.id, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Products Table */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Ordered Products</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.products.map((product, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {typeof product.image === "string" &&
                              product.image.length > 0 && (
                                <Image
                                  src={product.image}
                                  alt={product.name || "Product"}
                                  width={40}
                                  height={40}
                                  className="rounded-md"
                                />
                              )}
                            <span>{product.name || "Unnamed Product"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{product.size || "N/A"}</TableCell>
                        <TableCell>{product.qty || 0}</TableCell>
                        <TableCell>₹{product.price || 0}</TableCell>
                        <TableCell>
                          ₹{(product.price || 0) * (product.qty || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Order Summary */}
                <div className="mt-4 space-y-2">
                  {selectedOrder.totalBeforeDiscount && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal:</span>
                      <span>₹{selectedOrder.totalBeforeDiscount}</span>
                    </div>
                  )}
                  {selectedOrder.couponApplied && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Coupon Applied:</span>
                      <span>{selectedOrder.couponApplied}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping:</span>
                    <span>₹{selectedOrder.shippingPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax:</span>
                    <span>₹{selectedOrder.taxPrice || 0}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Payment Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Method:</span>
                    <span className="capitalize">
                      {selectedOrder.paymentMethod || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Status:</span>
                    <span
                      className={
                        selectedOrder.isPaid ? "text-green-600" : "text-red-600"
                      }
                    >
                      {selectedOrder.isPaid ? "Paid" : "Not Paid"}
                    </span>
                  </div>
                  {selectedOrder.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Paid At:</span>
                      <span>
                        {format(
                          new Date(selectedOrder.paidAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
