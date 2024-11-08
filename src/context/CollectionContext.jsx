import { createContext, useState, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CollectionContext = createContext()

export function CollectionProvider({ children }) {
  const { user } = useAuth()
  const [collections, setCollections] = useState(() => {
    // Load all collections from localStorage
    const allCollections = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('mtgCollection_')) {
        const userId = key.replace('mtgCollection_', '')
        allCollections[userId] = JSON.parse(localStorage.getItem(key))
      }
    }
    return allCollections
  })

  // Current user's collection
  const collection = user?.id ? (collections[user.id] || []) : []

  const addToCollection = (card) => {
    if (!user?.id) return

    const essentialCardData = {
      id: card.id,
      name: card.name,
      set_name: card.set_name,
      collector_number: card.collector_number,
      image_uris: { small: card.image_uris?.small },
      type_line: card.type_line,
      colors: card.colors,
      prices: card.prices
    }

    setCollections(prev => {
      const userCollection = prev[user.id] || []
      const existingCard = userCollection.find(c => c.id === card.id)
      
      const updatedCollection = existingCard
        ? userCollection.map(c => c.id === card.id ? { ...c, quantity: (c.quantity || 1) + 1 } : c)
        : [...userCollection, { ...essentialCardData, quantity: 1 }]

      const newCollections = { ...prev, [user.id]: updatedCollection }
      localStorage.setItem(`mtgCollection_${user.id}`, JSON.stringify(updatedCollection))
      return newCollections
    })
  }
  const updateQuantity = (cardId, newQuantity) => {
    if (!user?.id) return

    setCollections(prev => {
      const userCollection = prev[user.id] || []
      const updatedCollection = userCollection
        .map(card => card.id === cardId ? { ...card, quantity: Math.max(0, newQuantity) } : card)
        .filter(card => card.quantity > 0)

      const newCollections = { ...prev, [user.id]: updatedCollection }
      localStorage.setItem(`mtgCollection_${user.id}`, JSON.stringify(updatedCollection))
      return newCollections
    })
  }

  return (
    <CollectionContext.Provider value={{ collection, addToCollection, updateQuantity }}>
      {children}
    </CollectionContext.Provider>
  )
}

export const useCollection = () => useContext(CollectionContext)