import { Link } from "react-router-dom";
import { AuthHeader } from "../../components/AuthHeader";

export function ProfileCreation() {
  return (
    <>
      <div className="background">
        <AuthHeader />
        <Link to="/">
          <button className="btn btn-danger rounded-pill back-button">
            Back
          </button>
        </Link>
        <div className="d-flex justify-content-center">
          <div
            id="card-container"
            className="card shadow p-4 card-container-auth"
          >
            <form>
              <h2>Create a NextStep Account</h2>
              <h5>Who are you?</h5>
              <div className="mb-3">
                <Link to="/employer/creation">
                  <button className="btn btn-primary rounded-pill">
                    An employer
                  </button>
                </Link>
              </div>
              <div className="mb-3">
                <Link to="/jobseeker/creation">
                  <button className="btn btn-primary rounded-pill">
                    A job seeker
                  </button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
