import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Signin.module.css";
import { toast } from "react-toastify";
import { useAdminContext } from "../../../context/adminContext";
import { loginApi } from "../../../http";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false); // Change this to a boolean
  const navigate = useNavigate();
  const { setIsAuthenticated, setAdmin } = useAdminContext();

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!password || !email) {
      return toast.warn("All fields are mandatory");
    }

    setProcessing(true); // Start processing

    try {
      const { data } = await loginApi({ email, password });
      if (!data) {
        setProcessing(false);
        return toast.error("Server Error");
      }

      if (data?.success) {
        setIsAuthenticated(true);
        setAdmin(data?.userName);
        navigate("/");
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred"); // Use error from response or fallback
    } finally {
      setProcessing(false); // Ensure processing is false when done
    }
  };

  return (
    <div className={styles.signupContainer}>
      <h2 className={styles.title}>Sign In</h2>
      <form className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            value={email}
            className={styles.input}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            id="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          className={styles.submitButton}
          onClick={handleSignIn}
          disabled={processing} // Disable button while processing
        >
          {processing ? "Signing In..." : "Sign In"} {/* Show loading text */}
        </button>
      </form>
      <p className={styles.signInPrompt}>
        Don't have an account?{" "}
        <Link to="/signup" className={styles.signInLink}>
          Register
        </Link>
      </p>
    </div>
  );
};

export default Signin;
