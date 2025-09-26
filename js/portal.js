let selectedRole = "aluno";

document.querySelectorAll(".nav-button").forEach(btn => {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".nav-button").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    selectedRole = this.dataset.role;

    // Atualiza o campo de usuário com o valor pré-definido
    const usernameInput = document.getElementById("username");
    if (selectedRole === "aluno") {
      usernameInput.value = "E123";
    } else if (selectedRole === "administrativo") {
      usernameInput.value = "A123";
    } else if (selectedRole === "polo") {
      usernameInput.value = "P123";
    }
  });
});

// Redirecionar no login com validação
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const usernameInput = document.getElementById("username").value;
  const passwordInput = document.getElementById("password").value;

  const firstLetter = usernameInput.charAt(0).toUpperCase();
  const defaultPassword = "123";

  if (passwordInput !== defaultPassword) {
      alert("Senha incorreta. Por favor, tente novamente.");
      return;
  }

  let isValid = false;
  let redirectPage = "";

  if (selectedRole === "aluno") {
    if (firstLetter === "E" && usernameInput.length > 1) {
      isValid = true;
      redirectPage = "dashboard.html";
    }
  } else if (selectedRole === "administrativo") {
    if (firstLetter === "A" && usernameInput.length > 1) {
      isValid = true;
      redirectPage = "admin.html";
    }
  } else if (selectedRole === "polo") {
    if (firstLetter === "P" && usernameInput.length > 1) {
      isValid = true;
      redirectPage = "dashboardpolo.html";
    }
  }

  if (isValid) {
    window.location.href = redirectPage;
  } else {
    alert("Nome de usuário inválido para o tipo de perfil selecionado. Por favor, verifique.");
  }
});