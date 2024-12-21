// const express = require('express');
// const { PrismaClient } = require('@prisma/client');
// const bodyParser = require('body-parser');
// const prisma = new PrismaClient();
// const app = express();
// app.use(bodyParser.json());

// // User API Routes
// app.post('/users', async (req, res) => {
//   const { name, email } = req.body;
//   try {
//     const user = await prisma.user.create({
//       data: { name, email }
//     });
//     res.status(201).json(user);
//   } catch (error) {
//     if (error.code === 'P2002') {
//       return res.status(400).json({ error: 'Email already exists' });
//     }
//     res.status(400).json({ error: 'Failed to create user' });
//   }
// });

// app.get('/users', async (req, res) => {
//   try {
//     const users = await prisma.user.findMany();
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to fetch users' });
//   }
// });

// app.put('/users/:id', async (req, res) => {
//   const { id } = req.params;
//   const { name, email } = req.body;
//   try {
//     const user = await prisma.user.update({
//       where: { id },
//       data: { name, email }
//     });
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to update user' });
//   }
// });

// app.delete('/users/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     await prisma.user.delete({
//       where: { id }
//     });
//     res.status(200).json({ message: 'User deleted' });
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to delete user' });
//   }
// });

// // Project API Routes
// app.post('/projects', async (req, res) => {
//   const { name, description, status, userId } = req.body;
//   try {
//     const project = await prisma.project.create({
//       data: { name, description, status, userId }
//     });
//     res.status(201).json(project);
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to create project' });
//   }
// });

// app.get('/projects', async (req, res) => {
//   try {
//     const projects = await prisma.project.findMany();
//     res.status(200).json(projects);
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to fetch projects' });
//   }
// });

// app.put('/projects/:id', async (req, res) => {
//   const { id } = req.params;
//   const { name, description, status, userId } = req.body;
//   try {
//     const project = await prisma.project.update({
//       where: { id },
//       data: { name, description, status, userId }
//     });
//     res.status(200).json(project);
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to update project' });
//   }
// });

// app.delete('/projects/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     await prisma.project.delete({
//       where: { id }
//     });
//     res.status(200).json({ message: 'Project deleted' });
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to delete project' });
//   }
// });

// // Task API Routes
// app.post('/tasks', async (req, res) => {
//   const { title, description, status, projectId, assignedUserId } = req.body;
//   try {
//     const task = await prisma.task.create({
//       data: { title, description, status, projectId, assignedUserId }
//     });
//     res.status(201).json(task);
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to create task' });
//   }
// });

// app.get('/tasks', async (req, res) => {
//   const { status, assignedUserId, projectId } = req.query;

//   try {
//     const tasks = await prisma.task.findMany({
//       where: {
//         ...(status && { status }),
//         ...(assignedUserId && { assignedUserId }),
//         ...(projectId && { projectId }),
//       },
//     });
//     res.status(200).json(tasks);
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to fetch tasks' });
//   }
// });

// app.put('/tasks/:id', async (req, res) => {
//   const { id } = req.params;
//   const { title, description, status, projectId, assignedUserId } = req.body;

//   try {
//     const task = await prisma.task.update({
//       where: { id },
//       data: { title, description, status, projectId, assignedUserId }
//     });
//     res.status(200).json(task);
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to update task' });
//   }
// });

// app.delete('/tasks/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     await prisma.task.delete({
//       where: { id }
//     });
//     res.status(200).json({ message: 'Task deleted' });
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to delete task' });
//   }
// });

// // Starting the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });








const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
const app = express();

app.use(bodyParser.json());

const JWT_SECRET = '3d000e0a4b17c5478d4972ac17f2e4a4e88e8bc630bdae65887f828262919711'; // Store this securely, e.g., in environment variables

// Middleware to check JWT token
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Get token from the Authorization header

  if (!token) {
    return res.status(403).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.user = user; // Add the user info to the request object
    next();
  });
};
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields (name, email, password) are required' });
  }

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
    });
  } catch (error) {
    console.error('Error during signup:', error);  // Log the detailed error
    res.status(500).json({ error: 'Failed to register user' });
  }
});


// Login API to generate a JWT token (mocking user authentication here)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Mock user validation (replace with real authentication logic)
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '1h', // Token expiration time
  });

  res.status(200).json({ token });
});

// User API Routes (Protected)
app.post('/users', authenticateJWT, async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email },
    });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(400).json({ error: 'Failed to create user' });
  }
});


app.get('/users', authenticateJWT, async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch users' });
  }
});

app.put('/users/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { name, email },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update user' });
  }
});

app.delete('/users/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete user' });
  }
});

// Project and Task Routes - Similar to User Routes, protected with JWT
app.post('/projects', authenticateJWT, async (req, res) => {
  const { name, description, status, userId } = req.body;
  try {
    const project = await prisma.project.create({
      data: { name, description, status, userId },
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create project' });
  }
});

app.get('/projects', authenticateJWT, async (req, res) => {
  try {
    const projects = await prisma.project.findMany();
    res.status(200).json(projects);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch projects' });
  }
});

app.put('/projects/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { name, description, status, userId } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id },
      data: { name, description, status, userId },
    });
    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update project' });
  }
});

app.delete('/projects/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.project.delete({
      where: { id },
    });
    res.status(200).json({ message: 'Project deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete project' });
  }
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
