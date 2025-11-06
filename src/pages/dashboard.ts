import { Layout } from '../components/layout';
import { adminApi } from '../services/api';

export class DashboardPage {
  private layout: Layout;

  constructor() {
    this.layout = new Layout();
  }

  render(): void {
    const dashboardContent = `
      <div class="dashboard-container">
        <div class="dashboard-header">
          <h1>Dashboard</h1>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Users</div>
            <div class="stat-value" id="stat-total-users">-</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Total Drivers</div>
            <div class="stat-value" id="stat-total-drivers">-</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Total Clients</div>
            <div class="stat-value" id="stat-total-clients">-</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Total Car Owners</div>
            <div class="stat-value" id="stat-total-car-owners">-</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Total Admins</div>
            <div class="stat-value" id="stat-total-admins">-</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Pending Verifications</div>
            <div class="stat-value" id="stat-pending-verifications">-</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Verified Users</div>
            <div class="stat-value" id="stat-verified-users">-</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Rejected Users</div>
            <div class="stat-value" id="stat-rejected-users">-</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Registrations (7 days)</div>
            <div class="stat-value" id="stat-recent-7d">-</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Registrations (30 days)</div>
            <div class="stat-value" id="stat-recent-30d">-</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Active Users</div>
            <div class="stat-value" id="stat-active-users">-</div>
          </div>
        </div>

        <div class="chart-section">
          <div class="chart-header">
            <h2>User Registrations</h2>
            <div class="chart-period">
              <button class="period-btn active" data-period="7d">7 Days</button>
              <button class="period-btn" data-period="30d">30 Days</button>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="registrations-chart" width="800" height="300"></canvas>
          </div>
        </div>
      </div>
    `;

    this.layout.render(dashboardContent, '/dashboard');
    this.loadDashboardData();
    this.renderChart();
    this.attachChartListeners();
  }

  private attachChartListeners(): void {
    // Period button listeners
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        periodButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Will update chart data based on period when API is connected
        // const period = btn.getAttribute('data-period');
        this.renderChart();
      });
    });

    // Handle window resize
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this.renderChart();
      }, 250);
    });
  }

  private renderChart(): void {
    const canvas = document.getElementById('registrations-chart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 300;
    }

    // Sample data for 7 days
    const data = [12, 19, 15, 25, 22, 18, 24];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const padding = 40;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);
    const maxValue = Math.max(...data, 30);
    const stepX = chartWidth / (data.length - 1);
    const stepY = chartHeight / maxValue;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get CSS variable values
    const computedStyle = getComputedStyle(document.documentElement);
    const borderColor = computedStyle.getPropertyValue('--border-color').trim() || '#e5e7eb';
    const textPrimary = computedStyle.getPropertyValue('--text-primary').trim() || '#36454f';
    const textSecondary = computedStyle.getPropertyValue('--text-secondary').trim() || '#6b7280';
    const brandColor = computedStyle.getPropertyValue('--brand-color').trim() || '#0A1D37';

    // Draw grid lines
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = textPrimary;
    ctx.lineWidth = 2;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw line
    ctx.strokeStyle = brandColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((value, index) => {
      const x = padding + (stepX * index);
      const y = canvas.height - padding - (value * stepY);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = brandColor;
    data.forEach((value, index) => {
      const x = padding + (stepX * index);
      const y = canvas.height - padding - (value * stepY);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = textSecondary;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    labels.forEach((label, index) => {
      const x = padding + (stepX * index);
      ctx.fillText(label, x, canvas.height - padding + 20);
    });

    // Draw Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxValue / 5) * (5 - i));
      const y = padding + (chartHeight / 5) * i;
      ctx.fillText(value.toString(), padding - 10, y + 4);
    }
  }

  private async loadDashboardData(): Promise<void> {
    const result = await adminApi.getDashboard();
    
    if (result.error) {
      console.error('Failed to load dashboard data:', result.error);
      // Show error or use default values
      const defaultData = {
        total_users: 0,
        total_drivers: 0,
        total_clients: 0,
        total_car_owners: 0,
        total_admins: 0,
        pending_verifications: 0,
        verified_users: 0,
        rejected_users: 0,
        recent_registrations_7d: 0,
        recent_registrations_30d: 0,
        active_users: 0
      };
      this.updateStats(defaultData);
      return;
    }

    if (result.data) {
      this.updateStats(result.data);
    }
    
    // Re-render chart after a short delay to ensure canvas is ready
    setTimeout(() => {
      this.renderChart();
    }, 100);
  }

  private updateStats(data: any): void {
    const setStat = (id: string, value: number) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value.toLocaleString();
      }
    };

    setStat('stat-total-users', data.total_users);
    setStat('stat-total-drivers', data.total_drivers);
    setStat('stat-total-clients', data.total_clients);
    setStat('stat-total-car-owners', data.total_car_owners);
    setStat('stat-total-admins', data.total_admins);
    setStat('stat-pending-verifications', data.pending_verifications);
    setStat('stat-verified-users', data.verified_users);
    setStat('stat-rejected-users', data.rejected_users);
    setStat('stat-recent-7d', data.recent_registrations_7d);
    setStat('stat-recent-30d', data.recent_registrations_30d);
    setStat('stat-active-users', data.active_users);
  }
}

