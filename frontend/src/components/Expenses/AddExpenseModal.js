import { useState } from 'react'
import axios from 'axios'

const AddExpenseModal = ({ groupId, onClose, onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await axios.post('/api/expenses', {
        ...formData,
        amount: parseFloat(formData.amount),
        groupId
      })
      onExpenseAdded()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-card p-6 rounded-lg border border-dark-border w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Expense</h2>
        
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-black border border-dark-border rounded focus:outline-none focus:border-white"
              placeholder="e.g., Dinner, Groceries, Uber"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-black border border-dark-border rounded focus:outline-none focus:border-white"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-black border border-dark-border rounded focus:outline-none focus:border-white"
              required
            />
          </div>

          <div className="bg-dark-border p-3 rounded mb-6">
            <p className="text-sm text-dark-muted">
              This expense will be split equally among all group members.
              You will be marked as the person who paid.
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
              disabled={loading}
              className="flex-1 bg-white text-black py-2 px-4 rounded font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddExpenseModal