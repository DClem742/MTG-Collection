import { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

// Create deck management context
const DeckContext = createContext()

/**
 * DeckProvider Component
 * Manages MTG deck operations with Supabase persistence
 * Features:
 * - Create, read, update, delete decks
 * - Manage deck cards and quantities
 * - Set deck commanders
 * - Real-time deck updates
 */
export function DeckProvider({ children }) {
  // Track user's decks
  const [decks, setDecks] = useState([])
  const { user } = useAuth()

  // Fetch all decks for current user
  const fetchDecks = async () => {
    console.log('Fetching decks for user:', user.id)
    
    const { data, error } = await supabase
      .from('decks')
      .select(`
        id,
        user_id,
        name,
        format,
        created_at,
        commander
      `)
      .eq('user_id', user.id)

    console.log('Fetched deck details:', JSON.stringify(data, null, 2))

    if (data) setDecks(data)
  }

  // Create new deck in database
  const createDeck = async (name, format) => {
    const { data, error } = await supabase
      .from('decks')
      .insert({
        name,
        format,
        user_id: user.id
      })
      .select()

    if (!error && data) {
      setDecks(prevDecks => [...prevDecks, data[0]])
      return data[0]
    }
  }  

  // Get all cards in a specific deck
  const getDeckCards = async (deckId) => {
    const { data } = await supabase
      .from('deck_cards')
      .select('*')
      .eq('deck_id', deckId)
    
    return data || []
  }

  // Add card to deck or update quantity if exists
  const addCardToDeck = async (deckId, card, quantity = 1) => {
    // Check if card already exists in deck
    const { data: existingCards } = await supabase
      .from('deck_cards')
      .select('*')
      .eq('deck_id', deckId)
      .contains('card_data', { name: card.name })

    const existingCard = existingCards?.[0]

    if (existingCard) {
      const { data, error } = await supabase
        .from('deck_cards')
        .update({ quantity: existingCard.quantity + quantity })
        .eq('id', existingCard.id)
        .select()

      if (!error) {
        toast.success('Card quantity updated')
        return data[0]
      }
    } else {
      const { data, error } = await supabase
        .from('deck_cards')
        .insert([{
          deck_id: deckId,
          card_data: card,
          quantity: quantity
        }])
        .select()

      if (!error) {
        toast.success('Card added to deck')
        return data[0]
      }
    }
  }

  // Remove card from deck
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

  // Delete entire deck
  const deleteDeck = async (deckId) => {
    console.log('Starting deletion process for deck:', deckId)
    
    const { data, error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId)
      .select()

    console.log('Deletion response:', { data, error })

    if (!error) {
      setDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId))
    }
  }

  // Set commander for a deck
  const setCommander = async (deckId, card) => {
    const { data, error } = await supabase
      .from('decks')
      .update({ commander: card })
      .eq('id', deckId)
      .select()

    if (!error) {
      setDecks(prevDecks => prevDecks.map(deck => 
        deck.id === deckId ? { ...deck, commander: card } : deck
      ))
      toast.success(`${card.name} set as Commander`)
    }
    return { data, error }
  }

  // Load decks when user changes
  useEffect(() => {
    if (user) {
      fetchDecks()
    }
  }, [user])

  // Provide deck context to child components
  return (
    <DeckContext.Provider value={{ 
      decks, 
      createDeck, 
      getDeckCards, 
      addCardToDeck, 
      removeCardFromDeck,
      deleteDeck,
      setCommander
    }}>
      {children}
    </DeckContext.Provider>
  )
}

// Custom hook for accessing deck context
export const useDeck = () => useContext(DeckContext)