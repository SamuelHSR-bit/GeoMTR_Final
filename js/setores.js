const setoresDados = window.GEOMTR_DADOS.setores;

function renderizarSetores() {
  const campoBusca = document.getElementById("buscaSetor");
  const campoSituacao = document.getElementById("filtroSituacao");
  const tabela = document.getElementById("tabelaSetores");
  const contador = document.getElementById("contadorSetores");
  if (!tabela) return;

  const busca = (campoBusca?.value || "").toLocaleLowerCase("pt-BR");
  const situacao = campoSituacao?.value || "";
  const lista = setoresDados.filter(
    (setor) =>
      `${setor.codigo} ${setor.nome} ${setor.mineral}`
        .toLocaleLowerCase("pt-BR")
        .includes(busca) &&
      (!situacao || setor.situacao === situacao),
  );

  if (contador) {
    contador.textContent = `${lista.length} REGISTRO(S) EXIBIDO(S)`;
  }

  tabela.innerHTML =
    lista
      .map(
        (setor) => `
          <tr>
            <td><span class="setor-code">${setor.codigo}</span><br>${setor.nome}</td>
            <td>${setor.mineral}</td>
            <td>${setor.avaliacoes}</td>
            <td>${setor.operacoes}</td>
            <td>${setor.explorado}%<div class="setor-progresso"><span style="width:${setor.explorado}%"></span></div></td>
            <td><span class="setor-status ${setor.status}">${setor.situacao}</span></td>
            <td>${setor.data}</td>
          </tr>`,
      )
      .join("") ||
    '<tr><td colspan="7">Nenhum setor corresponde aos filtros.</td></tr>';
}

function detalheSetor(codigo) {
  const setor = setoresDados.find((item) => item.codigo === codigo);
  if (!setor) return;

  abrirModal(
    `${setor.codigo} — ${setor.nome}`,
    `<div class="geo-info-grid">
      <div><small>Situação técnica</small><strong>${setor.situacao}</strong><span>Classificação técnica</span></div>
      <div><small>Área total</small><strong>${setor.area}</strong><span>Área cadastrada</span></div>
      <div><small>Avaliações</small><strong>${setor.avaliacoes}</strong><span>Registros de avaliação</span></div>
      <div><small>Operações</small><strong>${setor.operacoes}</strong><span>Registros associados ao setor</span></div>
      <div><small>Área explorada</small><strong>${setor.explorado}%</strong><span>Percentual registrado</span></div>
      <div><small>Última avaliação</small><strong>${setor.data}</strong><span>Responsável: ${setor.responsavel}</span></div>
    </div>
    <div class="geo-notice"><strong>Observação técnica</strong><br>${setor.nota}<br><br>Esta informação é fictícia para fins acadêmicos e não substitui laudo geológico, licenciamento ou análise ambiental.</div>`,
  );
}

let escalaMapa = 1;

function zoomMapa(delta) {
  escalaMapa = Math.max(1, Math.min(2.2, escalaMapa + delta));
  const mapa = document.getElementById("mapaSetoresViewport");
  if (mapa) mapa.style.transform = `scale(${escalaMapa})`;
}

function resetZoomMapa() {
  escalaMapa = 1;
  const mapa = document.getElementById("mapaSetoresViewport");
  if (mapa) mapa.style.transform = "scale(1)";
}

const campoBuscaSetor = document.getElementById("buscaSetor");
const campoSituacaoSetor = document.getElementById("filtroSituacao");
if (campoBuscaSetor) campoBuscaSetor.addEventListener("input", renderizarSetores);
if (campoSituacaoSetor)
  campoSituacaoSetor.addEventListener("change", renderizarSetores);

renderizarSetores();
