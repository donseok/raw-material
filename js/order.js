// ===== 발주관리 (Order Management) Module =====

function initOrders() {
  const orderTbody = document.getElementById('orderTable');
  orders.forEach(o => {
    const amt = (o.qty * o.price / 1000000).toFixed(0);
    const badge = o.status === '완료' ? 'badge-green' : o.status === '진행' ? 'badge-blue' : 'badge-gray';
    orderTbody.innerHTML += '<tr><td>' + o.no + '</td><td>' + o.sup + '</td><td>' + o.grade + '</td><td class="text-right">' + fmt(o.qty) + '</td><td class="text-right">' + fmt(o.price) + '</td><td class="text-right">' + fmt(+amt) + '</td><td>' + o.plant + '</td><td>' + o.date + '</td><td><span class="badge ' + badge + '">' + o.status + '</span></td></tr>';
  });
}

function addOrder() {
  const newNo = 'PO-2026-0' + (351 + Math.floor(Math.random()*50));
  const row = '<tr style="background:#e8f5e9"><td>' + newNo + '</td><td>현대스크랩</td><td>중량</td><td class="text-right">5,000</td><td class="text-right">395,000</td><td class="text-right">1,975</td><td>인천</td><td>2026-03-15</td><td><span class="badge badge-gray">대기</span></td></tr>';
  document.getElementById('orderTable').insertAdjacentHTML('afterbegin', row);
}

function generatePDF() { showModal('pdfModal'); }
