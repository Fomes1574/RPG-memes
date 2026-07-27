const LIMITE_NOME_AMEACA = 80;

export function normalizarNomeNovaAmeaca(valor = '') {
    const nome = String(valor ?? '').replace(/\s+/gu, ' ').trim();
    return [...nome].slice(0, LIMITE_NOME_AMEACA).join('').trim();
}

export function criarIdNovaAmeaca(nome, opcoes = {}) {
    const agoraInformado = Number(opcoes.agora);
    const agora = Number.isFinite(agoraInformado) ? Math.trunc(agoraInformado) : Date.now();
    const aleatorio = typeof opcoes.aleatorio === 'function' ? opcoes.aleatorio() : Math.random();
    const token = Math.abs(Number(aleatorio) || 0)
        .toString(36)
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 7) || 'novo';
    const slug = normalizarNomeNovaAmeaca(nome)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 36);
    return `monstro_${Math.max(0, agora)}_${slug || token}_${token}`;
}

export function construirFichaBasicaNovaAmeaca(nome) {
    return {
        nome: normalizarNomeNovaAmeaca(nome),
        'hp-max': 20,
        'hp-atual': 20,
        'mana-max': 20,
        'mana-atual': 20
    };
}

function snapshotExiste(snapshot) {
    if(typeof snapshot?.exists === 'function') return snapshot.exists();
    return snapshot?.val?.() !== null && snapshot?.val?.() !== undefined;
}

function erroPersistenciaNaoConfirmada() {
    const erro = new Error('O Firebase não confirmou a nova ameaça.');
    erro.code = 'bestiario/persistencia-nao-confirmada';
    return erro;
}

export async function persistirNucleoNovaAmeaca({
    id,
    nome,
    ficha,
    atualizar,
    obter
}) {
    if(!id || !nome || !ficha || typeof atualizar !== 'function' || typeof obter !== 'function') {
        throw new TypeError('Dados insuficientes para criar a ameaça.');
    }

    await atualizar('', {
        [`fichas/${id}`]: ficha,
        [`lista_monstros/${id}`]: { nome }
    });

    const [snapshotFicha, snapshotIndice] = await Promise.all([
        obter(`fichas/${id}`),
        obter(`lista_monstros/${id}`)
    ]);

    if(!snapshotExiste(snapshotFicha) || !snapshotExiste(snapshotIndice)) {
        throw erroPersistenciaNaoConfirmada();
    }

    return {
        ficha: snapshotFicha.val() || ficha,
        indice: snapshotIndice.val() || { nome }
    };
}

export async function persistirMetadadosBestiario({
    id,
    entidadePath = '',
    entidade,
    indice,
    publico,
    atualizar
}) {
    if(!id || typeof atualizar !== 'function') return {};

    const operacoes = {};
    if(entidadePath && entidade !== undefined) {
        operacoes.entidade = () => atualizar(entidadePath, entidade);
    }
    if(indice !== undefined) {
        operacoes.indice = () => atualizar(`lista_monstros/${id}`, indice);
    }
    if(publico !== undefined) {
        operacoes.publico = () => atualizar(`bestiario_publico/${id}`, publico);
    }
    const entradas = Object.entries(operacoes);
    const resultados = await Promise.allSettled(entradas.map(([, executar]) => executar()));

    return Object.fromEntries(resultados.map((resultado, indiceResultado) => [
        entradas[indiceResultado][0],
        resultado
    ]));
}

export function mensagemErroNovaAmeaca(erro) {
    const codigo = String(erro?.code || erro?.message || '').toLocaleLowerCase('pt-BR');
    if(codigo.includes('permission') || codigo.includes('permiss')) {
        return 'O banco recusou a gravação. As regras do Firebase precisam permitir a criação no Bestiário.';
    }
    if(codigo.includes('network') || codigo.includes('offline') || codigo.includes('unavailable')) {
        return 'Não foi possível alcançar o banco. Confira sua conexão e tente novamente.';
    }
    if(codigo.includes('persistencia-nao-confirmada')) {
        return 'A gravação não foi confirmada pelo banco. Nada foi anunciado como criado; tente novamente.';
    }
    return 'Não foi possível criar a ameaça. O nome foi preservado para você tentar novamente.';
}

