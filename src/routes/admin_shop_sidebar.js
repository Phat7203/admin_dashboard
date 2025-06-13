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
    icon: "TruckIcon",
    name: "Products",
    requiredPermissions: ['manage_product'],
    routes: [
      {
        path: "/app/products",
        name: "All Products",
        requiredPermissions: ['manage_product'],
      },
      {
        path: "/app/add-product",
        name: "Add Product",
        requiredPermissions: ['manage_product'],
      },
    ],
  },
  {
    path: '/app/store-settings',
    icon: 'HomeIcon',
    name: 'Store Settings',
    requiredPermissions: ['manage_store']
  },
  {
    path: '/app/chat',
    icon: 'ChatIcon',
    name: 'Chat with Customer',
    requiredPermissions: ['chat_with_customer']
  }
];
export default adminShopSidebarRoutes;