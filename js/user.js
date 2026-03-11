// ===== User Management Module =====

var userCurrentPage = 1;
var USER_PAGE_SIZE = 10;

// ===== Normalize =====
function normalizeUser(item) {
  if (!item || typeof item !== 'object') return null;
  if (!item.id || !item.password || !item.name || !item.dept) return null;
  return {
    id: String(item.id).trim(),
    password: String(item.password),
    name: String(item.name).trim(),
    dept: String(item.dept).trim(),
    position: String(item.position || '').trim(),
    email: String(item.email || '').trim(),
    phone: String(item.phone || '').trim(),
    role: item.role === 'admin' ? 'admin' : 'user',
    status: item.status === 'inactive' ? 'inactive' : 'active',
    createdAt: item.createdAt || new Date().toISOString()
  };
}

function normalizeUsersData(data) {
  if (!Array.isArray(data)) return null;
  var result = [];
  for (var i = 0; i < data.length; i++) {
    var u = normalizeUser(data[i]);
    if (u) result.push(u);
  }
  return result.length > 0 ? result : null;
}

// ===== Storage =====
function loadUsersFromStorage() {
  var saved = readStoredData(STORAGE_KEYS.users, normalizeUsersData);
  if (saved) usersData = saved;
}

function saveUsersData() {
  writeStoredData(STORAGE_KEYS.users, usersData);
}

