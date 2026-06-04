<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ChiroDesk Admin Dashboard</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, -apple-system, sans-serif; background: #111827; color: #f3f4f6; min-height: 100vh; }
  #pin-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .pin-card { background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 40px; max-width: 360px; width: 100%; text-align: center; }
  .pin-card h2 { color: #0d7a6e; font-size: 1.5rem; margin-bottom: 8px; }
  .pin-card p { color: #9ca3af; font-size: 0.875rem; margin-bottom: 24px; }
  .pin-input { width: 100%; background: #374151; border: 1px solid #4b5563; border-radius: 8px; padding: 12px 16px; font-size: 1.5rem; letter-spacing: 0.5rem; color: #f3f4f6; text-align: center; outline: none; margin-bottom: 16px; }
  .pin-input:focus { border-color: #0d7a6e; }
  .btn { background: #0d7a6e; color: white; border: none; border-radius: 8px; padding: 12px 24px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
  .btn:hover { background: #0a6a60; }
  .btn-gray { background: #374151; }
  .btn-gray:hover { background: #4b5563; }
  #app { display: none; }
  .header { background: #1f2937; border-bottom: 1px solid #374151; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
  .header h1 { color: #0d7a6e; font-size: 1.25rem; font-weight: 700; }
  .header span { color: #9ca3af; font-size: 0.75rem; }
  .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
  .section-title { font-size: 1rem; font-weight: 600; color: #e5e7eb; margin-bottom: 16px; margin-top: 32px; display: flex; align-items: center; gap: 8px; }
  .section-title:first-child { margin-top: 0; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .card { background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 20px; }
  .card-label { font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  .card-value { font-size: 2rem; font-weight: 700; color: #f3f4f6; }
  .card-sub { font-size: 0.75rem; color: #6b7280; margin-top: 4px; }
  .card-teal .card-value { color: #0d7a6e; }
  .card-green .card-value { color: #10b981; }
  .card-yellow .card-value { color: #f59e0b; }
  .card-red .card-value { color: #ef4444; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 10px 12px; font-size: 0.75rem; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #374151; }
  td { padding: 12px; font-size: 0.875rem; border-bottom: 1px solid #1f2937; }
  tr:hover td { background: #1f2937; }
  .table-wrap { background: #111827; border: 1px solid #374151; border-radius: 12px; overflow: hidden; margin-bottom: 24px; overflow-x: auto; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
  .badge-green { background: #064e3b; color: #34d399; }
  .badge-yellow { background: #78350f; color: #fcd34d; }
  .badge-red { background: #7f1d1d; color: #f87171; }
  .badge-blue { background: #1e3a5f; color: #60a5fa; }
  .ping-row { display: flex; align-items: center; gap-8px; padding: 10px 12px; border-bottom: 1px solid #1f2937; font-size: 0.875rem; }
  .ping-row:last-child { border-bottom: none; }
  .ping-dot { width: 10px; height: 10px; border-radius: 50%; background: #6b7280; margin-right: 10px; flex-shrink: 0; }
  .ping-dot.up { background: #10b981; box-shadow: 0 0 6px #10b981; }
  .ping-dot.down { background: #ef4444; }
  .ping-dot.checking { background: #f59e0b; animation: pulse 1s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  @media(max-width:768px) { .two-col { grid-template-columns: 1fr; } }
  .action-item { background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; display: flex; align-items: center; gap-12px; }
  .action-icon { font-size: 1.25rem; margin-right: 12px; }
  .action-text { flex: 1; }
  .action-text strong { color: #e5e7eb; font-size: 0.875rem; }
  .action-text p { color: #9ca3af; font-size: 0.75rem; margin-top: 2px; }
  .revenue-bar { height: 24px; background: #374151; border-radius: 6px; margin-bottom: 8px; overflow: hidden; }
  .revenue-fill { height: 100%; background: #0d7a6e; border-radius: 6px; display: flex; align-items: center; padding-left: 8px; font-size: 0.7rem; color: white; white-space: nowrap; }
  .logout-btn { background: transparent; border: 1px solid #374151; color: #9ca3af; border-radius: 6px; padding: 6px 14px; font-size: 0.75rem; cursor: pointer; }
  .logout-btn:hover { color: #f3f4f6; border-color: #6b7280; }
  .refresh-btn { background: transparent; border: 1px solid #0d7a6e; color: #0d7a6e; border-radius: 6px; padding: 6px 14px; font-size: 0.75rem; cursor: pointer; margin-right: 8px; }
  .refresh-btn:hover { background: #0d7a6e; color: white; }
</style>
</head>
<body>

<div id="pin-screen">
  <div class="pin-card">
    <div style="font-size:2.5rem;margin-bottom:12px">🏥</div>
    <h2>ChiroDesk Admin</h2>
    <p>Enter PIN to access the admin dashboard</p>
    <input id="pin-input" class="pin-input" type="password" maxlength="4" placeholder="••••" autofocus />
    <button class="btn" style="width:100%" onclick="checkPin()">Unlock Dashboard</button>
    <p id="pin-error" style="color:#ef4444;margin-top:12px;font-size:0.8rem;display:none">Incorrect PIN. Try again.</p>
  </div>
</div>

<div id="app">
  <div class="header">
    <div>
      <h1>🏥 ChiroDesk Admin</h1>
      <span>Demo Dashboard · dralanhiatt-source.github.io</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <button class="refresh-btn" onclick="recheckSites()">🔄 Ping Sites</button>
      <button class="logout-btn" onclick="logout()">Logout</button>
    </div>
  </div>

  <div class="container">

    <!-- Overview Cards -->
    <div class="section-title">📊 Overview</div>
    <div class="cards">
      <div class="card card-teal">
        <div class="card-label">Total Subscribers</div>
        <div class="card-value">3</div>
        <div class="card-sub">Active paid plans</div>
      </div>
      <div class="card card-green">
        <div class="card-label">MRR</div>
        <div class="card-value">$387</div>
        <div class="card-sub">Monthly recurring</div>
      </div>
      <div class="card card-yellow">
        <div class="card-label">Trial Users</div>
        <div class="card-value">12</div>
        <div class="card-sub">Active free trials</div>
      </div>
      <div class="card card-red">
        <div class="card-label">Churn Rate</div>
        <div class="card-value">2.1%</div>
        <div class="card-sub">Last 30 days</div>
      </div>
      <div class="card">
        <div class="card-label">Projected ARR</div>
        <div class="card-value" style="color:#a78bfa">$4,644</div>
        <div class="card-sub">Annualized</div>
      </div>
    </div>

    <div class="two-col">
      <div>
        <!-- Customer List -->
        <div class="section-title">👥 Customer List</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Practice</th>
                <th>Specialty</th>
                <th>Plan</th>
                <th>MRR</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Dr. Alan Hiatt</td>
                <td>Hiatt Chiropractic</td>
                <td>Chiro</td>
                <td>Pro</td>
                <td>$129</td>
                <td><span class="badge badge-green">Active</span></td>
              </tr>
              <tr>
                <td>Dr. Sarah Chen</td>
                <td>Align Wellness</td>
                <td>Chiro</td>
                <td>Pro</td>
                <td>$129</td>
                <td><span class="badge badge-green">Active</span></td>
              </tr>
              <tr>
                <td>Mark Torres, LMT</td>
                <td>Restore Massage</td>
                <td>Massage</td>
                <td>Starter</td>
                <td>$79</td>
                <td><span class="badge badge-green">Active</span></td>
              </tr>
              <tr>
                <td>Dr. Emily Park</td>
                <td>Mindful PT</td>
                <td>PT</td>
                <td>Trial</td>
                <td>—</td>
                <td><span class="badge badge-yellow">Trial</span></td>
              </tr>
              <tr>
                <td>Dr. James Webb</td>
                <td>Webb Acupuncture</td>
                <td>Acupuncture</td>
                <td>Trial</td>
                <td>—</td>
                <td><span class="badge badge-yellow">Trial</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Revenue by Tier -->
        <div class="section-title">💰 Revenue by Tier</div>
        <div class="card" style="margin-bottom:24px">
          <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:#9ca3af;margin-bottom:4px">
              <span>Starter ($79/mo)</span><span>1 × $79 = $79</span>
            </div>
            <div class="revenue-bar">
              <div class="revenue-fill" style="width:20%">$79</div>
            </div>
          </div>
          <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:#9ca3af;margin-bottom:4px">
              <span>Pro ($129/mo)</span><span>2 × $129 = $258</span>
            </div>
            <div class="revenue-bar">
              <div class="revenue-fill" style="width:67%;background:#0a5a8a">$258</div>
            </div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:#9ca3af;margin-bottom:4px">
              <span>Elite ($249/mo)</span><span>0 × $249 = $0</span>
            </div>
            <div class="revenue-bar">
              <div class="revenue-fill" style="width:1%;background:#5a1a8a"></div>
            </div>
          </div>
          <div style="border-top:1px solid #374151;padding-top:12px;margin-top:12px;display:flex;justify-content:space-between">
            <span style="font-size:0.875rem;color:#9ca3af">Total MRR</span>
            <span style="font-weight:700;color:#10b981">$387 / mo</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:4px">
            <span style="font-size:0.875rem;color:#9ca3af">Projected ARR</span>
            <span style="font-weight:700;color:#a78bfa">$4,644 / yr</span>
          </div>
        </div>
      </div>

      <div>
        <!-- Site Health -->
        <div class="section-title">🌐 Site Health <span id="ping-status" style="font-size:0.75rem;color:#6b7280;font-weight:400">Checking...</span></div>
        <div class="table-wrap" style="margin-bottom:24px">
          <div id="site-list">
            <!-- Populated by JS -->
          </div>
        </div>

        <!-- Recent Signups -->
        <div class="section-title">🆕 Recent Signups</div>
        <div class="table-wrap" style="margin-bottom:24px">
          <table>
            <thead>
              <tr><th>Name</th><th>Plan</th><th>Date</th></tr>
            </thead>
            <tbody>
              <tr><td>Dr. James Webb</td><td><span class="badge badge-yellow">Trial</span></td><td>2026-05-20</td></tr>
              <tr><td>Dr. Emily Park</td><td><span class="badge badge-yellow">Trial</span></td><td>2026-05-18</td></tr>
              <tr><td>Dr. Sarah Chen</td><td><span class="badge badge-blue">Pro</span></td><td>2026-05-15</td></tr>
              <tr><td>Mark Torres</td><td><span class="badge badge-green">Starter</span></td><td>2026-05-10</td></tr>
              <tr><td>Dr. Alan Hiatt</td><td><span class="badge badge-blue">Pro</span></td><td>2026-04-01</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Action Needed -->
        <div class="section-title">⚠️ Action Needed</div>
        <div style="margin-bottom:24px">
          <div class="action-item">
            <span class="action-icon">💳</span>
            <div class="action-text">
              <strong>Payment Failed — Dr. Emily Park</strong>
              <p>Card declined on May 19. Retry or contact customer.</p>
            </div>
            <span class="badge badge-red">Urgent</span>
          </div>
          <div class="action-item">
            <span class="action-icon">⏰</span>
            <div class="action-text">
              <strong>Trial Ending — Dr. James Webb</strong>
              <p>Free trial expires in 3 days (May 24)</p>
            </div>
            <span class="badge badge-yellow">3 days</span>
          </div>
          <div class="action-item">
            <span class="action-icon">⏰</span>
            <div class="action-text">
              <strong>Trial Ending — Dr. Emily Park</strong>
              <p>Free trial expires in 5 days (May 26)</p>
            </div>
            <span class="badge badge-yellow">5 days</span>
          </div>
        </div>
      </div>
    </div>

    <div style="text-align:center;color:#4b5563;font-size:0.75rem;padding:24px 0;border-top:1px solid #1f2937">
      ChiroDesk Admin · Demo Data · Built by dralanhiatt-source · 2026
    </div>
  </div>
</div>

<script>
const CORRECT_PIN = '9999'
const SESSION_KEY = 'chirodesk_admin_auth'
const SESSION_EXPIRY = 24 * 60 * 60 * 1000

const SITES = [
  { name: 'chiro-practice-mgmt', url: 'https://dralanhiatt-source.github.io/chiro-practice-mgmt/' },
  { name: 'chiro-practice', url: 'https://dralanhiatt-source.github.io/chiro-practice/' },
  { name: 'snaptax', url: 'https://dralanhiatt-source.github.io/snaptax/' },
  { name: 'yearmap', url: 'https://dralanhiatt-source.github.io/yearmap/' },
  { name: 'seminarcheckin', url: 'https://dralanhiatt-source.github.io/seminarcheckin/' },
  { name: 'lifepulse', url: 'https://dralanhiatt-source.github.io/lifepulse/' },
  { name: 'lessons', url: 'https://dralanhiatt-source.github.io/lessons/' },
  { name: 'chirodesk-landing', url: 'https://dralanhiatt-source.github.io/chirodesk-landing/' },
]

function checkSession() {
  const stored = sessionStorage.getItem(SESSION_KEY)
  if (!stored) return false
  try {
    const { ts } = JSON.parse(stored)
    return (Date.now() - ts) < SESSION_EXPIRY
  } catch { return false }
}

function unlock() {
  document.getElementById('pin-screen').style.display = 'none'
  document.getElementById('app').style.display = 'block'
  renderSites()
  recheckSites()
}

function checkPin() {
  const val = document.getElementById('pin-input').value
  if (val === CORRECT_PIN) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now() }))
    unlock()
  } else {
    document.getElementById('pin-error').style.display = 'block'
    document.getElementById('pin-input').value = ''
    document.getElementById('pin-input').focus()
  }
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY)
  location.reload()
}

document.getElementById('pin-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkPin()
})

function renderSites() {
  const container = document.getElementById('site-list')
  container.innerHTML = SITES.map(s => `
    <div class="ping-row" id="ping-${s.name}" style="display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid #1f2937">
      <div class="ping-dot checking" id="dot-${s.name}"></div>
      <div style="flex:1">
        <div style="font-size:0.875rem">${s.name}</div>
        <div style="font-size:0.7rem;color:#6b7280">${s.url}</div>
      </div>
      <span id="status-${s.name}" style="font-size:0.75rem;color:#6b7280">checking...</span>
    </div>
  `).join('')
}

async function pingSite(site) {
  const dot = document.getElementById('dot-' + site.name)
  const status = document.getElementById('status-' + site.name)
  dot.className = 'ping-dot checking'
  status.textContent = 'checking...'
  status.style.color = '#f59e0b'
  const start = Date.now()
  try {
    const r = await fetch(site.url, { method: 'HEAD', cache: 'no-cache', signal: AbortSignal.timeout(8000) })
    const ms = Date.now() - start
    if (r.ok || r.status === 200 || r.status === 304) {
      dot.className = 'ping-dot up'
      status.textContent = `✓ ${ms}ms`
      status.style.color = '#10b981'
    } else {
      dot.className = 'ping-dot down'
      status.textContent = `✗ ${r.status}`
      status.style.color = '#ef4444'
    }
  } catch(e) {
    const ms = Date.now() - start
    // For GitHub Pages, CORS errors on HEAD still mean the site is up
    if (e.message?.includes('CORS') || e.message?.includes('Failed to fetch') || e.name === 'TypeError') {
      dot.className = 'ping-dot up'
      status.textContent = `~ CORS (likely up)`
      status.style.color = '#34d399'
    } else {
      dot.className = 'ping-dot down'
      status.textContent = `✗ timeout`
      status.style.color = '#ef4444'
    }
  }
}

function recheckSites() {
  const statusEl = document.getElementById('ping-status')
  statusEl.textContent = 'Pinging...'
  Promise.all(SITES.map(pingSite)).then(() => {
    statusEl.textContent = 'Last checked: ' + new Date().toLocaleTimeString()
  })
}

// Init
if (checkSession()) {
  unlock()
}
</script>
</body>
</html>
