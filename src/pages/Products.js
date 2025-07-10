import React, { useState, useEffect } from "react";
import PageTitle from "../components/Typography/PageTitle";
import { Link, NavLink } from "react-router-dom";
import {
  EditIcon,
  EyeIcon,
  GridViewIcon,
  HomeIcon,
  ListViewIcon,
  TrashIcon,
} from "../icons";
import {
  Card,
  CardBody,
  Label,
  Select,
  Button,
  TableBody,
  TableContainer,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableFooter,
  Avatar,
  Badge,
  Pagination,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@windmill/react-ui";
import response from "../utils/demo/productData";
import Icon from "../components/Icon";
import { genRating } from "../utils/genarateRating";
import { useAuth } from "../context/AuthContext";
import { deleteProduct, getProductsByStoreId } from "../api/ProductApi";
import { getCategoriesByStore } from "../api/CategoryApi"; // Import hàm lấy category

const Products = () => {
  const [view, setView] = useState("grid");

  // Table and grid data handling
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Lưu tất cả sản phẩm gốc
  const [categories, setCategories] = useState([]); // Lưu danh sách categories
  const { user, loading } = useAuth();

  // Filter states
  const [sortBy, setSortBy] = useState(""); // "bestselling", "newest", ""
  const [filterCategory, setFilterCategory] = useState(""); // categoryId hoặc ""
  const [activeTab, setActiveTab] = useState("all"); // "all", "available", "outofstock", "onwait", "declined", "hidden"

  // pagination setup
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalResults, setTotalResults] = useState(0);

  // pagination change control
  function onPageChange(p) {
    setPage(p);
  }

  // Fetch categories
  const fetchCategories = async () => {
    if (loading || !user?.storeId) return;
    try {
      const res = await getCategoriesByStore({ storeId: user.storeId });
      if (res.status === 200) {
        setCategories(res.data);
      } else {
        console.log("Failed to fetch categories:", res);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch all products
  const fetchAllProducts = async () => {
    if (loading || !user?.storeId) return;
    try {
      const res = await getProductsByStoreId({ storeId: user.storeId });
      if (res.status === 200) {
        setAllProducts(res.data);
        setTotalResults(res.data.length);
        return res.data;
      } else {
        console.error("Failed to fetch products:", res);
        return [];
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  };

  // Apply filters and sorting
  const applyFiltersAndSort = () => {
    let filteredProducts = [...allProducts];

    // Filter by status tab
    if (activeTab !== "all") {
      filteredProducts = filteredProducts.filter(
        product => product.status === activeTab
      );
    }

    // Filter by category
    if (filterCategory) {
      filteredProducts = filteredProducts.filter(
        product => product.categoryId === filterCategory
      );
    }

    // Sort products
    if (sortBy === "bestselling") {
      // Sắp xếp theo số lượng đã bán (soldQuantity) giảm dần
      filteredProducts.sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0));
    } else if (sortBy === "newest") {
      // Sắp xếp theo thời gian tạo mới nhất (createdAt) giảm dần
      filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "price_asc") {
      // Sắp xếp theo giá tăng dần
      filteredProducts.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    } else if (sortBy === "price_desc") {
      // Sắp xếp theo giá giảm dần
      filteredProducts.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    }

    // Update total results after filtering
    setTotalResults(filteredProducts.length);

    // Apply pagination
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + parseInt(resultsPerPage);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    setData(paginatedProducts);
  };

  // Initial data fetch
  useEffect(() => {
    if (!loading && user?.storeId) {
      fetchAllProducts();
      fetchCategories();
    }
  }, [loading, user]);

  // Apply filters when dependencies change
  useEffect(() => {
    if (allProducts.length > 0) {
      applyFiltersAndSort();
    }
  }, [allProducts, sortBy, filterCategory, activeTab, page, resultsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [sortBy, filterCategory, activeTab]);

  // Delete action modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeleteProduct, setSelectedDeleteProduct] = useState(null);

  function openModal(productId) {
    const product = data.find((product) => product._id === productId);
    setSelectedDeleteProduct(product);
    setIsModalOpen(true);
  }

  async function deleteProductHandler() {
    if (selectedDeleteProduct) {
      try {
        const res = await deleteProduct(selectedDeleteProduct._id);
        if (res.status === 200) {
          // Remove from allProducts array
          setAllProducts(prev => 
            prev.filter(product => product._id !== selectedDeleteProduct._id)
          );
          setIsModalOpen(false);
          setSelectedDeleteProduct(null);
        } else {
          console.error("Failed to delete product:", res);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedDeleteProduct(null);
  }

  // Handle list view
  const handleChangeView = () => {
    setView(view === "list" ? "grid" : "list");
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Handle category filter change
  const handleCategoryFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  // Handle results per page change
  const handleResultsPerPageChange = (e) => {
    setResultsPerPage(parseInt(e.target.value));
    setPage(1); // Reset to first page
  };

  // Handle tab change
  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
  };

  // Get counts for each tab
  const getTabCounts = () => {
    const counts = {
      all: allProducts.length,
      available: allProducts.filter(p => p.status === 'available').length,
      outofstock: allProducts.filter(p => p.status === 'outofstock').length,
      onwait: allProducts.filter(p => p.status === 'onwait').length,
      declined: allProducts.filter(p => p.status === 'declined').length,
      hidden: allProducts.filter(p => p.status === 'hidden').length,
    };
    return counts;
  };

  const tabCounts = getTabCounts();

  // Get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'available':
        return { text: 'Available', type: 'success' };
      case 'outofstock':
        return { text: 'Out of Stock', type: 'danger' };
      case 'onwait':
        return { text: 'Pending', type: 'warning' };
      case 'declined':
        return { text: 'Declined', type: 'danger' };
      case 'hidden':
        return { text: 'Hidden', type: 'neutral' };
      default:
        return { text: status, type: 'neutral' };
    }
  };

  // Get tab display name
  const getTabDisplayName = (tab) => {
    switch (tab) {
      case 'all':
        return 'Tất cả sản phẩm';
      case 'available':
        return 'Sản phẩm có sẵn';
      case 'outofstock':
        return 'Sản phẩm hết hàng';
      case 'onwait':
        return 'Sản phẩm chờ duyệt';
      case 'declined':
        return 'Sản phẩm bị từ chối';
      case 'hidden':
        return 'Sản phẩm bị ẩn';
      default:
        return 'Sản phẩm';
    }
  };

  return (
    <div>
      <PageTitle>Tất cả</PageTitle>
      {/* Status Tabs */}
      <Card className="mt-5 mb-5 shadow-md">
        <CardBody>
          <div className="flex border-b border-gray-200 dark:border-gray-600 overflow-x-auto">
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "all"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleTabChange("all")}
            >
              <div className="flex items-center gap-2">
                <span>Tất cả sản phẩm</span>
                <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                  {tabCounts.all}
                </span>
              </div>
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "available"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleTabChange("available")}
            >
              <div className="flex items-center gap-2">
                <span>Có sẵn</span>
                <span className="bg-green-200 dark:bg-green-600 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs">
                  {tabCounts.available}
                </span>
              </div>
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "outofstock"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleTabChange("outofstock")}
            >
              <div className="flex items-center gap-2">
                <span>Hết hàng</span>
                <span className="bg-red-200 dark:bg-red-600 text-red-700 dark:text-red-300 px-2 py-1 rounded-full text-xs">
                  {tabCounts.outofstock}
                </span>
              </div>
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "onwait"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleTabChange("onwait")}
            >
              <div className="flex items-center gap-2">
                <span>Chờ duyệt</span>
                <span className="bg-yellow-200 dark:bg-yellow-600 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full text-xs">
                  {tabCounts.onwait}
                </span>
              </div>
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "declined"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleTabChange("declined")}
            >
              <div className="flex items-center gap-2">
                <span>Bị từ chối</span>
                <span className="bg-red-200 dark:bg-red-600 text-red-700 dark:text-red-300 px-2 py-1 rounded-full text-xs">
                  {tabCounts.declined}
                </span>
              </div>
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "hidden"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleTabChange("hidden")}
            >
              <div className="flex items-center gap-2">
                <span>Bị ẩn</span>
                <span className="bg-gray-400 dark:bg-gray-500 text-white px-2 py-1 rounded-full text-xs">
                  {tabCounts.hidden}
                </span>
              </div>
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Sort and Filter */}
      <Card className="mt-5 mb-5 shadow-md">
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-wrap gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getTabDisplayName(activeTab)} ({totalResults} kết quả)
              </p>

              {/* Sort Dropdown */}
              <Label className="">
                <Select 
                  className="py-3"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="">Sắp xếp theo</option>
                  <option value="bestselling">Bán chạy</option>
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp tới cao</option>
                  <option value="price_desc">Giá: Cao đến thấp</option>
                </Select>
              </Label>

              {/* Category Filter */}
              <Label className="">
                <Select 
                  className="py-3"
                  value={filterCategory}
                  onChange={handleCategoryFilterChange}
                >
                  <option value="">Tất cả doanh mục</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Label>

              {/* Results per page */}
              <Label className="mr-8">
                <div className="relative text-gray-500 focus-within:text-purple-600 dark:focus-within:text-purple-400">
                  <Select
                    className="py-3 pr-16"
                    value={resultsPerPage}
                    onChange={handleResultsPerPageChange}
                  >
                    <option value={10}>10 mỗi trang</option>
                    <option value={20}>20 mỗi trang</option>
                    <option value={50}>50 mỗi trang</option>
                    <option value={100}>100 mỗi trang</option>
                  </Select>
                </div>
              </Label>
            </div>
            
            <div className="">
              <Button
                icon={view === "list" ? ListViewIcon : GridViewIcon}
                className="p-2"
                aria-label="Toggle View"
                onClick={handleChangeView}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Delete product modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalHeader className="flex items-center">
          <Icon icon={TrashIcon} className="w-6 h-6 mr-3" />
          Delete Product
        </ModalHeader>
        <ModalBody>
          Make sure you want to delete product{" "}
          {selectedDeleteProduct && `"${selectedDeleteProduct.productName}"`}?
        </ModalBody>
        <ModalFooter>
          <div className="hidden sm:block">
            <Button layout="outline" onClick={closeModal}>
              Cancel
            </Button>
          </div>
          <div className="hidden sm:block" onClick={deleteProductHandler}>
            <Button>Delete</Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={closeModal}>
              Cancel
            </Button>
          </div>
          <div
            className="block w-full sm:hidden"
            onClick={deleteProductHandler}
          >
            <Button block size="large">
              Delete
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Product Views */}
      {view === "list" ? (
        <>
          <TableContainer className="mb-8">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Sold</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Action</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {data.map((product) => {
                  const statusInfo = getStatusInfo(product.status);
                  return (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Avatar
                            className="hidden mr-4 md:block"
                            src={product.productImages[0]}
                            alt="Product image"
                          />
                          <div>
                            <p className="font-semibold">{product.productName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge type={statusInfo.type}>
                          {statusInfo.text}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {genRating(product.rating, product.reviewCount, 5)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {product.soldQuantity || 0}
                      </TableCell>
                      <TableCell className="text-sm">
                        ${product.basePrice}
                      </TableCell>
                      <TableCell>
                        <div className="flex">
                          <Link to={`/app/products/${product._id}`}>
                            <Button
                              icon={EyeIcon}
                              className="mr-3"
                              aria-label="Preview"
                            />
                          </Link>
                          <Link to={`/app/edit-product/${product._id}`}>
                            <Button
                              icon={EditIcon}
                              className="mr-3"
                              layout="outline"
                              aria-label="Edit"
                            />
                          </Link>
                          <Button
                            icon={TrashIcon}
                            layout="outline"
                            onClick={() => openModal(product._id)}
                            aria-label="Delete"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <TableFooter>
              <Pagination
                totalResults={totalResults}
                resultsPerPage={resultsPerPage}
                label="Table navigation"
                onChange={onPageChange}
              />
            </TableFooter>
          </TableContainer>
        </>
      ) : (
        <>
          {/* Grid view */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
            {data.map((product) => {
              const statusInfo = getStatusInfo(product.status);
              return (
                <div className="" key={product._id}>
                  <Card>
                    <img
                      className="object-cover w-full h-48"
                      src={product.productImages[0]}
                      alt="product"
                    />
                    <CardBody>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-semibold truncate text-gray-600 dark:text-gray-300">
                          {product.productName}
                        </p>
                        <Badge
                          type={statusInfo.type}
                          className="whitespace-nowrap"
                        >
                          <p className="break-normal">
                            {statusInfo.text}
                          </p>
                        </Badge>
                      </div>

                      <p className="mb-2 text-purple-500 font-bold text-lg">
                        ${product.basePrice}
                      </p>

                      <div className="mb-4 text-sm text-gray-500">
                        <p>Sold: {product.soldQuantity || 0}</p>
                        <p>Rating: {product.rating || 0}/5</p>
                      </div>

                      <p className="mb-8 text-gray-600 dark:text-gray-400">
                        {product.description && product.description.length > 100
                          ? `${product.description.slice(0, 100)}...`
                          : product.description || 'No description'}
                      </p>

                      <div className="flex items-center justify-between">
                        <div>
                          <Link to={`/app/products/${product._id}`}>
                            <Button
                              icon={EyeIcon}
                              className="mr-3"
                              aria-label="Preview"
                              size="small"
                            />
                          </Link>
                        </div>
                        <div>
                          <Link to={`/app/edit-product/${product._id}`}>
                            <Button
                              icon={EditIcon}
                              className="mr-3"
                              layout="outline"
                              aria-label="Edit"
                              size="small"
                            />
                          </Link>
                          <Button
                            icon={TrashIcon}
                            layout="outline"
                            aria-label="Delete"
                            onClick={() => openModal(product._id)}
                            size="small"
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              );
            })}
          </div>

          <Pagination
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
            label="Table navigation"
            onChange={onPageChange}
          />
        </>
      )}

      {/* Empty state when no products found */}
      {data.length === 0 && (
        <Card className="mb-8">
          <CardBody>
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                No products found
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {activeTab === "all" 
                  ? "You haven't added any products yet."
                  : `No products with status "${activeTab}" found.`}
              </p>
              {activeTab === "all" && (
                <Link to="/app/add-product">
                  <Button className="mt-4">
                    Add your first product
                  </Button>
                </Link>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default Products;