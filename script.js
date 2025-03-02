// Get elements
const todoList = document.getElementById('todo-list');
const addTodoBtn = document.getElementById('add-todo');
const addTodoModal = document.getElementById('add-todo-modal');
const todoTitleInput = document.getElementById('todo-title');
const saveTodoBtn = document.getElementById('save-todo');
const cancelTodoBtn = document.getElementById('cancel-todo');
const searchInput = document.getElementById('search');
const priorityFilter = document.getElementById('priority-filter');
const statusFilter = document.getElementById('status-filter');

// Initialize todo list with localStorage support
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Function to save todos to localStorage
function saveTodosToStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Function to add todo with priority and due date
function addTodo(title, priority = 'medium', dueDate = null) {
    const todo = {
        id: Date.now(),
        title,
        checklist: [],
        priority,
        dueDate,
        createdAt: new Date().toISOString(),
        completed: false
    };
    todos.push(todo);
    saveTodosToStorage();
    renderTodoList();
    addTodoModal.style.display = 'none';
}

// Function to delete a todo
function deleteTodo(todoId) {
    if (confirm('Are you sure you want to delete this todo?')) {
        todos = todos.filter(todo => todo.id !== todoId);
        saveTodosToStorage();
        renderTodoList();
        showSuccessMessage('Todo deleted successfully!');
    }
}

// Function to show add checklist item modal
function showAddChecklistModal(todoId) {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
        const itemText = prompt('Enter new checklist item:');
        if (itemText && itemText.trim()) {
            if (!Array.isArray(todo.checklist)) {
                todo.checklist = [];
            }
            todo.checklist.push({
                text: itemText.trim(),
                completed: false
            });
            saveTodosToStorage();
            renderTodoList();
            showSuccessMessage('Checklist item added!');
        }
    }
}

// Function to delete checklist item
function deleteChecklistItem(todoId, checklistIndex) {
    const todo = todos.find(t => t.id === todoId);
    if (todo && todo.checklist) {
        todo.checklist.splice(checklistIndex, 1);
        saveTodosToStorage();
        renderTodoList();
        showSuccessMessage('Checklist item deleted!');
    }
}

// Function to toggle checklist item
function toggleChecklistItem(todoId, checklistIndex) {
    const todo = todos.find(t => t.id === todoId);
    if (todo && todo.checklist) {
        todo.checklist[checklistIndex].completed = !todo.checklist[checklistIndex].completed;
        saveTodosToStorage();
        renderTodoList();
    }
}

// Enhanced success message
function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.classList.add('success-message');
    successMessage.textContent = message;
    document.body.appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

// Function to render todo list
function renderTodoList(filterText = '') {
    todoList.innerHTML = '';
    const filteredTodos = todos
        .filter(todo => 
            todo.title.toLowerCase().includes(filterText.toLowerCase()) ||
            (todo.checklist && todo.checklist.some(item => 
                item.text && item.text.toLowerCase().includes(filterText.toLowerCase())
            ))
        )
        .sort((a, b) => {
            if (a.completed === b.completed) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return a.completed ? 1 : -1;
        });

    filteredTodos.forEach(todo => {
        const todoCard = document.createElement('div');
        todoCard.classList.add('todo-card');
        if (todo.completed) todoCard.classList.add('completed');
        
        const priorityBadge = `<span class="priority-badge priority-${todo.priority}">${todo.priority}</span>`;
        const dueDateDisplay = todo.dueDate ? `<div class="due-date">Due: ${new Date(todo.dueDate).toLocaleDateString()}</div>` : '';
        
        todoCard.innerHTML = `
            <div class="todo-header">
                <h2>${todo.title} ${priorityBadge}</h2>
                ${dueDateDisplay}
            </div>
            <ul class="checklist">
                ${todo.checklist && todo.checklist.map((item, checklistIndex) => `
                    <li>
                        <input type="checkbox" 
                            ${item.completed ? 'checked' : ''} 
                            onchange="toggleChecklistItem(${todo.id}, ${checklistIndex})">
                        <span class="${item.completed ? 'completed' : ''}">${item.text}</span>
                        <button class="delete-checklist-btn" onclick="deleteChecklistItem(${todo.id}, ${checklistIndex})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </li>
                `).join('')}
            </ul>
            <div class="todo-footer">
                <button class="add-checklist-btn" onclick="showAddChecklistModal(${todo.id})">
                    <i class="fas fa-plus"></i> Add Item
                </button>
                <button class="delete-todo-btn" onclick="deleteTodo(${todo.id})">
                    <i class="fas fa-trash"></i> Delete Todo
                </button>
            </div>
        `;
        todoList.appendChild(todoCard);
    });
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
    renderTodoList(e.target.value);
});

