-- CreateTable
CREATE TABLE "Athlete" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "team" TEXT,
    "position" TEXT NOT NULL,
    "throwingSide" TEXT NOT NULL,
    "batting" TEXT NOT NULL,
    "heightCm" REAL NOT NULL,
    "weightKg" REAL NOT NULL,
    "bodyFatPercent" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fatMassKg" REAL NOT NULL,
    "leanMassKg" REAL NOT NULL,
    "leanBodyIndex" REAL NOT NULL,
    "swingSpeed" REAL,
    "notes" TEXT,
    CONSTRAINT "Assessment_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentId" TEXT NOT NULL,
    "movement" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "valueDeg" REAL NOT NULL,
    CONSTRAINT "Rom_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Rom_assessmentId_movement_side_key" ON "Rom"("assessmentId", "movement", "side");
