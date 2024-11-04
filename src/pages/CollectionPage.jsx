import { useCollection } from '../context/CollectionContext'
import styles from '../styles/CollectionPage.module.css'

function CollectionPage() {
  const { collection, removeFromCollection } = useCollection()

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
              <td>
                <button onClick={() => removeFromCollection(card.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CollectionPage