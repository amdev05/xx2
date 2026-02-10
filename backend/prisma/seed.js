const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedMasterData() {
    console.log('🌱 Starting seed for master data...');

    try {
        // 1. Seed Tipe Studio
        console.log('📽️ Seeding Tipe Studio...');
        const tipeStudios = await Promise.all([
            prisma.tipeStudio.upsert({
                where: { tipe_studio: 'Regular' },
                update: {},
                create: {
                    tipe_studio: 'Regular',
                    deskripsi: 'Studio reguler dengan fasilitas standar'
                }
            }),
            prisma.tipeStudio.upsert({
                where: { tipe_studio: 'IMAX' },
                update: {},
                create: {
                    tipe_studio: 'IMAX',
                    deskripsi: 'Studio dengan layar IMAX dan sound system premium'
                }
            }),
            prisma.tipeStudio.upsert({
                where: { tipe_studio: '4DX' },
                update: {},
                create: {
                    tipe_studio: '4DX',
                    deskripsi: 'Studio dengan efek 4D (getar, angin, air, aroma)'
                }
            }),
            prisma.tipeStudio.upsert({
                where: { tipe_studio: 'Premium' },
                update: {},
                create: {
                    tipe_studio: 'Premium',
                    deskripsi: 'Studio premium dengan kursi recliner dan layanan eksklusif'
                }
            })
        ]);
        console.log(`✅ ${tipeStudios.length} Tipe Studio created`);

        // 2. Seed Tipe Hari
        console.log('📅 Seeding Tipe Hari...');
        const tipeHaris = await Promise.all([
            prisma.tipeHari.upsert({
                where: { tipe_hari: 'Weekday' },
                update: {},
                create: {
                    tipe_hari: 'Weekday',
                    deskripsi: 'Senin - Kamis'
                }
            }),
            prisma.tipeHari.upsert({
                where: { tipe_hari: 'Weekend' },
                update: {},
                create: {
                    tipe_hari: 'Weekend',
                    deskripsi: 'Jumat - Minggu'
                }
            }),
            prisma.tipeHari.upsert({
                where: { tipe_hari: 'Holiday' },
                update: {},
                create: {
                    tipe_hari: 'Holiday',
                    deskripsi: 'Hari libur nasional'
                }
            })
        ]);
        console.log(`✅ ${tipeHaris.length} Tipe Hari created`);

        // 3. Seed Metode Pembayaran
        console.log('💳 Seeding Metode Pembayaran...');
        const metodePembayarans = await Promise.all([
            prisma.metodePembayaran.upsert({
                where: { metode_pembayaran: 'Cash' },
                update: {},
                create: {
                    metode_pembayaran: 'Cash',
                    deskripsi: 'Pembayaran tunai di kasir',
                    aktif: true
                }
            }),
            prisma.metodePembayaran.upsert({
                where: { metode_pembayaran: 'Credit Card' },
                update: {},
                create: {
                    metode_pembayaran: 'Credit Card',
                    deskripsi: 'Kartu kredit (Visa, Mastercard, JCB)',
                    aktif: true
                }
            }),
            prisma.metodePembayaran.upsert({
                where: { metode_pembayaran: 'Debit Card' },
                update: {},
                create: {
                    metode_pembayaran: 'Debit Card',
                    deskripsi: 'Kartu debit',
                    aktif: true
                }
            }),
            prisma.metodePembayaran.upsert({
                where: { metode_pembayaran: 'GoPay' },
                update: {},
                create: {
                    metode_pembayaran: 'GoPay',
                    deskripsi: 'E-Wallet GoPay',
                    aktif: true
                }
            }),
            prisma.metodePembayaran.upsert({
                where: { metode_pembayaran: 'OVO' },
                update: {},
                create: {
                    metode_pembayaran: 'OVO',
                    deskripsi: 'E-Wallet OVO',
                    aktif: true
                }
            }),
            prisma.metodePembayaran.upsert({
                where: { metode_pembayaran: 'DANA' },
                update: {},
                create: {
                    metode_pembayaran: 'DANA',
                    deskripsi: 'E-Wallet DANA',
                    aktif: true
                }
            }),
            prisma.metodePembayaran.upsert({
                where: { metode_pembayaran: 'Bank Transfer' },
                update: {},
                create: {
                    metode_pembayaran: 'Bank Transfer',
                    deskripsi: 'Transfer bank (BCA, Mandiri, BNI, BRI)',
                    aktif: true
                }
            })
        ]);
        console.log(`✅ ${metodePembayarans.length} Metode Pembayaran created`);

        console.log('\n🎉 Seed master data completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding master data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed
seedMasterData();
