document.addEventListener('DOMContentLoaded', function () {
  
  // --- 1. LÓGICA DA SIDEBAR  ---
  const sidebarLinks = document.querySelectorAll(
    '.sidebar-nav .list-group-item'
  );
  const contentSections = document.querySelectorAll(
    '.main-content > div[id$="-content"]'
  );

  // Função para mostrar a seção correta
  function showSection(targetId) {
    contentSections.forEach((section) => {
      section.style.display = 'none';
    });
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.style.display = 'block';
    } else {
      document.getElementById('agendamentos-content').style.display = 'block';
    }
  }

  // Adicionar eventos de clique aos links da sidebar
  sidebarLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      sidebarLinks.forEach((l) => l.classList.remove('active'));
      this.classList.add('active');
      const targetId = this.getAttribute('href').substring(1) + '-content';
      showSection(targetId);
    });
  });

  // Mostrar a seção ativa inicial
  showSection('agendamentos-content');

  
  // --- LÓGICA DO FORMULÁRIO DE AGENDAMENTO ---
  
  const form = document.getElementById('agendamentoAdminForm');
  const listaProvas = document.getElementById('provasAgendadasList');
  const horarioGrid = document.querySelector('.horario-grid');
  
  // Carregar provas salvas no localStorage ao iniciar
  carregarProvasSalvas();

  // "Ouvinte" de evento para o envio do formulário
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Impede o recarregamento da página

    // 1. Obter os dados do formulário
    const disciplinaSelect = document.getElementById('disciplinaAdmin');
    const poloSelect = document.getElementById('poloAdmin');
    const dataInicioInput = document.getElementById('dataInicio');
    const dataFimInput = document.getElementById('dataFim');
    
    // Validação
    const primeiroDiaAtivo = form.querySelector('.horario-dia-row:not(.dia-desativado)');
    if (!primeiroDiaAtivo) {
      alert('Você deve habilitar pelo menos um dia da semana para salvar.');
      return;
    }

    // Pegar o TEXTO da opção selecionada
    const disciplinaTexto =
      disciplinaSelect.options[disciplinaSelect.selectedIndex].text;
    const poloTexto = poloSelect.options[poloSelect.selectedIndex].text;

    // --- Formatar as duas datas ---
    const dataInicioFormatada = formatarData(dataInicioInput.value);
    const dataFimFormatada = formatarData(dataFimInput.value);
    
    // Criar o novo texto de informação (Período)
    const infoHorario = `de ${dataInicioFormatada} a ${dataFimFormatada}`;

    // 2. Criar o objeto da prova
    const novaProva = {
      id: Date.now(),
      disciplina: disciplinaTexto,
      polo: poloTexto,
      infoHorario: infoHorario,
      status: "Agendado"
    };

    // 3. Adicionar a prova na lista (HTML)
    adicionarProvaNaListaHTML(novaProva);

    // 4. Salvar no localStorage
    salvarProvaNoStorage(novaProva);

    // 5. Limpar o formulário
    form.reset();

    // 6. Reativar todos os dias que foram desativados
    document.querySelectorAll('.horario-dia-row.dia-desativado').forEach(row => {
      row.classList.remove('dia-desativado');
      row.querySelectorAll('select').forEach(s => s.disabled = false);
    });
  });

  // --- LÓGICA PARA EXCLUIR ITENS DA LISTA  ---
  
  listaProvas.addEventListener('click', function(e) {
    const botaoExcluir = e.target.closest('.btn-delete-prova');
    
    if (botaoExcluir) {
      const itemParaRemover = botaoExcluir.closest('.prova-item');
      if (itemParaRemover) {
        
        // Remove do localStorage
        const idParaRemover = itemParaRemover.dataset.id;
        removerProvaDoStorage(idParaRemover);

        // Remove da tela
        itemParaRemover.remove();
      }
    }
  });


  // --- LÓGICA PARA ATIVAR/DESATIVAR DIAS NO GRID  ---
  
  horarioGrid.addEventListener('click', function(e) {
    const lixeira = e.target.closest('.bi-trash');
    const adicionar = e.target.closest('.bi-calendar-plus');

    // Se clicou na Lixeira
    if (lixeira) {
      const row = lixeira.closest('.horario-dia-row');
      if (row) {
        row.classList.add('dia-desativado');
        row.querySelectorAll('select.form-select-time').forEach(s => s.disabled = true);
      }
    }

    // Se clicou no "Adicionar"
    if (adicionar) {
      const row = adicionar.closest('.horario-dia-row');
      if (row) {
        row.classList.remove('dia-desativado');
        row.querySelectorAll('select.form-select-time').forEach(s => s.disabled = false);
      }
    }
  });
  

  // --- FUNÇÕES AUXILIARES ---

  /**
   * Cria o HTML para um novo item de prova e o insere na lista.
   * @param {object} prova - O objeto da prova a ser renderizado.
   */
  function adicionarProvaNaListaHTML(prova) {
    const novoItemHTML = `
      <div class="prova-item" data-id="${prova.id}">
        <div class="prova-item-details">
          <h5 class="prova-title">${prova.disciplina}</h5>
          <div class="prova-meta">
            <span><i class="bi bi-calendar"></i> ${prova.infoHorario}</span> 
            <span><i class="bi bi-geo-alt"></i> ${prova.polo}</span>
          </div>
        </div>
        <div class="prova-item-actions">
          <span class="prova-item-badge">${prova.status}</span>
          <button class="btn-delete-prova">
            <i class="bi bi-trash-fill"></i>
          </button>
        </div>
      </div>
    `;
    
    listaProvas.insertAdjacentHTML('beforeend', novoItemHTML);
  }

  /**
   * Salva um objeto de prova no localStorage.
   * @param {object} prova - O objeto da prova a ser salvo.
   */
  function salvarProvaNoStorage(prova) {
    try {
      const provasSalvas = JSON.parse(localStorage.getItem('listaProvasAdmin')) || [];
      provasSalvas.push(prova);
      localStorage.setItem('listaProvasAdmin', JSON.stringify(provasSalvas));
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
    }
  }

  /**
   * Remove uma prova do localStorage pelo ID.
   * @param {string} id - O ID da prova a ser removida.
   */
  function removerProvaDoStorage(id) {
    try {
      const provasSalvas = JSON.parse(localStorage.getItem('listaProvasAdmin')) || [];
      const provasAtualizadas = provasSalvas.filter(prova => prova.id.toString() !== id);
      localStorage.setItem('listaProvasAdmin', JSON.stringify(provasAtualizadas));
    } catch (error) {
      console.error("Erro ao remover do localStorage:", error);
    }
  }

  /**
   * Carrega e exibe as provas já salvas no localStorage.
   */
  function carregarProvasSalvas() {
    try {
      const provasSalvas = JSON.parse(localStorage.getItem('listaProvasAdmin')) || [];
      listaProvas.innerHTML = ''; // Limpa a lista antes de carregar
      provasSalvas.forEach(prova => {
        adicionarProvaNaListaHTML(prova);
      });
    } catch (error) {
      console.error("Erro ao carregar provas do localStorage:", error);
    }
  }

  /**
   * Converte uma data do formato 'YYYY-MM-DD' para 'DD/MM/YYYY'.
   */
  function formatarData(dataString) {
    if (!dataString) return '';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  
});