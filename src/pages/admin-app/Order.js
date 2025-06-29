import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Eye,
  MapPin,
  Clock,
  Calendar,
  Truck,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  RefreshCw,
  Edit,
  Printer,
} from "lucide-react";
import { getAllOrder } from "../../api/OrderApi";

// Order status configuration
const orderStatuses = {
  all: {
    label: "Tất cả",
    color: "bg-gray-100 text-gray-800",
    icon: Package,
    description: "Tất cả đơn hàng",
  },
  Pending: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    description: "Đơn hàng chờ xác nhận",
  },
  WaitingPickup: {
    label: "Chờ lấy hàng",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
    description: "Đơn hàng chờ shipper lấy",
  },
  Shipping: {
    label: "Đang giao",
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
    description: "Đơn hàng đang được giao",
  },
  Completed: {
    label: "Đã giao",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    description: "Đơn hàng đã giao thành công",
  },
  Returned: {
    label: "Trả hàng",
    color: "bg-orange-100 text-orange-800",
    icon: AlertCircle,
    description: "Đơn hàng bị trả lại",
  },
};

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Lấy số lượng đơn hàng theo từng trạng thái từ allOrders
  const getOrderCounts = () => {
    const counts = { all: allOrders.length };
    Object.keys(orderStatuses).forEach((status) => {
      if (status !== "all") {
        counts[status] = allOrders.filter(
          (order) => order.status === status
        ).length;
      }
    });
    return counts;
  };

  const orderCounts = getOrderCounts();

  // Sắp xếp đơn hàng
  const sortOrders = (orders, sortType) => {
    const sortedOrders = [...orders];
    
    switch (sortType) {
      case "newest":
        return sortedOrders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "oldest":
        return sortedOrders.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "price_desc":
        return sortedOrders.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
      case "price_asc":
        return sortedOrders.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
      default:
        return sortedOrders;
    }
  };

  // Lọc đơn hàng theo tab và search từ allOrders
  useEffect(() => {
    let filtered = allOrders;
    console.log("allOrders:", allOrders);
    
    // Lọc theo trạng thái
    if (activeTab !== "all") {
      filtered = filtered.filter((order) => order.status === activeTab);
    }

    // Lọc theo tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.phone?.includes(searchTerm) ||
          order._id?.includes(searchTerm) ||
          order.ghnOrderCode?.includes(searchTerm)
      );
    }

    // Sắp xếp
    filtered = sortOrders(filtered, sortBy);

    setFilteredOrders(filtered);
  }, [allOrders, activeTab, searchTerm, sortBy]);

  // Load tất cả đơn hàng sử dụng getAllOrder
  const loadAllOrders = async () => {
    setIsLoading(true);

    try {
      console.log("Loading all orders...");
      const response = await getAllOrder();

      if (response?.status === 200 && response?.data) {
        // Sắp xếp theo thời gian tạo mới nhất
        const sortedOrders = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setAllOrders(sortedOrders);
        console.log(`Total orders loaded: ${sortedOrders.length}`);
      } else {
        console.warn("No orders found or invalid response:", response);
        setAllOrders([]);
      }
    } catch (error) {
      console.error("Error loading all orders:", error);
      setAllOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load tất cả đơn hàng khi component mount
  useEffect(() => {
    loadAllOrders();
  }, []);

  // Format tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format ngày
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Component badge trạng thái
  const StatusBadge = ({ status }) => {
    const config = orderStatuses[status];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
      <div
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </div>
    );
  };

  // Component badge phương thức thanh toán
  const PaymentBadge = ({ method }) => {
    const colors = {
      COD: "bg-amber-100 text-amber-800",
      Banking: "bg-green-100 text-green-800",
      Momo: "bg-pink-100 text-pink-800",
      ZaloPay: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          colors[method] || "bg-gray-100 text-gray-800"
        }`}
      >
        {method}
      </span>
    );
  };

  // Handle tab change
  const handleTabChange = (status) => {
    setActiveTab(status);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadAllOrders();
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý đơn hàng
              </h1>
              <p className="text-gray-600 mt-1">
                Theo dõi và quản lý tất cả đơn hàng của cửa hàng
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-0 overflow-x-auto">
              {Object.entries(orderStatuses).map(([status, config]) => {
                const IconComponent = config.icon;
                const count = orderCounts[status] || 0;
                const isActive = activeTab === status;

                return (
                  <button
                    key={status}
                    onClick={() => handleTabChange(status)}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      isActive
                        ? "border-blue-500 text-blue-600 bg-blue-50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    <span className="mr-2">{config.label}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isActive
                          ? "bg-blue-200 text-blue-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search và Filter */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="transform -translate-y-1/2 text-gray-400 w-5 h-5"
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Tìm theo tên khách hàng, SĐT, mã đơn hàng..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <select 
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="price_desc">Giá trị cao nhất</option>
                  <option value="price_asc">Giá trị thấp nhất</option>
                </select>
              </div>
            </div>

            {/* Thông tin tổng quan */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{filteredOrders.length}</span> đơn
                hàng
                {activeTab !== "all" && (
                  <span className="ml-1">
                    - {orderStatuses[activeTab]?.label.toLowerCase()}
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-600">
                Tổng doanh thu:{" "}
                <span className="font-medium text-green-600">
                  {formatCurrency(
                    filteredOrders.reduce(
                      (sum, order) => sum + (order.financial?.shopRevenue || 0),
                      0
                    )
                  )}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">
              Đang tải tất cả đơn hàng...
            </p>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={
                            order.products?.[0]?.image?.[0] ||
                            "https://via.placeholder.com/64"
                          }
                          alt="Product"
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/64?text=No+Image";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-semibold text-gray-900">
                            #{order._id?.slice(-8) || "N/A"}
                          </span>
                          <StatusBadge status={order.status} />
                          <PaymentBadge method={order.paymentMethod} />
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">
                            {order.name || "N/A"}
                          </span>{" "}
                          • {order.phone || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.products?.length || 0} sản phẩm • Tạo lúc{" "}
                          {order.createdAt
                            ? formatDate(order.createdAt)
                            : "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-900">
                          {formatCurrency(order.totalPrice || 0)}
                        </div>
                        <div className="text-sm text-green-600">
                          Doanh thu:{" "}
                          {formatCurrency(order.financial?.shopRevenue || 0)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link to={`/app/orders-app/${order._id}`}>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                        </Link>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <Printer className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick info */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">
                        {order.district || "N/A"}, {order.city || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Dự kiến: {order.estimatedDate || "N/A"}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Package className="w-4 h-4 mr-2" />
                      <span>
                        {order.ghnOrderCode
                          ? `GHN: ${order.ghnOrderCode}`
                          : "Chưa có mã vận đơn"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {filteredOrders.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy đơn hàng
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? "Không có đơn hàng nào khớp với từ khóa tìm kiếm"
                    : `Chưa có đơn hàng nào ở trạng thái "${orderStatuses[
                        activeTab
                      ]?.label.toLowerCase()}"`}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;