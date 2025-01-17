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
    console.log(req.user)

    res.render('all-users', { users, loggedUser: req.user });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('An error occurred');
  }
});

router.get('/profile', async (req, res) => {
  try {
    // Verificar si el objeto req.user existe y si el usuario es administrador
    if (!req.user ) {
      return res.redirect("/auth/login-page");
    }

    const user = await prisma.user.findUnique({where:{id:req.user.id},
      include: { Fichas: true } // Incluye las fichas asociadas si es necesario
    });
    console.log(user)

    res.render('user-details', { user });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('An error occurred');
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;  // Get the user ID from the URL (PostgreSQL ID)

    // If the ID is a number (e.g., integer ID), convert it, otherwise use it as a string.
    const userId = parseInt(id, 10);  // For integer IDs, parse it

    if (isNaN(userId)) {
      // If the ID can't be converted to a valid number, handle the error
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Find and delete the user by ID (assuming you're using Prisma with PostgreSQL)
    const deletedUser = await prisma.user.delete({
      where: {
        id: userId,  // Use the user ID to find the user in the database
      },
    });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Redirect after successful deletion
    res.redirect('/users'); // Redirect to users page after deletion
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting user" });
  }
});


module.exports = router;