// ===== Render =====
function renderUsers() {
  var tbody = document.getElementById('userTable');
  var pagination = document.getElementById('userPagination');

  // Sort: admin first, then by createdAt desc
  usersData.sort(function(a, b) {
    if (a.role !== b.role) return a.role === 'admin' ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  var totalPages = Math.max(1, Math.ceil(usersData.length / USER_PAGE_SIZE));
  if (userCurrentPage > totalPages) userCurrentPage = totalPages;
  if (userCurrentPage < 1) userCurrentPage = 1;

  var startIdx = (userCurrentPage - 1) * USER_PAGE_SIZE;
  var pageItems = usersData.slice(startIdx, startIdx + USER_PAGE_SIZE);

  var html = '';
  pageItems.forEach(function(u) {
    var date = new Date(u.createdAt).toLocaleDateString('ko-KR');
    var roleBadge = u.role === 'admin'
      ? '<span class="badge badge-blue">관리자</span>'
      : '<span class="badge badge-gray">일반</span>';
    var statusBadge = u.status === 'active'
      ? '<span class="status-indicator"><span class="status-dot green"></span>활성</span>'
      : '<span class="status-indicator"><span class="status-dot red"></span>비활성</span>';

    html += '<tr>';
    html += '<td><strong>' + escapeHtml(u.id) + '</strong></td>';
    html += '<td>' + escapeHtml(u.name) + '</td>';
    html += '<td>' + escapeHtml(u.dept) + '</td>';
    html += '<td>' + escapeHtml(u.position || '-') + '</td>';
    html += '<td>' + escapeHtml(u.email || '-') + '</td>';
    html += '<td>' + escapeHtml(u.phone || '-') + '</td>';
    html += '<td class="text-center">' + roleBadge + '</td>';
    html += '<td class="text-center">' + statusBadge + '</td>';
    html += '<td>' + date + '</td>';
    html += '<td class="text-center" style="white-space:nowrap">';
    html += '<button class="btn btn-outline btn-sm" onclick="editUser(\'' + escapeHtml(u.id) + '\')">수정</button> ';
    html += '<button class="btn btn-danger btn-sm" onclick="deleteUser(\'' + escapeHtml(u.id) + '\')">삭제</button>';
    html += '</td>';
    html += '</tr>';
  });
  tbody.innerHTML = html;

  // KPI
  var total = usersData.length;
  var activeCount = usersData.filter(function(u) { return u.status === 'active'; }).length;
  var adminCount = usersData.filter(function(u) { return u.role === 'admin'; }).length;
  var inactiveCount = total - activeCount;

  document.getElementById('userKpi1').innerHTML = '<div class="kpi-label">전체 사용자</div><div class="kpi-value">' + total + '<small>명</small></div>';
  document.getElementById('userKpi2').innerHTML = '<div class="kpi-label">활성 사용자</div><div class="kpi-value">' + activeCount + '<small>명</small></div>';
  document.getElementById('userKpi3').innerHTML = '<div class="kpi-label">관리자</div><div class="kpi-value">' + adminCount + '<small>명</small></div>';
  document.getElementById('userKpi4').innerHTML = '<div class="kpi-label">비활성 사용자</div><div class="kpi-value">' + inactiveCount + '<small>명</small></div>';

  // Pagination
  if (pagination) {
    var pagHtml = '';
    pagHtml += '<button class="pagination-btn' + (userCurrentPage === 1 ? ' disabled' : '') + '"' + (userCurrentPage === 1 ? ' disabled' : ' onclick="goUserPage(' + (userCurrentPage - 1) + ')"') + '>&laquo;</button>';
    for (var p = 1; p <= totalPages; p++) {
      pagHtml += '<button class="pagination-btn' + (p === userCurrentPage ? ' active' : '') + '" onclick="goUserPage(' + p + ')">' + p + '</button>';
    }
    pagHtml += '<button class="pagination-btn' + (userCurrentPage === totalPages ? ' disabled' : '') + '"' + (userCurrentPage === totalPages ? ' disabled' : ' onclick="goUserPage(' + (userCurrentPage + 1) + ')"') + '>&raquo;</button>';
    pagination.innerHTML = pagHtml;
  }
}

function goUserPage(page) {
  userCurrentPage = page;
  renderUsers();
}

// ===== Init =====
function initUsers() {
  renderUsers();
}

// ===== Form: Show =====
function showUserForm(editId) {
  var isEdit = !!editId;
  document.getElementById('userFormTitle').textContent = isEdit ? '사용자 수정' : '사용자 등록';
  document.getElementById('userForm').dataset.editId = editId || '';

  var idInput = document.getElementById('userIdInput');

  if (isEdit) {
    var user = usersData.find(function(u) { return u.id === editId; });
    if (!user) return;
    idInput.value = user.id;
    idInput.disabled = true;
    document.getElementById('userPasswordInput').value = '';
    document.getElementById('userPasswordInput').placeholder = '변경 시에만 입력';
    document.getElementById('userNameInput').value = user.name;
    document.getElementById('userDeptInput').value = user.dept;
    document.getElementById('userPositionInput').value = user.position;
    document.getElementById('userEmailInput').value = user.email;
    document.getElementById('userPhoneInput').value = user.phone;
    document.getElementById('userRoleInput').value = user.role;
    document.getElementById('userStatusInput').value = user.status;
  } else {
    idInput.value = '';
    idInput.disabled = false;
    document.getElementById('userPasswordInput').value = '';
    document.getElementById('userPasswordInput').placeholder = '비밀번호 입력';
    document.getElementById('userNameInput').value = '';
    document.getElementById('userDeptInput').value = '원료기획팀';
    document.getElementById('userPositionInput').value = '사원';
    document.getElementById('userEmailInput').value = '';
    document.getElementById('userPhoneInput').value = '';
    document.getElementById('userRoleInput').value = 'user';
    document.getElementById('userStatusInput').value = 'active';
  }

  showModal('userModal');
}

// ===== Form: Submit =====
function submitUser() {
  var form = document.getElementById('userForm');
  var editId = form.dataset.editId;
  var isEdit = !!editId;

  var id = document.getElementById('userIdInput').value.trim();
  var password = document.getElementById('userPasswordInput').value;
  var name = document.getElementById('userNameInput').value.trim();
  var dept = document.getElementById('userDeptInput').value.trim();
  var position = document.getElementById('userPositionInput').value;
  var email = document.getElementById('userEmailInput').value.trim();
  var phone = document.getElementById('userPhoneInput').value.trim();
  var role = document.getElementById('userRoleInput').value;
  var status = document.getElementById('userStatusInput').value;

  if (!id) { showToast('아이디를 입력해주세요.', 'error'); return; }
  if (/[^a-zA-Z0-9_]/.test(id)) { showToast('아이디는 영문, 숫자, 밑줄만 사용 가능합니다.', 'error'); return; }
  if (!isEdit && !password) { showToast('비밀번호를 입력해주세요.', 'error'); return; }
  if (!name) { showToast('이름을 입력해주세요.', 'error'); return; }
  if (!dept) { showToast('부서를 입력해주세요.', 'error'); return; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('이메일 형식이 올바르지 않습니다.', 'error'); return; }

  if (isEdit) {
    var user = usersData.find(function(u) { return u.id === editId; });
    if (!user) return;
    if (password) user.password = password;
    user.name = name;
    user.dept = dept;
    user.position = position;
    user.email = email;
    user.phone = phone;
    user.role = role;
    user.status = status;
  } else {
    if (usersData.some(function(u) { return u.id === id; })) {
      showToast('이미 존재하는 아이디입니다.', 'error');
      return;
    }
    usersData.push({
      id: id,
      password: password,
      name: name,
      dept: dept,
      position: position,
      email: email,
      phone: phone,
      role: role,
      status: status,
      createdAt: new Date().toISOString()
    });
  }

  saveUsersData();
  renderUsers();
  hideModal('userModal');
  showToast(isEdit ? '사용자 정보가 수정되었습니다.' : '사용자가 등록되었습니다.', 'success');
}

// ===== Edit =====
function editUser(id) {
  showUserForm(id);
}

// ===== Delete =====
function deleteUser(id) {
  var user = usersData.find(function(u) { return u.id === id; });
  if (!user) return;

  try {
    var loggedIn = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (loggedIn && loggedIn.id === id) {
      showToast('현재 로그인한 계정은 삭제할 수 없습니다.', 'error');
      return;
    }
  } catch(e) {}

  if (!confirm('사용자 "' + user.name + ' (' + user.id + ')" 을(를) 삭제하시겠습니까?')) return;

  usersData = usersData.filter(function(u) { return u.id !== id; });
  saveUsersData();
  renderUsers();
  showToast('사용자가 삭제되었습니다.', 'success');
}
