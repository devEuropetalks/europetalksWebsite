-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSignup" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeTranslation" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeaderTranslation" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeaderTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutTranslation" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactTranslation" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventsTranslation" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventsTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryTranslation" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentsTranslation" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComponentsTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherTranslation" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtherTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_translations" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventSignup_eventId_idx" ON "EventSignup"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeTranslation_language_key" ON "HomeTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "HeaderTranslation_language_key" ON "HeaderTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "AboutTranslation_language_key" ON "AboutTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "ContactTranslation_language_key" ON "ContactTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "EventsTranslation_language_key" ON "EventsTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryTranslation_language_key" ON "GalleryTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentsTranslation_language_key" ON "ComponentsTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "OtherTranslation_language_key" ON "OtherTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "auth_translations_language_key" ON "auth_translations"("language");

-- AddForeignKey
ALTER TABLE "EventSignup" ADD CONSTRAINT "EventSignup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
