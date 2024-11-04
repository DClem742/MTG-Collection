  import React, { useState } from 'react'
  import SearchForm from './components/SearchForm'
  import CardDisplay from './components/CardDisplay'
  import { searchSingleCard, searchBulkCards } from './js/api'
  import { addToCollection, addAllToCollection } from './js/collection'

  function App() {
    const [searchResults, setSearchResults] = useState([])
    const [showAddAll, setShowAddAll] = useState(false)

    const handleSearch = async (e) => {
      e.preventDefault()
      const cardName = document.getElementById('cardName').value
      const cardList = document.getElementById('cardList').value

      if (cardName) {
        const results = await searchSingleCard(cardName)
        setSearchResults(results)
        setShowAddAll(false)
      } else if (cardList) {
        const cards = cardList.split('\n').filter(name => name.trim())
        const results = await searchBulkCards(cards)
        setSearchResults(results)
        setShowAddAll(true)
      }
    }

    return (
      <>
        <div>
          <h1>Magic: The Gathering Card Search</h1>
          <SearchForm onSubmit={handleSearch} />
          <div id="result">
            {searchResults.map((card, index) => (
              <CardDisplay 
                key={index} 
                card={card} 
                onAddToCollection={addToCollection} 
              />
            ))}
          </div>
          {showAddAll && (
            <button onClick={() => addAllToCollection(searchResults)}>
              Add All Cards to Collection
            </button>
          )}
          <a href="collection.html">View Collection</a>
        </div>
        <p className="read-the-docs">
       
        </p>
      </>
    )
  }

  export default App
