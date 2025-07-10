import React, { useState, useEffect } from 'react';
import { getStoreById, updateStore } from '../api/StoreApi';
import { uploadFile } from '../utils/fileUpload'; 
import { getProvinces, getDistricts, getWards } from '../api/DeliveryApi'; 
import { useAuth } from '../context/AuthContext';

const MyStoreInfo = () => {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Location data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    description: '',
    image: '',
    latitude: '',
    longitude: '',
    provinceId: '',
    districtId: '',
    wardCode: '',
    provinceName: '',
    districtName: '',
    wardName: ''
  });

  // Load store data on component mount
  useEffect(() => {
    if (user?.storeId) {
      loadStoreData();
    }
  }, [user]);

  // Load location data when modal opens
  useEffect(() => {
    if (showEditModal) {
      loadProvinces();
    }
  }, [showEditModal]);

  // Load districts when province changes
  useEffect(() => {
    if (formData.provinceId) {
      loadDistricts(formData.provinceId);
    }
  }, [formData.provinceId]);

  // Load wards when district changes
  useEffect(() => {
    if (formData.districtId) {
      loadWards(formData.districtId);
    }
  }, [formData.districtId]);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      const storeResponse = await getStoreById(user.storeId);
      
      if (storeResponse && storeResponse.data) {
        setStore(storeResponse.data);
        setFormData({
          name: storeResponse.data.name || '',
          address: storeResponse.data.address || '',
          phoneNumber: storeResponse.data.phoneNumber || '',
          email: storeResponse.data.email || '',
          description: storeResponse.data.description || '',
          image: storeResponse.data.image || '',
          latitude: storeResponse.data.latitude || '',
          longitude: storeResponse.data.longitude || '',
          provinceId: storeResponse.data.provinceId || '',
          districtId: storeResponse.data.districtId || '',
          wardCode: storeResponse.data.wardCode || '',
          provinceName: storeResponse.data.provinceName || '',
          districtName: storeResponse.data.districtName || '',
          wardName: storeResponse.data.wardName || ''
        });
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProvinces = async () => {
    try {
      const response = await getProvinces();
      setProvinces(response.data || []);
    } catch (error) {
      console.error('Error loading provinces:', error);
    }
  };

  const loadDistricts = async (provinceId) => {
    try {
      const response = await getDistricts(provinceId);
      setDistricts(response.data || []);
      setWards([]); // Clear wards when province changes
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  const loadWards = async (districtId) => {
    try {
      const response = await getWards(districtId);
      setWards(response.data || []);
    } catch (error) {
      console.error('Error loading wards:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update location names when IDs change
    if (name === 'provinceId') {
      const province = provinces.find(p => p.ProvinceID === parseInt(value));
      setFormData(prev => ({
        ...prev,
        provinceName: province?.ProvinceName || '',
        districtId: '',
        wardCode: '',
        districtName: '',
        wardName: ''
      }));
    } else if (name === 'districtId') {
      const district = districts.find(d => d.DistrictID === parseInt(value));
      setFormData(prev => ({
        ...prev,
        districtName: district?.DistrictName || '',
        wardCode: '',
        wardName: ''
      }));
    } else if (name === 'wardCode') {
      const ward = wards.find(w => w.WardCode === value);
      setFormData(prev => ({
        ...prev,
        wardName: ward?.WardName || ''
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh!');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadFile(file, 'stores');
      setFormData(prev => ({
        ...prev,
        image: result.url
      }));
      alert('Tải ảnh thành công!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Có lỗi xảy ra khi tải ảnh lên!');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateStore = async () => {
    try {
      setSaving(true);
      await updateStore({ id: user.storeId, data: formData });
      setShowEditModal(false);
      await loadStoreData();
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating store:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin!');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    };
    
    const statusText = {
      active: 'Đang hoạt động',
      pending: 'Chờ duyệt',
      suspended: 'Tạm ngưng'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status]}`}>
        {statusText[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Không tìm thấy thông tin cửa hàng</div>
          <div className="text-gray-400 text-sm mt-2">Vui lòng liên hệ quản trị viên</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý cửa hàng</h1>
        <p className="text-gray-600">Quản lý thông tin và cài đặt cửa hàng của bạn</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Owner Info - Left Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-blue-100"
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4">{user.fullName}</h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="mt-4 px-4 py-2 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Chủ cửa hàng</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Trạng thái cửa hàng</span>
                  {getStatusBadge(store.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Đánh giá</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{store.rating}/5 ⭐</div>
                    <div className="text-xs text-gray-500">{store.reviewCount} đánh giá</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Info - Right Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Store Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    {store.image && store.image !== 'default_image_url' ? (
                      <img 
                        src={store.image} 
                        alt={store.name} 
                        className="h-16 w-16 rounded-xl object-cover" 
                      />
                    ) : (
                      <span className="text-2xl font-bold">
                        {store.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{store.name}</h2>
                    <p className="text-blue-500 mt-1">Thông tin cửa hàng</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>

            {/* Store Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Thông tin liên hệ</h3>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Email</div>
                    <div className="font-medium text-gray-900">{store.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Số điện thoại</div>
                    <div className="font-medium text-gray-900">{store.phoneNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Tọa độ</div>
                    <div className="font-medium text-gray-900 text-sm">
                      {store.latitude}, {store.longitude}
                    </div>
                  </div>
                  {store.ghnShopId && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">GHN Shop ID</div>
                      <div className="font-medium text-gray-900">{store.ghnShopId}</div>
                    </div>
                  )}
                </div>

                {/* Address Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Địa chỉ</h3>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Địa chỉ chi tiết</div>
                    <div className="font-medium text-gray-900">{store.address}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Phường/Xã - Quận/Huyện - Tỉnh/TP</div>
                    <div className="font-medium text-gray-900">
                      {[store.wardName, store.districtName, store.provinceName].filter(Boolean).join(' - ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Mã địa chỉ chuẩn hóa</div>
                    <div className="text-sm space-y-1">
                      <div><span className="text-gray-500">Province:</span> {store.provinceId}</div>
                      <div><span className="text-gray-500">District:</span> {store.districtId}</div>
                      <div><span className="text-gray-500">Ward:</span> {store.wardCode}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {store.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả cửa hàng</h3>
                  <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {store.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-5xl shadow-lg rounded-xl bg-white">
            <div className="mt-3">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Chỉnh sửa thông tin cửa hàng
              </h3>
              
              <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh cửa hàng
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                      {formData.image && formData.image !== 'default_image_url' ? (
                        <img 
                          src={formData.image} 
                          alt="Store" 
                          className="h-20 w-20 object-cover" 
                        />
                      ) : (
                        <span className="text-gray-500 text-xl">
                          {formData.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG tối đa 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên cửa hàng *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ chi tiết *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="Số nhà, tên đường..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Location Selection */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Chọn địa chỉ</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tỉnh/Thành phố *
                      </label>
                      <select
                        name="provinceId"
                        value={formData.provinceId}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map(province => (
                          <option key={province.ProvinceID} value={province.ProvinceID}>
                            {province.ProvinceName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quận/Huyện *
                      </label>
                      <select
                        name="districtId"
                        value={formData.districtId}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.provinceId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="">Chọn quận/huyện</option>
                        {districts.map(district => (
                          <option key={district.DistrictID} value={district.DistrictID}>
                            {district.DistrictName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phường/Xã *
                      </label>
                      <select
                        name="wardCode"
                        value={formData.wardCode}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.districtId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="">Chọn phường/xã</option>
                        {wards.map(ward => (
                          <option key={ward.WardCode} value={ward.WardCode}>
                            {ward.WardName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả cửa hàng
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mô tả về cửa hàng của bạn (tối đa 500 ký tự)"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/500 ký tự
                  </div>
                </div>

                {/* Coordinates */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Tọa độ địa lý</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vĩ độ (Latitude) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        required
                        placeholder="10.7756"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kinh độ (Longitude) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        required
                        placeholder="106.7019"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={saving || uploading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateStore}
                  disabled={saving || uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Cập nhật'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStoreInfo;