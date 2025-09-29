// Run this in browser console to clear corrupted todo data

// For Chrome Extension
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.clear(() => {
    console.log('✅ Chrome storage cleared');
  });
}

// For Web App (localStorage)
localStorage.removeItem('tabnest-todos');
console.log('✅ LocalStorage cleared');

console.log('🔄 Please refresh the page to start fresh');
