import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemedSuspense from "./ThemedSuspense";

const ProtectedRoute = ({
  component: Component,
  requiredPermissions,
  isAdminApp = false,
  ...rest
}) => {
  const { user, userRole, loading } = useAuth();

  const hasRequiredPermissions = () => {
    // Nếu là admin app thì không cần check quyền
    if (isAdminApp) return true;
    
    // Check quyền cho admin shop
    if (!requiredPermissions || !userRole?.permissions) return false;
    return requiredPermissions.every(permission => 
      userRole.permissions.includes(permission)
    );
  };

  return (
    <Route
      {...rest}
      render={(props) => {
        if (loading || !userRole) {
          return  <ThemedSuspense />;
        }

        if (!user) {
          return <Redirect to="/login" />;
        }

        if (!hasRequiredPermissions()) {
          return <Redirect to="/404" />;
        }

        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;
