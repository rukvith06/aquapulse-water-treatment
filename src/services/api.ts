// API client wrapper communicating with the Node.js/Express backend
const API_BASE = '/api';

async function parseApiResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      `API request failed with ${response.status} ${response.statusText}: expected JSON but received ${contentType || 'an unknown content type'}.`
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error(`API returned invalid JSON (${response.status} ${response.statusText}).`, {
      cause: error,
    });
  }
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('aquapulse_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return parseApiResponse(res);
  },

  async register(data: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return parseApiResponse(res);
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return parseApiResponse(res);
  },

  async updateProfile(data: any) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return parseApiResponse(res);
  },

  // Water Readings
  async getLatestReading() {
    const res = await fetch(`${API_BASE}/water-readings/latest`);
    return parseApiResponse(res);
  },

  async getReadingHistory(limit: number = 50, stage?: string) {
    const url = new URL(`${window.location.origin}${API_BASE}/water-readings/history`);
    url.searchParams.set('limit', limit.toString());
    if (stage) url.searchParams.set('stage', stage);
    const res = await fetch(url.toString());
    return parseApiResponse(res);
  },

  async addManualReading(data: any) {
    const res = await fetch(`${API_BASE}/water-readings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return parseApiResponse(res);
  },

  async triggerTick() {
    const res = await fetch(`${API_BASE}/water-readings/simulate-tick`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return parseApiResponse(res);
  },

  // Chemical Dosage
  async getDosages() {
    const res = await fetch(`${API_BASE}/dosage`);
    return parseApiResponse(res);
  },

  async applyDosage(data: any) {
    const res = await fetch(`${API_BASE}/dosage/apply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return parseApiResponse(res);
  },

  async getDosageHistory(limit: number = 30) {
    const res = await fetch(`${API_BASE}/dosage/history?limit=${limit}`);
    return parseApiResponse(res);
  },

  // Anomalies
  async getAnomalies(filter?: { status?: string; severity?: string; parameter?: string }) {
    const url = new URL(`${window.location.origin}${API_BASE}/anomalies`);
    if (filter?.status) url.searchParams.set('status', filter.status);
    if (filter?.severity) url.searchParams.set('severity', filter.severity);
    if (filter?.parameter) url.searchParams.set('parameter', filter.parameter);
    const res = await fetch(url.toString());
    return parseApiResponse(res);
  },

  async updateAnomalyStatus(id: string, data: { status: string; resolutionNotes?: string; resolvedBy?: string }) {
    const res = await fetch(`${API_BASE}/anomalies/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return parseApiResponse(res);
  },

  async injectAnomaly(type: string) {
    const res = await fetch(`${API_BASE}/anomalies/inject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ type }),
    });
    return parseApiResponse(res);
  },

  // Equipment & Maintenance
  async getEquipment() {
    const res = await fetch(`${API_BASE}/equipment`);
    return parseApiResponse(res);
  },

  async getEquipmentById(id: string) {
    const res = await fetch(`${API_BASE}/equipment/${id}`);
    return parseApiResponse(res);
  },

  async getMaintenanceRecords() {
    const res = await fetch(`${API_BASE}/maintenance`);
    return parseApiResponse(res);
  },

  async createMaintenanceRecord(data: any) {
    const res = await fetch(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return parseApiResponse(res);
  },

  // Alerts
  async getAlerts(filter?: { status?: string; severity?: string }) {
    const url = new URL(`${window.location.origin}${API_BASE}/alerts`);
    if (filter?.status) url.searchParams.set('status', filter.status);
    if (filter?.severity) url.searchParams.set('severity', filter.severity);
    const res = await fetch(url.toString());
    return parseApiResponse(res);
  },

  async acknowledgeAlert(id: string, acknowledgedBy?: string) {
    const res = await fetch(`${API_BASE}/alerts/${id}/acknowledge`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ acknowledgedBy }),
    });
    return parseApiResponse(res);
  },

  async acknowledgeAllAlerts(acknowledgedBy?: string) {
    const res = await fetch(`${API_BASE}/alerts/acknowledge-all`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ acknowledgedBy }),
    });
    return parseApiResponse(res);
  },

  // Analytics
  async getAnalytics(timeframe: string = 'today') {
    const res = await fetch(`${API_BASE}/analytics?timeframe=${timeframe}`);
    return parseApiResponse(res);
  },

  // Reports
  async getReports() {
    const res = await fetch(`${API_BASE}/reports`);
    return parseApiResponse(res);
  },

  async getReportById(id: string) {
    const res = await fetch(`${API_BASE}/reports/${id}`);
    return parseApiResponse(res);
  },

  async generateReport(reportType: string, generatedBy?: string) {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reportType, generatedBy }),
    });
    return parseApiResponse(res);
  },

  // AI Integration (via Backend Express proxy only!)
  async getAIDosageRecommendation(params?: { ph?: number; turbidity?: number; temperature?: number; flowRate?: number }) {
    const res = await fetch(`${API_BASE}/ai/dosage-recommendation`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params || {}),
    });
    return parseApiResponse(res);
  },

  async sendChatMessage(message: string, userId?: string) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, userId }),
    });
    return parseApiResponse(res);
  },

  async getChatHistory() {
    const res = await fetch(`${API_BASE}/ai/chat-history`);
    return parseApiResponse(res);
  },

  async clearChatHistory() {
    const res = await fetch(`${API_BASE}/ai/chat-history`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return parseApiResponse(res);
  },

  // Simulation Controls
  async getSimulationStatus() {
    const res = await fetch(`${API_BASE}/simulation/status`);
    return parseApiResponse(res);
  },

  async toggleSimulation() {
    const res = await fetch(`${API_BASE}/simulation/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return parseApiResponse(res);
  },

  async setSimulationSpeed(intervalMs: number) {
    const res = await fetch(`${API_BASE}/simulation/speed`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ intervalMs }),
    });
    return parseApiResponse(res);
  },
};
