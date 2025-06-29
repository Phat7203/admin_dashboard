import React from "react";
const shippingStatuses = [
  { status: "order_created", description: "Đơn hàng đã được tạo." },
  { status: "picking", description: "Nhân viên đang lấy hàng" },
  { status: "picked", description: "Nhân viên đã lấy hàng" },
  { status: "transporting", description: "Đang luân chuyển hàng" },
  { status: "delivered", description: "Nhân viên đã giao hàng thành công" },
  { status: "delivery_fail", description: "Nhân viên giao hàng thất bại" },
  { status: "return_transporting", description: "Đang luân chuyển hàng trả" },
  { status: "damage", description: "Hàng bị hư hỏng" },
  { status: "cancel", description: "Hủy đơn hàng" },
  { status: "delivering", description: "Nhân viên đang giao cho người nhận" },
  { status: "money_collect_delivering", description: "Nhân viên đang thu tiền người nhận" },
  { status: "returning", description: "Nhân viên đang đi trả hàng" },
  { status: "return_fail", description: "Nhân viên trả hàng thất bại" },
  { status: "returned", description: "Nhân viên trả hàng thành công" },
  { status: "exception", description: "Đơn hàng ngoại lệ không nằm trong quy trình" },
  { status: "lost", description: "Hàng bị mất" },
  { status: "ready_to_pick", description: "Mới tạo đơn hàng" },
  { status: "money_collect_picking", description: "Đang thu tiền người gửi" },
  { status: "storing", description: "Hàng đang nằm ở kho" },
  { status: "sorting", description: "Đang phân loại hàng hóa" },
  { status: "waiting_to_return", description: "Đang đợi trả hàng về cho người gửi" },
  { status: "return", description: "Trả hàng" },
  { status: "return_sorting", description: "Đang phân loại hàng trả" }
];
export const getShippingStatusDescription = (status) => {
  const shippingStatus = shippingStatuses.find((s) => s.status === status);
  return shippingStatus ? shippingStatus.description : "Trạng thái không xác định";
}