const BASE_URL = 'http://localhost:5050';


document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    if (!token || !(await validateToken(token))) {
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
    }

    document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('usernameModal').value;
        const password = document.getElementById('passwordModal').value;
        await performLogin(username, password);
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            const contentId = event.target.id;
            loadContent(contentId);
        });
    });
});


async function validateToken(token) {
    try {
        const response = await fetch(`${BASE_URL}/api/validatetoken`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        return response.ok;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
}


async function performLogin(username, password) {
    try {
        const response = await fetch(`${BASE_URL}/v1/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ email: username, password: password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
        } else {
            displayToast('Usuario o contraseña incorrectos');
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
}

function loadContent(contentId) {
    const contentMapping = {
        'bcra': 'bcra.html',
        'registroUsuario': 'registroUsuario.html',
        'registroEmpleados': 'registroEmpleados.html',
        'consorcios': 'consorcios.html',
        'registroCategorias': 'registroCategorias.html',
        'registroRoles': 'registroRoles.html',
        'registroFunciones': 'registroFunciones.html',
        'registroPlanillas': 'registroPlanillas.html'
    };
    const url = contentMapping[contentId];
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
            if (contentId === 'bcra') {

            }
            if(contentId === 'registroUsuario'){

            }
            if(contentId === 'registroEmpleados') {
                initializeEmployeeView();
                loadEmployees();

            }
           if(contentId === 'consorcios') {

           }
           if(contentId === 'registroCategorias') {

           }
           if(contentId === 'registroRoles') {

           } 
           if(contentId === 'registroFunciones') {

           }          
           if(contentId === 'registroPlanillas') {

           } 
          
        })
        .catch(error => {
            console.error('Failed to load content:', error);
        });
}
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                               EMPLOYEE
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################

function initializeEmployeeView() {
    const newEmployeeBtn = document.getElementById('newEmployeeBtn');
    const employeeForm = document.getElementById('memberForm');
    const employeeModal = new bootstrap.Modal(document.getElementById('memberModal'));

    newEmployeeBtn.addEventListener('click', () => handleNewEmployee());

    // Escucha el evento submit del formulario para prevenir la recarga de la página
    employeeForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevenir la recarga
        createEmployee(); // Llama a la función para crear el empleado
    });

    async function handleNewEmployee() {
        employeeForm.reset();
        $("#cuil").inputmask("99-99999999-9"); 
        employeeModal.show();
        document.getElementById('editEmployee').style.display = 'none';
        document.getElementById('saveEmployee').style.display = 'inline-block';
    }

async function createEmployee() {
    const subscriptionForm = document.getElementById('memberForm');
    if (!subscriptionForm.checkValidity()) {
        subscriptionForm.classList.add('was-validated');
        return;
    }

    const employeeModalElement = document.getElementById('memberModal');
    const employeeData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        genderType: document.getElementById('genderType').value,
        documentType: document.getElementById('documentType').value,
        documentNumber: document.getElementById('documentNumber').value,
        dateOfBirth: formatDate(document.getElementById('dateOfBirth').value),
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        cellPhone: document.getElementById('phoneNumber').value,
        cuil: document.getElementById('cuil').value,
        cityId: document.getElementById('cityType').value
    };

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/v1/api/employee`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(employeeData),
        });

        if (!response.ok) {
            const errorJson = await response.json(); // Obtener el cuerpo de la respuesta como JSON
            const errorMessage = errorJson.result || 'Ocurrió un error inesperado'; // Capturar el mensaje del campo `result`
            throw new Error(errorMessage);
        }

        const employeeModal = bootstrap.Modal.getInstance(employeeModalElement);
        employeeModal.hide();
        loadEmployees();
        alert("Empleado creado exitosamente!");
    } catch (error) {
        console.error('Error detallado:', error);

        // Mostrar el mensaje de error con título y formato mejorado
        const alertMessage = `Error al guardar el empleado:\n\nDetalles:\n${error.message}`;
        alert(alertMessage); // Puedes usar un modal o librería como SweetAlert para mejorar la visualización
    }
}

}

