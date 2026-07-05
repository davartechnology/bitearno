import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Config faucet par défaut
  await prisma.faucetConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      rewardMin: 0.00000050,
      rewardMax: 0.00000200,
      timerMinutes: 60,
      currency: 'BTC',
      isActive: true,
    },
  })

  // Shortlinks de test
  await prisma.shortlink.createMany({
    data: [
      {
        title: 'Visit Crypto News',
        url: 'https://coindesk.com',
        reward: 0.00000100,
        currency: 'BTC',
        visitsRequired: 1,
        isActive: true,
      },
      {
        title: 'Learn About Bitcoin',
        url: 'https://bitcoin.org',
        reward: 0.00000150,
        currency: 'BTC',
        visitsRequired: 1,
        isActive: true,
      },
      {
        title: 'Crypto Market Watch',
        url: 'https://coinmarketcap.com',
        reward: 0.00000200,
        currency: 'BTC',
        visitsRequired: 1,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed completed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
