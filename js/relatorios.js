const STORAGE_RELATORIOS = "geomtr_relatorios_frontend_v3";
const dadosRelatorios = window.GEOMTR_DADOS.relatorios.map((relatorio) => ({ ...relatorio }));

// A chave v2 evita carregar os relatórios antigos, que pertenciam ao conjunto
// de dados anterior e continham responsáveis e setores inexistentes no SQL atual.
try {
  const salvos = JSON.parse(localStorage.getItem(STORAGE_RELATORIOS) || "[]");
  if (Array.isArray(salvos)) {
    const codigosBase = new Set(dadosRelatorios.map((relatorio) => relatorio.codigo));
    salvos
      .filter((relatorio) => relatorio && relatorio.codigo && !codigosBase.has(relatorio.codigo))
      .reverse()
      .forEach((relatorio) => dadosRelatorios.unshift(relatorio));
  }
} catch (erro) {
  // O protótipo continua funcionando durante a sessão sem armazenamento local.
}

function salvarRelatoriosLocais() {
  try {
    localStorage.setItem(STORAGE_RELATORIOS, JSON.stringify(dadosRelatorios));
  } catch (erro) {
    // Os registros continuam disponíveis enquanto a página estiver aberta.
  }
}

const perfilAtual = document.body.dataset.perfil;
const ehAdmin = perfilAtual === "admin";
const nomeFuncionario = "Samuel Oliveira";

const busca = document.getElementById("buscaRelatorio");
const filtroStatus = document.getElementById("filtroStatus");
const filtroResponsavel = document.getElementById("filtroResponsavel");
const lista = document.getElementById("listaRelatorios");
const modalRelatorio = document.getElementById("modalNovoRelatorio");
const formularioRelatorio = document.getElementById("formNovoRelatorio");

function obterBaseRelatorios() {
  return ehAdmin
    ? dadosRelatorios
    : dadosRelatorios.filter((relatorio) => relatorio.responsavel === nomeFuncionario);
}

function obterRelatoriosVisiveis() {
  const dados = obterBaseRelatorios();
  const termo = busca ? busca.value.trim().toLocaleLowerCase("pt-BR") : "";
  const status = filtroStatus ? filtroStatus.value : "";
  const responsavel = filtroResponsavel ? filtroResponsavel.value : "";

  return dados.filter((relatorio) => {
    const correspondeBusca = [
      relatorio.codigo,
      relatorio.titulo,
      relatorio.setor,
      relatorio.responsavel,
      relatorio.tipo,
    ].some((valor) => String(valor || "").toLocaleLowerCase("pt-BR").includes(termo));

    return (
      correspondeBusca &&
      (!status || relatorio.status === status) &&
      (!responsavel || relatorio.responsavel === responsavel)
    );
  });
}

function classeStatusRelatorio(status) {
  if (status === "Concluído") return "concluido";
  if (status === "Em análise") return "analise";
  return "rascunho";
}

function formatarDataRelatorio(data) {
  if (!data) return "—";
  const parteData = String(data).slice(0, 10);
  const [ano, mes, dia] = parteData.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : String(data);
}

function criarCelula(texto, classe = "") {
  const celula = document.createElement("td");
  celula.textContent = texto ?? "—";
  if (classe) celula.className = classe;
  return celula;
}

function criarEtiquetaStatus(status) {
  const etiqueta = document.createElement("span");
  etiqueta.className = `relatorio-status ${classeStatusRelatorio(status)}`;
  etiqueta.textContent = status;
  return etiqueta;
}

function renderizarRelatorios() {
  if (!lista) return;

  const relatorios = obterRelatoriosVisiveis();
  lista.replaceChildren();

  if (relatorios.length === 0) {
    const linha = document.createElement("tr");
    const celula = document.createElement("td");
    celula.colSpan = ehAdmin ? 7 : 6;
    celula.className = "relatorio-vazio";
    celula.textContent = "Nenhum relatório encontrado com esses filtros.";
    linha.appendChild(celula);
    lista.appendChild(linha);
  } else {
    relatorios
      .slice()
      .sort((a, b) => String(b.data).localeCompare(String(a.data)))
      .forEach((relatorio) => {
        const linha = document.createElement("tr");
        linha.appendChild(criarCelula(relatorio.codigo, "relatorio-codigo"));
        linha.appendChild(criarCelula(relatorio.titulo));
        linha.appendChild(criarCelula(relatorio.setor));
        if (ehAdmin) linha.appendChild(criarCelula(relatorio.responsavel));
        linha.appendChild(criarCelula(formatarDataRelatorio(relatorio.data)));

        const celulaStatus = document.createElement("td");
        celulaStatus.appendChild(criarEtiquetaStatus(relatorio.status));
        linha.appendChild(celulaStatus);

        const celulaAcoes = document.createElement("td");
        const grupoAcoes = document.createElement("div");
        const botaoVer = document.createElement("button");
        grupoAcoes.className = "relatorio-acoes";
        botaoVer.type = "button";
        botaoVer.textContent = "Ver";
        botaoVer.addEventListener("click", () => verRelatorio(relatorio.codigo));
        grupoAcoes.appendChild(botaoVer);
        celulaAcoes.appendChild(grupoAcoes);
        linha.appendChild(celulaAcoes);

        lista.appendChild(linha);
      });
  }

  const contador = document.getElementById("contadorRelatorios");
  if (contador) {
    contador.textContent = `Exibindo ${relatorios.length} de ${obterBaseRelatorios().length} relatório(s).`;
  }
}

