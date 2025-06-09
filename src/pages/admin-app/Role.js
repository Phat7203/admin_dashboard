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
  Card,
  CardBody,
  Badge,
  Pagination,
  HelperText
} from '@windmill/react-ui';
import { EditIcon, AddIcon, TrashIcon, PeopleIcon, ForbiddenIcon } from '../../icons/index';
const RoleManagement = () => {
  const [roles, setRoles] = useState([
    {
      _id: '682cf22c7d2a6f720e274fa3',
      name: 'admin_app',
      displayName: 'Quản trị viên hệ thống',
      permissions: [
        'manage_subCategory',
        'manage_globalCategory',
        'manage_promotion',
        'manage_rank',
        'manage_role',
        'manage_store',
        'manage_product'
      ],
      createdAt: '2025-05-20T21:20:44.941Z',
      updatedAt: '2025-05-20T21:20:44.941Z'
    },
    {
      _id: '682cf22c7d2a6f720e274fa4',
      name: 'store_manager',
      displayName: 'Quản lý cửa hàng',
      permissions: [
        'manage_store',
        'manage_product',
        'view_promotion'
      ],
      createdAt: '2025-05-19T14:30:20.123Z',
      updatedAt: '2025-05-19T14:30:20.123Z'
    },
    {
      _id: '682cf22c7d2a6f720e274fa5',
      name: 'content_manager',
      displayName: 'Quản lý nội dung',
      permissions: [
        'manage_globalCategory',
        'manage_subCategory',
        'manage_promotion'
      ],
      createdAt: '2025-05-18T09:15:30.456Z',
      updatedAt: '2025-05-18T09:15:30.456Z'
    }
  ]);

  // Danh sách tất cả quyền có thể có trong hệ thống
  const allPermissions = [
    { key: 'manage_subCategory', label: 'Quản lý danh mục con', category: 'Danh mục' },
    { key: 'manage_globalCategory', label: 'Quản lý danh mục toàn cầu', category: 'Danh mục' },
    { key: 'manage_promotion', label: 'Quản lý khuyến mãi', category: 'Khuyến mãi' },
    { key: 'manage_rank', label: 'Quản lý xếp hạng', category: 'Hệ thống' },
    { key: 'manage_role', label: 'Quản lý quyền', category: 'Hệ thống' },
    { key: 'manage_store', label: 'Quản lý cửa hàng', category: 'Cửa hàng' },
    { key: 'manage_product', label: 'Quản lý sản phẩm', category: 'Sản phẩm' },
    { key: 'view_analytics', label: 'Xem báo cáo', category: 'Báo cáo' },
    { key: 'manage_user', label: 'Quản lý người dùng', category: 'Người dùng' },
    { key: 'view_promotion', label: 'Xem khuyến mãi', category: 'Khuyến mãi' }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deletingRole, setDeletingRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    permissions: []
  });
  const [errors, setErrors] = useState({});

  const itemsPerPage = 5;
  const totalPages = Math.ceil(roles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoles = roles.slice(startIndex, endIndex);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên quyền là bắt buộc';
    if (!formData.displayName.trim()) newErrors.displayName = 'Tên hiển thị là bắt buộc';
    if (formData.permissions.length === 0) newErrors.permissions = 'Phải chọn ít nhất một quyền';
    
    // Kiểm tra tên quyền đã tồn tại (trừ khi đang edit)
    const existingRole = roles.find(role => 
      role.name.toLowerCase() === formData.name.toLowerCase() && 
      role._id !== editingRole?._id
    );
    if (existingRole) {
      newErrors.name = 'Tên quyền đã tồn tại';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingRole) {
      // Update role
      setRoles(prev => prev.map(role => 
        role._id === editingRole._id 
          ? { ...role, ...formData, updatedAt: new Date().toISOString() }
          : role
      ));
    } else {
      // Add new role
      const newRole = {
        _id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRoles(prev => [newRole, ...prev]);
    }

    closeModal();
  };

  // Handle delete
  const handleDelete = () => {
    if (deletingRole) {
      setRoles(prev => prev.filter(role => role._id !== deletingRole._id));
      setIsDeleteModalOpen(false);
      setDeletingRole(null);
    }
  };

  // Open modal for add/edit
  const openModal = (role = null) => {
    setEditingRole(role);
    setFormData(role ? {
      name: role.name,
      displayName: role.displayName,
      permissions: [...role.permissions]
    } : {
      name: '',
      displayName: '',
      permissions: []
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setFormData({ name: '', displayName: '', permissions: [] });
    setErrors({});
  };

  // Open delete confirmation
  const openDeleteModal = (role) => {
    setDeletingRole(role);
    setIsDeleteModalOpen(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle permission toggle
  const togglePermission = (permissionKey) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionKey)
        ? prev.permissions.filter(p => p !== permissionKey)
        : [...prev.permissions, permissionKey]
    }));
  };

  // Group permissions by category
  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    const category = permission.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  // Get permission label
  const getPermissionLabel = (permissionKey) => {
    const permission = allPermissions.find(p => p.key === permissionKey);
    return permission ? permission.label : permissionKey;
  };

  // Get role badge color based on permissions count
  const getRoleBadgeColor = (permissionsCount) => {
    if (permissionsCount >= 6) return 'success';
    if (permissionsCount >= 3) return 'warning';
    return 'primary';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Quyền Người dùng</h1>
        <p className="text-gray-600">Quản lý các vai trò và quyền hạn trong hệ thống</p>
      </div>

      {/* Action Bar */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Badge type="primary">Tổng số vai trò: {roles.length}</Badge>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ForbiddenIcon className="w-4 h-4" />
                <span>Tổng số quyền: {allPermissions.length}</span>
              </div>
            </div>
            <Button 
              size="regular"
              onClick={() => openModal()}
              className="flex items-center space-x-2"
            >
              <AddIcon className="w-4 h-4" />
              <span>Thêm vai trò</span>
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardBody>
          <TableContainer className="mb-4">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>Tên vai trò</TableCell>
                  <TableCell>Tên hiển thị</TableCell>
                  <TableCell>Quyền hạn</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Cập nhật</TableCell>
                  <TableCell>Thao tác</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {currentRoles.map((role) => (
                  <TableRow key={role._id}>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <PeopleIcon className="w-5 h-5 mr-2 text-gray-500" />
                        <div>
                          <p className="font-semibold text-gray-800">{role.name}</p>
                          <p className="text-xs text-gray-500">ID: {role._id.slice(-8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-700">{role.displayName}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge type={getRoleBadgeColor(role.permissions.length)}>
                          {role.permissions.length} quyền
                        </Badge>
                        {role.permissions.slice(0, 2).map((permission, index) => (
                          <Badge key={index} type="neutral" className="text-xs">
                            {getPermissionLabel(permission)}
                          </Badge>
                        ))}
                        {role.permissions.length > 2 && (
                          <Badge type="neutral" className="text-xs">
                            +{role.permissions.length - 2} khác
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(role.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(role.updatedAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          layout="link"
                          size="small"
                          onClick={() => openModal(role)}
                          aria-label="Edit"
                        >
                          <EditIcon className="w-5 h-5" />
                        </Button>
                        <Button
                          layout="link"
                          size="small"
                          onClick={() => openDeleteModal(role)}
                          aria-label="Delete"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <TableFooter>
              <Pagination
                totalResults={roles.length}
                resultsPerPage={itemsPerPage}
                onChange={setCurrentPage}
                label="Điều hướng trang"
              />
            </TableFooter>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalHeader>
          {editingRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label>
                <span>Tên vai trò *</span>
                <Input
                  className="mt-1"
                  placeholder="Ví dụ: admin_app, store_manager"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  valid={!errors.name}
                />
              </Label>
              {errors.name && (
                <HelperText valid={false}>{errors.name}</HelperText>
              )}
            </div>

            <div>
              <Label>
                <span>Tên hiển thị *</span>
                <Input
                  className="mt-1"
                  placeholder="Ví dụ: Quản trị viên hệ thống"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  valid={!errors.displayName}
                />
              </Label>
              {errors.displayName && (
                <HelperText valid={false}>{errors.displayName}</HelperText>
              )}
            </div>

            <div>
              <Label>
                <span>Quyền hạn *</span>
              </Label>
              {errors.permissions && (
                <HelperText valid={false}>{errors.permissions}</HelperText>
              )}
              <div className="mt-2 space-y-4 max-h-64 overflow-y-auto border rounded p-3">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-gray-700 mb-2 border-b pb-1">
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {permissions.map((permission) => (
                        <label key={permission.key} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.key)}
                            onChange={() => togglePermission(permission.key)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Đã chọn: {formData.permissions.length} quyền
              </div>
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
              {editingRole ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={closeModal}>
              Hủy
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" onClick={handleSubmit}>
              {editingRole ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalHeader>Xác nhận xóa vai trò</ModalHeader>
        <ModalBody>
          <div className="space-y-3">
            <p>
              Bạn có chắc chắn muốn xóa vai trò{' '}
              <strong>"{deletingRole?.displayName}"</strong>?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-yellow-800 text-sm">
                <strong>Lưu ý:</strong> Việc xóa vai trò có thể ảnh hưởng đến người dùng đang sử dụng vai trò này.
              </p>
            </div>
            <p className="text-red-500 text-sm">
              Hành động này không thể hoàn tác!
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="hidden sm:block">
            <Button layout="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Hủy
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button onClick={handleDelete}>
              Xóa vai trò
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Hủy
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" onClick={handleDelete}>
              Xóa vai trò
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default RoleManagement;