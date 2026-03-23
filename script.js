let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");

const filterAll = document.getElementById("filterAll");
const filterPending = document.getElementById("filterPending");
const filterDone = document.getElementById("filterDone");

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateCounter() {
  const total = tasks.length;
  const pending = tasks.filter((t) => !t.completed).length;
  taskCounter.textContent = `${total} tarefas • ${pending} pendentes`;
}

function getFilteredTasks() {
  if (currentFilter === "pending") return tasks.filter((t) => !t.completed);
  if (currentFilter === "done") return tasks.filter((t) => t.completed);
  return tasks;
}

function renderTasks() {
  taskList.innerHTML = "";

  const filtered = getFilteredTasks();

  if (filtered.length === 0) {
    taskList.innerHTML = `
      <li class="empty-state">
        Nenhuma tarefa encontrada. Comece adicionando uma nova 🚀
      </li>
    `;
    updateCounter();
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  filtered.forEach((task) => {
    const li = document.createElement("li");
    li.classList.add("task-item");

    const isOverdue = task.deadline && task.deadline < today && !task.completed;

    li.innerHTML = `
      <div class="task-content">

        <input type="checkbox"
          ${task.completed ? "checked" : ""}
          onchange="toggleTask(${task.id})"
        >

        <div>

          ${
            task.editing
              ? `
                <input class="edit-input"
                  value="${task.text}"
                  onblur="saveEdit(${task.id}, this.value)"
                  onkeypress="handleEditKey(event, ${task.id}, this.value)"
                  autofocus
                >
              `
              : `
                <span class="task-text ${task.completed ? "done" : ""}">
                  ${task.text}
                </span>
              `
          }

          <small class="task-date ${isOverdue ? "overdue" : ""}">
            Criado em: ${task.createdAt}
            ${task.deadline ? `<br>Prazo: ${task.deadline}` : ""}
          </small>

        </div>

      </div>

      <div class="task-actions">

        ${
          task.editing
            ? `<button onclick="cancelEdit(${task.id})">Cancelar</button>`
            : `<button onclick="editTask(${task.id})">Editar</button>`
        }

        <button onclick="deleteTask(${task.id})">Excluir</button>

      </div>
    `;

    taskList.appendChild(li);
  });

  updateCounter();
}

function addTask(e) {
  e.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({
    id: Date.now(),
    text,
    completed: false,
    createdAt: new Date().toLocaleDateString("pt-PT"),
    deadline: taskDate.value || null,
    editing: false,
  });

  saveTasks();
  renderTasks();
  taskForm.reset();
}

function toggleTask(id) {
  tasks = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t,
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

  tasks = tasks.filter((t) => t.id !== id);

  saveTasks();
  renderTasks();
}

function editTask(id) {
  tasks = tasks.map((t) => ({
    ...t,
    editing: t.id === id,
  }));

  renderTasks();
}

function saveEdit(id, value) {
  if (!value.trim()) return;

  tasks = tasks.map((t) =>
    t.id === id ? { ...t, text: value, editing: false } : t,
  );

  saveTasks();
  renderTasks();
}

function cancelEdit(id) {
  tasks = tasks.map((t) => ({
    ...t,
    editing: false,
  }));

  renderTasks();
}

function handleEditKey(e, id, value) {
  if (e.key === "Enter") {
    saveEdit(id, value);
  }
}

function setFilter(filter) {
  currentFilter = filter;

  filterAll.classList.remove("active");
  filterPending.classList.remove("active");
  filterDone.classList.remove("active");

  if (filter === "all") filterAll.classList.add("active");
  if (filter === "pending") filterPending.classList.add("active");
  if (filter === "done") filterDone.classList.add("active");

  renderTasks();
}

taskForm.addEventListener("submit", addTask);
filterAll.onclick = () => setFilter("all");
filterPending.onclick = () => setFilter("pending");
filterDone.onclick = () => setFilter("done");

renderTasks();
