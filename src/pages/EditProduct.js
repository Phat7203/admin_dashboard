import React, { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import PageTitle from "../components/Typography/PageTitle";
import { HomeIcon, AddIcon, PublishIcon, StoreIcon } from "../icons";
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
import { uploadMultipleFiles } from "../utils/fileUpload";

const FormTitle = ({ children }) => {
  return (
    <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
      {children}
    </h2>
  );
};

const EditProduct = () => {
  const { user } = useAuth();
  const { id } = useParams(); // Lấy ID từ URL params

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
  const [newImages, setNewImages] = useState([]); // State riêng cho ảnh mới upload

  // Load product data khi component mount
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoadingProduct(true);
        const response = await getProductById({ id: id });
        if (response.status === 200 && response.data) {
          const product = response.data;
          setProductData({
            productName: product.productName || "",
            basePrice: product.basePrice || 0,
            categoryId: product.categoryId || "",
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
            variants: product.variants || [],
          });
        } else {
          throw new Error("Không thể tải thông tin sản phẩm");
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
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
        console.error("Error fetching categories:", error);
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

      // Tạo SKU tự động
      const sku = `${productData.productName
        .replace(/\s+/g, "-")
        .toUpperCase()}-${combo
        .map((attr) => attr.value.replace(/\s+/g, ""))
        .join("-")}`;

      return (
        existingVariant || {
          id: Date.now() + idx,
          attributes: combo,
          price: productData.basePrice || 0,
          quantity: 0,
          sku: sku,
          image: "",
        }
      );
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

  // Hàm xóa ảnh hiện có
  const removeExistingImage = (imageIndex) => {
    const newImages = productData.productImages.filter(
      (_, i) => i !== imageIndex
    );
    setProductData({ ...productData, productImages: newImages });
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

      // Upload new images if any
      let newImageUrls = [];
      if (newImages.length > 0) {
        setUploadProgress(10);
        newImageUrls = await uploadMultipleFiles(newImages);
        setUploadProgress(50);
      }

      // Combine existing images with new uploaded images
      const allImages = [...productData.productImages, ...newImageUrls];

      // Prepare data for API
      const finalProductData = {
        ...productData,
        storeId: user.storeId,
        productImages: allImages,
        variants: productData.variants.map((variant) => ({
          ...variant,
          price: parseFloat(variant.price),
          quantity: parseInt(variant.quantity),
        })),
      };

      // Call API to update product
      console.log("Updating product data:", finalProductData);
      const response = await updateProduct(id, finalProductData);
      setUploadProgress(100);

      if (response.status === 200) {
        alert("Sản phẩm đã được cập nhật thành công!");
        // Reset new images
        setNewImages([]);
      } else {
        throw new Error(response.data?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating product:", error);
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
      <PageTitle>Edit Product</PageTitle>

      {/* Breadcum */}
      <Card className="flex text-gray-800 dark:text-gray-300">
        <div className="flex items-center text-purple-600">
          <Icon className="w-5 h-5" aria-hidden="true" icon={HomeIcon} />
          <NavLink exact to="/app/dashboard-shop" className="mx-2">
            Dashboard
          </NavLink>
          <NavLink exact to="/app/products" className="mx-2">
            All product
          </NavLink>
        </div>
        {">"}
        <p className="mx-2">Edit Product</p>
      </Card>

      <div className="w-full mt-8 grid gap-4 grid-col md:grid-cols-3">
        <Card className="row-span-2 md:col-span-2">
          <CardBody>
            {/* Existing Product Images */}
            <FormTitle>Current Product Images</FormTitle>
            {productData.productImages.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-2">
                {productData.productImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
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
            <FormTitle>Add New Images</FormTitle>
            <input
              type="file"
              multiple
              className="mb-4 text-gray-800 dark:text-gray-300"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setNewImages(files);
              }}
            />

            <FormTitle>Product Name</FormTitle>
            <Label>
              <Input
                className="mb-4"
                placeholder="Type product name here"
                value={productData.productName}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    productName: e.target.value,
                  })
                }
              />
            </Label>

            <FormTitle>Base Price</FormTitle>
            <Label>
              <Input
                type="number"
                className="mb-4"
                placeholder="Enter base price"
                value={productData.basePrice}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    basePrice: parseFloat(e.target.value),
                  })
                }
              />
            </Label>

            <FormTitle>Product Category</FormTitle>
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
                    ? "Loading categories..."
                    : "Select a category"}
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Label>

            {/* General Attributes Section */}
            <FormTitle>Technical Specifications</FormTitle>
            <div className="mb-4 p-4 border rounded">
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Attribute Name (e.g. RAM)"
                  value={generalAttribute.name}
                  onChange={(e) =>
                    setGeneralAttribute({
                      ...generalAttribute,
                      name: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Value (e.g. 8GB)"
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
                  Add
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
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            {/* Variant Attributes Section */}
            <FormTitle>Product Variants</FormTitle>
            <div className="mb-4 p-4 border rounded">
              {/* Form thêm variant attribute mới */}
              <div className="border-b pb-4 mb-4">
                <div className="flex gap-4 mb-4">
                  <Input
                    placeholder="Variant Type (e.g. Color, Size)"
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
                      placeholder="Add value"
                      value={variantValueInput}
                      onChange={(e) => setVariantValueInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addVariantValue();
                        }
                      }}
                    />
                    <Button size="small" onClick={addVariantValue}>
                      Add
                    </Button>
                  </div>
                </div>

                {/* Hiển thị các values đã thêm cho attribute hiện tại */}
                {variantAttribute.values.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm mb-2">
                      Values for {variantAttribute.name}:
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
                  Add Variant Type
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
                      Remove
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
                  Product Variants ({productData.variants.length})
                </FormTitle>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {productData.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="p-4 border rounded bg-gray-50 dark:bg-gray-700"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>
                            <span className="text-sm font-medium">Variant</span>
                            <div className="p-2 bg-white dark:bg-gray-600 rounded text-sm">
                              {variant.attributes
                                .map((attr) => `${attr.name}: ${attr.value}`)
                                .join(", ")}
                            </div>
                          </Label>
                        </div>
                        <div>
                          <Label>
                            <span className="text-sm font-medium">Price</span>
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
                              Quantity
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
                              placeholder="Auto-generated"
                            />
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Dimensions */}
            <FormTitle>Product Dimensions</FormTitle>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Label>
                <span>Weight (g)</span>
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
                <span>Height (cm)</span>
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
                <span>Length (cm)</span>
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
                <span>Width (cm)</span>
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

            <FormTitle>Description</FormTitle>
            <Label>
              <Textarea
                className="mb-4"
                rows="5"
                placeholder="Enter product description"
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
            <FormTitle>Product Status</FormTitle>
            <Select
              className="mb-4"
              value={productData.status}
              onChange={(e) =>
                setProductData({ ...productData, status: e.target.value })
              }
            >
              <option value="available">Available</option>
              <option value="outofstock">Out of Stock</option>
              <option value="onwait">On Wait</option>
            </Select>

            <FormTitle>Sale Settings</FormTitle>
            <Label className="mb-4">
              <Input
                type="checkbox"
                checked={productData.isOnSale}
                onChange={(e) =>
                  setProductData({ ...productData, isOnSale: e.target.checked })
                }
              />
              <span className="ml-2">On Sale</span>
            </Label>

            {productData.isOnSale && (
              <Label>
                <span>Discount Price</span>
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
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-sm mb-1">
                General Attributes: {productData.generalAttributes.length}
              </p>
              <p className="text-sm mb-1">
                Variant Types: {productData.variantAttributes.length}
              </p>
              <p className="text-sm mb-1">
                Product Variants: {productData.variants.length}
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
