require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const User = require('./src/models/User');
const Job = require('./src/models/Job');
const Review = require('./src/models/Review');
const Portfolio = require('./src/models/Portfolio');

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SKILLS_POOL = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Tutor',
  'AC Repair', 'Cleaner', 'Mechanic', 'Mason', 'Welder',
  'CCTV Installation', 'Solar Panel', 'Pest Control', 'Interior Design', 'Tiler',
];

const LOCATIONS = [
  'Mumbai, Maharashtra', 'Delhi, NCR', 'Bengaluru, Karnataka',
  'Hyderabad, Telangana', 'Chennai, Tamil Nadu', 'Pune, Maharashtra',
  'Kolkata, West Bengal', 'Ahmedabad, Gujarat', 'Jaipur, Rajasthan',
  'Lucknow, Uttar Pradesh', 'Surat, Gujarat', 'Kochi, Kerala',
];

const WORKER_NAMES = [
  'Rajesh Kumar', 'Suresh Sharma', 'Amit Verma', 'Priya Nair', 'Vikram Singh',
  'Anita Patel', 'Ravi Gupta', 'Sunita Rao', 'Mahesh Joshi', 'Deepak Mehta',
  'Kavita Iyer', 'Sanjay Thakur', 'Pooja Menon', 'Ramesh Reddy', 'Geeta Yadav',
  'Harish Bhat', 'Lalita Desai', 'Mukesh Pillai', 'Sarita Jain', 'Dinesh Chauhan',
];

const CLIENT_NAMES = [
  'Arjun Kapoor', 'Neha Malhotra', 'Rohit Bajaj', 'Simran Kohli', 'Tarun Bose',
];

const JOB_TITLES = [
  'Fixed short circuit in kitchen', 'Repaired bathroom leak', 'Installed ceiling fan',
  'Painted 3-bedroom apartment', 'Math tutoring for Class 10', 'AC servicing and gas refill',
  'Deep cleaned office space', 'Car engine oil change', 'Laid floor tiles in hall',
  'CCTV installation at shop', 'Solar panel setup on terrace', 'Waterproofing of terrace',
  'Carpenter work for new wardrobe', 'Welding gate repair', 'Pest control for entire flat',
  'Interior design consultation', 'Replaced water pump motor', 'Electrical rewiring',
  'Plumbing work in new flat', 'Physics and Chemistry tutoring',
];

const REVIEW_COMMENTS = [
  'Excellent work! Very professional and punctual.',
  'Got the job done quickly and cleanly. Highly recommend!',
  'Very knowledgeable and explained everything well.',
  'Reasonable pricing and quality output. Will hire again.',
  'Showed up on time and finished ahead of schedule.',
  'Neat work, no mess left behind. Very satisfied.',
  'Expert in his field. Solved a problem no one else could.',
  'Friendly and hardworking. Great experience overall.',
  'The quality of work was outstanding for the price.',
  'Fixed the issue on the first visit. Saved me a lot of trouble.',
  'Professional attitude and great communication.',
  'Trusted him with keys to my house — no issues at all.',
  'Really impressed with the attention to detail.',
  'Best tutor my son has had. Marks improved drastically!',
  'Quick response, fair price, clean work. 5 stars!',
];

const REVIEW_TAGS_POOL = [
  ['Punctual', 'Professional', 'Quality Work'],
  ['Clean', 'Fair Price', 'Friendly'],
  ['Expert', 'Highly Recommend'],
  ['Punctual', 'Expert', 'Quality Work'],
  ['Professional', 'Fair Price'],
  ['Friendly', 'Highly Recommend', 'Clean'],
  ['Punctual', 'Quality Work', 'Highly Recommend'],
];

const BIOS = [
  'Experienced professional with over 5 years in residential and commercial projects.',
  'Certified technician offering reliable and affordable services across the city.',
  'Passionate about quality work and customer satisfaction. Available 7 days a week.',
  'Former ITI graduate with hands-on experience in all types of repair and installation work.',
  'Providing trusted services to 200+ happy customers across the region.',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));

