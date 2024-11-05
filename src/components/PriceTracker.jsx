import { useState, useEffect } from 'react'
import { useCollection } from '../context/CollectionContext'
import styles from '../styles/PriceTracker.module.css'

function PriceTracker() {
  const { collection } = useCollection()
  const [totalValue, setTotalValue] = useState(0)

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

  return (
    <div className={styles.priceTracker}>
      <h2>Collection Value: ${totalValue.toFixed(2)}</h2>
      
      <div className={styles.cardGrid}>
        {collection.map(card => (
          <div key={card.id} className={styles.cardPrice}>
            <img src={card.image_uris?.small} alt={card.name} />
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