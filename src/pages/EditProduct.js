import React, { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { Package } from "lucide-react";
import PageTitle from "../components/Typography/PageTitle";
import {
  Card,
  CardBody,
  Label,
  Input,
  Textarea,
  Button,
  Select,
} from "@windmill/react-ui";
import { getCategoriesByStore } from "../api/CategoryApi";
import { getProductById, updateProduct } from "../api/ProductApi";
import { useAuth } from "../context/AuthContext";
import { uploadMultipleFiles, uploadFile } from "../utils/fileUpload";

const FormTitle = ({ children }) => {
  return (
    <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
      {children}
    </h2>
  );
};

const EditProduct = () => {
  const { user } = useAuth();
  const { id } = useParams();

  // State for form data
  const [productData, setProductData] = useState({
    productName: "",
    basePrice: 0,
    categoryId: "",
    productImages: [],
    description: "",
    isOnSale: false,
    discountPrice: 0,
    weight: 0,
    height: 0,
    length: 0,
    width: 0,
    status: "available",
    generalAttributes: [],
    variantAttributes: [],
    variants: [],
  });

  // State for dynamic attributes
  const [generalAttribute, setGeneralAttribute] = useState({
    name: "",
    value: "",
  });

  const [variantAttribute, setVariantAttribute] = useState({
    name: "",
    values: [],
  });

  // State để quản lý input cho variant values
  const [variantValueInput, setVariantValueInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newImages, setNewImages] = useState([]);
  const [variantImageUploads, setVariantImageUploads] = useState({}); // State cho ảnh variant
  const [variantUploadStatus, setVariantUploadStatus] = useState({}); // State để track upload status

  // Load product data khi component mount
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoadingProduct(true);
        const response = await getProductById({ id: id });
        if (response.status === 200 && response.data) {
          const product = response.data;

          // Xử lý categoryId nếu là object với $oid
          let categoryId = product.categoryId;
          if (typeof categoryId === "object" && categoryId.$oid) {
            categoryId = categoryId.$oid;
          }

          // Xử lý variants - đảm bảo có ID duy nhất
          const processedVariants = (product.variants || []).map(
            (variant, index) => ({
              ...variant,
              // Sử dụng index làm ID tạm nếu không có ID
              id: variant._id || variant.id || `variant_${index}`,
              price: variant.price || 0,
              quantity: variant.quantity || 0,
              sku: variant.sku || "",
              image: variant.image || "",
              attributes: variant.attributes || [],
            })
          );

          setProductData({
            productName: product.productName || "",
            basePrice: product.basePrice || 0,
            categoryId: categoryId,
            productImages: product.productImages || [],
            description: product.description || "",
            isOnSale: product.isOnSale || false,
            discountPrice: product.discountPrice || 0,
            weight: product.weight || 0,
            height: product.height || 0,
            length: product.length || 0,
            width: product.width || 0,
            status: product.status || "available",
            generalAttributes: product.generalAttributes || [],
            variantAttributes: product.variantAttributes || [],
            variants: processedVariants,
          });
        } else {
          throw new Error("Không thể tải thông tin sản phẩm");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
        alert("Không thể tải thông tin sản phẩm: " + error.message);
      } finally {
        setLoadingProduct(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  // Load categories khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getCategoriesByStore({ storeId: user.storeId });
        setCategories(response.data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        alert("Không thể tải danh sách danh mục");
      } finally {
        setLoadingCategories(false);
      }
    };

    if (user?.storeId) {
      fetchCategories();
    }
  }, [user?.storeId]);

  // Tự động tạo variants khi variantAttributes thay đổi
  useEffect(() => {
    generateVariants();
  }, [productData.variantAttributes, productData.basePrice]);

  // Hàm tạo tất cả combinations từ variant attributes
  const generateVariants = () => {
    if (productData.variantAttributes.length === 0) {
      return;
    }

    const combinations = [];

    const generateCombinations = (index, current) => {
      if (index === productData.variantAttributes.length) {
        combinations.push([...current]);
        return;
      }

      const attr = productData.variantAttributes[index];
      for (const value of attr.values) {
        current.push({ name: attr.name, value });
        generateCombinations(index + 1, current);
        current.pop();
      }
    };

    generateCombinations(0, []);

    // Tạo variants từ combinations, giữ lại dữ liệu của variants hiện có
    const newVariants = combinations.map((combo, idx) => {
      // Tìm variant hiện có với cùng attributes
      const existingVariant = productData.variants.find(
        (v) =>
          v.attributes &&
          v.attributes.length === combo.length &&
          v.attributes.every((attr) =>
            combo.some((c) => c.name === attr.name && c.value === attr.value)
          )
      );

      if (existingVariant) {
        // Giữ nguyên variant hiện có
        return existingVariant;
      } else {
        // Tạo variant mới
        const sku = `SKU-${combo
          .map((attr) => attr.value.replace(/\s+/g, "").toUpperCase())
          .join("-")}`;

        return {
          id: `new_variant_${Date.now()}_${idx}`,
          attributes: combo,
          price: productData.basePrice || 0,
          quantity: 0,
          sku: sku,
          image: "",
        };
      }
    });

    setProductData((prev) => ({ ...prev, variants: newVariants }));
  };

  // Hàm cập nhật variant cụ thể
  const updateVariant = (variantId, field, value) => {
    setProductData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  // State để track upload status cho từng variant
  // Hàm upload ảnh cho variant ngay lập tức
  const handleVariantImageUpload = async (variantId, file) => {
    try {
      // Set loading state cho variant này
      setVariantUploadStatus((prev) => ({
        ...prev,
        [variantId]: { uploading: true, progress: 0 },
      }));

      setVariantUploadStatus((prev) => ({
        ...prev,
        [variantId]: { uploading: true, progress: 25 },
      }));

      const result = await uploadFile(file, "variants");

      setVariantUploadStatus((prev) => ({
        ...prev,
        [variantId]: { uploading: true, progress: 75 },
      }));

      // Cập nhật ảnh cho variant trong productData
      updateVariant(variantId, "image", result.url);

      // Xóa file khỏi variantImageUploads
      setVariantImageUploads((prev) => {
        const newUploads = { ...prev };
        delete newUploads[variantId];
        return newUploads;
      });

      // Set thành công
      setVariantUploadStatus((prev) => ({
        ...prev,
        [variantId]: { uploading: false, progress: 100, success: true },
      }));

      // Clear status sau 2 giây
      setTimeout(() => {
        setVariantUploadStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[variantId];
          return newStatus;
        });
      }, 2000);

      alert("Đã tải ảnh lên thành công!");
    } catch (error) {
      console.error("Lỗi khi tải ảnh variant:", error);
      alert("Không thể tải ảnh lên: " + error.message);

      // Set lỗi
      setVariantUploadStatus((prev) => ({
        ...prev,
        [variantId]: { uploading: false, progress: 0, error: true },
      }));

      // Clear error sau 3 giây
      setTimeout(() => {
        setVariantUploadStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[variantId];
          return newStatus;
        });
      }, 3000);
    }
  };

  // Hàm xử lý khi chọn file ảnh cho variant
  const handleVariantFileSelect = (variantId, file) => {
    if (file) {
      setVariantImageUploads((prev) => ({
        ...prev,
        [variantId]: file,
      }));
    }
  };

  // Hàm xóa variant attribute
  const removeVariantAttribute = (index) => {
    const newVariantAttributes = productData.variantAttributes.filter(
      (_, i) => i !== index
    );
    setProductData((prev) => ({
      ...prev,
      variantAttributes: newVariantAttributes,
    }));
  };

  // Hàm thêm variant attribute với validation
  const addVariantAttribute = () => {
    if (!variantAttribute.name.trim()) {
      alert("Vui lòng nhập tên thuộc tính");
      return;
    }

    if (variantAttribute.values.length === 0) {
      alert("Vui lòng thêm ít nhất một giá trị");
      return;
    }

    // Kiểm tra trùng tên
    const existingNames = productData.variantAttributes.map((attr) =>
      attr.name.toLowerCase()
    );
    if (existingNames.includes(variantAttribute.name.toLowerCase())) {
      alert("Tên thuộc tính đã tồn tại");
      return;
    }

    setProductData({
      ...productData,
      variantAttributes: [...productData.variantAttributes, variantAttribute],
    });
    setVariantAttribute({ name: "", values: [] });
  };

  // Hàm thêm value cho variant attribute hiện tại
  const addVariantValue = () => {
    if (!variantValueInput.trim()) return;

    // Kiểm tra trùng giá trị
    if (variantAttribute.values.includes(variantValueInput.trim())) {
      alert("Giá trị này đã tồn tại");
      return;
    }

    const newValues = [...variantAttribute.values, variantValueInput.trim()];
    setVariantAttribute({ ...variantAttribute, values: newValues });
    setVariantValueInput("");
  };

  // Hàm xóa value khỏi variant attribute hiện tại
  const removeVariantValue = (valueIndex) => {
    const newValues = variantAttribute.values.filter(
      (_, i) => i !== valueIndex
    );
    setVariantAttribute({ ...variantAttribute, values: newValues });
  };

  // Hàm xóa ảnh hiện có
  const removeExistingImage = (imageIndex) => {
    const newImages = productData.productImages.filter(
      (_, i) => i !== imageIndex
    );
    setProductData({ ...productData, productImages: newImages });
  };

  // Hàm handle submit - chỉ xử lý ảnh sản phẩm chính
  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!productData.productName.trim()) {
        alert("Vui lòng nhập tên sản phẩm");
        return;
      }

      if (!productData.basePrice || productData.basePrice <= 0) {
        alert("Vui lòng nhập giá cơ bản hợp lệ");
        return;
      }

      if (!productData.categoryId) {
        alert("Vui lòng chọn danh mục");
        return;
      }

      // Kiểm tra xem có ảnh variant nào chưa upload không
      const pendingVariantUploads = Object.keys(variantImageUploads);
      if (pendingVariantUploads.length > 0) {
        const confirmSubmit = window.confirm(
          `Bạn có ${pendingVariantUploads.length} ảnh variant chưa được tải lên. Bạn có muốn tiếp tục không? (Các ảnh này sẽ không được lưu)`
        );
        if (!confirmSubmit) {
          return;
        }
      }

      setIsSubmitting(true);

      // Chỉ upload ảnh sản phẩm chính
      let newImageUrls = [];
      if (newImages.length > 0) {
        setUploadProgress(20);
        newImageUrls = await uploadMultipleFiles(newImages);
        setUploadProgress(60);
      }

      // Combine existing images with new uploaded images
      const allImages = [...productData.productImages, ...newImageUrls];
      setUploadProgress(80);

      // Prepare data for API - variants đã có ảnh được cập nhật từ upload riêng lẻ
      const finalProductData = {
        ...productData,
        storeId: user.storeId,
        productImages: allImages,
        variants: productData.variants.map((variant) => ({
          ...variant,
          price: parseFloat(variant.price) || 0,
          quantity: parseInt(variant.quantity) || 0,
        })),
      };

      // Call API to update product
      console.log("Đang cập nhật dữ liệu sản phẩm:", finalProductData);
      const response = await updateProduct(id, finalProductData);
      setUploadProgress(100);

      if (response.status === 200) {
        alert("Sản phẩm đã được cập nhật thành công!");
        // Reset new images và variant uploads
        setNewImages([]);
        setVariantImageUploads({});
      } else {
        throw new Error(response.data?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      alert(error.message || "Có lỗi xảy ra khi cập nhật sản phẩm");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Loading state
  if (loadingProduct) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle>Chỉnh sửa sản phẩm</PageTitle>

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
              <span className="text-gray-500">{productData.productName}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="w-full mt-8 grid gap-4 grid-col md:grid-cols-3">
        <Card className="row-span-2 md:col-span-2">
          <CardBody>
            {/* Existing Product Images */}
            <FormTitle>Hình ảnh sản phẩm hiện tại</FormTitle>
            {productData.productImages.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-2">
                {productData.productImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Sản phẩm ${index + 1}`}
                      className="w-full h-48 object-cover rounded border"
                    />
                    <button
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Images Upload */}
            <FormTitle>Thêm hình ảnh mới</FormTitle>
            <input
              type="file"
              multiple
              accept="image/*"
              className="mb-4 text-gray-800 dark:text-gray-300"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setNewImages(files);
              }}
            />

            <FormTitle>Tên sản phẩm</FormTitle>
            <Label>
              <Input
                className="mb-4"
                placeholder="Nhập tên sản phẩm"
                value={productData.productName}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    productName: e.target.value,
                  })
                }
              />
            </Label>

            <FormTitle>Giá cơ bản</FormTitle>
            <Label>
              <Input
                type="number"
                className="mb-4"
                placeholder="Nhập giá cơ bản"
                value={productData.basePrice}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    basePrice: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </Label>

            <FormTitle>Danh mục sản phẩm</FormTitle>
            <Label>
              <Select
                className="mb-4"
                value={productData.categoryId}
                onChange={(e) =>
                  setProductData({ ...productData, categoryId: e.target.value })
                }
                disabled={loadingCategories}
              >
                <option value="">
                  {loadingCategories ? "Đang tải danh mục..." : "Chọn danh mục"}
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Label>

            {/* General Attributes Section */}
            <FormTitle>Thông số kỹ thuật</FormTitle>
            <div className="mb-4 p-4 border rounded">
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Tên thuộc tính (VD: Chất liệu)"
                  value={generalAttribute.name}
                  onChange={(e) =>
                    setGeneralAttribute({
                      ...generalAttribute,
                      name: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Giá trị (VD: Cotton)"
                  value={generalAttribute.value}
                  onChange={(e) =>
                    setGeneralAttribute({
                      ...generalAttribute,
                      value: e.target.value,
                    })
                  }
                />
                <Button
                  size="small"
                  onClick={() => {
                    if (
                      generalAttribute.name.trim() &&
                      generalAttribute.value.trim()
                    ) {
                      setProductData({
                        ...productData,
                        generalAttributes: [
                          ...productData.generalAttributes,
                          generalAttribute,
                        ],
                      });
                      setGeneralAttribute({ name: "", value: "" });
                    }
                  }}
                >
                  Thêm
                </Button>
              </div>
              {/* Display added general attributes */}
              {productData.generalAttributes.map((attr, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <span className="flex-1">
                    <strong>{attr.name}:</strong> {attr.value}
                  </span>
                  <Button
                    size="small"
                    layout="link"
                    onClick={() => {
                      const newAttrs = productData.generalAttributes.filter(
                        (_, i) => i !== idx
                      );
                      setProductData({
                        ...productData,
                        generalAttributes: newAttrs,
                      });
                    }}
                  >
                    Xóa
                  </Button>
                </div>
              ))}
            </div>

            {/* Variant Attributes Section */}
            <FormTitle>Biến thể sản phẩm</FormTitle>
            <div className="mb-4 p-4 border rounded">
              {/* Form thêm variant attribute mới */}
              <div className="border-b pb-4 mb-4">
                <div className="flex gap-4 mb-4">
                  <Input
                    placeholder="Loại biến thể (VD: Màu sắc, Kích thước)"
                    value={variantAttribute.name}
                    onChange={(e) =>
                      setVariantAttribute({
                        ...variantAttribute,
                        name: e.target.value,
                      })
                    }
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Thêm giá trị"
                      value={variantValueInput}
                      onChange={(e) => setVariantValueInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addVariantValue();
                        }
                      }}
                    />
                    <Button size="small" onClick={addVariantValue}>
                      Thêm
                    </Button>
                  </div>
                </div>

                {/* Hiển thị các values đã thêm cho attribute hiện tại */}
                {variantAttribute.values.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm mb-2">
                      Giá trị cho {variantAttribute.name}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {variantAttribute.values.map((value, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-sm flex items-center gap-2"
                        >
                          {value}
                          <button
                            onClick={() => removeVariantValue(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  size="small"
                  onClick={addVariantAttribute}
                  disabled={
                    !variantAttribute.name.trim() ||
                    variantAttribute.values.length === 0
                  }
                >
                  Thêm loại biến thể
                </Button>
              </div>

              {/* Hiển thị các variant attributes đã thêm */}
              {productData.variantAttributes.map((attr, idx) => (
                <div
                  key={idx}
                  className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{attr.name}</h4>
                    <Button
                      size="small"
                      layout="link"
                      onClick={() => removeVariantAttribute(idx)}
                      className="text-red-500"
                    >
                      Xóa
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attr.values.map((value, vIdx) => (
                      <span
                        key={vIdx}
                        className="px-2 py-1 bg-white dark:bg-gray-600 rounded text-sm border"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Generated Variants Section */}
            {productData.variants.length > 0 && (
              <div className="mb-4">
                <FormTitle>
                  Biến thể sản phẩm ({productData.variants.length})
                </FormTitle>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {productData.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="p-4 border rounded bg-gray-50 dark:bg-gray-700"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <Label>
                            <span className="text-sm font-medium">
                              Biến thể
                            </span>
                            <div className="p-2 bg-white dark:bg-gray-600 rounded text-sm">
                              {variant.attributes
                                .map((attr) => `${attr.name}: ${attr.value}`)
                                .join(", ")}
                            </div>
                          </Label>
                        </div>
                        <div>
                          <Label>
                            <span className="text-sm font-medium">Giá</span>
                            <Input
                              type="number"
                              value={variant.price || 0}
                              onChange={(e) =>
                                updateVariant(
                                  variant.id,
                                  "price",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                          </Label>
                        </div>
                        <div>
                          <Label>
                            <span className="text-sm font-medium">
                              Số lượng
                            </span>
                            <Input
                              type="number"
                              value={variant.quantity || 0}
                              onChange={(e) =>
                                updateVariant(
                                  variant.id,
                                  "quantity",
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          </Label>
                        </div>
                        <div>
                          <Label>
                            <span className="text-sm font-medium">Mã SKU</span>
                            <Input
                              value={variant.sku || ""}
                              onChange={(e) =>
                                updateVariant(variant.id, "sku", e.target.value)
                              }
                              placeholder="Tự động tạo"
                            />
                          </Label>
                        </div>
                        <div>
                          <Label>
                            <span className="text-sm font-medium">
                              Hình ảnh
                            </span>
                            <div className="space-y-2">
                              {variant.image && (
                                <div className="relative">
                                  <img
                                    src={variant.image}
                                    alt={`Biến thể ${variant.id}`}
                                    className="w-20 h-20 object-cover rounded border"
                                  />
                                  <button
                                    onClick={() =>
                                      updateVariant(variant.id, "image", "")
                                    }
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                    title="Xóa ảnh"
                                  >
                                    ×
                                  </button>
                                </div>
                              )}

                              {/* File input với key và id riêng biệt */}
                              <input
                                key={`variant-image-${variant.id}`}
                                id={`variant-image-${variant.id}`}
                                type="file"
                                accept="image/*"
                                className="text-xs"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handleVariantFileSelect(variant.id, file);
                                  }
                                  // Reset input value sau khi xử lý
                                  e.target.value = "";
                                }}
                              />

                              {/* Show selected file and upload controls */}
                              {variantImageUploads[variant.id] && (
                                <div className="space-y-2">
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Đã chọn:{" "}
                                    {variantImageUploads[variant.id].name}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="small"
                                      onClick={() =>
                                        handleVariantImageUpload(
                                          variant.id,
                                          variantImageUploads[variant.id]
                                        )
                                      }
                                      disabled={
                                        variantUploadStatus[variant.id]
                                          ?.uploading
                                      }
                                    >
                                      {variantUploadStatus[variant.id]
                                        ?.uploading
                                        ? "Đang tải..."
                                        : "Tải lên"}
                                    </Button>
                                    <Button
                                      size="small"
                                      layout="link"
                                      onClick={() => {
                                        setVariantImageUploads((prev) => {
                                          const newUploads = { ...prev };
                                          delete newUploads[variant.id];
                                          return newUploads;
                                        });
                                      }}
                                      disabled={
                                        variantUploadStatus[variant.id]
                                          ?.uploading
                                      }
                                    >
                                      Hủy
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Upload progress for this variant */}
                              {variantUploadStatus[variant.id]?.uploading && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${
                                        variantUploadStatus[variant.id]
                                          ?.progress || 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              )}

                              {/* Success/Error messages */}
                              {variantUploadStatus[variant.id]?.success && (
                                <div className="text-xs text-green-600">
                                  ✓ Đã tải lên thành công
                                </div>
                              )}
                              {variantUploadStatus[variant.id]?.error && (
                                <div className="text-xs text-red-600">
                                  ✗ Lỗi khi tải lên
                                </div>
                              )}
                            </div>
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Dimensions */}
            <FormTitle>Kích thước sản phẩm</FormTitle>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Label>
                <span>Trọng lượng (g)</span>
                <Input
                  type="number"
                  value={productData.weight || 0}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      weight: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </Label>
              <Label>
                <span>Chiều cao (cm)</span>
                <Input
                  type="number"
                  value={productData.height || 0}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      height: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </Label>
              <Label>
                <span>Chiều dài (cm)</span>
                <Input
                  type="number"
                  value={productData.length || 0}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      length: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </Label>
              <Label>
                <span>Chiều rộng (cm)</span>
                <Input
                  type="number"
                  value={productData.width || 0}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      width: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </Label>
            </div>

            <FormTitle>Mô tả sản phẩm</FormTitle>
            <Label>
              <Textarea
                className="mb-4"
                rows="5"
                placeholder="Nhập mô tả sản phẩm"
                value={productData.description}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    description: e.target.value,
                  })
                }
              />
            </Label>
          </CardBody>
        </Card>

        {/* Right Side Card */}
        <Card>
          <CardBody>
            <FormTitle>Trạng thái sản phẩm</FormTitle>
            <Select
              className="mb-4"
              value={productData.status}
              onChange={(e) =>
                setProductData({ ...productData, status: e.target.value })
              }
            >
              <option value="available">Có sẵn</option>
              <option value="outofstock">Ẩn</option>
              <option value="onwait">Đang chờ</option>
            </Select>

            <FormTitle>Cài đặt khuyến mãi</FormTitle>
            <Label className="mb-4">
              <Input
                type="checkbox"
                checked={productData.isOnSale}
                onChange={(e) =>
                  setProductData({ ...productData, isOnSale: e.target.checked })
                }
              />
              <span className="ml-2">Đang khuyến mãi</span>
            </Label>

            {productData.isOnSale && (
              <Label>
                <span>Giá khuyến mãi</span>
                <Input
                  type="number"
                  className="mt-1"
                  value={productData.discountPrice || 0}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      discountPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </Label>
            )}

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <h3 className="font-semibold mb-2">Tóm tắt</h3>
              <p className="text-sm mb-1">
                Thuộc tính chung: {productData.generalAttributes.length}
              </p>
              <p className="text-sm mb-1">
                Loại biến thể: {productData.variantAttributes.length}
              </p>
              <p className="text-sm mb-1">
                Biến thể sản phẩm: {productData.variants.length}
              </p>
              <p className="text-sm mb-1">
                Ảnh sản phẩm: {productData.productImages.length}
              </p>
            </div>

            <div className="mt-8">
              <Button
                size="large"
                block
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2">Đang cập nhật...</div>
                    <div className="text-sm">{uploadProgress}%</div>
                  </div>
                ) : (
                  "Cập nhật sản phẩm"
                )}
              </Button>
              {isSubmitting && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default EditProduct;
