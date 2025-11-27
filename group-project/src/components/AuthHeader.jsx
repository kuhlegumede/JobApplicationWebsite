import { Link } from "react-router-dom";
import NextStep from "../assets/NextStep.png";

export function AuthHeader() {
  return (
    <header className="d-flex align-items-center justify-content-center px-3 py-2">
      <Link to="/">
        <img
          className="logo"
          src={NextStep}
          alt="Logo"
          style={{ width: "140px", height: "50px" }}
        />
      </Link>
    </header>
  );
}
