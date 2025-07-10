import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import PageTitle from "../components/Typography/PageTitle";
import {
  Star,
  Package,
  Info,
  MessageSquare,
  Eye,
  Calendar,
  User,
} from "lucide-react";
import { Card, CardBody, Badge, Button, Avatar } from "@windmill/react-ui";
import { getProductById } from "../api/ProductApi";
import { getReviewsByProductId } from "../api/ReviewApi";

const SingleProduct = () => {
  const { id } = useParams();

  // State management
  const [tabView, setTabView] = useState("overview");
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleTabView = (viewName) => setTabView(viewName);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductById({ id: id });
        if (res.status === 200) {
          setProduct(res.data);
        } else {
          setError("Không thể tải thông tin sản phẩm");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Có lỗi xảy ra khi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch reviews data
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getReviewsByProductId(id);
        console.log(res);
        if (res && Array.isArray(res)) {
          setReviews(res);
        } else if (res.data && Array.isArray(res.data)) {
          setReviews(res.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  // Helper functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { type: "success", text: "Có sẵn" },
      outofstock: { type: "danger", text: "Hết hàng" },
      onwait: { type: "warning", text: "Chờ duyệt" },
      declined: { type: "danger", text: "Từ chối" },
      hiden: { type: "neutral", text: "Ẩn" },
    };
    return statusConfig[status] || { type: "neutral", text: status };
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageTitle>Chi tiết Sản phẩm</PageTitle>

      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <NavLink
              to="/app/products"
              className="flex flex-row items-center text-gray-700 hover:text-purple-600"
            >
              <Package className="w-4 h-4 mr-2" />
              Sản phẩm
            </NavLink>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">{product.productName}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Product Overview */}
      <Card className="mb-8 shadow-lg">
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="mb-4">
                <img
                  src={
                    product.productImages[selectedImageIndex] ||
                    product.productImages[0]
                  }
                  alt={product.productName}
                  className="w-full h-96 object-cover rounded-lg shadow-md"
                />
              </div>
              {product.productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.productImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.productName} ${index + 1}`}
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                        selectedImageIndex === index
                          ? "border-purple-500"
                          : "border-gray-200"
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {product.productName}
                </h1>
                <Badge type={getStatusBadge(product.status).type}>
                  {getStatusBadge(product.status).text}
                </Badge>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-purple-600">
                    {formatPrice(product.basePrice)}
                  </span>
                  {product.discountPrice > 0 && (
                    <span className="text-xl text-red-500 font-semibold">
                      -{formatPrice(product.discountPrice)}
                    </span>
                  )}
                </div>
                {product.isOnSale && (
                  <Badge type="success" className="mt-2">
                    Đang khuyến mãi
                  </Badge>
                )}
              </div>

              {/* Rating */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">{renderStars(product.rating)}</div>
                  <span className="text-lg font-semibold">
                    {product.rating}/5
                  </span>
                  <span className="text-gray-600">
                    ({product.reviewCount} đánh giá)
                  </span>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">
                    {product.soldQuantity}
                  </div>
                  <div className="text-sm text-gray-600">Đã bán</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">
                    {product.viewCount}
                  </div>
                  <div className="text-sm text-gray-600">Lượt xem</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Mô tả ngắn</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Dimensions */}
              {(product.weight > 0 || product.height > 0) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Thông số kỹ thuật
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {product.weight > 0 && (
                      <div>
                        <span className="font-medium">Trọng lượng:</span>{" "}
                        {product.weight}g
                      </div>
                    )}
                    {product.height > 0 && (
                      <div>
                        <span className="font-medium">Chiều cao:</span>{" "}
                        {product.height}cm
                      </div>
                    )}
                    {product.length > 0 && (
                      <div>
                        <span className="font-medium">Chiều dài:</span>{" "}
                        {product.length}cm
                      </div>
                    )}
                    {product.width > 0 && (
                      <div>
                        <span className="font-medium">Chiều rộng:</span>{" "}
                        {product.width}cm
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs Section */}
      <Card className="shadow-lg">
        <CardBody>
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                tabView === "overview"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabView("overview")}
            >
              <Info className="w-4 h-4 inline mr-2" />
              Tổng quan
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                tabView === "attributes"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabView("attributes")}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Thuộc tính & Biến thể
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                tabView === "reviews"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabView("reviews")}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Đánh giá ({product.reviewCount})
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {tabView === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Thông tin chi tiết
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Thông tin cơ bản</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">ID:</span> {product._id}
                        </div>
                        <div>
                          <span className="font-medium">Tên sản phẩm:</span>{" "}
                          {product.productName}
                        </div>
                        <div>
                          <span className="font-medium">Giá gốc:</span>{" "}
                          {formatPrice(product.basePrice)}
                        </div>
                        <div>
                          <span className="font-medium">Trạng thái:</span>{" "}
                          {getStatusBadge(product.status).text}
                        </div>
                        <div>
                          <span className="font-medium">Ngày tạo:</span>{" "}
                          {formatDate(product.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Cập nhật:</span>{" "}
                          {formatDate(product.updatedAt)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Thống kê</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Đánh giá:</span>{" "}
                          {product.rating}/5 ({product.reviewCount} lượt)
                        </div>
                        <div>
                          <span className="font-medium">Đã bán:</span>{" "}
                          {product.soldQuantity}
                        </div>
                        <div>
                          <span className="font-medium">Lượt xem:</span>{" "}
                          {product.viewCount}
                        </div>
                        <div>
                          <span className="font-medium">Yêu thích:</span>{" "}
                          {product.wishlistCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Mô tả chi tiết</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>
            )}

            {tabView === "attributes" && (
              <div className="space-y-6">
                {/* General Attributes */}
                {product.generalAttributes &&
                  product.generalAttributes.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        Thuộc tính kỹ thuật
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.generalAttributes.map((attr, index) => (
                          <div
                            key={index}
                            className="flex justify-between py-2 border-b border-gray-200"
                          >
                            <span className="font-medium">{attr.name}:</span>
                            <span className="text-gray-700">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Variant Attributes */}
                {product.variantAttributes &&
                  product.variantAttributes.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        Thuộc tính phân loại
                      </h3>
                      <div className="space-y-4">
                        {product.variantAttributes.map((attr, index) => (
                          <div key={index}>
                            <h4 className="font-medium mb-2">{attr.name}:</h4>
                            <div className="flex flex-wrap gap-2">
                              {attr.values.map((value, valueIndex) => (
                                <Badge key={valueIndex} type="neutral">
                                  {value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Biến thể sản phẩm
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              SKU
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Thuộc tính
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Giá
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Số lượng
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Hình ảnh
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {product.variants.map((variant, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                {variant.sku || `VAR-${index + 1}`}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {variant.attributes
                                  .map((attr) => `${attr.name}: ${attr.value}`)
                                  .join(", ")}
                              </td>
                              <td className="px-4 py-2 text-sm text-purple-600 font-medium">
                                {formatPrice(variant.price)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {variant.quantity}
                              </td>
                              <td className="px-4 py-2">
                                {variant.image && (
                                  <img
                                    src={variant.image}
                                    alt="Variant"
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tabView === "reviews" && (
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        {product.rating}
                      </div>
                      <div className="flex justify-center mb-2">
                        {renderStars(product.rating)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {product.reviewCount} đánh giá
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <h4 className="font-medium mb-3">Phân bố đánh giá</h4>
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.filter(
                          (r) => r.rating === star
                        ).length;
                        const percentage =
                          reviews.length > 0
                            ? (count / reviews.length) * 100
                            : 0;
                        return (
                          <div key={star} className="flex items-center mb-2">
                            <span className="text-sm w-8">{star}</span>
                            <Star className="w-4 h-4 text-yellow-400 mr-2" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Đánh giá từ khách hàng ({reviews.length})
                  </h3>

                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review, index) => (
                        <div
                          key={review._id || index}
                          className="border-b border-gray-200 pb-6"
                        >
                          <div className="flex items-start space-x-4">
                            <Avatar
                              src={review.userId?.avatar}
                              alt="User avatar"
                              className="w-12 h-12"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {review.userId.fullName ||
                                      review.userId ||
                                      "Người dùng ẩn danh"}
                                  </h4>
                                  <div className="flex items-center mt-1">
                                    {renderStars(review.rating)}
                                    <span className="ml-2 text-sm text-gray-600">
                                      {review.rating}/5
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                  <Calendar className="w-4 h-4 inline mr-1" />
                                  {formatDate(review.reviewDate)}
                                </div>
                              </div>

                              <p className="text-gray-700 mb-3">
                                {review.content}
                              </p>

                              {/* Variant info */}
                              {review.variant?.attributes &&
                                review.variant.attributes.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {review.variant.attributes.map(
                                      (attr, i) => (
                                        <Badge key={i} type="neutral">
                                          {attr.name}: {attr.value}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                )}

                              {/* Review images */}
                              {review.images && review.images.length > 0 && (
                                <div className="flex space-x-2 mt-3">
                                  {review.images.map((image, imgIndex) => (
                                    <img
                                      key={imgIndex}
                                      src={image}
                                      alt={`Review image ${imgIndex + 1}`}
                                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Chưa có đánh giá nào cho sản phẩm này
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SingleProduct;
