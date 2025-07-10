import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Upload,
  Package,
} from "lucide-react";
import PageTitle from "../components/Typography/PageTitle";
import {
  getCategoriesByStore,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../api/CategoryApi"; // Thêm các API functions
import { getSubCategory } from "../api/SubCategory";
import { uploadFile } from "../utils/fileUpload";
import { useAuth } from "../context/AuthContext";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [loading, setLoading] = useState(false); // Thêm loading state cho API calls

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    subCategoryId: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { user } = useAuth();

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (category = null) => {
    if (category) {
      setIsEditing(true);
      setCurrentCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        image: category.image,
        subCategoryId: category.subCategoryId || "",
      });
      setImagePreview(category.image);
    } else {
      setIsEditing(false);
      setCurrentCategory(null);
      setFormData({
        name: "",
        description: "",
        image: "",
        subCategoryId: "",
      });
      setImagePreview(null);
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
    setFormData({
      name: "",
      description: "",
      image: "",
      subCategoryId: "",
    });
    setSelectedFile(null);
    setImagePreview(null);
    setUploading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file hình ảnh!");
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File quá lớn! Vui lòng chọn file nhỏ hơn 5MB");
        return;
      }

      setSelectedFile(file);

      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim() || !formData.description.trim()) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (!imagePreview && !formData.image) {
      alert("Vui lòng chọn hình ảnh!");
      return;
    }

    try {
      setLoading(true);
      let imageUrl = formData.image;

      // Nếu có file mới được chọn, upload lên Firebase
      if (selectedFile) {
        setUploading(true);
        const result = await uploadFile(selectedFile, "categories");
        imageUrl = result.url;
        setUploading(false);
      }

      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: imageUrl,
        subCategoryId: formData.subCategoryId || null,
        storeId: user.storeId,
      };

      if (isEditing) {
        // Cập nhật danh mục qua API
        const response = await updateCategory(
          currentCategory._id,
          categoryData
        );

        if (response.status === 200) {
          // Cập nhật state local sau khi API thành công
          setCategories((prev) =>
            prev.map((cat) =>
              cat._id === currentCategory._id
                ? { ...cat, ...response.data }
                : cat
            )
          );
          alert("Cập nhật danh mục thành công!");
        } else {
          throw new Error(response.message || "Cập nhật thất bại");
        }
      } else {
        // Thêm danh mục mới qua API
        const response = await addCategory(categoryData);

        if (response.status === 201) {
          // Thêm vào state local sau khi API thành công
          setCategories((prev) => [response.data, ...prev]);
          alert("Thêm danh mục thành công!");
        } else {
          throw new Error(response.message || "Thêm mới thất bại");
        }
      }

      closeModal();
    } catch (error) {
      console.error("Error saving category:", error);
      alert(error.message || "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        setLoading(true);
        const response = await deleteCategory(categoryId);

        if (response.status === 200) {
          // Xóa khỏi state local sau khi API thành công
          setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
          alert("Xóa danh mục thành công!");
        } else {
          throw new Error(response.message || "Xóa thất bại");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        alert(error.message || "Có lỗi xảy ra khi xóa danh mục!");
      } finally {
        setLoading(false);
      }
    }
  };

  const getSubCategoryName = (subCategoryId) => {
    const subCat = subCategories.find((sub) => sub._id === subCategoryId._id);
    return subCat ? subCat.name : "Chưa phân loại";
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategoriesByStore({ storeId: user.storeId });
      if (response.status === 200) {
        setCategories(response.data);
      } else {
        throw new Error(response.message || "Tải danh mục thất bại");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subcategories
  const fetchSubCategories = async () => {
    setLoadingSubCategories(true);
    try {
      const response = await getSubCategory();
      if (response.status === 200) {
        setSubCategories(response.data);
      } else {
        console.error("Failed to fetch subcategories:", response.message);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  useEffect(() => {
    if (user?.storeId) {
      fetchCategories();
    }
  }, [user?.storeId]);

  useEffect(() => {
    // Fetch subcategories khi component mount
    fetchSubCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Đang xử lý...</span>
          </div>
        </div>
      )}

      <PageTitle>Quản lý doanh mục</PageTitle>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý danh mục
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý các danh mục sản phẩm trong cửa hàng
              </p>
            </div>
            <button
              onClick={() => openModal()}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5 mr-2" />
              Thêm danh mục
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative">
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
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x200?text=No+Image";
                  }}
                />
                <div className="absolute top-0 right-0 p-2 flex gap-2">
                  <button
                    onClick={() => openModal(category)}
                    disabled={loading}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed"
                    title="Edit category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    disabled={loading}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg disabled:bg-red-400 disabled:cursor-not-allowed"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {category.name}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2 max-w-[120px] truncate inline-block">
                    {getSubCategoryName(category.subCategoryId)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {category.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-1" />
                    <span>{category.numProduct || 0} sản phẩm</span>
                  </div>
                  <span>
                    Cập nhật:{" "}
                    {new Date(category.updatedAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy danh mục
            </h3>
            <p className="text-gray-600">
              Thử tìm kiếm với từ khóa khác hoặc thêm danh mục mới
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-10 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h2>
              <button
                onClick={closeModal}
                disabled={loading || uploading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên danh mục *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={loading || uploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Nhập tên danh mục"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={loading || uploading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Nhập mô tả danh mục"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh danh mục *
                  </label>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mb-4">
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                        />
                        <div className="absolute top-0 right-0">
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setSelectedFile(null);
                              setFormData((prev) => ({ ...prev, image: "" }));
                            }}
                            disabled={loading || uploading}
                            className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        Chọn ảnh từ máy
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          disabled={loading || uploading}
                          className="hidden"
                        />
                      </label>
                      {selectedFile && (
                        <span className="text-sm text-gray-600">
                          {selectedFile.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Hỗ trợ: JPG, PNG, GIF. Tối đa 5MB.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục cha
                  </label>
                  <select
                    name="subCategoryId"
                    value={formData.subCategoryId}
                    onChange={handleInputChange}
                    disabled={loadingSubCategories || loading || uploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingSubCategories
                        ? "Đang tải..."
                        : "Chọn danh mục cha"}
                    </option>
                    {subCategories.map((subCat) => (
                      <option
                        key={subCat._id || subCat.id}
                        value={subCat._id || subCat.id}
                      >
                        {subCat.name}
                      </option>
                    ))}
                  </select>
                  {loadingSubCategories && (
                    <p className="text-xs text-gray-500 mt-1">
                      Đang tải danh sách danh mục cha...
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading || uploading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || uploading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {loading || uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {uploading ? "Đang tải ảnh..." : "Đang xử lý..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? "Cập nhật" : "Thêm mới"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
