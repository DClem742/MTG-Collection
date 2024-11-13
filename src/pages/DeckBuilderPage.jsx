import { useState } from 'react'
import { useDeck } from '../context/DeckContext'
import SearchForm from '../components/SearchForm'
import styles from '../styles/DeckBuilder.module.css'
function DeckBuilderPage() {
  const { deck, addToDeck, removeDeck } = useDeck()
  const [searchResults, setSearchResults] = useState([])
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [sortBy, setSortBy] = useState('name')

  const sortedDeck = [...deck].sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'set':
        return a.set_name.localeCompare(b.set_name)
      case 'colors':
        return a.colors?.join('').localeCompare(b.colors?.join(''))
      default:
        return 0
    }
  })

  const handleSearch = (results) => {
    setSearchResults(results)
    setSearchPerformed(true)
  }

  return (
    <div className={styles.deckBuilderPage}>
      <div className={styles.deckControls}>
        <button>Create New Deck</button>
        <select 
          className={styles.sortSelect}
          onChange={(e) => setSortBy(e.target.value)}
          value={sortBy}
        >
          <option value="name">Sort by Name</option>
          <option value="set">Sort by Set</option>
          <option value="colors">Sort by Colors</option>
        </select>
      </div>
      <div className={styles.searchSection}>
        <h2>Search Cards in Collection</h2>
        <SearchForm setSearchResults={handleSearch} />
        
        {searchPerformed && (
          <div className={styles.searchResults}>
            {searchResults.map(card => (
              <div key={card.id} className={styles.cardResult}>
                <img src={card.image_uris?.small} alt={card.name} />
                <div className={styles.cardInfo}>
                  <h3>{card.name}</h3>
                  <p>Set: {card.set_name}</p>
                  <p>Type: {card.type_line}</p>
                  <p>Mana Cost: {card.mana_cost}</p>
                </div>
                <button onClick={() => addToDeck(card)}>Add to Deck</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.deckSection}>
        <h2>Current Deck</h2>
        <div className={styles.deckCards}>
          {sortedDeck.map(card => (
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