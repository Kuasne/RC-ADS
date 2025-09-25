// Sistema de Agendamento UNIFAA - JavaScript Principal

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização
    initializeApp();
    
    // Event Listeners
    setupEventListeners();
    
    // Animações
    setupAnimations();
});

document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...

    // Modo Daltonismo (Deuteranopia) - Funciona em todas as telas
    const btnDaltonismo = document.getElementById('deuteranopia-toggle');
    if (btnDaltonismo) {
        btnDaltonismo.addEventListener('click', function () {
            document.body.classList.toggle('deuteranopia-mode');
        });
    }

    // Login do polo
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const usuario = document.getElementById('username').value.trim();
            const senha = document.getElementById('password').value.trim();
            if (usuario === "polo" && senha === "123") {
                window.location.href = "dashboardpolo.html";
            } else {
                alert("Usuário ou senha inválidos!");
            }
        });
    }

    // ...existing code...
});

function initializeApp() {
    // Configurar data mínima para agendamento (hoje)
    const dataInput = document.getElementById('data');
    if (dataInput) {
        const hoje = new Date().toISOString().split('T')[0];
        dataInput.min = hoje;
    }
    
    // Verificar se está na página de login
    if (document.getElementById('loginForm')) {
        setupLogin();
    }
    
    // Verificar se está na página do dashboard
    if (document.getElementById('agendamentoForm')) {
        setupDashboard();
    }
}

function setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Agendamento Form
    const agendamentoForm = document.getElementById('agendamentoForm');
    if (agendamentoForm) {
        agendamentoForm.addEventListener('submit', handleAgendamento);
    }
    
    // Botão Limpar
    const btnLimpar = document.querySelector('.btn-outline-custom');
    if (btnLimpar && btnLimpar.textContent.includes('Limpar')) {
        btnLimpar.addEventListener('click', limparFormulario);
    }
    
    // Links de navegação suave
    setupSmoothScrolling();
}

