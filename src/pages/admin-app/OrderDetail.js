import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Package,
  MapPin,
  Clock,
  DollarSign,
  User,
  Phone,
  Calendar,
  Truck,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Eye,
  Check,
  Settings,
  TrendingUp,
} from "lucide-react";
import { getOrderDetailByAdmin } from "../../api/OrderApi";
// import { confirmGHNOrder } from "../../api/DeliveryApi";
import { getShippingStatusDescription } from "../../utils/shippingStatus";

// Order status configuration
const orderStatuses = {
  Pending: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  WaitingPickup: {
    label: "Chờ lấy hàng",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
  },
  Shipping: {
    label: "Đang giao",
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
  },
  Completed: {
    label: "Đã giao",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  Returned: {
    label: "Trả hàng",
    color: "bg-orange-100 text-orange-800",
    icon: AlertCircle,
  },
};

const paymentMethodLabels = {
  COD: "Thanh toán khi nhận hàng",
  Banking: "Chuyển khoản ngân hàng",
  Momo: "Ví MoMo",
  ZaloPay: "Ví ZaloPay",
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch order detail
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setIsLoading(true);
        const response = await getOrderDetailByAdmin(orderId);
        
        if (response.status === 200 && response.data.success) {
          setOrderData(response.data.data);
          console.log("Order data fetched successfully:", response.data.data);
        } else {
          setOrderData(null);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setOrderData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Component functions
  const StatusBadge = ({ status }) => {
    const config = orderStatuses[status];
    if (!config) return null;
    
    const IconComponent = config.icon;

    return (
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}
      >
        <IconComponent className="w-4 h-4 mr-2" />
        {config.label}
      </div>
    );
  };

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
        {paymentMethodLabels[method] || method}
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-600 mb-4">
            Đơn hàng có ID "{orderId}" không tồn tại
          </p>
          <Link
            to="/app/orders-app"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  // Data preparation
  const { order, financial } = orderData;
  
  const totalWeight = order.products?.reduce(
    (sum, product) => sum + (product.weight || 0) * product.quantity,
    0
  ) || 0;

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/app/orders-app"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Đơn hàng #{order._id.slice(-8)}
                </h1>
                <p className="text-gray-600">
                  Tạo lúc {formatDate(order.createdAt)} • Cập nhật{" "}
                  {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Settings className="w-4 h-4 mr-2" />
                Quản lý đơn hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Content - Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "overview", label: "Tổng quan", icon: Package },
                    { id: "products", label: "Sản phẩm", icon: Package },
                    { id: "shipping", label: "Vận chuyển", icon: Truck },
                    { id: "financial", label: "Tài chính", icon: DollarSign },
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Order Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Shipping Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Thông tin giao hàng
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                              <p className="font-medium">{order.name}</p>
                              <p className="text-gray-600">{order.phone}</p>
                              <p className="text-gray-600 text-sm">
                                {order.address}, {order.ward}, {order.district},{" "}
                                {order.city}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Thông tin đơn hàng
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Phương thức thanh toán:
                            </span>
                            <PaymentBadge method={order.paymentMethod} />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Dự kiến giao hàng:
                            </span>
                            <span className="font-medium">
                              {order.estimatedDate}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trạng thái vận chuyển:</span>
                            <span className="font-medium">
                              {order.shippingStatus || 'Chưa vận chuyển'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Khách hàng ID:</span>
                            <span className="font-mono text-sm">
                              {order.userId.slice(-8)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Admin Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-blue-600 text-2xl font-bold">
                          {order.products?.length || 0}
                        </div>
                        <div className="text-blue-800 text-sm">Sản phẩm</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-green-600 text-2xl font-bold">
                          {formatCurrency(order.totalPrice)}
                        </div>
                        <div className="text-green-800 text-sm">Tổng đơn hàng</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-purple-600 text-2xl font-bold">
                          {formatCurrency(financial?.adminRevenue || 0)}
                        </div>
                        <div className="text-purple-800 text-sm">Doanh thu quản trị viên</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-orange-600 text-2xl font-bold">
                          {totalWeight}g
                        </div>
                        <div className="text-orange-800 text-sm">
                          Tổng trọng lượng
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Products Tab */}
                {activeTab === "products" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Sản phẩm trong đơn hàng ({order.products?.length || 0})
                    </h3>
                    <div className="space-y-4">
                      {order.products?.map((product, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start space-x-4">
                            <img
                              src={product.image[0] || 'https://via.placeholder.com/80'}
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                              }}
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                Product ID: {product.productId}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                                <div>
                                  <span className="text-gray-600">
                                    Số lượng:
                                  </span>
                                  <div className="font-medium">
                                    {product.quantity}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Giá:</span>
                                  <div className="font-medium">
                                    {formatCurrency(product.price)}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Trọng lượng:
                                  </span>
                                  <div className="font-medium">
                                    {product.weight || 0}g
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Kích thước:
                                  </span>
                                  <div className="font-medium">
                                    {product.length || 0}×{product.width || 0}×
                                    {product.height || 0} cm
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3">
                                <span className="text-gray-600 text-sm">
                                  Thuộc tính:
                                </span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {product.variant?.attributes?.map(
                                    (attr, i) => (
                                      <span
                                        key={i}
                                        className="bg-gray-100 px-2 py-1 rounded text-sm"
                                      >
                                        {attr.name}: {attr.value}
                                      </span>
                                    )
                                  ) || []}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {formatCurrency(
                                  product.price * product.quantity
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )) || []}
                    </div>
                  </div>
                )}

                {/* Shipping Tab */}
                {activeTab === "shipping" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">
                      Lịch sử vận chuyển
                    </h3>

                    {/* Shipping Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">
                            Trạng thái vận chuyển:
                          </span>
                          <div className="font-medium">
                            {getShippingStatusDescription(order.shippingStatus) || 'Chưa vận chuyển'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Tổng trọng lượng:</span>
                          <div className="font-medium">
                            {totalWeight}g
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Phí vận chuyển:</span>
                          <div className="font-medium">
                            {formatCurrency(order.deliveryFees)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Journey Timeline */}
                    <div className="relative">
                      {order.journeyLog?.reverse().map((log, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-4 pb-6"
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                index === 0 ? "bg-blue-500" : "bg-gray-300"
                              }`}
                            ></div>
                            {index < (order.journeyLog?.length || 0) - 1 && (
                              <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{getShippingStatusDescription(log.status)}</h4>
                                <span className="text-sm text-gray-500">
                                {formatDate(log.updated_date)}
                              </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )) || []}
                    </div>
                  </div>
                )}

                {/* Financial Tab - Admin View */}
                {activeTab === "financial" && (
                  <div className="space-y-6">
                    {/* Financial Overview Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Order Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">
                          Tổng kết đơn hàng
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Tổng tiền sản phẩm:</span>
                            <span className="font-medium">
                              {formatCurrency(order.totalProduct)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Giảm giá:</span>
                            <span className="text-red-600 font-medium">
                              -{formatCurrency(order.discount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Phí vận chuyển:</span>
                            <span className="font-medium">
                              {formatCurrency(order.deliveryFees)}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-lg pt-3 border-t">
                            <span>Tổng thanh toán:</span>
                            <span>{formatCurrency(order.totalPrice)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Admin Revenue Analysis */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Phân tích doanh thu (Admin)
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Giảm giá quản trị viên:</span>
                            <span className="text-red-600 font-medium">
                              -{formatCurrency(financial?.adminPromotionDiscount || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Phí nền tảng:</span>
                            <span className="text-green-600 font-medium">
                              +{formatCurrency(financial?.platformFees || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Phí danh mục:</span>
                            <span className="text-green-600 font-medium">
                              +{formatCurrency(financial?.productCategoryFees || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-lg pt-3 border-t text-blue-600">
                            <span>Doanh thu quảng trị viên:</span>
                            <span>
                              {formatCurrency(financial?.adminRevenue || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Financial Breakdown */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-4">
                        Chi tiết tài chính đơn hàng
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Payment Information */}
                        <div>
                          <h5 className="font-medium text-gray-700 mb-3">Thông tin thanh toán</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phương thức:</span>
                              <PaymentBadge method={order.paymentMethod} />
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Trạng thái thanh toán:</span>
                              <span className={`font-medium ${order.paymentMethod === "COD" ? "text-amber-600" : "text-green-600"}`}>
                                {order.paymentMethod === "COD" ? "Chưa thanh toán" : "Đã thanh toán"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Fee Information */}
                        <div>
                          <h5 className="font-medium text-gray-700 mb-3">Phí và hoa hồng</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tỷ lệ phí platform:</span>
                              <span className="font-medium">
                                {((financial?.platformFees || 0) / order.totalProduct * 100).toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tỷ lệ phí danh mục:</span>
                              <span className="font-medium">
                                {((financial?.productCategoryFees || 0) / order.totalProduct * 100).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-mono">{order._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span>{formatDateShort(order.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái:</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="font-semibold">
                    {formatCurrency(order.totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doanh thu quản trị viên:</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(financial?.adminRevenue || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đánh giá:</span>
                  <span className={`font-medium ${order.isRating ? "text-green-600" : "text-gray-500"}`}>
                    {order.isRating ? "Đã đánh giá" : "Chưa đánh giá"}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                Thông tin khách hàng
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-3" />
                  <span>{order.name}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-3" />
                  <span>{order.phone}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                  <span className="text-sm">
                    {order.address}, {order.ward}, {order.district},{" "}
                    {order.city}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <span className="text-xs text-gray-500">Customer ID:</span>
                  <div className="font-mono text-xs text-gray-600">
                    {order.userId}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Thông tin vị trí</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Kinh độ:</span>
                  <span className="font-mono">{order.longitude}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vĩ độ:</span>
                  <span className="font-mono">{order.latitude}</span>
                </div>
                <div className="pt-2 border-t">
                  <a 
                    href={`https://maps.google.com/?q=${order.latitude},${order.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    Xem trên bản đồ
                  </a>
                </div>
              </div>
            </div>

            {/* Revenue Summary Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-black">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Tóm tắt doanh thu
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-500">Tổng đơn hàng:</span>
                  <span className="font-semibold">
                    {formatCurrency(order.totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-500">Phí & Hoa hồng:</span>
                  <span className="font-semibold">
                    {formatCurrency((financial?.platformFees || 0) + (financial?.productCategoryFees || 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-500">Giảm giá Admin:</span>
                  <span className="font-semibold text-red-500">
                    -{formatCurrency(financial?.adminPromotionDiscount || 0)}
                  </span>
                </div>
                <div className="pt-3 border-t border-blue-400">
                  <div className="flex justify-between">
                    <span className="font-medium">Lợi nhuận thực tế:</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(financial?.adminRevenue || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;