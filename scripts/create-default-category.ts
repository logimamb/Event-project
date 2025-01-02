import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const category = await prisma.eventCategory.create({
      data: {
        name: 'Conference',
        description: 'Professional conferences and seminars',
        color: '#FF5733',
        icon: '🎤'
      }
    });
    console.log('Created category:', category);
  } catch (error) {
    console.error('Error creating category:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 