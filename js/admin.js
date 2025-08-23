// Sistema Administrativo UNIFAA - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    setupAdminEventListeners();
    loadDashboardData();
});

function initializeAdmin() {
    // Configurar navegação da sidebar
    setupSidebarNavigation();
    
    // Configurar gráficos e estatísticas
    setupCharts();
    
    // Configurar filtros e pesquisa
    setupFilters();
}

function setupAdminEventListeners() {
    // Navegação da sidebar
    const sidebarLinks = document.querySelectorAll('.list-group-item');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', handleSidebarNavigation);
    });
    
    // Botões de ação nas tabelas
    const actionButtons = document.querySelectorAll('.btn-outline-primary, .btn-outline-warning, .btn-outline-danger');
    actionButtons.forEach(button => {
        button.addEventListener('click', handleTableAction);
    });
    
    // Formulários de configuração
    const configForms = document.querySelectorAll('form');
    configForms.forEach(form => {
        form.addEventListener('submit', handleConfigSubmit);
    });
}

function setupSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.list-group-item');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover classe active de todos os links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            
            // Adicionar classe active ao link clicado
            this.classList.add('active');
            
            // Obter o ID da seção
            const targetId = this.getAttribute('href').substring(1);
            
            // Mostrar/ocultar conteúdo
            showAdminSection(targetId);
        });
    });
}

function showAdminSection(sectionId) {
    // Ocultar todas as seções
    const allSections = document.querySelectorAll('[id$="-content"]');
    allSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar seção específica
    const targetSection = document.getElementById(sectionId + '-content');
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('fade-in');
    } else {
        // Se não existe seção específica, mostrar dashboard
        document.getElementById('dashboard-content').style.display = 'block';
        
        // Simular carregamento de dados para diferentes seções
        loadSectionData(sectionId);
    }
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'agendamentos':
            loadAgendamentosData();
            break;
        case 'disciplinas':
            loadDisciplinasData();
            break;
        case 'professores':
            loadProfessoresData();
            break;
        case 'alunos':
            loadAlunosData();
            break;
        case 'relatorios':
            loadRelatoriosData();
            break;
        case 'configuracoes':
            showConfigSection();
            break;
        default:
            loadDashboardData();
    }
}

function loadDashboardData() {
    // Simular carregamento de dados do dashboard
    updateStatistics();
    updateRecentAppointments();
}

function updateStatistics() {
    // Simular dados dinâmicos
    const stats = {
        agendamentosHoje: Math.floor(Math.random() * 200) + 100,
        alunosAtivos: Math.floor(Math.random() * 500) + 1000,
        disciplinas: 42,
        professores: 28
    };
    
    // Atualizar cards de estatísticas com animação
    animateCounter('.card-custom h3', stats.agendamentosHoje, 0);
}

function animateCounter(selector, target, current) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;
    
    const increment = target / 50;
    
    if (current < target) {
        elements[0].textContent = Math.floor(current);
        setTimeout(() => animateCounter(selector, target, current + increment), 20);
    } else {
        elements[0].textContent = target;
    }
}

