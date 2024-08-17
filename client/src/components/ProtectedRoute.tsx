import { Navigate } from "react-router-dom";


interface ProtectedRouteProps {
    isAuthenticated: boolean;
    children: React.ReactNode;
}
const ProtectedRoute = ({isAuthenticated, children}: ProtectedRouteProps): JSX.Element => {

    if (!isAuthenticated) {
        return <Navigate to={`/login`} replace />;
    }

    return children as JSX.Element;
};

export default ProtectedRoute