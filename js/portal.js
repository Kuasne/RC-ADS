const PRESETS = {
  aluno: 'E123',
  administrativo: 'A123',
  polo: 'P123'
};
const DEFAULT_PASSWORD = '123';

// elementos
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const navButtons = document.querySelectorAll('.nav-button');

// estado inicial
let selectedRole = document.querySelector('.nav-button.active')?.dataset.role || 'aluno';

// função para aplicar role e preencher username
function applyRole(role) {
  selectedRole = role;
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.role === role));
  usernameInput.value = PRESETS[role];
  passwordInput.value = '';
  hideError();
}

// listeners dos botões
navButtons.forEach(btn => {
  btn.addEventListener('click', function () {
    applyRole(this.dataset.role);
  });
});

// inicializa
document.addEventListener('DOMContentLoaded', () => applyRole(selectedRole));

function showError(msg) {
  loginError.textContent = msg;
  loginError.style.display = 'block';
}
function hideError() {
  loginError.textContent = '';
  loginError.style.display = 'none';
}

// submit com validação
// Em: js/portal.js

loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  hideError();

  // 1. Pegue os valores REAIS do formulário
  // O usuário não deve digitar 'E123', mas sim seu email real.
  const email = usernameInput.value.trim(); // O campo username agora é para email
  const password = passwordInput.value;
  
  // Dica: Para testar o admin, digite:
  // Email: admin@unifaa.edu.br
  // Senha: RealChallengeUNIFAA

  // 2. Chame a API de Login da 'dev-lais'
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // O backend espera um LoginRequestDTO
      body: JSON.stringify({ email: email, password: password }) 
    });

    if (!response.ok) {
      showError('Email ou senha inválidos.');
      return;
    }

    // 3. Receba a AuthResponse
    const data = await response.json(); // Contém data.token, data.id, data.type

    // 4. SALVE O TOKEN! Este é o passo mais importante.
    localStorage.setItem('authToken', data.token);
    // Salve também os dados do usuário para usar nas telas
    localStorage.setItem('userData', JSON.stringify(data));

    // 5. Redirecione baseado no TIPO (role) vindo do backend
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