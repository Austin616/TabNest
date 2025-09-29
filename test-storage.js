// Test script to verify all fields are being saved/loaded correctly
// Run this in browser console after creating a task

console.log('=== Testing Storage Persistence ===');

// Check what's actually stored
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(['tabnest-todos'], (result) => {
    console.log('📦 Raw Chrome Storage Data:', result);
    const todos = result['tabnest-todos'];
    if (todos && todos.length > 0) {
      console.log('📝 First Todo Fields:');
      console.log('  - id:', todos[0].id);
      console.log('  - text:', todos[0].text);
      console.log('  - description:', todos[0].description);
      console.log('  - dueDate:', todos[0].dueDate);
      console.log('  - createdAt:', todos[0].createdAt);
      console.log('  - completed:', todos[0].completed);
      console.log('  - reminderDays:', todos[0].reminderDays);
      console.log('  - tags:', todos[0].tags);
    }
  });
} else {
  const stored = localStorage.getItem('tabnest-todos');
  console.log('📦 Raw LocalStorage Data:', stored);
  if (stored) {
    const todos = JSON.parse(stored);
    if (todos.length > 0) {
      console.log('📝 First Todo Fields:');
      console.log('  - id:', todos[0].id);
      console.log('  - text:', todos[0].text);
      console.log('  - description:', todos[0].description);
      console.log('  - dueDate:', todos[0].dueDate);
      console.log('  - createdAt:', todos[0].createdAt);
      console.log('  - completed:', todos[0].completed);
      console.log('  - reminderDays:', todos[0].reminderDays);
      console.log('  - tags:', todos[0].tags);
    }
  }
}
