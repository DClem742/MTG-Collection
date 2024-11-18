import { Link, useNavigate } from 'react-router-dom'
import styles from '../styles/Navbar.module.css'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      navigate('/login')
    }
  }

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand}>
        Mythic Mana
      </Link>
      <div className={styles.links}>
        {user ? (
          <>
            <Link to="/" className={styles.mainNavLink}>Home</Link>
            <Link to="/search" className={styles.mainNavLink}>Search</Link>
            <Link to="/collection" className={styles.mainNavLink}>Collection</Link>
            <Link to="/decks" className={styles.mainNavLink}>Decks</Link>
            <button 
              className={styles.logoutButton} 
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className={styles.mainNavLink}>Login</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar