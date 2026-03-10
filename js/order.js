// ===== 발주관리 (Order Management) Module =====

function normalizeOrder(order) {
  if (!order || typeof order !== 'object') return null;

  const qty = parseNum(order.qty);
  const price = parseNum(order.price);
  const plant = String(order.plant || '').replace('공장', '').trim();
  const normalized = {
    no: String(order.no || '').trim(),
    sup: String(order.sup || '').trim(),
    grade: String(order.grade || '').trim(),
    qty,
    price,
    plant,
    date: String(order.date || '').trim(),
    status: String(order.status || '대기').trim()
  };

  if (!normalized.no || !normalized.sup || !normalized.grade || !normalized.date) return null;
  if (!isNonNegativeNumber(qty) || !isNonNegativeNumber(price)) return null;
  if (!['인천', '포항'].includes(normalized.plant)) return null;
  if (!['완료', '진행', '대기'].includes(normalized.status)) return null;

  return normalized;
}

function loadOrderDataFromStorage() {
  const savedOrders = readStoredData(STORAGE_KEYS.orders, data => {
    if (!Array.isArray(data)) return null;
    const normalized = data.map(normalizeOrder);
    return normalized.some(row => row === null) ? null : normalized;
  });

  if (savedOrders) orders = savedOrders;
}

function saveOrderData() {
  writeStoredData(STORAGE_KEYS.orders, orders);
}

function renderOrders() {
  const orderTbody = document.getElementById('orderTable');
  orderTbody.innerHTML = '';

  orders.forEach(o => {
    const amt = Math.round((o.qty * o.price) / 1000000);
    const badge = o.status === '완료' ? 'badge-green' : o.status === '진행' ? 'badge-blue' : 'badge-gray';
    orderTbody.innerHTML += '<tr><td>' + o.no + '</td><td>' + o.sup + '</td><td>' + o.grade + '</td><td class="text-right">' + fmt(o.qty, '0') + '</td><td class="text-right">' + fmt(o.price, '0') + '</td><td class="text-right">' + fmt(amt, '0') + '</td><td>' + o.plant + '</td><td>' + o.date + '</td><td><span class="badge ' + badge + '">' + o.status + '</span></td></tr>';
  });
}

function renderOrderSummary() {
  const totalQty = orders.reduce((sum, order) => sum + order.qty, 0);
  const completed = orders.filter(order => order.status === '완료').length;
  const inProgress = orders.filter(order => order.status === '진행').length;

  document.getElementById('orderKpi1').innerHTML = '<div class="kpi-label">금월 발주 건수</div><div class="kpi-value">' + fmt(orders.length, '0') + '<small>건</small></div>';
  document.getElementById('orderKpi2').innerHTML = '<div class="kpi-label">금월 발주 물량</div><div class="kpi-value">' + fmt(totalQty, '0') + '<small>톤</small></div>';
  document.getElementById('orderKpi3').innerHTML = '<div class="kpi-label">완료 건수</div><div class="kpi-value">' + fmt(completed, '0') + '<small>건</small></div>';
  document.getElementById('orderKpi4').innerHTML = '<div class="kpi-label">진행 중</div><div class="kpi-value">' + fmt(inProgress, '0') + '<small>건</small></div>';
}

function getNextOrderNo() {
  const nextSeq = orders.reduce((max, order) => {
    const match = /PO-\d{4}-(\d+)/.exec(order.no);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0) + 1;

  return 'PO-2026-' + String(nextSeq).padStart(4, '0');
}

function resetOrderForm() {
  document.getElementById('orderSupplier').value = '현대스크랩';
  document.getElementById('orderGrade').value = '중량';
  document.getElementById('orderQty').value = '5000';
  document.getElementById('orderPrice').value = '395000';
  document.getElementById('orderPlant').value = '인천';
  document.getElementById('orderDate').value = '2026-03-15';
}

function updatePdfPreview(order) {
  if (!order) return;

  const amount = order.qty * order.price;
  document.getElementById('pdfOrderNo').textContent = order.no;
  document.getElementById('pdfOrderDate').textContent = order.date;
  document.getElementById('pdfSupplier').textContent = order.sup;
  document.getElementById('pdfManager').textContent = '김철호 과장';
  document.getElementById('pdfGrade').textContent = order.grade;
  document.getElementById('pdfQty').textContent = fmt(order.qty, '0');
  document.getElementById('pdfPrice').textContent = fmt(order.price, '0');
  document.getElementById('pdfAmount').textContent = fmt(amount, '0');
  document.getElementById('pdfTotalAmount').textContent = fmt(amount, '0');
  document.getElementById('pdfPlant').textContent = order.plant + '공장';
  document.getElementById('pdfDeliveryDate').textContent = order.date;
  document.getElementById('pdfIssueDate').textContent = order.date;
}

function initOrders() {
  renderOrders();
  renderOrderSummary();
  updatePdfPreview(orders[0]);
  resetOrderForm();
}

function submitOrder() {
  const nextOrder = normalizeOrder({
    no: getNextOrderNo(),
    sup: document.getElementById('orderSupplier').value,
    grade: document.getElementById('orderGrade').value,
    qty: document.getElementById('orderQty').value,
    price: document.getElementById('orderPrice').value,
    plant: document.getElementById('orderPlant').value,
    date: document.getElementById('orderDate').value,
    status: '대기'
  });

  if (!nextOrder) {
    showToast('발주 정보를 모두 올바르게 입력해주세요.', 'error');
    return;
  }

  orders.unshift(nextOrder);
  saveOrderData();
  renderOrders();
  renderOrderSummary();
  updatePdfPreview(nextOrder);
  hideModal('orderModal');
  resetOrderForm();
  showToast('발주가 등록되었습니다.', 'success');
}

function generatePDF() {
  if (orders.length === 0) {
    showToast('출력할 발주 데이터가 없습니다.', 'error');
    return;
  }

  updatePdfPreview(orders[0]);
  showModal('pdfModal');
}
