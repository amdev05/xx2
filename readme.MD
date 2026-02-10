# LANGKAH INSTALL PROGRAM

## Database

DATABASE

- Aktifkan Server MySQL/XAMPP
- Buka mysql editor/phpmyadmin dan buat db baru dengan nama cinema_db

## Backend

- buka folder projek di terminal
- run: cd backend
- run: npm install
- run: npx prisma generate
- run: npx prisma migrate dev
- run: node src/index.js

- import cinema_db.sql ke database cinema_db

## Frontend

- buka folder projek di terminal baru
- run: cd frontend
- run: npm install
- run: npm run dev

# ROUTE

user: localhost:5173
admin: localhost:5173/admin
cashier: localhost:5173/cashier

# AKUN

user: adem@gmail.com - ademadem1234
admin: admin@cinema.com - admin123
