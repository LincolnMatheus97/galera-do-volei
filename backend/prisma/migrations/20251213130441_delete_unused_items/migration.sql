/*
  Warnings:

  - You are about to drop the column `cargaHoraria` on the `partidas` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "exigeAprovacao" BOOLEAN NOT NULL DEFAULT true,
    "moderadorId" INTEGER NOT NULL,
    CONSTRAINT "partidas_moderadorId_fkey" FOREIGN KEY ("moderadorId") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_partidas" ("bannerUrl", "data", "descricao", "exigeAprovacao", "id", "limiteCheckin", "local", "moderadorId", "pixChave", "preco", "situacao", "tipo", "titulo") SELECT "bannerUrl", "data", "descricao", "exigeAprovacao", "id", "limiteCheckin", "local", "moderadorId", "pixChave", "preco", "situacao", "tipo", "titulo" FROM "partidas";
DROP TABLE "partidas";
ALTER TABLE "new_partidas" RENAME TO "partidas";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
