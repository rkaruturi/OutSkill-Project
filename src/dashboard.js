import './style.css'
import { signOut, getCurrentUser, onAuthStateChange, getTasks, createTask, updateTask, deleteTask, getSubtasks, createSubtask, updateSubtask, deleteSubtask, generateSubtasks, smartSearch } from './supabase.js'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <header class="header">
      <nav class="nav">
        <button class="nav-btn back-btn">← Back to Home</button>
        <button class="nav-btn logout-btn">Logout</button>
      </nav>
    </header>
    
    <main class="main-content">
      <div class="dashboard-section">
        <h1 class="dashboard-heading">Your Tasks</h1>
        
        <div class="smart-search-section">
          <label for="smartSearch" class="search-label">Smart Search</label>
          <div class="search-input-container">
            <input type="text" id="smartSearch" class="search-input" placeholder="Search your tasks intelligently..." />
            <button type="button" class="search-btn" id="searchBtn">Search</button>
          </div>
          <div class="search-results" id="searchResults" style="display: none;">
            <h3 class="search-results-title">Search Results</h3>
            <div class="search-results-list" id="searchResultsList"></div>
          </div>
        </div>
        
        <div class="smart-search-section">
          <div class="search-container">
            <label for="smartSearch" class="search-label">Smart Search</label>
            <div class="search-input-container">
              <input type="text" id="smartSearch" name="smartSearch" class="search-input" placeholder="Search your tasks intelligently..." />
              <button type="button" class="search-btn" id="searchBtn">Search</button>
            </div>
          </div>
          
          <div class="search-results" id="searchResults" style="display: none;">
            <h3 class="search-results-title">Search Results</h3>
            <div class="search-results-list" id="searchResultsList"></div>
          </div>
        </div>
        
        <div class="tasks-container">
          <div class="tasks-list" id="tasksList">
            <div class="loading-message">Loading tasks...</div>
          </div>
        </div>
        
        <div class="add-task-section">
          <div class="input-group">
            <label for="newTask" class="input-label">New Task</label>
            <div class="add-task-container">
              <input type="text" id="newTask" name="newTask" class="input-field task-input" placeholder="Enter a new task" />
              <select id="taskPriority" class="input-field priority-select">
                <option value="low">Low Priority</option>
                <option value="medium" selected>Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button type="button" class="add-task-btn" id="addTaskBtn">Add Task</button>
            </div>
          </div>
        </div>
        
        <div class="logout-section">
          <button type="button" class="logout-btn-primary" id="logoutBtn">Logout</button>
        </div>
      </div>
    </main>
  </div>
