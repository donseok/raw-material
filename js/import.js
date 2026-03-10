// ===== 수입계약 (Import Contracts) Module =====

function normalizeImportContract(contract) {
  if (!contract || typeof contract !== 'object') return null;

  const qty = parseNum(contract.qty);
  const cfr = parseNum(contract.cfr);
  const fx = parseNum(contract.fx);
  const normalized = {
    no: String(contract.no || '').trim(),
    country: String(contract.country || '').trim(),
    sup: String(contract.sup || '').trim(),
    grade: String(contract.grade || '').trim(),
    qty,
    cfr,
    fx,
    ship: String(contract.ship || '').trim(),
    eta: String(contract.eta || '').trim(),
    status: String(contract.status || '계약').trim()
  };

  if (!normalized.no || !normalized.country || !normalized.sup || !normalized.grade || !normalized.ship || !normalized.eta) return null;
  if (!isNonNegativeNumber(qty) || !isNonNegativeNumber(cfr) || !isNonNegativeNumber(fx)) return null;
  if (!['계약', '선적', '운송중', '도착'].includes(normalized.status)) return null;

  return normalized;
}

function loadImportDataFromStorage() {
  const savedImports = readStoredData(STORAGE_KEYS.imports, data => {
    if (!Array.isArray(data)) return null;
    const normalized = data.map(normalizeImportContract);
    return normalized.some(row => row === null) ? null : normalized;
  });

  if (savedImports) imports = savedImports;
}

function saveImportData() {
  writeStoredData(STORAGE_KEYS.imports, imports);
}

function renderImports() {
  const impTbody = document.getElementById('importTable');
  impTbody.innerHTML = '';

  imports.forEach(c => {
    const badgeClass = { 도착: 'badge-green', 운송중: 'badge-blue', 선적: 'badge-orange', 계약: 'badge-gray' }[c.status];
    impTbody.innerHTML += '<tr><td>' + c.no + '</td><td>' + c.country + '</td><td>' + c.sup + '</td><td>' + c.grade + '</td><td class="text-right">' + fmt(c.qty, '0') + '</td><td class="text-right">$' + fmt(c.cfr, '0') + '</td><td class="text-right">' + fmt(c.fx, '0') + '</td><td>' + c.ship + '</td><td>' + c.eta + '</td><td><span class="badge ' + badgeClass + '">' + c.status + '</span></td></tr>';
  });
}

function renderImportSummary() {
  const totalQty = imports.reduce((sum, contract) => sum + contract.qty, 0);
  const avgCfr = imports.length > 0 ? Math.round(imports.reduce((sum, contract) => sum + contract.cfr, 0) / imports.length) : 0;
  const avgFx = imports.length > 0 ? Math.round(imports.reduce((sum, contract) => sum + contract.fx, 0) / imports.length) : 0;

  document.getElementById('importKpi1').innerHTML = '<div class="kpi-label">진행 중 계약</div><div class="kpi-value">' + fmt(imports.length, '0') + '<small>건</small></div>';
  document.getElementById('importKpi2').innerHTML = '<div class="kpi-label">수입 물량 (금년)</div><div class="kpi-value">' + fmt(totalQty, '0') + '<small>톤</small></div>';
  document.getElementById('importKpi3').innerHTML = '<div class="kpi-label">평균 CFR 가격</div><div class="kpi-value">$' + fmt(avgCfr, '0') + '<small>/톤</small></div>';
  document.getElementById('importKpi4').innerHTML = '<div class="kpi-label">적용 환율</div><div class="kpi-value">' + fmt(avgFx, '0') + '<small>원</small></div>';
}

function initImports() {
  renderImports();
  renderImportSummary();
  resetImportForm();
}

function renderImportChart() {
  const statusCounts = { 계약: 0, 선적: 0, 운송중: 0, 도착: 0 };
  imports.forEach(c => { statusCounts[c.status] += 1; });

  destroyChart('importChart');
  chartInstances.importChart = new Chart(document.getElementById('importChart'), {
    type: 'bar',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{ label: '건수', data: Object.values(statusCounts), backgroundColor: ['#9e9e9e', '#ff8f00', '#1565c0', '#2e7d32'], borderRadius: 8, barThickness: 60 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });
}

function getNextImportNo() {
  const nextSeq = imports.reduce((max, contract) => {
    const match = /IMP-\d{4}-(\d+)/.exec(contract.no);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0) + 1;

  return 'IMP-2026-' + String(nextSeq).padStart(3, '0');
}

function resetImportForm() {
  document.getElementById('importCountry').value = '일본';
  document.getElementById('importSupplier').value = '';
  document.getElementById('importGrade').value = 'HMS1';
  document.getElementById('importQty').value = '15000';
  document.getElementById('importCfr').value = '370';
  document.getElementById('importFx').value = '1385';
  document.getElementById('importShipDate').value = '2026-03-20';
  document.getElementById('importEtaDate').value = '2026-04-05';
}

function submitImport() {
  const nextContract = normalizeImportContract({
    no: getNextImportNo(),
    country: document.getElementById('importCountry').value,
    sup: document.getElementById('importSupplier').value,
    grade: document.getElementById('importGrade').value,
    qty: document.getElementById('importQty').value,
    cfr: document.getElementById('importCfr').value,
    fx: document.getElementById('importFx').value,
    ship: document.getElementById('importShipDate').value,
    eta: document.getElementById('importEtaDate').value,
    status: '계약'
  });

  if (!nextContract) {
    showToast('수입 계약 정보를 모두 올바르게 입력해주세요.', 'error');
    return;
  }

  imports.unshift(nextContract);
  saveImportData();
  renderImports();
  renderImportSummary();
  renderImportChart();
  hideModal('importModal');
  resetImportForm();
  showToast('수입 계약이 등록되었습니다.', 'success');
}
