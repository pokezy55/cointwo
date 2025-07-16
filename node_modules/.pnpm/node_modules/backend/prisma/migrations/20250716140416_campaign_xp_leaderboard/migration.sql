-- CreateTable
CREATE TABLE "CampaignProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "season" TEXT,

    CONSTRAINT "CampaignProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserXP" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "lastActionAt" TIMESTAMP(3) NOT NULL,
    "season" TEXT,

    CONSTRAINT "UserXP_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CampaignProgress" ADD CONSTRAINT "CampaignProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserXP" ADD CONSTRAINT "UserXP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
