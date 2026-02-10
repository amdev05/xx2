# 🎬 Cinema Management Backend API v2.0

Backend sistem manajemen bioskop yang lengkap dengan fitur dynamic pricing, seat management, dan booking system yang terintegrasi. Dibangun menggunakan Express.js dan Prisma ORM dengan MySQL.

## 📋 Fitur

- ✅ **Manajemen Film**: CRUD film dengan informasi lengkap (sutradara, publisher, batas umur)
- ✅ **Manajemen Cabang & Studio**: Kelola cabang bioskop dengan berbagai studio dan tipe
- ✅ **Manajemen Kursi**: Tracking kursi individual per studio dengan status real-time
- ✅ **Jadwal Tayang**: Atur jadwal tayang film dengan auto-generate seat status
- ✅ **Dynamic Pricing**: Harga tiket berdasarkan cabang, tipe studio, dan tipe hari
- ✅ **Pemesanan Tiket**: Sistem booking tiket dengan validasi seat availability
- ✅ **Status Management**: Track status kursi (TERSEDIA → DIPESAN → TERJUAL)
- ✅ **Metode Pembayaran**: Support berbagai metode pembayaran (Cash, E-Wallet, dll)
- ✅ **Autentikasi**: JWT-based authentication dengan role-based access
- ✅ **Master Data**: Seed script untuk data awal (Tipe Studio, Tipe Hari, Metode Bayar)

## 🏗️ Arsitektur Database

### ERD (Entity Relationship Diagram)

Sistem ini mengimplementasikan 12 entitas utama dengan relasi yang kompleks:

**Master Data:**
- `TipeStudio` - Tipe studio bioskop (Regular, IMAX, 4DX, Premium)
- `TipeHari` - Kategori hari untuk pricing (Weekday, Weekend, Holiday)
- `MetodePembayaran` - Metode pembayaran yang tersedia

**Location & Venue:**
- `Cabang` - Cabang/lokasi bioskop
- `Studio` - Studio di setiap cabang
- `Kursi` - Kursi fisik di setiap studio (row + nomor)

**Content & Scheduling:**
- `Film` - Data film yang ditayangkan
- `Jadwal` - Jadwal tayang film di studio
- `StatusKursi` - Status ketersediaan kursi per jadwal

**Pricing & Booking:**
- `AturanHarga` - Aturan harga dinamis (cabang × tipe studio × tipe hari)
- `Pelanggan` - User/customer dengan authentication
- `Tiket` - Tiket pemesanan dengan payment tracking

## 🛠️ Teknologi

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Prisma
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator

## 📦 Instalasi

### 1. Clone atau Extract Project

```bash
cd "BELAJAR BACKEND/BIOSKOP TUBES"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
copy .env.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi database Anda:

```env
# Database Configuration
DATABASE_URL="mysql://root:password@localhost:3306/cinema_db"

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Setup Database

Generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Seed master data (Tipe Studio, Tipe Hari, Metode Pembayaran):

```bash
npm run prisma:seed
```

### 5. Jalankan Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 📚 API Endpoints

### Health Check

```
GET / - Cek status API
```

### 👤 User Authentication

```
POST   /user/register          - Registrasi user baru
POST   /user/login             - Login user
GET    /user/profile           - Get user profile (Auth)
PUT    /user/profile           - Update profile (Auth)
```

**Contoh Register:**
```json
POST /user/register
{
  "email": "user@example.com",
  "password": "password123",
  "nama_pelanggan": "John Doe"
}
```

