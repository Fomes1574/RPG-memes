import { USUARIOS, normalizarIdentidade } from './session-config.js';

const tela = document.getElementById('tela-login');
const input = document.getElementById('input-senha');
const botao = document.getElementById('btn-login-wax');
const erro = document.getElementById('msg-erro');
let loginEmTransicao = false;
let parallaxPendente = null;
let ultimoPointer = null;

function prefereMovimentoReduzido() {
    return Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

function proximoQuadro() {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

function esperarAnimacoes(elemento) {
    const animacoes = elemento?.getAnimations?.({ subtree: false }) || [];
    if (!animacoes.length) return Promise.resolve();
    return Promise.allSettled(animacoes.map(animacao => animacao.finished));
}

function atualizarParallax() {
    parallaxPendente = null;
    if (!ultimoPointer || prefereMovimentoReduzido() || !tela) return;
    const x = (ultimoPointer.clientX / Math.max(window.innerWidth, 1) - 0.5) * -14;
    const y = (ultimoPointer.clientY / Math.max(window.innerHeight, 1) - 0.5) * -9;
    tela.style.setProperty('--pacto-parallax-x', `${x.toFixed(2)}px`);
    tela.style.setProperty('--pacto-parallax-y', `${y.toFixed(2)}px`);
}

function iniciarAtmosferaDoPacto() {
    if (!tela || !input) return;
    tela.addEventListener('pointermove', event => {
        ultimoPointer = event;
        if (!parallaxPendente) parallaxPendente = requestAnimationFrame(atualizarParallax);
    }, { passive: true });
    tela.addEventListener('pointerleave', () => {
        ultimoPointer = null;
        tela.style.setProperty('--pacto-parallax-x', '0px');
        tela.style.setProperty('--pacto-parallax-y', '0px');
    });
    input.addEventListener('input', () => {
        tela.classList.remove('login-denied');
        if (erro) erro.hidden = true;
    });
    document.addEventListener('visibilitychange', () => {
        tela.classList.toggle('pacto-paused', document.hidden);
    });
}

async function entrar(loginId) {
    loginEmTransicao = true;
    if (erro) erro.hidden = true;
    tela.classList.remove('login-denied');
    tela.classList.add('login-approved');
    botao?.classList.add('is-sealing');
    botao?.setAttribute('aria-busy', 'true');

    if (prefereMovimentoReduzido()) {
        const modulo = await import('./script.js');
        await modulo.iniciarRpgMemes(loginId);
        tela.hidden = true;
        tela.style.display = 'none';
        return;
    }

    await proximoQuadro();
    tela.classList.add('login-exiting');
    await proximoQuadro();

    const carregamento = import('./script.js')
        .then(modulo => modulo.iniciarRpgMemes(loginId));
    const transicao = esperarAnimacoes(tela);
    await Promise.all([carregamento, transicao]);

    tela.hidden = true;
    tela.style.display = 'none';
}

window.fazerLogin = function fazerLogin() {
    if (loginEmTransicao || !input || !tela) return;
    const loginId = normalizarIdentidade(input.value);
    if (USUARIOS[loginId]) {
        entrar(loginId).catch(falha => {
            console.error('Não foi possível abrir a mesa.', falha);
            loginEmTransicao = false;
            tela.classList.remove('login-approved', 'login-exiting');
            botao?.classList.remove('is-sealing');
            botao?.removeAttribute('aria-busy');
            if (erro) {
                erro.textContent = 'A mesa não respondeu. Tente novamente.';
                erro.hidden = false;
            }
        });
        return;
    }

    tela.classList.remove('login-denied');
    void tela.offsetWidth;
    tela.classList.add('login-denied');
    if (erro) erro.hidden = false;
    input.focus();
};

iniciarAtmosferaDoPacto();
