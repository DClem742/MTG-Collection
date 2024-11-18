import mtgBackground from '../images/mtg-background.jpg'
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
      <img src="/mtg-background.jpg" alt="MTG Background" style={{width: '100%', height: '200px', objectFit: 'cover'}} />
      <div className={styles.logo}>
        MTG Collection Tracker
      </div>
      <nav className={styles.nav}>
        {user ? (
          <>
            <Link to="/" className={styles.navLink}>Home</Link>
            <Link to="/search" className={styles.navLink}>Search</Link>
            <Link to="/collection" className={styles.navLink}>Collection</Link>
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
}export default Header