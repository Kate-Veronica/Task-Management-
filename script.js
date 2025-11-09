let user = null;
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editTaskId = null;

// Login function
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (
    (username === "pm" || username === "user1" || username === "user2") &&
    password === "123"
  ) {
    user = { username, role: username === "pm" ? "pm" : "user" };
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("task-section").classList.remove("hidden");
    document.getElementById("welcome").textContent = `Welcome, ${username}`;

    // ✅ Only show PM controls for pm
    if (user.role === "pm") {
      document.getElementById("pm-controls").classList.remove("hidden");
    } else {
      document.getElementById("pm-controls").classList.add("hidden");
    }

    loadTasks();
  } else {
    alert("Invalid credentials!");
  }
}

// Logout
function logout() {
  user = null;
  document.getElementById("login-section").classList.remove("hidden");
  document.getElementById("task-section").classList.add("hidden");
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load and display tasks
function loadTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  const filtered =
    user.role === "pm"
      ? tasks
      : tasks.filter((t) => t.assignedTo === user.username);

  filtered.forEach((task) => {
    const div = document.createElement("div");
    div.className = "task";

    // Optional overdue alert
    const isOverdue =
      task.deadline < new Date().toISOString().split("T")[0] &&
      task.status !== "Done";
    if (isOverdue) {
      div.classList.add("overdue");
      div.innerHTML += "<p style='color:red'>⚠️ Missed Deadline!</p>";
    }

    div.innerHTML += `
      <h4>${task.title}</h4>
      <p>${task.desc}</p>
      <p><strong>Deadline:</strong> ${task.deadline}</p>
      <p><strong>Assigned To:</strong> ${task.assignedTo}</p>
      <p><strong>Status:</strong> ${task.status}</p>
    `;

    // User status update dropdown
    if (user.role === "user" && task.assignedTo === user.username) {
      div.innerHTML += `
        <select onchange="updateStatus(${task.id}, this.value)">
          <option ${task.status === "Pending" ? "selected" : ""}>Pending</option>
          <option ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option ${task.status === "Done" ? "selected" : ""}>Done</option>
        </select>
      `;
    }

    // PM edit/delete buttons
    if (user.role === "pm") {
      div.innerHTML += `
        <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      `;
    }

    taskList.appendChild(div);
  });
}

// Add or Update Task
function addTask() {
  if (user.role !== "pm") {
    alert("Only PM can add tasks!");
    return;
  }

  const title = document.getElementById("title").value;
  const desc = document.getElementById("desc").value;
  const deadline = document.getElementById("deadline").value;
  const assignedTo = document.getElementById("assignedTo").value;

  if (!title || !deadline || !assignedTo) {
    alert("Please fill all fields!");
    return;
  }

  if (editTaskId) {
    tasks = tasks.map((t) =>
      t.id === editTaskId ? { ...t, title, desc, deadline, assignedTo } : t
    );
    editTaskId = null;
    document.querySelector("#pm-controls h3").textContent = "Add New Task";
    document.querySelector("#pm-controls button").textContent = "Add Task";
    alert("Task updated successfully!");
  } else {
    const newTask = {
      id: Date.now(),
      title,
      desc,
      deadline,
      assignedTo,
      status: "Pending",
    };
    tasks.push(newTask);
    alert("Task added successfully!");
  }

  saveTasks();
  loadTasks();
  clearForm();
}

// Clear form
function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("desc").value = "";
  document.getElementById("deadline").value = "";
  document.getElementById("assignedTo").value = "";
}

// Edit task (PM only)
function editTask(id) {
  if (user.role !== "pm") return alert("Only PM can edit tasks!");
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  document.getElementById("title").value = task.title;
  document.getElementById("desc").value = task.desc;
  document.getElementById("deadline").value = task.deadline;
  document.getElementById("assignedTo").value = task.assignedTo;

  editTaskId = id;
  document.querySelector("#pm-controls h3").textContent = "Edit Task";
  document.querySelector("#pm-controls button").textContent = "Update Task";
}

// Delete task (PM only)
function deleteTask(id) {
  if (user.role !== "pm") return alert("Only PM can delete tasks!");
  const confirmDelete = confirm("Are you sure you want to delete this task?");
  if (!confirmDelete) return;

  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  loadTasks();
  alert("Task deleted successfully!");
}

// Update task status (User only)
function updateStatus(id, status) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  if (user.role !== "user" || task.assignedTo !== user.username) {
    return alert("You can only update your own tasks!");
  }

  task.status = status;
  saveTasks();
  loadTasks();
  alert("Task status updated!");
}
