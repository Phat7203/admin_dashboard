import React from 'react';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Edit2, Save, X, Camera, Loader2 } from 'lucide-react';

import { updateUser } from '../api/UserAPI';
import uploadFileToStorage from '../firebase/upLoadFile';
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const {user, userRole} = useAuth();

  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    gender: '',
    avatar: '',
    userId: '',
    userType: ''
  });

  const [editForm, setEditForm] = useState(userInfo);
  // Load user data khi component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');
      if (user) {
        const userData = user;
        const formattedUser = {
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
          address: userData.address || '',
          gender: userData.gender || '',
          avatar: userData.avatar || '',
          userId: userData.userId || '',
          userType: userRole.displayName || ''
        };
        
        setUserInfo(formattedUser);
        setEditForm(formattedUser);
      } else {
        setError('Không thể tải thông tin người dùng');
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      setError('');

      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      
      // Upload to Firebase Storage
      const downloadURL = await uploadFileToStorage(imageUrl, 'avatars');
      
      // Update form data
      setEditForm(prev => ({
        ...prev,
        avatar: downloadURL
      }));

      // Clean up object URL
      URL.revokeObjectURL(imageUrl);
      
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Lỗi upload ảnh. Vui lòng thử lại.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      // Validate required fields
      if (!editForm.fullName.trim()) {
        setError('Vui lòng nhập họ và tên');
        return;
      }

      if (!editForm.email.trim()) {
        setError('Vui lòng nhập email');
        return;
      }

      // Prepare data for API
      const updateData = {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        dateOfBirth: editForm.dateOfBirth || null,
        address: editForm.address.trim(),
        gender: editForm.gender,
        avatar: editForm.avatar
      };

      const response = await updateUser({ 
        userId: userInfo.userId, 
        data: updateData 
      });

      if (response.status === 200) {
        setUserInfo(editForm);
        setIsEditing(false);
        loadUserData();
        // Show success message
        setError('');
      } else {
        setError(response.data.message || 'Lỗi cập nhật thông tin');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Lỗi cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(userInfo);
    setIsEditing(false);
    setError('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="animate-spin" size={20} />
          Đang tải thông tin...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="relative inline-block">
                <img
                  src={editForm.avatar || userInfo.avatar || '/api/placeholder/128/128'}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                {isEditing && (
                  <div className="absolute bottom-2 right-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors cursor-pointer flex items-center justify-center"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Camera size={16} />
                      )}
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* User Info Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{userInfo.fullName}</h1>
                <p className="text-gray-600">{userInfo.userType}</p>
                <p className="text-sm text-gray-500">ID: {userInfo.userId}</p>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {saving ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      {saving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <X size={16} />
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin cá nhân</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Họ và tên */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User size={16} />
                Họ và tên <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{userInfo.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail size={16} />
                Email <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{userInfo.email}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Phone size={16} />
                Số điện thoại
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  pattern="[0-9]{10,15}"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{userInfo.phone || 'Chưa cập nhật'}</p>
              )}
            </div>

            {/* Ngày sinh */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar size={16} />
                Ngày sinh
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{formatDate(userInfo.dateOfBirth)}</p>
              )}
            </div>

            {/* Giới tính */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Giới tính</label>
              {isEditing ? (
                <select
                  value={editForm.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{userInfo.gender || 'Chưa cập nhật'}</p>
              )}
            </div>

            {/* Địa chỉ */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin size={16} />
                Địa chỉ
              </label>
              {isEditing ? (
                <textarea
                  value={editForm.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg min-h-[80px]">{userInfo.address || 'Chưa cập nhật'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin tài khoản</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mã người dùng</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{userInfo.userId}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Loại tài khoản</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{userInfo.userType}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}