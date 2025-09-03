const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

async function takeButtonPrimaryAfterScreenshots() {
  console.log('🚀 Starting Puppeteer PRIMARY BUTTONS AFTER screenshot capture...');
  
  const browser = await puppeteer.launch({
    headless: true, // Set to false to see browser in action
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ],
    defaultViewport: {
      width: 1200,
      height: 800
    }
  });

  const page = await browser.newPage();

  // Define the views we want to capture
  const views = [
    { name: 'home', path: '', description: 'Home/Landing view' },
    { name: 'matters', path: '#matters', description: 'Matter Management' },
    { name: 'timekeepers', path: '#timekeepers', description: 'Timekeeper Setup' },
    { name: 'timeentry', path: '#timeentry', description: 'Time Entry' },
    { name: 'billing', path: '#billing', description: 'Billing Summary' }
  ];

  console.log('📸 Capturing screenshots for', views.length, 'views...');

  for (const view of views) {
    try {
      console.log(`  📷 Capturing ${view.description}...`);
      
      // Navigate to the view
      await page.goto(`http://localhost:3000${view.path}`);
      
      // Wait for the page to load and any dynamic content
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Take the screenshot
      const screenshotPath = path.join(screenshotsDir, `button-primary-after-${view.name}.png`);
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true // Capture the full page height
      });
      
      console.log(`    ✅ Saved: ${screenshotPath}`);
    } catch (error) {
      console.error(`    ❌ Error capturing ${view.name}:`, error.message);
    }
  }

  await browser.close();
  console.log('🎉 Baseline screenshots completed!');
  console.log('📁 Screenshots saved in:', screenshotsDir);
}

// Run the screenshot capture
if (require.main === module) {
  takeButtonPrimaryAfterScreenshots().catch(console.error);
}

module.exports = { takeButtonPrimaryAfterScreenshots };