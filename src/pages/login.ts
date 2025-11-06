import { Router } from '../router';

export class LoginPage {
  private router: Router;

  constructor() {
    this.router = Router.getInstance();
  }

  render(): void {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <h1>Admin Panel</h1>
            <p>Sign in to your account</p>
          </div>
          
          <form id="login-form" class="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="admin@example.com" 
                required
                autocomplete="email"
              />
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Enter your password" 
                required
                autocomplete="current-password"
              />
            </div>
            
            <div id="error-message" class="error-message" style="display: none;"></div>
            
            <button type="submit" class="login-button" id="login-button">
              <span class="button-text">Sign In</span>
              <span class="button-loader" style="display: none;">Loading...</span>
            </button>
          </form>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const form = document.getElementById('login-form') as HTMLFormElement;
    const errorMessage = document.getElementById('error-message') as HTMLElement;
    const loginButton = document.getElementById('login-button') as HTMLButtonElement;
    const buttonText = loginButton.querySelector('.button-text') as HTMLElement;
    const buttonLoader = loginButton.querySelector('.button-loader') as HTMLElement;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('email') as HTMLInputElement;
      
      const email = emailInput.value.trim();

      // Hide error message
      errorMessage.style.display = 'none';
      errorMessage.textContent = '';

      // Show loading state
      loginButton.disabled = true;
      buttonText.style.display = 'none';
      buttonLoader.style.display = 'inline';

      // Simulate login (bypass authentication for now)
      setTimeout(() => {
        // For now, just accept any email/password
        // Store a mock token
        localStorage.setItem('admin_token', 'mock_jwt_token_' + Date.now());
        localStorage.setItem('admin_email', email);

        // Reset button state
        loginButton.disabled = false;
        buttonText.style.display = 'inline';
        buttonLoader.style.display = 'none';

        // Navigate to dashboard
        this.router.navigate('/dashboard');
      }, 1000);
    });
  }
}

