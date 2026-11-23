function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const conteudo = document.querySelector(".conteudo");
  const overlay = document.getElementById("sidebarOverlay");
  const botao = document.querySelector(".menu-btn");
  if (!sidebar) return;

  const aberta = sidebar.classList.toggle("aberta");
  const mobile = window.matchMedia("(max-width: 760px)").matches;
  if (conteudo) conteudo.classList.toggle("sidebar-aberta", aberta && !mobile);
  if (overlay) overlay.classList.toggle("aberto", aberta && mobile);
  if (botao) {
    botao.setAttribute("aria-expanded", String(aberta));
    botao.setAttribute("aria-label", aberta ? "Fechar menu" : "Abrir menu");
  }
}

function togglePerfil() {
  const menu = document.getElementById("perfilMenu");
  if (menu) menu.classList.toggle("aberto");
}

document.addEventListener("click", function (event) {
  const menu = document.getElementById("perfilMenu");
  const botao = document.querySelector(".perfil-btn");
  if (
    menu &&
    botao &&
    !menu.contains(event.target) &&
    !botao.contains(event.target)
  ) {
    menu.classList.remove("aberto");
  }
});

function atualizarData() {
  const elemento = document.getElementById("dataAtual");
  if (!elemento) return;
  elemento.textContent = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

atualizarData();

function abrirModal(titulo, texto) {
  const modal = document.getElementById("modalOverlay");
  const tituloElemento = document.getElementById("modalTitulo");
  const conteudo = document.getElementById("modalConteudo");
  if (tituloElemento) tituloElemento.textContent = titulo;
  if (conteudo) {
    conteudo.innerHTML = /<\/?[a-z][\s\S]*>/i.test(texto)
      ? texto
      : `<p>${texto}</p>`;
  }
  if (modal) modal.classList.add("aberto");
}

function fecharModal() {
  const modal = document.getElementById("modalOverlay");
  if (modal) modal.classList.remove("aberto");
}

function fecharModalFundo(event) {
  if (event.target.id === "modalOverlay") fecharModal();
}

function abrirSetor(codigo, nome, status, percentual, area, responsavel) {
  abrirModal(
    `${codigo} — ${nome}`,
    `<div class="detalhe-setor">
      <div><small>Status</small><strong>${status}</strong></div>
      <div><small>Explorado</small><strong>${percentual}</strong></div>
      <div><small>Área total</small><strong>${area}</strong></div>
      <div><small>Último responsável</small><strong>${responsavel}</strong></div>
    </div>
    <br><p>Consulte a página de setores para ver o histórico, as avaliações, as operações e as observações técnicas deste registro.</p>`,
  );
}

function expandirMapa() {
  const mapa = document.getElementById("mapaPainel");
  if (!mapa) return;

  const expandido = mapa.classList.toggle("expandido");

  document
    .querySelectorAll('button[onclick="expandirMapa()"]')
    .forEach((botao) => {
      botao.textContent = expandido ? "↙ Minimizar mapa" : "⛶ Expandir mapa";
    });
}

function novaAvaliacao() {
  abrirModal(
    "Nova Avaliação Técnica",
    `<p>Formulário utilizado pelo geólogo para registrar uma nova avaliação de campo.</p>
    <br><div class="detalhe-setor">
      <div><small>Etapa 1</small><strong>Selecionar área</strong></div>
      <div><small>Etapa 2</small><strong>Selecionar setor</strong></div>
      <div><small>Etapa 3</small><strong>Registrar dados</strong></div>
      <div><small>Etapa 4</small><strong>Salvar avaliação</strong></div>
    </div>`,
  );
}

function abrirSuporte() {
  const conteudo = `
    <div class="geo-contact-card">
      <div class="geo-contact-icon">☎</div>
      <div><small>ADMINISTRAÇÃO / SUPORTE</small><h3>Central de atendimento</h3><p>Entre em contato com a equipe responsável pelo sistema.</p></div>
    </div>
    <div class="geo-info-grid">
      <div><small>Ramal interno</small><strong>204</strong><span>Segunda a sexta • 08h–17h</span></div>
      <div><small>E-mail institucional</small><strong>suporte@geomtr.local</strong><span>Canal demonstrativo</span></div>
      <div><small>Administrador</small><strong>Equipe de Sistemas</strong><span>Suporte a acessos e cadastros</span></div>
    </div>
    <p class="geo-notice">Protótipo acadêmico: ramal e e-mail são dados demonstrativos, não canais reais de atendimento.</p>`;
  abrirModal("Contatar administrador", conteudo);
}

function obterUsuarioDaSessao() {
  if (!window.GEOMTR_DADOS) return null;
  const matricula =
    document.body.dataset.perfil === "admin" ? "A0001" : "F2456";
  return (
    window.GEOMTR_DADOS.usuarios.find((usuario) => usuario.ra === matricula) ||
    null
  );
}

function escaparHTMLDashboard(valor) {
  return String(valor ?? "").replace(
    /[&<>"']/g,
    (caractere) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[caractere],
  );
}

function idadeEmAnos(dataNascimento) {
  if (!dataNascimento) return "";
  const nascimento = new Date(`${dataNascimento}T12:00:00`);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() &&
      hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade--;
  return idade;
}

function formatarDataDashboard(data) {
  if (!data) return "—";
  const [ano, mes, dia] = String(data).slice(0, 10).split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : String(data);
}

function abrirPerfil() {
  const usuario = obterUsuarioDaSessao();
  if (!usuario) {
    abrirModal(
      "Meu perfil",
      "Não foi possível identificar o usuário desta sessão.",
    );
    return;
  }

  const iniciais = usuario.nome
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
  const admissaoFormatada = formatarDataDashboard(usuario.cadastro);
  const conteudo = `
    <form class="geo-profile-form" id="formPerfil" onsubmit="salvarPerfil(event)">
      <div class="geo-profile-head">
        <label class="geo-photo-upload" for="fotoPerfilInput"><span id="fotoPerfilPreview">${iniciais}</span><small>Alterar foto</small></label>
        <input id="fotoPerfilInput" type="file" accept="image/*" onchange="previewFotoPerfil(event)" hidden>
        <div><h3 id="perfilNomeResumo">${escaparHTMLDashboard(usuario.nome)}</h3><p>${escaparHTMLDashboard(usuario.perfil)} • Matrícula ${escaparHTMLDashboard(usuario.ra)}</p><span class="geo-status-pill">● Conta ${usuario.status.toLocaleLowerCase("pt-BR")}</span></div>
      </div>
      <div class="geo-form-grid">
        <label>Nome completo<input id="perfilNome" value="${escaparHTMLDashboard(usuario.nome)}" required maxlength="80"></label>
        <label>Cargo / função<input id="perfilCargo" value="${escaparHTMLDashboard(usuario.cargo)}" required maxlength="60"></label>
        <label>Idade<input id="perfilIdade" type="number" min="18" max="100" value="${idadeEmAnos(usuario.nascimento)}" required></label>
        <label>Documento<input value="Não exibido no protótipo" disabled><small>Dados pessoais não são exibidos nesta tela.</small></label>
        <label>Matrícula<input value="${escaparHTMLDashboard(usuario.ra)}" disabled></label>
        <label>Admissão<input type="text" value="${admissaoFormatada}" disabled></label>
        <label class="geo-field-full">E-mail<input id="perfilEmail" type="email" value="${escaparHTMLDashboard(usuario.email)}" required></label>
      </div>
      <div class="geo-profile-foot"><span><strong>Data de admissão</strong><br><small id="tempoEmpresa">${admissaoFormatada}</small></span><button class="botao-principal" type="submit">Salvar alterações</button></div>
      <p class="geo-notice">As alterações ficam apenas nesta demonstração e não são salvas em banco de dados.</p>
    </form>`;
  abrirModal("Meu perfil", conteudo);
}

function previewFotoPerfil(event) {
  const file = event.target.files && event.target.files[0];
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    const preview = document.getElementById("fotoPerfilPreview");
    if (preview) {
      preview.textContent = "";
      preview.style.backgroundImage = `url(${reader.result})`;
      preview.style.backgroundSize = "cover";
      preview.style.backgroundPosition = "center";
    }
  };
  reader.readAsDataURL(file);
}

function salvarPerfil(event) {
  event.preventDefault();
  const nome = document.getElementById("perfilNome")?.value.trim();
  const cargo = document.getElementById("perfilCargo")?.value.trim();
  if (!nome || !cargo) return;

  document.querySelectorAll(".perfil-cabecalho strong").forEach((elemento) => {
    elemento.textContent = nome.split(" ")[0];
  });
  document.querySelectorAll(".perfil-cabecalho span").forEach((elemento) => {
    elemento.textContent = cargo;
  });
  const resumo = document.getElementById("perfilNomeResumo");
  if (resumo) resumo.textContent = nome;

  const modalConteudo = document.getElementById("modalConteudo");
  if (modalConteudo) {
    modalConteudo.insertAdjacentHTML(
      "beforeend",
      '<p class="geo-success" role="status">✓ Alterações aplicadas nesta demonstração.</p>',
    );
  }
}

function atualizarIndicadoresDashboard() {
  const dados = window.GEOMTR_DADOS;
  if (!dados) return;

  const areaTotal = dados.setores.reduce(
    (total, setor) => total + setor.areaKm2,
    0,
  );
  const areaExplorada = dados.setores.reduce(
    (total, setor) => total + setor.areaKm2 * (setor.explorado / 100),
    0,
  );
  const areaRestante = Math.max(0, areaTotal - areaExplorada);
  const operacoesAtivas = dados.operacoes.filter(
    (operacao) => operacao.status === "Em andamento",
  ).length;
  const formatarKm2 = (valor) =>
    `${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km²`;
  const percentualExplorado = (areaExplorada / areaTotal) * 100;
  const percentualRestante = 100 - percentualExplorado;

  const valores = {
    areaTotalDashboard: formatarKm2(areaTotal),
    areaExploradaDashboard: formatarKm2(areaExplorada),
    areaExploradaPercentDashboard: `${percentualExplorado.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% da área total`,
    operacoesAtivasDashboard: `${operacoesAtivas} ${operacoesAtivas === 1 ? "operação" : "operações"}`,
    operacoesAtivasSubDashboard: `${operacoesAtivas} de ${dados.operacoes.length} registros`,
    areaRestanteDashboard: formatarKm2(areaRestante),
    areaRestantePercentDashboard: `${percentualRestante.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% da área total`,
  };

  Object.entries(valores).forEach(([id, valor]) => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor;
  });
}

window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    fecharModal();

    const menu = document.getElementById("perfilMenu");
    const mapa = document.getElementById("mapaPainel");

    if (menu) menu.classList.remove("aberto");

    if (mapa) {
      mapa.classList.remove("expandido");

      document
        .querySelectorAll('button[onclick="expandirMapa()"]')
        .forEach((botao) => {
          botao.textContent = "⛶ Expandir mapa";
        });
    }
  }
});

function sairSistema() {
  window.location.href = "./index.html";
}

atualizarIndicadoresDashboard();
