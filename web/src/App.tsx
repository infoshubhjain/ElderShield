import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAppStore } from "./state/store";
import { setAuthToken } from "./api/client";
import { AuthPhonePage } from "./pages/AuthPhonePage";
import { AuthOtpPage } from "./pages/AuthOtpPage";
import { HomePage } from "./pages/HomePage";
import { ActivitySelectionPage } from "./pages/ActivitySelectionPage";
import { MatchResultsPage } from "./pages/MatchResultsPage";
import { MessagesListPage } from "./pages/MessagesListPage";
import { ChatPage } from "./pages/ChatPage";
import { SchedulePage } from "./pages/SchedulePage";
import { OrderCategoryPage } from "./pages/OrderCategoryPage";
import { OrderItemsPage } from "./pages/OrderItemsPage";
import { OrderSummaryPage } from "./pages/OrderSummaryPage";
import { HelpPage } from "./pages/HelpPage";
import { ProfilePage } from "./pages/ProfilePage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/phone" replace />;
};

function AppRoutes() {
  const { token } = useAppStore();

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  return (
    <AppLayout>
      <Routes>
        <Route path="/auth/phone" element={<AuthPhonePage />} />
        <Route path="/auth/otp" element={<AuthOtpPage />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activities"
          element={
            <ProtectedRoute>
              <ActivitySelectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <MatchResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:id"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order"
          element={
            <ProtectedRoute>
              <OrderCategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/items"
          element={
            <ProtectedRoute>
              <OrderItemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/summary"
          element={
            <ProtectedRoute>
              <OrderSummaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <HelpPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/auth/phone" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
