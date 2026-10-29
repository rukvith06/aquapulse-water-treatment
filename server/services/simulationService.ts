import { WaterReadingModel, IWaterReading } from '../models/WaterReading.ts';
import { AnomalyModel } from '../models/Anomaly.ts';
import { AlertModel } from '../models/Alert.ts';
import { EquipmentModel } from '../models/Equipment.ts';
import { ChemicalDosageModel } from '../models/ChemicalDosage.ts';
import { MaintenanceRecordModel } from '../models/MaintenanceRecord.ts';
import { UserModel } from '../models/User.ts';
import bcrypt from 'bcryptjs';

export interface SimulationState {
  isRunning: boolean;
  intervalMs: number;
  lastTick: Date;
  tickCount: number;
  forcedAnomaly: string | null;
  currentDosages: {
    alum: number;
    chlorine: number;
    sodaAsh: number;
    polymer: number;
  };
}

export const simulationState: SimulationState = {
  isRunning: true,
  intervalMs: 4000,
  lastTick: new Date(),
  tickCount: 0,
  forcedAnomaly: null,
  currentDosages: {
    alum: 24.0,
    chlorine: 2.1,
    sodaAsh: 10.5,
    polymer: 0.35,
  },
};

let timerId: NodeJS.Timeout | null = null;

// Baseline water parameter values
let currentPh = 7.32;
let currentTurbidity = 1.65;
let currentTemp = 19.8;
let currentFlow = 245;

