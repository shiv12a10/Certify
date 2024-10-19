import React, { useState, useEffect } from "react";
import certificate from "../../assets/images/White and Blue Simple Award Certificate.png";
import html2canvas from "html2canvas";
import styles from "./Certificate.module.css";
import { createCertificate, updateCertificate } from "../../http";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const Certificate = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState("");
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const certificateName = queryParams.get("name");
    const certificateId = queryParams.get("id");

    if (certificateName && certificateId) {
      setName(certificateName);
      setId(certificateId);
    } else {
      setName("");
      setId("");
    }
  }, [location.search]); // Empty dependency array to ensure it runs only once or when location.search changes

  const handleGenerateCertificate = async () => {
    if (!name || !email) {
      return toast.warn("All fields are mandatory");
    }

    setLoading(true); // Start loading

    const certificateElement = document.querySelector(
      `.${styles.certificatePreview}`
    );
    html2canvas(certificateElement).then(async (canvas) => {
      const imgData = canvas.toDataURL("image/png");

      const payload = { name, email, image: imgData };

      try {
        const { data } = await createCertificate(payload);
        toast.success("Certificate generated and sent successfully!");
      } catch (error) {
        toast.error("Failed to generate certificate. Please try again.");
      } finally {
        setLoading(false); // Stop loading
      }
    });
  };

  const handleUpdateCertificate = async () =>{
    if (!name) {
      return toast.warn("All fields are mandatory");
    }

    setLoading(true); // Start loading

    const certificateElement = document.querySelector(
      `.${styles.certificatePreview}`
    );
    html2canvas(certificateElement).then(async (canvas) => {
      const imgData = canvas.toDataURL("image/png");

      const payload = { name, image: imgData };

      try {
        const { data } = await updateCertificate(id, payload);
        toast.success("Certificate updated and sent successfully!");
      } catch (error) {
        toast.error("Failed update certificate. Please try again.");
      } finally {
        setLoading(false); // Stop loading
      }
    });
  }

  return (
    <div className={styles.certificateContainer}>
      <div className={styles.inputContainer}>
        {/* Flex container for name and email inputs */}
        <div className={styles.inputRow}>
          <div className={styles.inputWrapper}>
            <label htmlFor="nameInput" className={styles.inputLabel}>
              Name
            </label>
            <input
              id="nameInput"
              type="text"
              className={styles.inputField}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={loading} // Disable inputs when loading
            />
          </div>

          {!id && (
            <div className={styles.inputWrapper}>
              <label htmlFor="emailInput" className={styles.inputLabel}>
                Email
              </label>
              <input
                id="emailInput"
                type="email"
                className={styles.inputField}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                disabled={loading} // Disable inputs when loading
              />
            </div>
          )}
        </div>

        {!id ? (
          <button
            className={styles.generateButton}
            onClick={handleGenerateCertificate}
            disabled={loading} // Disable button when loading
          >
            {loading ? "Generating..." : "Generate Certificate"}
          </button>
        ) : (
          <button
            className={styles.generateButton}
            onClick={handleUpdateCertificate}
            disabled={loading} // Disable button when loading
          >
            {loading ? "Updating..." : "Update Certificate"}
          </button>
        )}
      </div>

      <div className={styles.certificatePreview}>
        <h1 className={styles.recipientName}>{name}</h1>
        <img
          src={certificate}
          className={styles.certificateImage}
          alt="Certificate"
        />
      </div>
    </div>
  );
};

export default Certificate;
