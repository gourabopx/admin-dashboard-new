"use client";

import { Card } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getDashboardAnalytics } from "@/app/actions/analytics";
import { formatDistanceToNow } from "date-fns";

const DashboardPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardAnalytics();
        if (!result.error) {
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-blue-500">
          <div className="flex items-center space-x-4">
            <ShoppingCart className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold">{data?.totalOrders || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-green-500">
          <div className="flex items-center space-x-4">
            <Package className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <h3 className="text-2xl font-bold">{data?.totalProducts || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-purple-500">
          <div className="flex items-center space-x-4">
            <DollarSign className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold">
                ${data?.totalRevenue?.toFixed(2) || "0.00"}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-orange-500">
          <div className="flex items-center space-x-4">
            <TrendingUp className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-bold">{data?.totalSales || 0}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.recentOrders?.map((order: any) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status || "Processing"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${order.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Performance */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Top Products</h3>
          <div className="space-y-4">
            {data?.topProducts?.map((product: any) => (
              <div
                key={product.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    {product.images?.[0]?.url && (
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <p className="text-sm text-gray-500">
                      {product.category.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${product.sizes?.[0]?.price.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-sm text-green-500">{product.sold} sold</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Customers */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Customers</h3>
          <div className="space-y-4">
            {data?.recentCustomers?.map((customer: any) => (
              <div key={customer.id} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {customer.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{customer.username}</p>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
                <div className="ml-auto text-sm text-gray-500">
                  Joined {formatDistanceToNow(new Date(customer.createdAt))} ago
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
