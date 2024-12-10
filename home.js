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
    
    userEmailSpan.textContent = email + ' ';
    userInfo.style.display = 'flex'; // Asegura que el contenedor sea visible
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-btn');

    logoutButton.addEventListener('click', () => {
        // Mostrar confirmación con SweetAlert
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esto cerrará tu sesión.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                // Eliminar el token del almacenamiento local
                localStorage.removeItem('token');
                
                // Mostrar el modal de login
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();

                // Ocultar la sección de información del usuario
                const userInfo = document.getElementById('user-info');
                userInfo.style.display = 'none';

                // Mostrar mensaje de éxito
                Swal.fire('Cerrado', 'Tu sesión ha sido cerrada.', 'success');
            }
        });
    });
});



function loadContent(contentId) {
    const contentMapping = {
        'interest': 'interest.html',
        'registroUsuario': 'registroUsuario.html',
        'registroEmpleados': 'registroEmpleados.html',
        'consorcios': 'consorcios.html',
        'registroCategorias': 'registroCategorias.html',
        'registroFunciones': 'registroFunciones.html',
        'registroModificadorSalarial': 'registroModificadorSalarial.html',
        'registroPlanillaRoles': 'registroPlanillaRoles.html',
        'registroPlanillaModificador': 'registroPlanillaModificador.html',
        'empleadosConsorcio': 'empleadosConsorcio.html',
        'historicoEmpleados': 'historicoEmpleados.html',
        'registroBasePlanillas': 'registroBasePlanillas.html',
        'calculoDeuda': 'calculoDeuda.html',
        'conceptConfig': 'conceptConfig.html'
    };
    const url = contentMapping[contentId];
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
            if (contentId === 'conceptConfig') {
                initializeConceptConfigView();
            }
            if (contentId === 'interest') {
                initializeInterestView();
            }
            if(contentId === 'registroUsuario'){
                loadUsers();
            }
            if(contentId === 'registroEmpleados') {
                initializeEmployeeView();
                loadEmployees();

            }
           if(contentId === 'consorcios') {
            initializeConsortiumView();

           }
           if(contentId === 'registroCategorias') {
            loadCategories();

           }
           if(contentId === 'registroFunciones') {
                initializeRoleView();

           }
           if(contentId === 'registroModificadorSalarial') {
            initializeModifierView();

           }          
           if(contentId === 'registroPlanillaRoles') {
            loadPlanillaRolBase();

           }
           if(contentId === 'registroPlanillaModificador') {
            loadPlanillaModificadorBase();

           }
            if(contentId === 'registroBasePlanillas') {

                loadPlanillaBase();
                initializePlanillaBase();

           } 
           if(contentId === 'empleadosConsorcio') {
            loadConsortiumsEmployee();
           }
           if(contentId === 'historicoEmpleados') {
             initializeEmployeeHistory();
           }

           if(contentId === 'calculoDeuda') {
            loadConsortiums();
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
            name: document.getElementById('modifierName').value
        };
        await saveModifier('POST', modifierData, 'Modificador creado exitosamente');
    }

    async function updateModifier() {
        const modifierData = {
            id: document.getElementById('modifierId').value,
            name: document.getElementById('modifierName').value
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

//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                            CATEGORIAS
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################



async function loadCategories() {
    const token = localStorage.getItem('token');
    const table = $('#categoriesTable');

    // Reiniciar la tabla si ya fue inicializada
    if ($.fn.DataTable.isDataTable(table)) {
        table.DataTable().clear().destroy();
    }

    try {
        const response = await fetch(`${BASE_URL}/v1/api/category/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener las categorías.');
        }

        const categories = await response.json();
        const tableBody = table.find('tbody');
        tableBody.empty(); // Limpiar el cuerpo de la tabla

        // Agregar filas dinámicamente
        categories.forEach(category => {
            const row = `
                <tr>
                    <td>${category.level}</td>
                    <td>${new Date(category.createdAt).toLocaleString()}</td>
                    <td>${category.createdBy || '-'}</td>
                    <td>${category.updatedAt || '-'}</td>
                    <td>${category.updatedBy || '-'}</td>
                </tr>
            `;
            tableBody.append(row);
        });

        // Inicializar DataTable
        table.DataTable({
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
        console.error('Error al cargar las categorías:', error);
        Swal.fire('Error', error.message, 'error');
    }
}

//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                       EMPLOYEE CONSORTIUM
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################

async function loadConsortiumsEmployee() {
    const consortiumSelect = document.getElementById('consortiumSelect');
    const token = localStorage.getItem('token');

    try {
        // Realiza la solicitud al endpoint para obtener los consorcios
        const response = await fetch(`${BASE_URL}/v1/api/consortium/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar los consorcios.');
        }

        const consortia = await response.json();

        // Limpia las opciones actuales del select
        consortiumSelect.innerHTML = '<option value="" disabled selected>Seleccione un Consorcio</option>';

        // Llena el select con las opciones de consorcios
        consortia.forEach(consortium => {
            const option = document.createElement('option');
            option.value = consortium.id;
            option.textContent = `${consortium.cuit}  ${consortium.name}`;
            consortiumSelect.appendChild(option);
        });
        document.getElementById('searchEmployeeConsortium').addEventListener('click', fetchEmployeesByConsortium);
    } catch (error) {
        console.error('Error al cargar consorcios:', error);
        Swal.fire('Error', 'No se pudieron cargar los consorcios.', 'error');
    }
}



async function fetchEmployeesByConsortium() {
    const consortiumSelect = document.getElementById('consortiumSelect');
    const dateFromInput = document.getElementById('dateFromEmployeeConsortium');
    const dateToInput = document.getElementById('dateToEmployeeConsortium');
    const vigenteCheckbox = document.getElementById('vigenteCheckbox');
    const consortiumEmployeesTable = document.getElementById('consortiumEmployeesTable').querySelector('tbody');

    const consortiumId = consortiumSelect.value;
    const fromDate = dateFromInput.value || '1900-01-01'; // Valor por defecto si no se selecciona fecha
    const toDate = dateToInput.value || '2100-12-31'; // Valor por defecto si no se selecciona fecha


    if (!consortiumId) {
        Swal.fire('Advertencia', 'Por favor, seleccione un consorcio', 'warning');
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const queryParams = new URLSearchParams({
            consortiumId,
            from: fromDate,
            to: toDate
        });

        const response = await fetch(`${BASE_URL}/v1/api/employee/by-consortium-date?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los empleados.');
        }

        const employees = await response.json();

        // Limpia la tabla antes de agregar nuevos datos
        consortiumEmployeesTable.innerHTML = '';

        // Llena la tabla con los datos obtenidos
        employees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="cursor:pointer;" class="bi bi-search" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                    </svg>
                </td>
                <td style="display: none;">${employee.id}</td>
                <td>${employee.firstName}</td>
                <td>${employee.lastName}</td>
                <td>${employee.documentType}</td>
                <td>${employee.documentNumber}</td>
                <td>${employee.cuil}</td>
                <td>${employee.cellPhone}</td>
                <td>${employee.email}</td>
            `;
            consortiumEmployeesTable.appendChild(row);
        });

        // Inicializar DataTable si no está ya configurado
        if (!$.fn.DataTable.isDataTable('#consortiumEmployeesTable')) {
            $('#consortiumEmployeesTable').DataTable({
                language: {
                    search: "Buscar:",
                    lengthMenu: "Mostrar _MENU_ registros",
                    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                    infoEmpty: "Mostrando 0 a 0 de 0 registros",
                    loadingRecords: "Cargando...",
                    zeroRecords: "No se encontraron resultados",
                    emptyTable: "No hay datos disponibles",
                    paginate: {
                        first: "Primero",
                        previous: "Anterior",
                        next: "Siguiente",
                        last: "Último"
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error al obtener los empleados:', error);
        Swal.fire('Error', error.message, 'error');
    }
}

//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                       EMPLOYEE HISTORICAL
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################


function populateSelect(selectId, data, defaultOptionText, formatter) {
    const select = document.getElementById(selectId);
    select.innerHTML = `<option value="" disabled selected>${defaultOptionText}</option>`;
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id || item.value;
        option.textContent = formatter(item);
        select.appendChild(option);
    });
}

async function loadSelectData(selectId, url, defaultOptionText, formatter) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error al cargar los datos para ${selectId}`);
        }

        const data = await response.json();
        populateSelect(selectId, data, defaultOptionText, formatter);
    } catch (error) {
        console.error(`Error cargando ${selectId}:`, error);
        Swal.fire('Error', `No se pudieron cargar los datos de ${selectId}.`, 'error');
    }
}


function initializeEmployeeHistory() {
    console.log('Planilla view initialized');

    const loadHistoryBtn = document.getElementById('loadHistoryBtn');
    const historyModal = new bootstrap.Modal(document.getElementById('historyModal'));

    loadHistoryBtn.addEventListener('click', () => {
        // Cargar selects al abrir el modal con formateadores específicos
        loadSelectData(
            'employeeId',
            `${BASE_URL}/v1/api/employee/all`,
            'Seleccione un empleado',
            item => `${item.firstName}  ${item.lastName} - ${item.cuil}`
        );
        loadSelectData(
            'consortiumId',
            `${BASE_URL}/v1/api/consortium/all`,
            'Seleccione un consorcio',
            item => item.name
        );
        loadSelectData(
            'roleId',
            `${BASE_URL}/v1/api/role/all`,
            'Seleccione un rol',
            item => item.name
        );
        loadSelectData(
            'salaryCategoryId',
            `${BASE_URL}/v1/api/category/all`,
            'Seleccione una categoría',
            item =>  item.level
        );

        // Mostrar el modal
        historyModal.show();
    });
}

//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                       USERS
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################


async function loadUsers() {
    const token = localStorage.getItem('token');
    const table = $('#usersTable');

    // Reiniciar la tabla si ya fue inicializada
    if ($.fn.DataTable.isDataTable(table)) {
        table.DataTable().clear().destroy();
    }

    try {
        const response = await fetch(`${BASE_URL}/v1/api/users/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los usuarios.');
        }

        const users = await response.json();
        const tableBody = table.find('tbody');
        tableBody.empty(); // Limpiar el cuerpo de la tabla

        // Agregar filas dinámicamente
        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.lastName}</td>
                    <td>${user.email}</td>
                    <td>${user.role || 'Sin rol'}</td>
                    <td>${new Date(user.createdAt).toLocaleString()}</td>
                </tr>
            `;
            tableBody.append(row);
        });

        // Inicializar DataTable
        table.DataTable({
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
        console.error('Error al cargar los usuarios:', error);
        Swal.fire('Error', error.message, 'error');
    }
}

//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                       PLANILLA BASE
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################

// Inicializa el contenido de la vista de planillas
function initializePlanillaBase() {
    const savePlanillaMButton = document.getElementById('savePlanillaMButton');
    if (savePlanillaMButton) {
        savePlanillaMButton.addEventListener('click', savePlanilla);
    }
}

// Carga la tabla con las planillas
async function loadPlanillaBase() {
    const tableBody = document.querySelector('#planillaBaseTable tbody');
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${BASE_URL}/v1/api/period/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al cargar las planillas.');
        }

        const planillas = await response.json();

        // Limpia la tabla antes de recargar
        if ($.fn.DataTable.isDataTable('#planillaBaseTable')) {
            $('#planillaBaseTable').DataTable().clear().destroy();
        }
        tableBody.innerHTML = '';

        // Rellena la tabla con las planillas
        planillas.forEach(planilla => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="cursor:pointer;" class="bi bi-search" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                    </svg>
                </td>
                <td style="display: none;">${planilla.id}</td>
                <td>${planilla.dispositionId}</td>
                <td>${planilla.name}</td>
                <td>${planilla.fromDate}</td>
                <td>${planilla.toDate}</td>
                <td>${new Date(planilla.createdAt).toLocaleString()}</td>
                <td>${planilla.createdBy || '-'}</td>
                <td>${planilla.updatedAt ? new Date(planilla.updatedAt).toLocaleString() : '-'}</td>
                <td>${planilla.updatedBy || '-'}</td>
            `;
            tableBody.appendChild(row);
        });

        // Reinicia DataTable con los datos nuevos
        $('#planillaBaseTable').DataTable({
            language: {
                search: 'Buscar:',
                lengthMenu: 'Mostrar _MENU_ registros',
                info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
                infoEmpty: 'Mostrando 0 a 0 de 0 registros',
                loadingRecords: 'Cargando...',
                zeroRecords: 'No se encontraron resultados',
                emptyTable: 'No hay datos disponibles',
                paginate: {
                    first: 'Primero',
                    previous: 'Anterior',
                    next: 'Siguiente',
                    last: 'Último',
                },
            },
        });
    } catch (error) {
        console.error('Error al cargar las planillas:', error);
        Swal.fire('Error', 'No se pudieron cargar las planillas.', 'error');
    }
}

