import { Layout } from '../components/layout';
import { Router } from '../router';

interface VehicleDetail {
  id: number;
  car_owner_id: number;
  owner_email: string;
  owner_name: string;
  make: string;
  model: string;
  year: number;
  plate_number: string;
  color: string;
  vehicle_type: string | null;
  seating_capacity: number;
  fuel_type: string | null;
  transmission: string | null;
  mileage: number;
  vin_number: string | null;
  engine_capacity: string | null;
  description: string | null;
  registration_document_url: string | null;
  insurance_document_url: string | null;
  insurance_expiry_date: string | null;
  registration_expiry_date: string | null;
  documents_verification_status: string | null;
  listing_status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export class VehicleDetailPage {
  private layout: Layout;
  private router: Router;
  private vehicleId: number;
  private carOwnerId: number = 0;

  constructor(vehicleId: number) {
    this.layout = new Layout();
    this.router = Router.getInstance();
    this.vehicleId = vehicleId;
  }

  render(): void {
    const vehicleDetailContent = `
      <div class="page-container">
        <div class="page-header">
          <div>
            <button class="btn-back" id="back-btn">← Back to Vehicles</button>
            <h1>Vehicle Details</h1>
          </div>
        </div>

        <div id="loading-state" class="loading-container">
          <div class="loading-state">Loading vehicle information...</div>
        </div>

        <div id="vehicle-content" style="display: none;">
          <div class="detail-grid">
            <div class="detail-section">
              <div class="section-header">
                <h2>Basic Information</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <label>Make</label>
                  <div id="vehicle-make">-</div>
                </div>
                <div class="info-item">
                  <label>Model</label>
                  <div id="vehicle-model">-</div>
                </div>
                <div class="info-item">
                  <label>Year</label>
                  <div id="vehicle-year">-</div>
                </div>
                <div class="info-item">
                  <label>Plate Number</label>
                  <div id="vehicle-plate">-</div>
                </div>
                <div class="info-item">
                  <label>Color</label>
                  <div id="vehicle-color">-</div>
                </div>
                <div class="info-item">
                  <label>Vehicle Type</label>
                  <div id="vehicle-type">-</div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-header">
                <h2>Technical Specifications</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <label>Seating Capacity</label>
                  <div id="vehicle-seating">-</div>
                </div>
                <div class="info-item">
                  <label>Fuel Type</label>
                  <div id="vehicle-fuel">-</div>
                </div>
                <div class="info-item">
                  <label>Transmission</label>
                  <div id="vehicle-transmission">-</div>
                </div>
                <div class="info-item">
                  <label>Mileage</label>
                  <div id="vehicle-mileage">-</div>
                </div>
                <div class="info-item">
                  <label>VIN Number</label>
                  <div id="vehicle-vin">-</div>
                </div>
                <div class="info-item">
                  <label>Engine Capacity</label>
                  <div id="vehicle-engine">-</div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-header">
                <h2>Owner Information</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <label>Owner Name</label>
                  <div id="vehicle-owner-name">-</div>
                </div>
                <div class="info-item">
                  <label>Owner Email</label>
                  <div id="vehicle-owner-email">-</div>
                </div>
                <div class="info-item">
                  <label>Owner ID</label>
                  <div id="vehicle-owner-id">-</div>
                </div>
                <div class="info-item">
                  <label>View Owner Profile</label>
                  <div>
                    <button class="btn-link" id="view-owner-btn">View Car Owner</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-header">
                <h2>Status Information</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <label>Verification Status</label>
                  <div id="verification-status-badge"></div>
                </div>
                <div class="info-item">
                  <label>Listing Status</label>
                  <div id="listing-status-badge"></div>
                </div>
                <div class="info-item">
                  <label>Created At</label>
                  <div id="vehicle-created">-</div>
                </div>
                <div class="info-item">
                  <label>Last Updated</label>
                  <div id="vehicle-updated">-</div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-header">
                <h2>Description</h2>
              </div>
              <div id="vehicle-description" class="description-text">-</div>
            </div>

            <div class="detail-section documents-section">
              <div class="section-header">
                <h2>Documents</h2>
              </div>
              <div class="documents-grid">
                <div class="document-item" id="registration-document-item">
                  <div class="document-label">Registration Document</div>
                  <div class="document-preview" id="registration-document-preview">
                    <div class="no-document">No document uploaded</div>
                  </div>
                  <div class="document-expiry" id="registration-expiry">
                    <label>Expiry Date:</label>
                    <span id="registration-expiry-date">-</span>
                  </div>
                </div>
                <div class="document-item" id="insurance-document-item">
                  <div class="document-label">Insurance Document</div>
                  <div class="document-preview" id="insurance-document-preview">
                    <div class="no-document">No document uploaded</div>
                  </div>
                  <div class="document-expiry" id="insurance-expiry">
                    <label>Expiry Date:</label>
                    <span id="insurance-expiry-date">-</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-section verification-section">
              <div class="section-header">
                <h2>Document Verification Action</h2>
              </div>
              <form id="verification-form" class="verification-form">
                <div class="form-group">
                  <label for="verification-status">Verification Status</label>
                  <select id="verification-status" class="form-select" required>
                    <option value="">Select status</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                    <option value="under_review">Under Review</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="verification-notes">Notes (Optional)</label>
                  <textarea 
                    id="verification-notes" 
                    class="form-textarea" 
                    rows="4" 
                    placeholder="Add notes or comments about document verification..."
                    maxlength="500"
                  ></textarea>
                  <div class="char-count"><span id="char-count">0</span>/500</div>
                </div>
                <div id="verification-error" class="error-message" style="display: none;"></div>
                <div id="verification-success" class="success-message" style="display: none;"></div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary">Submit Verification</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    this.layout.render(vehicleDetailContent, '/vehicles');
    this.attachEventListeners();
    this.loadVehicleDetail();
  }

  private attachEventListeners(): void {
    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.router.navigate('/vehicles');
      });
    }

    // Character count for notes
    const notesTextarea = document.getElementById('verification-notes') as HTMLTextAreaElement;
    const charCount = document.getElementById('char-count');
    if (notesTextarea && charCount) {
      notesTextarea.addEventListener('input', () => {
        charCount.textContent = notesTextarea.value.length.toString();
      });
    }

    // Verification form
    const verificationForm = document.getElementById('verification-form') as HTMLFormElement;
    if (verificationForm) {
      verificationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleVerification();
      });
    }

    // View owner button
    const viewOwnerBtn = document.getElementById('view-owner-btn');
    if (viewOwnerBtn) {
      viewOwnerBtn.addEventListener('click', () => {
        if (this.carOwnerId > 0) {
          this.router.navigate(`/car-owners/${this.carOwnerId}`);
        }
      });
    }
  }

  private loadVehicleDetail(): void {
    // Mock data - will be replaced with API call
    const mockVehicle: VehicleDetail = {
      id: this.vehicleId,
      car_owner_id: 1,
      owner_email: 'owner1@example.com',
      owner_name: 'Michael Johnson',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      plate_number: 'ABC-1234',
      color: 'White',
      vehicle_type: 'Sedan',
      seating_capacity: 5,
      fuel_type: 'Petrol',
      transmission: 'Automatic',
      mileage: 45000,
      vin_number: '1HGBH41JXMN109186',
      engine_capacity: '2.5L',
      description: 'Well-maintained vehicle in excellent condition. Regular service history available.',
      registration_document_url: 'https://example.com/registration.jpg',
      insurance_document_url: 'https://example.com/insurance.jpg',
      insurance_expiry_date: '2025-06-30',
      registration_expiry_date: '2025-12-31',
      documents_verification_status: 'pending',
      listing_status: 'not_ready',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:20:00Z'
    };

    // Simulate API delay
    setTimeout(() => {
      this.renderVehicleDetail(mockVehicle);
    }, 500);
  }

  private renderVehicleDetail(vehicle: VehicleDetail): void {
    const loadingState = document.getElementById('loading-state');
    const vehicleContent = document.getElementById('vehicle-content');
    
    if (loadingState) loadingState.style.display = 'none';
    if (vehicleContent) vehicleContent.style.display = 'block';

    // Basic Information
    this.setElementText('vehicle-make', vehicle.make);
    this.setElementText('vehicle-model', vehicle.model);
    this.setElementText('vehicle-year', vehicle.year.toString());
    this.setElementText('vehicle-plate', vehicle.plate_number);
    this.setElementText('vehicle-color', vehicle.color);
    this.setElementText('vehicle-type', vehicle.vehicle_type || '-');

    // Technical Specifications
    this.setElementText('vehicle-seating', vehicle.seating_capacity.toString());
    this.setElementText('vehicle-fuel', vehicle.fuel_type || '-');
    this.setElementText('vehicle-transmission', vehicle.transmission || '-');
    this.setElementText('vehicle-mileage', vehicle.mileage.toLocaleString() + ' km');
    this.setElementText('vehicle-vin', vehicle.vin_number || '-');
    this.setElementText('vehicle-engine', vehicle.engine_capacity || '-');

    // Owner Information
    this.carOwnerId = vehicle.car_owner_id;
    this.setElementText('vehicle-owner-name', vehicle.owner_name);
    this.setElementText('vehicle-owner-email', vehicle.owner_email);
    this.setElementText('vehicle-owner-id', vehicle.car_owner_id.toString());

    // Status Information
    const verificationBadge = document.getElementById('verification-status-badge');
    if (verificationBadge) {
      verificationBadge.innerHTML = `<span class="badge badge-${vehicle.documents_verification_status || 'pending'}">${this.formatVerificationStatus(vehicle.documents_verification_status)}</span>`;
    }

    const listingBadge = document.getElementById('listing-status-badge');
    if (listingBadge) {
      listingBadge.innerHTML = `<span class="badge badge-${vehicle.listing_status || 'not_ready'}">${this.formatListingStatus(vehicle.listing_status)}</span>`;
    }

    this.setElementText('vehicle-created', this.formatDate(vehicle.created_at));
    this.setElementText('vehicle-updated', this.formatDate(vehicle.updated_at));

    // Description
    this.setElementText('vehicle-description', vehicle.description || '-');

    // Set current verification status in form
    const statusSelect = document.getElementById('verification-status') as HTMLSelectElement;
    if (statusSelect && vehicle.documents_verification_status) {
      statusSelect.value = vehicle.documents_verification_status;
    }

    // Documents
    this.renderDocument('registration-document-preview', vehicle.registration_document_url, 'Registration Document');
    this.renderDocument('insurance-document-preview', vehicle.insurance_document_url, 'Insurance Document');
    
    // Expiry dates
    this.setElementText('registration-expiry-date', this.formatDate(vehicle.registration_expiry_date));
    this.setElementText('insurance-expiry-date', this.formatDate(vehicle.insurance_expiry_date));
  }

  private renderDocument(containerId: string, url: string | null, label: string): void {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!url) {
      container.innerHTML = '<div class="no-document">No document uploaded</div>';
      return;
    }

    container.innerHTML = `
      <div class="document-link">
        <a href="${url}" target="_blank" class="btn-link">View Document</a>
      </div>
    `;
  }

  private handleVerification(): void {
    const statusSelect = document.getElementById('verification-status') as HTMLSelectElement;
    const notesTextarea = document.getElementById('verification-notes') as HTMLTextAreaElement;
    const errorDiv = document.getElementById('verification-error');
    const successDiv = document.getElementById('verification-success');

    if (!statusSelect || !notesTextarea || !errorDiv || !successDiv) return;

    const verificationStatus = statusSelect.value;
    const notes = notesTextarea.value.trim();

    if (!verificationStatus) {
      errorDiv.textContent = 'Please select a verification status';
      errorDiv.style.display = 'block';
      successDiv.style.display = 'none';
      return;
    }

    // Hide messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    // Mock API call - will be replaced with real API
    setTimeout(() => {
      successDiv.textContent = `Vehicle documents verification status updated to ${this.formatVerificationStatus(verificationStatus)}`;
      successDiv.style.display = 'block';
      
      // Update the status badge
      const statusBadge = document.getElementById('verification-status-badge');
      if (statusBadge) {
        statusBadge.innerHTML = `<span class="badge badge-${verificationStatus}">${this.formatVerificationStatus(verificationStatus)}</span>`;
      }

      // Update listing status if verified
      if (verificationStatus === 'verified') {
        const listingBadge = document.getElementById('listing-status-badge');
        if (listingBadge) {
          listingBadge.innerHTML = '<span class="badge badge-ready">Ready</span>';
        }
      }

      // Reload page after 1.5 seconds
      setTimeout(() => {
        this.loadVehicleDetail();
      }, 1500);
    }, 500);
  }

  private setElementText(id: string, text: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
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
}

