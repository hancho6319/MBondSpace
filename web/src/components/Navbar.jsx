import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";
import UserSearch from "./UserSearch";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { currentUser } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        {/* Brand/Logo */}
        <div className={styles.brand}>
          <Link to="/" className={styles.brandLink}>
            <svg
              className={styles.logoIcon}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M6 12H18M6 12C4 12 2 10 2 8V6C2 4 4 2 6 2H18C20 2 22 4 22 6V8C22 10 20 12 18 12M6 12C4 12 2 14 2 16V18C2 20 4 22 6 22H18C20 22 22 20 22 18V16C22 14 20 12 18 12M18 12H6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.brandName}>MBondSpace</span>
          </Link>
        </div>

        {/* Search Bar (only for authenticated users) */}
        {currentUser && (
          <div className={styles.searchContainer}>
            <UserSearch />
          </div>
        )}

        {/* Navigation Links */}
        <div className={styles.navLinks}>
          {currentUser ? (
            <>
              <Link to="/groups" className={styles.navLink}>
                Groups
              </Link>
              <Link to="/events" className={styles.navLink}>
                Events
              </Link>
            </>
          ) : (
            <Link to="/features" className={styles.navLink}>
              Features
            </Link>
          )}
        </div>

        {/* Right-side Actions */}
        <div className={styles.actions}>
          {currentUser ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/auth" className={styles.loginLink}>
                Login
              </Link>
              <Link to="/auth" className={styles.signupLink}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
