// ===== Shared Utilities =====

const fmt = n => n.toLocaleString('ko-KR');
const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function showModal(id) { document.getElementById(id).classList.add('show'); }
function hideModal(id) { document.getElementById(id).classList.remove('show'); }

function showToast(msg, type) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'toast ' + (type || 'info');
  requestAnimationFrame(() => { toast.classList.add('show'); });
  setTimeout(() => { toast.classList.remove('show'); }, 2500);
}

function parseNum(s) {
  if (!s || !s.trim() || s.trim() === '-') return null;
  const n = parseInt(s.toString().replace(/,/g, '').trim());
  return isNaN(n) ? null : n;
}

function startCellEdit(td, value, onSave) {
  if (td.classList.contains('editing')) return;
  td.classList.add('editing');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value || '';
  td.textContent = '';
  td.appendChild(input);
  input.focus();
  input.select();

  function commit() {
    td.classList.remove('editing');
    const newVal = parseNum(input.value);
    onSave(newVal);
  }
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { td.classList.remove('editing'); onSave(value); }
  });
}

// ===== Chart Instance Manager =====
const chartInstances = {};
function destroyChart(id) { if(chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; } }
