import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import styles from '../styles/Header.module.css'

function Header() {
  const { user, supabase } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        MTG Collection Tracker
      </div>
      <nav className={styles.nav}>
        {user ? (
          <>
            <span>Welcome, {user.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header
