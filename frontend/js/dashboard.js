const API_URL = 'http://localhost:5000/api';
let tasks = [];
let currentFilter = 'all';

// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
    window.location.href = 'login.html';
}

// Set username display
document.getElementById('username-display').textContent = `Welcome, ${user.username}`;

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

// Load tasks on page load
loadTasks();

// Task form submission
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description, priority, dueDate })
        });
        
        if (response.ok) {
            const newTask = await response.json();
            tasks.unshift(newTask);
            renderTasks();
            updateProgress();
            
            // Clear form
            document.getElementById('taskForm').reset();
        }
    } catch (err) {
        console.error('Error adding task:', err);
    }
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            tasks = await response.json();
            renderTasks();
            updateProgress();
        }
    } catch (err) {
        console.error('Error loading tasks:', err);
    }
}

function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <h3>No tasks found</h3>
                <p>Start by adding a new task above!</p>
            </div>
        `;
        return;
    }
    
    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                 onclick="toggleTask('${task._id}')"></div>
            <div class="task-content">
                <h3>${task.title}</h3>
                ${task.description ? `<p>${task.description}</p>` : ''}
                <div class="task-meta">
                    <span class="priority-badge ${task.priority}">${task.priority}</span>
                    ${task.dueDate ? `<span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="task-delete" onclick="deleteTask('${task._id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function toggleTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}/toggle`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const updatedTask = await response.json();
            const index = tasks.findIndex(t => t._id === taskId);
            if (index !== -1) {
                tasks[index] = updatedTask;
                renderTasks();
                updateProgress();
            }
        }
    } catch (err) {
        console.error('Error toggling task:', err);
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            tasks = tasks.filter(t => t._id !== taskId);
            renderTasks();
            updateProgress();
        }
    } catch (err) {
        console.error('Error deleting task:', err);
    }
}

function updateProgress() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    
    if (totalTasks === 0) {
        document.getElementById('progressBar').style.width = '0%';
        document.getElementById('progressText').textContent = 'No tasks yet';
        return;
    }
    
    const percentage = Math.round((completedTasks / totalTasks) * 100);
    document.getElementById('progressBar').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `${percentage}% Complete (${completedTasks}/${totalTasks} tasks)`;
}