async function loadEmployees() {
    try {
        const token = localStorage.getItem('token');
        // Verifica si la tabla ya fue inicializada como DataTable
        if ($.fn.DataTable.isDataTable('#membersTable')) {
            $('#membersTable').DataTable().destroy(); // Destruye la tabla existente
        }
        const response = await fetch(`${BASE_URL}/v1/api/employee/all`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` }
        });
        const members = await response.json();

        const tableBody = document.querySelector('#membersTable tbody');
        tableBody.innerHTML = ''; // Limpiar el cuerpo de la tabla

        members.forEach(member => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="cursor:pointer;" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                </svg>
                </td>
                <td style="display: none;">${member.id}</td>
                <td>${member.firstName}</td>
                <td>${member.lastName}</td>
                <td>${member.documentType}</td>
                <td>${member.documentNumber}</td>
                <td>${member.cuil}</td>
                <td>${member.cellPhone}</td>
                <td>${member.email}</td>
                `;
                tableBody.appendChild(row);
                row.querySelector('.bi-search').addEventListener('click', () => {
                    fillAndShowModal(member);
                });
            });

        // Vuelve a inicializar DataTable
        const dataTable = $('#membersTable').DataTable();
        fetchStates();
        fetchGenderType();
        fetchDocumentsType();


        document.getElementById('stateType').addEventListener('change', async function() {
        const stateId = this.value;
        await fetchCitiesByState(stateId);
    });


    } catch (error) {
        console.error('Error al cargar los miembros:', error);
    }

}

function fillAndShowModal(member) {
    console.log(member);
    // Campos de solo lectura (creación y modificación)
    document.getElementById('createdAt').value = member.createdAt || '-';
    document.getElementById('createdBy').value = member.createdBy || '-';
    document.getElementById('updatedAt').value = member.updatedAt || '-';
    document.getElementById('updatedBy').value = member.updatedBy || '-';

    // Llenar los campos de datos editables
    document.getElementById('firstName').value = member.firstName || '';
    document.getElementById('lastName').value = member.lastName || '';
    document.getElementById('documentNumber').value = member.documentNumber || '';
    document.getElementById('email').value = member.email || '';
    document.getElementById('phoneNumber').value = member.cellPhone || '';
    document.getElementById('address').value = member.address || '';
    document.getElementById('cp').value = member.zipCode || '';
    document.getElementById('cuil').value = member.cuil || '';

    // Asignar los valores al select (género, tipo de documento, estado y ciudad)
    document.getElementById('genderType').value = member.genderType || '';
    document.getElementById('documentType').value = member.documentType || '';
    document.getElementById('stateType').value = member.stateId || '';
    document.getElementById('cityType').value = member.cityId || '';

    if (member.dateOfBirth) {
        document.getElementById('dateOfBirth').value = new Date(member.dateOfBirth).toISOString().split('T')[0];
    } else {
        document.getElementById('dateOfBirth').value = '';
    }

     if (member.stateId) {
        fetchCitiesByState(member.stateId).then(() => {
             document.getElementById('cityType').value = member.cityId || '';
        });
    }
    $("#cuil").inputmask("99-99999999-9"); 

   document.getElementById('editEmployee').style.display = 'inline-block';
   document.getElementById('saveEmployee').style.display = 'none';
    // Mostrar el modal
    $('#memberModal').modal('show');
}

async function fetchStates() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/v1/api/states/all`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` }
        });
        const stateType = await response.json();
        const stateTypeSelect = document.getElementById('stateType');
        
        stateTypeSelect.innerHTML = '<option value="" disabled selected>Selecciona una provincia</option>';
        stateType.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.name;
            stateTypeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching states:', error);
    }
}

async function fetchCitiesByState(stateId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/v1/api/city/state/${stateId}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const cities = await response.json();
            const cityTypeSelect = document.getElementById('cityType');

            cityTypeSelect.innerHTML = '<option value="" disabled selected>Selecciona una ciudad</option>'; // Resetear el select
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.name;
                cityTypeSelect.appendChild(option);
            });
        } else {
            console.error('Error fetching cities:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching cities:', error);
    }
}


async function fetchGenderType() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/v1/api/loader/gender-types`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` }
        });
        const stateType = await response.json();
        const stateTypeSelect = document.getElementById('genderType');
        
        stateTypeSelect.innerHTML = '<option value="" disabled selected>Selecciona un Genero</option>';
        stateType.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            stateTypeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching genderType:', error);
    }
}

async function fetchDocumentsType() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/v1/api/loader/document-types`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` }
        });
        const stateType = await response.json();
        const stateTypeSelect = document.getElementById('documentType');
        
        stateTypeSelect.innerHTML = '<option value="" disabled selected>Selecciona un Tipo de Documento</option>';
        stateType.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            stateTypeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching documentType:', error);
    }
}

//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                               PARSERS
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################

function formatDate(dateString) {
    const date = new Date(dateString);
    
      // Verificar si la fecha es inválida
    if (isNaN(date.getTime())) {
        return '1900-01-01T00:00:00';
    }
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Los meses comienzan desde 0
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T00:00:00`;
}
   




