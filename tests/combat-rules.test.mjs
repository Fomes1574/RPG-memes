import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));
const repoDir = dirname(testDir);
const script = readFileSync(join(repoDir, "script.js"), "utf8");

const catalogMatch = script.match(/const HABILIDADES_SISTEMA = (\{[\s\S]*?\})\s*;\s*\/\/ Enriquece/);
assert.ok(catalogMatch, "Catálogo HABILIDADES_SISTEMA não encontrado");
const habilidades = Function(`"use strict"; return (${catalogMatch[1]});`)();

test("habilidades narrativas foram convertidas em passivas sem efeito mecânico", () => {
    for(const [grupo, id] of [
        ["Humanos", "hum_adaptavel"],
        ["Halfling", "hal_sorte"],
        ["Druida", "dru_forma"]
    ]) {
        assert.equal(habilidades[grupo][id].tipo, "passiva");
        assert.equal(habilidades[grupo][id].categoriaPassiva, "narrativa");
        assert.equal(habilidades[grupo][id].effectKind, "passiva");
    }
});

test("custos e efeitos das ativas nativas seguem as regras consolidadas", () => {
    assert.deepEqual(
        {
            orc: [habilidades.Orc.orc_furia.freeAction, habilidades.Orc.orc_furia.oncePerCombat, habilidades.Orc.orc_furia.combatEffect],
            postura: [habilidades.Guerreiro.guer_postura.freeAction, habilidades.Guerreiro.guer_postura.oncePerCombat, habilidades.Guerreiro.guer_postura.combatEffect],
            paladino: [habilidades.Paladino.pal_cura.mana, habilidades.Paladino.pal_cura.formula, habilidades.Paladino.pal_cura.targetMode],
            barbaro: [habilidades.Bárbaro.bar_furia.freeAction, habilidades.Bárbaro.bar_furia.oncePerCombat, habilidades.Bárbaro.bar_furia.combatEffect],
            curaMaior: [habilidades.Curandeiro.cur_cura.mana, habilidades.Curandeiro.cur_cura.formula],
            purificacao: [habilidades.Curandeiro.cur_purificacao.mana, habilidades.Curandeiro.cur_purificacao.effectKind],
            protecao: [habilidades.Curandeiro.cur_protecao.mana, habilidades.Curandeiro.cur_protecao.effectKind],
            ki: [habilidades.Monge.mon_ki.mana, habilidades.Monge.mon_ki.combatEffect]
        },
        {
            orc: [true, true, "orc_furia"],
            postura: [true, true, "guer_postura"],
            paladino: [5, "1d8+CAR", "ally"],
            barbaro: [true, true, "bar_furia"],
            curaMaior: [5, "2d8+SAB"],
            purificacao: [5, "purificacao"],
            protecao: [12, "buff_grupo"],
            ki: [0, "mon_ki"]
        }
    );
});

test("passivas numéricas declaram atributos, regenerações, dano e Ações", () => {
    assert.deepEqual(habilidades.Gnomo.gno_mente.attributeBonus, { per: 2 });
    assert.deepEqual(habilidades.Khajiit.kha_sentidos.attributeBonus, { per: 2 });
    assert.deepEqual(habilidades.Argoniano.arg_anfibio.attributeBonus, { des: 2 });
    assert.equal(habilidades.Khajiit.kha_garras.basicAttackDamage, 2);
    assert.equal(habilidades.Argoniano.arg_regeneracao.turnHpRegen, 2);
    assert.equal(habilidades.Bárbaro.bar_resistencia.basicAttackReduction, 1);
    assert.equal(habilidades.Mago.mag_mana.turnManaRegen, 2);
    assert.equal(habilidades.Monge.mon_golpes.actionMax, 2);
});

test("o fim do turno consome apenas a oportunidade de Fúria ainda não usada", () => {
    const inicio = script.indexOf("function processarEfeitosNoFimDoTurno");
    const fim = script.indexOf("\n\n        async function ativarCombateComIniciativa", inicio);
    assert.ok(inicio >= 0 && fim > inicio, "Função de duração de Fúria não encontrada");
    const fonte = script.slice(inicio, fim);
    const processar = Function(`
        const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
        ${fonte}
        return processarEfeitosNoFimDoTurno;
    `)();
    const token = "combate:7:jogador";
    const efeitos = {
        consumida: { ancoraDuracao: "dono", cargasMaximas: 2, cargasRestantes: 1, turnosRestantes: 2, ultimoTurnoConsumido: token, ultimoTurnoDuracao: "" },
        perdida: { ancoraDuracao: "dono", cargasMaximas: 2, cargasRestantes: 2, turnosRestantes: 2, ultimoTurnoConsumido: "", ultimoTurnoDuracao: "" },
        postura: { ancoraDuracao: "dono", cargasMaximas: 0, turnosRestantes: 2, ultimoTurnoDuracao: "" }
    };
    const resultado = processar(efeitos, "gomes", token, true);
    assert.equal(resultado.consumida.cargasRestantes, 1, "não pode gastar duas cargas no mesmo turno");
    assert.equal(resultado.perdida.cargasRestantes, 1, "turno sem ataque perde uma oportunidade");
    assert.equal(resultado.postura.turnosRestantes, 2, "Postura expira no início do turno, não no fim");
});

test("ativas sem metadados explícitos não recebem dano como fallback", () => {
    const inicio = script.indexOf("function inferirTipoEfeito");
    const fim = script.indexOf("\n\n        function normalizeHabV1", inicio);
    assert.match(script.slice(inicio, fim), /return 'utilidade';/);
    assert.doesNotMatch(script.slice(inicio, fim), /return 'dano';\s*\}/);
});

test("efeitos genéricos avançam no turno, revertem atributos e expiram", () => {
    const inicio = script.indexOf("function avancarEfeitosGenericosNoTurno");
    const fim = script.indexOf("\n\n        async function processarInicioTurnoIndividual", inicio);
    assert.ok(inicio >= 0 && fim > inicio, "Processador de efeitos genéricos não encontrado");
    const avancar = Function(`
        const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
        ${script.slice(inicio, fim)}
        return avancarEfeitosGenericosNoTurno;
    `)();

    const resultado = avancar([
        { idUnico: 1, nome: "Bênção", modHp: 2, turnos: 2, attrDestino: "", modAttr: 0 },
        { idUnico: 2, nome: "Veneno", modHp: -3, turnos: 1, attrDestino: "", modAttr: 0 },
        { idUnico: 3, nome: "Fraqueza", modHp: 0, turnos: 1, attrDestino: "for", modAttr: -2 }
    ]);

    assert.equal(resultado.deltaHp, -1);
    assert.equal(resultado.deltaMana, 0);
    assert.deepEqual(resultado.efeitos.map(efeito => [efeito.nome, efeito.turnos]), [["Bênção", 1]]);
    assert.deepEqual(resultado.reversoesAtributos, { for: -2 });
    assert.deepEqual(resultado.expirados, ["Veneno", "Fraqueza"]);
});

test("Fúrias ativadas em rodadas diferentes conservam barras independentes", () => {
    const inicio = script.indexOf("function consumirBonusDanoDeEfeitos");
    const fim = script.indexOf("\n\n        async function ativarCombateComIniciativa", inicio);
    assert.ok(inicio >= 0 && fim > inicio, "Consumidor de bônus de Fúria não encontrado");
    const consumir = Function(`
        const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
        ${script.slice(inicio, fim)}
        return consumirBonusDanoDeEfeitos;
    `)();

    const turno = "combate:11:orc-barbaro";
    const primeira = consumir({
        orc_furia: { nome: "Fúria Orc", bonusDano: 4, cargasRestantes: 1, turnosRestantes: 1, ultimoTurnoConsumido: "turno-anterior" },
        bar_furia: { nome: "Fúria Bárbara", bonusDano: 2, cargasRestantes: 2, turnosRestantes: 2, ultimoTurnoConsumido: "" }
    }, turno, "dano");

    assert.deepEqual(primeira.bonusOfensivos, [
        { nome: "Fúria Orc", valor: 4 },
        { nome: "Fúria Bárbara", valor: 2 }
    ]);
    assert.equal(primeira.efeitos.orc_furia, undefined, "a primeira Fúria deve terminar");
    assert.equal(primeira.efeitos.bar_furia.cargasRestantes, 1, "a segunda Fúria deve continuar pela metade");

    const segundoAtaqueMesmoTurno = consumir(primeira.efeitos, turno, "dano");
    assert.deepEqual(segundoAtaqueMesmoTurno.bonusOfensivos, [], "o segundo ataque do Monge não pode consumir outra oportunidade");
    assert.equal(segundoAtaqueMesmoTurno.efeitos.bar_furia.cargasRestantes, 1);

    const proximoTurno = consumir(segundoAtaqueMesmoTurno.efeitos, "combate:12:orc-barbaro", "dano");
    assert.deepEqual(proximoTurno.bonusOfensivos, [{ nome: "Fúria Bárbara", valor: 2 }]);
    assert.equal(proximoTurno.efeitos.bar_furia, undefined);
});

