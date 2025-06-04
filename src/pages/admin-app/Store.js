import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableContainer,
  TableRow,
  Badge,
  Avatar,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Textarea,
  Select,
  Pagination,
} from "@windmill/react-ui";
import { EditIcon, TrashIcon, EyeIcon, AddIcon, SearchIcon } from "../../icons";
import {
  getAllStores,
  addStore,
  updateStore,
  deleteStore,
  approveStore,
} from "../../api/StoreApi";
import { getProvinces, getDistricts, getWards } from "../../api/DeliveryApi"; // Assume these APIs exist
import uploadFileToStorage from "../../firebase/upLoadFile";

const StoreManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentStore, setCurrentStore] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    status: "pending",
    provinceId: "",
    districtId: "",
    wardCode: "",
    provinceName: "",
    districtName: "",
    wardName: "",
    image: null,
    description: "",
  });
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [viewingStore, setViewingStore] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Lấy danh sách cửa hàng
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await getAllStores();
      setStores(response.data || []);
      setFilteredStores(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải cửa hàng:", error);
      setErrors({
        general: "Lỗi khi tải danh sách cửa hàng. Vui lòng thử lại.",
      });
    }
  };

  // Lấy danh sách tỉnh/thành phố
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await getProvinces();
        setProvinces(response.data || []);
      } catch (error) {
        console.error("Lỗi khi tải tỉnh/thành phố:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Lấy danh sách quận/huyện khi chọn tỉnh
  useEffect(() => {
    if (currentStore.provinceId) {
      fetchDistricts();
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [currentStore.provinceId]);
  const fetchDistricts = async (id) => {
    try {
      const response = await getDistricts(currentStore.provinceId);
      setDistricts(response.data || []);
      setWards([]); // Xóa danh sách phường khi thay đổi tỉnh
      setCurrentStore((prev) => ({
        ...prev,
        districtId: "",
        wardCode: "",
        districtName: "",
        wardName: "",
      }));
    } catch (error) {
      console.error("Lỗi khi tải quận/huyện:", error);
    }
  };

  // Lấy danh sách phường/xã khi chọn quận
  useEffect(() => {
    if (currentStore.districtId) {
      fetchWards();
    } else {
      setWards([]);
    }
  }, [currentStore.districtId]);
  
  const fetchWards = async () => {
    try {
      const response = await getWards(currentStore.districtId);
      setWards(response.data || []);
      setCurrentStore((prev) => ({ ...prev, wardCode: "", wardName: "" }));
    } catch (error) {
      console.error("Lỗi khi tải phường/xã:", error);
    }
  };

  // Lọc cửa hàng theo tab và tìm kiếm
  useEffect(() => {
    let filtered = stores;

    if (activeTab !== "all") {
      filtered = filtered.filter((store) => store.status === activeTab);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (store) =>
          store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.phoneNumber.includes(searchTerm)
      );
    }

    setFilteredStores(filtered);
    setCurrentPage(1);
  }, [activeTab, searchTerm, stores]);

  // Badge trạng thái
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "success", text: "Hoạt động" },
      pending: { color: "warning", text: "Chờ duyệt" },
      suspended: { color: "danger", text: "Tạm ngưng" },
    };
    const config = statusConfig[status] || { color: "neutral", text: status };
    return <Badge type={config.color}>{config.text}</Badge>;
  };

  // Mở modal thêm
  const openAddModal = () => {
    setModalMode("add");
    setCurrentStore({
      name: "",
      address: "",
      phoneNumber: "",
      email: "",
      status: "pending",
      provinceId: "",
      districtId: "",
      wardCode: "",
      provinceName: "",
      districtName: "",
      wardName: "",
      image: null,
      description: "",
    });
    setImageFile(null);
    setErrors({});
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = async (store) => {
    setModalMode("edit");
    setCurrentStore({
      ...store,
      provinceId: store.provinceId || "",
      districtId: store.districtId || "",
      wardCode: store.wardCode || "",
      description: store.description || "",
    });
    setImageFile(null);
    setErrors({});

    // Load districts và wards theo thứ tự đúng
    if (store.provinceId) {
      try {
        // Load districts trước
        const districtsResponse = await getDistricts(store.provinceId);
        setDistricts(districtsResponse.data || []);
        
        // Sau đó load wards nếu có districtId
        if (store.districtId) {
          const wardsResponse = await getWards(store.districtId);
          setWards(wardsResponse.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu địa chỉ:", error);
      }
    }
    setIsModalOpen(true);
  };

  // Mở modal xem chi tiết
  const handleView = (store) => {
    setViewingStore(store);
    setIsViewModalOpen(true);
  };

  // Mở modal xóa
  const handleDelete = (store) => {
    setStoreToDelete(store);
    setIsDeleteModalOpen(true);
  };

  // Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStore((prev) => {
      const updatedStore = { ...prev, [name]: value };
      // Cập nhật tên tỉnh, quận, phường
      if (name === "provinceId") {
        const province = provinces.find((p) => p.ProvinceID == value);
        updatedStore.provinceName = province ? province.ProvinceName : "";
      } else if (name === "districtId") {
        const district = districts.find((d) => d.DistrictID == value);
        updatedStore.districtName = district ? district.DistrictName : "";
      } else if (name === "wardCode") {
        const ward = wards.find((w) => w.WardCode == value);
        updatedStore.wardName = ward ? ward.WardName : "";
      }
      return updatedStore;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Xử lý thay đổi file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  // Xử lý tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!currentStore.name) newErrors.name = "Tên cửa hàng là bắt buộc";
    if (!currentStore.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(currentStore.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!currentStore.phoneNumber) {
      newErrors.phoneNumber = "Số điện thoại là bắt buộc";
    } else if (!/^\d{10}$/.test(currentStore.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải có 10 chữ số";
    } else if (!/^0/.test(currentStore.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải bắt đầu bằng 0";
    }
    if (!currentStore.address) newErrors.address = "Địa chỉ là bắt buộc";
    if (!currentStore.provinceId)
      newErrors.provinceId = "Tỉnh/Thành phố là bắt buộc";
    if (!currentStore.districtId)
      newErrors.districtId = "Quận/Huyện là bắt buộc";
    if (!currentStore.wardCode) newErrors.wardCode = "Phường/Xã là bắt buộc";
    if (modalMode === "add" && !imageFile && !currentStore.image) {
      newErrors.image = "Hình ảnh cửa hàng là bắt buộc khi thêm mới";
    }
    return newErrors;
  };

  // Lưu cửa hàng
  const handleSave = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      let imageUrl = currentStore.image;

      // Chỉ upload hình ảnh nếu có file mới
      if (imageFile instanceof File) {
        const fileUrl = URL.createObjectURL(imageFile);
        imageUrl = await uploadFileToStorage(fileUrl, "images/stores");
        URL.revokeObjectURL(fileUrl);
      }

      const storeData = {
        ...currentStore,
        image: imageUrl,
      };

      if (modalMode === "add") {
        const response = await addStore(storeData);
        setStores((prev) => [...prev, response.data]);
      } else {
        await updateStore({ id: currentStore._id, data: storeData });
        setStores((prev) =>
          prev.map((store) =>
            store._id === currentStore._id
              ? { ...storeData, _id: currentStore._id }
              : store
          )
        );
      }
      closeModal();
    } catch (error) {
      console.error("Lỗi khi lưu cửa hàng:", error);
      setErrors({ general: "Lỗi khi lưu cửa hàng. Vui lòng thử lại." });
    }
  };

  // Phê duyệt cửa hàng
  const handleApproveStore = async (storeId) => {
    try {
      await approveStore(storeId);
      fetchStores();
      setIsViewModalOpen(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi phê duyệt cửa hàng:", error);
      setErrors({ general: "Lỗi khi phê duyệt cửa hàng. Vui lòng thử lại." });
    }
  };

  // Xác nhận xóa
  const confirmDelete = async () => {
    try {
      await deleteStore(storeToDelete._id);
      setStores((prev) =>
        prev.filter((store) => store._id !== storeToDelete._id)
      );
      setIsDeleteModalOpen(false);
      setStoreToDelete(null);
    } catch (error) {
      console.error("Lỗi khi xóa cửa hàng:", error);
      setErrors({ general: "Lỗi khi xóa cửa hàng. Vui lòng thử lại." });
    }
  };

  // Phân trang
  const totalResults = filteredStores.length;
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentStores = filteredStores.slice(startIndex, endIndex);

  // Định dạng ngày
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tabs = [
    { key: "all", label: "Tất cả", count: stores.length },
    {
      key: "active",
      label: "Hoạt động",
      count: stores.filter((s) => s.status === "active").length,
    },
    {
      key: "pending",
      label: "Chờ duyệt",
      count: stores.filter((s) => s.status === "pending").length,
    },
    {
      key: "suspended",
      label: "Tạm ngưng",
      count: stores.filter((s) => s.status === "suspended").length,
    },
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">
          Quản lý cửa hàng
        </h1>
        {/* <Button
          size="regular"
          onClick={openAddModal}
          className="flex items-center space-x-2"
        >
          <AddIcon className="w-4 h-4" />
          <span>Thêm cửa hàng</span>
        </Button> */}
      </div>

      {/* Thanh tìm kiếm */}
      <div className="mb-6 relative max-w-md focus-within:text-purple-500">
        <div className="absolute inset-y-0 flex items-center pl-2">
          <SearchIcon className="w-4 h-4" aria-hidden="true" />
        </div>
        <Input
          className="pl-8"
          placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-medium text-sm transition-colors duration-200 border-b-2 ${
                activeTab === tab.key
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Bảng cửa hàng */}
      <Card className="mb-8">
        <CardBody className="px-0">
          {errors.general && (
            <p className="text-red-500 mb-4 px-4">{errors.general}</p>
          )}
          <TableContainer>
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>Cửa hàng</TableCell>
                  <TableCell>Thông tin liên hệ</TableCell>
                  <TableCell>Địa chỉ</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Đánh giá</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Hành động</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {currentStores.map((store) => (
                  <TableRow key={store._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar
                          size="small"
                          src={store.image}
                          alt={store.name}
                        />
                        <div>
                          <p className="font-medium">{store.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{store.email}</p>
                        <p className="text-sm text-gray-500">
                          {store.phoneNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{store.address}</p>
                        <p className="text-xs text-gray-500">
                          {store.wardName}, {store.districtName},{" "}
                          {store.provinceName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(store.status)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          ⭐ {store.rating || "0"}
                        </p>
                        <p className="text-xs text-gray-500">
                          ({store.reviewCount || 0} đánh giá)
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{formatDate(store.createdAt)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          layout="outline"
                          size="small"
                          onClick={() => handleView(store)}
                          aria-label="View"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          layout="outline"
                          size="small"
                          onClick={() => handleEdit(store)}
                          aria-label="Edit"
                          title="Chỉnh sửa & Phê duyệt"
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          layout="outline"
                          size="small"
                          onClick={() => handleDelete(store)}
                          aria-label="Delete"
                          title="Xóa cửa hàng"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {currentStores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan="7" className="text-center py-8">
                      <p className="text-gray-500">Không có cửa hàng nào</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Phân trang */}
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

      {/* Modal thêm/chỉnh sửa */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalHeader>
          {modalMode === "add"
            ? "Thêm Cửa Hàng Mới"
            : "Chỉnh sửa & Phê duyệt Cửa hàng"}
        </ModalHeader>
        <ModalBody className="max-h-9 overflow-y-auto">
          {errors.general && (
            <p className="text-red-500 mb-4">{errors.general}</p>
          )}
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  <span>Tên cửa hàng *</span>
                  <Input
                    name="name"
                    value={currentStore.name}
                    onChange={handleInputChange}
                    placeholder="Nhập tên cửa hàng"
                    valid={!errors.name}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </Label>
              </div>
              <div>
                <Label>
                  <span>Email *</span>
                  <Input
                    type="email"
                    name="email"
                    value={currentStore.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email"
                    valid={!errors.email}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  <span>Số điện thoại *</span>
                  <Input
                    name="phoneNumber"
                    value={currentStore.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                    valid={!errors.phoneNumber}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                  )}
                </Label>
              </div>
              <div>
                <Label>
                  <span>Trạng thái</span>
                  <Select
                    name="status"
                    value={currentStore.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Chờ duyệt</option>
                    <option value="active">Hoạt động</option>
                    <option value="suspended">Tạm ngưng</option>
                  </Select>
                </Label>
              </div>
            </div>
            <div>
              <Label>
                <span>Địa chỉ chi tiết *</span>
                <Input
                  name="address"
                  value={currentStore.address}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ chi tiết"
                  valid={!errors.address}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">{errors.address}</p>
                )}
              </Label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>
                  <span>Tỉnh/Thành phố *</span>
                  <Select
                    name="provinceId"
                    value={currentStore.provinceId}
                    onChange={handleInputChange}
                    valid={!errors.provinceId}
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((province) => (
                      <option
                        key={province.ProvinceID}
                        value={province.ProvinceID}
                      >
                        {province.ProvinceName}
                      </option>
                    ))}
                  </Select>
                  {errors.provinceId && (
                    <p className="text-red-500 text-sm">{errors.provinceId}</p>
                  )}
                </Label>
              </div>
              <div>
                <Label>
                  <span>Quận/Huyện *</span>
                  <Select
                    name="districtId"
                    value={currentStore.districtId}
                    onChange={handleInputChange}
                    valid={!errors.districtId}
                    disabled={!currentStore.provinceId}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((district) => (
                      <option
                        key={district.DistrictID}
                        value={district.DistrictID}
                      >
                        {district.DistrictName}
                      </option>
                    ))}
                  </Select>
                  {errors.districtId && (
                    <p className="text-red-500 text-sm">{errors.districtId}</p>
                  )}
                </Label>
              </div>
              <div>
                <Label>
                  <span>Phường/Xã *</span>
                  <Select
                    name="wardCode"
                    value={currentStore.wardCode}
                    onChange={handleInputChange}
                    valid={!errors.wardCode}
                    disabled={!currentStore.districtId}
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards.map((ward) => (
                      <option key={ward.WardCode} value={ward.WardCode}>
                        {ward.WardName}
                      </option>
                    ))}
                  </Select>
                  {errors.wardCode && (
                    <p className="text-red-500 text-sm">{errors.wardCode}</p>
                  )}
                </Label>
              </div>
            </div>
            <div>
              <Label>
                <span>
                  Hình ảnh cửa hàng {modalMode === "add" ? "*" : "(tùy chọn)"}
                </span>
                <Input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  valid={!errors.image}
                />
                {errors.image && (
                  <p className="text-red-500 text-sm">{errors.image}</p>
                )}
              </Label>
              {(imageFile || currentStore.image) && (
                <div className="mt-2">
                  <img
                    src={
                      imageFile
                        ? URL.createObjectURL(imageFile)
                        : currentStore.image
                    }
                    alt="Store Preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div>
              <Label>
                <span>Mô tả</span>
                <Textarea
                  rows={3}
                  name="description"
                  value={currentStore.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả cửa hàng"
                />
              </Label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-end space-x-2">
            <Button layout="outline" onClick={closeModal}>
              Hủy
            </Button>
            {modalMode === "edit" && currentStore.status === "pending" && (
              <Button onClick={() => handleApproveStore(currentStore._id)}>
                Phê duyệt
              </Button>
            )}
            <Button onClick={handleSave}>
              {modalMode === "add" ? "Thêm Mới" : "Cập nhật"}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <ModalHeader>Chi tiết cửa hàng</ModalHeader>
        <ModalBody className="max-h-[80vh] overflow-y-auto">
          {viewingStore && (
            <div className="space-y-4 p-4">
              <div className="flex items-center space-x-4">
                <Avatar
                  size="large"
                  src={viewingStore.image}
                  alt={viewingStore.name}
                />
                <div>
                  <h3 className="text-lg font-semibold">{viewingStore.name}</h3>
                  {getStatusBadge(viewingStore.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email:</p>
                  <p className="text-sm">{viewingStore.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Số điện thoại:
                  </p>
                  <p className="text-sm">{viewingStore.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Đánh giá:</p>
                  <p className="text-sm">
                    ⭐ {viewingStore.rating || "0"} (
                    {viewingStore.reviewCount || 0} đánh giá)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Ngày tạo:</p>
                  <p className="text-sm">
                    {formatDate(viewingStore.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Cập nhật cuối:
                  </p>
                  <p className="text-sm">
                    {formatDate(viewingStore.updatedAt)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Địa chỉ:</p>
                <p className="text-sm">{viewingStore.address}</p>
                <p className="text-sm text-gray-500">
                  {viewingStore.wardName}, {viewingStore.districtName},{" "}
                  {viewingStore.provinceName}
                </p>
              </div>
              {viewingStore.description && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Mô tả:</p>
                  <p className="text-sm">{viewingStore.description}</p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsViewModalOpen(false)}>Đóng</Button>
            {viewingStore?.status === "pending" && (
              <Button onClick={() => handleApproveStore(viewingStore._id)}>
                Phê duyệt
              </Button>
            )}
          </div>
        </ModalFooter>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <ModalHeader>Xác Nhận Xóa</ModalHeader>
        <ModalBody className="max-h-[80vh] overflow-y-auto">
          <p>
            Bạn có chắc chắn muốn xóa cửa hàng{" "}
            <strong>{storeToDelete?.name}</strong> không? Hành động này không
            thể hoàn tác.
          </p>
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-end space-x-2">
            <Button
              layout="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={confirmDelete}>Xóa</Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default StoreManagement;
