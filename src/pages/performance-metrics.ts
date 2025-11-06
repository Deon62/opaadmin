import { Layout } from '../components/layout';
import { adminApi } from '../services/api';

export class PerformanceMetricsPage {
  private layout: Layout;
  private tractionData: any = null;
  private conversionData: any = null;

  constructor() {
    this.layout = new Layout();
  }

  render(): void {
    const performanceContent = `
      <div class="analytics-container">
        <div class="analytics-header">
          <h1>Performance Metrics</h1>
        </div>

        <!-- Traction Overview Cards -->
        <div class="analytics-cards-grid">
          <div class="analytics-card">
            <div class="analytics-card-label">Total Bookings Created</div>
            <div class="analytics-card-value" id="total-created">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Total Bookings Completed</div>
            <div class="analytics-card-value growth" id="total-completed">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Total Revenue Generated</div>
            <div class="analytics-card-value growth" id="total-revenue">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Active Bookings</div>
            <div class="analytics-card-value" id="active-bookings">-</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-card-label">Average Booking Value</div>
            <div class="analytics-card-value" id="avg-value">-</div>
          </div>
        </div>

        <!-- Conversion Rates -->
        <div class="analytics-charts-row">
          <div class="analytics-chart-box">
            <div class="chart-title">Booking Conversion Rate</div>
            <div class="chart-container-small">
              <canvas id="conversion-chart" width="200" height="200"></canvas>
            </div>
          </div>
          <div class="analytics-chart-box">
            <div class="chart-title">Payment Confirmation Rate</div>
            <div class="chart-container-small">
              <canvas id="payment-confirmation-chart" width="200" height="200"></canvas>
            </div>
          </div>
          <div class="analytics-chart-box">
            <div class="chart-title">Cancellation Rate</div>
            <div class="chart-container-small">
              <canvas id="cancellation-chart" width="200" height="200"></canvas>
            </div>
          </div>
        </div>

        <!-- Popular Service Types & Peak Times -->
        <div class="analytics-charts-row">
          <div class="analytics-chart-box chart-box-large">
            <div class="chart-title">Most Popular Service Types</div>
            <div class="chart-container-small">
              <canvas id="service-types-chart" width="400" height="200"></canvas>
            </div>
          </div>
          <div class="analytics-chart-box">
            <div class="chart-title">Peak Booking Times (Hour)</div>
            <div class="chart-container-small">
              <canvas id="peak-hours-chart" width="200" height="200"></canvas>
            </div>
          </div>
        </div>

        <!-- Peak Days -->
        <div class="analytics-chart-box">
          <div class="chart-title">Peak Booking Times (Day of Week)</div>
          <div class="chart-container-small">
            <canvas id="peak-days-chart" width="800" height="200"></canvas>
          </div>
        </div>
      </div>
    `;

    this.layout.render(performanceContent, '/analytics/performance');
    this.loadData();
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    window.addEventListener('resize', () => {
      setTimeout(() => {
        this.renderAllCharts();
      }, 250);
    });
  }

  private async loadData(): Promise<void> {
    await Promise.all([
      this.loadTractionData(),
      this.loadConversionData()
    ]);
  }

  private async loadTractionData(): Promise<void> {
    const result = await adminApi.getTractionMetrics();
    if (result.error) {
      console.error('Failed to load traction data:', result.error);
      return;
    }
    if (result.data) {
      this.tractionData = result.data;
      this.updateTractionCards();
      this.renderTractionCharts();
    }
  }

  private async loadConversionData(): Promise<void> {
    const result = await adminApi.getConversionRates();
    if (result.error) {
      console.error('Failed to load conversion data:', result.error);
      return;
    }
    if (result.data) {
      this.conversionData = result.data;
      this.renderConversionCharts();
    }
  }

  private updateTractionCards(): void {
    if (!this.tractionData) return;

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value);
    };

    const setValue = (id: string, value: number | string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value.toString();
    };

    setValue('total-created', this.tractionData.total_bookings_created || 0);
    setValue('total-completed', this.tractionData.total_bookings_completed || 0);
    setValue('total-revenue', formatCurrency(this.tractionData.total_revenue_generated || 0));
    setValue('active-bookings', this.tractionData.active_bookings || 0);
    setValue('avg-value', formatCurrency(this.tractionData.average_booking_value || 0));
  }

  private renderTractionCharts(): void {
    if (!this.tractionData) return;

    // Popular Service Types
    const services = this.tractionData.most_popular_service_types || [];
    if (services.length > 0) {
      this.renderBarChart('service-types-chart', services.map((s: any) => ({
        label: s.service_type || 'Unknown',
        value: s.count || 0,
        color: '#14B8A6'
      })));
    }

    // Peak Hours
    const peakHours = this.tractionData.peak_booking_times?.by_hour || [];
    if (peakHours.length > 0) {
      this.renderBarChart('peak-hours-chart', peakHours.map((p: any) => ({
        label: `${p.hour}:00`,
        value: p.count || 0,
        color: '#0A1D37'
      })));
    }

    // Peak Days
    const peakDays = this.tractionData.peak_booking_times?.by_day_of_week || [];
    if (peakDays.length > 0) {
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      this.renderBarChart('peak-days-chart', peakDays.map((p: any, index: number) => ({
        label: dayNames[index] || '',
        value: p.count || 0,
        color: '#14B8A6'
      })));
    }
  }

  private renderConversionCharts(): void {
    if (!this.conversionData) return;

    // Booking Conversion Rate
    const conversionRate = this.conversionData.booking_conversion_rate || 0;
    this.renderPieChart('conversion-chart', [
      { label: 'Converted', value: conversionRate, color: '#14B8A6' },
      { label: 'Not Converted', value: 100 - conversionRate, color: '#EF4444' }
    ]);

    // Payment Confirmation Rate
    const paymentRate = this.conversionData.payment_confirmation_rate || 0;
    this.renderPieChart('payment-confirmation-chart', [
      { label: 'Confirmed', value: paymentRate, color: '#14B8A6' },
      { label: 'Not Confirmed', value: 100 - paymentRate, color: '#F59E0B' }
    ]);

    // Cancellation Rate
    const cancellationRate = this.conversionData.cancellation_rate_by_type?.driver_bookings || 0;
    this.renderPieChart('cancellation-chart', [
      { label: 'Cancelled', value: cancellationRate, color: '#EF4444' },
      { label: 'Not Cancelled', value: 100 - cancellationRate, color: '#14B8A6' }
    ]);
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

    const total = 100;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 20;

    let currentAngle = -Math.PI / 2;

    data.forEach((item) => {
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
      ctx.fillText(`${item.value.toFixed(1)}%`, labelX, labelY);

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

  private renderAllCharts(): void {
    this.renderTractionCharts();
    this.renderConversionCharts();
  }
}

