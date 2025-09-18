import './style.css'
import { getCurrentUser } from './supabase.js'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <header class="header">
      <nav class="nav">
        <button class="nav-btn login-btn">Login</button>
        <button class="nav-btn signup-btn">Signup</button>
        <button class="nav-btn dashboard-btn">Go to Dashboard</button>
      </nav>
    </header>
    
    <main class="main-content">
      <div class="welcome-section">
        <h1 class="welcome-heading">Welcome Back</h1>
        <p class="welcome-subtitle">Organize your tasks and boost your productivity</p>
        <div class="cta-section">
          <button class="cta-btn primary">Get Started</button>
          <button class="cta-btn secondary">Learn More</button>
        </div>
      </div>
    </main>
  </div>
`

// Check if user is already logged in
checkAuthStatus()

async function checkAuthStatus() {
  const user = await getCurrentUser()
  const dashboardBtn = document.querySelector('.dashboard-btn')
  const loginBtn = document.querySelector('.login-btn')
  const signupBtn = document.querySelector('.signup-btn')
  
  if (user) {
    // User is logged in - show dashboard button prominently
    dashboardBtn.style.display = 'block'
    loginBtn.textContent = 'Dashboard'
    signupBtn.style.display = 'none'
  } else {
    // User is not logged in - show login/signup buttons
    dashboardBtn.style.display = 'block'
    loginBtn.style.display = 'block'
    signupBtn.style.display = 'block'
  }
}

// Add event listeners
document.querySelector('.login-btn').addEventListener('click', () => {
  getCurrentUser().then(user => {
    if (user) {
      window.location.href = '/dashboard.html'
    } else {
      window.location.href = '/login.html'
    }
  })
})

document.querySelector('.signup-btn').addEventListener('click', () => {
  console.log('Signup clicked')
  window.location.href = '/signup.html'
})

document.querySelector('.dashboard-btn').addEventListener('click', () => {
  console.log('Dashboard clicked')
  window.location.href = '/dashboard.html'
})

document.querySelector('.primary').addEventListener('click', () => {
  getCurrentUser().then(user => {
    if (user) {
      window.location.href = '/dashboard.html'
    } else {
      window.location.href = '/signup.html'
    }
  })
})

document.querySelector('.secondary').addEventListener('click', () => {
  // Scroll to learn more section or show info
  alert('Learn more about our task management features!')
})