-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_jogadores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "moderador" BOOLEAN NOT NULL DEFAULT false,
    "visibilidade" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_jogadores" ("categoria", "email", "id", "moderador", "nome", "senhaHash", "sexo") SELECT "categoria", "email", "id", "moderador", "nome", "senhaHash", "sexo" FROM "jogadores";
DROP TABLE "jogadores";
ALTER TABLE "new_jogadores" RENAME TO "jogadores";
CREATE UNIQUE INDEX "jogadores_email_key" ON "jogadores"("email");
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
    "bannerUrl" TEXT,
    "cargaHoraria" INTEGER NOT NULL DEFAULT 0,
    "moderadorId" INTEGER NOT NULL,
    CONSTRAINT "partidas_moderadorId_fkey" FOREIGN KEY ("moderadorId") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_partidas" ("data", "descricao", "id", "limiteCheckin", "local", "moderadorId", "pixChave", "preco", "situacao", "tipo", "titulo") SELECT "data", "descricao", "id", "limiteCheckin", "local", "moderadorId", "pixChave", "preco", "situacao", "tipo", "titulo" FROM "partidas";
DROP TABLE "partidas";
ALTER TABLE "new_partidas" RENAME TO "partidas";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
