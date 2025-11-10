import { Layout } from '../components/layout';
import { adminApi } from '../services/api';

interface User {
  id: number;
  email: string;
  role: string;
  status: string;
  is_active: boolean;
  created_at: string | null;
}

export class UsersPage {
  private layout: Layout;
  private currentPage: number = 1;
  private pageSize: number = 20;
  private roleFilter: string = '';
  private statusFilter: string = '';
  private searchQuery: string = '';

  constructor() {
    this.layout = new Layout();
  }

  render(): void {
    const usersContent = `
      <div class="page-container">
        <div class="page-header">
          <h1>Users</h1>
          <button class="btn-primary" id="promote-user-btn">Promote User</button>
        </div>

        <div class="filters-section">
          <div class="search-box">
            <input 
              type="text" 
              id="search-input" 
              placeholder="Search by email..." 
              class="search-input"
            />
          </div>
          
          <div class="filters">
            <select id="role-filter" class="filter-select">
              <option value="">All Roles</option>
              <option value="driver">Driver</option>
              <option value="client">Client</option>
              <option value="car_owner">Car Owner</option>
              <option value="admin">Admin</option>
            </select>
            
            <select id="status-filter" class="filter-select">
              <option value="">All Statuses</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Active</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody id="users-tbody">
              <tr>
                <td colspan="6" class="loading-state">Loading users...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">
            <span id="pagination-info">Showing 0 - 0 of 0</span>
          </div>
          <div class="pagination-controls">
            <button class="pagination-btn" id="prev-page" disabled>Previous</button>
            <span class="page-number" id="current-page">1</span>
            <button class="pagination-btn" id="next-page" disabled>Next</button>
          </div>
        </div>
      </div>

      <!-- Promote User Modal -->
      <div class="modal-overlay" id="promote-modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Promote User to Admin</h2>
            <button class="modal-close" id="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="promote-form">
              <div class="form-group">
                <label for="user-id-input">User ID</label>
                <input 
                  type="number" 
                  id="user-id-input" 
                  class="form-input" 
                  placeholder="Enter user ID"
                  required
                />
              </div>
              <div id="promote-error" class="error-message" style="display: none;"></div>
              <div id="promote-success" class="success-message" style="display: none;"></div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" id="cancel-promote">Cancel</button>
                <button type="submit" class="btn-primary">Promote</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.layout.render(usersContent, '/users');
    this.attachEventListeners();
    this.loadUsers();
  }

  private attachEventListeners(): void {
    // Search input
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    if (searchInput) {
      let searchTimeout: number;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = window.setTimeout(() => {
          this.searchQuery = (e.target as HTMLInputElement).value.trim();
          this.currentPage = 1;
          this.loadUsers();
        }, 300);
      });
    }

    // Role filter
    const roleFilter = document.getElementById('role-filter') as HTMLSelectElement;
    if (roleFilter) {
      roleFilter.addEventListener('change', (e) => {
        this.roleFilter = (e.target as HTMLSelectElement).value;
        this.currentPage = 1;
        this.loadUsers();
      });
    }

    // Status filter
    const statusFilter = document.getElementById('status-filter') as HTMLSelectElement;
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.statusFilter = (e.target as HTMLSelectElement).value;
        this.currentPage = 1;
        this.loadUsers();
      });
    }

    // Pagination
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.loadUsers();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentPage++;
        this.loadUsers();
      });
    }

    // Promote user modal
    const promoteBtn = document.getElementById('promote-user-btn');
    const modal = document.getElementById('promote-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-promote');
    const promoteForm = document.getElementById('promote-form') as HTMLFormElement;

    if (promoteBtn && modal) {
      promoteBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
      });
    }

    if (closeModal && modal) {
      closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        this.resetPromoteForm();
      });
    }

    if (cancelBtn && modal) {
      cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        this.resetPromoteForm();
      });
    }

    if (promoteForm) {
      promoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handlePromoteUser();
      });
    }

    // Close modal on overlay click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          this.resetPromoteForm();
        }
      });
    }
  }

  private async loadUsers(): Promise<void> {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="loading-state">Loading users...</td></tr>';

    // Calculate skip for pagination
    const skip = (this.currentPage - 1) * this.pageSize;

    // Call API
    const result = await adminApi.getUsers({
      role: this.roleFilter || undefined,
      status_filter: this.statusFilter || undefined,
      skip,
      limit: this.pageSize,
    });

    if (result.error) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Error: ${result.error}</td></tr>`;
      return;
    }

