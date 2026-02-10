const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
    try {
        console.log('🌱 Seeding admin user...');

        // Check if admin already exists
        const existingAdmin = await prisma.admin.findUnique({
            where: { email: 'admin@cinema.com' }
        });

        if (existingAdmin) {
            console.log('✅ Admin already exists:', existingAdmin.email);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin
        const admin = await prisma.admin.create({
            data: {
                nama_admin: 'Super Admin',
                email: 'admin@cinema.com',
                password: hashedPassword
            }
        });

        console.log('✅ Admin created successfully!');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password: admin123');
        console.log('🆔 ID:', admin.id_admin);

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
