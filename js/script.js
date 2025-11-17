document.addEventListener('DOMContentLoaded', function() {
    // Funcionalidade dos botões de navegação
    const navButtons = document.querySelectorAll('.nav-button');
    const portalSubtitle = document.querySelector('.portal-subtitle');
    
    if (navButtons.length > 0 && portalSubtitle) {
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
    }
});

// Lógica específica do Dashboard do Polo
document.addEventListener('DOMContentLoaded', function() {
    const filterButton = document.querySelector('.filter-button');
    const printButton = document.querySelector('.print-button');
    const searchInput = document.querySelector('#searchInput');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    // Seleciona a tabela pelo ID
    const tableBody = document.getElementById('poloReportTableBody');

    //FUNÇÃO PARA CARREGAR DADOS DO LOCALSTORAGE
    function carregarRelatoriosPolo() {
        if (!tableBody) return; // Sai se a tabela não for encontrada

        try {
            // Pega a lista de provas salvas pelo Admin
            const provasSalvas = JSON.parse(localStorage.getItem('listaProvasAdmin')) || [];

            // Se não houver provas, exibe uma mensagem
            if (provasSalvas.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhuma prova agendada pelo administrador.</td></tr>';
                return;
            }

            // Limpa o body da tabela antes de adicionar as novas linhas
            tableBody.innerHTML = ''; 

            // Itera sobre cada prova salva e cria uma linha na tabela
            provasSalvas.forEach(prova => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>(Não especificado)</td>
                    <td>${prova.disciplina}</td>
                    <td>(Não especificado)</td>
                    <td>${prova.infoHorario} (Polo: ${prova.polo})</td>
                    <td><span class="status confirmed">${prova.status}</span></td>
                `;
                tableBody.appendChild(tr);
            });

        } catch (error) {
            console.error("Erro ao carregar dados do localStorage:", error);
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Erro ao carregar relatórios.</td></tr>';
        }
    }

    // Chama a função para carregar os dados assim que a página carregar
    carregarRelatoriosPolo();


    // Sidebar navigation 
    if(sidebarItems.length > 0) {
        sidebarItems.forEach(item => {
            item.addEventListener('click', function() {
                sidebarItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                if(this.textContent.includes('Configurações')){
                    alert('Aqui você poderia abrir as configurações (tema, polo, etc).');
                }
            });
        });
    }

    // Filtro real 
    if (filterButton) {
        filterButton.addEventListener('click', function() {
            const query = searchInput.value.toLowerCase();
            const rows = tableBody.querySelectorAll('tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    // Impressão 
    if (printButton) {
        printButton.addEventListener('click', function() {
            const rows = Array.from(tableBody.querySelectorAll('tr'))
                              .filter(r => r.style.display !== 'none')
                              .map(r => r.outerHTML)
                              .join('');
            
            // Pega o cabeçalho da tabela
            const header = document.querySelector('.table-container thead').outerHTML;
            
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Relatório de Agendamentos</title>');
            printWindow.document.write(`
                <style>
                    body { font-family: 'Segoe UI', sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .status.confirmed { color: green; font-weight: bold; }
                    @media print {
                        .print-button { display: none; }
                    }
                </style>
            `);
            printWindow.document.write('</head><body>');
            printWindow.document.write('<h1>Relatório de Agendamentos</h1>');
            printWindow.document.write(`<table>${header}${rows}</table>`);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print(); // Abre a janela de impressão do navegador
        });
    }

    // Modal de detalhes
    const modal = document.getElementById('detailsModal');
    if (modal) {
        const modalContent = document.getElementById('modalContent');
        const closeBtn = document.querySelector('.modal .close');

        tableBody.addEventListener('click', function(e) {
            const row = e.target.closest('tr');
            if (row) {
                const dados = Array.from(row.children).map(td => td.textContent).join(' | ');
                modalContent.textContent = `Detalhes: ${dados}`;
                modal.style.display = 'block';
            }
        });

        if (closeBtn) {
            closeBtn.onclick = () => modal.style.display = 'none';
        }
        window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; }
    }
});