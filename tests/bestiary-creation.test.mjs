import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
    construirFichaBasicaNovaAmeaca,
    criarIdNovaAmeaca,
    mensagemErroNovaAmeaca,
    normalizarNomeNovaAmeaca,
    persistirMetadadosBestiario,
    persistirNucleoNovaAmeaca
} from '../bestiary-creation.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../script.js', import.meta.url), 'utf8');

function criarSnapshot(valor) {
    return {
        exists: () => valor !== undefined && valor !== null,
        val: () => valor
    };
}

test('nome é preservado e o ID aceita fantasia com acentos sem usar chaves inválidas', () => {
    assert.equal(normalizarNomeNovaAmeaca('  Dragão   Ancião  '), 'Dragão Ancião');
    const id = criarIdNovaAmeaca('Dragão Ancião', { agora: 123456, aleatorio: () => 0.5 });
    assert.match(id, /^monstro_123456_dragao_anciao_/);
    assert.doesNotMatch(id, /[.#$[\]/]/);
    assert.deepEqual(construirFichaBasicaNovaAmeaca('  Dragão   Ancião  '), {
        nome: 'Dragão Ancião',
        'hp-max': 20,
        'hp-atual': 20,
        'mana-max': 20,
        'mana-atual': 20
    });
});

test('núcleo é gravado atomicamente e só retorna sucesso após reler ficha e índice', async () => {
    const banco = {};
    const atualizacoes = [];
    const resultado = await persistirNucleoNovaAmeaca({
        id: 'monstro_1_dragao_x',
        nome: 'Dragão',
        ficha: construirFichaBasicaNovaAmeaca('Dragão'),
        atualizar: async (path, payload) => {
            atualizacoes.push({ path, payload });
            Object.assign(banco, payload);
        },
        obter: async path => criarSnapshot(banco[path])
    });

    assert.equal(atualizacoes.length, 1);
    assert.equal(atualizacoes[0].path, '');
    assert.deepEqual(Object.keys(atualizacoes[0].payload).sort(), [
        'fichas/monstro_1_dragao_x',
        'lista_monstros/monstro_1_dragao_x'
    ]);
    assert.equal(resultado.ficha.nome, 'Dragão');
    assert.equal(resultado.indice.nome, 'Dragão');
});

test('índice público pode falhar sem desfazer a ameaça já criada', async () => {
    const caminhos = [];
    const resultados = await persistirMetadadosBestiario({
        id: 'monstro_2_lich_x',
        entidadePath: 'fichas/monstro_2_lich_x',
        entidade: { tipo: 'monstro', catalogacao: { patamar: 'Comum' } },
        indice: { nome: 'Lich', ativo: true },
        publico: { nomePublico: 'Ameaça desconhecida' },
        atualizar: async (path) => {
            caminhos.push(path);
            if(path.startsWith('bestiario_publico/')) {
                const erro = new Error('Permission denied');
                erro.code = 'PERMISSION_DENIED';
                throw erro;
            }
        }
    });

    assert.deepEqual(caminhos.sort(), [
        'bestiario_publico/monstro_2_lich_x',
        'fichas/monstro_2_lich_x',
        'lista_monstros/monstro_2_lich_x'
    ]);
    assert.equal(resultados.entidade.status, 'fulfilled');
    assert.equal(resultados.indice.status, 'fulfilled');
    assert.equal(resultados.publico.status, 'rejected');
});

test('ausência após a leitura de confirmação é tratada como falha real', async () => {
    await assert.rejects(
        persistirNucleoNovaAmeaca({
            id: 'monstro_3_fantasma_x',
            nome: 'Fantasma',
            ficha: construirFichaBasicaNovaAmeaca('Fantasma'),
            atualizar: async () => {},
            obter: async () => criarSnapshot(null)
        }),
        erro => erro.code === 'bestiario/persistencia-nao-confirmada'
    );
    assert.match(mensagemErroNovaAmeaca({ code: 'PERMISSION_DENIED' }), /regras do Firebase/i);
});

test('interface usa modal próprio, mantém erro visível e revela o item confirmado', () => {
    assert.match(html, /id="modal-nova-ameaca"/);
    assert.match(html, /id="nova-ameaca-status"[^>]*aria-live="assertive"/);
    assert.match(html, /id="btn-nova-ameaca"[^>]*aria-haspopup="dialog"/);
    assert.doesNotMatch(script, /prompt\("Nome da nova ameaça/);
    assert.match(script, /persistirNucleoNovaAmeaca\(\{/);
    assert.match(script, /fichasNoBanco\[id\] = confirmado\.ficha/);
    assert.match(script, /registrarItemRecente\('monstro', id\)/);
    assert.match(script, /resetarFiltrosBestiario\('monstro'\)/);
    assert.match(script, /criarControladorModalNovaAmeaca\(\{/);
});

test('índice público também não bloqueia catalogação nem criação de Horda', () => {
    const inicioIndice = script.indexOf('async function sincronizarIndiceCatalogacao');
    const fimIndice = script.indexOf('async function salvarCatalogacaoDoCampo', inicioIndice);
    const indice = script.slice(inicioIndice, fimIndice);
    assert.match(indice, /persistirMetadadosBestiario\(\{/);
    assert.doesNotMatch(indice, /safeUpdate\('',/);

    const inicioHorda = script.indexOf('window.transformarEmHorda');
    const fimHorda = script.indexOf('window.atacarMembroHorda', inicioHorda);
    const horda = script.slice(inicioHorda, fimHorda);
    assert.match(horda, /await safeUpdate\(`hordas\/\$\{hordaId\}`/);
    assert.match(horda, /persistirMetadadosBestiario\(\{/);
    assert.doesNotMatch(horda, /\[`bestiario_publico\/\$\{hordaId\}`\]/);
});
