// js/admin.js

const SUBJECT_MAP = {
    "ia": "10000000-0000-0000-0000-000000000015",
    "frontend": "10000000-0000-0000-0000-000000000005",
    "backend": "10000000-0000-0000-0000-000000000004",
    "game": "10000000-0000-0000-0000-000000000001"
};

const POLO_MAP = {
    "vr-sala8": "P00008",
    "bm-sala3": "P00002",
    "bp-sala1": "P00001"
};

document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem('token')) { window.location.href = 'portal.html'; return; }
    carregarAgendas();
    const form = document.getElementById('agendamentoAdminForm');
    if (form) form.addEventListener('submit', criarAgendamento);
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
        if (response.status === 401) { alert("Sessão expirada."); window.location.href = 'portal.html'; return null; }
        return response;
    } catch (error) { console.error(error); return null; }
}

async function carregarAgendas() {
    const lista = document.getElementById('provasAgendadasList');
    const response = await authFetch('/api/schedules');
    
    if (response && response.ok) {
        const schedules = await response.json();
        lista.innerHTML = '';
        if (schedules.length === 0) { lista.innerHTML = '<p class="text-muted">Nenhuma agenda.</p>'; return; }

        schedules.forEach(sch => {
            lista.innerHTML += `
              <div class="d-flex justify-content-between border-bottom p-2">
                <div>
                  <strong>Matéria ID:</strong> ${sch.subjectId.substring(0,8)}...<br>
                  <small>${sch.startDate} até ${sch.endDate} | Polo: ${sch.poloId}</small>
                </div>
                <button class="btn btn-sm btn-danger" onclick="deletarAgenda('${sch.id}')">🗑️</button>
              </div>`;
        });
    }
}

async function criarAgendamento(e) {
    e.preventDefault();
    const sub = document.getElementById('disciplinaAdmin').value;
    const pol = document.getElementById('poloAdmin').value;
    const ini = document.getElementById('dataInicio').value;
    const fim = document.getElementById('dataFim').value;

    if (!sub || !pol || !ini || !fim) return alert("Preencha tudo.");

    const btn = e.submitter;
    btn.disabled = true;
    btn.textContent = "Criando...";

    const resp = await authFetch('/api/schedules', {
        method: 'POST',
        body: JSON.stringify({ poloId: POLO_MAP[pol], subjectId: SUBJECT_MAP[sub], startDate: ini, endDate: fim })
    });

    if (resp && resp.ok) {
        const agenda = await resp.json();
        // Gera horários automaticamente (Endpoint Bulk)
        await authFetch(`/api/schedules/${agenda.id}/timeslots/bulk`, { method: 'POST' });
        alert("Agenda e horários criados!");
        document.getElementById('agendamentoAdminForm').reset();
        carregarAgendas();
    } else {
        const err = await resp.json().catch(() => ({}));
        alert("Erro: " + (err.detail || "Falha ao criar."));
    }
    btn.disabled = false;
    btn.textContent = "Salvar e Gerar Horários";
}

window.deletarAgenda = async function(id) {
    if(!confirm("Apagar agenda?")) return;
    const resp = await authFetch(`/api/schedules/${id}`, { method: 'DELETE' });
    if(resp && resp.ok) { alert("Apagado."); carregarAgendas(); }
};