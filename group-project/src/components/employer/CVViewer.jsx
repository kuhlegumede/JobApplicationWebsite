import React, { useState, useEffect } from "react";
import { cvService } from "../../services/cvService";

export function CVViewer({ fileId, fileName = "resume.pdf", onClose }) {
  const [cvUrl, setCvUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadCV();
    // Cleanup URL when component unmounts
    return () => {
      if (cvUrl) {
        URL.revokeObjectURL(cvUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  const loadCV = async () => {
    try {
      setLoading(true);
      setError("");
      const url = await cvService.getCVUrl(fileId);
      setCvUrl(url);
    } catch (err) {
      console.error("Error loading CV:", err);
      setError("Failed to load CV. Please try again or download it directly.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await cvService.downloadAndSaveCV(fileId, fileName);
    } catch (err) {
      console.error("Error downloading CV:", err);
      alert("Failed to download CV. Please try again.");
    }
  };

  const handlePrint = () => {
    if (cvUrl) {
      const printWindow = window.open(cvUrl, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleRetry = () => {
    loadCV();
  };

  return (
    <div
      className={`modal show d-block ${isFullscreen ? "fullscreen-modal" : ""}`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
      tabIndex="-1"
    >
      <div
        className={`modal-dialog ${
          isFullscreen ? "modal-fullscreen" : "modal-xl modal-dialog-centered"
        }`}
      >
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-file-earmark-pdf me-2"></i>
              {fileName}
            </h5>
            <div className="d-flex gap-2">
              {/* Action Buttons */}
              {cvUrl && !error && (
                <>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleDownload}
                    title="Download CV"
                  >
                    <i className="bi bi-download"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={handlePrint}
                    title="Print CV"
                  >
                    <i className="bi bi-printer"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    <i
                      className={`bi ${
                        isFullscreen ? "bi-fullscreen-exit" : "bi-fullscreen"
                      }`}
                    ></i>
                  </button>
                </>
              )}
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
          </div>

          {/* Body */}
          <div
            className="modal-body p-0"
            style={{
              height: isFullscreen ? "calc(100vh - 60px)" : "70vh",
              overflow: "hidden",
            }}
          >
            {loading ? (
              // Loading State
              <div className="d-flex flex-column align-items-center justify-content-center h-100">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Loading CV...</p>
              </div>
            ) : error ? (
              // Error State
              <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4">
                <i
                  className="bi bi-exclamation-triangle text-danger mb-3"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h5 className="text-danger mb-3">Unable to Load CV</h5>
                <p className="text-muted text-center mb-4">{error}</p>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary" onClick={handleRetry}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Try Again
                  </button>
                  <button className="btn btn-outline-primary" onClick={handleDownload}>
                    <i className="bi bi-download me-2"></i>
                    Download Instead
                  </button>
                </div>
              </div>
            ) : (
              // PDF Viewer
              <iframe
                src={cvUrl}
                title="CV Viewer"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                onError={() => {
                  setError(
                    "Your browser cannot display this PDF. Please download it to view."
                  );
                }}
              />
            )}
          </div>

          {/* Footer - Only show if not fullscreen */}
          {!isFullscreen && !loading && !error && (
            <div className="modal-footer">
              <small className="text-muted me-auto">
                <i className="bi bi-info-circle me-1"></i>
                Tip: Use fullscreen for better viewing
              </small>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .fullscreen-modal .modal-dialog {
          margin: 0;
          max-width: 100%;
          width: 100vw;
          height: 100vh;
        }
        
        .fullscreen-modal .modal-content {
          height: 100vh;
          border-radius: 0;
        }
      `}</style>
    </div>
  );
}
