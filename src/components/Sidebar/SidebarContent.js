import React from "react";
import routes from "../../routes";
import { NavLink, Route } from "react-router-dom";
import * as Icons from "../../icons";
import SidebarSubmenu from "./SidebarSubmenu";
import { Button } from "@windmill/react-ui";
import { useAuth } from "../../context/AuthContext";

function Icon({ icon, ...props }) {
  const Icon = Icons[icon];
  return <Icon {...props} />;
}

function SidebarContent() {
  const { userRole } = useAuth();
  
  // Xác định routes dựa vào role người dùng
  const isAdminApp = userRole?.name === "admin_app";
  const sidebarRoutes = isAdminApp ? routes.adminAppSidebar : routes.adminShopSidebar;

  // Lọc routes cho admin shop dựa trên permissions
  const authorizedRoutes = isAdminApp 
    ? sidebarRoutes // Admin app không cần check permissions
    : sidebarRoutes.filter(route => {
        if (!route.requiredPermissions) return false;
        return route.requiredPermissions.every(permission =>
          userRole?.permissions?.includes(permission)
        );
      });

  return (
    <div className="py-4 text-gray-500 dark:text-gray-400">
      <NavLink
        to={isAdminApp ? "/app/dashboard-app" : "/app/dashboard-shop"}
        className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200"
      >
        {isAdminApp ? 'Admin System' : 'Shop Management'}
      </NavLink>

      <ul className="mt-6">
        {authorizedRoutes.map((route) =>
          route.routes ? (
            <SidebarSubmenu 
              route={route} 
              key={route.name} 
              isAdminApp={isAdminApp}
            />
          ) : (
            <li className="relative px-6 py-3" key={route.name}>
              <NavLink
                exact
                to={route.path}
                className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                activeClassName="text-gray-800 dark:text-gray-100"
              >
                <Route path={route.path} exact>
                  <span
                    className="absolute inset-y-0 left-0 w-1 bg-purple-600 rounded-tr-lg rounded-br-lg"
                    aria-hidden="true"
                  ></span>
                </Route>
                <Icon
                  className="w-5 h-5"
                  aria-hidden="true"
                  icon={route.icon}
                />
                <span className="ml-4">{route.name}</span>
              </NavLink>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export default SidebarContent;