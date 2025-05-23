// scripts/create-admin.cjs
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { connectDB } = require('../dist/lib/mongodb');
const User = require('../dist/models/User');

async function createAdmin() {
    try {
        await connectDB();

        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin ya existe');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        await User.create({
            username: 'admin',
            password: hashedPassword,
            rol: 'admin',
        });

        console.log('Usuario admin creado exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('Error creando el usuario admin:', error);
        process.exit(1);
    }
}

createAdmin();