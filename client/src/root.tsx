import { StrictMode, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { useAuthStore } from "./store/authStore";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";

import ProtectedRoute from "./components/ProtectedRoute";
import RedirectAuthenticatedUser from "./components/RedirectAuthenticatedUser";

import AuthLayout from "./components/layouts/AuthLayout";
import MainLayout from "./components/layouts/MainLayout";

import LoadingSpinner from "./components/auth/LoadingSpinner";

import App from "./App";
import "./App.css";

const Root = () => {
    const { isCheckingAuth, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth) return <LoadingSpinner />;

    return (
        <StrictMode>
            <Router>
                <Routes>
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <App />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <ProfilePage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route element={<AuthLayout />}>
                        <Route
                            path="/login"
                            element={
                                <RedirectAuthenticatedUser>
                                    <LoginPage />
                                </RedirectAuthenticatedUser>
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <RedirectAuthenticatedUser>
                                    <SignUpPage />
                                </RedirectAuthenticatedUser>
                            }
                        />
                        <Route
                            path="/forgot-password"
                            element={
                                <RedirectAuthenticatedUser>
                                    <ForgotPasswordPage />
                                </RedirectAuthenticatedUser>
                            }
                        />
                        <Route
                            path="/reset-password/:token"
                            element={
                                <RedirectAuthenticatedUser>
                                    <ResetPasswordPage />
                                </RedirectAuthenticatedUser>
                            }
                        />
                        <Route
                            path="/verify-email"
                            element={<EmailVerificationPage />}
                        ></Route>
                    </Route>

                    {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
                </Routes>
            </Router>
        </StrictMode>
    );
};

export default Root;
