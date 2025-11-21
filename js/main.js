// js/main.js

// --- CONFIGURAÇÕES E DADOS ---

// Lista de Disciplinas
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

// Variável para guardar o Schedule atual selecionado
let currentSchedule = null;
let provas = []; // Lista local para exibição

// --- INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', function() {
    // 1. Verificar Login
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
        window.location.href = 'portal.html';
        return;
    }

    // 2. Inicializar Componentes
    popularDisciplinas();
    carregarMeusAgendamentos();
    
    // 3. Configurar Listeners do Formulário
    setupFormListeners();

    // 4. Configurar Listener de Cancelamento
    setupCancelBookingListener();
});

// --- FUNÇÕES DE INTEGRAÇÃO (API) ---

function getToken() {
    return localStorage.getItem('authToken');
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

// 1. Preenche o Select de Disciplinas
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

// 2. Configura a lógica de cascata (Disciplina -> Data -> Horário)
function setupFormListeners() {
    const disciplinaSelect = document.getElementById('disciplina');
    const dataInput = document.getElementById('data');
    const horarioSelect = document.getElementById('horario');

    // A. Quando mudar a Disciplina: Busca o Schedule (Janela de Datas)
    disciplinaSelect.addEventListener('change', async function() {
        // Limpa campos dependentes
        dataInput.value = '';
        dataInput.disabled = true;
        horarioSelect.innerHTML = '<option value="">Selecione o horário</option>';
        horarioSelect.disabled = true;
        currentSchedule = null;

        const subjectId = this.value;
        if (!subjectId) return;

        const userData = JSON.parse(localStorage.getItem('userData'));
        
        // Usa o poloId que vem do login
        const poloId = userData.poloId;

        if (!poloId) {
            alert("Erro: Seu usuário não está vinculado a nenhum Polo. Entre em contato com a secretaria.");
            return;
        }

        try {
            // Busca Schedules para esse Polo + Disciplina
            const url = `http://localhost:8080/api/schedules?poloId=${poloId}&subjectId=${subjectId}`;
            const resp = await fetch(url, { headers: getAuthHeaders() });
            
            if(resp.ok) {
                const schedules = await resp.json();
                if (schedules.length > 0) {
                    // Pegamos o primeiro schedule válido
                    currentSchedule = schedules[0];
                    
                    // Habilita a data e define limites
                    dataInput.disabled = false;
                    dataInput.min = currentSchedule.startDate;
                    dataInput.max = currentSchedule.endDate;
                    
                    alert(`Disciplina disponível de ${formatarDataPTBR(currentSchedule.startDate)} até ${formatarDataPTBR(currentSchedule.endDate)}`);
                } else {
                    alert('Não há agenda cadastrada para esta disciplina no seu polo.');
                }
            }
        } catch (err) {
            console.error(err);
        }
    });

    // B. Quando mudar a Data: Busca os TimeSlots (Horários) para aquele dia da semana
    dataInput.addEventListener('change', async function() {
        horarioSelect.innerHTML = '<option value="">Carregando...</option>';
        horarioSelect.disabled = true;

        if (!this.value || !currentSchedule) return;

        const dateSelected = new Date(this.value);
        const diasSemana = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        
        // Ajuste de fuso horário simples para pegar o dia da semana correto da string YYYY-MM-DD
        const [y, m, d] = this.value.split('-');
        const dataObj = new Date(y, m - 1, d); 
        const dayStr = diasSemana[dataObj.getDay()];

        if (dayStr === 'sun') {
            alert('Não há agendamentos aos domingos.');
            horarioSelect.innerHTML = '<option value="">Selecione o horário</option>';
            return;
        }

        try {
            // Busca Slots
            const url = `http://localhost:8080/api/schedules/${currentSchedule.id}/timeslots?day=${dayStr}`;
            const resp = await fetch(url, { headers: getAuthHeaders() });
            
            if (resp.ok) {
                const slots = await resp.json();
                
                horarioSelect.innerHTML = '<option value="">Selecione o horário</option>';
                
                if (slots.length === 0) {
                    const option = document.createElement('option');
                    option.text = "Sem horários para este dia da semana";
                    horarioSelect.appendChild(option);
                } else {
                    slots.forEach(slot => {
                        const option = document.createElement('option');
                        // O backend retorna startTime "09:00:00", cortamos para "09:00"
                        const horaSimples = slot.startTime.substring(0, 5);
                        option.value = slot.startTime; // "09:00:00"
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

// 3. Função de Enviar Agendamento (Renomeada para evitar recursão)
async function enviarAgendamento() {
    const disciplinaId = document.getElementById('disciplina').value;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;

    if (!disciplinaId || !data || !horario) {
        alert('Preencha todos os campos!');
        return;
    }

    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Dados reais do usuário
    const poloId = userData.poloId;
    const studentId = userData.id;

    if (!poloId) {
        alert("Erro: Polo não identificado.");
        return;
    }

    const bookingDTO = {
        subjectId: disciplinaId,
        studentId: studentId,
        poloId: poloId,
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
            // Mostra mensagem de erro vinda do backend (ex: "Horário já lotado")
            alert(`Erro: ${err.detail || err.message || 'Falha ao agendar'}`);
            return;
        }

        alert('Agendamento realizado com sucesso!');
        // Limpa form
        document.getElementById('formAgendamento').reset();
        
        // Reseta estados visuais
        document.getElementById('data').disabled = true;
        document.getElementById('horario').disabled = true;
        document.getElementById('horario').innerHTML = '<option value="">Selecione o horário</option>';

        // Recarrega lista
        carregarMeusAgendamentos();

    } catch (err) {
        console.error(err);
        alert('Erro de conexão.');
    }
}

// 4. Carregar Agendamentos do Aluno (Lista da direita)
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
            
            if (bookings.length === 0) {
                container.innerHTML = '';
                if(emptyState) emptyState.style.display = 'block';
                document.getElementById('totalProvas').textContent = '0';
                return;
            }

            if(emptyState) emptyState.style.display = 'none';
            container.innerHTML = '';

            bookings.forEach(b => {
                const nomeDisc = b.subjectName || DISCIPLINAS[b.subjectId] || 'Disciplina';
                const dataF = formatarDataPTBR(b.date);
                const horaF = b.time ? b.time.substring(0, 5) : '--:--';
                
                const html = `
                    <div class="card mb-2 shadow-sm border-start border-4 border-primary" data-booking-id="${b.id}">
                        <div class="card-body py-2 d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="card-title mb-1 fw-bold">${nomeDisc}</h6>
                            <p class="card-text small text-muted mb-1">
                            <i class="bi bi-calendar-event me-1"></i> ${dataF} às ${horaF}
                            </p>
                            <span class="badge bg-success">${b.status || 'Confirmado'}</span>
                        </div>

                        <!-- Botão de apagar IGUAL ao admin -->
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-danger btn-cancel-booking"
                            data-booking-id="${b.id}"
                            title="Cancelar agendamento"
                        >
                            <i class="bi bi-trash"></i>
                        </button>
                        </div>
                    </div>
                    `;


                container.insertAdjacentHTML('beforeend', html);
            });
            
            // Atualiza contadores
            document.getElementById('totalProvas').textContent = bookings.length;
            // Atualiza contador de disciplinas únicas
            const discUnicas = new Set(bookings.map(b => b.subjectId));
            const divCount = document.getElementById('disciplinasCount');
            if(divCount) divCount.textContent = discUnicas.size;
        }
    } catch (err) {
        console.error(err);
    }
}
function setupCancelBookingListener() {
    const container = document.getElementById('provasAgendadas');
    if (!container) return;

    container.addEventListener('click', async function (e) {
        const btn = e.target.closest('.btn-cancel-booking');
        if (!btn) return;

        const bookingId = btn.getAttribute('data-booking-id');
        if (!bookingId) return;

        const confirmar = confirm('Tem certeza que deseja cancelar este agendamento?');
        if (!confirmar) return;

        try {
            const resp = await fetch(`http://localhost:8080/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (resp.status === 204) {
                // Recarrega a lista a partir da API
                await carregarMeusAgendamentos();
                alert('Agendamento cancelado com sucesso.');
            } else {
                let msg = 'Não foi possível cancelar o agendamento.';
                try {
                    const err = await resp.json();
                    msg = err.detail || err.message || msg;
                } catch (_) {
                    // se não tiver body, mantém a msg padrão
                }
                alert(msg);
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao cancelar o agendamento.');
        }
    });
}

// --- UTILITÁRIOS ---

function formatarDataPTBR(dataIso) {
    if(!dataIso) return '';
    const [y, m, d] = dataIso.split('-');
    return `${d}/${m}/${y}`;
}

// Expor função agendarProva para o HTML chamar no onsubmit
// Aqui fazemos a ligação segura para evitar recursão
window.agendarProva = function(e) {
    if(e) e.preventDefault();
    enviarAgendamento(); // Chama a função renomeada
};