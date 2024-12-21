import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth"; // Assuming you have this middleware

const prisma = new PrismaClient();
const router = express.Router();

// Create a Project
router.post("/", authenticateToken, async (req, res) => {
  const { name, description, status } = req.body;
  const { userId } = req.user; // Assumes user ID is available after authentication

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        userId, // Link project to the user who created it
      },
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: "Error creating the project." });
  }
});

// List all Projects
router.get("/", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  try {
    const projects = await prisma.project.findMany({
      where: {
        userId, // Only list projects created by the authenticated user
      },
    });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: "Error fetching projects." });
  }
});

// Update a Project
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;
  const { userId } = req.user;

  try {
    // Find the project by ID
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    // Check if the user is authorized to update the project
    if (project.userId !== userId) {
      return res.status(403).json({ error: "You are not authorized to update this project." });
    }

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: { name, description, status },
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({ error: "Error updating the project." });
  }
});

// Delete a Project
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    // Find the project by ID
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    // Check if the user is authorized to delete the project
    if (project.userId !== userId) {
      return res.status(403).json({ error: "You are not authorized to delete this project." });
    }

    // Delete the project
    await prisma.project.delete({ where: { id } });

    res.status(204).send(); // Successfully deleted
  } catch (error) {
    res.status(400).json({ error: "Error deleting the project." });
  }
});

export default router;
