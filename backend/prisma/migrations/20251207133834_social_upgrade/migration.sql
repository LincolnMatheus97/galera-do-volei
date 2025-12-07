-- CreateTable
CREATE TABLE "amizades" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "solicitanteId" INTEGER NOT NULL,
    "destinatarioId" INTEGER NOT NULL,
    CONSTRAINT "amizades_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "amizades_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "conteudo" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remetenteId" INTEGER NOT NULL,
    "destinatarioId" INTEGER NOT NULL,
    CONSTRAINT "mensagens_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mensagens_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "amizades_solicitanteId_destinatarioId_key" ON "amizades"("solicitanteId", "destinatarioId");
