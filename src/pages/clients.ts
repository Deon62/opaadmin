import { Layout } from '../components/layout';
import { Router } from '../router';
import { adminApi } from '../services/api';

interface Client {
  id: number;
  user_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  id_number: string | null;
  verification_status: string | null;
  dl_verification_status: string | null;
  has_id_document: boolean;
  has_dl_document: boolean;
  profile_completeness: number;
  created_at: string | null;
}

export class ClientsPage {
  private layout: Layout;
  private router: Router;
  private currentPage: number = 1;
  private pageSize: number = 20;
  private verificationStatusFilter: string = '';
  private searchQuery: string = '';

  constructor() {
    this.layout = new Layout();
    this.router = Router.getInstance();
  }

  render(): void {
    const clientsContent = `
      <div class="page-container">
        <div class="page-header">
          <h1>Clients</h1>
        </div>

        <div class="filters-section">
          <div class="search-box">
            <input 
              type="text" 
              id="search-input" 
              placeholder="Search by name, email, phone..." 
              class="search-input"
            />
          </div>
          
          <div class="filters">
            <select id="verification-filter" class="filter-select">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>ID Verification</th>
                <th>DL Verification</th>
                <th>Documents</th>
                <th>Profile Complete</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="clients-tbody">
              <tr>
                <td colspan="10" class="loading-state">Loading clients...</td>
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
    `;

    this.layout.render(clientsContent, '/clients');
    this.attachEventListeners();
    this.loadClients();
  }

  private attachEventListeners(): void {
    // Search input
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    if (searchInput) {
      let searchTimeout: number;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = window.setTimeout(async () => {
          this.searchQuery = (e.target as HTMLInputElement).value.trim();
          this.currentPage = 1;
          await this.loadClients();
        }, 300);
      });
    }

    // Verification status filter
    const verificationFilter = document.getElementById('verification-filter') as HTMLSelectElement;
    if (verificationFilter) {
      verificationFilter.addEventListener('change', async (e) => {
        this.verificationStatusFilter = (e.target as HTMLSelectElement).value;
        this.currentPage = 1;
        await this.loadClients();
      });
    }

    // Pagination
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', async () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          await this.loadClients();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', async () => {
        this.currentPage++;
        await this.loadClients();
      });
    }
  }

  private async loadClients(): Promise<void> {
    const tbody = document.getElementById('clients-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="10" class="loading-state">Loading clients...</td></tr>';

    // Calculate skip for pagination
    const skip = (this.currentPage - 1) * this.pageSize;

    // Call API
    const result = await adminApi.getClients({
      verification_status: this.verificationStatusFilter || undefined,
      skip,
      limit: this.pageSize,
    });

    if (result.error) {
      tbody.innerHTML = `<tr><td colspan="10" class="empty-state">Error: ${result.error}</td></tr>`;
      return;
    }

    if (!result.data) {
      tbody.innerHTML = '<tr><td colspan="10" class="empty-state">No clients found</td></tr>';
      return;
    }

    let clients: Client[] = result.data;

    // Apply client-side search filter if needed
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      clients = clients.filter(c => {
        const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase().trim();
        return (
          c.email.toLowerCase().includes(query) ||
          fullName.includes(query) ||
          (c.phone_number && c.phone_number.includes(query)) ||
          (c.id_number && c.id_number.toLowerCase().includes(query)) ||
          c.id.toString().includes(query)
        );
      });
    }

    // Update pagination info
    const hasMore = clients.length === this.pageSize;
    const totalPages = hasMore ? this.currentPage + 1 : this.currentPage;
    const startIndex = skip + 1;
    const endIndex = skip + clients.length;
    const totalClients = hasMore ? endIndex + 1 : endIndex;

    this.updatePaginationInfo(startIndex, endIndex, totalClients, totalPages);

    // Render clients
    if (clients.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="empty-state">No clients found</td></tr>';
      return;
    }

    tbody.innerHTML = clients.map(client => `
      <tr>
        <td>${client.id}</td>
        <td>${this.formatName(client.first_name, client.last_name)}</td>
        <td>${client.email}</td>
        <td>${client.phone_number || '-'}</td>
        <td>${this.renderVerificationStatus(client.verification_status)}</td>
        <td>${this.renderVerificationStatus(client.dl_verification_status)}</td>
        <td>${this.renderDocuments(client)}</td>
        <td>
          <div class="completeness-bar">
            <div class="completeness-fill" style="width: ${client.profile_completeness}%"></div>
            <span class="completeness-text">${client.profile_completeness.toFixed(0)}%</span>
          </div>
        </td>
        <td>${this.formatDate(client.created_at)}</td>
        <td>
          <button class="btn-link" data-client-id="${client.id}">View</button>
        </td>
      </tr>
    `).join('');

    // Attach click handlers for view buttons
    const viewButtons = document.querySelectorAll('.btn-link[data-client-id]');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const clientId = (e.target as HTMLElement).getAttribute('data-client-id');
        if (clientId) {
          this.router.navigate(`/clients/${clientId}`);
        }
      });
    });
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

  private formatName(firstName: string | null, lastName: string | null): string {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) return firstName;
    if (lastName) return lastName;
    return '-';
  }

  private renderVerificationStatus(status: string | null): string {
    if (!status) return '<span class="text-muted">-</span>';
    return `<span class="badge badge-${status}">${this.formatVerificationStatus(status)}</span>`;
  }

  private formatVerificationStatus(status: string | null): string {
    if (!status) return '-';
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'verified': 'Verified',
      'rejected': 'Rejected',
      'under_review': 'Under Review'
    };
    return statusMap[status] || status;
  }

  private renderDocuments(client: Client): string {
    const docs = [];
    if (client.has_id_document) docs.push('ID');
    if (client.has_dl_document) docs.push('DL');
    
    if (docs.length === 0) return '<span class="text-muted">-</span>';
    
    return `<span class="documents-badge">${docs.join(', ')}</span>`;
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
}

