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
loginForm.addEventListener('submit', function (e) {
  e.preventDefault();
  hideError();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (password !== DEFAULT_PASSWORD) {
    showError('Senha incorreta. Use a senha padrão "123".');
    return;
  }

  const expected = PRESETS[selectedRole];
  if (username !== expected) {
    showError(`Usuário inválido para o perfil selecionado. Esperado: ${expected}`);
    return;
  }

  // redireciona
  if (selectedRole === 'aluno') {
    window.location.href = 'dashboard.html';
  } else if (selectedRole === 'administrativo') {
    window.location.href = 'admin.html';
  } else if (selectedRole === 'polo') {
    window.location.href = 'dashboardpolo.html';
  }
});
