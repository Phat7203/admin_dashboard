import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ component: Component, requiredPermissions, ...rest }) => {
  const { user, userRole } = useAuth();

  const hasRequiredPermissions = () => {
    if (!requiredPermissions || !userRole?.permissions) return false;
    return requiredPermissions.every(permission => 
      userRole.permissions.includes(permission)
    );
  };

  return (
    <Route
      {...rest}
      render={(props) => {
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