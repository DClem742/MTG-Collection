import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/Navbar.module.css'

function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.log('Logout error:', error)
    }
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <h1>Mythic Mana</h1>
      </div>
      <div className={styles.mobileNav}>
        <button 
          className={styles.menuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
      </div>
      
      <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.active : ''}`}>
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/collection">Collection</Link>
        <Link to="/decks">Decks</Link>
        {user ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  )}

export default Navbar
