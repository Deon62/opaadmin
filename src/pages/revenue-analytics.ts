import { Layout } from '../components/layout';
import { adminApi } from '../services/api';

export class RevenueAnalyticsPage {
  private layout: Layout;
  private currentPeriod: string = '7d';
  private revenueData: any = null;
  private dailyData: any[] = [];
  private breakdownData: any = null;
  private commissionData: any = null;

  constructor() {
    this.layout = new Layout();
  }

  render(): void {
    const revenueContent = `
      <div class="analytics-container">
        <div class="analytics-header">
          <h1>Revenue Analytics</h1>
        </div>

        <!-- Overview Cards -->
        <div class="analytics-cards-grid">
          <div class="analytics-card">
            <div class="analytics-card-label">Total Revenue</div>
            <div class="analytics-card-value" id="total-revenue">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Revenue (7d)</div>
            <div class="analytics-card-value" id="revenue-7d">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Revenue (30d)</div>
            <div class="analytics-card-value" id="revenue-30d">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Revenue (90d)</div>
            <div class="analytics-card-value" id="revenue-90d">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Revenue (1y)</div>
            <div class="analytics-card-value" id="revenue-1y">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Avg Booking Value</div>
            <div class="analytics-card-value" id="avg-booking-value">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Avg Rental Value</div>
            <div class="analytics-card-value" id="avg-rental-value">-</div>
          </div>
        </div>

        <!-- Commission Overview Section -->
        <div class="analytics-section">
          <div class="section-header">
            <h2>Commission Overview (Drivers + Car Owners)</h2>
            <a href="/analytics/commissions" class="btn-link">View Details →</a>
          </div>
          <div class="analytics-cards-grid">
            <div class="analytics-card">
              <div class="analytics-card-label">Total Commission Earned</div>
              <div class="analytics-card-value" id="total-commission">-</div>
            </div>
            <div class="analytics-card">
              <div class="analytics-card-label">Net Revenue</div>
              <div class="analytics-card-value" id="net-revenue">-</div>
              <div class="analytics-card-subtitle">(After Commission)</div>
            </div>
            <div class="analytics-card">
              <div class="analytics-card-label">Pending Commissions</div>
              <div class="analytics-card-value" id="pending-commissions">-</div>
              <div class="analytics-card-subtitle" id="pending-count">-</div>
            </div>
            <div class="analytics-card">
              <div class="analytics-card-label">Paid Commissions</div>
              <div class="analytics-card-value" id="paid-commissions">-</div>
              <div class="analytics-card-subtitle" id="paid-count">-</div>
            </div>
            <div class="analytics-card card-warning">
              <div class="analytics-card-label">Defaulted Commissions</div>
              <div class="analytics-card-value" id="defaulted-commissions">-</div>
              <div class="analytics-card-subtitle" id="defaulted-count">-</div>
            </div>
            <div class="analytics-card">
              <div class="analytics-card-label">Average Commission</div>
              <div class="analytics-card-value" id="avg-commission">-</div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="analytics-charts-row">
          <!-- Pie Charts -->
          <div class="analytics-chart-box">
            <div class="chart-title">Revenue by Type</div>
            <div class="chart-container-small">
              <canvas id="revenue-type-chart" width="200" height="200"></canvas>
            </div>
          </div>
          <div class="analytics-chart-box">
            <div class="chart-title">Revenue by Status</div>
            <div class="chart-container-small">
              <canvas id="revenue-status-chart" width="200" height="200"></canvas>
            </div>
          </div>
          <!-- Daily Revenue Line Chart -->
          <div class="analytics-chart-box chart-box-large">
            <div class="chart-header-small">
              <div class="chart-title">Daily Revenue</div>
              <div class="chart-period">
                <button class="period-btn active" data-period="7d">7 Days</button>
                <button class="period-btn" data-period="30d">30 Days</button>
              </div>
            </div>
            <div class="chart-container-small">
              <canvas id="daily-revenue-chart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>

        <!-- Breakdown Section -->
        <div class="analytics-breakdown-section">
          <div class="breakdown-chart-box">
            <div class="chart-title">Revenue by Status</div>
            <div class="chart-container-small">
              <canvas id="breakdown-status-chart" width="300" height="200"></canvas>
            </div>
          </div>
          <div class="breakdown-chart-box">
            <div class="chart-title">Revenue by Payment Method</div>
            <div class="chart-container-small">
              <canvas id="breakdown-payment-chart" width="300" height="200"></canvas>
            </div>
          </div>
          <div class="breakdown-chart-box chart-box-large">
            <div class="chart-title">Revenue by Month</div>
            <div class="chart-container-small">
              <canvas id="breakdown-month-chart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    this.layout.render(revenueContent, '/analytics/revenue');
    this.loadData();
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const periodButtons = document.querySelectorAll('.period-btn');
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

    window.addEventListener('resize', () => {
      setTimeout(() => {
        this.renderAllCharts();
      }, 250);
    });
  }

  private async loadData(): Promise<void> {
    await Promise.all([
      this.loadRevenueData(),
      this.loadDailyData(),
      this.loadBreakdownData(),
      this.loadCommissionData()
    ]);
  }

  private async loadRevenueData(): Promise<void> {
    const result = await adminApi.getRevenueAnalytics();
    if (result.error) {
      console.error('Failed to load revenue data:', result.error);
      return;
    }
    if (result.data) {
      this.revenueData = result.data;
      this.updateRevenueCards();
      this.renderPieCharts();
    }
  }

  private async loadDailyData(): Promise<void> {
    const result = await adminApi.getDailyRevenue(this.currentPeriod);
    if (result.error) {
      console.error('Failed to load daily revenue:', result.error);
      return;
    }
    if (result.data) {
      this.dailyData = result.data.data || [];
      this.renderDailyChart();
    }
  }

  private async loadBreakdownData(): Promise<void> {
    const result = await adminApi.getRevenueBreakdown();
    if (result.error) {
      console.error('Failed to load breakdown data:', result.error);
      return;
    }
    if (result.data) {
      this.breakdownData = result.data;
      this.renderBreakdownCharts();
    }
  }

  private async loadCommissionData(): Promise<void> {
    const result = await adminApi.getCommissionAnalytics();
    if (result.error) {
      console.error('Failed to load commission data:', result.error);
      return;
    }
    if (result.data) {
      this.commissionData = result.data;
      this.updateCommissionCards();
    }
  }

  private updateRevenueCards(): void {
    if (!this.revenueData) return;

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value);
    };

    const setValue = (id: string, value: number) => {
      const el = document.getElementById(id);
      if (el) el.textContent = formatCurrency(value);
    };

    setValue('total-revenue', this.revenueData.total_revenue || 0);
    setValue('revenue-7d', this.revenueData.revenue_7d || 0);
    setValue('revenue-30d', this.revenueData.revenue_30d || 0);
    setValue('revenue-90d', this.revenueData.revenue_90d || 0);
    setValue('revenue-1y', this.revenueData.revenue_1y || 0);
    setValue('avg-booking-value', this.revenueData.average_booking_value || 0);
    setValue('avg-rental-value', this.revenueData.average_rental_value || 0);
  }

  private updateCommissionCards(): void {
    if (!this.commissionData) return;

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value);
    };

    const setValue = (id: string, value: number | string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = typeof value === 'number' ? formatCurrency(value) : value;
    };

    setValue('total-commission', this.commissionData.total_commission_earned || 0);
    setValue('net-revenue', (this.revenueData?.total_revenue || 0) - (this.commissionData.total_commission_earned || 0));
    setValue('pending-commissions', this.commissionData.total_pending_commissions || 0);
    setValue('paid-commissions', this.commissionData.total_paid_commissions || 0);
    setValue('defaulted-commissions', this.commissionData.total_defaulted_commissions || 0);
    setValue('avg-commission', this.commissionData.average_commission || 0);
    
    // Update counts
    setValue('pending-count', `${this.commissionData.pending_commissions_count || 0} pending`);
    setValue('paid-count', `${this.commissionData.paid_commissions_count || 0} paid`);
    setValue('defaulted-count', `${this.commissionData.defaulted_commissions_count || 0} defaulted`);
  }

  private renderPieCharts(): void {
    if (!this.revenueData) return;

    // Revenue by Type
    this.renderPieChart('revenue-type-chart', [
      { label: 'Driver Bookings', value: this.revenueData.revenue_by_type?.driver_bookings || 0, color: '#0A1D37' },
      { label: 'Vehicle Rentals', value: this.revenueData.revenue_by_type?.vehicle_rentals || 0, color: '#14B8A6' }
    ]);

    // Revenue by Status
    this.renderPieChart('revenue-status-chart', [
      { label: 'Completed', value: this.revenueData.revenue_by_status?.completed || 0, color: '#14B8A6' },
      { label: 'Payment Confirmed', value: this.revenueData.revenue_by_status?.payment_confirmed || 0, color: '#0A1D37' }
    ]);
  }

  private renderDailyChart(): void {
    const canvas = document.getElementById('daily-revenue-chart') as HTMLCanvasElement;
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

    const driverData = this.dailyData.map(d => d.driver_bookings || 0);
    const vehicleData = this.dailyData.map(d => d.vehicle_rentals || 0);

    drawLine(driverData, '#0A1D37');
    drawLine(vehicleData, '#14B8A6');

    // Labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    this.dailyData.forEach((d, index) => {
      const x = padding + (stepX * index);
      ctx.fillText(d.date || '', x, canvas.height - padding + 15);
    });
  }

  private renderBreakdownCharts(): void {
    if (!this.breakdownData) return;

    // Revenue by Status (Bar Chart)
    const statusData = this.breakdownData.revenue_by_status || {};
    this.renderBarChart('breakdown-status-chart', [
      { label: 'Pending', value: statusData.pending || 0, color: '#F59E0B' },
      { label: 'Accepted', value: statusData.accepted || 0, color: '#14B8A6' },
      { label: 'Payment Pending', value: statusData.payment_pending || 0, color: '#F59E0B' },
      { label: 'Payment Confirmed', value: statusData.payment_confirmed || 0, color: '#14B8A6' },
      { label: 'Completed', value: statusData.completed || 0, color: '#14B8A6' },
      { label: 'Cancelled', value: statusData.cancelled || 0, color: '#EF4444' },
      { label: 'Rejected', value: statusData.rejected || 0, color: '#EF4444' }
    ]);

    // Revenue by Payment Method (Bar Chart)
    const paymentData = this.breakdownData.revenue_by_payment_method || {};
    this.renderBarChart('breakdown-payment-chart', [
      { label: 'Direct Payment', value: paymentData.direct_payment || 0, color: '#0A1D37' },
      { label: 'Cash', value: paymentData.cash || 0, color: '#14B8A6' },
      { label: 'System Payment', value: paymentData.system_payment || 0, color: '#F59E0B' }
    ]);

    // Revenue by Month (Line Chart)
    const monthData = this.breakdownData.revenue_by_month || [];
    if (monthData.length > 0) {
      this.renderLineChart('breakdown-month-chart', monthData.map((m: any) => m.total || 0), monthData.map((m: any) => m.month || ''));
    }
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

    data.forEach((item, index) => {
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
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${((item.value / total) * 100).toFixed(1)}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });
  }

  private renderBarChart(canvasId: string, data: { label: string; value: number; color: string }[]): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 180;
    }

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const barWidth = (canvas.width - 60) / data.length;
    const chartHeight = canvas.height - 50;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = 30 + (index * barWidth);
      const y = canvas.height - 30 - barHeight;

      ctx.fillStyle = item.color;
      ctx.fillRect(x, y, barWidth - 4, barHeight);

      // Label
      ctx.fillStyle = '#6b7280';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(x + barWidth / 2, canvas.height - 10);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(item.label, 0, 0);
      ctx.restore();
    });
  }

  private renderLineChart(canvasId: string, data: number[], labels: string[]): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas || data.length === 0) return;

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
    const maxValue = Math.max(...data, 1);
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

    // Line
    ctx.strokeStyle = '#14B8A6';
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

    // Labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, index) => {
      const x = padding + (stepX * index);
      ctx.fillText(label, x, canvas.height - padding + 15);
    });
  }

  private renderAllCharts(): void {
    this.renderPieCharts();
    this.renderDailyChart();
    this.renderBreakdownCharts();
  }
}

