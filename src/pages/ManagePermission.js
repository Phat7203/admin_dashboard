import React, { useState, useEffect } from "react";
import { Settings, Users, Shield, Save, Plus, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createRole, updateRole, getStaffRole } from "../api/RoleAPI";

const StoreRoleManagement = () => {
  const { user } = useAuth();
  const [storeRole, setStoreRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    permissions: [],
  });

  // Danh sách quyền mặc định cho nhân viên cửa hàng
  const defaultPermissions = [
    { key: "manage_storePromotion", label: "Quản lý khuyến mãi" },
    { key: "manage_category", label: "Quản lý danh mục" },
    { key: "manage_product", label: "Quản lý sản phẩm" },
    { key: "manage_store", label: "Quản lý cửa hàng" },
    { key: "chat_with_customer", label: "Chat với khách hàng" },
    { key: "manage_order", label: "Quản lý đơn hàng" },
    { key: "profile_view", label: "Xem thông tin cá nhân" },
    { key: "manage_staff", label: "Quản lý nhân viên" },
    { key: "manage_permissions", label: "Quản lý phân quyền" },
  ];

  useEffect(() => {
    if (user) {
      initializeData();
    }
  }, [user]);

  const initializeData = async () => {
    try {
      setLoading(true);
      await fetchStoreRole(user.storeId);
    } catch (error) {
      alert("Có lỗi xảy ra khi tải dữ liệu");
      console.log("Error initializing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreRole = async (storeId) => {
    try {
      const res = await getStaffRole({storeId: storeId});
      console.log("Fetched role data:", res.data);
      if (res.status === 200) {
        // Sử dụng dữ liệu trả về từ getStaffRole API
        const foundRole = res.data.data;

        if (foundRole) {
          setStoreRole(foundRole);
          setFormData({
            displayName: foundRole.displayName || "",
            permissions: foundRole.permissions || [],
          });
        } else {
          setStoreRole(null);
          setFormData({
            displayName: "",
            permissions: [],
          });
        }
      }
    } catch (error) {
      console.log("Error fetching role:", error);
      // Nếu không tìm thấy role (404), đặt về trạng thái ban đầu
      if (error.response?.status === 404) {
        setStoreRole(null);
        setFormData({
          displayName: "",
          permissions: [],
        });
      }
    }
  };

  const handlePermissionToggle = (permissionKey) => {
    const newPermissions = formData.permissions.includes(permissionKey)
      ? formData.permissions.filter((p) => p !== permissionKey)
      : [...formData.permissions, permissionKey];

    setFormData((prev) => ({
      ...prev,
      permissions: newPermissions,
    }));
  };

  const handleSaveRole = async () => {
    if (!formData.displayName.trim()) {
      alert("Vui lòng nhập tên hiển thị cho vai trò");
      return;
    }

    try {
      setSaving(true);

      const roleData = {
        name: "admin_staff",
        displayName: formData.displayName.trim(),
        permissions: formData.permissions,
        storeId: user.storeId,
      };

      let response;
      if (storeRole) {
        // Cập nhật role có sẵn
        response = await updateRole(storeRole._id, roleData);
        console.log("Update response:", response);
      } else {
        // Tạo role mới
        response = await createRole(roleData);
      }

      if (response?.status === 200 || response?.status === 201) {
        alert("Lưu cài đặt quyền thành công!");

        // Refresh lại data
        await fetchStoreRole(user.storeId);
      } else {
        alert(response?.message || "Không thể lưu cài đặt");
      }
    } catch (error) {
      console.log("Save error:", error);
      alert("Có lỗi xảy ra khi lưu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewRole = () => {
    setFormData({
      displayName: "Nhân viên cửa hàng",
      permissions: [],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Đang tải cài đặt quyền...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <Settings className="w-6 h-6 text-gray-700 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Cài đặt quyền nhân viên</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {storeRole || formData.displayName ? (
          // Hiển thị form chỉnh sửa trực tiếp
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Role Header */}
            <div className="flex items-center pb-6 mb-8 border-b border-gray-200">
              <Shield className="w-6 h-6 text-blue-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Quyền hạn nhân viên cửa hàng</h2>
            </div>

            {/* Display Name Input */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên vai trò <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Ví dụ: Nhân viên bán hàng, Quản lý kho..."
              />
            </div>

            {/* Permissions Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Phân quyền chức năng</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Chọn các quyền phù hợp cho nhân viên cửa hàng
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {defaultPermissions.map((permission) => (
                  <button
                    key={permission.key}
                    onClick={() => handlePermissionToggle(permission.key)}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md ${
                      formData.permissions.includes(permission.key)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{permission.label}</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        formData.permissions.includes(permission.key)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {formData.permissions.includes(permission.key) && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="mb-6">
              <button
                onClick={handleSaveRole}
                disabled={saving}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {saving ? (
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
              </button>
            </div>

            {/* Info Section */}
            {storeRole && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2 leading-relaxed">
                  Cài đặt này áp dụng cho tất cả nhân viên có vai trò "{formData.displayName}"
                </p>
                <p className="text-sm text-gray-500">
                  Cập nhật lần cuối: {new Date(storeRole.updatedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            )}
          </div>
        ) : (
          // Hiển thị giao diện tạo mới khi chưa có role
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Chưa có cài đặt quyền</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Cửa hàng của bạn chưa thiết lập quyền hạn cho nhân viên.
                <br />
                Hãy tạo cài đặt quyền đầu tiên.
              </p>
              <button
                onClick={handleCreateNewRole}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-8 rounded-lg transition-colors flex items-center mx-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Thiết lập quyền hạn
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreRoleManagement;