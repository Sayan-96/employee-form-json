document.addEventListener('DOMContentLoaded', loadEmployees);

const form = document.getElementById('employeeForm');
const submitBtn = document.getElementById('submitBtn');
const updateBtn = document.getElementById('updateBtn');
const employeeListTable = document.getElementById('employeeList').getElementsByTagName('tbody')[0];

let employees = [];
let editIndex = -1;

form.addEventListener('submit', handleFormSubmit);
updateBtn.addEventListener('click', updateEmployee);

function loadEmployees() {
    fetch('http://localhost:5000/employees')
        .then(response => response.json())
        .then(data => {
            employees = data;
            renderEmployeeList();
        })
        .catch(err => console.error('Error loading employee data:', err));
}

function renderEmployeeList() {
    employeeListTable.innerHTML = ''; // Clear existing rows
    employees.forEach((emp, index) => {
        const row = employeeListTable.insertRow();
        row.insertCell(0).textContent = emp.empID;
        row.insertCell(1).textContent = emp.empName;
        row.insertCell(2).textContent = emp.empJob;
        row.insertCell(3).textContent = emp.empEmail;

        const actionsCell = row.insertCell(4);
        const editButton = document.createElement('button');
        editButton.classList.add('btn', 'btn-warning', 'btn-sm');
        editButton.textContent = 'Edit';
        editButton.onclick = () => startEditing(emp, index);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-danger', 'btn-sm', 'ms-2');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteEmployee(emp.id);
        actionsCell.appendChild(deleteButton);
    });
}

function handleFormSubmit(event) {
    event.preventDefault();
    const newEmployee = {
        empID: document.getElementById('empID').value,
        empName: document.getElementById('empName').value,
        empDOB: document.getElementById('empDOB').value,
        empJob: document.getElementById('empJob').value,
        empQualification: document.getElementById('empQualification').value,
        empExperience: document.getElementById('empExperience').value,
        empGender: document.querySelector('input[name="gender"]:checked').value,
        empEmail: document.getElementById('empEmail').value
    };

    if (editIndex === -1) {
        // Create new employee (POST request to json-server)
        fetch('http://localhost:5000/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newEmployee)
        })
        .then(response => response.json())
        .then(() => {
            employees.push(newEmployee);
            renderEmployeeList();
            form.reset();
        })
        .catch(err => console.error('Error adding employee:', err));
    } else {
        // Update existing employee (PUT request to json-server)
        const updatedEmployee = {
            ...newEmployee,
            id: employees[editIndex].id // Keep the original employee ID for updating
        };

        fetch(`http://localhost:5000/employees/${updatedEmployee.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedEmployee)
        })
        .then(response => response.json())
        .then(() => {
            employees[editIndex] = updatedEmployee; // Update the correct employee in the array
            renderEmployeeList();
            form.reset();
            updateBtn.style.display = 'none';
            submitBtn.style.display = 'inline';
            editIndex = -1; // Reset editIndex after updating
        })
        .catch(err => console.error('Error updating employee:', err));
    }
}

function startEditing(emp, index) {
    document.getElementById('empID').value = emp.empID;
    document.getElementById('empName').value = emp.empName;
    document.getElementById('empDOB').value = emp.empDOB;
    document.getElementById('empJob').value = emp.empJob;
    document.getElementById('empQualification').value = emp.empQualification;
    document.getElementById('empExperience').value = emp.empExperience;
    document.querySelector(`input[name="gender"][value="${emp.empGender}"]`).checked = true;
    document.getElementById('empEmail').value = emp.empEmail;

    editIndex = index; // Set editIndex to track which employee we are editing

    submitBtn.style.display = 'none';
    updateBtn.style.display = 'inline';
}

function updateEmployee() {
    // Trigger form submit for updating the employee
    form.dispatchEvent(new Event('submit'));
}

function deleteEmployee(id) {
    fetch(`http://localhost:5000/employees/${id}`, {
        method: 'DELETE'
    })
    .then(() => {
        // Remove the deleted employee from the employees array
        employees = employees.filter(emp => emp.id !== id);
        renderEmployeeList(); // Re-render the list after deletion
    })
    .catch(err => console.error('Error deleting employee:', err));
}