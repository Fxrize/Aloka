// backend/prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Aloka database seeding...");

  // 1. Password hash default
  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  // 2. Seed Government Admin
  const govUser = await prisma.user.upsert({
    where: { email: "admin@kemendikbud.go.id" },
    update: {},
    create: {
      email: "admin@kemendikbud.go.id",
      passwordHash: defaultPasswordHash,
      role: "GOVERNMENT",
    },
  });
  console.log(`✅ Seeded Government User: ${govUser.email}`);

  // 3. Seed School (Satuan Pendidikan)
  const school = await prisma.school.upsert({
    where: { npsn: "20301234" },
    update: {},
    create: {
      npsn: "20301234",
      name: "SMAN 1 Purwokerto",
      address: "Jl. Gatot Subroto No. 73, Purwokerto",
      validatorWallet: "0x5C00100000000000000000000000000000000001",
    },
  });
  console.log(`✅ Seeded School: ${school.name} (NPSN: ${school.npsn})`);

  // 4. Seed School User (Akun Login Pihak Sekolah)
  const schoolUser = await prisma.user.upsert({
    where: { email: "sman1pwt@sekolah.id" },
    update: {},
    create: {
      email: "sman1pwt@sekolah.id",
      passwordHash: defaultPasswordHash,
      role: "SCHOOL",
      schoolId: school.id,
    },
  });
  console.log(`✅ Seeded School User: ${schoolUser.email}`);

  // 5. Seed Student (Siswa Calon Penerima PIP)
  const student = await prisma.student.upsert({
    where: { nisn: "0071234567" },
    update: {},
    create: {
      nisn: "0071234567",
      fullName: "Budi Pratama",
      dateOfBirth: new Date("2007-05-15"),
      phoneOrEmail: "081234567890",
      gradeLevel: "SMA",
      isActive: true,
      schoolId: school.id,
      // Wallet contoh siswa (sudah dibind untuk testing langsung)
      walletAddress: "0xA11CE00000000000000000000000000000000001".toLowerCase(),
      walletBoundAt: new Date(),
    },
  });
  console.log(`✅ Seeded Student: ${student.fullName} (NISN: ${student.nisn})`);

  // 6. Seed Rekomendasi Sekolah yang sudah approved
  const recommendation = await prisma.schoolRecommendation.upsert({
    where: { studentId: student.id },
    update: {},
    create: {
      studentId: student.id,
      schoolId: school.id,
      referenceNumber: "SMAN1/PIP/2026/001",
      isApproved: true,
      approvedAt: new Date(),
    },
  });
  console.log(`✅ Seeded Recommendation: Ref ${recommendation.referenceNumber} (Approved: ${recommendation.isApproved})`);

  console.log("\n🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
