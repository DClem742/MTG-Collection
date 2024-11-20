import { createContext, useState, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../config/supabase'
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

  useEffect(() => {
    if (user?.id) {
      const fetchCollection = async () => {
        const { data } = await supabase
          .from('collections')
          .select('*')
          .eq('user_id', user.id)
        
        if (data) {
          setCollection(data.map(item => ({
            ...item.card_data,
            quantity: item.quantity
          })))
        }
      }
      
      fetchCollection()
    }
  }, [user])

  // Add new card to collection or update quantity if exists
  const addToCollection = async (card) => {
    if (!user?.id) return
    console.log('Adding card to Supabase:', card.name)

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        card_id: card.id,
        card_data: card,
        quantity: 1
      })
      .select()

    console.log('Supabase response:', { data, error })

    setCollection(prev => {
      const existingCard = prev.find(c => c.id === card.id)
      return existingCard
        ? prev.map(c => c.id === card.id ? { ...c, quantity: (c.quantity || 1) + 1 } : c)
        : [...prev, { ...card, quantity: 1 }]
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