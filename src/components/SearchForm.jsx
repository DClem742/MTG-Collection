import { useState } from 'react'
import { useCollection } from '../context/CollectionContext'
import styles from '../styles/SearchForm.module.css'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'

function SearchForm() {
  const { addToCollection } = useCollection()
  const [searchTerm, setSearchTerm] = useState('')
  const [bulkSearchTerm, setBulkSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [flippedCards, setFlippedCards] = useState({})

  const renderManaSymbols = (manaCost) => {
    return manaCost?.replace(/[{}]/g, '').split('').map((symbol, index) => (
      <i key={index} className={`ms ms-${symbol.toLowerCase()} ms-cost`}></i>
    ))
  }

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
    return (
      <button 
        className={styles.addButton}
        onClick={() => handleAddCard(card)}
        style={{
          backgroundColor: card.colors?.length === 1 ? 
            card.colors[0] === 'W' ? '#f8e7b9' :
            card.colors[0] === 'U' ? '#0e68ab' :
            card.colors[0] === 'B' ? '#800080' :
            card.colors[0] === 'R' ? '#d3202a' :
            card.colors[0] === 'G' ? '#00733e' :
            '#c0c0c0' : 
          card.colors?.length >= 3 ? '#cfb53b' : null,
          color: card.colors?.length === 1 && card.colors[0] === 'W' ? '#000000' : '#ffffff'
        }}
      >
        Add to Collection
      </button>
    )
  }

  const getColorClass = (card) => {
    if (!card.colors || card.colors.length === 0) return 'colorlessCard'
  
    if (card.colors.length === 2) {
      // Sort the colors to ensure consistent ordering
      const colorPair = card.colors.sort().join('')
      const colorPairMap = {
        'BG': 'greenBlackCard',    // Golgari
        'RW': 'redWhiteCard',      // Boros
        'RU': 'blueRedCard',       // Izzet
        'UW': 'whiteBlueCard',     // Azorius
        'BR': 'blackRedCard',      // Rakdos
        'BW': 'whiteBlackCard',    // Orzhov
        'GW': 'greenWhiteCard',    // Selesnya
        'GU': 'greenBlueCard',     // Simic
        'BU': 'blueBlackCard',     // Dimir
        'GR': 'greenRedCard'       // Gruul
      }
      return colorPairMap[colorPair]
    }
  
    if (card.colors.length > 2) return 'multiCard'
  
    const colorMap = {
      W: 'whiteCard',
      U: 'blueCard',
      B: 'blackCard',
      R: 'redCard',
      G: 'greenCard'
    }
  
    return colorMap[card.colors[0]]
  }  

  // Add this handler function near your other handlers
  const handleAddAllToCollection = () => {
    searchResults.forEach(card => addToCollection(card))
  }

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchWrapper}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Start typing Magic cards..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      <div className={styles.bulkSearch}>
        <textarea
          value={bulkSearchTerm}
          onChange={(e) => setBulkSearchTerm(e.target.value)}
          placeholder="Enter multiple card names (one per line, exact match)"
          className={styles.bulkSearchInput}
        />
        <button 
          className={styles.bulkSearchButton}
          onClick={handleBulkSearch}
        >
          Search Multiple Cards
        </button>
        {searchResults.length > 0 && (
          <button 
            className={styles.addAllButton}
            onClick={handleAddAllToCollection}
          >
            Add All to Collection
          </button>
        )}
      </div>
      
      <div className={styles.searchResults}>
        {searchResults.map(card => (
          <div key={card.id} className={`${styles.cardResult} ${styles[getColorClass(card)]}`}>
            {(card.layout === 'transform' || card.layout === 'modal_dfc') ? (
              <div className={styles.cardImage} onClick={() => handleCardFlip(card.id)}>
                <LazyLoadImage 
                  src={card.card_faces[flippedCards[card.id] ? 1 : 0].image_uris.normal}
                  alt={card.name}
                  effect="blur"
                  threshold={100}
                />
                <span className={styles.flipHint}>Click to flip</span>
              </div>
            ) : (
              <LazyLoadImage 
                src={card.image_uris?.normal} 
                alt={card.name} 
                className={styles.cardImage}
                effect="blur"
                threshold={100}
              />
            )}
            <div className={styles.cardInfo}>
              <h3>{card.name}</h3>
              <p>Set: {card.set_name}</p>
              <p>Type: {card.type_line}</p>
              <p>Mana Cost: {renderManaSymbols(card.mana_cost)}</p>
              <button 
                className={`${styles.addButton} ${styles[getColorClass(card)]}`}
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

const renderManaSymbols = (manaCost) => {
  return manaCost?.replace(/[{}/]/g, '').split('').map((symbol, index) => (
    <span key={index} className={styles.manaSymbol}>
      {symbol}
    </span>
  ))
}
