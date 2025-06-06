import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar, Percent, Gift, AlertCircle, Save, Edit } from 'lucide-react';
import { uploadFile } from '../utils/fileUpload'; // Thay đổi path cho đúng

const PromotionForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  user, 
  editingPromotion = null, // Thêm prop để nhận data cần edit
  mode = 'add' // 'add' hoặc 'edit'
}) => {
  const [formData, setFormData] = useState({
    promotionName: '',
    promotionDetails: '',
    discountRate: '',
    minimumOrderValue: '',
    maxDiscount: '',
    quantityAvailable: '',
    usageLimitPerUser: '',
    startDate: '',
    endDate: '',
    isActive: true,
    promotionImage: null,
    backgroundImage: null
  });

  const [errors, setErrors] = useState({});
  const [promotionImagePreview, setPromotionImagePreview] = useState(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Thêm state để track xem ảnh có được thay đổi không
  const [imageChanged, setImageChanged] = useState({
    promotionImage: false,
    backgroundImage: false
  });

  // Effect để load dữ liệu khi edit
  useEffect(() => {
    if (mode === 'edit' && editingPromotion && isOpen) {
      // Populate form với dữ liệu của promotion cần edit
      setFormData({
        promotionName: editingPromotion.promotionName || '',
        promotionDetails: editingPromotion.promotionDetails || '',
        discountRate: editingPromotion.discountRate || '',
        minimumOrderValue: editingPromotion.minimumOrderValue || '',
        maxDiscount: editingPromotion.maxDiscount || '',
        quantityAvailable: editingPromotion.quantityAvailable || '',
        usageLimitPerUser: editingPromotion.usageLimitPerUser || '',
        startDate: editingPromotion.startDate ? 
          new Date(editingPromotion.startDate).toISOString().split('T')[0] : '',
        endDate: editingPromotion.endDate ? 
          new Date(editingPromotion.endDate).toISOString().split('T')[0] : '',
        isActive: editingPromotion.isActive ?? true,
        promotionImage: null, // Reset file inputs
        backgroundImage: null
      });

      // Set preview images nếu có
      if (editingPromotion.promotionImage) {
        setPromotionImagePreview(editingPromotion.promotionImage);
      }
      if (editingPromotion.backgroundImage) {
        setBackgroundImagePreview(editingPromotion.backgroundImage);
      }

      // Reset image changed tracking
      setImageChanged({
        promotionImage: false,
        backgroundImage: false
      });
    } else if (mode === 'add' && isOpen) {
      // Reset form về trạng thái ban đầu khi thêm mới
      resetForm();
    }
  }, [mode, editingPromotion, isOpen]);

  // Hàm reset form
  const resetForm = () => {
    setFormData({
      promotionName: '',
      promotionDetails: '',
      discountRate: '',
      minimumOrderValue: '',
      maxDiscount: '',
      quantityAvailable: '',
      usageLimitPerUser: '',
      startDate: '',
      endDate: '',
      isActive: true,
      promotionImage: null,
      backgroundImage: null
    });
    setErrors({});
    setPromotionImagePreview(null);
    setBackgroundImagePreview(null);
    setImageChanged({
      promotionImage: false,
      backgroundImage: false
    });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle image upload
  const handleImageChange = (e, imageType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, [imageType]: 'Vui lòng chọn file hình ảnh' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [imageType]: 'Kích thước file không được vượt quá 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, [imageType]: file }));
      
      // Mark image as changed
      setImageChanged(prev => ({ ...prev, [imageType]: true }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (imageType === 'promotionImage') {
          setPromotionImagePreview(e.target.result);
        } else {
          setBackgroundImagePreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors[imageType]) {
        setErrors(prev => ({ ...prev, [imageType]: '' }));
      }
    }
  };

  // Validation function - cập nhật cho cả add và edit
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.promotionName.trim()) {
      newErrors.promotionName = 'Tên khuyến mãi là bắt buộc';
    }

    if (!formData.promotionDetails.trim()) {
      newErrors.promotionDetails = 'Mô tả khuyến mãi là bắt buộc';
    }

    if (!formData.discountRate || formData.discountRate <= 0 || formData.discountRate > 100) {
      newErrors.discountRate = 'Tỷ lệ giảm giá phải từ 1% đến 100%';
    }

    if (!formData.minimumOrderValue || formData.minimumOrderValue < 0) {
      newErrors.minimumOrderValue = 'Giá trị đơn hàng tối thiểu không hợp lệ';
    }

    if (formData.maxDiscount && formData.maxDiscount < 0) {
      newErrors.maxDiscount = 'Giá trị giảm tối đa không hợp lệ';
    }

    if (!formData.quantityAvailable || formData.quantityAvailable <= 0) {
      newErrors.quantityAvailable = 'Số lượng khả dụng phải lớn hơn 0';
    }

    if (formData.usageLimitPerUser && formData.usageLimitPerUser <= 0) {
      newErrors.usageLimitPerUser = 'Giới hạn sử dụng mỗi người phải lớn hơn 0';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc là bắt buộc';
    }

    // Date validation - linh hoạt hơn cho edit
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Chỉ check ngày bắt đầu khi thêm mới hoặc khi chưa bắt đầu
      if (mode === 'add' && startDate < today) {
        newErrors.startDate = 'Ngày bắt đầu không được nhỏ hơn ngày hiện tại';
      }

      if (endDate <= startDate) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission - cập nhật cho cả add và edit với Firebase upload
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let promotionImageUrl = null;
      let backgroundImageUrl = null;

      // Upload promotion image if exists (new file)
      if (formData.promotionImage && imageChanged.promotionImage) {
        try {
          const { url } = await uploadFile(formData.promotionImage, 'promotions');
          promotionImageUrl = url;
        } catch (error) {
          console.error('Error uploading promotion image:', error);
          setErrors(prev => ({ ...prev, promotionImage: 'Lỗi khi tải ảnh khuyến mãi lên' }));
          setIsSubmitting(false);
          return;
        }
      } else if (mode === 'edit' && !imageChanged.promotionImage) {
        // Giữ nguyên URL cũ nếu không thay đổi ảnh
        promotionImageUrl = editingPromotion?.promotionImage || null;
      }

      // Upload background image if exists (new file)
      if (formData.backgroundImage && imageChanged.backgroundImage) {
        try {
          const { url } = await uploadFile(formData.backgroundImage, 'promotions');
          backgroundImageUrl = url;
        } catch (error) {
          console.error('Error uploading background image:', error);
          setErrors(prev => ({ ...prev, backgroundImage: 'Lỗi khi tải ảnh nền lên' }));
          setIsSubmitting(false);
          return;
        }
      } else if (mode === 'edit' && !imageChanged.backgroundImage) {
        // Giữ nguyên URL cũ nếu không thay đổi ảnh
        backgroundImageUrl = editingPromotion?.backgroundImage || null;
      }

      // Prepare data for submission with image URLs
      const submissionData = {
        promotionName: formData.promotionName.trim(),
        promotionDetails: formData.promotionDetails.trim(),
        discountRate: parseFloat(formData.discountRate),
        minimumOrderValue: parseFloat(formData.minimumOrderValue),
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        quantityAvailable: parseInt(formData.quantityAvailable),
        usageLimitPerUser: formData.usageLimitPerUser ? parseInt(formData.usageLimitPerUser) : null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
        promotionImage: promotionImageUrl, // URL instead of File object
        backgroundImage: backgroundImageUrl // URL instead of File object
      };

      if (mode === 'add') {
        // Thêm thông tin cho việc tạo mới
        submissionData.storeId = user?.storeId;
        submissionData.createdBy = user?._id;
        submissionData.totalRemainingUses = parseInt(formData.quantityAvailable);
      } else {
        // Thêm ID cho việc cập nhật
        submissionData._id = editingPromotion._id;
        // Giữ nguyên totalRemainingUses nếu không thay đổi quantityAvailable
        if (formData.quantityAvailable === editingPromotion.quantityAvailable) {
          submissionData.totalRemainingUses = editingPromotion.totalRemainingUses;
        } else {
          // Tính toán lại nếu thay đổi quantityAvailable
          const usedCount = editingPromotion.quantityAvailable - editingPromotion.totalRemainingUses;
          submissionData.totalRemainingUses = Math.max(0, parseInt(formData.quantityAvailable) - usedCount);
        }
      }

      await onSubmit(submissionData, mode);
      handleClose();
    } catch (error) {
      console.error(`Error ${mode === 'add' ? 'creating' : 'updating'} promotion:`, error);
      setErrors(prev => ({ ...prev, submit: `Có lỗi xảy ra khi ${mode === 'add' ? 'tạo' : 'cập nhật'} khuyến mãi` }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const removeImage = (imageType) => {
    if (imageType === 'promotionImage') {
      setPromotionImagePreview(null);
      setFormData(prev => ({ ...prev, promotionImage: null }));
      setImageChanged(prev => ({ ...prev, promotionImage: true }));
    } else {
      setBackgroundImagePreview(null);
      setFormData(prev => ({ ...prev, backgroundImage: null }));
      setImageChanged(prev => ({ ...prev, backgroundImage: true }));
    }
  };

  if (!isOpen) return null;

  // Động thái thay đổi title và button text dựa trên mode
  const isEditMode = mode === 'edit';
  const titleText = isEditMode ? 'Chỉnh Sửa Khuyến Mãi' : 'Thêm Khuyến Mãi Mới';
  const subtitleText = isEditMode ? 'Cập nhật thông tin chương trình khuyến mãi' : 'Tạo chương trình khuyến mãi cho cửa hàng';
  const submitButtonText = isEditMode ? 'Cập Nhật' : 'Tạo Khuyến Mãi';
  const submitIcon = isEditMode ? Edit : Save;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8">
        {/* Header - Động thái thay đổi theo mode */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isEditMode ? 'bg-orange-100' : 'bg-blue-100'}`}>
              <Gift className={`h-6 w-6 ${isEditMode ? 'text-orange-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{titleText}</h2>
              <p className="text-sm text-gray-600">{subtitleText}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Hiển thị thông tin ID khi edit */}
          {isEditMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Đang chỉnh sửa khuyến mãi: #{editingPromotion?._id}
                </span>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Thông Tin Cơ Bản</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Khuyến Mãi *
                </label>
                <input
                  type="text"
                  name="promotionName"
                  value={formData.promotionName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.promotionName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên khuyến mãi..."
                />
                {errors.promotionName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.promotionName}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô Tả Khuyến Mãi *
                </label>
                <textarea
                  name="promotionDetails"
                  value={formData.promotionDetails}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.promotionDetails ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Mô tả chi tiết về chương trình khuyến mãi..."
                />
                {errors.promotionDetails && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.promotionDetails}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Discount Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Thông Tin Giảm Giá</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỷ Lệ Giảm Giá (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="discountRate"
                    value={formData.discountRate}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    step="0.1"
                    className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.discountRate ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="10"
                  />
                  <Percent className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.discountRate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.discountRate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn Hàng Tối Thiểu (VND) *
                </label>
                <input
                  type="number"
                  name="minimumOrderValue"
                  value={formData.minimumOrderValue}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.minimumOrderValue ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="100000"
                />
                {errors.minimumOrderValue && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.minimumOrderValue}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giảm Tối Đa (VND)
                </label>
                <input
                  type="number"
                  name="maxDiscount"
                  value={formData.maxDiscount}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.maxDiscount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="50000 (Để trống nếu không giới hạn)"
                />
                {errors.maxDiscount && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.maxDiscount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số Lượng Khả Dụng *
                  {isEditMode && (
                    <span className="text-xs text-gray-500 ml-1">
                      (Hiện tại: {editingPromotion?.quantityAvailable})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="quantityAvailable"
                  value={formData.quantityAvailable}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.quantityAvailable ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="100"
                />
                {errors.quantityAvailable && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.quantityAvailable}
                  </p>
                )}
                {/* Hiển thị warning khi giảm số lượng trong edit mode */}
                {isEditMode && formData.quantityAvailable && 
                 parseInt(formData.quantityAvailable) < editingPromotion?.quantityAvailable && (
                  <p className="mt-1 text-sm text-yellow-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Cảnh báo: Giảm số lượng có thể ảnh hưởng đến khuyến mãi đang sử dụng
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới Hạn Sử Dụng Mỗi Người
                </label>
                <input
                  type="number"
                  name="usageLimitPerUser"
                  value={formData.usageLimitPerUser}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.usageLimitPerUser ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Để trống nếu không giới hạn"
                />
                {errors.usageLimitPerUser && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.usageLimitPerUser}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Thời Gian Áp Dụng</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày Bắt Đầu *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.startDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày Kết Thúc *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.endDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Hình Ảnh</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Promotion Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh Khuyến Mãi
                </label>
                <div className="space-y-3">
                  <label className={`relative cursor-pointer block w-full border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-400 transition-colors ${
                    errors.promotionImage ? 'border-red-300' : 'border-gray-300'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'promotionImage')}
                      className="hidden"
                    />
                    <Upload className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600">
                      <span className="font-medium text-blue-600">
                        {isEditMode ? 'Thay đổi ảnh khuyến mãi' : 'Tải ảnh khuyến mãi'}
                      </span>
                    </p>
                  </label>
                  
                  {promotionImagePreview && (
                    <div className="relative">
                      <img
                        src={promotionImagePreview}
                        alt="Promotion Preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('promotionImage')}
                        className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {errors.promotionImage && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.promotionImage}
                    </p>
                  )}
                </div>
              </div>

              {/* Background Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh Nền
                </label>
                <div className="space-y-3">
                  <label className={`relative cursor-pointer block w-full border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-400 transition-colors ${
                    errors.backgroundImage ? 'border-red-300' : 'border-gray-300'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'backgroundImage')}
                      className="hidden"
                    />
                    <Upload className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600">
                      <span className="font-medium text-blue-600">
                        {isEditMode ? 'Thay đổi ảnh nền' : 'Tải ảnh nền'}
                      </span>
                    </p>
                  </label>
                  
                  {backgroundImagePreview && (
                    <div className="relative">
                      <img
                        src={backgroundImagePreview}
                        alt="Background Preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('backgroundImage')}
                        className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {errors.backgroundImage && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.backgroundImage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Trạng Thái</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                {isEditMode ? 'Khuyến mãi đang hoạt động' : 'Kích hoạt khuyến mãi ngay sau khi tạo'}
              </label>
            </div>
          </div>
        </div>

        {/* Actions - Động thái thay đổi theo mode */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          {errors.submit && (
            <p className="flex-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.submit}
            </p>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 text-sm font-medium text-white border border-transparent rounded-lg focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${
              isEditMode 
                ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isEditMode ? 'Đang Cập Nhật...' : 'Đang Tạo...'}
              </>
            ) : (
              <>
                {React.createElement(submitIcon, { className: "h-4 w-4" })}
                {submitButtonText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionForm;