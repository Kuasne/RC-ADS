// js/main.js

const SUBJECT_MAP = {
    "algoritmos": "10000000-0000-0000-0000-000000000001",
    "programacao": "10000000-0000-0000-0000-000000000003",
    "bd": "10000000-0000-0000-0000-000000000004",
    "web": "10000000-0000-0000-0000-000000000005",
    "engenharia": "10000000-0000-0000-0000-000000000009",
    "redes": "10000000-0000-0000-0000-000000000010",
    "seguranca": "10000000-0000-0000-0000-000000000008"
};

const DEFAULT_POLO_ID = "P00001"; // Polo Barra do Piraí (padrão para MVP)

document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('token')) {
        window.location.href = 'portal.html';
        return;
    }
    
    const dataInput = document.getElementById('data');
    if (dataInput) dataInput.min = new Date().toISOString().split('T')[0];
    
    const form = document.getElementById('formAgendamento');
    if (form) form.addEventListener('submit', handleAgendamento);

    carregarMeusAgendamentos();
});

async function authFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        if (response.status === 401 || response.status === 403) {
            alert("Sessão expirada.");
            localStorage.clear();
            window.location.href = 'portal.html';
            return null;
        }
        return response;
    } catch (error) {
        console.error(error);
        alert("Erro de conexão.");
        return null;
    }
}

async function carregarMeusAgendamentos() {
    const studentId = localStorage.getItem('userId');
    const container = document.getElementById('provasAgendadas');
    const emptyState = document.getElementById('emptyState');

    const response = await authFetch(`/bookings/mine?studentId=${studentId}`);
    
    if (response && response.ok) {
        const bookings = await response.json();
        container.innerHTML = ''; 

        if (bookings.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';
        
        bookings.forEach(b => {
            const dateParts = b.date.split('-');
            const dataF = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            const inicial = b.subjectName ? b.subjectName.charAt(0) : '?';

            container.innerHTML += `
            <div class="d-flex align-items-center justify-content-between p-3 border rounded mb-2 bg-white shadow-sm">
                <div class="d-flex align-items-center">
                    <div class="disciplina-circle me-3 bg-primary text-white d-flex align-items-center justify-content-center" style="width:40px; height:40px; border-radius:50%;">
                        ${inicial}
                    </div>
                    <div>
                        <div class="fw-bold">${b.subjectName}</div>
                        <div class="text-muted small">Data: ${dataF} - ${b.time}</div>
                        <div class="text-muted small">Polo: ${b.poloName || 'Polo'}</div>
                    </div>
                </div>
                <button onclick="deletarProva('${b.id}')" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
            </div>`;
        });
        
        // Atualiza contadores simples
        document.getElementById('totalProvas').textContent = bookings.length;
        document.getElementById('disciplinasCount').textContent = new Set(bookings.map(b => b.subjectName)).size;
    }
}

async function handleAgendamento(e) {
    e.preventDefault();
    const subjectKey = document.getElementById('disciplina').value;
    const date = document.getElementById('data').value;
    const time = document.getElementById('horario').value;

    if (!subjectKey || !date || !time) { alert('Preencha todos os campos.'); return; }

    const payload = {
        studentId: localStorage.getItem('userId'),
        subjectId: SUBJECT_MAP[subjectKey],
        poloId: DEFAULT_POLO_ID,
        date: date,
        time: time + ":00"
    };

    const btn = e.submitter;
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    const response = await authFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    if (response) {
        if (response.ok) {
            alert('Agendado com sucesso!');
            document.getElementById('formAgendamento').reset();
            carregarMeusAgendamentos();
        } else {
            const err = await response.json().catch(() => ({}));
            alert('Erro: ' + (err.detail || 'Verifique a disponibilidade.'));
        }
    }
    btn.disabled = false;
    btn.textContent = 'Salvar';
}

window.deletarProva = async function(id) {
    if (!confirm('Cancelar agendamento?')) return;
    const response = await authFetch(`/bookings/${id}`, { method: 'DELETE' });
    if (response && response.ok) {
        alert('Cancelado.');
        carregarMeusAgendamentos();
    } else {
        alert('Erro ao cancelar.');
    }
};