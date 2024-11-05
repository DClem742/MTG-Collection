import { createContext, useState, useContext, useEffect } from 'react'

const CollectionContext = createContext()

export function CollectionProvider({ children }) {
  const [collection, setCollection] = useState(() => {
    const savedCollection = localStorage.getItem('mtgCollection')
    return savedCollection ? JSON.parse(savedCollection) : []
  })

  const addToCollection = (card) => {
    setCollection(prev => {
      const existingCard = prev.find(c => c.id === card.id)
      if (existingCard) {
        return prev.map(c => 
          c.id === card.id 
            ? { ...c, quantity: (c.quantity || 1) + 1 }
            : c
        )
      }
      return [...prev, { ...card, quantity: 1 }]
    })
  }

  const updateQuantity = (cardId, newQuantity) => {
    setCollection(prev => 
      prev.map(card => 
        card.id === cardId 
          ? { ...card, quantity: Math.max(0, newQuantity) }
          : card
      ).filter(card => card.quantity > 0)
    )
  }

  useEffect(() => {
    localStorage.setItem('mtgCollection', JSON.stringify(collection))
  }, [collection])

  return (
    <CollectionContext.Provider value={{ collection, addToCollection, updateQuantity }}>
      {children}
    </CollectionContext.Provider>
  )
}

export const useCollection = () => useContext(CollectionContext)