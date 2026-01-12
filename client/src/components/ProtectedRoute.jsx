import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthHook";

export const ProtectedRoute = ({
  children,
  requiredRoles = [],
  redirectTo = "/login",
}) => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="overlay">
        <div className="window" style={{ width: "350px" }}>
          <div className="window-content" style={{ textAlign: "center" }}>
            <div className="spinner" />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // (ADMIN | MODERATOR | PLAYER)
  if (
    requiredRoles.length > 0 &&
    !requiredRoles.includes(user?.role)
  ) {
    return (
      <div className="overlay">
        <div className="window" style={{ width: "420px" }}>
          <div className="window-content" style={{ textAlign: "center" }}>
            <h2>Access Denied</h2>
            <p>
              This page is available only for:{" "}
              <strong>{requiredRoles.join(", ")}</strong>
            </p>
            <button onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
