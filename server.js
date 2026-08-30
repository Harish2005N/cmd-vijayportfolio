const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Models
const Project = require('./models/Project');
const Course = require('./models/Course');
const Achievement = require('./models/Achievement');
const Skill = require('./models/Skill');

const app = express();
const PORT = process.env.PORT || 5000;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/' || req.path === '/admin') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ============ PROJECT ROUTES ============

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new project (with optional image upload)
app.post('/api/projects', upload.array('images', 8), async (req, res) => {
  try {
    const { title, description, date, technologies, number, link } = req.body || {};

    let techArray = technologies;
    if (typeof technologies === 'string') {
      techArray = technologies.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
    } else if (!Array.isArray(techArray)) {
      techArray = [];
    }

    const images = (req.files || []).map(file => file.path);

    const newProject = new Project({
      title,
      description,
      date,
      technologies: techArray,
      number,
      link: link || '',
      image: images[0] || '',
      images
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a project
app.put('/api/projects/:id', upload.array('images', 8), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { title, description, date, technologies, number, link } = req.body || {};
    let techArray = technologies;
    if (typeof technologies === 'string') {
      techArray = technologies.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
    } else if (!Array.isArray(techArray)) {
      techArray = project.technologies || [];
    }

    // Handle existing images from admin (images that weren't removed)
    let existingImages = [...(project.images || [])];
    if (req.body.existingImages) {
      const keptImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
      // Remove any images that are no longer in the kept list
      const removedImages = existingImages.filter(img => !keptImages.includes(img));
      removedImages.forEach(img => {
        if (img.includes('cloudinary')) {
          const publicId = img.split('/').pop().split('.')[0];
          cloudinary.uploader.destroy(`portfolio/${publicId}`);
        }
      });
      existingImages = keptImages;
    }

    const uploadedImages = (req.files || []).map(file => file.path);
    const images = [...existingImages, ...uploadedImages];

    project.title = title || project.title;
    project.description = description || project.description;
    project.date = date || project.date;
    project.technologies = techArray || project.technologies;
    project.number = number || project.number;
    project.link = link !== undefined ? link : project.link;
    project.images = images;
    project.image = images[0] || '';

    const updated = await project.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Delete image files if exists
    const imagesToDelete = [...(project.images || []), project.image].filter(Boolean);
    imagesToDelete.forEach(img => {
      const imgPath = path.join(__dirname, img);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    });

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ COURSE ROUTES ============

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/courses', upload.array('images', 8), async (req, res) => {
  try {
    const { title, platform, date, link, certificate_url } = req.body;
    const images = (req.files || []).map(file => file.path);
    const newCourse = new Course({
      title,
      platform,
      date,
      link,
      certificate_url,
      image: images[0] || '',
      images
    });
    const saved = await newCourse.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/courses/:id', upload.array('images', 8), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { title, platform, date, link, certificate_url } = req.body || {};

    // Handle existing images from admin
    let existingImages = [...(course.images || [])];
    if (req.body.existingImages) {
      const keptImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
      const removedImages = existingImages.filter(img => !keptImages.includes(img));
      removedImages.forEach(img => {
        if (img.includes('cloudinary')) {
          const publicId = img.split('/').pop().split('.')[0];
          cloudinary.uploader.destroy(`portfolio/${publicId}`);
        }
      });
      existingImages = keptImages;
    }

    const uploadedImages = (req.files || []).map(file => file.path);
    const images = [...existingImages, ...uploadedImages];

    course.title = title || course.title;
    course.platform = platform || course.platform;
    course.date = date || course.date;
    course.link = link !== undefined ? link : course.link;
    course.certificate_url = certificate_url !== undefined ? certificate_url : course.certificate_url;
    course.images = images;
    course.image = images[0] || '';

    const updated = await course.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ CERTIFICATION ROUTES (merged into courses) ============

app.get('/api/certifications', async (req, res) => {
  try {
    const certs = await Course.find({ type: 'certification' }).sort({ createdAt: -1 });
    res.json(certs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/certifications/:id', async (req, res) => {
  try {
    const cert = await Course.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: 'Certification not found' });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/certifications', upload.array('images', 8), async (req, res) => {
  try {
    const { title, issuer, date, credential_id, link } = req.body;
    const images = (req.files || []).map(file => file.path);
    const newCert = new Course({
      title,
      type: 'certification',
      issuer,
      date,
      credential_id,
      link,
      image: images[0] || '',
      images
    });
    const saved = await newCert.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/certifications/:id', upload.array('images', 8), async (req, res) => {
  try {
    const cert = await Course.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: 'Certification not found' });

    const { title, issuer, date, credential_id, link } = req.body || {};

    let existingImages = [...(cert.images || [])];
    if (req.body.existingImages) {
      const keptImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
      const removedImages = existingImages.filter(img => !keptImages.includes(img));
      removedImages.forEach(img => {
        if (img.includes('cloudinary')) {
          const publicId = img.split('/').pop().split('.')[0];
          cloudinary.uploader.destroy(`portfolio/${publicId}`);
        }
      });
      existingImages = keptImages;
    }

    const uploadedImages = (req.files || []).map(file => file.path);
    const images = [...existingImages, ...uploadedImages];

    cert.title = title || cert.title;
    cert.issuer = issuer || cert.issuer;
    cert.date = date || cert.date;
    cert.credential_id = credential_id !== undefined ? credential_id : cert.credential_id;
    cert.link = link !== undefined ? link : cert.link;
    cert.images = images;
    cert.image = images[0] || '';

    const updated = await cert.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/certifications/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Certification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ ACHIEVEMENT ROUTES ============

app.get('/api/achievements', async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ createdAt: -1 });
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/achievements/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return res.status(404).json({ message: 'Achievement not found' });
    res.json(achievement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/achievements', async (req, res) => {
  try {
    const { icon, text } = req.body;
    const newAchievement = new Achievement({ icon, text });
    const saved = await newAchievement.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/achievements/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return res.status(404).json({ message: 'Achievement not found' });
    Object.assign(achievement, req.body);
    const updated = await achievement.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/achievements/:id', async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Achievement deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ SKILL ROUTES ============

app.get('/api/skills', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ createdAt: -1 });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/skills/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json(skill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/skills', async (req, res) => {
  try {
    const { category, icon, items } = req.body;
    const newSkill = new Skill({ category, icon, items: Array.isArray(items) ? items : [] });
    const saved = await newSkill.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/skills/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    Object.assign(skill, req.body);
    const updated = await skill.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/skills/:id', async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ SEED DEFAULT ACHIEVEMENTS ============

app.post('/api/seed/achievements', async (req, res) => {
  try {
    const count = await Achievement.countDocuments();
    if (count > 0) {
      return res.json({ message: 'Achievements already seeded', count });
    }

    const defaults = [
      { icon: '🏆', text: 'Selected as Finalist in National Level Hackathon (Hackxelerate25) at KPR Institute of Technology' },
      { icon: '🌟', text: 'Rotary Youth Leadership Awards 40.0 — Actively participated at Thirumangalam' },
      { icon: '📜', text: 'NPTEL Certifications in Python and C Programming from IIT/NPTEL courses' },
      { icon: '🥽', text: 'Participated in VR Application Development workshop at Sastra Deemed University, Thanjavur' },
      { icon: '📡', text: 'Participated in Augmented Reality in Action at RIT Rajapalayam' },
      { icon: '💼', text: 'Class Committee Representative — Bridged communication between students and management at RIT (2023–2024)' },
      { icon: '🎓', text: 'Completed C Programming Internship at TechnoHacks Solutions Pvt. Ltd.' },
      { icon: '🐍', text: 'Completed Python & Java Programming Internship at Codsoft' },
    ];

    await Achievement.insertMany(defaults);
    res.status(201).json({ message: 'Default achievements seeded', count: defaults.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ SERVE FRONTEND ============

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
