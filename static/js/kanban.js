const columns = ['todo', 'doing', 'done'];

const WIP_LIMIT = {
  todo: Infinity,
  doing: 3,
  done: Infinity
};


columns.forEach(col => {
  new Sortable(document.getElementById(col), {
    group: 'kanban',
    animation: 180,
    easing: "cubic-bezier(0.25, 1, 0.5, 1)",

    ghostClass: 'task-ghost',
    chosenClass: 'task-chosen',
    dragClass: 'task-drag',

    forceFallback: true,
    fallbackTolerance: 5,

    onMove: function (evt) {
      const targetCol = evt.to.id;
      const limit = WIP_LIMIT[targetCol];

      if (limit === Infinity) return true;

      const currentCount = evt.to.children.length;

      if (currentCount >= limit) {
        return false; //Chặn thả
      }
      return true;
    },

    onEnd: function (evt) {
      const newStatus = evt.to.id;

      //CẬP NHẬT STATUS CHO TASK VỪA KÉO
      evt.item.dataset.status = newStatus;

      saveBoard();
      updateWipCount();
      markOverdueTasks();
      drawBurndownChart();
      sortByPriority();
    }
  });
});

function saveBoard() {
  let payload = [];

  columns.forEach(col => {
    document.querySelectorAll(`#${col} .task`)
      .forEach((el, index) => {
        payload.push({
          id: el.dataset.id,
          status: col,
          ordering: index
        });
      });
  });

  fetch('/task/update', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
}

function addProject() {
  fetch('/project/create', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      name: projectName.value
    })
  }).then(() => location.reload());
}

function addTask() {
  const board = document.querySelector('.board');
  const tagInput = document.getElementById('taskTag');
  const priorityInput = document.getElementById('taskPriority');

  if (!board) {
    alert("Board not found");
    return;
  }

  const projectId = board.dataset.projectId;

  if (!projectId) {
    alert("Project ID not found");
    return;
  }

  const titleInput = document.getElementById('taskTitle');
  const deadlineInput = document.getElementById('taskDeadline');

  if (!titleInput.value.trim()) {
    alert("Task title is required");
    return;
  }

  fetch('/task/create', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      title: titleInput.value,
      project_id: projectId,
      deadline: deadlineInput.value,
      tags: tagInput.value,
      priority: parseInt(priorityInput.value)
    })
  })
  .then(res => {
    if (!res.ok) {
      alert("Failed to add task");
      return;
    }
    location.reload();
  });
}

//Cập nhật số lượng WIP
function updateWipCount() {
  const doingCol = document.getElementById('doing');
  const wipSpan = document.querySelector('.wip');

  if (!doingCol || !wipSpan) return;

  const count = doingCol.children.length;
  wipSpan.innerText = `${count} / ${WIP_LIMIT.doing}`;
}



//Kiểm tra task quá hạn
function markOverdueTasks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  document.querySelectorAll('.task').forEach(task => {
    const deadline = task.dataset.deadline;
    const status = task.dataset.status;

    //nếu không có deadline hoặc đã done → xoá overdue
    if (!deadline || status === 'done') {
      task.classList.remove('overdue');
      return;
    }

    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
      task.classList.add('overdue');
    } else {
      task.classList.remove('overdue');
    }
  });
}


//Vẽ biểu đồ burndown
let burndownChartInstance = null;

function drawBurndownChart() {
  const canvas = document.getElementById('burndownChart');
  if (!canvas) return;

  const tasks = document.querySelectorAll('.task');
  if (!tasks.length) return;

  let deadlines = [];

  tasks.forEach(task => {
    if (task.dataset.deadline) {
      deadlines.push(task.dataset.deadline);
    }
  });

  if (!deadlines.length) return;

  deadlines.sort();
  const start = new Date(deadlines[0]);
  const end = new Date(deadlines[deadlines.length - 1]);

  let labels = [];
  let remaining = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.toISOString().split('T')[0];
    labels.push(day);

    let count = 0;
    tasks.forEach(task => {
      if (
        task.dataset.deadline &&
        task.dataset.deadline >= day &&
        task.dataset.status !== 'done'
      ) {
        count++;
      }
    });

    remaining.push(count);
  }

  // DESTROY CHART CŨ
  if (burndownChartInstance) {
    burndownChartInstance.destroy();
  }

  burndownChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Remaining Tasks',
        data: remaining,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52,152,219,0.15)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
}

//Áp dụng bộ lọc
function applyFilters() {
  const showOverdueOnly = document.getElementById('filterOverdue').checked;
  const hideDone = document.getElementById('hideDone').checked;
  const deadlineFilter = document.getElementById('filterDeadline').value;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  document.querySelectorAll('.task').forEach(task => {
    let visible = true;

    const deadline = task.dataset.deadline;
    const status = task.dataset.status;

    // Overdue filter
    if (showOverdueOnly && !task.classList.contains('overdue')) {
      visible = false;
    }

    // Hide done
    if (hideDone && status === 'done') {
      visible = false;
    }

    // Deadline filter
    if (deadlineFilter && deadline) {
      const d = new Date(deadline);
      d.setHours(0, 0, 0, 0);

      if (deadlineFilter === 'today' && d.getTime() !== today.getTime()) {
        visible = false;
      }

      if (deadlineFilter === 'week') {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        if (d < today || d > weekEnd) visible = false;
      }
    }

    task.style.display = visible ? '' : 'none';
  });
}

