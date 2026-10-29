export interface WaterReading {
  _id?: string;
  id?: string;
  ph: number;
  turbidity: number;       // NTU
  temperature: number;     // °C
  flowRate: number;        // m³/h
  dissolvedOxygen: number; // mg/L
  conductivity: number;    // µS/cm
  status: 'Normal' | 'Warning' | 'Critical';
  stage: 'Intake' | 'Coagulation' | 'Filtration' | 'Disinfection' | 'Treated Outlet';
  timestamp: string;
}

export interface ChemicalDosage {
  _id?: string;
  id?: string;
  chemicalName: string;
  category: 'Coagulation' | 'Disinfection' | 'pH Correction' | 'Flocculation';
  currentDosage: number;
  recommendedDosage: number;
  difference: number;
  unit: string;
  reason: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'Optimal' | 'Adjustment Recommended' | 'Critical Adjustment' | 'Applied';
  waterConditions: {
    ph: number;
    turbidity: number;
    temperature: number;
    flowRate: number;
  };
  aiGenerated: boolean;
  timestamp: string;
  appliedBy?: string;
}

export interface Anomaly {
  _id?: string;
  id?: string;
  anomalyType: string;
  parameter: 'pH' | 'Turbidity' | 'Temperature' | 'Flow Rate' | 'Multi-parameter';
  currentValue: number;
  expectedRange: string;
  severity: 'Low' | 'Medium' | 'Critical';
  timestamp: string;
  recommendedAction: string;
  status: 'Detected' | 'Investigating' | 'Resolved';
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface Equipment {
  _id?: string;
  id?: string;
  equipmentName: string;
  code: string;
  type: 'Pump' | 'Filter' | 'Chemical Dosing' | 'Motor' | 'Sensor';
  status: 'Operational' | 'Maintenance Required' | 'Warning' | 'Offline';
  location: string;
  operatingHours: number;
  maxOperatingHours: number;
  healthScore: number;
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  maintenanceRecommendation: string;
  vibrationLevel: number;
  motorTemperature: number;
  powerConsumption: number;
}

export interface MaintenanceRecord {
  _id?: string;
  id?: string;
  equipmentId: string;
  equipmentName: string;
  maintenanceType: 'Preventive' | 'Corrective' | 'Calibration' | 'Overhaul' | 'Inspection';
  description: string;
  performedBy: string;
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Deferred';
  partsReplaced?: string[];
  cost?: number;
  downtimeHours?: number;
  notes?: string;
}

export interface Alert {
  _id?: string;
  id?: string;
  type: 'Water Quality' | 'Anomaly' | 'Equipment' | 'Chemical Dosage' | 'System';
  severity: 'Info' | 'Warning' | 'Critical';
  title: string;
  message: string;
  parameter?: string;
  value?: number;
  threshold?: string;
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Operator';
  department?: string;
  shift?: string;
  lastLogin?: string;
}

export interface Report {
  _id?: string;
  id?: string;
  reportTitle: string;
  reportType: 'Daily Operational' | 'Water Quality Compliance' | 'Chemical Usage Audit' | 'Equipment Health' | 'Comprehensive Plant Audit';
  generatedBy: string;
  periodStart: string;
  periodEnd: string;
  summary: {
    avgPh: number;
    avgTurbidity: number;
    avgTemperature: number;
    avgFlowRate: number;
    totalTreatedVolumeM3: number;
    anomalyCount: number;
    criticalAlertsCount: number;
    maintenanceItemsCount: number;
    complianceStatus: 'Fully Compliant' | 'Sub-optimal' | 'Non-Compliant';
  };
  details?: Record<string, any>;
  createdAt: string;
}

export interface ChatMessage {
  _id?: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  contextData?: Record<string, any>;
}
