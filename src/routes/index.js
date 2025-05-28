import adminAppRoutes from './admin_app_routes';
import adminShopRoutes from './admin_shop_routes';
import adminAppSidebarRoutes from './admin_app_sidebar';
import adminShopSidebarRoutes from './admin_shop_sidebar';
const routes = {
  adminApp: adminAppRoutes,
  adminShop: adminShopRoutes,
  adminAppSidebar: adminAppSidebarRoutes,
  adminShopSidebar: adminShopSidebarRoutes
};

export default routes;