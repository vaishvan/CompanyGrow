import { useState, useEffect } from 'react'
import { Coins, DollarSign, TrendingUp, History, CreditCard } from 'lucide-react'
import axios from 'axios'

const PaymentDashboard = () => {
  const [paymentData, setPaymentData] = useState({
    totalTokens: 0,
    availableTokens: 0,
    cashedOutTokens: 0,
    totalEarnings: 0,
    availableEarnings: 0,
    paymentHistory: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cashoutLoading, setCashoutLoading] = useState(false)
  const [cashoutAmount, setCashoutAmount] = useState('')
  const [showCashoutModal, setShowCashoutModal] = useState(false)

  useEffect(() => {
    fetchPaymentData()
  }, [])

  const fetchPaymentData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/payments/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setPaymentData(response.data)
    } catch (err) {
      setError('Failed to load payment data')
      console.error('Error fetching payment data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCashout = async () => {
    const tokens = parseInt(cashoutAmount)
    
    if (!tokens || tokens <= 0) {
      alert('Please enter a valid number of tokens')
      return
    }

    if (tokens > paymentData.availableTokens) {
      alert('Insufficient tokens available for cash out')
      return
    }

    try {
      setCashoutLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:5000/api/payments/cashout', 
        { tokens }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        alert(`Successfully initiated cash out of ${tokens} tokens (₹${response.data.amount})`)
        setCashoutAmount('')
        setShowCashoutModal(false)
        fetchPaymentData() // Refresh data
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Cash out failed'
      alert(errorMessage)
      console.error('Error during cashout:', err)
    } finally {
      setCashoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>{error}</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Tokens Earned',
      value: paymentData.totalTokens,
      icon: Coins,
      color: 'bg-blue-600',
      description: 'Total tokens earned from projects and courses'
    },
    {
      title: 'Available Tokens',
      value: paymentData.availableTokens,
      icon: TrendingUp,
      color: 'bg-green-600',
      description: 'Tokens available for cash out'
    },
    {
      title: 'Available Earnings',
      value: `₹${paymentData.availableEarnings}`,
      icon: DollarSign,
      color: 'bg-purple-600',
      description: 'Amount you can cash out now'
    },
    {
      title: 'Total Earnings',
      value: `₹${paymentData.totalEarnings}`,
      icon: CreditCard,
      color: 'bg-orange-600',
      description: 'Total amount earned till date'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Coins className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Payment Dashboard</h1>
        </div>
        
        {paymentData.availableTokens > 0 && (
          <button
            onClick={() => setShowCashoutModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Cash Out Tokens
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{card.description}</p>
                </div>
                <div className={`${card.color} rounded-full p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Token Information */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Token Information</h2>
        <div className="text-gray-300 space-y-2">
          <p>• Each token is worth ₹1</p>
          <p>• Earn tokens by completing courses and projects</p>
          <p>• Cash out your tokens anytime after completion</p>
          <p>• Minimum cash out: 1 token (₹1)</p>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <History className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Payment History</h2>
        </div>
        
        {paymentData.paymentHistory && paymentData.paymentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Tokens</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {paymentData.paymentHistory.map((payment, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-2">
                      {new Date(payment.createdAt || payment.date).toLocaleDateString()}
                    </td>
                    <td className="py-2">{payment.tokens}</td>
                    <td className="py-2">₹{payment.amount}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        payment.status === 'completed' ? 'bg-green-600' :
                        payment.status === 'pending' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-2 text-xs text-gray-400">{payment.transactionId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p>No payment history yet</p>
            <p className="text-sm mt-2">Complete courses and projects to start earning tokens!</p>
          </div>
        )}
      </div>

      {/* Cash Out Modal */}
      {showCashoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cash Out Tokens</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 mb-2">
                  Available tokens: <span className="font-bold">{paymentData.availableTokens}</span>
                </p>
                <p className="text-gray-600 mb-4">
                  Available earnings: <span className="font-bold">₹{paymentData.availableEarnings}</span>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of tokens to cash out
                </label>
                <input
                  type="number"
                  min="1"
                  max={paymentData.availableTokens}
                  value={cashoutAmount}
                  onChange={(e) => setCashoutAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of tokens"
                />
                {cashoutAmount && (
                  <p className="text-sm text-gray-600 mt-1">
                    Amount: ₹{parseInt(cashoutAmount) || 0}
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCashoutModal(false)
                  setCashoutAmount('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={cashoutLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCashout}
                disabled={cashoutLoading || !cashoutAmount}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {cashoutLoading ? 'Processing...' : 'Cash Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentDashboard
