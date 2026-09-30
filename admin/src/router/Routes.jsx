import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

const MainLayout = lazy(() => import("../Layout/Main/Main"));
const SignIn = lazy(() => import("../Pages/Auth/SignIn/SignIn"));
const ForgatePassword = lazy(() => import("../Pages/Auth/ForgatePassword/ForgatePassword"));
const VerifyCode = lazy(() => import("../Pages/Auth/VerifyCode/VerifyCode"));
const NewPass = lazy(() => import("../Pages/Auth/NewPass/NewPass"));
const Dashboard = lazy(() => import("../Pages/Dashboard/Dashboard"));
const Settings = lazy(() => import("../Pages/Settings/Settings"));
const Booking = lazy(() => import("../Pages/Bookings/Bookings"));
const BookingDetails = lazy(() => import("../Pages/BookingDetails/BookingDetails"));
const Workers = lazy(() => import("../Pages/Workers/Workers"));
const WorkerDetailsPage = lazy(() => import("../Pages/WorkerDetailsPage/WorkerDetailsPage"));
const PaymentDetails = lazy(() => import("../Pages/PaymentDetails/PaymentDetails"));
const Payments = lazy(() => import("../Pages/Payments/Payments"));
const Customers = lazy(() => import("../Pages/Customers/Customers"));
const CustomerDetails = lazy(() => import("../Pages/CustomerDetails/CustomerDetails"));
const Support = lazy(() => import("../Pages/Support/Support"));
const Pricing = lazy(() => import("../Pages/Pricing/Pricing"));
const Testimonials = lazy(() => import("../Pages/Testimonials/Testimonials"));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#f9fafb]">
    <p className="text-sm font-medium text-gray-600">Loading...</p>
  </div>
);

const loadRoute = (Component) => (
  <Suspense fallback={<RouteFallback />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/sign-in",
    element: loadRoute(SignIn),
  },
  {
    path: "/forgate-password",
    element: loadRoute(ForgatePassword),
  },
  {
    path: "/verify-code",
    element: loadRoute(VerifyCode),
  },
  {
    path: "/new-password",
    element: loadRoute(NewPass),
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/",
        element: loadRoute(MainLayout),
        children: [
          { path: "/", element: loadRoute(Dashboard) },
          { path: "/dashboard", element: loadRoute(Dashboard) },
          { path: "/booking", element: loadRoute(Booking) },
          { path: "/booking/:jobId", element: loadRoute(BookingDetails) },
          { path: "/workers", element: loadRoute(Workers) },
          { path: "/workers/:id", element: loadRoute(WorkerDetailsPage) },
          { path: "/payments", element: loadRoute(Payments) },
          { path: "/payment-details", element: loadRoute(PaymentDetails) },
          { path: "/customers", element: loadRoute(Customers) },
          { path: "/customer/:id", element: loadRoute(CustomerDetails) },
          { path: "/reviews", element: loadRoute(Testimonials) },
          { path: "/pricing", element: loadRoute(Pricing) },
          { path: "/support", element: loadRoute(Support) },
          { path: "/settings", element: loadRoute(Settings) },

        ],
      },
    ],
  },
]);