**Contoh Login:**
```json
POST /user/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 🎥 Film Management

```
GET    /films                  - List semua film
GET    /films/:id              - Detail film dengan jadwal tayang
POST   /films                  - Tambah film baru (Admin)
PUT    /films/:id              - Update film (Admin)
DELETE /films/:id              - Hapus film (Admin)
```

**Query Parameters:**
- `genre` - Filter berdasarkan genre
- `batas_umur` - Filter berdasarkan batas umur

**Contoh Create Film:**
```json
POST /films
Authorization: Bearer <admin_token>
{
  "nama_film": "Avengers: Endgame",
  "durasi": 181,
  "genre": "Action, Sci-Fi",
  "batas_umur": "13+",
  "sutradara": "Anthony Russo, Joe Russo",
  "publisher": "Marvel Studios",
  "poster_url": "https://example.com/poster.jpg",
  "deskripsi": "After the devastating events...",
  "tanggal_rilis": "2024-04-26"
}
```

### 🏢 Cabang Management (Cinema Branches)

```
GET    /cabang                 - List semua cabang
GET    /cabang/:id             - Detail cabang dengan studio
POST   /cabang                 - Tambah cabang baru (Admin)
PUT    /cabang/:id             - Update cabang (Admin)
DELETE /cabang/:id             - Hapus cabang (Admin)
```

**Contoh Create Cabang:**
```json
POST /cabang
Authorization: Bearer <admin_token>
{
  "nama_cabang": "Cinema XXI Grand Indonesia",
  "alamat": "Jl. MH Thamrin No.1, Jakarta Pusat"
}
```

### 🎭 Tipe Studio Management (Studio Types)

```
GET    /tipe-studio            - List semua tipe studio
POST   /tipe-studio            - Tambah tipe studio (Admin)
PUT    /tipe-studio/:id        - Update tipe studio (Admin)
DELETE /tipe-studio/:id        - Hapus tipe studio (Admin)
```

### 🎬 Studio Management

```
GET    /studios                - List semua studio
GET    /studios/:id            - Detail studio dengan kursi
POST   /studios                - Tambah studio baru (Admin)
PUT    /studios/:id            - Update studio (Admin)
DELETE /studios/:id            - Hapus studio (Admin)
```

**Query Parameters:**
- `id_cabang` - Filter berdasarkan cabang

**Contoh Create Studio:**
```json
POST /studios
Authorization: Bearer <admin_token>
{
  "id_cabang": 1,
  "no_studio": "1",
  "id_tipe_studio": 2,
  "kapasitas_total": 100
}
```

### 💺 Kursi Management (Seats)

```
GET    /kursi/studio/:id_studio           - List kursi per studio
POST   /kursi/bulk                        - Generate kursi otomatis (Admin)
DELETE /kursi/:id                         - Hapus kursi (Admin)
DELETE /kursi/studio/:id_studio/all      - Hapus semua kursi di studio (Admin)
```

**Contoh Bulk Create Kursi:**
```json
POST /kursi/bulk
Authorization: Bearer <admin_token>
{
  "id_studio": 1,
  "rows": ["A", "B", "C", "D", "E"],
  "seatsPerRow": 20
}
```
*Akan membuat kursi A1-A20, B1-B20, C1-C20, D1-D20, E1-E20 (total 100 kursi)*

### 📅 Jadwal Management (Showtimes)

```
GET    /jadwal                 - List jadwal tayang
GET    /jadwal/:id             - Detail jadwal dengan ketersediaan kursi
POST   /jadwal                 - Buat jadwal baru (Admin)
PUT    /jadwal/:id             - Update jadwal (Admin)
DELETE /jadwal/:id             - Hapus jadwal (Admin)
```

**Query Parameters:**
- `id_film` - Filter berdasarkan film
- `id_studio` - Filter berdasarkan studio
- `id_cabang` - Filter berdasarkan cabang
- `tanggal` - Filter berdasarkan tanggal (YYYY-MM-DD)

**Contoh Create Jadwal:**
```json
POST /jadwal
Authorization: Bearer <admin_token>
{
  "id_film": 1,
  "id_studio": 1,
  "tanggal": "2026-01-10",
  "jam_mulai": "14:00:00",
  "jam_selesai": "17:00:00"
}
```
*Note: Sistem otomatis membuat StatusKursi untuk semua kursi di studio*

### 📆 Tipe Hari Management (Day Types)

```
GET    /tipe-hari              - List semua tipe hari
POST   /tipe-hari              - Tambah tipe hari (Admin)
PUT    /tipe-hari/:id          - Update tipe hari (Admin)
DELETE /tipe-hari/:id          - Hapus tipe hari (Admin)
```

### 💰 Aturan Harga Management (Pricing Rules)

```
GET    /aturan-harga                          - List semua aturan harga
GET    /aturan-harga/price?params             - Get harga spesifik
POST   /aturan-harga                          - Tambah aturan harga (Admin)
PUT    /aturan-harga/:id                      - Update aturan harga (Admin)
DELETE /aturan-harga/:id                      - Hapus aturan harga (Admin)
```

**Query Parameters untuk /price:**
- `id_cabang` - ID cabang
- `id_tipe_studio` - ID tipe studio
- `id_tipe_hari` - ID tipe hari

**Contoh Create Aturan Harga:**
```json
POST /aturan-harga
Authorization: Bearer <admin_token>
{
  "id_cabang": 1,
  "id_tipe_studio": 2,
  "id_tipe_hari": 1,
  "harga": 50000
}
```

### 💳 Metode Pembayaran Management

```
GET    /metode-pembayaran                     - List metode pembayaran aktif
POST   /metode-pembayaran                     - Tambah metode pembayaran (Admin)
PUT    /metode-pembayaran/:id                 - Update metode pembayaran (Admin)
DELETE /metode-pembayaran/:id                 - Hapus metode pembayaran (Admin)
```

### 🎫 Ticket Booking

```
GET    /tickets                - List tiket user (Auth)
GET    /tickets/:id            - Detail tiket (Auth)
POST   /tickets/book           - Book tiket (Auth)
POST   /tickets/:id/confirm    - Confirm pembayaran (Auth)
GET    /tickets/:id/status     - Status tiket (Auth)
DELETE /tickets/:id            - Cancel booking (Auth)
```

**Contoh Book Ticket:**
```json
POST /tickets/book
Authorization: Bearer <user_token>
{
  "id_jadwal": 1,
  "id_kursi": 15,
  "id_tipe_hari": 1,
  "id_metode_pembayaran": 1
}
```

**Contoh Confirm Payment:**
```http
POST /tickets/1/confirm
Authorization: Bearer <user_token>
```

### 📊 Admin Reports

```
GET    /reports/tickets-sold   - Laporan tiket terjual (Admin)
GET    /reports/revenue        - Laporan revenue (Admin)
GET    /reports/popular-films  - Film terpopuler (Admin)
```

**Query Parameters:**
- `startDate` - Tanggal mulai (YYYY-MM-DD)
- `endDate` - Tanggal akhir (YYYY-MM-DD)
- `limit` - Limit hasil (untuk popular films)

## 🔐 Authentication

API menggunakan JWT Bearer Token untuk autentikasi. Setelah login/register, gunakan token yang diberikan:

```
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access:
- **USER**: Dapat booking tiket, lihat profil, dan riwayat transaksi
- **ADMIN**: Akses penuh untuk manage semua resource dan lihat reports