function loadAgendamentosData() {
    showNotification('Carregando dados de agendamentos...', 'info');
    
    // Simular carregamento
    setTimeout(() => {
        const dashboardContent = document.getElementById('dashboard-content');
        dashboardContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Gerenciar Agendamentos</h2>
                <div>
                    <button class="btn btn-primary-custom me-2">
                        <i class="bi bi-funnel me-1"></i>Filtrar
                    </button>
                    <button class="btn btn-success">
                        <i class="bi bi-plus-circle me-1"></i>Novo Agendamento
                    </button>
                </div>
            </div>
            
            <div class="card card-custom">
                <div class="card-header card-header-custom">
                    <h4 class="card-title">
                        <i class="bi bi-calendar-check me-2"></i>Todos os Agendamentos
                    </h4>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Aluno</th>
                                    <th>Disciplina</th>
                                    <th>Professor</th>
                                    <th>Data/Hora</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${generateAgendamentosTable()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        showNotification('Dados carregados com sucesso!', 'success');
    }, 1000);
}

function generateAgendamentosTable() {
    const agendamentos = [
        { id: 1, aluno: 'João Silva', disciplina: 'Matemática', professor: 'Prof. Carlos', data: '15/12/2024 08:00', status: 'Confirmado' },
        { id: 2, aluno: 'Maria Santos', disciplina: 'Física', professor: 'Prof. Ana', data: '16/12/2024 14:00', status: 'Pendente' },
        { id: 3, aluno: 'Pedro Costa', disciplina: 'Química', professor: 'Prof. Roberto', data: '17/12/2024 10:00', status: 'Confirmado' },
        { id: 4, aluno: 'Ana Oliveira', disciplina: 'Biologia', professor: 'Prof. Dra. Ana', data: '18/12/2024 16:00', status: 'Cancelado' },
        { id: 5, aluno: 'Carlos Lima', disciplina: 'História', professor: 'Prof. Maria', data: '19/12/2024 09:00', status: 'Confirmado' }
    ];
    
    return agendamentos.map(ag => `
        <tr>
            <td>#${ag.id.toString().padStart(3, '0')}</td>
            <td>${ag.aluno}</td>
            <td>${ag.disciplina}</td>
            <td>${ag.professor}</td>
            <td>${ag.data}</td>
            <td><span class="status-badge status-${ag.status.toLowerCase()}">${ag.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" title="Visualizar">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="Excluir">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function showConfigSection() {
    const configContent = document.getElementById('configuracoes-content');
    if (configContent) {
        configContent.style.display = 'block';
        configContent.classList.add('fade-in');
    }
}

function handleTableAction(e) {
    const button = e.target.closest('button');
    const row = button.closest('tr');
    const aluno = row.cells[1].textContent;
    
    if (button.classList.contains('btn-outline-primary')) {
        // Visualizar
        showNotification(`Visualizando dados de ${aluno}`, 'info');
    } else if (button.classList.contains('btn-outline-warning')) {
        // Editar
        showNotification(`Editando agendamento de ${aluno}`, 'info');
    } else if (button.classList.contains('btn-outline-danger')) {
        // Excluir
        if (confirm(`Tem certeza que deseja excluir o agendamento de ${aluno}?`)) {
            row.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                row.remove();
                showNotification(`Agendamento de ${aluno} excluído com sucesso!`, 'success');
            }, 500);
        }
    }
}

function handleConfigSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Simular salvamento
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    submitButton.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Salvando...
    `;
    submitButton.disabled = true;
    
    setTimeout(() => {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        showNotification('Configurações salvas com sucesso!', 'success');
    }, 2000);
}

function setupCharts() {
    // Placeholder para gráficos futuros
    console.log('Configurando gráficos...');
}

function setupFilters() {
    // Placeholder para filtros
    console.log('Configurando filtros...');
}

function loadDisciplinasData() {
    showNotification('Funcionalidade de disciplinas em desenvolvimento', 'info');
}

function loadProfessoresData() {
    showNotification('Funcionalidade de professores em desenvolvimento', 'info');
}

function loadAlunosData() {
    showNotification('Funcionalidade de alunos em desenvolvimento', 'info');
}

function loadRelatoriosData() {
    showNotification('Funcionalidade de relatórios em desenvolvimento', 'info');
}

function updateRecentAppointments() {
    // Atualizar tabela de agendamentos recentes
    const tbody = document.querySelector('tbody');
    if (tbody) {
        // Adicionar efeito de loading
        tbody.style.opacity = '0.5';
        
        setTimeout(() => {
            tbody.style.opacity = '1';
        }, 500);
    }
}

// Função para exportar relatórios
function exportReport(format) {
    showNotification(`Exportando relatório em formato ${format.toUpperCase()}...`, 'info');
    
    setTimeout(() => {
        showNotification('Relatório exportado com sucesso!', 'success');
    }, 2000);
}

// Função para backup de dados
function backupData() {
    showNotification('Iniciando backup dos dados...', 'info');
    
    setTimeout(() => {
        showNotification('Backup realizado com sucesso!', 'success');
    }, 3000);
}

// Utilitário para notificações (reutilizando do main.js)
function showNotification(message, type = 'info') {
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
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Adicionar estilos específicos para admin
const adminStyle = document.createElement('style');
adminStyle.textContent = `
    .status-confirmado {
        background: #d4edda;
        color: #155724;
    }
    
    .status-cancelado {
        background: #f8d7da;
        color: #721c24;
    }
    
    .list-group-item {
        border: none;
        padding: 1rem 1.5rem;
        transition: all 0.3s ease;
    }
    
    .list-group-item:hover {
        background-color: #f8f9fa;
        transform: translateX(5px);
    }
    
    .list-group-item.active {
        background: linear-gradient(135deg, #0fab95 0%, #00a8cf 100%);
        color: white;
        border-radius: 0 25px 25px 0;
    }
    
    .table th {
        border-top: none;
        font-weight: 600;
        color: #4e5155;
    }
    
    .table-hover tbody tr:hover {
        background-color: rgba(15, 171, 149, 0.05);
    }
`;
document.head.appendChild(adminStyle);

