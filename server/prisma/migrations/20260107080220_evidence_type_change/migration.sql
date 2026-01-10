-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('FILE', 'LINK');

-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN     "type" "EvidenceType" NOT NULL DEFAULT 'FILE',
ALTER COLUMN "fileName" DROP NOT NULL,
ALTER COLUMN "fileType" DROP NOT NULL;
