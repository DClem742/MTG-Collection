import { useState } from 'react'
import { useDeck } from '../context/DeckContext'
import SearchForm from '../components/SearchForm'
import styles from '../styles/DeckBuilder.module.css'

function DeckBuilderPage() {
  const { deck, addToDeck, removeDeck } = useDeck()
  const [searchResults, setSearchResults] = useState([])
  const [filters, setFilters] = useState({
    set: '',
    type: '',
    color: ''
  })

  const sets = [...new Set(searchResults.map(card => card.set_name))]
  const cardTypes = [
    'Creature',
    'Land',
    'Sorcery',
    'Instant',
    'Artifact',
    'Enchantment',
    'Planeswalker'
  ]
  const colors = ['White', 'Blue', 'Black', 'Red', 'Green', 'Colorless', 'Multicolor']

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

  const filteredResults = searchResults.filter(card => {
    const matchesSet = !filters.set || card.set_name === filters.set
    const matchesType = !filters.type || card.type_line?.includes(filters.type)
    const matchesColor = !filters.color || getCardColor(card) === filters.color
    return matchesSet && matchesType && matchesColor
  })

  return (
    <div className={styles.deckBuilderPage}>
      <div className={styles.searchSection}>
        <h2>Search Cards</h2>
        <SearchForm setSearchResults={setSearchResults} />
        
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
        </div>

        <div className={styles.searchResults}>
          {filteredResults.map(card => (
            <div key={card.id} className={styles.cardResult}>
              <img src={card.image_uris?.small} alt={card.name} />
              <button onClick={() => addToDeck(card)}>Add to Deck</button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.deckSection}>
        <h2>Current Deck</h2>
        <div className={styles.deckCards}>
          {deck.map(card => (
            <div key={card.id} className={styles.deckCard}>
              <img src={card.image_uris?.small} alt={card.name} />
              <p>{card.name}</p>
              <button onClick={() => removeDeck(card.id)}>Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DeckBuilderPage