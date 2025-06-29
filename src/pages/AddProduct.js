import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Icon from "../components/Icon";
import PageTitle from "../components/Typography/PageTitle";
import { HomeIcon } from "../icons";
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
import { useAuth } from "../context/AuthContext";
import { uploadMultipleFiles } from "../utils/fileUpload";
import { addProduct } from "../api/ProductApi";

const FormTitle = ({ children }) => {
  return (
    <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
      {children}
    </h2>
  );
};

const AddProduct = () => {
  const { user } = useAuth();
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
    status: "onwait",
    generalAttributes: [],
    variantAttributes: [],
    variants: [],
    imageModerationStatus: "unchecked",
    imageModerationNote: "",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingVariantImage, setEditingVariantImage] = useState(null);

  // Thêm useEffect để load categories khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getCategoriesByStore({ storeId: user.storeId });
        if (response.status === 200) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        alert("Không thể tải danh sách danh mục");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [user.storeId]);

  // Tự động tạo variants khi variantAttributes thay đổi
  useEffect(() => {
    generateVariants();
  }, [productData.variantAttributes, productData.basePrice]);

  // Hàm kiểm tra file có phải là hình ảnh không
  const isImageFile = (file) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    return allowedTypes.includes(file.type);
  };

  // Hàm xử lý upload hình ảnh chính
  const handleMainImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => {
      if (!isImageFile(file)) {
        alert(
          `Tệp ${file.name} không phải là hình ảnh hợp lệ. Chỉ chấp nhận JPG, PNG, GIF, WEBP.`
        );
        return false;
      }
      return true;
    });

    if (imageFiles.length > 0) {
      setProductData({ ...productData, productImages: imageFiles });
    }
  };

  // Hàm xử lý upload hình ảnh cho variant
  const handleVariantImageUpload = (variantId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isImageFile(file)) {
      alert(
        `Tệp ${file.name} không phải là hình ảnh hợp lệ. Chỉ chấp nhận JPG, PNG, GIF, WEBP.`
      );
      return;
    }

    setProductData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId
          ? { ...variant, imageFile: file, image: URL.createObjectURL(file) }
          : variant
      ),
    }));
  };

  // Hàm thay thế ảnh variant hiện có
  const replaceVariantImage = (variantId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isImageFile(file)) {
      alert(
        `Tệp ${file.name} không phải là hình ảnh hợp lệ. Chỉ chấp nhận JPG, PNG, GIF, WEBP.`
      );
      return;
    }

    setProductData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId
          ? { ...variant, imageFile: file, image: URL.createObjectURL(file) }
          : variant
      ),
    }));
    setEditingVariantImage(null);
  };

  // Hàm xóa hình ảnh variant
  const removeVariantImage = (variantId) => {
    setProductData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId
          ? { ...variant, imageFile: null, image: "" }
          : variant
      ),
    }));
    setEditingVariantImage(null);
  };

  // Hàm mở modal chỉnh sửa ảnh
  const openImageEditor = (variantId) => {
    setEditingVariantImage(variantId);
  };

  // Hàm đóng modal chỉnh sửa ảnh
  const closeImageEditor = () => {
    setEditingVariantImage(null);
  };

  // Hàm tạo tất cả combinations từ variant attributes
  const generateVariants = () => {
    if (productData.variantAttributes.length === 0) {
      setProductData((prev) => ({ ...prev, variants: [] }));
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

    // Giữ lại các variant images đã có khi regenerate
    const existingVariantImages = {};
    productData.variants.forEach((variant) => {
      const key = variant.attributes
        .map((attr) => `${attr.name}:${attr.value}`)
        .join("|");
      if (variant.imageFile || variant.image) {
        existingVariantImages[key] = {
          imageFile: variant.imageFile,
          image: variant.image,
        };
      }
    });

    // Tạo variants từ combinations
    const newVariants = combinations.map((combo, idx) => {
      const key = combo.map((attr) => `${attr.name}:${attr.value}`).join("|");
      const existingImage = existingVariantImages[key];

      // Tạo SKU tự động
      const sku = `${productData.productName
        .replace(/\s+/g, "-")
        .toUpperCase()}-${combo
        .map((attr) => attr.value.replace(/\s+/g, ""))
        .join("-")}`;

      return {
        id: Date.now() + idx,
        attributes: combo,
        price: productData.basePrice || 0,
        quantity: 0,
        sku: sku,
        image: existingImage?.image || "",
        imageFile: existingImage?.imageFile || null,
      };
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

  // Hàm handle submit
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

      setIsSubmitting(true);

      // Upload main images first
      let mainImageUrls = [];
      if (productData.productImages.length > 0) {
        setUploadProgress(10);
        mainImageUrls = await uploadMultipleFiles(productData.productImages);
        setUploadProgress(30);
      }

      // Upload variant images
      const variantsWithImages = await Promise.all(
        productData.variants.map(async (variant) => {
          let variantImageUrl = "";

          if (variant.imageFile) {
            // Upload variant-specific image
            const [uploadedUrl] = await uploadMultipleFiles([
              variant.imageFile,
            ]);
            variantImageUrl = uploadedUrl;
          } else if (mainImageUrls.length > 0) {
            // Use first main image as default
            variantImageUrl = mainImageUrls[0];
          }

          return {
            ...variant,
            price: parseFloat(variant.price),
            quantity: parseInt(variant.quantity),
            image: variantImageUrl,
            // Remove imageFile before sending to API
            imageFile: undefined,
          };
        })
      );

      setUploadProgress(70);

      // Prepare data for API
      const finalProductData = {
        ...productData,
        storeId: user.storeId,
        productImages: mainImageUrls,
        status: "onwait",
        variants: variantsWithImages,
      };

      // Call API to save product
      console.log("Đang gửi dữ liệu sản phẩm:", finalProductData);
      const response = await addProduct(finalProductData);
      setUploadProgress(100);

      if (response.status === 200) {
        alert(
          "Sản phẩm đã được thêm thành công! Sản phẩm sẽ được Admin duyệt trước khi hiển thị."
        );
        // Reset form
        setProductData({
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
          status: "onwait",
          generalAttributes: [],
          variantAttributes: [],
          variants: [],
        });
      } else {
        throw new Error(response.data?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      alert(error.message || "Có lỗi xảy ra khi thêm sản phẩm");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div>
      <PageTitle>Thêm Sản Phẩm Mới</PageTitle>
      <div className="w-full mt-8 grid gap-4 grid-col md:grid-cols-3">
        <Card className="row-span-2 md:col-span-2">
          <CardBody>
            {/* Product Images */}
            <FormTitle>Hình Ảnh Sản Phẩm</FormTitle>
            <div className="mb-4">
              <div className="mb-2">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="text-gray-800 dark:text-gray-300"
                  onChange={handleMainImagesUpload}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Chỉ chấp nhận tệp hình ảnh: JPG, PNG, GIF, WEBP
              </p>
              {/* Preview main images */}
              {productData.productImages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.from(productData.productImages).map((file, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Xem trước ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <button
                        onClick={() => {
                          const newImages = Array.from(
                            productData.productImages
                          ).filter((_, i) => i !== idx);
                          setProductData({
                            ...productData,
                            productImages: newImages,
                          });
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FormTitle>Tên Sản Phẩm</FormTitle>
            <Label>
              <Input
                className="mb-4"
                placeholder="Nhập tên sản phẩm tại đây"
                value={productData.productName}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    productName: e.target.value,
                  })
                }
              />
            </Label>

            <FormTitle>Giá Cơ Bản</FormTitle>
            <Label>
              <Input
                type="number"
                className="mb-4"
                placeholder="Nhập giá cơ bản"
                value={productData.basePrice}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    basePrice: parseFloat(e.target.value),
                  })
                }
              />
            </Label>

            <FormTitle>Danh Mục Sản Phẩm</FormTitle>
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
                  {loadingCategories
                    ? "Đang tải danh mục..."
                    : "Chọn một danh mục"}
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Label>

            {/* General Attributes Section */}
            <FormTitle>Thông Số Kỹ Thuật</FormTitle>
            <div className="mb-4 p-4 border rounded">
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Tên thuộc tính (ví dụ: RAM)"
                  value={generalAttribute.name}
                  onChange={(e) =>
                    setGeneralAttribute({
                      ...generalAttribute,
                      name: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Giá trị (ví dụ: 8GB)"
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
            <FormTitle>Biến Thể Sản Phẩm</FormTitle>
            <div className="mb-4 p-4 border rounded">
              {/* Form thêm variant attribute mới */}
              <div className="border-b pb-4 mb-4">
                <div className="flex gap-4 mb-4">
                  <Input
                    placeholder="Loại biến thể (ví dụ: Màu sắc, Kích thước)"
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
                  Thêm Loại Biến Thể
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

            {/* Generated Variants Section với Image Upload và Edit */}
            {productData.variants.length > 0 && (
              <div className="mb-4">
                <FormTitle>
                  Biến Thể Sản Phẩm Đã Tạo ({productData.variants.length})
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
                              Biến Thể
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
                              value={variant.price}
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
                              Số Lượng
                            </span>
                            <Input
                              type="number"
                              value={variant.quantity}
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
                            <span className="text-sm font-medium">SKU</span>
                            <Input
                              value={variant.sku}
                              onChange={(e) =>
                                updateVariant(variant.id, "sku", e.target.value)
                              }
                              placeholder="Tự động tạo"
                            />
                          </Label>
                        </div>
                        <div>
                          <div className="mb-2">
                            <span className="text-sm font-medium block mb-1">
                              Hình Ảnh Biến Thể
                            </span>

                            {/* Hiển thị ảnh hiện tại hoặc nút upload */}
                            {variant.image ? (
                              <div className="space-y-2">
                                <div className="relative inline-block">
                                  <img
                                    src={variant.image}
                                    alt="Xem trước biến thể"
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => openImageEditor(variant.id)}
                                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() =>
                                      removeVariantImage(variant.id)
                                    }
                                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                  onChange={(e) =>
                                    handleVariantImageUpload(variant.id, e)
                                  }
                                  className="text-xs w-full"
                                />
                                {productData.productImages.length > 0 && (
                                  <p className="text-xs text-gray-500">
                                    Sẽ dùng ảnh chính mặc định
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Dimensions */}
            <FormTitle>Kích Thước Sản Phẩm</FormTitle>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Label>
                <span>Trọng lượng (g)</span>
                <Input
                  type="number"
                  value={productData.weight}
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
                  value={productData.height}
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
                  value={productData.length}
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
                  value={productData.width}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      width: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </Label>
            </div>

            <FormTitle>Mô Tả</FormTitle>
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
            {/* Hiển thị thông báo về status */}
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Trạng thái sản phẩm
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Sản phẩm mới thêm sẽ có trạng thái "Chờ duyệt" và cần được Admin
                phê duyệt trước khi hiển thị công khai.
              </p>
            </div>

            <FormTitle>Cài Đặt Khuyến Mãi</FormTitle>
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
                  value={productData.discountPrice}
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
              <h3 className="font-semibold mb-2">Tóm Tắt</h3>
              <p className="text-sm mb-1">
                Ảnh chính: {productData.productImages.length}
              </p>
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
                Biến thể có ảnh riêng:{" "}
                {productData.variants.filter((v) => v.imageFile).length}
              </p>
              <p className="text-sm mb-1 text-yellow-600 dark:text-yellow-400">
                Trạng thái: Chờ duyệt
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
                    <div className="mr-2">Đang xử lý...</div>
                    <div className="text-sm">{uploadProgress}%</div>
                  </div>
                ) : (
                  "Thêm sản phẩm"
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

      {/* Modal chỉnh sửa ảnh biến thể */}
      {editingVariantImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Chỉnh Sửa Ảnh Biến Thể
            </h3>

            {/* Hiển thị ảnh hiện tại */}
            {(() => {
              const variant = productData.variants.find(
                (v) => v.id === editingVariantImage
              );
              return variant && variant.image ? (
                <div className="mb-4">
                  <p className="text-sm mb-2">Ảnh hiện tại:</p>
                  <img
                    src={variant.image}
                    alt="Ảnh hiện tại"
                    className="w-32 h-32 object-cover rounded border mx-auto"
                  />
                </div>
              ) : null;
            })()}

            {/* Input để thay thế ảnh */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Chọn ảnh mới:
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => replaceVariantImage(editingVariantImage, e)}
                className="w-full text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Chấp nhận: JPG, PNG, GIF, WEBP
              </p>
            </div>

            {/* Nút điều khiển */}
            <div className="flex gap-3">
              <Button
                size="small"
                layout="outline"
                onClick={closeImageEditor}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                size="small"
                onClick={() => removeVariantImage(editingVariantImage)}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Xóa Ảnh
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