export function criarControladorModalNovaAmeaca({
    documento = globalThis.document,
    podeAbrir = () => true,
    aoNegar = () => {},
    aoConfirmar = async () => {},
    aoErro = () => {}
} = {}) {
    let emCurso = false;
    let focoAnterior = null;
    const elemento = id => documento?.getElementById(id);

    function definirStatus(mensagem = '', tipo = '') {
        const status = elemento('nova-ameaca-status');
        const input = elemento('nova-ameaca-nome');
        if(status) {
            status.textContent = mensagem;
            status.dataset.tipo = tipo;
            status.hidden = !mensagem;
        }
        input?.setAttribute('aria-invalid', String(tipo === 'erro'));
    }

    function definirOcupado(ocupado) {
        emCurso = Boolean(ocupado);
        const form = elemento('form-nova-ameaca');
        const input = elemento('nova-ameaca-nome');
        const confirmar = elemento('btn-confirmar-nova-ameaca');
        const cancelar = elemento('btn-cancelar-nova-ameaca');
        const fechar = elemento('btn-fechar-nova-ameaca');
        form?.setAttribute('aria-busy', String(emCurso));
        if(input) input.disabled = emCurso;
        if(confirmar) {
            confirmar.disabled = emCurso;
            const texto = confirmar.querySelector('span');
            if(texto) texto.textContent = emCurso ? 'Criando…' : 'Criar ameaça';
        }
        if(cancelar) cancelar.disabled = emCurso;
        if(fechar) fechar.disabled = emCurso;
    }

    function fechar(forcar = false) {
        if(emCurso && !forcar) return;
        const modal = elemento('modal-nova-ameaca');
        if(!modal || modal.hidden) return;
        modal.classList.remove('is-open');
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        documento.body?.classList.remove('modal-nova-ameaca-aberto');
        definirStatus();
        const input = elemento('nova-ameaca-nome');
        if(input) input.value = '';
        focoAnterior?.focus?.();
        focoAnterior = null;
    }

    function abrir() {
        if(!podeAbrir()) {
            aoNegar();
            return;
        }
        const modal = elemento('modal-nova-ameaca');
        const input = elemento('nova-ameaca-nome');
        if(!modal || !input || emCurso) return;
        focoAnterior = documento.activeElement;
        definirStatus();
        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
        documento.body?.classList.add('modal-nova-ameaca-aberto');
        const agendar = globalThis.requestAnimationFrame || (callback => callback());
        agendar(() => {
            modal.classList.add('is-open');
            input.focus();
            input.select();
        });
    }

    async function confirmar(event) {
        event?.preventDefault?.();
        if(emCurso || !podeAbrir()) return;
        const input = elemento('nova-ameaca-nome');
        const nome = normalizarNomeNovaAmeaca(input?.value);
        if(!nome) {
            definirStatus('Digite um nome para a ameaça.', 'erro');
            input?.focus();
            return;
        }
        definirStatus('Salvando e confirmando no Bestiário…', 'carregando');
        definirOcupado(true);
        try {
            await aoConfirmar(nome);
            fechar(true);
        } catch(erro) {
            aoErro(erro);
            definirStatus(mensagemErroNovaAmeaca(erro), 'erro');
            input?.focus();
        } finally {
            definirOcupado(false);
        }
    }

    elemento('modal-nova-ameaca')?.addEventListener('pointerdown', event => {
        if(event.target === event.currentTarget) fechar();
    });
    documento?.addEventListener('keydown', event => {
        const modal = elemento('modal-nova-ameaca');
        if(!modal || modal.hidden) return;
        if(event.key === 'Escape') {
            event.preventDefault();
            fechar();
            return;
        }
        if(event.key !== 'Tab') return;
        const focaveis = [...modal.querySelectorAll('button:not(:disabled), input:not(:disabled)')];
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if(event.shiftKey && documento.activeElement === primeiro) {
            event.preventDefault();
            ultimo?.focus();
        } else if(!event.shiftKey && documento.activeElement === ultimo) {
            event.preventDefault();
            primeiro?.focus();
        }
    });

    return { abrir, fechar, confirmar };
}
