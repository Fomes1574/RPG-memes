export const USUARIOS = Object.freeze({
    dick: Object.freeze({ nome: 'Dick', cargo: 'Mestre', idFicha: null }),
    lais: Object.freeze({ nome: 'Lais', cargo: 'Jogador', idFicha: 'lais' }),
    gomes: Object.freeze({ nome: 'Gomes', cargo: 'Jogador', idFicha: 'gomes' }),
    kamy: Object.freeze({ nome: 'Kamy', cargo: 'Jogador', idFicha: 'kamy' }),
    arthur: Object.freeze({ nome: 'Arthur', cargo: 'Jogador', idFicha: 'arthur' })
});

export function normalizarIdentidade(valor = '') {
    return String(valor).trim().toLocaleLowerCase('pt-BR');
}
