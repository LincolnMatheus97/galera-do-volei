-- CreateTable
CREATE TABLE "jogadores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "moderador" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "partidas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL DEFAULT 'Partida de Vôlei',
    "descricao" TEXT,
    "tipo" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "local" TEXT,
    "situacao" TEXT NOT NULL DEFAULT 'Aberta',
    "moderadorId" INTEGER NOT NULL,
    CONSTRAINT "partidas_moderadorId_fkey" FOREIGN KEY ("moderadorId") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inscricoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jogadorId" INTEGER NOT NULL,
    "partidaId" INTEGER NOT NULL,
    CONSTRAINT "inscricoes_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inscricoes_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "partidas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "convites" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "remetenteId" INTEGER NOT NULL,
    "destinatarioId" INTEGER NOT NULL,
    "partidaId" INTEGER NOT NULL,
    CONSTRAINT "convites_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "convites_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "convites_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "partidas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jogadorId" INTEGER NOT NULL,
    "partidaId" INTEGER NOT NULL,
    CONSTRAINT "avaliacoes_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "avaliacoes_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "partidas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "jogadores_email_key" ON "jogadores"("email");
