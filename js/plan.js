// ===== 수급계획 (Supply Plan) Module =====

function updateRatio() {
  const v = document.getElementById('domesticSlider').value;
  document.getElementById('domesticVal').textContent = v + '%';
  document.getElementById('importSlider').value = 100 - v;
  document.getElementById('importVal').textContent = (100 - v) + '%';
}

function updateMonthly() {
  document.getElementById('monthlyTarget').textContent = fmt(+document.getElementById('monthlySlider').value) + '톤';
}

function loadFromStorage() {
  const savedPlan = localStorage.getItem('planData');
  const savedAlloc = localStorage.getItem('allocData');

  if (savedPlan) {
    try {
      planData = JSON.parse(savedPlan).data;
      document.getElementById('planSaveIndicator').classList.add('show');
    } catch(e) { localStorage.removeItem('planData'); }
  }

  if (savedAlloc) {
    try {
      allocData = JSON.parse(savedAlloc).data;
      document.getElementById('allocSaveIndicator').classList.add('show');
    } catch(e) { localStorage.removeItem('allocData'); }
  }
}

function savePlanData() {
  localStorage.setItem('planData', JSON.stringify({ data: planData, timestamp: new Date().toISOString() }));
  document.getElementById('planSaveIndicator').classList.add('show');
}

function resetPlanData() {
  if (!confirm('수급계획 데이터를 초기화하시겠습니까?')) return;
  localStorage.removeItem('planData');
  planData = JSON.parse(JSON.stringify(defaultPlanData));
  document.getElementById('planSaveIndicator').classList.remove('show');
  renderPlanUI(); renderPlanChart();
  showToast('수급계획이 초기화되었습니다.', 'info');
}

function renderPlanUI() {
  let totalPlan = 0, totalDom = 0, totalImp = 0, totalActual = 0, actualCount = 0;
  planData.forEach(d => {
    totalPlan += d.plan;
    totalDom += d.dom;
    totalImp += d.imp;
    if (d.actual) { totalActual += d.actual; actualCount++; }
  });

  const domRatio = totalPlan > 0 ? ((totalDom / totalPlan) * 100).toFixed(1) : 0;
  const impRatio = totalPlan > 0 ? ((totalImp / totalPlan) * 100).toFixed(1) : 0;
  let avgRate = '-';
  if (actualCount > 0) {
    let rateSum = 0;
    planData.forEach(d => { if (d.actual) rateSum += (d.actual / d.plan) * 100; });
    avgRate = (rateSum / actualCount).toFixed(1);
  }

  document.getElementById('planKpi1').innerHTML = '<div class="kpi-label">총 계획량</div><div class="kpi-value">' + (totalPlan/10000).toFixed(1) + '<small>만 톤</small></div><div class="kpi-sub">연간 합계 기준</div>';
  document.getElementById('planKpi2').innerHTML = '<div class="kpi-label">국산 비율</div><div class="kpi-value">' + domRatio + '<small>%</small></div><div class="kpi-sub">' + (totalDom/10000).toFixed(1) + '만 톤</div>';
  document.getElementById('planKpi3').innerHTML = '<div class="kpi-label">수입 비율</div><div class="kpi-value">' + impRatio + '<small>%</small></div><div class="kpi-sub">' + (totalImp/10000).toFixed(1) + '만 톤</div>';
  document.getElementById('planKpi4').innerHTML = '<div class="kpi-label">평균 달성률</div><div class="kpi-value">' + avgRate + '<small>%</small></div><div class="kpi-sub">실적 있는 월 (' + actualCount + '개월) 기준</div>';

  const planTbody = document.getElementById('planTable');
  planTbody.innerHTML = '';
  planData.forEach((d, i) => {
    const rate = d.actual ? ((d.actual/d.plan)*100).toFixed(1) : '-';
    const st = d.actual ? (rate >= 95 ? '<span class="badge badge-green">달성</span>' : rate >= 85 ? '<span class="badge badge-orange">미달</span>' : '<span class="badge badge-red">부족</span>') : '<span class="badge badge-gray">예정</span>';
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + months[i] + '</td><td class="text-right editable">' + fmt(d.plan) + '</td><td class="text-right editable">' + fmt(d.dom) + '</td><td class="text-right editable">' + fmt(d.imp) + '</td><td class="text-right editable">' + (d.actual ? fmt(d.actual) : '-') + '</td><td class="text-right">' + rate + (d.actual?'%':'') + '</td><td>' + st + '</td>';

    const cells = tr.querySelectorAll('.editable');
    const keys = ['plan', 'dom', 'imp', 'actual'];
    cells.forEach((cell, ci) => {
      cell.addEventListener('dblclick', function() {
        startCellEdit(cell, d[keys[ci]], function(newVal) {
          planData[i][keys[ci]] = newVal;
          savePlanData(); renderPlanUI(); renderPlanChart();
        });
      });
    });
    planTbody.appendChild(tr);
  });
}

function renderPlanChart() {
  destroyChart('planChart');
  chartInstances['planChart'] = new Chart(document.getElementById('planChart'), {
    type: 'bar',
    data: {
      labels: months.slice(0, planData.length),
      datasets: [
        {label:'계획',data:planData.map(d=>d.plan/1000),backgroundColor:'rgba(26,35,126,0.2)',borderColor:'#1a237e',borderWidth:2,borderRadius:4,order:2},
        {label:'실적',data:planData.map(d=>d.actual?d.actual/1000:null),backgroundColor:'rgba(255,143,0,0.7)',borderColor:'#ff8f00',borderWidth:0,borderRadius:4,order:1}
      ]
    },
    options: {responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top',labels:{font:{size:12}}},tooltip:{callbacks:{label:ctx=>ctx.dataset.label+': '+fmt(ctx.raw*1000)+'톤'}}},scales:{y:{beginAtZero:false,min:150,title:{display:true,text:'천 톤'},ticks:{callback:v=>v+'k'}}}}
  });
}
