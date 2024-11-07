import { createContext, useState, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../config/supabase'
import toast from 'react-hot-toast'

const TradeContext = createContext()

export function TradeProvider({ children }) {
  const [tradeListings, setTradeListings] = useState([])
  const [tradeRequests, setTradeRequests] = useState([])
  const { user } = useAuth()

  const fetchTradeListings = async () => {
    const { data } = await supabase
      .from('trade_listings')
      .select('*')
      .eq('status', 'available')
    
    if (data) setTradeListings(data)
  }

  const listCardForTrade = async (card) => {
    const listing = {
      card_id: card.id,
      card_data: card,
      user_id: user.id,
      user_email: user.email,
      status: 'available'
    }

    const { data, error } = await supabase
      .from('trade_listings')
      .insert([listing])
      .select()

    if (!error) {
      setTradeListings(current => [...current, data[0]])
      toast.success('Card listed for trade')
      await fetchTradeListings()
    } else {
      console.error('Error listing card:', error)
    }
  }

  const initiateTradeRequest = async (listing, offeredCards) => {
    const request = {
      listing_id: listing.id,
      requester_id: user.id,
      requester_email: user.email,
      owner_id: listing.user_id,
      owner_email: listing.user_email,
      offered_cards: offeredCards,
      status: 'pending'
    }

    const { data, error } = await supabase
      .from('trade_requests')
      .insert([request])

    if (!error) {
      setTradeRequests([...tradeRequests, request])
    }
  }

  const fetchTradeRequests = async () => {
    const { data } = await supabase
      .from('trade_requests')
      .select(`
        *,
        listing:listing_id (*)
      `)
      .eq('status', 'pending')
  
    if (data) setTradeRequests(data)
  }  

   const respondToTradeRequest = async (requestId, status) => {
    try {

      const { error } = await supabase
        .from('trade_requests')
        .update({ status })
        .eq('id', requestId)

      if (!error) {


        // Immediately remove the rejected trade from state for both users
        setTradeRequests(current => 
          current.filter(request => request.id !== requestId)
        )
        
        if (status === 'rejected') {
          toast.error('Trade request rejected')
        } else {
          toast.success('Trade request accepted')
        }
      }
    } catch (error) {
      console.error('Error updating trade request:', error)
    }

  }
  useEffect(() => {
    fetchTradeListings()
    fetchTradeRequests()
  }, [user])

  return (
    <TradeContext.Provider value={{ 
      tradeListings, 
      tradeRequests, 
      listCardForTrade, 
      initiateTradeRequest,
      respondToTradeRequest 
    }}>
      {children}
    </TradeContext.Provider>
  )
}

export const useTrade = () => useContext(TradeContext)