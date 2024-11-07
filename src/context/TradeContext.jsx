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

  const fetchTradeRequests = async () => {
    const { data } = await supabase
      .from('trade_requests')
      .select(`
        *,
        listing:listing_id (*)
      `)
      .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
      .eq('status', 'pending')
    
    if (data) setTradeRequests(data)
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
      .select()

    if (!error) {
      setTradeRequests(current => [...current, data[0]])
    }
  }

  const respondToTradeRequest = async (requestId, status) => {
    try {
      const { error } = await supabase
        .from('trade_requests')
        .update({ status })
        .eq('id', requestId)

      if (!error) {
        if (status === 'rejected') {
          setTradeRequests(current => 
            current.filter(request => request.id !== requestId)
          )
          toast.error('Trade request rejected')
        } else {
          setTradeRequests(current => 
            current.map(request => 
              request.id === requestId ? { ...request, status } : request
            )
          )
          toast.success('Trade request accepted')
        }
      }
    } catch (error) {
      console.error('Error updating trade request:', error)
    }
  }

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('db_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trade_listings' },
        () => {
          fetchTradeListings()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'trade_requests' },
        () => {
          fetchTradeRequests()
        }
      )
      .subscribe()

    fetchTradeListings()
    fetchTradeRequests()

    return () => {
      channel.unsubscribe()
    }
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