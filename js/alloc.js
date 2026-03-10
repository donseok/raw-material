// ===== 공장배분 (Factory Allocation) Module =====

function saveAllocData() {
  localStorage.setItem('allocData', JSON.stringify({ data: allocData, timestamp: new Date().toISOString() }));
  document.getElementById('allocSaveIndicator').classList.add('show');
}

function resetAllocData() {
  if (!confirm('공장배분 데이터를 초기화하시겠습니까?')) return;
  localStorage.removeItem('allocData');
  allocData = JSON.parse(JSON.stringify(defaultAllocData));
  document.getElementById('allocSaveIndicator').classList.remove('show');
  renderAllocUI(); renderAllocCharts();
  showToast('공장배분이 초기화되었습니다.', 'info');
}

function renderAllocUI() {
  let totalIc = 0, totalIa = 0, totalPc = 0, totalPa = 0;
  allocData.forEach(d => {
    totalIc += d.ic; totalIa += d.ia;
    totalPc += d.pc; totalPa += d.pa;
  });

  const totalPlan = totalIc + totalPc;
  const incheonRatio = totalPlan > 0 ? ((totalIc / totalPlan) * 100).toFixed(0) : 0;
  const pohangRatio = totalPlan > 0 ? ((totalPc / totalPlan) * 100).toFixed(0) : 0;

  const lastRow = allocData[allocData.length - 1];
  const lastIncheonRate = lastRow ? ((lastRow.ia / lastRow.ic) * 100).toFixed(1) : '-';
  const lastPohangRate = lastRow ? ((lastRow.pa / lastRow.pc) * 100).toFixed(1) : '-';

  const avgIcPlan = allocData.length > 0 ? Math.round(totalIc / allocData.length) : 0;
  const avgPcPlan = allocData.length > 0 ? Math.round(totalPc / allocData.length) : 0;

  document.getElementById('allocKpi1').innerHTML = '<div class="kpi-label">인천공장 배분 비율</div><div class="kpi-value">' + incheonRatio + '<small>%</small></div><div class="kpi-sub">월 ' + fmt(avgIcPlan) + '톤 배정</div>';
  document.getElementById('allocKpi2').innerHTML = '<div class="kpi-label">포항공장 배분 비율</div><div class="kpi-value">' + pohangRatio + '<small>%</small></div><div class="kpi-sub">월 ' + fmt(avgPcPlan) + '톤 배정</div>';
  document.getElementById('allocKpi3').innerHTML = '<div class="kpi-label">인천 최근월 입고량</div><div class="kpi-value">' + (lastRow ? fmt(lastRow.ia) : '-') + '<small>톤</small></div><div class="kpi-sub">달성률 ' + lastIncheonRate + '%</div>';
  document.getElementById('allocKpi4').innerHTML = '<div class="kpi-label">포항 최근월 입고량</div><div class="kpi-value">' + (lastRow ? fmt(lastRow.pa) : '-') + '<small>톤</small></div><div class="kpi-sub">달성률 ' + lastPohangRate + '%</div>';

  const overallIncheonRate = totalIc > 0 ? ((totalIa / totalIc) * 100).toFixed(1) : 0;
  const overallPohangRate = totalPc > 0 ? ((totalPa / totalPc) * 100).toFixed(1) : 0;
  document.getElementById('incheonRateLabel').textContent = overallIncheonRate + '%';
  document.getElementById('incheonProgressBar').style.width = overallIncheonRate + '%';
  document.getElementById('incheonProgressBar').textContent = overallIncheonRate + '%';
  document.getElementById('pohangRateLabel').textContent = overallPohangRate + '%';
  document.getElementById('pohangProgressBar').style.width = overallPohangRate + '%';
  document.getElementById('pohangProgressBar').textContent = overallPohangRate + '%';

  const allocTbody = document.getElementById('allocTable');
  allocTbody.innerHTML = '';
  allocData.forEach((d, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + months[i] + '</td><td class="text-right editable">' + fmt(d.ic) + '</td><td class="text-right editable">' + fmt(d.ia) + '</td><td class="text-right">' + ((d.ia/d.ic)*100).toFixed(1) + '%</td><td class="text-right editable">' + fmt(d.pc) + '</td><td class="text-right editable">' + fmt(d.pa) + '</td><td class="text-right">' + ((d.pa/d.pc)*100).toFixed(1) + '%</td>';

    const editableCells = tr.querySelectorAll('.editable');
    const keys = ['ic', 'ia', 'pc', 'pa'];
    editableCells.forEach((cell, ci) => {
      cell.addEventListener('dblclick', function() {
        startCellEdit(cell, d[keys[ci]], function(newVal) {
          if (newVal !== null) allocData[i][keys[ci]] = newVal;
          saveAllocData(); renderAllocUI(); renderAllocCharts();
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
  chartInstances['incheonChart'] = new Chart(document.getElementById('incheonChart'), {
    type:'doughnut',
    data:{labels:['실적','미달'],datasets:[{data:[incheonActual, incheonRemain],backgroundColor:['#1565c0','#e0e0e0']}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{font:{size:11}}}}}
  });
  destroyChart('pohangChart');
  chartInstances['pohangChart'] = new Chart(document.getElementById('pohangChart'), {
    type:'doughnut',
    data:{labels:['실적','미달'],datasets:[{data:[pohangActual, pohangRemain],backgroundColor:['#e65100','#e0e0e0']}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{font:{size:11}}}}}
  });
}
