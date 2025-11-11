import { Router } from '../router';

export class Layout {
  private router: Router;
  private currentPath: string = '';

  constructor() {
    this.router = Router.getInstance();
  }

  render(content: string, activePath: string = ''): void {
    const app = document.getElementById('app');
    if (!app) return;

    this.currentPath = activePath;

    app.innerHTML = `
      <div class="admin-layout">
        ${this.renderSidebar()}
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <nav class="mobile-top-navbar" id="mobile-top-navbar">
          <button class="hamburger-menu" id="hamburger-menu" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
        <div class="main-content">
          ${content}
        </div>
      </div>
    `;

    this.attachSidebarListeners();
  }

  private renderSidebar(): string {
    const email = localStorage.getItem('admin_email') || 'Admin';
    
    return `
      <aside class="sidebar">
        <div class="sidebar-header">
        </div>
        
            <nav class="sidebar-nav">
              <a href="#" data-route="/dashboard" class="nav-item ${this.isActive('/dashboard') ? 'active' : ''}">
                <span class="nav-text">Dashboard</span>
              </a>
              
              <a href="#" data-route="/users" class="nav-item ${this.isActive('/users') ? 'active' : ''}">
                <span class="nav-text">Users</span>
              </a>
              
              <a href="#" data-route="/drivers" class="nav-item ${this.isActive('/drivers') ? 'active' : ''}">
                <span class="nav-text">Drivers</span>
              </a>
              
              <a href="#" data-route="/clients" class="nav-item ${this.isActive('/clients') ? 'active' : ''}">
                <span class="nav-text">Clients</span>
              </a>
              
              <a href="#" data-route="/car-owners" class="nav-item ${this.isActive('/car-owners') ? 'active' : ''}">
                <span class="nav-text">Car Owners</span>
              </a>
              
              <a href="#" data-route="/vehicles" class="nav-item ${this.isActive('/vehicles') ? 'active' : ''}">
                <span class="nav-text">Vehicles</span>
              </a>
              
              <div class="nav-section-divider"></div>
              
              <a href="#" data-route="/analytics/revenue" class="nav-item ${this.isActive('/analytics/revenue') ? 'active' : ''}">
                <span class="nav-text">Revenue Analytics</span>
              </a>
              
              <a href="#" data-route="/analytics/bookings" class="nav-item ${this.isActive('/analytics/bookings') ? 'active' : ''}">
                <span class="nav-text">Bookings Analytics</span>
              </a>
              
              <a href="#" data-route="/analytics/performance" class="nav-item ${this.isActive('/analytics/performance') ? 'active' : ''}">
                <span class="nav-text">Performance Metrics</span>
              </a>
              
              <a href="#" data-route="/analytics/top-performers" class="nav-item ${this.isActive('/analytics/top-performers') ? 'active' : ''}">
                <span class="nav-text">Top Performers</span>
              </a>
              
              <a href="#" data-route="/analytics/commissions" class="nav-item ${this.isActive('/analytics/commissions') ? 'active' : ''}">
                <span class="nav-text">Commission Management</span>
              </a>
              
              <a href="#" data-route="/bookings" class="nav-item ${this.isActive('/bookings') ? 'active' : ''}">
                <span class="nav-text">Bookings Management</span>
              </a>
            </nav>
        
        <div class="sidebar-footer">
          <div class="profile-section">
            <div class="profile-info">
              <div class="profile-avatar">${email.charAt(0).toUpperCase()}</div>
              <div class="profile-details">
                <div class="profile-name">${email}</div>
                <div class="profile-role">Administrator</div>
              </div>
            </div>
            <button class="logout-button" id="logout-btn" title="Logout">
              <svg class="logout-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </aside>
    `;
  }

  private isActive(path: string): boolean {
    return this.currentPath === path || this.currentPath.startsWith(path + '/');
  }

  private attachSidebarListeners(): void {
    // Hamburger menu button
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (hamburgerMenu && sidebar) {
      hamburgerMenu.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (overlay) {
          overlay.classList.toggle('active');
        }
      });
    }

    // Overlay click to close sidebar
    if (overlay && sidebar) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }

    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const route = item.getAttribute('data-route');
        if (route) {
          // Close sidebar on mobile when navigating
          if (window.innerWidth <= 640) {
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
          }
          this.router.navigate(route);
        }
      });
    });

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        // Close sidebar on mobile
        if (window.innerWidth <= 640) {
          if (sidebar) sidebar.classList.remove('open');
          if (overlay) overlay.classList.remove('active');
        }
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_email');
        this.router.navigate('/login');
      });
    }

    // Close sidebar on window resize if it becomes desktop size
    window.addEventListener('resize', () => {
      if (window.innerWidth > 640) {
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
      }
    });
  }
}

