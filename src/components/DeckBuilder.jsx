import { useState, useEffect } from 'react'
import { useDeck } from '../context/DeckContext'
import { useCollection } from '../context/CollectionContext'
import styles from '../styles/DeckBuilder.module.css'
import popupStyles from '../styles/CardPopup.module.css'
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
  const [hoverCard, setHoverCard] = useState(null)
  // Add the new state and functions here
  const [cardPrints, setCardPrints] = useState({})
  const [selectedPrint, setSelectedPrint] = useState(() => {
    const saved = localStorage.getItem('selectedPrints')
    return saved ? JSON.parse(saved) : {}
  })
  const [showingPrintsForCard, setShowingPrintsForCard] = useState(null)

  // Add this effect to save selections when they change
  useEffect(() => {
    localStorage.setItem('selectedPrints', JSON.stringify(selectedPrint))
  }, [selectedPrint])
  const fetchCardPrints = async (cardId) => {
    const card = deckCards.find(c => c.id === cardId)
    const printsUrl = card.card_data.prints_search_uri
    const response = await fetch(printsUrl)
    const data = await response.json()
    setCardPrints(prev => ({
      ...prev,
      [cardId]: data.data
    }))
  }

  const selectPrint = (cardId, printData) => {
    setSelectedPrint(prev => ({
      ...prev,
      [cardId]: printData
    }))
  }

  const handleCardClick = async (card) => {
    if (!card) return
    
    if (showingPrintsForCard === card.id) {
      setShowingPrintsForCard(null)
      return
    }
    
    setShowingPrintsForCard(card.id)
    
    // Get the card name from either commander or deck card
    const cardName = card.name || card.card_data.name
    
    // Use the same enhanced search for both types
    const response = await fetch(`https://api.scryfall.com/cards/search?q=!"${cardName}" include:extras unique:prints`)
    const data = await response.json()
    setCardPrints(prev => ({
      ...prev,
      [card.id]: data.data
    }))
  }
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
      const commanderData = {
        id: card.id,
        name: card.name,
        image_uris: card.image_uris,
        card_faces: card.card_faces,  // Add this line
        type_line: card.type_line
      }
      
      setCommanderState(commanderData)
      await setCommander(selectedDeck.id, commanderData)
    }
  }

  const formats = ['commander']

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

  const { addToCollection } = useCollection()

  const handleAddCard = async (card) => {
    if (selectedDeck) {
      const quantity = cardQuantities[card.id] || 1
      await addCardToDeck(selectedDeck.id, card, quantity)
      addToCollection(card) // Add this line to sync with collection
      const updatedCards = await getDeckCards(selectedDeck.id)
      setDeckCards(updatedCards)
      setCardQuantities(prev => ({ ...prev, [card.id]: 1 }))
    }
  };  useEffect(() => {
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
        {commander && (
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
          <div className={styles.deckGrid}>
            {decks.map(deck => (
              <div key={deck.id}>
                <div 
                  className={`${styles.deckCard} ${selectedDeck?.id === deck.id ? styles.selected : ''}`}
                >
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
                  <div className={styles.deckInfo} onClick={() => setSelectedDeck(deck)}>
                    <h3>{deck.name}</h3>
                  </div>
                </div>

                {showingPrintsForCard === deck.commander?.id && cardPrints[deck.commander?.id] && (
                  <div 
                    className={styles.printsSelector}
                    style={{
                      position: 'fixed',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1000,
                      padding: '20px',
                      background: '#1a1a1a',
                      borderRadius: '8px',
                      boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                    }}
                  >
                    <h3 style={{color: 'white', marginBottom: '10px'}}>Select Artwork</h3>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px'}}>
                      {cardPrints[deck.commander.id].map(print => (
                        <img 
                          key={print.id}
                          src={print.image_uris?.normal} 
                          alt={print.set_name}
                          style={{
                            width: '100%',
                            height: 'auto',
                            cursor: 'pointer',
                            borderRadius: '10px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPrint(prev => ({
                              ...prev,
                              [deck.commander.id]: print
                            }))
                            setShowingPrintsForCard(null)
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {selectedDeck && (            <button 
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
          <div className={styles.deckCards}>
            {/* Add this function to calculate total deck price */}
            {(() => {
              const calculateDeckPrice = (cards) => {
                return cards.reduce((total, card) => {
                  const price = card.card_data.prices?.usd || 0
                  return total + (price * card.quantity)
                }, 0)
              }

              return (
                <div className={styles.deckHeader}>
                  <h3>{selectedDeck.name}</h3>
                  <h4 className={styles.totalCount}>
                    Total Cards: {getTotalCardCount(deckCards)} | 
                    Deck Value: ${calculateDeckPrice(deckCards).toFixed(2)}
                  </h4>
                </div>
              )
            })()}


            {selectedDeck.commander && (
              <div className={styles.commanderSection}>
                <h4>Commander</h4>
                <div className={styles.commanderCard}>

                  {selectedDeck.commander.card_faces && selectedDeck.commander.card_faces[0].image_uris ? (
                    <div className={styles.doubleFaced}>
                      <img 
                        src={selectedDeck.commander.card_faces[0].image_uris.small} 
                        alt={selectedDeck.commander.name}
                        className={styles.cardThumbnail}
                      />
                      <img 
                        src={selectedDeck.commander.card_faces[1].image_uris.small} 
                        alt={selectedDeck.commander.name}
                        className={styles.cardThumbnail}
                      />
                    </div>
                  ) : (
                    <img 
                      src={selectedDeck.commander.image_uris?.small} 
                      alt={selectedDeck.commander.name} 
                      className={styles.cardThumbnail}
                    />
                  )}
                  <span>{selectedDeck.commander.name}</span>
                </div>
              </div>
            )}

            {Object.entries(groupCardsByType(deckCards)).map(([type, cards]) => (
              cards.length > 0 && (
                <div key={type} className={styles.cardTypeGroup}>
                  <h4>{type} ({cards.length})</h4>
                  {cards.map(card => (
                    <div key={card.id} className={styles.deckListContainer}>
                      <div 
                        className={styles.deckCard}
                        onClick={() => handleCardClick(card)}
                        onMouseEnter={(e) => {
                          if (!showingPrintsForCard) {
                            setHoverCard({
                              card: selectedPrint[card.id] || card.card_data,
                              x: e.clientX + 10,
                              y: e.clientY + 10
                            })
                          }
                        }}
                        onMouseLeave={() => setHoverCard(null)}
                      >
                        <span>{card.quantity}x</span>
                        <span>{card.card_data.name}</span>
                        <button onClick={(e) => {
                          e.stopPropagation()
                          removeCardFromDeck(selectedDeck.id, card.id)
                        }}>Remove</button>
                      </div>

                      {showingPrintsForCard === card.id && cardPrints[card.id] && (
                        <div 
                          className={styles.printsSelector}
                          style={{
                            position: 'fixed',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          {cardPrints[card.id].map(print => (
                            <img 
                              key={print.id}
                              src={print.image_uris?.small} 
                              alt={print.set_name}
                              onClick={() => {
                                setSelectedPrint(prev => ({
                                  ...prev,
                                  [card.id]: print
                                }))
                                setShowingPrintsForCard(null)
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ))}          </div>
        </div>
      )}
      {hoverCard && (
        <div 
          className={popupStyles.cardPopup} 
          style={{ left: hoverCard.x, top: hoverCard.y }}
        >
          <img 
            className={popupStyles.cardPopupImage}
            src={selectedPrint[hoverCard.card.id]?.image_uris?.normal || hoverCard.card.image_uris?.normal} 
            alt={hoverCard.card.name} 
          />
          <div className={popupStyles.printSelector}>
            {cardPrints[hoverCard.card.id]?.map(print => (
              <img 
                key={print.id}
                src={print.image_uris?.small}
                alt={`${print.set_name} printing`}
                onClick={() => selectPrint(hoverCard.card.id, print)}
                className={popupStyles.printThumbnail}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DeckBuilder