// ===== 구매실적 (Purchase Statistics) Module =====

let totalRow = {a:0,b:0,c:0,d:0,e:0,f:0,total:0,amt:0};

function initStats() {
  const statsTbody = document.getElementById('statsTable');
  totalRow = {a:0,b:0,c:0,d:0,e:0,f:0,total:0,amt:0};
  statsData.forEach(s => {
    statsTbody.innerHTML += '<tr><td>' + s.m + '</td><td class="text-right">' + fmt(s.a) + '</td><td class="text-right">' + fmt(s.b) + '</td><td class="text-right">' + fmt(s.c) + '</td><td class="text-right">' + fmt(s.d) + '</td><td class="text-right">' + fmt(s.e) + '</td><td class="text-right">' + fmt(s.f) + '</td><td class="text-right" style="font-weight:700">' + fmt(s.total) + '</td><td class="text-right" style="font-weight:700">' + fmt(s.amt) + '</td></tr>';
    totalRow.a+=s.a; totalRow.b+=s.b; totalRow.c+=s.c; totalRow.d+=s.d; totalRow.e+=s.e; totalRow.f+=s.f; totalRow.total+=s.total; totalRow.amt+=s.amt;
  });
  statsTbody.innerHTML += '<tr style="background:#e8eaf6;font-weight:700"><td>합계</td><td class="text-right">' + fmt(totalRow.a) + '</td><td class="text-right">' + fmt(totalRow.b) + '</td><td class="text-right">' + fmt(totalRow.c) + '</td><td class="text-right">' + fmt(totalRow.d) + '</td><td class="text-right">' + fmt(totalRow.e) + '</td><td class="text-right">' + fmt(totalRow.f) + '</td><td class="text-right">' + fmt(totalRow.total) + '</td><td class="text-right">' + fmt(totalRow.amt) + '</td></tr>';
}

function exportCSV() {
  let csv = '\uFEFF월,생철(톤),중량(톤),경량(톤),길로틴(톤),선반(톤),압축(톤),합계(톤),금액(억원)\n';
  statsData.forEach(s => { csv += s.m + ',' + s.a + ',' + s.b + ',' + s.c + ',' + s.d + ',' + s.e + ',' + s.f + ',' + s.total + ',' + s.amt + '\n'; });
  csv += '합계,' + totalRow.a + ',' + totalRow.b + ',' + totalRow.c + ',' + totalRow.d + ',' + totalRow.e + ',' + totalRow.f + ',' + totalRow.total + ',' + totalRow.amt + '\n';
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '구매실적_2026.csv';
  a.click();
}

function renderStatsCharts() {
  destroyChart('statsMonthlyChart');
  chartInstances['statsMonthlyChart'] = new Chart(document.getElementById('statsMonthlyChart'), {
    type:'bar',
    data:{labels:['1월','2월','3월'],datasets:[
      {label:'구매량(톤)',data:[218400,205700,212100],backgroundColor:'rgba(26,35,126,0.7)',borderRadius:6,yAxisID:'y'},
      {label:'금액(억원)',data:[852,803,826],type:'line',borderColor:'#ff8f00',backgroundColor:'#ff8f00',pointRadius:5,pointBackgroundColor:'#ff8f00',yAxisID:'y1',tension:0.3}
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'}},scales:{y:{position:'left',title:{display:true,text:'톤'}},y1:{position:'right',title:{display:true,text:'억원'},grid:{drawOnChartArea:false}}}}
  });
  destroyChart('statsGradeChart');
  chartInstances['statsGradeChart'] = new Chart(document.getElementById('statsGradeChart'), {
    type:'doughnut',
    data:{labels:['생철','중량','경량','길로틴','선반','압축'],datasets:[{data:[totalRow.a,totalRow.b,totalRow.c,totalRow.d,totalRow.e,totalRow.f],backgroundColor:['#1a237e','#283593','#3949ab','#ff8f00','#ffa726','#ffcc80']}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{font:{size:12}}}}}
  });
}
