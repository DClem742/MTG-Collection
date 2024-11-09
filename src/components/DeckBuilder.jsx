import { useState, useEffect } from 'react'
import { useDeck } from '../context/DeckContext'
import { useCollection } from '../context/CollectionContext'
import styles from '../styles/DeckBuilder.module.css'

function DeckBuilder() {
  const { createDeck, decks, addCardToDeck, getDeckCards, removeCardFromDeck, deleteDeck, setCommander } = useDeck()
  const { collection } = useCollection()
  const [deckName, setDeckName] = useState('')
  const [format, setFormat] = useState('standard')
  const [selectedDeck, setSelectedDeck] = useState(null)
  const [deckCards, setDeckCards] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [bulkSearchTerm, setBulkSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [cardQuantities, setCardQuantities] = useState({})
  const [commander, setCommanderState] = useState(null)
  const [flippedCards, setFlippedCards] = useState({})

  const handleCardFlip = (cardId) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }

  const isValidCommander = (card) => {
    return card.type_line?.includes('Legendary') && card.type_line?.includes('Creature')
  }

  const handleSetCommander = async (card) => {
    if (selectedDeck) {
      // Prepare a clean card object with only the necessary data
      const commanderData = {
        id: card.id,
        name: card.name,
        image_uris: card.image_uris,
        type_line: card.type_line
      }
      
      // Update local state first for immediate feedback
      setCommanderState(commanderData)
      
      // Then update the backend
      await setCommander(selectedDeck.id, commanderData)
    }
  }

  const formats = [
    'standard',
    'modern',
    'commander',
    'pioneer',
    'legacy',
    'vintage',
    'pauper'
  ]

  const handleSearch = (term) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }
    const results = collection.filter(card => 
      card.name.toLowerCase() === term.toLowerCase()
    )
    setSearchResults(results)
  }

  const handleBulkSearch = async () => {
    const cardNames = bulkSearchTerm.split('\n').filter(name => name.trim())
    let results = []

    for (const name of cardNames) {
      const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name.trim())}`
      try {
        const response = await fetch(url)
        if (!response.ok) continue
        const data = await response.json()
        results.push(data)
      } catch (error) {
        console.log(`Error searching for ${name}:`, error)
      }
    }
    setSearchResults(results)
  }

  const handleAddAllToDeck = async () => {
    if (selectedDeck && searchResults.length > 0) {
      for (const card of searchResults) {
        await handleAddCard(card)
      }
      setSearchResults([])
      setBulkSearchTerm('')
    }
  }

  const setCardQuantity = (cardId, quantity) => {
    setCardQuantities(prev => ({
      ...prev,
      [cardId]: Math.max(1, quantity)
    }))
  }

  const handleAddCard = async (card) => {
    if (selectedDeck) {
      const quantity = cardQuantities[card.id] || 1
      await addCardToDeck(selectedDeck.id, card, quantity)
      const updatedCards = await getDeckCards(selectedDeck.id)
      setDeckCards(updatedCards)
      setCardQuantities(prev => ({ ...prev, [card.id]: 1 }))
    }
  }

  useEffect(() => {
    handleSearch(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    if (selectedDeck) {
      const loadDeckData = async () => {
        console.log('Loading deck:', selectedDeck)
        const cards = await getDeckCards(selectedDeck.id)
        setDeckCards(cards)
        
        // Get fresh deck data including commander
        const freshDeckData = decks.find(d => d.id === selectedDeck.id)
        console.log('Fresh deck data:', freshDeckData)
        console.log('Commander data:', freshDeckData?.commander)
        
        setCommanderState(freshDeckData?.commander)
      }
      loadDeckData()
    }
  }, [selectedDeck, decks])

  const handleCreateDeck = async (e) => {
    e.preventDefault()
    const newDeck = await createDeck(deckName, format)
    setSelectedDeck(newDeck)
    setDeckName('')
  }

  const handleDeleteDeck = async (deckId) => {
    if (window.confirm('Are you sure you want to delete this deck?')) {
      await deleteDeck(deckId)
      setSelectedDeck(null)
    }
  }

  const getTotalCardCount = (cards) => {
    return cards.reduce((total, card) => total + (card.quantity || 1), 0)
  }

  const groupCardsByType = (cards) => {
    const groups = {
      Creatures: [],
      Instants: [],
      Sorceries: [],
      Enchantments: [],
      Artifacts: [],
      Planeswalkers: [],
      Lands: []
    }

    cards.forEach(card => {
      if (card.card_data.type_line.includes('Creature')) {
        groups.Creatures.push(card)
      } else if (card.card_data.type_line.includes('Instant')) {
        groups.Instants.push(card)
      } else if (card.card_data.type_line.includes('Sorcery')) {
        groups.Sorceries.push(card)
      } else if (card.card_data.type_line.includes('Enchantment')) {
        groups.Enchantments.push(card)
      } else if (card.card_data.type_line.includes('Artifact')) {
        groups.Artifacts.push(card)
      } else if (card.card_data.type_line.includes('Planeswalker')) {
        groups.Planeswalkers.push(card)
      } else if (card.card_data.type_line.includes('Land')) {
        groups.Lands.push(card)
      }
    })
    return groups
  }

  return (
    <div className={styles.deckBuilder}>
      <div className={styles.deckControls}>
        {selectedDeck?.format === 'commander' && commander && (
          <div className={styles.commanderSection}>
            <h4>Commander</h4>
            <div className={styles.commanderCard}>
              <img src={commander.image_uris?.small} alt={commander.name} />
              <span>{commander.name}</span>
            </div>
          </div>
        )}
        <form onSubmit={handleCreateDeck}>
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="Deck Name"
            required
          />
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            {formats.map(f => (
              <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
            ))}
          </select>
          <button type="submit">Create Deck</button>
        </form>

        <div className={styles.deckSelection}>
          <select 
            value={selectedDeck?.id || ''} 
            onChange={(e) => setSelectedDeck(decks.find(d => d.id === e.target.value))}
          >
            <option value="">Select a Deck</option>
            {decks.map(deck => (
              <option key={deck.id} value={deck.id}>{deck.name}</option>
            ))}
          </select>
          {selectedDeck && (
            <button 
              onClick={() => handleDeleteDeck(selectedDeck.id)}
              className={styles.deleteButton}
            >
              Delete Deck
            </button>
          )}
        </div>
      </div>

      {selectedDeck && (
        <div className={styles.deckBuilderGrid}>
          <div className={styles.searchSection}>
            <div className={styles.bulkSearch}>
              <textarea
                value={bulkSearchTerm}
                onChange={(e) => setBulkSearchTerm(e.target.value)}
                placeholder="Enter multiple card names (one per line)"
                className={styles.bulkSearchInput}
              />
              <button onClick={handleBulkSearch}>Search Multiple Cards</button>
            </div>

            <div className={styles.searchResults}>
              {searchResults.length > 0 && (
                <button 
                  className={styles.addAllButton}
                  onClick={handleAddAllToDeck}
                >
                  Add All to Deck
                </button>
              )}
              {searchResults.map(card => (
                <div key={card.id} className={styles.cardResult}>
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
                  <div className={styles.cardInfo}>
                    <h3>{card.name}</h3>
                    <p>Set: {card.set_name}</p>
                    <p>Type: {card.type_line}</p>
                    <p>Mana Cost: {card.mana_cost}</p>
                    <div className={styles.quantityControls}>
                      <button onClick={() => setCardQuantity(card.id, (cardQuantities[card.id] || 1) - 1)}>-</button>
                      <span>{cardQuantities[card.id] || 1}</span>
                      <button onClick={() => setCardQuantity(card.id, (cardQuantities[card.id] || 1) + 1)}>+</button>
                    </div>
                  </div>
                  <button onClick={() => handleAddCard(card)}>Add to Deck</button>
                  {selectedDeck?.format === 'commander' && isValidCommander(card) && (
                    <button 
                      className={styles.commanderButton}
                      onClick={() => handleSetCommander(card)}
                    >
                      Set as Commander
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.deckCards}>
            <div className={styles.deckHeader}>
              <h3>{selectedDeck.name}</h3>
              <h4 className={styles.totalCount}>Total Cards: {getTotalCardCount(deckCards)}</h4>
            </div>
            {commander && (
              <div className={styles.commanderSection}>
                <h4>Commander</h4>
                <div className={styles.commanderCard}>
                  <img src={commander.image_uris?.small} alt={commander.name} />
                  <span>{commander.name}</span>
                </div>
              </div>
            )}
            {Object.entries(groupCardsByType(deckCards)).map(([type, cards]) => (
              cards.length > 0 && (
                <div key={type} className={styles.cardTypeGroup}>
                  <h4>{type} ({cards.length})</h4>
                  {cards.map(card => (
                    <div key={card.id} className={styles.deckCard}>
                      <span>{card.quantity}x</span>
                      <span>{card.card_data.name}</span>
                      <button onClick={() => removeCardFromDeck(selectedDeck.id, card.id)}>Remove</button>
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DeckBuilder