export async function seedInitialData() {
  try {
    // 1. Seed Demo Users if not present
    const userCount = await UserModel.find();
    if (!userCount || userCount.length === 0) {
      const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
      const hashedOperatorPassword = await bcrypt.hash('Operator@123', 10);

      await UserModel.create({
        name: 'Dr. Robert Vance (Plant Director)',
        email: 'admin@aquapulse.io',
        password: hashedAdminPassword,
        role: 'Admin',
        department: 'Operations & Process Engineering',
        shift: 'General Oversight',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      });

      await UserModel.create({
        name: 'Sarah Connor (Senior Operator)',
        email: 'operator@aquapulse.io',
        password: hashedOperatorPassword,
        role: 'Operator',
        department: 'Filtration & Chemical Dosing Wing',
        shift: 'Day Shift (08:00 - 16:00)',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      });
      console.log('✅ Seeded demo users: admin@aquapulse.io and operator@aquapulse.io');
    }

    // 2. Seed Equipment
    const eqCount = await EquipmentModel.find();
    if (!eqCount || eqCount.length === 0) {
      const equipmentData = [
        {
          equipmentName: 'Intake Low-Lift Pump #01',
          code: 'PMP-IN-01',
          type: 'Pump' as const,
          status: 'Operational' as const,
          location: 'River Intake Wet Well',
          operatingHours: 3420,
          maxOperatingHours: 5000,
          healthScore: 88,
          lastMaintenance: new Date(Date.now() - 45 * 24 * 3600 * 1000),
          nextMaintenance: new Date(Date.now() + 25 * 24 * 3600 * 1000),
          maintenanceRisk: 'Low' as const,
          maintenanceRecommendation: 'Impeller wear is minimal. Inspect mechanical shaft seal in next PM.',
          vibrationLevel: 1.4,
          motorTemperature: 44.5,
          powerConsumption: 32.4,
        },
        {
          equipmentName: 'Rapid Flash Mixer Flocculator',
          code: 'MIX-FLOC-02',
          type: 'Motor' as const,
          status: 'Operational' as const,
          location: 'Coagulation Basin 1',
          operatingHours: 4180,
          maxOperatingHours: 5000,
          healthScore: 76,
          lastMaintenance: new Date(Date.now() - 70 * 24 * 3600 * 1000),
          nextMaintenance: new Date(Date.now() + 12 * 24 * 3600 * 1000),
          maintenanceRisk: 'Medium' as const,
          maintenanceRecommendation: 'Bearing lubrication recommended. Gearbox temperature slightly elevated (+3°C).',
          vibrationLevel: 2.8,
          motorTemperature: 52.1,
          powerConsumption: 14.8,
        },
        {
          equipmentName: 'Rapid Gravity Sand Filter Cell A',
          code: 'FLT-SND-01',
          type: 'Filter' as const,
          status: 'Operational' as const,
          location: 'Filter Gallery Hall',
          operatingHours: 1950,
          maxOperatingHours: 3000,
          healthScore: 92,
          lastMaintenance: new Date(Date.now() - 15 * 24 * 3600 * 1000),
          nextMaintenance: new Date(Date.now() + 45 * 24 * 3600 * 1000),
          maintenanceRisk: 'Low' as const,
          maintenanceRecommendation: 'Head loss within standard tolerance (0.18 bar). Media bed depth verified.',
          vibrationLevel: 0.4,
          motorTemperature: 21.0,
          powerConsumption: 4.2,
        },
        {
          equipmentName: 'Peristaltic Alum Chemical Dosing Skid',
          code: 'DOS-ALUM-01',
          type: 'Chemical Dosing' as const,
          status: 'Maintenance Required' as const,
          location: 'Chemical Storage & Dosing Vault',
          operatingHours: 4890,
          maxOperatingHours: 5000,
          healthScore: 64,
          lastMaintenance: new Date(Date.now() - 95 * 24 * 3600 * 1000),
          nextMaintenance: new Date(Date.now() + 3 * 24 * 3600 * 1000),
          maintenanceRisk: 'High' as const,
          maintenanceRecommendation: 'Peristaltic pump tubing fatigue detected. Replace elastomer hose immediately to avoid dosing rupture.',
          vibrationLevel: 3.2,
          motorTemperature: 58.4,
          powerConsumption: 8.5,
        },
        {
          equipmentName: 'Online Laser Nephelometric Turbidimeter',
          code: 'SNS-TURB-01',
          type: 'Sensor' as const,
          status: 'Operational' as const,
          location: 'Treated Water Effluent Manifold',
          operatingHours: 6100,
          maxOperatingHours: 8000,
          healthScore: 94,
          lastMaintenance: new Date(Date.now() - 10 * 24 * 3600 * 1000),
          nextMaintenance: new Date(Date.now() + 60 * 24 * 3600 * 1000),
          maintenanceRisk: 'Low' as const,
          maintenanceRecommendation: 'Zero-point calibration valid with 0.02 NTU standard solution.',
          vibrationLevel: 0.1,
          motorTemperature: 19.5,
          powerConsumption: 0.2,
        },
      ];

      for (const eq of equipmentData) {
        await EquipmentModel.create(eq);
      }
      console.log('✅ Seeded 5 industrial equipment units.');
    }

    // 3. Seed initial 30 historical water readings (spaced over past 6 hours)
    const readingCount = await WaterReadingModel.count();
    if (readingCount === 0) {
      const initialReadings: Partial<IWaterReading>[] = [];
      const now = Date.now();
      for (let i = 35; i >= 0; i--) {
        const timestamp = new Date(now - i * 10 * 60 * 1000); // 10 mins apart
        const noisePh = (Math.sin(i * 0.4) * 0.25) + (Math.random() * 0.1 - 0.05);
        const noiseTurb = (Math.cos(i * 0.3) * 0.4) + (Math.random() * 0.2);
        const noiseTemp = (Math.sin(i * 0.1) * 1.2) + (Math.random() * 0.2);
        const noiseFlow = Math.round(240 + Math.sin(i * 0.2) * 25 + (Math.random() * 10 - 5));

        const ph = Number((7.25 + noisePh).toFixed(2));
        const turbidity = Number(Math.max(0.4, 1.8 + noiseTurb).toFixed(2));
        const temperature = Number((19.5 + noiseTemp).toFixed(1));
        const flowRate = noiseFlow;

        let status: 'Normal' | 'Warning' | 'Critical' = 'Normal';
        if (ph < 6.5 || ph > 8.5 || turbidity > 5.0) status = 'Warning';

        initialReadings.push({
          ph,
          turbidity,
          temperature,
          flowRate,
          dissolvedOxygen: Number((7.4 + Math.random() * 0.4 - 0.2).toFixed(2)),
          conductivity: Math.round(310 + Math.random() * 20),
          status,
          stage: 'Treated Outlet',
          timestamp,
        });
      }
      await WaterReadingModel.insertMany(initialReadings);
      console.log(`✅ Seeded ${initialReadings.length} historical water readings.`);
    }

    // 4. Seed Chemical Dosage records
    const dosageCount = await ChemicalDosageModel.find();
    if (!dosageCount || dosageCount.length === 0) {
      await ChemicalDosageModel.insertMany([
        {
          chemicalName: 'Alum Coagulant [Al2(SO4)3]',
          category: 'Coagulation',
          currentDosage: 24.0,
          recommendedDosage: 24.0,
          difference: 0.0,
          unit: 'mg/L',
          reason: 'Coagulation jar-test baseline optimal for turbidity < 2.0 NTU.',
          riskLevel: 'Low',
          status: 'Optimal',
          waterConditions: { ph: 7.3, turbidity: 1.8, temperature: 19.5, flowRate: 245 },
          aiGenerated: true,
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
        },
        {
          chemicalName: 'Sodium Hypochlorite (Chlorine)',
          category: 'Disinfection',
          currentDosage: 2.1,
          recommendedDosage: 2.2,
          difference: 0.1,
          unit: 'mg/L',
          reason: 'Ensures residual chlorine target of 0.5 mg/L at farthest distribution tap.',
          riskLevel: 'Low',
          status: 'Optimal',
          waterConditions: { ph: 7.3, turbidity: 1.8, temperature: 19.5, flowRate: 245 },
          aiGenerated: true,
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
        },
        {
          chemicalName: 'Soda Ash (Sodium Carbonate)',
          category: 'pH Correction',
          currentDosage: 10.5,
          recommendedDosage: 10.5,
          difference: 0.0,
          unit: 'mg/L',
          reason: 'Maintains Langelier Saturation Index (LSI) at +0.1 to avoid pipe corrosion.',
          riskLevel: 'Low',
          status: 'Optimal',
          waterConditions: { ph: 7.3, turbidity: 1.8, temperature: 19.5, flowRate: 245 },
          aiGenerated: true,
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
        },
        {
          chemicalName: 'Cationic Polymer Flocculant Aid',
          category: 'Flocculation',
          currentDosage: 0.35,
          recommendedDosage: 0.35,
          difference: 0.0,
          unit: 'mg/L',
          reason: 'Bridging floc particles for rapid sedimentation in clarifier basins.',
          riskLevel: 'Low',
          status: 'Optimal',
          waterConditions: { ph: 7.3, turbidity: 1.8, temperature: 19.5, flowRate: 245 },
          aiGenerated: true,
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
        },
      ]);
      console.log('✅ Seeded chemical dosage models.');
    }

    // 5. Seed Maintenance Records
    const maintCount = await MaintenanceRecordModel.find();
    if (!maintCount || maintCount.length === 0) {
      await MaintenanceRecordModel.insertMany([
        {
          equipmentId: 'MIX-FLOC-02',
          equipmentName: 'Rapid Flash Mixer Flocculator',
          maintenanceType: 'Inspection',
          description: 'Quarterly vibration analysis and thermal imaging scan of gearmotor.',
          performedBy: 'Lead Tech - Marcus Brody',
          date: new Date(Date.now() - 14 * 24 * 3600 * 1000),
          status: 'Completed',
          partsReplaced: ['Grease fitting nipple', 'Sealing O-ring'],
          cost: 320,
          downtimeHours: 1.5,
          notes: 'Minor mechanical backlash detected on motor shaft coupling.',
        },
        {
          equipmentId: 'FLT-SND-01',
          equipmentName: 'Rapid Gravity Sand Filter Cell A',
          maintenanceType: 'Preventive',
          description: 'Filter media core sampling and air scour backwash cycle calibration.',
          performedBy: 'Process Engineer - Elena Rostova',
          date: new Date(Date.now() - 28 * 24 * 3600 * 1000),
          status: 'Completed',
          partsReplaced: ['Underdrain nozzle assembly (4 units)'],
          cost: 850,
          downtimeHours: 4.0,
          notes: 'Anthracite and silica sand bed uniformity coefficient within 1.4 design spec.',
        },
      ]);
      console.log('✅ Seeded maintenance history records.');
    }

    // 6. Seed Alerts
    const alertCount = await AlertModel.find();
    if (!alertCount || alertCount.length === 0) {
      await AlertModel.create({
        type: 'Equipment',
        severity: 'Warning',
        title: 'Chemical Dosing Pump Tube Fatigue',
        message: 'Peristaltic pump DOS-ALUM-01 operating hours exceeded 4,800 hrs. Tube replacement recommended.',
        parameter: 'Operating Hours',
        value: 4890,
        threshold: '4800 hrs',
        status: 'Active',
      });
      await AlertModel.create({
        type: 'System',
        severity: 'Info',
        title: 'SCADA Telemetry Online',
        message: 'All sensor nodes transmitting live telemetry at 4s intervals. Data streaming to MongoDB.',
        status: 'Acknowledged',
        acknowledgedBy: 'Dr. Robert Vance',
        acknowledgedAt: new Date(Date.now() - 3600 * 1000),
      });
    }
  } catch (err: any) {
    console.error('Error during initial data seeding:', err);
  }
}

