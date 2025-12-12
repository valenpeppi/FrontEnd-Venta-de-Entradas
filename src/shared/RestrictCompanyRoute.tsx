import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';

interface RestrictCompanyRouteProps {
    children: React.ReactElement;
}

const RestrictCompanyRoute: React.FC<RestrictCompanyRouteProps> = ({ children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return null; // Or a loading spinner
    }

    if (user?.role === 'company') {
        return <Navigate to="/company/dashboard" state={{ from: location }} replace />;
    }

    return children;
};

export default RestrictCompanyRoute;
