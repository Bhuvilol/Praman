import { useState, useEffect } from 'react'

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(), 300) // Wait for animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getToastStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500 border-red-600'
      case 'success':
        return 'bg-green-500 border-green-600'
      case 'warning':
        return 'bg-yellow-500 border-yellow-600'
      case 'info':
      default:
        return 'bg-blue-500 border-blue-600'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌'
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${getToastStyles()} text-white px-6 py-4 rounded-lg shadow-lg border-l-4 flex items-center gap-3 max-w-md`}>
        <span className="text-xl">{getIcon()}</span>
        <div className="flex-1">
          <p className="font-semibold text-sm">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose(), 300)
          }}
          className="text-white hover:text-gray-200 transition-colors text-lg font-bold"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Toast
