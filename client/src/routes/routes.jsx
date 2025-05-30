import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Home from "../Home/Home";
import App from "../App";
import SignUp from "../Authentication/SignUp";
import Dashboard from "../pages/dashboard";

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
    ],
  },
]);

export default router;
