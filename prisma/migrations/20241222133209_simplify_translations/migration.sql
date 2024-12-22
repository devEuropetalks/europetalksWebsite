/*
  Warnings:

  - You are about to drop the `AboutTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ComponentsTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContactTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventsTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GalleryTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HeaderTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HomeTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OtherTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_translations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "AboutTranslation";

-- DropTable
DROP TABLE "ComponentsTranslation";

-- DropTable
DROP TABLE "ContactTranslation";

-- DropTable
DROP TABLE "EventsTranslation";

-- DropTable
DROP TABLE "GalleryTranslation";

-- DropTable
DROP TABLE "HeaderTranslation";

-- DropTable
DROP TABLE "HomeTranslation";

-- DropTable
DROP TABLE "OtherTranslation";

-- DropTable
DROP TABLE "auth_translations";

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Translation_language_key" ON "Translation"("language");
