import { Link } from 'react-router-dom'
import styles from '../styles/HomePage.module.css'

function HomePage() {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.navigationCards}>
        <Link to="/search" className={styles.navCard}>
          <h2>Search Cards</h2>
          <p>Browse through thousands of Magic: The Gathering cards</p>
        </Link>

        <Link to="/collection" className={styles.navCard}>
          <h2>Build Collection</h2>
          <p>Track and manage your personal card collection</p>
        </Link>

        <Link to="/decks" className={styles.navCard}>
          <h2>Create Decks</h2>
          <p>Build and organize your favorite decks</p>
        </Link>
      </div>
    </div>
  )
}

export default HomePage