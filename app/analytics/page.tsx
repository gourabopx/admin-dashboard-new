"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getOrdersAnalytics,
  getCustomersAnalytics,
  getProducts,
  getProductAnalytics,
} from "@/app/actions/analytics";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
}

interface ProductPerformanceData {
  month: string;
  sales: number;
  revenue: number;
}

export default function AnalyticsPage() {
  const [orderData, setOrderData] = useState<
    { month: string; orders: number }[]
  >([]);
  const [customerData, setCustomerData] = useState<
    { month: string; customers: number }[]
  >([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [productPerformance, setProductPerformance] = useState<
    ProductPerformanceData[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductAnalytics(selectedProduct);
    }
  }, [selectedProduct]);

  async function fetchInitialData() {
    setIsLoading(true);
    try {
      // Fetch orders analytics
      const ordersResult = await getOrdersAnalytics();
      if ("error" in ordersResult) {
        toast.error(ordersResult.error);
      } else {
        setOrderData(ordersResult.ordersData);
      }

      // Fetch customers analytics
      const customersResult = await getCustomersAnalytics();
      if ("error" in customersResult) {
        toast.error(customersResult.error);
      } else {
        setCustomerData(customersResult.customersData);
      }

      // Fetch products
      const productsResult = await getProducts();
      if ("error" in productsResult) {
        toast.error(productsResult.error);
      } else {
        setProducts(productsResult.products);
        if (productsResult.products.length > 0) {
          setSelectedProduct(productsResult.products[0].id);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch analytics data");
    }
    setIsLoading(false);
  }

  async function fetchProductAnalytics(productId: string) {
    try {
      const result = await getProductAnalytics(productId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setProductPerformance(result.productPerformance);
      }
    } catch (error) {
      toast.error("Failed to fetch product analytics");
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      {/* Orders Analytics */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Orders Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">
              Orders by Month (Bar Chart)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">
              Orders Trend (Line Chart)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Customers Analytics */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Customers Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">
              New Customers by Month (Bar Chart)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="customers" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">
              Customer Growth Trend (Line Chart)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="customers"
                    stroke="#82ca9d"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Product Analytics */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Product Analytics</h2>
        <div className="mb-4">
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">
              Product Sales by Month (Bar Chart)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="sales"
                    fill="#8884d8"
                    name="Units Sold"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="revenue"
                    fill="#82ca9d"
                    name="Revenue (₹)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">
              Product Performance Trend (Line Chart)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sales"
                    stroke="#8884d8"
                    name="Units Sold"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#82ca9d"
                    name="Revenue (₹)"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
