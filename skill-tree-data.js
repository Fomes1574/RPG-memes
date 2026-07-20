export const SKILL_TREE_SCHEMA_VERSION = 2;

export const ARVORE_CAMINHOS = Object.freeze({
    punho: {
        nome: "Caminho do Punho",
        lema: "O corpo se torna a própria arma.",
        resumo: "Pressão ofensiva, sequências de golpes e ruptura de defesas.",
        afinidade: "punho"
    },
    ki: {
        nome: "Caminho do Ki Interior",
        lema: "A vontade dá forma à energia.",
        resumo: "Mobilidade, técnicas espirituais e domínio do Ki.",
        afinidade: "ki"
    },
    resiliencia: {
        nome: "Caminho da Resiliência",
        lema: "A montanha não recua diante da tempestade.",
        resumo: "Posturas, proteção, recuperação e sobrevivência extrema.",
        afinidade: "resiliencia"
    }
});

const node = (config) => ({
    custo: 1,
    legacyCost: config.custo ?? 1,
    tipo: "passiva",
    grimorioTipo: "passiva",
    prereq: [],
    caminho: "",
    afinidade: "neutra",
    zona: "fundamental",
    subcaminho: "",
    desc: "",
    mecanica: "",
    icon: "lotus",
    effectKind: "passiva",
    targetMode: "self",
    ap: 0,
    mana: 0,
    formula: "",
    cooldown: 0,
    duration: 0,
    modifiers: {},
    tags: [],
    ...config,
    prereq: [...(config.prereq || [])],
    unlockGroups: (config.unlockGroups || []).map(group => ({
        from: [...(group.from || [])],
        count: group.count ?? (group.from || []).length,
        label: group.label || ""
    })),
    tags: [...(config.tags || [])],
    modifiers: { ...(config.modifiers || {}) }
});

const fundamentosPunho = ["mon_fund_01", "mon_fund_d", "mon_fund_p_03"];
const fundamentosKi = ["mon_fund_c", "mon_fund_a", "mon_fund_k_03"];
const fundamentosResiliencia = ["mon_fund_02", "mon_fund_b", "mon_fund_03"];

