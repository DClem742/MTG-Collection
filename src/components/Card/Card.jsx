import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import styles from './Card.module.css';

const Card = ({ card }) => {
  return (
    <div className={styles.cardContainer}>
      <LazyLoadImage
        src={card.imageUrl}
        alt={card.name}
        effect="blur"
        threshold={100}
        className={styles.cardImage}
      />
      <div className={styles.cardDetails}>
        <h3>{card.name}</h3>
        <p>{card.setName}</p>
      </div>
    </div>
  );
};

export default Card;