// Guarda una nueva planilla
async function savePlanilla() {
    const planillaForm = document.getElementById('planillaBaseForm');

    // Validación del formulario
    if (!planillaForm.checkValidity()) {
        planillaForm.classList.add('was-validated');
        return;
    }

    // Obtener los valores del formulario
    const fromDate = document.getElementById('fromDatePicker').value;
    const toDate = document.getElementById('toDatePicker').value;
    const name = document.getElementById('planillaNameInput').value.trim();
    const dispositionId = document.getElementById('dispositionNameInput').value.trim();

    const token = localStorage.getItem('token');
    const postData = {
        fromDate,
        toDate,
        name,
        dispositionId,
    };

    try {
        const response = await fetch(`${BASE_URL}/v1/api/period`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            throw new Error('Error al guardar la planilla.');
        }

        Swal.fire('Éxito', 'Planilla creada correctamente.', 'success');

        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('cargarPlanillaModal'));
        modal.hide();

        // Reiniciar el formulario
        planillaForm.reset();
        planillaForm.classList.remove('was-validated');

        // Recargar la tabla
        loadPlanillaBase();
    } catch (error) {
        console.error('Error al guardar la planilla:', error);
        Swal.fire('Error', error.message, 'error');
    }
}

//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                       PLANILLA MODIFICADOR
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################

