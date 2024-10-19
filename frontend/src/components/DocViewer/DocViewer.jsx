import React from "react";
import DocViewer from "@cyntler/react-doc-viewer";
const DocViewerComponent = ({error, handleError, docs}) => {
  return (
    <div style={styles.docViewerContainer}>
      <DocViewer
        prefetchMethod="GET"
        documents={docs}
        theme={{
          primary: "#007bff",
          secondary: "#f8f9fa",
          tertiary: "#e9ecef",
          textPrimary: "#343a40",
          textSecondary: "#495057",
          textTertiary: "#6c757d",
          disableThemeScrollbar: false,
        }}
        onError={handleError}
      />
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

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

export default DocViewerComponent;
