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
  console.log('Request method:', req.method);
  try {
    const { id } = req.params;



    // if (isNaN(id)) {
    //   console.log(id);
    //   return res.status(400).json({ message: "Invalid user ID" });
    // }

    const deletedUser = await prisma.user.delete({
      where: {
        id,
      },
    });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.redirect('/users');
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

router.get("/edit/:id", async (req, res) => {
try {
    // Verify admin authentication
    if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).send('Access denied');
    }

    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
    where: { id },
    include: { Fichas: true }
    });

    if (!user) {
    return res.status(404).send('User not found');
    }

    res.render('edit-user', { user, loggedUser: req.user });
} catch (error) {
    console.error('Error fetching user for edit:', error);
    res.status(500).send('An error occurred');
}
});

router.put("/update/:id", async (req, res) => {
try {
    // Verify admin authentication
    if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).send('Access denied');
    }

    const { id } = req.params;
    const { name, email, role, matricula, marca, modelo } = req.body;

    const updatedUser = await prisma.user.update({
    where: { id },
    data: {
        name,
        email,
        role,
        matricula,
        marca,
        modelo
    }
    });

    if (!updatedUser) {
    return res.status(404).send('User not found');
    }

    res.redirect('/users');
} catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('An error occurred while updating the user');
}
});

module.exports = router;
