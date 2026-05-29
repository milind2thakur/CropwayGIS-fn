# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: climate-risk.spec.ts >> Climate Risk Map >> should render the climate risk page
- Location: e2e\climate-risk.spec.ts:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('aside')
Expected: visible
Error: strict mode violation: locator('aside') resolved to 2 elements:
    1) <aside class="border-r border-black/10 bg-white backdrop-blur-[7px] transition-[width] duration-300 ease-in-out hidden min-h-screen w-[248px] shrink-0 lg:block">…</aside> aka getByRole('complementary').filter({ hasText: 'HomeCrop PlanningMonitoring' })
    2) <aside class="absolute z-[400] rounded-[18px] bg-[#EAF0E6] px-[10px] py-[12px] flex flex-col shadow-[0_8px_26px_rgba(0,0,0,0.08)] border border-white/60 right-[10px] top-[10px] bottom-[10px] w-[324px] xl:w-[342px]">…</aside> aka getByRole('complementary').filter({ hasText: 'Weather API Connection' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('aside')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e5]:
      - generic [ref=e7]:
        - img "Cropway logo" [ref=e9]
        - button "Collapse sidebar" [ref=e10] [cursor=pointer]:
          - img [ref=e12]
      - generic [ref=e13]:
        - navigation [ref=e14]:
          - link "GIS" [ref=e17] [cursor=pointer]:
            - /url: /home
            - img [ref=e18]
            - generic [ref=e20]: GIS
          - link "Seller Studio" [ref=e23] [cursor=pointer]:
            - /url: /home
            - img [ref=e24]
            - generic [ref=e29]: Seller Studio
          - link "Market Place" [ref=e32] [cursor=pointer]:
            - /url: /home
            - img [ref=e33]
            - generic [ref=e39]: Market Place
        - button "User profile" [ref=e41] [cursor=pointer]:
          - img [ref=e42]
    - generic [ref=e46]:
      - complementary [ref=e47]:
        - navigation [ref=e48]:
          - link "Home" [ref=e49] [cursor=pointer]:
            - /url: /home
            - img [ref=e50]
            - generic [ref=e53]: Home
          - link "Crop Planning" [ref=e54] [cursor=pointer]:
            - /url: /crop-planning
            - img [ref=e55]
            - generic [ref=e57]: Crop Planning
          - link "Monitoring & Detection" [ref=e58] [cursor=pointer]:
            - /url: /monitoring-detection
            - img [ref=e59]
            - generic [ref=e62]: Monitoring & Detection
          - link "Land Intelligence" [ref=e63] [cursor=pointer]:
            - /url: /land-intelligence
            - img [ref=e64]
            - generic [ref=e69]: Land Intelligence
          - link "Soil Intelligence" [ref=e70] [cursor=pointer]:
            - /url: /land-intelligence?view=soil-intelligence
            - img [ref=e71]
            - generic [ref=e76]: Soil Intelligence
          - link "Climate & Risk" [ref=e77] [cursor=pointer]:
            - /url: /climate-risk
            - img [ref=e78]
            - generic [ref=e83]: Climate & Risk
          - link "Supply Chain & Logistics" [ref=e84] [cursor=pointer]:
            - /url: /supply-chain-logistics
            - img [ref=e85]
            - generic [ref=e89]: Supply Chain & Logistics
          - link "Carbon & Sustainability" [ref=e90] [cursor=pointer]:
            - /url: /carbon-sustainability
            - img [ref=e91]
            - generic [ref=e102]: Carbon & Sustainability
      - main [ref=e104]:
        - generic [ref=e105]:
          - generic [ref=e107]:
            - generic:
              - generic:
                - img
          - generic:
            - generic: 1 Inch = 1 KM
            - img
            - generic:
              - generic: "0"
              - generic: "1"
              - generic: "2"
              - generic: "3"
            - generic: Kilometer
          - generic [ref=e114]:
            - button "Back" [ref=e115] [cursor=pointer]:
              - img [ref=e116]
              - text: Back
            - heading "Weather alerts" [level=1]
          - generic [ref=e119]:
            - generic [ref=e120]: 40°C
            - generic [ref=e121]: 30°C
          - generic [ref=e122]:
            - button "Temperature layer" [ref=e123] [cursor=pointer]:
              - img [ref=e124]
            - button "Wind layer" [ref=e130] [cursor=pointer]:
              - img [ref=e131]
            - button "Rain layer" [ref=e135] [cursor=pointer]:
              - img [ref=e136]
          - generic [ref=e138]:
            - 'button "Switch map layer. Current: Street. Next: Topographic" [ref=e139] [cursor=pointer]':
              - generic [ref=e140]: Street
            - generic [ref=e141]:
              - button "Zoom in" [ref=e142] [cursor=pointer]:
                - img [ref=e143]
              - button "Zoom out" [ref=e144] [cursor=pointer]:
                - img [ref=e145]
          - complementary [ref=e146]:
            - generic [ref=e147]:
              - heading "Weather API Connection Failed" [level=3] [ref=e148]
              - paragraph [ref=e149]: Request failed.
              - button "Retry" [ref=e150] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e156] [cursor=pointer]:
    - img [ref=e157]
  - alert [ref=e160]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { gotoAuthenticated } from './helpers/auth';
  3  | 
  4  | test.describe('Climate Risk Map', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await gotoAuthenticated(page, '/climate-risk');
  7  |   });
  8  | 
  9  |   test('should render the climate risk page', async ({ page }) => {
  10 |     // The page renders inside GisShell, so the sidebar should be present
> 11 |     await expect(page.locator('aside')).toBeVisible();
     |                                         ^ Error: expect(locator).toBeVisible() failed
  12 |   });
  13 | 
  14 |   test('should render the map container', async ({ page }) => {
  15 |     // Leaflet renders a div.leaflet-container once the map mounts.
  16 |     // Use a longer timeout as map tiles can take a moment to initialise.
  17 |     const mapContainer = page.locator('.leaflet-container');
  18 |     await expect(mapContainer).toBeVisible({ timeout: 15000 });
  19 |   });
  20 | });
  21 | 
```