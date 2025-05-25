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
  },
  
  // Admin App Menu Items
  {
    icon: 'CategoryIcon',
    name: 'Categories',
    routes: [
      {
        path: '/app/sub-categories',
        name: 'Sub Categories',
      },
      {
        path: '/app/global-categories',
        name: 'Global Categories',
      },
    ],
  },
  {
    path: '/app/promotions',
    icon: 'PromotionIcon',
    name: 'Promotions',
  },
  {
    path: '/app/ranks',
    icon: 'RankIcon',
    name: 'Ranks',
  },
  {
    path: '/app/roles',
    icon: 'RoleIcon',
    name: 'Roles',
  },
  {
    path: '/app/stores',
    icon: 'StoreIcon',
    name: 'Stores',
  },

  // Admin Shop Menu Items
  {
    path: '/app/store-promotions',
    icon: 'PromotionIcon',
    name: 'Store Promotions',
  },
  {
    path: '/app/categories',
    icon: 'CategoryIcon',
    name: 'Categories',
  },
  {
    path: '/app/products',
    icon: 'ProductIcon',
    name: 'Products',
  }
];

export default routes;
