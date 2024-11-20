import { Link, useNavigate } from 'react-router-dom'
import styles from '../styles/Navbar.module.css'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      console.log('Logout error:', error)
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
          <button onClick={() => navigate('/login')} className={styles.mainNavLink}>Login</button>
        )}
      </div>
    </nav>
  )
}

export default Navbar