function setupLogin() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    // Auto-completar para demonstração
    if (usernameInput && passwordInput) {
        usernameInput.value = 'aluno';
        passwordInput.value = '123';
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const btnLogin = document.querySelector('.btn-login');
    const btnText = btnLogin.querySelector('.btn-text');
    const btnLoader = btnLogin.querySelector('.btn-loader');
    
    // Mostrar loading
    btnText.classList.add('d-none');
    btnLoader.classList.remove('d-none');
    btnLogin.disabled = true;
    
    // Simular verificação de login
    setTimeout(() => {
        if (username === 'aluno' && password === '123') {
            // Login bem-sucedido
            showNotification('Login realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            // Login falhou
            showNotification('Usuário ou senha incorretos!', 'error');
            btnText.classList.remove('d-none');
            btnLoader.classList.add('d-none');
            btnLogin.disabled = false;
        }
    }, 1500);
}

function setupDashboard() {
    // Configurar professores baseado na disciplina selecionada
    const disciplinaSelect = document.getElementById('disciplina');
    const professorSelect = document.getElementById('professor');
    
    if (disciplinaSelect && professorSelect) {
        disciplinaSelect.addEventListener('change', function() {
            updateProfessores(this.value);
        });
    }
}

function updateProfessores(disciplina) {
    const professorSelect = document.getElementById('professor');
    const professores = {
        'matematica': [
            { value: 'prof1', text: 'Prof. Dr. João Silva' },
            { value: 'prof2', text: 'Prof. Dra. Maria Santos' }
        ],
        'fisica': [
            { value: 'prof2', text: 'Prof. Dra. Maria Santos' },
            { value: 'prof3', text: 'Prof. Carlos Oliveira' }
        ],
        'quimica': [
            { value: 'prof3', text: 'Prof. Carlos Oliveira' },
            { value: 'prof4', text: 'Prof. Dra. Ana Costa' }
        ],
        'biologia': [
            { value: 'prof4', text: 'Prof. Dra. Ana Costa' },
            { value: 'prof1', text: 'Prof. Dr. João Silva' }
        ],
        'historia': [
            { value: 'prof2', text: 'Prof. Dra. Maria Santos' },
            { value: 'prof4', text: 'Prof. Dra. Ana Costa' }
        ],
        'portugues': [
            { value: 'prof1', text: 'Prof. Dr. João Silva' },
            { value: 'prof3', text: 'Prof. Carlos Oliveira' }
        ]
    };
    
    // Limpar opções atuais
    professorSelect.innerHTML = '<option value="">Selecione o professor</option>';
    
    // Adicionar professores da disciplina selecionada
    if (disciplina && professores[disciplina]) {
        professores[disciplina].forEach(prof => {
            const option = document.createElement('option');
            option.value = prof.value;
            option.textContent = prof.text;
            professorSelect.appendChild(option);
        });
    }
}

function handleAgendamento(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const agendamento = {
        disciplina: document.getElementById('disciplina').selectedOptions[0].text,
        professor: document.getElementById('professor').selectedOptions[0].text,
        data: document.getElementById('data').value,
        horario: document.getElementById('horario').selectedOptions[0].text,
        observacoes: document.getElementById('observacoes').value
    };
    
    // Validar dados
    if (!agendamento.disciplina || !agendamento.professor || !agendamento.data || !agendamento.horario) {
        showNotification('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    // Simular salvamento
    showLoadingButton(e.submitter);
    
    setTimeout(() => {
        // Adicionar à lista de provas agendadas
        adicionarProvaAgendada(agendamento);
        
        // Mostrar modal de confirmação
        mostrarConfirmacao(agendamento);
        
        // Limpar formulário
        limparFormulario();
        
        // Restaurar botão
        restoreButton(e.submitter);
        
        showNotification('Prova agendada com sucesso!', 'success');
    }, 2000);
}

function adicionarProvaAgendada(agendamento) {
    const provasContainer = document.getElementById('provasAgendadas');
    if (!provasContainer) return;
    
    const dataFormatada = formatarData(agendamento.data);
    
    const examItem = document.createElement('div');
    examItem.className = 'exam-item fade-in';
    examItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h5 class="exam-title">${agendamento.disciplina}</h5>
                <p class="exam-details mb-1">
                    <i class="bi bi-person me-1"></i>${agendamento.professor}<br>
                    <i class="bi bi-calendar me-1"></i>${dataFormatada} - ${agendamento.horario}<br>
                    <i class="bi bi-geo-alt me-1"></i>A definir
                </p>
            </div>
            <div class="text-end">
                <span class="status-badge status-pendente">Pendente</span>
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-custom me-1" onclick="editarProva(this)">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="excluirProva(this)">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    provasContainer.insertBefore(examItem, provasContainer.firstChild);
}

function mostrarConfirmacao(agendamento) {
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const detailsContainer = document.getElementById('confirmDetails');
    
    const dataFormatada = formatarData(agendamento.data);
    
    detailsContainer.innerHTML = `
        <div class="text-start">
            <p><strong>Disciplina:</strong> ${agendamento.disciplina}</p>
            <p><strong>Professor:</strong> ${agendamento.professor}</p>
            <p><strong>Data e Horário:</strong> ${dataFormatada} - ${agendamento.horario}</p>
            ${agendamento.observacoes ? `<p><strong>Observações:</strong> ${agendamento.observacoes}</p>` : ''}
        </div>
    `;
    
    modal.show();
}

function limparFormulario() {
    const form = document.getElementById('agendamentoForm');
    if (form) {
        form.reset();



        // Resetar select de professores
        const professorSelect = document.getElementById('professor');
        if (professorSelect) {
            professorSelect.innerHTML = '<option value="">Selecione o professor</option>';
        }
    }
}

function editarProva(button) {
    const examItem = button.closest('.exam-item');
    const titulo = examItem.querySelector('.exam-title').textContent;
    
    showNotification(`Funcionalidade de edição para "${titulo}" em desenvolvimento`, 'info');
}

function excluirProva(button) {
    const examItem = button.closest('.exam-item');
    const titulo = examItem.querySelector('.exam-title').textContent;
    
    if (confirm(`Tem certeza que deseja excluir o agendamento de "${titulo}"?`)) {
        examItem.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
            examItem.remove();
            showNotification('Agendamento excluído com sucesso!', 'success');
        }, 500);
    }
}

function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupAnimations() {
    // Intersection Observer para animações
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos que devem ser animados
    const animatedElements = document.querySelectorAll('.card-custom, .exam-item');
    animatedElements.forEach(el => observer.observe(el));
}

function showLoadingButton(button) {
    const originalText = button.innerHTML;
    button.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        Agendando...
    `;
    button.disabled = true;
    button.dataset.originalText = originalText;
}

function restoreButton(button) {
    button.innerHTML = button.dataset.originalText;
    button.disabled = false;
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    `;
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function formatarData(dataString) {
    const data = new Date(dataString + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Utilitários para validação
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarTelefone(telefone) {
    const regex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return regex.test(telefone);
}

// Função para mascarar inputs
function aplicarMascaras() {
    const telefoneInputs = document.querySelectorAll('input[type="tel"]');
    
    telefoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
                value = value.replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3');
            }
            
            e.target.value = value;
        });
    });
}

// Inicializar máscaras quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', aplicarMascaras);

// Função para exportar dados (futura implementação)
function exportarDados(formato = 'json') {
    const dados = {
        agendamentos: [],
        timestamp: new Date().toISOString()
    };
    
    // Coletar dados dos agendamentos
    const examItems = document.querySelectorAll('.exam-item');
    examItems.forEach(item => {
        const titulo = item.querySelector('.exam-title').textContent;
        const detalhes = item.querySelector('.exam-details').textContent;
        
        dados.agendamentos.push({
            disciplina: titulo,
            detalhes: detalhes.trim()
        });
    });
    
    console.log('Dados para exportação:', dados);
    showNotification('Funcionalidade de exportação em desenvolvimento', 'info');
}

// Adicionar CSS para animações personalizadas
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-20px);
        }
    }
    
    .notification-enter {
        animation: slideInRight 0.3s ease-out;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

