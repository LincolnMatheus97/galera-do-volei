export function indexPorID(lista: { id: number }[], id: number) {
    const index = lista.findIndex(ent => ent.id === id);
    return index;
}

export function indexPorNome(lista: { nome: string}[], nome: string) {
    const index = lista.findIndex(ent => ent.nome === nome);
    return index;
}