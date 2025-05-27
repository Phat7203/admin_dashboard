/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 */
//Chú đổi lại Icon thì cần phải thêm vào icon mới vào, do nó cần đường dẫn chính xác
const routes = [
  {
    path: '/app/dashboard',
    icon: 'HomeIcon',
    name: 'Dashboard',
  },
  
  // Admin App Menu Items
  {
    icon: 'HomeIcon',
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
    icon: 'HomeIcon',
    name: 'Promotions',
  },
  {
    path: '/app/ranks',
    icon: 'HomeIcon',
    name: 'Ranks',
  },
  {
    path: '/app/roles',
    icon: 'HomeIcon',
    name: 'Roles',
  },
  {
    path: '/app/stores',
    icon: 'HomeIcon',
    name: 'Stores',
  },

  // Admin Shop Menu Items
  {
    path: '/app/store-promotions',
    icon: 'HomeIcon',
    name: 'Store Promotions',
  },
  {
    path: '/app/categories',
    icon: 'HomeIcon',
    name: 'Categories',
  },
  {
    path: '/app/products',
    icon: 'HomeIcon',
    name: 'Products',
  }
];

export default routes;
