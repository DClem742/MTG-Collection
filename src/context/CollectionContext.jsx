import { createContext, useState, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CollectionContext = createContext()

/**
 * CollectionProvider Component
 * Manages user's MTG card collection with localStorage persistence
 * Features:
 * - Add cards to collection
 * - Update card quantities
 * - Remove cards
 * - Persist collection data per user
 */
export function CollectionProvider({ children }) {
  // Access current user from auth context
  const { user } = useAuth()
  // Track user's card collection
  const [collection, setCollection] = useState([])

  // Load saved collection from localStorage when user is authenticated
  useEffect(() => {
    if (user?.id) {
      const collectionKey = `mtgCollection_${user.id}`
      const savedCollection = localStorage.getItem(collectionKey)
      
      if (savedCollection) {
        setCollection(JSON.parse(savedCollection))
      }
    }
  }, [user?.id])

  // Add new card to collection or update quantity if exists
  const addToCollection = (card) => {
    if (!user?.id) return
    // Extract essential card data for storage
    const essentialCardData = {
      id: card.id,
      name: card.name,
      set_name: card.set_name,
      collector_number: card.collector_number,
      image_uris: card.image_uris,
      card_faces: card.card_faces,
      type_line: card.type_line,
      colors: card.colors,
      prices: card.prices,
      legalities: card.legalities
    }

    setCollection(prev => {
      const existingCard = prev.find(c => c.id === card.id)
      const updatedCollection = existingCard
        ? prev.map(c => c.id === card.id ? { ...c, quantity: (c.quantity || 1) + 1 } : c)
        : [...prev, { ...essentialCardData, quantity: 1 }]

      // Persist updated collection to localStorage
      localStorage.setItem(`mtgCollection_${user.id}`, JSON.stringify(updatedCollection))
      return updatedCollection
    })
  }

  // Update quantity of existing card
  const updateQuantity = (cardId, newQuantity) => {
    if (!user?.id) return

    setCollection(prev => {
      const updatedCollection = prev
        .map(card => card.id === cardId ? { ...card, quantity: Math.max(0, newQuantity) } : card)
        .filter(card => card.quantity > 0)

      // Persist updated collection to localStorage
      localStorage.setItem(`mtgCollection_${user.id}`, JSON.stringify(updatedCollection))
      return updatedCollection
    })
  }

  // Remove all cards from collection
  const removeAllCards = () => {
    if (!user?.id) return
    
    setCollection([])
    localStorage.setItem(`mtgCollection_${user.id}`, JSON.stringify([]))
  }

  // Provide collection context to child components
  return (
    <CollectionContext.Provider value={{ collection, addToCollection, updateQuantity, removeAllCards }}>
      {children}
    </CollectionContext.Provider>
  )
}

// Custom hook for accessing collection context
export const useCollection = () => useContext(CollectionContext)