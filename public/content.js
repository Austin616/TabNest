// TabNest Content Script
// Runs on all web pages to provide quick task capture functionality

// Listen for messages from popup/extension
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message)
    
    if (message.type === 'PING') {
      console.log('Responding to PING with ready status')
      sendResponse({ ready: true })
      return true
    }
    
    // Handle unknown messages
    console.log('Unknown message type or missing todo:', message.type)
    sendResponse({ ready: false })
    return true
  })
}

// Immediately Invoked Function Expression (IIFE) to avoid polluting global scope
(function() {
  console.log('TabNest content script loaded')

  // Create floating add button
  const floatingButton = document.createElement('button')
  floatingButton.id = 'tabnest-floating-button'
  floatingButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
  floatingButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border: none;
    color: white;
    cursor: pointer;
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    font-family: system-ui, -apple-system, sans-serif;
  `

  // Hover effects
  floatingButton.addEventListener('mouseenter', () => {
    floatingButton.style.transform = 'scale(1.1)'
    floatingButton.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.6)'
  })

  floatingButton.addEventListener('mouseleave', () => {
    floatingButton.style.transform = 'scale(1)'
    floatingButton.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.4)'
  })

  // Click handler to show quick add modal
  floatingButton.addEventListener('click', showQuickAddModal)

  document.body.appendChild(floatingButton)

  // Create quick add modal
  function showQuickAddModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('tabnest-modal')
    if (existingModal) {
      existingModal.remove()
    }

    // Create modal
    const modal = document.createElement('div')
    modal.id = 'tabnest-modal'
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `

    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 12px;
        padding: 24px;
        width: 400px;
        max-width: 90vw;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        transform: scale(0.9);
        transition: transform 0.3s ease;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 600;">Quick Add Task</h3>
          <button id="tabnest-close" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: background-color 0.2s;
          " onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='transparent'">&times;</button>
        </div>
        
        <form id="tabnest-form">
          <input 
            type="text" 
            id="tabnest-task-input" 
            placeholder="What do you need to do?" 
            required
            style="
              width: 100%;
              padding: 12px;
              border: 2px solid #d1d5db;
              border-radius: 8px;
              font-size: 16px;
              margin-bottom: 16px;
              transition: border-color 0.2s;
              box-sizing: border-box;
            "
            onfocus="this.style.borderColor='#3b82f6'"
            onblur="this.style.borderColor='#d1d5db'"
          >
          
          <div style="display: flex; gap: 12px;">
            <button type="button" id="tabnest-cancel" style="
              flex: 1;
              padding: 12px;
              background: #f3f4f6;
              border: 2px solid #d1d5db;
              border-radius: 8px;
              font-size: 16px;
              color: #374151;
              cursor: pointer;
              transition: background-color 0.2s;
            " onmouseover="this.style.backgroundColor='#e5e7eb'" onmouseout="this.style.backgroundColor='#f3f4f6'">Cancel</button>
            <button type="submit" style="
              flex: 1;
              padding: 12px;
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              border: none;
              border-radius: 8px;
              font-size: 16px;
              color: white;
              cursor: pointer;
              transition: all 0.2s;
            " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">Add Task</button>
          </div>
        </form>
      </div>
    `

    document.body.appendChild(modal)

    const form = modal.querySelector('#tabnest-form')
    const input = modal.querySelector('#tabnest-task-input')
    const closeBtn = modal.querySelector('#tabnest-close')
    const cancelBtn = modal.querySelector('#tabnest-cancel')
    const content = modal.querySelector('div')

    // Close modal function
    function closeModal() {
      modal.style.opacity = '0'
      content.style.transform = 'scale(0.9)'
      setTimeout(() => {
        modal.remove()
      }, 300)
    }

    // Event listeners
    closeBtn.addEventListener('click', closeModal)
    cancelBtn.addEventListener('click', closeModal)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal()
      }
    })

    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const taskText = input.value.trim()
      
      if (taskText) {
        // Get current URL as context
        const currentUrl = window.location.href
        const currentTitle = document.title
        
        // Create new todo
        const newTodo = {
          id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: taskText,
          completed: false,
          createdAt: new Date(),
          dueDate: new Date(new Date().setHours(23, 59, 59, 999)), // Due today at end of day
          description: `Added from: ${currentTitle}\nURL: ${currentUrl}`,
          tags: [],
          reminderDays: undefined
        }

        // Send to background script for storage
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({
            type: 'ADD_TODO',
            todo: newTodo
          }, (response) => {
            console.log('Add todo response:', response)
            if (response && response.success) {
              showNotification('Task added successfully!')
              closeModal()
            } else {
              showNotification('Failed to add task', 'error')
            }
          })
        } else {
          console.error('Chrome runtime not available')
          showNotification('Failed to add task', 'error')
        }
      }
    })

    // Animate in
    requestAnimationFrame(() => {
      modal.style.opacity = '1'
      content.style.transform = 'scale(1)'
    })

    // Focus input
    setTimeout(() => {
      input.focus()
    }, 100)

    // Close on escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal()
        document.removeEventListener('keydown', handleEscape)
      }
    }
    document.addEventListener('keydown', handleEscape)
  }

  // Show in-page notification
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #dc2626, #ef4444)'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 10001;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `
    notification.textContent = message

    document.body.appendChild(notification)

    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)'
    })

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 3000)
  }

  console.log('TabNest content script initialized with floating button')
})()