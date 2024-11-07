import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CollectionProvider } from './context/CollectionContext'
import Navbar from './components/Navbar'
import Home from './pages/HomePage'
import Login from './components/Login'
import Register from './components/Register'
import SearchPage from './pages/SearchPage'
import CollectionPage from './pages/CollectionPage'
import toast, { Toaster } from 'react-hot-toast'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CollectionProvider>
          <Navbar />
          <Toaster position="top-center" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/collection" element={<CollectionPage />} />
          </Routes>
        </CollectionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App