function atualizarIndicadores() {
  const dados = obterBaseRelatorios();
  const total = document.getElementById("totalRelatorios");
  const concluidos = document.getElementById("totalConcluidos");
  const analise = document.getElementById("totalAnalise");
  const rascunhos = document.getElementById("totalRascunhos");

  if (total) total.textContent = dados.length;
  if (concluidos) concluidos.textContent = dados.filter((r) => r.status === "Concluído").length;
  if (analise) analise.textContent = dados.filter((r) => r.status === "Em análise").length;
  if (rascunhos) rascunhos.textContent = dados.filter((r) => r.status === "Rascunho").length;
}

function escaparHTMLRelatorio(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caractere) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
      caractere
    ],
  );
}

function verRelatorio(codigo) {
  const relatorio = obterBaseRelatorios().find((item) => item.codigo === codigo);
  if (!relatorio) return;

  const setor = window.GEOMTR_DADOS.setores.find(
    (item) => item.codigo === relatorio.setor,
  );
  const esc = escaparHTMLRelatorio;
  const campo = (rotulo, valor, apoio = "") => `
    <div>
      <small>${esc(rotulo)}</small>
      <strong>${esc(valor ?? "Não informado")}</strong>
      ${apoio ? `<span>${esc(apoio)}</span>` : ""}
    </div>`;

  const dadosRelatorio = `
    <section class="geo-detail-section">
      <h3>Dados do relatório</h3>
      <div class="geo-info-grid">
        ${campo("Código", relatorio.codigo)}
        ${campo("Tipo", relatorio.tipo || "Não informado")}
        ${campo("Setor", relatorio.setor)}
        ${campo("Responsável", relatorio.responsavel)}
        ${campo("Data", formatarDataRelatorio(relatorio.data))}
        ${campo("Status", relatorio.status)}
      </div>
      <div class="geo-notice"><strong>Descrição</strong><br>${esc(relatorio.descricao || "Sem descrição registrada.")}</div>
    </section>`;

  const dadosSetor = setor
    ? `
      <section class="geo-detail-section">
        <h3>Indicadores do setor vinculado — ${esc(setor.codigo)}</h3>
        <div class="geo-info-grid">
          ${campo("Setor", `${setor.codigo} — ${setor.nome}`)}
          ${campo("Mineral de interesse", setor.mineral)}
          ${campo("Avaliações", setor.avaliacoes, "Registros de avaliação")}
          ${campo("Operações", setor.operacoes, "Registros associados ao setor")}
          ${campo("Área explorada", `${setor.explorado}%`, "Percentual registrado")}
          ${campo("Situação técnica", setor.situacao, "Classificação técnica")}
          ${campo("Última avaliação", setor.data, `Responsável: ${setor.responsavel || "Não informado"}`)}
        </div>
      </section>`
    : '<p class="geo-notice">Não há indicadores cadastrados para o setor vinculado.</p>';

  if (typeof abrirModal === "function") {
    abrirModal(relatorio.titulo, `<div class="geo-detail-content">${dadosRelatorio}${dadosSetor}</div>`);
  }
}

// O painel inicial usa exatamente a mesma coleção da página de relatórios.
function renderizarUltimosRelatoriosDashboard() {
  const tabela = document.getElementById("ultimosRelatoriosDashboard");
  if (!tabela) return;

  const relatorios = obterBaseRelatorios()
    .slice()
    .sort((a, b) => String(b.data).localeCompare(String(a.data)))
    .slice(0, 5);

  tabela.replaceChildren();
  if (!relatorios.length) {
    const linha = document.createElement("tr");
    const celula = document.createElement("td");
    celula.colSpan = 5;
    celula.textContent = "Nenhum relatório registrado.";
    linha.appendChild(celula);
    tabela.appendChild(linha);
    return;
  }

  relatorios.forEach((relatorio) => {
    const linha = document.createElement("tr");
    linha.appendChild(criarCelula(formatarDataRelatorio(relatorio.data)));
    linha.appendChild(criarCelula(relatorio.setor));
    linha.appendChild(criarCelula(relatorio.tipo));
    linha.appendChild(criarCelula(relatorio.responsavel));
    const status = document.createElement("td");
    const etiqueta = document.createElement("span");
    etiqueta.className = `tag ${classeStatusRelatorio(relatorio.status)}`;
    etiqueta.textContent = relatorio.status;
    status.appendChild(etiqueta);
    linha.appendChild(status);
    tabela.appendChild(linha);
  });
}