async function loadPlanillaModificadorBase() {
    const planillaSelect = document.getElementById('planillaMofidierSelect');
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${BASE_URL}/v1/api/period/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar las planillas.');
        }

        const planillas = await response.json();
        planillaSelect.innerHTML = '<option value="" disabled selected>Seleccione una Planilla</option>';

        planillas.forEach(planilla => {
            const option = document.createElement('option');
            option.value = `${planilla.fromDate},${planilla.toDate}`;
            option.textContent = `${planilla.fromDate} - ${planilla.toDate} | ${planilla.name} | ${planilla.dispositionId}`;
            planillaSelect.appendChild(option);
        });

        planillaSelect.addEventListener('change', fetchPlanillaDetails);
        loadModifiersSelectModal();
        document.getElementById('saveModifierButton').addEventListener('click', saveModifier);
        document.getElementById('editModifierButton').addEventListener('click', updateModifier);
    } catch (error) {
        console.error('Error al cargar las planillas:', error);
        Swal.fire('Error', 'No se pudieron cargar las planillas.', 'error');
    }
}

async function loadModifiersSelectModal() {
    const modifierSelect = document.getElementById('planillaModifierNameSelect');
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${BASE_URL}/v1/api/modifier/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar modificadores salariales.');
        }

        const modifiers = await response.json();
        modifierSelect.innerHTML = '<option value="" disabled selected>Seleccione un Modificador Salarial</option>';

        modifiers.forEach(modifier => {
            const option = document.createElement('option');
            option.value = modifier.id;
            option.textContent = modifier.name;
            modifierSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar modificadores salariales:', error);
        Swal.fire('Error', 'No se pudieron cargar los modificadores salariales.', 'error');
    }
}

