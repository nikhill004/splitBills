import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import AddExpenseModal from '../Expenses/AddExpenseModal.js'
import SettleBalanceModal from '../Expenses/SettleBalanceModal.js'
import DeleteGroupModal from './DeleteGroupModal.js'

const GroupDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('expenses')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showSettleModal, setShowSettleModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetchGroupData()
  }, [id])

  const fetchGroupData = async () => {
    try {
      const [groupRes, expensesRes, balancesRes, settlementsRes] = await Promise.all([
        axios.get(`/api/groups/${id}`),
        axios.get(`/api/expenses/group/${id}`),
        axios.get(`/api/expenses/balances/${id}`),
        axios.get(`/api/expenses/settlements/${id}`)
      ])

      setGroup(groupRes.data.group)
      setExpenses(expensesRes.data.expenses)
      setBalances(balancesRes.data.balances)
      setSettlements(settlementsRes.data.settlements)
    } catch (error) {
      console.error('Error fetching group data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseAdded = () => {
    setShowAddExpense(false)
    fetchGroupData()
  }

  const handleSettlement = () => {
    setShowSettleModal(false)
    fetchGroupData()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleGroupDeleted = () => {
    setShowDeleteModal(false)
    navigate('/dashboard')
  }

  const getCurrentUserBalance = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    return balances.find(b => b.user._id === currentUser.id)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Group not found</div>
      </div>
    )
  }

  const currentUserBalance = getCurrentUserBalance()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link to="/dashboard" className="text-dark-muted hover:text-white mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            {group.description && (
              <p className="text-dark-muted mt-1">{group.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-dark-muted">Join Code</p>
            <p className="text-lg font-mono">{group.joinCode}</p>
          </div>
        </div>

        {/* Current User Balance */}
        {currentUserBalance && (
          <div className="bg-dark-card p-4 rounded-lg border border-dark-border mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Your Balance</h3>
                {currentUserBalance.netBalance < 0 ? (
                  <p className="text-red-400 text-xl font-bold">
                    You owe ₹{Math.abs(currentUserBalance.netBalance).toFixed(2)}
                  </p>
                ) : currentUserBalance.netBalance > 0 ? (
                  <p className="text-green-400 text-xl font-bold">
                    You will receive ₹{currentUserBalance.netBalance.toFixed(2)}
                  </p>
                ) : (
                  <p className="text-white text-xl font-bold">You're settled up!</p>
                )}
              </div>
              {currentUserBalance.netBalance < 0 && (
                <button
                  onClick={() => setShowSettleModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700"
                >
                  Settle Up
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAddExpense(true)}
            className="bg-white text-black px-6 py-2 rounded font-medium hover:bg-gray-200"
          >
            Add Expense
          </button>
          
          {/* Show delete button only for group creator */}
          {group.createdBy._id === JSON.parse(localStorage.getItem('user') || '{}').id && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-6 py-2 rounded font-medium hover:bg-red-700"
            >
              Delete Group
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-dark-border">
          <nav className="-mb-px flex space-x-8">
            {['expenses', 'balances', 'settlements'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-white text-white'
                    : 'border-transparent text-dark-muted hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'expenses' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Expenses</h2>
          {expenses.length === 0 ? (
            <div className="bg-dark-card p-8 rounded-lg border border-dark-border text-center">
              <p className="text-dark-muted">No expenses yet. Add the first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense._id} className="bg-dark-card p-4 rounded-lg border border-dark-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{expense.title}</h3>
                      <p className="text-sm text-dark-muted">
                        Paid by {expense.paidBy.name} on {formatDate(expense.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{expense.amount.toFixed(2)}</p>
                      <p className="text-sm text-dark-muted">
                        ₹{(expense.amount / expense.splits.length).toFixed(2)} per person
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'balances' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Balances</h2>
          <div className="space-y-4">
            {balances.map((balance) => (
              <div key={balance.user._id} className="bg-dark-card p-4 rounded-lg border border-dark-border">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{balance.user.name}</h3>
                    <p className="text-sm text-dark-muted">
                      Paid: ₹{balance.totalPaid.toFixed(2)} | Spend: ₹{balance.actualSpend.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    {balance.netBalance < 0 ? (
                      <p className="text-red-400 font-bold">
                        Owes ₹{Math.abs(balance.netBalance).toFixed(2)}
                      </p>
                    ) : balance.netBalance > 0 ? (
                      <p className="text-green-400 font-bold">
                        Gets ₹{balance.netBalance.toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-white font-bold">Settled</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settlements' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Settlement History</h2>
          {settlements.length === 0 ? (
            <div className="bg-dark-card p-8 rounded-lg border border-dark-border text-center">
              <p className="text-dark-muted">No settlements yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {settlements.map((settlement) => (
                <div key={settlement._id} className="bg-dark-card p-4 rounded-lg border border-dark-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {settlement.payer.name} paid {settlement.receiver.name}
                      </p>
                      <p className="text-sm text-dark-muted">
                        {formatDate(settlement.settledAt)}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-400">
                      ₹{settlement.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddExpense && (
        <AddExpenseModal
          groupId={id}
          onClose={() => setShowAddExpense(false)}
          onExpenseAdded={handleExpenseAdded}
        />
      )}

      {showSettleModal && (
        <SettleBalanceModal
          groupId={id}
          balances={balances}
          onClose={() => setShowSettleModal(false)}
          onSettlement={handleSettlement}
        />
      )}

      {showDeleteModal && (
        <DeleteGroupModal
          group={group}
          onClose={() => setShowDeleteModal(false)}
          onGroupDeleted={handleGroupDeleted}
        />
      )}
    </div>
  )
}

export default GroupDetail