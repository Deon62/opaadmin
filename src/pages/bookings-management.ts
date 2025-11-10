import { Layout } from '../components/layout';
import { Router } from '../router';
import { adminApi } from '../services/api';

export class BookingsManagementPage {
  private layout: Layout;
  private router: Router;
  private currentPage: number = 1;
  private pageSize: number = 20;
  private typeFilter: string = 'all';
  private statusFilter: string = '';
  private startDate: string = '';
  private endDate: string = '';

  constructor() {
    this.layout = new Layout();
    this.router = Router.getInstance();
  }

  render(): void {
    const bookingsContent = `
      <div class="page-container">
        <div class="page-header">
          <h1>Bookings Management</h1>
        </div>

        <!-- Filters -->
        <div class="bookings-filters">
          <div class="form-group">
            <label>Type</label>
            <select id="type-filter">
              <option value="all">All Types</option>
              <option value="driver">Driver</option>
              <option value="vehicle">Vehicle</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select id="status-filter">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="payment_pending">Payment Pending</option>
              <option value="payment_confirmed">Payment Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div class="form-group">
            <label>Start Date</label>
            <input type="date" id="start-date" />
          </div>
          <div class="form-group">
            <label>End Date</label>
            <input type="date" id="end-date" />
          </div>
        </div>

        <!-- Bookings Table -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Client</th>
                <th>Provider</th>
                <th>Amount</th>
                <th>Created At</th>
                <th>Payment Confirmed</th>
                <th>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="bookings-tbody">
              <tr>
                <td colspan="10" class="loading-state">Loading bookings...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
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

      <!-- Booking Detail Modal -->
      <div class="modal-overlay" id="booking-modal" style="display: none;">
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
          <div class="modal-header">
            <h2>Booking Details</h2>
            <button class="modal-close" id="close-modal">&times;</button>
          </div>
          <div class="modal-body" id="booking-detail-content">
            <div class="loading-state">Loading...</div>
          </div>
        </div>
      </div>
    `;

    this.layout.render(bookingsContent, '/bookings');
    this.attachEventListeners();
    this.loadBookings();
  }

