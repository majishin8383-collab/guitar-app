// Runs against a disposable browser profile in CI. No learner data is touched.
// YouTube is isolated here; real embedded playback is a separate deployment check.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const root = path.resolve(new URL('..', import.meta.url).pathname);
const output = path.join(root, 'test-results');
await fs.mkdir(output, { recursive: true });
const missing = [], errors = [], passed = [];
const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const filename = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!filename.startsWith(root + '/') || !/\.(html|css|js)$/.test(filename)) {
    res.writeHead(404); res.end(); return;
  }
  try {
    const data = await fs.readFile(filename);
    res.writeHead(200, { 'Content-Type': filename.endsWith('.js') ? 'text/javascript' : filename.endsWith('.css') ? 'text/css' : 'text/html' });
    res.end(data);
  } catch {
    missing.push(pathname); res.writeHead(404); res.end();
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await context.route('https://www.youtube.com/**', route => route.fulfill({
  contentType: 'text/html',
  body: '<body style="background:#111;color:#bbb;font:14px sans-serif">YouTube player omitted in automated UI checks.</body>'
}));
await context.addInitScript(() => {
  window.__testClicks = 0;
  const original = AudioContext.prototype.createOscillator;
  AudioContext.prototype.createOscillator = function (...args) {
    window.__testClicks++;
    return original.apply(this, args);
  };
});
const page = await context.newPage();
page.setDefaultTimeout(10000);
page.on('pageerror', error => errors.push(error.message));
await page.clock.install();
const button = name => page.getByRole('button', { name, exact: true });
const check = name => { passed.push(name); console.log('PASS:', name); };
const noOverflow = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'phone layout must not scroll sideways');
async function completeRun(seconds) {
  assert.equal(await button('I kept going — save').isEnabled(), false);
  await button('Start run').click();
  await page.clock.fastForward((seconds - 1) * 1000);
  assert.equal(await button('I kept going — save').isEnabled(), false, 'completion must wait for the whole run');
  await page.clock.fastForward(1200);
  await button('I kept going — save').click();
  assert.equal(await button('I kept going — save').isEnabled(), false, 'save cannot repeat');
}
try {
  await page.goto(url);
  await page.getByRole('heading', { name: 'Today’s blues practice' }).waitFor();
  await noOverflow();
  await page.screenshot({ path: path.join(output, 'phone-home.png'), fullPage: true });
  await button('Songs').click();
  for (const level of ['Easy', 'Medium', 'Hard']) assert.equal(await button(level).isEnabled(), false);
  await button('Home').click();
  await button('Start here').click();
  await page.getByRole('heading', { name: 'Steady Time', exact: true }).waitFor();
  assert.match(await page.locator('.screenTop').innerText(), /Left-handed/);
  await button('Start metronome · 80 BPM').click();
  assert.ok(await page.evaluate(() => window.__testClicks) > 0);
  await button('Home').click();
  const stoppedAt = await page.evaluate(() => window.__testClicks);
  await page.clock.fastForward(2000);
  assert.equal(await page.evaluate(() => window.__testClicks), stoppedAt);
  check('Fresh start, prerequisites, lefty default, Home navigation, metronome cleanup');

  await button('Start here').click();
  await button('Start run').click();
  await page.clock.fastForward(10000);
  await button('I stopped — restart').click();
  assert.equal(await page.locator('#run-time').innerText(), '60s');
  assert.equal(await button('I kept going — save').isEnabled(), false);
  await completeRun(60);
  await button('Continue').click();
  await page.getByRole('heading', { name: 'First Groove', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => scrollY), 0, 'the next activity opens at its instructions');
  await button('Songs').click();
  assert.equal(await button('Easy').isEnabled(), true);
  assert.equal(await button('Medium').isEnabled(), false);
  assert.equal(await button('Hard').isEnabled(), false);
  check('Restart, minimum duration, warm-up completion, Easy unlock');

  await button('Easy').click();
  await page.getByText('Show the small chord shapes', { exact: true }).click();
  await noOverflow();
  assert.equal(await page.locator('.chordDiagram').count(), 2);
  assert.match(await page.locator('iframe').getAttribute('src'), /nm7neHuVuic/);
  assert.equal(await page.getByRole('link', { name: 'Open on YouTube' }).getAttribute('href'), 'https://www.youtube.com/watch?v=nm7neHuVuic');
  await page.screenshot({ path: path.join(output, 'phone-first-groove.png'), fullPage: true });
  await completeRun(60);
  await page.reload();
  await button('Home').click();
  assert.match(await page.locator('.practiceNext').innerText(), /1\/3 levels completed/);
  assert.match(await page.locator('.practiceNext').innerText(), /Medium/);
  await button('Continue practice').click();
  assert.match(await page.locator('iframe').getAttribute('src'), /7QdfK0Vs1nM/);
  await completeRun(75);
  await button('Continue to Hard').click();
  assert.match(await page.locator('iframe').getAttribute('src'), /dYzQfWD8bGk/);
  await completeRun(90);
  await button('Continue to Small Chord Changes').click();
  await page.getByRole('heading', { name: 'Small Chord Changes', exact: true }).waitFor();
  await completeRun(60);
  await button('Continue').click();
  await page.getByRole('heading', { name: 'Blues jam', exact: true }).waitFor();
  await noOverflow();
  check('Easy, Medium, Hard, reload persistence, chord lesson and jam progression');

  await button('Back').click();
  assert.equal(await page.evaluate(() => scrollY), 0, 'Home opens at the top after leaving a long screen');
  await button('Songs').click();
  await button('✓ Easy').click();
  await completeRun(60);
  await button('Continue to blues jam').click();
  await page.getByRole('heading', { name: 'Blues jam', exact: true }).waitFor();
  await button('Back').click();
  check('Replaying a completed level continues to the actual next activity');
  await button('Settings').click();
  await button('Mirroring: ON').click();
  await page.reload();
  assert.equal(await button('Mirroring: OFF').isVisible(), true);
  await page.getByLabel('Guitar for tone suggestions').selectOption('les-paul');
  await button('Back').click();
  await button('Core Learning').click();
  await page.locator('[data-skill="core_time_steady"]').click();
  await page.getByText('Watch the lesson', { exact: true }).click();
  assert.equal(await page.locator('.mirror').count(), 0);
  await page.getByText('Guitar & amp starting point', { exact: true }).click();
  assert.match(await page.locator('main').innerText(), /Les Paul/);
  await button('Back').click();
  await page.getByRole('heading', { name: 'Core Learning', exact: true }).waitFor();
  await button('Back').click();
  await noOverflow();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: path.join(output, 'desktop-home.png'), fullPage: true });
  check('Mirror OFF and guitar settings persist; Core Back works; desktop layout');
  assert.deepEqual(errors, []);
  assert.deepEqual(missing, []);
  check('No application exceptions or missing local assets');
} catch (error) {
  await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }).catch(() => {});
  throw error;
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ passed, errors, missing, externalMedia: 'isolated; real playback must be checked separately' }, null, 2));
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
