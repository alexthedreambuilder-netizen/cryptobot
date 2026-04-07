import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('bamboleo1212', 10)
  
  const admin = await prisma.user.upsert({
    where: { username: 'bamboleo1121' },
    update: {},
    create: {
      username: 'bamboleo1121',
      password: adminPassword,
      isAdmin: true,
      points: 0,
      level: 0,
    },
  })
  
  console.log('Admin created:', admin.username)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
