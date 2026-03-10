// ===== 공장배분 (Factory Allocation) Module =====

function normalizeAllocRow(row) {
  if (!row || typeof row !== 'object') return null;

  const ic = parseNum(row.ic);
  const ia = parseNum(row.ia);
  const pc = parseNum(row.pc);
  const pa = parseNum(row.pa);

  if (!isNonNegativeNumber(ic) || !isNonNegativeNumber(ia) || !isNonNegativeNumber(pc) || !isNonNegativeNumber(pa)) return null;

  return { ic, ia, pc, pa };
}

function normalizeAllocData(rows) {
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > months.length) return null;

  const normalized = rows.map(normalizeAllocRow);
  return normalized.some(row => row === null) ? null : normalized;
}

function loadAllocFromStorage() {
  const savedAlloc = readStoredData(STORAGE_KEYS.alloc, normalizeAllocData);
  if (!savedAlloc) return;

  allocData = savedAlloc;
  document.getElementById('allocSaveIndicator').classList.add('show');
}

function saveAllocData() {
  writeStoredData(STORAGE_KEYS.alloc, allocData);
  document.getElementById('allocSaveIndicator').classList.add('show');
}

function resetAllocData() {
  if (!confirm('공장배분 데이터를 초기화하시겠습니까?')) return;

  localStorage.removeItem(STORAGE_KEYS.alloc);
  allocData = cloneData(defaultAllocData);
  document.getElementById('allocSaveIndicator').classList.remove('show');
  renderAllocUI();
  renderAllocCharts();
  showToast('공장배분이 초기화되었습니다.', 'info');
}

function saveAllocCell(rowIndex, key, newVal) {
  if (newVal === null) {
    showToast('공장배분 값은 비울 수 없습니다.', 'error');
    renderAllocUI();
    return;
  }

  const nextRow = normalizeAllocRow({
    ...allocData[rowIndex],
    [key]: newVal
  });

  if (!nextRow) {
    showToast('0 이상 숫자만 입력할 수 있습니다.', 'error');
    renderAllocUI();
    return;
  }

  allocData[rowIndex] = nextRow;
  saveAllocData();
  renderAllocUI();
  renderAllocCharts();
}

function getAllocationRate(actual, plan) {
  return plan > 0 ? ((actual / plan) * 100).toFixed(1) : '-';
}

function renderAllocUI() {
  let totalIc = 0;
  let totalIa = 0;
  let totalPc = 0;
  let totalPa = 0;

  allocData.forEach(d => {
    totalIc += d.ic;
    totalIa += d.ia;
    totalPc += d.pc;
    totalPa += d.pa;
  });

  const totalPlan = totalIc + totalPc;
  const incheonRatio = totalPlan > 0 ? ((totalIc / totalPlan) * 100).toFixed(0) : '0';
  const pohangRatio = totalPlan > 0 ? ((totalPc / totalPlan) * 100).toFixed(0) : '0';

  const lastRow = allocData[allocData.length - 1];
  const lastIncheonRate = lastRow ? getAllocationRate(lastRow.ia, lastRow.ic) : '-';
  const lastPohangRate = lastRow ? getAllocationRate(lastRow.pa, lastRow.pc) : '-';

  const avgIcPlan = allocData.length > 0 ? Math.round(totalIc / allocData.length) : 0;
  const avgPcPlan = allocData.length > 0 ? Math.round(totalPc / allocData.length) : 0;

  document.getElementById('allocKpi1').innerHTML = '<div class="kpi-label">인천공장 배분 비율</div><div class="kpi-value">' + incheonRatio + '<small>%</small></div><div class="kpi-sub">월 ' + fmt(avgIcPlan, '0') + '톤 배정</div>';
  document.getElementById('allocKpi2').innerHTML = '<div class="kpi-label">포항공장 배분 비율</div><div class="kpi-value">' + pohangRatio + '<small>%</small></div><div class="kpi-sub">월 ' + fmt(avgPcPlan, '0') + '톤 배정</div>';
  document.getElementById('allocKpi3').innerHTML = '<div class="kpi-label">인천 최근월 입고량</div><div class="kpi-value">' + (lastRow ? fmt(lastRow.ia, '0') : '-') + '<small>톤</small></div><div class="kpi-sub">달성률 ' + (lastIncheonRate === '-' ? '-' : lastIncheonRate + '%') + '</div>';
  document.getElementById('allocKpi4').innerHTML = '<div class="kpi-label">포항 최근월 입고량</div><div class="kpi-value">' + (lastRow ? fmt(lastRow.pa, '0') : '-') + '<small>톤</small></div><div class="kpi-sub">달성률 ' + (lastPohangRate === '-' ? '-' : lastPohangRate + '%') + '</div>';

  const overallIncheonRate = totalIc > 0 ? ((totalIa / totalIc) * 100).toFixed(1) : '0.0';
  const overallPohangRate = totalPc > 0 ? ((totalPa / totalPc) * 100).toFixed(1) : '0.0';

  document.getElementById('incheonRateLabel').textContent = overallIncheonRate + '%';
  document.getElementById('incheonProgressBar').style.width = clamp(Number(overallIncheonRate), 0, 100) + '%';
  document.getElementById('incheonProgressBar').textContent = overallIncheonRate + '%';
  document.getElementById('pohangRateLabel').textContent = overallPohangRate + '%';
  document.getElementById('pohangProgressBar').style.width = clamp(Number(overallPohangRate), 0, 100) + '%';
  document.getElementById('pohangProgressBar').textContent = overallPohangRate + '%';

  const allocTbody = document.getElementById('allocTable');
  allocTbody.innerHTML = '';

  allocData.forEach((d, i) => {
    const incheonRate = getAllocationRate(d.ia, d.ic);
    const pohangRate = getAllocationRate(d.pa, d.pc);
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + months[i] + '</td><td class="text-right editable">' + fmt(d.ic, '0') + '</td><td class="text-right editable">' + fmt(d.ia, '0') + '</td><td class="text-right">' + (incheonRate === '-' ? '-' : incheonRate + '%') + '</td><td class="text-right editable">' + fmt(d.pc, '0') + '</td><td class="text-right editable">' + fmt(d.pa, '0') + '</td><td class="text-right">' + (pohangRate === '-' ? '-' : pohangRate + '%') + '</td>';

    const editableCells = tr.querySelectorAll('.editable');
    const keys = ['ic', 'ia', 'pc', 'pa'];
    editableCells.forEach((cell, ci) => {
      cell.addEventListener('dblclick', function() {
        startCellEdit(cell, d[keys[ci]], function(newVal) {
          saveAllocCell(i, keys[ci], newVal);
        });
      });
    });

    allocTbody.appendChild(tr);
  });
}

function renderAllocCharts() {
  const lastRow = allocData[allocData.length - 1];
  const incheonActual = lastRow ? lastRow.ia : 0;
  const incheonRemain = lastRow ? Math.max(0, lastRow.ic - lastRow.ia) : 0;
  const pohangActual = lastRow ? lastRow.pa : 0;
  const pohangRemain = lastRow ? Math.max(0, lastRow.pc - lastRow.pa) : 0;

  destroyChart('incheonChart');
  chartInstances.incheonChart = new Chart(document.getElementById('incheonChart'), {
    type: 'doughnut',
    data: {
      labels: ['실적', '미달'],
      datasets: [{ data: [incheonActual, incheonRemain], backgroundColor: ['#1565c0', '#e0e0e0'] }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { font: { size: 11 } } } } }
  });

  destroyChart('pohangChart');
  chartInstances.pohangChart = new Chart(document.getElementById('pohangChart'), {
    type: 'doughnut',
    data: {
      labels: ['실적', '미달'],
      datasets: [{ data: [pohangActual, pohangRemain], backgroundColor: ['#e65100', '#e0e0e0'] }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { font: { size: 11 } } } } }
  });
}
