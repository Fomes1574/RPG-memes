import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const css = readFileSync(new URL('style.css', root), 'utf8');
const script = readFileSync(new URL('script.js', root), 'utf8');

test('a lateral do jogador não herda mais a estrutura da lateral do Mestre', () => {
    assert.match(script, /class="sidebar-jogador-custom sidebar-fechada"/);
    assert.doesNotMatch(script, /class="sidebar-mestre sidebar-fechada sidebar-jogador-custom"/);
    assert.match(script, /document\.body\.appendChild\(sidebarJogadorGlobal\)/);
    assert.match(css, /body:not\(\.is-jogador\) \.sidebar-jogador-custom\s*\{[^}]*display:\s*none/s);
});

test('as duas laterais fecham exatamente a própria largura e preservam apenas a alça', () => {
    assert.match(css, /#sidebar-mestre\.sidebar-fechada\s*\{[^}]*translate3d\(100%, 0, 0\)/s);
    assert.match(css, /\.sidebar-jogador-custom\.sidebar-fechada\s*\{[^}]*translate3d\(-100%, 0, 0\)/s);
    assert.match(css, /\.sidebar-fechada\s*\{[^}]*pointer-events:\s*none/s);
    assert.match(css, /\.sidebar-fechada \*\s*\{[^}]*animation-play-state:\s*paused/s);
});

test('o desktop reserva colunas reais para ações, HUD e bestiário', () => {
    assert.match(css, /@media \(min-width: 1280px\)/);
    assert.match(css, /body\.is-jogador\.player-sidebar-open\s*\{[^}]*--layout-left-space/s);
    assert.match(css, /body\.is-mestre\.hud-open\s*\{[^}]*--layout-left-space/s);
    assert.match(css, /body\.is-mestre:not\(\.sidebar-collapsed\)\s*\{[^}]*--layout-right-space/s);
    assert.match(css, /#tela-app\s*\{[^}]*max-width:\s*none/s);
});

test('voz, iniciativa e registro obedecem à área central segura', () => {
    assert.match(css, /\.voice-drawer\[data-open="true"\]\s*\{[^}]*--layout-left-space[^}]*--layout-right-space/s);
    assert.match(css, /\.initiative-turn-board\s*\{[^}]*--layout-left-space[^}]*--layout-right-space[^}]*--voice-safe-bottom/s);
    assert.match(css, /> \.combat-log-panel:not\(\.combat-log-panel-sidebar\)\s*\{[^}]*--layout-right-space[^}]*--voice-safe-bottom/s);
    assert.match(script, /classList\.toggle\('voice-drawer-open', open\)/);
});

test('a alça Grupo reserva uma área própria quando o HUD está fechado', () => {
    assert.match(css, /--master-hud-toggle-width:\s*92px/);
    assert.match(css, /body\.is-mestre:not\(\.hud-open\) \.nav-bar\s*\{[^}]*padding-left:\s*calc\(var\(--master-hud-toggle-width\) \+ 10px\)/s);
    assert.match(css, /#btn-toggle-hud\s*\{[^}]*width:\s*var\(--master-hud-toggle-width\)/s);
});

test('o Registro do jogador encosta no rodapé quando a Voz está recolhida', () => {
    assert.match(css, /@media \(min-width: 860px\)[\s\S]*body\.is-jogador:not\(\.voice-drawer-open\) > \.combat-log-panel:not\(\.combat-log-panel-sidebar\)\s*\{[^}]*bottom:\s*0/s);
    assert.match(css, /body:is\(\.is-mestre, \.is-jogador\) > \.combat-log-panel:not\(\.combat-log-panel-sidebar\)\s*\{[^}]*bottom:\s*calc\(var\(--voice-safe-bottom\) \+ 10px\)/s);
});

test('no modo compacto apenas uma superfície permanece aberta', () => {
    assert.match(script, /matchMedia\('\(max-width: 1279px\)'\)/);
    assert.match(script, /definirSidebarMestreAberta\(!layoutCompactoQuery\.matches, false\)/);
    assert.match(script, /if\(excecao !== 'jogador'\) definirSidebarJogadorAberta\(1, false, false\)/);
    assert.match(script, /if\(excecao !== 'mestre'\) definirSidebarMestreAberta\(false, false\)/);
    assert.match(script, /if\(excecao !== 'hud'\) definirHudMestreAberto\(false, false\)/);
    assert.match(script, /if\(excecao !== 'voz'\) recolherVozPeloLayout\(\)/);
});

test('controles das gavetas expõem estado e destino para acessibilidade', () => {
    assert.match(html, /id="btn-toggle-hud"[^>]*aria-expanded="false"[^>]*aria-controls="hud-mestre"/);
    assert.match(html, /id="btn-toggle-sidebar"[^>]*aria-expanded="true"[^>]*aria-controls="sidebar-mestre"/);
    assert.match(script, /aria-controls="sidebar-jogador-conteudo-slot\$\{numSlot\}"/);
    assert.match(script, /setAttribute\('aria-expanded', String\(aberta\)\)/);
});

test('transições da mesa são limitadas a propriedades baratas', () => {
    assert.match(css, /\.mesa-de-jogo\s*\{[^}]*transition:\s*padding[^}]*gap/s);
    assert.match(css, /\.slot-container\s*\{[^}]*transition:\s*flex-basis[^}]*max-width[^}]*opacity/s);
    assert.match(css, /body:is\(\.is-mestre, \.is-jogador\) button\s*\{[^}]*transition-property:/s);
});
