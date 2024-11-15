import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from '../styles/HomePage.module.css'

function HomePage() {
  const [isFanned, setIsFanned] = useState(false)
  const [cards, setCards] = useState([])
  
  const fetchRandomCards = async () => {
    try {
      const cardPromises = Array(8).fill().map(() => 
        fetch('https://api.scryfall.com/cards/random?q=game:paper+is:hires')
          .then(res => res.json())
      )
      
      const cards = await Promise.all(cardPromises)
      const cardUrls = cards.map(card => 
        card.card_faces?.[0].image_uris?.normal || card.image_uris?.normal || '/images/MtgCardBack.jpeg'
      )
      setCards(cardUrls)
    } catch (error) {
      console.log('Error fetching cards:', error)
      setCards(Array(8).fill('/images/MtgCardBack.jpeg'))
    }
  }

  const handleFanClick = () => {
    if (!isFanned) {
      fetchRandomCards()
    }
    setIsFanned(!isFanned)
  }

  useEffect(() => {
    fetchRandomCards()
  }, [])

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

      <div className={styles.cardFan} onClick={handleFanClick}>
        {cards.map((card, index) => (
          <div 
            key={index} 
            className={`${styles.card} ${isFanned ? styles.fanned : ''}`}
            style={{
              backgroundImage: `url(${isFanned ? card : '/images/MtgCardBack.jpeg'})`,
              '--index': index,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default HomePage