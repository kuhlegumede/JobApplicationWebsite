import { Link } from "react-router-dom";
import { AuthHeader } from "../../components/AuthHeader";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { logJWTClaims } from "../../utils/jwtDebug";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      
      // Debug: Log JWT claims after login
      console.log('Login successful, checking JWT token...');
      logJWTClaims();
      
      // Also log what's in localStorage
      console.log('User from localStorage:', JSON.parse(localStorage.getItem('user')));

      const route =
        response.role === "Employer"
          ? "/employer/home"
          : response.role === "Admin"
          ? "/admin/home"
          : response.role === "JobSeeker"
          ? "/jobseeker/home"
          : "/";

      navigate(route);
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <div className="background">
        <AuthHeader />
        <div className="d-flex justify-content-center">
          <div
            id="card-container"
            className="card shadow p-4 card-container-auth"
          >
            <div>
              Ready to take the next step?
              <h2>Sign in</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="d-flex justify-content-center mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>
            </div>

            <div>
              <Link to="/reset">Forgot password?</Link>
            </div>
            <div>
              <Link to="/creation">New to NextStep? Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
