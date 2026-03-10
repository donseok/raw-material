// ===== 수급계획 (Supply Plan) Module =====

function updateRatio() {
  const v = document.getElementById('domesticSlider').value;
  document.getElementById('domesticVal').textContent = v + '%';
  document.getElementById('importSlider').value = 100 - v;
  document.getElementById('importVal').textContent = (100 - v) + '%';
}

function updateMonthly() {
  document.getElementById('monthlyTarget').textContent = fmt(+document.getElementById('monthlySlider').value, '0') + '톤';
}

function normalizePlanRow(row) {
  if (!row || typeof row !== 'object') return null;

  const plan = parseNum(row.plan);
  const dom = parseNum(row.dom);
  const imp = parseNum(row.imp);
  const actual = row.actual === null || row.actual === undefined || row.actual === ''
    ? null
    : parseNum(row.actual);

  if (!isNonNegativeNumber(plan) || !isNonNegativeNumber(dom) || !isNonNegativeNumber(imp)) return null;
  if (actual !== null && !isNonNegativeNumber(actual)) return null;

  return { plan, dom, imp, actual };
}

function normalizePlanData(rows, options = {}) {
  const { padToYear = false } = options;
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > months.length) return null;

  const normalized = rows.map(normalizePlanRow);
  if (normalized.some(row => row === null)) return null;

  if (padToYear) {
    while (normalized.length < months.length) {
      normalized.push({ plan: 0, dom: 0, imp: 0, actual: null });
    }
  }

  return normalized;
}

function loadPlanFromStorage() {
  const savedPlan = readStoredData(STORAGE_KEYS.plan, data => normalizePlanData(data, { padToYear: true }));
  if (!savedPlan) return;

  planData = savedPlan;
  document.getElementById('planSaveIndicator').classList.add('show');
}

function savePlanData() {
  writeStoredData(STORAGE_KEYS.plan, planData);
  document.getElementById('planSaveIndicator').classList.add('show');
}

function resetPlanData() {
  if (!confirm('수급계획 데이터를 초기화하시겠습니까?')) return;

  localStorage.removeItem(STORAGE_KEYS.plan);
  planData = cloneData(defaultPlanData);
  document.getElementById('planSaveIndicator').classList.remove('show');
  renderPlanUI();
  renderPlanChart();
  showToast('수급계획이 초기화되었습니다.', 'info');
}

function savePlanCell(rowIndex, key, newVal) {
  if (key !== 'actual' && newVal === null) {
    showToast('계획, 국산, 수입 물량은 비울 수 없습니다.', 'error');
    renderPlanUI();
    return;
  }

  const nextRow = normalizePlanRow({
    ...planData[rowIndex],
    [key]: newVal
  });

  if (!nextRow) {
    showToast('0 이상 숫자만 입력할 수 있습니다.', 'error');
    renderPlanUI();
    return;
  }

  planData[rowIndex] = nextRow;
  savePlanData();
  renderPlanUI();
  renderPlanChart();
}

function renderPlanUI() {
  let totalPlan = 0;
  let totalDom = 0;
  let totalImp = 0;
  let actualCount = 0;

  planData.forEach(d => {
    totalPlan += d.plan;
    totalDom += d.dom;
    totalImp += d.imp;
    if (d.actual !== null && d.plan > 0) actualCount++;
  });

  const domRatio = totalPlan > 0 ? ((totalDom / totalPlan) * 100).toFixed(1) : '0.0';
  const impRatio = totalPlan > 0 ? ((totalImp / totalPlan) * 100).toFixed(1) : '0.0';
  let avgRate = '-';
  if (actualCount > 0) {
    let rateSum = 0;
    planData.forEach(d => {
      if (d.actual !== null && d.plan > 0) rateSum += (d.actual / d.plan) * 100;
    });
    avgRate = (rateSum / actualCount).toFixed(1);
  }

  document.getElementById('planKpi1').innerHTML = '<div class="kpi-label">총 계획량</div><div class="kpi-value">' + (totalPlan / 10000).toFixed(1) + '<small>만 톤</small></div><div class="kpi-sub">연간 합계 기준</div>';
  document.getElementById('planKpi2').innerHTML = '<div class="kpi-label">국산 비율</div><div class="kpi-value">' + domRatio + '<small>%</small></div><div class="kpi-sub">' + (totalDom / 10000).toFixed(1) + '만 톤</div>';
  document.getElementById('planKpi3').innerHTML = '<div class="kpi-label">수입 비율</div><div class="kpi-value">' + impRatio + '<small>%</small></div><div class="kpi-sub">' + (totalImp / 10000).toFixed(1) + '만 톤</div>';
  document.getElementById('planKpi4').innerHTML = '<div class="kpi-label">평균 달성률</div><div class="kpi-value">' + avgRate + '<small>%</small></div><div class="kpi-sub">실적 있는 월 (' + actualCount + '개월) 기준</div>';

  const planTbody = document.getElementById('planTable');
  planTbody.innerHTML = '';

  planData.forEach((d, i) => {
    const hasActual = d.actual !== null;
    const rate = hasActual && d.plan > 0 ? ((d.actual / d.plan) * 100).toFixed(1) : '-';
    const status = !hasActual
      ? '<span class="badge badge-gray">예정</span>'
      : d.plan <= 0
        ? '<span class="badge badge-red">기준값 필요</span>'
        : rate >= 95
          ? '<span class="badge badge-green">달성</span>'
          : rate >= 85
            ? '<span class="badge badge-orange">미달</span>'
            : '<span class="badge badge-red">부족</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + months[i] + '</td><td class="text-right editable">' + fmt(d.plan, '0') + '</td><td class="text-right editable">' + fmt(d.dom, '0') + '</td><td class="text-right editable">' + fmt(d.imp, '0') + '</td><td class="text-right editable">' + (hasActual ? fmt(d.actual, '0') : '-') + '</td><td class="text-right">' + (rate === '-' ? '-' : rate + '%') + '</td><td>' + status + '</td>';

    const cells = tr.querySelectorAll('.editable');
    const keys = ['plan', 'dom', 'imp', 'actual'];
    cells.forEach((cell, ci) => {
      cell.addEventListener('dblclick', function() {
        startCellEdit(cell, d[keys[ci]], function(newVal) {
          savePlanCell(i, keys[ci], newVal);
        });
      });
    });

    planTbody.appendChild(tr);
  });
}

function renderPlanChart() {
  destroyChart('planChart');
  chartInstances.planChart = new Chart(document.getElementById('planChart'), {
    type: 'bar',
    data: {
      labels: months.slice(0, planData.length),
      datasets: [
        {
          label: '계획',
          data: planData.map(d => d.plan / 1000),
          backgroundColor: 'rgba(26,35,126,0.2)',
          borderColor: '#1a237e',
          borderWidth: 2,
          borderRadius: 4,
          order: 2
        },
        {
          label: '실적',
          data: planData.map(d => d.actual !== null ? d.actual / 1000 : null),
          backgroundColor: 'rgba(255,143,0,0.7)',
          borderColor: '#ff8f00',
          borderWidth: 0,
          borderRadius: 4,
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.raw === null || ctx.raw === undefined) return ctx.dataset.label + ': -';
              return ctx.dataset.label + ': ' + fmt(ctx.raw * 1000, '0') + '톤';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 0,
          title: { display: true, text: '천 톤' },
          ticks: { callback: v => v + 'k' }
        }
      }
    }
  });
}
