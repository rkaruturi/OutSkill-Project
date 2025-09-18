import './style.css'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <header class="header">
      <nav class="nav">
        <button class="nav-btn back-btn">← Back to Home</button>
        <button class="nav-btn signup-btn">Signup</button>
      </nav>
    </header>
    
    <main class="main-content">
      <div class="login-section">
        <h1 class="login-heading">Login</h1>
        <form class="login-form" id="loginForm">
          <div class="input-group">
            <label for="email" class="input-label">Email</label>
            <input type="email" id="email" name="email" class="input-field" placeholder="Enter your email" required>
          </div>
          
          <div class="input-group">
            <label for="password" class="input-label">Password</label>
            <input type="password" id="password" name="password" class="input-field" placeholder="Enter your password" required>
          </div>
          
          <button type="submit" class="login-btn-primary">Login</button>
          
          <div class="login-footer">
            <p class="login-text">Don't have an account? <a href="#" class="signup-link">Sign up here</a></p>
          </div>
        </form>
      </div>
    </main>
  </div>
`

// Add event listeners
document.querySelector('.back-btn').addEventListener('click', () => {
  window.location.href = '/'
})

document.querySelector('.signup-btn').addEventListener('click', () => {
  console.log('Navigate to signup')
  // Add signup navigation here
})

document.querySelector('.signup-link').addEventListener('click', (e) => {
  e.preventDefault()
  console.log('Navigate to signup from link')
  // Add signup navigation here
})

document.querySelector('#loginForm').addEventListener('submit', (e) => {
  e.preventDefault()
  const email = document.querySelector('#email').value
  const password = document.querySelector('#password').value
  
  console.log('Login attempt:', { email, password })
  
  // Add login logic here
  if (email && password) {
    alert('Login functionality would be implemented here')
  }
})