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
            Swal.fire('Bienvenido!', username, 'success');
            showUserInfo(username);
        } else {
            Swal.fire('Error', 'Usuario o contraseña incorrectos', 'warning');
        }
    } catch (error) {
        console.error('Login failed:', error);
        Swal.fire('Error', 'El intento de login fallo', 'error')
    }
}

function showUserInfo(email) {
    const userInfo = document.getElementById('user-info');
    const userEmailSpan = document.getElementById('user-email');
    
    userEmailSpan.textContent = email + '  | ';
    userInfo.style.display = 'flex'; // Asegura que el contenedor sea visible
}

function loadContent(contentId) {
    const contentMapping = {
        'bcra': 'bcra.html',
        'registroUsuario': 'registroUsuario.html',
        'registroEmpleados': 'registroEmpleados.html',
        'consorcios': 'consorcios.html',
        'registroCategorias': 'registroCategorias.html',
        'registroFunciones': 'registroFunciones.html',
        'registroModificadorSalarial': 'registroModificadorSalarial.html',
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
            initializeConsortiumView();

           }
           if(contentId === 'registroCategorias') {

           }
           if(contentId === 'registroFunciones') {
                initializeRoleView();

           }
           if(contentId === 'registroModificadorSalarial') {
            initializeModifierView();


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

    employeeForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevenir la recarga

        const action = event.submitter.getAttribute('data-action');
        console.log(action);
        if (action === 'editEmployee') {
          updateEmployee();
        } else {
          createEmployee();     
        }

        
    });

    async function handleNewEmployee() {
        employeeForm.reset();
        $("#cuil").inputmask("99-99999999-9"); 
        const editOnlyFields = document.querySelectorAll('.edit-only');
         editOnlyFields.forEach(field => {
            field.style.display ='none';
        });
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
            const errorJson = await response.json(); 
            const errorMessage = errorJson.result || 'Ocurrió un error inesperado'; 
            throw new Error(errorMessage);
        }

        const employeeModal = bootstrap.Modal.getInstance(employeeModalElement);
        employeeModal.hide();
        loadEmployees();
        Swal.fire('Resultado', 'Empleado creado exitosamente', 'success');
    } catch (error) {
        console.error('Error detallado:', error);
        Swal.fire('Error al guardar el Empleado', error.message, 'error');
    }
}

async function updateEmployee() {
    const subscriptionForm = document.getElementById('memberForm');
    if (!subscriptionForm.checkValidity()) {
        subscriptionForm.classList.add('was-validated');
        return;
    }

    const employeeModalElement = document.getElementById('memberModal');
    const employeeData = {
        id: document.getElementById('employeeId').value,
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
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(employeeData),
        });

        if (!response.ok) {
            const errorJson = await response.json(); 
            const errorMessage = errorJson.result || 'Ocurrió un error inesperado'; 
            throw new Error(errorMessage);
        }

        const employeeModal = bootstrap.Modal.getInstance(employeeModalElement);
        employeeModal.hide();
        loadEmployees();
       Swal.fire('Resultado', 'Empleado actualizado exitosamente', 'success');
    } catch (error) {
        console.error('Error detallado:', error);
        Swal.fire('Error al actualizar el Empleado', error.message, 'error');
    }
}

}

