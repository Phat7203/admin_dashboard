import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  TableRow,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Textarea,
  Card,
  CardBody,
  Badge,
  Pagination,
} from '@windmill/react-ui';
import { EditIcon, AddIcon, TrashIcon, EyeIcon, SearchIcon } from '../../icons/index';
import { getGlobalCategory, addGlobalCategory, updateGlobalCategory, deleteGlobalCategory } from '../../api/GlobalCategory';
import uploadFileToStorage from '../../firebase/upLoadFile';

const GlobalCategory = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    description: ''
  });
  const [errors, setErrors] = useState({});

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const response = await getGlobalCategory();
      setCategories(response.data || []);
      setFilteredCategories(response.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh mục:', error);
      setErrors({ fetch: 'Lỗi khi lấy danh mục' });
    }
  };

  // Lọc danh mục dựa trên tìm kiếm
  useEffect(() => {
    let filtered = categories;
    if (searchTerm) {
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description &&
            category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [searchTerm, categories]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên danh mục là bắt buộc';
    if (!editingCategory && !formData.image) newErrors.image = 'Hình ảnh là bắt buộc khi thêm mới';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý gửi form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let imageUrl = editingCategory ? editingCategory.image : '';

      // Chỉ upload hình ảnh nếu formData.image là File
      if (formData.image instanceof File) {
        const fileUrl = URL.createObjectURL(formData.image);
        imageUrl = await uploadFileToStorage(fileUrl, 'images/globalCategory');
        URL.revokeObjectURL(fileUrl);
      }

      const categoryData = {
        name: formData.name,
        image: imageUrl,
        description: formData.description
      };

      if (editingCategory) {
        // Cập nhật danh mục
        await updateGlobalCategory(editingCategory._id, categoryData);
      } else {
        // Thêm danh mục mới
        await addGlobalCategory(categoryData);
      }

      await fetchCategories();
      closeModal();
    } catch (error) {
      console.error('Lỗi khi gửi danh mục:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi gửi dữ liệu' });
    }
  };

  // Xử lý xóa
  const handleDelete = async () => {
    if (deletingCategory) {
      try {
        await deleteGlobalCategory(deletingCategory._id);
        await fetchCategories();
        setIsDeleteModalOpen(false);
        setDeletingCategory(null);
      } catch (error) {
        console.error('Lỗi khi xóa danh mục:', error);
        setErrors({ delete: 'Lỗi khi xóa danh mục' });
      }
    }
  };

  // Xử lý thay đổi input
  const handleNameChange = (e) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleDescriptionChange = (e) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  };

  // Xử lý thay đổi file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  // Xử lý tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Mở modal thêm/chỉnh sửa
  const openModal = (category = null) => {
    setEditingCategory(category);
    setFormData(category ? {
      name: category.name || '',
      image: null,
      description: category.description || ''
    } : {
      name: '',
      image: null,
      description: ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Mở modal xem chi tiết
  const openViewModal = (category) => {
    setViewingCategory(category);
    setIsViewModalOpen(true);
  };

  // Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', image: null, description: '' });
    setErrors({});
  };

  // Mở modal xác nhận xóa
  const openDeleteModal = (category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  // Định dạng ngày
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Danh mục Toàn cầu</h1>
        <p className="text-gray-600">Quản lý các danh mục sản phẩm trong hệ thống</p>
      </div>

      {/* Action Bar */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <Badge type="primary">Tổng số: {categories.length}</Badge>
              <div className="relative w-96 max-w-md focus-within:text-purple-500">
                <div className="absolute inset-y-0 flex items-center pl-2">
                  <SearchIcon className="w-4 h-4" aria-hidden="true" />
                </div>
                <Input
                  className="pl-8"
                  placeholder="Tìm kiếm theo tên hoặc mô tả..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <Button
              size="regular"
              onClick={() => openModal()}
              className="flex items-center space-x-2"
            >
              <AddIcon className="w-4 h-4" />
              <span>Thêm danh mục</span>
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Thông báo lỗi */}
      {errors.fetch && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{errors.fetch}</div>
      )}
      {errors.submit && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{errors.submit}</div>
      )}
      {errors.delete && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{errors.delete}</div>
      )}

      {/* Bảng danh mục */}
      <Card>
        <CardBody>
          <TableContainer className="mb-4">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>Hình ảnh</TableCell>
                  <TableCell>Tên danh mục</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Cập nhật</TableCell>
                  <TableCell>Thao tác</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {currentCategories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <img
                        src={category.image || 'https://via.placeholder.com/40'}
                        alt={category.name}
                        className="w-12 h-10 rounded object-cover md:block"
                        loading="lazy"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <div>
                          <p className="font-semibold">{category.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {category.description ? (
                          category.description.length > 50
                            ? `${category.description.substring(0, 50)}...`
                            : category.description
                        ) : (
                          <span className="text-gray-400 italic">Chưa có mô tả</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(category.createdAt)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(category.updatedAt)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          layout="outline"
                          size="small"
                          onClick={() => openViewModal(category)}
                          aria-label="View"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Button>
                        <Button
                          layout="outline"
                          size="small"
                          onClick={() => openModal(category)}
                          aria-label="Edit"
                          title="Chỉnh sửa"
                        >
                          <EditIcon className="w-5 h-5" />
                        </Button>
                        <Button
                          layout="outline"
                          size="small"
                          onClick={() => openDeleteModal(category)}
                          aria-label="Delete"
                          title="Xóa"
                        >
                          <TrashIcon className="w-5 h-5 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Phân trang */}
          {totalPages > 1 && (
            <TableFooter>
              <Pagination
                totalResults={filteredCategories.length}
                resultsPerPage={itemsPerPage}
                onChange={setCurrentPage}
                label="Điều hướng trang"
              />
            </TableFooter>
          )}
        </CardBody>
      </Card>

      {/* Modal thêm/chỉnh sửa */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalHeader>
          {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label>
                <span>Tên danh mục *</span>
                <Input
                  className="mt-1"
                  placeholder="Nhập tên danh mục"
                  value={formData.name}
                  onChange={handleNameChange}
                  valid={!errors.name}
                />
              </Label>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label>
                <span>Hình ảnh {editingCategory ? '(tùy chọn)' : '*'}</span>
                <Input
                  type="file"
                  className="mt-1"
                  accept="image/*"
                  onChange={handleFileChange}
                  valid={!errors.image}
                />
              </Label>
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
              )}
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>
              )}
              {editingCategory && !formData.image && editingCategory.image && (
                <div className="mt-2">
                  <img
                    src={editingCategory.image}
                    alt="Current"
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>
                <span>Mô tả</span>
                <Textarea
                  className="mt-1"
                  rows="3"
                  placeholder="Nhập mô tả cho danh mục"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                />
              </Label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="hidden sm:block">
            <Button layout="outline" onClick={closeModal}>
              Hủy
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button onClick={handleSubmit}>
              {editingCategory ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={closeModal}>
              Hủy
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" onClick={handleSubmit}>
              {editingCategory ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <ModalHeader>Chi tiết danh mục</ModalHeader>
        <ModalBody>
          {viewingCategory && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={viewingCategory.image || 'https://via.placeholder.com/80'}
                  alt={viewingCategory.name}
                  className="w-20 h-20 rounded object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold">{viewingCategory.name}</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Ngày tạo:</p>
                  <p className="text-sm">{formatDate(viewingCategory.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Cập nhật cuối:</p>
                  <p className="text-sm">{formatDate(viewingCategory.updatedAt)}</p>
                </div>
              </div>
              {viewingCategory.description && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Mô tả:</p>
                  <p className="text-sm">{viewingCategory.description}</p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setIsViewModalOpen(false)}>Đóng</Button>
        </ModalFooter>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalHeader>Xác nhận xóa</ModalHeader>
        <ModalBody>
          <p>
            Bạn có chắc chắn muốn xóa danh mục{' '}
            <strong>"{deletingCategory?.name}"</strong>?
          </p>
          <p className="text-red-500 text-sm mt-2">
            Hành động này không thể hoàn tác!
          </p>
        </ModalBody>
        <ModalFooter>
          <div className="hidden sm:block">
            <Button layout="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Hủy
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button onClick={handleDelete}>
              Xóa
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Hủy
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" onClick={handleDelete}>
              Xóa
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default GlobalCategory;