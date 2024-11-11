import { useState } from 'react'
import { useCollection } from '../context/CollectionContext'
import styles from '../styles/SearchForm.module.css'

function SearchForm() {
  const { addToCollection } = useCollection()
  const [searchTerm, setSearchTerm] = useState('')
  const [bulkSearchTerm, setBulkSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [flippedCards, setFlippedCards] = useState({})

  const handleSearch = async (value) => {
    setSearchTerm(value)
    if (!value.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(value)}`
      )
      const data = await response.json()
      setSearchResults(data.data || [])
    } catch (error) {
      console.error('Error fetching cards:', error)
      setSearchResults([])
    }
  }

  const handleBulkSearch = async () => {
    const cardNames = bulkSearchTerm.split('\n').filter(name => name.trim())
    let results = []

    for (const name of cardNames) {
      try {
        const response = await fetch(
          `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name.trim())}`
        )
        if (response.ok) {
          const data = await response.json()
          results.push(data)
        }
      } catch (error) {
        console.log(`Error searching for ${name}:`, error)
      }
    }
    setSearchResults(results)
  }

  const handleCardFlip = (cardId) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }

  const handleAddCard = (card) => {
    addToCollection(card)
  }

  const getColorClass = (card) => {
    if (!card.colors || card.colors.length === 0) return 'colorlessCard'
    if (card.colors.length > 1) return 'multiCard'
    
    const colorMap = {
      W: 'whiteCard',
      U: 'blueCard',
      B: 'blackCard',
      R: 'redCard',
      G: 'greenCard'
    }
    
    return colorMap[card.colors[0]]
  }

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchWrapper}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search for Magic cards..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      <div className={styles.bulkSearch}>
        <textarea
          value={bulkSearchTerm}
          onChange={(e) => setBulkSearchTerm(e.target.value)}
          placeholder="Enter multiple card names (one per line)"
          className={styles.bulkSearchInput}
        />
        <button 
          className={styles.bulkSearchButton}
          onClick={handleBulkSearch}
        >
          Search Multiple Cards
        </button>
      </div>
      
      <div className={styles.searchResults}>
        {searchResults.map(card => (
          <div key={card.id} className={`${styles.cardResult} ${styles[getColorClass(card)]}`}>
            {card.layout === 'transform' ? (
              <div className={styles.cardImage} onClick={() => handleCardFlip(card.id)}>
                <img 
                  src={card.card_faces[flippedCards[card.id] ? 1 : 0].image_uris.normal}
                  alt={card.name}
                />
                <span className={styles.flipHint}>Click to flip</span>
              </div>
            ) : (
              <img 
                src={card.image_uris?.normal} 
                alt={card.name} 
                className={styles.cardImage}
              />
            )}
            <div className={styles.cardInfo}>
              <h3>{card.name}</h3>
              <p>Set: {card.set_name}</p>
              <p>Type: {card.type_line}</p>
              <p>Mana Cost: {card.mana_cost}</p>
              <button 
                className={styles.addButton}
                onClick={() => handleAddCard(card)}
              >
                Add to Collection
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchForm