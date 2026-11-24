export interface SnapshotProtocol {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
}

export interface Snapshot {
  as_of: string;
  source: string;
  floor_usd: number;
  protocols: SnapshotProtocol[];
  watchlist: string[];
}

export interface BoardRow {
  slug: string;
  name: string;
  rank: number;
  implied_value_usd: number;
  farm_steps: string[];
}

export function computeImpliedValue(p: SnapshotProtocol, isWatchlist: boolean, asOfDate?: string): number {
  let base = p.tvl_usd * 0.4;
  if (isWatchlist) {
    base *= 2.5;
  }
  if (p.change_7d !== null && p.change_7d > 0) {
    base *= (1 + Math.min(p.change_7d / 100, 2.0));
  }
  if (p.listed_at) {
    const refTime = asOfDate ? new Date(asOfDate).getTime() : new Date('2026-11-13').getTime();
    const listedTime = new Date(p.listed_at).getTime();
    const days = (refTime - listedTime) / (1000 * 60 * 60 * 24);
    if (days > 0) {
      base *= Math.min(Math.max(days / 180, 0.8), 3.0);
    }
  }
  return Math.max(10000, Math.min(Math.round(base), 999999999999));
}

export function generateFarmSteps(p: SnapshotProtocol): string[] {
  return [
    `Connect your Web3 wallet to the official ${p.name} application interface and initialize your user profile securely.`,
    `Deposit supported liquidity tokens into the primary vaults to start earning reward multipliers and retroactive points daily.`,
    `Interact with cross-chain bridging features across ${p.chains && p.chains.length ? p.chains.slice(0, 3).join(', ') : 'multi-chains'} to boost allocation weights.`,
    `Participate actively in community governance discussions and cast votes on active proposals on decentralized governance forums.`,
    `Monitor your positioning metrics regularly on the dashboard analytics tab to ensure maximum farming efficiency and yield.`
  ];
}

export function buildRadarBoard(snapshot: Snapshot, targetRows = 200): BoardRow[] {
  const watchlistSet = new Set(snapshot.watchlist);
  const candidates: { protocol: SnapshotProtocol; isWatchlist: boolean; value: number }[] = [];

  for (const p of snapshot.protocols) {
    const isWatch = watchlistSet.has(p.slug);
    const value = computeImpliedValue(p, isWatch, snapshot.as_of);
    candidates.push({ protocol: p, isWatchlist: isWatch, value });
  }

  // Ensure all watchlist protocols are included
  const includedSlugs = new Set<string>();
  const selected: { protocol: SnapshotProtocol; isWatchlist: boolean; value: number }[] = [];

  for (const c of candidates) {
    if (c.isWatchlist) {
      selected.push(c);
      includedSlugs.add(c.protocol.slug);
    }
  }

  // Sort remaining candidates by value descending
  const remaining = candidates.filter(c => !includedSlugs.has(c.protocol.slug));
  remaining.sort((a, b) => b.value - a.value);

  for (const c of remaining) {
    if (selected.length >= targetRows) break;
    selected.push(c);
  }

  // Sort all selected by value descending
  selected.sort((a, b) => b.value - a.value);

  const rows: BoardRow[] = [];
  for (let i = 0; i < selected.length; i++) {
    const item = selected[i]!;
    rows.push({
      slug: item.protocol.slug,
      name: item.protocol.name,
      rank: i + 1,
      implied_value_usd: item.value,
      farm_steps: generateFarmSteps(item.protocol)
    });
  }

  return rows;
}

export interface RadarStats {
  totalRows: number;
  watchlistCount: number;
  nonWatchlistCount: number;
  totalImpliedValue: number;
  averageTvl: number;
}

export function calculateRadarStats(snapshot: Snapshot, rows: BoardRow[]): RadarStats {
  const watchlistSet = new Set(snapshot.watchlist);
  let watchlistCount = 0;
  let totalImpliedValue = 0;
  let totalTvl = 0;

  const protocolMap = new Map(snapshot.protocols.map(p => [p.slug, p]));

  for (const r of rows) {
    if (watchlistSet.has(r.slug)) {
      watchlistCount++;
    }
    totalImpliedValue += r.implied_value_usd;
    const proto = protocolMap.get(r.slug);
    if (proto) {
      totalTvl += proto.tvl_usd;
    }
  }

  return {
    totalRows: rows.length,
    watchlistCount,
    nonWatchlistCount: rows.length - watchlistCount,
    totalImpliedValue,
    averageTvl: rows.length ? Math.round(totalTvl / rows.length) : 0
  };
}


