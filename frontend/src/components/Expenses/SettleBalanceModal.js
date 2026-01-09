import { useState } from 'react'
import axios from 'axios'

const SettleBalanceModal = ({ groupId, balances, onClose, onSettlement }) => {
  const [selectedReceiver, setSelectedReceiver] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  
  // Get users who should receive money (positive balance)
  const receivers = balances.filter(b => 
    b.netBalance > 0 && b.user._id !== currentUser.id
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await axios.post('/api/expenses/settle', {
        groupId,
        receiverId: selectedReceiver,
        amount: parseFloat(amount)
      })
      onSettlement()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to record settlement')
    } finally {
      setLoading(false)
    }
  }

  const getMaxAmount = () => {
    if (!selectedReceiver) return 0
    
    const currentUserBalance = balances.find(b => b.user._id === currentUser.id)
    const receiverBalance = balances.find(b => b.user._id === selectedReceiver)
    
    if (!currentUserBalance || !receiverBalance) return 0
    
    // Maximum amount is the minimum of what user owes and what receiver should get
    return Math.min(
      Math.abs(currentUserBalance.netBalance),
      receiverBalance.netBalance
    )
  }

  if (receivers.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Settle Balance</h2>
          <p className="text-dark-muted mb-4">
            No one to settle with at the moment. All balances are settled or you don't owe anyone.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-white text-black py-2 px-4 rounded font-medium hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-card p-6 rounded-lg border border-dark-border w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Settle Balance</h2>
        
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Pay to</label>
            <select
              value={selectedReceiver}
              onChange={(e) => setSelectedReceiver(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-dark-border rounded focus:outline-none focus:border-white"
              required
            >
              <option value="">Select person to pay</option>
              {receivers.map((balance) => (
                <option key={balance.user._id} value={balance.user._id}>
                  {balance.user.name} (should receive ₹{balance.netBalance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-dark-border rounded focus:outline-none focus:border-white"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              max={getMaxAmount()}
              required
            />
            {selectedReceiver && (
              <p className="text-sm text-dark-muted mt-1">
                Maximum: ₹{getMaxAmount().toFixed(2)}
              </p>
            )}
          </div>

          <div className="bg-dark-border p-3 rounded mb-6">
            <p className="text-sm text-dark-muted">
              This will record that you have paid the specified amount to settle your balance.
              Make sure you have actually transferred the money before confirming.
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
              disabled={loading || !selectedReceiver || !amount}
              className="flex-1 bg-white text-black py-2 px-4 rounded font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Recording...' : 'Record Settlement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SettleBalanceModal