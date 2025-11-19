// js/main.js

// Lista COMPLETA de Disciplinas (Baseada no V2__seed_minimal.sql)
const DISCIPLINAS = {
    '10000000-0000-0000-0000-000000000001': 'GAME DEVELOPER - DESENVOLVENDO SEU 1º GAME',
    '10000000-0000-0000-0000-000000000003': 'ANDROID DEVELOPER - CONSTRUINDO SEU 1º APP',
    '10000000-0000-0000-0000-000000000004': 'BACK-END DEVELOPER - CONHECENDO BANCO DE DADOS E INTEGRANDO APLICAÇÕES',
    '10000000-0000-0000-0000-000000000005': 'FRONT-END DEVELOPER - CRIANDO APLICAÇÕES PARA AMBIENTE WEB',
    '10000000-0000-0000-0000-000000000006': 'UX/UI MOBILE DEVELOPER - CONSTRUINDO APLICAÇÕES MOBILE COM FOCO NA EXPERIÊNCIA DO USUÁRIO',
    '10000000-0000-0000-0000-000000000007': 'SOFTWARE QUALITY ASSURANCE (SQA) - GARANTINDO A QUALIDADE DOS SOFTWARES',
    '10000000-0000-0000-0000-000000000008': 'CIBER SECURITY ESSENCIALS - CONHECENDO ESTRATÉGIAS DE DEFESA CIBERNÉTICA',
    '10000000-0000-0000-0000-000000000009': 'BUSINESS CHALLENGE - ENGENHARIA DE SOFTWARE I',
    '10000000-0000-0000-0000-000000000010': 'WINDOWS SERVER MANAGEMENT (ADMINISTRANDO SERVIÇOS DE SEGURANÇA WINDOWS)',
    '10000000-0000-0000-0000-000000000011': 'LINUX SECURITY - IMPLEMENTANDO SERVIÇOS DE SEGURANÇA LINUX',
    '10000000-0000-0000-0000-000000000012': 'IOT DEVELOPER - CRIANDO EQUIPAMENTOS CONECTADOS',
    '10000000-0000-0000-0000-000000000013': 'CLOUD SECURITY - IMPLEMENTANDO SERVIÇOS EM NUVEM',
    '10000000-0000-0000-0000-000000000014': 'IT LAW SPECIALIST - COMPREENDENDO OS ASPECTOS ÉTICOS E LEGAIS, SOCIOECONÔMICOS DO DESENVOLVIMENTO DE SOFTWARE',
    '10000000-0000-0000-0000-000000000015': 'IA - MACHINE LEARNING - CONSTRUINDO APLICAÇÕES COM INTELIGÊNCIA ARTIFICIAL',
    '10000000-0000-0000-0000-000000000016': 'BUSINESS CHALLENGE - ENGENHARIA DE SOFTWARE II',
    '10000000-0000-0000-0000-000000000017': 'IT MANAGER - GERENCIANDO OPERAÇÕES DE TECNOLOGIA',
    '10000000-0000-0000-0000-000000000018': 'DESRUPT IR SPECIALIST - EXPLORANDO OS NOVOS HORIZONTES DAS TECNOLOGIAS',
    '10000000-0000-0000-0000-000000000019': 'STARTUP MANAGEMENT: CRIANDO STARTUP DATA DRIVEN'
};

let currentSchedule = null;

document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
        window.location.href = 'portal.html';
        return;
    }

    // (Opcional) Preencher nome na tela
    // document.getElementById('userNameDisplay').textContent = userData.name;

    popularDisciplinas();
    carregarMeusAgendamentos();
    setupFormListeners();
});

function getToken() {
    return localStorage.getItem('authToken');
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

function popularDisciplinas() {
    const select = document.getElementById('disciplina');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione a disciplina</option>';
    for (const [id, nome] of Object.entries(DISCIPLINAS)) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = nome;
        select.appendChild(option);
    }
}

function setupFormListeners() {
    const disciplinaSelect = document.getElementById('disciplina');
    const dataInput = document.getElementById('data');
    const horarioSelect = document.getElementById('horario');

    // Quando mudar a Disciplina
    disciplinaSelect.addEventListener('change', async function() {
        dataInput.value = '';
        dataInput.disabled = true;
        horarioSelect.innerHTML = '<option value="">Selecione o horário</option>';
        horarioSelect.disabled = true;
        currentSchedule = null;

        const subjectId = this.value;
        if (!subjectId) return;

        const userData = JSON.parse(localStorage.getItem('userData'));
        
        // --- CORREÇÃO: Pegando o Polo REAL vindo do Login ---
        const poloId = userData.poloId;

        if (!poloId) {
            alert("Erro: Seu usuário não está vinculado a nenhum polo. Contate a secretaria.");
            return;
        }

        try {
            const url = `http://localhost:8080/api/schedules?poloId=${poloId}&subjectId=${subjectId}`;
            const resp = await fetch(url, { headers: getAuthHeaders() });
            
            if(resp.ok) {
                const schedules = await resp.json();
                if (schedules.length > 0) {
                    currentSchedule = schedules[0];
                    dataInput.disabled = false;
                    dataInput.min = currentSchedule.startDate;
                    dataInput.max = currentSchedule.endDate;
                    alert(`Agenda encontrada!\nDatas disponíveis: ${formatarDataPTBR(currentSchedule.startDate)} até ${formatarDataPTBR(currentSchedule.endDate)}`);
                } else {
                    alert('Não há agenda cadastrada para esta disciplina no seu polo.');
                }
            }
        } catch (err) {
            console.error("Erro ao buscar schedule:", err);
        }
    });

    // Quando mudar a Data
    dataInput.addEventListener('change', async function() {
        horarioSelect.innerHTML = '<option value="">Carregando...</option>';
        horarioSelect.disabled = true;

        if (!this.value || !currentSchedule) return;

        // Lógica para pegar o dia da semana correto (sem problemas de fuso horário)
        const [y, m, d] = this.value.split('-');
        const dataObj = new Date(y, m - 1, d);
        const diasSemana = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const dayStr = diasSemana[dataObj.getDay()];

        if (dayStr === 'sun') {
            alert('Não há agendamentos aos domingos.');
            horarioSelect.innerHTML = '<option value="">Selecione o horário</option>';
            return;
        }

        try {
            const url = `http://localhost:8080/api/schedules/${currentSchedule.id}/timeslots?day=${dayStr}`;
            const resp = await fetch(url, { headers: getAuthHeaders() });
            
            if (resp.ok) {
                const slots = await resp.json();
                horarioSelect.innerHTML = '<option value="">Selecione o horário</option>';
                
                if (slots.length === 0) {
                    const option = document.createElement('option');
                    option.text = "Sem horários para este dia";
                    horarioSelect.appendChild(option);
                } else {
                    slots.forEach(slot => {
                        const option = document.createElement('option');
                        const horaSimples = slot.startTime.substring(0, 5);
                        option.value = slot.startTime;
                        option.textContent = horaSimples;
                        horarioSelect.appendChild(option);
                    });
                    horarioSelect.disabled = false;
                }
            }
        } catch (err) {
            console.error(err);
            horarioSelect.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    });
}

async function agendarProva() {
    const disciplinaId = document.getElementById('disciplina').value;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;

    if (!disciplinaId || !data || !horario) {
        alert('Preencha todos os campos!');
        return;
    }

    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Usando o polo REAL do usuário
    const bookingDTO = {
        subjectId: disciplinaId,
        studentId: userData.id,
        poloId: userData.poloId, 
        date: data,
        time: horario
    };

    try {
        const resp = await fetch('http://localhost:8080/bookings', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(bookingDTO)
        });

        if (!resp.ok) {
            const err = await resp.json();
            alert(`Erro: ${err.detail || err.message || 'Falha ao agendar'}`);
            return;
        }

        alert('Agendamento realizado com sucesso!');
        document.getElementById('formAgendamento').reset();
        
        // Bloqueia os campos novamente após salvar
        document.getElementById('data').disabled = true;
        document.getElementById('horario').disabled = true;
        
        carregarMeusAgendamentos();

    } catch (err) {
        console.error(err);
        alert('Erro de conexão.');
    }
}

async function carregarMeusAgendamentos() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const container = document.getElementById('provasAgendadas');
    const emptyState = document.getElementById('emptyState');

    try {
        const resp = await fetch(`http://localhost:8080/bookings/mine?studentId=${userData.id}`, {
            headers: getAuthHeaders()
        });

        if (resp.ok) {
            const bookings = await resp.json();
            
            // Atualiza contadores
            const totalEl = document.getElementById('totalProvas');
            if(totalEl) totalEl.textContent = bookings.length;

            if (bookings.length === 0) {
                container.innerHTML = '';
                if(emptyState) emptyState.style.display = 'block';
                return;
            }

            if(emptyState) emptyState.style.display = 'none';
            container.innerHTML = '';

            bookings.forEach(b => {
                const nomeDisc = DISCIPLINAS[b.subjectId] || 'Disciplina';
                const dataF = formatarDataPTBR(b.date);
                const horaF = b.time.substring(0, 5);
                
                const html = `
                    <div class="card mb-2 shadow-sm border-start border-4 border-primary">
                        <div class="card-body py-2">
                            <h6 class="card-title mb-1 fw-bold">${nomeDisc}</h6>
                            <p class="card-text small text-muted mb-1">
                                <i class="bi bi-calendar-event me-1"></i> ${dataF} às ${horaF}
                            </p>
                            <span class="badge bg-success">Confirmado</span>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', html);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

function formatarDataPTBR(dataIso) {
    if(!dataIso) return '';
    const [y, m, d] = dataIso.split('-');
    return `${d}/${m}/${y}`;
}