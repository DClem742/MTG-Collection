import { useState } from 'react'
import { useCollection } from '../context/CollectionContext'
import styles from '../styles/SearchForm.module.css'
import toast from 'react-hot-toast'

function SearchForm() {
  const [batchSearchInput, setBatchSearchInput] = useState('')
  const [batchResults, setBatchResults] = useState([])
  const { addToCollection } = useCollection()

  const getColorClass = (card) => {
    const colorPairMap = {
      'GR': 'greenRedCard',
      'GB': 'greenBlackCard',
      'GU': 'greenBlueCard',
      'GW': 'greenWhiteCard',
      'RB': 'blackRedCard',
      'RU': 'blueRedCard',
      'RW': 'redWhiteCard',
      'UB': 'blueBlackCard',
      'UW': 'whiteBlueCard',
      'WB': 'whiteBlackCard'
    }

    const colorMap = {
      'W': 'whiteCard',
      'U': 'blueCard',
      'B': 'blackCard',
      'R': 'redCard',
      'G': 'greenCard'
    }

    if (!card.color_identity || card.color_identity.length === 0) return 'colorlessCard'    
    
    if (card.color_identity.length === 2) {
      const colorPair = card.color_identity.sort().join('')
      console.log('Two-colored card:', card.name, 'Color pair:', colorPair)
      return colorPairMap[colorPair]
    }

    if (card.color_identity.length > 2) return 'multiCard'

    return colorMap[card.color_identity[0]]
  }  
  const handleBatchSearch = async () => {
    const cardNames = batchSearchInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    const results = []
    for (const name of cardNames) {
      try {
        const response = await fetch(
          `https://api.scryfall.com/cards/search?q=${encodeURIComponent(name)}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            mode: 'cors'
          }
        )
        
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 500))
          continue
        }

        if (response.ok) {
          const data = await response.json()
          results.push(...data.data)
        }
        
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.log(`Error fetching card: ${name}`, error)
      }
    }
    setBatchResults(results)
  }
  const handleAddToCollection = (card) => {
    addToCollection(card)
    toast.success(`Added ${card.name} to collection`)
  }

  return (
    <div className={styles.searchForm}>
      <div className={styles.batchSearchContainer}>
        <textarea
          value={batchSearchInput}
          onChange={(e) => setBatchSearchInput(e.target.value)}
          placeholder="Enter card names (one per line)"
          className={styles.batchSearchInput}
          rows={10}
        />
        <button onClick={handleBatchSearch} className={styles.searchButton}>
          Search Cards
        </button>
      </div>

      {batchResults.length > 0 && (
        <div className={styles.batchResults}>
          <h3>Search Results</h3>
          <div className={styles.cardGrid}>
            {batchResults.map((card) => (
             <div key={card.id} className={`${styles.cardResult} ${styles[getColorClass(card)]}`} 
             onClick={() => console.log('Applied classes:', `${styles.cardResult} ${styles[getColorClass(card)]}`)}>
           
                <img
                  src={card.image_uris?.normal || card.card_faces?.[0].image_uris.normal}
                  alt={card.name}
                  className={styles.cardImage}
                />
                <button
                  onClick={() => handleAddToCollection(card)}
                  className={styles.addButton}
                >
                  Add to Collection
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchForm
