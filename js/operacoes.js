const ehAdmin = document.body.dataset.perfil === "admin";
const operacoes = window.GEOMTR_DADOS.operacoes.map((operacao) => ({ ...operacao }));

const $ = (id) => document.getElementById(id);
let toastTimer;

const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const dataBR = (v) =>
  v ? `${v.slice(8, 10)}/${v.slice(5, 7)}/${v.slice(0, 4)}` : "—";

const hojeISO = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
};

const classe = (s) =>
  ({
    "Em andamento": "em-andamento",
    Planejada: "planejada",
    Concluída: "concluida",
    Suspensa: "suspensa",
  })[s] || "planejada";

function toast(msg) {
  const t = $("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("visivel");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("visivel"), 2800);
}
function atualizar() {
  if ($("totalOperacoes")) $("totalOperacoes").textContent = operacoes.length;
  if ($("totalAndamento"))
    $("totalAndamento").textContent = operacoes.filter(
      (o) => o.status === "Em andamento",
    ).length;
  if ($("totalPlanejadas"))
    $("totalPlanejadas").textContent = operacoes.filter(
      (o) => o.status === "Planejada",
    ).length;
  if ($("totalConcluidas"))
    $("totalConcluidas").textContent = operacoes.filter(
      (o) => o.status === "Concluída",
    ).length;
}

function render() {
  if (!$("listaOperacoes")) return;
  const q = $("buscaOperacao")
    ? $("buscaOperacao").value.trim().toLocaleLowerCase("pt-BR")
    : "";
  const s = $("filtroStatus") ? $("filtroStatus").value : "todos";
  const t = $("filtroTipo") ? $("filtroTipo").value : "todos";

  const lista = operacoes.filter(
    (o) =>
      [o.codigo, o.nome, o.empresa, o.setor, o.mineral, o.responsavel, o.tipo]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(q) &&
      (s === "todos" || o.status === s) &&
      (t === "todos" || o.tipo === t),
  );

  $("listaOperacoes").innerHTML = lista
    .map(
      (o) =>
        `<tr>
          <td><div class="op-name"><strong>${esc(o.nome)}</strong><small>${esc(o.codigo)} · ${esc(o.tipo)}</small></div></td>
          <td><div class="op-company">${esc(o.empresa)}</div></td>
          <td><strong>${esc(o.setor)}</strong></td>
          <td>${dataBR(o.inicio)}<br><small>até ${dataBR(o.fim)}</small></td>
          <td><span class="op-status ${classe(o.status)}">${esc(o.status)}</span></td>
          <td>
            <div class="op-row-actions">
              <button data-acao="detalhes" data-codigo="${esc(o.codigo)}">Detalhes</button>
              ${ehAdmin ? `<button data-acao="editar" data-codigo="${esc(o.codigo)}">Editar</button>` : ""}
              ${ehAdmin && o.status !== "Concluída" ? `<button class="encerrar" data-acao="encerrar" data-codigo="${esc(o.codigo)}">Encerrar</button>` : ""}
            </div>
          </td>
        </tr>`,
    )
    .join("");

  if ($("estadoVazio")) $("estadoVazio").hidden = lista.length > 0;
  if ($("contadorResultados"))
    $("contadorResultados").textContent =
      `Exibindo ${lista.length} de ${operacoes.length} operações`;
  atualizar();
}

let codigoEmEdicao = null;

function abrirModalOperacao(codigo = null) {
  if (!ehAdmin) {
    toast("Somente o administrador pode alterar operações.");
    return;
  }
  if (!$("formOperacao")) return;
  $("formOperacao").reset();
  if ($("erroFormulario")) $("erroFormulario").textContent = "";
  codigoEmEdicao = codigo;
  const o = codigo ? operacoes.find((x) => x.codigo === codigo) : null;
  if ($("modalOperacaoTitulo"))
    $("modalOperacaoTitulo").textContent = o ? "Editar operação" : "Nova operação";
  if ($("modalDescricao"))
    $("modalDescricao").textContent = o
      ? "Altere os dados desta operação."
      : "Preencha os dados para registrar uma atividade.";

  const submitBtn = $("formOperacao").querySelector('[type="submit"]');
  if (submitBtn)
    submitBtn.textContent = o ? "Salvar alterações" : "Cadastrar operação";

  if (o) {
    for (const [id, key] of [
      ["nome", "nome"],
      ["tipo", "tipo"],
      ["empresa", "empresa"],
      ["mineral", "mineral"],
      ["inicio", "inicio"],
      ["fim", "fim"],
      ["responsavel", "responsavel"],
      ["equipe", "equipe"],
      ["status", "status"],
      ["area", "area"],
      ["unidadeArea", "unidadeArea"],
      ["quantidade", "quantidade"],
      ["unidadeQtd", "unidadeQtd"],
      ["observacoes", "observacoes"],
    ]) {
      if ($(id)) $(id).value = o[key] ?? "";
    }
    if ($("setor")) {
      $("setor").value =
        Array.from($("setor").options).find((x) => x.value.startsWith(o.setor))
          ?.value || "";
    }
  } else if ($("inicio")) {
    $("inicio").value = hojeISO();
  }

  if ($("modalOperacao")) $("modalOperacao").hidden = false;
  document.body.style.overflow = "hidden";
  if ($("nome")) $("nome").focus();
}

function fecharModalOperacao() {
  if ($("modalOperacao")) $("modalOperacao").hidden = true;
  document.body.style.overflow = "";
}

function detalhes(codigo) {
  const o = operacoes.find((x) => x.codigo === codigo);
  if (!o) return;

  const setor = window.GEOMTR_DADOS.setores.find(
    (item) => item.codigo === o.setor,
  );
  const campo = (rotulo, valor, apoio = "") => `
    <div>
      <small>${esc(rotulo)}</small>
      <strong>${esc(valor ?? "Não informado")}</strong>
      ${apoio ? `<span>${esc(apoio)}</span>` : ""}
    </div>`;

  const dadosOperacao = `
    <section class="geo-detail-section">
      <h3>Dados da operação</h3>
      <div class="geo-info-grid">
        ${campo("Código", o.codigo)}
        ${campo("Tipo", o.tipo)}
        ${campo("Empresa", o.empresa)}
        ${campo("Setor", o.setor)}
        ${campo("Mineral de interesse", o.mineral)}
        ${campo("Status", o.status)}
        ${campo("Início", dataBR(o.inicio))}
        ${campo("Término", dataBR(o.fim))}
        ${campo("Responsável técnico", o.responsavel)}
        ${campo("Equipe", o.equipe || "Não informada")}
        ${campo("Área afetada", o.area == null ? "Não informada" : `${o.area} ${o.unidadeArea || ""}`)}
        ${campo("Quantidade extraída", o.quantidade == null ? "Não informada" : `${o.quantidade} ${o.unidadeQtd || ""}`)}
      </div>
      <div class="geo-notice"><strong>Observações</strong><br>${esc(o.observacoes || "Nenhuma observação registrada.")}</div>
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

  abrirModal(o.nome, `<div class="geo-detail-content">${dadosOperacao}${dadosSetor}</div>`);
}

// Configurações e adaptações de Perfil de Usuário
if ($("novaOperacaoBtn")) $("novaOperacaoBtn").hidden = !ehAdmin;
if (!ehAdmin) {
  const usuario = window.GEOMTR_DADOS.usuarios.find((item) => item.ra === "F2456");
  if ($("avatar")) $("avatar").textContent = "SO";
  if ($("perfilNome")) $("perfilNome").textContent = usuario?.nome || "Samuel Oliveira";
  if ($("perfilCargo")) $("perfilCargo").textContent = usuario?.cargo || "Geólogo";
  document.querySelector(".admin-item")?.remove();
}

// Event Listeners
if ($("perfilBtn")) {
  $("perfilBtn").onclick = () => {
    if ($("perfilMenu")) $("perfilMenu").classList.toggle("aberto");
  };
}

document.addEventListener("click", (e) => {
  if ($("perfilMenu") && $("perfilBtn")) {
    if (
      !$("perfilMenu").contains(e.target) &&
      !$("perfilBtn").contains(e.target)
    ) {
      $("perfilMenu").classList.remove("aberto");
    }
  }
});

if ($("sairBtn")) $("sairBtn").onclick = () => (location.href = "./index.html");
if ($("suporteBtn"))
  $("suporteBtn").onclick = () =>
    toast(
      "Para suporte técnico, entre em contato com o administrador do GeoMTR.",
    );
if ($("suporteFooterBtn"))
  $("suporteFooterBtn").onclick = () =>
    toast(
      "Para suporte técnico, entre em contato com o administrador do GeoMTR.",
    );
if ($("privacidadeBtn"))
  $("privacidadeBtn").onclick = () =>
    toast("Esta seção ainda não foi configurada no protótipo.");
if ($("termosBtn"))
  $("termosBtn").onclick = () =>
    toast("Esta seção ainda não foi configurada no protótipo.");

if ($("novaOperacaoBtn")) $("novaOperacaoBtn").onclick = () => abrirModalOperacao();
if ($("fecharModalBtn")) $("fecharModalBtn").onclick = fecharModalOperacao;
if ($("cancelarBtn")) $("cancelarBtn").onclick = fecharModalOperacao;

if ($("modalOperacao")) {
  $("modalOperacao").addEventListener("click", (e) => {
    if (e.target === $("modalOperacao")) fecharModalOperacao();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("modalOperacao") && !$("modalOperacao").hidden)
    fecharModalOperacao();
});

["buscaOperacao", "filtroStatus", "filtroTipo"].forEach((id) => {
  if ($(id))
    $(id).addEventListener(id === "buscaOperacao" ? "input" : "change", render);
});

if ($("listaOperacoes")) {
  $("listaOperacoes").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-acao]");
    if (!b) return;
    const o = operacoes.find((x) => x.codigo === b.dataset.codigo);
    if (!o) return;
    if (b.dataset.acao === "detalhes") detalhes(o.codigo);
    if (b.dataset.acao === "editar" && ehAdmin) abrirModalOperacao(o.codigo);
    if (
      b.dataset.acao === "encerrar" &&
      ehAdmin &&
      confirm(`Marcar "${o.nome}" como concluída?`)
    ) {
      o.status = "Concluída";
      if (!o.fim) o.fim = hojeISO();
      render();
      toast("Operação marcada como concluída.");
    }
  });
}

if ($("formOperacao")) {
  $("formOperacao").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!ehAdmin) {
      toast("Somente o administrador pode cadastrar operações.");
      return;
    }
    const inicio = $("inicio").value,
      fim = $("fim").value;
    if (fim && fim < inicio) {
      if ($("erroFormulario"))
        $("erroFormulario").textContent =
          "A data de término não pode ser anterior à data de início.";
      return;
    }
    const dados = {
      nome: $("nome").value.trim(),
      tipo: $("tipo").value,
      empresa: $("empresa").value.trim(),
      setor: $("setor").value.split(" ")[0],
      mineral: $("mineral").value.trim(),
      inicio,
      fim,
      responsavel: $("responsavel").value.trim(),
      equipe: $("equipe").value.trim(),
      status: $("status").value,
      area: $("area").value === "" ? null : Number($("area").value),
      unidadeArea: $("unidadeArea").value,
      quantidade:
        $("quantidade").value === "" ? null : Number($("quantidade").value),
      unidadeQtd: $("unidadeQtd").value,
      observacoes: $("observacoes").value.trim(),
    };

    if (codigoEmEdicao) {
      const existente = operacoes.find((o) => o.codigo === codigoEmEdicao);
      if (existente) Object.assign(existente, dados);
    } else {
      const n =
        Math.max(0, ...operacoes.map((o) => Number(o.codigo.slice(3)) || 0)) +
        1;
      operacoes.unshift({
        codigo: "OP-" + String(n).padStart(4, "0"),
        ...dados,
      });
    }

    const editado = !!codigoEmEdicao;
    fecharModalOperacao();
    if ($("buscaOperacao")) $("buscaOperacao").value = "";
    if ($("filtroStatus")) $("filtroStatus").value = "todos";
    if ($("filtroTipo")) $("filtroTipo").value = "todos";
    render();
    toast(
      editado
        ? "Alterações salvas com sucesso."
        : "Operação cadastrada com sucesso.",
    );
  });
}

render();
