// ===== 수입계약 (Import Contracts) Module =====

function initImports() {
  const impTbody = document.getElementById('importTable');
  imports.forEach(c => {
    const sc = {도착:'badge-green',운송중:'badge-blue',선적:'badge-orange',계약:'badge-gray'}[c.status];
    impTbody.innerHTML += '<tr><td>' + c.no + '</td><td>' + c.country + '</td><td>' + c.sup + '</td><td>' + c.grade + '</td><td class="text-right">' + fmt(c.qty) + '</td><td class="text-right">$' + c.cfr + '</td><td class="text-right">' + fmt(c.fx) + '</td><td>' + c.ship + '</td><td>' + c.eta + '</td><td><span class="badge ' + sc + '">' + c.status + '</span></td></tr>';
  });
}

function renderImportChart() {
  destroyChart('importChart');
  const statusCounts = {계약:0,선적:0,운송중:0,도착:0};
  imports.forEach(c => statusCounts[c.status]++);
  chartInstances['importChart'] = new Chart(document.getElementById('importChart'), {
    type:'bar',
    data:{labels:Object.keys(statusCounts),datasets:[{label:'건수',data:Object.values(statusCounts),backgroundColor:['#9e9e9e','#ff8f00','#1565c0','#2e7d32'],borderRadius:8,barThickness:60}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}
  });
}
