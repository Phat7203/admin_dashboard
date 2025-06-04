import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Textarea,
  Badge,
  Card,
  CardBody,
  Select,
  Avatar,
} from "@windmill/react-ui";

import {
  EditIcon,
  AddIcon,
  TrashIcon,
  TruckIcon,
  GithubIcon,
  EyeIcon,
  ChatIcon,
} from "../../icons/index";
import { getAllRankRule } from "../../api/RankRuleApi";
import {
  getAllPromotions,
  updatePromotion,
  deletePromotion,
  addPromotion,
} from "../../api/PromotionApi";
import uploadFileToStorage from "../../firebase/upLoadFile";

const PromotionManagement = () => {
  // Dữ liệu mẫu
  const [promotions, setPromotions] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentPromotion, setCurrentPromotion] = useState({
    promotionName: "",
    promotionDetails: "",
    rate: 0,
    maxDiscount: "",
    minimumOrder: 0,
    promotionImage: null,
    backgroundImage: null,
    quantity: 0,
    usageLimit: "",
    remainingUses: "",
    isActive: true,
    useAbleUserRank: "Bronze",
    type: "product_discount",
    startDate: "",
    endDate: "",
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewPromotion, setViewPromotion] = useState(null);
  const [imageFiles, setImageFiles] = useState({
    promotionImage: null,
    backgroundImage: null,
  });
  const [errors, setErrors] = useState({});

  // Fetch promotions and ranks on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [promotionResponse, rankResponse] = await Promise.all([
          getAllPromotions(),
          getAllRankRule(),
        ]);
        setPromotions(promotionResponse.data.data);
        setRanks(rankResponse.data);
        // Set default useAbleUserRank to the first rank if available
        if (rankResponse.data.length > 0) {
          setCurrentPromotion((prev) => ({
            ...prev,
            useAbleUserRank: rankResponse.data[0].rank,
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const fetDataPromotion = async () => {
    try {
      const promotionResponse = await getAllPromotions();
      setPromotions(promotionResponse.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Promotion types
  const typeOptions = [
    { value: "product_discount", label: "Giảm giá sản phẩm" },
    { value: "shipping_discount", label: "Giảm phí vận chuyển" },
  ];

  // Filter promotions by tab
  const getFilteredPromotions = () => {
    const now = new Date();
    switch (activeTab) {
      case "upcoming":
        return promotions.filter((p) => {
          const start = new Date(p.startDate);
          return p.isActive && start > now;
        });
      case "active":
        return promotions.filter((p) => {
          const start = new Date(p.startDate);
          const end = new Date(p.endDate);
          return p.isActive && start <= now && end >= now;
        });
      case "ended":
        return promotions.filter((p) => {
          const end = new Date(p.endDate);
          return end < now || !p.isActive;
        });
      default:
        return promotions;
    }
  };

  // Open add modal
  const openAddModal = () => {
    setModalMode("add");
    setCurrentPromotion({
      promotionName: "",
      promotionDetails: "",
      rate: 0,
      maxDiscount: "",
      minimumOrder: 0,
      promotionImage: null,
      backgroundImage: null,
      quantity: 0,
      usageLimit: "",
      remainingUses: "",
      isActive: true,
      useAbleUserRank: ranks[0]?.rank || "Bronze",
      type: "product_discount",
      startDate: "",
      endDate: "",
    });
    setImageFiles({ promotionImage: null, backgroundImage: null });
    setErrors({});
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (promotion) => {
    setModalMode("edit");
    setCurrentPromotion({
      ...promotion,
      startDate: new Date(promotion.startDate).toISOString().slice(0, 16),
      endDate: new Date(promotion.endDate).toISOString().slice(0, 16),
      maxDiscount: promotion.maxDiscount || "",
      usageLimit: promotion.usageLimit || "",
      remainingUses: promotion.remainingUses || "",
      isActive: promotion.isActive || false,
    });
    setImageFiles({ promotionImage: null, backgroundImage: null });
    setErrors({});
    setIsModalOpen(true);
  };

  // Open view modal
  const openViewModal = (promotion) => {
    setViewPromotion(promotion);
    setIsViewModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentPromotion((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["rate", "minimumOrder", "quantity"].includes(name)
          ? parseFloat(value) || 0
          : ["maxDiscount", "usageLimit", "remainingUses"].includes(name)
          ? value === ""
            ? ""
            : parseFloat(value) || 0
          : value,
    }));
    // Clear error for the field
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle file change
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setImageFiles((prev) => ({ ...prev, [name]: files[0] }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!currentPromotion.promotionName)
      newErrors.promotionName = "Tên khuyến mãi là bắt buộc";
    if (!currentPromotion.promotionDetails)
      newErrors.promotionDetails = "Mô tả chi tiết là bắt buộc";
    if (!currentPromotion.type) newErrors.type = "Loại khuyến mãi là bắt buộc";
    if (
      !currentPromotion.rate ||
      currentPromotion.rate < 0 ||
      currentPromotion.rate > 100
    ) {
      newErrors.rate = "Tỷ lệ giảm phải từ 0 đến 100";
    }
    if (!currentPromotion.startDate)
      newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    if (!currentPromotion.endDate)
      newErrors.endDate = "Ngày kết thúc là bắt buộc";
    if (
      new Date(currentPromotion.startDate) > new Date(currentPromotion.endDate)
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    if (modalMode === "add" && !imageFiles.promotionImage) {
      newErrors.promotionImage = "Hình ảnh khuyến mãi là bắt buộc khi thêm mới";
    }
    return newErrors;
  };

  // Save promotion
  const handleSave = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      let promotionImageUrl = currentPromotion.promotionImage;
      let backgroundImageUrl = currentPromotion.backgroundImage;

      // Upload images to Firebase if provided
      if (imageFiles.promotionImage) {
        const fileUrl1 = URL.createObjectURL(imageFiles.promotionImage);
        promotionImageUrl = await uploadFileToStorage(
          fileUrl1,
          "images/promotions"
        );
        URL.revokeObjectURL(fileUrl1);
      }
      if (imageFiles.backgroundImage) {
        const fileUrl2 = URL.createObjectURL(imageFiles.backgroundImage);
        backgroundImageUrl = await uploadFileToStorage(
          fileUrl2,
          "images/promotions"
        );
        URL.revokeObjectURL(fileUrl2);
      }

      const promotionData = {
        ...currentPromotion,
        maxDiscount: currentPromotion.maxDiscount
          ? parseFloat(currentPromotion.maxDiscount)
          : null,
        usageLimit: currentPromotion.usageLimit
          ? parseInt(currentPromotion.usageLimit)
          : null,
        remainingUses: currentPromotion.usageLimit
          ? parseInt(currentPromotion.usageLimit)
          : null,
        promotionImage: promotionImageUrl,
        backgroundImage: backgroundImageUrl,
        startDate: new Date(currentPromotion.startDate).toISOString(),
        endDate: new Date(currentPromotion.endDate).toISOString(),
        isActive: currentPromotion.isActive,
      };
      if (modalMode === "add") {
        await addPromotion(promotionData);
      } else {
        await updatePromotion({
          id: currentPromotion._id,
          data: promotionData,
        });
      }
      fetDataPromotion();
      closeModal();
    } catch (error) {
      console.error("Error saving promotion:", error);
      setErrors({ general: "Lỗi khi lưu khuyến mãi. Vui lòng thử lại." });
    }
  };

  // Hàm xóa
  const handleDelete = (promotion) => {
    setPromotionToDelete(promotion);
    setIsDeleteModalOpen(true);
  };

  // Delete promotion
  const confirmDelete = async () => {
    try {
      await deletePromotion(promotionToDelete._id);
      setPromotions(promotions.filter((p) => p._id !== promotionToDelete._id));
      setIsDeleteModalOpen(false);
      setPromotionToDelete(null);
    } catch (error) {
      console.error("Error deleting promotion:", error);
    }
  };

  // Hàm format tiền tệ
  const formatCurrency = (amount) => {
    if (amount === 0) return "Không giới hạn";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Hàm format ngày
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Hàm lấy trạng thái khuyến mãi
  const getPromotionStatus = (promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (!promotion.isActive) return { text: "Đã tắt", color: "neutral" };
    if (end < now) return { text: "Đã kết thúc", color: "danger" };
    if (start > now) return { text: "Sắp diễn ra", color: "warning" };
    return { text: "Đang diễn ra", color: "success" };
  };

  // Hàm lấy icon loại khuyến mãi
  const getTypeIcon = (type) => {
    return type === "product_discount" ? (
      <ChatIcon className="w-4 h-4" />
    ) : (
      <TruckIcon className="w-4 h-4" />
    );
  };

  const filteredPromotions = getFilteredPromotions();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">
          Quản Lý Khuyến Mãi
        </h1>
        <p className="text-gray-500 mt-1">
          Quản lý các chương trình khuyến mãi trong hệ thống
        </p>
      </div>
      <Card className="mb-6">
        <CardBody>
          <div className="flex justify-between items-center">
            <div className="flex space-x-1 mb-6">
              <Button
                size="small"
                layout={activeTab === "all" ? "primary" : "outline"}
                onClick={() => setActiveTab("all")}
              >
                Tất cả ({promotions.length})
              </Button>
              <Button
                size="small"
                layout={activeTab === "upcoming" ? "primary" : "outline"}
                onClick={() => setActiveTab("upcoming")}
              >
                Sắp diễn ra {activeTab === "upcoming" && (`(` + getFilteredPromotions().length + `)`)}
              </Button>
              <Button
                size="small"
                layout={activeTab === "active" ? "primary" : "outline"}
                onClick={() => setActiveTab("active")}
              >
                Đang diễn ra {activeTab === "active" && (`(` + getFilteredPromotions().length + `)`)}
              </Button>
              <Button
                size="small"
                layout={activeTab === "ended" ? "primary" : "outline"}
                onClick={() => setActiveTab("ended")}
              >
                Đã kết thúc { activeTab === "ended" && (`(` + getFilteredPromotions().length + `)`)}
              </Button>
            </div>
            <Button
              size="regular"
              onClick={openAddModal}
              className="flex items-center space-x-2"
            >
              <AddIcon className="w-4 h-4" />
              <span>Thêm danh mục</span>
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardBody>
          <TableContainer>
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>Tên Khuyến Mãi</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Giảm Giá</TableCell>
                  <TableCell>Hạng Áp Dụng</TableCell>
                  <TableCell>Thời Gian</TableCell>
                  <TableCell>Trạng Thái</TableCell>
                  <TableCell>Đã Sử Dụng</TableCell>
                  <TableCell>Thao Tác</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredPromotions.map((promotion) => {
                  const status = getPromotionStatus(promotion);
                  return (
                    <TableRow key={promotion._id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold">
                            {promotion.promotionName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getTypeIcon(promotion.type)}
                          <span className="ml-2 text-sm">
                            {promotion.type === "product_discount"
                              ? "Sản phẩm"
                              : "Vận chuyển"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{promotion.rate}%</p>
                          <p className="text-xs text-gray-500">
                            Tối đa: {formatCurrency(promotion.maxDiscount)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge type="neutral">
                          {promotion.useAbleUserRank || "Không giới hạn"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(promotion.startDate)}</p>
                          <p className="text-gray-500">
                            đến {formatDate(promotion.endDate)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge type={status.color}>{status.text}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {promotion.usageLimit ? (
                            <span>
                              {promotion.usageLimit -
                                (promotion.remainingUses || 0)}
                              /{promotion.usageLimit}
                            </span>
                          ) : (
                            <span>Không giới hạn</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="small"
                            layout="outline"
                            onClick={() => openViewModal(promotion)}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="small"
                            layout="outline"
                            onClick={() => openEditModal(promotion)}
                          >
                            <EditIcon className="w-4 h-4" />
                          </Button>
                          {activeTab == "upcoming" && (
                            <Button
                            size="small"
                            layout="outline"
                            onClick={() => handleDelete(promotion)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredPromotions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan="8" className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <GithubIcon className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">Không có khuyến mãi nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Modal Thêm/Sửa */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalHeader>
          {modalMode === "add" ? "Thêm Khuyến Mãi Mới" : "Chỉnh Sửa Khuyến Mãi"}
        </ModalHeader>
        <ModalBody className="max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  <span>Tên Khuyến Mãi *</span>
                  <Input
                    className="mt-1"
                    name="promotionName"
                    value={currentPromotion.promotionName}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Black Friday Sale"
                  />
                  {errors.promotionName && (
                    <p className="text-red-500 text-sm">
                      {errors.promotionName}
                    </p>
                  )}
                </Label>
              </div>

              <div>
                <Label>
                  <span>Loại Khuyến Mãi *</span>
                  <Select
                    className="mt-1"
                    name="type"
                    value={currentPromotion.type}
                    onChange={handleInputChange}
                  >
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-sm">{errors.type}</p>
                  )}
                </Label>
              </div>
            </div>
            {/* Phần hiển thị các ảnh và chọn  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  <span>
                    Hình Ảnh Khuyến Mãi {modalMode === "add" ? "*" : ""}
                  </span>
                  <Input
                    type="file"
                    className="mt-1"
                    name="promotionImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    valid={!errors.promotionImage}
                  />
                  {errors.promotionImage && (
                    <p className="text-red-500 text-sm">
                      {errors.promotionImage}
                    </p>
                  )}
                </Label>
                {(imageFiles.promotionImage ||
                  currentPromotion.promotionImage) && (
                  <div className="mt-2">
                    <img
                      src={
                        imageFiles.promotionImage
                          ? URL.createObjectURL(imageFiles.promotionImage)
                          : currentPromotion.promotionImage
                      }
                      alt="Promotion Preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label>
                  <span>Hình Nền</span>
                  <Input
                    type="file"
                    className="mt-1"
                    name="backgroundImage"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Label>
                {(imageFiles.backgroundImage ||
                  currentPromotion.backgroundImage) && (
                  <div className="mt-2">
                    <img
                      src={
                        imageFiles.backgroundImage
                          ? URL.createObjectURL(imageFiles.backgroundImage)
                          : currentPromotion.backgroundImage
                      }
                      alt="Background Preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>
                <span>Mô Tả Chi Tiết *</span>
                <Textarea
                  className="mt-1"
                  name="promotionDetails"
                  value={currentPromotion.promotionDetails}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết về chương trình khuyến mãi"
                  rows="3"
                />
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>
                  <span>Tỷ Lệ Giảm (%) *</span>
                  <Input
                    className="mt-1"
                    type="number"
                    name="rate"
                    value={currentPromotion.rate}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </Label>
              </div>

              <div>
                <Label>
                  <span>Giảm Tối Đa (VND)</span>
                  <Input
                    className="mt-1"
                    type="number"
                    name="maxDiscount"
                    value={currentPromotion.maxDiscount}
                    onChange={handleInputChange}
                    placeholder="Không giới hạn"
                  />
                </Label>
              </div>

              <div>
                <Label>
                  <span>Đơn Hàng Tối Thiểu (VND)</span>
                  <Input
                    className="mt-1"
                    type="number"
                    name="minimumOrder"
                    value={currentPromotion.minimumOrder}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>
                  <span>Số Lượng Voucher</span>
                  <Input
                    className="mt-1"
                    type="number"
                    name="quantity"
                    value={currentPromotion.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </Label>
              </div>

              <div>
                <Label>
                  <span>Giới Hạn Sử Dụng</span>
                  <Input
                    className="mt-1"
                    type="number"
                    name="usageLimit"
                    value={currentPromotion.usageLimit}
                    onChange={handleInputChange}
                    placeholder="Không giới hạn"
                  />
                </Label>
              </div>

              <div>
                <Label>
                  <span>Hạng Áp Dụng</span>
                  <Select
                    className="mt-1"
                    name="useAbleUserRank"
                    value={currentPromotion.useAbleUserRank}
                    onChange={handleInputChange}
                  >
                    {ranks.map((option) => (
                      <option key={option._id} value={option.rank}>
                        {option.rank}
                      </option>
                    ))}
                  </Select>
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  <span>Ngày Bắt Đầu *</span>
                  <Input
                    className="mt-1"
                    type="datetime-local"
                    name="startDate"
                    value={currentPromotion.startDate}
                    onChange={handleInputChange}
                  />
                </Label>
              </div>

              <div>
                <Label>
                  <span>Ngày Kết Thúc *</span>
                  <Input
                    className="mt-1"
                    type="datetime-local"
                    name="endDate"
                    value={currentPromotion.endDate}
                    onChange={handleInputChange}
                  />
                  {errors.endDate && (
                    <span className="text-red-500">{errors.endDate}</span>
                  )}
                </Label>
              </div>
            </div>

            <div>
              <Label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={currentPromotion.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>Kích hoạt khuyến mãi</span>
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
            <Button onClick={handleSave}>
              {modalMode === "add" ? "Thêm Mới" : "Cập Nhật"}
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={closeModal}>
              Hủy
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" onClick={handleSave}>
              {modalMode === "add" ? "Thêm Mới" : "Cập Nhật"}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

            {/* Modal Xem Chi Tiết */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <ModalHeader>Chi Tiết Khuyến Mãi</ModalHeader>
        <ModalBody>
          {viewPromotion && (
            <div className="space-y-4">
              {/* Background Image */}
              {viewPromotion.backgroundImage && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Hình nền khuyến mãi</p>
                  <div 
                    className="w-full h-32 bg-cover bg-center rounded-lg"
                    style={{ backgroundImage: `url(${viewPromotion.backgroundImage})` }}
                  />
                </div>
              )}

              <div>
                {viewPromotion.promotionImage && (
                  <p className="text-sm text-gray-500 mb-2">Hình ảnh khuyến mãi</p>
                )}
                <div className="flex items-start gap-4">
                  {/* Promotion Image */}
                  {viewPromotion.promotionImage && (
                    <div className="flex-shrink-0">
                      <img
                        src={viewPromotion.promotionImage}
                        alt={viewPromotion.promotionName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {viewPromotion.promotionName}
                    </h3>
                    <p className="text-gray-600">
                      {viewPromotion.promotionDetails}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Loại khuyến mãi</p>
                  <p className="font-medium">
                    {viewPromotion.type === "product_discount"
                      ? "Giảm giá sản phẩm"
                      : "Giảm phí vận chuyển"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tỷ lệ giảm</p>
                  <p className="font-medium">{viewPromotion.rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giảm tối đa</p>
                  <p className="font-medium">
                    {viewPromotion.maxDiscount
                      ? formatCurrency(viewPromotion.maxDiscount)
                      : "Không giới hạn"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Đơn hàng tối thiểu</p>
                  <p className="font-medium">
                    {formatCurrency(viewPromotion.minimumOrder)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hạng áp dụng</p>
                  <p className="font-medium">{viewPromotion.useAbleUserRank}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <Badge type={getPromotionStatus(viewPromotion).color}>
                    {getPromotionStatus(viewPromotion).text}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Thời gian hiệu lực</p>
                <p className="font-medium">
                  {formatDate(viewPromotion.startDate)} -{" "}
                  {formatDate(viewPromotion.endDate)}
                </p>
              </div>

              {viewPromotion.usageLimit && (
                <div>
                  <p className="text-sm text-gray-500">Tình trạng sử dụng</p>
                  <p className="font-medium">
                    Đã sử dụng:{" "}
                    {viewPromotion.usageLimit -
                      (viewPromotion.remainingUses || 0)}
                    /{viewPromotion.usageLimit}
                  </p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setIsViewModalOpen(false)}>Đóng</Button>
        </ModalFooter>
      </Modal>

      {/* Modal Xác Nhận Xóa */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <ModalHeader>Xác Nhận Xóa</ModalHeader>
        <ModalBody>
          <p>
            Bạn có chắc chắn muốn xóa khuyến mãi{" "}
            <strong>{promotionToDelete?.promotionName}</strong> không? Hành động
            này không thể hoàn tác.
          </p>
        </ModalBody>
        <ModalFooter>
          <div className="hidden sm:block">
            <Button
              layout="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Hủy
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button onClick={confirmDelete}>Xóa</Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button
              block
              size="large"
              layout="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Hủy
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" onClick={confirmDelete}>
              Xóa
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PromotionManagement;
