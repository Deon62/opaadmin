import { Layout } from '../components/layout';
import { adminApi } from '../services/api';

export class TopPerformersPage {
  private layout: Layout;
  private currentPeriod: string = '30d';
  private currentLimit: number = 10;
  private topDrivers: any[] = [];
  private topCarOwners: any[] = [];
  private topClients: any[] = [];

  constructor() {
    this.layout = new Layout();
  }

  render(): void {
    const performersContent = `
      <div class="analytics-container">
        <div class="analytics-header">
          <h1>Top Performers</h1>
          <div class="period-filter">
            <label>Period:</label>
            <select id="period-filter">
              <option value="7d">7 Days</option>
              <option value="30d" selected>30 Days</option>
              <option value="90d">90 Days</option>
              <option value="1y">1 Year</option>
              <option value="all">All Time</option>
            </select>
            <label>Limit:</label>
            <select id="limit-filter">
              <option value="10" selected>Top 10</option>
              <option value="25">Top 25</option>
              <option value="50">Top 50</option>
            </select>
          </div>
        </div>

        <!-- Top Drivers -->
        <div class="top-performers-section">
          <div class="top-performers-header">
            <h2>Top Drivers</h2>
          </div>
          <div class="top-performers-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Completed</th>
                  <th>Total Revenue</th>
                  <th>Avg Rating</th>
                  <th>Acceptance Rate</th>
                  <th>Total Bookings</th>
                </tr>
              </thead>
              <tbody id="top-drivers-tbody">
                <tr><td colspan="8" class="loading-state">Loading...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Car Owners -->
        <div class="top-performers-section">
          <div class="top-performers-header">
            <h2>Top Car Owners</h2>
          </div>
          <div class="top-performers-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Completed</th>
                  <th>Total Revenue</th>
                  <th>Avg Rating</th>
                  <th>Acceptance Rate</th>
                  <th>Total Rentals</th>
                  <th>Total Vehicles</th>
                </tr>
              </thead>
              <tbody id="top-car-owners-tbody">
                <tr><td colspan="9" class="loading-state">Loading...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Clients -->
        <div class="top-performers-section">
          <div class="top-performers-header">
            <h2>Top Clients</h2>
          </div>
          <div class="top-performers-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Total Bookings</th>
                  <th>Total Spending</th>
                  <th>Booking Frequency</th>
                  <th>Driver Bookings</th>
                  <th>Vehicle Rentals</th>
                </tr>
              </thead>
              <tbody id="top-clients-tbody">
                <tr><td colspan="8" class="loading-state">Loading...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.layout.render(performersContent, '/analytics/top-performers');
    this.attachEventListeners();
    this.loadData();
  }

  private attachEventListeners(): void {
    const periodFilter = document.getElementById('period-filter') as HTMLSelectElement;
    const limitFilter = document.getElementById('limit-filter') as HTMLSelectElement;

    if (periodFilter) {
      periodFilter.addEventListener('change', (e) => {
        this.currentPeriod = (e.target as HTMLSelectElement).value;
        this.loadData();
      });
    }

    if (limitFilter) {
      limitFilter.addEventListener('change', (e) => {
        this.currentLimit = parseInt((e.target as HTMLSelectElement).value);
        this.loadData();
      });
    }
  }

  private async loadData(): Promise<void> {
    await Promise.all([
      this.loadTopDrivers(),
      this.loadTopCarOwners(),
      this.loadTopClients()
    ]);
  }

  private async loadTopDrivers(): Promise<void> {
    const result = await adminApi.getTopDrivers(this.currentLimit, this.currentPeriod);
    if (result.error) {
      console.error('Failed to load top drivers:', result.error);
      const tbody = document.getElementById('top-drivers-tbody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Error loading data</td></tr>';
      return;
    }
    if (result.data) {
      this.topDrivers = result.data.drivers || [];
      this.renderTopDrivers();
    }
  }

  private async loadTopCarOwners(): Promise<void> {
    const result = await adminApi.getTopCarOwners(this.currentLimit, this.currentPeriod);
    if (result.error) {
      console.error('Failed to load top car owners:', result.error);
      const tbody = document.getElementById('top-car-owners-tbody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="empty-state">Error loading data</td></tr>';
      return;
    }
    if (result.data) {
      this.topCarOwners = result.data.car_owners || [];
      this.renderTopCarOwners();
    }
  }

  private async loadTopClients(): Promise<void> {
    const result = await adminApi.getTopClients(this.currentLimit, this.currentPeriod);
    if (result.error) {
      console.error('Failed to load top clients:', result.error);
      const tbody = document.getElementById('top-clients-tbody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Error loading data</td></tr>';
      return;
    }
    if (result.data) {
      this.topClients = result.data.clients || [];
      this.renderTopClients();
    }
  }

  private renderTopDrivers(): void {
    const tbody = document.getElementById('top-drivers-tbody');
    if (!tbody) return;

    if (this.topDrivers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No data available</td></tr>';
      return;
    }

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value);
    };

    tbody.innerHTML = this.topDrivers.map((driver, index) => {
      const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
      return `
        <tr>
          <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
          <td>${driver.driver_name || 'Unknown'}</td>
          <td>${driver.email || '-'}</td>
          <td>${driver.completed_bookings || 0}</td>
          <td>${formatCurrency(driver.total_revenue || 0)}</td>
          <td>${driver.average_rating ? driver.average_rating.toFixed(1) : '-'}</td>
          <td>${driver.acceptance_rate.toFixed(1)}%</td>
          <td>${driver.total_bookings || 0}</td>
        </tr>
      `;
    }).join('');
  }

  private renderTopCarOwners(): void {
    const tbody = document.getElementById('top-car-owners-tbody');
    if (!tbody) return;

    if (this.topCarOwners.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No data available</td></tr>';
      return;
    }

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value);
    };

    tbody.innerHTML = this.topCarOwners.map((owner, index) => {
      const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
      return `
        <tr>
          <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
          <td>${owner.car_owner_name || 'Unknown'}</td>
          <td>${owner.email || '-'}</td>
          <td>${owner.completed_rentals || 0}</td>
          <td>${formatCurrency(owner.total_revenue || 0)}</td>
          <td>${owner.average_rating ? owner.average_rating.toFixed(1) : '-'}</td>
          <td>${owner.acceptance_rate.toFixed(1)}%</td>
          <td>${owner.total_rentals || 0}</td>
          <td>${owner.total_vehicles || 0}</td>
        </tr>
      `;
    }).join('');
  }

  private renderTopClients(): void {
    const tbody = document.getElementById('top-clients-tbody');
    if (!tbody) return;

    if (this.topClients.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No data available</td></tr>';
      return;
    }

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value);
    };

    tbody.innerHTML = this.topClients.map((client, index) => {
      const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
      return `
        <tr>
          <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
          <td>${client.client_name || 'Unknown'}</td>
          <td>${client.email || '-'}</td>
          <td>${client.total_bookings || 0}</td>
          <td>${formatCurrency(client.total_spending || 0)}</td>
          <td>${client.booking_frequency.toFixed(1)}/month</td>
          <td>${client.driver_bookings || 0}</td>
          <td>${client.vehicle_rentals || 0}</td>
        </tr>
      `;
    }).join('');
  }
}

