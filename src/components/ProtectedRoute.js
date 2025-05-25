import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ component: Component, requiredPermissions, ...rest }) => {
  const { user, userRole } = useAuth();

  const hasRequiredPermissions = () => {
    if (!requiredPermissions || !userRole) return false;
    return requiredPermissions.every(permission => 
      userRole.permissions.includes(permission)
    );
  };

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!user) {
          // Not logged in, redirect to login page
          return <Redirect to="/login" />;
        }

        if (!hasRequiredPermissions()) {
          // User's role is not authorized, redirect to home page
          return <Redirect to="/404" />;
        }

        // Authorized, render component
        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;