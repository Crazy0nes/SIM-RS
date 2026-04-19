import 'dotenv/config';
import { Role } from '@prisma/client'
import { prisma } from '../src/lib/prisma'

async function main() {
  console.log(`Start seeding ...`)

  // 1. Create Polikliniks
  const poliUmum = await prisma.poliklinik.upsert({
    where: { namaPoli: "Poli Umum" },
    update: {},
    create: { namaPoli: "Poli Umum" }
  })
  
  const poliGigi = await prisma.poliklinik.upsert({
    where: { namaPoli: "Poli Gigi" },
    update: {},
    create: { namaPoli: "Poli Gigi" }
  })
  
  await prisma.poliklinik.upsert({
    where: { namaPoli: "Poli Kandungan" },
    update: {},
    create: { namaPoli: "Poli Kandungan" }
  })

  // 2. Create Sample Management User
  await prisma.user.upsert({
    where: { username: "admin_rs" },
    update: {},
    create: {
      username: "admin_rs",
      password: "password123", // Dummy plaintext for MVP, in real should be hashed
      role: Role.MANAJEMEN
    }
  })

  // 3. Create Sample Doctors
  await prisma.user.upsert({
    where: { username: "dr_agus" },
    update: {},
    create: {
      username: "dr_agus",
      password: "password123",
      role: Role.DOKTER,
      dokter: {
        create: {
          namaLengkap: "dr. Agus Setiawan",
          spesialisasi: "Dokter Umum",
          poliklinikId: poliUmum.id
        }
      }
    }
  })

  await prisma.user.upsert({
    where: { username: "drg_budi" },
    update: {},
    create: {
      username: "drg_budi",
      password: "password123",
      role: Role.DOKTER,
      dokter: {
        create: {
          namaLengkap: "drg. Budi Santoso",
          spesialisasi: "Dokter Gigi",
          poliklinikId: poliGigi.id
        }
      }
    }
  })

  // 4. Create Sample Patient
  await prisma.user.upsert({
    where: { username: "pasien_test" },
    update: {},
    create: {
      username: "pasien_test",
      password: "password123",
      role: Role.PASIEN,
      pasien: {
        create: {
          namaLengkap: "Dewi Lestari",
          nik: "3201234567890001"
        }
      }
    }
  })

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
