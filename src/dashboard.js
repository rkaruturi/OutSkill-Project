import './style.css'

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
          <ul class="tasks-list" id="tasksList">
            <li class="task-item">1. Finish homework</li>
            <li class="task-item">2. Call John</li>
            <li class="task-item">3. Buy groceries</li>
          </ul>
        </div>
        
        <div class="add-task-section">
          <div class="input-group">
            <label for="newTask" class="input-label">New Task</label>
            <div class="add-task-container">
              <input type="text" id="newTask" name="newTask" class="input-field task-input" placeholder="Enter a new task" />
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
let taskCount = 3;

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

function addNewTask() {
  const taskInput = document.querySelector('#newTask')
  const taskText = taskInput.value.trim()
  
  if (taskText) {
    taskCount++
    const tasksList = document.querySelector('#tasksList')
    const newTaskItem = document.createElement('li')
    newTaskItem.className = 'task-item'
    newTaskItem.textContent = `${taskCount}. ${taskText}`
    tasksList.appendChild(newTaskItem)
    
    // Clear input
    taskInput.value = ''
    
    // Add animation
    newTaskItem.style.opacity = '0'
    newTaskItem.style.transform = 'translateY(10px)'
    setTimeout(() => {
      newTaskItem.style.transition = 'all 0.3s ease'
      newTaskItem.style.opacity = '1'
      newTaskItem.style.transform = 'translateY(0)'
    }, 10)
  }
}

function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    console.log('User logged out')
    window.location.href = '/'
  }
}