  private attachEventListeners(): void {
    // Filters
    const typeFilter = document.getElementById('type-filter') as HTMLSelectElement;
    const statusFilter = document.getElementById('status-filter') as HTMLSelectElement;
    const startDate = document.getElementById('start-date') as HTMLInputElement;
    const endDate = document.getElementById('end-date') as HTMLInputElement;

    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => {
        this.typeFilter = (e.target as HTMLSelectElement).value;
        this.currentPage = 1;
        this.loadBookings();
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.statusFilter = (e.target as HTMLSelectElement).value;
        this.currentPage = 1;
        this.loadBookings();
      });
    }

    if (startDate) {
      startDate.addEventListener('change', (e) => {
        this.startDate = (e.target as HTMLInputElement).value;
        this.currentPage = 1;
        this.loadBookings();
      });
    }

    if (endDate) {
      endDate.addEventListener('change', (e) => {
        this.endDate = (e.target as HTMLInputElement).value;
        this.currentPage = 1;
        this.loadBookings();
      });
    }

    // Pagination
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.loadBookings();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentPage++;
        this.loadBookings();
      });
    }

    // Modal
    const modal = document.getElementById('booking-modal');
    const closeModal = document.getElementById('close-modal');

    if (closeModal && modal) {
      closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    }
  }

  private async loadBookings(): Promise<void> {
    const tbody = document.getElementById('bookings-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="10" class="loading-state">Loading bookings...</td></tr>';

    const skip = (this.currentPage - 1) * this.pageSize;

    const result = await adminApi.getAdminBookings({
      type: this.typeFilter !== 'all' ? this.typeFilter : undefined,
      status: this.statusFilter || undefined,
      skip,
      limit: this.pageSize,
      start_date: this.startDate || undefined,
      end_date: this.endDate || undefined,
    });

    if (result.error) {
      tbody.innerHTML = `<tr><td colspan="10" class="empty-state">Error: ${result.error}</td></tr>`;
      return;
    }

    if (!result.data) {
      tbody.innerHTML = '<tr><td colspan="10" class="empty-state">No bookings found</td></tr>';
      return;
    }

    const bookings = result.data.bookings || [];
    const total = result.data.total || 0;

    this.updatePaginationInfo(total);

    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="empty-state">No bookings found</td></tr>';
      return;
    }

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value);
    };

    const formatDate = (dateString: string | null) => {
      if (!dateString) return '-';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch {
        return '-';
      }
    };

    tbody.innerHTML = bookings.map((booking: any) => `
      <tr>
        <td>${booking.id}</td>
        <td><span class="badge badge-${booking.type}">${booking.type === 'driver' ? 'Driver' : 'Vehicle'}</span></td>
        <td><span class="badge badge-${booking.status}">${this.formatStatus(booking.status)}</span></td>
        <td>
          <div>${booking.client_name || '-'}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">${booking.client_email || '-'}</div>
        </td>
        <td>
          <div>${booking.provider_name || '-'}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">${booking.provider_email || '-'}</div>
        </td>
        <td>${formatCurrency(booking.total_amount || 0)}</td>
        <td>${formatDate(booking.created_at)}</td>
        <td>${formatDate(booking.payment_confirmed_at)}</td>
        <td>${formatDate(booking.completed_at)}</td>
        <td>
          <button class="btn-link" data-booking-id="${booking.id}">View</button>
        </td>
      </tr>
    `).join('');

    // Attach view button handlers
    const viewButtons = document.querySelectorAll('.btn-link[data-booking-id]');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const bookingId = (e.target as HTMLElement).getAttribute('data-booking-id');
        if (bookingId) {
          await this.showBookingDetail(parseInt(bookingId));
        }
      });
    });
  }

  private async showBookingDetail(bookingId: number): Promise<void> {
    const modal = document.getElementById('booking-modal');
    const content = document.getElementById('booking-detail-content');
    if (!modal || !content) return;

    modal.style.display = 'flex';
    content.innerHTML = '<div class="loading-state">Loading booking details...</div>';

    const result = await adminApi.getAdminBookingDetail(bookingId);
    if (result.error) {
      content.innerHTML = `<div class="empty-state">Error: ${result.error}</div>`;
      return;
    }

    if (!result.data) {
      content.innerHTML = '<div class="empty-state">Booking not found</div>';
      return;
    }

    const booking = result.data;
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value);
    };

    const formatDate = (dateString: string | null) => {
      if (!dateString) return '-';
      try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch {
        return '-';
      }
    };

    content.innerHTML = `
      <div class="detail-grid">
        <div class="detail-section">
          <div class="section-header">
            <h3>Booking Information</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>Booking ID</label>
              <div>${booking.id}</div>
            </div>
            <div class="info-item">
              <label>Type</label>
              <div><span class="badge badge-${booking.type}">${booking.type === 'driver' ? 'Driver' : 'Vehicle'}</span></div>
            </div>
            <div class="info-item">
              <label>Status</label>
              <div><span class="badge badge-${booking.status}">${this.formatStatus(booking.status)}</span></div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-header">
            <h3>Client Information</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>Name</label>
              <div>${booking.client.name || '-'}</div>
            </div>
            <div class="info-item">
              <label>Email</label>
              <div>${booking.client.email || '-'}</div>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <div>${booking.client.phone || '-'}</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-header">
            <h3>Provider Information</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>Name</label>
              <div>${booking.provider.name || '-'}</div>
            </div>
            <div class="info-item">
              <label>Email</label>
              <div>${booking.provider.email || '-'}</div>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <div>${booking.provider.phone || '-'}</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-header">
            <h3>Booking Details</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>Pickup Location</label>
              <div>${booking.booking_details.pickup_location || '-'}</div>
            </div>
            <div class="info-item">
              <label>Dropoff Location</label>
              <div>${booking.booking_details.dropoff_location || '-'}</div>
            </div>
            ${booking.booking_details.booking_date ? `
            <div class="info-item">
              <label>Booking Date</label>
              <div>${formatDate(booking.booking_details.booking_date)}</div>
            </div>
            ` : ''}
            ${booking.booking_details.rental_start_date ? `
            <div class="info-item">
              <label>Rental Start Date</label>
              <div>${formatDate(booking.booking_details.rental_start_date)}</div>
            </div>
            <div class="info-item">
              <label>Rental End Date</label>
              <div>${formatDate(booking.booking_details.rental_end_date)}</div>
            </div>
            ` : ''}
            <div class="info-item">
              <label>Number of Days</label>
              <div>${booking.booking_details.number_of_days || '-'}</div>
            </div>
            <div class="info-item">
              <label>Daily Rate</label>
              <div>${formatCurrency(booking.booking_details.daily_rate || 0)}</div>
            </div>
            <div class="info-item">
              <label>Total Amount</label>
              <div>${formatCurrency(booking.booking_details.total_amount || 0)}</div>
            </div>
            ${booking.booking_details.deposit_amount ? `
            <div class="info-item">
              <label>Deposit Amount</label>
              <div>${formatCurrency(booking.booking_details.deposit_amount)}</div>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="detail-section">
          <div class="section-header">
            <h3>Payment Information</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>Payment Method</label>
              <div>${this.formatPaymentMethod(booking.payment.payment_method)}</div>
            </div>
            <div class="info-item">
              <label>Payment Confirmed At</label>
              <div>${formatDate(booking.payment.payment_confirmed_at)}</div>
            </div>
            ${booking.payment.payment_screenshot_url ? `
            <div class="info-item">
              <label>Payment Screenshot</label>
              <div><a href="${booking.payment.payment_screenshot_url}" target="_blank" rel="noopener noreferrer" data-external-link="true" class="btn-link">View Screenshot</a></div>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="detail-section">
          <div class="section-header">
            <h3>Timestamps</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>Created At</label>
              <div>${formatDate(booking.timestamps.created_at)}</div>
            </div>
            <div class="info-item">
              <label>Accepted At</label>
              <div>${formatDate(booking.timestamps.accepted_at)}</div>
            </div>
            <div class="info-item">
              <label>Started At</label>
              <div>${formatDate(booking.timestamps.started_at)}</div>
            </div>
            <div class="info-item">
              <label>Completed At</label>
              <div>${formatDate(booking.timestamps.completed_at)}</div>
            </div>
            <div class="info-item">
              <label>Cancelled At</label>
              <div>${formatDate(booking.timestamps.cancelled_at)}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private updatePaginationInfo(total: number): void {
    const info = document.getElementById('pagination-info');
    const currentPageEl = document.getElementById('current-page');
    const prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-page') as HTMLButtonElement;

    const startIndex = (this.currentPage - 1) * this.pageSize + 1;
    const endIndex = Math.min(this.currentPage * this.pageSize, total);
    const totalPages = Math.ceil(total / this.pageSize);

    if (info) {
      info.textContent = `Showing ${startIndex} - ${endIndex} of ${total}`;
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

  private formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'accepted': 'Accepted',
      'payment_pending': 'Payment Pending',
      'payment_confirmed': 'Payment Confirmed',
      'in_progress': 'In Progress',
      'active': 'Active',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status;
  }

  private formatPaymentMethod(method: string): string {
    const methodMap: { [key: string]: string } = {
      'direct_payment': 'Direct Payment',
      'cash': 'Cash',
      'system_payment': 'System Payment'
    };
    return methodMap[method] || method;
  }
}

