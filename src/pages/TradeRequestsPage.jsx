import { useTrade } from '../context/TradeContext'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/TradeRequestsPage.module.css'

function TradeRequestsPage() {
  const { tradeRequests, respondToTradeRequest } = useTrade()
  const { user } = useAuth()

  const incomingRequests = tradeRequests.filter(req => req.owner_id === user.id)
  const outgoingRequests = tradeRequests.filter(req => req.requester_id === user.id)

  return (
    <div className={styles.requestsPage}>
      <h1>Trade Requests</h1>
      
      <section className={styles.requestSection}>
        <h2>Incoming Requests</h2>
        {incomingRequests.map(request => (
          <div key={request.id} className={styles.requestCard}>
            <div className={styles.requestDetails}>
              <h3>From: {request.requester_email}</h3>
              <div className={styles.cardExchange}>
                <div className={styles.wantedCard}>
                  <h4>Wants:</h4>
                  {request.listing_id && (
                    <img 
                      src={request.listing_id.card_data?.image_uris?.small} 
                      alt="Requested Card" 
                    />
                  )}
                </div>
                <div className={styles.offeredCards}>
                  <h4>Offers:</h4>
                  {request.offered_cards?.map(card => (
                    <img key={card.id} src={card.image_uris?.small} alt={card.name} />
                  ))}
                </div>
              </div>
              {request.status === 'pending' && (
                <div className={styles.actions}>
                  <button 
                    onClick={() => respondToTradeRequest(request.id, 'accepted')}
                    className={styles.acceptButton}
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => respondToTradeRequest(request.id, 'rejected')}
                    className={styles.rejectButton}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className={styles.requestSection}>
        <h2>Outgoing Requests</h2>
        {outgoingRequests.map(request => (
          <div key={request.id} className={styles.requestCard}>
            <div className={styles.requestDetails}>
              <h3>To: {request.owner_email}</h3>
              <div className={styles.cardExchange}>
                <div className={styles.wantedCard}>
                  <h4>Requested:</h4>
                  {request.listing_id && (
                    <img 
                      src={request.listing_id.card_data?.image_uris?.small} 
                      alt="Requested Card" 
                    />
                  )}
                </div>
                <div className={styles.offeredCards}>
                  <h4>Offered:</h4>
                  {request.offered_cards?.map(card => (
                    <img key={card.id} src={card.image_uris?.small} alt={card.name} />
                  ))}
                </div>
              </div>
              <p className={styles.status}>Status: {request.status}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

export default TradeRequestsPage