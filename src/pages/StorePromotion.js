import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Percent,
  Users,
  Gift,
  Grid3X3,
  List,
  Image,
  RefreshCw,
  AlertCircle,
  X,
  Upload,
  Save,
} from "lucide-react";
import PromotionForm from "./PromotionForm"; // Bạn sẽ cần cập nhật component này
import {
  createStorePromotion,
  getPromotionsByStoreId,
  updateStorePromotion,
  deleteStorePromotion,
  updatePromotionStatus,
} from "../api/StorePromotion"; // Cập nhật tên file import
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";
import { NavLink } from "react-router-dom/cjs/react-router-dom";
import { HomeIcon } from "../icons";
import PageTitle from "../components/Typography/PageTitle";

// Main Store Promotion Component
const StorePromotion = () => {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cập nhật state để hỗ trợ cả add và edit
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' hoặc 'edit'
  const [editingPromotion, setEditingPromotion] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const { user } = useAuth();

  // Fetch promotions data
  const fetchPromotions = async () => {
    if (!user?.storeId) {
      setError("Không tìm thấy thông tin cửa hàng");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getPromotionsByStoreId(user?.storeId);
      console.log("Fetched promotions:", response.data);
      if (response.status === 200) {
        setPromotions(response.data.promotions || []);
      } else {
        setError("Không thể tải dữ liệu khuyến mãi");
      }
    } catch (err) {
      console.error("Error fetching promotions:", err);
      setError("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchPromotions();
  }, []);

  // Hàm mở form thêm mới
  const handleAddPromotion = () => {
    setFormMode('add');
    setEditingPromotion(null);
    setShowForm(true);
  };

  // Hàm mở form chỉnh sửa
  const handleEditPromotion = (promotion) => {
    setFormMode('edit');
    setEditingPromotion(promotion);
    setShowForm(true);
  };

  // Hàm đóng form
  const handleCloseForm = () => {
    setShowForm(false);
    setFormMode('add');
    setEditingPromotion(null);
  };

  // Handle form submission - cập nhật để xử lý cả add và edit
  const handleSubmitForm = async (promotionData, mode) => {
    try {
      console.log(`${mode === 'add' ? 'Adding' : 'Updating'} promotion:`, promotionData);
      
      if (mode === 'add') {
        // Call API to create promotion
        const res = await createStorePromotion(promotionData);
        console.log("Create promotion response:", res);
        
        if (res.status === 200 || res.status === 201) {
          alert("Khuyến mãi đã được tạo thành công!");
          fetchPromotions(); // Refresh data after creating
        } else {
          alert(res.data?.message || "Không thể tạo khuyến mãi");
          throw new Error("Failed to create promotion");
        }
      } else {
        // Call API to update promotion
        const res = await updateStorePromotion(promotionData._id, promotionData);
        console.log("Update promotion response:", res);
        
        if (res.status === 200) {
          alert("Khuyến mãi đã được cập nhật thành công!");
          fetchPromotions(); // Refresh data after updating
        } else {
          alert(res.data?.message || "Không thể cập nhật khuyến mãi");
          throw new Error("Failed to update promotion");
        }
      }
      
    } catch (error) {
      console.error(`Error ${mode === 'add' ? 'creating' : 'updating'} promotion:`, error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          `Có lỗi xảy ra khi ${mode === 'add' ? 'tạo' : 'cập nhật'} khuyến mãi`;
      alert(errorMessage);
      throw error; // Re-throw to prevent form from closing
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusColor = (isActive, endDate) => {
    const now = new Date();
    const end = new Date(endDate);

    if (!isActive) return "bg-gray-100 text-gray-800";
    if (end < now) return "bg-red-100 text-red-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (isActive, endDate) => {
    const now = new Date();
    const end = new Date(endDate);

    if (!isActive) return "Đã tắt";
    if (end < now) return "Hết hạn";
    return "Đang hoạt động";
  };

  const filteredPromotions = promotions.filter((promotion) => {
    const matchesSearch =
      promotion.promotionName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      promotion.promotionDetails
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "active") return matchesSearch && promotion.isActive;
    if (filterStatus === "inactive")
      return matchesSearch && !promotion.isActive;

    return matchesSearch;
  });

  const toggleStatus = async (id) => {
    try {
      // Tìm promotion cần update
      const promotion = promotions.find((p) => p._id === id);
      if (!promotion) return;

      const newStatus = !promotion.isActive;

      // Optimistic update
      setPromotions((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isActive: newStatus } : p))
      );

      // Gọi API để update status
      const res = await updatePromotionStatus(id, newStatus);
      console.log("Update status response:", res);
      
      if (res.status === 200) {
        // Success - optimistic update đã đúng
        console.log("Status updated successfully");
      } else {
        // Revert optimistic update on error
        setPromotions((prev) =>
          prev.map((p) => (p._id === id ? { ...p, isActive: !newStatus } : p))
        );
        alert(res.data?.message || "Không thể cập nhật trạng thái khuyến mãi");
      }
    } catch (error) {
      console.error("Error updating promotion status:", error);
      // Revert optimistic update on error
      setPromotions((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isActive: !p.isActive } : p))
      );
      alert("Đã xảy ra lỗi khi cập nhật trạng thái khuyến mãi");
    }
  };

  const deletePromotion = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      return;
    }

    try {
      // Lưu trạng thái gốc để có thể revert
      const originalPromotions = [...promotions];
      
      // Optimistic update - xóa khỏi UI ngay lập tức
      setPromotions((prev) => prev.filter((p) => p._id !== id));

      // Gọi API để xóa promotion
      const res = await deleteStorePromotion(id);
      console.log("Delete promotion response:", res);
      
      if (res.status === 200) {
        // Success - hiển thị thông báo thành công
        alert("Khuyến mãi đã được xóa thành công!");
      } else {
        // Revert optimistic update on error
        setPromotions(originalPromotions);
        alert(res.data?.message || "Không thể xóa khuyến mãi");
      }
    } catch (error) {
      console.error("Error deleting promotion:", error);
      
      // Refresh data from server on error để đảm bảo đồng bộ
      try {
        await fetchPromotions();
      } catch (fetchError) {
        console.error("Error refreshing data:", fetchError);
      }
      
      alert("Đã xảy ra lỗi khi xóa khuyến mãi");
    }
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-2">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-gray-600">Đang tải dữ liệu...</span>
      </div>
    </div>
  );

  // Error component
  const ErrorDisplay = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <div className="flex items-center">
        <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
        <div>
          <h3 className="text-red-800 font-medium">Không thể tải dữ liệu</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={fetchPromotions}
          className="ml-auto bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  );

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPromotions.map((promotion) => (
        <div
          key={promotion._id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Image Section */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            {promotion.promotionImage ? (
              <img
                src={promotion.promotionImage}
                alt={promotion.promotionName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Gift size={48} className="mx-auto mb-2 opacity-80" />
                  <p className="text-lg font-semibold">
                    {promotion.discountRate}% OFF
                  </p>
                </div>
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-0 right-0">
              <span
                className={`inline-flex mx-2 mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  promotion.isActive,
                  promotion.endDate
                )}`}
              >
                {getStatusText(promotion.isActive, promotion.endDate)}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {promotion.promotionName}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {promotion.promotionDetails}
              </p>
            </div>

            {/* Promotion Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Giảm giá:</span>
                <span className="font-medium text-green-600">
                  {promotion.discountRate}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Đơn tối thiểu:</span>
                <span className="font-medium">
                  {formatCurrency(promotion.minimumOrderValue)}
                </span>
              </div>
              {promotion.maxDiscount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Giảm tối đa:</span>
                  <span className="font-medium">
                    {formatCurrency(promotion.maxDiscount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Còn lại:</span>
                <span className="font-medium">
                  {promotion.totalRemainingUses}/{promotion.quantityAvailable}
                </span>
              </div>
              {promotion.usageLimitPerUser && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Giới hạn/người:</span>
                  <span className="font-medium">
                    {promotion.usageLimitPerUser}
                  </span>
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>
                  {formatDate(promotion.startDate)} -{" "}
                  {formatDate(promotion.endDate)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEditPromotion(promotion)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit size={16} />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleStatus(promotion._id)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    promotion.isActive
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {promotion.isActive ? "Tắt" : "Bật"}
                </button>
                <button
                  onClick={() => deletePromotion(promotion._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // List View Component (Table)
  const ListView = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khuyến Mãi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giảm Giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời Gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng Thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sử Dụng
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPromotions.map((promotion) => (
              <tr key={promotion._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 h-12 w-12 mr-4">
                      {promotion.promotionImage ? (
                        <img
                          src={promotion.promotionImage}
                          alt={promotion.promotionName}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <Gift className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {promotion.promotionName}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {promotion.promotionDetails}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{promotion.discountRate}%</div>
                    <div className="text-xs text-gray-500">
                      Đơn tối thiểu:{" "}
                      {formatCurrency(promotion.minimumOrderValue)}
                    </div>
                    {promotion.maxDiscount && (
                      <div className="text-xs text-gray-500">
                        Giảm tối đa: {formatCurrency(promotion.maxDiscount)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div>{formatDate(promotion.startDate)}</div>
                    <div className="text-gray-500">
                      đến {formatDate(promotion.endDate)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      promotion.isActive,
                      promotion.endDate
                    )}`}
                  >
                    {getStatusText(promotion.isActive, promotion.endDate)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div>Còn lại: {promotion.totalRemainingUses}</div>
                    <div className="text-xs text-gray-500">
                      Tổng: {promotion.quantityAvailable}
                    </div>
                    {promotion.usageLimitPerUser && (
                      <div className="text-xs text-gray-500">
                        Giới hạn/người: {promotion.usageLimitPerUser}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEditPromotion(promotion)}
                      className="text-indigo-600 hover:text-indigo-800"
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => toggleStatus(promotion._id)}
                      className={`${
                        promotion.isActive
                          ? "text-red-600 hover:text-red-800"
                          : "text-green-600 hover:text-green-800"
                      }`}
                    >
                      {promotion.isActive ? "Tắt" : "Bật"}
                    </button>
                    <button
                      onClick={() => deletePromotion(promotion._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Show loading spinner when loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Khuyến mãi cửa hàng
          </h1>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <PageTitle>Quản lý khuyến mãi cửa hàng</PageTitle>

        {/* Breadcrumb */}
        <div className="flex text-gray-800 dark:text-gray-300">
          <div className="flex items-center text-purple-600">
            <Icon className="w-5 h-5" aria-hidden="true" icon={HomeIcon} />
            <NavLink exact to="/app/dashboard-shop" className="mx-2">
              Dashboard
            </NavLink>
          </div>
          {">"}
          <p className="mx-2">Promotion</p>
        </div>

        {/* Error Display */}
        {error && <ErrorDisplay />}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản Lý Khuyến Mãi
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý các chương trình khuyến mãi của cửa hàng
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchPromotions}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg flex items-center gap-2 transition-colors"
                disabled={isLoading}
              >
                <RefreshCw
                  size={20}
                  className={isLoading ? "animate-spin" : ""}
                />
                Làm mới
              </button>
              <button
                onClick={handleAddPromotion}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Thêm Khuyến Mãi Mới
              </button>
            </div>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm khuyến mãi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã tắt</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List size={16} />
                List
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid3X3 size={16} />
                Grid
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Gift className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tổng KM</p>
                <p className="text-2xl font-bold text-gray-900">
                  {promotions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">
                  {promotions.filter((p) => p.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Percent className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Giảm TB</p>
                <p className="text-2xl font-bold text-gray-900">
                  {promotions.length > 0
                    ? Math.round(
                        promotions.reduce((acc, p) => acc + p.discountRate, 0) /
                          promotions.length
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Sắp hết hạn</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    promotions.filter((p) => {
                      const endDate = new Date(p.endDate);
                      const now = new Date();
                      const diffTime = endDate - now;
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                      );
                      return diffDays <= 7 && diffDays > 0;
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Promotion Display */}
        <div className="mb-6">
          {viewMode === "grid" ? <GridView /> : <ListView />}

          {filteredPromotions.length === 0 && !isLoading && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="text-center py-12">
                <Gift className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Không có khuyến mãi
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filterStatus !== "all"
                    ? "Không tìm thấy khuyến mãi phù hợp với bộ lọc."
                    : "Bắt đầu bằng cách tạo khuyến mãi đầu tiên."}
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleAddPromotion}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors mx-auto"
                  >
                    <Plus size={20} />
                    Thêm Khuyến Mãi Đầu Tiên
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Updated Form Component - Có thể dùng cho cả Add và Edit */}
        <PromotionForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
          user={user}
          editingPromotion={editingPromotion}
          mode={formMode}
        />
      </div>
    </div>
  );
};

export default StorePromotion;