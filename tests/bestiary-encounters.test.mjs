import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const script = readFileSync(new URL('../script.js', import.meta.url), 'utf8');

function trecho(inicioTexto, fimTexto) {
    const inicio = script.indexOf(inicioTexto);
    const fim = script.indexOf(fimTexto, inicio);
    assert.ok(inicio >= 0 && fim > inicio, `Trecho não encontrado: ${inicioTexto}`);
    return script.slice(inicio, fim);
}

test('a busca ignora acentos e combina OU no mesmo grupo com E entre grupos', () => {
    const fonte = trecho('function normalizarTextoBestiario', '\n\n        function construirVisaoPublicaCatalogacao');
    const api = Function(`
        const BESTIARIO_CAMPOS_FILTRO = ['familia', 'subtipo', 'papel', 'patamar', 'ambiente', 'tamanho', 'faccao', 'etiquetas'];
        const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
        const clamp = (value, min, max) => Math.max(min, Math.min(max, toNumber(value, min)));
        ${fonte}
        return { construirItemCatalogo, filtrarCatalogoAmeacas };
    `)();

    const itens = [
        api.construirItemCatalogo('arauto', 'monstro', { nome: 'Arauto Escarlate', catalogacao: { familia: 'Dragão', papel: 'Brutamontes', ambiente: 'Caverna', etiquetas: ['Fogo', 'Voador'] } }),
        api.construirItemCatalogo('lich', 'monstro', { nome: 'Vigia das Criptas', catalogacao: { familia: 'Morto-vivo', papel: 'Controlador', ambiente: 'Ruínas', etiquetas: ['Mágico'] } }),
        api.construirItemCatalogo('lobos', 'horda', { nome: 'Matilha Cinzenta', catalogacao: { familia: 'Fera', papel: 'Soldado', ambiente: 'Caverna', etiquetas: ['Furtivo'] } })
    ];

    const busca = api.filtrarCatalogoAmeacas(itens, { busca: 'dragao fogo', formato: 'todos', filtros: {} });
    assert.deepEqual(busca.map(item => item.id), ['arauto']);

    const combinado = api.filtrarCatalogoAmeacas(itens, {
        formato: 'todos',
        filtros: { familia: ['Dragão', 'Morto-vivo'], ambiente: ['Caverna'] }
    });
    assert.deepEqual(combinado.map(item => item.id), ['arauto']);
});

test('o índice público respeita os níveis e nunca inclui notas secretas', () => {
    const fonte = trecho('function normalizarTextoBestiario', '\n\n        function clonarDadosSimples');
    const construir = Function(`
        const BESTIARIO_CAMPOS_FILTRO = ['familia', 'subtipo', 'papel', 'patamar', 'ambiente', 'tamanho', 'faccao', 'etiquetas'];
        const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
        const clamp = (value, min, max) => Math.max(min, Math.min(max, toNumber(value, min)));
        ${fonte}
        return construirVisaoPublicaCatalogacao;
    `)();
    const base = {
        nome: 'Nome Verdadeiro',
        catalogacao: {
            nomePublico: 'Cavaleiro Negro', familia: 'Humanoide', subtipo: 'Vampiro', papel: 'Comandante',
            patamar: 'Elite', ambiente: 'Ruínas', tamanho: 'Médio', faccao: 'Círculo Oculto',
            etiquetas: ['Mágico', 'Voador'], descricaoPublica: 'Uma armadura sem brasão.', notasSecretas: 'Trairá o Rei.'
        }
    };
    const avistada = construir('vlad', 'monstro', { ...base, catalogacao: { ...base.catalogacao, nivelConhecimento: 1 } });
    assert.equal(avistada.nomePublico, 'Cavaleiro Negro');
    assert.equal(avistada.familia, 'Humanoide');
    assert.equal(avistada.faccao, undefined);
    assert.equal(avistada.etiquetas, undefined);
    assert.equal(avistada.notasSecretas, undefined);
    assert.equal(avistada.nome, undefined);

    const catalogada = construir('vlad', 'monstro', { ...base, catalogacao: { ...base.catalogacao, nivelConhecimento: 3 } });
    assert.deepEqual(catalogada.etiquetas, ['Mágico', 'Voador']);
    assert.equal(catalogada.faccao, 'Círculo Oculto');
    assert.equal(catalogada.notasSecretas, undefined);
});

test('instâncias de encontro começam cheias sem alterar os modelos', () => {
    const fonte = trecho('function clonarDadosSimples', '\n\n        const CAMPOS_NUMERICOS_FICHA');
    const api = Function(`
        const ENCONTRO_SCHEMA_VERSION = 1;
        const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
        ${fonte}
        return { criarInstanciaMonstro, criarInstanciaHorda };
    `)();
    const monstro = { nome: 'General Verdadeiro', catalogacao: { notasSecretas: 'Segredo' }, 'hp-atual': 3, 'hp-max': 40, 'mana-atual': 1, 'mana-max': 12, escudo: 9, efeitos: [{ nome: 'Ferido' }], combate: { combateId: 'antigo' } };
    const cloneMonstro = api.criarInstanciaMonstro(monstro, { combateId: 'c1', modeloId: 'general', papel: 'General', nomePublico: 'Cavaleiro Negro', criadoEm: 10 });
    assert.equal(cloneMonstro['hp-atual'], 40);
    assert.equal(cloneMonstro['mana-atual'], 12);
    assert.equal(cloneMonstro.escudo, 0);
    assert.deepEqual(cloneMonstro.efeitos, []);
    assert.equal(cloneMonstro.combate, undefined);
    assert.equal(cloneMonstro.catalogacao, undefined);
    assert.equal(cloneMonstro.nome, 'Cavaleiro Negro');
    assert.deepEqual(monstro.efeitos, [{ nome: 'Ferido' }]);
    assert.equal(monstro['hp-atual'], 3);

    const horda = { nome: 'Legião', membros: { m_1: { 'hp-atual': 0, 'hp-max': 9, 'mana-atual': 0, 'mana-max': 3, escudo: 4 } } };
    const cloneHorda = api.criarInstanciaHorda(horda, { combateId: 'c1', modeloId: 'legiao', papel: 'Horda', nomePublico: 'Soldados Mascarados', criadoEm: 10 });
    assert.equal(cloneHorda.membros.m_1['hp-atual'], 9);
    assert.equal(cloneHorda.membros.m_1['mana-atual'], 3);
    assert.equal(cloneHorda.membros.m_1.escudo, 0);
    assert.equal(cloneHorda.nome, 'Soldados Mascarados');
    assert.equal(horda.membros.m_1['hp-atual'], 0);
});

test('a iniciativa aceita Chefe, General e Horda como participantes separados', async () => {
    const fonte = trecho('async function criarEstadoInicialIniciativa', '\n        async function prepararFichasParaCombate');
    const criar = Function(`
        const INICIATIVA_SCHEMA_VERSION = 2;
        const INICIATIVA_ESTADOS = { COLETANDO: 'coletando' };
        const playersList = ['lais', 'gomes', 'kamy', 'arthur'];
        const fichasNoBanco = {};
        const hordasNoBanco = {};
        const usuarios = Object.fromEntries(playersList.map(id => [id, { nome: id }]));
        const gerarIdIniciativa = () => 'gerado';
        const chaveParticipanteIniciativa = (tipo, id) => tipo + '__' + id;
        const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
        const ordenarParticipantesIniciativa = participantes => Object.values(participantes).sort((a, b) => a.ordemEntrada - b.ordemEntrada).map(p => p.chave);
        ${fonte}
        return criarEstadoInicialIniciativa;
    `)();
    const iniciativa = await criar([
        { id: 'rei_i', tipo: 'monstro', modeloId: 'rei', nome: 'Rei Gris', papel: 'Chefe' },
        { id: 'krag_i', tipo: 'monstro', modeloId: 'krag', nome: 'Krag', papel: 'General', comandaId: 'legiao_i' },
        { id: 'legiao_i', tipo: 'horda', modeloId: 'legiao', nome: 'Legião', papel: 'Horda' }
    ], null, { combateId: 'combate-1', criadoEm: 50 });
    assert.equal(Object.keys(iniciativa.participantes).length, 7);
    assert.equal(iniciativa.participantes.monstro__rei_i.papel, 'Chefe');
    assert.equal(iniciativa.participantes.monstro__krag_i.comandaId, 'legiao_i');
    assert.equal(iniciativa.participantes.horda__legiao_i.tipo, 'horda');
    assert.equal(Object.keys(iniciativa.ameacas).length, 3);
});

test('criar Horda apenas salva o modelo e alvo com caminho explícito não é confundido', () => {
    const criarHorda = trecho('window.transformarEmHorda', '\n\n        window.atacarMembroHorda');
    assert.doesNotMatch(criarHorda, /ativarCombateComIniciativa/);
    assert.match(criarHorda, /só entrará em combate quando for lançada em um encontro/);

    const fontePath = trecho('function pathFromValorAlvo', '\n\n        function destacarAlvosSelecionados');
    const resolver = Function(`
        const ameacaEmCombateGlobal = 'horda_antiga';
        ${fontePath}
        return pathFromValorAlvo;
    `)();
    assert.equal(resolver('hordas/horda_enc_1/membros/m_2'), 'hordas/horda_enc_1/membros/m_2');
    assert.equal(resolver('fichas/monstro_enc_1'), 'fichas/monstro_enc_1');
});

test('encerrar encontro preserva modelos e a permissão confere ameaça e membro atuais', () => {
    const encerrar = trecho('async function encerrarCombateComIniciativa', '\n        function limparInterfaceIniciativa');
    assert.match(encerrar, /ameaca\.modeloId === ameaca\.id/);
    assert.match(encerrar, /updates\[`\$\{raiz\}\/\$\{ameaca\.id\}`\] = null/);
    assert.doesNotMatch(encerrar, /updates\[`\$\{raiz\}\/\$\{ameaca\.modeloId\}`\] = null/);

    const permissoes = trecho('function podeUsuarioAgirAgora', '\n        function atualizarPermissoesAcoesCombate');
    assert.match(permissoes, /atual\.id !== idAtor/);
    assert.match(permissoes, /hordaTurno\?\.hordaId === atual\.id/);
    assert.match(permissoes, /hordaTurno\?\.membroAtualId === contexto\.membroId/);
});
