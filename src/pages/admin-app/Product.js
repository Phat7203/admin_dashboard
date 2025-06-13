import React, { useState, useEffect } from "react";
import PageTitle from "../../components/Typography/PageTitle";
import { Link, NavLink } from "react-router-dom";
import {
  Edit,
  Eye,
  Grid3X3,
  Home,
  List,
  Check,
  X,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ArrowLeft,
} from "lucide-react";
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
  Input,
  Textarea,
} from "@windmill/react-ui";
import Icon from "../../components/Icon";
import { useAuth } from "../../context/AuthContext";
import { 
  getAllProducts, 
  setProductStatus,
  updateImageModerationStatus,
} from "../../api/ProductApi";
import ProductDetail from "./ProductDetail"; // Import the new component

const AdminProductModeration = () => {
  const [view, setView] = useState("list");
  const [currentView, setCurrentView] = useState("list"); // "list", "grid", "detail"
  
  // Data states
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const { user, loading } = useAuth();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("all"); // all, safe, unsafe, unchecked, pending
  const [statusFilter, setStatusFilter] = useState(""); // onwait, isActive

  // Pagination
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [totalResults, setTotalResults] = useState(0);

  // Detail view and modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all products
  const fetchAllProducts = async () => {
    if (loading) return;
    try {
      const res = await getAllProducts();
      if (res.status === 200) {
        setAllProducts(res.data);
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

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.productName.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        (product.storeId && product.storeId.name.toLowerCase().includes(term)) ||
        (product.imageModerationNote && product.imageModerationNote.toLowerCase().includes(term))
      );
    }

    // Tab filter (image moderation status)
    if (activeTab !== "all") {
      switch (activeTab) {
        case "safe":
          filteredProducts = filteredProducts.filter(p => p.imageModerationStatus === "safe");
          break;
        case "unsafe":
          filteredProducts = filteredProducts.filter(p => p.imageModerationStatus === "unsafe");
          break;
        case "unchecked":
          filteredProducts = filteredProducts.filter(p => p.imageModerationStatus === "unchecked");
          break;
        case "pending":
          filteredProducts = filteredProducts.filter(p => p.status === "onwait");
          break;
      }
    }

    // Status filter
    if (statusFilter) {
      filteredProducts = filteredProducts.filter(p => p.status === statusFilter);
    }

    // Sort products
    if (sortBy === "newest") {
      filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      filteredProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "name_asc") {
      filteredProducts.sort((a, b) => a.productName.localeCompare(b.productName));
    } else if (sortBy === "moderation_priority") {
      // Unsafe first, then unchecked, then safe
      filteredProducts.sort((a, b) => {
        const priorityOrder = { unsafe: 0, unchecked: 1, safe: 2 };
        return priorityOrder[a.imageModerationStatus] - priorityOrder[b.imageModerationStatus];
      });
    }

    setTotalResults(filteredProducts.length);

    // Apply pagination
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + parseInt(resultsPerPage);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    setData(paginatedProducts);
  };

  // Initial data fetch
  useEffect(() => {
    if (!loading) {
      fetchAllProducts();
    }
  }, [loading]);

  // Apply filters when dependencies change
  useEffect(() => {
    if (allProducts.length > 0) {
      applyFiltersAndSort();
    }
  }, [allProducts, searchTerm, sortBy, activeTab, statusFilter, page, resultsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, sortBy, activeTab, statusFilter]);

  // Get tab counts
  const getTabCounts = () => {
    return {
      all: allProducts.length,
      safe: allProducts.filter(p => p.imageModerationStatus === 'safe').length,
      unsafe: allProducts.filter(p => p.imageModerationStatus === 'unsafe').length,
      unchecked: allProducts.filter(p => p.imageModerationStatus === 'unchecked').length,
      pending: allProducts.filter(p => p.status === 'onwait').length,
    };
  };

  const tabCounts = getTabCounts();

  // Handle product approval
  const handleProductApproval = async (productId, newStatus, note = "") => {
    setIsProcessing(true);
    try {
      const res = await setProductStatus(productId, newStatus);
      if (res.status === 200) {
        // Update local state
        setAllProducts(prev => 
          prev.map(product => 
            product._id === productId 
              ? { ...product, status: newStatus }
              : product
          )
        );
        
        // Update selected product if it's the one being modified
        if (selectedProduct && selectedProduct._id === productId) {
          setSelectedProduct(prev => ({ ...prev, status: newStatus }));
        }
        
        // If there's a note about the approval/rejection
        if (note && selectedProduct && selectedProduct._id === productId) {
          await updateImageModerationStatus(productId, selectedProduct.imageModerationStatus, note);
          setAllProducts(prev => 
            prev.map(product => 
              product._id === productId 
                ? { ...product, imageModerationNote: note }
                : product
            )
          );
        }
        
        setIsApprovalModalOpen(false);
        setApprovalNote("");
        
        alert(`Product ${newStatus === 'isActive' ? 'approved' : 'rejected'} successfully!`);
      } else {
        alert('Failed to update product status');
      }
    } catch (error) {
      console.error("Error updating product status:", error);
      alert('Error updating product status');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle image moderation update
  const handleImageModerationUpdate = async (productId, moderationStatus, note = "") => {
    try {
      const res = await updateImageModerationStatus(productId, moderationStatus, note);
      if (res.status === 200) {
        setAllProducts(prev => 
          prev.map(product => 
            product._id === productId 
              ? { 
                  ...product, 
                  imageModerationStatus: moderationStatus,
                  imageModerationNote: note 
                }
              : product
          )
        );
        
        if (selectedProduct && selectedProduct._id === productId) {
          setSelectedProduct(prev => ({ 
            ...prev, 
            imageModerationStatus: moderationStatus,
            imageModerationNote: note 
          }));
        }
        
        alert('Image moderation status updated successfully!');
      }
    } catch (error) {
      console.error("Error updating image moderation:", error);
      alert('Error updating image moderation status');
    }
  };

  // View handlers
  const openDetailView = (product) => {
    setSelectedProduct(product);
    setCurrentView("detail");
  };

  const closeDetailView = () => {
    setCurrentView(view);
    setSelectedProduct(null);
  };

  const openApprovalModal = (product) => {
    setSelectedProduct(product);
    setApprovalNote("");
    setIsApprovalModalOpen(true);
  };

  const closeApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setApprovalNote("");
  };

  // Get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'available':
        return { text: 'Available', type: 'success', icon: Check };
      case 'outofstock':
        return { text: 'Out of Stock', type: 'danger', icon: Check };
      case 'onwait':
        return { text: 'Pending Review', type: 'warning', icon: Clock };
      default:
        return { text: status, type: 'neutral', icon: AlertTriangle };
    }
  };

  const getImageModerationInfo = (status) => {
    switch (status) {
      case 'safe':
        return { text: 'Safe', type: 'success', icon: Check, color: 'text-green-600' };
      case 'unsafe':
        return { text: 'Unsafe', type: 'danger', icon: AlertTriangle, color: 'text-red-600' };
      case 'unchecked':
        return { text: 'Unchecked', type: 'neutral', icon: Clock, color: 'text-gray-600' };
      default:
        return { text: status, type: 'neutral', icon: AlertTriangle, color: 'text-gray-600' };
    }
  };

  // Render the detail view
  if (currentView === "detail" && selectedProduct) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Button
            layout="outline"
            onClick={closeDetailView}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
          <PageTitle>Product Details</PageTitle>
        </div>

        <ProductDetail
          selectedProduct={selectedProduct}
          onImageModerationUpdate={handleImageModerationUpdate}
          onOpenApprovalModal={openApprovalModal}
          getStatusInfo={getStatusInfo}
          getImageModerationInfo={getImageModerationInfo}
          onClose={closeDetailView}
        />

        {/* Keep the approval modal */}
        <Modal isOpen={isApprovalModalOpen} onClose={closeApprovalModal}>
          <ModalHeader className="flex items-center">
            <Check className="w-6 h-6 mr-3" />
            Review Product: {selectedProduct?.productName}
          </ModalHeader>
          <ModalBody>
            {selectedProduct && (
              <div className="space-y-4">
                {/* Product Summary */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
                  <img 
                    src={selectedProduct.productImages?.[0]} 
                    alt="Product" 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-semibold">{selectedProduct.productName}</h4>
                    <p className="text-sm text-gray-600">Store: {selectedProduct.storeId?.name}</p>
                    <p className="text-sm text-gray-600">Price: ${selectedProduct.basePrice}</p>
                  </div>
                </div>

                {/* Current Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Product Status</label>
                    <Badge type={getStatusInfo(selectedProduct.status).type}>
                      {getStatusInfo(selectedProduct.status).text}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Image Moderation Status</label>
                    <Badge type={getImageModerationInfo(selectedProduct.imageModerationStatus).type}>
                      {getImageModerationInfo(selectedProduct.imageModerationStatus).text}
                    </Badge>
                  </div>
                </div>

                {/* Moderation Report */}
                {selectedProduct.imageModerationNote && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Moderation Report</label>
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                      {selectedProduct.imageModerationNote}
                    </div>
                  </div>
                )}

                {/* Admin Note */}
                <div>
                  <Label>
                    <span className="text-sm font-medium">Admin Review Note (Optional)</span>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="Add a note about your decision..."
                      value={approvalNote}
                      onChange={(e) => setApprovalNote(e.target.value)}
                    />
                  </Label>
                </div>

                {/* Decision Summary */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Review Options:</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• <strong>Approve:</strong> Product will be set to "Active" and visible to customers</li>
                    <li>• <strong>Reject:</strong> Product will remain inactive and store owner will be notified</li>
                    <li>• Image moderation status can be updated separately in the detail view</li>
                  </ul>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-between w-full">
              <Button layout="outline" onClick={closeApprovalModal} disabled={isProcessing}>
                Cancel
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleProductApproval(selectedProduct._id, 'outofstock', approvalNote)}
                  disabled={isProcessing}
                  className="bg-red-500 hover:bg-red-600 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  {isProcessing ? 'Processing...' : 'Reject Product'}
                </Button>
                <Button
                  onClick={() => handleProductApproval(selectedProduct._id, 'isActive', approvalNote)}
                  disabled={isProcessing}
                  className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {isProcessing ? 'Processing...' : 'Approve Product'}
                </Button>
              </div>
            </div>
          </ModalFooter>
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <PageTitle>Product Moderation</PageTitle>

      {/* Breadcrumb */}
      <div className="flex text-gray-800 dark:text-gray-300">
        <div className="flex items-center text-purple-600">
          <Home className="w-5 h-5" />
          <NavLink exact to="/admin/dashboard" className="mx-2">
            Dashboard
          </NavLink>
        </div>
        {">"}
        <p className="mx-2">Product Moderation</p>
      </div>

      {/* Search and Quick Stats */}
      <Card className="mt-5 mb-5 shadow-md">
        <CardBody>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                className="pl-10"
                placeholder="Search products, stores, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="font-semibold text-red-600">{tabCounts.unsafe}</p>
                <p className="text-gray-500">Unsafe</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-600">{tabCounts.unchecked}</p>
                <p className="text-gray-500">Unchecked</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-yellow-600">{tabCounts.pending}</p>
                <p className="text-gray-500">Pending</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Moderation Status Tabs */}
      <Card className="mt-5 mb-5 shadow-md">
        <CardBody>
          <div className="flex border-b border-gray-200 dark:border-gray-600 overflow-x-auto">
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "all"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("all")}
            >
              <span>All Products</span>
              <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                {tabCounts.all}
              </span>
            </button>

            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "unsafe"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("unsafe")}
            >
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Unsafe Images</span>
              <span className="bg-red-200 dark:bg-red-600 text-red-700 dark:text-red-300 px-2 py-1 rounded-full text-xs">
                {tabCounts.unsafe}
              </span>
            </button>

            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "unchecked"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("unchecked")}
            >
              <Clock className="w-4 h-4 text-gray-500" />
              <span>Unchecked</span>
              <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                {tabCounts.unchecked}
              </span>
            </button>

            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "safe"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("safe")}
            >
              <Check className="w-4 h-4 text-green-500" />
              <span>Safe Images</span>
              <span className="bg-green-200 dark:bg-green-600 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs">
                {tabCounts.safe}
              </span>
            </button>

            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "pending"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              <Clock className="w-4 h-4 text-yellow-500" />
              <span>Pending Approval</span>
              <span className="bg-yellow-200 dark:bg-yellow-600 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full text-xs">
                {tabCounts.pending}
              </span>
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Filters and Sort */}
      <Card className="mb-5 shadow-md">
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-wrap gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {totalResults} products found
              </p>

              {/* Sort Dropdown */}
              <Label>
                <Select 
                  className="py-3"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="moderation_priority">Moderation Priority</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name_asc">Name A-Z</option>
                </Select>
              </Label>

              {/* Status Filter */}
              <Label>
                <Select 
                  className="py-3"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="onwait">Pending Review</option>
                  <option value="isActive">Active</option>
                </Select>
              </Label>

              {/* Results per page */}
              <Label>
                <Select
                  className="py-3"
                  value={resultsPerPage}
                  onChange={(e) => setResultsPerPage(parseInt(e.target.value))}
                >
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </Select>
              </Label>
            </div>

            <Button
              onClick={() => setView(view === "list" ? "grid" : "list")}
              aria-label="Toggle View"
              className="flex items-center gap-2"
            >
              {view === "list" ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Product List/Grid */}
      {view === "list" ? (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>Product</TableCell>
                <TableCell>Store</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Image Status</TableCell>
                <TableCell>Moderation Report</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </tr>
            </TableHeader>
            <TableBody>
              {data.map((product) => {
                const statusInfo = getStatusInfo(product.status);
                const imageModerationInfo = getImageModerationInfo(product.imageModerationStatus);
                return (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Avatar
                          className="hidden mr-4 md:block"
                          src={product.productImages?.[0]}
                          alt="Product image"
                        />
                        <div>
                          <p className="font-semibold">{product.productName}</p>
                          <p className="text-xs text-gray-500">
                            ${product.basePrice}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{product.storeId?.storeName || 'Unknown Store'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const statusInfo = getStatusInfo(product.status);
                        const StatusIcon = statusInfo.icon;
                        return (
                          <Badge type={statusInfo.type}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.text}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const imageModerationInfo = getImageModerationInfo(product.imageModerationStatus);
                        const ImageIcon = imageModerationInfo.icon;
                        return (
                          <Badge type={imageModerationInfo.type}>
                            <ImageIcon className="w-3 h-3 mr-1" />
                            {imageModerationInfo.text}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs">
                        {product.imageModerationNote ? (
                          <p className="truncate" title={product.imageModerationNote}>
                            {product.imageModerationNote}
                          </p>
                        ) : (
                          <span className="text-gray-400">No report</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="small"
                          onClick={() => openDetailView(product)}
                          aria-label="View Details"
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {product.status === 'onwait' && (
                          <Button
                            size="small"
                            onClick={() => openApprovalModal(product)}
                            aria-label="Review"
                            className="flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
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
              onChange={(p) => setPage(p)}
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <>
          {/* Grid view */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
            {data.map((product) => {
              const statusInfo = getStatusInfo(product.status);
              const imageModerationInfo = getImageModerationInfo(product.imageModerationStatus);
              return (
                <Card key={product._id} className="relative">
                  {/* Priority indicator for unsafe content */}
                  {product.imageModerationStatus === 'unsafe' && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge type="danger" className="text-xs">
                        <AlertTriangle className="w-3 h-3" />
                      </Badge>
                    </div>
                  )}
                  
                  <img
                    className="object-cover w-full h-48"
                    src={product.productImages?.[0]}
                    alt="product"
                  />
                  <CardBody>
                    <div className="mb-3">
                      <p className="font-semibold text-gray-600 dark:text-gray-300 truncate">
                        {product.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.store?.storeName || 'Unknown Store'}
                      </p>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      {(() => {
                        const statusInfo = getStatusInfo(product.status);
                        const imageModerationInfo = getImageModerationInfo(product.imageModerationStatus);
                        const StatusIcon = statusInfo.icon;
                        const ImageIcon = imageModerationInfo.icon;
                        return (
                          <>
                            <Badge type={statusInfo.type} className="text-xs">
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.text}
                            </Badge>
                            <Badge type={imageModerationInfo.type} className="text-xs">
                              <ImageIcon className="w-3 h-3 mr-1" />
                              {imageModerationInfo.text}
                            </Badge>
                          </>
                        );
                      })()}
                    </div>

                    <p className="mb-2 text-purple-500 font-bold">
                      ${product.basePrice}
                    </p>

                    {/* Moderation Note */}
                    {product.imageModerationNote && (
                      <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {product.imageModerationNote}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <Button
                        size="small"
                        onClick={() => openDetailView(product)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {product.status === 'onwait' && (
                        <Button
                          size="small"
                          onClick={() => openApprovalModal(product)}
                          className="flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Review
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          <Pagination
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
            label="Grid navigation"
            onChange={(p) => setPage(p)}
          />
        </>
      )}

      {/* Product Approval Modal - Only shown when not in detail view */}
      <Modal isOpen={isApprovalModalOpen} onClose={closeApprovalModal}>
        <ModalHeader className="flex items-center">
          <Check className="w-6 h-6 mr-3" />
          Review Product: {selectedProduct?.productName}
        </ModalHeader>
        <ModalBody>
          {selectedProduct && (
            <div className="space-y-4">
              {/* Product Summary */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
                <img 
                  src={selectedProduct.productImages?.[0]} 
                  alt="Product" 
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h4 className="font-semibold">{selectedProduct.productName}</h4>
                  <p className="text-sm text-gray-600">Store: {selectedProduct.store?.storeName}</p>
                  <p className="text-sm text-gray-600">Price: ${selectedProduct.basePrice}</p>
                </div>
              </div>

              {/* Current Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Product Status</label>
                  <Badge type={getStatusInfo(selectedProduct.status).type}>
                    {getStatusInfo(selectedProduct.status).text}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image Moderation Status</label>
                  <Badge type={getImageModerationInfo(selectedProduct.imageModerationStatus).type}>
                    {getImageModerationInfo(selectedProduct.imageModerationStatus).text}
                  </Badge>
                </div>
              </div>

              {/* Moderation Report */}
              {selectedProduct.imageModerationNote && (
                <div>
                  <label className="block text-sm font-medium mb-2">Current Moderation Report</label>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                    {selectedProduct.imageModerationNote}
                  </div>
                </div>
              )}

              {/* Admin Note */}
              <div>
                <Label>
                  <span className="text-sm font-medium">Admin Review Note (Optional)</span>
                  <Textarea
                    className="mt-1"
                    rows={3}
                    placeholder="Add a note about your decision..."
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                  />
                </Label>
              </div>

              {/* Decision Summary */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Review Options:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• <strong>Approve:</strong> Product will be set to "Active" and visible to customers</li>
                  <li>• <strong>Reject:</strong> Product will remain inactive and store owner will be notified</li>
                  <li>• Image moderation status can be updated separately in the detail view</li>
                </ul>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-between w-full">
            <Button layout="outline" onClick={closeApprovalModal} disabled={isProcessing}>
              Cancel
            </Button>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleProductApproval(selectedProduct._id, 'outofstock', approvalNote)}
                disabled={isProcessing}
                className="bg-red-500 hover:bg-red-600 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {isProcessing ? 'Processing...' : 'Reject Product'}
              </Button>
              <Button
                onClick={() => handleProductApproval(selectedProduct._id, 'isActive', approvalNote)}
                disabled={isProcessing}
                className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {isProcessing ? 'Processing...' : 'Approve Product'}
              </Button>
            </div>
          </div>
        </ModalFooter>
      </Modal>

      {/* Empty State */}
      {data.length === 0 && (
        <Card className="mb-8">
          <CardBody>
            <div className="text-center py-8">
              <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                No products found
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {searchTerm 
                  ? `No products match your search "${searchTerm}"`
                  : activeTab === "all"
                  ? "No products available."
                  : `No products with ${activeTab} status found.`}
              </p>
              {searchTerm && (
                <Button 
                  className="mt-4" 
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quick Action Summary */}
      {data.length > 0 && (
        <Card className="mt-8">
          <CardBody>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Unsafe: {data.filter(p => p.imageModerationStatus === 'unsafe').length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>Unchecked: {data.filter(p => p.imageModerationStatus === 'unchecked').length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span>Pending Review: {data.filter(p => p.status === 'onwait').length}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default AdminProductModeration;