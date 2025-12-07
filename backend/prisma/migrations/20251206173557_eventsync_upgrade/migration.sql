-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_inscricoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qrCode" TEXT,
    "checkInCount" INTEGER NOT NULL DEFAULT 0,
    "statusPagamento" TEXT NOT NULL DEFAULT 'aguardando',
    "jogadorId" INTEGER NOT NULL,
    "partidaId" INTEGER NOT NULL,
    CONSTRAINT "inscricoes_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inscricoes_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "partidas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_inscricoes" ("data", "id", "jogadorId", "partidaId", "status") SELECT "data", "id", "jogadorId", "partidaId", "status" FROM "inscricoes";
DROP TABLE "inscricoes";
ALTER TABLE "new_inscricoes" RENAME TO "inscricoes";
CREATE UNIQUE INDEX "inscricoes_qrCode_key" ON "inscricoes"("qrCode");
CREATE TABLE "new_partidas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL DEFAULT 'Partida de Vôlei',
    "descricao" TEXT,
    "tipo" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "local" TEXT,
    "situacao" TEXT NOT NULL DEFAULT 'Aberta',
    "preco" REAL NOT NULL DEFAULT 0.0,
    "pixChave" TEXT,
    "limiteCheckin" INTEGER NOT NULL DEFAULT 1,
    "moderadorId" INTEGER NOT NULL,
    CONSTRAINT "partidas_moderadorId_fkey" FOREIGN KEY ("moderadorId") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_partidas" ("data", "descricao", "id", "local", "moderadorId", "situacao", "tipo", "titulo") SELECT "data", "descricao", "id", "local", "moderadorId", "situacao", "tipo", "titulo" FROM "partidas";
DROP TABLE "partidas";
ALTER TABLE "new_partidas" RENAME TO "partidas";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
