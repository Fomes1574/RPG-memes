import test from "node:test";
import assert from "node:assert/strict";

import {
    ARVORE_CAMINHOS,
    SKILL_TREE_SCHEMA_VERSION,
    SKILL_TREES
} from "../skill-tree-data.js";

const tree = SKILL_TREES.Monge;
const nodes = tree.nodes;
const byId = new Map(nodes.map(node => [node.id, node]));
const paths = Object.keys(ARVORE_CAMINHOS);

function combinations(values, count) {
    if(count === 0) return [[]];
    const result = [];
    const visit = (start, picked) => {
        if(picked.length === count) return result.push(picked);
        for(let index = start; index < values.length; index++) {
            visit(index + 1, [...picked, values[index]]);
        }
    };
    visit(0, []);
    return result;
}

function prerequisiteOptions(node) {
    let options = node.unlockGroups?.length
        ? node.unlockGroups.flatMap(group => combinations(group.from, group.count))
        : [[]];
    if(node.prereqAnyCount?.from?.length) {
        const anyOptions = combinations(node.prereqAnyCount.from, node.prereqAnyCount.count);
        options = options.flatMap(base => anyOptions.map(option => [...base, ...option]));
    }
    return options.map(option => [...new Set([...(node.prereq || []), ...option])]);
}

function planCandidates(skillId, stack = new Set()) {
    const skill = byId.get(skillId);
    assert.ok(skill, `Nó inexistente no planejamento: ${skillId}`);
    assert.ok(!stack.has(skillId), `Ciclo detectado em ${skillId}`);
    const nextStack = new Set(stack).add(skillId);

    return prerequisiteOptions(skill).map(option => {
        const ids = new Set([skillId]);
        for(const dependencyId of option) {
            const candidates = planCandidates(dependencyId, nextStack);
            const best = candidates.sort((a, b) => planCost(a) - planCost(b))[0];
            for(const id of best) ids.add(id);
        }
        return ids;
    });
}

function planCost(ids) {
    return [...ids].reduce((sum, id) => sum + Number(byId.get(id)?.custo || 0), 0);
}

test("a árvore V2 tem uma raiz gratuita e 40 nós únicos", () => {
    assert.equal(SKILL_TREE_SCHEMA_VERSION, 2);
    assert.equal(nodes.length, 40);
    assert.equal(byId.size, nodes.length);
    const root = byId.get(tree.raizId);
    assert.ok(root);
    assert.equal(root.custo, 0);
    assert.equal(root.autoUnlocked, true);
});

test("todas as referências da progressão apontam para nós existentes", () => {
    for(const node of nodes) {
        const references = [
            ...(node.prereq || []),
            ...(node.prereqAnyCount?.from || []),
            ...(node.unlockGroups || []).flatMap(group => group.from)
        ];
        for(const id of references) assert.ok(byId.has(id), `${node.id} referencia ${id}`);
    }
});

test("os nove fundamentos continuam neutros para bloqueio de caminho", () => {
    const fundamentals = nodes.filter(node => node.zona === "fundamental" && !node.autoUnlocked);
    assert.equal(fundamentals.length, 9);
    assert.deepEqual(
        Object.fromEntries(paths.map(path => [path, fundamentals.filter(node => node.afinidade === path).length])),
        { punho: 3, ki: 3, resiliencia: 3 }
    );
    for(const node of fundamentals) assert.equal(node.caminho, "", `${node.id} não pode ser selado por um Caminho`);
});

test("cada Caminho oferece rota natural de três e atalho cruzado de duas habilidades", () => {
    const gateways = nodes.filter(node => node.tipo === "caminho");
    assert.equal(gateways.length, 3);

    for(const gateway of gateways) {
        assert.equal(gateway.unlockGroups.length, 2);
        const natural = gateway.unlockGroups.find(group => group.from.every(id => byId.get(id).afinidade === gateway.afinidade));
        const shortcut = gateway.unlockGroups.find(group => group.from.every(id => byId.get(id).afinidade !== gateway.afinidade));
        assert.ok(natural, `${gateway.id} precisa de rota natural`);
        assert.ok(shortcut, `${gateway.id} precisa de atalho cruzado`);
        assert.equal(natural.count, 3);
        assert.equal(natural.from.length, 3);
        assert.equal(shortcut.count, 2);
        assert.equal(shortcut.from.length, 2);
    }
});

test("não existem cruzamentos depois da escolha do Caminho", () => {
    for(const node of nodes.filter(node => node.zona === "advanced")) {
        const references = [
            ...(node.prereq || []),
            ...(node.prereqAnyCount?.from || []),
            ...(node.unlockGroups || []).flatMap(group => group.from)
        ];
        for(const id of references) {
            const dependency = byId.get(id);
            assert.ok(
                dependency.caminho === node.caminho,
                `${node.id} cruza indevidamente com ${dependency.id}`
            );
        }
    }
});

test("cada Caminho possui três subcaminhos livres e convergência de dois", () => {
    for(const path of paths) {
        const advanced = nodes.filter(node => node.zona === "advanced" && node.caminho === path);
        const subpaths = [...new Set(advanced.map(node => node.subcaminho).filter(Boolean))];
        assert.equal(subpaths.length, 3, `${path} deve ter três subcaminhos`);
        for(const subpath of subpaths) {
            assert.equal(advanced.filter(node => node.subcaminho === subpath).length, 2, `${path}/${subpath}`);
        }

        const convergence = advanced.find(node => node.tags.includes("convergencia"));
        assert.ok(convergence, `${path} precisa de convergência`);
        assert.equal(convergence.prereqAnyCount.count, 2);
        assert.equal(convergence.prereqAnyCount.from.length, 3);
        assert.equal("locks" in convergence, false);
    }
});

test("todas as técnicas ativas da árvore possuem metadados executáveis", () => {
    for(const node of nodes.filter(node => node.grimorioTipo === "ativa")) {
        assert.ok(["dano", "cura", "escudo", "utilidade"].includes(node.effectKind), node.id);
        assert.ok(["self", "ally", "enemy", "any"].includes(node.targetMode), node.id);
        assert.ok(Number.isFinite(node.ap) && node.ap >= 0, node.id);
        if(["dano", "cura", "escudo"].includes(node.effectKind)) {
            assert.match(node.formula, /^\d+d\d+(?:\+[A-Z]{3})?$/, node.id);
        }
    }
});

test("as três técnicas finais têm rota mínima cruzada de 12 PA", () => {
    for(const path of paths) {
        const final = nodes.find(node => node.tipo === "final" && node.caminho === path);
        assert.ok(final);
        const plans = planCandidates(final.id);
        const minimum = Math.min(...plans.map(planCost));
        assert.equal(minimum, 12, `${path} custa ${minimum} PA pela rota mais curta`);
    }
});

test("IDs da árvore antiga permanecem disponíveis para migração", () => {
    const legacyIds = [
        "mon_fund_01", "mon_fund_02", "mon_fund_03", "mon_fund_a", "mon_fund_b", "mon_fund_c", "mon_fund_d",
        "mon_path_punho", "mon_path_ki", "mon_path_res",
        "mon_punho_01", "mon_punho_02", "mon_punho_03", "mon_punho_04", "mon_punho_05", "mon_punho_06", "mon_punho_final",
        "mon_ki_01", "mon_ki_02", "mon_ki_03", "mon_ki_04", "mon_ki_05", "mon_ki_06", "mon_ki_final",
        "mon_res_01", "mon_res_02", "mon_res_03", "mon_res_04", "mon_res_05", "mon_res_06", "mon_res_final"
    ];
    for(const id of legacyIds) assert.ok(byId.has(id), id);
});
