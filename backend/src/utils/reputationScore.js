/**
 * Reputation Score Formula:
 *   score = (avgRating × 40) + min(completedJobs × 2, 30) + min(verifiedBadges × 10, 30)
 *   Range: 0–100
 *
 * Tiers:
 *   Bronze:   0–40
 *   Silver:  41–65
 *   Gold:    66–80
 *   Platinum: 81–100
 */

const calculateReputationScore = ({ averageRating = 0, completedJobs = 0, verifiedBadges = 0 }) => {
  const ratingComponent = (averageRating / 5) * 40;
  const jobComponent = Math.min(completedJobs * 2, 30);
  const badgeComponent = Math.min(verifiedBadges * 10, 30);
  const score = Math.round(ratingComponent + jobComponent + badgeComponent);

  let tier;
  if (score >= 81) tier = 'Platinum';
  else if (score >= 66) tier = 'Gold';
  else if (score >= 41) tier = 'Silver';
  else tier = 'Bronze';

  return { score, tier };
};

/**
 * Updates a user's reputation after a new review is submitted.
 * Call this after saving a review to update the user document.
 */
const updateUserReputation = async (User, Review, userId) => {
  const reviews = await Review.find({ workerId: userId, isFlagged: false });
  const completedJobs = reviews.length;

  const avgRating =
    completedJobs > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / completedJobs
      : 0;

  const user = await User.findById(userId);
  const verifiedBadges = user.idVerified ? 1 : 0;

  const { score, tier } = calculateReputationScore({
    averageRating: avgRating,
    completedJobs,
    verifiedBadges,
  });

  await User.findByIdAndUpdate(userId, {
    reputationScore: score,
    reputationTier: tier,
    averageRating: Math.round(avgRating * 10) / 10,
    totalRatings: completedJobs,
    completedJobsCount: completedJobs,
  });

  // Award auto-badges
  await awardBadges(User, userId, completedJobs, avgRating);

  return { score, tier, avgRating, completedJobs };
};

/**
 * Auto-award skill badges based on milestones.
 */
const awardBadges = async (User, userId, completedJobs, avgRating) => {
  const badgesToAward = [];

  if (completedJobs >= 1)
    badgesToAward.push({ name: 'First Job', icon: '🎯' });
  if (completedJobs >= 5)
    badgesToAward.push({ name: 'Rising Star', icon: '⭐' });
  if (completedJobs >= 10)
    badgesToAward.push({ name: 'Pro Worker', icon: '🏆' });
  if (completedJobs >= 25)
    badgesToAward.push({ name: 'Expert', icon: '💎' });
  if (avgRating >= 4.8 && completedJobs >= 5)
    badgesToAward.push({ name: 'Top Rated', icon: '🥇' });

  if (badgesToAward.length === 0) return;

  const user = await User.findById(userId);
  const existingBadgeNames = user.badges.map((b) => b.name);

  const newBadges = badgesToAward.filter((b) => !existingBadgeNames.includes(b.name));
  if (newBadges.length > 0) {
    user.badges.push(...newBadges.map((b) => ({ ...b, awardedAt: new Date() })));
    await user.save();
  }
};

module.exports = { calculateReputationScore, updateUserReputation };
