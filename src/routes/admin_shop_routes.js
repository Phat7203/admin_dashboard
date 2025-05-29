import { lazy } from "react";

// use lazy for better code splitting, a.k.a. load faster
const Dashboard = lazy(() => import("../pages/Dashboard"));
const StorePromotion = lazy(() => import("../pages/StorePromotion"));
const Category = lazy(() => import("../pages/Category"));
const Products = lazy(() => import("../pages/Products"));

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
    path: "/products",
    component: Products,
    name: "Products",
    icon: "HomeIcon",
    requiredPermissions: ["manage_product"],
  },
];

export default adminShopRoutes;
