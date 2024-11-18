import styles from '../styles/HomePage.module.css'

function HomePage() {
  return (
    <div className={styles.homeContainer}>
      
      <div className={styles.featureGrid}>
        <div className={styles.featureCard}>
          <h2>Search Cards</h2>
          <p>Browse through thousands of Magic: The Gathering cards</p>
        </div>

        <div className={styles.featureCard}>
          <h2>Build Collection</h2>
          <p>Track and manage your personal card collection</p>
        </div>

        <div className={styles.featureCard}>
          <h2>Create Decks</h2>
          <p>Build and organize your favorite decks</p>
        </div>
      </div>
    </div>
  )
}
export default HomePage