test("reduções diferentes acumulam separadamente antes do escudo e nunca curam", () => {
    const inicio = script.indexOf("function getReducoesDano");
    const fim = script.indexOf("\n\n        function aplicarEfeitoVidaDados", inicio);
    assert.ok(inicio >= 0 && fim > inicio, "Calculador de dano não encontrado");
    const calcular = Function(`
        const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
        const clamp = (value, min, max) => Math.max(min, Math.min(max, toNumber(value, min)));
        const getCombateIdAtivo = () => "combate";
        const getEfeitosCombateAtivos = (dados) => dados.combate?.efeitos || {};
        const getHpMaxEfetivo = () => 20;
        ${script.slice(inicio, fim)}
        return calcularEfeitoVidaResultado;
    `)();

    const guerreiro = calcular({
        classe: "Guerreiro",
        "hp-atual": 20,
        escudo: 0,
        combate: { efeitos: {
            postura: { id: "postura", nome: "Postura Defensiva", reducaoDano: 3 },
            protecao: { id: "protecao", nome: "Proteção Espiritual", reducaoDano: 2 }
        } }
    }, 9, "dano", "fichas/guerreiro", { tipoAtaque: "basico", combateId: "combate" });
    assert.equal(guerreiro.meta.reducaoTotal, 5);
    assert.equal(guerreiro.meta.danoHp, 4);
    assert.equal(guerreiro.dadosAtualizados["hp-atual"], 16);

    const barbaro = calcular({
        classe: "Bárbaro",
        "hp-atual": 20,
        escudo: 3,
        combate: { efeitos: {
            furia: { id: "furia", nome: "Fúria Bárbara", reducaoDano: 2 },
            protecao: { id: "protecao", nome: "Proteção Espiritual", reducaoDano: 2 }
        } }
    }, 9, "dano", "fichas/barbaro", { tipoAtaque: "basico", combateId: "combate" });
    assert.equal(barbaro.meta.reducaoTotal, 5, "Resistência Brutal, Fúria e Proteção devem somar 5");
    assert.equal(barbaro.meta.escudoAbsorvido, 3);
    assert.equal(barbaro.meta.danoHp, 1);
    assert.equal(barbaro.dadosAtualizados["hp-atual"], 19);

    const anulado = calcular({
        classe: "Guerreiro",
        "hp-atual": 10,
        escudo: 0,
        combate: { efeitos: { postura: { nome: "Postura Defensiva", reducaoDano: 3 } } }
    }, 2, "dano", "fichas/guerreiro", { tipoAtaque: "basico", combateId: "combate" });
    assert.equal(anulado.meta.reducaoTotal, 2);
    assert.equal(anulado.meta.danoHp, 0);
    assert.equal(anulado.dadosAtualizados["hp-atual"], 10);
});

test("toda técnica ativa da árvore é normalizada para uma Ação", () => {
    const inicioEntrada = script.lastIndexOf("function criarEntradaGrimorioDaArvore");
    const fimEntrada = script.indexOf("\n\n        function gerarConexoesArvore", inicioEntrada);
    const inicioChips = script.indexOf("function renderSkillEffectChips");
    const fimChips = script.indexOf("\n\n        function renderPathComparison", inicioChips);
    assert.ok(inicioEntrada >= 0 && fimEntrada > inicioEntrada);
    assert.ok(inicioChips >= 0 && fimChips > inicioChips);
    assert.match(script.slice(inicioEntrada, fimEntrada), /ap: skill\.grimorioTipo === "ativa" \? 1 : 0/);
    assert.match(script.slice(inicioChips, fimChips), /skill\.grimorioTipo === "ativa"/);
    assert.doesNotMatch(script.slice(inicioChips, fimChips), /\$\{skill\.ap\}/);
});

test("o piso permanente dos atributos não apaga debuffs temporários", () => {
    const inicio = script.indexOf("function getModificadoresAtributosEfeitos");
    const fim = script.indexOf("\n\n        function getAcoesMaximas", inicio);
    assert.ok(inicio >= 0 && fim > inicio, "Separação de modificadores temporários não encontrada");
    const calcularMods = Function(`
        const ATTRS = ["for", "des", "con", "int", "sab", "car", "per"];
        const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
        ${script.slice(inicio, fim)}
        return getModificadoresAtributosEfeitos;
    `)();
    assert.deepEqual(calcularMods({ efeitos: [
        { attrDestino: "for", modAttr: -2 },
        { attrDestino: "for", modAttr: 1 },
        { attrDestino: "per", modAttr: 3 }
    ] }), { for: -1, des: 0, con: 0, int: 0, sab: 0, car: 0, per: 3 });

    assert.match(script, /inputEl\.min = minEfetivo/);
    assert.match(script, /\(val - modEfeito\) - minVal/);
    assert.match(script, /valDaVez - \(modsEfeitosAtributos\[a\] \|\| 0\)/);
});
