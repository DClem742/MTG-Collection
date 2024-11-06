import { createContext, useState, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CollectionContext = createContext()

export function CollectionProvider({ children }) {
  const [collection, setCollection] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const savedCollection = localStorage.getItem(`mtgCollection_${user.id}`)
      setCollection(savedCollection ? JSON.parse(savedCollection) : [])
    } else {
      setCollection([])
    }
  }, [user])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`mtgCollection_${user.id}`, JSON.stringify(collection))
    }
  }, [collection, user])

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

  return (
    <CollectionContext.Provider value={{ collection, addToCollection, updateQuantity }}>
      {children}
    </CollectionContext.Provider>
  )
}

export const useCollection = () => useContext(CollectionContext)