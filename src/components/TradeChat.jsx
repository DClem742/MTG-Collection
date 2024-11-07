import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import styles from '../styles/TradeChat.module.css'

function TradeChat({ tradeRequest, onClose }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchMessages()
    const subscription = supabase
      .channel(`trade_messages_${tradeRequest.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'trade_messages',
        filter: `trade_request_id=eq.${tradeRequest.id}`
      }, payload => {
        setMessages(current => [...current, payload.new])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [tradeRequest.id])

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('trade_messages')
      .select('*')
      .eq('trade_request_id', tradeRequest.id)
      .order('created_at', { ascending: true })

    if (data) setMessages(data)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message = {
      trade_request_id: tradeRequest.id,
      sender_id: user.id,
      sender_email: user.email,
      message: newMessage.trim()
    }

    const { error } = await supabase
      .from('trade_messages')
      .insert([message])

    if (!error) {
      setNewMessage('')
    }
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h3>Trade Discussion</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div className={styles.messageList}>
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`${styles.message} ${
              msg.sender_id === user.id ? styles.sent : styles.received
            }`}
          >
            <span className={styles.sender}>{msg.sender_email}</span>
            <p>{msg.message}</p>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className={styles.messageForm}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default TradeChat