    if (!result.data) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No users found</td></tr>';
      return;
    }

    let users: User[] = result.data;

    // Apply client-side search filter if needed
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      users = users.filter(u => 
        u.email.toLowerCase().includes(query) || 
        u.id.toString().includes(query)
      );
    }

    // Update pagination info (using API results)
    // Note: API doesn't return total count, so we'll estimate based on results
    const hasMore = users.length === this.pageSize;
    const totalPages = hasMore ? this.currentPage + 1 : this.currentPage;
    const startIndex = skip + 1;
    const endIndex = skip + users.length;
    const totalUsers = hasMore ? endIndex + 1 : endIndex; // Estimate

    this.updatePaginationInfo(startIndex, endIndex, totalUsers, totalPages);

    // Render users
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No users found</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.id}</td>
        <td>${user.email}</td>
        <td><span class="badge badge-${user.role}">${this.formatRole(user.role)}</span></td>
        <td><span class="badge badge-${user.status}">${this.formatStatus(user.status)}</span></td>
        <td><span class="badge badge-${user.is_active ? 'active' : 'inactive'}">${user.is_active ? 'Yes' : 'No'}</span></td>
        <td>${this.formatDate(user.created_at)}</td>
      </tr>
    `).join('');
  }

  private updatePaginationInfo(start: number, end: number, total: number, totalPages: number): void {
    const info = document.getElementById('pagination-info');
    const currentPageEl = document.getElementById('current-page');
    const prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-page') as HTMLButtonElement;

    if (info) {
      info.textContent = `Showing ${start} - ${end} of ${total}`;
    }

    if (currentPageEl) {
      currentPageEl.textContent = `${this.currentPage} / ${totalPages || 1}`;
    }

    if (prevBtn) {
      prevBtn.disabled = this.currentPage === 1;
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentPage >= totalPages;
    }
  }

  private formatRole(role: string): string {
    const roleMap: { [key: string]: string } = {
      'driver': 'Driver',
      'client': 'Client',
      'car_owner': 'Car Owner',
      'admin': 'Admin'
    };
    return roleMap[role] || role;
  }

  private formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending_verification': 'Pending',
      'verified': 'Verified',
      'rejected': 'Rejected',
      'suspended': 'Suspended'
    };
    return statusMap[status] || status;
  }

  private formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return '-';
    }
  }

  private async handlePromoteUser(): Promise<void> {
    const userIdInput = document.getElementById('user-id-input') as HTMLInputElement;
    const errorDiv = document.getElementById('promote-error');
    const successDiv = document.getElementById('promote-success');
    const modal = document.getElementById('promote-modal');

    if (!userIdInput || !errorDiv || !successDiv) return;

    const userId = parseInt(userIdInput.value.trim());

    if (isNaN(userId) || userId <= 0) {
      errorDiv.textContent = 'Please enter a valid user ID';
      errorDiv.style.display = 'block';
      successDiv.style.display = 'none';
      return;
    }

    // Hide messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    // Call API
    const result = await adminApi.promoteUser(userId);

    if (result.error) {
      errorDiv.textContent = result.error;
      errorDiv.style.display = 'block';
      successDiv.style.display = 'none';
      return;
    }

    if (result.data) {
      successDiv.textContent = result.data.message || `User ${userId} has been promoted to administrator`;
      successDiv.style.display = 'block';
      
      // Reload users after 1.5 seconds
      setTimeout(() => {
        if (modal) modal.style.display = 'none';
        this.resetPromoteForm();
        this.loadUsers();
      }, 1500);
    }
  }

  private resetPromoteForm(): void {
    const userIdInput = document.getElementById('user-id-input') as HTMLInputElement;
    const errorDiv = document.getElementById('promote-error');
    const successDiv = document.getElementById('promote-success');

    if (userIdInput) userIdInput.value = '';
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.style.display = 'none';
    }
    if (successDiv) {
      successDiv.textContent = '';
      successDiv.style.display = 'none';
    }
  }
}