async function loadEmployees() {
    try {
        const token = localStorage.getItem('token');
        if ($.fn.DataTable.isDataTable('#membersTable')) {
            $('#membersTable').DataTable().destroy(); 
        }
        const response = await fetch(`${BASE_URL}/v1/api/employee/all`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` }
        });
        const members = await response.json();

        const tableBody = document.querySelector('#membersTable tbody');
        tableBody.innerHTML = ''; 

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
                $('#membersTable').DataTable({
            language: {
                processing: "Procesando...",
                search: "Buscar:",
                lengthMenu: "Mostrar _MENU_ registros",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 a 0 de 0 registros",
                infoFiltered: "(filtrado de _MAX_ registros totales)",
                loadingRecords: "Cargando...",
                zeroRecords: "No se encontraron resultados",
                emptyTable: "No hay datos disponibles en la tabla",
                paginate: {
                    first: "Primero",
                    previous: "Anterior",
                    next: "Siguiente",
                    last: "Último"
                },
                aria: {
                    sortAscending: ": activar para ordenar la columna ascendente",
                    sortDescending: ": activar para ordenar la columna descendente"
                }
            }
        });

        const dataTable = $('#membersTable').DataTable();
        fetchStates();
        fetchGenderType();
        fetchDocumentsType();
        document.getElementById('stateType').addEventListener('change', async function() {
        const stateId = this.value;
        await fetchCitiesByState(stateId);
    });

    } catch (error) {
        Swal.fire('Error al cargar los miembros', error, 'error');
    }

}

function fillAndShowModal(member) {
    document.getElementById('employeeId').value = member.id || '-';

    document.getElementById('createdAt').value = member.createdAt || '-';
    document.getElementById('createdBy').value = member.createdBy || '-';
    document.getElementById('updatedAt').value = member.updatedAt || '-';
    document.getElementById('updatedBy').value = member.updatedBy || '-';

    document.getElementById('firstName').value = member.firstName || '';
    document.getElementById('lastName').value = member.lastName || '';
    document.getElementById('documentNumber').value = member.documentNumber || '';
    document.getElementById('email').value = member.email || '';
    document.getElementById('phoneNumber').value = member.cellPhone || '';
    document.getElementById('address').value = member.address || '';
    document.getElementById('cp').value = member.zipCode || '';
    document.getElementById('cuil').value = member.cuil || '';

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
        const editOnlyFields = document.querySelectorAll('.edit-only');
         editOnlyFields.forEach(field => {
            field.style.display ='block' ;
        });


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
        Swal.fire('Error fetching states', error, 'error');
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
            Swal.fire('Error cargando Provincias', '', 'error');
        }
    } catch (error) {
       Swal.fire('Error cargando Provincias', error, 'error');
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
         Swal.fire('Error cargando Tipos de Géneros', error, 'error');
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
        Swal.fire('Error cargando Tipos de Documento', error, 'error');
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
   
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                               ROLS
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
function initializeRoleView() {
    const newRoleBtn = document.getElementById('newRoleBtn');
    const roleForm = document.getElementById('roleForm');
    const roleModal = new bootstrap.Modal(document.getElementById('roleModal'));

    newRoleBtn.addEventListener('click', handleNewRole);

    roleForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const action = event.submitter.getAttribute('data-action');
        console.log(action);
        if (action === 'editRole') {
            updateRole();
        } else {
            createRole();
        }
    });

    function handleNewRole() {
        roleForm.reset();
        document.querySelectorAll('.edit-only').forEach(field => field.style.display = 'none');
        roleModal.show();
        document.getElementById('editRole').style.display = 'none';
        document.getElementById('saveRole').style.display = 'inline-block';
    }

    async function createRole() {
        if (!roleForm.checkValidity()) {
            roleForm.classList.add('was-validated');
            return;
        }

        const roleData = {
            name: document.getElementById('roleName').value,
            description: document.getElementById('roleDescription').value
        };

        await saveRole('POST', roleData, 'Rol creado exitosamente');
    }

    async function updateRole() {
        if (!roleForm.checkValidity()) {
            roleForm.classList.add('was-validated');
            return;
        }

        const roleData = {
            id: document.getElementById('roleId').value,
            name: document.getElementById('roleName').value,
            description: document.getElementById('roleDescription').value
        };

        await saveRole('PATCH', roleData, 'Rol actualizado exitosamente');
    }

async function saveRole(method, data, successMessage) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/v1/api/role`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorJson = await response.json(); // Intentar obtener el cuerpo de la respuesta
            const errorMessage = errorJson.result || 'Ocurrió un error inesperado';
            throw new Error(errorMessage);
        }

        roleModal.hide();
        Swal.fire('Éxito', successMessage, 'success');
        loadRoles();
    } catch (error) {
        console.error('Error detallado:', error);
        Swal.fire('Error', error.message, 'error');
    }
}


    async function loadRoles() {
        try {
            const token = localStorage.getItem('token');

        if ($.fn.DataTable.isDataTable('#rolesTable')) {
            $('#rolesTable').DataTable().destroy();
        }

            const response = await fetch(`${BASE_URL}/v1/api/role/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const roles = await response.json();
            const tableBody = document.querySelector('#rolesTable tbody');
            tableBody.innerHTML = roles.map(role => `
                <tr>
                    <td><i class="bi bi-search" style="cursor: pointer;"></i></td>
                    <td style="display: none;">${role.id}</td>
                    <td>${role.name}</td>
                    <td>${role.description || ''}</td>
                    <td>${role.createdAt || '-'}</td>
                    <td>${role.createdBy || '-'}</td>
                    <td>${role.updatedAt || '-'}</td>
                    <td>${role.updatedBy || '-'}</td>
                </tr>
            `).join('');

            document.querySelectorAll('.bi-search').forEach((icon, index) => {
                icon.addEventListener('click', () => fillAndShowModalRole(roles[index]));
            });

            $('#rolesTable').DataTable({
            language: {
                processing: "Procesando...",
                search: "Buscar:",
                lengthMenu: "Mostrar _MENU_ registros",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 a 0 de 0 registros",
                infoFiltered: "(filtrado de _MAX_ registros totales)",
                loadingRecords: "Cargando...",
                zeroRecords: "No se encontraron resultados",
                emptyTable: "No hay datos disponibles en la tabla",
                paginate: {
                    first: "Primero",
                    previous: "Anterior",
                    next: "Siguiente",
                    last: "Último"
                },
                aria: {
                    sortAscending: ": activar para ordenar la columna ascendente",
                    sortDescending: ": activar para ordenar la columna descendente"
                }
            }
        });
        } catch (error) {
            Swal.fire('Error', 'Error al cargar roles', 'error');
        }
    }

    function fillAndShowModalRole(role) {
        document.getElementById('roleId').value = role.id || '-';
        document.getElementById('createdAt').value = role.createdAt || '-';
        document.getElementById('createdBy').value = role.createdBy || '-';
        document.getElementById('updatedAt').value = role.updatedAt || '-';
        document.getElementById('updatedBy').value = role.updatedBy || '-';

        document.getElementById('roleName').value = role.name || '';
        document.getElementById('roleDescription').value = role.description || '';

        document.querySelectorAll('.edit-only').forEach(field => field.style.display = 'block');
        roleModal.show();

        document.getElementById('editRole').style.display = 'inline-block';
        document.getElementById('saveRole').style.display = 'none';
    }

    loadRoles();
}

//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                            SALARY MODIFIERS
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################

function initializeModifierView() {
    const newModifierBtn = document.getElementById('newModifierBtn');
    const modifierForm = document.getElementById('modifierForm');
    const modifierModal = new bootstrap.Modal(document.getElementById('modifierModal'));

    newModifierBtn.addEventListener('click', handleNewModifier);

    modifierForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const action = event.submitter.getAttribute('data-action');

        if (action === 'editModifier' ) {
          updateModifier();  

        }else {
          createModifier();  
        } 
    });

    function handleNewModifier() {
        modifierForm.reset();
        document.querySelectorAll('.edit-only').forEach(field => field.style.display = 'none');
        modifierModal.show();
        document.getElementById('editModifier').style.display = 'none';
        document.getElementById('saveModifier').style.display = 'inline-block';
    }

    async function createModifier() {
        const modifierData = {
            name: document.getElementById('modifierName').value,
            type: document.getElementById('modifierType').value,
            amount: parseFloat(document.getElementById('modifierAmount').value)
        };
        await saveModifier('POST', modifierData, 'Modificador creado exitosamente');
    }

    async function updateModifier() {
        const modifierData = {
            id: document.getElementById('modifierId').value,
            name: document.getElementById('modifierName').value,
            type: document.getElementById('modifierType').value,
            amount: parseFloat(document.getElementById('modifierAmount').value)
        };
        await saveModifier('PATCH', modifierData, 'Modificador actualizado exitosamente');
    }

    async function saveModifier(method, data, successMessage) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/v1/api/modifier`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorJson = await response.json();
                const errorMessage = errorJson.result || 'Ocurrió un error inesperado';
                throw new Error(errorMessage);
            }

            modifierModal.hide();
             Swal.fire('Éxito', successMessage, 'success').then(() => {
               loadModifiers();
              });
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
   }
          function fillAndShowModalModifier(modifier) {
        console.log(modifier)
    // Llenar los campos del modal con los datos del modificador
    document.getElementById('modifierId').value = modifier.id || '-';
    document.getElementById('createdAt').value = modifier.createdAt || '-';
    document.getElementById('createdBy').value = modifier.createdBy || '-';
    document.getElementById('updatedAt').value = modifier.updatedAt || '-';
    document.getElementById('updatedBy').value = modifier.updatedBy || '-';

    document.getElementById('modifierName').value = modifier.name || '';
    document.getElementById('modifierType').value = modifier.type || 'Fijo';
    document.getElementById('modifierAmount').value = modifier.amount || '';

    // Hacer visibles los campos de solo edición
    document.querySelectorAll('.edit-only').forEach(field => field.style.display = 'block');

    // Mostrar el botón de edición y ocultar el de guardar
    document.getElementById('editModifier').style.display = 'inline-block';
    document.getElementById('saveModifier').style.display = 'none';
    modifierModal.show();
}
async function loadModifiers() {
    // Destruir la instancia previa de DataTable si existe
    if ($.fn.DataTable.isDataTable('#modifiersTable')) {
        $('#modifiersTable').DataTable().destroy();
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/v1/api/modifier/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorJson = await response.json();
            const errorMessage = errorJson.result || 'Error al cargar modificadores';
            throw new Error(errorMessage);
        }

        const modifiers = await response.json();
        const tableBody = document.querySelector('#modifiersTable tbody');

        // Rellenar la tabla con los datos obtenidos
        tableBody.innerHTML = modifiers.map(modifier => `
            <tr>
                <td><i class="bi bi-search" style="cursor: pointer;"></i></td>
                <td style="display: none;">${modifier.id}</td>
                <td>${modifier.name}</td>
                <td>${modifier.type}</td>
                <td>${modifier.amount}</td>
                <td>${modifier.createdAt || '-'}</td>
                <td>${modifier.createdBy || '-'}</td>
                <td>${modifier.updatedAt || '-'}</td>
                <td>${modifier.updatedBy || '-'}</td>
            </tr>
        `).join('');

        // Agregar eventos a cada icono de búsqueda para abrir el modal correspondiente
        document.querySelectorAll('.bi-search').forEach((icon, index) => {
            icon.addEventListener('click', () => fillAndShowModalModifier(modifiers[index]));
        });

        // Inicializar DataTable con configuración en español
        $('#modifiersTable').DataTable({
            language: {
                processing: "Procesando...",
                search: "Buscar:",
                lengthMenu: "Mostrar _MENU_ registros",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 a 0 de 0 registros",
                infoFiltered: "(filtrado de _MAX_ registros totales)",
                loadingRecords: "Cargando...",
                zeroRecords: "No se encontraron resultados",
                emptyTable: "No hay datos disponibles en la tabla",
                paginate: {
                    first: "Primero",
                    previous: "Anterior",
                    next: "Siguiente",
                    last: "Último"
                },
                aria: {
                    sortAscending: ": activar para ordenar la columna ascendente",
                    sortDescending: ": activar para ordenar la columna descendente"
                }
            }
        });

    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }

}
loadModifiers();
}

