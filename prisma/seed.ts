import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Hardcoded admin users
const ADMIN_USERS = [
  {
    name: "Abdellatif Elfany",
    email: "abdellatif.elfany@example.com",
    role: "admin" as const,
    password: "Admin@2024!SecurePass1",
    salary: "120000.00",
    startDate: new Date("2019-01-15"),
  },
  {
    name: "Mohamed Telti",
    email: "mohamed.telti@example.com",
    role: "admin" as const,
    password: "Mohamed@2024!AdminPass2",
    salary: "115000.00",
    startDate: new Date("2020-03-20"),
  },
  {
    name: "Driss Sijelmassi",
    email: "driss.sijelmassi@example.com",
    role: "admin" as const,
    password: "Driss@2024!SuperAdmin3",
    salary: "118000.00",
    startDate: new Date("2018-11-10"),
  },
];

// Hardcoded member users
const MEMBER_USERS = [
  {
    name: "Test Member One",
    email: "member1@example.com",
    role: "member" as const,
    password: "Member@2024!TestPass1",
    salary: "55000.00",
    startDate: new Date("2023-06-01"),
  },
  {
    name: "Test Member Two",
    email: "member2@example.com",
    role: "member" as const,
    password: "Member@2024!TestPass2",
    salary: "58000.00",
    startDate: new Date("2024-01-15"),
  },
];

// Existing seed users (25 users)
const SEED_USERS: Array<{
  name: string;
  email: string;
  role: Role;
  salary: string;
  startDate: Date;
}> = [
  { name: "Amina El Idrissi", email: "amina.elidrissi@example.com", role: "admin", salary: "95000.00", startDate: new Date("2020-02-15") },
  { name: "Youssef Benali", email: "youssef.benali@example.com", role: "member", salary: "68500.50", startDate: new Date("2021-06-01") },
  { name: "Salma Chraibi", email: "salma.chraibi@example.com", role: "admin", salary: "102400.00", startDate: new Date("2019-09-10") },
  { name: "Omar Tazi", email: "omar.tazi@example.com", role: "member", salary: "61200.75", startDate: new Date("2022-03-20") },
  { name: "Khadija Berrada", email: "khadija.berrada@example.com", role: "member", salary: "73000.00", startDate: new Date("2021-11-05") },
  { name: "Mehdi Alaoui", email: "mehdi.alaoui@example.com", role: "admin", salary: "89900.25", startDate: new Date("2020-08-12") },
  { name: "Nadia Mansouri", email: "nadia.mansouri@example.com", role: "member", salary: "58400.00", startDate: new Date("2023-01-18") },
  { name: "Hamza Kettani", email: "hamza.kettani@example.com", role: "member", salary: "64750.00", startDate: new Date("2022-07-04") },
  { name: "Zineb Fassi", email: "zineb.fassi@example.com", role: "admin", salary: "110000.00", startDate: new Date("2018-04-22") },
  { name: "Tariq Ouazzani", email: "tariq.ouazzani@example.com", role: "member", salary: "55000.00", startDate: new Date("2024-02-01") },
  { name: "Imane Bennani", email: "imane.bennani@example.com", role: "member", salary: "71250.50", startDate: new Date("2021-05-14") },
  { name: "Rachid Lahlou", email: "rachid.lahlou@example.com", role: "member", salary: "67800.00", startDate: new Date("2022-09-30") },
  { name: "Hajar Zniber", email: "hajar.zniber@example.com", role: "admin", salary: "98500.00", startDate: new Date("2020-01-08") },
  { name: "Karim Sefrioui", email: "karim.sefrioui@example.com", role: "member", salary: "62300.00", startDate: new Date("2023-04-11") },
  { name: "Meryem Cherkaoui", email: "meryem.cherkaoui@example.com", role: "member", salary: "74900.00", startDate: new Date("2021-03-19") },
  { name: "Anas Belkacem", email: "anas.belkacem@example.com", role: "member", salary: "59600.00", startDate: new Date("2023-10-02") },
  { name: "Soukaina Rahmani", email: "soukaina.rahmani@example.com", role: "admin", salary: "91200.00", startDate: new Date("2020-11-16") },
  { name: "Badr Lamrani", email: "badr.lamrani@example.com", role: "member", salary: "66000.00", startDate: new Date("2022-05-25") },
  { name: "Ghita Benjelloun", email: "ghita.benjelloun@example.com", role: "member", salary: "70400.80", startDate: new Date("2021-08-09") },
  { name: "Adil Moussaoui", email: "adil.moussaoui@example.com", role: "member", salary: "53200.00", startDate: new Date("2024-06-15") },
  { name: "Lina Bouhaddou", email: "lina.bouhaddou@example.com", role: "admin", salary: "105300.00", startDate: new Date("2019-03-03") },
  { name: "Saad El Amrani", email: "saad.elamrani@example.com", role: "member", salary: "63900.00", startDate: new Date("2022-12-01") },
  { name: "Houda Guessous", email: "houda.guessous@example.com", role: "member", salary: "76100.00", startDate: new Date("2021-01-27") },
  { name: "Nabil Filali", email: "nabil.filali@example.com", role: "member", salary: "60500.00", startDate: new Date("2023-07-17") },
  { name: "Rania Naciri", email: "rania.naciri@example.com", role: "admin", salary: "93750.00", startDate: new Date("2020-05-06") },
];

