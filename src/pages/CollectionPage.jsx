import { useState, useEffect } from 'react'
import { useCollection } from '../context/CollectionContext'
import styles from '../styles/CollectionPage.module.css'

function CollectionPage() {
  const { collection, updateQuantity } = useCollection()
  const [isLoading, setIsLoading] = useState(false)
  const [cardPrices, setCardPrices] = useState({})
  const [filters, setFilters] = useState({
    set: '',
    type: '',
    color: ''
  })
  const [showResults, setShowResults] = useState(false)

  const sets = [...new Set(collection.map(card => card.set_name))]
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

  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoading(true)
      const prices = {}
      await Promise.all(
        collection.map(async (card) => {
          const response = await fetch(`https://api.scryfall.com/cards/${card.id}`)
          const data = await response.json()
          prices[card.id] = data.prices
        })
      )
      setCardPrices(prices)
      setIsLoading(false)
    }

    fetchPrices()
  }, [collection])

  const filteredCollection = collection.filter(card => {
    const matchesSet = !filters.set || card.set_name === filters.set
    const matchesType = !filters.type || card.type_line?.includes(filters.type)
    const matchesColor = !filters.color || getCardColor(card) === filters.color
    return matchesSet && matchesType && matchesColor
  })

  const handleSearch = () => {
    setShowResults(true)
  }

  return (
    <div className={styles.collectionPage}>
      <h1>My Collection</h1>
      
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
      </div>

      {showResults && (
        <>
          <h2>Search Results</h2>
          <h3>Total Value: ${filteredCollection.reduce((total, card) => 
            total + ((parseFloat(cardPrices[card.id]?.usd) || 0) * (card.quantity || 1)), 0).toFixed(2)}
          </h3>
          
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
        </>
      )}
    </div>
  )
}
export default CollectionPage

const getCardColor = (card) => {
  if (!card.colors || card.colors.length === 0) return 'Colorless'
  if (card.colors.length > 1) return 'Multicolor'
  const colorMap = {
    W: 'White',
    U: 'Blue',
    B: 'Black',
    R: 'Red',
    G: 'Green'
  }
  return colorMap[card.colors[0]]
}
