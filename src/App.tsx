/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlantProvider } from './context/PlantContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar, TabType } from './components/common/Sidebar';
import { AIChatDrawer } from './components/common/AIChatDrawer';
import { DashboardPage } from './pages/DashboardPage';
import { WaterMonitoringPage } from './pages/WaterMonitoringPage';
import { DosageOptimizationPage } from './pages/DosageOptimizationPage';
import { AnomalyDetectionPage } from './pages/AnomalyDetectionPage';
import { PredictiveMaintenancePage } from './pages/PredictiveMaintenancePage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Bot, Sparkles, Activity, ShieldAlert, Wrench, Bell } from 'lucide-react';

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600/20 text-cyan-400 animate-pulse mb-3">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="text-xs font-mono">Initializing SCADA Node & MongoDB Store...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authMode === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenChat={() => setIsChatDrawerOpen(true)}
        onOpenSettings={() => setCurrentTab('settings')}
      />

      {/* Main Workspace with Sidebar and Tab Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenChat={() => setIsChatDrawerOpen(true)}
            />
          )}
          {currentTab === 'monitoring' && <WaterMonitoringPage />}
          {currentTab === 'dosage' && <DosageOptimizationPage />}
          {currentTab === 'anomalies' && <AnomalyDetectionPage />}
          {currentTab === 'maintenance' && <PredictiveMaintenancePage />}
          {currentTab === 'alerts' && <AlertsPage />}
          {currentTab === 'analytics' && <AnalyticsPage />}
          {currentTab === 'reports' && <ReportsPage />}
          {currentTab === 'ai-chat' && <AIAssistantPage />}
          {currentTab === 'profile' && <ProfilePage />}
          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950 border-t border-slate-800 flex justify-around py-2 text-[10px] text-slate-400">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-1 ${currentTab === 'dashboard' ? 'text-cyan-400' : ''}`}
        >
          <Activity className="h-4 w-4" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => setCurrentTab('monitoring')}
          className={`flex flex-col items-center gap-1 ${currentTab === 'monitoring' ? 'text-cyan-400' : ''}`}
        >
          <Activity className="h-4 w-4" />
          <span>Quality</span>
        </button>
        <button
          onClick={() => setCurrentTab('dosage')}
          className={`flex flex-col items-center gap-1 ${currentTab === 'dosage' ? 'text-cyan-400' : ''}`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Dosage</span>
        </button>
        <button
          onClick={() => setCurrentTab('anomalies')}
          className={`flex flex-col items-center gap-1 ${currentTab === 'anomalies' ? 'text-cyan-400' : ''}`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Anomalies</span>
        </button>
        <button
          onClick={() => setCurrentTab('alerts')}
          className={`flex flex-col items-center gap-1 ${currentTab === 'alerts' ? 'text-cyan-400' : ''}`}
        >
          <Bell className="h-4 w-4" />
          <span>Alerts</span>
        </button>
      </nav>

      {/* Floating AI Chatbot Button */}
      {currentTab !== 'ai-chat' && !isChatDrawerOpen && (
        <button
          onClick={() => setIsChatDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-2xl shadow-cyan-600/30 hover:scale-105 transition-all cursor-pointer border border-cyan-400/30"
          title="Open Water Treatment AI Assistant"
        >
          <Bot className="h-5 w-5" />
          <span className="hidden sm:inline">Water Treatment AI Assistant</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Slide-over AI Chatbot Assistant Drawer */}
      <AIChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        onNavigateToFullChat={() => {
          setIsChatDrawerOpen(false);
          setCurrentTab('ai-chat');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PlantProvider>
        <MainApp />
      </PlantProvider>
    </AuthProvider>
  );
}
