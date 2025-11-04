import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const accessToken = localStorage.getItem("access");
  const rol = localStorage.getItem("rol");

 
  
  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  const decoded = JSON.parse(atob(accessToken.split(".")[1]));
  const exp = decoded.exp * 1000;
  if (Date.now() >= exp) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
