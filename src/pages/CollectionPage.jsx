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
    const colorPairMap = {
      'BG': 'greenBlackCard',
      'BR': 'blackRedCard',
      'BU': 'blackBlueCard',
      'BW': 'whiteBlackCard',
      'GR': 'greenRedCard',
      'GU': 'greenBlueCard',
      'GW': 'greenWhiteCard',
      'RU': 'blueRedCard',
      'RW': 'redWhiteCard',
      'UW': 'whiteBlueCard'
    }

    const colorMap = {
      'W': 'whiteCard',
      'U': 'blueCard',
      'B': 'blackCard',
      'R': 'redCard',
      'G': 'greenCard'
    }

    if (!card.color_identity || card.color_identity.length === 0) return 'colorlessCard'    
    
    if (card.color_identity.length === 2) {
      const colorPair = card.color_identity.sort().join('')
      console.log('Two-colored card:', card.name, 'Color pair:', colorPair, 'Applied class:', colorPairMap[colorPair])
      return colorPairMap[colorPair]
    }

    if (card.color_identity.length > 2) return 'multiCard'

    return colorMap[card.color_identity[0]]
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
      
      const batchSize = 5
      for (let i = 0; i < collection.length; i += batchSize) {
        const batch = collection.slice(i, i + batchSize)
        
        try {
          await Promise.all(
            batch.map(async (card) => {
              const response = await fetch(`https://api.scryfall.com/cards/${card.id}`, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json'
                },
                mode: 'cors'
              })
              
              if (response.status === 429) {
                await new Promise(resolve => setTimeout(resolve, 500))
                return
              }

              if (response.ok) {
                const data = await response.json()
                prices[card.id] = data.prices
              }
            })
          )
          
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (error) {
          console.log('Batch processing error:', error)
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
            ) : (
              <table className={styles.collectionTable}>
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
