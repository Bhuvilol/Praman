import { useState } from 'react'

function DataManager() {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState('')

  const clearAllData = async () => {
    if (window.confirm('⚠️ This will clear ALL user data! Are you sure?')) {
      try {
        const response = await fetch('/api/users/clear', { method: 'POST' })
        const result = await response.json()
        
        if (result.success) {
          setMessage('✅ All data cleared successfully!')
          setTimeout(() => setMessage(''), 3000)
        }
      } catch (error) {
        setMessage('❌ Error clearing data')
        setTimeout(() => setMessage(''), 3000)
      }
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch('/api/users/export')
      const result = await response.json()
      
      if (result.success) {
        // Download as JSON file
        const dataStr = JSON.stringify(result.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `praman-data-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
        
        setMessage('✅ Data exported successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('❌ Error exporting data')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const importData = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result)
          const response = await fetch('/api/users/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          const result = await response.json()
          
          if (result.success) {
            setMessage('✅ Data imported successfully!')
            setTimeout(() => setMessage(''), 3000)
          }
        } catch (error) {
          setMessage('❌ Error importing data')
          setTimeout(() => setMessage(''), 3000)
        }
      }
      reader.readAsText(file)
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Data Management"
      >
        ⚙️
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border p-4 w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Data Management</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      {message && (
        <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
          {message}
        </div>
      )}
      
      <div className="space-y-3">
        <button
          onClick={exportData}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          📤 Export Data
        </button>
        
        <label className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors cursor-pointer block text-center">
          📥 Import Data
          <input
            type="file"
            accept=".json"
            onChange={importData}
            className="hidden"
          />
        </label>
        
        <button
          onClick={clearAllData}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          🗑️ Clear All Data
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        💾 Data stored in browser local storage
      </div>
    </div>
  )
}

export default DataManager
