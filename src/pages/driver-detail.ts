import { Layout } from '../components/layout';
import { Router } from '../router';

interface DriverDetail {
  id: number;
  user_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  id_number: string | null;
  dl_number: string | null;
  dl_category: string | null;
  dl_issue_date: string | null;
  dl_expiry_date: string | null;
  id_document_url: string | null;
  dl_document_url: string | null;
  selfie_url: string | null;
  verification_status: string | null;
  profile_completeness: number;
  created_at: string | null;
  updated_at: string | null;
}

export class DriverDetailPage {
  private layout: Layout;
  private router: Router;
  private driverId: number;

  constructor(driverId: number) {
    this.layout = new Layout();
    this.router = Router.getInstance();
    this.driverId = driverId;
  }

  render(): void {
    const driverDetailContent = `
      <div class="page-container">
        <div class="page-header">
          <div>
            <button class="btn-back" id="back-btn">← Back to Drivers</button>
            <h1>Driver Details</h1>
          </div>
        </div>

        <div id="loading-state" class="loading-container">
          <div class="loading-state">Loading driver information...</div>
        </div>

        <div id="driver-content" style="display: none;">
          <div class="detail-grid">
            <div class="detail-section">
              <div class="section-header">
                <h2>Personal Information</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <label>Name</label>
                  <div id="driver-name">-</div>
                </div>
                <div class="info-item">
                  <label>Email</label>
                  <div id="driver-email">-</div>
                </div>
                <div class="info-item">
                  <label>Phone Number</label>
                  <div id="driver-phone">-</div>
                </div>
                <div class="info-item">
                  <label>Date of Birth</label>
                  <div id="driver-dob">-</div>
                </div>
                <div class="info-item">
                  <label>Gender</label>
                  <div id="driver-gender">-</div>
                </div>
                <div class="info-item">
                  <label>ID Number</label>
                  <div id="driver-id-number">-</div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-header">
                <h2>Driving License Information</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <label>License Number</label>
                  <div id="driver-dl-number">-</div>
                </div>
                <div class="info-item">
                  <label>Category</label>
                  <div id="driver-dl-category">-</div>
                </div>
                <div class="info-item">
                  <label>Issue Date</label>
                  <div id="driver-dl-issue">-</div>
                </div>
                <div class="info-item">
                  <label>Expiry Date</label>
                  <div id="driver-dl-expiry">-</div>
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
                  <div id="driver-created">-</div>
                </div>
                <div class="info-item">
                  <label>Last Updated</label>
                  <div id="driver-updated">-</div>
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
                <div class="document-item" id="dl-document-item">
                  <div class="document-label">Driving License Document</div>
                  <div class="document-preview" id="dl-document-preview">
                    <div class="no-document">No document uploaded</div>
                  </div>
                </div>
                <div class="document-item" id="selfie-item">
                  <div class="document-label">Selfie Photo</div>
                  <div class="document-preview" id="selfie-preview">
                    <div class="no-document">No selfie uploaded</div>
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

    this.layout.render(driverDetailContent, '/drivers');
    this.attachEventListeners();
    this.loadDriverDetail();
  }

  private attachEventListeners(): void {
    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.router.navigate('/drivers');
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
  }

  private loadDriverDetail(): void {
    // Mock data - will be replaced with API call
    const mockDriver: DriverDetail = {
      id: this.driverId,
      user_id: 10,
      email: 'driver1@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+1234567890',
      date_of_birth: '1990-05-15',
      gender: 'male',
      id_number: 'ID123456',
      dl_number: 'DL789012',
      dl_category: 'B',
      dl_issue_date: '2020-01-10',
      dl_expiry_date: '2025-01-10',
      id_document_url: 'https://example.com/id-doc.jpg',
      dl_document_url: 'https://example.com/dl-doc.jpg',
      selfie_url: 'https://example.com/selfie.jpg',
      verification_status: 'pending',
      profile_completeness: 85.5,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:20:00Z'
    };

    // Simulate API delay
    setTimeout(() => {
      this.renderDriverDetail(mockDriver);
    }, 500);
  }

  private renderDriverDetail(driver: DriverDetail): void {
    const loadingState = document.getElementById('loading-state');
    const driverContent = document.getElementById('driver-content');
    
    if (loadingState) loadingState.style.display = 'none';
    if (driverContent) driverContent.style.display = 'block';

    // Personal Information
    const name = driver.first_name && driver.last_name 
      ? `${driver.first_name} ${driver.last_name}` 
      : driver.first_name || driver.last_name || '-';
    this.setElementText('driver-name', name);
    this.setElementText('driver-email', driver.email);
    this.setElementText('driver-phone', driver.phone_number || '-');
    this.setElementText('driver-dob', this.formatDate(driver.date_of_birth));
    this.setElementText('driver-gender', this.formatGender(driver.gender));
    this.setElementText('driver-id-number', driver.id_number || '-');

    // Driving License Information
    this.setElementText('driver-dl-number', driver.dl_number || '-');
    this.setElementText('driver-dl-category', driver.dl_category || '-');
    this.setElementText('driver-dl-issue', this.formatDate(driver.dl_issue_date));
    this.setElementText('driver-dl-expiry', this.formatDate(driver.dl_expiry_date));

    // Verification Status
    const statusBadge = document.getElementById('verification-status-badge');
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="badge badge-${driver.verification_status || 'pending'}">${this.formatVerificationStatus(driver.verification_status)}</span>`;
    }

    // Profile Completeness
    const completenessBar = document.getElementById('profile-completeness-bar');
    if (completenessBar) {
      completenessBar.innerHTML = `
        <div class="completeness-bar">
          <div class="completeness-fill" style="width: ${driver.profile_completeness}%"></div>
          <span class="completeness-text">${driver.profile_completeness.toFixed(0)}%</span>
        </div>
      `;
    }

    this.setElementText('driver-created', this.formatDate(driver.created_at));
    this.setElementText('driver-updated', this.formatDate(driver.updated_at));

    // Set current verification status in form
    const statusSelect = document.getElementById('verification-status') as HTMLSelectElement;
    if (statusSelect && driver.verification_status) {
      statusSelect.value = driver.verification_status;
    }

    // Documents
    this.renderDocument('id-document-preview', driver.id_document_url, 'ID Document');
    this.renderDocument('dl-document-preview', driver.dl_document_url, 'DL Document');
    this.renderDocument('selfie-preview', driver.selfie_url, 'Selfie', true);
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
      successDiv.textContent = `Driver verification status updated to ${this.formatVerificationStatus(verificationStatus)}`;
      successDiv.style.display = 'block';
      
      // Update the status badge
      const statusBadge = document.getElementById('verification-status-badge');
      if (statusBadge) {
        statusBadge.innerHTML = `<span class="badge badge-${verificationStatus}">${this.formatVerificationStatus(verificationStatus)}</span>`;
      }

      // Reload page after 1.5 seconds
      setTimeout(() => {
        this.loadDriverDetail();
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

