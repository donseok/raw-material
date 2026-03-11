// ===== Team Calendar Module =====

var calendarYear = new Date().getFullYear();
var calendarMonth = new Date().getMonth(); // 0-based

// ===== Init =====
function initCalendar() {
  schedulesData = cloneData(defaultSchedules);
  renderCalendar();
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

  // Build schedule map for the month
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
    var html = '<table><thead><tr><th>팀원</th><th>구분</th><th>기간</th></tr></thead><tbody>';
    dayItems.forEach(function(sch) {
      var color = SCHEDULE_COLORS[sch.type] || '#9e9e9e';
      var period = sch.startDate === sch.endDate ? sch.startDate : sch.startDate + ' ~ ' + sch.endDate;
      html += '<tr>';
      html += '<td>' + escapeHtml(sch.member) + '</td>';
      html += '<td><span class="badge" style="background:' + color + '22;color:' + color + '">' + escapeHtml(sch.type) + '</span></td>';
      html += '<td style="font-size:12px">' + period + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    listEl.innerHTML = html;
  }

  showModal('scheduleDetailModal');
}
