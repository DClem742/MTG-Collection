import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SearchPage from './pages/SearchPage'
import CollectionPage from './pages/CollectionPage'
import Navbar from './components/Navbar'
import { CollectionProvider } from './context/CollectionContext'

function App() {
  return (
    <CollectionProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/collection" element={<CollectionPage />} />
          </Routes>
        </div>
      </Router>
    </CollectionProvider>
  )
}

export default App