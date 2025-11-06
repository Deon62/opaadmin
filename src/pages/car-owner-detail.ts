import { Layout } from '../components/layout';
import { Router } from '../router';

interface CarOwnerDetail {
  id: number;
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string | null;
  gender: string | null;
  location: string | null;
  address: string | null;
  id_number: string | null;
  id_document_url: string | null;
  profile_picture_url: string | null;
  business_name: string | null;
  business_registration_number: string | null;
  verification_status: string | null;
  profile_completeness: number;
  created_at: string | null;
  updated_at: string | null;
}

export class CarOwnerDetailPage {
  private layout: Layout;
  private router: Router;
  private carOwnerId: number;

  constructor(carOwnerId: number) {
    this.layout = new Layout();
    this.router = Router.getInstance();
    this.carOwnerId = carOwnerId;
  }

  render(): void {
    const carOwnerDetailContent = `
      <div class="page-container">
        <div class="page-header">
          <div>
            <button class="btn-back" id="back-btn">← Back to Car Owners</button>
            <h1>Car Owner Details</h1>
          </div>
        </div>

        <div id="loading-state" class="loading-container">
          <div class="loading-state">Loading car owner information...</div>
        </div>

        <div id="car-owner-content" style="display: none;">
          <div class="detail-grid">
            <div class="detail-section">
              <div class="section-header">
                <h2>Personal Information</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <label>Name</label>
                  <div id="car-owner-name">-</div>
                </div>
                <div class="info-item">
                  <label>Email</label>
                  <div id="car-owner-email">-</div>
                </div>
                <div class="info-item">
                  <label>Phone Number</label>
                  <div id="car-owner-phone">-</div>
                </div>
                <div class="info-item">
                  <label>Date of Birth</label>
                  <div id="car-owner-dob">-</div>
                </div>
                <div class="info-item">
                  <label>Gender</label>
                  <div id="car-owner-gender">-</div>
                </div>
                <div class="info-item">
                  <label>Location</label>
                  <div id="car-owner-location">-</div>
                </div>
                <div class="info-item">
                  <label>Address</label>
                  <div id="car-owner-address">-</div>
                </div>
                <div class="info-item">
                  <label>ID Number</label>
                  <div id="car-owner-id-number">-</div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-header">
                <h2>Business Information</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <label>Business Name</label>
                  <div id="car-owner-business-name">-</div>
                </div>
                <div class="info-item">
                  <label>Registration Number</label>
                  <div id="car-owner-registration-number">-</div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-header">
                <h2>Verification Status</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <label>Current Status</label>
                  <div id="verification-status-badge"></div>
                </div>
                <div class="info-item">
                  <label>Profile Completeness</label>
                  <div id="profile-completeness-bar"></div>
                </div>
                <div class="info-item">
                  <label>Created At</label>
                  <div id="car-owner-created">-</div>
                </div>
                <div class="info-item">
                  <label>Last Updated</label>
                  <div id="car-owner-updated">-</div>
                </div>
                <div class="info-item">
                  <label>Associated Vehicles</label>
                  <div>
                    <button class="btn-link" id="view-vehicles-btn">View Vehicles</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-section documents-section">
              <div class="section-header">
                <h2>Documents</h2>
              </div>
              <div class="documents-grid">
                <div class="document-item" id="id-document-item">
                  <div class="document-label">ID Document</div>
                  <div class="document-preview" id="id-document-preview">
                    <div class="no-document">No document uploaded</div>
                  </div>
                </div>
                <div class="document-item" id="profile-picture-item">
                  <div class="document-label">Profile Picture</div>
                  <div class="document-preview" id="profile-picture-preview">
                    <div class="no-document">No profile picture uploaded</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-section verification-section">
              <div class="section-header">
                <h2>Verification Action</h2>
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
                    placeholder="Add notes or comments about this verification..."
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

    this.layout.render(carOwnerDetailContent, '/car-owners');
    this.attachEventListeners();
    this.loadCarOwnerDetail();
  }

  private attachEventListeners(): void {
    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.router.navigate('/car-owners');
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

    // View vehicles button
    const viewVehiclesBtn = document.getElementById('view-vehicles-btn');
    if (viewVehiclesBtn) {
      viewVehiclesBtn.addEventListener('click', () => {
        this.router.navigate(`/vehicles?owner=${this.carOwnerId}`);
      });
    }
  }

  private loadCarOwnerDetail(): void {
    // Mock data - will be replaced with API call
    const mockCarOwner: CarOwnerDetail = {
      id: this.carOwnerId,
      user_id: 30,
      email: 'owner1@example.com',
      first_name: 'Michael',
      last_name: 'Johnson',
      phone_number: '+1234567890',
      date_of_birth: '1985-07-15',
      gender: 'male',
      location: 'Los Angeles',
      address: '456 Business Ave, Los Angeles, CA 90001',
      id_number: 'ID123456',
      id_document_url: 'https://example.com/id-doc.jpg',
      profile_picture_url: 'https://example.com/profile.jpg',
      business_name: 'Johnson Car Rentals',
      business_registration_number: 'BRN789012',
      verification_status: 'pending',
      profile_completeness: 90.0,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:20:00Z'
    };

    // Simulate API delay
    setTimeout(() => {
      this.renderCarOwnerDetail(mockCarOwner);
    }, 500);
  }

  private renderCarOwnerDetail(carOwner: CarOwnerDetail): void {
    const loadingState = document.getElementById('loading-state');
    const carOwnerContent = document.getElementById('car-owner-content');
    
    if (loadingState) loadingState.style.display = 'none';
    if (carOwnerContent) carOwnerContent.style.display = 'block';

    // Personal Information
    const name = `${carOwner.first_name} ${carOwner.last_name}`;
    this.setElementText('car-owner-name', name);
    this.setElementText('car-owner-email', carOwner.email);
    this.setElementText('car-owner-phone', carOwner.phone_number);
    this.setElementText('car-owner-dob', this.formatDate(carOwner.date_of_birth));
    this.setElementText('car-owner-gender', this.formatGender(carOwner.gender));
    this.setElementText('car-owner-location', carOwner.location || '-');
    this.setElementText('car-owner-address', carOwner.address || '-');
    this.setElementText('car-owner-id-number', carOwner.id_number || '-');

    // Business Information
    this.setElementText('car-owner-business-name', carOwner.business_name || '-');
    this.setElementText('car-owner-registration-number', carOwner.business_registration_number || '-');

    // Verification Status
    const statusBadge = document.getElementById('verification-status-badge');
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="badge badge-${carOwner.verification_status || 'pending'}">${this.formatVerificationStatus(carOwner.verification_status)}</span>`;
    }

