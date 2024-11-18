import { Link } from 'react-router-dom'
import styles from '../styles/Navbar.module.css'
function Navbar() {
  console.log('Applied styles:', styles)
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand}>
        Mythic Mana
      </Link>
      <div className={styles.links}>
        <Link to="/" className={styles.mainNavLink}>Home</Link>
        <Link to="/search" className={styles.mainNavLink}>Search</Link>
        <Link to="/collection" className={styles.mainNavLink}>Collection</Link>
        <Link to="/decks" className={styles.mainNavLink}>Decks</Link>
        <button className={styles.logoutButton}>Logout</button>
      </div>
    </nav>
  )
}export default Navbar