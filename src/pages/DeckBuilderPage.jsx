import { useState } from 'react'
import { useDeck } from '../context/DeckContext'
import SearchForm from '../components/SearchForm'
import styles from '../styles/DeckBuilder.module.css'

function DeckBuilderPage() {
  const { deck, addToDeck, removeDeck } = useDeck()
  const [searchResults, setSearchResults] = useState([])
  const [searchPerformed, setSearchPerformed] = useState(false)

  const handleSearch = (results) => {
    setSearchResults(results)
    setSearchPerformed(true)
  }

  return (
    <div className={styles.deckBuilderPage}>
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