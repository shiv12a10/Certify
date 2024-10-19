import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";
import { useAdminContext } from "../../../context/adminContext";
import { toast } from "react-toastify";
import { registerApi } from "../../../http";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [processing, setProcessing] = useState(false); // Change this to a boolean
  const navigate = useNavigate();
  const { setIsAuthenticated, setAdmin } = useAdminContext();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!username || !password || !email) {
      return toast.warn("All fields are mandatory");
    }

    setProcessing(true); // Start processing

    try {
      const { data } = await registerApi({
        userName: username,
        email,
        password,
      });
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
      <h2 className={styles.title}>Sign Up</h2>
      <form className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.label}>
            Username
          </label>
          <input
            type="text"
            id="username"
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
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
          onClick={handleSignUp}
          disabled={processing} // Disable button while processing
        >
          {processing ? "Signing Up..." : "Sign Up"} {/* Show loading text */}
        </button>
      </form>
      <p className={styles.signInPrompt}>
        Already have an account?{" "}
        <Link to="/signin" className={styles.signInLink}>
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Signup;
