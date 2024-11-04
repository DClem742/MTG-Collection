import { Link } from 'react-router-dom'
import styles from '../styles/Navbar.module.css'

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>MTG Collection</div>
      <ul className={styles.navLinks}>
        <li>
          <Link to="/">Search</Link>
        </li>
        <li>
          <Link to="/collection">Collection</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
