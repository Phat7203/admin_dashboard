const adminShopSidebarRoutes = [
  {
    path: '/app/dashboard-shop',
    icon: 'HomeIcon',
    name: 'Dashboard',
    requiredPermissions: ['manage_store']
  },
  {
    path: '/app/store-promotions',
    icon: 'HomeIcon',
    name: 'Store Promotions',
    requiredPermissions: ['manage_storePromotion']
  },
  {
    path: '/app/categories',
    icon: 'HomeIcon',
    name: 'Categories',
    requiredPermissions: ['manage_category']
  },
  {
    path: '/app/products',
    icon: 'HomeIcon',
    name: 'Products',
    requiredPermissions: ['manage_product']
  },
  {
    path: '/app/store-settings',
    icon: 'HomeIcon',
    name: 'Store Settings',
    requiredPermissions: ['manage_store']
  }
];
export default adminShopSidebarRoutes;