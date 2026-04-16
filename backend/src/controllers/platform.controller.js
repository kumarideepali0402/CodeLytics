import prisma from "../db/prisma.js";


export const createPlatform = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ msg: 'Platform name is required and must be a non-empty string.' });
    }

    const platformName = name.trim().toLowerCase();

    const existingPlatform = await prisma.platform.findUnique({
      where: { name: platformName },
    });

    if (existingPlatform) {
      return res.status(409).json({ msg: 'Platform with this name already exists.' });
    }

    const newPlatform = await prisma.platform.create({
      data: {
        name: platformName,
      },
      select :{
        id: true,
        name : true
      }
    });

    return res.status(201).json({
      msg: 'Platform created successfully.',
      platform: newPlatform,
    });
  } catch (error) {
    console.error('Error creating platform:', error);
    return res.status(500).json({ msg: 'Internal server error.' });
  }
};

export const getAllPlatforms = async (req, res) => {
  try {
    const platforms = await prisma.platform.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ platforms });
  } catch (error) {
    console.error('Error in getAllPlatforms:', error);
    res.status(500).json({ msg: 'Internal server error.' });
  }
};
