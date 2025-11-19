const PRESETS = {
  aluno: 'E123',
  administrativo: 'A123',
  polo: 'P123'
};

// Mapeamento entre o "data-role" do botão HTML e o "type" que vem do Backend (Java)
const ROLE_MAP = {
  'aluno': 'STUDENT',
  'administrativo': 'ADMIN',
  'polo': 'POLO'
};

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const navButtons = document.querySelectorAll('.nav-button');

// Estado inicial: pega o botão que já está com a classe active no HTML
let selectedRole = document.querySelector('.nav-button.active')?.dataset.role || 'aluno';

// Função para aplicar role e preencher username (para testes)
function applyRole(role) {
  selectedRole = role;
  
  // Atualiza visualmente os botões
  navButtons.forEach(b => {
    if (b.dataset.role === role) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  // Preenche para facilitar o teste (pode remover em produção)
  usernameInput.value = PRESETS[role] || '';
  passwordInput.value = '';
  hideError();
}

// Listeners dos botões de navegação (Estudante, Adm, Polo)
navButtons.forEach(btn => {
  btn.addEventListener('click', function () {
    // Ao clicar, atualizamos a variável selectedRole com o data-role do botão
    applyRole(this.dataset.role);
  });
});

// Inicializa
document.addEventListener('DOMContentLoaded', () => applyRole(selectedRole));

function showError(msg) {
  loginError.textContent = msg;
  loginError.style.display = 'block';
  // Adiciona uma animação visual de erro
  loginError.classList.add('fade-in');
}

function hideError() {
  loginError.textContent = '';
  loginError.style.display = 'none';
}

// --- Lógica de Login ---
loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  hideError();

  const email = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError('Por favor, preencha usuário e senha.');
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password }) 
    });

    if (!response.ok) {
      // Se for 401 ou 403
      showError('Usuário ou senha inválidos.');
      return;
    }

    // Recebe a resposta do Backend (AuthResponse)
    const data = await response.json(); 
    // data contém: { token: "...", type: "ADMIN", ... }

    // --- VALIDAÇÃO DE SEGURANÇA DO PORTAL ---
    
    // 1. Descobre qual tipo de usuário o Backend retornou
    const userTypeFromBackend = data.type; // Ex: 'ADMIN', 'STUDENT', 'POLO'

    // 2. Descobre qual tipo o usuário ESTÁ TENTANDO acessar (baseado no botão clicado)
    const expectedType = ROLE_MAP[selectedRole]; // Converte 'aluno' para 'STUDENT'

    // 3. Compara se coincidem
    if (userTypeFromBackend !== expectedType) {
        // Se não bater, bloqueia o acesso
        showError(`Acesso negado! Esta conta é de ${traduzirRole(userTypeFromBackend)} e não pode logar na aba de ${traduzirRole(expectedType)}.`);
        
        // Opcional: Limpar o token que acabou de ser gerado para não deixar rastro
        localStorage.removeItem('authToken');
        return; 
    }

    // Se chegou aqui, o tipo está correto. Salva e redireciona.
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data));

    // Redirecionamento
    switch (data.type) {
      case 'STUDENT':
        window.location.href = 'dashboard.html';
        break;
      case 'ADMIN':
        window.location.href = 'admin.html';
        break;
      case 'POLO':
        window.location.href = 'dashboardpolo.html';
        break;
      default:
        showError('Tipo de usuário desconhecido.');
    }

  } catch (err) {
    console.error('Erro ao tentar logar:', err);
    showError('Erro de conexão com o servidor.');
  }
});

// Função auxiliar apenas para deixar a mensagem de erro mais bonita
function traduzirRole(role) {
    const dicionario = {
        'STUDENT': 'Estudante',
        'ADMIN': 'Administrativo',
        'POLO': 'Polo'
    };
    return dicionario[role] || role;
}