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
});
document.addEventListener('DOMContentLoaded', function() {
    const filterButton = document.querySelector('.filter-button');
    const printButton = document.querySelector('.print-button');
    const searchInput = document.querySelector('#searchInput');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const tableBody = document.querySelector('.table-container tbody');

    // Sidebar navigation
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            if(this.textContent.includes('Configurações')){
                alert('Aqui você poderia abrir as configurações (tema, polo, etc).');
            }
        });
    });

    // Filtro real
    filterButton.addEventListener('click', function() {
        const query = searchInput.value.toLowerCase();
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });

    // Impressão só dos visíveis
    printButton.addEventListener('click', function() {
        const rows = Array.from(tableBody.querySelectorAll('tr'))
                          .filter(r => r.style.display !== 'none')
                          .map(r => r.outerHTML)
                          .join('');
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Relatório</title>');
        printWindow.document.write('<link rel="stylesheet" href="style.css">');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Relatório de Agendamentos</h1>');
        printWindow.document.write(`<table>${rows}</table>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    });

    // Modal de detalhes
    const modal = document.getElementById('detailsModal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.querySelector('.modal .close');

    document.querySelectorAll('.action-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const row = this.closest('tr');
            const dados = Array.from(row.children).map(td => td.textContent).join(' | ');
            modalContent.textContent = dados;
            modal.style.display = 'block';
        });
    });

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; }
});