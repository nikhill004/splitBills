import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import CreateGroupModal from '../Groups/CreateGroupModal.js'
import JoinGroupModal from '../Groups/JoinGroupModal.js'

const Dashboard = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [userBalances, setUserBalances] = useState({
    totalOwed: 0,
    totalToReceive: 0
  })

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups')
      setGroups(response.data.groups)
      calculateUserBalances(response.data.groups)
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateUserBalances = async (userGroups) => {
    let totalOwed = 0
    let totalToReceive = 0

    for (const group of userGroups) {
      try {
        const response = await axios.get(`/api/expenses/balances/${group._id}`)
        const balances = response.data.balances
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        
        console.log('Current user from localStorage:', currentUser)
        console.log('Balances from API:', balances)
        
        // Try both id and _id to be safe
        const userBalance = balances.find(b => 
          b.user._id === currentUser.id || b.user._id === currentUser._id
        )
        
        console.log('Found user balance:', userBalance)
        
        if (userBalance) {
          console.log('Net balance:', userBalance.netBalance)
          if (userBalance.netBalance < 0) {
            totalOwed += Math.abs(userBalance.netBalance)
          } else if (userBalance.netBalance > 0) {
            totalToReceive += userBalance.netBalance
          }
        }
      } catch (error) {
        console.error('Error calculating balances for group:', group._id)
      }
    }

    console.log('Final totals - Owed:', totalOwed, 'To Receive:', totalToReceive)
    setUserBalances({ totalOwed, totalToReceive })
  }

  const handleGroupCreated = () => {
    setShowCreateModal(false)
    fetchGroups()
  }

  const handleGroupJoined = () => {
    setShowJoinModal(false)
    fetchGroups()
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        
        {/* Balance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h3 className="text-lg font-medium mb-2">You Owe</h3>
            <p className="text-2xl font-bold text-red-400">₹{userBalances.totalOwed.toFixed(2)}</p>
          </div>
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h3 className="text-lg font-medium mb-2">You Will Receive</h3>
            <p className="text-2xl font-bold text-green-400">₹{userBalances.totalToReceive.toFixed(2)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-black px-6 py-2 rounded font-medium hover:bg-gray-200"
          >
            Create Group
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-dark-card border border-dark-border px-6 py-2 rounded font-medium hover:bg-gray-900"
          >
            Join Group
          </button>
        </div>
      </div>

      {/* Groups List */}
      <div>
        <h2 className="text-xl font-bold mb-4">Your Groups</h2>
        {groups.length === 0 ? (
          <div className="bg-dark-card p-8 rounded-lg border border-dark-border text-center">
            <p className="text-dark-muted mb-4">You haven't joined any groups yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-black px-6 py-2 rounded font-medium hover:bg-gray-200"
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Link
                key={group._id}
                to={`/group/${group._id}`}
                className="bg-dark-card p-6 rounded-lg border border-dark-border hover:border-white transition-colors"
              >
                <h3 className="text-lg font-medium mb-2">{group.name}</h3>
                {group.description && (
                  <p className="text-dark-muted mb-3">{group.description}</p>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-dark-muted">
                    {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-dark-muted">
                    Code: {group.joinCode}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}

      {showJoinModal && (
        <JoinGroupModal
          onClose={() => setShowJoinModal(false)}
          onGroupJoined={handleGroupJoined}
        />
      )}
    </div>
  )
}

export default Dashboard