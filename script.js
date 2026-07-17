import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
        import { getDatabase, ref, onValue, update, get, remove, runTransaction, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

        const DB_PREFIX = "";
        export const ICE_SERVERS = [
            { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
        ]; // STUN melhora a conexão P2P; TURN ainda é necessário em redes restritivas.

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

        function normalizeDbPath(path = "") {
            return String(path || "").replace(/^\/+|\/+$/g, "");
        }

        function dbPath(path = "") {
            const cleanPath = normalizeDbPath(path);
            if (!DB_PREFIX) return cleanPath;
            if (!cleanPath) return DB_PREFIX;
            if (cleanPath === DB_PREFIX || cleanPath.startsWith(DB_PREFIX + "/")) return cleanPath;
            return `${DB_PREFIX}/${cleanPath}`;
        }

        function dbRef(path = "") {
            return ref(database, dbPath(path));
        }

        function safeGet(path = "") {
            return get(dbRef(path));
        }

        function safeUpdate(path = "", payload = {}) {
            return update(dbRef(path), payload);
        }

        function safeRemove(path = "") {
            return remove(dbRef(path));
        }

        function safeTransaction(path = "", updater) {
            return runTransaction(dbRef(path), updater);
        }

        const usuarios = {
            "dick":   { nome: "Dick", cargo: "Mestre", idFicha: null },
            "lais":   { nome: "Lais", cargo: "Jogador", idFicha: "lais" },
            "gomes":  { nome: "Gomes", cargo: "Jogador", idFicha: "gomes" },
            "kamy":   { nome: "Kamy", cargo: "Jogador", idFicha: "kamy" },
            "arthur": { nome: "Arthur", cargo: "Jogador", idFicha: "arthur" }
        };

        const RACES = {
            "Humanos": { points: 3 },
            "Elfo": { des: 2, int: 1, per: 1, sab: 1, con: -2, for: -1 },
            "Anão": { con: 2, for: 1, des: -2 },
            "Orc": { for: 2, con: 1, car: -2, sab: -1 },
            "Gnomo": { int: 2, sab: 1, for: -2, con: -1 },
            "Halfling": { des: 2, car: 1, int: -3, for: -1 },
            "Khajiit": { des: 4, int: -3, car: -1 },
            "Argoniano": { con: 3, des: 1, car: -4, per: -1 }
        };

        const CLASSES = {
            "Guerreiro": { for: 2, con: 1 },
            "Paladino": { con: 2, car: 1 },
            "Druida": { sab: 2, car: 1 },
            "Bárbaro": { for: 2, con: 1 },
            "Arqueiro": { des: 2, per: 1 },
            "Ladino": { des: 3, per: 1 },
            "Mago": { int: 2, sab: 1 },
            "Curandeiro": { sab: 2, int: 1 },
            "Bardo": { car: 3 },
            "Monge": { con: 1, des: 1, sab: 1 }
        };

        // Normaliza string para montar nome do arquivo de imagem (remove acentos e espaços)
        // Sistema de imagens foi removido a pedido do usuário. Usando ícones CSS.

        const HABILIDADES_SISTEMA = {
            //── Raças ─────────────────────────────────────────────────────────────────────────────
            "Humanos":   { "hum_adaptavel":   { nome: "Adaptável",              desc: "pode refazer 1 teste por sessão.",                                                tipo: "ativa",  alvo: "self", icon: "👤",  race: "Humano",     spriteIdx:0, spriteTotal:1 } },
            "Elfo":      { "elf_visao":        { nome: "Visão Aguçada",          desc: "enxerga no escuro.",                                                               tipo: "passiva", alvo: "self", icon: "👁️",  race: "Elfo",       spriteIdx:0, spriteTotal:2 },
                           "elf_afinidade":    { nome: "Afinidade Arcana",        desc: "bônus em testes mágicos.",                                                         tipo: "passiva", alvo: "self", icon: "✨",  race: "Elfo",       spriteIdx:1, spriteTotal:2 } },
            "Anão":      { "anao_resistencia": { nome: "Resistência Anã",         desc: "Resistência contra efeitos negativos (debuffs).",                              tipo: "passiva", alvo: "self", icon: "🛡️",  race: "Anão",       spriteIdx:0, spriteTotal:1 } },
            "Orc":       { "orc_furia":        { nome: "Fúria",                   desc: "pode causar dano extra por alguns turnos.",                                     tipo: "ativa",  alvo: "self", icon: "🩸",  race: "Orc",        spriteIdx:0, spriteTotal:1 } },
            "Gnomo":     { "gno_natureza":     { nome: "Natureza Mística",        desc: "bônus em magia ou criação de poções.",                                          tipo: "passiva", alvo: "self", icon: "🐿️",  race: "Gnomo",      spriteIdx:0, spriteTotal:2 },
                           "gno_mente":        { nome: "Mente Rápida",            desc: "vantagem contra ilusões ou efeitos mentais; +2 Percepção.",                     tipo: "passiva", alvo: "self", icon: "🧠",  race: "Gnomo",      spriteIdx:1, spriteTotal:2 } },
            "Halfling":  { "hal_sorte":        { nome: "Sorte Incrível",          desc: "pode rerrolar 1 dado por sessão.",                                              tipo: "ativa",  alvo: "self", icon: "🍀",  race: "Halfling",   spriteIdx:0, spriteTotal:1 } },
            "Khajiit":   { "kha_sentidos":     { nome: "Sentidos Felinos",        desc: "bônus em percepção e visão noturna; +2 Percepção.",                             tipo: "passiva", alvo: "self", icon: "🐈",  race: "Khajiit",   spriteIdx:0, spriteTotal:2 },
                           "kha_garras":       { nome: "Garras Naturais",          desc: "ataque desarmado causa dano extra.",                                             tipo: "passiva", alvo: "any",  icon: "🐾",  race: "Khajiit",   spriteIdx:1, spriteTotal:2 } },
            "Argoniano": { "arg_regeneracao":  { nome: "Regeneração",             desc: "recupera pequena quantidade de vida ao longo do tempo.",                        tipo: "passiva", alvo: "self", icon: "🦎",  race: "Argoniano", spriteIdx:0, spriteTotal:3 },
                           "arg_anfibio":      { nome: "Anfíbio",                  desc: "respira debaixo d'água e nada com facilidade; +2 Destreza (quando debaixo d'água).", tipo: "passiva", alvo: "self", icon: "💧", race: "Argoniano", spriteIdx:1, spriteTotal:3 },
                           "arg_resistencia":  { nome: "Resistência Natural",     desc: "bônus contra doenças e venenos.",                                               tipo: "passiva", alvo: "self", icon: "🌿",  race: "Argoniano", spriteIdx:2, spriteTotal:3 } },
            //── Classes ────────────────────────────────────────────────────────────────────────────
            "Guerreiro": { "guer_especialista":{ nome: "Especialista em Combate", desc: "bônus com todas as armas.",                                                        tipo: "passiva", alvo: "self", icon: "⚔️",  class: "Guerreiro", spriteIdx:0, spriteTotal:2 },
                           "guer_postura":     { nome: "Postura Defensiva",       desc: "reduz dano recebido por alguns turnos.",                                        tipo: "ativa",  alvo: "self", icon: "🛡️",  class: "Guerreiro", spriteIdx:1, spriteTotal:2 } },
            "Paladino":  { "pal_golpe":        { nome: "Golpe Sagrado",           desc: "causa dano extra contra inimigos malignos.",                                    tipo: "passiva", alvo: "self", icon: "⚡",  class: "Paladino",  spriteIdx:0, spriteTotal:2 },
                           "pal_cura":         { nome: "Cura Divina",             desc: "pode curar a si ou aliados.",                                                   tipo: "ativa",  alvo: "any",  icon: "❤️",  class: "Paladino",  spriteIdx:1, spriteTotal:2 } },
            "Druida":    { "dru_forma":        { nome: "Forma Selvagem",          desc: "transforma-se em animal temporariamente (até 3 vezes por sessão).",             tipo: "ativa",  alvo: "self", icon: "🐻",  class: "Druida",    spriteIdx:0, spriteTotal:2 },
                           "dru_vinculo":      { nome: "Vínculo com a Natureza",  desc: "conhecimento com plantas, cogumelos e ervas, pode conversar com animais.",      tipo: "passiva", alvo: "self", icon: "🌳",  class: "Druida",    spriteIdx:1, spriteTotal:2 } },
            "Bárbaro":   { "bar_furia":        { nome: "Fúria",                   desc: "aumenta dano e resistência por alguns turnos.",                                 tipo: "ativa",  alvo: "self", icon: "😡",  class: "Bárbaro",   spriteIdx:0, spriteTotal:2 },
                           "bar_resistencia":  { nome: "Resistência Brutal",      desc: "reduz dano físico recebido.",                                                   tipo: "passiva", alvo: "self", icon: "💪",  class: "Bárbaro",   spriteIdx:1, spriteTotal:2 } },
            "Arqueiro":  { "arq_tiro":         { nome: "Tiro Preciso",            desc: "maior chance de acerto crítico.",                                               tipo: "passiva", alvo: "self", icon: "🏹",  class: "Arqueiro",  spriteIdx:0, spriteTotal:2 },
                           "arq_olho":         { nome: "Olho de Águia",           desc: "acerta o alvo com facilidade.",                                                 tipo: "passiva", alvo: "self", icon: "🦅",  class: "Arqueiro",  spriteIdx:1, spriteTotal:2 } },
            "Ladino":    { "lad_ataque":       { nome: "Ataque Furtivo",          desc: "causa dano crítico ao atacar desprevenido.",                                    tipo: "passiva", alvo: "self", icon: "🗡️",  class: "Ladino",    spriteIdx:0, spriteTotal:3 },
                           "lad_evasao":       { nome: "Evasão",                  desc: "maior chance de esquivar.",                                                      tipo: "passiva", alvo: "self", icon: "💨",  class: "Ladino",    spriteIdx:1, spriteTotal:3 },
                           "lad_especialista": { nome: "Especialista em Perícias",desc: "bônus em furtividade, lockpick, etc..",                                         tipo: "passiva", alvo: "self", icon: "🕵️",  class: "Ladino",    spriteIdx:2, spriteTotal:3 } },
            "Mago":      { "mag_mana":         { nome: "Regeneração de Mana",     desc: "recupera mana mais rápido.",                                                    tipo: "passiva", alvo: "self", icon: "🔮",  class: "Mago",      spriteIdx:0, spriteTotal:1 } },
            "Curandeiro":{ "cur_cura":         { nome: "Cura Maior",              desc: "recupera vida de aliados.",                                                      tipo: "ativa",  alvo: "any",  icon: "🌿",  class: "Curandeiro", spriteIdx:0, spriteTotal:3 },
                           "cur_protecao":     { nome: "Proteção Espiritual",     desc: "reduz dano recebido pelo grupo.",                                               tipo: "passiva", alvo: "any",  icon: "🛡️",  class: "Curandeiro", spriteIdx:1, spriteTotal:3 },
                           "cur_purificacao":  { nome: "Purificação",             desc: "remove efeitos negativos.",                                                      tipo: "ativa",  alvo: "any",  icon: "✨",  class: "Curandeiro", spriteIdx:2, spriteTotal:3 } },
            "Bardo":     { "bar_inspiracao":   { nome: "Inspiração",              desc: "concede bônus a aliados.",                                                      tipo: "passiva", alvo: "any",  icon: "🎵",  class: "Bardo",     spriteIdx:0, spriteTotal:3 },
                           "bar_cancao":       { nome: "Canção Arcana",           desc: "pode causar efeitos mágicos variados.",                                         tipo: "passiva", alvo: "any",  icon: "🎸",  class: "Bardo",     spriteIdx:1, spriteTotal:3 },
                           "bar_manipulacao":  { nome: "Manipulação Social",      desc: "bônus em diálogo.",                                                             tipo: "passiva", alvo: "self", icon: "🎭",  class: "Bardo",     spriteIdx:2, spriteTotal:3 } },
            "Monge":     { "mon_golpes":       { nome: "Golpes Rápidos",          desc: "múltiplos ataques por turno.",                                                  tipo: "passiva", alvo: "self", icon: "👊",  class: "Monge",     spriteIdx:0, spriteTotal:3 },
                           "mon_ki":           { nome: "Ki Interior",             desc: "usa energia para aumentar a resistência.",                                      tipo: "ativa",  alvo: "self", icon: "🧘",  class: "Monge",     spriteIdx:1, spriteTotal:3 },
                           "mon_esquiva":      { nome: "Esquiva Suprema",         desc: "alta evasão.",                                                                   tipo: "passiva", alvo: "self", icon: "🥋",  class: "Monge",     spriteIdx:2, spriteTotal:3 } }
        };

        // Enriquece um objeto de habilidade vindo do Firebase com metadados do dicionário local.
        // Necessário porque o Firebase pode ter sido gravado antes de race/class/spriteIdx existirem.
        function enrichHab(habId, habFirebase) {
            // Varre o dicionário procurando o habId
            for (let groupKey in HABILIDADES_SISTEMA) {
                if (HABILIDADES_SISTEMA[groupKey][habId]) {
                    return normalizeHabV1(habId, Object.assign({}, HABILIDADES_SISTEMA[groupKey][habId], habFirebase));
                }
            }
            // Se não encontrou pelo habId (ex: skill adicionada manualmente com id hab_123), tenta encontrar pelo NOME exato
            if (habFirebase.nome) {
                let nomeBusca = habFirebase.nome.trim().toLowerCase();
                for (let groupKey in HABILIDADES_SISTEMA) {
                    for (let k in HABILIDADES_SISTEMA[groupKey]) {
                        if (HABILIDADES_SISTEMA[groupKey][k].nome.trim().toLowerCase() === nomeBusca) {
                            return normalizeHabV1(k, Object.assign({}, HABILIDADES_SISTEMA[groupKey][k], habFirebase));
                        }
                    }
                }
            }
            return normalizeHabV1(habId, habFirebase); // habilidade custom — retorna compatível v1
        }

        const playersList = ['lais', 'gomes', 'kamy', 'arthur'];

        let usuarioAtual = null;
        let ameacaEmCombateGlobal = null;
        let hudVisivel = false;
        let monstrosNoBanco = {};
        let hordasNoBanco = {};
        let fichasNoBanco = {};
        let fotosNoBanco = {};

        let slotsDeVisao = {
            1: { ouvinte: null, idFicha: null, tipo: null, dados: {} },
            2: { ouvinte: null, idFicha: null, tipo: null, dados: {} }
        };

        let combatLog = [];
        let combatLogRecolhido = true;
        let visaoTaticaMestreAtiva = false;
        const eventosLocaisPublicados = new Set();

        const ATTRS = ['for', 'des', 'con', 'int', 'sab', 'car', 'per'];
        const INICIATIVA_SCHEMA_VERSION = 1;
        const INICIATIVA_ESTADOS = Object.freeze({ COLETANDO: 'coletando', ORGANIZANDO: 'organizando', ATIVA: 'ativa' });
        const PATH_ESTADO_COMBATE = 'estado_combate';
        const PATH_INICIATIVA = 'estado_combate/iniciativa';
        let iniciativaAtual = null;
        let unsubscribeIniciativa = null;
        let iniciativaTurnoTravado = false;

        const FORMULAS_PADRAO_HABILIDADES = {
            pal_cura: "1d8+CAR",
            cur_cura: "2d8+SAB"
        };

        function toNumber(value, fallback = 0) {
            const n = Number(value);
            return Number.isFinite(n) ? n : fallback;
        }

        function clamp(value, min, max) {
            let n = toNumber(value, min);
            if (Number.isFinite(min) && n < min) n = min;
            if (Number.isFinite(max) && n > max) n = max;
            return n;
        }

        function escapeHtml(value = "") {
            return String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        const CAMPOS_NUMERICOS_FICHA = new Set([
            'hp-atual', 'hp-max', 'mana-atual', 'mana-max', 'escudo', 'ap', 'ouro',
            'for', 'des', 'con', 'int', 'sab', 'car', 'per', 'expTotal'
        ]);

        function isCampoQtdItem(campo) {
            return /^item[1-5]-qtd$/.test(String(campo || ""));
        }

        function normalizarValorParaSalvar(campo, valor, options = {}) {
            if (options.compacto || isCampoQtdItem(campo)) {
                return valor === "" ? 0 : toNumber(valor, 0);
            }
            if (CAMPOS_NUMERICOS_FICHA.has(campo)) {
                return valor === "" ? "" : toNumber(valor, 0);
            }
            return valor;
        }

        function getTipoEntidade(dados = {}, contexto = "") {
            const path = String(contexto || "");
            if (path.startsWith("hordas/") && path.includes("/membros/")) return "horda";
            if (dados.tipo === "horda" || dados.tipo === "monstro" || dados.tipo === "heroi") return dados.tipo;
            if (path.startsWith("fichas/")) {
                const idFicha = path.split("/")[1];
                if (playersList.includes(idFicha)) return "heroi";
            }
            return "monstro";
        }

        function getHpMaxEfetivo(dados = {}, contexto = "") {
            const hpBase = Math.max(1, toNumber(dados['hp-max'], 20));
            return getTipoEntidade(dados, contexto) === "heroi"
                ? Math.max(1, hpBase + (toNumber(dados.con, 0) * 3))
                : hpBase;
        }

        function inferirTipoEfeito(habId, hab = {}) {
            if (hab.effectKind) return hab.effectKind;
            if (hab.tipo === 'passiva') return 'passiva';
            if (hab.tipo === 'cura') return 'cura';
            const nome = String(hab.nome || '').toLowerCase();
            if (['pal_cura', 'cur_cura'].includes(habId) || nome.includes('cura')) return 'cura';
            if (nome.includes('escudo') || nome.includes('proteção') || nome.includes('protecao')) return 'escudo';
            if (hab.tipo === 'buff') return 'buff';
            if (hab.tipo === 'debuff') return 'debuff';
            if (hab.tipo === 'utilidade') return 'utilidade';
            return 'dano';
        }

        function normalizeHabV1(habId, hab = {}) {
            const effectKind = inferirTipoEfeito(habId, hab);
            return {
                schemaVersion: hab.schemaVersion || 1,
                targetMode: hab.targetMode || hab.alvo || 'self',
                ...hab,
                effectKind,
                formula: hab.formula || FORMULAS_PADRAO_HABILIDADES[habId] || ''
            };
        }

        function rolarFormulaMagica(formula, atributos = {}) {
            const expr = String(formula || '').toUpperCase().replace(/\s+/g, '');
            if (!expr) return { total: 0, detalhes: [] };

            const tokens = expr.match(/[+-]?[^+-]+/g) || [];
            let total = 0;
            const detalhes = [];

            for (const token of tokens) {
                const sign = token.startsWith('-') ? -1 : 1;
                const raw = token.replace(/^[+-]/, '');
                const dice = raw.match(/^(\d*)D(\d+)$/);

                if (dice) {
                    const count = Math.max(1, toNumber(dice[1] || 1, 1));
                    const sides = Math.max(1, toNumber(dice[2], 1));
                    let subtotal = 0;
                    const rolls = [];
                    for (let i = 0; i < count; i++) {
                        const roll = Math.floor(Math.random() * sides) + 1;
                        rolls.push(roll);
                        subtotal += roll;
                    }
                    total += subtotal * sign;
                    detalhes.push(`${sign < 0 ? '-' : '+'}${raw}[${rolls.join(',')}]`);
                    continue;
                }

                const attrKey = raw.toLowerCase();
                if (ATTRS.includes(attrKey)) {
                    const attrValue = toNumber(atributos[attrKey], 0) * sign;
                    total += attrValue;
                    detalhes.push(`${sign < 0 ? '-' : '+'}${raw}(${Math.abs(attrValue)})`);
                    continue;
                }

                const flat = toNumber(raw, null);
                if (flat !== null) {
                    total += flat * sign;
                    detalhes.push(`${sign < 0 ? '-' : '+'}${raw}`);
                    continue;
                }

                throw new Error(`Formula invalida: ${formula}`);
            }

            return { total: Math.max(0, total), detalhes };
        }

        function calcularEfeitoVidaResultado(dados = {}, valor, effectKind = 'dano', contexto = "") {
            const proximo = { ...dados };
            const hpAtual = toNumber(proximo['hp-atual'], 0);
            const hpMax = getHpMaxEfetivo(proximo, contexto);
            const escudoAtual = Math.max(0, toNumber(proximo.escudo, 0));
            const valorSeguro = Math.max(0, toNumber(valor, 0));
            const meta = {
                effectKind,
                valor: valorSeguro,
                hpAntes: hpAtual,
                hpDepois: hpAtual,
                hpMax,
                escudoAntes: escudoAtual,
                escudoDepois: escudoAtual,
                curaHp: 0,
                danoHp: 0,
                escudoGanho: 0,
                escudoAbsorvido: 0
            };

            if (effectKind === 'cura') {
                proximo['hp-atual'] = clamp(hpAtual + valorSeguro, 0, hpMax);
                meta.hpDepois = proximo['hp-atual'];
                meta.curaHp = Math.max(0, meta.hpDepois - hpAtual);
                return { dadosAtualizados: proximo, meta };
            }

            if (effectKind === 'escudo') {
                proximo.escudo = escudoAtual + valorSeguro;
                meta.escudoDepois = proximo.escudo;
                meta.escudoGanho = Math.max(0, proximo.escudo - escudoAtual);
                return { dadosAtualizados: proximo, meta };
            }

            let danoRestante = valorSeguro;
            let escudo = escudoAtual;
            if (escudo > 0) {
                const absorvido = Math.min(escudo, danoRestante);
                escudo -= absorvido;
                danoRestante -= absorvido;
                meta.escudoAbsorvido = absorvido;
            }
            proximo.escudo = escudo;
            proximo['hp-atual'] = clamp(hpAtual - danoRestante, 0, hpMax);
            meta.escudoDepois = escudo;
            meta.hpDepois = proximo['hp-atual'];
            meta.danoHp = Math.max(0, hpAtual - proximo['hp-atual']);
            return { dadosAtualizados: proximo, meta };
        }

        function aplicarEfeitoVidaDados(dados = {}, valor, effectKind = 'dano', contexto = "") {
            return calcularEfeitoVidaResultado(dados, valor, effectKind, contexto).dadosAtualizados;
        }

        async function aplicarEfeitoVidaPath(path, valor, effectKind = 'dano') {
            let metaFinal = null;
            const resultado = await safeTransaction(path, (dadosAtuais) => {
                if (!dadosAtuais) return dadosAtuais;
                const resultadoEfeito = calcularEfeitoVidaResultado(dadosAtuais, valor, effectKind, path);
                metaFinal = resultadoEfeito.meta;
                return resultadoEfeito.dadosAtualizados;
            });
            return resultado.committed ? metaFinal : null;
        }

        function initCombatUi() {
            if(!document.getElementById('combat-log-panel')) {
                const panel = document.createElement('div');
                panel.id = 'combat-log-panel';
                panel.className = 'combat-log-panel recolhido';
                panel.innerHTML = `
                    <button id="combat-log-toggle" type="button" onclick="toggleCombatLogPanel()">⚔️ Registro</button>
                    <div class="combat-log-body">
                        <div class="combat-log-title">Log de Combate</div>
                        <div id="combat-log-list" class="combat-log-list"></div>
                    </div>
                `;
                document.body.appendChild(panel);
            }

            if(!document.getElementById('combat-toast')) {
                const toast = document.createElement('div');
                toast.id = 'combat-toast';
                toast.className = 'combat-toast';
                document.body.appendChild(toast);
            }

            if(usuarioAtual?.cargo === 'Mestre') initVisaoTaticaMestre();
        }

        window.toggleCombatLogPanel = function() {
            combatLogRecolhido = !combatLogRecolhido;
            const panel = document.getElementById('combat-log-panel');
            if(panel) panel.classList.toggle('recolhido', combatLogRecolhido);
        }

        function adicionarCombatLog(texto, tipo = 'info') {
            combatLog.push({ texto, tipo, ts: new Date() });
            if(combatLog.length > 20) combatLog.shift();
            renderizarCombatLog();
        }

        function renderizarCombatLog() {
            const list = document.getElementById('combat-log-list');
            if(!list) return;
            if(combatLog.length === 0) {
                list.innerHTML = '<div class="combat-log-empty">Nenhum ato registrado.</div>';
                return;
            }
            list.innerHTML = combatLog.slice().reverse().map(entry => {
                const hora = entry.ts.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                return `<div class="combat-log-entry tipo-${entry.tipo}"><span>${hora}</span>${escapeHtml(entry.texto)}</div>`;
            }).join('');
        }

        function limparCombatLog() {
            combatLog = [];
            renderizarCombatLog();
        }

        function limparVisuaisCombateTemporarios() {
            document.querySelectorAll('.alvo-selecionado-combate').forEach(el => el.classList.remove('alvo-selecionado-combate'));
            document.querySelectorAll('.ultimo-evento-card, .floating-feedback').forEach(el => el.remove());
        }

        function mostrarCombatToast(texto) {
            const toast = document.getElementById('combat-toast');
            if(!toast) return;
            toast.textContent = texto;
            toast.classList.remove('visivel');
            void toast.offsetWidth;
            toast.classList.add('visivel');
            clearTimeout(toast._timer);
            toast._timer = setTimeout(() => toast.classList.remove('visivel'), 2200);
        }

        function getNomeAlvoPorPath(path) {
            const cleanPath = String(path || "");
            const parts = cleanPath.split('/');
            if(parts[0] === 'fichas') {
                const id = parts[1];
                for(const slot of Object.values(slotsDeVisao)) {
                    if(slot.idFicha === id) return slot.dados?.nome || id;
                }
                if(fichasNoBanco[id]?.nome) return fichasNoBanco[id].nome;
                const usuario = Object.values(usuarios).find(u => u.idFicha === id);
                return usuario?.nome || id;
            }
            if(parts[0] === 'hordas') {
                const hordaId = parts[1];
                const membroId = parts[3];
                const slot = Object.values(slotsDeVisao).find(s => s.idFicha === hordaId);
                const membro = slot?.dados?.membros?.[membroId];
                const membroBanco = hordasNoBanco[hordaId]?.membros?.[membroId];
                return membro?.nome || membroBanco?.nome || `${hordasNoBanco[hordaId]?.nome || hordaId} ${membroId || ''}`.trim();
            }
            return cleanPath;
        }

        function getNomeAtorDoSlot(numSlot) {
            const slot = slotsDeVisao[numSlot] || {};
            return slot.dados?.nome || fichasNoBanco[slot.idFicha]?.nome || slot.idFicha || 'Ação';
        }

        function getNomeAtorHorda(membroId) {
            for(const slot of Object.values(slotsDeVisao)) {
                if(slot.tipo !== 'horda') continue;
                const membro = slot.dados?.membros?.[membroId];
                if(membro) return membro.nome || `${slot.dados?.nome || slot.idFicha || 'Horda'} ${membroId}`;
            }
            for(const [hordaId, horda] of Object.entries(hordasNoBanco || {})) {
                const membro = horda?.membros?.[membroId];
                if(membro) return membro.nome || `${horda.nome || hordaId} ${membroId}`;
            }
            return `Horda ${membroId}`;
        }

        function encontrarElementoFeedback(path) {
            const cleanPath = String(path || "");
            const parts = cleanPath.split('/');
            if(parts[0] === 'hordas' && parts[3]) {
                return document.getElementById(`caixa-hp-horda-${parts[3]}`)?.closest('.horda-member-card')
                    || document.getElementById(`caixa-hp-horda-${parts[3]}`);
            }
            if(parts[0] === 'fichas') {
                const idFicha = parts[1];
                for(const [numSlot, slot] of Object.entries(slotsDeVisao)) {
                    if(slot.idFicha === idFicha) {
                        if(slot.tipo === 'monstro') return document.getElementById(`container-slot${numSlot}-monstro`);
                        return document.getElementById(`container-slot${numSlot}-heroi`);
                    }
                }
                return document.getElementById(`hud-player-${idFicha}`);
            }
            return null;
        }

        function pathParaEvento(path) {
            const parts = String(path || '').split('/');
            if(parts[0] === 'hordas') {
                return { alvoTipo: 'horda', alvoId: parts[1] || '', membroId: parts[3] || '' };
            }
            if(parts[0] === 'fichas') {
                const alvoId = parts[1] || '';
                return { alvoTipo: playersList.includes(alvoId) ? 'heroi' : 'monstro', alvoId, membroId: '' };
            }
            return { alvoTipo: 'desconhecido', alvoId: parts[1] || parts[0] || '', membroId: '' };
        }

        function pathFromEvento(evento = {}) {
            if(evento.alvoTipo === 'horda' && evento.alvoId && evento.membroId) return `hordas/${evento.alvoId}/membros/${evento.membroId}`;
            if(evento.alvoId) return `fichas/${evento.alvoId}`;
            return '';
        }

        function pathFromValorAlvo(valor) {
            const alvo = String(valor || '');
            if(ameacaEmCombateGlobal && alvo.startsWith(`${ameacaEmCombateGlobal}_`)) {
                return `hordas/${ameacaEmCombateGlobal}/membros/${alvo.replace(`${ameacaEmCombateGlobal}_`, '')}`;
            }
            if(alvo.startsWith('horda_') && alvo.includes('_')) {
                const idx = alvo.lastIndexOf('_');
                return `hordas/${alvo.slice(0, idx)}/membros/${alvo.slice(idx + 1)}`;
            }
            return `fichas/${alvo}`;
        }

        function destacarAlvosSelecionados() {
            document.querySelectorAll('.alvo-selecionado-combate').forEach(el => el.classList.remove('alvo-selecionado-combate'));
            document.querySelectorAll('.checkbox-alvo input[type="checkbox"]:checked').forEach(input => {
                const alvo = encontrarElementoFeedback(pathFromValorAlvo(input.value));
                if(alvo) alvo.classList.add('alvo-selecionado-combate');
            });
        }

        function tratarMudancaAlvoCombate(input) {
            if(!input?.matches?.('.checkbox-alvo input[type="checkbox"]')) return;
            const classes = Array.from(input.classList || []);
            const classeAtaqueUnico = classes.find(cls => cls.startsWith('alvo-ataque-'));
            if(input.checked && classeAtaqueUnico) {
                document.querySelectorAll(`input.${classeAtaqueUnico}[type="checkbox"]`).forEach(outro => {
                    if(outro !== input) outro.checked = false;
                });
            }
            destacarAlvosSelecionados();
        }

        function partesFeedbackFromMeta(meta) {
            if(!meta) return [];
            const partes = [];
            if(meta.escudoAbsorvido > 0) partes.push({ texto: `🛡 -${meta.escudoAbsorvido}`, tipo: 'escudo-dano' });
            if(meta.danoHp > 0) partes.push({ texto: `-${meta.danoHp}`, tipo: 'dano' });
            if(meta.curaHp > 0) partes.push({ texto: `+${meta.curaHp}`, tipo: 'cura' });
            if(meta.escudoGanho > 0) partes.push({ texto: `🛡 +${meta.escudoGanho}`, tipo: 'escudo' });
            return partes;
        }

        function mostrarFeedbackFlutuante(path, meta) {
            const alvo = encontrarElementoFeedback(path);
            const partes = partesFeedbackFromMeta(meta);
            if(!alvo || partes.length === 0) return;
            if(getComputedStyle(alvo).position === 'static') alvo.style.position = 'relative';
            partes.forEach((parte, index) => {
                const el = document.createElement('span');
                el.className = `floating-feedback ${parte.tipo}`;
                el.textContent = parte.texto;
                el.style.left = `${50 + (index * 12) - ((partes.length - 1) * 6)}%`;
                el.style.top = `${38 + (index * 10)}%`;
                alvo.appendChild(el);
                setTimeout(() => el.remove(), 1300);
            });
        }

        function textosUltimoEvento(meta) {
            if(!meta) return [];
            const textos = [];
            if(meta.escudoAbsorvido > 0) textos.push({ texto: `Escudo absorveu ${meta.escudoAbsorvido}`, tipo: 'escudo-dano' });
            if(meta.danoHp > 0) textos.push({ texto: `Sofreu ${meta.danoHp} dano`, tipo: 'dano' });
            if(meta.curaHp > 0) textos.push({ texto: `Curou ${meta.curaHp} HP`, tipo: 'cura' });
            if(meta.escudoGanho > 0) textos.push({ texto: `Ganhou ${meta.escudoGanho} escudo`, tipo: 'escudo' });
            return textos;
        }

        function mostrarUltimoEventoNoCard(path, metaOuEvento) {
            const alvo = encontrarElementoFeedback(path);
            if(!alvo) return;
            const textos = metaOuEvento?.texto ? [{ texto: metaOuEvento.texto, tipo: metaOuEvento.tipo || 'info' }] : textosUltimoEvento(metaOuEvento);
            if(textos.length === 0) return;
            if(getComputedStyle(alvo).position === 'static') alvo.style.position = 'relative';
            alvo.querySelectorAll(':scope > .ultimo-evento-card').forEach(el => el.remove());
            const box = document.createElement('div');
            box.className = `ultimo-evento-card tipo-${textos[0].tipo || 'info'}`;
            box.innerHTML = textos.map(item => `<span>${escapeHtml(item.texto)}</span>`).join('');
            alvo.appendChild(box);
            clearTimeout(alvo._ultimoEventoTimer);
            alvo._ultimoEventoTimer = setTimeout(() => box.remove(), 3200);
        }

        function aplicarHpAtrasadoVisual(path, meta) {
            if(!meta) return;
            const alvo = encontrarElementoFeedback(path);
            if(!alvo) return;
            let bar = null;
            if(path.startsWith('hordas/')) {
                const membroId = path.split('/')[3];
                bar = document.getElementById(`bar-hp-horda-${membroId}`);
            } else {
                const idFicha = path.split('/')[1];
                for(const [numSlot, slot] of Object.entries(slotsDeVisao)) {
                    if(slot.idFicha !== idFicha) continue;
                    bar = slot.tipo === 'monstro'
                        ? document.getElementById(`bar-hp-monstro-slot${numSlot}`)
                        : document.getElementById(`bar-hp-slot${numSlot}`);
                }
            }
            if(!bar) return;
            const bg = bar.closest('.bar-bg');
            if(!bg) return;
            if(meta.danoHp > 0) {
                let atraso = bg.querySelector('.hp-delay-fill');
                if(!atraso) {
                    atraso = document.createElement('div');
                    atraso.className = 'hp-delay-fill';
                    bg.insertBefore(atraso, bar);
                }
                const hpMax = Math.max(1, toNumber(meta.hpMax, 1));
                const antes = clamp((toNumber(meta.hpAntes, 0) / hpMax) * 100, 0, 100);
                const depois = clamp((toNumber(meta.hpDepois, 0) / hpMax) * 100, 0, 100);
                atraso.style.width = `${antes}%`;
                requestAnimationFrame(() => { atraso.style.width = `${depois}%`; });
            }
            if(meta.curaHp > 0) {
                bg.classList.remove('hp-cura-pulso');
                void bg.offsetWidth;
                bg.classList.add('hp-cura-pulso');
                setTimeout(() => bg.classList.remove('hp-cura-pulso'), 900);
            }
        }

        function descreverMeta(meta) {
            if(!meta) return '';
            const partes = [];
            if(meta.escudoAbsorvido > 0) partes.push(`escudo absorveu ${meta.escudoAbsorvido}`);
            if(meta.danoHp > 0) partes.push(`${meta.danoHp} dano em HP`);
            if(meta.curaHp > 0) partes.push(`${meta.curaHp} cura`);
            if(meta.escudoGanho > 0) partes.push(`${meta.escudoGanho} escudo`);
            return partes.join(', ');
        }

        function descreverMetaNarrativa(meta) {
            if(!meta) return '';
            const partes = [];
            if(meta.escudoAbsorvido > 0) partes.push(`${meta.escudoAbsorvido} foi absorvido por escudo`);
            if(meta.danoHp > 0) partes.push(`causou ${meta.danoHp} de dano em HP`);
            if(meta.curaHp > 0) partes.push(`curou ${meta.curaHp} HP`);
            if(meta.escudoGanho > 0) partes.push(`concedeu ${meta.escudoGanho} de escudo`);
            return partes.join(' e ');
        }

        function formatarLogCombate(path, meta, contexto = {}) {
            if(typeof contexto === 'string') {
                const descricao = descreverMeta(meta);
                return descricao ? `${contexto}: ${getNomeAlvoPorPath(path)} recebeu ${descricao}.` : '';
            }

            const ator = contexto.ator || 'Ação';
            const alvo = contexto.alvo || getNomeAlvoPorPath(path);
            const resultado = descreverMetaNarrativa(meta);
            if(!resultado) return '';

            if(contexto.habilidade) return `${ator} usou ${contexto.habilidade} em ${alvo} e ${resultado}.`;
            if(meta?.effectKind === 'cura') return `${ator} curou ${alvo} e ${resultado}.`;
            if(meta?.effectKind === 'escudo') return `${ator} conjurou escudo em ${alvo} e ${resultado}.`;
            return `${ator} atacou ${alvo} e ${resultado}.`;
        }

        function tipoEventoPorMeta(meta) {
            if(meta?.curaHp > 0) return 'cura';
            if(meta?.escudoGanho > 0) return 'escudo';
            return 'dano';
        }

        function gerarIdEventoCombate() {
            return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        }

        function metaFromUltimoEvento(evento = {}) {
            return {
                effectKind: evento.tipo || 'dano',
                danoHp: toNumber(evento.danoHp, 0),
                curaHp: toNumber(evento.curaHp, 0),
                escudoGanho: toNumber(evento.escudoGanho, 0),
                escudoAbsorvido: toNumber(evento.escudoAbsorvido, 0),
                hpAntes: toNumber(evento.hpAntes, 0),
                hpDepois: toNumber(evento.hpDepois, 0),
                hpMax: toNumber(evento.hpMax, 1),
                escudoAntes: toNumber(evento.escudoAntes, 0),
                escudoDepois: toNumber(evento.escudoDepois, 0)
            };
        }

        function montarUltimoEvento(path, meta, contexto = {}) {
            if(!meta) return null;
            const ctx = typeof contexto === 'string' ? { ator: contexto } : (contexto || {});
            const alvoInfo = pathParaEvento(path);
            const textos = textosUltimoEvento(meta);
            const logTexto = formatarLogCombate(path, meta, contexto);
            return {
                id: gerarIdEventoCombate(),
                tipo: tipoEventoPorMeta(meta),
                atorNome: ctx.ator || '',
                alvoNome: ctx.alvo || getNomeAlvoPorPath(path),
                alvoTipo: alvoInfo.alvoTipo,
                alvoId: alvoInfo.alvoId,
                membroId: alvoInfo.membroId || '',
                danoHp: toNumber(meta.danoHp, 0),
                curaHp: toNumber(meta.curaHp, 0),
                escudoGanho: toNumber(meta.escudoGanho, 0),
                escudoAbsorvido: toNumber(meta.escudoAbsorvido, 0),
                hpAntes: toNumber(meta.hpAntes, 0),
                hpDepois: toNumber(meta.hpDepois, 0),
                hpMax: toNumber(meta.hpMax, 1),
                escudoAntes: toNumber(meta.escudoAntes, 0),
                escudoDepois: toNumber(meta.escudoDepois, 0),
                texto: textos.map(item => item.texto).join(' | '),
                logTexto
            };
        }

        async function publicarUltimoEvento(evento) {
            if(!evento) return;
            if(!evento.id) evento.id = gerarIdEventoCombate();
            eventosLocaisPublicados.add(evento.id);
            try {
                await safeUpdate('estado_combate/ultimo_evento', evento);
            } catch (err) {
                eventosLocaisPublicados.delete(evento.id);
                console.warn('Falha ao publicar ultimo_evento', err);
            }
        }

        function aplicarUltimoEventoVisual(evento) {
            if(!evento || evento.tipo === 'fim') return;
            if(evento.id && eventosLocaisPublicados.has(evento.id)) {
                eventosLocaisPublicados.delete(evento.id);
                return;
            }
            const path = pathFromEvento(evento);
            if(!path) return;
            const meta = metaFromUltimoEvento(evento);
            mostrarFeedbackFlutuante(path, meta);
            mostrarUltimoEventoNoCard(path, evento);
            aplicarHpAtrasadoVisual(path, meta);
            const logTexto = evento.logTexto || formatarLogCombate(path, meta, { ator: evento.atorNome, alvo: evento.alvoNome });
            if(logTexto) adicionarCombatLog(logTexto, meta.effectKind || 'info');
        }

        function registrarFeedbackELog(path, meta, contexto = 'Ação') {
            mostrarFeedbackFlutuante(path, meta);
            mostrarUltimoEventoNoCard(path, meta);
            aplicarHpAtrasadoVisual(path, meta);
            const frase = formatarLogCombate(path, meta, contexto);
            if(frase) adicionarCombatLog(frase, meta?.effectKind || 'info');
            publicarUltimoEvento(montarUltimoEvento(path, meta, contexto));
            if(visaoTaticaMestreAtiva) renderizarVisaoTaticaMestre();
        }

        function initVisaoTaticaMestre() {
            const painelMestre = document.getElementById('painel-mestre');
            if(painelMestre && !document.getElementById('btn-visao-tatica-mestre')) {
                const btn = document.createElement('button');
                btn.id = 'btn-visao-tatica-mestre';
                btn.type = 'button';
                btn.className = 'btn-visao-tatica';
                btn.textContent = 'Visão Tática';
                btn.onclick = () => toggleVisaoTaticaMestre();
                painelMestre.appendChild(btn);
            }

            const mesa = document.querySelector('.mesa-de-jogo');
            if(mesa && !document.getElementById('visao-tatica-mestre')) {
                const painel = document.createElement('div');
                painel.id = 'visao-tatica-mestre';
                painel.className = 'visao-tatica-mestre';
                painel.style.display = 'none';
                mesa.insertAdjacentElement('afterend', painel);
            }
        }

        window.toggleVisaoTaticaMestre = function() {
            visaoTaticaMestreAtiva = !visaoTaticaMestreAtiva;
            atualizarEstadoVisaoTaticaMestre();
        }

        function atualizarEstadoVisaoTaticaMestre() {
            const mesa = document.querySelector('.mesa-de-jogo');
            const painel = document.getElementById('visao-tatica-mestre');
            const btn = document.getElementById('btn-visao-tatica-mestre');
            if(mesa) mesa.style.display = visaoTaticaMestreAtiva ? 'none' : '';
            if(painel) painel.style.display = visaoTaticaMestreAtiva ? 'grid' : 'none';
            if(btn) btn.classList.toggle('ativo', visaoTaticaMestreAtiva);
            if(visaoTaticaMestreAtiva) renderizarVisaoTaticaMestre();
        }

        function criarEntradaTatica(path, dados, tipo, slotNum, tituloExtra = '') {
            return {
                path,
                dados: dados || {},
                tipo,
                slotNum,
                tituloExtra,
                ativo: ameacaEmCombateGlobal && path.includes(ameacaEmCombateGlobal)
            };
        }

        function coletarEntradasTaticas() {
            const entradas = [];
            const pathsIncluidos = new Set();

            playersList.forEach(playerId => {
                const slotHeroi = Object.entries(slotsDeVisao).find(([, slot]) => slot.tipo === 'heroi' && slot.idFicha === playerId);
                const slotNum = slotHeroi ? slotHeroi[0] : null;
                const dados = slotHeroi?.[1]?.dados || fichasNoBanco[playerId] || { nome: usuarios[playerId]?.nome || playerId };
                const path = `fichas/${playerId}`;
                entradas.push(criarEntradaTatica(path, dados, 'heroi', slotNum));
                pathsIncluidos.add(path);
            });

            for(const [numSlot, slot] of Object.entries(slotsDeVisao)) {
                if(!slot?.idFicha || !slot?.dados) continue;
                if(slot.tipo === 'heroi') continue;

                if(slot.tipo === 'horda') {
                    const membros = slot.dados.membros || {};
                    Object.entries(membros).forEach(([mId, mData]) => {
                        const path = `hordas/${slot.idFicha}/membros/${mId}`;
                        if(pathsIncluidos.has(path)) return;
                        entradas.push(criarEntradaTatica(path, mData, 'horda', numSlot, slot.dados.nome || slot.idFicha));
                        pathsIncluidos.add(path);
                    });
                    continue;
                }

                const path = `fichas/${slot.idFicha}`;
                if(pathsIncluidos.has(path)) continue;
                entradas.push(criarEntradaTatica(path, slot.dados, slot.tipo || 'ficha', numSlot));
                pathsIncluidos.add(path);
            }

            if(ameacaEmCombateGlobal && !Array.from(pathsIncluidos).some(path => path.includes(ameacaEmCombateGlobal))) {
                if(ameacaEmCombateGlobal.startsWith('horda_')) {
                    const horda = hordasNoBanco[ameacaEmCombateGlobal];
                    Object.entries(horda?.membros || {}).forEach(([mId, mData]) => {
                        const path = `hordas/${ameacaEmCombateGlobal}/membros/${mId}`;
                        if(pathsIncluidos.has(path)) return;
                        entradas.push(criarEntradaTatica(path, mData, 'horda', null, horda.nome || ameacaEmCombateGlobal));
                        pathsIncluidos.add(path);
                    });
                } else {
                    const path = `fichas/${ameacaEmCombateGlobal}`;
                    if(!pathsIncluidos.has(path)) {
                        entradas.push(criarEntradaTatica(path, fichasNoBanco[ameacaEmCombateGlobal] || monstrosNoBanco[ameacaEmCombateGlobal] || { nome: ameacaEmCombateGlobal }, 'monstro', null));
                        pathsIncluidos.add(path);
                    }
                }
            }

            return entradas;
        }

        function renderizarVisaoTaticaMestre() {
            const painel = document.getElementById('visao-tatica-mestre');
            if(!painel || !visaoTaticaMestreAtiva) return;
            const entradas = coletarEntradasTaticas();
            if(entradas.length === 0) {
                painel.innerHTML = '<div class="tactical-empty">Nenhuma ficha ou ameaça carregada nos slots.</div>';
                return;
            }

            painel.innerHTML = entradas.map(renderizarCardTatico).join('');
        }

        function renderizarCardTatico(entrada) {
            const d = entrada.dados || {};
            const nome = escapeHtml(d.nome || entrada.path.split('/').pop());
            const tipo = escapeHtml(entrada.tipo === 'horda' ? `Horda${entrada.tituloExtra ? ' · ' + entrada.tituloExtra : ''}` : entrada.tipo);
            const hpAtual = toNumber(d['hp-atual'], 0);
            const hpMax = Math.max(1, entrada.tipo === 'heroi' ? getHpMaxEfetivo(d, entrada.path) : toNumber(d['hp-max'], 1));
            const manaAtual = toNumber(d['mana-atual'], 0);
            const manaMax = toNumber(d['mana-max'], 0);
            const ap = toNumber(d.ap, 0);
            const escudo = toNumber(d.escudo, 0);
            const hpPerc = clamp((hpAtual / hpMax) * 100, 0, 100);
            const manaPerc = manaMax > 0 ? clamp((manaAtual / manaMax) * 100, 0, 100) : 0;
            const slotAttr = entrada.slotNum ? `data-slot="${entrada.slotNum}"` : '';
            const btnAbrir = entrada.slotNum ? `<button type="button" onclick="abrirFichaTatica(${entrada.slotNum})">Abrir ficha</button>` : '';

            return `
                <article class="tactical-card ${entrada.ativo ? 'ativo' : ''}" ${slotAttr}>
                    <header>
                        <span>${nome}</span>
                        <small>${tipo}</small>
                    </header>
                    <div class="tactical-stat-line">
                        <span>HP</span>
                        <strong>${hpAtual} / ${hpMax}</strong>
                    </div>
                    <div class="tactical-mini-bar hp"><i style="width:${hpPerc}%"></i></div>
                    ${manaMax > 0 ? `
                        <div class="tactical-stat-line">
                            <span>Mana</span>
                            <strong>${manaAtual} / ${manaMax}</strong>
                        </div>
                        <div class="tactical-mini-bar mana"><i style="width:${manaPerc}%"></i></div>
                    ` : ''}
                    <div class="tactical-meta">
                        ${ap ? `<span>AP ${ap}</span>` : ''}
                        <span>Escudo ${escudo}</span>
                    </div>
                    <div class="tactical-actions">
                        <button type="button" onclick="acaoRapidaTatica('${entrada.path}', 'dano')">Dano</button>
                        <button type="button" onclick="acaoRapidaTatica('${entrada.path}', 'cura')">Cura</button>
                        <button type="button" onclick="acaoRapidaTatica('${entrada.path}', 'escudo')">Escudo</button>
                        ${btnAbrir}
                    </div>
                </article>
            `;
        }

        window.acaoRapidaTatica = async function(path, effectKind) {
            const label = effectKind === 'cura' ? 'cura' : effectKind === 'escudo' ? 'escudo' : 'dano';
            const valor = Number(prompt(`Valor de ${label}:`, ''));
            if(!valor || valor <= 0) return;
            const meta = await aplicarEfeitoVidaPath(path, valor, effectKind);
            registrarFeedbackELog(path, meta, `Ação tática (${label})`);
        }

        window.abrirFichaTatica = function(numSlot) {
            visaoTaticaMestreAtiva = false;
            atualizarEstadoVisaoTaticaMestre();
            document.getElementById(`slot-${numSlot}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

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
    let sidebarHtml = '';
    if (numSlot === 1) {
        sidebarHtml = `
    <!-- LATERAL ESQUERDA (GRIMÓRIO E COMBATE) -->
    <div id="sidebar-jogador-slot${numSlot}" class="sidebar-mestre sidebar-fechada sidebar-jogador-custom">
        <button id="btn-toggle-jogador-slot${numSlot}" class="btn-toggle-sidebar-jogador" onclick="toggleSidebarJogador(${numSlot})">▶</button>
        <div class="sidebar-header" style="text-align: center; font-size: 18px; margin-bottom: 20px; color:#d4af37;">Ações e Combate</div>

        <div style="overflow-y:auto; padding:0 15px; flex:1; margin-bottom:20px;">
            <div class="buff-container" style="border-color:#3a2212; background:rgba(0, 0, 0, 0.4); padding: 15px;">
                <div style="margin-bottom: 15px;">
                    <label style="color:#d95757; font-weight:bold;">Ameaça na Mesa:</label>
                    <span id="nome-ameaca-ativa-slot${numSlot}" style="color:#fff;">Nenhuma ameaça na mesa no momento...</span>
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="color:#b89c72;">Alvos Disponíveis</label>
                    <div id="alvos-combate-slot${numSlot}" style="background: rgba(0,0,0,0.5); border: 1px solid #5c1818; padding: 5px; border-radius: 4px; overflow-y:auto; max-height:100px; display:flex; flex-direction:column; gap:5px;">
                    </div>
                </div>

                <button class="btn-abrir-grimorio editavel-slot${numSlot}" onclick="abrirGrimorio(${numSlot})">📜 GRIMÓRIO</button>

                <div class="box-magias-equipadas" id="box-magias-equipadas-slot${numSlot}">
                    <label style="color:#d4af37; border-bottom: 1px solid #3a2212; padding-bottom: 5px; margin-bottom: 5px; text-align: left;">ATAQUES / MAGIAS</label>
                    <div id="lista-feiticos-combate-slot${numSlot}" style="max-height: 120px; overflow-y: auto;">
                        <label class="magia-radio-item"><input type="radio" name="feitico-selecionado-slot${numSlot}" value="fisico" checked><span class="magia-icon-mini">⚔️</span> <span>Ataque Básico</span></label>
                    </div>
                </div>

                <div style="display: flex; gap: 10px; align-items: center; margin-top: 15px;">
                    <label style="color:#b89c72; margin:0;">Total Rolado (Dano/Cura)</label>
                    <input type="number" id="slot${numSlot}-jogador-ataque-dano" class="editavel-slot${numSlot}" placeholder="Valor" style="text-align:center; font-size: 16px; padding: 5px; border-color:#d4af37; color:#fff; width: 80px;">
                </div>

                <button id="btn-acao-combate-slot${numSlot}" data-acao-combate="ataque-jogador" onclick="jogadorLancarFeitico(${numSlot})" class="btn-lancar-feitico editavel-slot${numSlot}">ATACAR</button>

                <div class="box-passivas-combate">
                    <div class="titulo-passivas">Passivas em Vigor no Combate</div>
                    <div class="passivas-flex" id="lista-passivas-combate-slot${numSlot}">
                        <div style="color:#5c3a21; font-size: 10px; font-style: italic;">Nenhuma equipada</div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    }

    return sidebarHtml + `
    <!-- FICHA PRINCIPAL -->
    <div class="container" id="container-slot${numSlot}-heroi">
        <div class="header-grid" style="align-items: flex-start;">
            <!-- Coluna Esquerda: Foto -->
            <div style="display: flex; flex-direction: column; align-items: center;">
                <img id="img-foto-slot${numSlot}" class="foto-personagem" src="" alt="Sem foto">
                <label class="btn-upload editavel-slot${numSlot}-label">📁 Enviar do PC<input type="file" class="editavel-slot${numSlot}" accept="image/*" style="display:none;" onchange="processarUploadOtimizado(event, ${numSlot})"></label>
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
                    <label>Raça</label>
                    <select id="slot${numSlot}-raca" class="editavel-slot${numSlot}">
                        <option value="">Nenhuma</option>
                        <option value="Humanos">Humanos</option>
                        <option value="Elfo">Elfo</option>
                        <option value="Anão">Anão</option>
                        <option value="Orc">Orc</option>
                        <option value="Gnomo">Gnomo</option>
                        <option value="Halfling">Halfling</option>
                        <option value="Khajiit">Khajiit</option>
                        <option value="Argoniano">Argoniano</option>
                    </select>
                </div>
                <div>
                    <label>Classe</label>
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
                <div id="slot${numSlot}-caminho-arvore" class="caminho-arvore-ficha" style="grid-column: span 2;">Caminho: Nenhum escolhido</div>
                <div><label>Gênero</label><input type="text" id="slot${numSlot}-genero" class="editavel-slot${numSlot}"></div>

                <!-- Árvore logo abaixo das caixas de texto -->
                <div style="grid-column: span 2; margin-top: 15px;">
                    <button class="btn-mini-acao editavel-slot${numSlot}" onclick="abrirArvoreHabilidades('${numSlot}')" style="width: 100%; padding: 12px; font-size: 16px; border-color: #d4af37; color: #d4af37; box-shadow: 0 0 15px rgba(212, 175, 55, 0.3); background: rgba(0,0,0,0.6); letter-spacing: 1px;">📜 ÁRVORE DE HABILIDADES</button>
                </div>
            </div>
        </div>

        <div class="section-title" style="margin-top: 15px; margin-bottom: 0;">Essência Vital</div>
        <div class="status-grid" style="grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 5px 0 20px 0; padding: 20px;">
            <div id="caixa-hp-slot${numSlot}" class="caixa-status" style="grid-column: span 1;">
                <label style="color: #27ae60; text-align: center;">HP</label>
                <div class="fraction-input" style="justify-content: center;">
                    <input type="number" id="slot${numSlot}-hp-atual" class="editavel-slot${numSlot}" style="color: #27ae60;"><span>/</span><span id="slot${numSlot}-hp-efetivo" style="color: #27ae60; font-size: 20px; font-weight: bold; width:40px; display:inline-block; text-align:left;">20</span>
                </div>
                <div class="mestre-only-flex" style="justify-content: center;">
                    <label style="margin:0; color:#9c8464;">Base Máx (Mestre):</label>
                    <input type="number" id="slot${numSlot}-hp-max" class="editavel-slot${numSlot} mestre-unlocked" title="Vida Base Máxima (Padrão 20)" style="width:50px; padding:2px; font-size:11px;">
                </div>
                <div class="bar-bg"><div class="bar-fill hp-fill" id="bar-hp-slot${numSlot}" style="width: 100%;"></div><div class="shield-fill" id="bar-shield-slot${numSlot}" style="width: 0%;"></div><div class="hp-text-overlay" id="txt-escudo-slot${numSlot}"></div></div>
            </div>
            <div class="caixa-status" style="grid-column: span 1;">
                <label style="color: #2980b9; text-align: center;">MANA</label>
                <div class="fraction-input" style="justify-content: center;">
                    <input type="number" id="slot${numSlot}-mana-atual" class="editavel-slot${numSlot}" style="color: #2980b9;"><span>/</span><span id="slot${numSlot}-mana-efetivo" style="color: #2980b9; font-size: 20px; font-weight: bold; width:40px; display:inline-block; text-align:left;">20</span>
                </div>
                <div class="mestre-only-flex" style="justify-content: center;">
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
                        <label class="btn-upload editavel-slot${numSlot}-label esconder-jogador">📷 Upload<input type="file" class="editavel-slot${numSlot}" accept="image/*" style="display:none;" onchange="processarUploadOtimizado(event, ${numSlot})"></label>
                    </div>
                    <div style="display: flex; flex-direction: column; justify-content: center; position: relative;">
                        <div class="mestre-acoes-ficha esconder-jogador" style="position: absolute; top: -10px; right: 0; display: flex; gap: 5px;">
                            <button onclick="lancarAmeacaFicha(${numSlot})" style="background: rgba(0,0,0,0.5); border: 1px solid #d4af37; color: #d4af37; padding: 3px 8px; font-size: 10px; cursor: pointer;">👁️ Lançar</button>
                            <button onclick="abaterAmeacaFicha(${numSlot})" style="background: rgba(0,0,0,0.5); border: 1px solid #8c1c13; color: #d95757; padding: 3px 8px; font-size: 10px; cursor: pointer;">FINALIZAR COMBATE</button>
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
                        <button class="editavel-slot${numSlot}" data-acao-combate="ataque-monstro" onclick="executarAtaque(${numSlot})" style="background: linear-gradient(to bottom, #8c1c13, #4a1111); border-color:#d95757; color: #fff; padding: 10px 20px; font-weight: bold; text-shadow: 1px 1px 2px black;">⚔️ ATACAR</button>
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
                initCombatUi();
                initVoicePrototype();

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
                    onValue(dbRef('fichas/' + usuarioAtual.idFicha), (snapshot) => {
                        const dados = snapshot.val() || {};
                        fichasNoBanco[usuarioAtual.idFicha] = dados;
                        const spanNomeHeroi = document.getElementById('nome-heroi-jogador');
                        if(spanNomeHeroi) spanNomeHeroi.textContent = dados['nome'] || "Herói Sem Nome";
                    });
                    abrirFichaNoSlot(1, 'heroi', usuarioAtual.idFicha);
                }
                iniciarOuvintesGerais();
            } else {
                document.getElementById('msg-erro').style.display = "block";
            }
        }

        function gerarIdIniciativa(prefixo = 'id') { return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${prefixo}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`; }
        function chaveParticipanteIniciativa(tipo, id) { return `${tipo}__${String(id || '').replace(/[^a-zA-Z0-9_-]/g, '_')}`; }
        function ordenarParticipantesIniciativa(participantes = {}) { return Object.values(participantes).sort((a,b)=>{ const ia=toNumber(a.iniciativa,0), ib=toNumber(b.iniciativa,0); if(ia===0&&ib!==0)return 1; if(ib===0&&ia!==0)return -1; if(ib!==ia)return ib-ia; return toNumber(a.ordemEntrada,0)-toNumber(b.ordemEntrada,0); }).map(p=>p.chave); }
        function getParticipanteAtual(iniciativa = iniciativaAtual) { const ch=(iniciativa?.ordem||[])[toNumber(iniciativa?.indiceAtual,0)]; return iniciativa?.participantes?.[ch] || null; }
        function membrosVivosHorda(hordaId) { const membros=hordasNoBanco?.[hordaId]?.membros||{}; return Object.keys(membros).filter(id=>toNumber(membros[id]?.['hp-atual'],0)>0).sort((a,b)=>toNumber(a.replace(/\D/g,''),0)-toNumber(b.replace(/\D/g,''),0)); }
        function isParticipanteValidoIniciativa(p) { if(!p)return false; if(p.tipo==='jogador')return Boolean(usuarios[p.id]); if(p.tipo==='monstro')return Boolean(fichasNoBanco[p.id])&&toNumber(fichasNoBanco[p.id]?.['hp-atual'],0)>0; if(p.tipo==='horda')return membrosVivosHorda(p.id).length>0; return false; }
        function normalizarHordaTurno(iniciativa) { const atual=getParticipanteAtual(iniciativa); if(!atual||atual.tipo!=='horda')return { hordaId:'', membroAtualId:'', membrosConcluidos:{} }; const vivos=membrosVivosHorda(atual.id); const concl=iniciativa.hordaTurno?.hordaId===atual.id ? {...(iniciativa.hordaTurno?.membrosConcluidos||{})} : {}; return { hordaId: atual.id, membroAtualId: vivos.find(id=>!concl[id]) || '', membrosConcluidos: concl }; }
        function normalizarEstadoIniciativa(iniciativa, contextoAtual = {}) { if(!iniciativa||iniciativa.estado!==INICIATIVA_ESTADOS.ATIVA)return null; const antes=JSON.stringify({o:iniciativa.ordem,i:iniciativa.indiceAtual,r:iniciativa.rodada,h:iniciativa.hordaTurno,e:iniciativa.estadoInterno}); const participantes={...(iniciativa.participantes||{})}; let ordem=[...(iniciativa.ordem||[])].filter(ch=>participantes[ch]&&isParticipanteValidoIniciativa(participantes[ch])); let indiceAtual=Math.max(0,Math.min(toNumber(iniciativa.indiceAtual,0),Math.max(ordem.length-1,0))); let rodada=Math.max(1,toNumber(iniciativa.rodada,1)); if(ordem.length && indiceAtual>=ordem.length){ indiceAtual=0; rodada++; } const prox={...iniciativa, participantes, ordem, indiceAtual, rodada, estadoInterno: ordem.length?'normal':'sem_participantes'}; prox.hordaTurno=normalizarHordaTurno(prox); return antes===JSON.stringify({o:prox.ordem,i:prox.indiceAtual,r:prox.rodada,h:prox.hordaTurno,e:prox.estadoInterno}) ? null : prox; }
        async function persistirNormalizacaoIniciativa() { if(usuarioAtual?.cargo!=='Mestre'||!iniciativaAtual?.combateId)return; const combateId=iniciativaAtual.combateId; try { await safeTransaction(PATH_INICIATIVA, atual=>{ if(!atual||atual.combateId!==combateId||atual.estado!==INICIATIVA_ESTADOS.ATIVA)return; return normalizarEstadoIniciativa(atual,{}) || atual; }); } catch(err) { console.error('Erro ao normalizar iniciativa.', err); } }
        async function criarEstadoInicialIniciativa(ameacaId, tipoAmeaca) { const participantes={}; let ordemEntrada=0; playersList.forEach(id=>{ if(fichasNoBanco[id]||usuarios[id]){ const ch=chaveParticipanteIniciativa('jogador',id); participantes[ch]={chave:ch,id,tipo:'jogador',nome:usuarios[id]?.nome||id,iniciativa:0,confirmado:false,ordemEntrada:ordemEntrada++}; } }); const dados=tipoAmeaca==='horda'?hordasNoBanco[ameacaId]:fichasNoBanco[ameacaId]; const ch=chaveParticipanteIniciativa(tipoAmeaca,ameacaId); participantes[ch]={chave:ch,id:ameacaId,tipo:tipoAmeaca,nome:dados?.nome||ameacaId,iniciativa:0,confirmado:true,ordemEntrada:ordemEntrada++}; return { schemaVersion: INICIATIVA_SCHEMA_VERSION, combateId: gerarIdIniciativa('combate'), ameacaId, ameacaTipo: tipoAmeaca, estado: INICIATIVA_ESTADOS.COLETANDO, estadoInterno: 'normal', rodada: 1, indiceAtual: 0, versaoTurno: 0, participantes, ordem: ordenarParticipantesIniciativa(participantes), hordaTurno: { hordaId:'', membroAtualId:'', membrosConcluidos:{} }, ultimaAcaoId: '', criadoEm: Date.now() }; }
        async function ativarCombateComIniciativa(ameacaId, tipoAmeaca) { if(usuarioAtual?.cargo!=='Mestre') throw new Error('Somente o Mestre pode iniciar combate.'); const existe=tipoAmeaca==='horda' ? (hordasNoBanco[ameacaId] || (await safeGet(`hordas/${ameacaId}`)).val()) : (fichasNoBanco[ameacaId] || (await safeGet(`fichas/${ameacaId}`)).val()); if(!ameacaId||!existe) throw new Error(`Ameaça inexistente para iniciativa: ${ameacaId}`); const iniciativa=await criarEstadoInicialIniciativa(ameacaId,tipoAmeaca); await safeUpdate(PATH_ESTADO_COMBATE, { ativo: ameacaId, iniciativa }); return iniciativa; }
        async function encerrarCombateComIniciativa() { await safeUpdate(PATH_ESTADO_COMBATE, { ativo: null, iniciativa: null }); limparInterfaceIniciativa(); }
        function limparInterfaceIniciativa() { iniciativaAtual=null; iniciativaTurnoTravado=false; ['initiative-player-modal','initiative-master-modal'].forEach(id=>{ const el=document.getElementById(id); if(el){ el.classList.remove('is-open'); el.setAttribute('aria-hidden','true'); } }); const board=document.getElementById('initiative-turn-board'); if(board) board.hidden=true; document.querySelectorAll('[data-acao-combate]').forEach(el=>el.disabled=false); }
        function abrirModalIniciativa(el){ if(el){ el.classList.add('is-open'); el.setAttribute('aria-hidden','false'); setTimeout(()=>el.querySelector('input,button')?.focus(),0); } }
        function fecharModalIniciativa(el){ if(el){ el.classList.remove('is-open'); el.setAttribute('aria-hidden','true'); } }
        function renderizarIniciativa(){ try{ if(!iniciativaAtual)return limparInterfaceIniciativa(); renderizarModalJogadorIniciativa(); renderizarModalMestreIniciativa(); renderizarQuadroTurnosIniciativa(); atualizarPermissoesAcoesCombate(); }catch(err){ console.error('Erro ao renderizar iniciativa.',err); } }
        function renderizarModalJogadorIniciativa(){ const modal=document.getElementById('initiative-player-modal'); if(!modal||usuarioAtual?.cargo!=='Jogador'||iniciativaAtual?.estado!==INICIATIVA_ESTADOS.COLETANDO)return fecharModalIniciativa(modal); const ch=chaveParticipanteIniciativa('jogador',usuarioAtual.idFicha); const p=iniciativaAtual.participantes?.[ch]; if(!p||p.confirmado)return fecharModalIniciativa(modal); const input=document.getElementById('initiative-player-input'), btn=document.getElementById('initiative-player-confirm'); const validar=()=>{const v=Number(input.value); btn.disabled=!(Number.isInteger(v)&&v>=1&&v<=20);}; input.oninput=validar; input.onkeydown=e=>{ if(e.key==='Enter'&&!btn.disabled)btn.click(); if(e.key==='Escape')e.preventDefault(); }; btn.onclick=async()=>{ const v=Number(input.value); if(!(Number.isInteger(v)&&v>=1&&v<=20))return; btn.disabled=true; const combateId=iniciativaAtual.combateId; const r=await safeTransaction(PATH_INICIATIVA, atual=>{ if(!atual||atual.combateId!==combateId||atual.estado!==INICIATIVA_ESTADOS.COLETANDO)return; const part=atual.participantes?.[ch]; if(!part||part.confirmado)return; const participantes={...atual.participantes,[ch]:{...part,iniciativa:v,confirmado:true,confirmadoEm:Date.now()}}; return {...atual,participantes,ordem:ordenarParticipantesIniciativa(participantes)}; }); if(r.committed)fecharModalIniciativa(modal); else btn.disabled=false; }; validar(); abrirModalIniciativa(modal); }
        function renderizarModalMestreIniciativa(){ const modal=document.getElementById('initiative-master-modal'); if(!modal||usuarioAtual?.cargo!=='Mestre')return fecharModalIniciativa(modal); if(![INICIATIVA_ESTADOS.COLETANDO,INICIATIVA_ESTADOS.ORGANIZANDO].includes(iniciativaAtual?.estado))return fecharModalIniciativa(modal); const lista=document.getElementById('initiative-master-list'), action=document.getElementById('initiative-master-action'); lista.textContent=''; const ordem=iniciativaAtual.estado===INICIATIVA_ESTADOS.COLETANDO?ordenarParticipantesIniciativa(iniciativaAtual.participantes):(iniciativaAtual.ordem||[]); ordem.forEach((ch,idx)=>{ const p=iniciativaAtual.participantes[ch]; if(!p)return; const row=document.createElement('div'); row.className='initiative-row'; const up=document.createElement('button'); up.type='button'; up.textContent='↑'; up.disabled=iniciativaAtual.estado!==INICIATIVA_ESTADOS.ORGANIZANDO||idx===0; up.onclick=()=>moverParticipanteIniciativa(idx,-1); const name=document.createElement('div'); name.className='initiative-row-name'; name.textContent=p.nome||p.id; const st=document.createElement('div'); st.className='initiative-row-status'; st.textContent=p.confirmado?'enviado':'pendente'; name.appendChild(st); const inp=document.createElement('input'); inp.type='number'; inp.value=toNumber(p.iniciativa,0); inp.disabled=iniciativaAtual.estado===INICIATIVA_ESTADOS.COLETANDO&&p.tipo==='jogador'; inp.onchange=()=>editarIniciativaParticipante(ch,Number(inp.value)||0); const down=document.createElement('button'); down.type='button'; down.textContent='↓'; down.disabled=iniciativaAtual.estado!==INICIATIVA_ESTADOS.ORGANIZANDO||idx===ordem.length-1; down.onclick=()=>moverParticipanteIniciativa(idx,1); row.append(up,name,inp,down); lista.appendChild(row); }); action.textContent=iniciativaAtual.estado===INICIATIVA_ESTADOS.COLETANDO?'ORGANIZAR ORDEM':'CONFIRMAR ORDEM'; action.onclick=iniciativaAtual.estado===INICIATIVA_ESTADOS.COLETANDO?organizarOrdemIniciativa:confirmarOrdemIniciativa; abrirModalIniciativa(modal); }
        async function editarIniciativaParticipante(ch,valor){ const combateId=iniciativaAtual?.combateId; await safeTransaction(PATH_INICIATIVA,atual=>{ if(!atual||atual.combateId!==combateId||![INICIATIVA_ESTADOS.COLETANDO,INICIATIVA_ESTADOS.ORGANIZANDO].includes(atual.estado)||!atual.participantes?.[ch])return; const participantes={...atual.participantes,[ch]:{...atual.participantes[ch],iniciativa:Math.max(0,Math.trunc(valor))}}; return {...atual,participantes,ordem:atual.estado===INICIATIVA_ESTADOS.COLETANDO?ordenarParticipantesIniciativa(participantes):atual.ordem}; }); }
        async function organizarOrdemIniciativa(){ const combateId=iniciativaAtual?.combateId; await safeTransaction(PATH_INICIATIVA,atual=>!atual||atual.combateId!==combateId||atual.estado!==INICIATIVA_ESTADOS.COLETANDO?undefined:{...atual,estado:INICIATIVA_ESTADOS.ORGANIZANDO,ordem:ordenarParticipantesIniciativa(atual.participantes)}); }
        async function moverParticipanteIniciativa(idx,delta){ const combateId=iniciativaAtual?.combateId; await safeTransaction(PATH_INICIATIVA,atual=>{ if(!atual||atual.combateId!==combateId||atual.estado!==INICIATIVA_ESTADOS.ORGANIZANDO)return; const ordem=[...(atual.ordem||[])], j=idx+delta; if(j<0||j>=ordem.length)return; [ordem[idx],ordem[j]]=[ordem[j],ordem[idx]]; return {...atual,ordem}; }); }
        async function confirmarOrdemIniciativa(){ const combateId=iniciativaAtual?.combateId; await safeTransaction(PATH_INICIATIVA,atual=>{ if(!atual||atual.combateId!==combateId||atual.estado!==INICIATIVA_ESTADOS.ORGANIZANDO)return; let prox={...atual,estado:INICIATIVA_ESTADOS.ATIVA,rodada:1,indiceAtual:0,versaoTurno:toNumber(atual.versaoTurno,0)+1}; prox=normalizarEstadoIniciativa(prox,{})||prox; prox.hordaTurno=normalizarHordaTurno(prox); return prox; }); }
        function getFotoParticipante(p){ if(!p)return ''; const foto=fotosNoBanco[p.id]; return foto?.base64 || foto || ''; }
        function renderizarQuadroTurnosIniciativa(){ const board=document.getElementById('initiative-turn-board'); if(!board)return; const atual=getParticipanteAtual(); if(!ameacaEmCombateGlobal||iniciativaAtual?.estado!==INICIATIVA_ESTADOS.ATIVA||!atual||iniciativaAtual.estadoInterno==='sem_participantes'){ board.hidden=true; return; } board.hidden=false; document.getElementById('initiative-round').textContent=`Rodada ${toNumber(iniciativaAtual.rodada,1)}`; const cont=document.getElementById('initiative-portraits'); cont.textContent=''; (iniciativaAtual.ordem||[]).slice(toNumber(iniciativaAtual.indiceAtual,0),toNumber(iniciativaAtual.indiceAtual,0)+5).forEach((ch,i)=>{ const p=iniciativaAtual.participantes[ch]; if(!p)return; const item=document.createElement('div'); item.className='initiative-portrait'+(i===0?' is-current':''); item.tabIndex=0; if(i===0)item.setAttribute('aria-current','true'); const foto=getFotoParticipante(p); if(foto){ const img=document.createElement('img'); img.src=foto; img.alt=''; item.appendChild(img); } const tip=document.createElement('div'); tip.className='initiative-tooltip'; let texto=p.nome||p.id; if(p.tipo==='horda'){ const vivos=membrosVivosHorda(p.id); texto += ` - membro ${iniciativaAtual.hordaTurno?.membroAtualId || vivos[0] || '-'} - vivos ${vivos.length}`; } tip.textContent=texto; item.appendChild(tip); cont.appendChild(item); }); const btn=document.getElementById('initiative-end-turn'); btn.disabled=iniciativaTurnoTravado||!podeEncerrarTurno(usuarioAtual,atual); btn.onclick=encerrarTurnoIniciativa; }
        function podeEncerrarTurno(usuario,participanteAtual){ if(!usuario||!participanteAtual)return false; if(usuario.cargo==='Mestre')return true; return participanteAtual.tipo==='jogador'&&usuario.idFicha===participanteAtual.id; }
        function podeUsuarioAgirAgora(slotNum=null,contexto={}){ if(!iniciativaAtual||iniciativaAtual.estado!==INICIATIVA_ESTADOS.ATIVA)return true; const atual=getParticipanteAtual(); if(!atual)return false; if(usuarioAtual?.cargo==='Mestre')return atual.tipo!=='jogador'; return atual.tipo==='jogador'&&usuarioAtual?.idFicha===atual.id; }
        function atualizarPermissoesAcoesCombate(){ document.querySelectorAll('[data-acao-combate]').forEach(el=>{ el.disabled=!podeUsuarioAgirAgora(); }); }
        async function processarFimTurnoIndividual(participante, contexto) { return {}; }
        async function encerrarTurnoIniciativa(){ const atual=getParticipanteAtual(); if(!podeEncerrarTurno(usuarioAtual,atual))return; iniciativaTurnoTravado=true; renderizarQuadroTurnosIniciativa(); await processarFimTurnoIndividual(atual,{iniciativa:iniciativaAtual}); const esperado={combateId:iniciativaAtual.combateId,ameacaId:iniciativaAtual.ameacaId,indiceAtual:toNumber(iniciativaAtual.indiceAtual,0),versaoTurno:toNumber(iniciativaAtual.versaoTurno,0),chave:atual.chave}; const acaoId=gerarIdIniciativa('acao'); const r=await safeTransaction(PATH_INICIATIVA,ini=>{ if(!ini||ini.combateId!==esperado.combateId||ini.ameacaId!==esperado.ameacaId||ini.estado!==INICIATIVA_ESTADOS.ATIVA||toNumber(ini.indiceAtual,0)!==esperado.indiceAtual||toNumber(ini.versaoTurno,0)!==esperado.versaoTurno||(ini.ordem||[])[ini.indiceAtual]!==esperado.chave)return; const p=ini.participantes?.[esperado.chave]; let prox={...ini,ultimaAcaoId:acaoId,versaoTurno:esperado.versaoTurno+1}; if(p?.tipo==='horda'){ const ht=normalizarHordaTurno(prox), concl={...(ht.membrosConcluidos||{})}; if(ht.membroAtualId)concl[ht.membroAtualId]=true; const proxM=membrosVivosHorda(p.id).find(id=>!concl[id]); if(proxM)return {...prox,hordaTurno:{hordaId:p.id,membroAtualId:proxM,membrosConcluidos:concl}}; } if(esperado.indiceAtual>=(prox.ordem||[]).length-1){ prox.indiceAtual=0; prox.rodada=toNumber(prox.rodada,1)+1; prox.hordaTurno={hordaId:'',membroAtualId:'',membrosConcluidos:{}}; } else prox.indiceAtual=esperado.indiceAtual+1; return normalizarEstadoIniciativa(prox,{})||prox; }); if(!r.committed)iniciativaTurnoTravado=false; }
        function iniciarOuvinteIniciativa(){ if(unsubscribeIniciativa)unsubscribeIniciativa(); unsubscribeIniciativa=onValue(dbRef(PATH_INICIATIVA),snap=>{ iniciativaAtual=snap.val(); renderizarIniciativa(); persistirNormalizacaoIniciativa(); }); }

        function iniciarOuvintesGerais() {
            iniciarOuvinteIniciativa();
            onValue(dbRef('fotos'), (snapshot) => { fotosNoBanco = snapshot.val() || {}; renderizarQuadroTurnosIniciativa(); });
            onValue(dbRef('fichas'), (snapshot) => { fichasNoBanco = snapshot.val() || {}; atualizarPermissoesAcoesCombate(); persistirNormalizacaoIniciativa(); });
            onValue(dbRef('lista_monstros'), (snapshot) => {
                monstrosNoBanco = snapshot.val() || {};
                if(usuarioAtual.cargo === "Mestre") atualizarSidebarMestre();
            });

            onValue(dbRef('hordas'), (snapshot) => {
                hordasNoBanco = snapshot.val() || {};
                if(usuarioAtual.cargo === "Mestre") atualizarSidebarMestre();
            });

            onValue(dbRef('estado_combate/ativo'), (snapshot) => {
                const ameacaAnterior = ameacaEmCombateGlobal;
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

                if(ameacaAnterior && !ameacaEmCombateGlobal) {
                    limparCombatLog();
                    mostrarCombatToast("Combate encerrado.");
                }
                if(visaoTaticaMestreAtiva) renderizarVisaoTaticaMestre();
            });

            onValue(dbRef('estado_combate/ultimo_evento'), (snapshot) => {
                aplicarUltimoEventoVisual(snapshot.val());
            });
        }

        // ==========================================
        // GESTÃO DE MENUS E SLOTS DO MESTRE (NOVO)
        // ==========================================
        let ouvinteAlvoJogador = null;
        let refAlvoJogador = null;

        function atualizarAlvosJogador(ameacaId) {
            let nomeSpan1 = document.getElementById(`nome-ameaca-ativa-slot1`);
            let nomeSpan2 = document.getElementById(`nome-ameaca-ativa-slot2`);
            let alvosDiv1 = document.getElementById(`alvos-combate-slot1`);
            let alvosDiv2 = document.getElementById(`alvos-combate-slot2`);

            if(typeof ouvinteAlvoJogador === 'function') {
                ouvinteAlvoJogador();
            }

            const renderizarTodos = (nomeAmeaca, htmlInimigos) => {
                let htmlPlayers = '';
                playersList.forEach(p => {
                    htmlPlayers += `<label class="checkbox-alvo" style="color:#dcd0ba; font-size:12px; margin-bottom:2px;"><input type="checkbox" value="${p}"> Aliado: ${p.toUpperCase()}</label>`;
                });

                let separator = `<div style="border-bottom: 1px dashed #5c1818; margin: 5px 0;"></div>`;
                let finalHtml = htmlPlayers + separator + htmlInimigos;

                if(nomeSpan1) nomeSpan1.innerText = nomeAmeaca;
                if(nomeSpan2) nomeSpan2.innerText = nomeAmeaca;
                if(alvosDiv1) alvosDiv1.innerHTML = finalHtml;
                if(alvosDiv2) alvosDiv2.innerHTML = finalHtml;
            };

            if(!ameacaId) {
                renderizarTodos("Nenhuma ameaça na mesa no momento...", `<div style="color:#5c3a21; font-size:10px; font-style:italic;">Nenhum inimigo ativo.</div>`);
                return;
            }

            if(ameacaId.startsWith('horda_')) {
                refAlvoJogador = dbRef('hordas/' + ameacaId);
                ouvinteAlvoJogador = onValue(refAlvoJogador, (snap) => {
                    if(snap.exists()) {
                        let horda = snap.val();
                        let nomeHorda = horda.nome || 'Horda';
                        let nomeHordaHtml = escapeHtml(nomeHorda);
                        let html = '';
                        for(let mId in horda.membros) {
                            let hpAtual = Number(horda.membros[mId]['hp-atual']) || 0;
                            if(hpAtual > 0) {
                                html += `<label class="checkbox-alvo" style="color:#d95757; font-size:12px; margin-bottom:2px;"><input type="checkbox" value="${ameacaId}_${mId}"> Inimigo: ${nomeHordaHtml} #${escapeHtml(mId)} (HP: ${hpAtual})</label>`;
                            }
                        }
                        renderizarTodos(nomeHorda, html);
                    } else {
                        renderizarTodos("Ameaça removida.", "");
                    }
                });
            } else {
                refAlvoJogador = dbRef('fichas/' + ameacaId);
                ouvinteAlvoJogador = onValue(refAlvoJogador, (snap) => {
                    if(snap.exists()) {
                        let m = snap.val();
                        let hpAtual = Number(m['hp-atual']) || 0;
                        let nomeMonstro = m.nome || 'Monstro';
                        if(hpAtual > 0) {
                            renderizarTodos(nomeMonstro, `<label class="checkbox-alvo" style="color:#d95757; font-size:12px;"><input type="checkbox" value="${ameacaId}"> Inimigo: ${escapeHtml(nomeMonstro)} (HP: ${hpAtual})</label>`);
                        } else {
                            renderizarTodos(nomeMonstro + " (Derrotado)", "");
                        }
                    } else {
                        renderizarTodos("Ameaça removida.", "");
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
                        <span class="item-acervo-nome">${escapeHtml(monstrosNoBanco[id].nome || id)}</span>
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
                        <span class="item-acervo-nome">${escapeHtml(hordasNoBanco[id].nome || id)}</span>
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

            const idFicha = slotsDeVisao[numSlot].idFicha;
            if(!idFicha || slotsDeVisao[numSlot].tipo === 'horda') return;
            await safeUpdate(`fichas/${idFicha}`, { [`item${i}-qtd`]: newVal });
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
            if(visaoTaticaMestreAtiva) renderizarVisaoTaticaMestre();
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
            const nomeHordaHtml = escapeHtml(nomeHorda);
            let h = `
            <div style="position: relative;">
                <div class="mestre-acoes-ficha esconder-jogador" style="position: absolute; top: 5px; right: 5px; display: flex; gap: 5px; z-index: 10;">
                    <button onclick="lancarAmeacaFicha(${numSlot})" style="background: rgba(0,0,0,0.5); border: 1px solid #d4af37; color: #d4af37; padding: 3px 8px; font-size: 10px; cursor: pointer;">👁️ Lançar</button>
                    <button onclick="abaterAmeacaFicha(${numSlot})" style="background: rgba(0,0,0,0.5); border: 1px solid #8c1c13; color: #d95757; padding: 3px 8px; font-size: 10px; cursor: pointer;">FINALIZAR COMBATE</button>
                    <button onclick="deletarAmeacaFicha(${numSlot})" style="background: rgba(0,0,0,0.5); border: 1px solid #5c1818; color: #8c1c13; padding: 3px 8px; font-size: 10px; cursor: pointer;">🗑️ Apagar</button>
                </div>
                <div class="section-title" style="color:#d4af37; border-color:#8b6d43; margin-top:0;">🛡️ ${nomeHordaHtml}</div>
            </div>
            `;
            h += `<div style="display:flex; flex-direction:column; gap:15px; margin-top:15px;">`;

            for(let mId in membros) {
                let m = membros[mId];
                const nomeMembroHtml = escapeHtml(m.nome || mId);

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
                        <h4 style="color:#a84242; margin:0; text-transform: uppercase; font-size: 14px; min-width: 100px;">${nomeMembroHtml}</h4>

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
                            <button data-acao-combate="ataque-horda" onclick="atacarMembroHorda('${mId}')" style="padding: 6px 12px; font-size:11px; background: linear-gradient(to bottom, #8c1c13, #4a1111); border-color:#d95757; color: #fff; font-weight: bold;">⚔️ ATACAR</button>
                        </div>
                    </div>
                </div>`;
            }
            h += `</div>`;
            return h;
        }

        window.invocarMonstro = async function() {
            let nome = prompt("Nome da nova ameaça (Monstro/NPC):");
            if(!nome) return;
            nome = nome.trim();
            if(nome === "") return;

            // Generate a clean ID
            let id = nome.toLowerCase().replace(/[^a-z0-9]/g, '');
            if(!id) id = 'monstro_' + Date.now();
            const idOriginal = id;
            const existente = await safeGet('fichas/' + id);
            if (existente.exists()) id = `${idOriginal}_${Date.now()}`;

            // Set up basic ficha
            await safeUpdate('fichas/' + id, {
                nome: nome,
                tipo: 'monstro',
                'hp-max': 20,
                'hp-atual': 20,
                'mana-max': 20,
                'mana-atual': 20
            });
            // Register in the list
            await safeUpdate('lista_monstros/' + id, {
                nome: nome,
                ativo: true
            });
        }

        window.transformarEmHorda = async function(numSlot) {
            const idMonstroOriginal = slotsDeVisao[numSlot].idFicha;
            const qtdStr = document.getElementById(`slot${numSlot}-qtd-horda`).value;
            const qtd = Number(qtdStr);

            if(!qtd || qtd <= 1) return alert("Insira uma quantidade válida maior que 1 para gerar a horda!");

            const snap = await safeGet('fichas/' + idMonstroOriginal);
            let mData = snap.val();
            if(!mData) return;

            const hordaId = "horda_" + Date.now();
            let hordaData = { nome: mData.nome + " (Esquadrão)", membros: {} };

            for(let i=1; i<=qtd; i++) {
                hordaData.membros['m_' + i] = {
                    tipo: 'horda',
                    nome: mData.nome + " " + i,
                    'hp-atual': mData['hp-max'] || 20, 'hp-max': mData['hp-max'] || 20,
                    'mana-atual': mData['mana-max'] || 20, 'mana-max': mData['mana-max'] || 20,
                    for: mData.for || 0, des: mData.des || 0, con: mData.con || 0, int: mData.int || 0, sab: mData.sab || 0, car: mData.car || 0, per: mData.per || 0
                };
            }

            await safeUpdate('hordas/' + hordaId, hordaData);
            alert(`🛡️ Horda criada com sucesso! ${qtd} lacaios prontos.`);
            document.getElementById(`slot${numSlot}-qtd-horda`).value = '';

            const slotDestino = numSlot === 1 ? 2 : numSlot;
            mestreAbrir(slotDestino, 'horda', hordaId);
            await ativarCombateComIniciativa(hordaId, 'horda');
        }

        window.atacarMembroHorda = async function(membroId) {
            const inputDano = document.getElementById(`ataque-dano-${membroId}`);
            const dano = Number(inputDano.value);
            if(!dano || dano <= 0) return alert("Insira um valor de dano válido!");

            const checkboxes = document.querySelectorAll(`.alvo-ataque-${membroId}:checked`);
            if(checkboxes.length === 0) return alert("Selecione pelo menos um alvo para o ataque!");

            const alvos = Array.from(checkboxes).map(cb => cb.value);
            const ator = getNomeAtorHorda(membroId);
            for(let alvo of alvos) {
                const pathAlvo = 'fichas/' + alvo;
                const meta = await aplicarEfeitoVidaPath(pathAlvo, dano, 'dano');
                registrarFeedbackELog(pathAlvo, meta, { ator });
            }
            inputDano.value = '';
            checkboxes.forEach(cb => cb.checked = false);
            destacarAlvosSelecionados();
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
            const snap = await safeGet('');
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
                alert("Escolha uma Classe primeiro na ficha para liberar sua árvore de melhorias!");
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

            const modalArvore = document.getElementById('modal-arvore');
            modalArvore.style.display = "flex";
            void modalArvore.offsetWidth;
            modalArvore.classList.add('aberto');
        }

        window.fecharArvore = function() {
            const modalArvore = document.getElementById('modal-arvore');
            modalArvore.classList.remove('aberto');
            modalArvore.style.display = "none";
        }

        const ARVORE_ZOOM_MIN = 0.45;
        const ARVORE_ZOOM_MAX = 1.5;
        const ARVORE_ZOOM_STEP = 0.12;
        const ARVORE_ESCOLHA_RIVAL_MSG = "Você fez sua escolha, agora viva com ela";
        const ARVORE_CAMINHOS = {
            punho: "Caminho do Punho",
            ki: "Caminho do Ki Interior",
            resiliencia: "Caminho da Resiliência"
        };
        const arvoreCamera = {
            x: 80, y: 0, zoom: 0.72,
            dragging: false, dragStartX: 0, dragStartY: 0,
            startX: 0, startY: 0, mapBounds: null
        };
        let numSlotArvoreAberta = null;
        let nodeArvoreSelecionado = null;

        function treeNode(id, nome, tipo, grimorioTipo, custo, x, y, prereq, caminho, desc, iconClass, extra = {}) {
            return { id, nome, tipo, grimorioTipo, custo, x, y, prereq: prereq || [], caminho: caminho || "", desc, iconClass, ...extra };
        }

        const SKILL_TREES = {
            Monge: {
                nodes: [
                    treeNode("mon_fund_01", "Respiração Marcial", "passiva", "passiva", 1, 0, 0, [], "", "Controla a respiração para manter foco e constância em combate.", "icon-breath"),
                    treeNode("mon_fund_02", "Postura do Monge", "melhoria", "melhoria", 1, 180, 0, ["mon_fund_01"], "", "Refina a base corporal e melhora a estabilidade durante técnicas.", "icon-stance"),
                    treeNode("mon_fund_03", "Disciplina do Corpo", "passiva", "passiva", 1, 360, 0, ["mon_fund_02"], "", "Transforma treino repetido em resistência, controle e presença.", "icon-discipline"),
                    treeNode("mon_fund_a", "Passo Leve", "passiva", "passiva", 1, 120, -180, [], "", "Movimenta-se com menos ruído e melhor recuperação de posição.", "icon-step"),
                    treeNode("mon_fund_b", "Reflexo Sereno", "passiva", "passiva", 1, 260, -180, ["mon_fund_a"], "", "Mantém calma sob pressão e reage com menos hesitação.", "icon-reflex"),
                    treeNode("mon_fund_c", "Mente Clara", "melhoria", "melhoria", 1, 120, 180, [], "", "Organiza pensamento e intenção antes da ação.", "icon-mind"),
                    treeNode("mon_fund_d", "Golpe Treinado", "ativa", "ativa", 1, 260, 180, ["mon_fund_c"], "", "Um ataque simples, limpo e confiável para abrir sequências.", "icon-strike"),
                    treeNode("mon_path_punho", "Caminho do Punho", "caminho", "", 1, 580, -260, ["mon_fund_b"], "punho", "Escolhe o Caminho do Punho. Os outros caminhos serão bloqueados.", "icon-path-punch"),
                    treeNode("mon_path_res", "Caminho da Resiliência", "caminho", "", 1, 580, 260, ["mon_fund_d"], "resiliencia", "Escolhe o Caminho da Resiliência. Os outros caminhos serão bloqueados.", "icon-path-res"),
                    treeNode("mon_path_ki", "Caminho do Ki Interior", "caminho", "", 1, 580, 0, ["mon_fund_03"], "ki", "Escolhe o Caminho do Ki Interior após dominar a Disciplina do Corpo.", "icon-path-ki"),
                    treeNode("mon_punho_01", "Punho Preciso", "passiva", "passiva", 2, 760, -260, ["mon_path_punho"], "punho", "Aprimora golpes diretos e reduz desperdício de movimento.", "icon-punch"),
                    treeNode("mon_punho_02", "Sequência Rápida", "ativa", "ativa", 2, 940, -260, ["mon_punho_01"], "punho", "Permite encadear ataques curtos em uma abertura.", "icon-combo"),
                    treeNode("mon_punho_03", "Pressão Constante", "melhoria", "melhoria", 2, 1120, -260, ["mon_punho_01"], "punho", "Mantém o inimigo reagindo e limita contra-ataques.", "icon-pressure"),
                    treeNode("mon_punho_04", "Quebra-Guarda", "ativa", "ativa", 2, 1300, -340, [], "punho", "Um golpe técnico para abrir defesas fechadas.", "icon-break", {
                        prereqAnyCount: { from: ["mon_punho_02", "mon_punho_03"], count: 1 }
                    }),
                    treeNode("mon_punho_05", "Combo Crescente", "melhoria", "melhoria", 2, 1300, -180, [], "punho", "Sequências bem-sucedidas aumentam o ritmo ofensivo.", "icon-rise", {
                        prereqAnyCount: { from: ["mon_punho_02", "mon_punho_03"], count: 1 }
                    }),
                    treeNode("mon_punho_06", "Impacto Interno", "passiva", "passiva", 3, 1500, -260, [], "punho", "Canaliza força através da guarda e atinge pontos vitais.", "icon-impact", {
                        prereqAnyCount: { from: ["mon_punho_04", "mon_punho_05"], count: 1 }
                    }),
                    treeNode("mon_punho_final", "Último Golpe do Punho", "final", "ativa", 3, 1720, -260, ["mon_punho_06"], "punho", "Finaliza uma sequência com um golpe concentrado e decisivo.", "icon-finish"),
                    treeNode("mon_ki_01", "Reserva Interior", "passiva", "passiva", 2, 760, 0, ["mon_path_ki"], "ki", "Aumenta a consciência sobre energia interna e seu uso.", "icon-reserve"),
                    treeNode("mon_ki_02", "Passo do Vento", "ativa", "ativa", 2, 940, -80, ["mon_ki_01"], "ki", "Usa ki para reposicionamento rápido e leve.", "icon-wind"),
                    treeNode("mon_ki_03", "Canalizar Ki", "melhoria", "melhoria", 2, 940, 80, ["mon_ki_01"], "ki", "Melhora o controle entre mana, fôlego e intenção.", "icon-channel"),
                    treeNode("mon_ki_04", "Palma Espiritual", "ativa", "ativa", 2, 1120, -80, [], "ki", "Projeta energia concentrada através da palma.", "icon-palm", {
                        prereqAnyCount: { from: ["mon_ki_02", "mon_ki_03"], count: 1 }
                    }),
                    treeNode("mon_ki_05", "Fluxo de Mana", "passiva", "passiva", 2, 1120, 80, [], "ki", "Reduz oscilação energética e favorece técnicas longas.", "icon-flow", {
                        prereqAnyCount: { from: ["mon_ki_02", "mon_ki_03"], count: 1 }
                    }),
                    treeNode("mon_ki_06", "Corpo Etéreo", "ativa", "ativa", 3, 1320, 0, [], "ki", "Por um instante, o corpo responde como se fosse mais leve que a dor.", "icon-ethereal", {
                        prereqAnyCount: { from: ["mon_ki_04", "mon_ki_05"], count: 1 }
                    }),
                    treeNode("mon_ki_final", "Técnica do Ki Interior", "final", "ativa", 3, 1540, 0, ["mon_ki_06"], "ki", "Libera uma técnica espiritual plena, exigindo foco absoluto.", "icon-spirit"),
                    treeNode("mon_res_01", "Corpo Inabalável", "passiva", "passiva", 2, 760, 260, ["mon_path_res"], "resiliencia", "Fortalece postura e tolerância contra impacto.", "icon-body"),
                    treeNode("mon_res_02", "Defesa Circular", "ativa", "ativa", 2, 940, 180, ["mon_res_01"], "resiliencia", "Redireciona pressão inimiga com movimentos circulares.", "icon-circle"),
                    treeNode("mon_res_03", "Pele de Pedra", "melhoria", "melhoria", 2, 940, 340, ["mon_res_01"], "resiliencia", "Treino físico endurece resposta contra dano direto.", "icon-stone"),
                    treeNode("mon_res_04", "Fôlego de Ferro", "passiva", "passiva", 2, 1120, 180, [], "resiliencia", "Mantém ação mesmo após cansaço ou dor intensa.", "icon-breath-iron", {
                        prereqAnyCount: { from: ["mon_res_02", "mon_res_03"], count: 1 }
                    }),
                    treeNode("mon_res_05", "Vontade Imóvel", "melhoria", "melhoria", 2, 1120, 340, [], "resiliencia", "Resiste melhor a medo, manipulação e colapso mental.", "icon-will", {
                        prereqAnyCount: { from: ["mon_res_02", "mon_res_03"], count: 1 }
                    }),
                    treeNode("mon_res_06", "Recusar a Queda", "ativa", "ativa", 3, 1320, 260, [], "resiliencia", "Força o corpo a permanecer de pé quando deveria cair.", "icon-stand", {
                        prereqAnyCount: { from: ["mon_res_04", "mon_res_05"], count: 1 }
                    }),
                    treeNode("mon_res_final", "Selo da Montanha Viva", "final", "passiva", 3, 1540, 260, ["mon_res_06"], "resiliencia", "A resistência do monge se torna uma presença quase imóvel.", "icon-mountain")
                ],
                connections: [
                    { from: "mon_fund_a", to: "mon_fund_b" },
                    { from: "mon_fund_b", to: "mon_path_punho", points: [{ x: 420, y: -180 }, { x: 420, y: -260 }] },
                    { from: "mon_fund_01", to: "mon_fund_02" },
                    { from: "mon_fund_02", to: "mon_fund_03", points: [{ x: 300, y: 0 }] },
                    { from: "mon_fund_03", to: "mon_path_ki" },
                    { from: "mon_fund_c", to: "mon_fund_d" },
                    { from: "mon_fund_d", to: "mon_path_res", points: [{ x: 420, y: 180 }, { x: 420, y: 260 }] },

                    { from: "mon_path_punho", to: "mon_punho_01" },
                    { from: "mon_punho_01", to: "mon_punho_02", points: [{ x: 850, y: -300 }] },
                    { from: "mon_punho_01", to: "mon_punho_03", points: [{ x: 850, y: -220 }, { x: 1030, y: -220 }] },
                    { from: "mon_punho_02", to: "mon_punho_04", points: [{ x: 1040, y: -340 }] },
                    { from: "mon_punho_03", to: "mon_punho_04", points: [{ x: 1210, y: -300 }, { x: 1210, y: -340 }] },
                    { from: "mon_punho_02", to: "mon_punho_05", points: [{ x: 1040, y: -180 }] },
                    { from: "mon_punho_03", to: "mon_punho_05", points: [{ x: 1210, y: -220 }, { x: 1210, y: -180 }] },
                    { from: "mon_punho_04", to: "mon_punho_06", points: [{ x: 1420, y: -340 }, { x: 1420, y: -260 }] },
                    { from: "mon_punho_05", to: "mon_punho_06", points: [{ x: 1420, y: -180 }, { x: 1420, y: -260 }] },
                    { from: "mon_punho_06", to: "mon_punho_final" },

                    { from: "mon_path_ki", to: "mon_ki_01" },
                    { from: "mon_ki_01", to: "mon_ki_02", points: [{ x: 850, y: -80 }] },
                    { from: "mon_ki_01", to: "mon_ki_03", points: [{ x: 850, y: 80 }] },
                    { from: "mon_ki_02", to: "mon_ki_04" },
                    { from: "mon_ki_03", to: "mon_ki_04", points: [{ x: 1030, y: 80 }, { x: 1030, y: -80 }] },
                    { from: "mon_ki_02", to: "mon_ki_05", points: [{ x: 1030, y: -80 }, { x: 1030, y: 80 }] },
                    { from: "mon_ki_03", to: "mon_ki_05" },
                    { from: "mon_ki_04", to: "mon_ki_06", points: [{ x: 1220, y: -80 }, { x: 1220, y: 0 }] },
                    { from: "mon_ki_05", to: "mon_ki_06", points: [{ x: 1220, y: 80 }, { x: 1220, y: 0 }] },
                    { from: "mon_ki_06", to: "mon_ki_final" },

                    { from: "mon_path_res", to: "mon_res_01" },
                    { from: "mon_res_01", to: "mon_res_02", points: [{ x: 850, y: 180 }] },
                    { from: "mon_res_01", to: "mon_res_03", points: [{ x: 850, y: 340 }] },
                    { from: "mon_res_02", to: "mon_res_04" },
                    { from: "mon_res_03", to: "mon_res_04", points: [{ x: 1030, y: 340 }, { x: 1030, y: 180 }] },
                    { from: "mon_res_02", to: "mon_res_05", points: [{ x: 1030, y: 180 }, { x: 1030, y: 340 }] },
                    { from: "mon_res_03", to: "mon_res_05" },
                    { from: "mon_res_04", to: "mon_res_06", points: [{ x: 1220, y: 180 }, { x: 1220, y: 260 }] },
                    { from: "mon_res_05", to: "mon_res_06", points: [{ x: 1220, y: 340 }, { x: 1220, y: 260 }] },
                    { from: "mon_res_06", to: "mon_res_final" }
                ]
            }
        };

        function getSkillTreeForClass(classe) {
            return SKILL_TREES[classe] || null;
        }

        function getTreeSkillById(classe, skillId) {
            const tree = getSkillTreeForClass(classe);
            return tree?.nodes?.find(n => n.id === skillId) || null;
        }

        function getArvoreDataFromFicha(dados = {}) {
            const arvore = dados.arvore || {};
            return {
                classe: arvore.classe || dados.classe || "",
                caminhoEscolhido: arvore.caminhoEscolhido || "",
                habilidadesDesbloqueadas: { ...(arvore.habilidadesDesbloqueadas || {}) }
            };
        }

        function getNomeCaminhoArvore(dados = {}) {
            const arvore = getArvoreDataFromFicha(dados);
            return ARVORE_CAMINHOS[arvore.caminhoEscolhido] || "Nenhum escolhido";
        }

        function isSkillUnlocked(dados, skillId) {
            return Boolean(getArvoreDataFromFicha(dados).habilidadesDesbloqueadas?.[skillId]);
        }

        function getPontosAprendizagem(dados = {}) {
            const classe = dados.classe || getArvoreDataFromFicha(dados).classe;
            const tree = getSkillTreeForClass(classe);
            const unlocked = getArvoreDataFromFicha(dados).habilidadesDesbloqueadas;
            const total = getLevelData(toNumber(dados.expTotal, 0)).level;
            const gastos = tree ? tree.nodes.reduce((sum, skill) => sum + (unlocked[skill.id] ? toNumber(skill.custo, 0) : 0), 0) : 0;
            return { total, gastos, disponiveis: total - gastos };
        }

        function checkPrereqs(dados, skill) {
            const faltando = (skill.prereq || []).filter(id => !isSkillUnlocked(dados, id));
            const anyRule = skill.prereqAnyCount;
            let anyOk = true;
            if(anyRule?.from?.length) {
                const anyCount = anyRule.from.filter(id => isSkillUnlocked(dados, id)).length;
                anyOk = anyCount >= toNumber(anyRule.count, 0);
            }
            return { ok: faltando.length === 0 && anyOk, faltando, anyOk };
        }

        function isBloqueadoPorCaminho(dados, skill) {
            const escolhido = getArvoreDataFromFicha(dados).caminhoEscolhido;
            return Boolean(escolhido && skill?.caminho && skill.caminho !== escolhido);
        }

        function canBuySkill(dados, skill, numSlot) {
            if(!skill) return { ok: false, motivo: "Habilidade inválida." };
            const slot = slotsDeVisao[Number(numSlot)];
            const arvore = getArvoreDataFromFicha(dados);
            if(usuarioAtual?.cargo === "Mestre") return { ok: false, motivo: "Mestre pode inspecionar, mas não comprar habilidades nesta etapa." };
            if(!slot?.idFicha || usuarioAtual?.idFicha !== slot.idFicha) return { ok: false, motivo: "Você só pode comprar habilidades da própria ficha." };
            if((dados.classe || arvore.classe) !== "Monge") return { ok: false, motivo: "Este protótipo só está disponível para Monge." };
            if(isSkillUnlocked(dados, skill.id)) return { ok: false, motivo: "Habilidade já desbloqueada." };
            if(isBloqueadoPorCaminho(dados, skill)) return { ok: false, motivo: ARVORE_ESCOLHA_RIVAL_MSG, rival: true };
            if(skill.tipo === "caminho" && arvore.caminhoEscolhido) return { ok: false, motivo: ARVORE_ESCOLHA_RIVAL_MSG, rival: true };
            if(skill.tipo !== "caminho" && skill.caminho && arvore.caminhoEscolhido !== skill.caminho) return { ok: false, motivo: "Escolha este caminho antes de comprar esta habilidade." };
            if(!checkPrereqs(dados, skill).ok) return { ok: false, motivo: "Pré-requisitos incompletos." };
            if(getPontosAprendizagem(dados).disponiveis < toNumber(skill.custo, 0)) return { ok: false, motivo: "Pontos de Aprendizagem insuficientes." };
            return { ok: true, motivo: "Disponível para compra." };
        }

        function criarEntradaGrimorioDaArvore(skill) {
            if(!skill.grimorioTipo) return null;
            return normalizeHabV1(skill.id, {
                nome: skill.nome,
                desc: skill.desc,
                tipo: skill.grimorioTipo,
                alvo: "self",
                targetMode: "self",
                ap: 0,
                mana: 0,
                icon: "SK",
                treeSkill: true,
                sourceClass: "Monge",
                isSystemObj: false,
                equipada: skill.grimorioTipo === "passiva" || skill.grimorioTipo === "melhoria"
            });
        }

        function gerarConexoesArvore(tree) {
            if(Array.isArray(tree.connections) && tree.connections.length) {
                return tree.connections;
            }
            const conexoes = [];
            tree.nodes.forEach(node => {
                (node.prereq || []).forEach(from => conexoes.push({ from, to: node.id, kind: "required" }));
                (node.prereqAnyCount?.from || []).forEach(from => conexoes.push({ from, to: node.id, kind: "any" }));
            });
            return conexoes;
        }

        function calcularLayoutArvore(tree) {
            const xs = tree.nodes.map(n => n.x);
            const ys = tree.nodes.map(n => n.y);
            const padding = 180;
            const minX = Math.min(...xs) - padding;
            const maxX = Math.max(...xs) + padding;
            const minY = Math.min(...ys) - padding;
            const maxY = Math.max(...ys) + padding;
            return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
        }

        function posNode(node, layout) {
            return { x: node.x - layout.minX, y: node.y - layout.minY };
        }

        function posWorldPoint(point, layout) {
            return { x: point.x - layout.minX, y: point.y - layout.minY };
        }

        function getNodeState(dados, skill, numSlot) {
            if(isSkillUnlocked(dados, skill.id)) return "desbloqueada";
            const check = canBuySkill(dados, skill, numSlot);
            if(check.rival) return "bloqueada-caminho";
            return check.ok ? "compravel" : "bloqueada";
        }

        function getSkillSymbol(skill) {
            if(skill.tipo === "passiva") return "P";
            if(skill.tipo === "ativa") return "A";
            if(skill.tipo === "melhoria") return "+";
            if(skill.tipo === "caminho") return "C";
            if(skill.tipo === "final") return "F";
            return "*";
        }

        function renderSkillConnections(tree, dados, layout) {
            const byId = Object.fromEntries(tree.nodes.map(n => [n.id, n]));
            return gerarConexoesArvore(tree).map(conn => {
                const from = byId[conn.from];
                const to = byId[conn.to];
                if(!from || !to) return "";
                const a = posNode(from, layout);
                const b = posNode(to, layout);
                const points = (conn.points || []).map(point => posWorldPoint(point, layout));
                const pathPoints = [a, ...points, b];
                const d = pathPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
                const active = isSkillUnlocked(dados, from.id) && isSkillUnlocked(dados, to.id);
                const rival = isBloqueadoPorCaminho(dados, to);
                const compravel = isSkillUnlocked(dados, from.id) && !isSkillUnlocked(dados, to.id) && canBuySkill(dados, to, numSlotArvoreAberta).ok;
                const cls = ["arvore-link", active ? "ativa" : "", compravel ? "compravel" : "", rival ? "bloqueada-caminho" : ""].filter(Boolean).join(" ");
                return `<path class="${cls}" d="${d}" fill="none"></path>`;
            }).join("");
        }

        function renderSkillNode(skill, dados, numSlot, layout) {
            const pos = posNode(skill, layout);
            const state = getNodeState(dados, skill, numSlot);
            const title = state === "bloqueada-caminho" ? ARVORE_ESCOLHA_RIVAL_MSG : skill.nome;
            return `
                <button class="skill-node node-${skill.tipo} ${state} ${escapeHtml(skill.iconClass)}"
                    style="left:${pos.x}px; top:${pos.y}px;"
                    data-skill-id="${escapeHtml(skill.id)}"
                    title="${escapeHtml(title)}"
                    onmouseenter="previewSkillTreeNode(${numSlot}, '${escapeHtml(skill.id)}')"
                    onclick="selectSkillTreeNode(${numSlot}, '${escapeHtml(skill.id)}')">
                    <span class="skill-icon">${escapeHtml(getSkillSymbol(skill))}</span>
                    <span class="skill-cost-badge">${escapeHtml(skill.custo)}</span>
                    <span class="skill-name">${escapeHtml(skill.nome)}</span>
                </button>
            `;
        }

        function getPrereqLabels(skill, tree) {
            const labels = (skill.prereq || []).map(id => tree.nodes.find(n => n.id === id)?.nome || id);
            if(skill.prereqAnyCount?.from?.length) {
                const nomes = skill.prereqAnyCount.from.map(id => tree.nodes.find(n => n.id === id)?.nome || id);
                labels.push(`${skill.prereqAnyCount.count} de: ${nomes.join(", ")}`);
            }
            return labels;
        }

        function renderSkillDetailPanel(numSlot, skillId) {
            const slot = slotsDeVisao[Number(numSlot)];
            const dados = slot?.dados || {};
            const tree = getSkillTreeForClass(dados.classe || "Monge");
            const panel = document.getElementById("arvore-detail-panel");
            if(!panel || !tree) return;
            const skill = tree.nodes.find(n => n.id === skillId) || tree.nodes[0];
            nodeArvoreSelecionado = skill.id;
            const state = getNodeState(dados, skill, numSlot);
            const check = canBuySkill(dados, skill, numSlot);
            const tipoLabel = { passiva: "Passiva", ativa: "Ativa", melhoria: "Melhoria", caminho: "Escolha de Caminho", final: "Habilidade Final" }[skill.tipo] || skill.tipo;
            const estadoLabel = state === "desbloqueada" ? "Desbloqueada" : (state === "compravel" ? "Comprável" : (state === "bloqueada-caminho" ? "Caminho bloqueado" : "Bloqueada"));
            const prereqs = getPrereqLabels(skill, tree);
            const buyHtml = check.ok ? `<button class="btn-comprar-skill" onclick="buySkill(${numSlot}, '${escapeHtml(skill.id)}')">Comprar</button>` : "";
            panel.innerHTML = `
                <div class="arvore-detail-kicker">${escapeHtml(tipoLabel)}</div>
                <h3>${escapeHtml(skill.nome)}</h3>
                <div class="arvore-detail-meta"><span>Custo: ${escapeHtml(skill.custo)} PA</span><span>Estado: ${escapeHtml(estadoLabel)}</span></div>
                <p>${escapeHtml(skill.desc)}</p>
                <div class="arvore-detail-block"><strong>Pré-requisitos</strong><span>${prereqs.length ? escapeHtml(prereqs.join(" | ")) : "Nenhum"}</span></div>
                <div class="arvore-detail-block"><strong>Resultado</strong><span>${escapeHtml(check.motivo)}</span></div>
                ${state === "bloqueada-caminho" ? `<div class="arvore-rival-msg">${ARVORE_ESCOLHA_RIVAL_MSG}</div>` : ""}
                ${buyHtml}
            `;
            document.querySelectorAll(".arvore-monge-shell .skill-node.selecionada").forEach(el => el.classList.remove("selecionada"));
            document.querySelector(`.arvore-monge-shell .skill-node[data-skill-id="${skill.id}"]`)?.classList.add("selecionada");
        }

        function setArvoreCamera(x, y, zoom) {
            arvoreCamera.x = toNumber(x, arvoreCamera.x);
            arvoreCamera.y = toNumber(y, arvoreCamera.y);
            arvoreCamera.zoom = clamp(zoom, ARVORE_ZOOM_MIN, ARVORE_ZOOM_MAX);
            const map = document.getElementById("arvore-map");
            if(map) map.style.transform = `translate(${arvoreCamera.x}px, ${arvoreCamera.y}px) scale(${arvoreCamera.zoom})`;
            const zoomEl = document.getElementById("arvore-zoom-resumo");
            if(zoomEl) zoomEl.textContent = `${Math.round(arvoreCamera.zoom * 100)}%`;
        }

        function resetArvoreCamera() {
            const viewport = document.getElementById("arvore-viewport");
            const layout = arvoreCamera.mapBounds;
            const startX = viewport && layout ? Math.max(40, viewport.clientWidth * 0.12) : 80;
            const startY = viewport && layout ? (viewport.clientHeight - layout.height * 0.72) / 2 : 0;
            setArvoreCamera(startX, startY, 0.72);
        }

        window.resetArvoreCamera = resetArvoreCamera;
        window.zoomArvore = function(delta) {
            setArvoreCamera(arvoreCamera.x, arvoreCamera.y, arvoreCamera.zoom + delta);
        };

        function bindArvorePanZoom() {
            const viewport = document.getElementById("arvore-viewport");
            if(!viewport) return;
            viewport.onwheel = (e) => {
                e.preventDefault();
                if(e.ctrlKey) {
                    setArvoreCamera(arvoreCamera.x, arvoreCamera.y, arvoreCamera.zoom + (e.deltaY > 0 ? -ARVORE_ZOOM_STEP : ARVORE_ZOOM_STEP));
                } else {
                    setArvoreCamera(arvoreCamera.x - e.deltaY, arvoreCamera.y, arvoreCamera.zoom);
                }
            };
            viewport.onpointerdown = (e) => {
                if(e.button !== 0) return;
                arvoreCamera.dragging = true;
                arvoreCamera.dragStartX = e.clientX;
                arvoreCamera.dragStartY = e.clientY;
                arvoreCamera.startX = arvoreCamera.x;
                arvoreCamera.startY = arvoreCamera.y;
                viewport.setPointerCapture(e.pointerId);
                viewport.classList.add("arrastando");
            };
            viewport.onpointermove = (e) => {
                if(!arvoreCamera.dragging) return;
                setArvoreCamera(arvoreCamera.startX + (e.clientX - arvoreCamera.dragStartX), arvoreCamera.startY + (e.clientY - arvoreCamera.dragStartY), arvoreCamera.zoom);
            };
            viewport.onpointerup = (e) => {
                arvoreCamera.dragging = false;
                viewport.classList.remove("arrastando");
                try { viewport.releasePointerCapture(e.pointerId); } catch (_) {}
            };
            viewport.onpointercancel = () => {
                arvoreCamera.dragging = false;
                viewport.classList.remove("arrastando");
            };
        }

        function renderSkillTree(numSlot, dados) {
            const tree = getSkillTreeForClass(dados.classe);
            const layout = calcularLayoutArvore(tree);
            arvoreCamera.mapBounds = layout;
            const pontos = getPontosAprendizagem(dados);
            return `
                <div class="arvore-monge-shell">
                    <div class="arvore-toolbar">
                        <div><span class="arvore-toolbar-label">Pontos de Aprendizagem</span><strong id="arvore-pa-resumo">${pontos.disponiveis} disponíveis / ${pontos.total} totais</strong></div>
                        <div><span class="arvore-toolbar-label">Caminho</span><strong id="arvore-caminho-resumo">${escapeHtml(getNomeCaminhoArvore(dados))}</strong></div>
                        <div class="arvore-zoom-controls">
                            <button onclick="zoomArvore(${ARVORE_ZOOM_STEP})">+</button>
                            <button onclick="zoomArvore(${-ARVORE_ZOOM_STEP})">-</button>
                            <button onclick="resetArvoreCamera()">Resetar visão</button>
                            <span id="arvore-zoom-resumo">${Math.round(arvoreCamera.zoom * 100)}%</span>
                        </div>
                    </div>
                    <div class="arvore-legenda" aria-label="Legenda da árvore">
                        <span class="legenda-item" data-tooltip="Habilidade sempre ativa ou efeito permanente. Normalmente fortalece o personagem sem precisar gastar ação."><i class="legenda-forma legenda-passiva"></i> círculo = Passiva</span>
                        <span class="legenda-item" data-tooltip="Habilidade usada conscientemente durante a cena ou combate. Pode representar golpe, técnica ou manobra."><i class="legenda-forma legenda-ativa"></i> losango = Ativa</span>
                        <span class="legenda-item" data-tooltip="Aprimoramento de uma técnica ou atributo de combate. Geralmente modifica algo que o personagem já sabe fazer."><i class="legenda-forma legenda-melhoria"></i> quadrado = Melhoria</span>
                        <span class="legenda-item" data-tooltip="Escolha principal da árvore. Ao escolher um Caminho, os outros Caminhos ficam bloqueados."><i class="legenda-forma legenda-caminho"></i> hexágono = Caminho</span>
                        <span class="legenda-item" data-tooltip="Habilidade mais poderosa de um Caminho. Representa a técnica máxima daquela especialização."><i class="legenda-forma legenda-final"></i> selo maior = Final</span>
                    </div>
                    <div class="arvore-main-layout">
                        <div class="arvore-viewport" id="arvore-viewport">
                            <div class="arvore-map" id="arvore-map" style="width:${layout.width}px;height:${layout.height}px;">
                                <svg class="arvore-connections" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" aria-hidden="true">${renderSkillConnections(tree, dados, layout)}</svg>
                                ${tree.nodes.map(skill => renderSkillNode(skill, dados, numSlot, layout)).join("")}
                            </div>
                        </div>
                        <aside class="arvore-detail-panel" id="arvore-detail-panel"></aside>
                    </div>
                </div>
            `;
        }

        window.previewSkillTreeNode = function(numSlot, skillId) {
            const dados = slotsDeVisao[Number(numSlot)]?.dados || {};
            const skill = getTreeSkillById(dados.classe || "Monge", skillId);
            if(skill && isBloqueadoPorCaminho(dados, skill)) renderSkillDetailPanel(numSlot, skillId);
        };

        window.selectSkillTreeNode = function(numSlot, skillId) {
            renderSkillDetailPanel(numSlot, skillId);
        };

        function renderizarCaminhoNaFicha(numSlot, dados = {}) {
            const el = document.getElementById(`slot${numSlot}-caminho-arvore`);
            if(el) el.textContent = `Caminho: ${getNomeCaminhoArvore(dados)}`;
        }

        function renderizarArvoreAberta(numSlot, dados, selectedSkillId) {
            const view = document.querySelector("#arvore-views-container .arvore-view.ativa");
            if(!view || !getSkillTreeForClass(dados.classe)) return;
            view.innerHTML = renderSkillTree(numSlot, dados);
            bindArvorePanZoom();
            setArvoreCamera(arvoreCamera.x, arvoreCamera.y, arvoreCamera.zoom);
            renderSkillDetailPanel(numSlot, selectedSkillId || nodeArvoreSelecionado || "mon_fund_01");
        }

        window.buySkill = async function(numSlot, skillId) {
            numSlot = Number(numSlot);
            const slot = slotsDeVisao[numSlot];
            const idFicha = slot?.idFicha;
            if(!idFicha) return alert("Ficha não encontrada.");
            if(usuarioAtual?.cargo === "Mestre") return alert("Mestre pode inspecionar, mas não comprar habilidades nesta etapa.");
            if(usuarioAtual?.idFicha !== idFicha) return alert("Você só pode comprar habilidades da própria ficha.");
            const skill = getTreeSkillById(slot.dados?.classe || "Monge", skillId);
            const precheck = canBuySkill(slot.dados || {}, skill, numSlot);
            if(!precheck.ok) return alert(precheck.motivo);

            const resultado = await safeTransaction(`fichas/${idFicha}`, (dadosAtuais) => {
                if(!dadosAtuais) return;
                const skillAtual = getTreeSkillById(dadosAtuais.classe || "Monge", skillId);
                const check = canBuySkill(dadosAtuais, skillAtual, numSlot);
                if(!check.ok) return;
                const arvore = getArvoreDataFromFicha(dadosAtuais);
                const novaArvore = {
                    classe: "Monge",
                    caminhoEscolhido: skillAtual.tipo === "caminho" ? skillAtual.caminho : arvore.caminhoEscolhido,
                    habilidadesDesbloqueadas: { ...arvore.habilidadesDesbloqueadas, [skillId]: true }
                };
                const grimorio = { ...(dadosAtuais.grimorio || {}) };
                const entrada = criarEntradaGrimorioDaArvore(skillAtual);
                if(entrada && !grimorio[skillAtual.id]) grimorio[skillAtual.id] = entrada;
                return { ...dadosAtuais, arvore: novaArvore, grimorio };
            });
            if(!resultado.committed) return alert("Não foi possível comprar esta habilidade. Confira pontos e pré-requisitos.");
            const dadosNovos = resultado.snapshot.val() || {};
            slotsDeVisao[numSlot].dados = dadosNovos;
            renderizarArvoreAberta(numSlot, dadosNovos, skillId);
            renderizarCaminhoNaFicha(numSlot, dadosNovos);
        };

        window.abrirArvoreHabilidades = function(numSlot) {
            numSlot = Number(numSlot);
            const selectClasse = document.getElementById(`slot${numSlot}-classe`);
            const dados = slotsDeVisao[numSlot]?.dados || {};
            const classeEscolhida = selectClasse ? selectClasse.value : (dados.classe || "");
            if (!classeEscolhida) {
                alert("Escolha uma Classe primeiro na ficha para liberar sua árvore de melhorias!");
                return;
            }
            numSlotArvoreAberta = numSlot;
            nodeArvoreSelecionado = null;
            const tabsContainer = document.getElementById("arvore-tabs-container");
            const viewsContainer = document.getElementById("arvore-views-container");
            tabsContainer.innerHTML = "";
            viewsContainer.innerHTML = "";
            classesRpg.forEach(classe => {
                const isEscolhida = (classe === classeEscolhida);
                const tab = document.createElement("button");
                tab.className = `tab-classe ${isEscolhida ? "ativa" : "bloqueada"}`;
                tab.innerText = classe;
                tabsContainer.appendChild(tab);
                const view = document.createElement("div");
                view.className = `arvore-view ${isEscolhida ? "ativa" : ""}`;
                if(isEscolhida) {
                    const dadosView = { ...dados, classe: classeEscolhida };
                    view.innerHTML = getSkillTreeForClass(classeEscolhida)
                        ? renderSkillTree(numSlot, dadosView)
                        : `<div class="arvore-empty-state"><h3>${escapeHtml(classeEscolhida)}</h3><p>Protótipo real disponível primeiro para Monge.</p></div>`;
                }
                viewsContainer.appendChild(view);
            });
            const modalArvore = document.getElementById("modal-arvore");
            modalArvore.style.display = "flex";
            void modalArvore.offsetWidth;
            modalArvore.classList.add("aberto");
            if(getSkillTreeForClass(classeEscolhida)) {
                bindArvorePanZoom();
                resetArvoreCamera();
                renderSkillDetailPanel(numSlot, "mon_fund_01");
            }
        };

        window.fecharArvore = function() {
            const modalArvore = document.getElementById("modal-arvore");
            modalArvore.classList.remove("aberto");
            modalArvore.style.display = "none";
            numSlotArvoreAberta = null;
            nodeArvoreSelecionado = null;
        };

        window.aplicarExpLote = async function() {
            if(usuarioAtual.cargo !== "Mestre") return;
            const amount = Number(document.getElementById('exp-amount-input').value);
            if(!amount) return alert("Insira um valor numérico!");

            const selecionados = Array.from(document.querySelectorAll('.exp-target:checked')).map(cb => cb.value);
            if(selecionados.length === 0) return alert("Selecione pelo menos um jogador!");

            for(let p of selecionados) {
                await safeTransaction(`fichas/${p}/expTotal`, (expAtualDB) => {
                    let novaExp = toNumber(expAtualDB, 0) + amount;
                    if(novaExp < 0) novaExp = 0;
                    return novaExp;
                });
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

                safeGet('fotos/' + idFicha).then(snap => {
                    const imgEl = tipo === 'heroi' ? document.getElementById(`img-foto-slot${numSlot}`) : document.getElementById(`img-foto-monstro-slot${numSlot}`);
                    if(snap.exists() && imgEl) imgEl.src = snap.val().base64;
                });
            }

            const path = tipo === 'horda' ? `hordas/${idFicha}` : `fichas/${idFicha}`;
            const refFicha = dbRef(path);

            if(tipo === 'heroi') {
                get(refFicha).then(snap => {
                    if(!snap.exists()) safeUpdate(path, { 'hp-max': 20, 'mana-max': 20, nome: idFicha });
                    else {
                        let d = snap.val();
                        if(d['hp-max'] === undefined) safeUpdate(path, { 'hp-max': 20 });
                        if(d['mana-max'] === undefined) safeUpdate(path, { 'mana-max': 20 });
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
                        });
                    } else {
                        for(let mId in dados.membros) {
                            let mData = dados.membros[mId];

                            for(let campo in mData) {
                                let el = document.getElementById(`horda-${mId}-${campo}`);
                                if(el && document.activeElement !== el && el.value != mData[campo]) {
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
                    if(visaoTaticaMestreAtiva) renderizarVisaoTaticaMestre();
                    return;
                }

                for(let chave in dados) {
                    if(chave === 'efeitos' || chave === 'grimorio') continue;
                    let idHTML = formatarIdElemento(numSlot, tipo, chave);
                    let el = document.getElementById(idHTML);
                    if(el && document.activeElement !== el && el.value != dados[chave]) el.value = dados[chave];
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
                    renderizarCaminhoNaFicha(numSlot, dados);
                    if(numSlotArvoreAberta === numSlot && getSkillTreeForClass(dados.classe)) {
                        renderizarArvoreAberta(numSlot, dados, nodeArvoreSelecionado || "mon_fund_01");
                    }

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

                    let baseBonus = { for:0, des:0, con:0, int:0, sab:0, car:0, per:0 };
                    let raca = dados.raca || '';
                    let vocacao = dados.classe || '';

                    if(typeof RACES !== 'undefined' && RACES[raca]) {
                        if(RACES[raca].points) maxAtributos += RACES[raca].points;
                        else {
                            for(let a in baseBonus) if(RACES[raca][a]) baseBonus[a] += RACES[raca][a];
                        }
                    }
                    if(typeof CLASSES !== 'undefined' && CLASSES[vocacao]) {
                        for(let a in baseBonus) if(CLASSES[vocacao][a]) baseBonus[a] += CLASSES[vocacao][a];
                    }

                    let ptsDistribuidos = 0;
                    ['for', 'des', 'con', 'int', 'sab', 'car', 'per'].forEach(a => {
                        let val = Number(dados[a]) || 0;
                        let minVal = baseBonus[a];

                        // Restringir a caixa de texto
                        let inputEl = document.getElementById(`slot${numSlot}-${a}`);
                        if(inputEl) {
                            inputEl.min = minVal;
                            // Se o valor estiver menor que o mínimo nativo, forçamos o valor mínimo visualmente
                            // O banco de dados pode ter ficado atrasado se ele apenas mudou a raça.
                            if(val < minVal) {
                                inputEl.value = minVal;
                                val = minVal;
                                safeUpdate(path, { [a]: minVal });
                            }
                        }

                        ptsDistribuidos += Math.max(0, val - minVal);
                    });

                    let ptsLivres = maxAtributos - ptsDistribuidos;

                    let spanPts = document.getElementById(`slot${numSlot}-pts-livres`);
                    if(spanPts) {
                        spanPts.innerText = `( ${ptsLivres} / ${maxAtributos} )`;
                        spanPts.style.color = ptsLivres > 0 ? '#27ae60' : (ptsLivres === 0 ? '#b89c72' : '#d95757');
                    }

                    // Lógica do Gnomo para Inventário
                    let slot5El = document.getElementById(`slot${numSlot}-item5-nome`);
                    if(slot5El) {
                        let slotDiv = slot5El.closest('.equipamento-slot');
                        if(slotDiv) {
                            slotDiv.style.display = (raca === 'Gnomo') ? 'none' : '';
                        }
                    }

                    // LEGADO: a UI atual de inventario nao possui slotX-btn-equip nem item-attr/mod.
                    // O inventario atual continua ativo; este bloco antigo fica isolado para nao acessar elementos inexistentes.
                }

                renderizarEfeitosNoSlot(numSlot, tipo, dados.efeitos || []);
                if(tipo === 'heroi') renderizarGrimorioNoSlot(numSlot, dados.grimorio || {});
                if(tipo === 'heroi') sincronizarHabilidadesSistemaSeNecessario(idFicha, dados);
                atualizarBarrasEAlertaNoSlot(numSlot, tipo);
                atualizarTooltipsAtributosNoSlot(numSlot, tipo, dados);
                if(visaoTaticaMestreAtiva) renderizarVisaoTaticaMestre();
            });

            slotsDeVisao[numSlot].ouvinte = novoOuvinte;

            // Delegação de eventos foi extraída para o document.addEventListener global (performance ganha)
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
                    const MAX_SIZE = 400;
                    let width = img.width; let height = img.height;
                    if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
                    else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrlUltraLeve = canvas.toDataURL('image/webp', 0.85);
                    const idFicha = slotsDeVisao[numSlot]?.idFicha;
                    const tipo = slotsDeVisao[numSlot]?.tipo || 'heroi';
                    const imgEl = tipo === 'heroi' ? document.getElementById(`img-foto-slot${numSlot}`) : document.getElementById(`img-foto-monstro-slot${numSlot}`);
                    if (imgEl) imgEl.src = dataUrlUltraLeve;

                    if(idFicha) safeUpdate('fotos/' + idFicha, { base64: dataUrlUltraLeve });
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

            const idUnico = Date.now();
            await safeTransaction('fichas/' + idFicha, (dadosAtuais) => {
                const dados = dadosAtuais || {};
                const efeitos = Array.isArray(dados.efeitos) ? [...dados.efeitos] : [];
                const proximo = { ...dados };

                if (attrDestino && modAttr !== 0) {
                    proximo[attrDestino] = toNumber(dados[attrDestino], 0) + modAttr;
                }

                efeitos.push({ idUnico, nome, modHp, modMana, attrDestino, modAttr, turnos });
                proximo.efeitos = efeitos;
                return proximo;
            });

            document.getElementById(`${p}nome${pos}`).value = '';
            document.getElementById(`${p}turnos${pos}`).value = '';
        }

        window.removerEfeito = async function(numSlot, idEfeito) {
            const idFicha = slotsDeVisao[numSlot].idFicha;
            if(!idFicha) return;
            await safeTransaction('fichas/' + idFicha, (dadosAtuais) => {
                const dados = dadosAtuais || {};
                const efeitos = Array.isArray(dados.efeitos) ? dados.efeitos : [];
                const efeitoRemovido = efeitos.find(e => e.idUnico === idEfeito);
                const proximo = { ...dados, efeitos: efeitos.filter(e => e.idUnico !== idEfeito) };

                if (efeitoRemovido && efeitoRemovido.attrDestino && efeitoRemovido.modAttr !== 0) {
                    proximo[efeitoRemovido.attrDestino] = toNumber(dados[efeitoRemovido.attrDestino], 0) - toNumber(efeitoRemovido.modAttr, 0);
                }

                return proximo;
            });
        }

        window.avancarTurnoGlobal = async function() {
            if (usuarioAtual.cargo !== "Mestre") return;

            const refFichas = dbRef('fichas');
            const snapFichas = await get(refFichas);
            let fichas = snapFichas.val() || {};

            for (let idFicha in fichas) {
                await safeTransaction(`fichas/${idFicha}`, (dadosAtuais) => {
                    const dados = dadosAtuais || {};
                    const efeitos = Array.isArray(dados.efeitos) ? dados.efeitos : [];
                    if (efeitos.length === 0) return dadosAtuais;

                    let hpAtual = toNumber(dados['hp-atual'], 0);
                    let manaAtual = toNumber(dados['mana-atual'], 0);
                    const isHero = Object.values(usuarios).some(u => u.idFicha === idFicha);
                    let hpMax = toNumber(dados['hp-max'], 20);
                    let manaMax = toNumber(dados['mana-max'], 20);

                    if (isHero) {
                        hpMax += toNumber(dados['con'], 0) * 3;
                        manaMax += toNumber(dados['int'], 0) * 2;
                    }

                    const attrParaReverter = {};
                    const efeitosAtualizados = efeitos.map((efeito) => {
                        const proximoEfeito = { ...efeito, turnos: toNumber(efeito.turnos, 0) - 1 };
                        hpAtual += toNumber(efeito.modHp, 0);
                        manaAtual += toNumber(efeito.modMana, 0);

                        if (proximoEfeito.turnos <= 0 && proximoEfeito.attrDestino && toNumber(proximoEfeito.modAttr, 0) !== 0) {
                            if(!attrParaReverter[proximoEfeito.attrDestino]) attrParaReverter[proximoEfeito.attrDestino] = 0;
                            attrParaReverter[proximoEfeito.attrDestino] += toNumber(proximoEfeito.modAttr, 0);
                        }
                        return proximoEfeito;
                    }).filter(e => e.turnos > 0);

                    const proximo = {
                        ...dados,
                        efeitos: efeitosAtualizados,
                        'hp-atual': clamp(hpAtual, 0, hpMax),
                        'mana-atual': clamp(manaAtual, 0, manaMax)
                    };

                    for (let attr in attrParaReverter) {
                        proximo[attr] = toNumber(dados[attr], 0) - attrParaReverter[attr];
                    }

                    return proximo;
                });
            }

            const snapHordas = await safeGet('hordas');
            let hordas = snapHordas.val() || {};
            for (let idHorda in hordas) {
                await safeTransaction(`hordas/${idHorda}`, (dadosAtuais) => {
                    const dados = dadosAtuais || {};
                    const efeitos = Array.isArray(dados.efeitos) ? dados.efeitos : [];
                    if (efeitos.length === 0) return dadosAtuais;

                    return {
                        ...dados,
                        efeitos: efeitos
                            .map(e => ({ ...e, turnos: toNumber(e.turnos, 0) - 1 }))
                            .filter(e => e.turnos > 0)
                    };
                });
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
                const nomeEfeitoHtml = escapeHtml(efeito.nome || '');
                const detalhesHtml = escapeHtml(detalhes.join(' | '));

                listaDiv.innerHTML += `
                    <div class="buff-item ${isDebuff ? 'debuff-item' : ''}">
                        <div>
                            <strong style="color: ${isDebuff ? '#d95757' : '#27ae60'}">${nomeEfeitoHtml}</strong>
                            <span style="font-size: 10px; margin-left: 10px; color: #9c8464;">(${detalhesHtml})</span>
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

            let baseBonus = {for:0, des:0, con:0, int:0, sab:0, car:0, per:0};
            if(tipo === 'heroi') {
                let raca = dados.raca || '';
                let vocacao = dados.classe || '';
                if(typeof RACES !== 'undefined' && RACES[raca] && !RACES[raca].points) {
                    for(let a in baseBonus) if(RACES[raca][a]) baseBonus[a] += RACES[raca][a];
                }
                if(typeof CLASSES !== 'undefined' && CLASSES[vocacao]) {
                    for(let a in baseBonus) if(CLASSES[vocacao][a]) baseBonus[a] += CLASSES[vocacao][a];
                }
            }

            let modsItens = {for:0, des:0, con:0, int:0, sab:0, car:0, per:0};
            if(tipo === 'heroi') {
                // LEGADO: suporte somente a dados antigos de item-attr/mod; a UI atual nao cria esses campos.
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
                let mNat = baseBonus[attr] || 0;
                let baseTotal = total - mItem - mBuff;
                let ptsDistribuidos = baseTotal - mNat;

                let inputEl = document.getElementById(`${prefixo}-${attr}`);
                if(inputEl && inputEl.parentElement) {
                    let txt = `Distrib.: ${ptsDistribuidos > 0 ? '+'+ptsDistribuidos : ptsDistribuidos}\nNativo (Raça/Classe): ${mNat > 0 ? '+'+mNat : mNat}\nItens: ${mItem > 0 ? '+'+mItem : mItem}\nEfeitos: ${mBuff > 0 ? '+'+mBuff : mBuff}`;
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
            const ator = getNomeAtorDoSlot(numSlot);

            for(let alvo of alvos) {
                const pathAlvo = 'fichas/' + alvo;
                const meta = await aplicarEfeitoVidaPath(pathAlvo, dano, 'dano');
                registrarFeedbackELog(pathAlvo, meta, { ator });
            }

            inputDano.value = '';
            checkboxes.forEach(cb => cb.checked = false);
            destacarAlvosSelecionados();
        };

        window.lancarAmeacaFicha = async function(numSlot) {
            const idAlvo = slotsDeVisao[numSlot].idFicha;
            if(idAlvo) {
                const tipo = slotsDeVisao[numSlot].tipo === 'horda' || idAlvo.startsWith('horda_') ? 'horda' : 'monstro';
                await ativarCombateComIniciativa(idAlvo, tipo);
                adicionarCombatLog(`${slotsDeVisao[numSlot].dados?.nome || idAlvo} entrou em combate.`, 'info');
                if(visaoTaticaMestreAtiva) renderizarVisaoTaticaMestre();
            }
        }

        window.abaterAmeacaFicha = async function(numSlot) {
            const idAlvo = slotsDeVisao[numSlot].idFicha;
            const nomeAlvo = slotsDeVisao[numSlot]?.dados?.nome || getNomeAlvoPorPath(`fichas/${idAlvo || ameacaEmCombateGlobal || ''}`);
            await publicarUltimoEvento({
                id: gerarIdEventoCombate(),
                tipo: 'fim',
                atorNome: usuarioAtual?.nome || '',
                alvoNome: nomeAlvo || '',
                alvoTipo: slotsDeVisao[numSlot]?.tipo || '',
                alvoId: idAlvo || ameacaEmCombateGlobal || '',
                membroId: '',
                danoHp: 0,
                curaHp: 0,
                escudoGanho: 0,
                escudoAbsorvido: 0,
                texto: 'Combate finalizado'
            });
            await encerrarCombateComIniciativa();
            limparCombatLog();
            limparVisuaisCombateTemporarios();
            mostrarCombatToast("Combate finalizado.");
            if(visaoTaticaMestreAtiva) renderizarVisaoTaticaMestre();
        }

        window.deletarAmeacaFicha = function(numSlot) {
            const idAlvo = slotsDeVisao[numSlot].idFicha;
            if(!idAlvo) return;

            if(confirm("Tem certeza que deseja DELETAR esta ameaça para sempre?")) {
                if(ameacaEmCombateGlobal === idAlvo) encerrarCombateComIniciativa();

                if(idAlvo.startsWith('horda_')) {
                    safeRemove('hordas/' + idAlvo);
                } else {
                    safeRemove('fotos/' + idAlvo);
                    safeRemove('lista_monstros/' + idAlvo);
                    safeRemove('fichas/' + idAlvo);
                }

                if(slotsDeVisao[1].idFicha === idAlvo) limparSlot(1);
                if(slotsDeVisao[2].idFicha === idAlvo) limparSlot(2);
            }
        }

        const deletarAmeacaLegado = function() {
            const seletor = document.getElementById('seletor-ameaca');
            if(!seletor) return;
            const idAlvo = seletor.value;
            if(!idAlvo) return;

            if(confirm("Tem certeza que deseja DELETAR esta ameaça para sempre?")) {
                if(ameacaEmCombateGlobal === idAlvo) encerrarCombateComIniciativa();

                if(idAlvo.startsWith('horda_')) {
                    safeRemove('hordas/' + idAlvo);
                } else {
                    safeRemove('fotos/' + idAlvo);
                    safeRemove('lista_monstros/' + idAlvo);
                    safeRemove('fichas/' + idAlvo);
                }

                seletor.value = "";
                if(slotsDeVisao[1].idFicha === idAlvo) limparSlot(1);
                if(slotsDeVisao[2].idFicha === idAlvo) limparSlot(2);
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

            onValue(dbRef('fichas'), (snapshot) => {
                if(!usuarioAtual || usuarioAtual.cargo !== "Mestre") return;
                const dados = snapshot.val() || {};
                fichasNoBanco = dados;
                playersList.forEach(p => preencherHUDJogadorVisualmente(p, dados[p] || {}));
                if(visaoTaticaMestreAtiva) renderizarVisaoTaticaMestre();
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

        window.atualizarHudMestre = async function(jogadorId, campo, valor) {
            if(!usuarioAtual || usuarioAtual.cargo !== "Mestre") return;
            if(!playersList.includes(jogadorId)) return;
            if(!['hp-atual', 'mana-atual'].includes(campo)) return;

            const input = document.getElementById(`hud-${jogadorId}-${campo}`);
            const maxEl = document.getElementById(campo === 'hp-atual' ? `hud-${jogadorId}-hp-max` : `hud-${jogadorId}-mana-max`);
            const maxVal = maxEl ? toNumber(maxEl.innerText, 20) : 20;
            const valorSeguro = clamp(valor, 0, maxVal);
            if(input) input.value = valorSeguro;

            try {
                await safeTransaction(`fichas/${jogadorId}/${campo}`, () => valorSeguro);
            } catch (err) {
                console.error('Falha ao salvar HUD', err);
                alert("Não foi possível salvar a alteração do HUD. Tente novamente.");
            }
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

        let numSlotGrimorioAberto = null;

        window.abrirGrimorio = function(numSlot) { console.log('ABRINDO GRIMORIO', slotsDeVisao[numSlot].dados.grimorio);
            numSlotGrimorioAberto = numSlot;
            const modal = document.getElementById('modal-grimorio');
            modal.style.display = 'flex';
            // Força reflow para animação funcionar corretamente
            void modal.offsetWidth;
            modal.classList.add('aberto');
            let dados = slotsDeVisao[numSlot].dados || {};
            renderizarGrimorioModal(numSlot, dados.grimorio || {});
        }

        window.fecharGrimorio = function() {
            const modal = document.getElementById('modal-grimorio');
            modal.classList.remove('aberto');
            modal.style.display = 'none';
            numSlotGrimorioAberto = null;
        }

        window.atualizarTextoBotaoAcaoJogador = function(numSlot) {
            const btn = document.getElementById(`btn-acao-combate-slot${numSlot}`);
            if(!btn) return;
            const radioSelecionado = document.querySelector(`input[name="feitico-selecionado-slot${numSlot}"]:checked`);
            if(!radioSelecionado || radioSelecionado.value === 'fisico') {
                btn.textContent = 'ATACAR';
                return;
            }

            const grimorio = slotsDeVisao[numSlot]?.dados?.grimorio || {};
            const hab = enrichHab(radioSelecionado.value, grimorio[radioSelecionado.value] || {});
            const effectKind = inferirTipoEfeito(radioSelecionado.value, hab);
            if(effectKind === 'cura') btn.textContent = 'CURAR';
            else if(effectKind === 'escudo') btn.textContent = 'CONJURAR ESCUDO';
            else btn.textContent = 'LANÇAR FEITIÇO';
        }

        window.renderizarGrimorioNoSlot = function(numSlot, grimorio) {
            // 1. Atualiza a Sidebar de Combate (Habilidades Equipadas)
            const containerFeiticos = document.getElementById(`lista-feiticos-combate-slot${numSlot}`);
            const containerPassivas = document.getElementById(`lista-passivas-combate-slot${numSlot}`);

            if(containerFeiticos && containerPassivas) {
                let htmlFeiticos = `<label class="magia-radio-item"><input type="radio" name="feitico-selecionado-slot${numSlot}" value="fisico" checked onchange="atualizarTextoBotaoAcaoJogador(${numSlot})"><span class="magia-icon-mini">⚔️</span> <span>Ataque Básico</span></label>`;
                let htmlPassivas = '';

                for(let habId in grimorio) {
                    let hab = enrichHab(habId, grimorio[habId]);
                    if(!hab.equipada) continue;

                    let icon = escapeHtml(hab.icon || '✨');
                    let nomeHabHtml = escapeHtml(hab.nome || habId);
                    let formulaHabHtml = escapeHtml(hab.formula || '');

                    if(hab.tipo === 'passiva' || hab.tipo === 'melhoria') {
                        let iconUrl = `Icones/${habId}.png`;
                        let descHabHtml = escapeHtml(hab.desc || '');
                        let tooltipHabHtml = escapeHtml(`${hab.nome || habId}${hab.desc ? ': ' + hab.desc : ''}`);
                        htmlPassivas += `
                            <div class="passiva-mini" data-tooltip="${tooltipHabHtml}">
                                <div class="passiva-mini-icon">
                                    <div style="width:100%;height:100%;background-image:url('${iconUrl}');background-size:cover;background-position:center;border-radius:50%;position:absolute;top:0;left:0;z-index:2;"></div>
                                    <div class="skill-icon-glow" style="z-index:1;">${icon}</div>
                                </div>
                                <div class="passiva-mini-nome">${nomeHabHtml}</div>
                                <span class="passiva-mini-desc">${descHabHtml}</span>
                            </div>
                        `;
                    } else {
                        const meta = hab.formula ? ` • ${formulaHabHtml}` : '';
                        htmlFeiticos += `
                            <label class="magia-radio-item">
                                <input type="radio" name="feitico-selecionado-slot${numSlot}" value="${habId}" onchange="atualizarTextoBotaoAcaoJogador(${numSlot})">
                                <span class="magia-icon-mini">${icon}</span> <span>${nomeHabHtml}${meta}</span>
                            </label>
                        `;
                    }
                }

                if(htmlPassivas === '') htmlPassivas = '<div style="color:#5c3a21; font-size: 10px; font-style: italic;">Nenhuma equipada</div>';

                containerFeiticos.innerHTML = htmlFeiticos;
                containerPassivas.innerHTML = htmlPassivas;
                atualizarTextoBotaoAcaoJogador(numSlot);
            }

            // 2. Atualiza o Modal do Grimório se estiver aberto
            if(numSlotGrimorioAberto === numSlot) {
                renderizarGrimorioModal(numSlot, grimorio);
            }
        };

        function renderizarGrimorioModal(numSlot, grimorio) {
            const divAtivas = document.getElementById('grimorio-lista-ativas');
            const divPassivas = document.getElementById('grimorio-lista-passivas');
            if(!divAtivas || !divPassivas) return;

            divAtivas.innerHTML = '';
            divPassivas.innerHTML = '';

            const dadosFicha = slotsDeVisao[numSlot]?.dados || {};
            const metaArvore = document.getElementById('grimorio-meta-arvore');
            if(metaArvore) {
                metaArvore.textContent = `Classe: ${dadosFicha.classe || 'Nenhuma'} · Caminho: ${getNomeCaminhoArvore(dadosFicha)}`;
            }

            const temPermissao = (usuarioAtual.cargo === "Mestre") || (usuarioAtual.idFicha === slotsDeVisao[numSlot].idFicha);

            for(let habId in grimorio) {
                let hab = enrichHab(habId, grimorio[habId]);
                let isEquipada = hab.equipada || false;
                const iconHtml = escapeHtml(hab.icon || '✨');
                const nomeHabHtml = escapeHtml(hab.nome || habId);
                const descHabHtml = escapeHtml(hab.desc || '');
                const effectKindHtml = escapeHtml(hab.effectKind || '');
                const alvoHtml = escapeHtml(hab.alvo || '');
                const formulaHtml = escapeHtml(hab.formula || '');

                let btnEquiparHtml = '';
                // Passivas e melhorias nunca recebem botão de equipar (sempre ativas nativamente)
                if(temPermissao && hab.tipo !== 'passiva' && hab.tipo !== 'melhoria' && !(hab.treeSkill && usuarioAtual.cargo === "Mestre")) {
                    btnEquiparHtml = `<button onclick="toggleEquiparHabilidade(${numSlot}, '${habId}')" class="btn-equipar-visual">${isEquipada ? 'Desequipar' : 'Equipar'}</button>`;
                }

                let delHtml = (temPermissao && !hab.treeSkill) ? `<button onclick="deletarHabilidade(${numSlot}, '${habId}')" style="position: absolute; top: 10px; right: 10px; background:none; border:none; color:#8c1c13; cursor:pointer; font-size: 16px;" title="Apagar Habilidade">🗑️</button>` : '';

                let iconUrl = `Icones/${habId}.png`;
                let cardHtml = `
                    <div class="skill-card-visual ${isEquipada ? 'equipada' : ''} tipo-${hab.tipo}">
                        ${delHtml}
                        <div class="skill-icon-container">
                            <div style="width:100%;height:100%;background-image:url('${iconUrl}');background-size:cover;background-position:center;position:absolute;top:0;left:0;z-index:2;border-radius:50%;"></div>
                            <div class="skill-icon-glow" style="z-index:1;">${iconHtml}</div>
                        </div>
                        <div class="skill-data-visual">
                            <div class="skill-title-visual">${nomeHabHtml}</div>
                            <div class="skill-stats-visual" style="font-size: 11px; color:#dcd0ba; margin-bottom:5px;">
                                <span>${hab.tipo === 'passiva' ? '🔒 Passiva' : (hab.tipo === 'melhoria' ? '+ Melhoria' : '⚡ Ativa')} · Efeito: ${effectKindHtml} · Alvo: ${alvoHtml}</span>
                                ${hab.formula ? `<span style="display:block; color:#d4af37; margin-top:3px;">Fórmula: ${formulaHtml}</span>` : ''}
                            </div>
                            <div class="skill-desc-visual">${descHabHtml}</div>
                            ${btnEquiparHtml}
                        </div>
                    </div>
                `;

                if(hab.tipo === 'passiva' || hab.tipo === 'melhoria') divPassivas.innerHTML += cardHtml;
                else divAtivas.innerHTML += cardHtml;
            }
        }

        window.toggleEquiparHabilidade = function(numSlot, habId) {
            const idFicha = slotsDeVisao[numSlot].idFicha;
            if(!idFicha) return;
            safeGet(`fichas/${idFicha}/grimorio/${habId}`).then(snap => {
                if(snap.exists()) {
                    let hab = snap.val();
                    if(hab.treeSkill && usuarioAtual.cargo === "Mestre") return alert("Mestre pode inspecionar, mas não alterar habilidades da árvore nesta etapa.");
                    if(hab.treeSkill && hab.tipo === 'melhoria') return;
                    safeUpdate(`fichas/${idFicha}/grimorio/${habId}`, { equipada: !hab.equipada });
                }
            });
        };

        window.jogadorLancarFeitico = async function(numSlot) {
            if(!podeUsuarioAgirAgora(numSlot, { acao: 'ataque-jogador' })) return;
            const radioSelecionado = document.querySelector(`input[name="feitico-selecionado-slot${numSlot}"]:checked`);
            if(!radioSelecionado) return alert("Selecione um ataque ou magia primeiro.");

            const feiticoId = radioSelecionado.value;
            const inputDano = document.getElementById(`slot${numSlot}-jogador-ataque-dano`);
            let valorEfeito = Number(inputDano.value) || 0;

            const checkboxes = document.querySelectorAll(`#alvos-combate-slot${numSlot} input[type="checkbox"]:checked`);
            if(checkboxes.length === 0) return alert("Selecione pelo menos um alvo!");

            const idFicha = slotsDeVisao[numSlot].idFicha;
            let manaCusto = 0;
            let apCusto = 0;
            let tipoFeitico = 'dano';
            let habSelecionada = null;
            let formulaRolada = null;

            if(feiticoId !== 'fisico') {
                let snap = await safeGet(`fichas/${idFicha}/grimorio/${feiticoId}`);
                if(snap.exists()) {
                    habSelecionada = enrichHab(feiticoId, snap.val());
                    manaCusto = toNumber(habSelecionada.mana, 0);
                    apCusto = toNumber(habSelecionada.ap, 0);
                    tipoFeitico = inferirTipoEfeito(feiticoId, habSelecionada);

                    if(habSelecionada.formula) {
                        try {
                            formulaRolada = rolarFormulaMagica(habSelecionada.formula, slotsDeVisao[numSlot].dados || {});
                            valorEfeito = formulaRolada.total;
                            if(inputDano) inputDano.value = valorEfeito;
                        } catch (err) {
                            console.error(err);
                            return alert("A fórmula dessa magia está inválida. Revise o grimório antes de lançar.");
                        }
                    }
                }
            }

            const efeitoAutomatico = ['dano', 'cura', 'escudo'].includes(tipoFeitico);
            if(!efeitoAutomatico) {
                return alert("Essa habilidade ainda não tem efeito automático de combate. Ela ficou registrada no grimório, mas precisa de resolução manual na mesa.");
            }

            if(valorEfeito <= 0) return alert("Insira um valor de dano/cura (Total Rolado) válido!");

            let manaAtual = Number(document.getElementById(`slot${numSlot}-mana-atual`)?.value) || 0;
            let apAtual = Number(document.getElementById(`slot${numSlot}-ap`)?.value) || 0;

            if(manaCusto > manaAtual) return alert("Mana insuficiente para lançar este feitiço!");
            if(apCusto > apAtual) return alert("AP insuficiente!");

            if(manaCusto > 0 || apCusto > 0) {
                const gasto = await safeTransaction(`fichas/${idFicha}`, (dadosAtuais) => {
                    if(!dadosAtuais) return;
                    const manaDB = toNumber(dadosAtuais['mana-atual'], 0);
                    const apDB = toNumber(dadosAtuais.ap, 0);
                    if(manaCusto > manaDB || apCusto > apDB) return;
                    return {
                        ...dadosAtuais,
                        'mana-atual': manaDB - manaCusto,
                        'ap': apDB - apCusto
                    };
                });
                if(!gasto.committed) return alert("Mana ou AP mudou antes do lançamento. Confira os valores e tente novamente.");
            }

            const alvos = Array.from(checkboxes).map(cb => cb.value);
            const ator = getNomeAtorDoSlot(numSlot);
            const habilidadeLog = feiticoId === 'fisico' ? null : (habSelecionada?.nome || feiticoId);
            for(let alvo of alvos) {
                if(alvo.startsWith("horda_") && ameacaEmCombateGlobal && alvo.startsWith(ameacaEmCombateGlobal + "_")) {
                    let hordaId = ameacaEmCombateGlobal;
                    let mId = alvo.replace(hordaId + "_", "");
                    const pathAlvo = `hordas/${hordaId}/membros/${mId}`;
                    const meta = await aplicarEfeitoVidaPath(pathAlvo, valorEfeito, tipoFeitico);
                    registrarFeedbackELog(pathAlvo, meta, { ator, habilidade: habilidadeLog });
                } else {
                    const pathAlvo = `fichas/${alvo}`;
                    const meta = await aplicarEfeitoVidaPath(pathAlvo, valorEfeito, tipoFeitico);
                    registrarFeedbackELog(pathAlvo, meta, { ator, habilidade: habilidadeLog });
                }
            }

            inputDano.value = '';
            checkboxes.forEach(cb => cb.checked = false);
            destacarAlvosSelecionados();
            if(formulaRolada) mostrarCombatToast(`Rolagem: ${habSelecionada.formula} = ${valorEfeito}.`);
        };

        window.adicionarHabilidade = function(numSlot) {
            const idsLegado = [
                `slot${numSlot}-hab-nome`,
                `slot${numSlot}-hab-ap`,
                `slot${numSlot}-hab-mana`,
                `slot${numSlot}-hab-tipo`,
                `slot${numSlot}-hab-desc`
            ];
            if(idsLegado.some(id => !document.getElementById(id))) {
                console.warn("LEGADO: adicionarHabilidade usa campos antigos de grimorio que nao existem na UI atual.");
                return;
            }

            let nome = document.getElementById(`slot${numSlot}-hab-nome`).value;
            let ap = Number(document.getElementById(`slot${numSlot}-hab-ap`).value) || 0;
            let mana = Number(document.getElementById(`slot${numSlot}-hab-mana`).value) || 0;
            let tipo = document.getElementById(`slot${numSlot}-hab-tipo`).value;
            let desc = document.getElementById(`slot${numSlot}-hab-desc`).value;

            if(!nome) return alert("Habilidade precisa de um nome!");

            const idFicha = slotsDeVisao[numSlot].idFicha;
            const habId = "hab_" + Date.now();

            safeUpdate(`fichas/${idFicha}/grimorio/${habId}`, normalizeHabV1(habId, {
                nome, ap, mana, tipo, desc
            }));

            document.getElementById(`slot${numSlot}-hab-nome`).value = '';
            document.getElementById(`slot${numSlot}-hab-ap`).value = '0';
            document.getElementById(`slot${numSlot}-hab-mana`).value = '0';
            document.getElementById(`slot${numSlot}-hab-desc`).value = '';
        };

        window.deletarHabilidade = function(numSlot, habId) {
            const idFicha = slotsDeVisao[numSlot].idFicha;
            if(!idFicha) return;
            safeGet(`fichas/${idFicha}/grimorio/${habId}`).then(snap => {
                if(!snap.exists()) return;
                if(snap.val()?.treeSkill) return alert("Habilidades da árvore não podem ser removidas pelo Grimório.");
                if(confirm("Tem certeza que deseja apagar essa habilidade do grimório?")) {
                    safeRemove(`fichas/${idFicha}/grimorio/${habId}`);
                }
            });
        };

        function stableStringify(value) {
            if(value === null || typeof value !== 'object') return JSON.stringify(value);
            if(Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
            return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
        }

        function idExisteEmHabilidadesSistema(habId) {
            for (let grupo in HABILIDADES_SISTEMA) {
                if (HABILIDADES_SISTEMA[grupo]?.[habId]) return true;
            }
            return false;
        }

        function montarGrimorioSistemaSincronizado(dados = {}) {
            const racaSel = dados.raca || '';
            const classeSel = dados.classe || '';
            const grimorioAntigo = dados.grimorio || {};
            const idsSistemaAtuais = new Set();
            const novoGrimorio = {};

            [racaSel, classeSel].forEach(grupo => {
                if(!HABILIDADES_SISTEMA[grupo]) return;
                for(let k in HABILIDADES_SISTEMA[grupo]) idsSistemaAtuais.add(k);
            });

            for(let k in grimorioAntigo) {
                const h = grimorioAntigo[k];
                const ehHabSistemaConhecida = idExisteEmHabilidadesSistema(k);
                if(!h?.isSystemObj && !ehHabSistemaConhecida) novoGrimorio[k] = h;
            }

            idsSistemaAtuais.forEach(k => {
                let habFonte = null;
                [racaSel, classeSel].forEach(grupo => {
                    if(HABILIDADES_SISTEMA[grupo]?.[k]) habFonte = HABILIDADES_SISTEMA[grupo][k];
                });
                if(!habFonte) return;

                const habBase = normalizeHabV1(k, habFonte);
                const existente = grimorioAntigo[k] ? normalizeHabV1(k, grimorioAntigo[k]) : null;
                novoGrimorio[k] = {
                    ...habBase,
                    ...(existente || {}),
                    isSystemObj: true,
                    equipada: existente && Object.prototype.hasOwnProperty.call(existente, 'equipada')
                        ? Boolean(existente.equipada)
                        : habBase.tipo === 'passiva'
                };
            });

            return {
                grimorio: novoGrimorio,
                mudou: stableStringify(grimorioAntigo) !== stableStringify(novoGrimorio)
            };
        }

        async function sincronizarHabilidadesSistemaSeNecessario(idFicha, dados = {}) {
            if(!dados.raca && !dados.classe) return;
            const resultado = montarGrimorioSistemaSincronizado(dados);
            if(resultado.mudou) await safeUpdate(`fichas/${idFicha}`, { grimorio: resultado.grimorio });
        }

        window.atualizarHabilidadesSistema = async function(idFicha, numSlot) {
            const snap = await safeGet(`fichas/${idFicha}`);
            if(!snap.exists()) return;

            const resultado = montarGrimorioSistemaSincronizado(snap.val() || {});
            if(resultado.mudou) await safeUpdate(`fichas/${idFicha}`, { grimorio: resultado.grimorio });
        };

        // ==========================================
        // DELEGAÇÃO DE EVENTOS GLOBAL (PERFORMANCE)
        // ==========================================
        document.addEventListener('change', (e) => {
            tratarMudancaAlvoCombate(e.target);
        });

        document.addEventListener('input', async (e) => {
            if (e.target.disabled) return;
            const classList = e.target.classList;

            // 1. Inputs de Horda
            if (classList.contains('horda-compact-input')) {
                let numSlot = classList.contains('editavel-slot1') ? 1 : (classList.contains('editavel-slot2') ? 2 : null);
                if(!numSlot || !slotsDeVisao[numSlot].idFicha) return;
                let parts = e.target.id.split('-');
                const campoHorda = parts.slice(2).join('-');
                const valorHorda = normalizarValorParaSalvar(campoHorda, e.target.value, { compacto: true });
                await safeTransaction(`hordas/${slotsDeVisao[numSlot].idFicha}/membros/${parts[1]}`, (dadosAtuais) => {
                    const dados = dadosAtuais || {};
                    return { ...dados, [campoHorda]: valorHorda };
                });
                return;
            }

            // 2. Inputs de Ficha (Herói / Monstro)
            let isEditavelSlot1 = classList.contains('editavel-slot1');
            let isEditavelSlot2 = classList.contains('editavel-slot2');

            if (isEditavelSlot1 || isEditavelSlot2) {
                if(e.target.type === 'file') return;

                let numSlot = isEditavelSlot1 ? 1 : 2;
                let tipo = slotsDeVisao[numSlot].tipo;
                let idFicha = slotsDeVisao[numSlot].idFicha;
                if(!idFicha || tipo === 'horda') return;

                let chaveCompleta = e.target.id;
                if(!chaveCompleta.startsWith(`slot${numSlot}-`)) return;
                if(chaveCompleta.includes('novo-buff')) return;
                if(chaveCompleta.includes('jogador-ataque-dano')) return;
                if(chaveCompleta.includes('ataque-dano')) return;
                if(chaveCompleta.includes('qtd-horda')) return;

                let chaveDoBanco = chaveCompleta.replace(`slot${numSlot}-`, '');
                if(tipo === 'monstro') {
                    chaveDoBanco = chaveDoBanco.replace('monstro-', '');
                    if(chaveCompleta === `slot${numSlot}-monstro-nome`) chaveDoBanco = 'nome';
                }

                let novoValor = e.target.value;
                let dadosAntigos = slotsDeVisao[numSlot].dados || {};

                let baseAtual = {for:0, des:0, con:0, int:0, sab:0, car:0, per:0};
                let oldRaca = dadosAntigos.raca || '';
                let oldClasse = dadosAntigos.classe || '';
                if(typeof RACES !== 'undefined' && RACES[oldRaca] && !RACES[oldRaca].points) {
                    for(let a in baseAtual) if(RACES[oldRaca][a]) baseAtual[a] += RACES[oldRaca][a];
                }
                if(typeof CLASSES !== 'undefined' && CLASSES[oldClasse]) {
                    for(let a in baseAtual) if(CLASSES[oldClasse][a]) baseAtual[a] += CLASSES[oldClasse][a];
                }

                if (tipo === 'heroi' && (chaveDoBanco === 'raca' || chaveDoBanco === 'classe')) {
                    let newRaca = chaveDoBanco === 'raca' ? novoValor : oldRaca;
                    let newClasse = chaveDoBanco === 'classe' ? novoValor : oldClasse;

                    let newBase = {for:0, des:0, con:0, int:0, sab:0, car:0, per:0};
                    if(typeof RACES !== 'undefined' && RACES[newRaca] && !RACES[newRaca].points) {
                        for(let a in newBase) if(RACES[newRaca][a]) newBase[a] += RACES[newRaca][a];
                    }
                    if(typeof CLASSES !== 'undefined' && CLASSES[newClasse]) {
                        for(let a in newBase) if(CLASSES[newClasse][a]) newBase[a] += CLASSES[newClasse][a];
                    }

                    let updates = { [chaveDoBanco]: novoValor };
                    ['for', 'des', 'con', 'int', 'sab', 'car', 'per'].forEach(attr => {
                        let delta = newBase[attr] - baseAtual[attr];
                        if(delta !== 0) {
                            updates[attr] = (Number(dadosAntigos[attr]) || 0) + delta;
                        }
                    });
                    safeUpdate('fichas/' + idFicha, updates).then(() => {
                        atualizarHabilidadesSistema(idFicha, numSlot);
                    });
                    return;
                }

                if (tipo === 'heroi' && ATTRS.includes(chaveDoBanco) && novoValor !== "") {
                    novoValor = Number(novoValor);
                    let minG = baseAtual[chaveDoBanco];
                    if (novoValor < minG) novoValor = minG;

                    let expT = Number(dadosAntigos['expTotal']) || 0;
                    let lvl = typeof getLevelData === 'function' ? getLevelData(expT).level : 1;
                    let maxA = 10 + (lvl - 1);
                    if(typeof RACES !== 'undefined' && RACES[oldRaca] && RACES[oldRaca].points) maxA += RACES[oldRaca].points;

                    let ptsGastos = 0;
                    ['for', 'des', 'con', 'int', 'sab', 'car', 'per'].forEach(a => {
                        let valDaVez = (a === chaveDoBanco) ? novoValor : (Number(dadosAntigos[a]) || 0);
                        ptsGastos += Math.max(0, valDaVez - baseAtual[a]);
                    });

                    if (ptsGastos > maxA && usuarioAtual.cargo !== "Mestre") {
                        e.target.value = dadosAntigos[chaveDoBanco] || 0;
                        return;
                    }
                    e.target.value = novoValor;
                }

                if (usuarioAtual.cargo === 'Jogador' && (chaveDoBanco === 'hp-atual' || chaveDoBanco === 'mana-atual')) {
                    if (novoValor !== "") {
                        novoValor = Number(novoValor);
                        if (novoValor < 0) novoValor = 0;
                        let hpEf = document.getElementById(`slot${numSlot}-hp-efetivo`);
                        let manaEf = document.getElementById(`slot${numSlot}-mana-efetivo`);
                        let maxVal = chaveDoBanco === 'hp-atual' ?
                            (hpEf ? Number(hpEf.innerText) : 20) :
                            (manaEf ? Number(manaEf.innerText) : 20);
                        if (novoValor > maxVal) novoValor = maxVal;
                        e.target.value = novoValor;
                    }
                }

                const valorParaSalvar = normalizarValorParaSalvar(chaveDoBanco, novoValor);

                if (['hp-atual', 'hp-max', 'mana-atual', 'mana-max', 'escudo', 'ap'].includes(chaveDoBanco)) {
                    await safeTransaction(`fichas/${idFicha}/${chaveDoBanco}`, () => valorParaSalvar);
                } else {
                    safeUpdate('fichas/' + idFicha, { [chaveDoBanco]: valorParaSalvar });
                }
                if(chaveDoBanco.includes('hp') || chaveDoBanco.includes('mana')) atualizarBarrasEAlertaNoSlot(numSlot, tipo);
            }
        });



        // ========================= VOZ DA MESA — WEBRTC =========================
        const VOICE_ROOM_ID = 'mesa-principal';
        const VOICE_PATH = `voz/${VOICE_ROOM_ID}`;
        const VOICE_USERS = Object.keys(usuarios);
        const VOICE_STRETCH_MODULE_URL = new URL('./assets/vendor/signalsmith-stretch/SignalsmithStretch.mjs', import.meta.url).href;
        const VOICE_CAVE_IR_URL = new URL('./assets/audio/ir/gill-heads-mine-site2-2way.wav', import.meta.url).href;
        const VOICE_PREVIEW_SECONDS = 5;
        const VOICE_CAPTURE_CONSTRAINTS = {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false
        };

        const VOICE_CHARACTERS = {
            natural: {
                label: 'Natural',
                hint: 'Sua voz sem alteração de personagem.',
                fallbackSemitones: 0,
                formantSemitones: 0,
                targetHz: null,
                minShift: 0,
                maxShift: 0,
                lowShelf: 0,
                highShelf: 0,
                presence: 0,
                saturation: 0,
                tremoloDepth: 0,
                tremoloRate: 0
            },
            feminine: {
                label: 'Feminina natural',
                hint: 'Eleva com moderação a altura e os formantes para preservar naturalidade.',
                fallbackSemitones: 3,
                formantSemitones: 2.2,
                targetHz: 190,
                minShift: 0,
                maxShift: 6,
                lowShelf: -1.2,
                highShelf: 1.5,
                presence: 1,
                saturation: 0,
                tremoloDepth: 0,
                tremoloRate: 0
            },
            masculine: {
                label: 'Masculina natural',
                hint: 'Reduz suavemente altura e formantes, com um pouco mais de corpo.',
                fallbackSemitones: -2.5,
                formantSemitones: -1.8,
                targetHz: 120,
                minShift: -6,
                maxShift: 0,
                lowShelf: 1.6,
                highShelf: -.8,
                presence: .4,
                saturation: .08,
                tremoloDepth: 0,
                tremoloRate: 0
            },
            deep: {
                label: 'Voz grossa',
                hint: 'Voz baixa e encorpada, com saturação controlada para monstros e guerreiros.',
                fallbackSemitones: -4.5,
                formantSemitones: -3.2,
                targetHz: 100,
                minShift: -6.5,
                maxShift: 0,
                lowShelf: 3.2,
                highShelf: -1.8,
                presence: -.6,
                saturation: .2,
                tremoloDepth: 0,
                tremoloRate: 0
            },
            elder: {
                label: 'Ancião / Anciã',
                hint: 'Interpretação envelhecida com tremor leve, menos brilho e timbre mais frágil.',
                fallbackSemitones: -.7,
                formantSemitones: -.6,
                targetHz: null,
                minShift: -1.2,
                maxShift: .5,
                lowShelf: .6,
                highShelf: -3.4,
                presence: -1.1,
                saturation: .05,
                tremoloDepth: .035,
                tremoloRate: 5.1
            },
            child: {
                label: 'Infantil (estilizada)',
                hint: 'Voz infantil deliberadamente estilizada, limitada para evitar o efeito de desenho animado.',
                fallbackSemitones: 5.5,
                formantSemitones: 4.1,
                targetHz: 260,
                minShift: 2,
                maxShift: 8,
                lowShelf: -2.8,
                highShelf: 2.2,
                presence: 1.2,
                saturation: 0,
                tremoloDepth: 0,
                tremoloRate: 0
            }
        };

        const VOICE_ENVIRONMENTS = {
            normal: {
                label: 'Voz limpa',
                hint: 'Som direto, com limpeza de ruído e compressão suave.',
                dry: 1,
                wet: 0,
                duration: 0,
                predelay: 0,
                damping: 12000,
                realImpulse: false,
                reflections: []
            },
            stone: {
                label: 'Câmara de pedra',
                hint: 'Reflexões curtas de pedra, mantendo a fala próxima e inteligível.',
                dry: .88,
                wet: .2,
                duration: 1.05,
                predelay: .014,
                damping: 8800,
                realImpulse: false,
                reflections: [[.014, .10], [.031, .075], [.052, .055], [.081, .035]]
            },
            cave: {
                label: 'Caverna profunda',
                hint: 'Acústica real da Gill Heads Mine, capturada pela biblioteca OpenAIR.',
                dry: .78,
                wet: .32,
                duration: 1.53,
                predelay: .018,
                damping: 6800,
                realImpulse: true,
                reflections: []
            }
        };

        let voiceStretchModulePromise = null;
        let voiceCaveImpulsePromise = null;

        const voiceState = {
            initialized: false,
            started: false,
            phase: 'offline',
            sessionId: null,
            localStream: null,
            audioContext: null,
            input: null,
            processedDestination: null,
            graphNodes: [],
            graphRevision: 0,
            meterAnalyser: null,
            meterAnimation: null,
            meterBuffer: null,
            impulseCache: new Map(),
            effectCapability: 'pending',
            peers: {},
            remotes: {},
            participants: {},
            presenceDisconnect: null,
            roomUnsubscribers: [],
            preview: {
                active: false,
                phase: 'idle',
                mode: 'idle',
                taskId: 0,
                stopTimer: null,
                countdownTimer: null,
                recorders: [],
                playbackUrls: [],
                monitorGain: null
            },
            settings: {
                muted: false,
                deafened: false,
                volume: 1,
                character: 'natural',
                calibrationHz: null,
                environment: 'normal',
                hear: {},
                speakTo: {},
                whisperMaster: false
            },
            masterPolicy: {
                blockedSpeak: {},
                blockedHear: {},
                isolated: {},
                scene: 'normal',
                overrides: {}
            }
        };

        function voiceLocalKey() {
            return usuarioAtual?.idFicha || 'dick';
        }

        function voiceName(id) {
            return usuarios[id]?.nome || id;
        }

        function voicePeerIds() {
            return VOICE_USERS.filter(id => id !== voiceLocalKey());
        }

        function voicePairId(a, b) {
            return [a, b].sort().join('__');
        }

        function voicePairPath(peerId) {
            return `${VOICE_PATH}/signals/${voicePairId(voiceLocalKey(), peerId)}`;
        }

        function voiceSessionId() {
            return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        }

        function clampVoiceNumber(value, min, max, fallback) {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
        }

        function normalizeVoiceCalibration(value) {
            const parsed = Number(value);
            return Number.isFinite(parsed) && parsed >= 65 && parsed <= 420 ? parsed : null;
        }

        function loadVoiceSettings() {
            try {
                const saved = JSON.parse(localStorage.getItem(`rpgVoice:${voiceLocalKey()}`) || '{}');
                voiceState.settings.muted = !!saved.muted;
                voiceState.settings.deafened = !!saved.deafened;
                voiceState.settings.whisperMaster = !!saved.whisperMaster;
                voiceState.settings.volume = clampVoiceNumber(saved.volume, 0, 1, 1);
                voiceState.settings.character = VOICE_CHARACTERS[saved.character] ? saved.character : 'natural';
                voiceState.settings.calibrationHz = normalizeVoiceCalibration(saved.calibrationHz);
                voiceState.settings.environment = VOICE_ENVIRONMENTS[saved.environment] ? saved.environment : 'normal';
                voiceState.settings.hear = saved.hear && typeof saved.hear === 'object' ? saved.hear : {};
                voiceState.settings.speakTo = saved.speakTo && typeof saved.speakTo === 'object' ? saved.speakTo : {};
            } catch (error) {
                console.warn('Não foi possível carregar as preferências de voz.', error);
            }
        }

        function saveVoiceSettings() {
            const settings = voiceState.settings;
            localStorage.setItem(`rpgVoice:${voiceLocalKey()}`, JSON.stringify({
                muted: settings.muted,
                deafened: settings.deafened,
                volume: settings.volume,
                character: settings.character,
                calibrationHz: settings.calibrationHz,
                environment: settings.environment,
                hear: settings.hear,
                speakTo: settings.speakTo,
                whisperMaster: settings.whisperMaster
            }));
        }

        function effectiveVoiceCharacter() {
            return VOICE_CHARACTERS[voiceState.settings.character] ? voiceState.settings.character : 'natural';
        }

        function voiceCharacterPitchShift(characterName = effectiveVoiceCharacter()) {
            const profile = VOICE_CHARACTERS[characterName] || VOICE_CHARACTERS.natural;
            const calibrationHz = normalizeVoiceCalibration(voiceState.settings.calibrationHz);
            if (!profile.targetHz || !calibrationHz) return profile.fallbackSemitones;
            const calibratedShift = 12 * Math.log2(profile.targetHz / calibrationHz);
            return clampVoiceNumber(calibratedShift, profile.minShift, profile.maxShift, profile.fallbackSemitones);
        }

        function effectiveVoiceEnvironment() {
            if (voiceState.masterPolicy.scene === 'cave') return 'cave';
            if (voiceState.masterPolicy.overrides?.environment === 'cave') return 'cave';
            return VOICE_ENVIRONMENTS[voiceState.settings.environment] ? voiceState.settings.environment : 'normal';
        }

        function voiceCanSendTo(peerId) {
            const me = voiceLocalKey();
            if (!voiceState.started || voiceState.settings.muted || voiceState.masterPolicy.blockedSpeak?.[me]) return false;
            if (voiceState.settings.whisperMaster && peerId !== 'dick') return false;
            return voiceState.settings.speakTo[peerId] !== false;
        }

        function voiceCanHear(peerId) {
            if (!voiceState.started || voiceState.settings.deafened) return false;
            return voiceState.settings.hear[peerId] !== false;
        }

        function setVoiceStatus(state, message) {
            const status = document.getElementById('voice-status');
            if (!status) return;
            status.dataset.state = state;
            const text = status.querySelector('.voice-status__text');
            if (text) text.textContent = message;
        }

        function onlineVoicePeerIds() {
            return voicePeerIds().filter(id => voiceState.participants[id]?.online && voiceState.participants[id]?.sessionId);
        }

        function updateVoiceConnectionSummary() {
            const count = document.getElementById('voice-participant-count');
            const warning = document.getElementById('voice-network-warning');
            const remoteOnline = onlineVoicePeerIds();
            const connected = remoteOnline.filter(id => voiceState.peers[id]?.pc.connectionState === 'connected').length;
            const failed = remoteOnline.some(id => ['failed', 'disconnected'].includes(voiceState.peers[id]?.pc.connectionState));
            const totalOnline = remoteOnline.length + (voiceState.started ? 1 : 0);

            if (count) count.textContent = `${totalOnline} ${totalOnline === 1 ? 'na chamada' : 'na chamada'}`;
            if (warning) warning.hidden = !(voiceState.started && failed);

            if (voiceState.phase === 'connecting') {
                setVoiceStatus('connecting', 'Conectando…');
            } else if (voiceState.phase === 'disconnecting') {
                setVoiceStatus('connecting', 'Desconectando…');
            } else if (voiceState.phase === 'error') {
                setVoiceStatus('error', 'Microfone indisponível');
            } else if (!voiceState.started) {
                setVoiceStatus('offline', 'Desconectado');
            } else if (failed) {
                setVoiceStatus('warning', 'Chamada parcial');
            } else if (!remoteOnline.length) {
                setVoiceStatus('online', 'Conectado · aguardando');
            } else if (connected < remoteOnline.length) {
                setVoiceStatus('connecting', `${connected + 1}/${remoteOnline.length + 1} conectados`);
            } else {
                setVoiceStatus('online', `${connected + 1}/${remoteOnline.length + 1} conectados`);
            }
        }

        function updateVoiceQuickControls() {
            const start = document.getElementById('voice-start');
            const mute = document.getElementById('voice-mute');
            const deafen = document.getElementById('voice-deafen');
            const whisper = document.getElementById('voice-whisper-master');
            const character = document.getElementById('voice-character');
            const environment = document.getElementById('voice-environment');
            const volume = document.getElementById('voice-master-volume');
            const reset = document.getElementById('voice-reset');
            const masterControls = document.getElementById('voice-master-controls');
            const caveScene = document.getElementById('voice-scene-cave');
            const characterHint = document.getElementById('voice-character-hint');
            const environmentHint = document.getElementById('voice-environment-hint');
            const meBlocked = !!voiceState.masterPolicy.blockedSpeak?.[voiceLocalKey()];
            const micLive = voiceState.started && !voiceState.settings.muted && !meBlocked;
            const previewLocksEffects = ['starting', 'calibrating', 'recording', 'finalizing'].includes(voiceState.preview.phase);
            const effectControlsBusy = ['connecting', 'disconnecting'].includes(voiceState.phase) || previewLocksEffects;

            if (start) {
                const busy = ['connecting', 'disconnecting'].includes(voiceState.phase) || previewLocksEffects;
                start.disabled = busy;
                start.textContent = voiceState.phase === 'connecting' ? 'Conectando…' :
                    voiceState.phase === 'disconnecting' ? 'Saindo…' :
                    voiceState.started ? 'Desconectar' :
                    voiceState.phase === 'error' ? 'Tentar novamente' : 'Conectar';
                start.classList.toggle('is-connected', voiceState.started);
            }

            if (mute) {
                mute.disabled = !voiceState.started || meBlocked;
                mute.classList.toggle('is-on', micLive);
                mute.classList.toggle('is-off', !micLive);
                mute.setAttribute('aria-pressed', String(micLive));
                const label = meBlocked ? 'Microfone silenciado pelo Mestre' : micLive ? 'Desativar microfone' : 'Ativar microfone';
                mute.setAttribute('aria-label', label);
                mute.title = label;
            }

            if (deafen) {
                deafen.classList.toggle('is-active', !voiceState.settings.deafened);
                deafen.classList.toggle('is-off', voiceState.settings.deafened);
                deafen.setAttribute('aria-pressed', String(voiceState.settings.deafened));
            }

            if (whisper) {
                whisper.hidden = usuarioAtual?.cargo === 'Mestre';
                whisper.classList.toggle('is-active', voiceState.settings.whisperMaster);
                whisper.setAttribute('aria-pressed', String(voiceState.settings.whisperMaster));
            }

            if (character) {
                character.value = voiceState.settings.character;
                character.disabled = effectControlsBusy;
            }
            if (environment) {
                environment.value = voiceState.settings.environment;
                environment.disabled = effectControlsBusy;
            }
            if (volume) volume.value = String(voiceState.settings.volume);
            if (reset) reset.disabled = effectControlsBusy;
            if (masterControls) masterControls.hidden = usuarioAtual?.cargo !== 'Mestre';
            if (caveScene) {
                const active = voiceState.masterPolicy.scene === 'cave';
                caveScene.classList.toggle('is-active', active);
                caveScene.setAttribute('aria-pressed', String(active));
            }

            if (characterHint) {
                const characterProfile = VOICE_CHARACTERS[effectiveVoiceCharacter()];
                const calibration = normalizeVoiceCalibration(voiceState.settings.calibrationHz);
                characterHint.textContent = characterProfile.hint + (
                    effectiveVoiceCharacter() !== 'natural'
                        ? calibration ? ` Calibração ativa: ${Math.round(calibration)} Hz.` : ' Use “Calibrar 3 s” para adaptar ao seu timbre.'
                        : ''
                ) + (
                    effectiveVoiceCharacter() !== 'natural' && voiceState.effectCapability === 'basic'
                        ? ' Modo compatível ativo: pitch avançado indisponível neste navegador.'
                        : ''
                );
            }

            if (environmentHint) {
                const effective = effectiveVoiceEnvironment();
                environmentHint.textContent = voiceState.masterPolicy.scene === 'cave'
                    ? `Cena global do Mestre: ${VOICE_ENVIRONMENTS.cave.hint}`
                    : VOICE_ENVIRONMENTS[effective].hint;
            }

            updateVoiceLabUi();
            updateVoiceConnectionSummary();
        }

        function toggleVoiceDrawer(forceOpen) {
            const panel = document.getElementById('voice-panel');
            const content = document.getElementById('voice-drawer-content');
            const toggle = document.getElementById('voice-panel-toggle');
            if (!panel || !content || !toggle) return;
            const open = typeof forceOpen === 'boolean' ? forceOpen : panel.dataset.open !== 'true';
            panel.dataset.open = String(open);
            content.hidden = !open;
            toggle.setAttribute('aria-expanded', String(open));
            toggle.title = open ? 'Fechar Voz da Mesa' : 'Abrir Voz da Mesa';
        }

        function getVoiceStretchFactory() {
            if (!voiceStretchModulePromise) {
                voiceStretchModulePromise = import(VOICE_STRETCH_MODULE_URL)
                    .then(module => module.default || module)
                    .catch(error => {
                        voiceStretchModulePromise = null;
                        throw error;
                    });
            }
            return voiceStretchModulePromise;
        }

        function getVoiceCaveImpulseBytes() {
            if (!voiceCaveImpulsePromise) {
                voiceCaveImpulsePromise = fetch(VOICE_CAVE_IR_URL)
                    .then(response => {
                        if (!response.ok) throw new Error(`IR da caverna indisponível (${response.status}).`);
                        return response.arrayBuffer();
                    })
                    .catch(error => {
                        voiceCaveImpulsePromise = null;
                        throw error;
                    });
            }
            return voiceCaveImpulsePromise;
        }

        function preloadVoiceAssets() {
            getVoiceStretchFactory().catch(error => console.debug('Pitch avançado será carregado sob demanda.', error));
            getVoiceCaveImpulseBytes().catch(error => console.debug('IR real será carregado sob demanda.', error));
        }

        function createProceduralVoiceImpulse(context, environmentName) {
            const profile = VOICE_ENVIRONMENTS[environmentName];
            const length = Math.max(1, Math.floor(context.sampleRate * profile.duration));
            const impulse = context.createBuffer(2, length, context.sampleRate);

            for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
                const data = impulse.getChannelData(channel);
                let seed = (environmentName === 'cave' ? 911 : 353) + channel * 977;
                let lowBand = 0;

                const random = () => {
                    seed = (seed * 1664525 + 1013904223) >>> 0;
                    return seed / 4294967296;
                };

                for (let index = 0; index < length; index++) {
                    const time = index / context.sampleRate;
                    const progress = index / length;
                    const white = random() * 2 - 1;
                    lowBand += (white - lowBand) * (environmentName === 'cave' ? .075 : .13);
                    const diffuse = white * .58 + lowBand * .42;
                    const onset = Math.min(1, time / .024);
                    const decay = Math.pow(Math.max(0, 1 - progress), environmentName === 'cave' ? 2.15 : 3.4);
                    const airLoss = Math.exp(-time * (environmentName === 'cave' ? .22 : .55));
                    data[index] = diffuse * onset * decay * airLoss;
                }

                profile.reflections.forEach(([time, gain], reflectionIndex) => {
                    const offset = channel ? .0015 * (reflectionIndex % 2 ? 1 : -1) : 0;
                    const sample = Math.max(0, Math.min(length - 1, Math.floor((time + offset) * context.sampleRate)));
                    data[sample] += gain * (channel ? .88 : 1);
                });
            }

            return impulse;
        }

        async function getVoiceImpulse(context, environmentName) {
            const profile = VOICE_ENVIRONMENTS[environmentName];
            const cacheKey = `${environmentName}:${context.sampleRate}:${profile.realImpulse ? 'real' : 'procedural'}`;
            if (voiceState.impulseCache.has(cacheKey)) return voiceState.impulseCache.get(cacheKey);

            let impulse = null;
            if (profile.realImpulse) {
                try {
                    const bytes = await getVoiceCaveImpulseBytes();
                    impulse = await context.decodeAudioData(bytes.slice(0));
                } catch (error) {
                    console.warn('Não foi possível carregar a acústica real; usando reverberação de segurança.', error);
                }
            }

            if (!impulse) impulse = createProceduralVoiceImpulse(context, environmentName);
            voiceState.impulseCache.set(cacheKey, impulse);
            return impulse;
        }

        function createVoiceSaturationCurve(amount = 0) {
            const curve = new Float32Array(1024);
            const mix = clampVoiceNumber(amount, 0, 1, 0);
            const drive = 2.4;
            const normalization = Math.tanh(drive);
            for (let index = 0; index < curve.length; index++) {
                const input = index * 2 / (curve.length - 1) - 1;
                const shaped = Math.tanh(input * drive) / normalization;
                curve[index] = input * (1 - mix) + shaped * mix;
            }
            return curve;
        }

        function disconnectVoiceGraphNodes(nodes = voiceState.graphNodes) {
            nodes.forEach(node => {
                try { node.stop?.(); } catch {}
                try { node.port?.close?.(); } catch {}
                try { node.disconnect?.(); } catch {}
            });
        }

        function clearLocalVoiceGraph() {
            voiceState.graphRevision += 1;
            try { voiceState.input?.disconnect(); } catch {}
            disconnectVoiceGraphNodes();
            voiceState.graphNodes = [];
            voiceState.input = null;
            voiceState.meterAnalyser = null;
            voiceState.preview.monitorGain = null;
        }

        function startVoiceMeter() {
            if (voiceState.meterAnimation) return;
            const frame = () => {
                if (!voiceState.localStream || !voiceState.audioContext) {
                    stopVoiceMeter();
                    return;
                }

                const analyser = voiceState.meterAnalyser;
                const fill = document.getElementById('voice-input-meter');
                const meter = fill?.parentElement;
                let level = 0;
                if (analyser) {
                    if (!voiceState.meterBuffer || voiceState.meterBuffer.length !== analyser.fftSize) {
                        voiceState.meterBuffer = new Float32Array(analyser.fftSize);
                    }
                    const samples = voiceState.meterBuffer;
                    analyser.getFloatTimeDomainData(samples);
                    let energy = 0;
                    for (const sample of samples) energy += sample * sample;
                    const rms = Math.sqrt(energy / samples.length);
                    level = Math.min(1, Math.max(0, rms * 7.5));
                }
                if (fill) fill.style.transform = `scaleX(${level.toFixed(3)})`;
                if (meter) meter.setAttribute('aria-valuenow', String(Math.round(level * 100)));
                voiceState.meterAnimation = requestAnimationFrame(frame);
            };
            voiceState.meterAnimation = requestAnimationFrame(frame);
        }

        function stopVoiceMeter() {
            if (voiceState.meterAnimation) cancelAnimationFrame(voiceState.meterAnimation);
            voiceState.meterAnimation = null;
            voiceState.meterBuffer = null;
            const fill = document.getElementById('voice-input-meter');
            if (fill) fill.style.transform = 'scaleX(0)';
            fill?.parentElement?.setAttribute('aria-valuenow', '0');
        }

        async function buildLocalVoiceGraph() {
            const context = voiceState.audioContext;
            const localStream = voiceState.localStream;
            if (!context || !localStream) return false;

            const revision = ++voiceState.graphRevision;
            try { voiceState.input?.disconnect(); } catch {}
            disconnectVoiceGraphNodes();
            voiceState.graphNodes = [];
            const input = context.createMediaStreamSource(localStream);
            voiceState.input = input;
            if (!voiceState.processedDestination) voiceState.processedDestination = context.createMediaStreamDestination();

            const environmentName = effectiveVoiceEnvironment();
            const environmentProfile = VOICE_ENVIRONMENTS[environmentName];
            const characterName = effectiveVoiceCharacter();
            const characterProfile = VOICE_CHARACTERS[characterName];
            const nodes = [];
            const register = node => {
                nodes.push(node);
                return node;
            };

            const abortGraphBuild = () => {
                try { input.disconnect(); } catch {}
                disconnectVoiceGraphNodes(nodes);
                return false;
            };
            const analyser = register(context.createAnalyser());
            const highPass = register(context.createBiquadFilter());
            const lowShelf = register(context.createBiquadFilter());
            const presence = register(context.createBiquadFilter());
            const highShelf = register(context.createBiquadFilter());
            const lowPass = register(context.createBiquadFilter());
            const speechCompressor = register(context.createDynamicsCompressor());
            const characterGain = register(context.createGain());
            const dryGain = register(context.createGain());
            const mixGain = register(context.createGain());
            const limiter = register(context.createDynamicsCompressor());

            analyser.fftSize = 4096;
            analyser.smoothingTimeConstant = .68;
            highPass.type = 'highpass';
            highPass.frequency.value = characterName === 'deep' ? 56 : characterName === 'child' ? 92 : 72;
            highPass.Q.value = .7;
            lowShelf.type = 'lowshelf';
            lowShelf.frequency.value = 190;
            lowShelf.gain.value = characterProfile.lowShelf;
            presence.type = 'peaking';
            presence.frequency.value = 2850;
            presence.Q.value = .72;
            presence.gain.value = characterProfile.presence;
            highShelf.type = 'highshelf';
            highShelf.frequency.value = 5600;
            highShelf.gain.value = characterProfile.highShelf;
            lowPass.type = 'lowpass';
            lowPass.frequency.value = environmentName === 'cave' ? 9800 : 13800;
            lowPass.Q.value = .2;
            speechCompressor.threshold.value = -25;
            speechCompressor.knee.value = 20;
            speechCompressor.ratio.value = 3;
            speechCompressor.attack.value = .004;
            speechCompressor.release.value = .18;
            characterGain.gain.value = 1;
            dryGain.gain.value = environmentProfile.dry;
            mixGain.gain.value = .92;
            limiter.threshold.value = -4;
            limiter.knee.value = 2;
            limiter.ratio.value = 12;
            limiter.attack.value = .002;
            limiter.release.value = .12;

            input.connect(analyser);
            input.connect(highPass);
            let characterSource = highPass;
            let stretchNode = null;

            if (characterName !== 'natural') {
                try {
                    const stretchFactory = await getVoiceStretchFactory();
                    if (revision !== voiceState.graphRevision || context !== voiceState.audioContext) {
                        return abortGraphBuild();
                    }
                    stretchNode = await stretchFactory(context, {
                        numberOfInputs: 1,
                        numberOfOutputs: 1,
                        outputChannelCount: [1],
                        channelCount: 1,
                        channelCountMode: 'explicit'
                    });
                    register(stretchNode);
                    const stretchPreset = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 ? 'cheaper' : 'default';
                    await stretchNode.configure({ preset: stretchPreset });
                    await stretchNode.schedule({
                        active: true,
                        semitones: voiceCharacterPitchShift(characterName),
                        tonalityHz: 7200,
                        formantSemitones: characterProfile.formantSemitones,
                        formantCompensation: true,
                        formantBaseHz: normalizeVoiceCalibration(voiceState.settings.calibrationHz) || 0
                    });
                    if (revision !== voiceState.graphRevision || context !== voiceState.audioContext) {
                        return abortGraphBuild();
                    }
                    highPass.connect(stretchNode);
                    characterSource = stretchNode;
                    voiceState.effectCapability = 'advanced';
                } catch (error) {
                    if (stretchNode) {
                        try { stretchNode.stop?.(); } catch {}
                        try { stretchNode.port?.close?.(); } catch {}
                        try { stretchNode.disconnect(); } catch {}
                        const stretchIndex = nodes.indexOf(stretchNode);
                        if (stretchIndex >= 0) nodes.splice(stretchIndex, 1);
                    }
                    voiceState.effectCapability = 'basic';
                    console.warn('Pitch e formantes avançados indisponíveis; usando equalização compatível.', error);
                }
            } else if (voiceState.effectCapability === 'pending') {
                voiceState.effectCapability = 'advanced';
            }

            characterSource.connect(lowShelf);
            lowShelf.connect(presence);
            presence.connect(highShelf);

            let toneSource = highShelf;
            if (characterProfile.saturation > 0) {
                const saturation = register(context.createWaveShaper());
                saturation.curve = createVoiceSaturationCurve(characterProfile.saturation);
                saturation.oversample = '2x';
                highShelf.connect(saturation);
                toneSource = saturation;
            }

            toneSource.connect(characterGain);
            if (characterProfile.tremoloDepth > 0) {
                const tremolo = register(context.createOscillator());
                const tremoloGain = register(context.createGain());
                tremolo.type = 'sine';
                tremolo.frequency.value = characterProfile.tremoloRate;
                tremoloGain.gain.value = characterProfile.tremoloDepth;
                tremolo.connect(tremoloGain);
                tremoloGain.connect(characterGain.gain);
                tremolo.start();
            }

            characterGain.connect(lowPass);
            lowPass.connect(speechCompressor);
            speechCompressor.connect(dryGain);
            dryGain.connect(mixGain);

            if (environmentProfile.wet > 0) {
                const impulse = await getVoiceImpulse(context, environmentName);
                if (revision !== voiceState.graphRevision || context !== voiceState.audioContext) {
                    return abortGraphBuild();
                }

                const predelay = register(context.createDelay(.3));
                const convolver = register(context.createConvolver());
                const damping = register(context.createBiquadFilter());
                const wetGain = register(context.createGain());

                predelay.delayTime.value = environmentProfile.predelay;
                convolver.buffer = impulse;
                convolver.normalize = true;
                damping.type = 'lowpass';
                damping.frequency.value = environmentProfile.damping;
                damping.Q.value = .1;
                wetGain.gain.value = environmentProfile.wet;

                speechCompressor.connect(predelay);
                predelay.connect(convolver);
                convolver.connect(damping);
                damping.connect(wetGain);
                wetGain.connect(mixGain);

                environmentProfile.reflections.forEach(([time, gain]) => {
                    const delay = register(context.createDelay(.3));
                    const reflectionGain = register(context.createGain());
                    delay.delayTime.value = time;
                    reflectionGain.gain.value = gain * .48;
                    speechCompressor.connect(delay);
                    delay.connect(reflectionGain);
                    reflectionGain.connect(mixGain);
                });
            }

            mixGain.connect(limiter);
            limiter.connect(voiceState.processedDestination);

            if (voiceState.preview.active && voiceState.preview.mode === 'live') {
                const monitorGain = register(context.createGain());
                monitorGain.gain.value = .82;
                limiter.connect(monitorGain);
                monitorGain.connect(context.destination);
                voiceState.preview.monitorGain = monitorGain;
            }

            if (revision !== voiceState.graphRevision || context !== voiceState.audioContext) {
                return abortGraphBuild();
            }

            voiceState.graphNodes = nodes;
            voiceState.meterAnalyser = analyser;
            startVoiceMeter();
            updateVoiceQuickControls();
            return true;
        }

        async function applyLocalVoiceGraph() {
            if ((!voiceState.started && !voiceState.preview.active) || !voiceState.audioContext || !voiceState.localStream) return;
            try {
                await buildLocalVoiceGraph();
                updateVoiceSenders();
            } catch (error) {
                console.error('Falha ao aplicar o processamento de voz.', error);
                setVoiceStatus('warning', 'Efeito indisponível');
            }
        }

        function closeVoicePeer(peerId) {
            const connection = voiceState.peers[peerId];
            if (connection) {
                try { connection.unsubscribe?.(); } catch {}
                try { connection.outboundTrack?.stop(); } catch {}
                try { connection.pc.ontrack = null; connection.pc.onicecandidate = null; connection.pc.onconnectionstatechange = null; } catch {}
                try { connection.pc.close(); } catch {}
                delete voiceState.peers[peerId];
            }

            const remote = voiceState.remotes[peerId];
            if (remote?.audio) {
                try { remote.audio.pause(); remote.audio.srcObject = null; } catch {}
            }
            delete voiceState.remotes[peerId];
        }

        async function flushVoiceCandidates(peerId, connection) {
            if (!connection.pc.remoteDescription) return;
            const queued = connection.pendingCandidates.splice(0);
            for (const candidate of queued) {
                try { await connection.pc.addIceCandidate(candidate); } catch (error) { console.debug('Candidato ICE ignorado.', error); }
            }
        }

        async function handleVoiceSignal(peerId, data, connection) {
            if (voiceState.peers[peerId] !== connection || connection.pc.signalingState === 'closed') return;

            const me = voiceLocalKey();
            const remoteSession = connection.remoteSession;
            const offer = data.offer;
            const answer = data.answer;

            const offerKey = offer ? `${offer.session}:${offer.forSession}` : null;
            if (offer?.from === peerId && offer.session === remoteSession && offer.forSession === voiceState.sessionId && offer.description && connection.acceptedOffer !== offerKey) {
                connection.acceptedOffer = offerKey;
                await connection.pc.setRemoteDescription(offer.description);
                await flushVoiceCandidates(peerId, connection);
                const localAnswer = await connection.pc.createAnswer();
                await connection.pc.setLocalDescription(localAnswer);
                await safeUpdate(voicePairPath(peerId), {
                    answer: {
                        from: me,
                        session: voiceState.sessionId,
                        answerTo: offer.session,
                        description: connection.pc.localDescription.toJSON()
                    }
                });
            }

            if (answer?.from === peerId && answer.session === remoteSession && answer.answerTo === voiceState.sessionId && answer.description && !connection.acceptedAnswer) {
                connection.acceptedAnswer = answer.session;
                await connection.pc.setRemoteDescription(answer.description);
                await flushVoiceCandidates(peerId, connection);
            }

            const remoteCandidates = data.candidates?.[peerId]?.[remoteSession] || {};
            for (const [key, candidate] of Object.entries(remoteCandidates)) {
                if (connection.candidateKeys.has(key)) continue;
                connection.candidateKeys.add(key);
                if (connection.pc.remoteDescription) {
                    try { await connection.pc.addIceCandidate(candidate); } catch (error) { console.debug('Candidato ICE ignorado.', error); }
                } else {
                    connection.pendingCandidates.push(candidate);
                }
            }
        }

        async function connectVoicePeer(peerId) {
            if (!voiceState.started || !voiceState.participants[peerId]?.online || !voiceState.participants[peerId]?.sessionId || !voiceState.processedDestination) return;

            const remoteSession = voiceState.participants[peerId]?.sessionId;
            const existing = voiceState.peers[peerId];
            if (existing?.remoteSession === remoteSession) return;
            if (existing) closeVoicePeer(peerId);

            const sourceTrack = voiceState.processedDestination.stream.getAudioTracks()[0];
            if (!sourceTrack) return;

            const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS, iceCandidatePoolSize: 8 });
            const outboundTrack = sourceTrack.clone();
            const outboundStream = new MediaStream([outboundTrack]);
            const connection = {
                pc,
                outboundTrack,
                remoteSession,
                candidateKeys: new Set(),
                pendingCandidates: [],
                acceptedOffer: null,
                acceptedAnswer: null,
                signalQueue: Promise.resolve(),
                unsubscribe: null
            };

            voiceState.peers[peerId] = connection;
            pc.addTrack(outboundTrack, outboundStream);
            outboundTrack.enabled = voiceCanSendTo(peerId);

            pc.onicecandidate = event => {
                if (!event.candidate || voiceState.peers[peerId] !== connection) return;
                const key = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
                safeUpdate(`${voicePairPath(peerId)}/candidates/${voiceLocalKey()}/${voiceState.sessionId}`, {
                    [key]: event.candidate.toJSON()
                }).catch(error => console.warn('Falha ao enviar candidato ICE.', error));
            };

            pc.ontrack = event => attachRemoteVoice(peerId, event.streams[0]);
            pc.onconnectionstatechange = () => {
                updateVoiceConnectionSummary();
                renderVoiceParticipants();
            };

            connection.unsubscribe = onValue(dbRef(voicePairPath(peerId)), snapshot => {
                connection.signalQueue = connection.signalQueue
                    .then(() => handleVoiceSignal(peerId, snapshot.val() || {}, connection))
                    .catch(error => console.warn('Falha de sinalização de voz.', peerId, error));
            });

            if (voiceLocalKey() < peerId) {
                try {
                    await safeRemove(voicePairPath(peerId));
                    if (voiceState.peers[peerId] !== connection) return;
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    await safeUpdate(voicePairPath(peerId), {
                        offer: {
                            from: voiceLocalKey(),
                            session: voiceState.sessionId,
                            forSession: remoteSession,
                            description: pc.localDescription.toJSON()
                        }
                    });
                } catch (error) {
                    console.warn('Falha ao criar conexão de voz.', peerId, error);
                }
            }
        }

        function attachRemoteVoice(peerId, stream) {
            let audio = voiceState.remotes[peerId]?.audio;
            if (!audio) {
                audio = new Audio();
                audio.autoplay = true;
                audio.playsInline = true;
                voiceState.remotes[peerId] = { audio };
            }
            audio.srcObject = stream;
            updateRemoteAudibility();
            audio.play().catch(() => {
                setVoiceStatus('warning', 'Clique no painel para liberar áudio');
            });
            renderVoiceParticipants();
        }

        function updateVoiceSenders() {
            Object.entries(voiceState.peers).forEach(([peerId, connection]) => {
                if (connection.outboundTrack) connection.outboundTrack.enabled = voiceCanSendTo(peerId);
            });
            updateVoiceQuickControls();
        }

        function updateRemoteAudibility() {
            Object.entries(voiceState.remotes).forEach(([peerId, remote]) => {
                remote.audio.muted = !voiceCanHear(peerId);
                remote.audio.volume = clampVoiceNumber(voiceState.settings.volume, 0, 1, 1);
            });
            updateVoiceQuickControls();
        }

        function setVoiceLabStatus(state, message, countdown = '') {
            const status = document.getElementById('voice-lab-status');
            const text = document.getElementById('voice-lab-status-text');
            const timer = document.getElementById('voice-lab-countdown');
            if (status) status.dataset.state = state;
            if (text) text.textContent = message;
            if (timer) timer.textContent = countdown;
        }

        function updateVoiceLabUi() {
            const lab = document.getElementById('voice-lab');
            const calibrate = document.getElementById('voice-calibrate');
            const record = document.getElementById('voice-preview-record');
            const live = document.getElementById('voice-preview-live');
            if (!lab || !calibrate || !record || !live) return;

            const phase = voiceState.preview.phase;
            const callBusy = voiceState.started || ['connecting', 'disconnecting'].includes(voiceState.phase);
            const transitionBusy = ['starting', 'finalizing'].includes(phase);
            const recording = phase === 'recording';
            const calibrating = phase === 'calibrating';
            const liveActive = voiceState.preview.active && voiceState.preview.mode === 'live';

            lab.classList.toggle('is-disabled', callBusy);
            calibrate.disabled = callBusy || transitionBusy || recording || calibrating || liveActive;
            record.disabled = callBusy || transitionBusy || calibrating || liveActive;
            live.disabled = callBusy || transitionBusy || recording || calibrating;
            record.classList.toggle('is-recording', recording);
            live.classList.toggle('is-active', liveActive);
            record.textContent = recording ? 'Parar agora' : 'Gravar 5 s';
            live.textContent = liveActive ? 'Encerrar teste' : 'Ouvir ao vivo';

            if (voiceState.started && !voiceState.preview.active) {
                setVoiceLabStatus('idle', 'Desconecte da chamada para abrir uma prévia privada.');
            }
        }

        function describeVoiceMediaError(error) {
            if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') return 'Permissão do microfone negada pelo navegador.';
            if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') return 'Nenhum microfone foi encontrado.';
            if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') return 'O microfone está ocupado por outro aplicativo.';
            return 'Não foi possível iniciar o microfone neste navegador.';
        }

        function pauseVoicePreviewPlayback() {
            ['voice-preview-original', 'voice-preview-processed'].forEach(id => {
                const audio = document.getElementById(id);
                try { audio?.pause(); } catch {}
            });
        }

        function clearVoicePreviewResults() {
            pauseVoicePreviewPlayback();
            voiceState.preview.playbackUrls.forEach(url => URL.revokeObjectURL(url));
            voiceState.preview.playbackUrls = [];
            ['voice-preview-original', 'voice-preview-processed'].forEach(id => {
                const audio = document.getElementById(id);
                if (!audio) return;
                audio.removeAttribute('src');
                try { audio.load(); } catch {}
            });
            const results = document.getElementById('voice-preview-results');
            if (results) results.hidden = true;
        }

        function showVoicePreviewResults(originalBlob, processedBlob) {
            clearVoicePreviewResults();
            const original = document.getElementById('voice-preview-original');
            const processed = document.getElementById('voice-preview-processed');
            const results = document.getElementById('voice-preview-results');
            if (!original || !processed || !results) return;

            const originalUrl = URL.createObjectURL(originalBlob);
            const processedUrl = URL.createObjectURL(processedBlob);
            voiceState.preview.playbackUrls = [originalUrl, processedUrl];
            original.src = originalUrl;
            processed.src = processedUrl;
            results.hidden = false;
        }

        function clearVoicePreviewTimers() {
            if (voiceState.preview.stopTimer) clearTimeout(voiceState.preview.stopTimer);
            if (voiceState.preview.countdownTimer) clearInterval(voiceState.preview.countdownTimer);
            voiceState.preview.stopTimer = null;
            voiceState.preview.countdownTimer = null;
        }

        function createVoiceAudioContext() {
            const VoiceAudioContext = window.AudioContext || window.webkitAudioContext;
            if (!VoiceAudioContext) throw new Error('Web Audio indisponível.');
            try {
                return new VoiceAudioContext({ latencyHint: 'interactive' });
            } catch {
                return new VoiceAudioContext();
            }
        }

        async function acquireLocalVoiceMedia() {
            if (voiceState.localStream && voiceState.audioContext && voiceState.processedDestination) return;
            if (!navigator.mediaDevices?.getUserMedia) throw new Error('Captura de áudio indisponível.');

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: VOICE_CAPTURE_CONSTRAINTS,
                video: false
            });

            try {
                const context = createVoiceAudioContext();
                await context.resume();
                const destination = context.createMediaStreamDestination();
                try {
                    destination.channelCount = 1;
                    destination.channelCountMode = 'explicit';
                } catch {}
                voiceState.localStream = stream;
                voiceState.audioContext = context;
                voiceState.processedDestination = destination;
            } catch (error) {
                stream.getTracks().forEach(track => track.stop());
                throw error;
            }
        }

        async function releaseLocalVoiceMedia() {
            stopVoiceMeter();
            clearLocalVoiceGraph();
            try { voiceState.processedDestination?.stream.getTracks().forEach(track => track.stop()); } catch {}
            try { voiceState.localStream?.getTracks().forEach(track => track.stop()); } catch {}
            try { await voiceState.audioContext?.close(); } catch {}
            voiceState.localStream = null;
            voiceState.audioContext = null;
            voiceState.input = null;
            voiceState.processedDestination = null;
            voiceState.impulseCache = new Map();
        }

        async function stopVoicePreview(message = 'Prévia encerrada. Ninguém recebeu seu áudio.') {
            if (!voiceState.preview.active && !voiceState.localStream) return;
            voiceState.preview.taskId += 1;
            clearVoicePreviewTimers();
            voiceState.preview.phase = 'finalizing';
            updateVoiceLabUi();

            const recorders = voiceState.preview.recorders.splice(0);
            recorders.forEach(entry => {
                entry.finished.catch(() => {});
                try {
                    if (entry.recorder.state !== 'inactive') entry.recorder.stop();
                } catch {}
            });

            voiceState.preview.active = false;
            voiceState.preview.mode = 'idle';
            await releaseLocalVoiceMedia();
            voiceState.preview.phase = 'idle';
            setVoiceLabStatus('idle', message);
            updateVoiceQuickControls();
        }

        async function startVoicePreviewSession(mode) {
            if (voiceState.started || ['connecting', 'disconnecting'].includes(voiceState.phase)) return false;
            if (voiceState.preview.active) await stopVoicePreview();

            const taskId = ++voiceState.preview.taskId;
            voiceState.preview.phase = 'starting';
            voiceState.preview.mode = mode;
            setVoiceLabStatus('starting', 'Abrindo o microfone somente neste computador…');
            updateVoiceQuickControls();

            try {
                await acquireLocalVoiceMedia();
                if (taskId !== voiceState.preview.taskId || voiceState.started) {
                    await releaseLocalVoiceMedia();
                    voiceState.preview.mode = 'idle';
                    voiceState.preview.phase = 'idle';
                    return false;
                }
                voiceState.preview.active = true;
                const graphReady = await buildLocalVoiceGraph();
                if (!graphReady || taskId !== voiceState.preview.taskId || !voiceState.preview.active) {
                    voiceState.preview.active = false;
                    voiceState.preview.mode = 'idle';
                    voiceState.preview.phase = 'idle';
                    await releaseLocalVoiceMedia();
                    return false;
                }
                voiceState.preview.phase = mode === 'live' ? 'live' : 'ready';
                updateVoiceQuickControls();
                return true;
            } catch (error) {
                console.error('Falha ao iniciar a prévia privada.', error);
                voiceState.preview.active = false;
                voiceState.preview.mode = 'idle';
                voiceState.preview.phase = 'idle';
                await releaseLocalVoiceMedia();
                setVoiceLabStatus('error', describeVoiceMediaError(error));
                updateVoiceQuickControls();
                return false;
            }
        }

        function selectVoiceRecorderMimeType() {
            if (!window.MediaRecorder) return '';
            const candidates = [
                'audio/webm;codecs=opus',
                'audio/ogg;codecs=opus',
                'audio/mp4'
            ];
            return candidates.find(type => MediaRecorder.isTypeSupported?.(type)) || '';
        }

        function createVoiceRecorder(stream) {
            const mimeType = selectVoiceRecorderMimeType();
            const options = mimeType ? { mimeType, audioBitsPerSecond: 96000 } : { audioBitsPerSecond: 96000 };
            const recorder = new MediaRecorder(stream, options);
            const chunks = [];
            let settled = false;
            let resolveFinished;
            let rejectFinished;
            const finished = new Promise((resolve, reject) => {
                resolveFinished = resolve;
                rejectFinished = reject;
            });

            recorder.ondataavailable = event => {
                if (event.data?.size) chunks.push(event.data);
            };
            recorder.onerror = event => {
                if (settled) return;
                settled = true;
                rejectFinished(event.error || new Error('Falha ao gravar a prévia.'));
            };
            recorder.onstop = () => {
                if (settled) return;
                settled = true;
                resolveFinished(new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' }));
            };
            return { recorder, finished };
        }

        async function finishVoiceRecording() {
            if (voiceState.preview.phase !== 'recording') return;
            clearVoicePreviewTimers();
            voiceState.preview.phase = 'finalizing';
            setVoiceLabStatus('starting', 'Preparando a comparação local…');
            updateVoiceQuickControls();

            const entries = voiceState.preview.recorders.splice(0);
            entries.forEach(entry => {
                try {
                    if (entry.recorder.state !== 'inactive') entry.recorder.stop();
                } catch {}
            });

            const recordings = await Promise.allSettled(entries.map(entry => entry.finished));
            voiceState.preview.active = false;
            voiceState.preview.mode = 'idle';
            await releaseLocalVoiceMedia();
            voiceState.preview.phase = 'idle';

            const originalBlob = recordings[0]?.status === 'fulfilled' ? recordings[0].value : null;
            const processedBlob = recordings[1]?.status === 'fulfilled' ? recordings[1].value : null;
            if (originalBlob?.size && processedBlob?.size) {
                showVoicePreviewResults(originalBlob, processedBlob);
                setVoiceLabStatus('ready', 'Gravações prontas. Compare “Original” e “Com efeitos”.');
            } else {
                setVoiceLabStatus('error', 'O navegador não conseguiu finalizar a gravação local.');
            }
            updateVoiceQuickControls();
        }

        async function startVoiceRecording() {
            if (voiceState.preview.phase === 'recording') {
                await finishVoiceRecording();
                return;
            }
            if (!window.MediaRecorder) {
                setVoiceLabStatus('error', 'Este navegador não oferece gravação local; use “Ouvir ao vivo”.');
                return;
            }

            clearVoicePreviewResults();
            const ready = await startVoicePreviewSession('recording');
            if (!ready) return;

            try {
                voiceState.preview.phase = 'starting';
                setVoiceLabStatus('starting', 'Preparando a gravação local…');
                updateVoiceQuickControls();
                await new Promise(resolve => setTimeout(resolve, 320));
                const rawStream = new MediaStream(voiceState.localStream.getAudioTracks());
                const processedStream = new MediaStream(voiceState.processedDestination.stream.getAudioTracks());
                const originalRecorder = createVoiceRecorder(rawStream);
                const processedRecorder = createVoiceRecorder(processedStream);
                voiceState.preview.recorders = [originalRecorder, processedRecorder];
                originalRecorder.recorder.start(200);
                processedRecorder.recorder.start(200);
                voiceState.preview.phase = 'recording';

                let remaining = VOICE_PREVIEW_SECONDS;
                setVoiceLabStatus('recording', 'Gravando somente neste computador…', `${remaining} s`);
                voiceState.preview.countdownTimer = setInterval(() => {
                    remaining = Math.max(0, remaining - 1);
                    setVoiceLabStatus('recording', 'Gravando somente neste computador…', `${remaining} s`);
                }, 1000);
                voiceState.preview.stopTimer = setTimeout(() => finishVoiceRecording(), VOICE_PREVIEW_SECONDS * 1000);
                updateVoiceQuickControls();
            } catch (error) {
                console.error('Falha ao gravar a prévia.', error);
                await stopVoicePreview('A gravação foi encerrada sem transmitir áudio.');
                setVoiceLabStatus('error', 'Não foi possível gravar neste navegador.');
            }
        }

        async function toggleLiveVoicePreview() {
            if (voiceState.preview.active && voiceState.preview.mode === 'live') {
                await stopVoicePreview();
                return;
            }
            pauseVoicePreviewPlayback();
            const ready = await startVoicePreviewSession('live');
            if (!ready) return;
            const fallback = effectiveVoiceCharacter() !== 'natural' && voiceState.effectCapability === 'basic';
            setVoiceLabStatus(
                'live',
                fallback
                    ? 'Prévia privada ativa; este navegador está usando o modo de timbre compatível.'
                    : 'Prévia privada ativa. Somente você está ouvindo.'
            );
            updateVoiceQuickControls();
        }

        function estimateVoiceFundamental(samples, sampleRate) {
            let mean = 0;
            for (const sample of samples) mean += sample;
            mean /= samples.length;

            let energy = 0;
            for (const sample of samples) {
                const centered = sample - mean;
                energy += centered * centered;
            }
            const rms = Math.sqrt(energy / samples.length);
            if (rms < .012) return null;

            const minLag = Math.max(2, Math.floor(sampleRate / 420));
            const maxLag = Math.min(samples.length - 2, Math.ceil(sampleRate / 65));
            const correlations = new Float32Array(maxLag + 1);
            let bestLag = -1;
            let bestCorrelation = 0;

            for (let lag = minLag; lag <= maxLag; lag++) {
                let dot = 0;
                let normA = 0;
                let normB = 0;
                const count = samples.length - lag;
                for (let index = 0; index < count; index += 2) {
                    const a = samples[index] - mean;
                    const b = samples[index + lag] - mean;
                    dot += a * b;
                    normA += a * a;
                    normB += b * b;
                }
                const correlation = dot / Math.sqrt(Math.max(1e-12, normA * normB));
                correlations[lag] = correlation;
                if (correlation > bestCorrelation) {
                    bestCorrelation = correlation;
                    bestLag = lag;
                }
            }

            if (bestLag < 0 || bestCorrelation < .56) return null;
            const acceptance = Math.max(.62, bestCorrelation * .9);
            for (let lag = minLag + 1; lag < bestLag; lag++) {
                if (correlations[lag] >= acceptance && correlations[lag] >= correlations[lag - 1] && correlations[lag] >= correlations[lag + 1]) {
                    bestLag = lag;
                    break;
                }
            }

            const left = correlations[Math.max(minLag, bestLag - 1)];
            const center = correlations[bestLag];
            const right = correlations[Math.min(maxLag, bestLag + 1)];
            const denominator = left - 2 * center + right;
            const offset = Math.abs(denominator) > 1e-6 ? .5 * (left - right) / denominator : 0;
            const frequency = sampleRate / (bestLag + clampVoiceNumber(offset, -.5, .5, 0));
            return normalizeVoiceCalibration(frequency);
        }

        async function calibrateVoiceCharacter() {
            const ready = await startVoicePreviewSession('calibrating');
            if (!ready) return;

            const taskId = voiceState.preview.taskId;
            voiceState.preview.phase = 'calibrating';
            const pitches = [];
            const pitchSamples = voiceState.meterAnalyser
                ? new Float32Array(voiceState.meterAnalyser.fftSize)
                : null;
            const deadline = performance.now() + 3000;
            setVoiceLabStatus('calibrating', 'Fale normalmente até a calibração terminar…', '3 s');
            updateVoiceQuickControls();

            while (performance.now() < deadline && taskId === voiceState.preview.taskId && voiceState.preview.active) {
                await new Promise(resolve => setTimeout(resolve, 90));
                const analyser = voiceState.meterAnalyser;
                if (!analyser || !pitchSamples) continue;
                analyser.getFloatTimeDomainData(pitchSamples);
                const pitch = estimateVoiceFundamental(pitchSamples, voiceState.audioContext.sampleRate);
                if (pitch) pitches.push(pitch);
                const seconds = Math.max(1, Math.ceil((deadline - performance.now()) / 1000));
                setVoiceLabStatus('calibrating', 'Fale normalmente até a calibração terminar…', `${seconds} s`);
            }

            if (taskId !== voiceState.preview.taskId) return;
            voiceState.preview.active = false;
            voiceState.preview.mode = 'idle';
            await releaseLocalVoiceMedia();
            voiceState.preview.phase = 'idle';

            if (pitches.length >= 6) {
                pitches.sort((a, b) => a - b);
                const middle = Math.floor(pitches.length / 2);
                const median = pitches.length % 2 ? pitches[middle] : (pitches[middle - 1] + pitches[middle]) / 2;
                voiceState.settings.calibrationHz = normalizeVoiceCalibration(median);
                saveVoiceSettings();
                setVoiceLabStatus('ready', `Calibração concluída em ${Math.round(voiceState.settings.calibrationHz)} Hz.`);
            } else {
                setVoiceLabStatus('error', 'Não detectei fala suficiente. Aproxime-se do microfone e tente novamente.');
            }
            updateVoiceQuickControls();
        }

        async function startVoicePrototype() {
            if (voiceState.started || voiceState.phase === 'connecting') return;
            if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
                voiceState.phase = 'error';
                updateVoiceQuickControls();
                return;
            }

            voiceState.phase = 'connecting';
            updateVoiceQuickControls();

            try {
                pauseVoicePreviewPlayback();
                if (voiceState.preview.active || voiceState.localStream) await stopVoicePreview();
                await acquireLocalVoiceMedia();
                voiceState.sessionId = voiceSessionId();
                voiceState.started = true;
                const graphReady = await buildLocalVoiceGraph();
                if (!graphReady || !voiceState.processedDestination.stream.getAudioTracks()[0]) {
                    throw new Error('O processamento de áudio não iniciou corretamente.');
                }

                const participantPath = `${VOICE_PATH}/participants/${voiceLocalKey()}`;
                voiceState.presenceDisconnect = onDisconnect(dbRef(participantPath));
                await voiceState.presenceDisconnect.remove();
                await safeUpdate(participantPath, {
                    nome: usuarioAtual.nome,
                    cargo: usuarioAtual.cargo,
                    online: true,
                    sessionId: voiceState.sessionId,
                    updatedAt: Date.now()
                });

                voiceState.phase = 'online';
                onlineVoicePeerIds().forEach(id => connectVoicePeer(id));
                updateVoiceSenders();
                updateRemoteAudibility();
                renderVoiceParticipants();
                setVoiceLabStatus('idle', 'Desconecte da chamada para abrir uma prévia privada.');
            } catch (error) {
                console.error('Não foi possível iniciar a voz.', error);
                voiceState.started = false;
                voiceState.phase = 'error';
                try { await voiceState.presenceDisconnect?.cancel(); } catch {}
                voiceState.presenceDisconnect = null;
                try { await safeRemove(`${VOICE_PATH}/participants/${voiceLocalKey()}`); } catch {}
                await releaseLocalVoiceMedia();
                setVoiceLabStatus('error', describeVoiceMediaError(error));
                updateVoiceQuickControls();
                renderVoiceParticipants();
            }
        }

        async function disconnectVoicePrototype() {
            if (voiceState.phase === 'disconnecting') return;
            voiceState.phase = 'disconnecting';
            voiceState.started = false;
            updateVoiceQuickControls();

            try { await voiceState.presenceDisconnect?.cancel(); } catch {}
            voiceState.presenceDisconnect = null;

            const cleanup = [safeRemove(`${VOICE_PATH}/participants/${voiceLocalKey()}`)];
            voicePeerIds().forEach(peerId => cleanup.push(safeRemove(voicePairPath(peerId))));
            Object.keys(voiceState.peers).forEach(closeVoicePeer);

            await Promise.allSettled(cleanup);
            await releaseLocalVoiceMedia();
            voiceState.sessionId = null;
            voiceState.phase = 'offline';
            setVoiceLabStatus('idle', 'Pronto para uma prévia sem transmissão.');
            updateVoiceQuickControls();
            renderVoiceParticipants();
        }

        function createVoiceActionButton(label, active, onClick, options = {}) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'voice-action-button';
            button.textContent = label;
            button.classList.toggle('is-active', !!active && !options.danger);
            button.classList.toggle('is-off', !active && !options.danger);
            button.classList.toggle('is-danger', !!options.danger);
            button.disabled = !!options.disabled;
            button.setAttribute('aria-pressed', String(!!active));
            if (options.title) button.title = options.title;
            button.onclick = onClick;
            return button;
        }

        function voiceParticipantStatus(id) {
            if (id === voiceLocalKey()) return voiceState.started ? 'Microfone conectado' : 'Fora da chamada';
            if (!voiceState.participants[id]?.online || !voiceState.participants[id]?.sessionId) return 'Fora da chamada';
            const state = voiceState.peers[id]?.pc.connectionState;
            if (state === 'connected') return 'Na chamada';
            if (state === 'failed' || state === 'disconnected') return 'Falha de conexão';
            return 'Conectando…';
        }

        async function setMasterSpeakBlocked(id, blocked) {
            const previous = !!voiceState.masterPolicy.blockedSpeak?.[id];
            voiceState.masterPolicy.blockedSpeak ||= {};
            voiceState.masterPolicy.blockedSpeak[id] = blocked;
            renderVoiceParticipants();
            try {
                await safeUpdate(`${VOICE_PATH}/masterPolicy/blockedSpeak`, { [id]: blocked ? true : null });
            } catch (error) {
                voiceState.masterPolicy.blockedSpeak[id] = previous;
                renderVoiceParticipants();
                console.warn('Não foi possível alterar o microfone do participante.', error);
            }
        }

        function renderVoiceParticipants() {
            const box = document.getElementById('voice-participants');
            if (!box || !usuarioAtual) return;
            box.textContent = '';

            VOICE_USERS.forEach(id => {
                const self = id === voiceLocalKey();
                const online = self ? voiceState.started : !!(voiceState.participants[id]?.online && voiceState.participants[id]?.sessionId);
                const card = document.createElement('article');
                const identity = document.createElement('div');
                const avatar = document.createElement('span');
                const text = document.createElement('div');
                const name = document.createElement('strong');
                const status = document.createElement('small');

                card.className = 'voice-card';
                card.classList.toggle('is-online', online);
                card.classList.toggle('is-self', self);
                identity.className = 'voice-card__identity';
                avatar.className = 'voice-card__avatar';
                text.className = 'voice-card__text';
                avatar.textContent = voiceName(id).slice(0, 1).toUpperCase();
                name.textContent = `${voiceName(id)}${self ? ' (você)' : ''}`;
                status.textContent = voiceParticipantStatus(id);
                text.append(name, status);
                identity.append(avatar, text);
                card.append(identity);

                if (!self) {
                    const actions = document.createElement('div');
                    actions.className = 'voice-card__actions';

                    const hears = voiceCanHear(id);
                    const hearDisabled = voiceState.settings.deafened;
                    actions.append(createVoiceActionButton(
                        hears ? 'Ouvindo' : 'Não ouvir',
                        hears,
                        () => {
                            voiceState.settings.hear[id] = voiceState.settings.hear[id] === false;
                            saveVoiceSettings();
                            updateRemoteAudibility();
                            renderVoiceParticipants();
                        },
                        { disabled: hearDisabled, title: hearDisabled ? 'O áudio recebido está desligado globalmente.' : 'Alternar o áudio desta pessoa.' }
                    ));

                    const sends = voiceCanSendTo(id);
                    const forcedMute = !!voiceState.masterPolicy.blockedSpeak?.[voiceLocalKey()];
                    const whisperBlocks = voiceState.settings.whisperMaster && id !== 'dick';
                    const sendDisabled = voiceState.settings.muted || forcedMute || whisperBlocks || !voiceState.started;
                    actions.append(createVoiceActionButton(
                        sends ? 'Recebe minha voz' : 'Sem minha voz',
                        sends,
                        () => {
                            voiceState.settings.speakTo[id] = voiceState.settings.speakTo[id] === false;
                            saveVoiceSettings();
                            updateVoiceSenders();
                            renderVoiceParticipants();
                        },
                        { disabled: sendDisabled, title: whisperBlocks ? 'O sussurro ao Mestre está ativo.' : 'Alternar o envio da sua voz para esta pessoa.' }
                    ));

                    if (usuarioAtual.cargo === 'Mestre') {
                        const blocked = !!voiceState.masterPolicy.blockedSpeak?.[id];
                        actions.append(createVoiceActionButton(
                            blocked ? 'Silenciado na mesa' : 'Pode falar',
                            !blocked,
                            () => setMasterSpeakBlocked(id, !blocked),
                            { danger: blocked, title: 'Silenciar ou liberar o microfone desta pessoa para todos.' }
                        ));
                    }

                    card.append(actions);
                }

                box.append(card);
            });

            updateVoiceConnectionSummary();
        }

        function resetPersonalVoiceSettings() {
            Object.assign(voiceState.settings, {
                muted: false,
                deafened: false,
                volume: 1,
                character: 'natural',
                environment: 'normal',
                hear: {},
                speakTo: {},
                whisperMaster: false
            });
            saveVoiceSettings();
            applyLocalVoiceGraph();
            updateVoiceSenders();
            updateRemoteAudibility();
            renderVoiceParticipants();
        }

        function buildVoiceUi() {
            const panel = document.getElementById('voice-panel');
            if (!panel || !usuarioAtual) return;
            panel.hidden = false;

            document.getElementById('voice-panel-toggle').onclick = () => toggleVoiceDrawer();
            document.getElementById('voice-start').onclick = () => voiceState.started ? disconnectVoicePrototype() : startVoicePrototype();
            document.getElementById('voice-mute').onclick = () => {
                voiceState.settings.muted = !voiceState.settings.muted;
                saveVoiceSettings();
                updateVoiceSenders();
                renderVoiceParticipants();
            };
            document.getElementById('voice-deafen').onclick = () => {
                voiceState.settings.deafened = !voiceState.settings.deafened;
                saveVoiceSettings();
                updateRemoteAudibility();
                renderVoiceParticipants();
            };
            document.getElementById('voice-whisper-master').onclick = () => {
                voiceState.settings.whisperMaster = !voiceState.settings.whisperMaster;
                saveVoiceSettings();
                updateVoiceSenders();
                renderVoiceParticipants();
            };
            document.getElementById('voice-character').onchange = event => {
                voiceState.settings.character = VOICE_CHARACTERS[event.target.value] ? event.target.value : 'natural';
                saveVoiceSettings();
                applyLocalVoiceGraph();
                updateVoiceQuickControls();
            };
            document.getElementById('voice-environment').onchange = event => {
                voiceState.settings.environment = VOICE_ENVIRONMENTS[event.target.value] ? event.target.value : 'normal';
                saveVoiceSettings();
                applyLocalVoiceGraph();
                updateVoiceQuickControls();
            };
            document.getElementById('voice-calibrate').onclick = calibrateVoiceCharacter;
            document.getElementById('voice-preview-record').onclick = startVoiceRecording;
            document.getElementById('voice-preview-live').onclick = toggleLiveVoicePreview;
            document.getElementById('voice-master-volume').oninput = event => {
                voiceState.settings.volume = clampVoiceNumber(event.target.value, 0, 1, 1);
                saveVoiceSettings();
                updateRemoteAudibility();
            };
            document.getElementById('voice-reset').onclick = resetPersonalVoiceSettings;
            document.getElementById('voice-scene-cave').onclick = async () => {
                await safeUpdate(`${VOICE_PATH}/masterPolicy`, { scene: 'cave', overrides: null });
            };
            document.getElementById('voice-scene-clear').onclick = async () => {
                await safeUpdate(`${VOICE_PATH}/masterPolicy`, { scene: 'normal', overrides: null });
            };
            document.getElementById('voice-master-unmute-all').onclick = async () => {
                await safeUpdate(`${VOICE_PATH}/masterPolicy`, { blockedSpeak: null, blockedHear: null, isolated: null });
            };

            updateVoiceQuickControls();
            renderVoiceParticipants();
        }

        function syncVoicePeersWithPresence() {
            if (!voiceState.started) {
                renderVoiceParticipants();
                return;
            }

            voicePeerIds().forEach(peerId => {
                const participant = voiceState.participants[peerId];
                const connection = voiceState.peers[peerId];
                if (!participant?.online || !participant?.sessionId) {
                    if (connection) closeVoicePeer(peerId);
                    return;
                }
                if (connection && connection.remoteSession !== participant.sessionId) closeVoicePeer(peerId);
                connectVoicePeer(peerId);
            });

            renderVoiceParticipants();
        }

        function initVoicePrototype() {
            loadVoiceSettings();
            buildVoiceUi();
            toggleVoiceDrawer(false);
            preloadVoiceAssets();
            if (voiceState.initialized) return;
            voiceState.initialized = true;

            voiceState.roomUnsubscribers.push(onValue(dbRef(`${VOICE_PATH}/participants`), snapshot => {
                voiceState.participants = snapshot.val() || {};
                syncVoicePeersWithPresence();
            }));

            voiceState.roomUnsubscribers.push(onValue(dbRef(`${VOICE_PATH}/masterPolicy`), snapshot => {
                const policy = snapshot.val() || {};
                voiceState.masterPolicy = {
                    blockedSpeak: policy.blockedSpeak || {},
                    blockedHear: policy.blockedHear || {},
                    isolated: policy.isolated || {},
                    scene: policy.scene || 'normal',
                    overrides: policy.overrides || {}
                };
                applyLocalVoiceGraph();
                updateVoiceSenders();
                updateRemoteAudibility();
                renderVoiceParticipants();
            }));

            window.addEventListener('beforeunload', () => {
                clearVoicePreviewTimers();
                clearVoicePreviewResults();
                try { voiceState.localStream?.getTracks().forEach(track => track.stop()); } catch {}
                Object.keys(voiceState.peers).forEach(closeVoicePeer);
            });
        }
