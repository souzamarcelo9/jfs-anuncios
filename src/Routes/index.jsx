import { BrowserRouter as Router, Route, Routes as RouterRoutes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

import Register from '../pages/Register';
import Login from '../pages/Login';
import Home from '../pages/Home';
import UpdateProfile from '../pages/UpdateProfile';
import ForgotPassword from '../pages/ForgotPassword';
import PromptModeler from '../pages/PromptModeler';
import BrandingScreen from '../pages/BrandingScreen';
import PurchaseOrderForm from '../pages/PurchaseOrderForm';
import ConfirmationScreen from '../pages/ConfirmationScreen/ConfirmationScreen';
import Dashboard from '../pages/Dashboard';
import AdminUsers from '../pages/AdminUsers/AdminUsers';

export default function Routes() {
    return (
        <Router>
            <RouterRoutes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/promptModeler" element={<PromptModeler />} />
                <Route path="/branding" element={<BrandingScreen />} />                
                <Route path="/confirmation" element={<ConfirmationScreen />} />                
                <Route path="/purchaseOrder" element={<PurchaseOrderForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute>
                            <AdminUsers />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/update-profile"
                    element={
                        <PrivateRoute>
                            <UpdateProfile />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/confirmation/:project"
                    element={
                        <PrivateRoute>
                            <ConfirmationScreen />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/branding/:project"
                    element={
                        <PrivateRoute>
                            <BrandingScreen />
                        </PrivateRoute>
                    }
                />
            </RouterRoutes>
        </Router>
    );
}
