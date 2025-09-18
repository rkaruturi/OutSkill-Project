import './style.css'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <header class="header">
      <nav class="nav">
        <button class="nav-btn back-btn">← Back to Home</button>
        <button class="nav-btn login-btn">Login</button>
      </nav>
    </header>
    
    <main class="main-content">
      <div class="signup-section">
        <h1 class="signup-heading">Create Account</h1>
        <form class="signup-form" id="signupForm">
          <div class="input-group">
            <label for="name" class="input-label">Name</label>
            <input type="text" id="name" name="name" class="input-field" placeholder="Enter your full name" required>
          </div>
          
          <div class="input-group">
            <label for="email" class="input-label">Email</label>
            <input type="email" id="email" name="email" class="input-field" placeholder="Enter your email" required>
          </div>
          
          <div class="input-group">
            <label for="password" class="input-label">Password</label>
            <input type="password" id="password" name="password" class="input-field" placeholder="Create a password" required>
          </div>
          
          <button type="submit" class="signup-btn-primary">Signup</button>
          
          <div class="signup-footer">
            <p class="signup-text">Already have an account? <a href="#" class="login-link">Login here</a></p>
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

document.querySelector('.login-btn').addEventListener('click', () => {
  window.location.href = '/login.html'
})

document.querySelector('.login-link').addEventListener('click', (e) => {
  e.preventDefault()
  window.location.href = '/login.html'
})

document.querySelector('#signupForm').addEventListener('submit', (e) => {
  e.preventDefault()
  const name = document.querySelector('#name').value
  const email = document.querySelector('#email').value
  const password = document.querySelector('#password').value
  
  console.log('Signup attempt:', { name, email, password })
  
  // Add signup logic here
  if (name && email && password) {
    alert('Signup functionality would be implemented here')
  }
})