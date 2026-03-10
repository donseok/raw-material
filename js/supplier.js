// ===== 거래처관리 (Supplier Management) Module =====

function initSuppliers() {
  const supTbody = document.getElementById('supplierTable');
  suppliers.forEach(s => {
    const gc = s.grade.startsWith('A') ? 'badge-green' : s.grade.startsWith('B+') ? 'badge-blue' : 'badge-orange';
    supTbody.innerHTML += '<tr><td>' + s.code + '</td><td style="font-weight:600">' + s.name + '</td><td>' + s.region + '</td><td>' + s.rep + '</td><td>' + s.tel + '</td><td class="text-right">' + fmt(s.cap) + '</td><td class="text-right">' + fmt(s.ytd) + '</td><td><span class="badge ' + gc + '">' + s.grade + '</span></td><td><div class="level-bar"><div class="bar"><div class="fill" style="width:' + s.rate + '%;background:' + (s.rate>=90?'#2e7d32':s.rate>=85?'#ff8f00':'#c62828') + '"></div></div><span style="font-size:12px;min-width:36px">' + s.rate + '%</span></div></td></tr>';
  });
}

function renderSupplierCharts() {
  destroyChart('supplierPieChart');
  chartInstances['supplierPieChart'] = new Chart(document.getElementById('supplierPieChart'), {
    type:'pie',
    data:{labels:suppliers.map(s=>s.name),datasets:[{data:suppliers.map(s=>s.ytd),backgroundColor:['#1565c0','#283593','#42a5f5','#ff8f00','#e65100','#66bb6a','#7986cb','#9fa8da']}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{font:{size:11}}}}}
  });
  destroyChart('supplierTrendChart');
  chartInstances['supplierTrendChart'] = new Chart(document.getElementById('supplierTrendChart'), {
    type:'line',
    data:{labels:['1월','2월','3월'],datasets:[
      {label:'현대스크랩',data:[20100,18900,19200],borderColor:'#1565c0',backgroundColor:'rgba(21,101,192,0.1)',fill:true,tension:0.3},
      {label:'포스코리사이클링',data:[15800,14600,15200],borderColor:'#e65100',backgroundColor:'rgba(230,81,0,0.1)',fill:true,tension:0.3},
      {label:'삼영금속',data:[14200,13100,14000],borderColor:'#2e7d32',backgroundColor:'rgba(46,125,50,0.1)',fill:true,tension:0.3},
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top',labels:{font:{size:11}}}},scales:{y:{title:{display:true,text:'톤'}}}}
  });
}
