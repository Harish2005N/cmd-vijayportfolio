const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('./models/Project');
const Skill = require('./models/Skill');
const Achievement = require('./models/Achievement');
const Course = require('./models/Course');

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio';

async function seed() {
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Project.deleteMany({}),
    Skill.deleteMany({}),
    Achievement.deleteMany({}),
    Course.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // ========== PROJECTS ==========
  const projects = [
    {
      title: 'Inventory Management System',
      description: 'Engineered a full-stack inventory management system using the MERN stack for efficient product tracking and stock management. Implemented dynamic CRUD operations and role-based access to streamline inventory workflows and reduce manual errors. Deployed a scalable web application with RESTful APIs, enabling secure data handling and seamless user interaction.',
      date: '2025',
      technologies: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'REST API'],
      number: '01',
      link: 'https://github.com/harishvhsh18',
      images: [
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600',
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600'
      ],
    },
    {
      title: 'Tourism Management System',
      description: 'Built a web-based tourism platform enabling users to discover travel packages, plan trips, and manage bookings efficiently. Integrated secure login, personalized package views, and booking workflows to enhance user engagement and usability. Structured backend services and database interactions to support reliable data processing and smooth application performance.',
      date: '2026',
      technologies: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'REST API'],
      number: '02',
      link: 'https://github.com/harishvhsh18',
      images: [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'
      ],
    },
    {
      title: 'Multi-Client Chat Application',
      description: 'Developed a multi-client chat application in Java using socket programming to enable real-time communication over a computer network. Implemented a client-server architecture to establish reliable socket connections and support simultaneous message exchange among multiple users. Applied Computer Networks concepts to manage client connections, message transmission, and efficient communication between connected clients.',
      date: '2025',
      technologies: ['Java', 'Socket Programming', 'Client-Server', 'Computer Networks'],
      number: '03',
      link: 'https://github.com/harishvhsh18',
      images: [
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600'
      ],
    },
  ];
  await Project.insertMany(projects);
  console.log(`Inserted ${projects.length} projects`);

  // ========== SKILLS ==========
  const skills = [
    {
      category: 'Programming',
      icon: '💻',
      items: ['Java', 'Python', 'C'],
    },
    {
      category: 'Web Development',
      icon: '🌐',
      items: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'MERN Stack'],
    },
    {
      category: 'AI & ML',
      icon: '🤖',
      items: ['Machine Learning', 'Data Science', 'Pandas', 'NumPy', 'Matplotlib'],
    },
    {
      category: 'Databases',
      icon: '🗄️',
      items: ['MySQL', 'MongoDB'],
    },
    {
      category: 'Tools & Platforms',
      icon: '🛠️',
      items: ['Git', 'GitHub', 'VS Code', 'Linux'],
    },
  ];
  await Skill.insertMany(skills);
  console.log(`Inserted ${skills.length} skill categories`);

  // ========== COURSES & CERTIFICATIONS ==========
  const courses = [
    { title: 'Programming in Java', platform: 'NPTEL', date: '2024' },
    { title: 'Programming in Python', platform: 'NPTEL', date: '2024' },
    { title: 'Python for Data Science', platform: 'NPTEL', date: '2024' },
    { title: 'Cloud Computing Essentials', platform: 'AWS', date: '2024' },
    { title: 'RPA Automation', platform: 'UiPath', date: '2024' },
    { title: 'Fundamentals of Digital Marketing', platform: 'NPTEL', date: '2024' },
    { title: 'Programming in C', platform: 'NPTEL', date: '2024' },
  ];
  await Course.insertMany(courses);
  console.log(`Inserted ${courses.length} courses & certifications`);

  // ========== ACHIEVEMENTS ==========
  const achievements = [
    {
      icon: '🏆',
      text: 'Selected as a finalist in multiple National-level Hackathons conducted by KPR Institute of Technology, Sri Eshwar College of Engineering, and VCET.',
    },
    {
      icon: '🥇',
      text: 'Secured 4th Place in the Tech Pragna Blockchain Hackathon and earned an internship opportunity.',
    },
    {
      icon: '🌟',
      text: 'Completed the Rotary Youth Leadership Awards (RYLA 40.0) leadership development program.',
    },
    {
      icon: '🥽',
      text: 'Completed hands-on AR/VR development training at SASTRA University, Thanjavur.',
    },
    {
      icon: '📱',
      text: 'Developed marker-based Augmented Reality (AR) applications at Ramco Institute of Technology.',
    },
    {
      icon: '🔧',
      text: 'Completed IoT training and developed Arduino-based mini projects using sensors and embedded systems.',
    },
    {
      icon: '📜',
      text: 'Digital Marketing certification from Infosys Springboard.',
    },
  ];
  await Achievement.insertMany(achievements);
  console.log(`Inserted ${achievements.length} achievements`);

  await mongoose.disconnect();
  console.log('Done! Database seeded successfully.');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
