import { Layout } from '../components/layout';
import { Router } from '../router';
import { adminApi } from '../services/api';
import { getDocumentUrl } from '../config/api';

interface ClientDetail {
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
  dl_number: string | null;
  dl_category: string | null;
  dl_issue_date: string | null;
  dl_expiry_date: string | null;
  dl_document_url: string | null;
  verification_status: string | null;
  dl_verification_status: string | null;
  profile_completeness: number;
  created_at: string | null;
  updated_at: string | null;
}

export class ClientDetailPage {
  private layout: Layout;
  private router: Router;
  private clientId: number;

  constructor(clientId: number) {
    this.layout = new Layout();
    this.router = Router.getInstance();
    this.clientId = clientId;
  }

  render(): void {
    const clientDetailContent = `
      <div class="page-container">
        <div class="page-header">
          <div>
            <button class="btn-back" id="back-btn">← Back to Clients</button>
            <h1>Client Details</h1>
          </div>
        </div>

        <div id="loading-state" class="loading-container">
          <div class="loading-state">Loading client information...</div>
        </div>

        <div id="client-content" style="display: none;">
          <div class="detail-grid">
            <div class="detail-section">
              <div class="section-header">
                <h2>Personal Information</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <label>Name</label>
                  <div id="client-name">-</div>
                </div>
                <div class="info-item">
                  <label>Email</label>
                  <div id="client-email">-</div>
                </div>
                <div class="info-item">
                  <label>Phone Number</label>
                  <div id="client-phone">-</div>
                </div>
                <div class="info-item">
                  <label>Date of Birth</label>
                  <div id="client-dob">-</div>
                </div>
                <div class="info-item">
                  <label>Gender</label>
                  <div id="client-gender">-</div>
                </div>
                <div class="info-item">
                  <label>Location</label>
                  <div id="client-location">-</div>
                </div>
                <div class="info-item">
                  <label>Address</label>
                  <div id="client-address">-</div>
                </div>
                <div class="info-item">
                  <label>ID Number</label>
                  <div id="client-id-number">-</div>
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
                  <div id="client-dl-number">-</div>
                </div>
                <div class="info-item">
                  <label>Category</label>
                  <div id="client-dl-category">-</div>
                </div>
                <div class="info-item">
                  <label>Issue Date</label>
                  <div id="client-dl-issue">-</div>
                </div>
                <div class="info-item">
                  <label>Expiry Date</label>
                  <div id="client-dl-expiry">-</div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-header">
                <h2>Verification Status</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <label>ID Verification Status</label>
                  <div id="id-verification-badge"></div>
                </div>
                <div class="info-item">
                  <label>DL Verification Status</label>
                  <div id="dl-verification-badge"></div>
                </div>
                <div class="info-item">
                  <label>Profile Completeness</label>
                  <div id="profile-completeness-bar"></div>
                </div>
                <div class="info-item">
                  <label>Created At</label>
                  <div id="client-created">-</div>
                </div>
                <div class="info-item">
                  <label>Last Updated</label>
                  <div id="client-updated">-</div>
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
                <div class="document-item" id="dl-document-item">
                  <div class="document-label">Driving License Document</div>
                  <div class="document-preview" id="dl-document-preview">
                    <div class="no-document">No document uploaded</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-section verification-section">
              <div class="section-header">
                <h2>ID Verification Action</h2>
              </div>
              <form id="id-verification-form" class="verification-form">
                <div class="form-group">
                  <label for="id-verification-status">Verification Status</label>
                  <select id="id-verification-status" class="form-select" required>
                    <option value="">Select status</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                    <option value="under_review">Under Review</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="id-verification-notes">Notes (Optional)</label>
                  <textarea 
                    id="id-verification-notes" 
                    class="form-textarea" 
                    rows="4" 
                    placeholder="Add notes or comments about ID verification..."
                    maxlength="500"
                  ></textarea>
                  <div class="char-count"><span id="id-char-count">0</span>/500</div>
                </div>
                <div id="id-verification-error" class="error-message" style="display: none;"></div>
                <div id="id-verification-success" class="success-message" style="display: none;"></div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary">Submit ID Verification</button>
                </div>
              </form>
            </div>

            <div class="detail-section verification-section">
              <div class="section-header">
                <h2>DL Verification Action</h2>
              </div>
              <form id="dl-verification-form" class="verification-form">
                <div class="form-group">
                  <label for="dl-verification-status">Verification Status</label>
                  <select id="dl-verification-status" class="form-select" required>
                    <option value="">Select status</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                    <option value="under_review">Under Review</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="dl-verification-notes">Notes (Optional)</label>
                  <textarea 
                    id="dl-verification-notes" 
                    class="form-textarea" 
                    rows="4" 
                    placeholder="Add notes or comments about DL verification..."
                    maxlength="500"
                  ></textarea>
                  <div class="char-count"><span id="dl-char-count">0</span>/500</div>
                </div>
                <div id="dl-verification-error" class="error-message" style="display: none;"></div>
                <div id="dl-verification-success" class="success-message" style="display: none;"></div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary">Submit DL Verification</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    this.layout.render(clientDetailContent, '/clients');
    this.attachEventListeners();
    this.loadClientDetail();
  }

  private attachEventListeners(): void {
    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.router.navigate('/clients');
      });
    }

    // Character count for ID verification notes
    const idNotesTextarea = document.getElementById('id-verification-notes') as HTMLTextAreaElement;
    const idCharCount = document.getElementById('id-char-count');
    if (idNotesTextarea && idCharCount) {
      idNotesTextarea.addEventListener('input', () => {
        idCharCount.textContent = idNotesTextarea.value.length.toString();
      });
    }

    // Character count for DL verification notes
    const dlNotesTextarea = document.getElementById('dl-verification-notes') as HTMLTextAreaElement;
    const dlCharCount = document.getElementById('dl-char-count');
    if (dlNotesTextarea && dlCharCount) {
      dlNotesTextarea.addEventListener('input', () => {
        dlCharCount.textContent = dlNotesTextarea.value.length.toString();
      });
    }

    // ID Verification form
    const idVerificationForm = document.getElementById('id-verification-form') as HTMLFormElement;
    if (idVerificationForm) {
      idVerificationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleIDVerification();
      });
    }

    // DL Verification form
    const dlVerificationForm = document.getElementById('dl-verification-form') as HTMLFormElement;
    if (dlVerificationForm) {
      dlVerificationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleDLVerification();
      });
    }
  }

  private async loadClientDetail(): Promise<void> {
    const result = await adminApi.getClientDetail(this.clientId);
    
    if (result.error) {
      const loadingState = document.getElementById('loading-state');
      if (loadingState) {
        loadingState.innerHTML = `<div class="empty-state">Error: ${result.error}</div>`;
      }
      return;
    }

    if (result.data) {
      this.renderClientDetail(result.data as ClientDetail);
    }
  }

  private renderClientDetail(client: ClientDetail): void {
    const loadingState = document.getElementById('loading-state');
    const clientContent = document.getElementById('client-content');
    
    if (loadingState) loadingState.style.display = 'none';
    if (clientContent) clientContent.style.display = 'block';

    // Personal Information
    const name = `${client.first_name} ${client.last_name}`;
    this.setElementText('client-name', name);
    this.setElementText('client-email', client.email);
    this.setElementText('client-phone', client.phone_number);
    this.setElementText('client-dob', this.formatDate(client.date_of_birth));
    this.setElementText('client-gender', this.formatGender(client.gender));
    this.setElementText('client-location', client.location || '-');
    this.setElementText('client-address', client.address || '-');
    this.setElementText('client-id-number', client.id_number || '-');

    // Driving License Information
    this.setElementText('client-dl-number', client.dl_number || '-');
    this.setElementText('client-dl-category', client.dl_category || '-');
    this.setElementText('client-dl-issue', this.formatDate(client.dl_issue_date));
    this.setElementText('client-dl-expiry', this.formatDate(client.dl_expiry_date));

    // Verification Status
    const idStatusBadge = document.getElementById('id-verification-badge');
    if (idStatusBadge) {
      idStatusBadge.innerHTML = `<span class="badge badge-${client.verification_status || 'pending'}">${this.formatVerificationStatus(client.verification_status)}</span>`;
    }

    const dlStatusBadge = document.getElementById('dl-verification-badge');
    if (dlStatusBadge) {
      if (client.dl_number) {
        dlStatusBadge.innerHTML = `<span class="badge badge-${client.dl_verification_status || 'pending'}">${this.formatVerificationStatus(client.dl_verification_status)}</span>`;
      } else {
        dlStatusBadge.innerHTML = '<span class="text-muted">No DL provided</span>';
      }
    }

    // Profile Completeness
    const completenessBar = document.getElementById('profile-completeness-bar');
    if (completenessBar) {
      completenessBar.innerHTML = `
        <div class="completeness-bar">
          <div class="completeness-fill" style="width: ${client.profile_completeness}%"></div>
          <span class="completeness-text">${client.profile_completeness.toFixed(0)}%</span>
        </div>
      `;
    }

    this.setElementText('client-created', this.formatDate(client.created_at));
    this.setElementText('client-updated', this.formatDate(client.updated_at));

    // Set current verification statuses in forms
    const idStatusSelect = document.getElementById('id-verification-status') as HTMLSelectElement;
    if (idStatusSelect && client.verification_status) {
      idStatusSelect.value = client.verification_status;
    }

    const dlStatusSelect = document.getElementById('dl-verification-status') as HTMLSelectElement;
    if (dlStatusSelect && client.dl_verification_status) {
      dlStatusSelect.value = client.dl_verification_status;
    }

    // Disable DL form if no DL provided
    if (!client.dl_number) {
      const dlForm = document.getElementById('dl-verification-form') as HTMLFormElement;
      if (dlForm) {
        dlForm.style.opacity = '0.5';
        dlForm.style.pointerEvents = 'none';
        const dlStatusSelect = document.getElementById('dl-verification-status') as HTMLSelectElement;
        if (dlStatusSelect) {
          dlStatusSelect.disabled = true;
        }
      }
    }

    // Documents
    this.renderDocument('id-document-preview', client.id_document_url, 'ID Document');
    this.renderDocument('profile-picture-preview', client.profile_picture_url, 'Profile Picture', true);
    this.renderDocument('dl-document-preview', client.dl_document_url, 'DL Document');
  }

  private renderDocument(containerId: string, url: string | null, label: string, isImage: boolean = false): void {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!url) {
      container.innerHTML = '<div class="no-document">No document uploaded</div>';
      return;
    }

    const fullUrl = getDocumentUrl(url);
    if (!fullUrl) {
      container.innerHTML = '<div class="no-document">Invalid document URL</div>';
      return;
    }

    if (isImage) {
      container.innerHTML = `
        <img src="${fullUrl}" alt="${label}" class="document-image" onerror="this.parentElement.innerHTML='<div class=\\'no-document\\'>Failed to load image</div>'">
      `;
    } else {
      container.innerHTML = `
        <div class="document-link">
          <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="btn-link" data-external-link="true">View Document</a>
        </div>
      `;
    }
  }

  private async handleIDVerification(): Promise<void> {
    const statusSelect = document.getElementById('id-verification-status') as HTMLSelectElement;
    const notesTextarea = document.getElementById('id-verification-notes') as HTMLTextAreaElement;
    const errorDiv = document.getElementById('id-verification-error');
    const successDiv = document.getElementById('id-verification-success');

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

    // Call API
    const result = await adminApi.verifyClientID(this.clientId, verificationStatus, notes);

    if (result.error) {
      errorDiv.textContent = result.error;
      errorDiv.style.display = 'block';
      successDiv.style.display = 'none';
      return;
    }

    if (result.data) {
      const message = (result.data as any).message;
      successDiv.textContent = message || `Client ID verification status updated to ${this.formatVerificationStatus(verificationStatus)}`;
      successDiv.style.display = 'block';
      
      // Update the status badge
      const statusBadge = document.getElementById('id-verification-badge');
      if (statusBadge) {
        statusBadge.innerHTML = `<span class="badge badge-${verificationStatus}">${this.formatVerificationStatus(verificationStatus)}</span>`;
      }

      // Reload page after 1.5 seconds
      setTimeout(() => {
        this.loadClientDetail();
      }, 1500);
    }
  }

  private async handleDLVerification(): Promise<void> {
    const statusSelect = document.getElementById('dl-verification-status') as HTMLSelectElement;
    const notesTextarea = document.getElementById('dl-verification-notes') as HTMLTextAreaElement;
    const errorDiv = document.getElementById('dl-verification-error');
    const successDiv = document.getElementById('dl-verification-success');

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

    // Call API
    const result = await adminApi.verifyClientDL(this.clientId, verificationStatus, notes);

    if (result.error) {
      errorDiv.textContent = result.error;
      errorDiv.style.display = 'block';
      successDiv.style.display = 'none';
      return;
    }

    if (result.data) {
      const message = (result.data as any).message;
      successDiv.textContent = message || `Client DL verification status updated to ${this.formatVerificationStatus(verificationStatus)}`;
      successDiv.style.display = 'block';
      
      // Update the status badge
      const statusBadge = document.getElementById('dl-verification-badge');
      if (statusBadge) {
        statusBadge.innerHTML = `<span class="badge badge-${verificationStatus}">${this.formatVerificationStatus(verificationStatus)}</span>`;
      }

      // Reload page after 1.5 seconds
      setTimeout(() => {
        this.loadClientDetail();
      }, 1500);
    }
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

