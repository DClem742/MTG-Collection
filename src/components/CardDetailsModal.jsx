import { useState, useEffect } from 'react';
import styles from '../styles/CardDetailsModal.module.css';

function CardDetailsModal({ card, onClose }) {
  const [rulings, setRulings] = useState([]);
  const [relatedCards, setRelatedCards] = useState([]);

  useEffect(() => {
    // Fetch rulings from Scryfall API
    fetch(`https://api.scryfall.com/cards/${card.id}/rulings`)
      .then(res => res.json())
      .then(data => setRulings(data.data));

    // Fetch related cards (cards with similar names)
    fetch(`https://api.scryfall.com/cards/search?q=!"${card.name}" -"${card.id}"`)
      .then(res => res.json())
      .then(data => setRelatedCards(data.data));
  }, [card]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.cardInfo}>
          <img src={card.image_uris?.normal} alt={card.name} />
          
          <div className={styles.details}>
            <h2>{card.name}</h2>
            <p>{card.type_line}</p>
            <p>{card.oracle_text}</p>
            
            <div className={styles.legality}>
              <h3>Format Legality</h3>
              <ul>
                {Object.entries(card.legalities).map(([format, legality]) => (
                  <li key={format}>
                    {format}: <span className={styles[legality]}>{legality}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.rulings}>
              <h3>Rulings</h3>
              {rulings.map((ruling, index) => (
                <div key={index} className={styles.ruling}>
                  <p>{ruling.published_at}: {ruling.comment}</p>
                </div>
              ))}
            </div>

            <div className={styles.related}>
              <h3>Related Cards</h3>
              <div className={styles.relatedGrid}>
                {relatedCards.slice(0, 4).map(related => (
                  <img 
                    key={related.id} 
                    src={related.image_uris?.small} 
                    alt={related.name}
                    className={styles.relatedCard}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardDetailsModal;
