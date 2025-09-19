import './style.css'
import { signIn } from './supabase.js'

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
  window.location.href = '/signup.html'
})

document.querySelector('.signup-link').addEventListener('click', (e) => {
  e.preventDefault()
  window.location.href = '/signup.html'
})

document.querySelector('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.querySelector('#email').value
  const password = document.querySelector('#password').value
  
  // Basic validation
  if (!email || !password) {
    showMessage('Please fill in all fields', 'error')
    return
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showMessage('Please enter a valid email address', 'error')
    return
  }
  // Disable submit button during login
  const submitBtn = document.querySelector('.login-btn-primary')
  const originalText = submitBtn.textContent
  submitBtn.disabled = true
  submitBtn.textContent = 'Signing In...'

  try {
    const { data, error } = await signIn(email, password)
    
    if (error) {
      // Handle specific Supabase error messages
      let errorMessage = error.message
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before logging in.'
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment before trying again.'
      }
      showMessage(errorMessage, 'error')
    } else {
      if (data.user) {
        showMessage('Login successful! Redirecting...', 'success')
        // Redirect to dashboard after successful login
        setTimeout(() => {
          window.location.href = '/dashboard.html'
        }, 1500)
      } else {
        showMessage('Login failed. Please try again.', 'error')
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    showMessage('An unexpected error occurred. Please try again.', 'error')
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false
    submitBtn.textContent = originalText
  }
})

function showMessage(message, type) {
  // Remove existing message if any
  const existingMessage = document.querySelector('.message')
  if (existingMessage) {
    existingMessage.remove()
  }

  // Create message element
  const messageDiv = document.createElement('div')
  messageDiv.className = `message ${type}`
  messageDiv.textContent = message
  
  // Insert message before the form
  const form = document.querySelector('.login-form')
  form.parentNode.insertBefore(messageDiv, form)
  
  // Auto-remove message after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove()
    }
  }, 5000)
}

// Add message styles
const style = document.createElement('style')
style.textContent = `
  .message {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-weight: 500;
    text-align: center;
  }
  
  .message.success {
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
  }
  
  .message.error {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
  }
  
  .login-btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`
document.head.appendChild(style)