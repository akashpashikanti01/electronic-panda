import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import * as api from './utils/api'

// Pages
const Home = () => (
  <div className="p-4 text-center">
    <h1 className="text-4xl font-bold text-green-500">🐼 Electronic Panda</h1>
    <p className="mt-4">Mobile-first social platform for STEM projects</p>
    <p className="mt-2 text-sm text-gray-600">Coming soon with full React frontend</p>
  </div>
)

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('alex_maker')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.login(username, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onLogin(data.user)
    } catch (err) {
      alert('Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-20">
      <h1 className="text-3xl font-bold text-center mb-6 text-green-500">🐼 Electronic Panda</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-center mt-4 text-sm text-gray-600">
        Demo users: alex_maker, priya_robotics, dev_embedded, sara_iot, mike_pcb
      </p>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && (
          <div className="bg-white p-4 border-b flex justify-between items-center">
            <h1 className="text-xl font-bold text-green-500">🐼 Electronic Panda</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm">{user.displayName}</span>
              <button onClick={handleLogout} className="btn-secondary px-4">
                Logout
              </button>
            </div>
          </div>
        )}

        <Routes>
          {!user ? (
            <>
              <Route path="*" element={<Login onLogin={setUser} />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  )
}

export default App