## 👨‍💼 Membuat Admin User

Karena registrasi default membuat user dengan role `USER`, untuk membuat admin user:

1. Buka Prisma Studio:
```bash
npx prisma studio
```

2. Buka tabel `pelanggan`
3. Edit user yang ingin dijadikan admin
4. Ubah field `role` dari `USER` menjadi `ADMIN`
5. Save perubahan

Atau gunakan MySQL query:

```sql
UPDATE `pelanggan` SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

## 📖 Database Schema Summary

### Master Data Tables
| Table | Description | Key Fields |
|-------|-------------|------------|
| `tipeStudio` | Tipe studio bioskop | tipe_studio (Regular, IMAX, 4DX, Premium) |
| `tipeHari` | Kategori hari | tipe_hari (Weekday, Weekend, Holiday) |
| `metodePembayaran` | Metode pembayaran | metode_pembayaran, aktif |

### Core Tables
| Table | Description | Key Relationships |
|-------|-------------|-------------------|
| `cabang` | Cabang bioskop | → studios |
| `studio` | Studio di cabang | cabang, tipeStudio → kursis, jadwals |
| `kursi` | Kursi di studio | studio → statusKursis, tikets |
| `film` | Film yang ditayangkan | → jadwals |
| `jadwal` | Jadwal tayang | film, studio → statusKursis, tikets |
| `statusKursi` | Status kursi per jadwal | jadwal, kursi |
| `aturanHarga` | Harga dinamis | cabang, tipeStudio, tipeHari |
| `pelanggan` | User/customer | → tikets |
| `tiket` | Tiket pemesanan | jadwal, kursi, pelanggan, metodePembayaran |

## 💡 Fitur Utama

### 1. Dynamic Pricing System

Harga tiket dihitung berdasarkan 3 faktor:
- **Cabang**: Lokasi bioskop (Jakarta vs Bandung, dll)
- **Tipe Studio**: Regular < Premium < IMAX < 4DX
- **Tipe Hari**: Weekday < Weekend < Holiday

Contoh kombinasi:
- IMAX Jakarta Weekend = Rp 75.000
- Regular Bandung Weekday = Rp 30.000
- 4DX Jakarta Holiday = Rp 100.000

### 2. Seat Management

- Setiap studio memiliki kursi fisik dengan row (A, B, C...) dan nomor (1, 2, 3...)
- Status kursi tracked per jadwal:
  - **TERSEDIA**: Kursi tersedia untuk booking
  - **DIPESAN**: Kursi sudah di-book, menunggu payment
  - **TERJUAL**: Payment confirmed, kursi sold
- Bulk creation untuk efisiensi (generate 100 kursi sekaligus)

### 3. Booking Flow

```
1. User browse films → GET /films
2. User pilih film & lihat jadwal → GET /jadwal?id_film=1
3. User lihat ketersediaan kursi → GET /jadwal/:id
4. User book kursi tertentu → POST /tickets/book
   ↳ Status kursi: TERSEDIA → DIPESAN
   ↳ Harga auto-calculate dari aturanHarga
   ↳ Status tiket: PENDING
