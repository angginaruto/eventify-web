// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AttendeeListPage from "@/pages/organizer/AttendeeListPage";
import EventTransactionsPage from "@/pages/organizer/EventTransactionsPage";

// pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import EventDetailPage from "@/pages/EventDetailPage";
import CheckoutPage from "@/pages/CheckoutPage";
import TransactionPage from "@/pages/TransactionPage";
import ProfilePage from "@/pages/ProfilePage";

// organizer pages
import OrganizerLayout from "@/layouts/OrganizerLayout";
import DashboardPage from "@/pages/organizer/DashboardPage";
import MyEventsPage from "@/pages/organizer/MyEventsPage";
import CreateEventPage from "@/pages/organizer/CreateEventPage";
import EditEventPage from "@/pages/organizer/EditEventPage";
import EventPromotionsPage from "@/pages/organizer/EventPromotionsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "events/:id", element: <EventDetailPage /> },
      {
        path: "checkout/:id",
        element: (
          <ProtectedRoute role="CUSTOMER">
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "transactions",
        element: (
          <ProtectedRoute role="CUSTOMER">
            <TransactionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/organizer",
    element: (
      <ProtectedRoute role="ORGANIZER">
        <OrganizerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "events", element: <MyEventsPage /> },
      { path: "events/create", element: <CreateEventPage /> },
      { path: "events/:id/edit", element: <EditEventPage /> },
      { path: "events/:id/attendees", element: <AttendeeListPage /> },
      { path: "events/:id/transactions", element: <EventTransactionsPage /> },
      { path: "events/:id/promotions", element: <EventPromotionsPage /> },
    ],
  },
]);
