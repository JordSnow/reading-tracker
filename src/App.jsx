import { useState, useEffect } from 'react'
import { BrowserRouter, NavLink, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Shelf from './pages/Shelf'
import Table from './pages/Table'
import Library from './pages/Library'
import Roll from './pages/Roll'
import Stats from './pages/Stats'

const navItems = [
    { to: '/', label: 'Home', icon: '⌂' },
    { to: '/shelf', label: 'Shelf', icon: '▤' },
    { to: '/library', label: 'Library', icon: '⊞' },
    { to: '/stats', label: 'Stats', icon: '◎' },
]

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
        <div className="fixed inset-0 flex flex-col items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1117 50%, #0a0a0a 100%)' }}>
            <div className="loading-icon text-6xl mb-4">📚</div>
            <h1 className="text-white text-xl font-semibold tracking-wide">Reading Tracker</h1>
            <p className="text-white/30 text-sm mt-2">Loading your library...</p>
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
            <div className="min-h-screen pb-20">
                <main className="max-w-lg mx-auto px-4 py-8 relative">
                    <AnimatedRoutes />
                </main>

                {/* Glass bottom nav */}
                <nav className="fixed bottom-0 left-0 right-0 glass-strong">
                    <div className="max-w-lg mx-auto flex">
                        {navItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) =>
                                    `flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all ${
                                        isActive ? 'opacity-100' : 'opacity-40'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                    <span className={`text-xl ${isActive ? 'accent' : 'text-white'}`}
                          style={isActive ? { color: '#E8682A' } : {}}>
                      {item.icon}
                    </span>
                                        <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>
                      {item.label}
                    </span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </div>
        </BrowserRouter>
    )
}

export default App