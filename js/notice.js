// ===== Notice Board Module =====

let notices = [];
var noticeCurrentPage = 1;
var NOTICE_PAGE_SIZE = 10;

function generateNoticeId() {
  return 'N-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== Normalize =====
function normalizeNotice(item) {
  if (!item || typeof item !== 'object') return null;
  if (!item.id || !item.title || !item.author || !item.password) return null;
  return {
    id: String(item.id),
    title: String(item.title).trim(),
    content: String(item.content || '').trim(),
    author: String(item.author).trim(),
    password: String(item.password),
    pinned: !!item.pinned,
    createdAt: item.createdAt || new Date().toISOString()
  };
}

function normalizeNoticesData(data) {
  if (!Array.isArray(data)) return null;
  const result = [];
  for (const item of data) {
    const n = normalizeNotice(item);
    if (n) result.push(n);
  }
  return result;
}

// ===== Storage =====
function loadNoticesFromStorage() {
  const saved = readStoredData(STORAGE_KEYS.notices, normalizeNoticesData);
  if (saved) notices = saved;
}

function saveNoticesData() {
  writeStoredData(STORAGE_KEYS.notices, notices);
}

// ===== Sort =====
function sortNotices() {
  notices.sort(function(a, b) {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

// ===== Render =====
function renderNotices() {
  var list = document.getElementById('noticeList');
  var pagination = document.getElementById('noticePagination');
  sortNotices();

  if (notices.length === 0) {
    list.innerHTML = '<div class="notice-empty">등록된 공지사항이 없습니다.</div>';
    if (pagination) pagination.innerHTML = '';
    return;
  }

  // Separate pinned and normal notices
  var pinnedItems = notices.filter(function(n) { return n.pinned; });
  var normalItems = notices.filter(function(n) { return !n.pinned; });

  // Paginate only normal (non-pinned) items
  var totalPages = Math.max(1, Math.ceil(normalItems.length / NOTICE_PAGE_SIZE));
  if (noticeCurrentPage > totalPages) noticeCurrentPage = totalPages;
  if (noticeCurrentPage < 1) noticeCurrentPage = 1;

  var startIdx = (noticeCurrentPage - 1) * NOTICE_PAGE_SIZE;
  var pageNormalItems = normalItems.slice(startIdx, startIdx + NOTICE_PAGE_SIZE);

  // Render: pinned always on top + paginated normal items
  var displayItems = pinnedItems.concat(pageNormalItems);

  var html = '<table><thead><tr><th style="width:70px" class="text-center">구분</th><th>제목</th><th style="width:100px">작성자</th><th style="width:110px">작성일</th></tr></thead><tbody>';
  displayItems.forEach(function(n) {
    var date = new Date(n.createdAt).toLocaleDateString('ko-KR');
    var pinnedBadge = n.pinned ? '<span class="badge badge-red">필독</span>' : '';
    html += '<tr class="notice-row' + (n.pinned ? ' notice-pinned' : '') + '" onclick="viewNotice(\'' + n.id + '\')" style="cursor:pointer">';
    html += '<td class="text-center" style="white-space:nowrap">' + pinnedBadge + '</td>';
    html += '<td class="notice-title-cell">' + escapeHtml(n.title) + '</td>';
    html += '<td>' + escapeHtml(n.author) + '</td>';
    html += '<td>' + date + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table>';
  list.innerHTML = html;

  // Pagination (always show)
  if (pagination) {
    var pagHtml = '';
    pagHtml += '<button class="pagination-btn' + (noticeCurrentPage === 1 ? ' disabled' : '') + '"' + (noticeCurrentPage === 1 ? ' disabled' : ' onclick="goNoticePage(' + (noticeCurrentPage - 1) + ')"') + '>&laquo;</button>';
    for (var p = 1; p <= totalPages; p++) {
      pagHtml += '<button class="pagination-btn' + (p === noticeCurrentPage ? ' active' : '') + '" onclick="goNoticePage(' + p + ')">' + p + '</button>';
    }
    pagHtml += '<button class="pagination-btn' + (noticeCurrentPage === totalPages ? ' disabled' : '') + '"' + (noticeCurrentPage === totalPages ? ' disabled' : ' onclick="goNoticePage(' + (noticeCurrentPage + 1) + ')"') + '>&raquo;</button>';
    pagination.innerHTML = pagHtml;
  }
}

function goNoticePage(page) {
  noticeCurrentPage = page;
  renderNotices();
}

// ===== Init =====
function initNotices() {
  renderNotices();
}

// ===== Form (Create / Edit) =====
function showNoticeForm(editId) {
  var isEdit = !!editId;
  document.getElementById('noticeFormTitle').textContent = isEdit ? '공지사항 수정' : '공지사항 등록';
  document.getElementById('noticeForm').dataset.editId = editId || '';
  document.getElementById('noticePasswordHint').style.display = isEdit ? 'block' : 'none';

  if (isEdit) {
    var notice = notices.find(function(n) { return n.id === editId; });
    if (!notice) return;
    document.getElementById('noticeTitle').value = notice.title;
    document.getElementById('noticeContent').value = notice.content;
    document.getElementById('noticeAuthor').value = notice.author;
    document.getElementById('noticePassword').value = '';
    document.getElementById('noticePinned').checked = notice.pinned;
  } else {
    document.getElementById('noticeTitle').value = '';
    document.getElementById('noticeContent').value = '';
    document.getElementById('noticeAuthor').value = '';
    document.getElementById('noticePassword').value = '';
    document.getElementById('noticePinned').checked = false;
  }

  showModal('noticeFormModal');
}

function submitNotice() {
  var form = document.getElementById('noticeForm');
  var editId = form.dataset.editId;
  var title = document.getElementById('noticeTitle').value.trim();
  var content = document.getElementById('noticeContent').value.trim();
  var author = document.getElementById('noticeAuthor').value.trim();
  var password = document.getElementById('noticePassword').value;
  var pinned = document.getElementById('noticePinned').checked;

  if (!title) { showToast('제목을 입력해주세요.', 'error'); return; }
  if (!author) { showToast('작성자를 입력해주세요.', 'error'); return; }
  if (!password) { showToast('비밀번호를 입력해주세요.', 'error'); return; }

  if (editId) {
    var notice = notices.find(function(n) { return n.id === editId; });
    if (!notice) return;
    if (notice.password !== password) {
      showToast('비밀번호가 일치하지 않습니다.', 'error');
      return;
    }
    notice.title = title;
    notice.content = content;
    notice.author = author;
    notice.pinned = pinned;
  } else {
    notices.push({
      id: generateNoticeId(),
      title: title,
      content: content,
      author: author,
      password: password,
      pinned: pinned,
      createdAt: new Date().toISOString()
    });
  }

  saveNoticesData();
  renderNotices();
  hideModal('noticeFormModal');
  showToast(editId ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.', 'success');
}

// ===== View Detail =====
function viewNotice(id) {
  var notice = notices.find(function(n) { return n.id === id; });
  if (!notice) return;

  var date = new Date(notice.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  document.getElementById('viewNoticeTitle').textContent = notice.title;
  document.getElementById('viewNoticeMeta').textContent = notice.author + '  |  ' + date;
  document.getElementById('viewNoticePinned').style.display = notice.pinned ? 'inline-block' : 'none';
  document.getElementById('viewNoticeContent').textContent = notice.content || '(내용 없음)';
  document.getElementById('viewNoticeActions').dataset.noticeId = id;

  showModal('noticeViewModal');
}

// ===== Edit from Detail =====
function promptEditNotice() {
  var id = document.getElementById('viewNoticeActions').dataset.noticeId;
  hideModal('noticeViewModal');
  showNoticeForm(id);
}

// ===== Delete =====
function promptDeleteNotice() {
  var id = document.getElementById('viewNoticeActions').dataset.noticeId;
  hideModal('noticeViewModal');
  document.getElementById('deleteNoticeConfirm').dataset.noticeId = id;
  document.getElementById('deletePassword').value = '';
  showModal('noticeDeleteModal');
}

function confirmDeleteNotice() {
  var id = document.getElementById('deleteNoticeConfirm').dataset.noticeId;
  var password = document.getElementById('deletePassword').value;

  if (!password) { showToast('비밀번호를 입력해주세요.', 'error'); return; }

  var idx = notices.findIndex(function(n) { return n.id === id; });
  if (idx === -1) return;

  if (notices[idx].password !== password) {
    showToast('비밀번호가 일치하지 않습니다.', 'error');
    return;
  }

  notices.splice(idx, 1);
  saveNoticesData();
  renderNotices();
  hideModal('noticeDeleteModal');
  showToast('공지사항이 삭제되었습니다.', 'success');
}
