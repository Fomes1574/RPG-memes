import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const testDir = dirname(fileURLToPath(import.meta.url));
const repoDir = dirname(testDir);
const script = readFileSync(join(repoDir, "script.js"), "utf8");
const catalogMatch = script.match(/const HABILIDADES_SISTEMA = (\{[\s\S]*?\})\s*;\s*\/\/ Enriquece/);

assert.ok(catalogMatch, "Catálogo HABILIDADES_SISTEMA não encontrado em script.js");

const systemAbilities = Function(`"use strict"; return (${catalogMatch[1]});`)();

test("o Monge conserva suas três habilidades nativas fora da árvore", () => {
    assert.deepEqual(
        Object.fromEntries(Object.entries(systemAbilities.Monge).map(([id, skill]) => [id, {
            nome: skill.nome,
            tipo: skill.tipo
        }])),
        {
            mon_golpes: { nome: "Golpes Rápidos", tipo: "passiva" },
            mon_ki: { nome: "Ki Interior", tipo: "ativa" },
            mon_esquiva: { nome: "Esquiva Suprema", tipo: "passiva" }
        }
    );
});

test("todas as habilidades nativas possuem arquivo de ícone", () => {
    for(const group of Object.values(systemAbilities)) {
        for(const id of Object.keys(group)) {
            const iconPath = join(repoDir, "Icones", `${id}.png`);
            assert.ok(existsSync(iconPath), `Ícone ausente: Icones/${id}.png`);
            assert.ok(statSync(iconPath).size > 0, `Ícone vazio: Icones/${id}.png`);
        }
    }
});
