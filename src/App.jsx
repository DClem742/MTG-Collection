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
import styles from './styles/App.module.css'
import 'mana-font/css/mana.css'
import ErrorBoundary from './components/ErrorBoundary'


function App() {
  return (
    <ErrorBoundary>
       <div className={`${styles.app} ${styles.appContainer}`}>
        <BrowserRouter>
          <AuthProvider>
            <CollectionProvider>
              <DeckProvider>
                <Navbar />
                {/* <div className={styles.heroImage}>
                  <img src="/mtg-background.jpg" alt="MTG Background" style ={{ objectPosition: 'top'}} />
                </div> */}
                <Toaster position="top-center" />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/collection" element={<CollectionPage />} />
                  <Route path="/decks" element={<DeckBuilder />} />
                </Routes>
                {/* <div className={styles.footerImage}>
                  <img src="/mtg-background.jpg" alt="MTG Background" style = {{ objectPosition: 'bottom'}}></img>
                </div> */}
                
              </DeckProvider>
            </CollectionProvider>
          </AuthProvider>
        </BrowserRouter>
      </div>
      <div className={styles.footerWrapper}>
           <div className={styles.footerGradient}></div>
           <div className={styles.footer}> © 2024 Mythic Mana <br />
            created by DC Isenberg </div>
      </div>
    </ErrorBoundary>
  )
}
export default App