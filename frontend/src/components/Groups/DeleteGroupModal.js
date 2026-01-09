import { useState } from 'react'
import axios from 'axios'

const DeleteGroupModal = ({ group, onClose, onGroupDeleted }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setError('')
    setLoading(true)

    try {
      await axios.delete(`/api/groups/${group._id}`)
      onGroupDeleted()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-card p-6 rounded-lg border border-dark-border w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-red-400">Delete Group</h2>
        
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <p className="text-white mb-2">
            Are you sure you want to delete the group "{group.name}"?
          </p>
          <p className="text-dark-muted text-sm">
            This will permanently delete:
          </p>
          <ul className="text-dark-muted text-sm mt-2 ml-4">
            <li>• All expenses in this group</li>
            <li>• All settlement history</li>
            <li>• The group and its join code</li>
          </ul>
          <p className="text-red-400 text-sm mt-3 font-medium">
            This action cannot be undone!
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
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Deleting...' : 'Delete Group'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteGroupModal