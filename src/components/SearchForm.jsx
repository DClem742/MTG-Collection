import { useState } from 'react'
import styles from '../styles/SearchForm.module.css'

function SearchForm({ setSearchResults }) {
  const [singleCardName, setSingleCardName] = useState('')
  const [multipleCards, setMultipleCards] = useState('')

  const handleSingleSearch = async () => {
    const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(singleCardName)}`
    try {
      const response = await fetch(url)
      const data = await response.json()
      setSearchResults(data.data)
    } catch (error) {
      console.log('Error:', error)
      setSearchResults([])
    }
  }

  const handleMultipleSearch = async () => {
    const cardNames = multipleCards.split('\n').filter(name => name.trim())
    let allResults = []

    for (const name of cardNames) {
      const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(name.trim())}`
      try {
        const response = await fetch(url)
        const data = await response.json()
        allResults = [...allResults, ...data.data]
      } catch (error) {
        console.log(`Error searching for ${name}:`, error)
      }
    }
    setSearchResults(allResults)
  }

  return (
    <div className={styles.searchContainer}>
      <div className={styles.singleSearch}>
        <input
          type="text"
          value={singleCardName}
          onChange={(e) => setSingleCardName(e.target.value)}
          placeholder="Enter card name"
          id="cardName"
        />
        <button onClick={handleSingleSearch}>Search Single Card</button>
      </div>

      <div className={styles.bulkSearch}>
        <textarea
          value={multipleCards}
          onChange={(e) => setMultipleCards(e.target.value)}
          placeholder="Enter multiple cards (one per line)"
          id="cardList"
        />
        <button onClick={handleMultipleSearch}>Search Multiple Cards</button>
      </div>
    </div>
  )
}

export default SearchForm