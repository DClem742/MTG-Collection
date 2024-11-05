import { useCollection } from '../context/CollectionContext'
import { useState } from 'react'
import styles from '../styles/CollectionPage.module.css'
import CardDetailsModal from '../components/CardDetailsModal'

function CollectionPage() {
  const { collection, updateQuantity } = useCollection()
  const [filters, setFilters] = useState({
    set: '',
    color: '',
    type: '',
    rarity: ''
  })
  const [selectedCard, setSelectedCard] = useState(null)

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

  const filteredCollection = collection.filter(card => {
    const cardColorCategory = getCardColorCategory(card)
    const matchesColor = !filters.color || 
      (filters.color === 'Colorless' && (!card.colors || card.colors.length === 0)) ||
      (filters.color === 'Multicolor' && card.colors?.length > 1) ||
      (filters.color && card.colors?.includes(colorMap[filters.color]))
    
    const matchesType = !filters.type || card.type_line?.toLowerCase().includes(filters.type.toLowerCase())
    
    return (!filters.set || card.set_name === filters.set) &&
           matchesColor &&
           matchesType &&
           (!filters.rarity || card.rarity === filters.rarity)
  })

  return (
    <div className={styles.collectionPage}>
      <h1>My Collection</h1>
      
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
      </div>

      <table className={styles.collectionTable}>
        <thead>
          <tr>
            <th>Card Image</th>
            <th>Name</th>
            <th>Set</th>
            <th>Collector Number</th>
            <th>Current Quantity</th>
            <th>Adjust Quantity</th>
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
                  style={{ cursor: 'pointer' }}
                />
              </td>
              <td>{card.name}</td>
              <td>{card.set_name}</td>
              <td>{card.collector_number}</td>
              <td className={styles.currentQuantity}>{card.quantity || 1}</td>
              <td className={styles.quantityControls}>
                <button onClick={() => updateQuantity(card.id, (card.quantity || 1) - 1)}>-</button>
                <button onClick={() => updateQuantity(card.id, (card.quantity || 1) + 1)}>+</button>
              </td>
              <td>
                <button onClick={() => updateQuantity(card.id, 0)}>Remove</button>
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