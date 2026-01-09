import { useState } from 'react'
import axios from 'axios'

const JoinGroupModal = ({ onClose, onGroupJoined }) => {
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await axios.post('/api/groups/join', { joinCode })
      onGroupJoined()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to join group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-card p-6 rounded-lg border border-dark-border w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Join Group</h2>
        
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Join Code</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 bg-black border border-dark-border rounded focus:outline-none focus:border-white"
              placeholder="Enter 6-character code"
              maxLength="6"
              required
            />
            <p className="text-sm text-dark-muted mt-1">
              Ask the group creator for the join code
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-dark-card border border-dark-border py-2 px-4 rounded font-medium hover:bg-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || joinCode.length !== 6}
              className="flex-1 bg-white text-black py-2 px-4 rounded font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JoinGroupModal