import { lazy } from "react";

// use lazy for better code splitting, a.k.a. load faster
const Dashboard = lazy(() => import("../pages/Dashboard"));
const StorePromotion = lazy(() => import("../pages/StorePromotion"));
const Category = lazy(() => import("../pages/Category"));
const Products = lazy(() => import("../pages/Products"));
const SingleProduct = lazy(() => import("../pages/SingleProduct"));
const Chats = lazy(() => import("../pages/Chats"));
const AddProduct = lazy(() => import("../pages/AddProduct"));
const EditProduct = lazy(() => import("../pages/EditProduct"));
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
    requiredPermissions: ["manage_product"],
  },
];

export default adminShopRoutes;
