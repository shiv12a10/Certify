import React, { useState, useEffect, useCallback } from "react";
import "@cyntler/react-doc-viewer/dist/index.css";
import { useParams } from "react-router-dom";
import DocViewerComponent from "../../components/DocViewer/DocViewer";
import { fetchUrl } from "../../http";

const CertificateStatus = () => {
  const [url, setUrl] = useState(null);
  const [valid, setValid] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [key, setKey] = useState(null);
  const { vrCode } = useParams();


  // Fetch certificate URL based on the verification code
  const fetchUrlIfValid = async () => {
    try {
      const { data } = await fetchUrl(vrCode);

      if (data.success) {
        if (data.valid) {
          setValid(true);
          setUrl(data.url);
          setKey(data.keyName); // Ensure this exists in the response
        } else {
          setValid(false);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setNotFound(true);
      } else {
        console.log(error);
      }
    }
  };

  // Fetch URL when the component mounts
  useEffect(() => {
    fetchUrlIfValid();
  }, [vrCode]);

  if (notFound) {
    return <NotFoundPage />;
  }

  if (valid === false) {
    return <InvalidCertificatePage />;
  }

  if (valid === true && url && key) {
    return (
      <ValidCertificatePage url={url} valid={valid} certificateKey={key} />
    );
  }

  return <div>Loading...</div>;
};

const ValidCertificatePage = ({ url, valid, certificateKey }) => {
  const [error, setError] = useState(null);

  console.log(certificateKey);

  // Document information for DocViewer
  const docs = [
    {
      uri: `${process.env.REACT_APP_API_URL}/api/pdf-proxy?url=${url}`,
      fileType: "pdf",
      fileName: certificateKey,
    },
  ];

  // Handle document load errors
  const handleError = () => {
    setError(
      "Failed to load the document. Please check the URL or try again later."
    );
  };

  // Function to download the PDF
  const downloadPDF = useCallback((url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop();
    link.click();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Certificate Status</h2>

      {/* Display certificate validity status */}
      {valid !== null ? (
        <p style={styles.status}>
          Certificate is:{" "}
          <strong style={valid ? styles.valid : styles.invalid}>
            {valid ? "Valid" : "Invalid"}
          </strong>
        </p>
      ) : (
        <p>Loading certificate status...</p>
      )}

      {/* Display error if there is one */}
      {error && <p style={styles.error}>{error}</p>}

      {/* Display document viewer if URL is available and certificate is valid */}
      {valid && url && (
        <div style={styles.docViewerContainer}>
          {error ? (
            <p style={styles.error}>{error}</p>
          ) : (
            <DocViewerComponent
              docs={docs}
              handleError={handleError}
              setError={setError}
              error={error}
            />
          )}
        </div>
      )}

      {/* Download button */}
      {valid && url && (
        <button
          onClick={() => downloadPDF(url)}
          style={styles.downloadButton}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor =
              styles.downloadButtonHover.backgroundColor)
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor =
              styles.downloadButton.backgroundColor)
          }
        >
          Download PDF
        </button>
      )}
    </div>
  );
};

const NotFoundPage = () => {
  return (
    <div>
      <h1>Certificate Not Found</h1>
      <p>
        No certificate exists with the given verification code. Please try
        again.
      </p>
    </div>
  );
};

const InvalidCertificatePage = () => {
  return (
    <div>
      <h1>Invalid Certificate</h1>
      <p>This certificate is invalid or has expired.</p>
    </div>
  );
};

// Enhanced CSS styles
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    width: "80%",
    maxWidth: "100%",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    margin: "20px auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    fontSize: "28px",
    marginBottom: "15px",
    color: "#343a40",
    fontWeight: "600",
  },
  status: {
    fontSize: "20px",
    margin: "15px 0",
    color: "#495057",
  },
  valid: {
    color: "#28a745",
  },
  invalid: {
    color: "#dc3545",
  },
  docViewerContainer: {
    marginTop: "20px",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    overflow: "hidden",
  },
  downloadButton: {
    display: "inline-block",
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    transition: "background-color 0.3s ease",
  },
  downloadButtonHover: {
    backgroundColor: "#0056b3",
  },
  error: {
    color: "#dc3545",
    marginTop: "15px",
    fontSize: "16px",
  },
};

export default CertificateStatus;
