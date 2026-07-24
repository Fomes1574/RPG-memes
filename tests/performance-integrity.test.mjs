import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const css = readFileSync(new URL('style.css', root), 'utf8');
const script = readFileSync(new URL('script.js', root), 'utf8');
const bootstrap = readFileSync(new URL('bootstrap.js', root), 'utf8');
const runtime = readFileSync(new URL('runtime-performance.js', root), 'utf8');

test('o login carrega um bootstrap mínimo e importa a aplicação sob demanda', () => {
    assert.match(html, /<script type="module" src="bootstrap\.js"><\/script>/);
    assert.doesNotMatch(html, /<script type="module" src="script\.js"><\/script>/);
    assert.match(bootstrap, /import\('\.\/script\.js'\)/);
    assert.match(bootstrap, /getAnimations/);
    assert.doesNotMatch(bootstrap, /setTimeout\([^)]*entrarNaMesa/);
});

test('slots pesados são montados somente quando usados', () => {
    assert.match(script, /function garantirSlotMontado\(numSlot\)/);
    assert.match(script, /slot\.dataset\.montado === 'true'/);
    assert.doesNotMatch(script, /document\.getElementById\('slot-1'\)\.innerHTML/);
    assert.match(script, /garantirSlotMontado\(1\)/);
    assert.match(script, /const slotHost = garantirSlotMontado\(numSlot\)/);
});

test('Firebase possui hub compartilhado e não observa a coleção inteira de fotos', () => {
    assert.equal((script.match(/onValue\(/g) || []).length, 1, 'onValue deve existir apenas na fábrica do hub');
    assert.match(script, /criarHubDeAssinaturas/);
    assert.match(script, /cargo === 'Mestre'\) observarColecao\('fichas'/);
    assert.match(script, /else observarEntidade\('fichas', usuarioAtual\.idFicha/);
    assert.doesNotMatch(script, /(?:onValue|observarValor)\([^)]*['"]fotos['"]/);
    assert.match(script, /observarValor\(`fotos\/\$\{id\}`/);
});

test('persistência de digitação é agrupada e retornos visuais usam um quadro', () => {
    assert.match(runtime, /criarFilaDePersistencia/);
    assert.match(runtime, /criarAgendadorDeQuadro/);
    assert.match(script, /criarFilaDePersistencia\(260\)/);
    assert.match(script, /filaPersistencia\.agendar/);
    assert.match(script, /agendarRender\(`slot-\$\{numSlot\}`/);
});

test('voz e recursos acústicos permanecem sob demanda', () => {
    assert.doesNotMatch(script, /preloadVoiceAssets/);
    assert.match(script, /function iniciarVozEmTempoReal\(\)/);
    assert.match(script, /if\(open\)[\s\S]{0,220}iniciarVozEmTempoReal\(\)/);
    assert.match(script, /voiceStretchModulePromise = import\(VOICE_STRETCH_MODULE_URL\)/);
    assert.match(script, /voiceCaveImpulsePromise = fetch\(VOICE_CAVE_IR_URL\)/);
});

test('CSS evita transições globais e filtros na saída do login', () => {
    assert.doesNotMatch(css, /transition:\s*all/);
    assert.doesNotMatch(css, /@import\s+url/);
    const inicio = css.indexOf('@keyframes pacto-card-exit');
    const fim = css.indexOf('}', css.indexOf('}', css.indexOf('}', inicio) + 1) + 1);
    const keyframe = css.slice(inicio, fim + 1);
    assert.doesNotMatch(keyframe, /filter:/);
    assert.match(css, /@keyframes pacto-stage-exit/);
    assert.match(css, /body\.app-paused #tela-app \*/);
});

test('legado comentado não volta ao pacote principal', () => {
    assert.doesNotMatch(script, /LEGADO V1 DESATIVADO/);
    assert.ok(statSync(new URL('script.js', root)).size < 530_000, 'script.js voltou a crescer além do limite');
});

test('uma falha de inicialização permite nova tentativa segura de entrada', () => {
    assert.match(script, /let inicializacaoEmCurso = null/);
    assert.match(script, /\.catch\(erro => \{\s*inicializacaoEmCurso = null/);
    assert.match(script, /aplicacaoIniciada = true/);
});
