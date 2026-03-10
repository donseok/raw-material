// ===== Main Application Initialization =====

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    renderCharts(btn.dataset.tab);
  });
});

// Date Display
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('ko-KR', {year:'numeric',month:'long',day:'numeric',weekday:'long'});

// Chart Router
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

// Paste Handlers
document.addEventListener('DOMContentLoaded', function() {
  const planTableWrap = document.getElementById('planTableWrap');
  const allocTableWrap = document.getElementById('allocTableWrap');

  [planTableWrap, allocTableWrap].forEach(t => {
    t.addEventListener('focus', () => t.classList.add('paste-ready'));
    t.addEventListener('blur', () => t.classList.remove('paste-ready'));
  });

  // Plan table paste
  planTableWrap.addEventListener('paste', function(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) return;

    let startIdx = 0;
    const firstCols = lines[0].split('\t');
    if (firstCols.length >= 2 && isNaN(parseInt(firstCols[1].replace(/,/g,'')))) startIdx = 1;

    const newData = [];
    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split('\t');
      if (cols.length < 4) { showToast((i+1) + '번째 줄: 최소 4개 컬럼 필요', 'error'); return; }
      const plan = parseNum(cols[1]), dom = parseNum(cols[2]), imp = parseNum(cols[3]);
      const actual = cols.length >= 5 ? parseNum(cols[4]) : null;
      if (plan === null || dom === null || imp === null) { showToast((i+1) + '번째 줄: 숫자 오류', 'error'); return; }
      newData.push({ plan, dom, imp, actual });
    }

    while (newData.length < 12) newData.push({ plan: 0, dom: 0, imp: 0, actual: null });
    planData = newData;
    savePlanData(); renderPlanUI(); renderPlanChart();
    showToast(newData.length + '개월 데이터가 반영되었습니다.', 'success');
  });

  // Alloc table paste
  allocTableWrap.addEventListener('paste', function(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) return;

    let startIdx = 0;
    const firstCols = lines[0].split('\t');
    if (firstCols.length >= 2 && isNaN(parseInt(firstCols[1].replace(/,/g,'')))) startIdx = 1;

    const newData = [];
    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split('\t');
      if (cols.length < 5) { showToast((i+1) + '번째 줄: 5개 컬럼 필요', 'error'); return; }
      const ic = parseNum(cols[1]), ia = parseNum(cols[2]), pc = parseNum(cols[3]), pa = parseNum(cols[4]);
      if (ic === null || ia === null || pc === null || pa === null) { showToast((i+1) + '번째 줄: 숫자 오류', 'error'); return; }
      newData.push({ ic, ia, pc, pa });
    }

    allocData = newData;
    saveAllocData(); renderAllocUI(); renderAllocCharts();
    showToast(newData.length + '개월 데이터가 반영되었습니다.', 'success');
  });
});

// ===== Initialize All Modules =====
loadFromStorage();
initOrders();
initSuppliers();
initImports();
initInventory();
initStats();
renderPlanUI();
renderAllocUI();
renderPlanChart();
