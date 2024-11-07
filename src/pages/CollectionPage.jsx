import { useCollection } from '../context/CollectionContext'
import { useTrade } from '../context/TradeContext'
import { useState } from 'react'
import styles from '../styles/CollectionPage.module.css'
import CardDetailsModal from '../components/CardDetailsModal'

function CollectionPage() {
  const { collection, updateQuantity } = useCollection()
  const { listCardForTrade } = useTrade()
  const [selectedCard, setSelectedCard] = useState(null)
  const [filters, setFilters] = useState({
    set: '',
    color: '',
    type: '',
    rarity: '',
    condition: ''
  })
  
  // Add sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  })

  // Add sorting handler
  const handleSort = (key) => {
    let direction = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const conditions = ['NM', 'LP', 'MP', 'HP']
  const conditionMultipliers = {
    NM: 1,
    LP: 0.85,
    MP: 0.70,
    HP: 0.50
  }

  const [searchTerm, setSearchTerm] = useState('')

  const sets = [...new Set(collection.map(card => card.set_name))]
  const rarities = [...new Set(collection.map(card => card.rarity))]

  const cardTypes = [
    'Creature',
    'Land',
    'Sorcery',
    'Instant',
    'Artifact',
    'Enchantment',
    'Planeswalker',
    'Battle',
    'Kindred'
  ]

  const colorOptions = ['White', 'Blue', 'Black', 'Red', 'Green', 'Colorless', 'Multicolor']
  
  const colorMap = {
    'White': 'W',
    'Blue': 'U',
    'Black': 'B',
    'Red': 'R',
    'Green': 'G'
  }

  const getCardColorCategory = (card) => {
    if (!card.colors || card.colors.length === 0) return 'Colorless'
    if (card.colors.length > 1) return 'Multicolor'
    const colorLetter = card.colors[0]
    return Object.keys(colorMap).find(key => colorMap[key] === colorLetter) || 'Unknown'
  }

  const fuzzyMatch = (str, pattern) => {
    const cleanStr = str.toLowerCase()
    const cleanPattern = pattern.toLowerCase()
    return cleanStr.includes(cleanPattern)
  }

  // Update your filteredCollection to include sorting
  const filteredCollection = collection.filter(card => {
    const matchesSearch = !searchTerm || 
      fuzzyMatch(card.name, searchTerm) || 
      fuzzyMatch(card.type_line || '', searchTerm) ||
      fuzzyMatch(card.oracle_text || '', searchTerm)

    const matchesColor = !filters.color || 
      (filters.color === 'Colorless' && (!card.colors || card.colors.length === 0)) ||
      (filters.color === 'Multicolor' && card.colors?.length > 1) ||
      (filters.color && card.colors?.includes(colorMap[filters.color]))
    
    const matchesType = !filters.type || card.type_line?.toLowerCase().includes(filters.type.toLowerCase())
    
    return matchesSearch &&
           (!filters.condition || card.condition === filters.condition) &&
           (!filters.set || card.set_name === filters.set) &&
           matchesColor &&
           matchesType &&
           (!filters.rarity || card.rarity === filters.rarity)
  }).sort((a, b) => {
    if (!sortConfig.key) return 0
    
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'ascending' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    }
    if (sortConfig.key === 'set') {
      return sortConfig.direction === 'ascending'
        ? a.set_name.localeCompare(b.set_name)
        : b.set_name.localeCompare(a.set_name)
    }
    if (sortConfig.key === 'price') {
      const priceA = parseFloat(a.prices?.usd) || 0
      const priceB = parseFloat(b.prices?.usd) || 0
      return sortConfig.direction === 'ascending' 
        ? priceA - priceB 
        : priceB - priceA
    }
    return 0
  })

  const totalValue = collection.reduce((sum, card) => {
    const cardPrice = parseFloat(card.prices?.usd) || 0
    return sum + (cardPrice * (card.quantity || 1))
  }, 0)

  return (
    <div className={styles.collectionPage}>
      <h1>My Collection</h1>
      <h2>Total Collection Value: ${totalValue.toFixed(2)}</h2>
      
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      
      <div className={styles.filterControls}>
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
          value={filters.color} 
          onChange={(e) => setFilters(prev => ({...prev, color: e.target.value}))}
        >
          <option value="">All Colors</option>
          {colorOptions.map(color => (
            <option key={color} value={color}>{color}</option>
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
          value={filters.rarity} 
          onChange={(e) => setFilters(prev => ({...prev, rarity: e.target.value}))}
        >
          <option value="">All Rarities</option>
          {rarities.map(rarity => (
            <option key={rarity} value={rarity}>{rarity}</option>
          ))}
        </select>

        <select 
          className={styles.conditionSelect}
          value={filters.condition} 
          onChange={(e) => setFilters(prev => ({...prev, condition: e.target.value}))}
        >
          <option value="">All Conditions</option>
          {conditions.map(condition => (
            <option key={condition} value={condition}>{condition}</option>
          ))}
        </select>
      </div>

      <table className={styles.collectionTable}>
        <thead>
          <tr>
            <th>Card Image</th>
            <th className={styles.sortableHeader} onClick={() => handleSort('name')}>
              Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th className={styles.sortableHeader} onClick={() => handleSort('set')}>
              Set {sortConfig.key === 'set' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th>Condition</th>
            <th className={styles.sortableHeader} onClick={() => handleSort('price')}>
              Price {sortConfig.key === 'price' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th>Quantity</th>
            <th>Total Value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCollection.map((card) => (
            <tr key={card.id}>
              <td onClick={() => setSelectedCard(card)}>
                <img 
                  src={card.image_uris?.small} 
                  alt={card.name} 
                  className={styles.cardThumbnail}
                />
              </td>
              <td>{card.name}</td>
              <td>{card.set_name}</td>
              <td>
                <select 
                  className={`${styles.conditionSelect} ${styles[`condition${card.condition || 'NM'}`]}`}
                  value={card.condition || 'NM'}
                  onChange={(e) => updateQuantity(card.id, card.quantity, e.target.value)}
                >
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </td>
              <td>${card.prices?.usd || '0.00'}</td>
              <td className={styles.quantityControls}>
                <button onClick={() => updateQuantity(card.id, (card.quantity || 1) - 1)}>-</button>
                <span className={styles.currentQuantity}>{card.quantity || 1}</span>
                <button onClick={() => updateQuantity(card.id, (card.quantity || 1) + 1)}>+</button>
              </td>
              <td>${((parseFloat(card.prices?.usd) || 0) * (card.quantity || 1)).toFixed(2)}</td>
              <td>
                <button onClick={() => updateQuantity(card.id, 0)}>Remove</button>
                <button 
                  onClick={() => listCardForTrade(card)}
                  className={styles.tradeButton}
                >
                  List for Trade
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCard && (
        <CardDetailsModal 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
    </div>
  )
}

export default CollectionPage