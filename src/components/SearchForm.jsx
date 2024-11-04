import { useState } from 'react'
import styles from '../styles/SearchForm.module.css'

function SearchForm({ setSearchResults }) {
  const [singleCardName, setSingleCardName] = useState('')
  const [multipleCards, setMultipleCards] = useState('')

  const handleClick = async () => {
    const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(singleCardName)}`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      console.log('Search results:', data.data)
      setSearchResults(data.data) // data.data contains the array of matching cards
    } catch (error) {
      console.log('Error:', error)
      setSearchResults([])
    }
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
        <button onClick={handleClick}>Search Single Card</button>
      </div>
    </div>
  )
}

export default SearchForm