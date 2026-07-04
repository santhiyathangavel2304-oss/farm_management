/* ==========================================================================
   AgriGuard AI — App shell: sidebar, topbar, theme, layout injection
   ========================================================================== */

const AG_NAV = [
  { section: "Overview", items: [
    { id:"dashboard", label:"Dashboard", icon:"bi-grid-1x2-fill", href:"dashboard.html" }
  ]},
  { section: "Farm Operations", items: [
    { id:"animals", label:"Animal Management", icon:"bi-clipboard2-pulse-fill", href:"animals.html" },
    { id:"amu", label:"Medicine & AMU Tracking", icon:"bi-capsule", href:"amu.html" },
    { id:"mrl", label:"MRL Monitoring", icon:"bi-shield-check", href:"mrl.html" }
  ]},
  { section: "AI Tools", items: [
    { id:"assistant", label:"AI Farm Assistant", icon:"bi-stars", href:"assistant.html" },
    { id:"disease", label:"AI Disease Detection", icon:"bi-camera-fill", href:"disease.html", badge:"AI" }
  ]},
  { section: "Insights", items: [
    { id:"reports", label:"Reports & Analytics", icon:"bi-bar-chart-line-fill", href:"reports.html" },
    { id:"notifications", label:"Notifications", icon:"bi-bell-fill", href:"notifications.html" },
    { id:"settings", label:"Settings", icon:"bi-gear-fill", href:"settings.html" }
  ]}
];

function ag_buildSidebar(activeId){
  const sectionsHtml = AG_NAV.map(sec => `
    <div class="sidebar-section-label">${sec.section}</div>
    ${sec.items.map(item => `
      <a class="nav-item ${item.id===activeId?'active':''}" href="${item.href}">
        <i class="bi ${item.icon}"></i>
        <span>${item.label}</span>
        ${item.badge ? `<span class="badge-dot">${item.badge}</span>` : ''}
      </a>
    `).join('')}
  `).join('');

  return `
  <aside class="sidebar" id="agSidebar">
    <div class="sidebar-brand">
      <div class="mark"><i class="bi bi-flower2"></i></div>
      <div class="brand-text">
        <strong>AgriGuard AI</strong>
        <span>MRL &amp; AMU Platform</span>
      </div>
    </div>
    <nav class="sidebar-nav">${sectionsHtml}</nav>
    <div class="sidebar-foot">
      <div class="sidebar-user" onclick="location.href='settings.html'">
        <img src="https://i.pravatar.cc/64?img=32" alt="User avatar">
        <div class="u-meta">
          <strong>Karthik Subramaniam</strong>
          <span>Farm Manager</span>
        </div>
      </div>
    </div>
  </aside>
  <div class="sidebar-backdrop" id="agSidebarBackdrop"></div>
  `;
}

function ag_buildTopbar(title, subtitle){
  return `
  <header class="topbar">
    <button class="icon-btn mobile-toggle" id="agMobileToggle"><i class="bi bi-list"></i></button>
    <button class="icon-btn d-none d-lg-flex" id="agCollapseToggle"><i class="bi bi-layout-sidebar-inset"></i></button>
    <div>
      <p class="page-title">${title}</p>
      ${subtitle ? `<p class="page-sub">${subtitle}</p>` : ''}
    </div>
    <div class="ms-auto d-flex align-items-center gap-2">
      <div class="search-mini d-none d-md-flex">
        <i class="bi bi-search"></i>
        <input type="text" placeholder="Search animals, records, reports…">
      </div>
      <div class="theme-toggle" id="agThemeToggle">
        <div class="seg" data-mode="light"><i class="bi bi-sun-fill"></i></div>
        <div class="seg" data-mode="dark"><i class="bi bi-moon-stars-fill"></i></div>
      </div>
      <button class="icon-btn position-relative" onclick="location.href='notifications.html'">
        <i class="bi bi-bell-fill"></i>
        <span class="ping"></span>
      </button>
    </div>
  </header>
  `;
}

function ag_initShell(activeId, title, subtitle){
  document.getElementById('agShellSidebar').outerHTML = ag_buildSidebar(activeId);
  document.getElementById('agShellTopbar').outerHTML = ag_buildTopbar(title, subtitle);

  // Theme init
  const savedTheme = localStorage.getItem('ag-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  ag_updateThemeToggleUI(savedTheme);

  document.getElementById('agThemeToggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ag-theme', next);
    ag_updateThemeToggleUI(next);
    window.dispatchEvent(new CustomEvent('ag-theme-changed', {detail:{theme:next}}));
  });

  // Sidebar collapse (desktop)
  const collapseBtn = document.getElementById('agCollapseToggle');
  const sidebar = document.getElementById('agSidebar');
  const mainCol = document.getElementById('agMainCol');
  const savedCollapsed = localStorage.getItem('ag-sidebar-collapsed') === 'true';
  if(savedCollapsed){ sidebar.classList.add('collapsed'); mainCol.classList.add('sidebar-collapsed'); }
  collapseBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainCol.classList.toggle('sidebar-collapsed');
    localStorage.setItem('ag-sidebar-collapsed', sidebar.classList.contains('collapsed'));
  });

  // Mobile toggle
  const mobileToggle = document.getElementById('agMobileToggle');
  const backdrop = document.getElementById('agSidebarBackdrop');
  mobileToggle.addEventListener('click', () => {
    sidebar.classList.add('mobile-open');
    backdrop.classList.add('show');
  });
  backdrop.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    backdrop.classList.remove('show');
  });
}

function ag_updateThemeToggleUI(mode){
  document.querySelectorAll('#agThemeToggle .seg').forEach(seg => {
    seg.classList.toggle('active', seg.dataset.mode === mode);
  });
}

// Auth guard (simple demo — checks localStorage flag set by login page)
function ag_requireAuth(){
  if(!sessionStorage.getItem('ag-authed')){
    // Soft guard for demo purposes; allow direct navigation but seed the flag
    sessionStorage.setItem('ag-authed', 'true');
  }
}

function ag_toast(message, tint = 'green', icon = 'check-circle-fill'){
  let container = document.getElementById('agToastContainer');
  if(!container){
    container = document.createElement('div');
    container.id = 'agToastContainer';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:2000;display:flex;flex-direction:column;gap:.6rem;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'glass-card animate-in';
  toast.style.cssText = 'padding:.85rem 1.1rem;display:flex;align-items:center;gap:.6rem;min-width:260px;box-shadow:var(--shadow-lg);';
  toast.innerHTML = `<span class="pill pill-${tint}" style="width:32px;height:32px;border-radius:50%;justify-content:center;"><i class="bi bi-${icon}"></i></span><span style="font-size:.87rem;font-weight:500;">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
