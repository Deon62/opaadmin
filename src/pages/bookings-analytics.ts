import { Layout } from '../components/layout';
import { adminApi } from '../services/api';

export class BookingsAnalyticsPage {
  private layout: Layout;
  private currentPeriod: string = '7d';
  private currentType: string = 'all';
  private bookingData: any = null;
  private dailyData: any[] = [];
  private comparisonData: any = null;

  constructor() {
    this.layout = new Layout();
  }

  render(): void {
    const bookingsContent = `
      <div class="analytics-container">
        <div class="analytics-header">
          <h1>Bookings Analytics</h1>
        </div>

        <!-- Overview Cards -->
        <div class="analytics-cards-grid">
          <div class="analytics-card">
            <div class="analytics-card-label">Total Bookings</div>
            <div class="analytics-card-value" id="total-bookings">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Bookings (7d)</div>
            <div class="analytics-card-value" id="bookings-7d">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Bookings (30d)</div>
            <div class="analytics-card-value" id="bookings-30d">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Bookings (90d)</div>
            <div class="analytics-card-value" id="bookings-90d">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Bookings (1y)</div>
            <div class="analytics-card-value" id="bookings-1y">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Avg Duration</div>
            <div class="analytics-card-value" id="avg-duration">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Conversion Rate</div>
            <div class="analytics-card-value growth" id="conversion-rate">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Cancellation Rate</div>
            <div class="analytics-card-value negative" id="cancellation-rate">-</div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="analytics-charts-row">
          <!-- Pie Charts -->
          <div class="analytics-chart-box">
            <div class="chart-title">Bookings by Type</div>
            <div class="chart-container-small">
              <canvas id="bookings-type-chart" width="200" height="200"></canvas>
            </div>
          </div>
          <div class="analytics-chart-box">
            <div class="chart-title">Bookings by Status</div>
            <div class="chart-container-small">
              <canvas id="bookings-status-chart" width="200" height="200"></canvas>
            </div>
          </div>
          <!-- Daily Bookings Line Chart -->
          <div class="analytics-chart-box chart-box-large">
            <div class="chart-header-small">
              <div class="chart-title">Daily Bookings</div>
              <div class="chart-period">
                <button class="period-btn active" data-period="7d">7 Days</button>
                <button class="period-btn" data-period="30d">30 Days</button>
              </div>
            </div>
            <div class="chart-period" style="margin-bottom: 0.5rem;">
              <select id="type-filter" class="filter-select" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                <option value="all">All Types</option>
                <option value="driver">Driver</option>
                <option value="vehicle">Vehicle</option>
              </select>
            </div>
            <div class="chart-container-small">
              <canvas id="daily-bookings-chart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>

        <!-- Comparison Chart -->
        <div class="analytics-chart-box" style="margin-top: 1rem;">
          <div class="chart-header-small">
            <div class="chart-title">Booking Comparison (Driver vs Vehicle)</div>
            <div class="chart-period">
              <button class="period-btn active" data-period-compare="7d">7 Days</button>
              <button class="period-btn" data-period-compare="30d">30 Days</button>
            </div>
          </div>
          <div class="chart-container-small">
            <canvas id="comparison-chart" width="800" height="200"></canvas>
          </div>
        </div>
      </div>
    `;

    this.layout.render(bookingsContent, '/analytics/bookings');
    this.loadData();
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const periodButtons = document.querySelectorAll('.period-btn[data-period]');
    periodButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        periodButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const period = btn.getAttribute('data-period') || '7d';
        this.currentPeriod = period;
        await this.loadDailyData();
        this.renderDailyChart();
      });
    });

    const compareButtons = document.querySelectorAll('.period-btn[data-period-compare]');
    compareButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        compareButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const period = btn.getAttribute('data-period-compare') || '7d';
        await this.loadComparisonData(period);
        this.renderComparisonChart();
      });
    });

    const typeFilter = document.getElementById('type-filter') as HTMLSelectElement;
    if (typeFilter) {
      typeFilter.addEventListener('change', async (e) => {
        this.currentType = (e.target as HTMLSelectElement).value;
        await this.loadDailyData();
        this.renderDailyChart();
      });
    }

    window.addEventListener('resize', () => {
      setTimeout(() => {
        this.renderAllCharts();
      }, 250);
    });
  }

  private async loadData(): Promise<void> {
    await Promise.all([
      this.loadBookingData(),
      this.loadDailyData(),
      this.loadComparisonData(this.currentPeriod)
    ]);
  }

  private async loadBookingData(): Promise<void> {
    const result = await adminApi.getBookingAnalytics();
    if (result.error) {
      console.error('Failed to load booking data:', result.error);
      return;
    }
    if (result.data) {
      this.bookingData = result.data;
      this.updateBookingCards();
      this.renderPieCharts();
    }
  }

  private async loadDailyData(): Promise<void> {
    const result = await adminApi.getDailyBookings(this.currentPeriod, this.currentType);
    if (result.error) {
      console.error('Failed to load daily bookings:', result.error);
      return;
    }
    if (result.data) {
      this.dailyData = result.data.data || [];
      this.renderDailyChart();
    }
  }

  private async loadComparisonData(period: string): Promise<void> {
    const result = await adminApi.getBookingComparison(period);
    if (result.error) {
      console.error('Failed to load comparison data:', result.error);
      return;
    }
    if (result.data) {
      this.comparisonData = result.data;
      this.renderComparisonChart();
    }
  }

  private updateBookingCards(): void {
    if (!this.bookingData) return;

    const setValue = (id: string, value: number | string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value.toString();
    };

    setValue('total-bookings', this.bookingData.total_bookings || 0);
    setValue('bookings-7d', this.bookingData.bookings_by_period?.bookings_7d || 0);
    setValue('bookings-30d', this.bookingData.bookings_by_period?.bookings_30d || 0);
    setValue('bookings-90d', this.bookingData.bookings_by_period?.bookings_90d || 0);
    setValue('bookings-1y', this.bookingData.bookings_by_period?.bookings_1y || 0);
    setValue('avg-duration', `${(this.bookingData.average_booking_duration || 0).toFixed(1)} days`);
    setValue('conversion-rate', `${(this.bookingData.conversion_rate || 0).toFixed(1)}%`);
    setValue('cancellation-rate', `${(this.bookingData.cancellation_rate || 0).toFixed(1)}%`);
  }

  private renderPieCharts(): void {
    if (!this.bookingData) return;

    // Bookings by Type
    this.renderPieChart('bookings-type-chart', [
      { label: 'Driver', value: this.bookingData.bookings_by_type?.driver_bookings || 0, color: '#0A1D37' },
      { label: 'Vehicle', value: this.bookingData.bookings_by_type?.vehicle_rentals || 0, color: '#14B8A6' }
    ]);

    // Bookings by Status
    const statusData = this.bookingData.bookings_by_status || {};
    this.renderPieChart('bookings-status-chart', [
      { label: 'Pending', value: statusData.pending || 0, color: '#F59E0B' },
      { label: 'Accepted', value: statusData.accepted || 0, color: '#14B8A6' },
      { label: 'Payment Pending', value: statusData.payment_pending || 0, color: '#F59E0B' },
      { label: 'Payment Confirmed', value: statusData.payment_confirmed || 0, color: '#14B8A6' },
      { label: 'In Progress/Active', value: (statusData.in_progress || 0) + (statusData.active || 0), color: '#0A1D37' },
      { label: 'Completed', value: statusData.completed || 0, color: '#14B8A6' },
      { label: 'Cancelled', value: statusData.cancelled || 0, color: '#EF4444' },
      { label: 'Rejected', value: statusData.rejected || 0, color: '#EF4444' }
    ]);
  }

  private renderDailyChart(): void {
    const canvas = document.getElementById('daily-bookings-chart') as HTMLCanvasElement;
    if (!canvas || this.dailyData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 180;
    }

    const padding = 30;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);
    const maxValue = Math.max(...this.dailyData.map(d => Math.max(d.driver_bookings || 0, d.vehicle_rentals || 0, d.total || 0)), 1);
    const stepX = chartWidth / (this.dailyData.length - 1 || 1);
    const stepY = chartHeight / maxValue;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw lines
    const drawLine = (data: number[], color: string) => {
      ctx.strokeStyle = color;
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
    };

    if (this.currentType === 'all') {
      const driverData = this.dailyData.map(d => d.driver_bookings || 0);
      const vehicleData = this.dailyData.map(d => d.vehicle_rentals || 0);
      drawLine(driverData, '#0A1D37');
      drawLine(vehicleData, '#14B8A6');
    } else {
      const data = this.dailyData.map(d => d.total || 0);
      drawLine(data, this.currentType === 'driver' ? '#0A1D37' : '#14B8A6');
    }

    // Labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    this.dailyData.forEach((d, index) => {
      const x = padding + (stepX * index);
      ctx.fillText(d.date || '', x, canvas.height - padding + 15);
    });
  }

  private renderComparisonChart(): void {
    const canvas = document.getElementById('comparison-chart') as HTMLCanvasElement;
    if (!canvas || !this.comparisonData || !this.comparisonData.daily_data) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 180;
    }

    const data = this.comparisonData.daily_data || [];
    const padding = 30;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);
    const maxValue = Math.max(...data.map((d: any) => Math.max(d.driver_bookings || 0, d.vehicle_rentals || 0)), 1);
    const stepX = chartWidth / (data.length - 1 || 1);
    const stepY = chartHeight / maxValue;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw lines
    const driverData = data.map((d: any) => d.driver_bookings || 0);
    const vehicleData = data.map((d: any) => d.vehicle_rentals || 0);

    ctx.strokeStyle = '#0A1D37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    driverData.forEach((value: number, index: number) => {
      const x = padding + (stepX * index);
      const y = canvas.height - padding - (value * stepY);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.strokeStyle = '#14B8A6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    vehicleData.forEach((value: number, index: number) => {
      const x = padding + (stepX * index);
      const y = canvas.height - padding - (value * stepY);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    data.forEach((d: any, index: number) => {
      const x = padding + (stepX * index);
      ctx.fillText(d.date || '', x, canvas.height - padding + 15);
    });
  }

  private renderPieChart(canvasId: string, data: { label: string; value: number; color: string }[]): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 180;
    }

    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data', canvas.width / 2, canvas.height / 2);
      return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 20;

    let currentAngle = -Math.PI / 2;

    data.forEach((item) => {
      if (item.value === 0) return;
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      // Label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${((item.value / total) * 100).toFixed(1)}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });
  }

  private renderAllCharts(): void {
    this.renderPieCharts();
    this.renderDailyChart();
    this.renderComparisonChart();
  }
}

