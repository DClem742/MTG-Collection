import { useState, useEffect } from 'react'
import { useDeck } from '../context/DeckContext'
import { useCollection } from '../context/CollectionContext'
import styles from '../styles/DeckBuilder.module.css'

function DeckBuilder() {
  const { createDeck, decks, addCardToDeck, getDeckCards, removeCardFromDeck } = useDeck()
  const { collection } = useCollection()
  const [deckName, setDeckName] = useState('')
  const [format, setFormat] = useState('standard')
  const [selectedDeck, setSelectedDeck] = useState(null)
  const [deckCards, setDeckCards] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const formats = [
    'standard',
    'modern',
    'commander',
    'pioneer',
    'legacy',
    'vintage',
    'pauper'
  ]

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

  const filteredCollection = collection.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    if (selectedDeck) {
      const loadDeckCards = async () => {
        const cards = await getDeckCards(selectedDeck.id)
        setDeckCards(cards)
      }
      loadDeckCards()
    }
  }, [selectedDeck])

  const handleCreateDeck = async (e) => {
    e.preventDefault()
    const newDeck = await createDeck(deckName, format)
    setSelectedDeck(newDeck)
    setDeckName('')
  }

  const handleAddCard = async (card) => {
    if (selectedDeck) {
      await addCardToDeck(selectedDeck.id, card)
      const updatedCards = await getDeckCards(selectedDeck.id)
      setDeckCards(updatedCards)
    }
  }

  const handleRemoveCard = async (cardId) => {
    if (selectedDeck) {
      await removeCardFromDeck(selectedDeck.id, cardId)
      const updatedCards = await getDeckCards(selectedDeck.id)
      setDeckCards(updatedCards)
    }
  }

  return (
    <div className={styles.deckBuilder}>
      <div className={styles.deckControls}>
        <form onSubmit={handleCreateDeck}>
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="Deck Name"
            required
          />
          <select 
            value={format} 
            onChange={(e) => setFormat(e.target.value)}
          >
            {formats.map(f => (
              <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
            ))}
          </select>
          <button type="submit">Create Deck</button>
        </form>

        <select 
          value={selectedDeck?.id || ''} 
          onChange={(e) => setSelectedDeck(decks.find(d => d.id === e.target.value))}
        >
          <option value="">Select a Deck</option>
          {decks.map(deck => (
            <option key={deck.id} value={deck.id}>{deck.name}</option>
          ))}
        </select>
      </div>

      {selectedDeck && (
        <div className={styles.deckBuilderGrid}>
          <div className={styles.collectionCards}>
            <h3>Your Collection</h3>
            <input
              type="text"
              placeholder="Search cards in collection..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.cardList}>
              {filteredCollection.map(card => (
                <div 
                  key={card.id} 
                  className={styles.cardListItem}
                  onClick={() => handleAddCard(card)}
                >
                  <span>{card.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.deckCards}>
            <h3>{selectedDeck.name}</h3>
            {Object.entries(groupCardsByType(deckCards)).map(([type, cards]) => (
              cards.length > 0 && (
                <div key={type} className={styles.cardTypeGroup}>
                  <h4>{type} ({cards.length})</h4>
                  {cards.map(card => (
                    <div key={card.id} className={styles.deckListItem}>
                      <span>{card.quantity}x</span>
                      <span>{card.card_data.name}</span>
                      <button onClick={() => handleRemoveCard(card.id)}>×</button>
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