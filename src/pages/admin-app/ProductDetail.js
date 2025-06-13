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
            <span className="text-xl font-semibold">Product Details & Moderation</span>
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
                Product Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedProduct.productName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Store</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedProduct.store?.storeName || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Price</label>
                  <p className="dark:text-gray-100 font-bold text-lg text-purple-600">${selectedProduct.basePrice}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                  <p className="text-gray-900 dark:text-gray-100">{new Date(selectedProduct.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedProduct.category || 'Not specified'}</p>
                </div>
              </div>
            </div>
            
            {/* Moderation Status */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Moderation Status
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Product Status</label>
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
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Image Status</label>
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
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Last Updated</label>
                  <p className="text-gray-900 dark:text-gray-100 text-sm">
                    {new Date(selectedProduct.updatedAt || selectedProduct.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Quick Actions
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => onImageModerationUpdate(selectedProduct._id, 'safe', 'hình ảnh sản phẩm an toàn')}
                    className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 justify-center"
                    size="small"
                  >
                    <Check className="w-4 h-4" />
                    Mark Images Safe
                  </Button>
                  <Button
                    onClick={() => onImageModerationUpdate(selectedProduct._id, 'unsafe', 'Hình ảnh không phù hợp')}
                    className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 justify-center"
                    size="small"
                  >
                    <X className="w-4 h-4" />
                    Mark Images Unsafe
                  </Button>
                  {selectedProduct.status === 'onwait' && (
                    <Button
                      onClick={() => onOpenApprovalModal(selectedProduct)}
                      className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 justify-center"
                      size="small"
                    >
                      <Edit className="w-4 h-4" />
                      Review Product
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Moderation Report */}
          {selectedProduct.imageModerationNote && (
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="w-5 h-5" />
                Moderation Report
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedProduct.imageModerationNote}
                </p>
              </div>
            </div>
          )}

          {/* Images Gallery */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-purple-500" />
              Product Images ({selectedProduct.productImages?.length || 0} images)
            </h3>
            <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {selectedProduct.productImages?.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => window.open(image, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageModerationUpdate(selectedProduct._id, 'safe', `Image ${index + 1} marked safe by admin`);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageModerationUpdate(selectedProduct._id, 'unsafe', `Image ${index + 1} contains inappropriate content`);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
            {(!selectedProduct.productImages || selectedProduct.productImages.length === 0) && (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Grid3X3 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No images available</p>
              </div>
            )}
          </div>

          {/* Description */}
          {selectedProduct.description && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <List className="w-5 h-5 text-blue-500" />
                Product Description
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>
            </div>
          )}

          {/* Variants */}
          {selectedProduct.variants && selectedProduct.variants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-500" />
                Product Variants ({selectedProduct.variants.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedProduct.variants.map((variant, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-gray-100">Variant #{index + 1}</span>
                        <Badge type={variant.quantity > 0 ? 'success' : 'danger'} className="text-xs">
                          {variant.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">SKU:</span>
                          <p className="font-mono text-gray-900 dark:text-gray-100">{variant.sku}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Price:</span>
                          <p className="font-bold text-purple-600">${variant.price}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{variant.quantity}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                          <p className="text-gray-900 dark:text-gray-100">{variant.weight || 'N/A'}</p>
                        </div>
                      </div>
                      {variant.attributes?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <span className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Attributes:</span>
                          <div className="flex flex-wrap gap-1">
                            {variant.attributes.map((attr, attrIndex) => (
                              <Badge key={attrIndex} type="neutral" className="text-xs">
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
                Technical Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Product ID:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">{selectedProduct._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Store ID:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">{selectedProduct.storeId?._id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Images Count:</span>
                  <span className="text-gray-900 dark:text-gray-100">{selectedProduct.productImages?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Variants Count:</span>
                  <span className="text-gray-900 dark:text-gray-100">{selectedProduct.variants?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* SEO Information */}
            {(selectedProduct.seoTitle || selectedProduct.seoDescription || selectedProduct.seoKeywords) && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-500" />
                  SEO Information
                </h4>
                <div className="space-y-2 text-sm">
                  {selectedProduct.seoTitle && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block">Title:</span>
                      <p className="text-gray-900 dark:text-gray-100">{selectedProduct.seoTitle}</p>
                    </div>
                  )}
                  {selectedProduct.seoDescription && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block">Description:</span>
                      <p className="text-gray-900 dark:text-gray-100 text-xs">{selectedProduct.seoDescription}</p>
                    </div>
                  )}
                  {selectedProduct.seoKeywords && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block">Keywords:</span>
                      <p className="text-gray-900 dark:text-gray-100 text-xs">{selectedProduct.seoKeywords}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shipping Information */}
            {(selectedProduct.weight || selectedProduct.dimensions || selectedProduct.shippingClass) && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Home className="w-4 h-4 text-green-500" />
                  Shipping Information
                </h4>
                <div className="space-y-2 text-sm">
                  {selectedProduct.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                      <span className="text-gray-900 dark:text-gray-100">{selectedProduct.weight}</span>
                    </div>
                  )}
                  {selectedProduct.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
                      <span className="text-gray-900 dark:text-gray-100">{selectedProduct.dimensions}</span>
                    </div>
                  )}
                  {selectedProduct.shippingClass && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Shipping Class:</span>
                      <span className="text-gray-900 dark:text-gray-100">{selectedProduct.shippingClass}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t pt-4 px-6 pb-6">
        <div className="flex justify-between w-full">
          {onClose && (
            <Button layout="outline" onClick={onClose} className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Close
            </Button>
          )}
          {selectedProduct?.status === 'onwait' && (
            <Button
              onClick={() => onOpenApprovalModal(selectedProduct)}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 ml-auto"
            >
              <Check className="w-4 h-4" />
              Review Product
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;