function calcReputation(avgRating, completedJobs, idVerified) {
  const ratingComponent = (avgRating / 5) * 40;
  const jobComponent = Math.min(completedJobs * 2, 30);
  const badgeComponent = idVerified ? 10 : 0;
  const score = Math.round(ratingComponent + jobComponent + badgeComponent);
  let tier;
  if (score >= 81) tier = 'Platinum';
  else if (score >= 66) tier = 'Gold';
  else if (score >= 41) tier = 'Silver';
  else tier = 'Bronze';
  return { score, tier };
}

function calcBadges(completedJobs, avgRating) {
  const badges = [];
  if (completedJobs >= 1) badges.push({ name: 'First Job', icon: '🎯', awardedAt: new Date() });
  if (completedJobs >= 5) badges.push({ name: 'Rising Star', icon: '⭐', awardedAt: new Date() });
  if (completedJobs >= 10) badges.push({ name: 'Pro Worker', icon: '🏆', awardedAt: new Date() });
  if (completedJobs >= 25) badges.push({ name: 'Expert', icon: '💎', awardedAt: new Date() });
  if (avgRating >= 4.8 && completedJobs >= 5) badges.push({ name: 'Top Rated', icon: '🥇', awardedAt: new Date() });
  return badges;
}

function slugify(name, id) {
  const base = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `${base}-${id.toString().slice(-6)}`;
}