async function fetchPlanillaDetails() {
    const planillaSelect = document.getElementById('planillaMofidierSelect');
    const planillaBaseTable = document.getElementById('salaryPlanillaModifiersTable').querySelector('tbody');
    const token = localStorage.getItem('token');
    const [fromDate, toDate] = planillaSelect.value.split(',');


            // Reiniciar DataTable
        if ($.fn.DataTable.isDataTable('#salaryPlanillaModifiersTable')) {
            $('#salaryPlanillaModifiersTable').DataTable().clear().destroy();
        }

    try {
        const response = await fetch(`${BASE_URL}/v1/api/period/search?fromDate=${fromDate}&toDate=${toDate}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los detalles de la planilla.');
        }

        const planillaDetails = await response.json();

        // Limpia el tbody de la tabla
        planillaBaseTable.innerHTML = '';

        // Agregar datos a la tabla
        planillaDetails.forEach(planilla => {
            if (Array.isArray(planilla.salaryModifierPeriodRelationships)) {
                planilla.salaryModifierPeriodRelationships.forEach(modifier => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="cursor:pointer;" class="bi bi-search" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                            </svg>
                        </td>
                        <td style="display: none;">${modifier.salaryModifierId}</td>
                        <td>${planilla.fromDate || '-'}</td>
                        <td>${planilla.toDate || '-'}</td>
                        <td>${modifier.amount || '-'}</td>
                        <td>${modifier.markUpType || '-'}</td>
                        <td>${modifier.salaryModifierName || '-'}</td>
                        <td>${modifier.createdAt ? new Date(modifier.createdAt).toLocaleString() : '-'}</td>
                        <td>${modifier.createdBy || '-'}</td>
                        <td>${modifier.updatedAt ? new Date(modifier.updatedAt).toLocaleString() : '-'}</td>
                        <td>${modifier.updatedBy || '-'}</td>
                    `;
                    planillaBaseTable.appendChild(row);
                });
            }
        });



        $('#salaryPlanillaModifiersTable').DataTable({
            language: {
                search: "Buscar:",
                lengthMenu: "Mostrar _MENU_ registros",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 a 0 de 0 registros",
                loadingRecords: "Cargando...",
                zeroRecords: "No se encontraron resultados",
                emptyTable: "No hay datos disponibles",
                paginate: {
                    first: "Primero",
                    previous: "Anterior",
                    next: "Siguiente",
                    last: "Último"
                }
            }
        });

            document.getElementById('salaryPlanillaModifiersTable').addEventListener('click', (event) => {
        const target = event.target.closest('svg');
        if (target) {
            const row = target.closest('tr');
            openEditModal(row);
        }
            });
    } catch (error) {
        console.error('Error al obtener los detalles de la planilla:', error);
        Swal.fire('Error', error.message, 'error');
    }
}


async function saveModifier() {
    const form = document.getElementById('planillaModifierForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const salaryModifierId = document.getElementById('planillaModifierNameSelect').value;
    const amount = parseFloat(document.getElementById('modifierAmountInput').value);
    const markUp = document.getElementById('modifierTypeSelect').value;
    const token = localStorage.getItem('token');
    const planillaSelect = document.getElementById('planillaMofidierSelect');
    const [fromDate, toDate] = planillaSelect.value.split(',');

    try {
        const response = await fetch(`${BASE_URL}/v1/api/period/modifier`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ salaryModifierId, amount, markUp, fromDate, toDate })
        });

        if (!response.ok) {
            throw new Error('Error al guardar el registro de la planilla.');
        }
        Swal.fire('Éxito', 'Registro guardado correctamente.', 'success');

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('cargarRegistroModal'));
        modal.hide();
        form.reset();
        form.classList.remove('was-validated');

        // Reload the table for the currently selected Planilla
        fetchPlanillaDetails(); // Call fetchPlanillaDetails directly
    } catch (error) {
        console.error('Error al guardar el registro:', error);
        Swal.fire('Error', error.message, 'error');
    }
}




