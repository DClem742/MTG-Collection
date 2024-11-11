import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CollectionProvider } from './context/CollectionContext'
import { DeckProvider } from './context/DeckContext'
import Navbar from './components/Navbar'
import Home from './pages/HomePage'
import Login from './components/Login'
import Register from './components/Register'
import SearchPage from './pages/SearchPage'
import CollectionPage from './pages/CollectionPage'
import DeckBuilder from './components/DeckBuilder'
import toast, { Toaster } from 'react-hot-toast'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CollectionProvider>
          <DeckProvider>
            <Navbar />
            <Toaster position="top-center" />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/collection" element={<CollectionPage />} />
              <Route path="/decks" element={<DeckBuilder />} />
            </Routes>
          </DeckProvider>
        </CollectionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
export default App