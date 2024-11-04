import { useCollection } from '../context/CollectionContext'
import styles from '../styles/CardList.module.css'

function CardList({ cards, showAddButton }) {
  const { addToCollection } = useCollection()

  return (
    <div className={styles.cardList}>
      {cards.map((card) => (
        <div key={card.id} className={styles.cardItem}>
          <img 
            src={card.image_uris?.normal} 
            alt={card.name} 
            className={styles.cardImage}
          />
          <h3>{card.name}</h3>
          {showAddButton && (
            <button onClick={() => addToCollection(card)}>
              Add to Collection
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default CardList