addTodoBtn.addEventListener('click', () => {
    addTodoModal.style.display = 'block';
});

saveTodoBtn.addEventListener('click', () => {
    const title = todoTitleInput.value;
    const priority = document.querySelector('input[name="priority"]:checked')?.value || 'medium';
    const dueDate = document.getElementById('due-date')?.value;
    
    if (title.trim()) {
        addTodo(title, priority, dueDate);
        todoTitleInput.value = '';
        showSuccessMessage('Todo successfully added!');
    }
});

cancelTodoBtn.addEventListener('click', () => {
    addTodoModal.style.display = 'none';
    todoTitleInput.value = '';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === addTodoModal) {
        addTodoModal.style.display = 'none';
        todoTitleInput.value = '';
    }
});

// Initial render
renderTodoList();



// Enhanced renderTodoList function with multiple filters
function renderTodoList(searchText = '') {
    todoList.innerHTML = '';
    const selectedPriority = priorityFilter.value;
    const selectedStatus = statusFilter.value;

    const filteredTodos = todos
        .filter(todo => {
            // Search text filter
            const matchesSearch = todo.title.toLowerCase().includes(searchText.toLowerCase()) ||
                (todo.checklist && todo.checklist.some(item => 
                    item.text && item.text.toLowerCase().includes(searchText.toLowerCase())
                ));

            // Priority filter
            const matchesPriority = selectedPriority === 'all' || todo.priority === selectedPriority;

            // Status filter
            const matchesStatus = selectedStatus === 'all' || 
                (selectedStatus === 'completed' && todo.completed) ||
                (selectedStatus === 'active' && !todo.completed);

            return matchesSearch && matchesPriority && matchesStatus;
        })
        .sort((a, b) => {
            if (a.completed === b.completed) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return a.completed ? 1 : -1;
        });

    filteredTodos.forEach(todo => {
        const todoCard = document.createElement('div');
        todoCard.classList.add('todo-card');
        if (todo.completed) todoCard.classList.add('completed');
        
        const priorityBadge = `<span class="priority-badge priority-${todo.priority}">${todo.priority}</span>`;
        const dueDateDisplay = todo.dueDate ? `<div class="due-date">Due: ${new Date(todo.dueDate).toLocaleDateString()}</div>` : '';
        
        todoCard.innerHTML = `
            <div class="todo-header">
                <div class="todo-title-wrapper">
                    <input type="checkbox" 
                        class="todo-complete-checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        onchange="toggleTodoComplete(${todo.id})">
                    <h2>${todo.title} ${priorityBadge}</h2>
                </div>
                ${dueDateDisplay}
            </div>
            <ul class="checklist">
                ${todo.checklist && todo.checklist.map((item, checklistIndex) => `
                    <li>
                        <input type="checkbox" 
                            ${item.completed ? 'checked' : ''} 
                            onchange="toggleChecklistItem(${todo.id}, ${checklistIndex})">
                        <span class="${item.completed ? 'completed' : ''}">${item.text}</span>
                        <button class="delete-checklist-btn" onclick="deleteChecklistItem(${todo.id}, ${checklistIndex})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </li>
                `).join('')}
            </ul>
            <div class="todo-footer">
                <button class="add-checklist-btn" onclick="showAddChecklistModal(${todo.id})">
                    <i class="fas fa-plus"></i> Add Item
                </button>
                <button class="delete-todo-btn" onclick="deleteTodo(${todo.id})">
                    <i class="fas fa-trash"></i> Delete Todo
                </button>
            </div>
        `;
        todoList.appendChild(todoCard);
    });
}

// Function to toggle todo completion
function toggleTodoComplete(todoId) {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
        todo.completed = !todo.completed;
        // If todo is completed, mark all checklist items as completed
        if (todo.completed && todo.checklist) {
            todo.checklist.forEach(item => item.completed = true);
        }
        saveTodosToStorage();
        renderTodoList(searchInput.value);
    }
}

// Add event listeners for filters
priorityFilter.addEventListener('change', () => {
    renderTodoList(searchInput.value);
});

statusFilter.addEventListener('change', () => {
    renderTodoList(searchInput.value);
});