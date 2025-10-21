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

  // "Ouvinte" de evento para o envio do formulário
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Impede o recarregamento da página

    // 1. Obter os dados do formulário
    const disciplinaSelect = document.getElementById('disciplinaAdmin');
    const poloSelect = document.getElementById('poloAdmin');
    const dataInicioInput = document.getElementById('dataInicio');
    
    // --- ATUALIZAÇÃO: Capturar a Data Fim ---
    const dataFimInput = document.getElementById('dataFim');
    
    // Validação: Verifica se pelo menos um dia está ativo
    const primeiroDiaAtivo = form.querySelector('.horario-dia-row:not(.dia-desativado)');
    if (!primeiroDiaAtivo) {
      alert('Você deve habilitar pelo menos um dia da semana para salvar.');
      return;
    }
    // --- FIM DA VALIDAÇÃO ---


    // Pegar o TEXTO da opção selecionada
    const disciplinaTexto =
      disciplinaSelect.options[disciplinaSelect.selectedIndex].text;
    const poloTexto = poloSelect.options[poloSelect.selectedIndex].text;

    // --- Formatar as duas datas ---
    const dataInicioFormatada = formatarData(dataInicioInput.value);
    const dataFimFormatada = formatarData(dataFimInput.value);
    
    // Criar o novo texto de informação (Período)
    const infoHorario = `de ${dataInicioFormatada} a ${dataFimFormatada}`;

    // 2. Adicionar a prova na lista
    adicionarProvaNaLista(disciplinaTexto, poloTexto, infoHorario);

    // 3. Limpar o formulário
    form.reset();

    // 4. Reativar todos os dias que foram desativados
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
   */
  function adicionarProvaNaLista(disciplina, polo, infoHorario) {
    const novoItemHTML = `
      <div class="prova-item">
        <div class="prova-item-details">
          <h5 class="prova-title">${disciplina}</h5>
          <div class="prova-meta">
            <span><i class="bi bi-calendar"></i> ${infoHorario}</span> 
            <span><i class="bi bi-geo-alt"></i> ${polo}</span>
          </div>
        </div>
        <div class="prova-item-actions">
          <span class="prova-item-badge">Agendado</span>
          <button class="btn-delete-prova">
            <i class="bi bi-trash-fill"></i>
          </button>
        </div>
      </div>
    `;
    
    listaProvas.insertAdjacentHTML('beforeend', novoItemHTML);
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