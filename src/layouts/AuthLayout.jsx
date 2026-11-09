import { Link } from "react-router-dom";
import "../styles/auth.css";
import FloatingIcons from "../components/common/FloatingIcons";
import banner from "../assets/register-banner.png";

export default function AuthLayout({ children, showBackLink = true }) {
  return (
    <>
      <FloatingIcons />

      <main className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-col-form">
            {showBackLink && (
              <Link to="/" className="back-link">
                <i className="fa-solid fa-arrow-left"></i> Volver al inicio
              </Link>
            )}
            {children}
          </div>

          <div className="auth-col-image">
            <img src={banner} alt="Ilustración NoteCore" className="auth-media-img" />
          </div>
        </div>
      </main>
    </>
  );
}