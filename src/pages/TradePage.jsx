import { useTrade } from '../context/TradeContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import TradeRequestModal from '../components/TradeRequestModal'
import styles from '../styles/TradePage.module.css'

function TradePage() {
  const { tradeListings } = useTrade()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedListing, setSelectedListing] = useState(null)

  const filteredListings = tradeListings.filter(listing => 
    listing.card_data.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={styles.tradePage}>
      <h1>Cards Available for Trade</h1>
      
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search cards listed for trade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tradeListings}>
        {filteredListings.map(listing => (
          <div key={listing.id} className={styles.tradeCard}>
            <img 
              src={listing.card_data.image_uris?.small} 
              alt={listing.card_data.name} 
            />
            <div className={styles.cardInfo}>
              <h3>{listing.card_data.name}</h3>
              <div className={styles.cardDetails}>
                <p>Set: {listing.card_data.set_name}</p>
                <p>Rarity: {listing.card_data.rarity}</p>
                <p>Condition: {listing.card_data.condition || 'NM'}</p>
                <p>Price: ${listing.card_data.prices?.usd || '0.00'}</p>
              </div>
              <p className={styles.listedBy}>Listed by: {listing.user_email}</p>
              {user.id !== listing.user_id && (
                <button 
                  className={styles.initiateTradeButton}
                  onClick={() => setSelectedListing(listing)}
                >
                  Initiate Trade
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedListing && (
        <TradeRequestModal 
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  )
}

export default TradePage