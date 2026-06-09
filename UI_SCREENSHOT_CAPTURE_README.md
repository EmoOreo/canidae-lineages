# Canidae Lineages UI Screenshot Capture

This adds an automated Playwright screenshot capture script for UI/UX handoff packages.

## Files

Copy this into the repo:

```txt
scripts/capture-ui-screenshots.mjs
```

## First-time setup

From the project root:

```powershell
npm install -D playwright
npx playwright install chromium
```

## Run the app

Terminal 1:

```powershell
npm run dev
```

## Capture screenshots

Terminal 2:

```powershell
node scripts/capture-ui-screenshots.mjs
```

Screenshots will be saved to:

```txt
screenshots/ui-handoff
```

## Optional environment variables

Use a different app URL:

```powershell
$env:CANIDAE_APP_URL="http://localhost:5173"
node scripts/capture-ui-screenshots.mjs
```

Use a different output folder:

```powershell
$env:CANIDAE_SCREENSHOT_DIR="screenshots/designer-handoff"
node scripts/capture-ui-screenshots.mjs
```

## What it captures

For desktop, tablet, and mobile:

```txt
01 dashboard collapsed
02 dashboard expanded
03 breeding lab
04 kennel management
05 latest report
06 founder domestic dog
07 founder gray wolf
08 extinct dire wolf
09 hybrid wolfdog
```

## Notes

The script resets the local save before capture, starts one pregnancy, advances gestation, births one litter, expands/collapses details, and captures the current UI state.
