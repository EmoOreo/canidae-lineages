import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const APP_URL = process.env.CANIDAE_APP_URL ?? "http://localhost:5173";
const OUTPUT_DIR = process.env.CANIDAE_SCREENSHOT_DIR ?? "screenshots/ui-handoff";
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 1100 },
  { name: "tablet", width: 900, height: 1200 },
  { name: "mobile", width: 390, height: 1200 },
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function waitForApp(page) {
  await page.goto(APP_URL, { waitUntil: "networkidle" });
  await page.waitForSelector("h1", { timeout: 15000 });
  await page.waitForTimeout(500);
}

async function clickIfVisible(page, selector) {
  const locator = page.locator(selector).first();
  if ((await locator.count()) > 0 && (await locator.isVisible())) {
    await locator.click();
    await page.waitForTimeout(300);
    return true;
  }
  return false;
}

async function expandAllDetails(page) {
  await page.evaluate(() => {
    document.querySelectorAll("details").forEach((details) => {
      details.open = true;
    });
  });
  await page.waitForTimeout(300);
}

async function collapseAllDetails(page) {
  await page.evaluate(() => {
    document.querySelectorAll("details").forEach((details) => {
      details.open = false;
    });
  });
  await page.waitForTimeout(300);
}

async function screenshotFullPage(page, name) {
  await page.screenshot({
    path: path.join(OUTPUT_DIR, `${name}.png`),
    fullPage: true,
  });
}

async function screenshotLocator(page, selector, name) {
  const locator = page.locator(selector).first();
  if ((await locator.count()) === 0) {
    console.warn(`Skipped ${name}: selector not found (${selector})`);
    return;
  }

  await locator.screenshot({
    path: path.join(OUTPUT_DIR, `${name}.png`),
  });
}

async function screenshotArticleByText(page, text, name) {
  const article = page.locator("article", { hasText: text }).first();
  if ((await article.count()) === 0) {
    console.warn(`Skipped ${name}: article containing '${text}' not found`);
    return;
  }

  await article.screenshot({
    path: path.join(OUTPUT_DIR, `${name}.png`),
  });
}

async function prepareDemoState(page) {
  await clickIfVisible(page, "#resetButton");

  const parentA = page.locator("#parentA");
  const parentB = page.locator("#parentB");

  if ((await parentA.count()) > 0) {
    await parentA.selectOption({ index: 0 }).catch(() => undefined);
  }

  if ((await parentB.count()) > 0) {
    await parentB.selectOption({ index: 1 }).catch(() => undefined);
  }

  await page.waitForTimeout(300);
}

async function createOneBirthCycle(page) {
  await clickIfVisible(page, "#breedButton");
  await clickIfVisible(page, "#advanceGestationButton");
  await clickIfVisible(page, "#advanceGestationButton");
  await clickIfVisible(page, "#advanceGestationButton");
  await clickIfVisible(page, "#birthReadyLittersButton");
}

async function captureCoreSet(page, viewportName) {
  await collapseAllDetails(page);
  await screenshotFullPage(page, `${viewportName}-01-dashboard-collapsed`);

  await expandAllDetails(page);
  await screenshotFullPage(page, `${viewportName}-02-dashboard-expanded`);

  await screenshotLocator(page, "section:has(#parentA)", `${viewportName}-03-breeding-lab`);
  await screenshotLocator(page, "section:has(#searchInput)", `${viewportName}-04-kennel-management`);
  await screenshotLocator(page, "section:has(pre)", `${viewportName}-05-latest-report`);

  await screenshotArticleByText(page, "Domestic Dog Alpha", `${viewportName}-06-founder-domestic-dog`);
  await screenshotArticleByText(page, "Gray Wolf Alpha", `${viewportName}-07-founder-gray-wolf`);
  await screenshotArticleByText(page, "Dire Wolf Alpha", `${viewportName}-08-extinct-dire-wolf`);
  await screenshotArticleByText(page, "Wolfdog", `${viewportName}-09-hybrid-wolfdog`);
}

async function main() {
  await ensureDir(OUTPUT_DIR);

  const browser = await chromium.launch({ headless: true });

  try {
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: {
          width: viewport.width,
          height: viewport.height,
        },
      });

      await waitForApp(page);
      await prepareDemoState(page);
      await createOneBirthCycle(page);
      await captureCoreSet(page, viewport.name);
      await page.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`UI handoff screenshots saved to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
