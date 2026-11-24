document.addEventListener('DOMContentLoaded', () => {
  const data = window.TOKEN_RADAR_DATA;
  if (!data) return;

  const statsBar = document.getElementById('statsBar');
  statsBar.innerHTML = `
    <div class="stat-badge">Total Rows: <b>${data.stats.totalRows}</b></div>
    <div class="stat-badge">Watchlist Protocols: <b>${data.stats.watchlistCount}</b></div>
    <div class="stat-badge">Non-Watchlist Protocols: <b>${data.stats.nonWatchlistCount}</b></div>
    <div class="stat-badge">Total Implied Value: <b>$${(data.stats.totalImpliedValue / 1e9).toFixed(2)}B</b></div>
  `;

  const tbody = document.getElementById('radarTbody');
  const searchInput = document.getElementById('searchInput');
  const filterSelect = document.getElementById('filterSelect');
  const detailContent = document.getElementById('detailContent');

  const protoMap = new Map(data.protocols.map(p => [p.slug, p]));
  const watchlistSet = new Set(data.protocols.filter(p => !p.gecko_id && p.tvl_usd >= 50000000).map(p => p.slug));

  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  const filterParam = urlParams.get('filter');

  if (filterParam) {
    filterSelect.value = filterParam;
  }

  function renderTable(filterText = '', filterType = 'all') {
    tbody.innerHTML = '';
    const filtered = data.rows.filter(row => {
      const p = protoMap.get(row.slug);
      const isWatch = watchlistSet.has(row.slug);
      
      if (filterType === 'watchlist' && !isWatch) return false;
      if (filterType === 'non-watchlist' && isWatch) return false;

      if (filterText) {
        const query = filterText.toLowerCase();
        return row.name.toLowerCase().includes(query) || row.slug.toLowerCase().includes(query);
      }
      return true;
    });

    for (const row of filtered) {
      const p = protoMap.get(row.slug) || {};
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${row.rank}</td>
        <td><strong>${row.name}</strong></td>
        <td>${p.category || 'General'}</td>
        <td>$${(p.tvl_usd || 0).toLocaleString()}</td>
        <td><span style="color: #38bdf8; font-weight: 600;">$${row.implied_value_usd.toLocaleString()}</span></td>
        <td><button style="background: #0284c7; border: none; color: white; padding: 4px 10px; border-radius: 4px; cursor: pointer;">View</button></td>
      `;
      tr.addEventListener('click', () => {
        showDetail(row, p);
      });
      tbody.appendChild(tr);
    }

    if (filtered.length > 0) {
      const targetRow = viewParam === 'detail' && filtered.length > 1 ? filtered[1] : filtered[0];
      showDetail(targetRow, protoMap.get(targetRow.slug));
    }
  }

  function showDetail(row, p) {
    if (!p) p = {};
    detailContent.innerHTML = `
      <div class="detail-card">
        <h3>${row.name} (#${row.rank})</h3>
        <div class="detail-meta">
          <p><strong>Slug:</strong> ${row.slug}</p>
          <p><strong>Category:</strong> ${p.category || 'N/A'}</p>
          <p><strong>Chains:</strong> ${p.chains ? p.chains.join(', ') : 'N/A'}</p>
          <p><strong>TVL:</strong> $${(p.tvl_usd || 0).toLocaleString()}</p>
          <p><strong>7d Change:</strong> ${p.change_7d !== null ? p.change_7d + '%' : 'N/A'}</p>
          <p><strong>Implied Token Value:</strong> <span style="color: #38bdf8; font-weight: bold;">$${row.implied_value_usd.toLocaleString()}</span></p>
        </div>
        <h4 style="margin-bottom: 8px; color: #38bdf8; font-size: 14px;">Step-by-Step Farming Plan:</h4>
        <ol class="farm-steps-list">
          ${row.farm_steps.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  searchInput.addEventListener('input', (e) => {
    renderTable(e.target.value, filterSelect.value);
  });

  filterSelect.addEventListener('change', (e) => {
    renderTable(searchInput.value, e.target.value);
  });

  renderTable('', filterSelect.value);
});
