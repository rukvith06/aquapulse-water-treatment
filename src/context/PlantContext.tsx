import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WaterReading, Anomaly, Alert, ChemicalDosage, Equipment } from '../types';
import { api } from '../services/api';

interface PlantContextType {
  latestReading: WaterReading | null;
  readingHistory: WaterReading[];
  anomalies: Anomaly[];
  alerts: Alert[];
  activeAlertsCount: number;
  activeAnomaliesCount: number;
  dosages: ChemicalDosage[];
  activeRates: { alum: number; chlorine: number; sodaAsh: number; polymer: number };
  equipmentList: Equipment[];
  isSimulationRunning: boolean;
  simulationInterval: number;
  dbStatus: { type: string; isConnected: boolean };
  isPolling: boolean;
  fetchLatestData: () => Promise<void>;
  toggleSimulation: () => Promise<void>;
  injectAnomaly: (type: string) => Promise<void>;
  acknowledgeAlert: (id: string) => Promise<void>;
  acknowledgeAllAlerts: () => Promise<void>;
  applyChemicalDosages: (data: any) => Promise<boolean>;
  triggerImmediateTick: () => Promise<void>;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export const PlantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [latestReading, setLatestReading] = useState<WaterReading | null>(null);
  const [readingHistory, setReadingHistory] = useState<WaterReading[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeAlertsCount, setActiveAlertsCount] = useState<number>(0);
  const [activeAnomaliesCount, setActiveAnomaliesCount] = useState<number>(0);
  const [dosages, setDosages] = useState<ChemicalDosage[]>([]);
  const [activeRates, setActiveRates] = useState<{ alum: number; chlorine: number; sodaAsh: number; polymer: number }>({
    alum: 24.0,
    chlorine: 2.1,
    sodaAsh: 10.5,
    polymer: 0.35,
  });
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(true);
  const [simulationInterval, setSimulationInterval] = useState<number>(4000);
  const [dbStatus, setDbStatus] = useState<{ type: string; isConnected: boolean }>({
    type: 'embedded',
    isConnected: true,
  });
  const [isPolling, setIsPolling] = useState<boolean>(true);

  const fetchLatestData = useCallback(async () => {
    try {
      // 1. Latest Reading
      const readRes = await api.getLatestReading();
      if (readRes.success && readRes.reading) {
        setLatestReading(readRes.reading);
        setReadingHistory((prev) => {
          const exists = prev.some((r) => r.timestamp === readRes.reading.timestamp);
          if (exists) return prev;
          const updated = [readRes.reading, ...prev];
          return updated.slice(0, 40);
        });
      }

      // 2. Alerts
      const alertRes = await api.getAlerts();
      if (alertRes.success && alertRes.alerts) {
        setAlerts(alertRes.alerts);
        setActiveAlertsCount(alertRes.activeCount || 0);
      }

      // 3. Anomalies
      const anomRes = await api.getAnomalies();
      if (anomRes.success && anomRes.anomalies) {
        setAnomalies(anomRes.anomalies);
        setActiveAnomaliesCount(anomRes.activeCount || 0);
      }
    } catch (err) {
      console.error('Error polling plant data:', err);
    }
  }, []);

  // Initial full load
  useEffect(() => {
    async function initPlant() {
      try {
        const [readingsRes, dosagesRes, equipRes, simRes] = await Promise.all([
          api.getReadingHistory(40),
          api.getDosages(),
          api.getEquipment(),
          api.getSimulationStatus(),
        ]);

        if (readingsRes.success && readingsRes.readings) {
          setReadingHistory(readingsRes.readings);
          if (readingsRes.readings.length > 0) {
            setLatestReading(readingsRes.readings[0]);
          }
        }
        if (dosagesRes.success) {
          if (dosagesRes.dosages) setDosages(dosagesRes.dosages);
          if (dosagesRes.activeRates) setActiveRates(dosagesRes.activeRates);
        }
        if (equipRes.success && equipRes.equipment) {
          setEquipmentList(equipRes.equipment);
        }
        if (simRes.success) {
          setIsSimulationRunning(simRes.state?.isRunning ?? true);
          setSimulationInterval(simRes.state?.intervalMs ?? 4000);
          if (simRes.database) setDbStatus(simRes.database);
        }
      } catch (err) {
        console.error('Failed to load initial plant data:', err);
      }
    }

    initPlant();
    fetchLatestData();
  }, [fetchLatestData]);

  // Periodic polling interval for live telemetry
  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(() => {
      fetchLatestData();
    }, 3500);

    return () => clearInterval(interval);
  }, [isPolling, fetchLatestData]);

  const toggleSimulation = async () => {
    try {
      const res = await api.toggleSimulation();
      if (res.success) {
        setIsSimulationRunning(res.isRunning);
      }
    } catch (err) {
      console.error('Failed to toggle simulation:', err);
    }
  };

  const injectAnomaly = async (type: string) => {
    try {
      const res = await api.injectAnomaly(type);
      if (res.success && res.reading) {
        setLatestReading(res.reading);
        fetchLatestData();
      }
    } catch (err) {
      console.error('Failed to inject anomaly:', err);
    }
  };

  const triggerImmediateTick = async () => {
    try {
      const res = await api.triggerTick();
      if (res.success && res.reading) {
        setLatestReading(res.reading);
        fetchLatestData();
      }
    } catch (err) {
      console.error('Failed to trigger tick:', err);
    }
  };

  const acknowledgeAlert = async (id: string) => {
    try {
      const res = await api.acknowledgeAlert(id);
      if (res.success) {
        setAlerts((prev) =>
          prev.map((a) => ((a._id || a.id) === id ? { ...a, status: 'Acknowledged' } : a))
        );
        setActiveAlertsCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const acknowledgeAllAlerts = async () => {
    try {
      const res = await api.acknowledgeAllAlerts();
      if (res.success) {
        setAlerts((prev) => prev.map((a) => ({ ...a, status: 'Acknowledged' })));
        setActiveAlertsCount(0);
      }
    } catch (err) {
      console.error('Failed to acknowledge all alerts:', err);
    }
  };

  const applyChemicalDosages = async (data: any) => {
    try {
      const res = await api.applyDosage(data);
      if (res.success) {
        if (res.activeRates) setActiveRates(res.activeRates);
        fetchLatestData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to apply chemical dosage:', err);
      return false;
    }
  };

  return (
    <PlantContext.Provider
      value={{
        latestReading,
        readingHistory,
        anomalies,
        alerts,
        activeAlertsCount,
        activeAnomaliesCount,
        dosages,
        activeRates,
        equipmentList,
        isSimulationRunning,
        simulationInterval,
        dbStatus,
        isPolling,
        fetchLatestData,
        toggleSimulation,
        injectAnomaly,
        acknowledgeAlert,
        acknowledgeAllAlerts,
        applyChemicalDosages,
        triggerImmediateTick,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
};

export function usePlant() {
  const context = useContext(PlantContext);
  if (!context) {
    throw new Error('usePlant must be used within a PlantProvider');
  }
  return context;
}
