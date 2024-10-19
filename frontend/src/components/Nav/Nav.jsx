import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "./Nav.module.css";
import { useAdminContext } from "../../context/adminContext";
import { logoutApi } from "../../http";
import { toast } from "react-toastify";

const Nav = () => {
  const { isAuthenticated, setIsAuthenticated, admin, setAdmin } =
    useAdminContext();

  const [logoutProcessing, setLogoutProcessing] = useState(false);

  const handleLogout = async () => {
    setLogoutProcessing(true); // Start processing
    try {
      await logoutApi(); // Call API to logout
      setIsAuthenticated(false);
      setAdmin(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred"); // Handle error
    } finally {
      setLogoutProcessing(false); // Ensure processing is stopped when done
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/" className={styles.logoLink}>
          Certify
        </Link>
      </div>
      {isAuthenticated && <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link to="/certificates" className={styles.navLink}>
            Certificates
          </Link>
        </li>
      </ul>}

      {isAuthenticated && (
        <div className={styles.adminSection}>
          <span className={styles.adminName}>Hello, {admin}!</span>
          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            disabled={logoutProcessing} // Disable button while processing
          >
            {logoutProcessing ? "Logging out..." : "Logout"}{" "}
            {/* Show spinner/text */}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Nav;
