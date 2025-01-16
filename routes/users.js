const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Nueva ruta para obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    // Verificar si el objeto req.user existe y si el usuario es administrador
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).send('Access denied');
    }

    const users = await prisma.user.findMany({
      include: { Fichas: true } // Incluye las fichas asociadas si es necesario
    });

    res.render('all-users', { users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('An error occurred');
  }
});

module.exports = router;
