"use client"
import { useState } from 'react'
import { isValidPhoneNumber } from '@lib/utils'

interface UserProfile {
  name: string | null
  email: string
  phone: string | null
}

export default function ProfileEditForm({ user }: { user: UserProfile }) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    currentPassword: '',
    newPassword: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (formData.phone.trim() && !isValidPhoneNumber(formData.phone)) {
      setMessage({ type: 'error', text: 'Please enter a valid phone number' })
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/account/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
      // Clear password fields
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }))
      
      // Refresh the page to show new data
      window.location.reload()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-cocoa">Account Details</h2>
          <button onClick={() => setIsEditing(true)} className="text-sm text-primary hover:underline">Edit Profile</button>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-cocoa/60 text-xs uppercase tracking-wider">Name</p>
            <p className="font-semibold text-lg">{user.name}</p>
          </div>
          <div>
            <p className="text-cocoa/60 text-xs uppercase tracking-wider">Email</p>
            <p className="font-semibold text-lg">{user.email}</p>
          </div>
          <div>
            <p className="text-cocoa/60 text-xs uppercase tracking-wider">Phone</p>
            <p className="font-semibold text-lg">{user.phone || 'N/A'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-cocoa">Edit Profile</h2>
        <button type="button" onClick={() => setIsEditing(false)} className="text-sm text-red-500 hover:underline">Cancel</button>
      </div>

      {message.text && (
        <div className={`p-3 rounded text-sm mb-4 ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-cocoa">Name</label>
          <input 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="input w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-cocoa">Email (Read-only)</label>
          <input 
            value={user.email}
            disabled
            className="input w-full border rounded p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-cocoa">Phone</label>
          <input 
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="input w-full border rounded p-2"
            placeholder="080..."
          />
        </div>
        
        <div className="pt-4 border-t border-cream">
           <h3 className="font-bold text-cocoa mb-3">Change Password (Optional)</h3>
           <div className="space-y-3">
             <div>
               <label className="text-sm text-cocoa/70">Current Password</label>
               <input 
                 type="password"
                 value={formData.currentPassword}
                 onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                 className="input w-full border rounded p-2"
                 placeholder="Required if setting new password"
               />
             </div>
             <div>
               <label className="text-sm text-cocoa/70">New Password</label>
               <input 
                 type="password"
                 value={formData.newPassword}
                 onChange={e => setFormData({...formData, newPassword: e.target.value})}
                 className="input w-full border rounded p-2"
                 placeholder="Leave empty to keep current"
               />
             </div>
           </div>
        </div>

        <button disabled={loading} className="btn btn-primary w-full mt-2">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
