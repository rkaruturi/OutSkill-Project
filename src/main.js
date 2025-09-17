import './style.css'

document.querySelector('#app').innerHTML = `
  <div>
    <div class="logo">
      <h1>OutSkill Project</h1>
    </div>
    <div class="card">
      <h2>Personal Assistant</h2>
      <p>Welcome to your personal assistant application!</p>
      <button id="get-started" type="button">Get Started</button>
    </div>
    <p class="read-the-docs">
      Your personal assistant is ready to help you with various tasks.
    </p>
  </div>
`

document.querySelector('#get-started').addEventListener('click', () => {
  alert('Welcome! Your personal assistant is ready to help you.')
})