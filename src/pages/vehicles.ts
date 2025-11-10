import { Layout } from '../components/layout';
import { Router } from '../router';
import { adminApi } from '../services/api';

interface Vehicle {
  id: number;
  car_owner_id: number;
  make: string;
  model: string;
  year: number;
  plate_number: string;
  vehicle_type: string | null;
  documents_verification_status: string | null;
  has_registration_document: boolean;
  has_insurance_document: boolean;
  listing_status: string | null;
  created_at: string | null;
}

export class VehiclesPage {
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
    const vehiclesContent = `
      <div class="page-container">
        <div class="page-header">
          <h1>Vehicles</h1>
        </div>

        <div class="filters-section">
          <div class="search-box">
            <input 
              type="text" 
              id="search-input" 
              placeholder="Search by make, model, plate number..." 
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
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>Plate Number</th>
                <th>Type</th>
                <th>Verification Status</th>
                <th>Documents</th>
                <th>Listing Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="vehicles-tbody">
              <tr>
                <td colspan="11" class="loading-state">Loading vehicles...</td>
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

    this.layout.render(vehiclesContent, '/vehicles');
    this.attachEventListeners();
    this.loadVehicles();
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
          await this.loadVehicles();
        }, 300);
      });
    }

    // Verification status filter
    const verificationFilter = document.getElementById('verification-filter') as HTMLSelectElement;
    if (verificationFilter) {
      verificationFilter.addEventListener('change', async (e) => {
        this.verificationStatusFilter = (e.target as HTMLSelectElement).value;
        this.currentPage = 1;
        await this.loadVehicles();
      });
    }

    // Pagination
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', async () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          await this.loadVehicles();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', async () => {
        this.currentPage++;
        await this.loadVehicles();
      });
    }
  }

  private async loadVehicles(): Promise<void> {
    const tbody = document.getElementById('vehicles-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="11" class="loading-state">Loading vehicles...</td></tr>';

    // Calculate skip for pagination
    const skip = (this.currentPage - 1) * this.pageSize;

    // Call API
    const result = await adminApi.getVehicles({
      verification_status: this.verificationStatusFilter || undefined,
      skip,
      limit: this.pageSize,
    });

    if (result.error) {
      tbody.innerHTML = `<tr><td colspan="11" class="empty-state">Error: ${result.error}</td></tr>`;
      return;
    }

    if (!result.data) {
      tbody.innerHTML = '<tr><td colspan="11" class="empty-state">No vehicles found</td></tr>';
      return;
    }

    let vehicles: Vehicle[] = result.data;

    // Apply client-side search filter if needed
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      vehicles = vehicles.filter(v => {
        return (
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.plate_number.toLowerCase().includes(query) ||
          v.year.toString().includes(query) ||
          (v.vehicle_type && v.vehicle_type.toLowerCase().includes(query)) ||
          v.id.toString().includes(query)
        );
      });
    }

    // Update pagination info
    const hasMore = vehicles.length === this.pageSize;
    const totalPages = hasMore ? this.currentPage + 1 : this.currentPage;
    const startIndex = skip + 1;
    const endIndex = skip + vehicles.length;
    const totalVehicles = hasMore ? endIndex + 1 : endIndex;

    this.updatePaginationInfo(startIndex, endIndex, totalVehicles, totalPages);

    // Render vehicles
    if (vehicles.length === 0) {
      tbody.innerHTML = '<tr><td colspan="11" class="empty-state">No vehicles found</td></tr>';
      return;
    }

    tbody.innerHTML = vehicles.map(vehicle => `
      <tr>
        <td>${vehicle.id}</td>
        <td>${vehicle.make}</td>
        <td>${vehicle.model}</td>
        <td>${vehicle.year}</td>
        <td>${vehicle.plate_number}</td>
        <td>${vehicle.vehicle_type || '-'}</td>
        <td><span class="badge badge-${vehicle.documents_verification_status || 'pending'}">${this.formatVerificationStatus(vehicle.documents_verification_status)}</span></td>
        <td>${this.renderDocuments(vehicle)}</td>
        <td><span class="badge badge-${vehicle.listing_status || 'not_ready'}">${this.formatListingStatus(vehicle.listing_status)}</span></td>
        <td>${this.formatDate(vehicle.created_at)}</td>
        <td>
          <button class="btn-link" data-vehicle-id="${vehicle.id}">View</button>
        </td>
      </tr>
    `).join('');

    // Attach click handlers for view buttons
    const viewButtons = document.querySelectorAll('.btn-link[data-vehicle-id]');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const vehicleId = (e.target as HTMLElement).getAttribute('data-vehicle-id');
        if (vehicleId) {
          this.router.navigate(`/vehicles/${vehicleId}`);
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

  private formatListingStatus(status: string | null): string {
    if (!status) return 'Not Ready';
    const statusMap: { [key: string]: string } = {
      'ready': 'Ready',
      'not_ready': 'Not Ready'
    };
    return statusMap[status] || status;
  }

  private renderDocuments(vehicle: Vehicle): string {
    const docs = [];
    if (vehicle.has_registration_document) docs.push('Registration');
    if (vehicle.has_insurance_document) docs.push('Insurance');
    
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

