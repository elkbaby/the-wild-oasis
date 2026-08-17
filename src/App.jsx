import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";

import GlobalStyles from "./styles/GlobalStyles";
import AppLayout from "./ui/AppLayout";
import ProtectedRoute from "./ui/ProtectedRoute";
import { DarkModeProvider } from "./context/DarkModeContext";
import { HotelProvider } from "./context/HotelContext";
import PermissionRoute from "./ui/PermissionRoute";
import { PERMISSIONS } from "./features/hotels/permissions";
import Spinner from "./ui/Spinner";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Booking = lazy(() => import("./pages/Booking"));
const Checkin = lazy(() => import("./pages/Checkin"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Cabins = lazy(() => import("./pages/Cabins"));
const Reports = lazy(() => import("./pages/Reports"));
const Audit = lazy(() => import("./pages/Audit"));
const Users = lazy(() => import("./pages/Users"));
const Settings = lazy(() => import("./pages/Settings"));
const Account = lazy(() => import("./pages/Account"));
const Login = lazy(() => import("./pages/Login"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 60 * 1000,
      staleTime: 0,
    },
  },
});

function App() {
  return (
    <DarkModeProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />

        <GlobalStyles />
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Suspense fallback={<Spinner />}>
            <Routes>
            <Route
              element={
                <ProtectedRoute>
                  <HotelProvider>
                    <AppLayout />
                  </HotelProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate replace to="dashboard" />} />
              <Route
                path="dashboard"
                element={
                  <PermissionRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
                    <Dashboard />
                  </PermissionRoute>
                }
              />
              <Route
                path="bookings"
                element={
                  <PermissionRoute permission={PERMISSIONS.BOOKINGS_VIEW}>
                    <Bookings />
                  </PermissionRoute>
                }
              />
              <Route
                path="bookings/:bookingId"
                element={
                  <PermissionRoute permission={PERMISSIONS.BOOKINGS_VIEW}>
                    <Booking />
                  </PermissionRoute>
                }
              />
              <Route
                path="checkin/:bookingId"
                element={
                  <PermissionRoute permission={PERMISSIONS.BOOKINGS_CHECKIN}>
                    <Checkin />
                  </PermissionRoute>
                }
              />
              <Route
                path="calendar"
                element={
                  <PermissionRoute permission={PERMISSIONS.CALENDAR_VIEW}>
                    <Calendar />
                  </PermissionRoute>
                }
              />
              <Route
                path="cabins"
                element={
                  <PermissionRoute permission={PERMISSIONS.CABINS_VIEW}>
                    <Cabins />
                  </PermissionRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <PermissionRoute permission={PERMISSIONS.REPORTS_VIEW}>
                    <Reports />
                  </PermissionRoute>
                }
              />
              <Route
                path="audit"
                element={
                  <PermissionRoute permission={PERMISSIONS.AUDIT_VIEW}>
                    <Audit />
                  </PermissionRoute>
                }
              />
              <Route
                path="users"
                element={
                  <PermissionRoute permission={PERMISSIONS.USERS_MANAGE}>
                    <Users />
                  </PermissionRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <PermissionRoute permission={PERMISSIONS.SETTINGS_MANAGE}>
                    <Settings />
                  </PermissionRoute>
                }
              />
              <Route path="account" element={<Account />} />
            </Route>

            <Route path="login" element={<Login />} />
            <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>

        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
            },
            style: {
              fontSize: "16px",
              maxWidth: "500px",
              padding: "16px 24px",
              backgroundColor: "var(--color-grey-0)",
              color: "var(--color-grey-700)",
            },
          }}
        />
      </QueryClientProvider>
    </DarkModeProvider>
  );
}

export default App;
