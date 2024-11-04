import { useState } from 'react'
import SearchForm from '../components/SearchForm'
import CardList from '../components/CardList'
import styles from '../styles/SearchPage.module.css'

function SearchPage() {
  const [searchResults, setSearchResults] = useState([])

  const handleSearchResults = (results) => {
    console.log('SearchPage received results:', results)
    setSearchResults(results)
  }

  return (
    <div className={styles.searchPage}>
      <h1>Magic: The Gathering Card Search</h1>
      <SearchForm setSearchResults={handleSearchResults} />
      <div className={styles.results}>
        {searchResults.length > 0 && <CardList cards={searchResults} showAddButton={true} />}
      </div>
    </div>
  )
}

export default SearchPage