function openEditModal(row) {
    // Obtener los datos del row correspondiente
    const salaryModifierId = row.cells[1].textContent.trim(); // ID del modificador
    const amount = row.cells[4].textContent.trim(); // Monto
    const markUpType = row.cells[5].textContent.trim(); // Tipo

    // Pre-popular los campos del modal
    document.getElementById('modifierAmountInput').value = amount;
    document.getElementById('modifierTypeSelect').value = markUpType;
    document.getElementById('planillaModifierNameSelect').value = salaryModifierId;

    // Guardar el ID del modificador en un atributo de datos para usarlo en el PATCH
    document.getElementById('editModifierButton').setAttribute('data-modifier-id', salaryModifierId);

    // Mostrar el botón de edición y ocultar el botón de guardar
    document.getElementById('saveModifierButton').style.display = 'none';
    document.getElementById('editModifierButton').style.display = 'block';

    // Abrir el modal
    const modal = new bootstrap.Modal(document.getElementById('cargarRegistroModal'));
    modal.show();
}

async function updateModifier() {
    const form = document.getElementById('planillaModifierForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const salaryModifierId = document.getElementById('editModifierButton').getAttribute('data-modifier-id');
    const amount = parseFloat(document.getElementById('modifierAmountInput').value);
    const markUp = document.getElementById('modifierTypeSelect').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${BASE_URL}/v1/api/period/modifier/${salaryModifierId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount, markUp })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el registro de la planilla.');
        }

        Swal.fire('Éxito', 'Registro actualizado correctamente.', 'success');

        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('cargarRegistroModal'));
        modal.hide();
        form.reset();
        form.classList.remove('was-validated');

        // Reload the table for the currently selected Planilla
        fetchPlanillaDetails();
    } catch (error) {
        console.error('Error al actualizar el registro:', error);
        Swal.fire('Error', error.message, 'error');
    }
}

//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                       PLANILLA ROLES
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################

async function loadPlanillaRolBase() {
    const planillaSelect = document.getElementById('planillaRoleSelect');
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${BASE_URL}/v1/api/period/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar las planillas.');
        }

        const planillas = await response.json();
        planillaSelect.innerHTML = '<option value="" disabled selected>Seleccione una Planilla</option>';

        planillas.forEach(planilla => {
            const option = document.createElement('option');
            option.value = `${planilla.fromDate},${planilla.toDate}`;
            option.textContent = `${planilla.fromDate} - ${planilla.toDate} | ${planilla.name} | ${planilla.dispositionId}`;
            planillaSelect.appendChild(option);
        });

         planillaSelect.addEventListener('change', fetchPlanillaRoleCategoryDetails);
          const form = document.getElementById('roleCategoryForm');
        form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevenir la recarga de la página
        await saveRoleCategory(); // Llamar a la función para guardar los datos
    });

        loadRoleAndCategorySelects();
    } catch (error) {
        console.error('Error al cargar las planillas:', error);
        Swal.fire('Error', 'No se pudieron cargar las planillas.', 'error');
    }
}

async function loadRoleAndCategorySelects() {
    // Llenar el select de categorías
    await loadSelectDataRoleCategory(
        'categoryCategoryInput', // ID del select de categorías
        `${BASE_URL}/v1/api/category/all`, // URL para obtener las categorías
        'Seleccione una categoría', // Placeholder
        'name' // Usar `name` como texto
    );

    // Llenar el select de roles
    await loadSelectDataRoleCategory(
        'roleNameCategorySelect', // ID del select de roles
        `${BASE_URL}/v1/api/role/all`, // URL para obtener los roles
        'Seleccione un rol', // Placeholder
        'level' // Usar `level` como texto
    );
}

