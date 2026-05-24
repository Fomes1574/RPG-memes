import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
        import { getDatabase, ref, onValue, update, get, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

        const firebaseConfig = {
            apiKey: "AIzaSyBOJ4nPQX6dUjrpODKQfCB6uTfWSQCS9uA",
            authDomain: "rpg-do-fomes.firebaseapp.com",
            databaseURL: "https://rpg-do-fomes-default-rtdb.firebaseio.com",
            projectId: "rpg-do-fomes",
            storageBucket: "rpg-do-fomes.firebasestorage.app",
            messagingSenderId: "344602303770",
            appId: "1:344602303770:web:1d6e961606df1a8df5a0a3"
        };

        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);

        const usuarios = {
            "dick":   { nome: "Dick", cargo: "Mestre", idFicha: null },
            "lais":   { nome: "Lais", cargo: "Jogador", idFicha: "lais" },
            "gomes":  { nome: "Gomes", cargo: "Jogador", idFicha: "gomes" },
            "kamy":   { nome: "Kamy", cargo: "Jogador", idFicha: "kamy" },
            "arthur": { nome: "Arthur", cargo: "Jogador", idFicha: "arthur" }
        };

        const playersList = ['lais', 'gomes', 'kamy', 'arthur'];

        let usuarioAtual = null; 
        let ameacaEmCombateGlobal = null;
        let hudVisivel = false;
        let monstrosNoBanco = {};
        let hordasNoBanco = {};

        let slotsDeVisao = {
            1: { ouvinte: null, idFicha: null, tipo: null, dados: {} },
            2: { ouvinte: null, idFicha: null, tipo: null, dados: {} }
        };

        // ==========================================
        // GERAÇÃO DE HTML DOS SLOTS
        // ==========================================
function gerarHtmlHeroi(numSlot) {
    let optionsAttrs = `<option value="">Atributo</option><option value="hp-max">HP Máx</option><option value="mana-max">Mana Máx</option><option value="for">FOR</option><option value="des">DES</option><option value="con">CON</option><option value="int">INT</option><option value="sab">SAB</option><option value="car">CAR</option><option value="per">PER</option>`;
    let eqHtml = '';
    for(let i=1; i<=5; i++){
        eqHtml += `
            <div class="equipamento-slot">
                <span class="slot-num">${i}</span>
                <input type="text" id="slot${numSlot}-item${i}-nome" class="editavel-slot${numSlot}" placeholder="Nome do Item">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <button onclick="mudarQtdItem(${numSlot}, ${i}, -1)" class="btn-qtd editavel-slot${numSlot}">-</button>
                    <input type="number" id="slot${numSlot}-item${i}-qtd" class="editavel-slot${numSlot}" value="0" readonly style="width: 40px; text-align: center; background: rgba(0,0,0,0.8); border: 1px solid #3a2212; color: #fff;">
                    <button onclick="mudarQtdItem(${numSlot}, ${i}, 1)" class="btn-qtd editavel-slot${numSlot}">+</button>
                </div>
            </div>`;
    }

    return `
    <!-- LATERAL ESQUERDA (GRIMÓRIO E COMBATE) -->
    <div id="sidebar-jogador-slot${numSlot}" class="sidebar-mestre sidebar-fechada sidebar-jogador-custom">
        <button id="btn-toggle-jogador-slot${numSlot}" class="btn-toggle-sidebar-jogador" onclick="toggleSidebarJogador(${numSlot})">▶</button>
        <div class="sidebar-header" style="text-align: center; font-size: 18px; margin-bottom: 20px; color:#d4af37;">Grimório & Combate</div>
        
        <div style="overflow-y:auto; padding:0 15px; flex:1; margin-bottom:20px;">
            <!-- TAB: GRIMÓRIO -->
            <div class="section-title">Adicionar Habilidade</div>
            <div class="buff-container">
                <div class="buff-input-grid" style="grid-template-columns: 2fr 1fr 1fr 1.5fr;">
                    <input type="text" id="slot${numSlot}-hab-nome" class="editavel-slot${numSlot}" placeholder="Nome Habilidade">
                    <input type="number" id="slot${numSlot}-hab-ap" class="editavel-slot${numSlot}" placeholder="AP" value="0">
                    <input type="number" id="slot${numSlot}-hab-mana" class="editavel-slot${numSlot}" placeholder="Mana" value="0">
                    <select id="slot${numSlot}-hab-tipo" class="editavel-slot${numSlot}">
                        <option value="ativa">Ativa (Ataque)</option>
                        <option value="passiva">Passiva</option>
                        <option value="cura">Cura</option>
                        <option value="suporte">Suporte / Buff</option>
                    </select>
                </div>
                <textarea id="slot${numSlot}-hab-desc" class="editavel-slot${numSlot}" rows="2" placeholder="Descrição ou Efeito da Habilidade..." style="width:100%; margin-top:5px; background:rgba(0,0,0,0.5); border:1px solid #3a2212; color:#dcd0ba; padding:5px;"></textarea>
                <button class="editavel-slot${numSlot}" onclick="adicionarHabilidade(${numSlot})" style="width:100%; padding: 8px; margin-top: 5px; background: #d4af37; border: 1px solid #5c3a21; color:#000; font-weight:bold; cursor:pointer;">GRAVAR NO GRIMÓRIO</button>
            </div>
            <div class="section-title" style="margin-top: 15px;">Habilidades Passivas</div>
            <div id="lista-habilidades-passivas-slot${numSlot}"></div>
            <div class="section-title" style="margin-top: 15px;">Habilidades Ativas</div>
            <div id="lista-habilidades-ativas-slot${numSlot}"></div>
            
            <!-- TAB: COMBATE -->
            <div class="section-title" style="color:#d95757; border-bottom-color:#8c1c13; margin-top: 25px;">Ações e Combate</div>
            <div class="buff-container" style="border-color:#8c1c13; background:rgba(20, 5, 5, 0.6);">
                <div style="margin-bottom: 15px;">
                    <label style="color:#d95757; font-weight:bold;">Ameaça na Mesa:</label>
                    <span id="nome-ameaca-ativa-slot${numSlot}" style="color:#fff;">Nenhuma ameaça na mesa no momento...</span>
                </div>
                
                <div style="display: flex; gap: 10px; align-items: stretch;">
                    <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                        <label style="color:#b89c72;">Dano Base</label>
                        <input type="number" id="slot${numSlot}-jogador-ataque-dano" class="editavel-slot${numSlot}" placeholder="Valor" style="text-align:center; font-size: 18px; padding: 10px; border-color:#d4af37; color:#fff;">
                        <label class="checkbox-alvo" style="margin-top: 5px; justify-content:center; padding: 5px; border:1px dashed #d95757; border-radius:4px;"><input type="checkbox" id="slot${numSlot}-jogador-critico"> 🔥 Crítico (Nat 20)</label>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 5px; flex: 1.5;">
                        <label style="color:#b89c72;">Alvos Disponíveis</label>
                        <div id="alvos-combate-slot${numSlot}" style="flex:1; background: rgba(0,0,0,0.5); border: 1px solid #5c1818; padding: 5px; border-radius: 4px; overflow-y:auto; max-height:80px; display:flex; flex-direction:column; gap:5px;">
                            <!-- Populated via JS dynamically -->
                        </div>
                    </div>
                </div>

                <div style="display:flex; gap:10px; margin-top:15px;">
                    <button onclick="jogadorAtacar(${numSlot}, false)" class="btn-acao-intenso">⚔️ Ataque Único</button>
                    <button onclick="jogadorAtacar(${numSlot}, true)" class="btn-acao-intenso" style="background: linear-gradient(to bottom, #d95757, #8c1c13); filter: hue-rotate(20deg);">🔥 Ataque em Área</button>
                </div>
            </div>
        </div>
    </div>

    <!-- FICHA PRINCIPAL -->
    <div class="container" id="container-slot${numSlot}-heroi">
        <div class="header-grid" style="align-items: flex-start;">
            <!-- Coluna Esquerda: Foto -->
            <div style="display: flex; flex-direction: column; align-items: center;">
                <img id="img-foto-slot${numSlot}" class="foto-personagem" src="" alt="Sem foto">
                <label class="btn-upload editavel-slot${numSlot}-label esconder-jogador">📁 Enviar do PC<input type="file" class="editavel-slot${numSlot}" accept="image/png, image/jpeg, image/webp" style="display:none;" onchange="processarUploadOtimizado(event, ${numSlot})"></label>
            </div>
            
            <!-- Coluna Direita: Info -->
            <div class="info-grid">
                <div style="display: flex; gap: 10px; grid-column: span 2; align-items: center; border-bottom: 1px dashed #3a2212; padding-bottom: 10px;">
                    <div style="flex: 1;"><label>Nome do Personagem</label><input type="text" id="slot${numSlot}-nome" class="editavel-slot${numSlot}"></div>
                    <div style="width: 130px; text-align: center;">
                        <label style="color:#d4af37; font-size: 14px; letter-spacing: 2px;">NÍVEL</label>
                        <div class="level-display" id="slot${numSlot}-level-display" data-current-level="1" style="font-size: 26px;">LV. <span id="slot${numSlot}-num-level">1</span></div>
                    </div>
                </div>
                <div><label>Jogador</label><input type="text" id="slot${numSlot}-jogador" class="editavel-slot${numSlot}" readonly></div>
                <div>
                    <label>Linhagem / Raça</label>
                    <select id="slot${numSlot}-raca" class="editavel-slot${numSlot}">
                        <option value="">Nenhuma</option>
                        <option value="Humanos">Humanos</option>
                        <option value="Elfo">Elfo</option>
                        <option value="Anão">Anão</option>
                        <option value="Orc">Orc</option>
                        <option value="Gnomo">Gnomo</option>
                        <option value="Halfiling">Halfiling</option>
                        <option value="Khajiit">Khajiit</option>
                        <option value="Argoniano">Argoniano</option>
                    </select>
                </div>
                <div>
                    <label>Vocação / Classe</label>
                    <select id="slot${numSlot}-classe" class="editavel-slot${numSlot}">
                        <option value="">Nenhuma</option>
                        <option value="Guerreiro">Guerreiro</option>
                        <option value="Paladino">Paladino</option>
                        <option value="Druida">Druida</option>
                        <option value="Bárbaro">Bárbaro</option>
                        <option value="Arqueiro">Arqueiro</option>
                        <option value="Ladino">Ladino</option>
                        <option value="Mago">Mago</option>
                        <option value="Curandeiro">Curandeiro</option>
                        <option value="Bardo">Bardo</option>
                        <option value="Monge">Monge</option>
                    </select>
                </div>
                <div><label>Gênero</label><input type="text" id="slot${numSlot}-genero" class="editavel-slot${numSlot}"></div>
            </div>
        </div>
        
        <!-- Árvore logo abaixo do header -->
        <div style="margin: 10px 0 20px 0; text-align: center;">
            <button class="btn-mini-acao editavel-slot${numSlot}" onclick="abrirArvoreHabilidades('${numSlot}')" style="width: 100%; padding: 12px; font-size: 16px; border-color: #d4af37; color: #d4af37; box-shadow: 0 0 15px rgba(212, 175, 55, 0.3); background: rgba(0,0,0,0.6); letter-spacing: 1px;">📜 ÁRVORE DE HABILIDADES</button>
        </div>

        <div class="section-title" style="margin-top: 15px; margin-bottom: 0;">Essência Vital</div>
        <div class="status-grid" style="grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 5px 0 20px 0; padding: 20px;">
            <div id="caixa-hp-slot${numSlot}" class="caixa-status" style="grid-column: span 2;">
                <label style="color: #27ae60; text-align: center;">HP</label>
                <div class="fraction-input" style="justify-content: center;">
                    <input type="number" id="slot${numSlot}-hp-atual" class="editavel-slot${numSlot}" style="color: #27ae60;"><span>/</span><span id="slot${numSlot}-hp-efetivo" style="color: #27ae60; font-size: 20px; font-weight: bold; width:40px; display:inline-block; text-align:left;">20</span>
                </div>
                <div class="mestre-only-flex" style="display: none; justify-content: center;">
                    <label style="margin:0; color:#9c8464;">Base Máx (Mestre):</label>
                    <input type="number" id="slot${numSlot}-hp-max" class="editavel-slot${numSlot} mestre-unlocked" title="Vida Base Máxima (Padrão 20)" style="width:50px; padding:2px; font-size:11px;">
                </div>
                <div class="bar-bg"><div class="bar-fill hp-fill" id="bar-hp-slot${numSlot}" style="width: 100%;"></div><div class="shield-fill" id="bar-shield-slot${numSlot}" style="width: 0%;"></div><div class="hp-text-overlay" id="txt-escudo-slot${numSlot}"></div></div>
            </div>
            <div class="caixa-status" style="grid-column: span 2;">
                <label style="color: #2980b9; text-align: center;">MANA</label>
                <div class="fraction-input" style="justify-content: center;">
                    <input type="number" id="slot${numSlot}-mana-atual" class="editavel-slot${numSlot}" style="color: #2980b9;"><span>/</span><span id="slot${numSlot}-mana-efetivo" style="color: #2980b9; font-size: 20px; font-weight: bold; width:40px; display:inline-block; text-align:left;">20</span>
                </div>
                <div class="mestre-only-flex" style="display: none; justify-content: center;">
                    <label style="margin:0; color:#9c8464;">Base Máx (Mestre):</label>
                    <input type="number" id="slot${numSlot}-mana-max" class="editavel-slot${numSlot} mestre-unlocked" title="Mana Base Máxima (Padrão 20)" style="width:50px; padding:2px; font-size:11px;">
                </div>
                <div class="bar-bg"><div class="bar-fill mana-fill" id="bar-mana-slot${numSlot}" style="width: 100%;"></div></div>
            </div>
            <div class="caixa-status" style="padding: 10px; grid-column: span 2;">
                <div style="display:flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px;">
                    <label style="color: #ffd700; margin: 0; text-shadow: 1px 1px 2px black;">EXPERIÊNCIA</label>
                    <div id="slot${numSlot}-exp-text" class="exp-text">0 / 100</div>
                </div>
                <div class="bar-bg" style="height: 14px; position: relative;">
                    <div class="bar-fill exp-fill" id="bar-exp-slot${numSlot}" style="width: 0%;"></div>
                </div>
            </div>
            <div style="text-align: center;"><label>Ação (AP)</label><input type="number" id="slot${numSlot}-ap" class="editavel-slot${numSlot}" style="color:#d99c57; width: 60%; margin: 0 auto; display: block; text-align: center;"></div>
            <div style="text-align: center;"><label>Moedas de Ouro</label><input type="number" id="slot${numSlot}-ouro" class="editavel-slot${numSlot}" style="color:#d4af37; width: 60%; margin: 0 auto; display: block; text-align: center;"></div>
            <div style="grid-column: span 2;"><label>Condição Física</label><input type="text" id="slot${numSlot}-condicao" class="editavel-slot${numSlot}"></div>
        </div>

        <div class="section-title">Atributos <span id="slot${numSlot}-pts-livres" style="font-size: 14px; color: #ffd700; font-weight: bold;">( 0 / 10 )</span></div>
        <div class="atributos-grid">
            <div class="attr-box"><label>FOR</label><input type="number" id="slot${numSlot}-for" class="editavel-slot${numSlot}"></div>
            <div class="attr-box"><label>DES</label><input type="number" id="slot${numSlot}-des" class="editavel-slot${numSlot}"></div>
            <div class="attr-box"><label>CON</label><input type="number" id="slot${numSlot}-con" class="editavel-slot${numSlot}"></div>
            <div class="attr-box"><label>INT</label><input type="number" id="slot${numSlot}-int" class="editavel-slot${numSlot}"></div>
            <div class="attr-box"><label>SAB</label><input type="number" id="slot${numSlot}-sab" class="editavel-slot${numSlot}"></div>
            <div class="attr-box"><label>CAR</label><input type="number" id="slot${numSlot}-car" class="editavel-slot${numSlot}"></div>
            <div class="attr-box"><label>PER</label><input type="number" id="slot${numSlot}-per" class="editavel-slot${numSlot}"></div>
        </div>

        <div class="section-title">Itens Equipados</div>
        <div class="equipamentos-container">${eqHtml}</div>

        <div class="section-title">Buff e Debuff</div>
        <div class="buff-container">
            <div class="buff-input-grid esconder-jogador">
                <input type="text" id="slot${numSlot}-novo-buff-nome" class="editavel-slot${numSlot}" placeholder="Nome">
                <input type="number" id="slot${numSlot}-novo-buff-hp" class="editavel-slot${numSlot}" placeholder="HP/T">
                <input type="number" id="slot${numSlot}-novo-buff-mana" class="editavel-slot${numSlot}" placeholder="MN/T">
                <select id="slot${numSlot}-novo-buff-attr" class="editavel-slot${numSlot}"><option value="">Nenhum</option><option value="for">FOR</option><option value="des">DES</option><option value="con">CON</option><option value="int">INT</option><option value="sab">SAB</option><option value="car">CAR</option><option value="per">PER</option></select>
                <input type="number" id="slot${numSlot}-novo-buff-mod" class="editavel-slot${numSlot}" placeholder="Mod">
                <input type="number" id="slot${numSlot}-novo-buff-turnos" class="editavel-slot${numSlot}" placeholder="Turnos">
                <button class="editavel-slot${numSlot}" onclick="adicionarEfeito(${numSlot})" style="padding: 5px;">ADD</button>
            </div>
            <div id="lista-efeitos-slot${numSlot}"></div>
        </div>

        <div class="section-title">Descrições</div>
        <div class="info-grid" style="grid-template-columns: 1fr;">
            <textarea id="slot${numSlot}-extra" class="editavel-slot${numSlot}" rows="6" placeholder="Anotações livres..."></textarea>
        </div>

    </div>`;
}

