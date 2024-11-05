import { useState } from 'react'
import { useCollection } from '../context/CollectionContext'
import SearchForm from '../components/SearchForm'
import CardList from '../components/CardList'
import styles from '../styles/SearchPage.module.css'

function SearchPage() {
  const [searchResults, setSearchResults] = useState([])
  const { addToCollection } = useCollection()

  const handleAddAllToCollection = () => {
    searchResults.forEach(card => addToCollection(card))
  }

  return (
    <div className={styles.searchPage}>
      <h1>Magic: The Gathering Card Search</h1>
      <SearchForm setSearchResults={setSearchResults} />
      {searchResults.length > 0 && (
        <div className={styles.results}>
          <button 
            onClick={handleAddAllToCollection}
            className={styles.addAllButton}
          >
            Add All to Collection
          </button>
          <CardList cards={searchResults} showAddButton={true} />
        </div>
      )}
    </div>
  )
}

export default SearchPage