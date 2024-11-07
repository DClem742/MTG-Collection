import { useCollection } from '../context/CollectionContext'
import styles from '../styles/CollectionPage.module.css'

function CollectionPage() {
  const { collection, updateQuantity } = useCollection()

  return (
    <div className={styles.collectionPage}>
      <h1>My Collection</h1>
      <table className={styles.collectionTable}>
        <thead>
          <tr>
            <th>Card Image</th>
            <th>Name</th>
            <th>Set</th>
            <th>Collector Number</th>
            <th>Current Quantity</th>
            <th>Adjust Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {collection.map((card) => (
            <tr key={card.id}>
              <td>
                <img 
                  src={card.image_uris?.small} 
                  alt={card.name} 
                  className={styles.cardThumbnail}
                />
              </td>
              <td>{card.name}</td>
              <td>{card.set_name}</td>
              <td>{card.collector_number}</td>
              <td className={styles.currentQuantity}>{card.quantity || 1}</td>
              <td className={styles.quantityControls}>
                <button onClick={() => updateQuantity(card.id, (card.quantity || 1) - 1)}>-</button>
                <button onClick={() => updateQuantity(card.id, (card.quantity || 1) + 1)}>+</button>
              </td>
              <td>
                <button onClick={() => updateQuantity(card.id, 0)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CollectionPage