const filterTagInput = document.getElementById('filterTag');

filterTagInput.addEventListener('input', () => {
  const keyword = filterTagInput.value.trim().toLowerCase();

  document.querySelectorAll('.task').forEach(task => {
    const tagsRaw = task.dataset.tags || '';

    // Không nhập gì → hiện tất cả
    if (!keyword) {
      task.style.display = '';
      return;
    }

    // Tách nhiều tag
    const tags = tagsRaw
      .split(',')
      .map(t => t.trim().toLowerCase());

    // Match nếu có ít nhất 1 tag chứa keyword
    const matched = tags.some(tag => tag.includes(keyword));

    task.style.display = matched ? '' : 'none';
  });
});



document.addEventListener('DOMContentLoaded', function () {

  const filterOverdue = document.getElementById('filterOverdue');
  const hideDone = document.getElementById('hideDone');
  const filterDeadline = document.getElementById('filterDeadline');

  if (filterOverdue) {
    filterOverdue.addEventListener('change', applyFilters);
  }

  if (hideDone) {
    hideDone.addEventListener('change', applyFilters);
  }

  if (filterDeadline) {
    filterDeadline.addEventListener('change', applyFilters);
  }

});

// Sắp xếp task theo độ ưu tiên
function sortByPriority() {
  ['todo', 'doing', 'done'].forEach(col => {
    const column = document.getElementById(col);
    if (!column) return;

    const tasks = Array.from(column.querySelectorAll('.task'));
    tasks.sort((a, b) =>
      (a.dataset.priority || 3) - (b.dataset.priority || 3)
    );

    tasks.forEach(t => column.appendChild(t));
  });
}

//Xoá project
// Chọn project
document.querySelectorAll('.project-name').forEach(el => {
  el.addEventListener('click', () => {
    const li = el.closest('.project-item');
    const projectId = li.dataset.projectId;
    window.location.href = `/project/${projectId}`;
  });
});

// Xoá project
document.querySelectorAll('.delete-project').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();

    const li = btn.closest('.project-item');
    const projectId = li.dataset.projectId;
    const projectName = li.dataset.projectName;

    if (!confirm(`Bạn có chắc muốn xoá project "${projectName}"?\nToàn bộ task sẽ bị xoá.`)) {
      return;
    }

    fetch(`/project/${projectId}/delete`, {
      method: 'POST'
    })
    .then(res => {
      if (!res.ok) {
        alert("Delete project failed");
        return;
      }
      location.href = '/';
    });
  });
});

// Add project
document.getElementById('addProjectBtn').addEventListener('click', () => {
  const input = document.getElementById('projectName');
  if (!input.value.trim()) {
    alert("Project name is required");
    return;
  }

  fetch('/project/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: input.value.trim() })
  })
  .then(res => {
    if (!res.ok) {
      alert("Add project failed");
      return;
    }
    location.reload();
  });
});




/*
document.addEventListener('click', function (e) {
  const el = e.target;

  if (!el.classList.contains('editable')) return;

  const task = el.closest('.task');
  const taskId = task.dataset.id;

  if (el.dataset.editing) return;
  el.dataset.editing = true;

  // ===== TITLE =====
  if (el.classList.contains('task-title')) {
    const input = document.createElement('input');
    input.value = el.innerText;

    el.replaceWith(input);
    input.focus();

    input.addEventListener('blur', () => {
      saveInlineEdit(taskId, { title: input.value });
      el.innerText = input.value;
      el.dataset.editing = false;
      input.replaceWith(el);
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') input.blur();
    });
  }

  // ===== TAGS =====
  if (el.classList.contains('task-tags')) {
    const input = document.createElement('input');
    input.value = el.innerText;

    el.replaceWith(input);
    input.focus();

    input.addEventListener('blur', () => {
      saveInlineEdit(taskId, { tags: input.value });
      el.innerText = input.value;
      el.dataset.editing = false;
      input.replaceWith(el);
    });
  }

  // ===== DEADLINE =====
  if (el.classList.contains('task-deadline')) {
    const input = document.createElement('input');
    input.type = 'date';
    input.value = el.innerText;

    el.replaceWith(input);
    input.focus();

    input.addEventListener('blur', () => {
      saveInlineEdit(taskId, { deadline: input.value });
      el.innerText = input.value;
      el.dataset.editing = false;
      input.replaceWith(el);
    });
  }

  // ===== PRIORITY =====
  if (el.classList.contains('priority')) {
    const select = document.createElement('select');
    select.innerHTML = `
      <option value="1">High</option>
      <option value="2">Medium</option>
      <option value="3">Low</option>
    `;
    select.value = task.dataset.priority;

    el.replaceWith(select);
    select.focus();

    select.addEventListener('change', () => {
      saveInlineEdit(taskId, { priority: parseInt(select.value) });
      task.dataset.priority = select.value;
      location.reload();
    });
  }
});
function saveInlineEdit(taskId, payload) {
  fetch(`/task/${taskId}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(() => {
    markOverdueTasks();
    drawBurndownChart();
  });
}
*/



updateWipCount();
markOverdueTasks();
drawBurndownChart();
sortByPriority();
