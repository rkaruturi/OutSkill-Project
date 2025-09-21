import './style.css'
import { signOut, getCurrentUser, onAuthStateChange, getProfile, updateProfile, uploadProfilePicture } from './supabase.js'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <header class="header">
      <nav class="nav">
        <button class="nav-btn back-btn">← Back to Dashboard</button>
        <button class="nav-btn logout-btn">Logout</button>
      </nav>
    </header>
    
    <main class="main-content">
      <div class="profile-section">
        <h1 class="profile-heading">Profile Settings</h1>
        
        <div class="profile-card">
          <div class="profile-picture-section">
            <div class="profile-picture-container">
              <img id="profileImage" class="profile-picture" src="" alt="Profile Picture" style="display: none;">
              <div id="profilePlaceholder" class="profile-picture-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
            
            <div class="upload-section">
              <input type="file" id="profilePictureInput" accept="image/*" style="display: none;">
              <button class="upload-btn" id="uploadBtn">Upload Profile Picture</button>
              <p class="upload-hint">JPG, PNG or GIF (max 5MB)</p>
            </div>
          </div>
          
          <div class="profile-info-section">
            <div class="input-group">
              <label for="fullName" class="input-label">Full Name</label>
              <input type="text" id="fullName" name="fullName" class="input-field" placeholder="Enter your full name">
            </div>
            
            <div class="input-group">
              <label for="email" class="input-label">Email</label>
              <input type="email" id="email" name="email" class="input-field" placeholder="Your email" readonly>
            </div>
            
            <button type="button" class="save-profile-btn" id="saveProfileBtn">Save Changes</button>
          </div>
        </div>
      </div>
    </main>
  </div>
`

// Profile management functionality
let currentUser = null;
let currentProfile = null;

// Check authentication on page load
checkAuth()

async function checkAuth() {
  const user = await getCurrentUser()
  if (!user) {
    // Redirect to login if not authenticated
    window.location.href = '/login.html'
    return
  }
  
  currentUser = user
  await loadProfile()
}

// Listen for auth state changes
onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    window.location.href = '/'
  }
})

async function loadProfile() {
  try {
    // Load user profile data
    const { data: profile, error } = await getProfile(currentUser.id)
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error loading profile:', error)
      showMessage('Error loading profile data', 'error')
      return
    }
    
    currentProfile = profile
    
    // Populate form fields
    const emailField = document.querySelector('#email')
    const nameField = document.querySelector('#fullName')
    
    emailField.value = currentUser.email || ''
    nameField.value = profile?.full_name || currentUser.user_metadata?.full_name || ''
    
    // Load profile picture if exists
    if (profile?.profile_picture_url) {
      displayProfilePicture(profile.profile_picture_url)
    }
    
  } catch (error) {
    console.error('Error loading profile:', error)
    showMessage('Error loading profile data', 'error')
  }
}

function displayProfilePicture(url) {
  const profileImage = document.querySelector('#profileImage')
  const profilePlaceholder = document.querySelector('#profilePlaceholder')
  
  profileImage.src = url
  profileImage.style.display = 'block'
  profilePlaceholder.style.display = 'none'
  
  profileImage.onerror = () => {
    profileImage.style.display = 'none'
    profilePlaceholder.style.display = 'flex'
  }
}

// Add event listeners
document.querySelector('.back-btn').addEventListener('click', () => {
  window.location.href = '/dashboard.html'
})

document.querySelector('.logout-btn').addEventListener('click', () => {
  handleLogout()
})

document.querySelector('#uploadBtn').addEventListener('click', () => {
  document.querySelector('#profilePictureInput').click()
})

document.querySelector('#profilePictureInput').addEventListener('change', handleFileUpload)

document.querySelector('#saveProfileBtn').addEventListener('click', handleSaveProfile)

async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showMessage('Please select an image file', 'error')
    return
  }
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    showMessage('File size must be less than 5MB', 'error')
    return
  }
  
  const uploadBtn = document.querySelector('#uploadBtn')
  const originalText = uploadBtn.textContent
  uploadBtn.disabled = true
  uploadBtn.textContent = 'Uploading...'
  
  try {
    const { data, error } = await uploadProfilePicture(file)
    
    if (error) {
      showMessage('Error uploading image: ' + error.message, 'error')
      return
    }
    
    // Display the uploaded image
    displayProfilePicture(data.publicUrl)
    
    // Update profile with new image URL
    const { error: updateError } = await updateProfile(currentUser.id, {
      profile_picture_url: data.publicUrl
    })
    
    if (updateError) {
      console.error('Error updating profile with image URL:', updateError)
      showMessage('Image uploaded but failed to save to profile', 'error')
    } else {
      showMessage('Profile picture updated successfully!', 'success')
      currentProfile = { ...currentProfile, profile_picture_url: data.publicUrl }
    }
    
  } catch (error) {
    console.error('Error uploading file:', error)
    showMessage('Error uploading image. Please try again.', 'error')
  } finally {
    uploadBtn.disabled = false
    uploadBtn.textContent = originalText
    // Clear the file input
    event.target.value = ''
  }
}

async function handleSaveProfile() {
  const nameField = document.querySelector('#fullName')
  const fullName = nameField.value.trim()
  
  if (!fullName) {
    showMessage('Please enter your full name', 'error')
    return
  }
  
  const saveBtn = document.querySelector('#saveProfileBtn')
  const originalText = saveBtn.textContent
  saveBtn.disabled = true
  saveBtn.textContent = 'Saving...'
  
  try {
    const updates = { full_name: fullName }
    
    // If profile doesn't exist, include the profile picture URL
    if (!currentProfile && document.querySelector('#profileImage').style.display === 'block') {
      updates.profile_picture_url = document.querySelector('#profileImage').src
    }
    
    const { data, error } = await updateProfile(currentUser.id, updates)
    
    if (error) {
      showMessage('Error saving profile: ' + error.message, 'error')
      return
    }
    
    currentProfile = data
    showMessage('Profile updated successfully!', 'success')
    
  } catch (error) {
    console.error('Error saving profile:', error)
    showMessage('Error saving profile. Please try again.', 'error')
  } finally {
    saveBtn.disabled = false
    saveBtn.textContent = originalText
  }
}

async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    try {
      const { error } = await signOut()
      if (error) {
        console.error('Logout error:', error)
        showMessage('Error logging out. Please try again.', 'error')
      } else {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout error:', error)
      showMessage('Error logging out. Please try again.', 'error')
    }
  }
}

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
  
  // Insert message at the top of the profile section
  const profileSection = document.querySelector('.profile-section')
  const heading = document.querySelector('.profile-heading')
  profileSection.insertBefore(messageDiv, heading.nextSibling)
  
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
`
document.head.appendChild(style)