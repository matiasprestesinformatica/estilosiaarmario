/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `ClothingItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClothingItem" DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "Outfit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outfit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannedOutfit" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "outfitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlannedOutfit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OutfitClothingItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OutfitClothingItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlannedOutfit_date_key" ON "PlannedOutfit"("date");

-- CreateIndex
CREATE INDEX "_OutfitClothingItems_B_index" ON "_OutfitClothingItems"("B");

-- AddForeignKey
ALTER TABLE "PlannedOutfit" ADD CONSTRAINT "PlannedOutfit_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OutfitClothingItems" ADD CONSTRAINT "_OutfitClothingItems_A_fkey" FOREIGN KEY ("A") REFERENCES "ClothingItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OutfitClothingItems" ADD CONSTRAINT "_OutfitClothingItems_B_fkey" FOREIGN KEY ("B") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