async function loadSelectDataRoleCategory(selectId, url, placeholder, displayField) {
    const selectElement = document.getElementById(selectId);
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error al cargar datos para ${selectId}`);
        }

        const data = await response.json();

        // Limpia las opciones actuales del select
        selectElement.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;

        // Agrega las opciones dinámicamente
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.level || item.name; // Usa el campo especificado como texto
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error(`Error al cargar datos para ${selectId}:`, error);
        Swal.fire('Error', `No se pudieron cargar los datos de ${placeholder.toLowerCase()}.`, 'error');
    }
}

async function fetchPlanillaRoleCategoryDetails() {
    const planillaSelect = document.getElementById('planillaRoleSelect');
    const planillaBaseTable = document.getElementById('salaryRoleTable').querySelector('tbody');
    const token = localStorage.getItem('token');
    const [fromDate, toDate] = planillaSelect.value.split(',');


            // Reiniciar DataTable
        if ($.fn.DataTable.isDataTable('#salaryRoleTable')) {
            $('#salaryRoleTable').DataTable().clear().destroy();
        }

    try {
        const response = await fetch(`${BASE_URL}/v1/api/period/search?fromDate=${fromDate}&toDate=${toDate}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los detalles de la planilla.');
        }

        const planillaDetails = await response.json();

        // Limpia el tbody de la tabla
        planillaBaseTable.innerHTML = '';

        // Agregar datos a la tabla
        planillaDetails.forEach(planilla => {
            if (Array.isArray(planilla.salaryModifierPeriodRelationships)) {
                planilla.roleCategoryRelationships.forEach(modifier => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="cursor:pointer;" class="bi bi-search" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                            </svg>
                        </td>
                        <td style="display: none;">${modifier.salaryModifierId}</td>
                        <td>${planilla.fromDate || '-'}</td>
                        <td>${planilla.toDate || '-'}</td>
                        <td>${modifier.amount || '-'}</td>
                        <td>${modifier.roleName || '-'}</td>
                        <td>${modifier.categoryLevel || '-'}</td>
                        <td>${modifier.createdAt ? new Date(modifier.createdAt).toLocaleString() : '-'}</td>
                        <td>${modifier.createdBy || '-'}</td>
                        <td>${modifier.updatedAt ? new Date(modifier.updatedAt).toLocaleString() : '-'}</td>
                        <td>${modifier.updatedBy || '-'}</td>
                    `;
                    planillaBaseTable.appendChild(row);
                });
            }
        });



        $('#salaryRoleTable').DataTable({
            language: {
                search: "Buscar:",
                lengthMenu: "Mostrar _MENU_ registros",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 a 0 de 0 registros",
                loadingRecords: "Cargando...",
                zeroRecords: "No se encontraron resultados",
                emptyTable: "No hay datos disponibles",
                paginate: {
                    first: "Primero",
                    previous: "Anterior",
                    next: "Siguiente",
                    last: "Último"
                }
            }
        });

         /*   document.getElementById('salaryRoleTable').addEventListener('click', (event) => {
        const target = event.target.closest('svg');
        if (target) {
            const row = target.closest('tr');
            openEditModal(row);
        }
            });*/
    } catch (error) {
        console.error('Error al obtener los detalles de la planilla:', error);
        Swal.fire('Error', error.message, 'error');
    }
}

async function saveRoleCategory() {
    const form = document.getElementById('roleCategoryForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const roleId = document.getElementById('roleNameCategorySelect').value;
    const salaryCategoryId = document.getElementById('categoryCategoryInput').value;
    const amount = parseFloat(document.getElementById('amountCategoryInput').value);
    const token = localStorage.getItem('token');
    const planillaSelect = document.getElementById('planillaRoleSelect');
    const [fromDate, toDate] = planillaSelect.value.split(',');

    try {
        const response = await fetch(`${BASE_URL}/v1/api/period/role-category`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ roleId, salaryCategoryId, amount, fromDate, toDate })
        });

        if (!response.ok) {
            throw new Error('Error al guardar el registro del rol y categoría.');
        }

        Swal.fire('Éxito', 'Registro guardado correctamente.', 'success');

        const modal = bootstrap.Modal.getInstance(document.getElementById('cargarRegistroRolModal'));
        modal.hide();
        form.reset();
        form.classList.remove('was-validated');

        // Recargar la tabla después de guardar
        fetchPlanillaRoleCategoryDetails();
    } catch (error) {
        console.error('Error al guardar el registro:', error);
        Swal.fire('Error', error.message, 'error');
    }
}


//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                       CALCULO DEUDA
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################



async function loadConsortiums() {
    const consortiumSelect = document.getElementById('consortiumSelect');
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${BASE_URL}/v1/api/consortium/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar los consorcios.');
        }

        const consortiums = await response.json();
        consortiumSelect.innerHTML = '<option value="" disabled selected>Seleccione un Consorcio</option>';

        consortiums.forEach(consortium => {
            const option = document.createElement('option');
            option.value = consortium.id;
            option.textContent = consortium.name;
            consortiumSelect.appendChild(option);
        });
        calculateDebtButton.removeEventListener('click', calculateDebt);
        document.getElementById('calculateDebtButton').addEventListener('click', calculateDebt);
    } catch (error) {
        console.error('Error al cargar los consorcios:', error);
        Swal.fire('Error', 'No se pudieron cargar los consorcios.', 'error');
    }
}



async function calculateDebt() {
    const consortiumSelect = document.getElementById('consortiumSelect');
    const fromDate = document.getElementById('fromDateInput').value;
    const toDate = document.getElementById('toDateInput').value;
    const dueDate = document.getElementById('dueDateInput').value;
    const token = localStorage.getItem('token');
    const consortiumId = consortiumSelect.value;

    if (!consortiumId || !fromDate || !toDate || !dueDate) {
        Swal.fire('Error', 'Por favor complete todos los campos.', 'error');
        return;
    }

    try {
        const response = await fetch(
            `${BASE_URL}/v1/api/debt/calculate?consortiumId=${consortiumId}&fromDate=${fromDate}&toDate=${toDate}&dueDate=${dueDate}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Error al calcular la deuda.');
        }

        const debtData = await response.json();
        displayDebtData(debtData);
    } catch (error) {
        console.error('Error al calcular la deuda:', error);
        Swal.fire('Error', error.message, 'error');
    }
}

function displayDebtData(debtData) {
    const tableBody = document.querySelector('#consortiumDebtTable tbody');
    const totalCapital = document.getElementById('totalCapital');
    const totalInterest = document.getElementById('totalInterest');

    let totalCapitalValue = 0;
    let totalInterestValue = 0;

    tableBody.innerHTML = '';

    debtData.employeeDebts.forEach(employee => {
        employee.debts.forEach(debt => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.firstName} ${employee.lastName}</td>
                <td>${employee.cuil}</td>
                <td>${debt.dateFrom}</td>
                <td>${debt.dateTo}</td>
                <td>${debt.capital.toFixed(2)}</td>
                <td>${debt.interest.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
            totalCapitalValue += parseFloat(debt.capital);
            totalInterestValue += parseFloat(debt.interest);
        });
    });

    totalCapital.textContent = totalCapitalValue.toFixed(2);
    totalInterest.textContent = totalInterestValue.toFixed(2);

    if ($.fn.DataTable.isDataTable('#consortiumDebtTable')) {
        $('#consortiumDebtTable').DataTable().clear().destroy();
    }

    $('#consortiumDebtTable').DataTable({
        language: {
            search: 'Buscar:',
            lengthMenu: 'Mostrar _MENU_ registros',
            info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
            infoEmpty: 'Mostrando 0 a 0 de 0 registros',
            loadingRecords: 'Cargando...',
            zeroRecords: 'No se encontraron resultados',
            emptyTable: 'No hay datos disponibles',
            paginate: {
                first: 'Primero',
                previous: 'Anterior',
                next: 'Siguiente',
                last: 'Último'
            }
        }
    });
}


