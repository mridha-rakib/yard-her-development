import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/use-auth-store";

const PrivateRoute = () => {
    const location = useLocation();
    const isReady = useAuthStore((state) => state.isReady);
    const isInitializing = useAuthStore((state) => state.isInitializing);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    if (!isReady || isInitializing) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f9fafb]">
                <p className="text-sm font-medium text-gray-600">Checking session...</p>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== "admin") {
        return <Navigate to="/sign-in" replace state={{ from: location }} />;
    }

    return <Outlet />
};

export default PrivateRoute;
