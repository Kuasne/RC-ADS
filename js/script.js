document.addEventListener('DOMContentLoaded', function() {
    // Funcionalidade dos botões de navegação
    const navButtons = document.querySelectorAll('.nav-button');
    const portalSubtitle = document.querySelector('.portal-subtitle');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove a classe 'active' de todos os botões
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona a classe 'active' ao botão clicado
            this.classList.add('active');
            
            // Atualiza o subtítulo baseado no botão selecionado
            const buttonText = this.textContent;
            switch(buttonText) {
                case 'Aluno':
                    portalSubtitle.textContent = 'Portal do Aluno';
                    break;
                case 'Administrativo':
                    portalSubtitle.textContent = 'Portal Administrativo';
                    break;
                case 'Polo':
                    portalSubtitle.textContent = 'Portal do Polo';
                    break;
            }
        });
    });
    
    // Funcionalidade do formulário de login
    const loginForm = document.querySelector('.login-form');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username && password) {
            alert('Login realizado com sucesso!');
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });
    
    // Funcionalidade do link "Esqueci minha senha"
    const forgotPasswordLink = document.querySelector('.forgot-password');
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Funcionalidade de recuperação de senha em desenvolvimento.');
    });
});
