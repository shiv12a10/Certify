// src/components/Layout/Layout.js
import React from "react";
import { useLocation } from "react-router-dom";
import Nav from "./components/Nav/Nav";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNav = location.pathname === "/:vrCode"; // Adjust this condition based on your route needs

  return (
    <div>
      {!hideNav && <Nav />}
      {children}
    </div>
  );
};

export default Layout;
