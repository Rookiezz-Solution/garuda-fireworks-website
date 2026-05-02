import { useState } from 'react' 
import { useNavigate } from 'react-router-dom' 
import axios from 'axios' 
 
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000' 
 
export default function AdminLogin() { 
  const [email, setEmail] = useState('') 
  const [password, setPassword] = useState('') 
  const [error, setError] = useState('') 
  const [loading, setLoading] = useState(false) 
  const navigate = useNavigate() 
 
  const handleLogin = async (e) => { 
    e.preventDefault() 
    setLoading(true) 
    setError('') 
    try { 
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password }) 
      if (res.data.success) { 
        localStorage.setItem('adminToken', res.data.data.token) 
        localStorage.setItem('adminUser', JSON.stringify(res.data.data.user)) 
        navigate('/admin/dashboard') 
      } 
    } catch (err) { 
      setError(err.response?.data?.message || 'Login failed. Check credentials.') 
    } finally { 
      setLoading(false) 
    } 
  } 
 
  return ( 
    <div className="min-h-screen bg-black flex items-center justify-center px-4"> 
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md border border-orange-500/30 shadow-2xl"> 
        <div className="text-center mb-8"> 
          <h1 className="text-4xl font-bold"> 
            <span className="text-orange-500">Garuda</span> 
            <span className="text-white"> Fireworks</span> 
          </h1> 
          <p className="text-gray-400 mt-2">Admin Panel Login</p> 
        </div> 
        <form onSubmit={handleLogin} className="space-y-5"> 
          <div> 
            <label className="text-gray-400 text-sm block mb-1">Email Address</label> 
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-orange-500 outline-none transition" 
              placeholder="admin@garudafireworks.com" 
              required 
            /> 
          </div> 
          <div> 
            <label className="text-gray-400 text-sm block mb-1">Password</label> 
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-orange-500 outline-none transition" 
              placeholder="Enter your password" 
              required 
            /> 
          </div> 
          {error && ( 
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3"> 
              <p className="text-red-400 text-sm">{error}</p> 
            </div> 
          )} 
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
          > 
            {loading ? 'Logging in...' : 'Login to Admin Panel'} 
          </button> 
        </form> 
        <p className="text-gray-600 text-xs text-center mt-6"> 
          Garuda Fireworks Factory, Sivakasi 
        </p> 
      </div> 
    </div> 
  ) 
} 
