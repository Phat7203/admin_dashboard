const adminAppSidebarRoutes = [
  {
    path: '/app/dashboard',
    icon: 'HomeIcon',
    name: 'Dashboard'
  },
  {
    icon: 'HomeIcon',
    name: 'Categories',
    routes: [
      {
        path: '/app/sub-categories',
        name: 'Sub Categories',
        icon: 'HomeIcon'
      },
      {
        path: '/app/global-categories',
        name: 'Global Categories',
        icon: 'HomeIcon'
      },
    ],
  },
  {
    path: '/app/promotions-app',
    icon: 'HomeIcon',
    name: 'System Promotions'
  },
  {
    path: '/app/ranks',
    icon: 'HomeIcon',
    name: 'Ranks'
  },
  {
    path: '/app/roles',
    icon: 'HomeIcon', 
    name: 'Roles'
  },
  {
    path: '/app/stores-app',
    icon: 'HomeIcon',
    name: 'Stores Management'
  }
];
export default adminAppSidebarRoutes;