function atualizarResumoDashboard() {
  const relatorios = obterBaseRelatorios().slice().sort((a, b) => String(b.data).localeCompare(String(a.data)));
  const setores = new Set(relatorios.map((relatorio) => relatorio.setor));
  const total = document.getElementById("relatoriosResumoValor");
  const totalDetalhe = document.getElementById("relatoriosResumoDetalhe");
  const setoresTotal = document.getElementById("setoresResumoValor");
  const setoresDetalhe = document.getElementById("setoresResumoDetalhe");
  const ultimaData = document.getElementById("ultimaAvaliacaoValor");
  const ultimoDetalhe = document.getElementById("ultimaAvaliacaoDetalhe");

  if (total) total.textContent = relatorios.length;
  if (totalDetalhe) totalDetalhe.textContent = `${relatorios.length} relatório(s) registrado(s)`;
  if (setoresTotal) setoresTotal.textContent = setores.size;
  if (setoresDetalhe) setoresDetalhe.textContent = `de ${window.GEOMTR_DADOS.setores.length} setores cadastrados`;

  if (relatorios.length) {
    const ultimo = relatorios[0];
    if (ultimaData) ultimaData.textContent = formatarDataRelatorio(ultimo.data).slice(0, 5);
    if (ultimoDetalhe) ultimoDetalhe.textContent = `${ultimo.codigo} • ${ultimo.setor}`;
  } else {
    if (ultimaData) ultimaData.textContent = "—";
    if (ultimoDetalhe) ultimoDetalhe.textContent = "Sem relatórios";
  }
}

function exportarRelatorios() {
  if (!ehAdmin) return;
  const dados = obterRelatoriosVisiveis();
  const cabecalho = ["Código", "Relatório", "Setor", "Responsável", "Data", "Status", "Tipo", "Descrição"];
  const linhas = dados.map((r) => [
    r.codigo,
    r.titulo,
    r.setor,
    r.responsavel,
    formatarDataRelatorio(r.data),
    r.status,
    r.tipo || "",
    r.descricao || "",
  ]);
  const csv = [cabecalho, ...linhas]
    .map((linha) => linha.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  const arquivo = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "relatorios-gerais.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function abrirNovoRelatorio() {
  if (!modalRelatorio) return;
  const campoResponsavel = document.getElementById("campoResponsavel");
  const selectResponsavel = document.getElementById("responsavelRelatorio");
  if (campoResponsavel && selectResponsavel) {
    campoResponsavel.style.display = ehAdmin ? "flex" : "none";
    selectResponsavel.required = ehAdmin;
  }
  modalRelatorio.classList.add("aberto");
}

function fecharNovoRelatorio() {
  if (modalRelatorio) modalRelatorio.classList.remove("aberto");
}

function mostrarAvisoRelatorio(mensagem) {
  const aviso = document.getElementById("avisoRelatorio");
  if (!aviso) return;
  aviso.textContent = mensagem;
  aviso.classList.add("visivel");
  setTimeout(() => aviso.classList.remove("visivel"), 3500);
}

if (formularioRelatorio) {
  formularioRelatorio.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const titulo = document.getElementById("tituloRelatorio").value.trim();
    const setor = document.getElementById("setorRelatorio").value;
    const tipo = document.getElementById("tipoRelatorio").value;
    const status = document.getElementById("statusRelatorio").value;
    const descricao = document.getElementById("descricaoRelatorio").value.trim();
    const selectResponsavel = document.getElementById("responsavelRelatorio");
    const responsavel = ehAdmin && selectResponsavel ? selectResponsavel.value : nomeFuncionario;

    if (!titulo || !setor || !tipo || !descricao || !responsavel) {
      mostrarAvisoRelatorio("Preencha todos os campos obrigatórios.");
      return;
    }

    const hoje = new Date();
    const data = [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, "0"),
      String(hoje.getDate()).padStart(2, "0"),
    ].join("-");
    const proximoNumero = Math.max(
      1,
      ...dadosRelatorios.map((r) => Number(String(r.codigo).replace(/\D/g, "")) || 0),
    ) + 1;

    dadosRelatorios.unshift({
      codigo: `REL-${String(proximoNumero).padStart(4, "0")}`,
      titulo,
      setor,
      responsavel,
      data,
      status,
      tipo,
      descricao,
    });

    salvarRelatoriosLocais();
    formularioRelatorio.reset();
    fecharNovoRelatorio();
    atualizarIndicadores();
    renderizarRelatorios();
    renderizarUltimosRelatoriosDashboard();
    atualizarResumoDashboard();
    mostrarAvisoRelatorio("Relatório cadastrado com sucesso nesta demonstração.");
  });
}

if (busca) busca.addEventListener("input", renderizarRelatorios);
if (filtroStatus) filtroStatus.addEventListener("change", renderizarRelatorios);
if (filtroResponsavel) filtroResponsavel.addEventListener("change", renderizarRelatorios);
if (modalRelatorio) {
  modalRelatorio.addEventListener("click", (evento) => {
    if (evento.target === modalRelatorio) fecharNovoRelatorio();
  });
}

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") fecharNovoRelatorio();
});

atualizarIndicadores();
renderizarRelatorios();
renderizarUltimosRelatoriosDashboard();
atualizarResumoDashboard();
