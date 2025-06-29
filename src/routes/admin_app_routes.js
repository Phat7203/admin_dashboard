import { name } from "faker/lib/locales/az";
import { lazy } from "react";
const Dashboard = lazy(() => import("../pages/admin-app/Dashboard"));
const SubCategory = lazy(() => import("../pages/admin-app/SubCategory"));
const GlobalCategory = lazy(() => import("../pages/admin-app/GlobalCategory"));
const Promotion = lazy(() => import("../pages/admin-app/Promotion"));
const Rank = lazy(() => import("../pages/admin-app/Rank"));
const Role = lazy(() => import("../pages/admin-app/Role"));
const Store = lazy(() => import("../pages/admin-app/Store"));
const Product = lazy(() => import("../pages/admin-app/Product"));
const Order = lazy(() => import("../pages/admin-app/Order"));
const OrderDetail = lazy(() => import("../pages/admin-app/OrderDetail"));
const Profile = lazy(() => import("../pages/Profile"));
const Review = lazy(() => import("../pages/admin-app/Review"))
const Analytics = lazy(() => import("../pages/admin-app/Analytics"));
const adminAppRoutes = [
  {
    path: "/dashboard",
    component: Dashboard,
    name: 'Tổng quan',
    icon: 'HomeIcon'
  },
  {
    path: "/sub-categories", 
    component: SubCategory,
    name: 'Danh mục cấp 2',
    icon: 'HomeIcon'
  },
  {
    path: "/global-categories",
    component: GlobalCategory,
    name: 'Danh mục cấp 1', 
    icon: 'HomeIcon'
  },
  {
    path: "/promotions-app",
    component: Promotion,
    name: 'Chương trình khuyến mãi',
    icon: 'HomeIcon'
  },
  {
    path: "/ranks",
    component: Rank,
    name: 'Xếp hạng thành viên',
    icon: 'HomeIcon'
  },
  {
    path: "/stores-app",
    component: Store,
    name: 'Cửa hàng',
    icon: 'StoreIcon'
  },
  {
    path: "/products-app",
    component: Product,
    name: 'Quản lý sản phẩm',
    icon: 'TruckIcon'
  },
  {
    path: "/orders-app",
    component: Order,
    name: 'Quản lý đơn hàng',
    icon: 'TruckIcon'
  },
  {
    path: "/orders-app/:orderId",
    component: OrderDetail,
    name: 'Quản lý đơn hàng',
    icon: 'TruckIcon'
  },
  {
  path: "/manage-profile",
  component: Profile,
  name: 'Quản lý tài khoản',
  icon: 'UserIcon'
  },
  {
  path: "/manage-review",
  component: Review,
  name: 'Quản lý đánh giá',
  icons: 'StartIcon'
  },
  {
    path: "/analytics",
    component: Analytics,
    name: 'Thống kê xu hướng',
    icon: 'HeartIcon',

  }
];

export default adminAppRoutes;