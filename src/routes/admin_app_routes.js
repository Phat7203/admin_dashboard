import { lazy } from "react";
const Dashboard = lazy(() => import("../pages/admin-app/Dashboard"));
const SubCategory = lazy(() => import("../pages/admin-app/SubCategory"));
const GlobalCategory = lazy(() => import("../pages/admin-app/GlobalCategory"));
const Promotion = lazy(() => import("../pages/admin-app/Promotion"));
const Rank = lazy(() => import("../pages/admin-app/Rank"));
const Role = lazy(() => import("../pages/admin-app/Role"));
const Store = lazy(() => import("../pages/admin-app/Store"));

const adminAppRoutes = [
  {
    path: "/dashboard",
    component: Dashboard,
    name: 'Dashboard',
    icon: 'HomeIcon'
  },
  {
    path: "/sub-categories", 
    component: SubCategory,
    name: 'Sub Categories',
    icon: 'HomeIcon'
  },
  {
    path: "/global-categories",
    component: GlobalCategory,
    name: 'Global Categories', 
    icon: 'HomeIcon'
  },
  {
    path: "/promotions-app",
    component: Promotion,
    name: 'Promotions',
    icon: 'HomeIcon'
  },
  {
    path: "/ranks",
    component: Rank,
    name: 'Ranks',
    icon: 'HomeIcon'
  },
  {
    path: "/roles",
    component: Role,
    name: 'Roles',
    icon: 'HomeIcon'
  },
  {
    path: "/stores-app",
    component: Store,
    name: 'Stores',
    icon: 'HomeIcon'
  }
];

export default adminAppRoutes;