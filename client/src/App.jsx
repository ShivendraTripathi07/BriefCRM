import { Outlet } from "react-router-dom";
import "./App.css";
import { ToastContainer } from "react-toastify";
import React from "react";

const App = () => {
  return (
    <>
      <ToastContainer position="top-right" />
      <main className="mt-0 overflow-y-hidden">
        <Outlet />
      </main>
    </>
  );
};

export default App;
