import React, { useContext, useState } from "react";

const AdminContext = React.createContext();

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);  
    
  return (
    <AdminContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, admin, setAdmin }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  return useContext(AdminContext);
};
