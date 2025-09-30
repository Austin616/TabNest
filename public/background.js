// TabNest Background Service Worker (Manifest V3)

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  console.log('TabNest extension installed/updated:', details.reason)
  
  // Set default storage values
  chrome.storage.local.get(['tabnest-todos'], (result) => {
    if (!result['tabnest-todos']) {
      chrome.storage.local.set({ 'tabnest-todos': '[]' })
    }
  })

  // Create context menu for quick task addition
  chrome.contextMenus.create({
    id: 'add-task',
    title: 'Add to TabNest Tasks',
    contexts: ['selection']
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'add-task' && info.selectionText) {
    addTaskFromSelection(info.selectionText)
  }
})

// Add task from selected text
function addTaskFromSelection(text) {
  chrome.storage.local.get(['tabnest-todos'], (result) => {
    try {
      const todos = result['tabnest-todos'] ? JSON.parse(result['tabnest-todos']) : []
      
      const newTodo = {
        id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: text.substring(0, 100), // Limit length
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: new Date().toISOString(), // Due today
        tags: ['from-web']
      }
      
      todos.push(newTodo)
      chrome.storage.local.set({ 'tabnest-todos': JSON.stringify(todos) })
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'TabNest',
        message: `Added task: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
      })
    } catch (error) {
      console.error('Error adding task from selection:', error)
    }
  })
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  // Open the extension popup or dashboard
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
})

// Sync data between popup and dashboard
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes['tabnest-todos']) {
    // Broadcast changes to all extension pages
    chrome.runtime.sendMessage({
      type: 'TODOS_UPDATED',
      data: changes['tabnest-todos'].newValue
    }).catch(() => {
      // Ignore errors if no listeners
    })
  }
})

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_TODOS':
      chrome.storage.local.get(['tabnest-todos'], (result) => {
        sendResponse({ todos: result['tabnest-todos'] || '[]' })
      })
      return true // Keep message channel open for async response
      
    case 'SAVE_TODOS':
      chrome.storage.local.set({ 'tabnest-todos': message.data })
      sendResponse({ success: true })
      break
      
    case 'SHOW_NOTIFICATION':
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: message.title || 'TabNest',
        message: message.message
      })
      break

    case 'UPDATE_TODO':
      chrome.storage.local.get(['tabnest-todos'], (result) => {
        try {
          const todos = result['tabnest-todos'] ? JSON.parse(result['tabnest-todos']) : []
          const todoIndex = todos.findIndex(todo => todo.id === message.todoId)
          
          if (todoIndex !== -1) {
            // Update the todo with the provided updates
            todos[todoIndex] = { ...todos[todoIndex], ...message.updates }
            
            // Serialize dates to strings for storage
            if (todos[todoIndex].dueDate instanceof Date) {
              todos[todoIndex].dueDate = todos[todoIndex].dueDate.toISOString()
            }
            if (todos[todoIndex].createdAt instanceof Date) {
              todos[todoIndex].createdAt = todos[todoIndex].createdAt.toISOString()
            }
            
            chrome.storage.local.set({ 'tabnest-todos': JSON.stringify(todos) }, () => {
              sendResponse({ success: true })
            })
          } else {
            sendResponse({ success: false, error: 'Todo not found' })
          }
        } catch (error) {
          console.error('Error updating todo:', error)
          sendResponse({ success: false, error: error.message })
        }
      })
      return true // Keep message channel open for async response
      
    default:
      console.log('Unknown message type:', message.type)
  }
})

// Periodic reminder check (every 15 minutes)
chrome.alarms.create('checkReminders', { periodInMinutes: 15 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkReminders') {
    checkForDueReminders()
  }
})

function checkForDueReminders() {
  chrome.storage.local.get(['tabnest-todos'], (result) => {
    try {
      const todos = result['tabnest-todos'] ? JSON.parse(result['tabnest-todos']) : []
      const now = new Date()
      
      todos.forEach(todo => {
        if (!todo.completed && todo.dueDate) {
          const dueDate = new Date(todo.dueDate)
          const timeDiff = dueDate.getTime() - now.getTime()
          const hoursDiff = timeDiff / (1000 * 3600)
          
          // Notify for tasks due within 2 hours
          if (hoursDiff > 0 && hoursDiff <= 2) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon-48.png',
              title: 'TabNest Reminder',
              message: `Task due soon: ${todo.text}`
            })
          }
        }
      })
    } catch (error) {
      console.error('Error checking reminders:', error)
    }
  })
}