`

// Task management functionality
let tasks = [];
let subtasks = {};
let aiSuggestions = {};
let searchResults = [];

// Check authentication on page load
checkAuth()

async function checkAuth() {
  const user = await getCurrentUser()
  if (!user) {
    // Redirect to login if not authenticated
    window.location.href = '/login.html'
    return
  }
  
  // Update UI with user info
  const heading = document.querySelector('.dashboard-heading')
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  heading.textContent = `Welcome, ${userName}!`
  
  // Load tasks
  await loadTasks()
}

// Listen for auth state changes
onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    window.location.href = '/'
  }
})

// Add event listeners
document.querySelector('.back-btn').addEventListener('click', () => {
  window.location.href = '/'
})

// Add profile navigation
const profileBtn = document.createElement('button')
profileBtn.className = 'nav-btn profile-btn'
profileBtn.textContent = 'Profile'
profileBtn.addEventListener('click', () => {
  window.location.href = '/profile.html'
})
document.querySelector('.nav').insertBefore(profileBtn, document.querySelector('.logout-btn'))

document.querySelector('.logout-btn').addEventListener('click', () => {
  handleLogout()
})

document.querySelector('#logoutBtn').addEventListener('click', () => {
  handleLogout()
})

document.querySelector('#addTaskBtn').addEventListener('click', () => {
  addNewTask()
})

document.querySelector('#newTask').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addNewTask()
  }
})

document.querySelector('#searchBtn').addEventListener('click', () => {
  performSmartSearch()
})

document.querySelector('#smartSearch').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSmartSearch()
  }
})

async function loadTasks() {
  const tasksList = document.querySelector('#tasksList')
  tasksList.innerHTML = '<div class="loading-message">Loading tasks...</div>'
  
  try {
    const { data, error } = await getTasks()
    
    if (error) {
      tasksList.innerHTML = '<div class="error-message">Error loading tasks. Please refresh the page.</div>'
      console.error('Error loading tasks:', error)
      return
    }
    
    tasks = data || []
    await loadAllSubtasks()
  } catch (error) {
    tasksList.innerHTML = '<div class="error-message">Error loading tasks. Please refresh the page.</div>'
    console.error('Error loading tasks:', error)
  }
}

async function loadAllSubtasks() {
  // Load subtasks for all tasks
  for (const task of tasks) {
    const { data, error } = await getSubtasks(task.id)
    if (!error && data) {
      subtasks[task.id] = data
    }
  }
  renderTasks()
}

async function performSmartSearch() {
  const searchInput = document.querySelector('#smartSearch')
  const searchBtn = document.querySelector('#searchBtn')
  const searchResultsDiv = document.querySelector('#searchResults')
  const searchResultsList = document.querySelector('#searchResultsList')
  
  const query = searchInput.value.trim()
  
  if (!query) {
    searchResultsDiv.style.display = 'none'
    return
  }
  
  const originalText = searchBtn.textContent
  searchBtn.disabled = true
  searchBtn.textContent = 'Searching...'
  
  try {
    const { data, error } = await smartSearch(query)
    
    if (error) {
      console.error('Search error:', error)
      searchResultsList.innerHTML = '<div class="search-error">Search failed. Please try again.</div>'
      searchResultsDiv.style.display = 'block'
      return
    }
    
    if (!data || data.length === 0) {
      searchResultsList.innerHTML = '<div class="search-empty">No similar tasks found. Try a different search term.</div>'
    } else {
      searchResultsList.innerHTML = data.map(result => `
        <div class="search-result-item">
          <div class="search-result-title">${escapeHtml(result.title)}</div>
          <div class="search-result-meta">
            <span class="search-result-priority priority-${result.priority}">${result.priority.charAt(0).toUpperCase() + result.priority.slice(1)}</span>
            <span class="search-result-status">${result.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            <span class="search-result-similarity">${Math.round(result.similarity * 100)}% match</span>
          </div>
        </div>
      `).join('')
    }
    
    searchResultsDiv.style.display = 'block'
    
  } catch (error) {
    console.error('Search error:', error)
    searchResultsList.innerHTML = '<div class="search-error">Search failed. Please try again.</div>'
    searchResultsDiv.style.display = 'block'
  } finally {
    searchBtn.disabled = false
    searchBtn.textContent = originalText
  }
}

function renderTasks() {
  const tasksList = document.querySelector('#tasksList')
  
  if (tasks.length === 0) {
    tasksList.innerHTML = '<div class="empty-message">No tasks yet. Add your first task below!</div>'
    return
  }
  
  tasksList.innerHTML = tasks.map(task => {
    const taskSubtasks = subtasks[task.id] || []
    const suggestions = aiSuggestions[task.id] || []
    
    return `
    <div class="task-item" data-task-id="${task.id}">
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-meta">
          <span class="task-priority priority-${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
          <select class="task-status-select" data-task-id="${task.id}">
            <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
          </select>
        </div>
        
        <!-- AI Subtasks Section -->
        <div class="ai-subtasks-section">
          <button class="generate-subtasks-btn" data-task-id="${task.id}">
            Generate Subtasks with AI
          </button>
          
          ${suggestions.length > 0 ? `
            <div class="ai-suggestions">
              <h4 class="suggestions-title">AI Suggestions:</h4>
              <div class="suggestions-list">
                ${suggestions.map((suggestion, index) => `
                  <div class="suggestion-item">
                    <span class="suggestion-text">${escapeHtml(suggestion)}</span>
                    <button class="save-suggestion-btn" data-task-id="${task.id}" data-suggestion="${escapeHtml(suggestion)}">
                      Save
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${taskSubtasks.length > 0 ? `
            <div class="subtasks-list">
              <h4 class="subtasks-title">Subtasks:</h4>
              ${taskSubtasks.map(subtask => `
                <div class="subtask-item" data-subtask-id="${subtask.id}">
                  <div class="subtask-content">
                    <span class="subtask-title">${escapeHtml(subtask.title)}</span>
                    <select class="subtask-status-select" data-subtask-id="${subtask.id}">
                      <option value="pending" ${subtask.status === 'pending' ? 'selected' : ''}>Pending</option>
                      <option value="in-progress" ${subtask.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                      <option value="done" ${subtask.status === 'done' ? 'selected' : ''}>Done</option>
                    </select>
                  </div>
                  <button class="delete-subtask-btn" data-subtask-id="${subtask.id}">×</button>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
      <button class="delete-task-btn" data-task-id="${task.id}">×</button>
    </div>
  `}).join('')
  
  // Add event listeners for status changes and delete buttons
  document.querySelectorAll('.task-status-select').forEach(select => {
    select.addEventListener('change', handleStatusChange)
  })
  
  document.querySelectorAll('.delete-task-btn').forEach(btn => {
    btn.addEventListener('click', handleDeleteTask)
  })
  
  // Add event listeners for AI subtasks
  document.querySelectorAll('.generate-subtasks-btn').forEach(btn => {
    btn.addEventListener('click', handleGenerateSubtasks)
  })
  
  document.querySelectorAll('.save-suggestion-btn').forEach(btn => {
    btn.addEventListener('click', handleSaveSuggestion)
  })
  
  // Add event listeners for subtask management
  document.querySelectorAll('.subtask-status-select').forEach(select => {
    select.addEventListener('change', handleSubtaskStatusChange)
  })
  
  document.querySelectorAll('.delete-subtask-btn').forEach(btn => {
    btn.addEventListener('click', handleDeleteSubtask)
  })
}

async function addNewTask() {
  const taskInput = document.querySelector('#newTask')
  const prioritySelect = document.querySelector('#taskPriority')
  const taskText = taskInput.value.trim()
  const priority = prioritySelect.value
  
  if (taskText) {
    // Disable button during creation
    const addBtn = document.querySelector('#addTaskBtn')
    const originalText = addBtn.textContent
    addBtn.disabled = true
    addBtn.textContent = 'Adding...'
    
    try {
      const { data, error } = await createTask(taskText, priority)
      
      if (error) {
        alert('Error creating task: ' + error.message)
        return
      }
      
      // Add new task to local array and re-render
      tasks.unshift(data)
      subtasks[data.id] = []
      await loadAllSubtasks()
      
      // Clear inputs
      taskInput.value = ''
      prioritySelect.value = 'medium'
      
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Error creating task. Please try again.')
    } finally {
      // Re-enable button
      addBtn.disabled = false
      addBtn.textContent = originalText
    }
  }
}

async function handleStatusChange(event) {
  const taskId = event.target.dataset.taskId
  const newStatus = event.target.value
  
  try {
    const { error } = await updateTask(taskId, { status: newStatus })
    
    if (error) {
      alert('Error updating task status: ' + error.message)
      // Revert the select value
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        event.target.value = task.status
      }
      return
    }
    
    // Update local task data
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex !== -1) {
      tasks[taskIndex].status = newStatus
    }
    
  } catch (error) {
    console.error('Error updating task status:', error)
    alert('Error updating task status. Please try again.')
  }
}

async function handleDeleteTask(event) {
  const taskId = event.target.dataset.taskId
  const task = tasks.find(t => t.id === taskId)
  
  if (task && confirm(`Are you sure you want to delete "${task.title}"?`)) {
    try {
      const { error } = await deleteTask(taskId)
      
      if (error) {
        alert('Error deleting task: ' + error.message)
        return
      }
      
      // Remove task from local array and re-render
      tasks = tasks.filter(t => t.id !== taskId)
      delete subtasks[taskId]
      delete aiSuggestions[taskId]
      await loadAllSubtasks()
      
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Error deleting task. Please try again.')
    }
  }
}

async function handleGenerateSubtasks(event) {
  const taskId = event.target.dataset.taskId
  const task = tasks.find(t => t.id === taskId)
  
  if (!task) return
  
  const btn = event.target
  const originalText = btn.textContent
  btn.disabled = true
  btn.textContent = 'Generating...'
  
  try {
    const { data, error } = await generateSubtasks(task.title)
    
    if (error) {
      alert('Error generating subtasks: ' + error.message)
      return
    }
    
    // Store AI suggestions
    aiSuggestions[taskId] = data || []
    renderTasks()
    
  } catch (error) {
    console.error('Error generating subtasks:', error)
    alert('Error generating subtasks. Please try again.')
  } finally {
    btn.disabled = false
    btn.textContent = originalText
  }
}

async function handleSaveSuggestion(event) {
  const taskId = event.target.dataset.taskId
  const suggestion = event.target.dataset.suggestion
  
  const btn = event.target
  const originalText = btn.textContent
  btn.disabled = true
  btn.textContent = 'Saving...'
  
  try {
    const { data, error } = await createSubtask(taskId, suggestion)
    
    if (error) {
      alert('Error saving subtask: ' + error.message)
      return
    }
    
    // Add to local subtasks and re-render
    if (!subtasks[taskId]) {
      subtasks[taskId] = []
    }
    subtasks[taskId].push(data)
    
    // Remove from suggestions
    if (aiSuggestions[taskId]) {
      aiSuggestions[taskId] = aiSuggestions[taskId].filter(s => s !== suggestion)
    }
    
    renderTasks()
    
  } catch (error) {
    console.error('Error saving subtask:', error)
    alert('Error saving subtask. Please try again.')
  } finally {
    btn.disabled = false
    btn.textContent = originalText
  }
}

async function handleSubtaskStatusChange(event) {
  const subtaskId = event.target.dataset.subtaskId
  const newStatus = event.target.value
  
  try {
    const { error } = await updateSubtask(subtaskId, { status: newStatus })
    
    if (error) {
      alert('Error updating subtask status: ' + error.message)
      // Revert the select value
      const subtask = Object.values(subtasks).flat().find(s => s.id === subtaskId)
      if (subtask) {
        event.target.value = subtask.status
      }
      return
    }
    
    // Update local subtask data
    Object.keys(subtasks).forEach(taskId => {
      const subtaskIndex = subtasks[taskId].findIndex(s => s.id === subtaskId)
      if (subtaskIndex !== -1) {
        subtasks[taskId][subtaskIndex].status = newStatus
      }
    })
    
  } catch (error) {
    console.error('Error updating subtask status:', error)
    alert('Error updating subtask status. Please try again.')
  }
}

async function handleDeleteSubtask(event) {
  const subtaskId = event.target.dataset.subtaskId
  const subtask = Object.values(subtasks).flat().find(s => s.id === subtaskId)
  
  if (subtask && confirm(`Are you sure you want to delete "${subtask.title}"?`)) {
    try {
      const { error } = await deleteSubtask(subtaskId)
      
      if (error) {
        alert('Error deleting subtask: ' + error.message)
        return
      }
      
      // Remove subtask from local data and re-render
      Object.keys(subtasks).forEach(taskId => {
        subtasks[taskId] = subtasks[taskId].filter(s => s.id !== subtaskId)
      })
      renderTasks()
      
    } catch (error) {
      console.error('Error deleting subtask:', error)
      alert('Error deleting subtask. Please try again.')
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    try {
      const { error } = await signOut()
      if (error) {
        console.error('Logout error:', error)
        alert('Error logging out. Please try again.')
      } else {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Error logging out. Please try again.')
    }
  }
}