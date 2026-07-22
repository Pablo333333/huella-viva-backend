/*
  Warnings:

  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TicketHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tramite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TramiteHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowState` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('CULMINADO', 'EN_GESTION', 'EN_EJECUCION');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('EDUCACION', 'SALUD', 'AGUA', 'SANEAMIENTO', 'INFRAESTRUCTURA', 'OTROS');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('REUNION', 'INSPECCION', 'VISITA', 'TALLER', 'OTRO');

-- CreateEnum
CREATE TYPE "CommitmentStatus" AS ENUM ('PROGRAMADO', 'EN_PROCESO', 'CUMPLIDO');

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_tramiteId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_tramiteId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_userId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_userId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_workflowStateId_fkey";

-- DropForeignKey
ALTER TABLE "TicketHistory" DROP CONSTRAINT "TicketHistory_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "TicketHistory" DROP CONSTRAINT "TicketHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "Tramite" DROP CONSTRAINT "Tramite_destinatarioId_fkey";

-- DropForeignKey
ALTER TABLE "Tramite" DROP CONSTRAINT "Tramite_estadoId_fkey";

-- DropForeignKey
ALTER TABLE "Tramite" DROP CONSTRAINT "Tramite_remitenteId_fkey";

-- DropForeignKey
ALTER TABLE "TramiteHistory" DROP CONSTRAINT "TramiteHistory_tramiteId_fkey";

-- DropForeignKey
ALTER TABLE "TramiteHistory" DROP CONSTRAINT "TramiteHistory_userId_fkey";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "Ticket";

-- DropTable
DROP TABLE "TicketHistory";

-- DropTable
DROP TABLE "Tramite";

-- DropTable
DROP TABLE "TramiteHistory";

-- DropTable
DROP TABLE "WorkflowState";

-- DropEnum
DROP TYPE "Priority";

-- DropEnum
DROP TYPE "TramiteType";

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "poblacion" INTEGER NOT NULL DEFAULT 0,
    "location" DOUBLE PRECISION,
    "boundary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "ProjectType" NOT NULL DEFAULT 'OTROS',
    "presupuesto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "financiador" TEXT,
    "estado" "ProjectStatus" NOT NULL DEFAULT 'EN_GESTION',
    "communityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "location" DOUBLE PRECISION,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "tipo" "ActivityType" NOT NULL DEFAULT 'VISITA',
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "audioUrl" TEXT,
    "fotoUrl" TEXT,
    "location" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commitment" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "fecha_cumplimiento" TIMESTAMP(3),
    "estado" "CommitmentStatus" NOT NULL DEFAULT 'PROGRAMADO',
    "activityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commitment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commitment" ADD CONSTRAINT "Commitment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
