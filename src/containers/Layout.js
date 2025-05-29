import React, { useContext, Suspense, useEffect, lazy } from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";
import routes from "../routes";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Main from "../containers/Main";
import ThemedSuspense from "../components/ThemedSuspense";
import { SidebarContext } from "../context/SidebarContext";

const Page404 = lazy(() => import("../pages/404"));

function Layout() {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);
  const { userRole } = useAuth();
  let location = useLocation();

  // Filter routes based on user permissions
  const isAdminApp = userRole?.name === "admin_app";

  useEffect(() => {
    closeSidebar();
  }, [location]);

  return (
    <div
      className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${
        isSidebarOpen && "overflow-hidden"
      }`}
    >
      <Sidebar/>

      <div className="flex flex-col flex-1 w-full">
        <Header />
        <Main>
          <Suspense fallback={<ThemedSuspense />}>
            <Switch>
              {isAdminApp &&
                routes.adminApp.map((route, i) => (
                  <ProtectedRoute
                    key={i}
                    exact
                    path={`/app${route.path}`}
                    component={route.component}
                    isAdminApp={true}
                  />
                ))}

              {/* Routes cho Admin Shop */}
              {!isAdminApp &&
                routes.adminShop.map((route, i) => (
                  <ProtectedRoute
                    key={i}
                    exact
                    path={`/app${route.path}`}
                    component={route.component}
                    requiredPermissions={route.requiredPermissions}
                    isAdminApp={false}
                  />
                ))}
               {isAdminApp ? (<Redirect exact from="/app" to="/app/dashboard" />) : (<Redirect exact from="/app" to="/app/dashboard-shop"/>)}
              <Route component={Page404} />
            </Switch>
          </Suspense>
        </Main>
      </div>
    </div>
  );
}

export default Layout;
