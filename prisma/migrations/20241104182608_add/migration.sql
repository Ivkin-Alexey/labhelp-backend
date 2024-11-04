-- CreateTable
CREATE TABLE "Equipments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "filesUrl" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,

    CONSTRAINT "Equipments_pkey" PRIMARY KEY ("id")
);
