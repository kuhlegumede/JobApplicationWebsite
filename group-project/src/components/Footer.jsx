import NextStep from "../assets/NextStep.png";
import { Link } from "react-router-dom";
export function Footer() {
  return (
    <footer style={{ backgroundColor: "#eeebe8f1" }}>
      <div className="d-flex align-items-center justify-content-center ">
        {" "}
        <img src={NextStep} style={{ width: "140px", height: "50px" }} />© 2025
        NextStep. All rights reserved.
        <Link to="/faqs" className="me-5 ms-3">
          Frequently Asked Questions
        </Link>{" "}
        <i className="bi bi-telephone me-2"></i>
        +27 71 686 4997
        <i className="ms-3 bi bi-envelope-at me-2"></i>
        help@nextstep.co.za
        <i className="ms-3 bi bi-envelope me-2"></i>
        PO Box 1525, Johannesburg, 2000
      </div>
    </footer>
  );
}
