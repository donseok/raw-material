// ===== 재고현황 (Inventory) Module =====

function initInventory() {
  const invTbody = document.getElementById('inventoryTable');
  inventory.forEach(v => {
    const rate = ((v.cur/v.opt)*100).toFixed(1);
    const st = rate >= 110 ? '과잉' : rate >= 85 ? '적정' : '부족';
    const sc = st === '적정' ? 'green' : st === '과잉' ? 'orange' : 'red';
    const bc = st === '적정' ? 'badge-green' : st === '과잉' ? 'badge-orange' : 'badge-red';
    invTbody.innerHTML += '<tr><td>' + v.plant + '</td><td>' + v.grade + '</td><td class="text-right">' + fmt(v.cur) + '</td><td class="text-right">' + fmt(v.opt) + '</td><td class="text-right">' + rate + '%</td><td><span class="badge ' + bc + '">' + st + '</span></td><td><div class="level-bar"><div class="bar"><div class="fill" style="width:' + Math.min(rate,100) + '%;background:' + (sc==='green'?'#2e7d32':sc==='orange'?'#ff8f00':'#c62828') + '"></div></div></div></td></tr>';
  });
}

function renderInventoryCharts() {
  const grades = ['생철','중량','경량','길로틴','선반','압축'];
  const incheon = inventory.filter(v=>v.plant==='인천');
  const pohang = inventory.filter(v=>v.plant==='포항');
  destroyChart('invIncheonChart');
  chartInstances['invIncheonChart'] = new Chart(document.getElementById('invIncheonChart'), {
    type:'bar',
    data:{labels:grades,datasets:[
      {label:'현재 재고',data:incheon.map(v=>v.cur),backgroundColor:'rgba(26,35,126,0.7)',borderRadius:4},
      {label:'적정 재고',data:incheon.map(v=>v.opt),backgroundColor:'rgba(255,143,0,0.3)',borderColor:'#ff8f00',borderWidth:2,borderRadius:4}
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'}},scales:{y:{title:{display:true,text:'톤'}}}}
  });
  destroyChart('invPohangChart');
  chartInstances['invPohangChart'] = new Chart(document.getElementById('invPohangChart'), {
    type:'bar',
    data:{labels:grades,datasets:[
      {label:'현재 재고',data:pohang.map(v=>v.cur),backgroundColor:'rgba(230,81,0,0.7)',borderRadius:4},
      {label:'적정 재고',data:pohang.map(v=>v.opt),backgroundColor:'rgba(26,35,126,0.2)',borderColor:'#1a237e',borderWidth:2,borderRadius:4}
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'}},scales:{y:{title:{display:true,text:'톤'}}}}
  });
}
