const cl = console.log;

const spinner = document.getElementById('spinner');
const todoContainer = document.getElementById('todoContainer');
const todoForm = document.getElementById('todoForm');
const titleControl = document.getElementById('title');
const userIdControl = document.getElementById('userId');
const completedControl = document.getElementById('completed');
const addTodoBtn = document.getElementById('addTodoBtn');
const updateTodoBtn = document.getElementById('updateTodoBtn');


const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeModalIcon = document.getElementById('closeModalIcon');
const todoModal = document.getElementById('todoModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');

const BASE_URL = `https://jsonplaceholder.typicode.com`;
const TODO_URL = `${BASE_URL}/todos`;

let todosArr = [];
let updateId = null;


function openModal(isEdit = false) {
    if(isEdit) {
        modalTitle.innerText = "Edit Todo Details";
        addTodoBtn.classList.add('d-none');
        updateTodoBtn.classList.remove('d-none');
    } else {
        modalTitle.innerText = "Add New Todo";
        addTodoBtn.classList.remove('d-none');
        updateTodoBtn.classList.add('d-none');
        todoForm.reset();
    }
    todoModal.style.display = 'block';
    modalBackdrop.style.display = 'block';
}

function closeModal() {
    todoModal.style.display = 'none';
    modalBackdrop.style.display = 'none';
    todoForm.reset();
    updateId = null;
}


openModalBtn.addEventListener('click', () => openModal(false));
closeModalBtn.addEventListener('click', closeModal);
closeModalIcon.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    });
}

function initTooltips() {
    $('[data-toggle="tooltip"]').tooltip({
        boundary: 'window'
    });
}

function fetchTodos() {
    spinner.style.display = 'flex';
    let xhr = new XMLHttpRequest();
    xhr.open('GET', TODO_URL);
    xhr.send(null);

    xhr.onload = function () {
        spinner.style.display = 'none';
        if (xhr.status >= 200 && xhr.status <= 299) {
            let data = JSON.parse(xhr.response);
            todosArr = [...data];
            renderTodoRows(todosArr.reverse());
        } else {
            snackbar('Error while fetching the data', 'error');
        }
    };
    xhr.onerror = function() {
        spinner.style.display = 'none';
        snackbar('Network Error!', 'error');
    };
}

function renderTodoRows(arr) {
    let result = '';
    arr.forEach(todo => {
        let statusBadge = todo.completed 
            ? `<span class="badge badge-success">Completed</span>` 
            : `<span class="badge badge-secondary">Pending</span>`;
            
        result += `
            <tr id='todo-${todo.id}'>
                <td>${todo.id}</td>
                <td data-toggle="tooltip" title="${todo.title}">${todo.title}</td>
                <td>${todo.userId}</td>
                <td>${statusBadge}</td>
                <td><button onclick="onEdit('${todo.id}')" class="btn btn-sm btn-outline-info">Edit</button></td>
                <td><button onclick="onRemove('${todo.id}')" class="btn btn-sm btn-outline-danger">Remove</button></td>
            </tr>
        `;
    });
    todoContainer.innerHTML = result;
    initTooltips();
}

function onTodoSubmit(eve) {
    eve.preventDefault();

    let TODO_OBJ = {
        title: titleControl.value,
        userId: userIdControl.value,
        completed: completedControl.value === 'true'
    };

    spinner.style.display = 'flex';
    let xhr = new XMLHttpRequest();
    xhr.open('POST', TODO_URL);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(TODO_OBJ));

    xhr.onload = function () {
        spinner.style.display = 'none';
        if (xhr.status >= 200 && xhr.status <= 299) {
            let res = JSON.parse(xhr.response);
            
            res.title = res.title || TODO_OBJ.title;
            res.userId = res.userId || TODO_OBJ.userId;
            res.completed = res.hasOwnProperty('completed') ? res.completed : TODO_OBJ.completed;

            closeModal(); 

            let tr = document.createElement('tr');
            tr.id = `todo-${res.id}`;
            let statusBadge = res.completed 
                ? `<span class="badge badge-success">Completed</span>` 
                : `<span class="badge badge-secondary">Pending</span>`;

            tr.innerHTML = `
                <td>${res.id}</td>
                <td data-toggle="tooltip" title="${res.title}">${res.title}</td>
                <td>${res.userId}</td>
                <td>${statusBadge}</td>
                <td><button onclick="onEdit('${res.id}')" class="btn btn-sm btn-outline-info">Edit</button></td>
                <td><button onclick="onRemove('${res.id}')" class="btn btn-sm btn-outline-danger">Remove</button></td>
            `;
            todoContainer.insertBefore(tr, todoContainer.firstChild);
            initTooltips();
            snackbar(`New todo with id ${res.id} created !!!`, 'success');
        }
    };
}

function onEdit(id) {
    updateId = id;
    let EDIT_URL = `${BASE_URL}/todos/${updateId}`;

    spinner.style.display = 'flex';
    let xhr = new XMLHttpRequest();
    xhr.open('GET', EDIT_URL);
    xhr.send(null);

    xhr.onload = function () {
        spinner.style.display = 'none';
        if (xhr.status >= 200 && xhr.status <= 299) {
            let res = JSON.parse(xhr.response);
            titleControl.value = res.title;
            userIdControl.value = res.userId;
            completedControl.value = res.completed ? "true" : "false";

            openModal(true); 
        }
    };
}

function onUpdateTodo() {
    let UPDATE_OBJ = {
        title: titleControl.value,
        userId: userIdControl.value,
        completed: completedControl.value === 'true'
    };

    spinner.style.display = 'flex';
    let UPDATE_URL = `${BASE_URL}/todos/${updateId}`;

    let xhr = new XMLHttpRequest();
    xhr.open('PATCH', UPDATE_URL);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(UPDATE_OBJ));

    xhr.onload = function () {
        spinner.style.display = 'none';
        if (xhr.status >= 200 && xhr.status <= 299) {
            let row = document.getElementById(`todo-${updateId}`);
            if(row) {
                let cells = row.getElementsByTagName('td');
                
                cells[1].innerHTML = UPDATE_OBJ.title;
                cells[1].setAttribute('title', UPDATE_OBJ.title);
                cells[2].innerHTML = UPDATE_OBJ.userId;
                cells[3].innerHTML = UPDATE_OBJ.completed 
                    ? `<span class="badge badge-success">Completed</span>` 
                    : `<span class="badge badge-secondary">Pending</span>`;
                
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                row.classList.add('highlight');
                setTimeout(() => { row.classList.remove('highlight'); }, 3000);
            }

            closeModal(); 
            initTooltips();

            snackbar('Todo updated successfully !!!', 'success');
        }
    };
}

function onRemove(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to remove this todo?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Remove'
    }).then(result => {
        if (result.isConfirmed) {
            spinner.style.display = 'flex';
            let REMOVE_URL = `${BASE_URL}/todos/${id}`;

            let xhr = new XMLHttpRequest();
            xhr.open('DELETE', REMOVE_URL);
            xhr.send(null);

            xhr.onload = function () {
                spinner.style.display = 'none';
                if (xhr.status >= 200 && xhr.status <= 299) {
                    let row = document.getElementById(`todo-${id}`);
                    if(row) row.remove();
                    snackbar('Todo removed successfully !!!', 'success');
                }
            };
        }
    });
}

fetchTodos();

todoForm.addEventListener('submit', onTodoSubmit);
updateTodoBtn.addEventListener('click', onUpdateTodo);