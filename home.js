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
        const response = await fetch('http://localhost:9000/api/validatetoken', {
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
        const response = await fetch('http://localhost:9000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: username, pass: password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
            //displayToast('Login Success!');
        } else {
            displayToast('Usuario o contraseña incorrectos');
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
}

function loadContent(contentId) {
    const contentMapping = {
        'registroSocio': 'member.html',
        'biometricos': 'biometrics.html',
        'declaracionSalud': 'health_declaration.html',
        'actividades': 'activities.html',
        'puerta': 'door.html',
        'subscripcion': 'subscription.html',
        'asistencia': 'attendance.html',
        'emergencia': 'emergencyContact.html'
    };
    const url = contentMapping[contentId];
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
            if (contentId === 'registroSocio') {
                initializeMemberPage();
            }
            if(contentId === 'declaracionSalud'){
                loadMembersNames();
				initializeHealthDeclarationModal();
            }
            if(contentId === 'actividades') {
                  initializeActivityPage();
                loadActivities();
            }
           if(contentId === 'biometricos') {
            loadBiometrics();
           }
           if(contentId === 'puerta') {
            loadDoorConfig();
           }
           if(contentId === 'subscripcion') {
            loadSubscriptions();
            loadSubscriptionsSelect();
           } 
           if(contentId === 'asistencia') {
            loadAttendance();
           }          
           if(contentId === 'emergencia') {
            loadEmergencyContacts();
           } 
          
        })
        .catch(error => {
            console.error('Failed to load content:', error);
        });
}


