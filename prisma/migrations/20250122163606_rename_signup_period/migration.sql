/*
  Warnings:

  - You are about to drop the column `signupPeriod` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "signupPeriod",
ADD COLUMN     "signupPeriodJson" JSONB DEFAULT '{}';
