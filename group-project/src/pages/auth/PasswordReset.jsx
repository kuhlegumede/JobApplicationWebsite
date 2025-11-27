import { Link } from "react-router-dom";
import { AuthHeader } from "../../components/AuthHeader";
import { useState } from "react";

export function PasswordReset() {
  const [email, setEmail] = useState("");

  function saveEmail(event) {
    setEmail(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault(); // Prevent page reload

    if (!email.trim()) {
      alert("Please enter your email address");
      return;
    }

    console.log("Sending password reset to:", email);

    alert("If the email exists, a reset link will be sent.");
  }

  return (
    <>
      <div className="background">
        <AuthHeader />

        <div>
          <Link to="/">
            <button className="btn btn-danger rounded-pill back-button">
              Back
            </button>
          </Link>
        </div>

        <div className="d-flex justify-content-center">
          <div
            id="card-container"
            className="card shadow p-4 card-container-auth"
          >
            <form onSubmit={handleSubmit}>
              <h2>Forgot password</h2>

              <div className="mb-3">
                <label htmlFor="Email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="Email"
                  value={email}          
                  onChange={saveEmail}
                />
              </div>

              <p>Verification code will be sent to this email address</p>

              <div className="d-flex justify-content-center mt-3">
                <button type="submit" className="btn btn-primary rounded-pill">
                  Reset
                </button>
              </div>

              <div>
                <Link to="/creation">Or create a new account</Link>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}
