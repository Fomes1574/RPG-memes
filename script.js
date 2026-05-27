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
        // ESTADO DO MODAL DO GRIMÓRIO
        // ==========================================
        let _grimorioModal = {
            aberto: false,
            numSlot: null,
            idFicha: null,
            abaAtiva: 'ativas',
            ouvinte: null,
            equiparLock: false
        };

        // ==========================================
        // MAPEAMENTO DE RAÇAS E CLASSES (Extraído do PDF)
        // ==========================================
        const RACAS = {
            "Humano": {
                habilidades: [
                    { nome: "Adaptável", tipo: "Ativa", desc: "Pode refazer 1 teste por sessão" }
                ]
            },
            "Elfo": {
                habilidades: [
                    { nome: "Visão Aguçada", tipo: "Passiva", desc: "Enxerga no escuro" },
                    { nome: "Afinidade Arcana", tipo: "Passiva", desc: "Bônus em testes mágicos" }
                ]
            },
            "Anão": {
                habilidades: [
                    { nome: "Resistência Anã", tipo: "Passiva", desc: "Resistência contra efeitos negativos (debuffs)" }
                ]
            },
            "Orc": {
                habilidades: [
                    { nome: "Fúria", tipo: "Ativa", desc: "Pode causar dano extra por alguns turnos" }
                ]
            },
            "Gnomo": {
                habilidades: [
                    { nome: "Natureza Mística", tipo: "Passiva", desc: "Bônus em magia ou criação de poções" },
                    { nome: "Mente Rápida", tipo: "Passiva", desc: "Vantagem contra ilusões ou efeitos mentais; +2 Percepção" }
                ]
            },
            "Halfling": {
                habilidades: [
                    { nome: "Sorte Incrível", tipo: "Ativa", desc: "Pode rerrolar 1 dado por sessão" }
                ]
            },
            "Khajiit": {
                habilidades: [
                    { nome: "Sentidos Felinos", tipo: "Passiva", desc: "Bônus em percepção e visão noturna; +2 Percepção" },
                    { nome: "Garras Naturais", tipo: "Passiva", desc: "Ataque desarmado causa dano extra" }
                ]
            },
            "Argoniano": {
                habilidades: [
                    { nome: "Regeneração", tipo: "Passiva", desc: "Recupera pequena quantidade de vida ao longo do tempo" },
                    { nome: "Anfíbio", tipo: "Passiva", desc: "Respira debaixo d'água e nada com facilidade; +2 Destreza (quando debaixo d'água)" },
                    { nome: "Resistência Natural", tipo: "Passiva", desc: "Bônus contra doenças e venenos" }
                ]
            }
        };

        const CLASSES = {
            "Guerreiro": {
                habilidades: [
                    { nome: "Especialista em Combate", tipo: "Passiva", desc: "Bônus com todas as armas" },
                    { nome: "Postura Defensiva", tipo: "Ativa", desc: "Reduz dano recebido por alguns turnos" }
                ]
            },
            "Paladino": {
                habilidades: [
                    { nome: "Golpe Sagrado", tipo: "Passiva", desc: "Causa dano extra contra inimigos malignos" },
                    { nome: "Cura Divina", tipo: "Ativa", desc: "Pode curar a si ou aliados" }
                ]
            },
            "Druida": {
                habilidades: [
                    { nome: "Forma Selvagem", tipo: "Ativa", desc: "Transforma-se em animal temporariamente (até 3 vezes por sessão)" },
                    { nome: "Vínculo com a Natureza", tipo: "Passiva", desc: "Conhecimento com plantas, cogumelos e ervas; pode conversar com animais" }
                ]
            },
            "Bárbaro": {
                habilidades: [
                    { nome: "Fúria", tipo: "Ativa", desc: "Aumenta dano e resistência por alguns turnos" },
                    { nome: "Resistência Brutal", tipo: "Passiva", desc: "Reduz dano físico recebido" }
                ]
            },
            "Arqueiro": {
                habilidades: [
                    { nome: "Tiro Preciso", tipo: "Passiva", desc: "Maior chance de acerto crítico" },
                    { nome: "Olho de Águia", tipo: "Passiva", desc: "Acerta o alvo com facilidade" }
                ]
            },
            "Ladino": {
                habilidades: [
                    { nome: "Ataque Furtivo", tipo: "Passiva", desc: "Causa dano crítico ao atacar desprevenido" },
                    { nome: "Evasão", tipo: "Passiva", desc: "Maior chance de esquivar" },
                    { nome: "Especialista em Perícias", tipo: "Passiva", desc: "Bônus em furtividade, lockpick, etc." }
                ]
            },
            "Mago": {
                habilidades: [
                    { nome: "Regeneração de Mana", tipo: "Passiva", desc: "Recupera mana mais rápido" }
                ]
            },
            "Curandeiro": {
                habilidades: [
                    { nome: "Cura Maior", tipo: "Ativa", desc: "Recupera vida de aliados" },
                    { nome: "Proteção Espiritual", tipo: "Passiva", desc: "Reduz dano recebido pelo grupo" },
                    { nome: "Purificação", tipo: "Ativa", desc: "Remove efeitos negativos" }
                ]
            },
            "Bardo": {
                habilidades: [
                    { nome: "Inspiração", tipo: "Passiva", desc: "Concede bônus a aliados" },
                    { nome: "Canção Arcana", tipo: "Passiva", desc: "Pode causar efeitos mágicos variados" },
                    { nome: "Manipulação Social", tipo: "Passiva", desc: "Bônus em diálogo" }
                ]
            },
            "Monge": {
                habilidades: [
                    { nome: "Golpes Rápidos", tipo: "Passiva", desc: "Múltiplos ataques por turno" },
                    { nome: "Ki Interior", tipo: "Ativa", desc: "Usa energia para aumentar a resistência" },
                    { nome: "Esquiva Suprema", tipo: "Passiva", desc: "Alta evasão" }
                ]
            }
        };

        // ==========================================
        // ESTADO DE DEBOUNCE E RACE CONDITION
        // ==========================================
        const _habilidadeDebounceTimers = {};
        const _habilidadeLock = {};

        // ==========================================
        // HELPERS DE HABILIDADES
        // ==========================================
        function _normalizarNomeParaKey(nome) {
            return nome.trim().toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]/g, '_');
        }

        function _gerarHabilidadesDoPersonagem(racaNome, classeNome) {
            const habs = {};
            const racaData = RACAS[racaNome];
            const classeData = CLASSES[classeNome];

            if (racaData) {
                racaData.habilidades.forEach(h => {
                    const key = 'raca_' + _normalizarNomeParaKey(h.nome);
                    habs[key] = { nome: h.nome, tipo: h.tipo, desc: h.desc, origem: 'raca', origemNome: racaNome };
                });
            }
            if (classeData) {
                classeData.habilidades.forEach(h => {
                    const key = 'classe_' + _normalizarNomeParaKey(h.nome);
                    habs[key] = { nome: h.nome, tipo: h.tipo, desc: h.desc, origem: 'classe', origemNome: classeNome };
                });
            }
            return habs;
        }

        function _validarRacaClasse(raca, classe) {
            const racaValida = !raca || !!RACAS[raca];
            const classeValida = !classe || !!CLASSES[classe];
            return { racaValida, classeValida };
        }

        async function _sincronizarHabilidadesNoFirebase(idFicha, racaNome, classeNome) {
            if (_habilidadeLock[idFicha]) return;
            _habilidadeLock[idFicha] = true;

            try {
                const { racaValida, classeValida } = _validarRacaClasse(racaNome, classeNome);
                if (!racaValida || !classeValida) {
                    console.warn('[Habilidades] Raça ou classe inválida:', racaNome, classeNome);
                    return;
                }

                const refHabs = ref(database, `fichas/${idFicha}/habilidades`);

                // 1. Remove TODAS as habilidades antigas
                await remove(refHabs);

                // 2. Gera novas habilidades
                const novasHabs = _gerarHabilidadesDoPersonagem(racaNome, classeNome);

                // 3. Insere as novas habilidades (se houver)
                if (Object.keys(novasHabs).length > 0) {
                    await update(refHabs, novasHabs);
                }

                console.log('[Habilidades] Sincronizado:', idFicha, '| Raça:', racaNome, '| Classe:', classeNome, '| Total:', Object.keys(novasHabs).length);
            } catch (err) {
                console.error('[Habilidades] Erro ao sincronizar:', err);
            } finally {
                _habilidadeLock[idFicha] = false;
            }
        }

        function _agendarSincronizacaoHabilidades(idFicha, racaNome, classeNome, delay = 600) {
            const key = `${idFicha}_habs`;
            if (_habilidadeDebounceTimers[key]) clearTimeout(_habilidadeDebounceTimers[key]);
            _habilidadeDebounceTimers[key] = setTimeout(() => {
                _sincronizarHabilidadesNoFirebase(idFicha, racaNome, classeNome);
                delete _habilidadeDebounceTimers[key];
            }, delay);
        }

        function _atualizarUIHabilidades(numSlot, racaNome, classeNome) {
            _renderizarGrimorio(numSlot, racaNome, classeNome);
            _renderizarPassivas(numSlot, racaNome, classeNome);
        }

        function _renderizarGrimorio(numSlot, racaNome, classeNome) {
            const elGrimorio = document.getElementById(`slot${numSlot}-grimorio-lista`);
            if (!elGrimorio) return;

            const racaData = RACAS[racaNome];
            const classeData = CLASSES[classeNome];
            const todasHabs = [];

            if (racaData) {
                racaData.habilidades
                    .filter(h => h.tipo === 'Ativa')
                    .forEach(h => todasHabs.push({ ...h, origem: racaNome }));
            }
            if (classeData) {
                classeData.habilidades
                    .filter(h => h.tipo === 'Ativa')
                    .forEach(h => todasHabs.push({ ...h, origem: classeNome }));
            }

            if (todasHabs.length === 0) {
                elGrimorio.innerHTML = `<div style="color:#5c3a21; font-style:italic; font-size:12px; text-align:center; padding:10px;">Nenhuma habilidade ativa.</div>`;
                return;
            }

            elGrimorio.innerHTML = todasHabs.map(h => `
                <div class="hab-item hab-ativa" title="${h.desc}">
                    <span class="hab-origem">[${h.origem}]</span>
                    <strong class="hab-nome">${h.nome}</strong>
                    <span class="hab-tipo hab-tipo-ativa">⚡ Ativa</span>
                    <p class="hab-desc">${h.desc}</p>
                </div>
            `).join('');
        }

        function _renderizarPassivas(numSlot, racaNome, classeNome) {
            const elPassivas = document.getElementById(`slot${numSlot}-passivas-lista`);
            if (!elPassivas) return;

            const racaData = RACAS[racaNome];
            const classeData = CLASSES[classeNome];
            const todasPassivas = [];

            if (racaData) {
                racaData.habilidades
                    .filter(h => h.tipo === 'Passiva')
                    .forEach(h => todasPassivas.push({ ...h, origem: racaNome }));
            }
            if (classeData) {
                classeData.habilidades
                    .filter(h => h.tipo === 'Passiva')
                    .forEach(h => todasPassivas.push({ ...h, origem: classeNome }));
            }

            if (todasPassivas.length === 0) {
                elPassivas.innerHTML = `<div style="color:#5c3a21; font-style:italic; font-size:12px; text-align:center; padding:10px;">Nenhuma passiva ativa.</div>`;
                return;
            }

            elPassivas.innerHTML = todasPassivas.map(h => `
                <div class="hab-item hab-passiva" title="${h.desc}">
                    <span class="hab-origem">[${h.origem}]</span>
                    <strong class="hab-nome">${h.nome}</strong>
                    <span class="hab-tipo hab-tipo-passiva">🛡️ Passiva</span>
                    <p class="hab-desc">${h.desc}</p>
                </div>
            `).join('');
        }

        // ==========================================
        // MODAL DO GRIMÓRIO — IMPLEMENTAÇÃO COMPLETA
        // ==========================================
        function _criarDomModal() {
            if (document.getElementById('grimorio-modal')) return;
            const el = document.createElement('div');
            el.id = 'grimorio-modal';
            el.innerHTML = `
                <div id="grimorio-modal-inner">
                    <div id="grimorio-modal-header">
                        <span id="grimorio-modal-titulo">📖 Grimório</span>
                        <button id="grimorio-modal-fechar" onclick="fecharGrimorio()" title="Fechar">✕</button>
                    </div>
                    <div id="grimorio-modal-abas">
                        <button id="grimorio-aba-ativas"  class="grimorio-aba grimorio-aba-on" onclick="_grimorioTrocarAba('ativas')">⚡ Ativas</button>
                        <button id="grimorio-aba-passivas" class="grimorio-aba"               onclick="_grimorioTrocarAba('passivas')">🛡️ Passivas</button>
                    </div>
                    <div id="grimorio-modal-corpo"></div>
                </div>
            `;
            document.body.appendChild(el);
            // Fechar ao clicar no backdrop
            el.addEventListener('mousedown', (e) => { if (e.target === el) fecharGrimorio(); });
            document.addEventListener('keydown', _grimorioEscHandler);
        }

        function _grimorioEscHandler(e) {
            if (e.key === 'Escape' && _grimorioModal.aberto) fecharGrimorio();
        }

        function _normalizarParaImagem(nome) {
            return nome.trim().toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '');
        }

        function _buildCard(h, idFicha, numSlot) {
            const imgKey  = _normalizarParaImagem(h.nome);
            const imgPath = `Imagens/${imgKey}.png`;
            const isAtiva = h.tipo === 'Ativa';
            const nomeEsc = (h.nome || '').replace(/'/g, "\\'");
            const inicial = (h.nome || '?').charAt(0).toUpperCase();
            return `
                <div class="grimo-card ${isAtiva ? 'grimo-card-ativa' : 'grimo-card-passiva'}">
                    <div class="grimo-card-icon-wrap">
                        <img class="grimo-card-icon" src="${imgPath}" alt="${h.nome}"
                            onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                        <div class="grimo-card-icon-fallback" style="display:none;">${inicial}</div>
                    </div>
                    <div class="grimo-card-body">
                        <div class="grimo-card-origem">[${h.origemNome || h.origem || ''}]</div>
                        <div class="grimo-card-nome">${h.nome}</div>
                        <div class="grimo-card-desc">${h.desc || ''}</div>
                        <div class="grimo-card-stats">
                            <span class="grimo-stat grimo-stat-mana" title="Custo de Mana">💧 ${h.custoMana !== undefined ? h.custoMana : '—'}</span>
                            <span class="grimo-stat grimo-stat-dano" title="Dano / Cura">⚔️ ${h.danoCura !== undefined ? h.danoCura : '—'}</span>
                        </div>
                    </div>
                    ${isAtiva ? `<button class="grimo-card-btn-equipar"
                        onclick="_grimorioEquipar(this,'${idFicha}',${numSlot},'${nomeEsc}')">Equipar</button>` : ''}
                </div>`;
        }

        function _grimorioRenderizarCorpo() {
            const corpo = document.getElementById('grimorio-modal-corpo');
            if (!corpo) return;
            const { idFicha, numSlot, abaAtiva } = _grimorioModal;
            const dados = slotsDeVisao[numSlot]?.dados || {};
            
            const racaNome = dados.raca || '';
            const classeNome = dados.classe || '';
            const racaData = RACAS[racaNome];
            const classeData = CLASSES[classeNome];

            const lista = [];
            const addHabilidades = (dataObj, origemName) => {
                if (!dataObj) return;
                dataObj.habilidades.forEach(h => {
                    if ((abaAtiva === 'ativas' && h.tipo === 'Ativa') || (abaAtiva === 'passivas' && h.tipo === 'Passiva')) {
                        lista.push({ ...h, origemNome: origemName });
                    }
                });
            };
            addHabilidades(racaData, racaNome);
            addHabilidades(classeData, classeNome);

            if (lista.length === 0) {
                corpo.innerHTML = `<div class="grimo-empty">Nenhuma habilidade ${abaAtiva === 'ativas' ? 'ativa' : 'passiva'}.<br><small>Defina a raça e classe do personagem.</small></div>`;
                return;
            }
            corpo.innerHTML = lista.map(h => _buildCard(h, idFicha, numSlot)).join('');
            _grimorioAtualizarBotoes();
        }

        // Atualiza botões (idempotente para onValue) sem re-renderizar todo o corpo e perder scroll
        function _grimorioAtualizarBotoes() {
            const corpo = document.getElementById('grimorio-modal-corpo');
            if (!corpo || !_grimorioModal.aberto) return;
            const dados = slotsDeVisao[_grimorioModal.numSlot]?.dados || {};
            const equipada = dados.habilidadeEquipada || null;
            
            corpo.querySelectorAll('.grimo-card').forEach(card => {
                const btn = card.querySelector('.grimo-card-btn-equipar');
                if (!btn) return;
                if (card.querySelector('.grimo-card-nome')?.textContent === equipada) {
                    btn.textContent = '✓ Equipada';
                    btn.classList.add('grimo-equipada');
                } else {
                    btn.textContent = 'Equipar';
                    btn.classList.remove('grimo-equipada');
                }
            });
        }

        window._grimorioTrocarAba = function(aba) {
            _grimorioModal.abaAtiva = aba;
            document.querySelectorAll('.grimorio-aba').forEach(b => b.classList.remove('grimorio-aba-on'));
            document.getElementById(`grimorio-aba-${aba}`)?.classList.add('grimorio-aba-on');
            _grimorioRenderizarCorpo();
        };

        window._grimorioEquipar = async function(btnEl, idFicha, numSlot, nomeHab) {
            if (_grimorioModal.equiparLock) return;
            _grimorioModal.equiparLock = true;
            btnEl.disabled = true;
            try {
                await update(ref(database, `fichas/${idFicha}`), { habilidadeEquipada: nomeHab });
                btnEl.textContent = '✓ Equipada';
                btnEl.classList.add('grimo-equipada');
                setTimeout(() => fecharGrimorio(), 500);
            } catch(err) {
                console.error('[Grimório] Erro ao equipar:', err);
                btnEl.disabled = false;
            } finally {
                setTimeout(() => { _grimorioModal.equiparLock = false; }, 700);
            }
        };

        window.abrirGrimorio = function(numSlot) {
            const slot = slotsDeVisao[numSlot];
            if (!slot || !slot.idFicha || slot.tipo !== 'heroi') return;
            // Toggle se mesmo slot
            if (_grimorioModal.aberto && _grimorioModal.numSlot === numSlot) { fecharGrimorio(); return; }
            if (_grimorioModal.aberto) fecharGrimorio();

            _criarDomModal();
            _grimorioModal.aberto  = true;
            _grimorioModal.numSlot = numSlot;
            _grimorioModal.idFicha = slot.idFicha;
            _grimorioModal.abaAtiva = 'ativas';

            // Posicionar ao lado esquerdo da ficha (position:fixed, sem reflow)
            const container = document.getElementById(`container-slot${numSlot}-heroi`);
            if (container) {
                const rect  = container.getBoundingClientRect();
                const inner = document.getElementById('grimorio-modal-inner');
                const topVal  = Math.max(rect.top + window.scrollY, 10);
                const leftVal = Math.max(rect.left - 330, 10);
                inner.style.top  = topVal + 'px';
                inner.style.left = leftVal + 'px';
            }

            // Resetar abas para "Ativas"
            document.querySelectorAll('.grimorio-aba').forEach(b => b.classList.remove('grimorio-aba-on'));
            document.getElementById('grimorio-aba-ativas')?.classList.add('grimorio-aba-on');

            document.getElementById('grimorio-modal').classList.add('grimorio-aberto');
            _grimorioRenderizarCorpo();
        };

        window.fecharGrimorio = function() {
            const modal = document.getElementById('grimorio-modal');
            if (!modal) return;
            modal.classList.remove('grimorio-aberto');
            _grimorioModal.aberto  = false;
            _grimorioModal.numSlot = null;
            _grimorioModal.idFicha = null;
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
                        <select id="slot${numSlot}-item${i}-attr1" class="editavel-slot${numSlot}">${optionsAttrs}</select>
                        <input type="number" id="slot${numSlot}-item${i}-mod1" class="editavel-slot${numSlot}" placeholder="+Mod">
                        <select id="slot${numSlot}-item${i}-attr2" class="editavel-slot${numSlot}">${optionsAttrs}</select>
                        <input type="number" id="slot${numSlot}-item${i}-mod2" class="editavel-slot${numSlot}" placeholder="+Mod">
                        <button id="slot${numSlot}-btn-equip-${i}" onclick="toggleEquipar(${numSlot}, ${i})" class="editavel-slot${numSlot} btn-equipar">Equipar</button>
                    </div>`;
            }

            return `
            <div class="container" id="container-slot${numSlot}-heroi">
                <div class="header-grid">
                    <div style="display: flex; flex-direction: column;">
                        <img id="img-foto-slot${numSlot}" class="foto-personagem" src="" alt="Sem foto">
                        <label class="btn-upload editavel-slot${numSlot}-label esconder-jogador">📁 Enviar do PC<input type="file" class="editavel-slot${numSlot}" accept="image/png, image/jpeg, image/webp" style="display:none;" onchange="processarUploadOtimizado(event, ${numSlot})"></label>
                    </div>
                    <div class="info-grid">
                        <div style="display: flex; gap: 10px; grid-column: span 2; align-items: center; border-bottom: 1px dashed #3a2212; padding-bottom: 10px;">
                            <div style="flex: 1;"><label>Nome do Herói</label><input type="text" id="slot${numSlot}-nome" class="editavel-slot${numSlot}"></div>
                            <div style="width: 130px; text-align: center;">
                                <label style="color:#d4af37; font-size: 12px;">NÍVEL</label>
                                <div class="level-display" id="slot${numSlot}-level-display" data-current-level="1">LV. <span id="slot${numSlot}-num-level">1</span></div>
                            </div>
                        </div>
                        <div><label>Jogador</label><input type="text" id="slot${numSlot}-jogador" class="editavel-slot${numSlot}" readonly></div>
                        <div><label>Linhagem / Raça</label><input type="text" id="slot${numSlot}-raca" class="editavel-slot${numSlot}"></div>
                        <div><label>Vocação / Classe</label><input type="text" id="slot${numSlot}-classe" class="editavel-slot${numSlot}"></div>
                        <div><label>Gênero</label><input type="text" id="slot${numSlot}-genero" class="editavel-slot${numSlot}"></div>
                    </div>
                </div>

                <div class="section-title">Essência Vital</div>
                <div class="status-grid">
                    <div id="caixa-hp-slot${numSlot}" class="caixa-status">
                        <label style="color: #27ae60; text-align: center;">HP</label>
                        <div class="fraction-input">
                            <input type="number" id="slot${numSlot}-hp-atual" class="editavel-slot${numSlot}" style="color: #27ae60;"><span>/</span><span id="slot${numSlot}-hp-efetivo" style="color: #27ae60; font-size: 20px; font-weight: bold; width:40px; display:inline-block; text-align:left;">20</span>
                        </div>
                        <div class="mestre-only-flex" style="justify-content:center; align-items:center; margin-top:5px; gap:5px;">
                            <label style="margin:0; color:#9c8464;">Base Máx (Mestre):</label>
                            <input type="number" id="slot${numSlot}-hp-max" class="editavel-slot${numSlot} mestre-unlocked" title="Vida Base Máxima (Padrão 20)" style="width:50px; padding:2px; font-size:11px;">
                        </div>
                        <div class="bar-bg"><div class="bar-fill hp-fill" id="bar-hp-slot${numSlot}" style="width: 100%;"></div></div>
                    </div>
                    
                    <div class="caixa-status">
                        <label style="color: #2980b9; text-align: center;">MANA</label>
                        <div class="fraction-input">
                            <input type="number" id="slot${numSlot}-mana-atual" class="editavel-slot${numSlot}" style="color: #2980b9;"><span>/</span><span id="slot${numSlot}-mana-efetivo" style="color: #2980b9; font-size: 20px; font-weight: bold; width:40px; display:inline-block; text-align:left;">20</span>
                        </div>
                        <div class="mestre-only-flex" style="justify-content:center; align-items:center; margin-top:5px; gap:5px;">
                            <label style="margin:0; color:#9c8464;">Base Máx (Mestre):</label>
                            <input type="number" id="slot${numSlot}-mana-max" class="editavel-slot${numSlot} mestre-unlocked" title="Mana Base Máxima (Padrão 20)" style="width:50px; padding:2px; font-size:11px;">
                        </div>
                        <div class="bar-bg"><div class="bar-fill mana-fill" id="bar-mana-slot${numSlot}" style="width: 100%;"></div></div>
                    </div>

                    <div class="caixa-status" style="grid-column: span 2; padding: 0 10px;">
                        <div style="display:flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px;">
                            <label style="color: #ffd700; margin: 0; text-shadow: 1px 1px 2px black;">EXPERIÊNCIA</label>
                            <div id="slot${numSlot}-exp-text" class="exp-text">0 / 100</div>
                        </div>
                        <div class="bar-bg" style="height: 14px; position: relative;">
                            <div class="bar-fill exp-fill" id="bar-exp-slot${numSlot}" style="width: 0%;"></div>
                        </div>
                    </div>

                    <div><label>Ação (AP)</label><input type="number" id="slot${numSlot}-ap" class="editavel-slot${numSlot}" style="color:#d99c57;"></div>
                    <div><label>Moedas de Ouro</label><input type="number" id="slot${numSlot}-ouro" class="editavel-slot${numSlot}" style="color:#d4af37;"></div>
                    <div style="grid-column: span 2;"><label>Condição Física</label><input type="text" id="slot${numSlot}-condicao" class="editavel-slot${numSlot}"></div>
                </div>

                <div class="section-title">Atributos Primordiais <span id="slot${numSlot}-pts-livres" style="font-size: 11px; color: #ffd700; font-weight: bold;">(0 Livres)</span></div>
                <div class="atributos-grid">
                    <div class="attr-box"><label>FOR</label><input type="number" id="slot${numSlot}-for" class="editavel-slot${numSlot}"></div>
                    <div class="attr-box"><label>DES</label><input type="number" id="slot${numSlot}-des" class="editavel-slot${numSlot}"></div>
                    <div class="attr-box"><label>CON</label><input type="number" id="slot${numSlot}-con" class="editavel-slot${numSlot}"></div>
                    <div class="attr-box"><label>INT</label><input type="number" id="slot${numSlot}-int" class="editavel-slot${numSlot}"></div>
                    <div class="attr-box"><label>SAB</label><input type="number" id="slot${numSlot}-sab" class="editavel-slot${numSlot}"></div>
                    <div class="attr-box"><label>CAR</label><input type="number" id="slot${numSlot}-car" class="editavel-slot${numSlot}"></div>
                    <div class="attr-box"><label>PER</label><input type="number" id="slot${numSlot}-per" class="editavel-slot${numSlot}"></div>
                </div>

                <div class="section-title">Itens Equipados (Máx 5)</div>
                <div class="equipamentos-container">${eqHtml}</div>

                <div class="section-title">
                    <span>📖 Grimório de Habilidades</span>
                    <button id="slot${numSlot}-btn-grimorio" onclick="abrirGrimorio(${numSlot})" style="font-size:10px; padding:4px 10px; background:linear-gradient(to bottom,#3a2a0a,#1c1208); border-color:#d4af37; color:#d4af37; letter-spacing:1px; margin:0;">✦ Abrir</button>
                </div>
                <div id="slot${numSlot}-grimorio-lista" class="hab-container">
                    <div style="color:#5c3a21; font-style:italic; font-size:12px; text-align:center; padding:10px;">Selecione uma raça e classe.</div>
                </div>

                <div class="section-title">🛡️ Habilidades Passivas</div>
                <div id="slot${numSlot}-passivas-lista" class="hab-container">
                    <div style="color:#5c3a21; font-style:italic; font-size:12px; text-align:center; padding:10px;">Selecione uma raça e classe.</div>
                </div>

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

                <div class="section-title">Anotações e Relatos</div>
                <div class="info-grid">
                    <div><label>Aparência Física</label><textarea id="slot${numSlot}-aparencia" class="editavel-slot${numSlot}" rows="3"></textarea></div>
                    <div><label>Anotações do Viajante</label><textarea id="slot${numSlot}-extra" class="editavel-slot${numSlot}" rows="3"></textarea></div>
                </div>
            </div>`;
        }

        function gerarHtmlMonstro(numSlot) {
            let alvosHtml = playersList.map(p => `<label class="checkbox-alvo"><input type="checkbox" value="${p}" class="alvo-ataque-slot${numSlot}"> ${p}</label>`).join('');
            
            return `
            <div class="container monstro-theme" id="container-slot${numSlot}-monstro">
                <div class="header-grid" style="grid-template-columns: 100px 1fr;">
                    <div style="display: flex; flex-direction: column;">
                        <img id="img-foto-monstro-slot${numSlot}" class="foto-personagem" src="" alt="Sem foto" style="width:100px; height:100px;">
                        <label class="btn-upload editavel-slot${numSlot}-label esconder-jogador">📁 Upload<input type="file" class="editavel-slot${numSlot}" accept="image/png, image/jpeg, image/webp" style="display:none;" onchange="processarUploadOtimizado(event, ${numSlot})"></label>
                    </div>
                    <div style="display: flex; flex-direction: column; justify-content: center;">
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
                        <div class="bar-bg"><div class="bar-fill hp-fill" id="bar-hp-monstro-slot${numSlot}" style="width: 100%;"></div></div>
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
                        <div><label style="color: #d95757;">Dano</label><input type="number" id="slot${numSlot}-ataque-dano" class="editavel-slot${numSlot}" placeholder="Valor" style="width: 80px;"></div>
                        <div style="flex: 1;"><label style="color: #b89c72;">Alvos (Players)</label><div style="display: flex; gap: 15px; flex-wrap: wrap; background: rgba(0,0,0,0.5); padding: 10px; border: 1px solid #3a2212; border-radius: 4px; min-height: 20px; align-items: center;">${alvosHtml}</div></div>
                        <button class="editavel-slot${numSlot}" onclick="executarAtaque(${numSlot})" style="background: linear-gradient(to bottom, #752020, #4a1111); border-color:#8c1c13; padding: 10px 20px;">ATACAR ⚔️</button>
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
                    document.getElementById('btn-toggle-hud').style.display = "block"; 
                    preencherDropdownsMestre();
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
                if(usuarioAtual.cargo === "Mestre") preencherDropdownsMestre();
            });

            onValue(ref(database, 'hordas'), (snapshot) => {
                hordasNoBanco = snapshot.val() || {};
                if(usuarioAtual.cargo === "Mestre") preencherDropdownsMestre();
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
                }
                if (usuarioAtual.cargo === "Mestre") {
                    atualizarBotoesMestre();
                }
                // Sidebar: re-renderizar alvos com nova ameaça
                if (typeof sbAtualizar === 'function') sbAtualizar();
            });
        }

        // ==========================================
        // GESTÃO DE MENUS E SLOTS DO MESTRE
        // ==========================================
        function preencherDropdownsMestre() {
            if(usuarioAtual.cargo !== "Mestre") return;
            
            let htmlJogadores = `<option value="">👤 Jogadores...</option>` + playersList.map(p => `<option value="${p}">${p.toUpperCase()}</option>`).join('');
            let htmlMonstros = `<option value="">💀 Monstros...</option>`;
            for(let id in monstrosNoBanco) { htmlMonstros += `<option value="${id}">${monstrosNoBanco[id].nome}</option>`; }
            
            let htmlHordas = `<option value="">🛡️ Hordas...</option>`;
            for(let id in hordasNoBanco) { htmlHordas += `<option value="${id}">${hordasNoBanco[id].nome}</option>`; }
            
            ['1', '2'].forEach(t => {
                let sP = document.getElementById(`mestre-t${t}-player`);
                let sM = document.getElementById(`mestre-t${t}-monstro`);
                let sH = document.getElementById(`mestre-t${t}-horda`);
                let vP = sP.value, vM = sM.value, vH = sH.value;
                
                sP.innerHTML = htmlJogadores; sP.value = vP;
                sM.innerHTML = htmlMonstros; sM.value = vM;
                sH.innerHTML = htmlHordas; sH.value = vH;
            });

            const selAmeaca = document.getElementById('seletor-ameaca');
            let vAmeaca = selAmeaca.value;
            let optMonstros = ``; let optHordas = ``;
            for(let id in monstrosNoBanco) { optMonstros += `<option value="${id}">💀 ${monstrosNoBanco[id].nome}</option>`; }
            for(let id in hordasNoBanco) { optHordas += `<option value="${id}">🛡️ ${hordasNoBanco[id].nome}</option>`; }
            
            document.getElementById('optgroup-monstros').innerHTML = optMonstros;
            document.getElementById('optgroup-hordas').innerHTML = optHordas;
            
            if (vAmeaca && (monstrosNoBanco[vAmeaca] || hordasNoBanco[vAmeaca])) {
                selAmeaca.value = vAmeaca;
            }
        }

        window.mestreAbrir = function(numSlot, tipo, valor) {
            if(!valor) return;
            if(tipo !== 'heroi') document.getElementById(`mestre-t${numSlot}-player`).value = '';
            if(tipo !== 'monstro') document.getElementById(`mestre-t${numSlot}-monstro`).value = '';
            if(tipo !== 'horda') document.getElementById(`mestre-t${numSlot}-horda`).value = '';
            abrirFichaNoSlot(numSlot, tipo, valor);
        }

        window.mestreLimpar = function(numSlot) {
            document.getElementById(`mestre-t${numSlot}-player`).value = '';
            document.getElementById(`mestre-t${numSlot}-monstro`).value = '';
            document.getElementById(`mestre-t${numSlot}-horda`).value = '';
            limparSlot(numSlot);
        }

        function limparSlot(numSlot) {
            document.getElementById('slot-' + numSlot).innerHTML = '';
            document.getElementById('slot-' + numSlot).style.display = 'none';
            if (slotsDeVisao[numSlot] && slotsDeVisao[numSlot].ouvinte) { 
                slotsDeVisao[numSlot].ouvinte(); 
                slotsDeVisao[numSlot].ouvinte = null;
            }
            slotsDeVisao[numSlot] = { ouvinte: null, idFicha: null, tipo: null, dados: {} };

            // Cleanup: estado órfão do modal
            if (typeof _grimorioModal !== 'undefined' && _grimorioModal.aberto && _grimorioModal.numSlot === numSlot) {
                if (typeof fecharGrimorio === 'function') fecharGrimorio();
            }
            // Atualizar sidebar se fechar o slot de herói
            if (typeof sbAtualizar === 'function') sbAtualizar();
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
            let h = `<div class="section-title" style="color:#d4af37; border-color:#8b6d43; margin-top:0;">🛡️ ${nomeHorda}</div>`;
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
                <div class="horda-member-card">
                    <div style="display:flex; justify-content: start; align-items:center; gap: 20px; margin-bottom: 10px; border-bottom: 1px dashed #5c1818; padding-bottom: 5px;">
                        <h4 style="color:#a84242; margin:0; text-transform: uppercase; font-size: 14px;">${m.nome}</h4>
                        
                        <div style="display:flex; gap:12px;">
                            <div id="caixa-hp-horda-${mId}" class="caixa-status ${isAlertaMorte}" style="padding: 2px; flex: 1;">
                                <div style="color:#27ae60; font-size:10px; font-weight:bold; display: flex; justify-content: center; align-items: center; gap: 3px;">
                                    HP: 
                                    <input type="number" id="horda-${mId}-hp-atual" class="horda-compact-input editavel-slot${numSlot}" value="${hpAtual}" style="width:45px; color:#27ae60; padding:1px; font-size: 10px;"> / 
                                    <input type="number" id="horda-${mId}-hp-max" class="horda-compact-input mestre-unlocked" value="${hpMax}" style="width:45px; color:#27ae60; padding:1px; font-size: 10px;" disabled>
                                </div>
                                <div class="bar-bg" style="height: 5px; margin-top: 3px;"><div class="bar-fill hp-fill" id="bar-hp-horda-${mId}" style="width: ${percHp}%;"></div></div>
                            </div>
                            
                            <div id="caixa-mana-horda-${mId}" class="caixa-status" style="padding: 2px; flex: 1;">
                                <div style="color:#2980b9; font-size:10px; font-weight:bold; display: flex; justify-content: center; align-items: center; gap: 3px;">
                                    MP: 
                                    <input type="number" id="horda-${mId}-mana-atual" class="horda-compact-input editavel-slot${numSlot}" value="${manaAtual}" style="width:45px; color:#2980b9; padding:1px; font-size: 10px;"> / 
                                    <input type="number" id="horda-${mId}-mana-max" class="horda-compact-input mestre-unlocked" value="${manaMax}" style="width:45px; color:#2980b9; padding:1px; font-size: 10px;" disabled>
                                </div>
                                <div class="bar-bg" style="height: 5px; margin-top: 3px;"><div class="bar-fill mana-fill" id="bar-mana-horda-${mId}" style="width: ${percMana}%;"></div></div>
                            </div>
                        </div>
                        
                    </div>
                    <div class="atributos-grid" style="grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 5px;">
                        <div class="attr-box" style="padding: 4px;"><label style="font-size:9px;">FOR</label><input type="number" id="horda-${mId}-for" class="horda-compact-input editavel-slot${numSlot}" value="${m.for || 0}" style="font-size:12px; width:100%; box-sizing:border-box;"></div>
                        <div class="attr-box" style="padding: 4px;"><label style="font-size:9px;">DES</label><input type="number" id="horda-${mId}-des" class="horda-compact-input editavel-slot${numSlot}" value="${m.des || 0}" style="font-size:12px; width:100%; box-sizing:border-box;"></div>
                        <div class="attr-box" style="padding: 4px;"><label style="font-size:9px;">CON</label><input type="number" id="horda-${mId}-con" class="horda-compact-input editavel-slot${numSlot}" value="${m.con || 0}" style="font-size:12px; width:100%; box-sizing:border-box;"></div>
                        <div class="attr-box" style="padding: 4px;"><label style="font-size:9px;">INT</label><input type="number" id="horda-${mId}-int" class="horda-compact-input editavel-slot${numSlot}" value="${m.int || 0}" style="font-size:12px; width:100%; box-sizing:border-box;"></div>
                        <div class="attr-box" style="padding: 4px;"><label style="font-size:9px;">SAB</label><input type="number" id="horda-${mId}-sab" class="horda-compact-input editavel-slot${numSlot}" value="${m.sab || 0}" style="font-size:12px; width:100%; box-sizing:border-box;"></div>
                        <div class="attr-box" style="padding: 4px;"><label style="font-size:9px;">CAR</label><input type="number" id="horda-${mId}-car" class="horda-compact-input editavel-slot${numSlot}" value="${m.car || 0}" style="font-size:12px; width:100%; box-sizing:border-box;"></div>
                        <div class="attr-box" style="padding: 4px;"><label style="font-size:9px;">PER</label><input type="number" id="horda-${mId}-per" class="horda-compact-input editavel-slot${numSlot}" value="${m.per || 0}" style="font-size:12px; width:100%; box-sizing:border-box;"></div>
                    </div>
                    <div class="esconder-jogador" style="margin-top: 15px; display:flex; gap:10px; align-items:center;">
                        <input type="number" id="ataque-dano-${mId}" placeholder="Dano" style="width: 50px; padding:3px; font-size:10px; background:rgba(0,0,0,0.5); border:1px solid #4a2e1b; color:#fff; text-align:center;">
                        <div style="display:flex; gap:8px;">${alvosHtmlCheckbox(mId)}</div>
                        <button onclick="atacarMembroHorda('${mId}')" style="padding: 4px 8px; font-size:9px; background: linear-gradient(to bottom, #752020, #4a1111); border-color:#8c1c13; margin-left:auto;">Atacar ⚔️</button>
                    </div>
                </div>`;
            }
            h += `</div>`;
            return h;
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
                        let debounceHorda = {};
                        document.querySelectorAll(`.horda-compact-input.editavel-slot${numSlot}`).forEach(input => {
                            if(!input.classList.contains('mestre-unlocked')) { input.disabled = !temPermissao; }
                            
                            input.addEventListener('input', (e) => {
                                if(e.target.disabled) return;
                                let parts = e.target.id.split('-'); 
                                let mId = parts[1];
                                let campo = parts.slice(2).join('-');
                                let valor = Number(e.target.value);
                                if (isNaN(valor)) return; // Guard
                                
                                let debounceKey = `${mId}-${campo}`;
                                if (debounceHorda[debounceKey]) clearTimeout(debounceHorda[debounceKey]);
                                debounceHorda[debounceKey] = setTimeout(() => {
                                    update(ref(database, `hordas/${idFicha}/membros/${mId}`), { [campo]: valor })
                                        .catch(err => console.error('[Horda] Erro ao sincronizar', err));
                                }, 250);
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
                    if(chave === 'efeitos') continue;
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
                    
                    // Lógica para Brilho Reluzente Dourado que cresce com XP
                    let glowValue = 5 + (percExp / 100) * 25;
                    const elContainer = document.getElementById(`container-slot${numSlot}-heroi`);
                    if(elContainer) elContainer.style.setProperty('--brilho-xp-escala', glowValue.toString());

                    let maxAtributos = 10 + (levelData.level - 1);
                    let ptsAtuais = 0;
                    ['for', 'des', 'con', 'int', 'sab', 'car', 'per'].forEach(a => ptsAtuais += Number(dados[a]) || 0);
                    let ptsLivres = maxAtributos - ptsAtuais;

                    let spanPts = document.getElementById(`slot${numSlot}-pts-livres`);
                    if(spanPts) {
                        spanPts.innerText = `(${ptsLivres} Livres de ${maxAtributos})`;
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
                atualizarBarrasEAlertaNoSlot(numSlot, tipo);
                atualizarTooltipsAtributosNoSlot(numSlot, tipo, dados);

                // Atualizar UI de habilidades quando dados da ficha chegam
                if (tipo === 'heroi') {
                    const racaAtual = dados['raca'] || '';
                    const classeAtual = dados['classe'] || '';
                    _atualizarUIHabilidades(numSlot, racaAtual, classeAtual);
                    // Atualizar modal (se aberto no slot) para refletir mudança de classe rápida
                    if (_grimorioModal.aberto && _grimorioModal.numSlot === numSlot) {
                        _grimorioRenderizarCorpo();
                    }
                    // Atualizar sidebar de combate (alvos, passivas, magia)
                    if (typeof sbAtualizar === 'function') sbAtualizar();
                }
            });

            slotsDeVisao[numSlot].ouvinte = novoOuvinte;

            document.querySelectorAll(`.editavel-slot${numSlot}`).forEach(campo => {
                if(campo.classList.contains('horda-compact-input')) return; 
                const novoCampo = campo.cloneNode(true);
                campo.parentNode.replaceChild(novoCampo, campo);
                
                let inputDebounce = {};
                
                novoCampo.addEventListener('input', (e) => {
                    if (e.target.disabled) return;
                    
                    let chaveCompleta = e.target.id;
                    let chaveDoBanco = chaveCompleta.replace(`slot${numSlot}-`, '');
                    if(tipo === 'monstro') {
                        chaveDoBanco = chaveDoBanco.replace('monstro-', '');
                        if(chaveCompleta === `slot${numSlot}-monstro-nome`) chaveDoBanco = 'nome';
                    }

                    let novoValor = e.target.value;

                    // Validação robusta de Atributos
                    if (tipo === 'heroi' && ['for', 'des', 'con', 'int', 'sab', 'car', 'per'].includes(chaveDoBanco)) {
                        novoValor = Number(novoValor);
                        if (isNaN(novoValor) || novoValor < 0) novoValor = 0;
                        if (novoValor > 20) novoValor = 20;

                        let dadosAntigos = slotsDeVisao[numSlot]?.dados || {};
                        let expT = Number(dadosAntigos['expTotal']) || 0;
                        let lvl = getLevelData(expT).level;
                        let maxA = 10 + (lvl - 1);

                        let sumOthers = 0;
                        ['for', 'des', 'con', 'int', 'sab', 'car', 'per'].forEach(a => {
                            if(a !== chaveDoBanco) sumOthers += Number(dadosAntigos[a]) || 0;
                        });

                        if (sumOthers + novoValor > maxA && usuarioAtual.cargo !== "Mestre") {
                            novoValor = Number(dadosAntigos[chaveDoBanco]) || 0; 
                        }
                        e.target.value = novoValor; 
                    }
                    
                    // Validação de barras (HP / MANA)
                    if (usuarioAtual.cargo === 'Jogador' && (chaveDoBanco === 'hp-atual' || chaveDoBanco === 'mana-atual')) {
                        if (novoValor !== "") {
                            novoValor = Number(novoValor);
                            if (isNaN(novoValor) || novoValor < 0) novoValor = 0;
                            let maxVal = chaveDoBanco === 'hp-atual' ? 
                                Number(document.getElementById(`slot${numSlot}-hp-efetivo`)?.innerText) || 20 : 
                                Number(document.getElementById(`slot${numSlot}-mana-efetivo`)?.innerText) || 20;
                            if (novoValor > maxVal) novoValor = maxVal;
                            e.target.value = novoValor;
                        }
                    }
                    
                    // Guards Finais contra corrupção do Firebase
                    if (novoValor === undefined || novoValor === null) return;
                    if (typeof novoValor === 'number' && isNaN(novoValor)) return;
                    
                    // Debounce state push
                    if (inputDebounce[chaveDoBanco]) clearTimeout(inputDebounce[chaveDoBanco]);
                    inputDebounce[chaveDoBanco] = setTimeout(() => {
                        update(ref(database, 'fichas/' + idFicha), { [chaveDoBanco]: novoValor })
                            .catch(err => console.error('[Fichas] Sync erro:', err));
                    }, 250);
                    
                    if(chaveDoBanco.includes('hp') || chaveDoBanco.includes('mana')) atualizarBarrasEAlertaNoSlot(numSlot, tipo);

                    // Sincronização UI -> Firebase para Raça/Classe
                    if (tipo === 'heroi' && (chaveDoBanco === 'raca' || chaveDoBanco === 'classe')) {
                        const racaVal = document.getElementById(`slot${numSlot}-raca`)?.value.trim() || '';
                        const classeVal = document.getElementById(`slot${numSlot}-classe`)?.value.trim() || '';
                        _atualizarUIHabilidades(numSlot, racaVal, classeVal);
                        _agendarSincronizacaoHabilidades(idFicha, racaVal, classeVal);
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

            const caixaHp = document.getElementById(caixaHpId);
            if(caixaHp) {
                if (percHp <= 10 && hpMax > 0 && hpAtual > 0) { caixaHp.classList.add('alerta-morte'); } 
                else { caixaHp.classList.remove('alerta-morte'); }
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

        window.toggleEquipar = async function(numSlot, slotEq) {
            if(usuarioAtual.cargo !== "Mestre" && slotsDeVisao[numSlot].tipo !== 'heroi') return;
            const idFicha = slotsDeVisao[numSlot].idFicha;
            
            const refFicha = ref(database, 'fichas/' + idFicha);
            const snapshot = await get(refFicha);
            let dados = snapshot.val() || {};

            const isEquipado = dados[`item${slotEq}-equipado`] || false;
            const attr1 = dados[`item${slotEq}-attr1`];
            const mod1 = Number(dados[`item${slotEq}-mod1`]) || 0;
            const attr2 = dados[`item${slotEq}-attr2`];
            const mod2 = Number(dados[`item${slotEq}-mod2`]) || 0;

            let pacoteAtualizacao = {};
            pacoteAtualizacao[`item${slotEq}-equipado`] = !isEquipado;
            let multiplier = isEquipado ? -1 : 1; 

            if (attr1 && mod1 !== 0) {
                let atual = Number(dados[attr1]) || 0;
                pacoteAtualizacao[attr1] = atual + (mod1 * multiplier);
                dados[attr1] = pacoteAtualizacao[attr1]; 
            }
            if (attr2 && mod2 !== 0) {
                let atual = Number(dados[attr2]) || 0;
                pacoteAtualizacao[attr2] = atual + (mod2 * multiplier);
            }
            update(refFicha, pacoteAtualizacao);
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
                
                hpAtual -= dano;
                if(hpAtual < 0) hpAtual = 0;
                update(refFicha, { 'hp-atual': hpAtual });
            }
            
            inputDano.value = '';
            checkboxes.forEach(cb => cb.checked = false);
        };

        window.selecionarAmeacaMestre = function(idAmeaca) {
            if(!idAmeaca) return;
            if(idAmeaca.startsWith('horda_')) {
                document.getElementById('mestre-t2-horda').value = idAmeaca;
                mestreAbrir(2, 'horda', idAmeaca);
            } else {
                document.getElementById('mestre-t2-monstro').value = idAmeaca;
                mestreAbrir(2, 'monstro', idAmeaca);
            }
            atualizarBotoesMestre();
        }

        window.lancarAmeaca = function() {
            const idAlvo = document.getElementById('seletor-ameaca').value;
            if(idAlvo) update(ref(database, 'estado_combate'), { ativo: idAlvo });
        }
        
        window.ameacaDerrotada = function() {
            remove(ref(database, 'estado_combate/ativo'));
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

        function atualizarBotoesMestre() {
            if(usuarioAtual.cargo !== "Mestre") return;
            const btnLancar = document.getElementById('btn-lancar');
            const btnDerrotado = document.getElementById('btn-derrotado');
            const btnDeletar = document.getElementById('btn-deletar');
            const idPainel = document.getElementById('seletor-ameaca').value;
            
            if(idPainel) {
                btnDeletar.style.display = "inline-block";
                if(ameacaEmCombateGlobal === idPainel) {
                    btnLancar.style.display = "none"; btnDerrotado.style.display = "inline-block";
                } else {
                    btnLancar.style.display = "inline-block"; btnDerrotado.style.display = "none";
                }
            } else {
                btnLancar.style.display = "none"; btnDerrotado.style.display = "none"; btnDeletar.style.display = "none";
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
                        <div class="hud-mini-bar-bg"><div class="hud-mini-bar-fill" id="hud-${p}-bar-hp" style="background:#27ae60; width:100%;"></div></div>
                        <div class="hud-stats-row" style="margin-top: 5px;">
                            <span style="color:#2980b9; font-weight:bold; font-size:11px;">MP:</span>
                            <div>
                                <input type="number" id="hud-${p}-mana-atual" class="hud-input hud-stat-field" onchange="atualizarHudMestre('${p}', 'mana-atual', this.value)"> / 
                                <span id="hud-${p}-mana-max" style="font-weight:bold; font-size:11px; display:inline-block; width:25px; text-align:left;">20</span>
                            </div>
                        </div>
                        <div class="hud-mini-bar-bg"><div class="hud-mini-bar-fill" id="hud-${p}-bar-mana" style="background:#2980b9; width:100%;"></div></div>
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

        window.atualizarHudMestre = function(jogadorId, campo, valor) {
            if(valor === "") return;
            update(ref(database, 'fichas/' + jogadorId), { [campo]: Number(valor) });
        }

        // ==========================================
        // SIDEBAR DE COMBATE — LÓGICA COMPLETA
        // ==========================================

        let _sbEstado = {
            modo: 'ataque',          // 'ataque' | 'magia'
            recolhida: false,
            acaoLock: false,
            ouvintesAliados: {},     // idFicha -> unsubscribe fn
        };

        // --- Toggle recolher ---
        window.toggleSidebarCombate = function() {
            const sb  = document.getElementById('sidebar-combate');
            const btn = document.getElementById('sidebar-toggle-btn');
            _sbEstado.recolhida = !_sbEstado.recolhida;
            sb.classList.toggle('sb-recolhida', _sbEstado.recolhida);
            btn.textContent = _sbEstado.recolhida ? '▶' : '◀';
        };

        // --- Trocar modo ---
        window.sbTrocarModo = function(modo) {
            _sbEstado.modo = modo;
            document.getElementById('sb-painel-magia').style.display  = modo === 'magia'  ? 'block' : 'none';
            document.getElementById('sb-painel-ataque').style.display = modo === 'ataque' ? 'block' : 'none';
        };

        // --- Validar rolagem ---
        window.sbValidarRolagem = function(input) {
            let v = parseInt(input.value, 10);
            if (isNaN(v) || v < 1) { input.value = ''; return; }
            if (v > 999) { input.value = 999; return; }
            input.value = v;
        };

        // --- Ler rolagem válida ---
        function _sbGetRolagem() {
            const v = parseInt(document.getElementById('sb-input-rolagem').value, 10);
            return isNaN(v) || v < 1 ? null : v;
        }

        // --- Renderizar alvos ---
        function sbRenderizarAlvos() {
            const lista = document.getElementById('sb-alvos-lista');
            if (!lista) return;

            let html = '';

            // Ameaça ativa (mantida do sistema global)
            if (ameacaEmCombateGlobal) {
                const nomeAmeaca = ameacaEmCombateGlobal.nome || 'Ameaça';
                html += `
                    <label class="sb-alvo-item ameaca">
                        <input type="checkbox" id="sb-alvo-ameaca" value="ameaca" checked>
                        <div class="sb-alvo-dot ameaca"></div>
                        <span>${nomeAmeaca}</span>
                    </label>`;
            }

            // Aliados: jogadores com ficha aberta nos slots
            const alidosVistos = new Set();
            [1, 2].forEach(numSlot => {
                const slot = slotsDeVisao[numSlot];
                if (slot && slot.idFicha && slot.tipo === 'heroi' && slot.dados) {
                    const id = slot.idFicha;
                    if (alidosVistos.has(id)) return;
                    alidosVistos.add(id);
                    const nome = slot.dados.nome || id;
                    html += `
                        <label class="sb-alvo-item aliado">
                            <input type="checkbox" id="sb-alvo-${id}" value="${id}">
                            <div class="sb-alvo-dot aliado"></div>
                            <span>${nome}</span>
                        </label>`;
                }
            });

            // Todos os players do banco (mesmo não abertos nos slots)
            playersList.forEach(pid => {
                if (alidosVistos.has(pid)) return;
                const dadosSlot = Object.values(slotsDeVisao).find(s => s.idFicha === pid);
                if (dadosSlot) return; // já adicionado
                html += `
                    <label class="sb-alvo-item aliado">
                        <input type="checkbox" id="sb-alvo-${pid}" value="${pid}">
                        <div class="sb-alvo-dot aliado"></div>
                        <span>${usuarios[pid]?.nome || pid}</span>
                    </label>`;
            });

            if (!html) {
                html = '<div class="sb-empty">Nenhum alvo disponível.</div>';
            }

            lista.innerHTML = html;
        }

        // --- Renderizar passivas deduplicadas ---
        function sbRenderizarPassivas() {
            const lista = document.getElementById('sb-passivas-lista');
            if (!lista) return;

            // Coletar passivas de todos os slots de herói visíveis
            const vistas = new Set();
            const passivas = [];

            [1, 2].forEach(numSlot => {
                const slot = slotsDeVisao[numSlot];
                if (!slot || slot.tipo !== 'heroi' || !slot.dados) return;

                const raca   = slot.dados.raca   || '';
                const classe = slot.dados.classe  || '';

                const fontes = [
                    { fonte: RACAS[raca],   origemNome: raca   },
                    { fonte: CLASSES[classe], origemNome: classe },
                ];

                fontes.forEach(({ fonte, origemNome }) => {
                    if (!fonte) return;
                    fonte.habilidades
                        .filter(h => h.tipo === 'Passiva')
                        .forEach(h => {
                            const key = h.nome.trim().toLowerCase();
                            if (vistas.has(key)) return;
                            vistas.add(key);
                            passivas.push({ ...h, origemNome });
                        });
                });
            });

            if (passivas.length === 0) {
                lista.innerHTML = '<div class="sb-empty">Nenhuma passiva ativa.</div>';
                return;
            }

            lista.innerHTML = passivas.map(h => {
                const inicial = h.nome.charAt(0).toUpperCase();
                return `
                    <div class="sb-passiva-item">
                        <div class="sb-passiva-icon">${inicial}</div>
                        <div class="sb-passiva-body">
                            <div class="sb-passiva-nome">${h.nome}</div>
                            <div class="sb-passiva-origem">${h.origemNome}</div>
                            <div class="sb-passiva-desc">${h.desc || ''}</div>
                        </div>
                    </div>`;
            }).join('');
        }

        // --- Atualizar magia exibida no painel ---
        function sbAtualizarMagiaEquipada() {
            // Pega magia equipada do primeiro slot de herói disponível
            let magiaEquipada = null;
            let magiaHab      = null;

            for (const numSlot of [1, 2]) {
                const slot = slotsDeVisao[numSlot];
                if (!slot || slot.tipo !== 'heroi' || !slot.dados) continue;
                const nomeEquipado = slot.dados.habilidadeEquipada;
                if (!nomeEquipado) continue;
                // Encontrar os dados da habilidade
                const habs = slot.dados.habilidades || {};
                const hab  = Object.values(habs).find(h => h.nome === nomeEquipado && h.tipo === 'Ativa');
                if (hab) { magiaEquipada = nomeEquipado; magiaHab = hab; break; }
            }

            const elNome  = document.getElementById('sb-magia-nome');
            const elCusto = document.getElementById('sb-magia-custo');
            if (!elNome || !elCusto) return;

            if (magiaEquipada) {
                elNome.textContent  = magiaEquipada;
                elCusto.textContent = `💧 Custo: ${magiaHab?.custoMana !== undefined ? magiaHab.custoMana : '—'}`;
            } else {
                elNome.textContent  = '—';
                elCusto.textContent = '💧 Custo: —';
            }
        }

        // --- Executar ação (Ataque ou Magia) ---
        window.sbExecutarAcao = async function(tipo) {
            if (_sbEstado.acaoLock) return;

            const rolagem = _sbGetRolagem();
            if (rolagem === null) {
                const el = document.getElementById('sb-input-rolagem');
                if (el) { el.focus(); el.style.borderColor = '#8c1c13'; setTimeout(() => el.style.borderColor = '', 1000); }
                return;
            }

            // Coletar alvos marcados
            const checkboxes = document.querySelectorAll('#sb-alvos-lista input[type="checkbox"]:checked');
            if (checkboxes.length === 0) {
                const lbl = document.getElementById('sb-alvos-lista');
                if (lbl) { lbl.style.outline = '1px solid #8c1c13'; setTimeout(() => lbl.style.outline = '', 1000); }
                return;
            }

            _sbEstado.acaoLock = true;
            const btnId = tipo === 'magia' ? 'sb-btn-lancar' : 'sb-btn-atacar';
            const btn   = document.getElementById(btnId);
            if (btn) { btn.disabled = true; btn.textContent = '⌛ Aguarde...'; }

            try {
                const updates = {};
                checkboxes.forEach(cb => {
                    const alvoId = cb.value;
                    if (alvoId === 'ameaca') {
                        // Registra o ataque na ameaça global (log / flag)
                        if (ameacaEmCombateGlobal?.idBanco) {
                            const path = `fichas/${ameacaEmCombateGlobal.idBanco}`;
                            updates[`${path}/ultimo-ataque`] = rolagem;
                            updates[`${path}/tipo-ultimo-ataque`] = tipo;
                        }
                    } else {
                        // Aliado: registrar dano recebido (Mestre atacando aliado, ou aliado sendo curado)
                        updates[`fichas/${alvoId}/sb-ultimo-hit`] = rolagem;
                        updates[`fichas/${alvoId}/sb-tipo-hit`]   = tipo;
                    }
                });

                if (Object.keys(updates).length > 0) {
                    await update(ref(database, '/'), updates);
                }

                // Feedback visual
                if (btn) {
                    btn.textContent = tipo === 'magia' ? '✓ Feitiço Lançado!' : '✓ Atacado!';
                    btn.style.borderColor = '#27ae60';
                    btn.style.color       = '#27ae60';
                    setTimeout(() => {
                        if (btn) {
                            btn.textContent = tipo === 'magia' ? '✨ Lançar Feitiço' : '⚔️ Atacar';
                            btn.style.borderColor = '';
                            btn.style.color       = '';
                            btn.disabled = false;
                        }
                    }, 1200);
                }
            } catch (err) {
                console.error('[Sidebar] Erro ao executar ação:', err);
                if (btn) { btn.disabled = false; btn.textContent = tipo === 'magia' ? '✨ Lançar Feitiço' : '⚔️ Atacar'; }
            } finally {
                setTimeout(() => { _sbEstado.acaoLock = false; }, 1300);
            }
        };

        // --- Hook público: chamar após abrir/atualizar qualquer slot de herói ---
        window.sbAtualizar = function() {
            sbRenderizarAlvos();
            sbRenderizarPassivas();
            sbAtualizarMagiaEquipada();
        };

        // Inicialização ao carregar a página
        document.addEventListener('DOMContentLoaded', () => {
            sbRenderizarAlvos();
            sbRenderizarPassivas();
        });

