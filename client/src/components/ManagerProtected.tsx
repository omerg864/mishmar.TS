import { Navigate } from "react-router-dom";


interface ProtectedRouteProps {
    manager: boolean;
    children: React.ReactNode;
}
const ProtectedRoute = ({manager, children}: ProtectedRouteProps): JSX.Element => {

    if (!manager) {
        return <Navigate to={`/`} replace />;
    }

    return children as JSX.Element;
};

export default ProtectedRoute