window.toggleSidebarJogador = function(numSlot) {
    const sidebar = document.getElementById(`sidebar-jogador-slot${numSlot}`);
    const btn = document.getElementById(`btn-toggle-jogador-slot${numSlot}`);
    if (sidebar.classList.contains('sidebar-fechada')) {
        sidebar.classList.remove('sidebar-fechada');
        btn.innerText = '<';
    } else {
        sidebar.classList.add('sidebar-fechada');
        btn.innerText = '>';
    }
}

        function gerarHtmlMonstro(numSlot) {
            let alvosHtml = playersList.map(p => `<label class="checkbox-alvo"><input type="checkbox" value="${p}" class="alvo-ataque-slot${numSlot}"> ${p}</label>`).join('');
            
            return `
            <div class="container monstro-theme" id="container-slot${numSlot}-monstro">
                <div class="header-grid" style="grid-template-columns: 100px 1fr;">
                    <div style="display: flex; flex-direction: column;">
                        <img id="img-foto-monstro-slot${numSlot}" class="foto-personagem" src="" alt="Sem foto" style="width:100px; height:100px;">
                        <label class="btn-upload editavel-slot${numSlot}-label esconder-jogador">📷 Upload<input type="file" class="editavel-slot${numSlot}" accept="image/png, image/jpeg, image/webp" style="display:none;" onchange="processarUploadOtimizado(event, ${numSlot})"></label>
                    </div>
                    <div style="display: flex; flex-direction: column; justify-content: center; position: relative;">
                        <div class="mestre-acoes-ficha esconder-jogador" style="position: absolute; top: -10px; right: 0; display: flex; gap: 5px;">
                            <button onclick="lancarAmeacaFicha(${numSlot})" style="background: rgba(0,0,0,0.5); border: 1px solid #d4af37; color: #d4af37; padding: 3px 8px; font-size: 10px; cursor: pointer;">👁️ Lançar</button>
                            <button onclick="abaterAmeacaFicha(${numSlot})" style="background: rgba(0,0,0,0.5); border: 1px solid #8c1c13; color: #d95757; padding: 3px 8px; font-size: 10px; cursor: pointer;">🩸 Abater</button>
                            <button onclick="deletarAmeacaFicha(${numSlot})" style="background: rgba(0,0,0,0.5); border: 1px solid #5c1818; color: #8c1c13; padding: 3px 8px; font-size: 10px; cursor: pointer;">🗑️ Apagar</button>
                        </div>
                        <label style="color:#a84242; font-size: 14px;">Ameaça</label>
                        <input type="text" id="slot${numSlot}-monstro-nome" class="editavel-slot${numSlot}" style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
                    </div>
                </div>

                <div class="section-title">Atributos de Combate</div>
                <div class="status-grid" style="grid-template-columns: 1fr;">
                    <div id="caixa-hp-monstro-slot${numSlot}" class="caixa-status">
                        <label style="color: #27ae60; text-align: center;">HP</label>
                        <div class="fraction-input">
                            <input type="number" id="slot${numSlot}-monstro-hp-atual" class="editavel-slot${numSlot}" style="color: #27ae60;"><span>/</span><input type="number" id="slot${numSlot}-monstro-hp-max" class="editavel-slot${numSlot} mestre-unlocked" style="color: #27ae60;">
                        </div>
                        <div class="bar-bg"><div class="bar-fill hp-fill" id="bar-hp-monstro-slot${numSlot}" style="width: 100%;"></div><div class="shield-fill" id="bar-shield-monstro-slot${numSlot}" style="width: 0%;"></div><div class="hp-text-overlay" id="txt-escudo-monstro-slot${numSlot}"></div></div>
                    </div>
                    <div class="caixa-status">
                        <label style="color: #2980b9; text-align: center;">MANA</label>
                        <div class="fraction-input">
                            <input type="number" id="slot${numSlot}-monstro-mana-atual" class="editavel-slot${numSlot}" style="color: #2980b9;"><span>/</span><input type="number" id="slot${numSlot}-monstro-mana-max" class="editavel-slot${numSlot} mestre-unlocked" style="color: #2980b9;">
                        </div>
                        <div class="bar-bg"><div class="bar-fill mana-fill" id="bar-mana-monstro-slot${numSlot}" style="width: 100%;"></div></div>
                    </div>
                    <div><label>Ação (AP)</label><input type="number" id="slot${numSlot}-monstro-ap" class="editavel-slot${numSlot}" style="color:#d99c57; width: 50%; margin: 0 auto; display: block;"></div>
                </div>

                <div class="section-title esconder-jogador">Ação Ofensiva (Mestre)</div>
                <div class="buff-container esconder-jogador">
                    <div style="display: flex; gap: 15px; align-items: flex-end; flex-wrap: wrap;">
                        <div><label style="color: #d95757;">Dano</label><input type="number" id="slot${numSlot}-ataque-dano" class="editavel-slot${numSlot}" placeholder="Valor" style="width: 80px; text-align: center; font-size: 16px; border-color: #8c1c13; color: #fff;"></div>
                        <div style="flex: 1;">
                            <label style="color: #b89c72;">Alvos (Players)</label>
                            <div style="display: flex; gap: 15px; flex-wrap: wrap; background: rgba(20, 10, 5, 0.8); padding: 10px; border: 1px solid #5c3a21; border-radius: 4px; min-height: 20px; align-items: center;">${alvosHtml}</div>
                        </div>
                        <button class="editavel-slot${numSlot}" onclick="executarAtaque(${numSlot})" style="background: linear-gradient(to bottom, #8c1c13, #4a1111); border-color:#d95757; color: #fff; padding: 10px 20px; font-weight: bold; text-shadow: 1px 1px 2px black;">⚔️ ATACAR</button>
                    </div>
                </div>
                
                <div class="section-title">Atributos</div>
                <div class="atributos-grid">
                    <div class="attr-box"><label>FOR</label><input type="number" id="slot${numSlot}-monstro-for" class="editavel-slot${numSlot}"></div>
                    <div class="attr-box"><label>DES</label><input type="number" id="slot${numSlot}-monstro-des" class="editavel-slot${numSlot}"></div>
                    <div class="attr-box"><label>CON</label><input type="number" id="slot${numSlot}-monstro-con" class="editavel-slot${numSlot}"></div>
                    <div class="attr-box"><label>INT</label><input type="number" id="slot${numSlot}-monstro-int" class="editavel-slot${numSlot}"></div>
                    <div class="attr-box"><label>SAB</label><input type="number" id="slot${numSlot}-monstro-sab" class="editavel-slot${numSlot}"></div>
                    <div class="attr-box"><label>CAR</label><input type="number" id="slot${numSlot}-monstro-car" class="editavel-slot${numSlot}"></div>
                    <div class="attr-box"><label>PER</label><input type="number" id="slot${numSlot}-monstro-per" class="editavel-slot${numSlot}"></div>
                </div>

                <div class="section-title">Buff e Debuff</div>
                <div class="buff-container">
                    <div class="buff-input-grid esconder-jogador">
                        <input type="text" id="slot${numSlot}-novo-buff-nome-monstro" class="editavel-slot${numSlot}" placeholder="Efeito">
                        <input type="number" id="slot${numSlot}-novo-buff-hp-monstro" class="editavel-slot${numSlot}" placeholder="HP/T">
                        <input type="number" id="slot${numSlot}-novo-buff-mana-monstro" class="editavel-slot${numSlot}" placeholder="MN/T">
                        <select id="slot${numSlot}-novo-buff-attr-monstro" class="editavel-slot${numSlot}"><option value="">Nenhum</option><option value="for">FOR</option><option value="des">DES</option><option value="con">CON</option><option value="int">INT</option><option value="sab">SAB</option><option value="car">CAR</option><option value="per">PER</option></select>
                        <input type="number" id="slot${numSlot}-novo-buff-mod-monstro" class="editavel-slot${numSlot}" placeholder="Mod">
                        <input type="number" id="slot${numSlot}-novo-buff-turnos-monstro" class="editavel-slot${numSlot}" placeholder="Turnos">
                        <button class="editavel-slot${numSlot}" onclick="adicionarEfeito(${numSlot}, true)" style="padding: 5px; background: #360e0e; border-color:#8c1c13;">ADD</button>
                    </div>
                    <div id="lista-efeitos-monstro-slot${numSlot}"></div>
                </div>
                
                <div class="section-title esconder-jogador" style="margin-top:40px; border-color:#b8860b; color:#d4af37;">Gerar Horda</div>
                <div class="esconder-jogador" style="display:flex; gap:10px; background: rgba(0,0,0,0.5); padding:15px; border:1px solid #8b6d43; border-radius:4px;">
                    <input type="number" id="slot${numSlot}-qtd-horda" placeholder="Tamanho Total da Horda (ex: 4)" style="flex:1;">
                    <button onclick="transformarEmHorda(${numSlot})" style="background: linear-gradient(to bottom, #d4af37, #8b6d43); color:#000;">Clonar para Horda 🛡️</button>
                </div>
            </div>`;
        }

        // CONTAINER VAZIO DA HORDA
        function gerarHtmlContainerHorda(numSlot) {
            return `<div class="container monstro-theme" id="container-slot${numSlot}-horda" style="border-color:#8b6d43;"></div>`;
        }

        document.getElementById('slot-1').innerHTML = gerarHtmlHeroi(1) + gerarHtmlMonstro(1) + gerarHtmlContainerHorda(1);
        document.getElementById('slot-2').innerHTML = gerarHtmlHeroi(2) + gerarHtmlMonstro(2) + gerarHtmlContainerHorda(2);

        // ==========================================
        // LÓGICA DE LOGIN E INICIALIZAÇÃO
        // ==========================================
        window.fazerLogin = function() {
            const digitado = document.getElementById('input-senha').value.trim().toLowerCase();
            if (usuarios[digitado]) {
                usuarioAtual = usuarios[digitado];
                document.getElementById('tela-login').style.display = "none";
                document.getElementById('tela-app').style.display = "block";
                
                document.getElementById('usuario-logado').innerText = usuarioAtual.nome;
                document.getElementById('badge-cargo').innerText = usuarioAtual.cargo;
                document.body.classList.add(usuarioAtual.cargo === "Mestre" ? 'is-mestre' : 'is-jogador');
                
                if(usuarioAtual.cargo === "Mestre") {
                    document.getElementById('badge-cargo').style.borderColor = "#8c1c13";
                    document.getElementById('badge-cargo').style.color = "#a84242";
                    document.getElementById('painel-mestre').style.display = "flex";
                    document.getElementById('sidebar-mestre').style.display = "flex";
                    document.getElementById('btn-toggle-hud').style.display = "block"; 
                    atualizarSidebarMestre();
                    initHudGlobais();
                } else {
                    document.getElementById('seletor-jogador').style.display = "block";
                    onValue(ref(database, 'fichas/' + usuarioAtual.idFicha), (snapshot) => {
                        const dados = snapshot.val() || {};
                        const spanNomeHeroi = document.getElementById('nome-heroi-jogador');
                        if(spanNomeHeroi) spanNomeHeroi.innerHTML = dados['nome'] || "Herói Sem Nome";
                    });
                    abrirFichaNoSlot(1, 'heroi', usuarioAtual.idFicha);
                }
                iniciarOuvintesGerais();
            } else {
                document.getElementById('msg-erro').style.display = "block";
            }
        }

        function iniciarOuvintesGerais() {
            onValue(ref(database, 'lista_monstros'), (snapshot) => {
                monstrosNoBanco = snapshot.val() || {};
                if(usuarioAtual.cargo === "Mestre") atualizarSidebarMestre();
            });

            onValue(ref(database, 'hordas'), (snapshot) => {
                hordasNoBanco = snapshot.val() || {};
                if(usuarioAtual.cargo === "Mestre") atualizarSidebarMestre();
            });

            onValue(ref(database, 'estado_combate/ativo'), (snapshot) => {
                ameacaEmCombateGlobal = snapshot.val(); 

                if (usuarioAtual.cargo === "Jogador") {
                    if (ameacaEmCombateGlobal) {
                        if (ameacaEmCombateGlobal.startsWith('horda_')) abrirFichaNoSlot(2, 'horda', ameacaEmCombateGlobal);
                        else abrirFichaNoSlot(2, 'monstro', ameacaEmCombateGlobal);
                    } else {
                        limparSlot(2);
                    }
                    atualizarAlvosJogador(ameacaEmCombateGlobal);
                }
                if (usuarioAtual.cargo === "Mestre") {
                    // Sem ação no momento, estado combate livre para Mestre
                }
            });
        }

        // ==========================================
        // GESTÃO DE MENUS E SLOTS DO MESTRE (NOVO)
        // ==========================================
        let ouvinteAlvoJogador = null;
        let refAlvoJogador = null;

        function atualizarAlvosJogador(ameacaId) {
            let nomeSpan = document.getElementById(`nome-ameaca-ativa-slot1`);
            let alvosDiv = document.getElementById(`alvos-combate-slot1`);
            if(!nomeSpan || !alvosDiv) return;

            if(ouvinteAlvoJogador && refAlvoJogador) {
                off(refAlvoJogador, 'value', ouvinteAlvoJogador);
            }

            if(!ameacaId) {
                nomeSpan.innerText = "Nenhuma ameaça na mesa no momento...";
                alvosDiv.innerHTML = "";
                return;
            }

            if(ameacaId.startsWith('horda_')) {
                refAlvoJogador = ref(database, 'hordas/' + ameacaId);
                ouvinteAlvoJogador = onValue(refAlvoJogador, (snap) => {
                    if(snap.exists()) {
                        let horda = snap.val();
                        nomeSpan.innerText = horda.nome || 'Horda';
                        let html = '';
                        for(let mId in horda.membros) {
                            let hpAtual = Number(horda.membros[mId]['hp-atual']) || 0;
                            if(hpAtual > 0) {
                                html += `<label class="checkbox-alvo" style="color:#d95757; font-size:12px; margin-bottom:2px;"><input type="checkbox" value="${ameacaId}_${mId}"> Alvo ${mId} (HP: ${hpAtual})</label>`;
                            }
                        }
                        alvosDiv.innerHTML = html;
                    } else {
                        nomeSpan.innerText = "Ameaça removida.";
                        alvosDiv.innerHTML = "";
                    }
                });
            } else {
                refAlvoJogador = ref(database, 'fichas/' + ameacaId);
                ouvinteAlvoJogador = onValue(refAlvoJogador, (snap) => {
                    if(snap.exists()) {
                        let m = snap.val();
                        nomeSpan.innerText = m.nome || 'Monstro';
                        let hpAtual = Number(m['hp-atual']) || 0;
                        if(hpAtual > 0) {
                            alvosDiv.innerHTML = `<label class="checkbox-alvo" style="color:#d95757; font-size:12px;"><input type="checkbox" value="${ameacaId}"> ${m.nome || 'Monstro'} (HP: ${hpAtual})</label>`;
                        } else {
                            alvosDiv.innerHTML = "";
                        }
                    } else {
                        nomeSpan.innerText = "Ameaça removida.";
                        alvosDiv.innerHTML = "";
                    }
                });
            }
        }

        function atualizarSidebarMestre() {
            if(usuarioAtual.cargo !== "Mestre") return;
            
            // Popula Jogadores
            let htmlJogadores = '';
            playersList.forEach(p => {
                htmlJogadores += `
                    <div class="item-acervo">
                        <span class="item-acervo-nome">${p.toUpperCase()}</span>
                        <div class="item-acervo-botoes">
                            <button class="btn-slot-acervo" onclick="mestreAbrir(1, 'heroi', '${p}')">1</button>
                            <button class="btn-slot-acervo" onclick="mestreAbrir(2, 'heroi', '${p}')">2</button>
                        </div>
                    </div>
                `;
            });
            document.getElementById('cat-jogadores').innerHTML = htmlJogadores;

            // Popula Monstros
            let htmlMonstros = '';
            for(let id in monstrosNoBanco) {
                htmlMonstros += `
                    <div class="item-acervo">
                        <span class="item-acervo-nome">${monstrosNoBanco[id].nome}</span>
                        <div class="item-acervo-botoes">
                            <button class="btn-slot-acervo" onclick="mestreAbrir(1, 'monstro', '${id}')">1</button>
                            <button class="btn-slot-acervo" onclick="mestreAbrir(2, 'monstro', '${id}')">2</button>
                        </div>
                    </div>
                `;
            }
            document.getElementById('cat-monstros').innerHTML = htmlMonstros;

            // Popula Hordas
            let htmlHordas = '';
            for(let id in hordasNoBanco) {
                htmlHordas += `
                    <div class="item-acervo">
                        <span class="item-acervo-nome">${hordasNoBanco[id].nome}</span>
                        <div class="item-acervo-botoes">
                            <button class="btn-slot-acervo" onclick="mestreAbrir(1, 'horda', '${id}')">1</button>
                            <button class="btn-slot-acervo" onclick="mestreAbrir(2, 'horda', '${id}')">2</button>
                        </div>
                    </div>
                `;
            }
            document.getElementById('cat-hordas').innerHTML = htmlHordas;
        }

        window.mudarQtdItem = async function(numSlot, i, delta) {
            if(usuarioAtual.cargo !== "Mestre" && usuarioAtual.idFicha !== slotsDeVisao[numSlot].idFicha) return;
            
            let inputId = `slot${numSlot}-item${i}-qtd`;
            let input = document.getElementById(inputId);
            if(!input) return;
            let current = Number(input.value) || 0;
            let newVal = current + delta;
            if(newVal < 0) newVal = 0;
            if(newVal === current) return;
            input.value = newVal;
            
            // Trigger input event to save to Firebase
            input.dispatchEvent(new Event('input'));
        }

        window.toggleSidebarMestre = function() {
            const sidebar = document.getElementById('sidebar-mestre');
            const seta = document.getElementById('seta-sidebar');
            if (sidebar.classList.contains('sidebar-fechada')) {
                sidebar.classList.remove('sidebar-fechada');
                seta.innerText = '▶';
            } else {
                sidebar.classList.add('sidebar-fechada');
                seta.innerText = '◀';
            }
        }

        window.toggleCategoria = function(catId) {
            let div = document.getElementById(catId);
            if(!div) return;
            let btn = div.previousElementSibling;
            if (div.style.display === 'none') {
                div.style.display = 'block';
                if(btn) btn.classList.remove('fechado');
            } else {
                div.style.display = 'none';
                if(btn) btn.classList.add('fechado');
            }
        }

        window.mestreAbrir = function(numSlot, tipo, valor) {
            if(!valor) return;
            const outroSlot = numSlot === 1 ? 2 : 1;
            if (slotsDeVisao[outroSlot].idFicha === valor && slotsDeVisao[outroSlot].tipo === tipo) {
                limparSlot(outroSlot);
            }
            abrirFichaNoSlot(numSlot, tipo, valor);
        }

        window.mestreLimpar = function(numSlot) {
            limparSlot(numSlot);
        }

        function limparSlot(numSlot) {
            document.getElementById(`slot-${numSlot}`).style.display = 'none';
            document.getElementById(`container-slot${numSlot}-heroi`).style.display = 'none';
            document.getElementById(`container-slot${numSlot}-monstro`).style.display = 'none';
            document.getElementById(`container-slot${numSlot}-horda`).style.display = 'none';
            if (slotsDeVisao[numSlot].ouvinte) { slotsDeVisao[numSlot].ouvinte(); }
            slotsDeVisao[numSlot] = { ouvinte: null, idFicha: null, tipo: null, dados: {} };
        }

        function formatarIdElemento(numSlot, tipoFicha, campoDB) {
            if(tipoFicha === 'monstro') {
                if(campoDB === 'nome') return `slot${numSlot}-monstro-nome`;
                return `slot${numSlot}-monstro-${campoDB}`;
            } else { return `slot${numSlot}-${campoDB}`; }
        }

        // ==========================================
        // LÓGICA DA HORDA (GERAR E RENDERIZAR)
        // ==========================================
        function alvosHtmlCheckbox(sufixo) {
            return playersList.map(p => `<label class="checkbox-alvo"><input type="checkbox" value="${p}" class="alvo-ataque-${sufixo}"> ${p}</label>`).join('');
        }

        function renderizarHtmlHordaDinamico(idHorda, membros, numSlot) {
            let nomeHorda = hordasNoBanco[idHorda] ? hordasNoBanco[idHorda].nome : "Horda";
            let h = `
            <div style="position: relative;">
                <div class="mestre-acoes-ficha esconder-jogador" style="position: absolute; top: 5px; right: 5px; display: flex; gap: 5px; z-index: 10;">
                    <button onclick="lancarAmeacaFicha(${numSlot})" style="background: rgba(0,0,0,0.5); border: 1px solid #d4af37; color: #d4af37; padding: 3px 8px; font-size: 10px; cursor: pointer;">👁️ Lançar</button>
                    <button onclick="abaterAmeacaFicha(${numSlot})" style="background: rgba(0,0,0,0.5); border: 1px solid #8c1c13; color: #d95757; padding: 3px 8px; font-size: 10px; cursor: pointer;">🩸 Abater</button>
                    <button onclick="deletarAmeacaFicha(${numSlot})" style="background: rgba(0,0,0,0.5); border: 1px solid #5c1818; color: #8c1c13; padding: 3px 8px; font-size: 10px; cursor: pointer;">🗑️ Apagar</button>
                </div>
                <div class="section-title" style="color:#d4af37; border-color:#8b6d43; margin-top:0;">🛡️ ${nomeHorda}</div>
            </div>
            `;
            h += `<div style="display:flex; flex-direction:column; gap:15px; margin-top:15px;">`;
            
            for(let mId in membros) {
                let m = membros[mId];
                
                let hpAtual = Number(m['hp-atual']) || 0;
                let hpMax = Number(m['hp-max']) || 1;
                let manaAtual = Number(m['mana-atual']) || 0;
                let manaMax = Number(m['mana-max']) || 1;
                
                let percHp = (hpAtual / hpMax) * 100;
                let percMana = (manaAtual / manaMax) * 100;
                if(percHp > 100) percHp = 100; if(percHp < 0) percHp = 0;
                if(percMana > 100) percMana = 100; if(percMana < 0) percMana = 0;
                
                let isAlertaMorte = (percHp <= 10 && hpMax > 0 && hpAtual > 0) ? 'alerta-morte' : '';

                h += `
                <div class="horda-member-card" style="display: flex; flex-direction: column; background: rgba(0,0,0,0.3); border: 1px solid #4a2e1b; border-radius: 4px; padding: 10px;">
                    <div style="display:flex; justify-content: space-between; align-items:center; gap: 20px; flex-wrap: wrap;">
                        <h4 style="color:#a84242; margin:0; text-transform: uppercase; font-size: 14px; min-width: 100px;">${m.nome}</h4>
                        
                        <div style="display:flex; gap:15px; flex: 1;">
                            <div id="caixa-hp-horda-${mId}" class="caixa-status ${isAlertaMorte}" style="padding: 2px; flex: 1;">
                                <div style="color:#27ae60; font-size:11px; font-weight:bold; display: flex; justify-content: center; align-items: center; gap: 3px;">
                                    HP: 
                                    <input type="number" id="horda-${mId}-hp-atual" class="horda-compact-input editavel-slot${numSlot}" value="${hpAtual}" style="width:50px; color:#27ae60; padding:2px; font-size: 12px; text-align: center;"> / 
                                    <input type="number" id="horda-${mId}-hp-max" class="horda-compact-input mestre-unlocked" value="${hpMax}" style="width:50px; color:#27ae60; padding:2px; font-size: 12px; text-align: center;" disabled>
                                </div>
                                <div class="bar-bg" style="height: 6px; margin-top: 4px;"><div class="bar-fill hp-fill" id="bar-hp-horda-${mId}" style="width: ${percHp}%;"></div><div class="shield-fill" id="bar-shield-horda-${mId}" style="width: 0%;"></div><div class="hp-text-overlay" id="txt-escudo-horda-${mId}" style="font-size: 9px;"></div></div>
                            </div>
                            
                            <div id="caixa-mana-horda-${mId}" class="caixa-status" style="padding: 2px; flex: 1;">
                                <div style="color:#2980b9; font-size:11px; font-weight:bold; display: flex; justify-content: center; align-items: center; gap: 3px;">
                                    MP: 
                                    <input type="number" id="horda-${mId}-mana-atual" class="horda-compact-input editavel-slot${numSlot}" value="${manaAtual}" style="width:50px; color:#2980b9; padding:2px; font-size: 12px; text-align: center;"> / 
                                    <input type="number" id="horda-${mId}-mana-max" class="horda-compact-input mestre-unlocked" value="${manaMax}" style="width:50px; color:#2980b9; padding:2px; font-size: 12px; text-align: center;" disabled>
                                </div>
                                <div class="bar-bg" style="height: 6px; margin-top: 4px;"><div class="bar-fill mana-fill" id="bar-mana-horda-${mId}" style="width: ${percMana}%;"></div></div>
                            </div>
                        </div>
                        
                        <div class="esconder-jogador" style="display:flex; gap:10px; align-items:center;">
                            <input type="number" id="ataque-dano-${mId}" placeholder="Dano" style="width: 50px; padding:4px; font-size:11px; background:rgba(0,0,0,0.8); border:1px solid #8c1c13; color:#fff; text-align:center;">
                            <div style="display:flex; gap:8px;">${alvosHtmlCheckbox(mId)}</div>
                            <button onclick="atacarMembroHorda('${mId}')" style="padding: 6px 12px; font-size:11px; background: linear-gradient(to bottom, #8c1c13, #4a1111); border-color:#d95757; color: #fff; font-weight: bold;">⚔️ ATACAR</button>
                        </div>
                    </div>
                </div>`;
            }
            h += `</div>`;
            return h;
        }

        window.invocarMonstro = function() {
            let nome = prompt("Nome da nova ameaça (Monstro/NPC):");
            if(!nome) return;
            nome = nome.trim();
            if(nome === "") return;
            
            // Generate a clean ID
            let id = nome.toLowerCase().replace(/[^a-z0-9]/g, '');
            if(!id) id = 'monstro_' + Date.now();
            
            // Set up basic ficha
            update(ref(database, 'fichas/' + id), { 
                nome: nome, 
                tipo: 'monstro', 
                'hp-max': 20, 
                'hp-atual': 20, 
                'mana-max': 20, 
                'mana-atual': 20 
            });
            // Register in the list
            update(ref(database, 'lista_monstros/' + id), { 
                nome: nome,
                ativo: true 
            });
        }

        window.transformarEmHorda = async function(numSlot) {
            const idMonstroOriginal = slotsDeVisao[numSlot].idFicha;
            const qtdStr = document.getElementById(`slot${numSlot}-qtd-horda`).value;
            const qtd = Number(qtdStr);

            if(!qtd || qtd <= 1) return alert("Insira uma quantidade válida maior que 1 para gerar a horda!");

            const refFicha = ref(database, 'fichas/' + idMonstroOriginal);
            const snap = await get(refFicha);
            let mData = snap.val();
            if(!mData) return;

            const hordaId = "horda_" + Date.now();
            let hordaData = { nome: mData.nome + " (Esquadrão)", membros: {} };

            for(let i=1; i<=qtd; i++) {
                hordaData.membros['m_' + i] = {
                    nome: mData.nome + " " + i,
                    'hp-atual': mData['hp-max'] || 20, 'hp-max': mData['hp-max'] || 20,
                    'mana-atual': mData['mana-max'] || 20, 'mana-max': mData['mana-max'] || 20,
                    for: mData.for || 0, des: mData.des || 0, con: mData.con || 0, int: mData.int || 0, sab: mData.sab || 0, car: mData.car || 0, per: mData.per || 0
                };
            }

            await update(ref(database, 'hordas/' + hordaId), hordaData);
            alert(`🛡️ Horda criada com sucesso! ${qtd} lacaios prontos.`);
            document.getElementById(`slot${numSlot}-qtd-horda`).value = '';
            
            document.getElementById('mestre-t2-horda').value = hordaId;
            mestreAbrir(2, 'horda', hordaId);
            
            setTimeout(() => {
                document.getElementById('seletor-ameaca').value = hordaId;
                selecionarAmeacaMestre(hordaId);
            }, 500); 
        }

        window.atacarMembroHorda = async function(membroId) {
            const inputDano = document.getElementById(`ataque-dano-${membroId}`);
            const dano = Number(inputDano.value);
            if(!dano || dano <= 0) return alert("Insira um valor de dano válido!");

            const checkboxes = document.querySelectorAll(`.alvo-ataque-${membroId}:checked`);
            if(checkboxes.length === 0) return alert("Selecione pelo menos um alvo para o ataque!");

            const alvos = Array.from(checkboxes).map(cb => cb.value);
            for(let alvo of alvos) {
                const refFicha = ref(database, 'fichas/' + alvo);
                const snapshot = await get(refFicha);
                let dados = snapshot.val() || {};
                let hpAtual = Number(dados['hp-atual']) || 0;
                hpAtual -= dano;
                if(hpAtual < 0) hpAtual = 0;
                update(refFicha, { 'hp-atual': hpAtual });
            }
            inputDano.value = '';
            checkboxes.forEach(cb => cb.checked = false);
        };

        // ==========================================
        // CÁLCULOS DE NÍVEL E EXPERIÊNCIA
        // ==========================================
        function getLevelData(expTotal) {
            let level = 1; let requiredForNext = 100; let exp = expTotal || 0;
            while(exp >= requiredForNext) {
                exp -= requiredForNext; level++; requiredForNext *= 2; 
            }
            return { level, currentExp: exp, requiredForNext };
        }

        window.abrirModalExp = function() {
            document.getElementById('modal-exp').style.display = 'flex';
            document.querySelectorAll('.exp-target').forEach(cb => cb.checked = false);
            document.getElementById('exp-amount-input').value = '';
        }
        window.fecharModalExp = function() { document.getElementById('modal-exp').style.display = 'none'; }

        window.baixarBackupJson = async function() {
            if(usuarioAtual.cargo !== "Mestre") return;
            const snap = await get(ref(database, '/'));
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snap.val()));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", "rpg_backup.json");
            dlAnchorElem.click();
        }

        // ==========================================
        // ÁRVORE DE HABILIDADES
        // ==========================================
        const classesRpg = ["Guerreiro", "Paladino", "Druida", "Bárbaro", "Arqueiro", "Ladino", "Mago", "Curandeiro", "Bardo", "Monge"];
        
        window.abrirArvoreHabilidades = function(numSlot) {
            const selectClasse = document.getElementById(`slot${numSlot}-classe`);
            const classeEscolhida = selectClasse ? selectClasse.value : "";
            
            if (!classeEscolhida) {
                alert("Escolha uma Vocação / Classe primeiro na ficha para liberar sua árvore de melhorias!");
                return;
            }

            const tabsContainer = document.getElementById("arvore-tabs-container");
            const viewsContainer = document.getElementById("arvore-views-container");
            
            tabsContainer.innerHTML = "";
            viewsContainer.innerHTML = "";

            classesRpg.forEach(classe => {
                const isEscolhida = (classe === classeEscolhida);
                
                // Criar Aba
                const tab = document.createElement("button");
                tab.className = `tab-classe ${isEscolhida ? 'ativa' : 'bloqueada'}`;
                tab.innerText = classe;
                tabsContainer.appendChild(tab);

                // Criar Visão da Árvore
                const view = document.createElement("div");
                view.className = `arvore-view ${isEscolhida ? 'ativa' : ''}`;
                
                // Placeholder para a árvore
                if (isEscolhida) {
                    view.innerHTML = `
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h3 style="color: #d4af37; margin:0; font-size: 20px;">Caminho do ${classe}</h3>
                            <p style="color: #9c8464; font-size: 12px;">Habilidades em breve...</p>
                        </div>
                        <div class="skill-row">
                            <div class="skill-node desbloqueada"><span class="skill-icon">I</span></div>
                        </div>
                        <div class="skill-linha skill-linha-v" style="position: relative; margin: -20px 0;"></div>
                        <div class="skill-row">
                            <div class="skill-node"><span class="skill-icon">II</span></div>
                            <div class="skill-linha skill-linha-h" style="position: relative; margin: 0 -20px;"></div>
                            <div class="skill-node"><span class="skill-icon">II</span></div>
                        </div>
                    `;
                }
                
                viewsContainer.appendChild(view);
            });

            document.getElementById('modal-arvore').style.display = "flex";
        }

        window.fecharArvore = function() {
            document.getElementById('modal-arvore').style.display = "none";
        }

        window.aplicarExpLote = async function() {
            if(usuarioAtual.cargo !== "Mestre") return;
            const amount = Number(document.getElementById('exp-amount-input').value);
            if(!amount) return alert("Insira um valor numérico!");

            const selecionados = Array.from(document.querySelectorAll('.exp-target:checked')).map(cb => cb.value);
            if(selecionados.length === 0) return alert("Selecione pelo menos um jogador!");

            for(let p of selecionados) {
                const refFicha = ref(database, 'fichas/' + p);
                const snap = await get(refFicha);
                let dados = snap.val() || {};
                let expAtualDB = Number(dados.expTotal) || 0;
                let novaExp = expAtualDB + amount;
                if(novaExp < 0) novaExp = 0;
                update(refFicha, { expTotal: novaExp });
            }
            fecharModalExp();
        }

        // ==========================================
        // CARREGAMENTO DA FICHA E OUVINTES
        // ==========================================
        function abrirFichaNoSlot(numSlot, tipo, idFicha) {
            if(!idFicha) return;
            limparSlot(numSlot);
            
            document.getElementById(`slot-${numSlot}`).style.display = 'flex';
            slotsDeVisao[numSlot].idFicha = idFicha;
            slotsDeVisao[numSlot].tipo = tipo;

            const contHeroi = document.getElementById(`container-slot${numSlot}-heroi`);
            const contMonstro = document.getElementById(`container-slot${numSlot}-monstro`);
            const contHorda = document.getElementById(`container-slot${numSlot}-horda`);
            
            contHeroi.style.display = (tipo === 'heroi') ? 'block' : 'none';
            contMonstro.style.display = (tipo === 'monstro') ? 'block' : 'none';
            contHorda.style.display = (tipo === 'horda') ? 'block' : 'none';

            const temPermissao = (usuarioAtual.cargo === "Mestre") || (tipo === 'heroi' && usuarioAtual.idFicha === idFicha);
            
            if(tipo === 'heroi') {
                let nomeJogadorObj = Object.values(usuarios).find(u => u.idFicha === idFicha);
                let nomeJogador = nomeJogadorObj ? nomeJogadorObj.nome : '';
                let elJogador = document.getElementById(`slot${numSlot}-jogador`);
                if(elJogador) elJogador.value = nomeJogador;
            }

            if(tipo !== 'horda') {
                document.querySelectorAll(`.editavel-slot${numSlot}`).forEach(el => {
                    if(!el.classList.contains('mestre-unlocked')) { el.disabled = !temPermissao; } 
                    else { el.disabled = (usuarioAtual.cargo !== "Mestre"); } 
                    if(el.type !== 'checkbox' && el.type !== 'radio' && el.type !== 'file' && el.id !== `slot${numSlot}-jogador`) el.value = '';
                });

                get(ref(database, 'fotos/' + idFicha)).then(snap => {
                    const imgEl = tipo === 'heroi' ? document.getElementById(`img-foto-slot${numSlot}`) : document.getElementById(`img-foto-monstro-slot${numSlot}`);
                    if(snap.exists() && imgEl) imgEl.src = snap.val().base64;
                });
            }

            const path = tipo === 'horda' ? `hordas/${idFicha}` : `fichas/${idFicha}`;
            const refFicha = ref(database, path);
            
            if(tipo === 'heroi') {
                get(refFicha).then(snap => {
                    if(!snap.exists()) update(refFicha, { 'hp-max': 20, 'mana-max': 20, nome: idFicha });
                    else {
                        let d = snap.val();
                        if(d['hp-max'] === undefined) update(refFicha, { 'hp-max': 20 });
                        if(d['mana-max'] === undefined) update(refFicha, { 'mana-max': 20 });
                    }
                });
            }

            const novoOuvinte = onValue(refFicha, (snapshot) => {
                const dados = snapshot.val() || {};
                slotsDeVisao[numSlot].dados = dados;

                if (tipo === 'horda') {
                    let chavesMembros = Object.keys(dados.membros || {}).join(',');
                    if (contHorda.dataset.chaves !== chavesMembros) {
                        contHorda.innerHTML = renderizarHtmlHordaDinamico(idFicha, dados.membros, numSlot);
                        contHorda.dataset.chaves = chavesMembros;
                        
                        document.querySelectorAll(`.horda-compact-input.editavel-slot${numSlot}`).forEach(input => {
                            if(!input.classList.contains('mestre-unlocked')) { input.disabled = !temPermissao; }
                            
                            input.addEventListener('input', (e) => {
                                if(!e.target.disabled) {
                                    let parts = e.target.id.split('-'); 
                                    let mId = parts[1];
                                    let campo = parts.slice(2).join('-');
                                    update(ref(database, `hordas/${idFicha}/membros/${mId}`), { [campo]: Number(e.target.value) });
                                }
                            });
                        });
                    } else {
                        for(let mId in dados.membros) {
                            let mData = dados.membros[mId];
                            
                            for(let campo in mData) {
                                let el = document.getElementById(`horda-${mId}-${campo}`);
                                if(el && document.activeElement !== el) {
                                    el.value = mData[campo];
                                }
                            }
                            
                            let hpAtual = Number(mData['hp-atual']) || 0;
                            let hpMax = Number(mData['hp-max']) || 1;
                            let manaAtual = Number(mData['mana-atual']) || 0;
                            let manaMax = Number(mData['mana-max']) || 1;
                            
                            let percHp = (hpAtual / hpMax) * 100;
                            let percMana = (manaAtual / manaMax) * 100;
                            if(percHp > 100) percHp = 100; if(percHp < 0) percHp = 0;
                            if(percMana > 100) percMana = 100; if(percMana < 0) percMana = 0;
                            
                            let barHp = document.getElementById(`bar-hp-horda-${mId}`);
                            let barMana = document.getElementById(`bar-mana-horda-${mId}`);
                            if(barHp) barHp.style.width = percHp + '%';
                            if(barMana) barMana.style.width = percMana + '%';
                            
                            let escudo = Number(mData['escudo']) || 0;
                            let barShield = document.getElementById(`bar-shield-horda-${mId}`);
                            let txtEscudo = document.getElementById(`txt-escudo-horda-${mId}`);
                            if(barShield) {
                                let percEscudo = (escudo / hpMax) * 100;
                                if(percEscudo > 100) percEscudo = 100;
                                barShield.style.width = escudo > 0 ? percEscudo + '%' : '0%';
                            }
                            if(txtEscudo) txtEscudo.innerText = escudo > 0 ? `+${escudo}` : '';
                            
                            let caixaHp = document.getElementById(`caixa-hp-horda-${mId}`);
                            if(caixaHp) {
                                if(percHp <= 10 && hpMax > 0 && hpAtual > 0) caixaHp.classList.add('alerta-morte');
                                else caixaHp.classList.remove('alerta-morte');
                            }
                        }
                    }
                    if(usuarioAtual.cargo === 'Jogador') {
                        document.querySelectorAll('.esconder-jogador').forEach(el => el.style.display = 'none');
                    }
                    return; 
                }

                for(let chave in dados) {
                    if(chave === 'efeitos' || chave === 'grimorio') continue;
                    let idHTML = formatarIdElemento(numSlot, tipo, chave);
                    let el = document.getElementById(idHTML);
                    if(el && document.activeElement !== el) el.value = dados[chave];
                }

                if(tipo === 'heroi') {
                    let hpMaxBase = Number(dados['hp-max']) || 20;
                    let manaMaxBase = Number(dados['mana-max']) || 20;
                    let con = Number(dados['con']) || 0;
                    let int = Number(dados['int']) || 0;

                    let hpEfetivo = hpMaxBase + (con * 3);
                    let manaEfetivo = manaMaxBase + (int * 2);

                    let elHpEfetivo = document.getElementById(`slot${numSlot}-hp-efetivo`);
                    let elManaEfetivo = document.getElementById(`slot${numSlot}-mana-efetivo`);
                    if(elHpEfetivo) elHpEfetivo.innerText = hpEfetivo;
                    if(elManaEfetivo) elManaEfetivo.innerText = manaEfetivo;

                    let expTotal = Number(dados['expTotal']) || 0;
                    let levelData = getLevelData(expTotal);
                    let elLevel = document.getElementById(`slot${numSlot}-level-display`);
                    let numLevelSpan = document.getElementById(`slot${numSlot}-num-level`);
                    
                    if(elLevel && numLevelSpan) {
                        let lastLevel = elLevel.dataset.currentLevel || 1;
                        if(levelData.level > lastLevel) {
                            elLevel.classList.add('epic-level-up');
                            setTimeout(() => elLevel.classList.remove('epic-level-up'), 3000);
                        }
                        numLevelSpan.innerText = levelData.level;
                        elLevel.dataset.currentLevel = levelData.level;
                    }

                    let percExp = (levelData.currentExp / levelData.requiredForNext) * 100;
                    if(percExp > 100) percExp = 100;
                    document.getElementById(`bar-exp-slot${numSlot}`).style.width = `${percExp}%`;
                    
                    let expText = document.getElementById(`slot${numSlot}-exp-text`);
                    expText.innerText = `${levelData.currentExp} / ${levelData.requiredForNext}`;
                    let glow = percExp / 6;
                    expText.style.textShadow = `0 0 ${glow}px rgba(255, 215, 0, 0.9), 1px 1px 2px black`;
                    
                    // Lógica para Ouro Derretido que cresce com XP
                    const elBarra = document.getElementById(`bar-exp-slot${numSlot}`);
                    if(elBarra) {
                        let opacidade = 0.4 + (percExp / 100) * 0.6; // De 0.4 a 1.0
                        let blur = 10 + (percExp / 100) * 20; // De 10px a 30px
                        let spread = 2 + (percExp / 100) * 8; // De 2px a 10px
                        elBarra.style.setProperty('--brilho-xp-opacity', opacidade.toString());
                        elBarra.style.setProperty('--brilho-xp-blur', blur + 'px');
                        elBarra.style.setProperty('--brilho-xp-spread', spread + 'px');
                    }

                    let maxAtributos = 10 + (levelData.level - 1);
                    let ptsAtuais = 0;
                    ['for', 'des', 'con', 'int', 'sab', 'car', 'per'].forEach(a => ptsAtuais += Number(dados[a]) || 0);
                    let ptsLivres = maxAtributos - ptsAtuais;

                    let spanPts = document.getElementById(`slot${numSlot}-pts-livres`);
                    if(spanPts) {
                        spanPts.innerText = `( ${ptsLivres} / ${maxAtributos} )`;
                        spanPts.style.color = ptsLivres > 0 ? '#27ae60' : (ptsLivres === 0 ? '#b89c72' : '#d95757');
                    }

                    for(let i=1; i<=5; i++) {
                        let isEquipado = dados[`item${i}-equipado`] || false;
                        let btn = document.getElementById(`slot${numSlot}-btn-equip-${i}`);
                        if(!btn) continue;
                        if(isEquipado) {
                            btn.innerText = "Deseq."; btn.classList.add("equipado");
                            document.getElementById(`slot${numSlot}-item${i}-nome`).disabled = true;
                            document.getElementById(`slot${numSlot}-item${i}-attr1`).disabled = true;
                            document.getElementById(`slot${numSlot}-item${i}-mod1`).disabled = true;
                            document.getElementById(`slot${numSlot}-item${i}-attr2`).disabled = true;
                            document.getElementById(`slot${numSlot}-item${i}-mod2`).disabled = true;
                        } else {
                            btn.innerText = "Equip."; btn.classList.remove("equipado");
                        }
                    }
                }

                renderizarEfeitosNoSlot(numSlot, tipo, dados.efeitos || []);
                if(tipo === 'heroi') renderizarGrimorioNoSlot(numSlot, dados.grimorio || {});
                atualizarBarrasEAlertaNoSlot(numSlot, tipo);
                atualizarTooltipsAtributosNoSlot(numSlot, tipo, dados);
            });

            slotsDeVisao[numSlot].ouvinte = novoOuvinte;

            document.querySelectorAll(`.editavel-slot${numSlot}`).forEach(campo => {
                if(campo.classList.contains('horda-compact-input')) return; 
                const novoCampo = campo.cloneNode(true);
                campo.parentNode.replaceChild(novoCampo, campo);
                
                novoCampo.addEventListener('input', (e) => {
                    if (!e.target.disabled) {
                        let chaveCompleta = e.target.id;
                        let chaveDoBanco = chaveCompleta.replace(`slot${numSlot}-`, '');
                        if(tipo === 'monstro') {
                            chaveDoBanco = chaveDoBanco.replace('monstro-', '');
                            if(chaveCompleta === `slot${numSlot}-monstro-nome`) chaveDoBanco = 'nome';
                        }

                        let novoValor = e.target.value;

                        if (tipo === 'heroi' && ['for', 'des', 'con', 'int', 'sab', 'car', 'per'].includes(chaveDoBanco)) {
                            novoValor = Number(novoValor);
                            if (novoValor < 0) novoValor = 0;
                            if (novoValor > 20) novoValor = 20;

                            let dadosAntigos = slotsDeVisao[numSlot].dados || {};
                            let expT = Number(dadosAntigos['expTotal']) || 0;
                            let lvl = getLevelData(expT).level;
                            let maxA = 10 + (lvl - 1);

                            let sumOthers = 0;
                            ['for', 'des', 'con', 'int', 'sab', 'car', 'per'].forEach(a => {
                                if(a !== chaveDoBanco) sumOthers += Number(dadosAntigos[a]) || 0;
                            });

                            if (sumOthers + novoValor > maxA && usuarioAtual.cargo !== "Mestre") {
                                e.target.value = dadosAntigos[chaveDoBanco] || 0; 
                                return; 
                            }
                            e.target.value = novoValor; 
                        }
                        
                        // Lógica de limite para os Jogadores nas barras de HP e MANA
                        if (usuarioAtual.cargo === 'Jogador' && (chaveDoBanco === 'hp-atual' || chaveDoBanco === 'mana-atual')) {
                            if (novoValor !== "") {
                                novoValor = Number(novoValor);
                                if (novoValor < 0) novoValor = 0;
                                let maxVal = chaveDoBanco === 'hp-atual' ? 
                                    Number(document.getElementById(`slot${numSlot}-hp-efetivo`).innerText) || 20 : 
                                    Number(document.getElementById(`slot${numSlot}-mana-efetivo`).innerText) || 20;
                                if (novoValor > maxVal) novoValor = maxVal;
                                e.target.value = novoValor;
                            }
                        }
                        
                        update(ref(database, 'fichas/' + idFicha), { [chaveDoBanco]: novoValor });
                        if(chaveDoBanco.includes('hp') || chaveDoBanco.includes('mana')) atualizarBarrasEAlertaNoSlot(numSlot, tipo);
                    }
                });
            });
        }

        function atualizarBarrasEAlertaNoSlot(numSlot, tipo) {
            let prefixo = tipo === 'heroi' ? `slot${numSlot}` : `slot${numSlot}-monstro`;
            
            const hpAtual = Number(document.getElementById(`${prefixo}-hp-atual`).value) || 0;
            const hpMax = tipo === 'heroi' ? (Number(document.getElementById(`slot${numSlot}-hp-efetivo`).innerText) || 20) : (Number(document.getElementById(`${prefixo}-hp-max`).value) || 20);
            
            const manaAtual = Number(document.getElementById(`${prefixo}-mana-atual`).value) || 0;
            const manaMax = tipo === 'heroi' ? (Number(document.getElementById(`slot${numSlot}-mana-efetivo`).innerText) || 20) : (Number(document.getElementById(`${prefixo}-mana-max`).value) || 20);
            
            let percHp = (hpAtual / hpMax) * 100;
            let percMana = (manaAtual / manaMax) * 100;
            
            if (percHp > 100) percHp = 100; if (percHp < 0) percHp = 0;
            if (percMana > 100) percMana = 100; if (percMana < 0) percMana = 0;

            let barIdHp = tipo === 'heroi' ? `bar-hp-slot${numSlot}` : `bar-hp-monstro-slot${numSlot}`;
            let barIdMana = tipo === 'heroi' ? `bar-mana-slot${numSlot}` : `bar-mana-monstro-slot${numSlot}`;
            let caixaHpId = tipo === 'heroi' ? `caixa-hp-slot${numSlot}` : `caixa-hp-monstro-slot${numSlot}`;

            const barHpElement = document.getElementById(barIdHp);
            const barManaElement = document.getElementById(barIdMana);

            if (barHpElement) barHpElement.style.width = percHp + '%';
            if (barManaElement) barManaElement.style.width = percMana + '%';

            let escudo = Number(slotsDeVisao[numSlot].dados?.escudo) || 0;
            let barIdShield = tipo === 'heroi' ? `bar-shield-slot${numSlot}` : `bar-shield-monstro-slot${numSlot}`;
            let txtIdShield = tipo === 'heroi' ? `txt-escudo-slot${numSlot}` : `txt-escudo-monstro-slot${numSlot}`;
            let barShieldElement = document.getElementById(barIdShield);
            let txtShieldElement = document.getElementById(txtIdShield);

            if(barShieldElement) {
                let percEscudo = (escudo / hpMax) * 100;
                if(percEscudo > 100) percEscudo = 100;
                barShieldElement.style.width = escudo > 0 ? percEscudo + '%' : '0%';
            }
            if(txtShieldElement) {
                txtShieldElement.innerText = escudo > 0 ? `+${escudo}` : '';
            }

            const caixaHp = document.getElementById(caixaHpId);
            if(caixaHp) {
                if (percHp <= 10 && hpMax > 0 && hpAtual > 0) {
                    caixaHp.classList.add('alerta-morte');
                    if (barHpElement && tipo === 'heroi') barHpElement.classList.add('alerta-morte');
                } else {
                    caixaHp.classList.remove('alerta-morte');
                    if (barHpElement && tipo === 'heroi') barHpElement.classList.remove('alerta-morte');
                }
            }
        }

        window.processarUploadOtimizado = function(event, numSlot) {
            const file = event.target.files[0];
            if(!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 150; 
                    let width = img.width; let height = img.height;
                    if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
                    else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrlUltraLeve = canvas.toDataURL('image/webp', 0.6); 
                    const idFicha = slotsDeVisao[numSlot].idFicha;
                    if(idFicha) update(ref(database, 'fotos/' + idFicha), { base64: dataUrlUltraLeve });
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }

        window.adicionarEfeito = async function(numSlot, isMonstro) {
            const idFicha = slotsDeVisao[numSlot].idFicha;
            if(!idFicha) return;
            
            const p = `slot${numSlot}-novo-buff-`;
            const pos = isMonstro ? "-monstro" : "";
            
            const nome = document.getElementById(`${p}nome${pos}`).value;
            const modHp = Number(document.getElementById(`${p}hp${pos}`).value) || 0;
            const modMana = Number(document.getElementById(`${p}mana${pos}`).value) || 0;
            const attrDestino = document.getElementById(`${p}attr${pos}`).value;
            const modAttr = Number(document.getElementById(`${p}mod${pos}`).value) || 0;
            const turnos = Number(document.getElementById(`${p}turnos${pos}`).value);

            if(!nome || turnos <= 0) return alert("Preencha o Nome e os Turnos do efeito!");

            const refFicha = ref(database, 'fichas/' + idFicha);
            const snapshot = await get(refFicha);
            let dados = snapshot.val() || {};
            let efeitos = dados.efeitos || [];

            if (attrDestino && modAttr !== 0) {
                let attrAtual = Number(dados[attrDestino]) || 0;
                update(refFicha, { [attrDestino]: attrAtual + modAttr });
            }

            efeitos.push({ idUnico: Date.now(), nome, modHp, modMana, attrDestino, modAttr, turnos });
            update(refFicha, { efeitos });
            
            document.getElementById(`${p}nome${pos}`).value = '';
            document.getElementById(`${p}turnos${pos}`).value = '';
        }

        window.removerEfeito = async function(numSlot, idEfeito) {
            const idFicha = slotsDeVisao[numSlot].idFicha;
            if(!idFicha) return;
            const refFicha = ref(database, 'fichas/' + idFicha);
            const snapshot = await get(refFicha);
            let dados = snapshot.val() || {};
            let efeitos = dados.efeitos || [];

            let efeitoRemovido = efeitos.find(e => e.idUnico === idEfeito);
            let efeitosAtualizados = efeitos.filter(e => e.idUnico !== idEfeito);
            let pacoteAtualizacao = { efeitos: efeitosAtualizados };

            if (efeitoRemovido && efeitoRemovido.attrDestino && efeitoRemovido.modAttr !== 0) {
                let valorCorrente = Number(dados[efeitoRemovido.attrDestino]) || 0;
                pacoteAtualizacao[efeitoRemovido.attrDestino] = valorCorrente - efeitoRemovido.modAttr;
            }

            update(refFicha, pacoteAtualizacao);
        }

        window.avancarTurnoGlobal = async function() {
            if (usuarioAtual.cargo !== "Mestre") return;
            
            const refFichas = ref(database, 'fichas');
            const snapFichas = await get(refFichas);
            let fichas = snapFichas.val() || {};
            
            let pacoteGeral = {};
            
            for (let idFicha in fichas) {
                let dados = fichas[idFicha];
                let efeitos = dados.efeitos || [];
                if (efeitos.length === 0) continue;
                
                let hpAtual = Number(dados['hp-atual']) || 0;
                let manaAtual = Number(dados['mana-atual']) || 0;
                
                let isHero = Object.values(usuarios).some(u => u.idFicha === idFicha);
                let hpMax = Number(dados['hp-max']) || 20;
                let manaMax = Number(dados['mana-max']) || 20;
                
                if (isHero) {
                    hpMax += (Number(dados['con']) || 0) * 3;
                    manaMax += (Number(dados['int']) || 0) * 2;
                }
                
                let attrParaReverter = {};
                let efeitosAtualizados = efeitos.map(e => {
                    hpAtual += e.modHp;
                    manaAtual += e.modMana;
                    e.turnos -= 1;
                    
                    if (e.turnos <= 0 && e.attrDestino && e.modAttr !== 0) {
                        if(!attrParaReverter[e.attrDestino]) attrParaReverter[e.attrDestino] = 0;
                        attrParaReverter[e.attrDestino] += e.modAttr; 
                    }
                    return e;
                }).filter(e => e.turnos > 0);
                
                if(hpAtual > hpMax) hpAtual = hpMax;
                if(manaAtual > manaMax) manaAtual = manaMax;
                if(hpAtual < 0) hpAtual = 0;
                if(manaAtual < 0) manaAtual = 0;
                
                pacoteGeral[`fichas/${idFicha}/efeitos`] = efeitosAtualizados;
                pacoteGeral[`fichas/${idFicha}/hp-atual`] = hpAtual;
                pacoteGeral[`fichas/${idFicha}/mana-atual`] = manaAtual;
                
                for (let attr in attrParaReverter) {
                    let valorCorrente = Number(dados[attr]) || 0;
                    pacoteGeral[`fichas/${idFicha}/${attr}`] = valorCorrente - attrParaReverter[attr];
                }
            }
            
            const snapHordas = await get(ref(database, 'hordas'));
            let hordas = snapHordas.val() || {};
            for (let idHorda in hordas) {
                let dados = hordas[idHorda];
                let efeitos = dados.efeitos || [];
                if (efeitos.length === 0) continue;
                
                let efeitosAtualizados = efeitos.map(e => { e.turnos -= 1; return e; }).filter(e => e.turnos > 0);
                pacoteGeral[`hordas/${idHorda}/efeitos`] = efeitosAtualizados;
            }
            
            if (Object.keys(pacoteGeral).length > 0) {
                await update(ref(database), pacoteGeral);
            }
        }

        function renderizarEfeitosNoSlot(numSlot, tipo, efeitos) {
            const pos = tipo === 'monstro' ? "-monstro" : "";
            const listaDiv = document.getElementById(`lista-efeitos${pos}-slot${numSlot}`);
            if(!listaDiv) return;
            listaDiv.innerHTML = '';
            
            efeitos.forEach(efeito => {
                const isDebuff = (efeito.modHp < 0 || efeito.modMana < 0 || efeito.modAttr < 0);
                let detalhes = [];
                if(efeito.modHp !== 0) detalhes.push(`HP: ${efeito.modHp > 0 ? '+' : ''}${efeito.modHp}/t`);
                if(efeito.modMana !== 0) detalhes.push(`Mana: ${efeito.modMana > 0 ? '+' : ''}${efeito.modMana}/t`);
                if(efeito.attrDestino && efeito.modAttr !== 0) detalhes.push(`${efeito.attrDestino.toUpperCase()}: ${efeito.modAttr > 0 ? '+' : ''}${efeito.modAttr}`);
                
                listaDiv.innerHTML += `
                    <div class="buff-item ${isDebuff ? 'debuff-item' : ''}">
                        <div>
                            <strong style="color: ${isDebuff ? '#d95757' : '#27ae60'}">${efeito.nome}</strong>
                            <span style="font-size: 10px; margin-left: 10px; color: #9c8464;">(${detalhes.join(' | ')})</span>
                        </div>
                        <div>
                            <span style="margin-right: 15px;">⏳ <b>${efeito.turnos}</b></span>
                            <button class="btn-remover esconder-jogador" onclick="removerEfeito(${numSlot}, ${efeito.idUnico})" title="Remover Efeito">🗑️</button>
                        </div>
                    </div>
                `;
            });
        }

        function atualizarTooltipsAtributosNoSlot(numSlot, tipo, dados) {
            const atributos = ['for', 'des', 'con', 'int', 'sab', 'car', 'per'];
            const prefixo = tipo === 'heroi' ? `slot${numSlot}` : `slot${numSlot}-monstro`;
            
            let modsItens = {for:0, des:0, con:0, int:0, sab:0, car:0, per:0};
            if(tipo === 'heroi') {
                for(let i=1; i<=5; i++) {
                    if(dados[`item${i}-equipado`]) {
                        let a1 = dados[`item${i}-attr1`]; let m1 = Number(dados[`item${i}-mod1`]) || 0;
                        let a2 = dados[`item${i}-attr2`]; let m2 = Number(dados[`item${i}-mod2`]) || 0;
                        if(modsItens[a1] !== undefined) modsItens[a1] += m1;
                        if(modsItens[a2] !== undefined) modsItens[a2] += m2;
                    }
                }
            }

            let modsBuffs = {for:0, des:0, con:0, int:0, sab:0, car:0, per:0};
            (dados.efeitos || []).forEach(e => {
                if(e.attrDestino && modsBuffs[e.attrDestino] !== undefined) modsBuffs[e.attrDestino] += (Number(e.modAttr) || 0);
            });

            atributos.forEach(attr => {
                let total = Number(dados[attr]) || 0;
                let mItem = modsItens[attr] || 0;
                let mBuff = modsBuffs[attr] || 0;
                let base = total - mItem - mBuff;
                
                let inputEl = document.getElementById(`${prefixo}-${attr}`);
                if(inputEl && inputEl.parentElement) {
                    let txt = `Nativo: ${base}\nItens: ${mItem > 0 ? '+'+mItem : mItem}\nEfeitos: ${mBuff > 0 ? '+'+mBuff : mBuff}`;
                    inputEl.parentElement.title = txt;
                    inputEl.title = txt;
                }
            });
        }

        window.executarAtaque = async function(numSlot) {
            const inputDano = document.getElementById(`slot${numSlot}-ataque-dano`);
            const dano = Number(inputDano.value);
            
            if(!dano || dano <= 0) return alert("Insira um valor de dano válido!");

            const checkboxes = document.querySelectorAll(`.alvo-ataque-slot${numSlot}:checked`);
            if(checkboxes.length === 0) return alert("Selecione pelo menos um alvo para o ataque!");

            const alvos = Array.from(checkboxes).map(cb => cb.value);

            for(let alvo of alvos) {
                const refFicha = ref(database, 'fichas/' + alvo);
                const snapshot = await get(refFicha);
                let dados = snapshot.val() || {};
                let hpAtual = Number(dados['hp-atual']) || 0;
                let escudo = Number(dados['escudo']) || 0;
                
                let danoRestante = dano;
                if(escudo > 0) {
                    if(escudo >= danoRestante) {
                        escudo -= danoRestante;
                        danoRestante = 0;
                    } else {
                        danoRestante -= escudo;
                        escudo = 0;
                    }
                    update(refFicha, { 'escudo': escudo });
                }
                
                if(danoRestante > 0) {
                    hpAtual -= danoRestante;
                    if(hpAtual < 0) hpAtual = 0;
                    update(refFicha, { 'hp-atual': hpAtual });
                }
            }
            
            inputDano.value = '';
            checkboxes.forEach(cb => cb.checked = false);
        };

        window.lancarAmeacaFicha = function(numSlot) {
            const idAlvo = slotsDeVisao[numSlot].idFicha;
            if(idAlvo) update(ref(database, 'estado_combate'), { ativo: idAlvo });
        }
        
        window.abaterAmeacaFicha = function(numSlot) {
            const idAlvo = slotsDeVisao[numSlot].idFicha;
            if(idAlvo) {
                if(ameacaEmCombateGlobal === idAlvo) remove(ref(database, 'estado_combate/ativo'));
                
                // Zera HP dependendo se é horda ou monstro
                if(slotsDeVisao[numSlot].tipo === 'horda') {
                    // Pra hordas, abater pode significar só remover de combate, mas vamos manter simples
                    alert("A horda foi removida da mesa. Seus membros permanecem salvos.");
                } else {
                    update(ref(database, 'fichas/' + idAlvo), { 'hp-atual': 0 });
                }
            }
        }

        window.deletarAmeacaFicha = function(numSlot) {
            const idAlvo = slotsDeVisao[numSlot].idFicha;
            if(!idAlvo) return;
            
            if(confirm("Tem certeza que deseja DELETAR esta ameaça para sempre?")) {
                if(ameacaEmCombateGlobal === idAlvo) remove(ref(database, 'estado_combate/ativo')); 
                
                if(idAlvo.startsWith('horda_')) {
                    remove(ref(database, 'hordas/' + idAlvo));
                } else {
                    remove(ref(database, 'fotos/' + idAlvo));
                    remove(ref(database, 'lista_monstros/' + idAlvo));
                    remove(ref(database, 'fichas/' + idAlvo));
                }

                if(slotsDeVisao[1].idFicha === idAlvo) limparSlot(1);
                if(slotsDeVisao[2].idFicha === idAlvo) limparSlot(2);
            }
        }

        window.deletarAmeaca = function() {
            const idAlvo = document.getElementById('seletor-ameaca').value;
            if(!idAlvo) return;
            
            if(confirm("Tem certeza que deseja DELETAR esta ameaça para sempre?")) {
                if(ameacaEmCombateGlobal === idAlvo) ameacaDerrotada(); 
                
                if(idAlvo.startsWith('horda_')) {
                    remove(ref(database, 'hordas/' + idAlvo));
                } else {
                    remove(ref(database, 'fotos/' + idAlvo));
                    remove(ref(database, 'lista_monstros/' + idAlvo));
                    remove(ref(database, 'fichas/' + idAlvo));
                }

                document.getElementById('seletor-ameaca').value = "";
                if(slotsDeVisao[1].idFicha === idAlvo) limparSlot(1);
                if(slotsDeVisao[2].idFicha === idAlvo) limparSlot(2);
                atualizarBotoesMestre();
            }
        }

        function initHudGlobais() {
            const listDiv = document.getElementById('hud-players-list');
            if(!listDiv) return;
            
            let finalHTML = '';
            playersList.forEach(p => {
                finalHTML += `
                    <div class="hud-player" id="hud-player-${p}">
                        <div class="hud-name">${p.toUpperCase()}</div>
                        <div class="hud-stats-row">
                            <span style="color:#27ae60; font-weight:bold; font-size:11px;">HP:</span>
                            <div>
                                <input type="number" id="hud-${p}-hp-atual" class="hud-input hud-stat-field" onchange="atualizarHudMestre('${p}', 'hp-atual', this.value)"> / 
                                <span id="hud-${p}-hp-max" style="font-weight:bold; font-size:11px; display:inline-block; width:25px; text-align:left;">20</span>
                            </div>
                        </div>
                        <div class="hud-mini-bar-bg"><div class="hud-mini-bar-fill hud-hp-fill" id="hud-${p}-bar-hp" style="width:100%;"></div></div>
                        <div class="hud-stats-row" style="margin-top: 5px;">
                            <span style="color:#2980b9; font-weight:bold; font-size:11px;">MP:</span>
                            <div>
                                <input type="number" id="hud-${p}-mana-atual" class="hud-input hud-stat-field" onchange="atualizarHudMestre('${p}', 'mana-atual', this.value)"> / 
                                <span id="hud-${p}-mana-max" style="font-weight:bold; font-size:11px; display:inline-block; width:25px; text-align:left;">20</span>
                            </div>
                        </div>
                        <div class="hud-mini-bar-bg"><div class="hud-mini-bar-fill hud-mana-fill" id="hud-${p}-bar-mana" style="width:100%;"></div></div>
                    </div>`;
            });
            listDiv.innerHTML = finalHTML;
            
            onValue(ref(database, 'fichas'), (snapshot) => {
                if(!usuarioAtual || usuarioAtual.cargo !== "Mestre") return;
                const dados = snapshot.val() || {};
                playersList.forEach(p => preencherHUDJogadorVisualmente(p, dados[p] || {}));
            });
        }

        function preencherHUDJogadorVisualmente(jogadorId, dadosJogador) {
            const hpAtual = Number(dadosJogador['hp-atual']) || 0;
            const hpMaxBase = dadosJogador['hp-max'] !== undefined ? Number(dadosJogador['hp-max']) : 20; 
            const con = Number(dadosJogador['con']) || 0;
            const hpMaxEfetivo = hpMaxBase + (con * 3);

            const manaAtual = Number(dadosJogador['mana-atual']) || 0;
            const manaMaxBase = dadosJogador['mana-max'] !== undefined ? Number(dadosJogador['mana-max']) : 20; 
            const int = Number(dadosJogador['int']) || 0;
            const manaMaxEfetivo = manaMaxBase + (int * 2);
            
            let percHp = hpMaxEfetivo > 0 ? (hpAtual/hpMaxEfetivo)*100 : 0; 
            let percMana = manaMaxEfetivo > 0 ? (manaAtual/manaMaxEfetivo)*100 : 0; 
            if(percHp>100) percHp=100; if(percHp<0) percHp=0;
            if(percMana>100) percMana=100; if(percMana<0) percMana=0;
            
            let elHpAtual = document.getElementById(`hud-${jogadorId}-hp-atual`);
            let elHpMax = document.getElementById(`hud-${jogadorId}-hp-max`);
            let elManaAtual = document.getElementById(`hud-${jogadorId}-mana-atual`);
            let elManaMax = document.getElementById(`hud-${jogadorId}-mana-max`);

            if(elHpAtual && document.activeElement !== elHpAtual) elHpAtual.value = hpAtual;
            if(elHpMax) elHpMax.innerText = hpMaxEfetivo; 
            if(elManaAtual && document.activeElement !== elManaAtual) elManaAtual.value = manaAtual;
            if(elManaMax) elManaMax.innerText = manaMaxEfetivo;

            let barHp = document.getElementById(`hud-${jogadorId}-bar-hp`);
            let barMana = document.getElementById(`hud-${jogadorId}-bar-mana`);
            if(barHp) barHp.style.width = percHp + '%';
            if(barMana) barMana.style.width = percMana + '%';
        }

        window.toggleHudMestre = function() {
            hudVisivel = !hudVisivel;
            const hud = document.getElementById('hud-mestre');
            const btn = document.getElementById('btn-toggle-hud');
            if(hudVisivel) {
                hud.style.display = 'flex';
                btn.style.left = '250px'; 
                btn.innerText = "〰️";
            } else {
                hud.style.display = 'none';
                btn.style.left = '15px';
                btn.innerText = "👁️ Grupo";
            }
        }

        window.renderizarGrimorioNoSlot = function(numSlot, grimorio) {
            const divAtivas = document.getElementById(`lista-habilidades-ativas-slot${numSlot}`);
            const divPassivas = document.getElementById(`lista-habilidades-passivas-slot${numSlot}`);
            if(!divAtivas || !divPassivas) return;
            
            divAtivas.innerHTML = '';
            divPassivas.innerHTML = '';
            
            const temPermissao = (usuarioAtual.cargo === "Mestre") || (usuarioAtual.idFicha === slotsDeVisao[numSlot].idFicha);
            
            for(let habId in grimorio) {
                let hab = grimorio[habId];
                let corBorda = '#d4af37';
                let icon = '✨';
                if(hab.tipo === 'ativa') { corBorda = '#d95757'; icon = '⚔️'; }
                else if(hab.tipo === 'cura') { corBorda = '#27ae60'; icon = '🌿'; }
                else if(hab.tipo === 'passiva') { corBorda = '#b89c72'; icon = '🛡️'; }
                
                let btnHtml = '';
                if(hab.tipo !== 'passiva') {
                    btnHtml = `<button onclick="usarHabilidade(${numSlot}, '${habId}')" style="background: rgba(0,0,0,0.5); border: 1px solid ${corBorda}; color: ${corBorda}; padding: 3px 8px; font-weight: bold; cursor: pointer;">${icon} USAR</button>`;
                }
                
                let delHtml = temPermissao ? `<button onclick="deletarHabilidade(${numSlot}, '${habId}')" style="background: none; border: none; color: #8c1c13; cursor: pointer; font-size: 14px; margin-left: 10px;" title="Apagar Habilidade">🗑️</button>` : '';
                
                let div = document.createElement('div');
                div.style.cssText = `border: 1px solid ${corBorda}; padding: 10px; margin-bottom: 10px; background: rgba(10, 5, 2, 0.8); border-radius: 4px;`;
                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                        <div>
                            <strong style="color: ${corBorda}; font-size: 16px;">${hab.nome}</strong>
                            <div style="font-size: 11px; color: #b89c72;">Custo: <span style="color:#d99c57;">${hab.ap} AP</span> | <span style="color:#2980b9;">${hab.mana} Mana</span></div>
                        </div>
                        <div style="display: flex; align-items: center;">
                            ${btnHtml}
                            ${delHtml}
                        </div>
                    </div>
                    <div style="font-size: 12px; color: #dcd0ba; margin-top: 5px; font-style: italic;">
                        ${hab.desc}
                    </div>
                `;
                
                if(hab.tipo === 'passiva') divPassivas.appendChild(div);
                else divAtivas.appendChild(div);
            }
        };

        window.atualizarHudMestre = function(jogadorId, campo, valor) {
            if(valor === "") return;
            update(ref(database, 'fichas/' + jogadorId), { [campo]: Number(valor) });
        }

        window.jogadorAtacar = async function(numSlot, area) {
            const inputDano = document.getElementById(`slot${numSlot}-jogador-ataque-dano`);
            const critico = document.getElementById(`slot${numSlot}-jogador-critico`).checked;
            let dano = Number(inputDano.value) || 0;
            if(dano <= 0) return alert("Insira um valor de dano base válido!");
            if(critico) dano = dano * 2;
            
            const checkboxes = document.querySelectorAll(`#alvos-combate-slot${numSlot} input[type="checkbox"]:checked`);
            if(checkboxes.length === 0) return alert("Selecione pelo menos um alvo!");
            
            for(let cb of checkboxes) {
                let idAlvo = cb.value;
                if(idAlvo.startsWith("horda_")) {
                    let hordaId = ameacaEmCombateGlobal;
                    let mId = idAlvo.split("_")[1];
                    let refMembro = ref(database, `hordas/${hordaId}/membros/${mId}`);
                    let snap = await get(refMembro);
                    if(snap.exists()) {
                        let mDados = snap.val();
                        let hpAtual = Number(mDados['hp-atual']) || 0;
                        let escudo = Number(mDados['escudo']) || 0;
                        let danoRestante = dano;
                        if(escudo > 0) {
                            if(escudo >= danoRestante) { escudo -= danoRestante; danoRestante = 0; }
                            else { danoRestante -= escudo; escudo = 0; }
                            update(refMembro, { escudo: escudo });
                        }
                        if(danoRestante > 0) {
                            hpAtual -= danoRestante;
                            if(hpAtual < 0) hpAtual = 0;
                            update(refMembro, { 'hp-atual': hpAtual });
                        }
                    }
                } else {
                    let refMonstro = ref(database, `fichas/${idAlvo}`);
                    let snap = await get(refMonstro);
                    if(snap.exists()) {
                        let mDados = snap.val();
                        let hpAtual = Number(mDados['hp-atual']) || 0;
                        let escudo = Number(mDados['escudo']) || 0;
                        let danoRestante = dano;
                        if(escudo > 0) {
                            if(escudo >= danoRestante) { escudo -= danoRestante; danoRestante = 0; }
                            else { danoRestante -= escudo; escudo = 0; }
                            update(refMonstro, { escudo: escudo });
                        }
                        if(danoRestante > 0) {
                            hpAtual -= danoRestante;
                            if(hpAtual < 0) hpAtual = 0;
                            update(refMonstro, { 'hp-atual': hpAtual });
                        }
                    }
                }
            }
            
            inputDano.value = '';
            document.getElementById(`slot${numSlot}-jogador-critico`).checked = false;
            checkboxes.forEach(cb => cb.checked = false);
        };
        
        window.adicionarHabilidade = function(numSlot) {
            let nome = document.getElementById(`slot${numSlot}-hab-nome`).value;
            let ap = Number(document.getElementById(`slot${numSlot}-hab-ap`).value) || 0;
            let mana = Number(document.getElementById(`slot${numSlot}-hab-mana`).value) || 0;
            let tipo = document.getElementById(`slot${numSlot}-hab-tipo`).value;
            let desc = document.getElementById(`slot${numSlot}-hab-desc`).value;
            
            if(!nome) return alert("Habilidade precisa de um nome!");
            
            const idFicha = slotsDeVisao[numSlot].idFicha;
            const habId = "hab_" + Date.now();
            
            update(ref(database, `fichas/${idFicha}/grimorio/${habId}`), {
                nome, ap, mana, tipo, desc
            });
            
            document.getElementById(`slot${numSlot}-hab-nome`).value = '';
            document.getElementById(`slot${numSlot}-hab-ap`).value = '0';
            document.getElementById(`slot${numSlot}-hab-mana`).value = '0';
            document.getElementById(`slot${numSlot}-hab-desc`).value = '';
        };

        window.deletarHabilidade = function(numSlot, habId) {
            if(confirm("Tem certeza que deseja apagar essa habilidade do grimório?")) {
                const idFicha = slotsDeVisao[numSlot].idFicha;
                remove(ref(database, `fichas/${idFicha}/grimorio/${habId}`));
            }
        };

        window.usarHabilidade = function(numSlot, habId) {
            const idFicha = slotsDeVisao[numSlot].idFicha;
            get(ref(database, `fichas/${idFicha}/grimorio/${habId}`)).then(snap => {
                if(snap.exists()) {
                    let hab = snap.val();
                    let manaAtual = Number(document.getElementById(`slot${numSlot}-mana-atual`).value) || 0;
                    let apAtual = Number(document.getElementById(`slot${numSlot}-ap`).value) || 0;
                    
                    if(hab.mana > manaAtual) return alert("Mana insuficiente para usar " + hab.nome + "!");
                    if(hab.ap > apAtual) return alert("AP insuficiente para usar " + hab.nome + "!");
                    
                    update(ref(database, `fichas/${idFicha}`), {
                        'mana-atual': manaAtual - hab.mana,
                        'ap': apAtual - hab.ap
                    });
                    
                    // Se for de ataque, move o jogador para a aba de combate
                    if(hab.tipo === 'ativa') {
                        alternarAbaHeroi(numSlot, 'combate');
                    } else {
                        alert(`Habilidade ${hab.nome} usada!`);
                    }
                }
            });
        };
