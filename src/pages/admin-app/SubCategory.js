import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Textarea,
  Select,
  Pagination,
  Badge,
} from "@windmill/react-ui";
import { EditIcon, TrashIcon, EyeIcon, AddIcon, SearchIcon } from "../../icons";
import { getGlobalCategory } from "../../api/GlobalCategory";
import uploadFileToStorage from "../../firebase/upLoadFile";
import {
  getSubCategory,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../../api/SubCategory"; // Assuming these are the API functions

const SubCategoryManagement = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [globalCategories, setGlobalCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [viewingSubCategory, setViewingSubCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGlobalCategory, setSelectedGlobalCategory] = useState("");
  const [error, setError] = useState(null);

  // Fetch global categories and subcategories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch global categories
        const globalCategoriesResponse = await getGlobalCategory();
        setGlobalCategories(globalCategoriesResponse.data || []);

        // Fetch subcategories
        const subCategoriesResponse = await getSubCategory();
        setSubCategories(subCategoriesResponse.data || []);

        setFilteredSubCategories(subCategoriesResponse.data || []);
      } catch (err) {
        setError("Failed to fetch data: " + err.message);
      }
    };
    fetchData();
  }, []);

  // Filter subcategories based on search and global category
  useEffect(() => {
    let filtered = subCategories;

    if (selectedGlobalCategory) {
      filtered = filtered.filter(
        (sub) => sub.globalCategoryId._id === selectedGlobalCategory
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.globalCategoryId.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubCategories(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedGlobalCategory, subCategories]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = (subCategory) => {
    setEditingSubCategory({ ...subCategory });
    setIsModalOpen(true);
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEditingSubCategory((prev) => ({ ...prev, image: file }));
  };

  const handleView = (subCategory) => {
    setViewingSubCategory(subCategory);
    setIsViewModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSubCategory({
      name: "",
      description: "",
      image: null,
      commissionFee: 0,
      globalCategoryId: "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      let imageUrl = editingSubCategory.image;

      // Chỉ upload hình ảnh nếu image là đối tượng File
      if (editingSubCategory.image instanceof File) {
        const fileUrl = URL.createObjectURL(editingSubCategory.image);
        imageUrl = await uploadFileToStorage(fileUrl, "images/subCategory");
        URL.revokeObjectURL(fileUrl);
      }

      const subCategoryData = {
        name: editingSubCategory.name,
        description: editingSubCategory.description,
        image: imageUrl,
        commissionFee: editingSubCategory.commissionFee,
        globalCategoryId: editingSubCategory.globalCategoryId,
        updatedAt: new Date().toISOString(),
      };

      if (editingSubCategory._id) {
        // Update existing subcategory
        await updateSubCategory({id: editingSubCategory._id, data: subCategoryData});
        setSubCategories((prev) =>
          prev.map((sub) =>
            sub._id === editingSubCategory._id ? subCategoryData : sub
          )
        );
      } else {
        // Add new subcategory
        const response = await addSubCategory({
          ...subCategoryData,
          createdAt: new Date().toISOString(),
        });
        setSubCategories((prev) => [...prev, response.data]);
      }
      setIsModalOpen(false);
      setEditingSubCategory(null);
    } catch (err) {
      setError("Failed to save subcategory: " + err.message);
    }
  };

  const handleDelete = async (subCategoryId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục con này?")) {
      try {
        await deleteSubCategory(subCategoryId);
        setSubCategories((prev) =>
          prev.filter((sub) => sub._id !== subCategoryId)
        );
      } catch (err) {
        setError("Failed to delete subcategory: " + err.message);
      }
    }
  };

  const handleChangeSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingSubCategory((prev) => ({ ...prev, [name]: value }));
  };

  // Pagination
  const totalResults = filteredSubCategories.length;
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentSubCategories = filteredSubCategories.slice(
    startIndex,
    endIndex
  );

  // Stats
  const totalSubCategories = subCategories.length;
  const averageCommission =
    subCategories.length > 0
      ? (
          subCategories.reduce((sum, sub) => sum + sub.commissionFee, 0) /
          subCategories.length
        ).toFixed(2)
      : 0;

  return (
    <div className="container mx-auto px-6 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Danh mục con</h1>
        <p className="text-gray-600">Quản lý các danh mục con trong hệ thống</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div/>
        <Button onClick={handleAdd} className="flex items-center">
          <AddIcon className="w-4 h-4 mr-2" />
          Thêm danh mục con
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardBody className="flex items-center">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-600">
                Tổng danh mục con
              </p>
              <p className="text-lg font-semibold text-gray-700">
                {totalSubCategories}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-600">
                Phí hoa hồng trung bình
              </p>
              <p className="text-lg font-semibold text-gray-700">
                {averageCommission}%
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-600">
                Danh mục cha
              </p>
              <p className="text-lg font-semibold text-gray-700">
                {globalCategories.length}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative w-full max-w-xl mr-6 focus-within:text-purple-500">
          <div className="absolute inset-y-0 flex items-center pl-2">
            <SearchIcon className="w-4 h-4" aria-hidden="true" />
          </div>
          <Input
            className="pl-8"
            placeholder="Tìm kiếm theo tên, mô tả..."
            value={searchTerm}
            onChange={handleChangeSearch}
          />
        </div>
        <Select
          value={selectedGlobalCategory}
          onChange={(e) => setSelectedGlobalCategory(e.target.value)}
        >
          <option value="">Tất cả danh mục cha</option>
          {globalCategories.map((gc) => (
            <option key={gc._id} value={gc._id}>
              {gc.name}
            </option>
          ))}
        </Select>
      </div>

      {/* SubCategory Table */}
      <Card className="mb-8">
        <CardBody className="px-0">
          <TableContainer>
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>Hình ảnh</TableCell>
                  <TableCell>Tên danh mục</TableCell>
                  <TableCell>Danh mục cha</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Phí hoa hồng</TableCell>
                  <TableCell>Hành động</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {currentSubCategories.map((subCategory) => (
                  <TableRow key={subCategory._id}>
                    <TableCell>
                      <div className="flex items-center">
                        <img
                          src={
                            subCategory.image ||
                            "https://via.placeholder.com/40"
                          }
                          alt={subCategory.name}
                          className="w-10 h-10 rounded object-cover"
                          loading="lazy"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{subCategory.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge type="neutral">
                        {subCategory.globalCategoryId.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {subCategory.description || "Chưa có mô tả"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">
                        {subCategory.commissionFee}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          layout="outline"
                          size="small"
                          onClick={() => handleView(subCategory)}
                          aria-label="View"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          layout="outline"
                          size="small"
                          onClick={() => handleEdit(subCategory)}
                          aria-label="Edit"
                          title="Chỉnh sửa"
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          layout="outline"
                          size="small"
                          onClick={() => handleDelete(subCategory._id)}
                          aria-label="Delete"
                          title="Xóa"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalResults > resultsPerPage && (
            <div className="px-4 py-3 border-t">
              <Pagination
                totalResults={totalResults}
                resultsPerPage={resultsPerPage}
                label="Điều hướng trang"
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader>
          {editingSubCategory?._id
            ? "Chỉnh sửa danh mục con"
            : "Thêm danh mục con mới"}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label>
                <span>Tên danh mục con *</span>
                <Input
                  name="name"
                  value={editingSubCategory?.name || ""}
                  onChange={handleInputChange}
                  placeholder="Nhập tên danh mục con"
                />
              </Label>
            </div>

            <div>
              <Label>
                <span>Danh mục cha *</span>
                <Select
                  name="globalCategoryId"
                  value={editingSubCategory?.globalCategoryId._id || ""}
                  onChange={handleInputChange}
                  placeholder="Chọn danh mục cha"
                >
                  <option value="">Chọn danh mục cha</option>
                  {globalCategories.map((gc) => (
                    <option key={gc._id} value={gc._id}>
                      {gc.name}
                    </option>
                  ))}
                </Select>
              </Label>
            </div>

            <div>
              <Label>
                <span>Mô tả</span>
                <Textarea
                  rows={3}
                  name="description"
                  value={editingSubCategory?.description || ""}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả danh mục con"
                />
              </Label>
            </div>

            <div>
              <Label>
                <span>Hình ảnh {editingSubCategory ? "" : "*"}</span>
                <Input
                  type="file"
                  className="mt-1"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Label>
              {editingSubCategory?.image && (
                <div className="mt-2">
                  <img
                    src={
                      editingSubCategory.image instanceof File
                        ? URL.createObjectURL(editingSubCategory.image)
                        : editingSubCategory.image
                    }
                    alt="Current"
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>
                <span>Phí hoa hồng (%)</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  name="commissionFee"
                  value={editingSubCategory?.commissionFee || 0}
                  onChange={handleInputChange}
                  placeholder="Nhập phí hoa hồng"
                />
              </Label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-end space-x-2">
            <Button layout="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {editingSubCategory?._id ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <ModalHeader>Chi tiết danh mục con</ModalHeader>
        <ModalBody>
          {viewingSubCategory && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={
                    viewingSubCategory.image || "https://via.placeholder.com/80"
                  }
                  alt={viewingSubCategory.name}
                  className="w-20 h-20 rounded object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold">
                    {viewingSubCategory.name}
                  </h3>
                  <Badge type="neutral">
                    {viewingSubCategory.globalCategoryName}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Phí hoa hồng:
                  </p>
                  <p className="text-sm font-semibold text-green-600">
                    {viewingSubCategory.commissionFee}%
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Ngày tạo:</p>
                  <p className="text-sm">
                    {formatDate(viewingSubCategory.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Cập nhật cuối:
                  </p>
                  <p className="text-sm">
                    {formatDate(viewingSubCategory.updatedAt)}
                  </p>
                </div>
              </div>

              {viewingSubCategory.description && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Mô tả:</p>
                  <p className="text-sm">{viewingSubCategory.description}</p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setIsViewModalOpen(false)}>Đóng</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default SubCategoryManagement;
