import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/DeckForm.module.css'

/**
 * DeckForm Component
 * Reusable form component for creating and updating decks
 * @param {Object} props
 * @param {Function} props.onSubmit - Handler for form submission
 * @param {Object} props.initialData - Optional initial deck data for editing
 */
function DeckForm({ onSubmit, initialData = null }) {
  // State for deck name, initialized with initial data if provided
  const [name, setName] = useState(initialData?.name || '')
  
  // Get current user from auth context
  const { user } = useAuth()

  /**
   * Handle form submission
   * Creates deck object with name, user ID, and cards array
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name,
      user_id: user.id,
      cards: initialData?.cards || []
    })
  }

  // Render form with name input and dynamic submit button text
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="name">Deck Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <button type="submit" className={styles.submitButton}>
        {initialData ? 'Update Deck' : 'Create Deck'}
      </button>
    </form>
  )
}

export default DeckForm