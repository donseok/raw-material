// ===== Team Calendar Module =====

var calendarYear = new Date().getFullYear();
var calendarMonth = new Date().getMonth(); // 0-based
var MULTI_DAY_TYPES = ['휴가', '교육', '출장'];

function generateScheduleId() {
  return 'SCH-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
}

// ===== API =====
function fetchSchedules(callback) {
  fetch('/api/schedules')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      schedulesData = Array.isArray(data) ? data : [];
      if (callback) callback();
    })
    .catch(function() {
      // Fallback to defaultSchedules if API fails
      schedulesData = cloneData(defaultSchedules);
      if (callback) callback();
    });
}

function apiAddSchedule(schedule, callback) {
  fetch('/api/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schedule)
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      schedulesData = Array.isArray(data) ? data : schedulesData;
      if (callback) callback(true);
    })
    .catch(function() { if (callback) callback(false); });
}

function apiDeleteSchedule(id, callback) {
  fetch('/api/schedules', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: id })
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      schedulesData = Array.isArray(data) ? data : schedulesData;
      if (callback) callback(true);
    })
    .catch(function() { if (callback) callback(false); });
}

// ===== Init =====
function initCalendar() {
  fetchSchedules(function() {
    renderCalendar();
  });
}

// ===== Calendar Rendering =====
function renderCalendar() {
  var label = document.getElementById('calendarMonthLabel');
  var body = document.getElementById('calendarBody');
  if (!label || !body) return;

  label.textContent = calendarYear + '년 ' + (calendarMonth + 1) + '월';

  var firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  var daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  var today = new Date();
  var todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

  var daySchedules = {};
  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = calendarYear + '-' + String(calendarMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    daySchedules[d] = [];
    schedulesData.forEach(function(sch) {
      if (dateStr >= sch.startDate && dateStr <= sch.endDate) {
        daySchedules[d].push(sch);
      }
    });
  }

  var html = '';
  var day = 1;
  for (var row = 0; row < 6; row++) {
    if (day > daysInMonth) break;
    html += '<tr>';
    for (var col = 0; col < 7; col++) {
      if (row === 0 && col < firstDay) {
        html += '<td class="calendar-cell calendar-empty"></td>';
      } else if (day > daysInMonth) {
        html += '<td class="calendar-cell calendar-empty"></td>';
      } else {
        var dateStr2 = calendarYear + '-' + String(calendarMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        var isToday = dateStr2 === todayStr;
        var isSun = col === 0;
        var isSat = col === 6;
        var cellClass = 'calendar-cell';
        if (isToday) cellClass += ' calendar-today';
        if (isSun) cellClass += ' calendar-sun';
        if (isSat) cellClass += ' calendar-sat';

        var schedules = daySchedules[day];
        var dotsHtml = '';
        if (schedules.length > 0) {
          cellClass += ' calendar-has-schedule';
          var shown = schedules.slice(0, 3);
          shown.forEach(function(sch) {
            var color = SCHEDULE_COLORS[sch.type] || '#9e9e9e';
            dotsHtml += '<div class="calendar-event" style="background:' + color + '">' + escapeHtml(sch.member) + ' ' + escapeHtml(sch.type) + '</div>';
          });
          if (schedules.length > 3) {
            dotsHtml += '<div class="calendar-event-more">+' + (schedules.length - 3) + '</div>';
          }
        }

        html += '<td class="' + cellClass + '" onclick="showDaySchedules(' + calendarYear + ',' + calendarMonth + ',' + day + ')">';
        html += '<div class="calendar-day-num">' + day + '</div>';
        html += '<div class="calendar-events">' + dotsHtml + '</div>';
        html += '</td>';
        day++;
      }
    }
    html += '</tr>';
  }
  body.innerHTML = html;
}

function changeCalendarMonth(delta) {
  calendarMonth += delta;
  if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
  if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
  renderCalendar();
}

// ===== Day Detail =====
function showDaySchedules(year, month, day) {
  var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  var dayItems = schedulesData.filter(function(sch) {
    return dateStr >= sch.startDate && dateStr <= sch.endDate;
  });

  var displayDate = year + '년 ' + (month + 1) + '월 ' + day + '일';
  document.getElementById('scheduleDetailTitle').textContent = displayDate + ' 일정';

  var listEl = document.getElementById('scheduleDetailList');
  if (dayItems.length === 0) {
    listEl.innerHTML = '<div class="notice-empty" style="padding:24px">등록된 일정이 없습니다.</div>';
  } else {
    var html = '<table><thead><tr><th>팀원</th><th>구분</th><th>기간</th><th style="width:50px"></th></tr></thead><tbody>';
    dayItems.forEach(function(sch) {
      var color = SCHEDULE_COLORS[sch.type] || '#9e9e9e';
      var period = sch.startDate === sch.endDate ? sch.startDate : sch.startDate + ' ~ ' + sch.endDate;
      html += '<tr>';
      html += '<td>' + escapeHtml(sch.member) + '</td>';
      html += '<td><span class="badge" style="background:' + color + '22;color:' + color + '">' + escapeHtml(sch.type) + '</span></td>';
      html += '<td style="font-size:12px">' + period + '</td>';
      html += '<td><button class="btn btn-danger btn-sm" style="padding:2px 8px;font-size:11px" onclick="deleteSchedule(\'' + sch.id + '\')">삭제</button></td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    listEl.innerHTML = html;
  }

  showModal('scheduleDetailModal');
}

// ===== Form =====
function toggleEndDateGroup() {
  var type = document.getElementById('scheduleType').value;
  var group = document.getElementById('scheduleEndDateGroup');
  if (!group) return;
  if (MULTI_DAY_TYPES.indexOf(type) !== -1) {
    group.style.display = '';
  } else {
    group.style.display = 'none';
    document.getElementById('scheduleEndDate').value = '';
  }
}

function showScheduleForm() {
  document.getElementById('scheduleMember').value = '';
  document.getElementById('scheduleType').value = '';
  document.getElementById('scheduleStartDate').value = '';
  document.getElementById('scheduleEndDate').value = '';
  document.getElementById('scheduleEndDateGroup').style.display = 'none';
  showModal('scheduleFormModal');
}

function submitSchedule() {
  var member = document.getElementById('scheduleMember').value;
  var type = document.getElementById('scheduleType').value;
  var startDate = document.getElementById('scheduleStartDate').value;
  var useEndDate = MULTI_DAY_TYPES.indexOf(type) !== -1;
  var endDate = useEndDate ? (document.getElementById('scheduleEndDate').value || startDate) : startDate;

  if (!member) { showToast('팀원을 선택해주세요.', 'error'); return; }
  if (!type) { showToast('구분을 선택해주세요.', 'error'); return; }
  if (!startDate) { showToast('시작일을 입력해주세요.', 'error'); return; }
  if (useEndDate && endDate < startDate) { showToast('종료일은 시작일 이후여야 합니다.', 'error'); return; }

  var schedule = {
    id: generateScheduleId(),
    member: member,
    type: type,
    startDate: startDate,
    endDate: endDate,
    memo: ''
  };

  showToast('일정 등록 중...', 'info');
  apiAddSchedule(schedule, function(ok) {
    if (ok) {
      renderCalendar();
      hideModal('scheduleFormModal');
      showToast('일정이 등록되었습니다.', 'success');
    } else {
      showToast('일정 등록에 실패했습니다.', 'error');
    }
  });
}

// ===== Delete =====
function deleteSchedule(id) {
  showToast('일정 삭제 중...', 'info');
  apiDeleteSchedule(id, function(ok) {
    if (ok) {
      renderCalendar();
      hideModal('scheduleDetailModal');
      showToast('일정이 삭제되었습니다.', 'success');
    } else {
      showToast('일정 삭제에 실패했습니다.', 'error');
    }
  });
}
