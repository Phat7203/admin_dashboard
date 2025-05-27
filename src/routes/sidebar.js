/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 */
const routes = [
  {
    path: '/app/dashboard',
    icon: 'HomeIcon',
    name: 'Dashboard',
    requiredPermissions: ['manage_store']
  },
  {
    icon: 'HomeIcon',
    name: 'Categories',
    routes: [
      {
        path: '/app/sub-categories',
        name: 'Sub Categories',
        icon: 'HomeIcon',
        requiredPermissions: ['manage_subCategory']
      },
      {
        path: '/app/global-categories',
        name: 'Global Categories',
        icon: 'HomeIcon',
        requiredPermissions: ['manage_globalCategory']
      },
    ],
  },
  {
    path: '/app/promotions',
    icon: 'HomeIcon',
    name: 'Promotions',
    requiredPermissions: ['manage_promotions']
  },
  {
    path: '/app/ranks',
    icon: 'HomeIcon',
    name: 'Ranks',
    requiredPermissions: ['manage_ranks']
  },
  {
    path: '/app/roles',
    icon: 'HomeIcon', 
    name: 'Roles',
    requiredPermissions: ['manage_roles']
  },
  {
    path: '/app/stores',
    icon: 'HomeIcon',
    name: 'Stores',
    requiredPermissions: ['manage_stores']
  },

  // Admin Shop Menu Items
  {
    path: '/app/store-promotions',
    icon: 'HomeIcon',
    name: 'Store Promotions',
    requiredPermissions: ['manage_store_promotions']
  },
  {
    path: '/app/categories',
    icon: 'HomeIcon',
    name: 'Categories',
    requiredPermissions: ['manage_categories']
  },
  {
    path: '/app/products',
    icon: 'HomeIcon',
    name: 'Products',
    requiredPermissions: ['manage_products']
  }
];

export default routes;
