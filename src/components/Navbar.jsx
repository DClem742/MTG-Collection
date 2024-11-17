import { Link } from 'react-router-dom'
import styles from '../styles/Navbar.module.css'
function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand}>
        Mythic Mana
      </Link>
      <div className={styles.links}>
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/collection">Collection</Link>
        <Link to="/decks">Decks</Link>
        <button className={styles.logoutButton}>Logout</button>
      </div>
    </nav>
  )
}
export default Navbar