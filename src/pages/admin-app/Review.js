import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Trash2,
  Star,
  Filter,
  Calendar,
  User,
  Package,
  Eye,
  X,
  Loader,
  CalendarDays,
} from "lucide-react";
import { getAllReviews, deleteReview } from "../../api/ReviewApi";

const AdminReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // all, today, week, month, custom
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch reviews từ API
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllReviews();

      if (response.status === 200 || response.data) {
        setReviews(response.data || response);
      } else {
        setError("Không thể tải danh sách đánh giá");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // useEffect để load data khi component mount
  useEffect(() => {
    fetchReviews();
  }, []);

  // Hàm kiểm tra ngày có nằm trong khoảng lọc không
  const isDateInRange = (reviewDate) => {
    const date = new Date(reviewDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    switch (dateFilter) {
      case "today":
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        return date >= startOfDay && date <= today;
        
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        return date >= weekAgo && date <= today;
        
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        monthAgo.setHours(0, 0, 0, 0);
        return date >= monthAgo && date <= today;
        
      case "custom":
        if (!customDateFrom && !customDateTo) return true;
        
        let fromDate = null;
        let toDate = null;
        
        if (customDateFrom) {
          fromDate = new Date(customDateFrom);
          fromDate.setHours(0, 0, 0, 0);
        }
        
        if (customDateTo) {
          toDate = new Date(customDateTo);
          toDate.setHours(23, 59, 59, 999);
        }
        
        if (fromDate && toDate) {
          return date >= fromDate && date <= toDate;
        } else if (fromDate) {
          return date >= fromDate;
        } else if (toDate) {
          return date <= toDate;
        }
        return true;
        
      default:
        return true;
    }
  };

  // Lọc và tìm kiếm đánh giá
  const filteredReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];

    return reviews.filter((review) => {
      const productName = review.productId?.name || "";
      const userName = review.userId?.fullName || review.userId || "";
      const content = review.content || "";

      const matchesSearch =
        content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRating =
        ratingFilter === "" || review.rating.toString() === ratingFilter;

      const matchesDate = isDateInRange(review.reviewDate);

      return matchesSearch && matchesRating && matchesDate;
    });
  }, [reviews, searchTerm, ratingFilter, dateFilter, customDateFrom, customDateTo]);

  // Xóa đánh giá với API
  const handleDeleteReview = async (reviewId) => {
    try {
      setDeleteLoading(true);
      const response = await deleteReview(reviewId);

      if (response.status === 200 || response.message) {
        // Cập nhật state local
        setReviews((prev) => prev.filter((review) => review._id !== reviewId));
        setShowDeleteConfirm(null);

        // Hiển thị thông báo thành công (có thể dùng toast)
        console.log("Xóa đánh giá thành công");
      } else {
        throw new Error("Không thể xóa đánh giá");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      setError("Có lỗi xảy ra khi xóa đánh giá");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Reset custom date khi thay đổi date filter
  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    if (value !== "custom") {
      setCustomDateFrom("");
      setCustomDateTo("");
    }
  };

  // Render user info (xử lý cả trường hợp populated và không populated)
  const renderUserInfo = (userId) => {
    if (typeof userId === "object" && userId !== null) {
      return userId.fullName || userId.name || userId._id || "Unknown User";
    }
    return userId || "Unknown User";
  };

  // Render product info (xử lý cả trường hợp populated và không populated)
  const renderProductInfo = (productId) => {
    if (typeof productId === "object" && productId !== null) {
      return {
        name: productId.productName || "Unknown Product",
        sku: productId.sku || "",
      };
    }
    return {
      name: "Unknown Product",
      sku: "",
    };
  };

  // Render store info (xử lý trường hợp store có thể null)
  const renderStoreInfo = (storeId) => {
    if (storeId && typeof storeId === "object") {
      return storeId.name || "Unknown Store";
    }
    return null;
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  // Format ngày
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format ngày cho input
  const formatDateForInput = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Lấy ngày hiện tại cho max date
  const getCurrentDate = () => {
    return formatDateForInput(new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Đang tải danh sách đánh giá...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
          <button
            onClick={fetchReviews}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Quản lý Đánh giá Khách hàng
          </h1>

          {/* Filters */}
          <div className="flex flex-col gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="text-gray-400 w-5 h-5"
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo nội dung, sản phẩm, người dùng..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Rating Filter */}
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-400" />
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  <option value="">Tất cả đánh giá</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={dateFilter}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                >
                  <option value="">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">7 ngày qua</option>
                  <option value="month">30 ngày qua</option>
                  <option value="custom">Tùy chọn</option>
                </select>
              </div>

              {/* Custom Date Range */}
              {dateFilter === "custom" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Từ:</span>
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    max={getCurrentDate()}
                  />
                  <span className="text-sm text-gray-600 whitespace-nowrap">Đến:</span>
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    min={customDateFrom}
                    max={getCurrentDate()}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredReviews.length}
              </div>
              <div className="text-sm text-blue-600">
                {dateFilter ? "Đánh giá được lọc" : "Tổng đánh giá"}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredReviews.filter((r) => r.rating >= 4).length}
              </div>
              <div className="text-sm text-green-600">
                Đánh giá tích cực (4-5 sao)
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredReviews.filter((r) => r.rating === 3).length}
              </div>
              <div className="text-sm text-yellow-600">
                Đánh giá trung bình (3 sao)
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {filteredReviews.filter((r) => r.rating <= 2).length}
              </div>
              <div className="text-sm text-red-600">
                Đánh giá tiêu cực (1-2 sao)
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách Đánh giá ({filteredReviews.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <div key={review._id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm font-medium text-gray-600">
                        {review.rating}/5
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      {formatDate(review.reviewDate)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(review._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa đánh giá"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          Người dùng: {renderUserInfo(review.userId)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {renderProductInfo(review.productId).name}
                        </span>
                        {renderProductInfo(review.productId).sku && (
                          <span className="text-xs text-gray-500">
                            ({renderProductInfo(review.productId).sku})
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{review.content}</p>

                    {review.variant?.attributes?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {review.variant.attributes.map((attr, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {attr.name}: {attr.value}
                          </span>
                        ))}
                      </div>
                    )}

                    {renderStoreInfo(review.storeId) && (
                      <div className="text-xs text-gray-500">
                        Cửa hàng: {renderStoreInfo(review.storeId)}
                      </div>
                    )}
                  </div>

                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredReviews.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>
                  Không tìm thấy đánh giá nào phù hợp với điều kiện tìm kiếm.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal xem chi tiết */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Chi tiết Đánh giá</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(selectedReview.rating)}
                  <span className="font-medium">{selectedReview.rating}/5</span>
                </div>
                <p className="text-sm text-gray-600">
                  Đánh giá vào {formatDate(selectedReview.reviewDate)}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Thông tin sản phẩm:</h4>
                <p className="text-gray-700">
                  {renderProductInfo(selectedReview.productId).name}
                </p>
                {renderProductInfo(selectedReview.productId).sku && (
                  <p className="text-sm text-gray-500">
                    SKU: {renderProductInfo(selectedReview.productId).sku}
                  </p>
                )}
              </div>

              {selectedReview.variant?.attributes?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Biến thể:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.variant.attributes.map((attr, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {attr.name}: {attr.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h4 className="font-medium mb-2">Nội dung đánh giá:</h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedReview.content}
                </p>
              </div>

              {selectedReview.images && selectedReview.images.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Hình ảnh:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedReview.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Người dùng:</strong>{" "}
                  {renderUserInfo(selectedReview.userId)}
                </div>
                {renderStoreInfo(selectedReview.storeId) && (
                  <div>
                    <strong>Cửa hàng:</strong>{" "}
                    {renderStoreInfo(selectedReview.storeId)}
                  </div>
                )}
                <div>
                  <strong>Tạo lúc:</strong>{" "}
                  {formatDate(selectedReview.createdAt)}
                </div>
                <div>
                  <strong>Cập nhật lúc:</strong>{" "}
                  {formatDate(selectedReview.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Xác nhận xóa đánh giá
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể
              hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={deleteLoading}
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteReview(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                disabled={deleteLoading}
              >
                {deleteLoading && <Loader className="w-4 h-4 animate-spin" />}
                {deleteLoading ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewManagement;