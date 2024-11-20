import { useState } from 'react'
import styles from '../styles/DeckTester.module.css'

/**
 * DeckTester Component
 * Simulates gameplay scenarios by allowing users to:
 * - Shuffle deck
 * - Draw opening hands
 * - Track life totals
 * - Manage mana pool
 * - Draw cards
 * - Play cards to battlefield
 * 
 * @param {Object} props
 * @param {Array} props.deck - Array of card objects to test
 */
function DeckTester({ deck }) {
  // Game state management
  const [library, setLibrary] = useState([])        // Remaining cards in deck
  const [hand, setHand] = useState([])             // Cards in hand
  const [battlefield, setBattlefield] = useState([]) // Cards in play
  const [lifeTotal, setLifeTotal] = useState(20)    // Player life total
  const [turnCount, setTurnCount] = useState(1)     // Current turn number
  
  // Mana pool tracking for all colors + colorless
  const [manaPool, setManaPool] = useState({ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 })

  // Shuffle deck and reset game state
  const shuffleDeck = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5)
    setLibrary(shuffled)
    setHand([])
    setBattlefield([])
    setLifeTotal(20)
    setTurnCount(1)
    setManaPool({ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 })
  }

  // Draw opening hand or specific number of cards
  const drawHand = (cardCount = 7) => {
    const newHand = library.slice(0, cardCount)
    const newLibrary = library.slice(cardCount)
    setHand(newHand)
    setLibrary(newLibrary)
  }

  // Perform mulligan (Paris mulligan rules)
  const mulligan = () => {
    const cardsToReturn = [...hand]
    setLibrary([...library, ...cardsToReturn])
    const newLibrary = [...library, ...cardsToReturn].sort(() => Math.random() - 0.5)
    setLibrary(newLibrary)
    drawHand(Math.max(hand.length - 1, 0))
  }

  // Add mana of specified color to mana pool
  const addMana = (color) => {
    setManaPool(prev => ({
      ...prev,
      [color]: prev[color] + 1
    }))
  }

  // Advance to next turn, reset mana pool, draw a card
  const nextTurn = () => {
    setTurnCount(prev => prev + 1)
    setManaPool({ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 })
    drawCard()
  }

  // Draw a single card from library
  const drawCard = () => {
    if (library.length === 0) return
    const [drawnCard, ...remainingLibrary] = library
    setHand([...hand, drawnCard])
    setLibrary(remainingLibrary)
  }

  // Move card from hand to battlefield
  const playCard = (cardIndex) => {
    const cardToPlay = hand[cardIndex]
    const newHand = hand.filter((_, index) => index !== cardIndex)
    setBattlefield([...battlefield, cardToPlay])
    setHand(newHand)
  }

  // Component render with game interface
  return (
    <div className={styles.deckTester}>
      <div className={styles.gameInfo}>
        <div className={styles.lifeCounter}>
          <button onClick={() => setLifeTotal(prev => prev - 1)}>-</button>
          <span>Life: {lifeTotal}</span>
          <button onClick={() => setLifeTotal(prev => prev + 1)}>+</button>
        </div>
        <div className={styles.turnCounter}>
          Turn: {turnCount}
          <button onClick={nextTurn}>Next Turn</button>
        </div>
      </div>

      <div className={styles.manaPool}>
        {Object.entries(manaPool).map(([color, amount]) => (
          <div key={color} className={styles.manaType}>
            <i className={`ms ms-${color.toLowerCase()} ms-cost`}></i>
            <span>{amount}</span>
            <button onClick={() => addMana(color)}>+</button>
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <button onClick={shuffleDeck}>New Game</button>
        <button onClick={() => drawHand()}>Draw Hand</button>
        <button onClick={mulligan}>Mulligan</button>
      </div>
      
      <div className={styles.gameArea}>
        <div className={styles.hand}>
          {hand.map((card, index) => (
            <div 
              key={index} 
              className={styles.card}
              onClick={() => playCard(index)}
            >
              <img src={card.image_uris?.normal} alt={card.name} />
            </div>
          ))}
        </div>
        
        <div className={styles.battlefield}>
          {battlefield.map((card, index) => (
            <div key={index} className={styles.card}>
              <img src={card.image_uris?.normal} alt={card.name} />
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.stats}>
        <p>Library: {library.length} cards</p>
        <p>Hand: {hand.length} cards</p>
      </div>
    </div>
  )
}

export default DeckTester