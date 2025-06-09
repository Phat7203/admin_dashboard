const adminAppSidebarRoutes = [
  {
    path: '/app/dashboard',
    icon: 'HomeIcon',
    name: 'Tổng quan'
  },
  {
    icon: 'MenuIcon',
    name: 'Danh mục',
    routes: [
      {
        path: '/app/sub-categories',
        name: 'Danh mục cấp 2',
        icon: 'HomeIcon'
      },
      {
        path: '/app/global-categories',
        name: 'Danh mục cấp 1',
        icon: 'HomeIcon'
      },
    ],
  },
  {
    path: '/app/promotions-app',
    icon: 'MoneyIcon',
    name: 'Chương trình khuyến mãi'
  },
  {
    path: '/app/ranks',
    icon: 'GroupIcon',
    name: 'Xếp hạng thành viên'
  },
  {
    path: '/app/stores-app',
    icon: 'StoreIcon',
    name: 'Quản lý cửa hàng'
  }
];
export default adminAppSidebarRoutes;