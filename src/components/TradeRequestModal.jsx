import { useState } from 'react'
import { useCollection } from '../context/CollectionContext'
import { useTrade } from '../context/TradeContext'
import styles from '../styles/TradeRequestModal.module.css'

function TradeRequestModal({ listing, onClose }) {
  const { collection } = useCollection()
  const { initiateTradeRequest } = useTrade()
  const [selectedCards, setSelectedCards] = useState([])

  const handleCardSelect = (card) => {
    setSelectedCards(prev => {
      const isSelected = prev.some(c => c.id === card.id)
      if (isSelected) {
        return prev.filter(c => c.id !== card.id)
      }
      return [...prev, card]
    })
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Propose Trade</h2>
        <div className={styles.tradeDetails}>
          <div className={styles.wantedCard}>
            <h3>Card You Want:</h3>
            <img src={listing.card_data.image_uris?.small} alt={listing.card_data.name} />
            <p>{listing.card_data.name}</p>
          </div>
          
          <div className={styles.offerSection}>
            <h3>Select Cards to Offer:</h3>
            <div className={styles.cardGrid}>
              {collection.map(card => (
                <div 
                  key={card.id} 
                  className={`${styles.card} ${selectedCards.some(c => c.id === card.id) ? styles.selected : ''}`}
                  onClick={() => handleCardSelect(card)}
                >
                  <img src={card.image_uris?.small} alt={card.name} />
                  <p>{card.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={() => {
              initiateTradeRequest(listing, selectedCards)
              onClose()
            }} 
            disabled={selectedCards.length === 0}
          >
            Submit Trade Request
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default TradeRequestModal