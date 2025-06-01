import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Home from "../Home/Home";
import App from "../App";
import SignUp from "../Authentication/SignUp";
import Dashboard from "../pages/Dashboard";
import CampaignBuilder from "../pages/CampaignBuilder";
import CustomerManagementPage from "../pages/Customer";
import Order from "../pages/Order";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/campaign",
        element: <CampaignBuilder />,
      },
      {
        path: "/customer",
        element: <CustomerManagementPage />,
      },
      {
        path: "/order",
        element: <Order />,
      },
    ],
  },
]);

export default router;
