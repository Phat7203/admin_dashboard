import { lazy } from "react";

// use lazy for better code splitting, a.k.a. load faster
const Dashboard = lazy(() => import("../pages/Dashboard"));
const SubCategory = lazy(() => import("../pages/SubCategory"));
const GlobalCategory = lazy(() => import("../pages/GlobalCategory"));
const Promotion = lazy(() => import("../pages/Promotion"));
const Rank = lazy(() => import("../pages/Rank"));
const Role = lazy(() => import("../pages/Role"));
const Store = lazy(() => import("../pages/Store"));
const StorePromotion = lazy(() => import("../pages/StorePromotion"));
const Category = lazy(() => import("../pages/Category"));
const Products = lazy(() => import("../pages/Products"));

/**
 * ⚠ These are internal routes!
 * They will be rendered inside the app, using the default `containers/Layout`.
 * If you want to add a route to, let's say, a landing page, you should add
 * it to the `App`'s router, exactly like `Login`, `CreateAccount` and other pages
 * are routed.
 *
 * If you're looking for the links rendered in the SidebarContent, go to
 * `routes/sidebar.js`
 */
const routes = [
  {
    path: "/dashboard", // the url
    component: Dashboard,
    requiredPermissions: ['manage_store']
  },
  {
    path: "/sub-categories",
    component: SubCategory,
    requiredPermissions: ['manage_subCategory']
  },
  {
    path: "/global-categories",
    component: GlobalCategory,
    requiredPermissions: ['manage_globalCategory']
  },
  {
    path: "/promotions",
    component: Promotion,
    requiredPermissions: ['manage_promotion']
  },
  {
    path: "/ranks",
    component: Rank,
    requiredPermissions: ['manage_rank']
  },
  {
    path: "/roles",
    component: Role,
    requiredPermissions: ['manage_role']
  },
  {
    path: "/stores",
    component: Store,
    requiredPermissions: ['manage_store']
  },
  {
    path: "/store-promotions",
    component: StorePromotion,
    requiredPermissions: ['manage_storePromotion']
  },
  {
    path: "/categories",
    component: Category,
    requiredPermissions: ['manage_category']
  },
  {
    path: "/products",
    component: Products,
    requiredPermissions: ['manage_product']
  }
];

export default routes;
