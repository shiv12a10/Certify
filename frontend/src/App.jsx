import React, { useState } from "react";
import "./App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Certificate from "./components/Certificate/Certificate";
import Nav from "./components/Nav/Nav";
import Signup from "./pages/Auth/Signup/Signup";
import Signin from "./pages/Auth/Signin/Signin";
import CertificateStatus from "./pages/CertificateDisplay/CertificateStatus";
import { useLoadingWithRefresh } from "./hooks/useLoadingWithRefresh";
import { ToastContainer } from "react-toastify";
import Certificates from "./pages/Certificates/Certificates";
import { useAdminContext } from "./context/adminContext";

function App() {
  const { loading } = useLoadingWithRefresh();
  console.log(loading);

  return (
    <div className="App">
      <BrowserRouter>
        <ToastContainer />
        <Nav />
        {loading ? (
          <h1>Loading ...</h1>
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Certificate />
                </PrivateRoute>
              }
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route
              path="/certificates"
              element={
                <PrivateRoute>
                  <Certificates />
                </PrivateRoute>
              }
            />

            <Route path="/:vrCode" element={<CertificateStatus />} />
          </Routes>
        )}
      </BrowserRouter>
    </div>
  );
}

const PrivateRoute = ({ children }) => {
  // Replace this with your actual authentication check (e.g., JWT token or user state)
  const { isAuthenticated } = useAdminContext();

  return isAuthenticated ? children : <Navigate to="/signin" />;
};

export default App;
