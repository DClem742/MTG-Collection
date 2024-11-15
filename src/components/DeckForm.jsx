import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/DeckForm.module.css'

function DeckForm({ onSubmit, initialData = null }) {
  const [name, setName] = useState(initialData?.name || '')
  const [isPublic, setIsPublic] = useState(initialData?.is_public || false)
  const { user } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name,
      is_public: isPublic,
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
      
      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Make this deck public
        </label>
      </div>

      <button type="submit" className={styles.submitButton}>
        {initialData ? 'Update Deck' : 'Create Deck'}
      </button>
    </form>
  )
}

export default DeckForm