const SEED_PROJECTS = [
  { name: "Core Billing Engine", status: "active", budget: "120000.00" },
  { name: "Customer Portal v2", status: "active", budget: "85000.00" },
  { name: "Internal Analytics", status: "completed", budget: "42000.00" },
  { name: "Auth & SSO Migration", status: "active", budget: "64000.00" },
  { name: "Mobile API Gateway", status: "planned", budget: "95000.00" },
  { name: "Design System Refresh", status: "completed", budget: "31000.00" },
  { name: "Automated QA Pipeline", status: "active", budget: "28500.00" },
  { name: "Data Warehouse Sync", status: "active", budget: "77000.00" },
  { name: "Partner Webhook Service", status: "planned", budget: "49000.00" },
  { name: "Compliance Audit Trail", status: "completed", budget: "38000.00" },
  { name: "Search Index Optimization", status: "active", budget: "54000.00" },
  { name: "Notification Center", status: "planned", budget: "41000.00" },
  { name: "Multi-Region Failover", status: "active", budget: "135000.00" },
  { name: "Self-Serve Onboarding", status: "completed", budget: "36500.00" },
  { name: "Invoice PDF Generator", status: "active", budget: "22000.00" },
];

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  // First, create hardcoded admin and member users
  console.log("Creating hardcoded admin users...");
  for (const user of ADMIN_USERS) {
    const hashedPassword = await hashPassword(user.password);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        password: hashedPassword,
        salary: user.salary,
        startDate: user.startDate,
      },
    });
    console.log(`  Created admin: ${user.name} (${user.email})`);
  }

  console.log("Creating hardcoded member users...");
  for (const user of MEMBER_USERS) {
    const hashedPassword = await hashPassword(user.password);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        password: hashedPassword,
        salary: user.salary,
        startDate: user.startDate,
      },
    });
    console.log(`  Created member: ${user.name} (${user.email})`);
  }

  // Then seed the remaining users (without passwords - they won't be able to log in)
  console.log("Seeding additional users...");
  for (const user of SEED_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  const existingProjects = await prisma.project.count();
  if (existingProjects === 0) {
    await prisma.project.createMany({
      data: SEED_PROJECTS,
    });
  }

  console.log(`Seeded ${ADMIN_USERS.length} admin users, ${MEMBER_USERS.length} member users, ${SEED_USERS.length} additional users, and ${SEED_PROJECTS.length} projects.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
