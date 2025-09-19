import './style.css'
import { signUp } from './supabase.js'

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

document.querySelector('#signupForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const name = document.querySelector('#name').value
  const email = document.querySelector('#email').value
  const password = document.querySelector('#password').value
  
  // Basic validation
  if (!name || !email || !password) {
    showMessage('Please fill in all fields', 'error')
    return
  }

  if (password.length < 6) {
    showMessage('Password must be at least 6 characters long', 'error')
    return
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showMessage('Please enter a valid email address', 'error')
    return
  }
  // Disable submit button during signup
  const submitBtn = document.querySelector('.signup-btn-primary')
  const originalText = submitBtn.textContent
  submitBtn.disabled = true
  submitBtn.textContent = 'Creating Account...'

  try {
    const { data, error } = await signUp(email, password, name)
    
    if (error) {
      // Handle specific Supabase error messages
      let errorMessage = error.message
      if (error.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.'
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Password must be at least 6 characters long'
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address'
      }
      showMessage(errorMessage, 'error')
    } else {
      if (data.user && !data.user.email_confirmed_at) {
        showMessage('Account created successfully! You can now login.', 'success')
      } else {
        showMessage('Account created successfully! Please check your email to confirm your account before logging in.', 'success')
      }
      // Clear form
      document.querySelector('#signupForm').reset()
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login.html'
      }, 3000)
    }
  } catch (error) {
    console.error('Signup error:', error)
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
  const form = document.querySelector('.signup-form')
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
  
  .signup-btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`
document.head.appendChild(style)