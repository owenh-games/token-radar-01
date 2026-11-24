# token-radar-01

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/owenh-games/token-radar-01/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/owenh-games/token-radar-01/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

Token Radar turns a sealed snapshot of 758 DeFi protocols (40 on a watchlist, a $50M TVL floor, as of 2026-11-14) into a ranked token-launch radar. It scores every protocol by implied value -- 40% of TVL, boosted 2.5x for watchlist protocols, scaled by 7-day momentum and by age since listing -- ranks the top 200 into board.json with concrete farm steps for each protocol, and builds a dossier.json plus a dashboard, so you can see which protocols are worth farming for a potential token launch.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input snapshot.json
```


## How it works

- **Input:** the kit's sealed snapshot (`kit/input/snapshot.json`): 758 protocols with TVL, 7-day change, market cap, listing date and token identifiers, plus a 40-protocol watchlist; protocols below the $50M TVL floor are excluded.
- **Score:** `implied_value_usd = 0.4 * tvl_usd`, multiplied by 2.5 for watchlist protocols, by `1 + min(change_7d, 200%)` when the 7-day change is positive, and by `clamp(days_since_listing / 180, 0.8, 3.0)`.
- **Output:** `board.json` (top 200 rows, each with rank, implied value and 3-12 farm steps), `dossier.json`, and a `dashboard/` with board, protocol-detail and filtered views plus `screenshots/`.
- **Deterministic:** two runs over the same snapshot produce byte-identical output. Node 22 standard library only, no network access.

`snapshot.json` above is the sealed snapshot from the kit. In the grader the program runs as `node main.ts`, reading `/input/snapshot.json` and writing `/output`.

Built for [make.fun's "Build the best token launch radar" bounty](https://make.fun/bounty/token-radar-01).

---

<sub>Entered on [make.fun](https://make.fun/?ref=bqe4a61g&utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
