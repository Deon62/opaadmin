import { Layout } from '../components/layout';
import { Router } from '../router';

interface CarOwner {
  id: number;
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  id_number: string | null;
  verification_status: string | null;
  has_id_document: boolean;
  business_name: string | null;
  total_vehicles: number;
  profile_completeness: number;
  created_at: string | null;
}

export class CarOwnersPage {
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
    const carOwnersContent = `
      <div class="page-container">
        <div class="page-header">
          <h1>Car Owners</h1>
        </div>

        <div class="filters-section">
          <div class="search-box">
            <input 
              type="text" 
              id="search-input" 
              placeholder="Search by name, email, phone, business..." 
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
                <th>Business Name</th>
                <th>Verification Status</th>
                <th>Documents</th>
                <th>Total Vehicles</th>
                <th>Profile Complete</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="car-owners-tbody">
              <tr>
                <td colspan="11" class="loading-state">Loading car owners...</td>
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

    this.layout.render(carOwnersContent, '/car-owners');
    this.attachEventListeners();
    this.loadCarOwners();
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
          this.loadCarOwners();
        }, 300);
      });
    }

    // Verification status filter
    const verificationFilter = document.getElementById('verification-filter') as HTMLSelectElement;
    if (verificationFilter) {
      verificationFilter.addEventListener('change', (e) => {
        this.verificationStatusFilter = (e.target as HTMLSelectElement).value;
        this.currentPage = 1;
        this.loadCarOwners();
      });
    }

    // Pagination
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.loadCarOwners();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentPage++;
        this.loadCarOwners();
      });
    }
  }

  private loadCarOwners(): void {
    const tbody = document.getElementById('car-owners-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="11" class="loading-state">Loading car owners...</td></tr>';

    // Mock data - will be replaced with API call
    const mockCarOwners: CarOwner[] = [
      {
        id: 1,
        user_id: 30,
        email: 'owner1@example.com',
        first_name: 'Michael',
        last_name: 'Johnson',
        phone_number: '+1234567890',
        id_number: 'ID123456',
        verification_status: 'verified',
        has_id_document: true,
        business_name: 'Johnson Car Rentals',
        total_vehicles: 5,
        profile_completeness: 100.0,
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        user_id: 31,
        email: 'owner2@example.com',
        first_name: 'Sarah',
        last_name: 'Davis',
        phone_number: '+1234567891',
        id_number: 'ID123457',
        verification_status: 'pending',
        has_id_document: true,
        business_name: 'Davis Auto Services',
        total_vehicles: 3,
        profile_completeness: 85.0,
        created_at: '2024-01-16T14:20:00Z'
      },
      {
        id: 3,
        user_id: 32,
        email: 'owner3@example.com',
        first_name: 'David',
        last_name: 'Wilson',
        phone_number: '+1234567892',
        id_number: 'ID123458',
        verification_status: 'rejected',
        has_id_document: true,
        business_name: null,
        total_vehicles: 1,
        profile_completeness: 70.0,
        created_at: '2024-01-17T09:15:00Z'
      }
    ];

    // Apply filters
    let filteredCarOwners = mockCarOwners;

    if (this.verificationStatusFilter) {
      filteredCarOwners = filteredCarOwners.filter(co => co.verification_status === this.verificationStatusFilter);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredCarOwners = filteredCarOwners.filter(co => {
        const fullName = `${co.first_name} ${co.last_name}`.toLowerCase();
        const businessName = (co.business_name || '').toLowerCase();
        return (
          co.email.toLowerCase().includes(query) ||
          fullName.includes(query) ||
          co.phone_number.includes(query) ||
          (co.id_number && co.id_number.toLowerCase().includes(query)) ||
          businessName.includes(query) ||
          co.id.toString().includes(query)
        );
      });
    }

    // Pagination
    const totalCarOwners = filteredCarOwners.length;
    const totalPages = Math.ceil(totalCarOwners / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, totalCarOwners);
    const paginatedCarOwners = filteredCarOwners.slice(startIndex, endIndex);

    // Update pagination info
    this.updatePaginationInfo(startIndex + 1, endIndex, totalCarOwners, totalPages);

    // Render car owners
    if (paginatedCarOwners.length === 0) {
      tbody.innerHTML = '<tr><td colspan="11" class="empty-state">No car owners found</td></tr>';
      return;
    }

    tbody.innerHTML = paginatedCarOwners.map(owner => `
      <tr>
        <td>${owner.id}</td>
        <td>${owner.first_name} ${owner.last_name}</td>
        <td>${owner.email}</td>
        <td>${owner.phone_number}</td>
        <td>${owner.business_name || '-'}</td>
        <td><span class="badge badge-${owner.verification_status || 'pending'}">${this.formatVerificationStatus(owner.verification_status)}</span></td>
        <td>${this.renderDocuments(owner)}</td>
        <td>${owner.total_vehicles}</td>
        <td>
          <div class="completeness-bar">
            <div class="completeness-fill" style="width: ${owner.profile_completeness}%"></div>
            <span class="completeness-text">${owner.profile_completeness.toFixed(0)}%</span>
          </div>
        </td>
        <td>${this.formatDate(owner.created_at)}</td>
        <td>
          <button class="btn-link" data-car-owner-id="${owner.id}">View</button>
        </td>
      </tr>
    `).join('');

    // Attach click handlers for view buttons
    const viewButtons = document.querySelectorAll('.btn-link[data-car-owner-id]');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const carOwnerId = (e.target as HTMLElement).getAttribute('data-car-owner-id');
        if (carOwnerId) {
          this.router.navigate(`/car-owners/${carOwnerId}`);
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

  private renderDocuments(owner: CarOwner): string {
    if (owner.has_id_document) {
      return '<span class="documents-badge">ID</span>';
    }
    return '<span class="text-muted">-</span>';
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

