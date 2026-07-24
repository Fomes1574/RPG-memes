export function proximoQuadro() {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

export function agendarQuandoOcioso(tarefa, timeout = 900) {
    if (typeof requestIdleCallback === 'function') {
        return requestIdleCallback(tarefa, { timeout });
    }
    return setTimeout(tarefa, 0);
}

export function criarAgendadorDeQuadro() {
    const tarefas = new Map();
    let quadroPendente = false;

    function executar() {
        quadroPendente = false;
        const lote = [...tarefas.values()];
        tarefas.clear();
        lote.forEach(tarefa => {
            try {
                tarefa();
            } catch (erro) {
                console.error('Falha ao atualizar a interface.', erro);
            }
        });
    }

    return function agendar(chave, tarefa) {
        tarefas.set(chave, tarefa);
        if (quadroPendente) return;
        quadroPendente = true;
        requestAnimationFrame(executar);
    };
}

export function criarFilaDePersistencia(atraso = 260) {
    const pendentes = new Map();

    function executar(chave) {
        const item = pendentes.get(chave);
        if (!item) return Promise.resolve();
        clearTimeout(item.timer);
        pendentes.delete(chave);
        return Promise.resolve()
            .then(item.tarefa)
            .catch(erro => console.error(`Falha ao salvar ${chave}.`, erro));
    }

    return {
        agendar(chave, tarefa) {
            const anterior = pendentes.get(chave);
            if (anterior) clearTimeout(anterior.timer);
            const item = {
                tarefa,
                timer: setTimeout(() => executar(chave), atraso)
            };
            pendentes.set(chave, item);
        },
        executar,
        executarTudo() {
            return Promise.allSettled([...pendentes.keys()].map(executar));
        }
    };
}

export function criarHubDeAssinaturas(assinar) {
    const canais = new Map();

    function notificar(callback, valor) {
        try {
            callback(valor);
        } catch (erro) {
            console.error('Falha em um consumidor de dados em tempo real.', erro);
        }
    }

    return function observar(chave, callback) {
        let canal = canais.get(chave);
        if (!canal) {
            canal = {
                callbacks: new Set(),
                ultimoValor: null,
                temValor: false,
                cancelar: null
            };
            canal.cancelar = assinar(chave, valor => {
                canal.ultimoValor = valor;
                canal.temValor = true;
                canal.callbacks.forEach(ouvinte => notificar(ouvinte, valor));
            });
            canais.set(chave, canal);
        }

        canal.callbacks.add(callback);
        if (canal.temValor) queueMicrotask(() => {
            if (canal.callbacks.has(callback)) notificar(callback, canal.ultimoValor);
        });

        return () => {
            canal.callbacks.delete(callback);
            if (canal.callbacks.size) return;
            canal.cancelar?.();
            canais.delete(chave);
        };
    };
}
