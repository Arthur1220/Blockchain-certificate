-- CreateEnum
CREATE TYPE "public"."InstitutionRole" AS ENUM ('STUDENT', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."InstitutionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "public"."CertificateStatus" AS ENUM ('VALID', 'REVOKED', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."BlockchainStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT,
    "cpf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InstitutionMembership" (
    "role" "public"."InstitutionRole" NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,

    CONSTRAINT "InstitutionMembership_pkey" PRIMARY KEY ("userId","institutionId")
);

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "logo" TEXT,
    "officialSite" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "status" "public"."InstitutionStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "addressId" TEXT NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "workload" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "institutionId" TEXT NOT NULL,

    CONSTRAINT "CourseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Certificate" (
    "id" TEXT NOT NULL,
    "certificateCode" TEXT NOT NULL,
    "ipfsHash" TEXT NOT NULL,
    "blockchainHash" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "status" "public"."CertificateStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "issuerId" TEXT,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Revocation" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateId" TEXT NOT NULL,
    "revokerId" TEXT NOT NULL,

    CONSTRAINT "Revocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlockchainRecord" (
    "id" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "status" "public"."BlockchainStatus" NOT NULL DEFAULT 'SUCCESS',
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cryptoAsset" TEXT NOT NULL,
    "transactionFeeInCrypto" DECIMAL(65,30) NOT NULL,
    "cryptoPriceInBRL" DECIMAL(65,30) NOT NULL,
    "transactionFeeInBRL" DECIMAL(65,30) NOT NULL,
    "certificateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BlockchainRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "public"."User"("cpf");

-- CreateIndex
CREATE INDEX "InstitutionMembership_institutionId_idx" ON "public"."InstitutionMembership"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_name_key" ON "public"."Institution"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_cnpj_key" ON "public"."Institution"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_addressId_key" ON "public"."Institution"("addressId");

-- CreateIndex
CREATE INDEX "CourseTemplate_institutionId_idx" ON "public"."CourseTemplate"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseTemplate_name_institutionId_key" ON "public"."CourseTemplate"("name", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateCode_key" ON "public"."Certificate"("certificateCode");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_ipfsHash_key" ON "public"."Certificate"("ipfsHash");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_blockchainHash_key" ON "public"."Certificate"("blockchainHash");

-- CreateIndex
CREATE INDEX "Certificate_status_idx" ON "public"."Certificate"("status");

-- CreateIndex
CREATE INDEX "Certificate_ownerId_idx" ON "public"."Certificate"("ownerId");

-- CreateIndex
CREATE INDEX "Certificate_courseId_idx" ON "public"."Certificate"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Revocation_certificateId_key" ON "public"."Revocation"("certificateId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainRecord_transactionHash_key" ON "public"."BlockchainRecord"("transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainRecord_certificateId_key" ON "public"."BlockchainRecord"("certificateId");

-- AddForeignKey
ALTER TABLE "public"."InstitutionMembership" ADD CONSTRAINT "InstitutionMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstitutionMembership" ADD CONSTRAINT "InstitutionMembership_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Institution" ADD CONSTRAINT "Institution_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseTemplate" ADD CONSTRAINT "CourseTemplate_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certificate" ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."CourseTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certificate" ADD CONSTRAINT "Certificate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certificate" ADD CONSTRAINT "Certificate_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Revocation" ADD CONSTRAINT "Revocation_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "public"."Certificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Revocation" ADD CONSTRAINT "Revocation_revokerId_fkey" FOREIGN KEY ("revokerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlockchainRecord" ADD CONSTRAINT "BlockchainRecord_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "public"."Certificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlockchainRecord" ADD CONSTRAINT "BlockchainRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
