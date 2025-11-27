import React from "react";
import { useState } from "react";
import { AdminHeader } from "../../components/AdminHeader";
import { Footer } from "../../components/Footer";

export function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState("info"); // info | warning | urgent
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setLevel("info");
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!title.trim() || !message.trim()) {
      setAlert({
        type: "danger",
        text: "Please provide both title and message.",
      });
      return;
    }

    setSending(true);
    setAlert(null);

    const payload = {
      title: title.trim(),
      message: message.trim(),
      level,
      audience: "all",
      createdAt: new Date().toISOString(),
    };

    try {
      await new Promise((r) => setTimeout(r, 600));

      setNotifications((prev) => [{ id: Date.now(), ...payload }, ...prev]);
      setAlert({ type: "success", text: "Notification sent to all users." });
      resetForm();
    } catch  {
      setAlert({ type: "danger", text: "Failed to send notification." });
    } finally {
      setSending(false);
      setTimeout(() => setAlert(null), 4000);
    }
  };

  const handleRemove = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      <div className="background">
        <AdminHeader />
        <div className="container my-4">
          <div className="row justify-content-center">
            <div
              id="card-container"
              className="card shadow p-4 card-container"
              style={{ maxWidth: 900 }}
            >
              <h2 className="mb-3">System Notifications</h2>

              {alert && (
                <div className={`alert alert-${alert.type} py-2`} role="alert">
                  {alert.text}
                </div>
              )}

              <form onSubmit={handleSend}>
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <label htmlFor="notifTitle" className="form-label">
                      Title
                    </label>
                    <input
                      id="notifTitle"
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={sending}
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <label htmlFor="notifLevel" className="form-label">
                      Level
                    </label>
                    <select
                      id="notifLevel"
                      className="form-select"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      disabled={sending}
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-3 d-flex align-items-end">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={sending}
                    >
                      {sending ? "Sending..." : "Send to all users"}
                    </button>
                  </div>

                  <div className="col-12">
                    <label htmlFor="notifMessage" className="form-label">
                      Message
                    </label>
                    <textarea
                      id="notifMessage"
                      className="form-control"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={sending}
                    />
                  </div>
                </div>
              </form>

              <hr className="my-4" />

              <h4 className="mb-3">Sent Notifications</h4>
              {notifications.length === 0 ? (
                <p className="text-muted">No notifications sent yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>When</th>
                        <th>Title</th>
                        <th>Level</th>
                        <th>Message</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map((n) => (
                        <tr key={n.id}>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </td>
                          <td>{n.title}</td>
                          <td className="text-capitalize">{n.level}</td>
                          <td style={{ maxWidth: 400, whiteSpace: "pre-wrap" }}>
                            {n.message}
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemove(n.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
