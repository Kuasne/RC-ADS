// js/portal.js

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const navButtons = document.querySelectorAll('.nav-button');

let selectedRole = document.querySelector('.nav-button.active')?.dataset.role || 'aluno';

function applyRole(role) {
  selectedRole = role;
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.role === role));
  usernameInput.value = '';
  passwordInput.value = '';
  hideError();
}

navButtons.forEach(btn => {
  btn.addEventListener('click', function () {
    applyRole(this.dataset.role);
  });
});

function showError(msg) {
  loginError.textContent = msg;
  loginError.style.display = 'block';
}

function hideError() {
  loginError.textContent = '';
  loginError.style.display = 'none';
}

loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  hideError();

  const email = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError('Preencha todos os campos.');
    return;
  }

  const btn = loginForm.querySelector('button');
  const originalText = btn.textContent;
  btn.textContent = 'Entrando...';
  btn.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.id);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userType', data.type);

      if (data.type === 'STUDENT') window.location.href = 'dashboard.html';
      else if (data.type === 'ADMIN') window.location.href = 'admin.html';
      else if (data.type === 'POLO') window.location.href = 'dashboardpolo.html';
      else showError('Usuário desconhecido.');

    } else {
      showError('Credenciais inválidas.');
    }
  } catch (error) {
    console.error(error);
    showError('Erro de conexão com o servidor.');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});