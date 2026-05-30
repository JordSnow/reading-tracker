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
            <div className="min-h-screen pb-20">
                <main className="max-w-lg mx-auto px-4 py-8 relative overflow-hidden"
                    style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))' }}>
                    <AnimatedRoutes />
                </main>

                {/* Glass bottom nav with centre roll button */}
                <nav className="fixed bottom-0 left-0 right-0"
                     style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

                    {/* Centre roll button floating above nav */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-10">
                        <NavLink to="/roll">
                            {({ isActive }) => (
                                <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-2xl transition-all"
                                     style={{
                                         background: isActive ? '#E8682A' : 'linear-gradient(135deg, #E8682A, #d45a1f)',
                                         boxShadow: '0 4px 20px rgba(232,104,42,0.5)',
                                         transform: isActive ? 'scale(1.1)' : 'scale(1)'
                                     }}>
                                    🎲
                                </div>
                            )}
                        </NavLink>
                    </div>

                    <div className="glass-strong">
                        <div className="max-w-lg mx-auto flex">
                            {/* Left two items */}
                            {navItems.slice(0, 2).map(item => (
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
              <span className="text-xl" style={isActive ? { color: '#E8682A' } : { color: 'white' }}>
                {item.icon}
              </span>
                                            <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>
                {item.label}
              </span>
                                        </>
                                    )}
                                </NavLink>
                            ))}

                            {/* Centre gap for roll button */}
                            <div className="flex-1" />

                            {/* Right two items */}
                            {navItems.slice(2).map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all ${
                                            isActive ? 'opacity-100' : 'opacity-40'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
              <span className="text-xl" style={isActive ? { color: '#E8682A' } : { color: 'white' }}>
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
                    </div>
                </nav>
            </div>
        </BrowserRouter>
    )
}

export default App