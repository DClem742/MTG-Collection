import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/Navbar.module.css'

function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>Mythic Mana</div>
      <div className={styles.manaSymbols}>
        <span className={styles.manaSymbol}>{'{W}'}</span>
        <span className={styles.manaSymbol}>{'{U}'}</span>
        <span className={styles.manaSymbol}>{'{B}'}</span>
        <span className={styles.manaSymbol}>{'{R}'}</span>
        <span className={styles.manaSymbol}>{'{G}'}</span>
      </div>
      <div className={styles.links}>
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/collection">Collection</Link>
        <Link to="/decks">Decks</Link>
        {user ? (
          <>
            <span>{user.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar