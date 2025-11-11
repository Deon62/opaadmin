import { Layout } from '../components/layout';
import { adminApi } from '../services/api';

export class CommissionManagementPage {
  private layout: Layout;
  private currentTab: string = 'breakdown';
  private breakdownData: any[] = [];
  private pendingData: any[] = [];
  private defaultedData: any[] = [];
  private filters = {
    status: '',
    rentalType: ''
  };
  private currentPage = 1;
  private limit = 20;
  private total = 0;

  constructor() {
    this.layout = new Layout();
  }

  render(): void {
    const commissionContent = `
      <div class="analytics-container">
        <div class="analytics-header">
          <h1>Commission Management</h1>
          <p style="color: var(--text-secondary);">Manage commissions from drivers and car owners</p>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button class="tab-btn active" data-tab="breakdown">All Commissions</button>
          <button class="tab-btn" data-tab="pending">Pending Payments</button>
          <button class="tab-btn" data-tab="defaulted">Defaulted (20+ Days)</button>
        </div>

        <!-- Filters Section (shown for breakdown tab) -->
        <div class="filters-section" id="filters-section">
          <div class="filter-group">
            <label>Status</label>
            <select id="status-filter" class="filter-select">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overpaid">Overpaid</option>
              <option value="defaulted">Defaulted</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Type</label>
            <select id="rental-type-filter" class="filter-select">
              <option value="">All</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button id="apply-filters" class="btn-primary">Apply Filters</button>
          <button id="reset-filters" class="btn-secondary">Reset</button>
        </div>

        <!-- Breakdown Table -->
        <div class="table-container" id="breakdown-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Provider</th>
                <th>Type</th>
                <th>Booking</th>
                <th>Amount</th>
                <th>Rate</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Days Info</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="breakdown-table-body">
              <tr>
                <td colspan="11" class="text-center">Loading...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pending Table -->
        <div class="table-container" id="pending-table-container" style="display: none;">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Provider</th>
                <th>Type</th>
                <th>Booking</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Due Date</th>
                <th>Days Waiting</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="pending-table-body">
              <tr>
                <td colspan="9" class="text-center">Loading...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Defaulted Table -->
        <div class="table-container" id="defaulted-table-container" style="display: none;">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Provider</th>
                <th>Type</th>
                <th>Booking</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Due Date</th>
                <th>Days Overdue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="defaulted-table-body">
              <tr>
                <td colspan="9" class="text-center">Loading...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" id="pagination">
          <button id="prev-page" class="btn-secondary" disabled>Previous</button>
          <span id="page-info">Page 1 of 1</span>
          <button id="next-page" class="btn-secondary" disabled>Next</button>
        </div>
      </div>

      <!-- Approve Commission Modal -->
      <div id="approve-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Approve Commission Payment</h2>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div id="commission-details" class="commission-details"></div>
            <div class="form-group">
              <label>Approved Amount (KES) <span style="color: red;">*</span></label>
              <input type="number" id="approved-amount" placeholder="Enter approved amount" step="0.01" min="0.01" required />
              <small style="color: var(--text-secondary); display: block; margin-top: 0.25rem;">
                Enter the amount you're approving. This may differ from what the provider paid.
              </small>
            </div>
            <div class="form-group">
              <label>Notes (Optional)</label>
              <textarea id="approval-notes" rows="3" placeholder="Add any notes about this approval..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button id="confirm-approve" class="btn-primary">Approve Payment</button>
            <button class="modal-close btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    `;

    this.layout.render(commissionContent, '/analytics/commissions');
    this.loadData();
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) {
          this.switchTab(tab);
        }
      });
    });

    // Filters
    const applyFilters = document.getElementById('apply-filters');
    if (applyFilters) {
      applyFilters.addEventListener('click', () => {
        const statusFilter = (document.getElementById('status-filter') as HTMLSelectElement)?.value || '';
        const rentalTypeFilter = (document.getElementById('rental-type-filter') as HTMLSelectElement)?.value || '';
        this.filters.status = statusFilter;
        this.filters.rentalType = rentalTypeFilter;
        this.currentPage = 1;
        this.loadBreakdownData();
      });
    }

    const resetFilters = document.getElementById('reset-filters');
    if (resetFilters) {
      resetFilters.addEventListener('click', () => {
        (document.getElementById('status-filter') as HTMLSelectElement).value = '';
        (document.getElementById('rental-type-filter') as HTMLSelectElement).value = '';
        this.filters.status = '';
        this.filters.rentalType = '';
        this.currentPage = 1;
        this.loadBreakdownData();
      });
    }

    // Pagination
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.loadCurrentTabData();
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentPage < Math.ceil(this.total / this.limit)) {
          this.currentPage++;
          this.loadCurrentTabData();
        }
      });
    }

    // Modal close
    const modalCloses = document.querySelectorAll('.modal-close');
    modalCloses.forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById('approve-modal');
        if (modal) modal.style.display = 'none';
      });
    });
  }

  private switchTab(tab: string): void {
    this.currentTab = tab;
    this.currentPage = 1;

    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Show/hide filters
    const filtersSection = document.getElementById('filters-section');
    if (filtersSection) {
      filtersSection.style.display = tab === 'breakdown' ? 'flex' : 'none';
    }

    // Show/hide tables
    document.getElementById('breakdown-table-container')!.style.display = tab === 'breakdown' ? 'block' : 'none';
    document.getElementById('pending-table-container')!.style.display = tab === 'pending' ? 'block' : 'none';
    document.getElementById('defaulted-table-container')!.style.display = tab === 'defaulted' ? 'block' : 'none';

    this.loadCurrentTabData();
  }

  private async loadData(): Promise<void> {
    await this.loadBreakdownData();
  }

  private loadCurrentTabData(): void {
    switch (this.currentTab) {
      case 'breakdown':
        this.loadBreakdownData();
        break;
      case 'pending':
        this.loadPendingData();
        break;
      case 'defaulted':
        this.loadDefaultedData();
        break;
    }
  }

  private async loadBreakdownData(): Promise<void> {
    const result = await adminApi.getCommissionBreakdown({
      status_filter: this.filters.status || undefined,
      rental_type_filter: this.filters.rentalType || undefined,
      skip: (this.currentPage - 1) * this.limit,
      limit: this.limit
    });

    if (result.error) {
      console.error('Failed to load commission breakdown:', result.error);
      this.renderError('breakdown-table-body', result.error);
      return;
    }

    if (result.data) {
      const data = result.data as any;
      this.breakdownData = data.commissions || [];
      this.total = data.total || 0;
      this.renderBreakdownTable();
      this.updatePagination();
    }
  }

  private async loadPendingData(): Promise<void> {
    const result = await adminApi.getPendingCommissions({
      skip: (this.currentPage - 1) * this.limit,
      limit: this.limit
    });

    if (result.error) {
      console.error('Failed to load pending commissions:', result.error);
      this.renderError('pending-table-body', result.error);
      return;
    }

    if (result.data) {
      const data = result.data as any;
      this.pendingData = data.commissions || [];
      this.total = data.total || 0;
      this.renderPendingTable();
      this.updatePagination();
    }
  }

  private async loadDefaultedData(): Promise<void> {
    const result = await adminApi.getDefaultedCommissions({
      skip: (this.currentPage - 1) * this.limit,
      limit: this.limit
    });

    if (result.error) {
      console.error('Failed to load defaulted commissions:', result.error);
      this.renderError('defaulted-table-body', result.error);
      return;
    }

    if (result.data) {
      const data = result.data as any;
      this.defaultedData = data.commissions || [];
      this.total = data.total || 0;
      this.renderDefaultedTable();
      this.updatePagination();
    }
  }

  private renderBreakdownTable(): void {
    const tbody = document.getElementById('breakdown-table-body');
    if (!tbody) return;

    if (this.breakdownData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="11" class="text-center">No commissions found</td></tr>';
      return;
    }

    tbody.innerHTML = this.breakdownData.map(commission => {
      const providerType = commission.provider_type === 'driver' ? 'Driver' : 'Car Owner';
      const providerName = commission.driver_name || commission.car_owner_name || 'N/A';
      const providerId = commission.driver_id || commission.car_owner_id;
      const providerLink = commission.provider_type === 'driver' ? `/drivers/${providerId}` : `/car-owners/${providerId}`;
      
      return `
      <tr>
        <td>${commission.id}</td>
        <td>
          <a href="${providerLink}">${providerName}</a>
          <br/><small style="color: var(--text-secondary);">${providerType}</small>
        </td>
        <td><span class="badge badge-${providerType === 'Driver' ? 'driver' : 'car_owner'}">${providerType}</span></td>
        <td><a href="/bookings/${commission.booking_id}">#${commission.booking_id}</a></td>
        <td>${this.formatCurrency(commission.commission_amount)}</td>
        <td>${(commission.commission_rate * 100).toFixed(0)}%</td>
        <td><span class="badge badge-${commission.rental_type}">${commission.rental_type}</span></td>
        <td><span class="badge badge-${commission.status}">${commission.status}</span></td>
        <td>${this.formatDate(commission.due_date)}</td>
        <td>${this.formatDaysInfo(commission)}</td>
        <td>
          ${commission.status === 'pending' && commission.amount_paid > 0 ? `
            <button class="btn-approve" data-id="${commission.id}" data-amount="${commission.commission_amount}" data-provider="${providerName}" data-type="${providerType}" data-paid="${commission.amount_paid}">
              Approve
            </button>
          ` : '-'}
        </td>
      </tr>
    `}).join('');

    this.attachApproveButtons();
  }

  private renderPendingTable(): void {
    const tbody = document.getElementById('pending-table-body');
    if (!tbody) return;

    if (this.pendingData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center">No pending commissions</td></tr>';
      return;
    }

    tbody.innerHTML = this.pendingData.map(commission => {
      const providerType = commission.provider_type === 'driver' ? 'Driver' : 'Car Owner';
      const providerName = commission.driver_name || commission.car_owner_name || 'N/A';
      const providerId = commission.driver_id || commission.car_owner_id;
      const providerLink = commission.provider_type === 'driver' ? `/drivers/${providerId}` : `/car-owners/${providerId}`;
      
      return `
      <tr>
        <td>${commission.id}</td>
        <td>
          <a href="${providerLink}">${providerName}</a>
          <br/><small style="color: var(--text-secondary);">${providerType}</small>
        </td>
        <td><span class="badge badge-${providerType === 'Driver' ? 'driver' : 'car_owner'}">${providerType}</span></td>
        <td><a href="/bookings/${commission.booking_id}">#${commission.booking_id}</a></td>
        <td>${this.formatCurrency(commission.commission_amount)}</td>
        <td>${this.formatCurrency(commission.amount_paid || 0)}</td>
        <td>${this.formatDate(commission.due_date)}</td>
        <td>${commission.days_waiting ? `${commission.days_waiting} days` : '-'}</td>
        <td>
          ${commission.amount_paid > 0 ? `
            <button class="btn-approve" data-id="${commission.id}" data-amount="${commission.commission_amount}" data-provider="${providerName}" data-type="${providerType}" data-paid="${commission.amount_paid}">
              Approve
            </button>
          ` : '-'}
        </td>
      </tr>
    `}).join('');

    this.attachApproveButtons();
  }

  private renderDefaultedTable(): void {
    const tbody = document.getElementById('defaulted-table-body');
    if (!tbody) return;

    if (this.defaultedData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center">No defaulted commissions</td></tr>';
      return;
    }

    tbody.innerHTML = this.defaultedData.map(commission => {
      const providerType = commission.provider_type === 'driver' ? 'Driver' : 'Car Owner';
      const providerName = commission.driver_name || commission.car_owner_name || 'N/A';
      const providerId = commission.driver_id || commission.car_owner_id;
      const providerLink = commission.provider_type === 'driver' ? `/drivers/${providerId}` : `/car-owners/${providerId}`;
      
      return `
      <tr class="row-warning">
        <td>${commission.id}</td>
        <td>
          <a href="${providerLink}">${providerName}</a>
          <br/><small style="color: var(--text-secondary);">${providerType}</small>
        </td>
        <td><span class="badge badge-${providerType === 'Driver' ? 'driver' : 'car_owner'}">${providerType}</span></td>
        <td><a href="/bookings/${commission.booking_id}">#${commission.booking_id}</a></td>
        <td>${this.formatCurrency(commission.commission_amount)}</td>
        <td>${this.formatCurrency(commission.amount_paid || 0)}</td>
        <td>${this.formatDate(commission.due_date)}</td>
        <td class="text-danger">${commission.days_overdue ? `${commission.days_overdue} days` : '-'}</td>
        <td>
          ${commission.amount_paid > 0 ? `
            <button class="btn-approve" data-id="${commission.id}" data-amount="${commission.commission_amount}" data-provider="${providerName}" data-type="${providerType}" data-paid="${commission.amount_paid}">
              Approve
            </button>
          ` : '-'}
        </td>
      </tr>
    `}).join('');

    this.attachApproveButtons();
  }

  private attachApproveButtons(): void {
    const approveButtons = document.querySelectorAll('.btn-approve');
    approveButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const amount = btn.getAttribute('data-amount');
        const provider = btn.getAttribute('data-provider');
        const type = btn.getAttribute('data-type');
        const paid = btn.getAttribute('data-paid');
        if (id && amount && provider && type) {
          this.showApproveModal(parseInt(id), parseFloat(amount), provider, type, parseFloat(paid || '0'));
        }
      });
    });
  }

  private showApproveModal(id: number, amount: number, providerName: string, providerType: string, amountPaid: number): void {
    const modal = document.getElementById('approve-modal');
    const detailsDiv = document.getElementById('commission-details');
    const approvedAmountInput = document.getElementById('approved-amount') as HTMLInputElement;
    
    if (modal && detailsDiv) {
      detailsDiv.innerHTML = `
        <div class="detail-row">
          <strong>Commission ID:</strong> <span>${id}</span>
        </div>
        <div class="detail-row">
          <strong>Provider Type:</strong> <span>${providerType}</span>
        </div>
        <div class="detail-row">
          <strong>Provider:</strong> <span>${providerName}</span>
        </div>
        <div class="detail-row">
          <strong>Commission Amount:</strong> <span>${this.formatCurrency(amount)}</span>
        </div>
        <div class="detail-row">
          <strong>Amount Paid:</strong> <span style="color: ${amountPaid >= amount ? 'var(--success-color)' : 'var(--warning-color)'};">${this.formatCurrency(amountPaid)}</span>
        </div>
        ${amountPaid < amount ? `
          <div class="detail-row" style="border: none;">
            <span style="color: var(--warning-color); font-size: 0.875rem;">
              ⚠️ Partial payment - ${this.formatCurrency(amount - amountPaid)} remaining
            </span>
          </div>
        ` : ''}
      `;
      
      // Set default approved amount to what was paid
      if (approvedAmountInput) {
        approvedAmountInput.value = amountPaid.toString();
      }
      
      // Clear notes
      const notesInput = document.getElementById('approval-notes') as HTMLTextAreaElement;
      if (notesInput) {
        notesInput.value = '';
      }
      
      modal.style.display = 'flex';
      
      const confirmBtn = document.getElementById('confirm-approve');
      if (confirmBtn) {
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.replaceWith(newConfirmBtn);
        newConfirmBtn.addEventListener('click', () => {
          const approvedAmount = parseFloat(approvedAmountInput?.value || '0');
          const notes = (document.getElementById('approval-notes') as HTMLTextAreaElement)?.value || '';
          
          if (!approvedAmount || approvedAmount <= 0) {
            alert('Please enter a valid approved amount greater than 0');
            return;
          }
          
          this.approveCommission(id, approvedAmount, providerType, notes);
        });
      }
    }
  }

  private async approveCommission(id: number, approvedAmount: number, providerType: string, notes?: string): Promise<void> {
    // Call the appropriate API based on provider type
    const result = providerType === 'Driver' 
      ? await adminApi.approveDriverCommission(id, approvedAmount, notes)
      : await adminApi.approveCarOwnerCommission(id, approvedAmount, notes);
    
    if (result.error) {
      alert('Failed to approve commission: ' + result.error);
      return;
    }

    const data = result.data as any;
    const message = data?.message || 'Commission payment approved successfully!';
    const status = data?.status || 'unknown';
    
    let statusMessage = '';
    if (status === 'paid') {
      statusMessage = '✅ Commission fully paid!';
    } else if (status === 'overpaid') {
      statusMessage = '💰 Commission overpaid - platform owes provider!';
    } else if (status === 'pending') {
      statusMessage = '⚠️ Partial payment approved - commission still pending';
    }
    
    alert(`${message}\n\n${statusMessage}`);
    
    const modal = document.getElementById('approve-modal');
    if (modal) modal.style.display = 'none';
    
    // Reload current tab data
    this.loadCurrentTabData();
  }

  private renderError(tbodyId: string, error: string): void {
    const tbody = document.getElementById(tbodyId);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Error: ${error}</td></tr>`;
    }
  }

  private updatePagination(): void {
    const totalPages = Math.ceil(this.total / this.limit);
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-page') as HTMLButtonElement;

    if (pageInfo) {
      pageInfo.textContent = `Page ${this.currentPage} of ${totalPages || 1} (${this.total} total)`;
    }

    if (prevBtn) {
      prevBtn.disabled = this.currentPage === 1;
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentPage >= totalPages;
    }
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value);
  }

  private formatDate(dateStr: string | null): string {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'N/A';
    }
  }

  private formatDaysInfo(commission: any): string {
    if (commission.days_overdue) {
      return `<span class="text-danger">${commission.days_overdue} days overdue</span>`;
    }
    if (commission.days_waiting) {
      return `${commission.days_waiting} days waiting`;
    }
    return '-';
  }
}

