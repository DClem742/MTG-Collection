import { useState } from 'react'
import { useCollection } from '../context/CollectionContext'
import SearchForm from '../components/SearchForm'
import styles from '../styles/SearchPage.module.css'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'

/**
 * SearchPage Component
 * Main interface for searching and adding MTG cards to collection
 * Features:
 * - Card search results display
 * - Batch add to collection
 * - Double-faced card support
 * - Lazy loaded card images
 */
function SearchPage() {
  // State management for search results and card display
  const [searchResults, setSearchResults] = useState([])
  const { addToCollection } = useCollection()
  const [flippedCards, setFlippedCards] = useState({})

  // Handle flipping of double-faced cards
  const handleCardFlip = (cardId) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }

  // Add all displayed cards to collection
  const handleAddAllToCollection = () => {
    searchResults.forEach(card => addToCollection(card))
  }

  return (
    <div className={styles.searchPage}>
      {/* Search form component */}
      <SearchForm setSearchResults={setSearchResults} />
      
      {/* Search results display */}
      {searchResults.length > 0 && (
        <div className={styles.results}>
          {/* Batch add button */}
          <button 
            onClick={handleAddAllToCollection}
            className={styles.addAllButton}
          >
            Add All to Collection
          </button>
          
          {/* Card grid display */}
          <div className={styles.cardGrid}>
            {searchResults.map(card => (
              <div key={card.id} className={styles.cardResult}>
                {/* Handle double-faced cards */}
                {card.card_faces ? (
                  <div className={styles.cardImage} onClick={() => handleCardFlip(card.id)}>
                    <img 
                      src={flippedCards[card.id] ? card.card_faces[1].image_uris?.small : card.card_faces[0].image_uris?.small} 
                      alt={card.name}
                    />
                    <span className={styles.flipHint}>Click to flip</span>
                  </div>
                ) : (
                  <img src={card.image_uris?.small} alt={card.name} />
                )}
                {/* Card info and add button */}
                <div className={styles.cardInfo}>
                  <h3>{card.name}</h3>
                  <button onClick={() => addToCollection(card)}>Add to Collection</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchPage