import { Link } from 'react-router-dom'
import styles from '../styles/HomePage.module.css'

function HomePage() {
  return (
    <div className={styles.homePage}>
      <h1>Welcome to MTG Collection Tracker</h1>
      <div className={styles.description}>
        <p>
          Your ultimate destination for managing your Magic: The Gathering collection. 
          Search through your cards, build powerful decks, and track your growing collection 
          with our intuitive tools designed for MTG enthusiasts.
        </p>
      </div>
      <div className={styles.navigationCards}>
        <Link to="/search" className={styles.navCard}>
          <h2>Search Cards</h2>
          <p>Find and add new cards to your collection</p>
        </Link>
        <Link to="/collection" className={styles.navCard}>
          <h2>View Collection</h2>
          <p>Browse and manage your card collection</p>
        </Link>
        <Link to="/decks" className={styles.navCard}>
          <h2>View Decks</h2>
          <p>Build and manage your decks</p>
        </Link>
      </div>
    </div>
  )
}

export default HomePage
