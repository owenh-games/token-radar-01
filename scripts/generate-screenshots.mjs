import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildRadarBoard, calculateRadarStats } from '../lib/model.ts';

mkdirSync('screenshots', { recursive: true });
mkdirSync('dashboard', { recursive: true });

// 1. Generate data.js in dashboard/ so browser can load it directly
const snapshotPath = process.argv[2] || '/data/home/makefun/entries/token-radar-01-kit/input/snapshot.json';
const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
const rows = buildRadarBoard(snapshot, 200);
const stats = calculateRadarStats(snapshot, rows);

const dataJs = `window.TOKEN_RADAR_DATA = ${JSON.stringify({ as_of: snapshot.as_of, stats, rows, protocols: snapshot.protocols }, null, 2)};\n`;
writeFileSync(resolve('dashboard/data.js'), dataJs, 'utf8');
console.log('Generated dashboard/data.js');

const absIndex = resolve('dashboard/index.html');
const fileUrl = `file://${absIndex}`;

console.log('Generating screenshots using headless Chrome...');

// 1. Board view
execSync(`google-chrome --headless --disable-gpu --window-size=1440,1200 --virtual-time-budget=5000 --screenshot=screenshots/1-board.png "${fileUrl}"`);
console.log('Generated 1-board.png');

// 2. Detail view
execSync(`google-chrome --headless --disable-gpu --window-size=1440,1200 --virtual-time-budget=5000 --screenshot=screenshots/2-detail.png "${fileUrl}?view=detail"`);
console.log('Generated 2-detail.png');

// 3. Filtered view
execSync(`google-chrome --headless --disable-gpu --window-size=1440,1200 --virtual-time-budget=5000 --screenshot=screenshots/3-filtered.png "${fileUrl}?filter=watchlist"`);
console.log('Generated 3-filtered.png');

execSync('ls -lh screenshots/');
console.log('Screenshots generated successfully.');
