import { readFileSync, writeFileSync, cpSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildRadarBoard, calculateRadarStats } from './lib/model.ts';
import type { Snapshot } from './lib/model.ts';
import { buildDossier } from './vendor/makefun-board.ts';

const inputPath = process.argv.includes('--input')
  ? process.argv[process.argv.indexOf('--input') + 1]
  : '/input/snapshot.json';

const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

console.log(`[TokenRadar] Reading snapshot from ${inputPath}...`);
const raw = readFileSync(inputPath, 'utf8');
const snapshot: Snapshot = JSON.parse(raw);

console.log(`[TokenRadar] Computing radar board and statistics...`);
const rows = buildRadarBoard(snapshot, 200);
const stats = calculateRadarStats(snapshot, rows);

console.log(`[TokenRadar] Writing output files to ${outputDir}...`);
mkdirSync(outputDir, { recursive: true });
mkdirSync(join(outputDir, 'dashboard'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });

writeFileSync(join(outputDir, 'board.json'), JSON.stringify({ rows }, null, 2), 'utf8');

const dashboardDataJs = `window.TOKEN_RADAR_DATA = ${JSON.stringify({ as_of: snapshot.as_of, stats, rows, protocols: snapshot.protocols }, null, 2)};\n`;
writeFileSync(join(outputDir, 'dashboard', 'data.js'), dashboardDataJs, 'utf8');

cpSync('dashboard', join(outputDir, 'dashboard'), { recursive: true });
cpSync('screenshots', join(outputDir, 'screenshots'), { recursive: true });

const dossierBytes = buildDossier(outputDir, { text_max_bytes: 65536 });
writeFileSync(join(outputDir, 'dossier.json'), dossierBytes);

// Validate row count and constraints
if (rows.length < 100 || rows.length > 4000) {
  throw new Error(`Invalid row count: ${rows.length}. Expected between 100 and 4000.`);
}

console.log(`[TokenRadar] Successfully generated board with ${rows.length} rows, ${stats.watchlistCount} watchlist protocols, and dossier size ${dossierBytes.length} bytes.`);

