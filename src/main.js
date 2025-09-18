import './style.css'

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

// Add event listeners
document.querySelector('.login-btn').addEventListener('click', () => {
  console.log('Login clicked')
  window.location.href = '/login.html'
})

document.querySelector('.signup-btn').addEventListener('click', () => {
  console.log('Signup clicked')
  window.location.href = '/signup.html'
})

document.querySelector('.dashboard-btn').addEventListener('click', () => {
  console.log('Dashboard clicked')
  // Add dashboard navigation here
})

document.querySelector('.primary').addEventListener('click', () => {
  console.log('Get Started clicked')
  // Add get started functionality here
})

document.querySelector('.secondary').addEventListener('click', () => {
  console.log('Learn More clicked')
  // Add learn more functionality here
})