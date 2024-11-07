import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CollectionProvider } from './context/CollectionContext'
import { TradeProvider } from './context/TradeContext'
import Header from './components/Header'
import Login from './components/Login'
import Register from './components/Register'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import CollectionPage from './pages/CollectionPage'
import TradePage from './pages/TradePage'
import TradeRequestsPage from './pages/TradeRequestsPage'
import { useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CollectionProvider>
          <TradeProvider>
            <Toaster position="top-right" />
            <Header />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
              <Route path="/collection" element={<ProtectedRoute><CollectionPage /></ProtectedRoute>} />
              <Route 
                path="/trade" 
                element={
                  <ProtectedRoute>
                    <TradePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trade-requests" 
                element={
                  <ProtectedRoute>
                    <TradeRequestsPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </TradeProvider>
        </CollectionProvider>
      </AuthProvider>
    </Router>
  )
}

export default App