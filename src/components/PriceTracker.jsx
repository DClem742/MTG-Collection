import { useState, useEffect } from 'react'
import { useCollection } from '../context/CollectionContext'
import styles from '../styles/PriceTracker.module.css'

/**
 * PriceTracker Component
 * Displays the total value of user's collection and individual card prices
 * Features:
 * - Real-time total collection value
 * - Individual card price display
 * - Quantity tracking
 * - Price per card and total price per playset
 */
function PriceTracker() {
  // Access collection data from context
  const { collection } = useCollection()
  
  // Track total collection value
  const [totalValue, setTotalValue] = useState(0)

  // Calculate total collection value whenever collection changes
  useEffect(() => {
    const calculateTotal = () => {
      const total = collection.reduce((sum, card) => {
        const cardPrice = parseFloat(card.prices?.usd) || 0
        return sum + (cardPrice * (card.quantity || 1))
      }, 0)
      setTotalValue(total)
    }

    calculateTotal()
  }, [collection])

  // Render price tracking interface
  return (
    <div className={styles.priceTracker}>
      {/* Display total collection value */}
      <h2>Collection Value: ${totalValue.toFixed(2)}</h2>
      
      {/* Grid of individual card prices */}
      <div className={styles.cardGrid}>
        {collection.map(card => (
          <div key={card.id} className={styles.cardPrice}>
            {/* Card image thumbnail */}
            <img src={card.image_uris?.small} alt={card.name} />
            {/* Price breakdown for each card */}
            <div className={styles.priceInfo}>
              <h3>{card.name}</h3>
              <p>Price per card: ${card.prices?.usd || '0.00'}</p>
              <p>Quantity: {card.quantity || 1}</p>
              <p>Total: ${((parseFloat(card.prices?.usd) || 0) * (card.quantity || 1)).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PriceTracker