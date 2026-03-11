// ===== Main Application Initialization =====

// Login user display
(function() {
  try {
    const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (user && user.name) {
      document.getElementById('userDisplay').textContent = '원료기획팀 | ' + user.name;
    }
  } catch(e) {}
})();

function logout() {
  sessionStorage.removeItem('loggedInUser');
  location.href = 'login.html';
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    renderCharts(btn.dataset.tab);
  });
});

document.getElementById('currentDate').textContent = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
});

function renderCharts(tab) {
  setTimeout(() => {
    if (tab === 'plan') renderPlanChart();
    if (tab === 'alloc') renderAllocCharts();
    if (tab === 'supplier') renderSupplierCharts();
    if (tab === 'import') renderImportChart();
    if (tab === 'inventory') renderInventoryCharts();
    if (tab === 'stats') renderStatsCharts();
  }, 50);
}

document.addEventListener('DOMContentLoaded', function() {
  const planTableWrap = document.getElementById('planTableWrap');
  const allocTableWrap = document.getElementById('allocTableWrap');

  [planTableWrap, allocTableWrap].forEach(t => {
    t.addEventListener('focus', () => t.classList.add('paste-ready'));
    t.addEventListener('blur', () => t.classList.remove('paste-ready'));
  });

  planTableWrap.addEventListener('paste', function(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) return;

    let startIdx = 0;
    const firstCols = lines[0].split('\t');
    if (firstCols.length >= 2 && Number.isNaN(Number.parseInt(firstCols[1].replace(/,/g, ''), 10))) startIdx = 1;

    const rowCount = lines.length - startIdx;
    if (rowCount <= 0 || rowCount > months.length) {
      showToast('수급계획은 최대 12개월까지만 붙여넣을 수 있습니다.', 'error');
      return;
    }

    const newRows = [];
    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split('\t');
      if (cols.length < 4) {
        showToast((i + 1) + '번째 줄: 최소 4개 컬럼이 필요합니다.', 'error');
        return;
      }

      newRows.push({
        plan: cols[1],
        dom: cols[2],
        imp: cols[3],
        actual: cols.length >= 5 ? cols[4] : null
      });
    }

    const normalized = normalizePlanData(newRows, { padToYear: true });
    if (!normalized) {
      showToast('수급계획 데이터 형식이 올바르지 않습니다.', 'error');
      return;
    }

    planData = normalized;
    savePlanData();
    renderPlanUI();
    renderPlanChart();
    showToast(rowCount + '개월 데이터가 반영되었습니다.', 'success');
  });

  allocTableWrap.addEventListener('paste', function(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) return;

    let startIdx = 0;
    const firstCols = lines[0].split('\t');
    if (firstCols.length >= 2 && Number.isNaN(Number.parseInt(firstCols[1].replace(/,/g, ''), 10))) startIdx = 1;

    const rowCount = lines.length - startIdx;
    if (rowCount <= 0 || rowCount > months.length) {
      showToast('공장배분은 최대 12개월까지만 붙여넣을 수 있습니다.', 'error');
      return;
    }

    const newRows = [];
    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split('\t');
      if (cols.length < 5) {
        showToast((i + 1) + '번째 줄: 5개 컬럼이 필요합니다.', 'error');
        return;
      }

      newRows.push({
        ic: cols[1],
        ia: cols[2],
        pc: cols[3],
        pa: cols[4]
      });
    }

    const normalized = normalizeAllocData(newRows);
    if (!normalized) {
      showToast('공장배분 데이터 형식이 올바르지 않습니다.', 'error');
      return;
    }

    allocData = normalized;
    saveAllocData();
    renderAllocUI();
    renderAllocCharts();
    showToast(rowCount + '개월 데이터가 반영되었습니다.', 'success');
  });
});

loadPlanFromStorage();
loadAllocFromStorage();
loadOrderDataFromStorage();
loadSupplierDataFromStorage();
loadImportDataFromStorage();
loadNoticesFromStorage();

initOrders();
initSuppliers();
initImports();
initInventory();
initStats();
initNotices();
initCalendar();
renderPlanUI();
renderAllocUI();
renderPlanChart();
