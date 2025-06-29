import React from "react";
import { Button, Badge } from "@windmill/react-ui";
import {
  Eye,
  Home,
  AlertTriangle,
  Check,
  Edit,
  X,
  Grid3X3,
  List,
  Filter,
  Clock,
  Search,
  Package,
  Tag,
} from "lucide-react";

const ProductDetail = ({
  selectedProduct,
  onImageModerationUpdate,
  onOpenApprovalModal,
  getStatusInfo,
  getImageModerationInfo,
  onClose,
}) => {
  if (!selectedProduct) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full">
      {/* Header */}
      <div className="border-b pb-4 px-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-purple-600" />
            <span className="text-xl font-semibold">Chi tiết sản phẩm & Kiểm duyệt</span>
          </div>
          {onClose && (
            <Button
              layout="link"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Body */}
      <div className="px-6 py-4">
        <div className="space-y-8">
          {/* Product Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Basic Product Information */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-500" />
                Thông tin sản phẩm
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tên</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedProduct.productName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Cửa hàng</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedProduct.storeId?.name || 'Không xác định'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Giá gốc</label>
                  <p className="dark:text-gray-100 font-bold text-lg text-purple-600">{selectedProduct.basePrice}đ</p>
                </div>
                {selectedProduct.discountPrice && selectedProduct.discountPrice !== selectedProduct.basePrice && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Giá khuyến mãi</label>
                    <p className="dark:text-gray-100 font-bold text-lg text-green-600">{selectedProduct.discountPrice}đ</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ngày tạo</label>
                  <p className="text-gray-900 dark:text-gray-100">{new Date(selectedProduct.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Kích thước (Cao×Dài×Rộng)</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedProduct.height}×{selectedProduct.length}×{selectedProduct.width} cm</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Trọng lượng</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedProduct.weight}g</p>
                </div>
              </div>
            </div>
            
            {/* Moderation Status */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Trạng thái kiểm duyệt
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Trạng thái sản phẩm</label>
                  {(() => {
                    const statusInfo = getStatusInfo(selectedProduct.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <Badge type={statusInfo.type} className="text-sm">
                        <StatusIcon className="w-4 h-4 mr-2" />
                        {statusInfo.text}
                      </Badge>
                    );
                  })()}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Trạng thái hình ảnh</label>
                  {(() => {
                    const imageModerationInfo = getImageModerationInfo(selectedProduct.imageModerationStatus);
                    const ImageIcon = imageModerationInfo.icon;
                    return (
                      <Badge type={imageModerationInfo.type} className="text-sm">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {imageModerationInfo.text}
                      </Badge>
                    );
                  })()}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Thống kê</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900 rounded">
                      <p className="font-bold text-blue-600">{selectedProduct.viewCount}</p>
                      <p className="text-blue-500">Lượt xem</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900 rounded">
                      <p className="font-bold text-green-600">{selectedProduct.soldQuantity}</p>
                      <p className="text-green-500">Đã bán</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900 rounded">
                      <p className="font-bold text-yellow-600">{selectedProduct.rating}/5</p>
                      <p className="text-yellow-500">Đánh giá</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 dark:bg-purple-900 rounded">
                      <p className="font-bold text-purple-600">{selectedProduct.wishlistCount}</p>
                      <p className="text-purple-500">Yêu thích</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Cập nhật lần cuối</label>
                  <p className="text-gray-900 dark:text-gray-100 text-sm">
                    {new Date(selectedProduct.updatedAt || selectedProduct.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Hành động nhanh
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => onImageModerationUpdate(selectedProduct._id, 'safe', 'Hình ảnh sản phẩm an toàn')}
                    className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 justify-center"
                    size="small"
                  >
                    <Check className="w-4 h-4" />
                    Đánh dấu hình ảnh an toàn
                  </Button>
                  <Button
                    onClick={() => onImageModerationUpdate(selectedProduct._id, 'unsafe', 'Hình ảnh sản phẩm chứa nội dung không phù hợp')}
                    className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 justify-center"
                    size="small"
                  >
                    <X className="w-4 h-4" />
                    Đánh dấu hình ảnh không an toàn
                  </Button>
                  {selectedProduct.status === 'onwait' && (
                    <Button
                      onClick={() => onOpenApprovalModal(selectedProduct)}
                      className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 justify-center"
                      size="small"
                    >
                      <Edit className="w-4 h-4" />
                      Đánh giá sản phẩm
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* General Attributes */}
          {selectedProduct.generalAttributes && selectedProduct.generalAttributes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-500" />
                Thuộc tính chung
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedProduct.generalAttributes.map((attr, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">{attr.name}</label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">{attr.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Moderation Report */}
          {selectedProduct.imageModerationNote && (
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="w-5 h-5" />
                Báo cáo kiểm duyệt
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedProduct.imageModerationNote}
                </p>
              </div>
            </div>
          )}

          {/* Main Product Images */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-purple-500" />
              Hình ảnh sản phẩm chính ({selectedProduct.productImages?.length || 0} hình ảnh)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {selectedProduct.productImages?.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Sản phẩm ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => window.open(image, '_blank')}
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
            {(!selectedProduct.productImages || selectedProduct.productImages.length === 0) && (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Grid3X3 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Không có hình ảnh chính</p>
              </div>
            )}
          </div>

          {/* Description */}
          {selectedProduct.description && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <List className="w-5 h-5 text-blue-500" />
                Mô tả sản phẩm
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>
            </div>
          )}

          {/* Variant Attributes */}
          {selectedProduct.variantAttributes && selectedProduct.variantAttributes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-orange-500" />
                Thuộc tính biến thể
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProduct.variantAttributes.map((attr, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{attr.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {attr.values.map((value, valueIndex) => (
                        <Badge key={valueIndex} type="neutral" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Variants */}
          {selectedProduct.variants && selectedProduct.variants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-500" />
                Biến thể sản phẩm ({selectedProduct.variants.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedProduct.variants.map((variant, index) => (
                  <div key={variant._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="space-y-3">
                      {/* Variant Header */}
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-gray-100">Biến thể #{index + 1}</span>
                        <Badge type={variant.quantity > 0 ? 'success' : 'danger'} className="text-xs">
                          {variant.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                        </Badge>
                      </div>

                      {/* Variant Image */}
                      {variant.image && (
                        <div className="w-full h-32 mb-3">
                          <img
                            src={variant.image}
                            alt={`Biến thể ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border cursor-pointer"
                            onClick={() => window.open(variant.image, '_blank')}
                          />
                        </div>
                      )}

                      {/* Variant Details */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">SKU:</span>
                          <p className="font-mono text-gray-900 dark:text-gray-100 text-xs break-all">{variant.sku}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Giá:</span>
                          <p className="font-bold text-purple-600">{variant.price}đ</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Số lượng:</span>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{variant.quantity}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Trạng thái kho:</span>
                          <p className={`font-medium ${variant.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {variant.quantity > 0 ? 'Có sẵn' : 'Hết hàng'}
                          </p>
                        </div>
                      </div>

                      {/* Variant Attributes */}
                      {variant.attributes?.length > 0 && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                          <span className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Thuộc tính:</span>
                          <div className="flex flex-wrap gap-1">
                            {variant.attributes.map((attr, attrIndex) => (
                              <Badge key={attrIndex} type="primary" className="text-xs">
                                {attr.name}: {attr.value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Technical Details */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                Chi tiết kỹ thuật
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID Sản phẩm:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100 text-xs">{selectedProduct._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID Cửa hàng:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100 text-xs">{selectedProduct.storeId?._id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID Danh mục:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100 text-xs">{selectedProduct.categoryId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Số lượng hình ảnh:</span>
                  <span className="text-gray-900 dark:text-gray-100">{selectedProduct.productImages?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Số lượng biến thể:</span>
                  <span className="text-gray-900 dark:text-gray-100">{selectedProduct.variants?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Đang giảm giá:</span>
                  <span className={`font-medium ${selectedProduct.isOnSale ? 'text-green-600' : 'text-gray-600'}`}>
                    {selectedProduct.isOnSale ? 'Có' : 'Không'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stock Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                Tóm tắt tồn kho
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tổng biến thể:</span>
                  <span className="text-gray-900 dark:text-gray-100">{selectedProduct.variants?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Biến thể còn hàng:</span>
                  <span className="text-green-600 font-medium">
                    {selectedProduct.variants?.filter(v => v.quantity > 0).length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Hết hàng:</span>
                  <span className="text-red-600 font-medium">
                    {selectedProduct.variants?.filter(v => v.quantity === 0).length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tổng số lượng:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {selectedProduct.variants?.reduce((total, v) => total + v.quantity, 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Khoảng giá:</span>
                  <span className="text-purple-600 font-medium">
                    {selectedProduct.variants?.length > 0 ? 
                      `${Math.min(...selectedProduct.variants.map(v => v.price))}đ - ${Math.max(...selectedProduct.variants.map(v => v.price))}đ` 
                      : `${selectedProduct.basePrice}đ`
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-green-500" />
                Thống kê hiệu suất
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tổng lượt xem:</span>
                  <span className="text-blue-600 font-medium">{selectedProduct.viewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tổng đã bán:</span>
                  <span className="text-green-600 font-medium">{selectedProduct.soldQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Đánh giá:</span>
                  <span className="text-yellow-600 font-medium">{selectedProduct.reviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Điểm trung bình:</span>
                  <span className="text-yellow-600 font-medium">{selectedProduct.rating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Lượt yêu thích:</span>
                  <span className="text-purple-600 font-medium">{selectedProduct.wishlistCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t pt-4 px-6 pb-6">
        <div className="flex justify-between w-full">
          {onClose && (
            <Button layout="outline" onClick={onClose} className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Đóng
            </Button>
          )}
          {selectedProduct?.status === 'onwait' && (
            <Button
              onClick={() => onOpenApprovalModal(selectedProduct)}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 ml-auto"
            >
              <Check className="w-4 h-4" />
              Đánh giá sản phẩm
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;