// API client wrapper communicating with the Node.js/Express backend
const API_BASE = '/api';

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
    return res.json();
  },

  async register(data: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateProfile(data: any) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Water Readings
  async getLatestReading() {
    const res = await fetch(`${API_BASE}/water-readings/latest`);
    return res.json();
  },

  async getReadingHistory(limit: number = 50, stage?: string) {
    const url = new URL(`${window.location.origin}${API_BASE}/water-readings/history`);
    url.searchParams.set('limit', limit.toString());
    if (stage) url.searchParams.set('stage', stage);
    const res = await fetch(url.toString());
    return res.json();
  },

  async addManualReading(data: any) {
    const res = await fetch(`${API_BASE}/water-readings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async triggerTick() {
    const res = await fetch(`${API_BASE}/water-readings/simulate-tick`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Chemical Dosage
  async getDosages() {
    const res = await fetch(`${API_BASE}/dosage`);
    return res.json();
  },

  async applyDosage(data: any) {
    const res = await fetch(`${API_BASE}/dosage/apply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getDosageHistory(limit: number = 30) {
    const res = await fetch(`${API_BASE}/dosage/history?limit=${limit}`);
    return res.json();
  },

  // Anomalies
  async getAnomalies(filter?: { status?: string; severity?: string; parameter?: string }) {
    const url = new URL(`${window.location.origin}${API_BASE}/anomalies`);
    if (filter?.status) url.searchParams.set('status', filter.status);
    if (filter?.severity) url.searchParams.set('severity', filter.severity);
    if (filter?.parameter) url.searchParams.set('parameter', filter.parameter);
    const res = await fetch(url.toString());
    return res.json();
  },

  async updateAnomalyStatus(id: string, data: { status: string; resolutionNotes?: string; resolvedBy?: string }) {
    const res = await fetch(`${API_BASE}/anomalies/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async injectAnomaly(type: string) {
    const res = await fetch(`${API_BASE}/anomalies/inject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ type }),
    });
    return res.json();
  },

  // Equipment & Maintenance
  async getEquipment() {
    const res = await fetch(`${API_BASE}/equipment`);
    return res.json();
  },

  async getEquipmentById(id: string) {
    const res = await fetch(`${API_BASE}/equipment/${id}`);
    return res.json();
  },

  async getMaintenanceRecords() {
    const res = await fetch(`${API_BASE}/maintenance`);
    return res.json();
  },

  async createMaintenanceRecord(data: any) {
    const res = await fetch(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Alerts
  async getAlerts(filter?: { status?: string; severity?: string }) {
    const url = new URL(`${window.location.origin}${API_BASE}/alerts`);
    if (filter?.status) url.searchParams.set('status', filter.status);
    if (filter?.severity) url.searchParams.set('severity', filter.severity);
    const res = await fetch(url.toString());
    return res.json();
  },

  async acknowledgeAlert(id: string, acknowledgedBy?: string) {
    const res = await fetch(`${API_BASE}/alerts/${id}/acknowledge`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ acknowledgedBy }),
    });
    return res.json();
  },

  async acknowledgeAllAlerts(acknowledgedBy?: string) {
    const res = await fetch(`${API_BASE}/alerts/acknowledge-all`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ acknowledgedBy }),
    });
    return res.json();
  },

  // Analytics
  async getAnalytics(timeframe: string = 'today') {
    const res = await fetch(`${API_BASE}/analytics?timeframe=${timeframe}`);
    return res.json();
  },

  // Reports
  async getReports() {
    const res = await fetch(`${API_BASE}/reports`);
    return res.json();
  },

  async getReportById(id: string) {
    const res = await fetch(`${API_BASE}/reports/${id}`);
    return res.json();
  },

  async generateReport(reportType: string, generatedBy?: string) {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reportType, generatedBy }),
    });
    return res.json();
  },

  // AI Integration (via Backend Express proxy only!)
  async getAIDosageRecommendation(params?: { ph?: number; turbidity?: number; temperature?: number; flowRate?: number }) {
    const res = await fetch(`${API_BASE}/ai/dosage-recommendation`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params || {}),
    });
    return res.json();
  },

  async sendChatMessage(message: string, userId?: string) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, userId }),
    });
    return res.json();
  },

  async getChatHistory() {
    const res = await fetch(`${API_BASE}/ai/chat-history`);
    return res.json();
  },

  async clearChatHistory() {
    const res = await fetch(`${API_BASE}/ai/chat-history`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Simulation Controls
  async getSimulationStatus() {
    const res = await fetch(`${API_BASE}/simulation/status`);
    return res.json();
  },

  async toggleSimulation() {
    const res = await fetch(`${API_BASE}/simulation/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async setSimulationSpeed(intervalMs: number) {
    const res = await fetch(`${API_BASE}/simulation/speed`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ intervalMs }),
    });
    return res.json();
  },
};
