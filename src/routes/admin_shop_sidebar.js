const adminShopSidebarRoutes = [
  {
    path: "/app/dashboard-shop",
    icon: "HomeIcon",
    name: "Tổng quan",
    requiredPermissions: ["manage_store"],
  },
  {
    path: "/app/store-promotions",
    icon: "MoneyIcon",
    name: "Quản lý khuyến mãi",
    requiredPermissions: ["manage_storePromotion"],
  },
  {
    path: "/app/categories",
    icon: "StoreIcon",
    name: "Doanh mục",
    requiredPermissions: ["manage_category"],
  },
  {
    icon: "PagesIcon",
    name: "Sản phẩm",
    requiredPermissions: ["manage_product"],
    routes: [
      {
        path: "/app/products",
        name: "Tất cả sản phẩm",
        requiredPermissions: ["manage_product"],
      },
      {
        path: "/app/add-product",
        name: "Thêm sản phẩm",
        requiredPermissions: ["manage_product"],
      },
    ],
  },
  {
    icon: "PeopleIcon",
    name: "Quản lý nhân viên",
    requiredPermissions: ["manage_staff"],
    routes: [
      {
        path: "/app/manage-staff",
        name: "Nhân viên",
        requiredPermissions: ["manage_staff"],
      },
      {
        path: "/app/manage-permissions",
        name: "Phân quyền",
        requiredPermissions: ["manage_permissions"],
      },
    ],
  },
  {
    path: "/app/chat",
    icon: "ChatIcon",
    name: "Nhắn tin với khách hàng",
    requiredPermissions: ["chat_with_customer"],
  },
  {
    path: "/app/order",
    icon: "TruckIcon",
    name: "Đơn hàng",
    requiredPermissions: ["manage_order"],
  },
];
export default adminShopSidebarRoutes;
