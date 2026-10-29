import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\Rukvith sai tej\\Downloads\\aquapulse_screenshots';
const artifactDir = 'C:\\Users\\Rukvith sai tej\\.gemini\\antigravity\\brain\\359b568a-c7bf-4696-98f7-3b07c09dacc2';

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });

async function run() {
  console.log('Launching headless Chrome at 1920x1080...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--window-size=1920,1080', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  async function saveScreenshot(filename) {
    const p1 = path.join(outDir, filename);
    const p2 = path.join(artifactDir, filename);
    await page.screenshot({ path: p1, fullPage: false });
    fs.copyFileSync(p1, p2);
    console.log(`[OK] Saved: ${filename}`);
  }

  // Figure 5.1: Login page
  console.log('Capturing Figure 5.1 (Login page)...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await saveScreenshot('Figure_5.1_Login_page.png');

  // Login via 1-click Admin
  console.log('Logging in as Admin...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const adminBtn = buttons.find((b) => b.textContent && b.textContent.includes('Admin'));
    if (adminBtn) adminBtn.click();
  });

  // Wait for Dashboard to mount
  await page.waitForSelector('main', { timeout: 15000 });
  console.log('Capturing Figure 5.2 (Live monitoring dashboard) after waiting for telemetry...');
  await new Promise((r) => setTimeout(r, 6000));
  await saveScreenshot('Figure_5.2_Live_monitoring_dashboard.png');

  async function clickTab(navText) {
    await page.evaluate((text) => {
      const btns = Array.from(document.querySelectorAll('aside button'));
      const target = btns.find((b) => b.textContent && b.textContent.includes(text));
      if (target) target.click();
    }, navText);
  }

  // Figure 5.3: Water quality readings
  console.log('Capturing Figure 5.3 (Water quality readings)...');
  await clickTab('Water Quality');
  await new Promise((r) => setTimeout(r, 3000));
  await saveScreenshot('Figure_5.3_Water_quality_readings.png');

  // Figure 5.4: Dosage recommendation screen
  console.log('Capturing Figure 5.4 (Dosage recommendation screen)...');
  await clickTab('AI Chemical Dosage');
  await new Promise((r) => setTimeout(r, 3000));
  await saveScreenshot('Figure_5.4_Dosage_recommendation_screen.png');

  // Figure 5.5: Anomaly detection and alerts
  console.log('Capturing Figure 5.5 (Anomaly detection and alerts)...');
  await clickTab('Anomaly Detection');
  await new Promise((r) => setTimeout(r, 3000));
  await saveScreenshot('Figure_5.5_Anomaly_detection_and_alerts.png');

  // Figure 5.6: Equipment management
  console.log('Capturing Figure 5.6 (Equipment management)...');
  await clickTab('Predictive Maint.');
  await new Promise((r) => setTimeout(r, 3000));
  await saveScreenshot('Figure_5.6_Equipment_management.png');

  // Figure 5.7: Maintenance scheduling
  console.log('Capturing Figure 5.7 (Maintenance scheduling modal)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const logBtn = btns.find((b) => b.textContent && b.textContent.includes('Log Maintenance'));
    if (logBtn) logBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  await saveScreenshot('Figure_5.7_Maintenance_scheduling.png');

  // Close modal
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    const closeOverlay = document.querySelector('.fixed.inset-0');
    if (closeOverlay) {
      closeOverlay.click();
    }
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Figure 5.8: Analytics dashboard
  console.log('Capturing Figure 5.8 (Analytics dashboard)...');
  await clickTab('Analytics & Trends');
  await new Promise((r) => setTimeout(r, 3500));
  await saveScreenshot('Figure_5.8_Analytics_dashboard.png');

  // Figure 5.9: AI assistant
  console.log('Capturing Figure 5.9 (AI assistant)...');
  await clickTab('AI Plant Assistant');
  await new Promise((r) => setTimeout(r, 2000));

  const promptInput = 'input[placeholder*="water chemistry"]';
  await page.waitForSelector(promptInput, { timeout: 10000 });
  await page.type(promptInput, 'What is the current water quality and recommended alum dosage?');
  await page.keyboard.press('Enter');

  console.log('Waiting for AI response stream...');
  await new Promise((r) => setTimeout(r, 4500));
  await saveScreenshot('Figure_5.9_AI_assistant.png');

  console.log('All 9 figures captured successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