export const SKILL_TREES = Object.freeze({
    Monge: {
        classe: "Monge",
        titulo: "A Árvore da Disciplina",
        raizId: "mon_core_00",
        nodes: [
            node({
                id: "mon_core_00", nome: "Disciplina do Monge", custo: 0, legacyCost: 0,
                x: 800, y: 1180, autoUnlocked: true, icon: "lotus", tipo: "raiz", grimorioTipo: "",
                desc: "A raiz comum de todo monge: corpo, mente e espírito submetidos à disciplina.",
                mecanica: "Nó inicial gratuito. Todos os fundamentos permanecem acessíveis, mesmo após a escolha de um Caminho."
            }),

            node({
                id: "mon_fund_01", nome: "Respiração Marcial", x: 500, y: 1040, prereq: ["mon_core_00"],
                afinidade: "punho", icon: "breath", legacyCost: 1,
                desc: "Controla a respiração para manter ritmo e precisão em combate.",
                mecanica: "Passiva: o primeiro golpe ofensivo de cada turno recebe +1 no resultado final.",
                modifiers: { firstAttackBonus: 1 }, tags: ["fundamento", "ofensivo"]
            }),
            node({
                id: "mon_fund_d", nome: "Golpe Treinado", tipo: "ativa", grimorioTipo: "ativa",
                x: 430, y: 895, prereq: ["mon_fund_01"], afinidade: "punho", icon: "fist", legacyCost: 1,
                desc: "Um ataque simples, limpo e confiável para abrir sequências.",
                mecanica: "Ataque físico que causa 1d6 + DES de dano.",
                effectKind: "dano", targetMode: "enemy", ap: 1, formula: "1d6+DES", tags: ["fundamento", "golpe"]
            }),
            node({
                id: "mon_fund_p_03", nome: "Ritmo de Combate", tipo: "melhoria", grimorioTipo: "melhoria",
                x: 360, y: 750, prereq: ["mon_fund_d"], afinidade: "punho", icon: "rhythm",
                desc: "Transforma golpes sucessivos em uma cadência difícil de interromper.",
                mecanica: "Melhoria: após acertar uma técnica do Punho, a próxima técnica do Punho recebe +1 de dano.",
                modifiers: { comboDamage: 1 }, tags: ["fundamento", "combo"]
            }),

            node({
                id: "mon_fund_c", nome: "Mente Clara", tipo: "melhoria", grimorioTipo: "melhoria",
                x: 800, y: 1020, prereq: ["mon_core_00"], afinidade: "ki", icon: "mind", legacyCost: 1,
                desc: "Silencia distrações para que intenção e energia se tornem uma só coisa.",
                mecanica: "Melhoria: +1 no limite efetivo de Ki do Monge.",
                modifiers: { manaMax: 1 }, tags: ["fundamento", "espiritual"]
            }),
            node({
                id: "mon_fund_a", nome: "Passo Leve", tipo: "ativa", grimorioTipo: "ativa",
                x: 800, y: 870, prereq: ["mon_fund_c"], afinidade: "ki", icon: "wind", legacyCost: 1,
                desc: "Move-se com leveza e recupera a posição antes que o inimigo reaja.",
                mecanica: "Utilidade: reposiciona o Monge e concede vantagem narrativa em uma esquiva ou deslocamento.",
                effectKind: "utilidade", targetMode: "self", ap: 1, mana: 1, tags: ["fundamento", "mobilidade"]
            }),
            node({
                id: "mon_fund_k_03", nome: "Fluxo Interior", tipo: "melhoria", grimorioTipo: "melhoria",
                x: 800, y: 720, prereq: ["mon_fund_a"], afinidade: "ki", icon: "flow",
                desc: "Faz o Ki circular sem desperdício entre respiração, movimento e intenção.",
                mecanica: "Melhoria: +2 no limite efetivo de Ki do Monge.",
                modifiers: { manaMax: 2 }, tags: ["fundamento", "ki"]
            }),

            node({
                id: "mon_fund_02", nome: "Postura do Monge", tipo: "melhoria", grimorioTipo: "melhoria",
                x: 1100, y: 1040, prereq: ["mon_core_00"], afinidade: "resiliencia", icon: "stance", legacyCost: 1,
                desc: "Refina a base corporal e distribui impactos sem perder o equilíbrio.",
                mecanica: "Melhoria: +2 ao HP máximo efetivo.",
                modifiers: { hpMax: 2 }, tags: ["fundamento", "postura"]
            }),
            node({
                id: "mon_fund_b", nome: "Reflexo Sereno", tipo: "ativa", grimorioTipo: "ativa",
                x: 1170, y: 895, prereq: ["mon_fund_02"], afinidade: "resiliencia", icon: "circle", legacyCost: 1,
                desc: "Reage ao perigo sem romper a concentração.",
                mecanica: "Defesa: concede 1d4 + SAB de escudo a si mesmo.",
                effectKind: "escudo", targetMode: "self", ap: 1, formula: "1d4+SAB", tags: ["fundamento", "defesa"]
            }),
            node({
                id: "mon_fund_03", nome: "Disciplina do Corpo", x: 1240, y: 750, prereq: ["mon_fund_b"],
                afinidade: "resiliencia", icon: "body", legacyCost: 1,
                desc: "Transforma treino repetido em resistência, controle e presença.",
                mecanica: "Passiva: +3 ao HP máximo efetivo.",
                modifiers: { hpMax: 3 }, tags: ["fundamento", "resistencia"]
            }),

            node({
                id: "mon_path_punho", nome: "Caminho do Punho", tipo: "caminho", grimorioTipo: "", custo: 1,
                x: 300, y: 575, caminho: "punho", afinidade: "punho", zona: "caminho", icon: "path-fist", legacyCost: 1,
                unlockGroups: [
                    { from: fundamentosPunho, count: 3, label: "Rota natural: três fundamentos do Punho" },
                    { from: ["mon_fund_c", "mon_fund_a"], count: 2, label: "Atalho cruzado: Mente Clara + Passo Leve" }
                ],
                desc: "Assume o corpo como arma absoluta. Os caminhos avançados rivais serão selados.",
                mecanica: "Pode ser alcançado pela rota natural de três fundamentos ou pelo atalho de dois fundamentos do Ki."
            }),
            node({
                id: "mon_path_ki", nome: "Caminho do Ki Interior", tipo: "caminho", grimorioTipo: "", custo: 1,
                x: 800, y: 545, caminho: "ki", afinidade: "ki", zona: "caminho", icon: "path-ki", legacyCost: 1,
                unlockGroups: [
                    { from: fundamentosKi, count: 3, label: "Rota natural: três fundamentos do Ki" },
                    { from: ["mon_fund_02", "mon_fund_b"], count: 2, label: "Atalho cruzado: Postura do Monge + Reflexo Sereno" }
                ],
                desc: "Transforma disciplina em força espiritual. Os caminhos avançados rivais serão selados.",
                mecanica: "Pode ser alcançado pela rota natural de três fundamentos ou pelo atalho de dois fundamentos da Resiliência."
            }),
            node({
                id: "mon_path_res", nome: "Caminho da Resiliência", tipo: "caminho", grimorioTipo: "", custo: 1,
                x: 1300, y: 575, caminho: "resiliencia", afinidade: "resiliencia", zona: "caminho", icon: "path-mountain", legacyCost: 1,
                unlockGroups: [
                    { from: fundamentosResiliencia, count: 3, label: "Rota natural: três fundamentos da Resiliência" },
                    { from: ["mon_fund_01", "mon_fund_d"], count: 2, label: "Atalho cruzado: Respiração Marcial + Golpe Treinado" }
                ],
                desc: "Faz da permanência uma arma. Os caminhos avançados rivais serão selados.",
                mecanica: "Pode ser alcançado pela rota natural de três fundamentos ou pelo atalho de dois fundamentos do Punho."
            }),

            node({
                id: "mon_punho_01", nome: "Doutrina do Punho", x: 300, y: 420, prereq: ["mon_path_punho"],
                caminho: "punho", afinidade: "punho", zona: "advanced", icon: "fist", legacyCost: 2,
                desc: "Cada movimento elimina distância, hesitação e desperdício.",
                mecanica: "Passiva: técnicas do Punho recebem +1 de dano.",
                modifiers: { punchDamage: 1 }, tags: ["punho", "nucleo"]
            }),
            node({
                id: "mon_punho_02", nome: "Sequência Relâmpago", tipo: "ativa", grimorioTipo: "ativa",
                x: 90, y: 275, prereq: ["mon_punho_01"], caminho: "punho", afinidade: "punho", zona: "advanced",
                subcaminho: "Rajada", icon: "combo", legacyCost: 2,
                desc: "Desfere uma sucessão curta antes que a abertura desapareça.",
                mecanica: "Ataque: causa 2d4 + DES de dano.",
                effectKind: "dano", targetMode: "enemy", ap: 2, formula: "2d4+DES", tags: ["punho", "rajada", "combo"]
            }),
            node({
                id: "mon_punho_05", nome: "Combo Crescente", tipo: "melhoria", grimorioTipo: "melhoria",
                x: 90, y: 120, prereq: ["mon_punho_02"], caminho: "punho", afinidade: "punho", zona: "advanced",
                subcaminho: "Rajada", icon: "rhythm", legacyCost: 2,
                desc: "Cada golpe bem-sucedido acelera o próximo.",
                mecanica: "Melhoria: o bônus de Ritmo de Combate aumenta para +2.",
                modifiers: { comboDamage: 1 }, tags: ["punho", "rajada", "combo"]
            }),
            node({
                id: "mon_punho_04", nome: "Quebra-Guarda", tipo: "ativa", grimorioTipo: "ativa",
                x: 300, y: 260, prereq: ["mon_punho_01"], caminho: "punho", afinidade: "punho", zona: "advanced",
                subcaminho: "Ruptura", icon: "break", legacyCost: 2,
                desc: "Um golpe técnico contra a estrutura da defesa inimiga.",
                mecanica: "Ataque: causa 1d8 + FOR de dano e permite ao Mestre considerar a guarda rompida.",
                effectKind: "dano", targetMode: "enemy", ap: 2, formula: "1d8+FOR", tags: ["punho", "ruptura"]
            }),
            node({
                id: "mon_punho_06", nome: "Impacto Interno", x: 300, y: 105, prereq: ["mon_punho_04"],
                caminho: "punho", afinidade: "punho", zona: "advanced", subcaminho: "Ruptura", icon: "impact", legacyCost: 3,
                desc: "A força atravessa a proteção e alcança o centro do alvo.",
                mecanica: "Passiva: +2 de dano ao atacar um alvo que possua escudo.",
                modifiers: { shieldBreakerDamage: 2 }, tags: ["punho", "ruptura"]
            }),
            node({
                id: "mon_punho_03", nome: "Pressão Constante", tipo: "melhoria", grimorioTipo: "melhoria",
                x: 510, y: 275, prereq: ["mon_punho_01"], caminho: "punho", afinidade: "punho", zona: "advanced",
                subcaminho: "Precisão", icon: "eye", legacyCost: 2,
                desc: "Lê microaberturas e impede o inimigo de recuperar o controle.",
                mecanica: "Melhoria: +1 em resultados de técnicas do Punho contra o mesmo alvo no turno.",
                modifiers: { focusedTargetBonus: 1 }, tags: ["punho", "precisao"]
            }),
            node({
                id: "mon_punho_07", nome: "Ponto Vital", tipo: "ativa", grimorioTipo: "ativa",
                x: 510, y: 120, prereq: ["mon_punho_03"], caminho: "punho", afinidade: "punho", zona: "advanced",
                subcaminho: "Precisão", icon: "target",
                desc: "Concentra toda a técnica em um ponto vulnerável.",
                mecanica: "Ataque: causa 1d10 + SAB de dano.",
                effectKind: "dano", targetMode: "enemy", ap: 2, formula: "1d10+SAB", tags: ["punho", "precisao"]
            }),
            node({
                id: "mon_punho_08", nome: "Pressão Absoluta", tipo: "melhoria", grimorioTipo: "melhoria", custo: 2,
                x: 300, y: -45, caminho: "punho", afinidade: "punho", zona: "advanced", icon: "sun",
                prereqAnyCount: { from: ["mon_punho_05", "mon_punho_06", "mon_punho_07"], count: 2 },
                desc: "Une duas escolas do Punho em uma ofensiva sem intervalo.",
                mecanica: "Requer o domínio de dois dos três subcaminhos. O terceiro permanece disponível.",
                modifiers: { punchDamage: 1 }, tags: ["punho", "convergencia"]
            }),
            node({
                id: "mon_punho_final", nome: "Último Golpe do Punho", tipo: "final", grimorioTipo: "ativa", custo: 2,
                x: 300, y: -225, prereq: ["mon_punho_08"], caminho: "punho", afinidade: "punho", zona: "advanced",
                icon: "final-fist", legacyCost: 3,
                desc: "Toda a sequência converge em um golpe concentrado e decisivo.",
                mecanica: "Técnica final: causa 3d10 + FOR de dano. Recarga de 3 turnos.",
                effectKind: "dano", targetMode: "enemy", ap: 3, formula: "3d10+FOR", cooldown: 3,
                tags: ["punho", "final"]
            }),

            node({
                id: "mon_ki_01", nome: "Reserva Interior", x: 800, y: 390, prereq: ["mon_path_ki"],
                caminho: "ki", afinidade: "ki", zona: "advanced", icon: "orb", legacyCost: 2,
                desc: "Amplia a quantidade de energia que o corpo pode conter sem se romper.",
                mecanica: "Passiva: +3 no limite efetivo de Ki.",
                modifiers: { manaMax: 3 }, tags: ["ki", "nucleo"]
            }),
            node({
                id: "mon_ki_02", nome: "Passo do Vento", tipo: "ativa", grimorioTipo: "ativa",
                x: 600, y: 245, prereq: ["mon_ki_01"], caminho: "ki", afinidade: "ki", zona: "advanced",
                subcaminho: "Vento", icon: "wind", legacyCost: 2,
                desc: "O corpo acompanha o fluxo do ar e atravessa o campo em um instante.",
                mecanica: "Utilidade: reposicionamento extraordinário. Custa 1 Ki.",
                effectKind: "utilidade", targetMode: "self", ap: 1, mana: 1, tags: ["ki", "vento", "mobilidade"]
            }),
            node({
                id: "mon_ki_07", nome: "Corpo sem Peso", tipo: "ativa", grimorioTipo: "ativa",
                x: 600, y: 90, prereq: ["mon_ki_02"], caminho: "ki", afinidade: "ki", zona: "advanced",
                subcaminho: "Vento", icon: "feather",
                desc: "O Ki amortece impactos e permite movimentos impossíveis.",
                mecanica: "Defesa: concede 1d6 + SAB de escudo. Custa 1 Ki.",
                effectKind: "escudo", targetMode: "self", ap: 1, mana: 1, formula: "1d6+SAB", tags: ["ki", "vento"]
            }),
            node({
                id: "mon_ki_04", nome: "Palma Espiritual", tipo: "ativa", grimorioTipo: "ativa",
                x: 800, y: 225, prereq: ["mon_ki_01"], caminho: "ki", afinidade: "ki", zona: "advanced",
                subcaminho: "Espírito", icon: "palm", legacyCost: 2,
                desc: "Projeta energia concentrada através da palma.",
                mecanica: "Ataque espiritual: causa 1d8 + SAB de dano. Custa 2 Ki.",
                effectKind: "dano", targetMode: "enemy", ap: 2, mana: 2, formula: "1d8+SAB", tags: ["ki", "espirito"]
            }),
            node({
                id: "mon_ki_08", nome: "Eco da Alma", tipo: "ativa", grimorioTipo: "ativa",
                x: 800, y: 70, prereq: ["mon_ki_04"], caminho: "ki", afinidade: "ki", zona: "advanced",
                subcaminho: "Espírito", icon: "echo",
                desc: "A primeira descarga deixa uma segunda vibração dentro do alvo.",
                mecanica: "Ataque espiritual: causa 2d6 + SAB de dano. Custa 3 Ki.",
                effectKind: "dano", targetMode: "enemy", ap: 2, mana: 3, formula: "2d6+SAB", cooldown: 1,
                tags: ["ki", "espirito"]
            }),
            node({
                id: "mon_ki_03", nome: "Canalizar Ki", tipo: "melhoria", grimorioTipo: "melhoria",
                x: 1000, y: 245, prereq: ["mon_ki_01"], caminho: "ki", afinidade: "ki", zona: "advanced",
                subcaminho: "Transcendência", icon: "channel", legacyCost: 2,
                desc: "Mantém o fluxo energético estável mesmo sob pressão.",
                mecanica: "Melhoria: +2 no limite efetivo de Ki.",
                modifiers: { manaMax: 2 }, tags: ["ki", "transcendencia"]
            }),
            node({
                id: "mon_ki_06", nome: "Corpo Etéreo", tipo: "ativa", grimorioTipo: "ativa",
                x: 1000, y: 90, prereq: ["mon_ki_03"], caminho: "ki", afinidade: "ki", zona: "advanced",
                subcaminho: "Transcendência", icon: "spirit", legacyCost: 3,
                desc: "Por um instante, o corpo responde como se fosse mais leve que a dor.",
                mecanica: "Defesa espiritual: concede 2d6 + SAB de escudo. Custa 3 Ki.",
                effectKind: "escudo", targetMode: "self", ap: 2, mana: 3, formula: "2d6+SAB", cooldown: 2,
                tags: ["ki", "transcendencia"]
            }),
            node({
                id: "mon_ki_05", nome: "Fluxo Perfeito", tipo: "melhoria", grimorioTipo: "melhoria", custo: 2,
                x: 800, y: -70, caminho: "ki", afinidade: "ki", zona: "advanced", icon: "infinity", legacyCost: 2,
                prereqAnyCount: { from: ["mon_ki_07", "mon_ki_08", "mon_ki_06"], count: 2 },
                desc: "Duas escolas de Ki passam a circular como uma única corrente.",
                mecanica: "Requer o domínio de dois dos três subcaminhos. O terceiro permanece disponível.",
                modifiers: { manaMax: 2 }, tags: ["ki", "convergencia"]
            }),
            node({
                id: "mon_ki_final", nome: "Técnica do Ki Interior", tipo: "final", grimorioTipo: "ativa", custo: 2,
                x: 800, y: -250, prereq: ["mon_ki_05"], caminho: "ki", afinidade: "ki", zona: "advanced",
                icon: "final-ki", legacyCost: 3,
                desc: "Libera a reserva espiritual plena em uma única manifestação.",
                mecanica: "Técnica final: causa 3d8 + SAB de dano. Custa 4 Ki e possui recarga de 3 turnos.",
                effectKind: "dano", targetMode: "enemy", ap: 3, mana: 4, formula: "3d8+SAB", cooldown: 3,
                tags: ["ki", "final"]
            }),

            node({
                id: "mon_res_01", nome: "Corpo Inabalável", x: 1300, y: 420, prereq: ["mon_path_res"],
                caminho: "resiliencia", afinidade: "resiliencia", zona: "advanced", icon: "body", legacyCost: 2,
                desc: "O corpo aceita o impacto sem abandonar sua posição.",
                mecanica: "Passiva: +4 ao HP máximo efetivo.",
                modifiers: { hpMax: 4 }, tags: ["resiliencia", "nucleo"]
            }),
            node({
                id: "mon_res_03", nome: "Pele de Pedra", tipo: "melhoria", grimorioTipo: "melhoria",
                x: 1090, y: 275, prereq: ["mon_res_01"], caminho: "resiliencia", afinidade: "resiliencia", zona: "advanced",
                subcaminho: "Montanha", icon: "stone", legacyCost: 2,
                desc: "Treino físico endurece a resposta contra dano direto.",
                mecanica: "Melhoria: +3 ao HP máximo efetivo.",
                modifiers: { hpMax: 3 }, tags: ["resiliencia", "montanha"]
            }),
            node({
                id: "mon_res_04", nome: "Fôlego de Ferro", tipo: "ativa", grimorioTipo: "ativa",
                x: 1090, y: 120, prereq: ["mon_res_03"], caminho: "resiliencia", afinidade: "resiliencia", zona: "advanced",
                subcaminho: "Montanha", icon: "iron-breath", legacyCost: 2,
                desc: "Recupera o controle mesmo após dor e exaustão intensas.",
                mecanica: "Recuperação: cura 1d6 + CON de HP em si mesmo.",
                effectKind: "cura", targetMode: "self", ap: 2, formula: "1d6+CON", cooldown: 2,
                tags: ["resiliencia", "montanha"]
            }),
            node({
                id: "mon_res_02", nome: "Defesa Circular", tipo: "ativa", grimorioTipo: "ativa",
                x: 1300, y: 260, prereq: ["mon_res_01"], caminho: "resiliencia", afinidade: "resiliencia", zona: "advanced",
                subcaminho: "Círculo", icon: "circle", legacyCost: 2,
                desc: "Redireciona pressão inimiga com movimentos circulares.",
                mecanica: "Defesa: concede 1d6 + DES de escudo a si ou a um aliado.",
                effectKind: "escudo", targetMode: "ally", ap: 2, formula: "1d6+DES", tags: ["resiliencia", "circulo"]
            }),
            node({
                id: "mon_res_07", nome: "Redirecionar Impacto", tipo: "ativa", grimorioTipo: "ativa",
                x: 1300, y: 105, prereq: ["mon_res_02"], caminho: "resiliencia", afinidade: "resiliencia", zona: "advanced",
                subcaminho: "Círculo", icon: "redirect",
                desc: "Devolve ao agressor parte da força que ele próprio criou.",
                mecanica: "Contra-ataque: causa 1d8 + DES de dano.",
                effectKind: "dano", targetMode: "enemy", ap: 2, formula: "1d8+DES", cooldown: 1,
                tags: ["resiliencia", "circulo"]
            }),
            node({
                id: "mon_res_05", nome: "Vontade Imóvel", tipo: "melhoria", grimorioTipo: "melhoria",
                x: 1510, y: 275, prereq: ["mon_res_01"], caminho: "resiliencia", afinidade: "resiliencia", zona: "advanced",
                subcaminho: "Vontade", icon: "will", legacyCost: 2,
                desc: "Resiste a medo, manipulação e colapso mental.",
                mecanica: "Melhoria: +2 em testes narrativos contra medo ou controle mental.",
                modifiers: { mentalResistance: 2 }, tags: ["resiliencia", "vontade"]
            }),
            node({
                id: "mon_res_06", nome: "Recusar a Queda", tipo: "ativa", grimorioTipo: "ativa",
                x: 1510, y: 120, prereq: ["mon_res_05"], caminho: "resiliencia", afinidade: "resiliencia", zona: "advanced",
                subcaminho: "Vontade", icon: "stand", legacyCost: 3,
                desc: "Força o corpo a permanecer de pé quando deveria cair.",
                mecanica: "Recuperação: cura 2d6 + CON de HP em si mesmo. Recarga de 3 turnos.",
                effectKind: "cura", targetMode: "self", ap: 2, formula: "2d6+CON", cooldown: 3,
                tags: ["resiliencia", "vontade"]
            }),
            node({
                id: "mon_res_08", nome: "Presença Imóvel", tipo: "melhoria", grimorioTipo: "melhoria", custo: 2,
                x: 1300, y: -45, caminho: "resiliencia", afinidade: "resiliencia", zona: "advanced", icon: "mountain",
                prereqAnyCount: { from: ["mon_res_04", "mon_res_07", "mon_res_06"], count: 2 },
                desc: "Duas escolas defensivas convergem em uma presença impossível de deslocar.",
                mecanica: "Requer o domínio de dois dos três subcaminhos. O terceiro permanece disponível.",
                modifiers: { hpMax: 3 }, tags: ["resiliencia", "convergencia"]
            }),
            node({
                id: "mon_res_final", nome: "Selo da Montanha Viva", tipo: "final", grimorioTipo: "ativa", custo: 2,
                x: 1300, y: -225, prereq: ["mon_res_08"], caminho: "resiliencia", afinidade: "resiliencia", zona: "advanced",
                icon: "final-mountain", legacyCost: 3,
                desc: "A resistência do Monge se manifesta como uma fortaleza espiritual.",
                mecanica: "Técnica final: concede 3d10 + CON de escudo a si ou a um aliado. Recarga de 3 turnos.",
                effectKind: "escudo", targetMode: "ally", ap: 3, formula: "3d10+CON", cooldown: 3,
                tags: ["resiliencia", "final"]
            })
        ]
    }
});

export function getSkillTreeForClassName(classe) {
    return SKILL_TREES[classe] || null;
}
