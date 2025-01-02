/*
  Warnings:

  - Added the required column `capacity` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "location" TEXT;
