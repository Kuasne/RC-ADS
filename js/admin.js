// Helper para pegar o token salvo no login
function getToken() {
  return localStorage.getItem('authToken');
}

// Helper para criar os headers de autenticação
function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Envia o JWT
  };
}

document.addEventListener('DOMContentLoaded', function () {
  
  //LÓGICA DA SIDEBAR
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

  
  //LÓGICA DO FORMULÁRIO DE AGENDAMENTO
  
  const form = document.getElementById('agendamentoAdminForm');
  const listaProvas = document.getElementById('provasAgendadasList');
  const horarioGrid = document.querySelector('.horario-grid');
  
  // Carregar provas salvas no localStorage ao iniciar
  carregarProvasSalvas();

  // "Ouvinte" de evento para o envio do formulário
  form.addEventListener('submit', async function (e) {
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

   // 2. Montar o objeto que o Backend espera (DTO)
    const scheduleDTO = {
      // ATENÇÃO: Os valores dos <option> no seu HTML precisam ser os IDs reais do banco!
      // Ex: disciplinaSelect.value deve ser um UUID (ex: "1000...004")
      // Ex: poloSelect.value deve ser a matrícula (ex: "P00001")
      poloId: poloSelect.value, 
      subjectId: disciplinaSelect.value,
      startDate: dataInicioInput.value,
      endDate: dataFimInput.value
    };

    try {
      // 3. Enviar para a API (Criar Schedule)
      const response = await fetch('http://localhost:8080/api/schedules', {
        method: 'POST',
        headers: getAuthHeaders(), // Certifique-se de ter criado essa função helper
        body: JSON.stringify(scheduleDTO)
      });

      if (!response.ok) {
        const erro = await response.json();
        alert(`Erro ao salvar: ${erro.message || 'Verifique os dados'}`);
        return;
      }

      const scheduleCriado = await response.json();
      
      // 4. Gerar os Horários (Slots) com base no GRID

      const diaMap = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

      const rows = document.querySelectorAll('.horario-grid .horario-dia-row');
      const customConfig = [];

      rows.forEach((row, index) => {
        // se a linha estiver "desativada", pula
        if (row.classList.contains('dia-desativado')) return;

        const selects = row.querySelectorAll('select.form-select-time');
        if (selects.length < 2) return;

        const start = selects[0].value; // "14:00"
        const end = selects[1].value;   // "19:00"

        customConfig.push({
          day: diaMap[index], // 0 = seg = mon, 1 = ter = tue...
          start: start,
          end: end
        });
      });

      // Chama o endpoint custom do backend
      await fetch(`http://localhost:8080/api/schedules/${scheduleCriado.id}/timeslots/custom`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(customConfig)
      });

      /* // 4. Gerar os Horários (Slots) Automaticamente
      // Esse passo é necessário conforme a regra de negócio do backend
      await fetch(`http://localhost:8080/api/schedules/${scheduleCriado.id}/timeslots/bulk`, {
          method: 'POST',
          headers: getAuthHeaders()
      }); */

      // 5. Atualizar a Tela (Visual)
      // Adaptamos a resposta da API para o formato que sua função de lista espera
      const provaParaTela = {
        id: scheduleCriado.id,
        disciplina: disciplinaTexto, // Texto pego do select
        polo: poloTexto,             // Texto pego do select
        infoHorario: infoHorario,
        status: "Agendado"
      };
      
      adicionarProvaNaListaHTML(provaParaTela);
      
      // Sucesso! Limpa tudo
      form.reset();
      
      // Reativar os dias desativados (seu código original)
      document.querySelectorAll('.horario-dia-row.dia-desativado').forEach(row => {
        row.classList.remove('dia-desativado');
        row.querySelectorAll('select').forEach(s => s.disabled = false);
      });

      alert('Agendamento criado com sucesso!');

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão com o servidor.');
    };
  });

  //LÓGICA PARA EXCLUIR ITENS DA LISTA
  
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


  //LÓGICA PARA ATIVAR/DESATIVAR DIAS NO GRID
  
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
  

  //FUNÇÕES AUXILIARES

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
  async function salvarProvaNaAPI(prova) {
  try {
    const response = await fetch('http://localhost:8080/api/v1/bookings', { // URL do Backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prova)
    });

    if (!response.ok) {
        alert('Erro ao salvar agendamento!');
    }
    // Opcional: recarregar a lista após salvar
    carregarProvasSalvas(); 
  } catch (error) {
    console.error("Erro ao salvar prova na API:", error);
  }
}

  /**
   * Remove uma prova do localStorage pelo ID.
   * @param {string} id - O ID da prova a ser removida.
   */
  // Em: js/admin.js
async function removerProvaDoStorage(idParaRemover) {
  try {
    const response = await fetch(`http://localhost:8080/api/schedules/${idParaRemover}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      alert('Erro ao excluir schedule.');
    }
    // Se deu certo (status 204), o item já foi removido da tela
    // no 'listaProvas.addEventListener('click', ...)'
  } catch (error) {
    console.error("Erro ao remover do localStorage:", error);
  }
}

  /*Carrega e exibe as provas já salvas.*/
  
  // Em: js/admin.js
async function carregarProvasSalvas() {
  try {
    const response = await fetch('http://localhost:8080/api/schedules', {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) return;

    const schedules = await response.json(); 
    const listaProvas = document.getElementById('provasAgendadasList');
    listaProvas.innerHTML = ''; // Limpa a lista
    
    schedules.forEach(schedule => {
        // AQUI ESTÁ A MÁGICA: Usamos o ID para buscar o nome no dicionário
        const nomeDisciplina = DISCIPLINAS[schedule.subjectId] || schedule.subjectId; // Se não achar, mostra o ID mesmo
        const nomePolo = POLOS[schedule.poloId] || schedule.poloId;

        // Formata datas para PT-BR
        const inicio = new Date(schedule.startDate).toLocaleDateString('pt-BR');
        const fim = new Date(schedule.endDate).toLocaleDateString('pt-BR');

        const html = `
        <div class="prova-item" data-id="${schedule.id}">
            <div class="prova-item-details">
            <h5 class="prova-title">${nomeDisciplina}</h5>
            <div class="prova-meta">
                <span><i class="bi bi-calendar"></i> de ${inicio} até ${fim}</span> 
                <span><i class="bi bi-geo-alt"></i> ${nomePolo}</span>
            </div>
            </div>
            <div class="prova-item-actions">
            <span class="prova-item-badge">Agendado</span>
            <button class="btn-delete-prova" onclick="removerProvaDoStorage('${schedule.id}')">
                <i class="bi bi-trash-fill"></i>
            </button>
            </div>
        </div>
        `;
        listaProvas.insertAdjacentHTML('beforeend', html);
    });

  } catch (error) {
    console.error("Erro ao carregar:", error);
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
// --- INÍCIO DO MAPEAMENTO (Copie e cole no início do js/admin.js) ---

// Lista Completa de Disciplinas (Extraída do V2__seed_minimal.sql)
const DISCIPLINAS = {
    '10000000-0000-0000-0000-000000000001': 'GAME DEVELOPER - DESENVOLVENDO SEU 1º GAME',
    '10000000-0000-0000-0000-000000000003': 'ANDROID DEVELOPER - CONSTRUINDO SEU 1º APP',
    '10000000-0000-0000-0000-000000000004': 'BACK-END DEVELOPER - CONHECENDO BANCO DE DADOS E INTEGRANDO APLICAÇÕES',
    '10000000-0000-0000-0000-000000000005': 'FRONT-END DEVELOPER - CRIANDO APLICAÇÕES PARA AMBIENTE WEB',
    '10000000-0000-0000-0000-000000000006': 'UX/UI MOBILE DEVELOPER - CONSTRUINDO APLICAÇÕES MOBILE COM FOCO NA EXPERIÊNCIA DO USUÁRIO',
    '10000000-0000-0000-0000-000000000007': 'SOFTWARE QUALITY ASSURANCE (SQA) - GARANTINDO A QUALIDADE DOS SOFTWARES',
    '10000000-0000-0000-0000-000000000008': 'CIBER SECURITY ESSENCIALS - CONHECENDO ESTRATÉGIAS DE DEFESA CIBERNÉTICA',
    '10000000-0000-0000-0000-000000000009': 'BUSINESS CHALLENGE - ENGENHARIA DE SOFTWARE I',
    '10000000-0000-0000-0000-000000000010': 'WINDOWS SERVER MANAGEMENT (ADMINISTRANDO SERVIÇOS DE SEGURANÇA WINDOWS)',
    '10000000-0000-0000-0000-000000000011': 'LINUX SECURITY - IMPLEMENTANDO SERVIÇOS DE SEGURANÇA LINUX',
    '10000000-0000-0000-0000-000000000012': 'IOT DEVELOPER - CRIANDO EQUIPAMENTOS CONECTADOS',
    '10000000-0000-0000-0000-000000000013': 'CLOUD SECURITY - IMPLEMENTANDO SERVIÇOS EM NUVEM',
    '10000000-0000-0000-0000-000000000014': 'IT LAW SPECIALIST - COMPREENDENDO OS ASPECTOS ÉTICOS E LEGAIS, SOCIOECONÔMICOS DO DESENVOLVIMENTO DE SOFTWARE',
    '10000000-0000-0000-0000-000000000015': 'IA - MACHINE LEARNING - CONSTRUINDO APLICAÇÕES COM INTELIGÊNCIA ARTIFICIAL',
    '10000000-0000-0000-0000-000000000016': 'BUSINESS CHALLENGE - ENGENHARIA DE SOFTWARE II',
    '10000000-0000-0000-0000-000000000017': 'IT MANAGER - GERENCIANDO OPERAÇÕES DE TECNOLOGIA',
    '10000000-0000-0000-0000-000000000018': 'DESRUPT IR SPECIALIST - EXPLORANDO OS NOVOS HORIZONTES DAS TECNOLOGIAS',
    '10000000-0000-0000-0000-000000000019': 'STARTUP MANAGEMENT: CRIANDO STARTUP DATA DRIVEN'
};

// Lista Completa de Polos (Extraída do V2__seed_minimal.sql)
const POLOS = {
    'P00001': 'Polo Barra do Piraí',
    'P00002': 'Polo Barra Mansa',
    'P00003': 'Polo Paty do Alferes',
    'P00004': 'Polo Petrópolis',
    'P00005': 'Polo Resende',
    'P00006': 'Polo Três Rios',
    'P00007': 'Polo Valença',
    'P00008': 'Polo Volta Redonda'
};

function popularSelects() {
    const selectDisciplina = document.getElementById('disciplinaAdmin');
    const selectPolo = document.getElementById('poloAdmin');

    // Limpa e preenche Disciplinas
    if (selectDisciplina) {
        selectDisciplina.innerHTML = '<option value="">Selecione a Disciplina</option>';
        for (const [id, nome] of Object.entries(DISCIPLINAS)) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = nome;
            selectDisciplina.appendChild(option);
        }
    }

    // Limpa e preenche Polos
    if (selectPolo) {
        selectPolo.innerHTML = '<option value="">Selecione o Polo</option>';
        for (const [id, nome] of Object.entries(POLOS)) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = nome;
            selectPolo.appendChild(option);
        }
    }
}

// Chama a função automaticamente
popularSelects();

// --- FIM DO MAPEAMENTO ---
function popularSelects() {
    const selectDisciplina = document.getElementById('disciplinaAdmin');
    const selectPolo = document.getElementById('poloAdmin');

    // Limpa e preenche Disciplinas
    selectDisciplina.innerHTML = '<option value="">Selecione a Disciplina</option>';
    for (const [id, nome] of Object.entries(DISCIPLINAS)) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = nome;
        selectDisciplina.appendChild(option);
    }

    // Limpa e preenche Polos
    selectPolo.innerHTML = '<option value="">Selecione o Polo</option>';
    for (const [id, nome] of Object.entries(POLOS)) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = nome;
        selectPolo.appendChild(option);
    }
}

// CHAME ESTA FUNÇÃO LOGO NO INÍCIO, ANTES DE 'carregarProvasSalvas()'
popularSelects();