import { createContext, useState, useContext } from 'react'

const CollectionContext = createContext()

export function CollectionProvider({ children }) {
  const [collection, setCollection] = useState([])

  const addToCollection = (card) => {
    setCollection(prev => [...prev, card])
  }

  const removeFromCollection = (cardId) => {
    setCollection(prev => prev.filter(card => card.id !== cardId))
  }

  return (
    <CollectionContext.Provider value={{ collection, addToCollection, removeFromCollection }}>
      {children}
    </CollectionContext.Provider>
  )
}

export const useCollection = () => useContext(CollectionContext)
