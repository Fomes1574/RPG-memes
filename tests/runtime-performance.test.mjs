import assert from 'node:assert/strict';
import test from 'node:test';

import {
    criarAgendadorDeQuadro,
    criarFilaDePersistencia,
    criarHubDeAssinaturas
} from '../runtime-performance.js';

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test('hub compartilha uma assinatura e encerra somente após o último consumidor', async () => {
    let assinaturas = 0;
    let cancelamentos = 0;
    let publicar;
    const observar = criarHubDeAssinaturas((_chave, callback) => {
        assinaturas += 1;
        publicar = callback;
        return () => {
            cancelamentos += 1;
        };
    });
    const recebidosA = [];
    const recebidosB = [];

    const cancelarA = observar('fichas', valor => recebidosA.push(valor));
    const cancelarB = observar('fichas', valor => recebidosB.push(valor));
    publicar({ gomes: { hp: 10 } });
    await Promise.resolve();

    assert.equal(assinaturas, 1);
    assert.deepEqual(recebidosA, [{ gomes: { hp: 10 } }]);
    assert.deepEqual(recebidosB, [{ gomes: { hp: 10 } }]);

    cancelarA();
    assert.equal(cancelamentos, 0);
    cancelarB();
    assert.equal(cancelamentos, 1);
});

test('falha de um consumidor não bloqueia os demais ouvintes do hub', () => {
    let publicar;
    const observar = criarHubDeAssinaturas((_chave, callback) => {
        publicar = callback;
        return () => {};
    });
    const consoleErrorOriginal = console.error;
    const recebidos = [];
    console.error = () => {};

    try {
        observar('combate', () => {
            throw new Error('falha isolada');
        });
        observar('combate', valor => recebidos.push(valor));
        publicar({ rodada: 2 });
        assert.deepEqual(recebidos, [{ rodada: 2 }]);
    } finally {
        console.error = consoleErrorOriginal;
    }
});

test('fila de persistência grava apenas o valor mais recente da mesma chave', async () => {
    const fila = criarFilaDePersistencia(12);
    const gravados = [];

    fila.agendar('fichas/gomes/hp', () => gravados.push(8));
    fila.agendar('fichas/gomes/hp', () => gravados.push(9));
    fila.agendar('fichas/gomes/hp', () => gravados.push(10));
    await esperar(30);

    assert.deepEqual(gravados, [10]);
});

test('agendador visual consolida alterações repetidas no mesmo quadro', () => {
    const requestAnimationFrameOriginal = globalThis.requestAnimationFrame;
    const quadros = [];
    globalThis.requestAnimationFrame = callback => {
        quadros.push(callback);
        return quadros.length;
    };

    try {
        const agendar = criarAgendadorDeQuadro();
        const renderizados = [];
        agendar('slot-1', () => renderizados.push('antigo'));
        agendar('slot-1', () => renderizados.push('novo'));
        agendar('hud', () => renderizados.push('hud'));

        assert.equal(quadros.length, 1);
        quadros.shift()();
        assert.deepEqual(renderizados, ['novo', 'hud']);
    } finally {
        globalThis.requestAnimationFrame = requestAnimationFrameOriginal;
    }
});
