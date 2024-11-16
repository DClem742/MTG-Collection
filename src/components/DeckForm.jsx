import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/DeckForm.module.css'

function DeckForm({ onSubmit, initialData = null }) {
  const [name, setName] = useState(initialData?.name || '')
  const { user } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name,
      user_id: user.id,
      cards: initialData?.cards || []
    })
  }

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