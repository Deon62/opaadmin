import { Layout } from '../components/layout';
import { Router } from '../router';

interface Driver {
  id: number;
  user_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  id_number: string | null;
  verification_status: string | null;
  has_id_document: boolean;
  has_dl_document: boolean;
  has_selfie: boolean;
  profile_completeness: number;
  created_at: string | null;
}

export class DriversPage {
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
    const driversContent = `
      <div class="page-container">
        <div class="page-header">
          <h1>Drivers</h1>
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
                <th>Verification Status</th>
                <th>Documents</th>
                <th>Profile Complete</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="drivers-tbody">
              <tr>
                <td colspan="9" class="loading-state">Loading drivers...</td>
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

    this.layout.render(driversContent, '/drivers');
    this.attachEventListeners();
    this.loadDrivers();
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
          this.loadDrivers();
        }, 300);
      });
    }

    // Verification status filter
    const verificationFilter = document.getElementById('verification-filter') as HTMLSelectElement;
    if (verificationFilter) {
      verificationFilter.addEventListener('change', (e) => {
        this.verificationStatusFilter = (e.target as HTMLSelectElement).value;
        this.currentPage = 1;
        this.loadDrivers();
      });
    }

    // Pagination
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.loadDrivers();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentPage++;
        this.loadDrivers();
      });
    }
  }

  private loadDrivers(): void {
    const tbody = document.getElementById('drivers-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="9" class="loading-state">Loading drivers...</td></tr>';

    // Mock data - will be replaced with API call
    const mockDrivers: Driver[] = [
      {
        id: 1,
        user_id: 10,
        email: 'driver1@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '+1234567890',
        id_number: 'ID123456',
        verification_status: 'pending',
        has_id_document: true,
        has_dl_document: true,
        has_selfie: true,
        profile_completeness: 85.5,
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        user_id: 11,
        email: 'driver2@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        phone_number: '+1234567891',
        id_number: 'ID123457',
        verification_status: 'verified',
        has_id_document: true,
        has_dl_document: true,
        has_selfie: true,
        profile_completeness: 100.0,
        created_at: '2024-01-16T14:20:00Z'
      },
      {
        id: 3,
        user_id: 12,
        email: 'driver3@example.com',
        first_name: 'Bob',
        last_name: 'Johnson',
        phone_number: '+1234567892',
        id_number: 'ID123458',
        verification_status: 'rejected',
        has_id_document: true,
        has_dl_document: false,
        has_selfie: true,
        profile_completeness: 60.0,
        created_at: '2024-01-17T09:15:00Z'
      }
    ];

    // Apply filters
    let filteredDrivers = mockDrivers;

    if (this.verificationStatusFilter) {
      filteredDrivers = filteredDrivers.filter(d => d.verification_status === this.verificationStatusFilter);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredDrivers = filteredDrivers.filter(d => {
        const fullName = `${d.first_name || ''} ${d.last_name || ''}`.toLowerCase().trim();
        return (
          d.email.toLowerCase().includes(query) ||
          fullName.includes(query) ||
          (d.phone_number && d.phone_number.includes(query)) ||
          (d.id_number && d.id_number.toLowerCase().includes(query)) ||
          d.id.toString().includes(query)
        );
      });
    }

    // Pagination
    const totalDrivers = filteredDrivers.length;
    const totalPages = Math.ceil(totalDrivers / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, totalDrivers);
    const paginatedDrivers = filteredDrivers.slice(startIndex, endIndex);

    // Update pagination info
    this.updatePaginationInfo(startIndex + 1, endIndex, totalDrivers, totalPages);

    // Render drivers
    if (paginatedDrivers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No drivers found</td></tr>';
      return;
    }

    tbody.innerHTML = paginatedDrivers.map(driver => `
      <tr>
        <td>${driver.id}</td>
        <td>${this.formatName(driver.first_name, driver.last_name)}</td>
        <td>${driver.email}</td>
        <td>${driver.phone_number || '-'}</td>
        <td><span class="badge badge-${driver.verification_status || 'pending'}">${this.formatVerificationStatus(driver.verification_status)}</span></td>
        <td>${this.renderDocuments(driver)}</td>
        <td>
          <div class="completeness-bar">
            <div class="completeness-fill" style="width: ${driver.profile_completeness}%"></div>
            <span class="completeness-text">${driver.profile_completeness.toFixed(0)}%</span>
          </div>
        </td>
        <td>${this.formatDate(driver.created_at)}</td>
        <td>
          <button class="btn-link" data-driver-id="${driver.id}">View</button>
        </td>
      </tr>
    `).join('');

    // Attach click handlers for view buttons
    const viewButtons = document.querySelectorAll('.btn-link[data-driver-id]');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const driverId = (e.target as HTMLElement).getAttribute('data-driver-id');
        if (driverId) {
          this.router.navigate(`/drivers/${driverId}`);
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

  private formatVerificationStatus(status: string | null): string {
    if (!status) return 'Pending';
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'verified': 'Verified',
      'rejected': 'Rejected',
      'under_review': 'Under Review'
    };
    return statusMap[status] || status;
  }

  private renderDocuments(driver: Driver): string {
    const docs = [];
    if (driver.has_id_document) docs.push('ID');
    if (driver.has_dl_document) docs.push('DL');
    if (driver.has_selfie) docs.push('Selfie');
    
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

