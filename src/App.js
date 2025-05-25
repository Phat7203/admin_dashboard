import React, { lazy } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import AccessibleNavigationAnnouncer from "./components/AccessibleNavigationAnnouncer";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const Layout = lazy(() => import("./containers/Layout"));
const Login = lazy(() => import("./pages/Login"));
const CreateAccount = lazy(() => import("./pages/CreateAccount"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

const routes = [
  // Define your protected routes here
  // Example:
  // { path: "/dashboard", component: Dashboard, roles: ["admin", "user"] },
];

function App() {
  return (
    <AuthProvider>
      <Router>
        <AccessibleNavigationAnnouncer />
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/create-account" component={CreateAccount} />

          {routes.map((route, i) => (
            <ProtectedRoute
              key={i}
              exact
              path={`/app${route.path}`}
              component={route.component}
              requiredPermissions={route.requiredPermissions}
            />
          ))}

          <Redirect exact from="/" to="/login" />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
