import { useState } from 'react'
import { supabase } from '../config/supabase'
import { Link, useNavigate } from 'react-router-dom'
import styles from '../styles/Auth.module.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
    } else {
      navigate('/')  // Redirect to home page after successful login
    }
    setLoading(false)
  }

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleLogin} className={styles.authForm}>
        <h2>Login</h2>
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
          {loading ? 'Loading...' : 'Login'}
        </button>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  )
}

export default Login