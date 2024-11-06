import { useState } from 'react'
import { supabase } from '../config/supabase'
import styles from '../styles/Auth.module.css'
import { Link } from 'react-router-dom'


function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }
  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleRegister} className={styles.authForm}>
        <h2>Register</h2>
        {error && <div className={styles.error}>{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Register'}
        </button>
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  )
}
export default Register
