import { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const DeckContext = createContext()

export function DeckProvider({ children }) {
  const [decks, setDecks] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchDecks()
    }
  }, [user])

  const fetchDecks = async () => {
    const { data } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', user.id)
    
    if (data) setDecks(data)
  }

  const createDeck = async (name, format) => {
    const { data, error } = await supabase
      .from('decks')
      .insert([{
        name,
        format,
        user_id: user.id
      }])
      .select()

    if (!error) {
      setDecks(current => [...current, data[0]])
      toast.success('Deck created successfully')
      return data[0]
    }
  }

  const getDeckCards = async (deckId) => {
    const { data } = await supabase
      .from('deck_cards')
      .select('*')
      .eq('deck_id', deckId)
    
    return data || []
  }

  const addCardToDeck = async (deckId, card) => {
    const { data, error } = await supabase
      .from('deck_cards')
      .insert([{
        deck_id: deckId,
        card_data: card
      }])
      .select()

    if (!error) {
      toast.success('Card added to deck')
      return data[0]
    }
  }

  const removeCardFromDeck = async (deckId, cardId) => {
    const { error } = await supabase
      .from('deck_cards')
      .delete()
      .eq('id', cardId)
      .eq('deck_id', deckId)

    if (!error) {
      toast.success('Card removed from deck')
    }
  }

  return (
    <DeckContext.Provider value={{ 
      decks, 
      createDeck, 
      getDeckCards, 
      addCardToDeck, 
      removeCardFromDeck 
    }}>
      {children}
    </DeckContext.Provider>
  )
}

export const useDeck = () => useContext(DeckContext)