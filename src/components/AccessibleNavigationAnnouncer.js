import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function AccessibleNavigationAnnouncer() {
  const [message, setMessage] = useState('')
  const location = useLocation()

  useEffect(() => {
    let timeoutId

    if (location.pathname.slice(1)) {
      timeoutId = setTimeout(() => {
        setMessage(`Navigated to ${location.pathname.slice(1)} page.`)
      }, 500)
    } else {
      setMessage('')
    }

    // ✅ Cleanup timeout to prevent state updates after unmount
    return () => {
      clearTimeout(timeoutId)
    }
  }, [location])

  return (
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </span>
  )
}

export default AccessibleNavigationAnnouncer