5. User confirm payment → POST /tickets/:id/confirm
   ↳ Status kursi: DIPESAN → TERJUAL
   ↳ Status tiket: CONFIRMED
6. User view tiket → GET /tickets
```

### 4. Automatic Initialization

Saat admin membuat jadwal baru:
- Sistem otomatis create `StatusKursi` untuk SEMUA kursi di studio
- Semua kursi di-set status `TERSEDIA`
- Siap untuk booking tanpa setup tambahan

## 🔧 Scripts NPM

```bash
npm run dev              # Jalankan development server
npm start                # Jalankan production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:push      # Push schema ke database (deprecated)
npm run prisma:seed      # Seed master data
npm run prisma:studio    # Buka Prisma Studio GUI
```

## 🗄️ Database Utils

### Prisma Studio GUI

Untuk manage database dengan GUI:

```bash
npx prisma studio
```

### Reset Database

Jika ingin reset database:

```bash
npx prisma migrate reset
```

## 🌐 Testing dengan cURL atau Postman

### Contoh flow lengkap:

#### 1. Setup Admin (One-time)

```bash
# Register admin user
curl -X POST http://localhost:3000/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cinema.com","password":"admin123","nama_pelanggan":"Admin"}'

# Change role to ADMIN via Prisma Studio atau SQL
```

#### 2. Seed Master Data

```bash
npm run prisma:seed
```

#### 3. Setup Infrastructure (Admin)

```bash
# Create cabang
curl -X POST http://localhost:3000/cabang \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"nama_cabang":"XXI Grand Indonesia","alamat":"Jakarta Pusat"}'

# Create studio
curl -X POST http://localhost:3000/studios \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"id_cabang":1,"no_studio":"1","id_tipe_studio":2}'

# Generate kursi
curl -X POST http://localhost:3000/kursi/bulk \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"id_studio":1,"rows":["A","B","C","D","E"],"seatsPerRow":20}'

# Create pricing rules
curl -X POST http://localhost:3000/aturan-harga \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"id_cabang":1,"id_tipe_studio":2,"id_tipe_hari":1,"harga":50000}'
```

#### 4. Add Content (Admin)

```bash
# Create film
curl -X POST http://localhost:3000/films \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"nama_film":"Avengers","durasi":181,"genre":"Action","batas_umur":"13+","sutradara":"Russo","publisher":"Marvel"}'

# Create jadwal
curl -X POST http://localhost:3000/jadwal \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"id_film":1,"id_studio":1,"tanggal":"2026-01-10","jam_mulai":"14:00:00","jam_selesai":"17:00:00"}'
```

#### 5. User Booking

```bash
# Register & login sebagai user
curl -X POST http://localhost:3000/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123","nama_pelanggan":"John Doe"}'

# Book tiket
curl -X POST http://localhost:3000/tickets/book \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{"id_jadwal":1,"id_kursi":15,"id_tipe_hari":1,"id_metode_pembayaran":1}'

# Confirm payment
curl -X POST http://localhost:3000/tickets/1/confirm \
  -H "Authorization: Bearer <user_token>"
```

## 🐛 Troubleshooting

### Error: P1001 - Can't reach database
- Pastikan MySQL sudah running
- Cek `DATABASE_URL` di file `.env`
- Pastikan database `cinema_db` sudah dibuat

### Error: Module not found
```bash
npm install
```

### Error: Prisma Client tidak ditemukan
```bash
npx prisma generate
```

### Error: Migration failed
```bash
npx prisma migrate reset
npx prisma migrate dev
```

## 📝 License

ISC

## 👨‍💻 Author

Cinema Management System v2.0 - Backend API with Dynamic Pricing & Seat Management

---

**Happy Coding! 🚀**
