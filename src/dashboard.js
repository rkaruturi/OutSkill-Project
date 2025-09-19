import './style.css'
import { signOut, getCurrentUser, onAuthStateChange, getTasks, createTask, updateTask, deleteTask } from './supabase.js'

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
    renderTasks()
  } catch (error) {
    tasksList.innerHTML = '<div class="error-message">Error loading tasks. Please refresh the page.</div>'
    console.error('Error loading tasks:', error)
  }
}

function renderTasks() {
  const tasksList = document.querySelector('#tasksList')
  
  if (tasks.length === 0) {
    tasksList.innerHTML = '<div class="empty-message">No tasks yet. Add your first task below!</div>'
    return
  }
  
  tasksList.innerHTML = tasks.map(task => `
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
      </div>
      <button class="delete-task-btn" data-task-id="${task.id}">×</button>
    </div>
  `).join('')
  
  // Add event listeners for status changes and delete buttons
  document.querySelectorAll('.task-status-select').forEach(select => {
    select.addEventListener('change', handleStatusChange)
  })
  
  document.querySelectorAll('.delete-task-btn').forEach(btn => {
    btn.addEventListener('click', handleDeleteTask)
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
      renderTasks()
      
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
      renderTasks()
      
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Error deleting task. Please try again.')
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