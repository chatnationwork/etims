-- CreateTable
CREATE TABLE "SavedItem" (
    "id" SERIAL NOT NULL,
    "category" TEXT,
    "item" TEXT,
    "quantity" TEXT,
    "amount" TEXT,
    "currency" TEXT,
    "valueOfFund" TEXT,
    "sourceOfFund" TEXT,
    "purposeOfFund" TEXT,
    "cert" TEXT,
    "hsCode" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedItem_pkey" PRIMARY KEY ("id")
);
