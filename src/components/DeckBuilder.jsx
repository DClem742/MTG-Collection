import { useState, useEffect } from 'react'
import { useDeck } from '../context/DeckContext'
import { useCollection } from '../context/CollectionContext'
import styles from '../styles/DeckBuilder.module.css'
import popupStyles from '../styles/CardPopup.module.css'
import DeckStats from './DeckStats'

function DeckBuilder() {
  const { createDeck, decks, addCardToDeck, getDeckCards, removeCardFromDeck, deleteDeck, setCommander } = useDeck()
  const { collection, addToCollection } = useCollection()
  
  const [deckName, setDeckName] = useState('')
  const [format, setFormat] = useState('commander')
  const [selectedDeck, setSelectedDeck] = useState(null)
  const [deckCards, setDeckCards] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [bulkSearchTerm, setBulkSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [cardQuantities, setCardQuantities] = useState({})
  const [commander, setCommanderState] = useState(null)
  const [flippedCards, setFlippedCards] = useState({})
  const [hoverCard, setHoverCard] = useState(null)
  const [cardPrints, setCardPrints] = useState({})
  const [selectedPrint, setSelectedPrint] = useState(() => {
    const saved = localStorage.getItem('selectedPrints')
    return saved ? JSON.parse(saved) : {}
  })
  const [showingPrintsForCard, setShowingPrintsForCard] = useState(null)
  const [showDeckSelection, setShowDeckSelection] = useState(true)

  useEffect(() => {
    localStorage.setItem('selectedPrints', JSON.stringify(selectedPrint))
  }, [selectedPrint])

  useEffect(() => {
    handleSearch(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    if (selectedDeck) {
      const loadDeckData = async () => {
        const cards = await getDeckCards(selectedDeck.id)
        setDeckCards(cards)
        const freshDeckData = decks.find(d => d.id === selectedDeck.id)
        setCommanderState(freshDeckData?.commander)
      }
      loadDeckData()
    }
  }, [selectedDeck, decks])

  const handleSearch = (term) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }
    const results = collection.filter(card => 
      card.name.toLowerCase().includes(term.toLowerCase())
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

  const handleCardClick = async (card) => {
    if (!card) return
    
    if (showingPrintsForCard === card.id) {
      setShowingPrintsForCard(null)
      return
    }
    
    setShowingPrintsForCard(card.id)
    const cardName = card.name || card.card_data.name
    const response = await fetch(`https://api.scryfall.com/cards/search?q=!"${cardName}" include:extras unique:prints`)
    const data = await response.json()
    setCardPrints(prev => ({
      ...prev,
      [card.id]: data.data
    }))
  }

  const handleDeckSelect = (deck) => {
    setSelectedDeck(deck)
    setShowDeckSelection(false)
  }

  const handleRemoveCard = async (deckId, cardId) => {
    await removeCardFromDeck(deckId, cardId)
    setDeckCards(prevCards => prevCards.filter(card => card.id !== cardId))
  }

  const handleCardFlip = (cardId) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }

  const handleCreateDeck = async (e) => {
    e.preventDefault()
    const newDeck = await createDeck(deckName, format)
    setSelectedDeck(newDeck)
    setDeckName('')
    setShowDeckSelection(false)
  }

  const handleDeleteDeck = async (deckId) => {
    if (window.confirm('Are you sure you want to delete this deck?')) {
      await deleteDeck(deckId)
      setSelectedDeck(null)
    }
  }

  const handleAddCard = async (card) => {
    if (selectedDeck) {
      const quantity = cardQuantities[card.id] || 1
      await addCardToDeck(selectedDeck.id, card, quantity)
      addToCollection(card)
      const updatedCards = await getDeckCards(selectedDeck.id)
      setDeckCards(updatedCards)
      setCardQuantities(prev => ({ ...prev, [card.id]: 1 }))
    }
  }

  const handleSetCommander = async (card) => {
    if (selectedDeck) {
      const commanderData = {
        id: card.id,
        name: card.name,
        image_uris: card.image_uris,
        card_faces: card.card_faces,
        type_line: card.type_line
      }
      setCommanderState(commanderData)
      await setCommander(selectedDeck.id, commanderData)
    }
  }

  const isValidCommander = (card) => {
    return card.type_line?.includes('Legendary') && card.type_line?.includes('Creature')
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

  const calculateDeckPrice = (cards) => {
    return cards.reduce((total, card) => {
      const price = card.card_data.prices?.usd || 0
      return total + (price * card.quantity)
    }, 0)
  }

  return (
    <div className={styles.deckBuilder}>
      {showDeckSelection ? (
        <div className={styles.deckControls}>
          <form onSubmit={handleCreateDeck}>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="Deck Name"
              required
            />
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="commander">Commander</option>
            </select>
            <button type="submit">Create Deck</button>
          </form>
          <div className={styles.deckSelection}>
            <div className={styles.deckGrid}>
              {decks.map(deck => (
                <div key={deck.id}>
                  <div className={styles.deckCard}>
                    {deck.commander ? (
                      <img 
                        src={selectedPrint[deck.commander.id]?.image_uris?.normal || deck.commander.image_uris?.normal} 
                        alt={deck.commander.name}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCardClick(deck.commander)
                        }}
                      />
                    ) : (
                      <div className={styles.placeholderImage}>
                        No Commander Set
                      </div>
                    )}
                    <div className={styles.deckInfo} onClick={() => handleDeckSelect(deck)}>
                      <h3>{deck.name}</h3>
                    </div>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDeleteDeck(deck.id)}
                    >
                      Delete Deck
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.deckBuilderContainer}>
          <button 
            className={styles.backButton} 
            onClick={() => {
              setShowDeckSelection(true)
              setSelectedDeck(null)
            }}
          >
            Back to Deck Selection
          </button>

          <div className={styles.deckBuilderGrid}>
            <div className={styles.searchSection}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for cards..."
                className={styles.searchInput}
              />
              
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
                    {card.layout === 'transform' ? (
                      <div className={styles.cardImage} onClick={() => handleCardFlip(card.id)}>
                        <img 
                          src={card.card_faces[flippedCards[card.id] ? 1 : 0].image_uris.normal}
                          alt={card.name}
                        />
                        <span className={styles.flipHint}>Click to flip</span>
                      </div>
                    ) : (
                      <img src={card.image_uris?.normal} alt={card.name} />
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
                    {isValidCommander(card) && (
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

            <div className={styles.deckView}>
              <div className={styles.deckHeader}>
                <h3>{selectedDeck.name}</h3>
                <h4 className={styles.totalCount}>
                  Total Cards: {getTotalCardCount(deckCards)} | 
                  Deck Value: ${calculateDeckPrice(deckCards).toFixed(2)}
                </h4>
              </div>
              
              <DeckStats cards={deckCards} />
              {Object.entries(groupCardsByType(deckCards)).map(([type, cards]) => (
                cards.length > 0 && (
                  <div key={type} className={styles.cardTypeGroup}>
                    <h4>{type} ({cards.length})</h4>
                    {cards.map(card => (
                      <div 
                        key={card.id} 
                        className={styles.deckCard}
                        onClick={() => handleCardClick(card)}
                        onMouseEnter={(e) => {
                          setHoverCard({
                            card: card.card_data,
                            x: e.clientX + 10,
                            y: e.clientY + 10
                          })
                        }}
                        onMouseLeave={() => setHoverCard(null)}
                      >
                        <span>{card.quantity}x</span>
                        <span>{card.card_data.name}</span>
                        <button onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveCard(selectedDeck.id, card.id)
                        }}>Remove</button>
                      </div>
                    ))}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}

      {hoverCard && (
        <div 
          className={popupStyles.cardPopup} 
          style={{ left: hoverCard.x, top: hoverCard.y }}
        >
          <img 
            className={popupStyles.cardPopupImage}
            src={hoverCard.card.image_uris?.normal} 
            alt={hoverCard.card.name} 
          />
        </div>
      )}

      {showingPrintsForCard && cardPrints[showingPrintsForCard] && (
        <div className={styles.printsSelector}>
          <h3>Select Artwork</h3>
          <div className={styles.printsGrid}>
            {cardPrints[showingPrintsForCard].map(print => (
              <img 
                key={print.id}
                src={print.image_uris?.normal}
                alt={print.set_name}
                className={styles.printOption}
                onClick={() => {
                  setSelectedPrint(prev => ({
                    ...prev,
                    [showingPrintsForCard]: print
                  }))
                  setShowingPrintsForCard(null)
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>

  )}
  export default DeckBuilder