// ─── Main Seed ────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gigworker');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Review.deleteMany({}),
      Portfolio.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 12);

    // ── Create 5 Clients ──────────────────────────────────────────────────────
    const clients = [];
    for (let i = 0; i < CLIENT_NAMES.length; i++) {
      const name = CLIENT_NAMES[i];
      const client = await User.create({
        name,
        email: `client${i + 1}@gigverify.com`,
        password: hashedPassword,
        role: 'client',
        phone: `98${randInt(10000000, 99999999)}`,
      });
      clients.push(client);
    }
    console.log(`✅ Created ${clients.length} clients`);

    // ── Create 20 Workers ─────────────────────────────────────────────────────
    const workers = [];
    for (let i = 0; i < WORKER_NAMES.length; i++) {
      const name = WORKER_NAMES[i];
      const numSkills = randInt(1, 3);
      const shuffled = [...SKILLS_POOL].sort(() => 0.5 - Math.random());
      const skills = shuffled.slice(0, numSkills);
      const idVerified = Math.random() > 0.4; // 60% verified
      const experience = randInt(1, 15);
      const hourlyRate = randInt(200, 1500);

      const worker = new User({
        name,
        email: `worker${i + 1}@gigverify.com`,
        password: hashedPassword,
        role: 'worker',
        phone: `99${randInt(10000000, 99999999)}`,
        skills,
        location: rand(LOCATIONS),
        bio: rand(BIOS),
        experience,
        hourlyRate,
        idVerified,
        idVerificationStatus: idVerified ? 'verified' : rand(['not_submitted', 'pending']),
        isAvailable: Math.random() > 0.2,
        // Placeholders — will update after jobs/reviews
        reputationScore: 0,
        reputationTier: 'Bronze',
        averageRating: 0,
        totalRatings: 0,
        completedJobsCount: 0,
        badges: [],
      });
      worker.publicProfileSlug = slugify(name, worker._id);
      workers.push(worker);
    }
    await User.insertMany(workers);
    console.log(`✅ Created ${workers.length} workers`);

    // ── Create Portfolios for each worker ─────────────────────────────────────
    const portfolios = workers.map((w) => ({
      workerId: w._id,
      about: rand(BIOS) + ' ' + rand(BIOS),
      serviceAreas: [w.location?.split(',')[0]],
      specializations: w.skills,
      certifications: Math.random() > 0.5 ? [{
        name: `${rand(w.skills)} Certification`,
        issuer: rand(['ITI Board', 'NSDC', 'City & Guilds', 'CITA']),
        issueDate: new Date(2020, randInt(0, 11), randInt(1, 28)),
        verified: false,
      }] : [],
    }));
    await Portfolio.insertMany(portfolios);
    console.log(`✅ Created ${portfolios.length} portfolios`);

    // ── Create Jobs + Reviews ─────────────────────────────────────────────────
    // Total target: ~60 records split across workers
    const jobsToCreate = 40;  // jobs
    const allJobs = [];
    const allReviews = [];

    // Track per-worker stats
    const workerStats = {};
    workers.forEach((w) => {
      workerStats[w._id] = { ratings: [], jobs: 0 };
    });

    for (let j = 0; j < jobsToCreate; j++) {
      const worker = rand(workers);
      const client = rand(clients);
      const skill = rand(worker.skills) || rand(SKILLS_POOL);
      const hasReview = Math.random() > 0.25; // 75% jobs get reviewed
      const qrToken = uuidv4();
      const completedAt = new Date(Date.now() - randInt(1, 180) * 24 * 60 * 60 * 1000);

      const job = {
        _id: new mongoose.Types.ObjectId(),
        title: rand(JOB_TITLES),
        description: `Professional ${skill.toLowerCase()} service completed successfully.`,
        workerId: worker._id,
        clientId: client._id,
        clientName: client.name,
        clientEmail: client.email,
        skill,
        location: worker.location,
        amount: randInt(500, 8000),
        currency: 'INR',
        qrToken,
        status: hasReview ? 'reviewed' : 'completed',
        qrUsed: hasReview,
        completedAt,
      };

      if (hasReview) {
        const rating = randInt(3, 5);
        const reviewerNames = ['Deepa S', 'Kiran M', 'Suhas T', 'Meera V', 'Aryan K',
          'Divya R', 'Tushar P', 'Sneha G', 'Rohan B', 'Ananya C'];
        const reviewerName = rand(reviewerNames);
        const comment = rand(REVIEW_COMMENTS);
        const tags = rand(REVIEW_TAGS_POOL);

        const reviewId = new mongoose.Types.ObjectId();
        const integrityPayload = `${reviewId}:${worker._id}:${qrToken}:${rating}:${Date.now()}`;
        const integrityHash = crypto.createHash('sha256').update(integrityPayload).digest('hex');

        const review = {
          _id: reviewId,
          jobId: job._id,
          workerId: worker._id,
          qrToken,
          reviewerName,
          rating,
          comment,
          tags,
          integrityHash,
          isVerified: true,
          isFlagged: false,
          createdAt: new Date(completedAt.getTime() + randInt(1, 5) * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        };

        job.reviewId = reviewId;
        job.qrUsedAt = review.createdAt;
        job.reviewedAt = review.createdAt;

        allReviews.push(review);
        workerStats[worker._id].ratings.push(rating);
        workerStats[worker._id].jobs++;
      }

      allJobs.push(job);
    }

    await Job.insertMany(allJobs);
    await Review.insertMany(allReviews);
    console.log(`✅ Created ${allJobs.length} jobs and ${allReviews.length} reviews`);

    // ── Update worker reputation scores ───────────────────────────────────────
    for (const worker of workers) {
      const stats = workerStats[worker._id];
      const completedJobs = stats.jobs;
      const avgRating = completedJobs > 0
        ? stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length
        : 0;

      const idVerified = worker.idVerified ? 1 : 0;
      const { score, tier } = calcReputation(avgRating, completedJobs, idVerified);
      const badges = calcBadges(completedJobs, avgRating);

      await User.findByIdAndUpdate(worker._id, {
        reputationScore: score,
        reputationTier: tier,
        averageRating: Math.round(avgRating * 10) / 10,
        totalRatings: completedJobs,
        completedJobsCount: completedJobs,
        badges,
      });
    }
    console.log('✅ Updated all worker reputation scores and badges');

    // ── Summary ───────────────────────────────────────────────────────────────
    const counts = {
      users: await User.countDocuments(),
      jobs: await Job.countDocuments(),
      reviews: await Review.countDocuments(),
      portfolios: await Portfolio.countDocuments(),
    };

    console.log('\n📊 Seed Summary:');
    console.log(`   👤 Users      : ${counts.users} (${CLIENT_NAMES.length} clients + ${WORKER_NAMES.length} workers)`);
    console.log(`   💼 Jobs       : ${counts.jobs}`);
    console.log(`   ⭐ Reviews    : ${counts.reviews}`);
    console.log(`   📁 Portfolios : ${counts.portfolios}`);
    console.log(`   📦 Total docs : ${counts.users + counts.jobs + counts.reviews + counts.portfolios}`);
    console.log('\n🔑 Test Login Credentials:');
    console.log('   Worker → worker1@gigverify.com / password123');
    console.log('   Client → client1@gigverify.com / password123');
    console.log('\n✅ Seeding complete!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
