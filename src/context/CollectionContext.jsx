import { createContext, useState, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CollectionContext = createContext()

export function CollectionProvider({ children }) {
  const { user } = useAuth()
  const [collection, setCollection] = useState([])

  useEffect(() => {
    if (user?.id) {
      const collectionKey = `mtgCollection_${user.id}`
      const savedCollection = localStorage.getItem(collectionKey)
      
      if (savedCollection) {
        setCollection(JSON.parse(savedCollection))
      }
    }
  }, [user?.id])

  const addToCollection = (card) => {
    if (!user?.id) return
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

      localStorage.setItem(`mtgCollection_${user.id}`, JSON.stringify(updatedCollection))
      return updatedCollection
    })
  }

  const updateQuantity = (cardId, newQuantity) => {
    if (!user?.id) return

    setCollection(prev => {
      const updatedCollection = prev
        .map(card => card.id === cardId ? { ...card, quantity: Math.max(0, newQuantity) } : card)
        .filter(card => card.quantity > 0)

      localStorage.setItem(`mtgCollection_${user.id}`, JSON.stringify(updatedCollection))
      return updatedCollection
    })
  }

  const removeAllCards = () => {
    if (!user?.id) return
    
    setCollection([])
    localStorage.setItem(`mtgCollection_${user.id}`, JSON.stringify([]))
  }

  return (
    <CollectionContext.Provider value={{ collection, addToCollection, updateQuantity, removeAllCards }}>
      {children}
    </CollectionContext.Provider>
  )
}

export const useCollection = () => useContext(CollectionContext)