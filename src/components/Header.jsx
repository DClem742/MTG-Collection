import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import styles from '../styles/Header.module.css'

function Header() {
  const { user, supabase } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        MTG Collection Tracker
      </div>
      <nav className={styles.nav}>
        {user ? (
          <>
            <Link to="/" className={styles.navLink}>Home</Link>
            <Link to="/search" className={styles.navLink}>Search</Link>
            <Link to="/collection" className={styles.navLink}>Collection</Link>
            <Link to="/trade" className={styles.navLink}>Trade</Link>
            <Link to="/trade-requests" className={styles.navLink}>Trade Requests</Link>
            <span className={styles.userEmail}>{user.email}</span>
            <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header