// Tick execution: Generates new reading, checks anomalies, triggers alerts
export async function runSimulationTick(): Promise<IWaterReading | null> {
  try {
    simulationState.tickCount++;
    simulationState.lastTick = new Date();

    // Check if an anomaly was forcibly triggered by the user
    if (simulationState.forcedAnomaly) {
      switch (simulationState.forcedAnomaly) {
        case 'ph_acid':
          currentPh = 3.4;
          break;
        case 'ph_alkali':
          currentPh = 9.8;
          break;
        case 'turbidity_spike':
          currentTurbidity = 16.4;
          break;
        case 'flow_drop':
          currentFlow = 52;
          break;
        case 'temp_spike':
          currentTemp = 33.5;
          break;
      }
      simulationState.forcedAnomaly = null; // reset forced anomaly after 1 tick
    } else {
      // Natural industrial variance with gentle reversion towards nominal mean
      const targetPh = 7.35;
      const targetTurb = 1.7;
      const targetTemp = 19.8;
      const targetFlow = 245;

      currentPh += (targetPh - currentPh) * 0.15 + (Math.random() * 0.08 - 0.04);
      currentTurbidity += (targetTurb - currentTurbidity) * 0.15 + (Math.random() * 0.14 - 0.07);
      currentTemp += (targetTemp - currentTemp) * 0.1 + (Math.random() * 0.08 - 0.04);
      currentFlow += (targetFlow - currentFlow) * 0.15 + (Math.random() * 8 - 4);

      // Clamp to realistic physical bounds
      currentPh = Math.max(2.0, Math.min(12.0, currentPh));
      currentTurbidity = Math.max(0.1, Math.min(30.0, currentTurbidity));
      currentTemp = Math.max(5.0, Math.min(45.0, currentTemp));
      currentFlow = Math.max(0, Math.min(600, currentFlow));
    }

    const roundedPh = Number(currentPh.toFixed(2));
    const roundedTurb = Number(currentTurbidity.toFixed(2));
    const roundedTemp = Number(currentTemp.toFixed(1));
    const roundedFlow = Math.round(currentFlow);

    // 1. Determine Status & Detect Anomalies
    let status: 'Normal' | 'Warning' | 'Critical' = 'Normal';
    const detectedAnomalies: Array<{
      type: string;
      parameter: 'pH' | 'Turbidity' | 'Temperature' | 'Flow Rate';
      value: number;
      expected: string;
      severity: 'Low' | 'Medium' | 'Critical';
      action: string;
    }> = [];

    // Rule 1: pH Check (WHO standard: 6.5 - 8.5)
    if (roundedPh < 6.0 || roundedPh > 9.0) {
      status = 'Critical';
      detectedAnomalies.push({
        type: roundedPh < 6.0 ? 'Acidic Influx Contamination' : 'Severe Alkaline Spike',
        parameter: 'pH',
        value: roundedPh,
        expected: '6.5 - 8.5',
        severity: 'Critical',
        action: roundedPh < 6.0
          ? 'Emergency increase of Soda Ash dosing by +15 mg/L; isolate intake basin if pH < 5.0.'
          : 'Dose Carbon Dioxide or acid buffer; inspect upstream industrial discharge.',
      });
    } else if (roundedPh < 6.5 || roundedPh > 8.5) {
      status = 'Warning';
      detectedAnomalies.push({
        type: 'pH Out-of-Spec Deviation',
        parameter: 'pH',
        value: roundedPh,
        expected: '6.5 - 8.5',
        severity: 'Medium',
        action: 'Adjust lime/soda ash metering pump stroke to restore neutral pH balance.',
      });
    }

    // Rule 2: Turbidity Check (Target < 1.0 NTU treated; alert if > 5.0 NTU)
    if (roundedTurb > 10.0) {
      status = 'Critical';
      detectedAnomalies.push({
        type: 'Severe Turbidity Surge (Storm Runoff)',
        parameter: 'Turbidity',
        value: roundedTurb,
        expected: '< 5.0 NTU (Intake) / < 1.0 NTU (Outlet)',
        severity: 'Critical',
        action: 'Initiate high-rate coagulant dosing (+12 mg/L Alum) and throttle raw intake flow rate.',
      });
    } else if (roundedTurb > 5.0) {
      if (status !== 'Critical') status = 'Warning';
      detectedAnomalies.push({
        type: 'Elevated Colloidal Turbidity',
        parameter: 'Turbidity',
        value: roundedTurb,
        expected: '< 5.0 NTU',
        severity: 'Medium',
        action: 'Increase Alum dosing and engage secondary polymer flocculant pump.',
      });
    }

    // Rule 3: Flow Rate Check (Normal: 120 - 450 m³/h)
    if (roundedFlow < 80) {
      if (status !== 'Critical') status = 'Critical';
      detectedAnomalies.push({
        type: 'Severe Flow Starvation / Pipe Blockage',
        parameter: 'Flow Rate',
        value: roundedFlow,
        expected: '120 - 450 m³/h',
        severity: 'Critical',
        action: 'Inspect intake suction screen for debris blinding; check intake pump pressure differential.',
      });
    } else if (roundedFlow > 480) {
      if (status !== 'Critical') status = 'Warning';
      detectedAnomalies.push({
        type: 'High Hydraulic Loading',
        parameter: 'Flow Rate',
        value: roundedFlow,
        expected: '120 - 450 m³/h',
        severity: 'Medium',
        action: 'Throttle variable frequency drive (VFD) on raw water pump #01.',
      });
    }

    // Rule 4: Temperature Check (10 - 25 °C)
    if (roundedTemp > 30.0 || roundedTemp < 8.0) {
      if (status !== 'Critical') status = 'Warning';
      detectedAnomalies.push({
        type: 'Thermal Stress Anomaly',
        parameter: 'Temperature',
        value: roundedTemp,
        expected: '10.0 - 25.0 °C',
        severity: 'Medium',
        action: 'Adjust chlorine dosing kinetics; biological disinfection demand increases with temperature.',
      });
    }

    // 2. Save reading to MongoDB
    const reading = await WaterReadingModel.create({
      ph: roundedPh,
      turbidity: roundedTurb,
      temperature: roundedTemp,
      flowRate: roundedFlow,
      dissolvedOxygen: Number((7.3 + (Math.random() * 0.4 - 0.2)).toFixed(2)),
      conductivity: Math.round(315 + (Math.random() * 15 - 7)),
      status,
      stage: 'Treated Outlet',
      timestamp: new Date(),
    });

    // 3. Persist detected anomalies and trigger alerts in MongoDB
    for (const anom of detectedAnomalies) {
      await AnomalyModel.create({
        anomalyType: anom.type,
        parameter: anom.parameter,
        currentValue: anom.value,
        expectedRange: anom.expected,
        severity: anom.severity,
        recommendedAction: anom.action,
        status: 'Detected',
        timestamp: new Date(),
      });

      // Create an alert if not already spammed
      await AlertModel.create({
        type: 'Anomaly',
        severity: anom.severity === 'Critical' ? 'Critical' : 'Warning',
        title: `${anom.type} on ${anom.parameter}`,
        message: `${anom.parameter} is currently ${anom.value}, outside normal range (${anom.expected}). Action: ${anom.action}`,
        parameter: anom.parameter,
        value: anom.value,
        threshold: anom.expected,
        status: 'Active',
        timestamp: new Date(),
      });
    }

    return reading as any;
  } catch (err: any) {
    console.error('Error in runSimulationTick:', err);
    return null;
  }
}

export function startSimulation(intervalMs: number = 4000) {
  if (timerId) {
    clearInterval(timerId);
  }
  simulationState.isRunning = true;
  simulationState.intervalMs = intervalMs;
  timerId = setInterval(() => {
    if (simulationState.isRunning) {
      runSimulationTick();
    }
  }, intervalMs);
  console.log(`🚀 Plant SCADA Simulation started at ${intervalMs}ms intervals.`);
}

export function stopSimulation() {
  simulationState.isRunning = false;
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  console.log('⏸️ Plant SCADA Simulation stopped.');
}

export function triggerForcedAnomaly(type: string) {
  simulationState.forcedAnomaly = type;
  // Trigger immediate tick
  return runSimulationTick();
}