    // Profile Completeness
    const completenessBar = document.getElementById('profile-completeness-bar');
    if (completenessBar) {
      completenessBar.innerHTML = `
        <div class="completeness-bar">
          <div class="completeness-fill" style="width: ${carOwner.profile_completeness}%"></div>
          <span class="completeness-text">${carOwner.profile_completeness.toFixed(0)}%</span>
        </div>
      `;
    }

    this.setElementText('car-owner-created', this.formatDate(carOwner.created_at));
    this.setElementText('car-owner-updated', this.formatDate(carOwner.updated_at));

    // Set current verification status in form
    const statusSelect = document.getElementById('verification-status') as HTMLSelectElement;
    if (statusSelect && carOwner.verification_status) {
      statusSelect.value = carOwner.verification_status;
    }

    // Documents
    this.renderDocument('id-document-preview', carOwner.id_document_url, 'ID Document');
    this.renderDocument('profile-picture-preview', carOwner.profile_picture_url, 'Profile Picture', true);
  }

  private renderDocument(containerId: string, url: string | null, label: string, isImage: boolean = false): void {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!url) {
      container.innerHTML = '<div class="no-document">No document uploaded</div>';
      return;
    }

    if (isImage) {
      container.innerHTML = `
        <img src="${url}" alt="${label}" class="document-image" onerror="this.parentElement.innerHTML='<div class=\\'no-document\\'>Failed to load image</div>'">
      `;
    } else {
      container.innerHTML = `
        <div class="document-link">
          <a href="${url}" target="_blank" class="btn-link">View Document</a>
        </div>
      `;
    }
  }

  private handleVerification(): void {
    const statusSelect = document.getElementById('verification-status') as HTMLSelectElement;
    const notesTextarea = document.getElementById('verification-notes') as HTMLTextAreaElement;
    const errorDiv = document.getElementById('verification-error');
    const successDiv = document.getElementById('verification-success');

    if (!statusSelect || !notesTextarea || !errorDiv || !successDiv) return;

    const verificationStatus = statusSelect.value;
    // Notes will be used when connecting to real API
    void notesTextarea.value.trim();

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
      successDiv.textContent = `Car owner verification status updated to ${this.formatVerificationStatus(verificationStatus)}`;
      successDiv.style.display = 'block';
      
      // Update the status badge
      const statusBadge = document.getElementById('verification-status-badge');
      if (statusBadge) {
        statusBadge.innerHTML = `<span class="badge badge-${verificationStatus}">${this.formatVerificationStatus(verificationStatus)}</span>`;
      }

      // Reload page after 1.5 seconds
      setTimeout(() => {
        this.loadCarOwnerDetail();
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

  private formatGender(gender: string | null): string {
    if (!gender) return '-';
    return gender.charAt(0).toUpperCase() + gender.slice(1);
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
}

