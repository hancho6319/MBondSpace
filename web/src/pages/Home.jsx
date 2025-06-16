import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Welcome to MBondSpace</h1>
          <p className={styles.heroSubtitle}>
            Connect, collaborate, and grow with your community in real-time
          </p>
          
          {currentUser ? (
            <div className={styles.authButtons}>
              <Link to="/groups" className={styles.primaryButton}>
                Go to Groups
              </Link>
              <Link to="/profile" className={styles.secondaryButton}>
                Your Profile
              </Link>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/auth" className={styles.primaryButton}>
                Login
              </Link>
              <Link to="/auth" className={styles.secondaryButton}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
        
        <div className={styles.heroImage}>
          <img 
            src="https://cca.glueup.com/resources/public/images/orig/723ed0e9-a29c-4fba-8f71-55f41790543a.gif" 
            alt="People collaborating" 
            className={styles.illustration}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Key Features</h2>
        <div className={styles.featuresGrid}>
          {/* Feature 1 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Real-time Group Chats</h3>
            <p className={styles.featureDescription}>
              Communicate instantly with your team members using our Firebase-powered chat system
            </p>
          </div>

          {/* Feature 2 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 005.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 00-2.122-.879H5.25zM6.375 7.5a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Event Management</h3>
            <p className={styles.featureDescription}>
              Schedule and manage events with RSVP tracking and reminders
            </p>
          </div>

          {/* Feature 3 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>User Profiles</h3>
            <p className={styles.featureDescription}>
              Customizable profiles with photos and bios to help members connect
            </p>
          </div>

          {/* Feature 4 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Admin Dashboard</h3>
            <p className={styles.featureDescription}>
              Powerful tools for group administrators to manage members and content
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to get started?</h2>
          <p className={styles.ctaText}>
            Join thousands of communities already using MBondSpace to collaborate effectively
          </p>
          <Link 
            to={currentUser ? "/events" : "/auth"} 
            className={styles.ctaButton}
          >
            {currentUser ? "Go to Events" : "Sign Up Now"}
          </Link>
        </div>
      </section>
    </div>
  );
}