import { Navigate } from "react-router-dom";


interface UserRestrictedRouteProps {
    isAuthenticated: boolean;
    children: React.ReactNode;
}

const UserRestrictedRoute = ({ isAuthenticated, children }: UserRestrictedRouteProps): JSX.Element => {
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
  
    return children as JSX.Element;
};

export default UserRestrictedRoute