//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                            CONSORTIUMS
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################


async function fetchStatesForConsortium() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/v1/api/states/all`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` }
        });
        const stateType = await response.json();
        const stateTypeSelect = document.getElementById('consortiumStateType');
        
        stateTypeSelect.innerHTML = '<option value="" disabled selected>Selecciona una provincia</option>';
        stateType.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.name;
            stateTypeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching states:', error);
        Swal.fire('Error fetching states', error, 'error');
    }
}

async function fetchCitiesByStateConsortium(stateId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/v1/api/city/state/${stateId}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const cities = await response.json();
            const cityTypeSelect = document.getElementById('consortiumCityType');

            cityTypeSelect.innerHTML = '<option value="" disabled selected>Selecciona una ciudad</option>'; // Resetear el select
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.name;
                cityTypeSelect.appendChild(option);
            });
        } else {
            Swal.fire('Error cargando Provincias', '', 'error');
        }
    } catch (error) {
       Swal.fire('Error cargando Provincias', error, 'error');
    }
}

function initializeConsortiumView() {
    const newConsortiumBtn = document.getElementById('newConsortiumBtn');
    const consortiumForm = document.getElementById('consortiumForm');
    const consortiumModal = new bootstrap.Modal(document.getElementById('consortiumModal'));

    newConsortiumBtn.addEventListener('click', handleNewConsortium);

    consortiumForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const action = event.submitter.getAttribute('data-action');
        if (action === 'editConsortium') {
            updateConsortium();
        } else {
            createConsortium();
        }
    });

    function handleNewConsortium() {
        consortiumForm.reset();
        document.querySelectorAll('.edit-only').forEach(field => field.style.display = 'none');
        consortiumModal.show();
        document.getElementById('editConsortium').style.display = 'none';
        document.getElementById('saveConsortium').style.display = 'inline-block';
    }

    async function createConsortium() {
        const consortiumData = gatherConsortiumFormData();
        await saveConsortium('POST', consortiumData, 'Consorcio creado exitosamente');
    }

    async function updateConsortium() {
        const consortiumData = gatherConsortiumFormData();
        consortiumData.id = document.getElementById('consortiumId').value;
        await saveConsortium('PATCH', consortiumData, 'Consorcio actualizado exitosamente');
    }

    function gatherConsortiumFormData() {
        return {
            name: document.getElementById('name').value,
            cellPhone: document.getElementById('cellPhone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            zipCode: document.getElementById('zipCode').value,
            cuit: document.getElementById('cuit').value,
            cityId: document.getElementById('consortiumCityType').value
           
        };
    }

    async function saveConsortium(method, data, successMessage) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/v1/api/consortium`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorJson = await response.json();
                const errorMessage = errorJson.result || 'Ocurrió un error inesperado';
                throw new Error(errorMessage);
            }

            consortiumModal.hide();
            Swal.fire('Éxito', successMessage, 'success').then(() => loadConsortia());
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }

    async function loadConsortia() {
        if ($.fn.DataTable.isDataTable('#consortiumTable')) {
            $('#consortiumTable').DataTable().clear().destroy();
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/v1/api/consortium/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const consortia = await response.json();
            const tableBody = document.querySelector('#consortiumTable tbody');
            tableBody.innerHTML = consortia.map(consortium => `
                <tr>
                    <td><i class="bi bi-search" style="cursor: pointer;"></i></td>
                    <td style="display: none;">${consortium.id}</td>
                    <td>${consortium.name}</td>
                    <td>${consortium.cellPhone}</td>
                    <td>${consortium.email}</td>
                    <td>${consortium.address}</td>
                    <td>${consortium.cuit}</td>
                    <td>${consortium.zipCode}</td>
                    <td>${consortium.cityName}</td>
                     <td>${consortium.stateName}</td>
                </tr>
            `).join('');




                $('#consortiumTable').DataTable({
            language: {
                processing: "Procesando...",
                search: "Buscar:",
                lengthMenu: "Mostrar _MENU_ registros",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 a 0 de 0 registros",
                infoFiltered: "(filtrado de _MAX_ registros totales)",
                loadingRecords: "Cargando...",
                zeroRecords: "No se encontraron resultados",
                emptyTable: "No hay datos disponibles en la tabla",
                paginate: {
                    first: "Primero",
                    previous: "Anterior",
                    next: "Siguiente",
                    last: "Último"
                },
                aria: {
                    sortAscending: ": activar para ordenar la columna ascendente",
                    sortDescending: ": activar para ordenar la columna descendente"
                }
            }
        });
            

            $("#cuit").inputmask("99-99999999-9"); 
            document.querySelectorAll('.bi-search').forEach((icon, index) => {
                icon.addEventListener('click', () => fillAndShowModalConsortium(consortia[index]));
            });

            $('#consortiumTable').DataTable();

        fetchStatesForConsortium();
        document.getElementById('consortiumStateType').addEventListener('change', async function() {
        const stateId = this.value;
        await fetchCitiesByStateConsortium(stateId);
    });
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }

    function fillAndShowModalConsortium(consortium) {

        document.getElementById('editConsortium').style.display = 'inline-block';
        document.getElementById('saveConsortium').style.display = 'none';

         document.querySelectorAll('.edit-only').forEach(field => field.style.display = 'inline-block');
        $("#cuit").inputmask("99-99999999-9"); 

        document.getElementById('createdAt').value = consortium.createdAt || '-';
        document.getElementById('createdBy').value = consortium.createdBy || '-';
        document.getElementById('updatedAt').value = consortium.updatedAt || '-';
        document.getElementById('updatedBy').value = consortium.updatedBy || '-';

        document.getElementById('consortiumId').value = consortium.id || '-';
        document.getElementById('name').value = consortium.name || '';
        document.getElementById('cellPhone').value = consortium.cellPhone || '';
        document.getElementById('email').value = consortium.email || '';
        document.getElementById('address').value = consortium.address || '';
        document.getElementById('zipCode').value = consortium.zipCode || '';
        document.getElementById('cuit').value = consortium.cuit || '';
        document.getElementById('consortiumStateType').value = consortium.stateId || '';
        document.getElementById('consortiumCityType').value = consortium.cityId || '';

     if (consortium.stateId) {
        fetchCitiesByStateConsortium(consortium.stateId).then(() => {
             document.getElementById('consortiumCityType').value = consortium.cityId || '';
        });
    }

        consortiumModal.show();
    }

    loadConsortia();
}