//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                               Interest
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################

function initializeInterestView() {
    const newInterestBtn = document.getElementById('newInterestBtn');
    const interestForm = document.getElementById('interestForm');
    const interestModal = new bootstrap.Modal(document.getElementById('interestModal'));

    newInterestBtn.addEventListener('click', handleNewInterest);

    interestForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const action = event.submitter.getAttribute('data-action');
        if (action === 'editInterest') {
            updateInterest();
        } else {
            createInterest();
        }
    });

    function handleNewInterest() {
        interestForm.reset();
        document.querySelectorAll('.edit-only').forEach(field => field.style.display = 'none');
        interestModal.show();
        document.getElementById('editInterest').style.display = 'none';
        document.getElementById('saveInterest').style.display = 'inline-block';
    }

    async function createInterest() {
        if (!interestForm.checkValidity()) {
            interestForm.classList.add('was-validated');
            return;
        }
        const interestData = gatherInterestFormData();

        console.log("Interest Data:", interestData)

        await saveInterest('POST', interestData, 'Interés creado exitosamente');
    }

    async function updateInterest() {
        if (!interestForm.checkValidity()) {
            interestForm.classList.add('was-validated');
            return;
        }

        const interestData = gatherInterestFormData();
        interestData.id = document.getElementById('interestId').value;
        await saveInterest('PATCH', interestData, 'Interés actualizado exitosamente');
    }

    function gatherInterestFormData() {
        return {
            norm: document.getElementById('norm').value,
            interest: parseFloat(document.getElementById('interestAmount').value),
            fromDate: document.getElementById('fromDate').value,
            toDate: document.getElementById('toDate').value
        };
    }

    async function saveInterest(method, data, successMessage) {
        try {
            console.log("Data before to convert json:", data)

            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/v1/api/interest`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            console.log("Data after to convert json:", JSON.stringify(data))

            if (!response.ok) {
                const errorJson = await response.json();
                const errorMessage = errorJson.result || 'Ocurrió un error inesperado';
                Swal.fire('Error', errorMessage);
            }else{
                Swal.fire('Éxito', successMessage, 'success').then(() => loadInterests());
            }

            interestModal.hide();
            
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }

    async function loadInterests() {
        if ($.fn.DataTable.isDataTable('#interestTable')) {
            $('#interestTable').DataTable().destroy();
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/v1/api/interest/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al cargar los intereses.');
            }

            const interests = await response.json();
            const tableBody = document.querySelector('#interestTable tbody');
            tableBody.innerHTML = interests.map(interest => `
                <tr>
                    <td><i class="bi bi-search" style="cursor: pointer;"></i></td>
                    <td style="display: none;">${interest.id}</td>
                    <td>${interest.norm}</td>
                    <td>${interest.interest}</td>
                    <td>${interest.fromDate}</td>
                    <td>${interest.toDate}</td>
                </tr>
            `).join('');

            document.querySelectorAll('.bi-search').forEach((icon, index) => {
                icon.addEventListener('click', () => fillAndShowModalInterest(interests[index]));
            });

            $('#interestTable').DataTable({
                language: {
                    search: "Buscar:",
                    lengthMenu: "Mostrar _MENU_ registros",
                    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                    infoEmpty: "Mostrando 0 a 0 de 0 registros",
                    loadingRecords: "Cargando...",
                    zeroRecords: "No se encontraron resultados",
                    emptyTable: "No hay datos disponibles",
                    paginate: {
                        first: "Primero",
                        previous: "Anterior",
                        next: "Siguiente",
                        last: "Último"
                    }
                }
            });
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }

    function fillAndShowModalInterest(interest) {
        document.getElementById('interestId').value = interest.id || '';
        document.getElementById('createdAt').value = interest.createdAt || '-';
        document.getElementById('norm').value = interest.norm || '';
        document.getElementById('interestAmount').value = interest.interest || '';
        document.getElementById('fromDate').value = interest.fromDate || '';
        document.getElementById('toDate').value = interest.toDate || '';

        document.querySelectorAll('.edit-only').forEach(field => field.style.display = 'block');
        interestModal.show();
        document.getElementById('editInterest').style.display = 'inline-block';
        document.getElementById('saveInterest').style.display = 'none';
    }

    loadInterests();
}

//#############################################################################################################
//#############################################################################################################
//#############################################################################################################
//                                               Concept Configurations
//#############################################################################################################
//#############################################################################################################
//#############################################################################################################

function initializeConceptConfigView() {
    const newConfigBtn = document.getElementById('newConfigBtn');
    const conceptConfigForm = document.getElementById('conceptConfigForm');
    const conceptConfigModal = new bootstrap.Modal(document.getElementById('conceptConfigModal'));
    const conceptTypeDropdown = document.getElementById('conceptType');

    newConfigBtn.addEventListener('click', handleNewConfig);

    conceptConfigForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const action = event.submitter.getAttribute('data-action');
        if (action === 'editConfig') {
            updateConceptConfig();
        } else {
            createConceptConfig();
        }
    });

    async function handleNewConfig() {
        conceptConfigForm.reset();
        await loadConceptTypes(); // Carga las opciones del dropdown antes de abrir el modal
        conceptConfigModal.show();
        document.getElementById('editConfig').style.display = 'none';
        document.getElementById('saveConfig').style.display = 'inline-block';
    }

    async function createConceptConfig() {
        if (!conceptConfigForm.checkValidity()) {
            conceptConfigForm.classList.add('was-validated');
            return;
        }
        const configData = gatherConceptConfigFormData();
        await saveConceptConfig('POST', configData, 'Configuración creada exitosamente');
    }

    async function updateConceptConfig() {
        if (!conceptConfigForm.checkValidity()) {
            conceptConfigForm.classList.add('was-validated');
            return;
        }
        const configData = gatherConceptConfigFormData();
        configData.id = document.getElementById('configId').value;
        await saveConceptConfig('PATCH', configData, 'Configuración actualizada exitosamente');
    }

    function gatherConceptConfigFormData() {
        return {
            name: document.getElementById('configName').value,
            conceptType: document.getElementById('conceptType').value
        };
    }

    async function saveConceptConfig(method, data, successMessage) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/v1/api/concept-config`, {
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
                Swal.fire('Error', errorMessage);
            } else {
                Swal.fire('Éxito', successMessage, 'success').then(() => loadConceptConfigs());
            }

            conceptConfigModal.hide();
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }

    async function loadConceptConfigs() {
        if ($.fn.DataTable.isDataTable('#conceptConfigTable')) {
            $('#conceptConfigTable').DataTable().destroy();
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/v1/api/concept-config/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al cargar las configuraciones.');
            }

            const configs = await response.json();
            const tableBody = document.querySelector('#conceptConfigTable tbody');
            tableBody.innerHTML = configs.map(config => `
                <tr>
                    <td><i class="bi bi-search" style="cursor: pointer;"></i></td>
                    <td style="display: none;">${config.id}</td>
                    <td>${config.name}</td>
                    <td>${config.conceptType}</td>
                </tr>
            `).join('');

            document.querySelectorAll('.bi-search').forEach((icon, index) => {
                icon.addEventListener('click', () => fillAndShowModalConfig(configs[index]));
            });

            $('#conceptConfigTable').DataTable({
                language: {
                    search: "Buscar:",
                    lengthMenu: "Mostrar _MENU_ registros",
                    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                    infoEmpty: "Mostrando 0 a 0 de 0 registros",
                    loadingRecords: "Cargando...",
                    zeroRecords: "No se encontraron resultados",
                    emptyTable: "No hay datos disponibles",
                    paginate: {
                        first: "Primero",
                        previous: "Anterior",
                        next: "Siguiente",
                        last: "Último"
                    }
                }
            });
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }

    async function loadConceptTypes() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/v1/api/loader/concept-types`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al cargar los tipos de conceptos.');
            }

            const conceptTypes = await response.json();
            conceptTypeDropdown.innerHTML = `
                <option value="" disabled selected>Seleccione un tipo de concepto</option>
                ${conceptTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
            `;
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }

    async function fillAndShowModalConfig(config) {
        await loadConceptTypes();
        document.getElementById('configName').value = config.name || '';
        document.getElementById('conceptType').value = config.conceptType || '';

        conceptConfigModal.show();
        document.getElementById('editConfig').style.display = 'inline-block';
        document.getElementById('saveConfig').style.display = 'none';
    }

    loadConceptConfigs();
}



