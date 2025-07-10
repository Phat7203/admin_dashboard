import { lazy } from "react";

// use lazy for better code splitting, a.k.a. load faster
const Blank = lazy(() => import("../pages/Blank"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const StorePromotion = lazy(() => import("../pages/StorePromotion"));
const Category = lazy(() => import("../pages/Category"));
const Products = lazy(() => import("../pages/Products"));
const SingleProduct = lazy(() => import("../pages/SingleProduct"));
const Chats = lazy(() => import("../pages/Chats"));
const AddProduct = lazy(() => import("../pages/AddProduct"));
const EditProduct = lazy(() => import("../pages/EditProduct"));
const Orders = lazy(() => import("../pages/Orders"));
const Profile = lazy(() => import("../pages/Profile"));
const OrderDetailPage = lazy(() => import("../pages/OrderDetail"));
const ManageStaff = lazy(() => import("../pages/ManageStaff"));
const ManagePermission = lazy(() => import("../pages/ManagePermission"));
const StoreManagement = lazy(() => import("../pages/ManageStore"));
const adminShopRoutes = [
  {
    path: "/dashboard-shop",
    component: Dashboard,
    name: "Dashboard",
    icon: "HomeIcon",
    requiredPermissions: ["manage_store"],
  },
  {
    path: "/store-promotions",
    component: StorePromotion,
    name: "Store Promotions",
    icon: "HomeIcon",
    requiredPermissions: ["manage_storePromotion"],
  },
  {
    path: "/categories",
    component: Category,
    name: "Categories",
    icon: "HomeIcon",
    requiredPermissions: ["manage_category"],
  },
  {
    path: "/chat",
    component: Chats,
    name: "ChatWithCustomer",
    icon: "HomeIcon",
    requiredPermissions: ["chat_with_customer"],
  },
  {
    path: "/products",
    component: Products,
    name: "Products",
    icon: "HomeIcon",
    requiredPermissions: ["manage_product"],
  },
  {
    path: "/add-product",
    component: AddProduct,
    name: "Products",
    icon: "HomeIcon",
    requiredPermissions: ["manage_product"],
  },
  {
    path: "/products/:id",
    component: SingleProduct,
    name: "SingleProducts",
    icon: "HomeIcon",
    requiredPermissions: ["manage_product"],
  },
  {
    path: "/edit-product/:id",
    component: EditProduct,
    icon: "HomeIcon",
    name: "Edit Product",
    requiredPermissions: ["manage_product"],
  },
  {
    path: "/order",
    component: Orders,
    icon: "HomeIcon",
    name: "Orders",
    requiredPermissions: ["manage_order"],
  },
  {
    path: "/order/:orderId",
    component: OrderDetailPage,
    name: "Order Detail",
    icon: "StartIcon",
    requiredPermissions: ["manage_order"],
  },
  {
    path: "/manage-profile",
    component: Profile,
    name: "Manage Profile",
    icon: "HomeIcon",
    requiredPermissions: ["profile_view"],
  },
  {
    path: "/manage-profile",
    component: Profile,
    name: "Manage Store",
    icon: "HomeIcon",
    requiredPermissions: ["manage_store"],
  },
  {
    path: "/manage-staff",
    component: ManageStaff,
    icon: "GroupIcon",
    name: "Manage Staff",
    requiredPermissions: ["manage_staff"],
  },
  {
    path: "/manage-permissions",
    component: ManagePermission,
    name: "Manage Permissions",
    icon: "UserIcon",
    requiredPermissions: ["manage_permissions"],
  },
  {
    path: "/manage-store",
    component: StoreManagement,
    name: "Manage Store",
    requiredPermissions: ["manage_store"],
  },
];

export default adminShopRoutes;
