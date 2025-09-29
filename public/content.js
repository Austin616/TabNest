// TabNest Content Script
// Runs on all web pages to provide quick task capture functionality

(function() {
  'use strict'

  // Create floating action button for quick task capture
  function createFloatingButton() {
    const button = document.createElement('div')
    button.id = 'tabnest-floating-btn'
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
    `
    
    // Styles for the floating button
    Object.assign(button.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #2563eb, #059669)',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
      zIndex: '9999',
      transition: 'all 0.3s ease',
      opacity: '0',
      transform: 'scale(0.8)',
      pointerEvents: 'auto'
    })

    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)'
      button.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)'
    })

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)'
      button.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'
    })

    // Click handler
    button.addEventListener('click', showQuickAddModal)

    document.body.appendChild(button)

    // Animate in
    setTimeout(() => {
      button.style.opacity = '1'
      button.style.transform = 'scale(1)'
    }, 100)

    return button
  }

  // Create quick add modal
  function showQuickAddModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('tabnest-modal')
    if (existingModal) {
      existingModal.remove()
      return
    }

    const modal = document.createElement('div')
    modal.id = 'tabnest-modal'
    
    // Get selected text if any
    const selectedText = window.getSelection().toString().trim()
    
    modal.innerHTML = `
      <div id="tabnest-modal-backdrop" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      ">
        <div id="tabnest-modal-content" style="
          background: white;
          border-radius: 12px;
          padding: 24px;
          width: 400px;
          max-width: 90vw;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          transform: scale(0.9);
          transition: transform 0.3s ease;
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          ">
            <h3 style="
              margin: 0;
              font-size: 18px;
              font-weight: 600;
              background: linear-gradient(135deg, #2563eb, #059669);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            ">Add to TabNest</h3>
            <button id="tabnest-close-modal" style="
              background: none;
              border: none;
              font-size: 20px;
              cursor: pointer;
              color: #64748b;
              padding: 4px;
              border-radius: 4px;
            ">×</button>
          </div>
          
          <form id="tabnest-quick-form">
            <textarea id="tabnest-task-input" placeholder="Enter your task..." style="
              width: 100%;
              min-height: 80px;
              padding: 12px;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 14px;
              resize: vertical;
              outline: none;
              transition: border-color 0.2s ease;
            ">${selectedText}</textarea>
            
            <div style="
              display: flex;
              gap: 8px;
              margin-top: 16px;
            ">
              <button type="button" id="tabnest-cancel" style="
                flex: 1;
                padding: 10px 16px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                background: white;
                color: #64748b;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
              ">Cancel</button>
              
              <button type="submit" id="tabnest-add" style="
                flex: 1;
                padding: 10px 16px;
                border: none;
                border-radius: 8px;
                background: linear-gradient(135deg, #2563eb, #059669);
                color: white;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
              ">Add Task</button>
            </div>
          </form>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Animate in
    const backdrop = modal.querySelector('#tabnest-modal-backdrop')
    const content = modal.querySelector('#tabnest-modal-content')
    
    setTimeout(() => {
      backdrop.style.opacity = '1'
      content.style.transform = 'scale(1)'
    }, 10)

    // Focus the textarea
    const textarea = modal.querySelector('#tabnest-task-input')
    setTimeout(() => textarea.focus(), 100)

    // Event handlers
    modal.querySelector('#tabnest-close-modal').addEventListener('click', closeModal)
    modal.querySelector('#tabnest-cancel').addEventListener('click', closeModal)
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal()
    })

    modal.querySelector('#tabnest-quick-form').addEventListener('submit', (e) => {
      e.preventDefault()
      const taskText = textarea.value.trim()
      if (taskText) {
        addTaskToStorage(taskText)
        closeModal()
      }
    })

    // ESC key handler
    function handleEscape(e) {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    document.addEventListener('keydown', handleEscape)

    function closeModal() {
      document.removeEventListener('keydown', handleEscape)
      backdrop.style.opacity = '0'
      content.style.transform = 'scale(0.9)'
      setTimeout(() => modal.remove(), 300)
    }
  }

  // Add task to storage
  function addTaskToStorage(text) {
    const task = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: text,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      tags: ['from-web', window.location.hostname]
    }

    // Send to background script
    chrome.runtime.sendMessage({
      type: 'GET_TODOS'
    }, (response) => {
      try {
        const todos = JSON.parse(response.todos || '[]')
        todos.push(task)
        
        chrome.runtime.sendMessage({
          type: 'SAVE_TODOS',
          data: JSON.stringify(todos)
        })

        // Show success notification
        showNotification('Task added to TabNest!', 'success')
      } catch (error) {
        console.error('Error adding task:', error)
        showNotification('Failed to add task', 'error')
      }
    })
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
    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
    }, 10)

    // Auto remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }

  // Initialize when page is ready
  function init() {
    // Don't show on extension pages
    if (window.location.protocol === 'chrome-extension:') return
    
    // Don't show on certain sites
    const blockedSites = ['chrome.google.com', 'chrome-extension://', 'moz-extension://']
    if (blockedSites.some(site => window.location.href.includes(site))) return

    // Create floating button after a short delay
    setTimeout(createFloatingButton, 1000)
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

})();
