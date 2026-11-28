#!/usr/bin/env node
/**
 * Kollabrix / KΛ AI / KΛ FOLIO — Reusable Full-Site Playwright Health & Flow Auditor.
 * Checks HTTP status, runtime pageerror, console.error, broken images, API 404/5xx,
 * mobile horizontal overflow, and key interactive flows (Arena + KΛ FOLIO + Header).
 *
 * Usage:
 *   npm run audit:site
 *   SITE_URL=http://localhost:3000 npm run audit:site
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = (process.env.SITE_URL || 'https://www.kollabrix.in').replace(/\/$/, '');
const REPORT_PATH = process.env.AUDIT_OUT || '';

const ROUTES = [
  { path: '/', label: 'Kollabrix Home', flow: 'header_capabilities', checkMobile: true },
  { path: '/explore', label: 'Explore Projects', checkMobile: true },
  { path: '/hackathons', label: 'Hackathons Directory', checkMobile: true },
  { path: '/hackathons/new', label: 'Host Hackathon' },
  { path: '/teammates', label: 'Find Teammates', checkMobile: true },
  { path: '/war', label: 'Campus War', checkMobile: true },
  { path: '/leaderboard', label: 'College Leaderboard', checkMobile: true },
  { path: '/analytics', label: 'Analytics' },
  { path: '/deadlines', label: 'Deadlines Radar' },
  { path: '/arena', label: 'KΛ ARENA (3D Lobby + Create Match)', flow: 'arena_lobby', checkMobile: true },
  { path: '/icpc', label: 'Practice IDE', checkMobile: true },
  { path: '/ka-ai', label: 'KΛ AI Landing', checkMobile: true },
  { path: '/spark', label: 'KΛ AI Workspace (/spark)', checkMobile: true },
  { path: '/ai-spark', label: 'KΛ AI Alias (/ai-spark)' },
  { path: '/planner', label: 'AI Project Planner' },
  { path: '/ka-codex', label: 'KΛ FOLIO Home', checkMobile: true },
  { path: '/resources', label: 'KΛ FOLIO Studio (Language Tracks)', checkMobile: true },
  { path: '/resources?section=books', label: 'KΛ FOLIO Books & 80/20 Mentor Modal', flow: 'folio_studio' },
  { path: '/perks', label: 'Student Perks Vault', checkMobile: true },
  { path: '/starter-kits', label: 'Starter Kits' },
  { path: '/passport', label: 'Builder Passport' },
  { path: '/problems', label: 'Faculty Problem Bank' },
  { path: '/feedback', label: 'Feedback Page' },
  { path: '/login', label: 'Login', checkMobile: true },
  { path: '/signup', label: 'Signup', checkMobile: true },
  { path: '/pitch', label: 'Pitch Page' },
  { path: '/demo', label: 'Demo Page' },
  { path: '/privacy', label: 'Privacy Policy' },
  { path: '/terms', label: 'Terms of Service' },
  { path: '/admin', label: 'Admin Honeypot (Expects Stealth 404)', expectStatus: 404 },
  { path: '/control-center-7x9', label: 'Admin Control Center Gate' },
];

function findExecutablePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  ].filter(Boolean);
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  const cacheDir = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  if (fs.existsSync(cacheDir)) {
    const dirs = fs.readdirSync(cacheDir).filter((d) => d.startsWith('chromium'));
    for (const d of dirs) {
      const macArm = path.join(cacheDir, d, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
      const shellArm = path.join(cacheDir, d, 'chrome-headless-shell-mac-arm64/chrome-headless-shell');
      if (fs.existsSync(macArm)) return macArm;
      if (fs.existsSync(shellArm)) return shellArm;
    }
  }
  return undefined;
}

async function runInteractiveFlow(page, flowName) {
  if (flowName === 'header_capabilities') {
    const capBtn = page.locator('button:has-text("Capabilities")').first();
    if (await capBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await capBtn.click();
      await page.waitForTimeout(350);
      const hasArena = await page.locator('text=/KΛ ARENA|Battle Arena/i').first().isVisible().catch(() => false);
      return hasArena ? 'Capabilities menu opens' : 'Capabilities menu clicked but items missing';
    }
    return 'Capabilities button not visible on initial load';
  }
  if (flowName === 'arena_lobby') {
    const guestBtn = page.locator('button:has-text("Preview 3D Lobby")').first();
    if (await guestBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await guestBtn.click();
      await page.waitForTimeout(2200);
    }
    const createBtn = page.locator('#create-match-btn, button:has-text("CREATE MATCH")').first();
    if (!(await createBtn.isVisible({ timeout: 3500 }).catch(() => false))) {
      return 'FAIL: CREATE MATCH button missing';
    }
    await createBtn.click();
    await page.waitForTimeout(500);
    const hasCards = await page.locator('text=CHOOSE YOUR ARENA CARD').isVisible().catch(() => false);
    return hasCards ? '3D Lobby + CREATE MATCH -> 4 Cards OK' : 'FAIL: Modal did not open on CREATE MATCH';
  }
  if (flowName === 'folio_studio') {
    const readBtn = page.locator('button:has-text("Click to Read"), button:has-text("Open Mentor Guide")').first();
    if (await readBtn.isVisible({ timeout: 3500 }).catch(() => false)) {
      await readBtn.click();
      await page.waitForTimeout(500);
      const has8020 = await page.locator('text=/80\\/20|USE THIS BOOK IF/i').first().isVisible().catch(() => false);
      return has8020 ? 'Bookshelf + 80/20 Mentor Modal OK' : 'FAIL: Book Modal missing 80/20 block';
    }
    return 'FAIL: No book CTA visible';
  }
  return null;
}

async function auditRoute(browser, route) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const apiFailures = [];

  page.on('pageerror', (err) => pageErrors.push(err.message.slice(0, 140)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      if (!txt.includes('favicon') && !txt.includes('WebGL')) {
        consoleErrors.push(txt.slice(0, 140));
      }
    }
  });
  page.on('response', (res) => {
    const status = res.status();
    const url = res.url();
    if (status >= 500 || (status === 404 && url.includes('/api/'))) {
      apiFailures.push(`${status} ${url.replace(BASE_URL, '')}`);
    }
  });

  let httpStatus = 0;
  let brokenImages = 0;
  let emptyBody = false;
  let mobileOverflow = false;
  let contrastCount = 0;
  let flowNote = null;
  let navError = null;

  try {
    const resp = await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    httpStatus = resp ? resp.status() : 0;
    await page.waitForTimeout(1600);

    const domCheck = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      const broken = imgs.filter((img) => img.complete && img.naturalWidth === 0).length;
      const textLen = (document.body?.innerText || '').trim().length;
      return { broken, textLen };
    });
    brokenImages = domCheck.broken;
    emptyBody = domCheck.textLen < 20;
    if (httpStatus < 400 && !emptyBody) {
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  const contrastIssues = axe.violations.filter((v) => v.id === 'color-contrast');
  if (contrastIssues.length > 0) {
    contrastCount = contrastIssues[0].nodes.length;
  }
}

    if (route.flow && httpStatus < 400) {
      flowNote = await runInteractiveFlow(page, route.flow);
    }

    if (route.checkMobile && httpStatus < 400) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(450);
      mobileOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 10
      );
    }
  } catch (err) {
    navError = err.message.slice(0, 120);
  } finally {
    await context.close();
  }

  const flowFailed = Boolean(flowNote && flowNote.startsWith('FAIL:'));
  const expectedOk = route.expectStatus ? httpStatus === route.expectStatus : httpStatus > 0 && httpStatus < 400;
  const passed =
    !navError &&
    expectedOk &&
    !emptyBody &&
    (route.expectStatus === 404 || pageErrors.length === 0) &&
    apiFailures.length === 0 &&
    !flowFailed;

  const warnings = [];
  if (consoleErrors.length && route.expectStatus !== 404) warnings.push(`${consoleErrors.length} console error(s)`);
  if (brokenImages > 0) warnings.push(`${brokenImages} broken image(s)`);
  if (mobileOverflow) warnings.push('mobile horizontal overflow (>390px)');
  if (contrastCount > 0) warnings.push(`${contrastCount} low-contrast text element(s)`);

  return {
    ...route,
    httpStatus,
    passed,
    warnings,
    pageErrors,
    consoleErrors,
    apiFailures,
    brokenImages,
    mobileOverflow,
    flowNote,
    navError,
  };
}

async function main() {
  const executablePath = findExecutablePath();
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  console.log(`\nAuditing ${ROUTES.length} routes on ${BASE_URL}...\n`);
  const results = [];
  for (const r of ROUTES) {
    const res = await auditRoute(browser, r);
    results.push(res);
    const icon = res.passed ? (res.warnings.length ? 'WARN' : 'PASS') : 'FAIL';
    const warnStr = res.warnings.length ? ` | ${res.warnings.join(', ')}` : '';
    const flowStr = res.flowNote ? ` | Flow: ${res.flowNote}` : '';
    const errStr = res.navError || res.pageErrors[0] || res.apiFailures[0] || '';
    console.log(`[${icon}] ${res.httpStatus || 'ERR'} ${res.path} (${res.label})${flowStr}${warnStr}${errStr ? ` | ${errStr}` : ''}`);
  }
  await browser.close();

  const failed = results.filter((r) => !r.passed);
  const warned = results.filter((r) => r.passed && r.warnings.length > 0);
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} passed | ${failed.length} failed | ${warned.length} warnings\n`);

  if (REPORT_PATH) {
    const lines = [
      `# Kollabrix Full-Site QA Report (${BASE_URL})`,
      `Generated: ${new Date().toISOString()}`,
      `Total: ${results.length} | Passed: ${results.length - failed.length} | Failed: ${failed.length} | Warnings: ${warned.length}`,
      '',
      '| Status | HTTP | Route | Label | Interactive Flow | Warnings / Errors |',
      '| :--- | :--- | :--- | :--- | :--- | :--- |',
      ...results.map((r) => {
        const st = r.passed ? (r.warnings.length ? 'WARN' : 'PASS') : 'FAIL';
        const issues = [
          ...r.warnings,
          ...r.pageErrors.map((e) => `pageerror: ${e}`),
          ...r.apiFailures.map((e) => `api: ${e}`),
          ...(r.navError ? [`nav: ${r.navError}`] : []),
          ...(r.consoleErrors.slice(0, 1).map((e) => `console: ${e}`)),
        ]
          .join('; ')
          .replace(/\|/g, '/');
        return `| ${st} | ${r.httpStatus} | \`${r.path}\` | ${r.label} | ${r.flowNote || '-'} | ${issues || 'Clean'} |`;
      }),
    ];
    fs.writeFileSync(REPORT_PATH, lines.join('\n') + '\n');
    console.log(`Report saved to ${REPORT_PATH}`);
  }

  if (failed.length > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
