import React, { useState, useEffect } from "react";
import styles from "./Certificates.module.css";
import { toast } from "react-toastify";
import {
  deleteCertificate,
  getAllCertificates,
  toggleCertificateValidation,
} from "../../http";
import { useNavigate } from "react-router-dom";

const Certificates = () => {
  const [searchKey, setSearchKey] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [changingStatusId, setChangingStatusId] = useState(null);

  const navigate = useNavigate();

  const fetchCertificates = async (page, searchKey = "") => {
    setLoading(true);
    try {
      const { data } = await getAllCertificates(page, searchKey);

      setCertificates(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error("Failed to fetch certificates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates(currentPage, searchKey);
  }, [currentPage, searchKey]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const { data } = await deleteCertificate(id);

      if (data?.success) {
        setCertificates((prev) =>
          prev.filter((certificate) => certificate._id !== id)
        );
        toast.success("Certificate deleted successfully.");
      } else {
        toast.error("Failed to delete certificate.");
      }
    } catch (error) {
      toast.error("Error deleting certificate.");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleStatusChange = async (id) => {
    setChangingStatusId(id);
    try {
      const { data } = await toggleCertificateValidation(id);

      if (data?.success) {
        fetchCertificates(currentPage, searchKey);
        toast.success("Certificate status updated successfully.");
      } else {
        toast.error("Failed to update certificate status.");
      }
    } catch (error) {
      toast.error("Error updating status.");
    } finally {
      setChangingStatusId(null);
    }
  };

  return (
    <div className={styles.certificatesContainer}>
      <div className={styles.searchBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by email or Key"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <table className={styles.certificatesTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length > 0 ? (
              certificates.map((certificate) => (
                <tr key={certificate._id}>
                  <td>
                    <a
                      href={certificate.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {certificate.name}
                    </a>
                  </td>
                  <td>{certificate.email}</td>
                  <td
                    className={`${styles.statusText} ${
                      certificate.valid
                        ? styles.validStatus
                        : styles.invalidStatus
                    }`}
                  >
                    {certificate.valid ? "Valid" : "Invalid"}
                  </td>
                  <td>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(certificate._id)}
                      disabled={deletingId === certificate._id}
                    >
                      {deletingId === certificate._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                    <button
                      className={`${styles.actionButton} ${
                        certificate.valid
                          ? styles.invalidateButton
                          : styles.validateButton
                      }`}
                      onClick={() => handleStatusChange(certificate._id)}
                      disabled={changingStatusId === certificate._id}
                    >
                      {changingStatusId === certificate._id
                        ? "Updating..."
                        : certificate.valid
                        ? "Invalidate"
                        : "Validate"}
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.editButton}`}
                      onClick={() =>
                        navigate(
                          `/?name=${certificate.name}&id=${certificate._id}`
                        )
                      }
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No certificates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <div className={styles.pagination}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`${styles.pageButton} ${
              currentPage === index + 1 ? styles.activePage : ""
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Certificates;
