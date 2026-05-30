import { useState, useEffect } from 'react'
import { BrowserRouter, NavLink, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Shelf from './pages/Shelf'
import Table from './pages/Table'
import Library from './pages/Library'
import Roll from './pages/Roll'
import Stats from './pages/Stats'

function AnimatedRoutes() {
    const location = useLocation()
    return (
        <div key={location.pathname} className="page-enter">
            <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/shelf" element={<Shelf />} />
                <Route path="/table" element={<Table />} />
                <Route path="/library" element={<Library />} />
                <Route path="/roll" element={<Roll />} />
                <Route path="/stats" element={<Stats />} />
            </Routes>
        </div>
    )
}

function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-6"
             style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1117 50%, #0a0a0a 100%)' }}>
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-t-orange-500 animate-spin"
                     style={{ borderColor: 'transparent', borderTopColor: '#E8682A' }} />
                <div className="absolute inset-0 flex items-center justify-center text-3xl">📚</div>
            </div>
            <div className="text-center">
                <h1 className="text-white text-xl font-bold tracking-wide">Reading Tracker</h1>
                <p className="text-white/30 text-sm mt-1">Loading your library...</p>
            </div>
        </div>
    )
}

function App() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1800)
        return () => clearTimeout(timer)
    }, [])

    if (loading) return <LoadingScreen />

    return (
        <BrowserRouter>
            <div className="min-h-screen"
                 style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>

                <main className="max-w-lg mx-auto px-4 py-6 relative overflow-hidden">
                    <AnimatedRoutes />
                </main>

                <nav className="fixed bottom-0 left-0 right-0"
                     style={{
                         background: 'rgba(15, 20, 35, 0.92)',
                         backdropFilter: 'blur(20px)',
                         WebkitBackdropFilter: 'blur(20px)',
                         borderTop: '1px solid rgba(255,255,255,0.08)',
                         borderRadius: '20px 20px 0 0',
                     }}>
                    <div className="max-w-lg mx-auto flex items-center"
                         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

                        {/* Home */}
                        <NavLink to="/" end
                                 className={({ isActive }) =>
                                     `flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all ${isActive ? 'opacity-100' : 'opacity-40'}`
                                 }>
                            {({ isActive }) => (
                                <>
                                    <span className="text-xl" style={isActive ? { color: '#E8682A' } : { color: 'white' }}>⌂</span>
                                    <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>Home</span>
                                </>
                            )}
                        </NavLink>

                        {/* Shelf */}
                        <NavLink to="/shelf"
                                 className={({ isActive }) =>
                                     `flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all ${isActive ? 'opacity-100' : 'opacity-40'}`
                                 }>
                            {({ isActive }) => (
                                <>
                                    <span className="text-xl" style={isActive ? { color: '#E8682A' } : { color: 'white' }}>▤</span>
                                    <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>Shelf</span>
                                </>
                            )}
                        </NavLink>

                        {/* Centre Roll button */}
                        <NavLink to="/roll"
                                 className="flex-1 flex flex-col items-center justify-center py-2 gap-1">
                            {({ isActive }) => (
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all"
                                         style={{
                                             background: isActive ? '#E8682A' : 'rgba(232,104,42,0.25)',
                                             border: '1px solid rgba(232,104,42,0.4)',
                                             boxShadow: isActive ? '0 0 16px rgba(232,104,42,0.4)' : 'none'
                                         }}>
                                        🎲
                                    </div>
                                    <span className="text-xs font-medium text-white/40">Roll</span>
                                </div>
                            )}
                        </NavLink>

                        {/* Library */}
                        <NavLink to="/library"
                                 className={({ isActive }) =>
                                     `flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all ${isActive ? 'opacity-100' : 'opacity-40'}`
                                 }>
                            {({ isActive }) => (
                                <>
                                    <span className="text-xl" style={isActive ? { color: '#E8682A' } : { color: 'white' }}>⊞</span>
                                    <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>Library</span>
                                </>
                            )}
                        </NavLink>

                        {/* Stats */}
                        <NavLink to="/stats"
                                 className={({ isActive }) =>
                                     `flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all ${isActive ? 'opacity-100' : 'opacity-40'}`
                                 }>
                            {({ isActive }) => (
                                <>
                                    <span className="text-xl" style={isActive ? { color: '#E8682A' } : { color: 'white' }}>◎</span>
                                    <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>Stats</span>
                                </>
                            )}
                        </NavLink>

                    </div>
                </nav>
            </div>
        </BrowserRouter>
    )
}

export default App