const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function smoothScroll(page, targetY, step = 30, delay = 25) {
  await page.evaluate(async ({ targetY, step, delay }) => {
    await new Promise(resolve => {
      let currentY = window.scrollY;
      const direction = targetY > currentY ? 1 : -1;
      const timer = setInterval(() => {
        currentY += step * direction;
        if ((direction === 1 && currentY >= targetY) || (direction === -1 && currentY <= targetY)) {
          window.scrollTo(0, targetY);
          clearInterval(timer);
          resolve();
        } else {
          window.scrollTo(0, currentY);
        }
      }, delay);
    });
  }, { targetY, step, delay });
}

(async () => {
  console.log('--- RECORDING HIGH-DEFINITION LIVE WALKTHROUGH OF LINKORA ---');
  const videosDir = path.join(__dirname, 'public/videos');
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

  const tempVideoDir = path.join(__dirname, '.temp-recordings');
  if (!fs.existsSync(tempVideoDir)) fs.mkdirSync(tempVideoDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: '/Applications/Opera Air.app/Contents/MacOS/Opera',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: tempVideoDir,
      size: { width: 1280, height: 720 },
    },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    // SCENE 1: HOMEPAGE HERO (5s)
    console.log('[1/5] Loading Homepage Hero...');
    await page.goto('https://linkora-edu.online', { waitUntil: 'networkidle', timeout: 35000 });
    await sleep(2500);

    // SCENE 2: SCROLLING HOMEPAGE (7s)
    console.log('[2/5] Scrolling through Projects & Features...');
    await smoothScroll(page, 700, 25, 20);
    await sleep(1500);
    await smoothScroll(page, 1400, 30, 20);
    await sleep(1500);
    await smoothScroll(page, 0, 50, 15);
    await sleep(1500);

    // SCENE 3: EXPLORE PROJECTS (6s)
    console.log('[3/5] Navigating to Explore Projects...');
    await page.goto('https://linkora-edu.online/explore', { waitUntil: 'networkidle', timeout: 35000 });
    await sleep(2000);
    await smoothScroll(page, 600, 25, 20);
    await sleep(1500);

    // SCENE 4: HACKATHONS (6s)
    console.log('[4/5] Navigating to Hackathons Hub...');
    await page.goto('https://linkora-edu.online/hackathons', { waitUntil: 'networkidle', timeout: 35000 });
    await sleep(2000);
    await smoothScroll(page, 600, 25, 20);
    await sleep(1500);

    // SCENE 5: TEAMMATES DISCOVERY (6s)
    console.log('[5/5] Navigating to Teammates Directory...');
    await page.goto('https://linkora-edu.online/teammates', { waitUntil: 'networkidle', timeout: 35000 });
    await sleep(2000);
    await smoothScroll(page, 550, 25, 20);
    await sleep(1500);

    // OUTRO: RETURN TO HOMEPAGE (4s)
    console.log('[Outro] Returning to Homepage...');
    await page.goto('https://linkora-edu.online', { waitUntil: 'networkidle', timeout: 35000 });
    await sleep(2500);

    console.log('Live session recording finished!');
  } catch (err) {
    console.error('Error recording session:', err);
  }

  // Get real video object
  const video = page.video();
  const rawPath = await video.path();

  // Close context to flush video file to disk
  await page.close();
  await context.close();
  await browser.close();

  console.log('Video flushed to disk at:', rawPath);
  const rawStats = fs.statSync(rawPath);
  console.log(`Raw video size: ${(rawStats.size / 1024 / 1024).toFixed(2)} MB`);

  // Output paths
  const mp4Path = path.join(videosDir, 'linkora-live-demo.mp4');
  const webmPath = path.join(videosDir, 'linkora-live-demo.webm');

  // Convert to Universal MP4 (H.264 + AAC + FastStart for instant playback)
  console.log('Encoding to universal MP4 with H.264...');
  execSync(`"${ffmpeg.path}" -y -i "${rawPath}" -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.1 -movflags +faststart -r 30 -crf 22 "${mp4Path}"`, { stdio: 'inherit' });

  // Convert/copy webm
  fs.copyFileSync(rawPath, webmPath);

  // Clean temp folder
  fs.rmSync(tempVideoDir, { recursive: true, force: true });

  const mp4Stats = fs.statSync(mp4Path);
  console.log('====================================');
  console.log('RECORDING COMPLETE & VERIFIED:');
  console.log('MP4 File:', mp4Path, `(${(mp4Stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log('WebM File:', webmPath);
  console.log('====================================');
})();
