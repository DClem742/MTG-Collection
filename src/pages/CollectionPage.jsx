import { useState, useEffect } from 'react'
import { useCollection } from '../context/CollectionContext'
import styles from '../styles/CollectionPage.module.css'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'

function CollectionPage() {
  const { collection, updateQuantity, removeAllCards } = useCollection()
  const [isLoading, setIsLoading] = useState(false)
  const [cardPrices, setCardPrices] = useState({})
  const [filters, setFilters] = useState({
    set: '',
    type: '',
    color: ''
  })
  const [showResults, setShowResults] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [cardSize, setCardSize] = useState('medium')
  const [isCompactMode, setIsCompactMode] = useState(false)
  const [flippedCards, setFlippedCards] = useState({})

  const handleCardFlip = (cardId) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }

  const getColorClass = (card) => {
    if (!card.colors || card.colors.length === 0) return 'colorlessCard'    
    if (card.colors.length === 2) {
      const colorPair = card.colors.sort().join('')
      const colorPairMap = {
        'BG': 'greenBlackCard',
        'RW': 'redWhiteCard', 
        'RU': 'blueRedCard',
        'UW': 'whiteBlueCard',
        'BR': 'blackRedCard',
        'BW': 'whiteBlackCard',
        'GW': 'greenWhiteCard',
        'GU': 'greenBlueCard',
        'BU': 'blueBlackCard',
        'GR': 'greenRedCard'
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

  const handleRemoveAll = () => {
    if (window.confirm('Are you sure you want to remove all cards from your collection?')) {
      removeAllCards()
      setShowResults(false)
    }
  }

  const sets = [...new Set(collection.map(card => card.set_name))].sort((a, b) => 
    a.localeCompare(b)
  )
  const cardTypes = [
    'Creature',
    'Instant',
    'Sorcery',
    'Artifact',
    'Enchantment',
    'Planeswalker',
    'Land'
  ]
  const colors = ['White', 'Blue', 'Black', 'Red', 'Green', 'Colorless', 'Multicolor']

  const categories = {
    all: 'All Cards',
    creatures: 'Creatures',
    instants: 'Instants',
    sorceries: 'Sorceries',
    artifacts: 'Artifacts',
    enchantments: 'Enchantments',
    planeswalkers: 'Planeswalkers',
    lands: 'Lands'
  }

  const getCategoryCards = (cards, category) => {
    if (category === 'all') return cards
    return cards.filter(card => 
      card.type_line?.toLowerCase().includes(category.slice(0, -1).toLowerCase())
    )
  }

  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoading(true)
      const prices = {}
      
      const batchSize = 10
      for (let i = 0; i < collection.length; i += batchSize) {
        const batch = collection.slice(i, i + batchSize)
        
        try {
          await Promise.all(
            batch.map(async (card) => {
              try {
                const response = await fetch(`https://api.scryfall.com/cards/${card.id}`)
                if (!response.ok) throw new Error('Network response was not ok')
                const data = await response.json()
                prices[card.id] = data.prices
              } catch (cardError) {
                console.log(`Price fetch failed for card ${card.name}`)
                prices[card.id] = { usd: '0.00' }
              }
            })
          )
          
          if (i + batchSize < collection.length) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        } catch (batchError) {
          console.log('Batch processing error:', batchError)
        }
      }
      
      setCardPrices(prices)
      setIsLoading(false)
    }

    if (collection.length > 0) {
      fetchPrices()
    }
  }, [collection])

  const filteredCollection = collection.filter(card => {
    const matchesSet = !filters.set || card.set_name === filters.set
    const matchesType = !filters.type || card.type_line?.includes(filters.type)
    const matchesColor = !filters.color || 
      (filters.color === 'Multicolor' ? card.colors?.length > 1 : getColorClass(card).includes(filters.color.toLowerCase()))
    const matchesCategory = activeCategory === 'all' || 
      card.type_line?.toLowerCase().includes(activeCategory.slice(0, -1).toLowerCase())
    return matchesSet && matchesType && matchesColor && matchesCategory
  })

  const handleSearch = () => {
    setShowResults(true)
  }
  return (
    <div className={styles.collectionPage}>
      
      
      <div className={styles.displayControls}>
        <div className={styles.viewControls}>
          <button 
            className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </button>
          <button 
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
        </div>

        {/* <div className={styles.sizeControls}>
          <button 
            className={`${styles.sizeButton} ${cardSize === 'small' ? styles.active : ''}`}
            onClick={() => setCardSize('small')}
          >
            Small
          </button>
          <button 
            className={`${styles.sizeButton} ${cardSize === 'medium' ? styles.active : ''}`}
            onClick={() => setCardSize('medium')}
          >
            Medium
          </button>
          <button 
            className={`${styles.sizeButton} ${cardSize === 'large' ? styles.active : ''}`}
            onClick={() => setCardSize('large')}
          >
            Large
          </button>
        </div> */}

       {/* <div className={styles.compactControl}>
          <label>
            <input
              type="checkbox"
              checked={isCompactMode}
              onChange={(e) => setIsCompactMode(e.target.checked)}
            />
            Compact Mode
          </label>
        </div> */}
      </div>
      
      <div className={styles.filters}>
        <select 
          value={filters.set}
          onChange={(e) => setFilters(prev => ({...prev, set: e.target.value}))}
        >
          <option value="">All Sets</option>
          {sets.map(set => (
            <option key={set} value={set}>{set}</option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
        >
          <option value="">All Types</option>
          {cardTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={filters.color}
          onChange={(e) => setFilters(prev => ({...prev, color: e.target.value}))}
        >
          <option value="">All Colors</option>
          {colors.map(color => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>

        <button onClick={handleSearch} className={styles.searchButton}>
          Search Collection
        </button>
        <button 
          onClick={handleRemoveAll} 
          className={`${styles.searchButton} ${styles.removeAllButton}`}
        >
          Remove All Cards
        </button>
      </div>

      {showResults && (
        <div className={styles.results}>
          <h2>Search Results</h2>
          <h3>Total Value: ${filteredCollection.reduce((total, card) => 
            total + ((parseFloat(cardPrices[card.id]?.usd) || 0) * (card.quantity || 1)), 0).toFixed(2)}
          </h3>
          
          <div className={`${styles.collectionDisplay} ${styles[viewMode]} ${styles[cardSize]} ${isCompactMode ? styles.compact : ''}`}>
            {viewMode === 'grid' ? (
              <div className={styles.cardGrid}>
                {filteredCollection.map((card) => (
                  <div 
                    key={card.id} 
                    className={`${styles.cardGridItem} ${styles[getColorClass(card)]} ${flippedCards[card.id] ? styles.flipped : ''}`}
                    onClick={() => handleCardFlip(card.id)}
                  >
                    <div className={styles.cardInner}>
                      <div className={styles.cardFront}>
                        {card.card_faces && card.card_faces[0].image_uris ? (
                          <img 
                            src={card.card_faces[0].image_uris.normal} 
                            alt={`${card.name} front face`}
                            className={styles.cardImage}
                          />
                        ) : (
                          <img 
                            src={card.image_uris?.normal} 
                            alt={card.name} 
                            className={styles.cardImage}
                          />
                        )}
                      </div>
                      <div className={styles.cardBack}>
                        <h3>{card.name}</h3>
                        <p>Set: {card.set_name}</p>
                        <p>Type: {card.type_line}</p>
                        <p>Rarity: {card.rarity}</p>
                        <p>Oracle Text: {card.oracle_text}</p>
                        <p>Price: ${cardPrices[card.id]?.usd || '0.00'}</p>
                        <p>Quantity: {card.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (              <table className={styles.collectionTable}>
                <thead>
                  <tr>
                    <th>Card Image</th>
                    <th>Name</th>
                    <th>Set</th>
                    <th>Collector Number</th>
                    <th>Price</th>
                    <th>Current Quantity</th>
                    <th>Total Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCollection.map((card) => (
                    <tr key={card.id}>
                      <td>
                        {card.card_faces && card.card_faces[0].image_uris ? (
                          <div className={styles.doubleFaced}>
                            <img 
                              src={card.card_faces[0].image_uris.small} 
                              alt={card.name}
                              className={styles.cardThumbnail}
                            />
                            <img 
                              src={card.card_faces[1].image_uris.small} 
                              alt={card.name}
                              className={styles.cardThumbnail}
                            />
                          </div>
                        ) : (
                          <img 
                            src={card.image_uris?.small} 
                            alt={card.name} 
                            className={styles.cardThumbnail}
                          />
                        )}
                      </td>
                      <td>{card.name}</td>
                      <td>{card.set_name}</td>
                      <td>{card.collector_number}</td>
                      <td>${cardPrices[card.id]?.usd || '0.00'}</td>
                      <td className={styles.quantityControls}>
                        <button onClick={() => updateQuantity(card.id, (card.quantity || 1) - 1)}>-</button>
                        <span className={styles.currentQuantity}>{card.quantity || 1}</span>
                        <button onClick={() => updateQuantity(card.id, (card.quantity || 1) + 1)}>+</button>
                      </td>
                      <td>${((parseFloat(cardPrices[card.id]?.usd) || 0) * (card.quantity || 1)).toFixed(2)}</td>
                      <td>
                        <button onClick={() => updateQuantity(card.id, 0)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CollectionPage

const handleCardFlip = (cardId) => {
  setFlippedCards(prev => ({
    ...prev,
    [cardId]: !prev[cardId]
  }))
}