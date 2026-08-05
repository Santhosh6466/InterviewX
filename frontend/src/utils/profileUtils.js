/**
 * Calculates user profile completion percentage.
 * Total: 100%
 * - Name: 15%
 * - Headline: 10%
 * - Bio: 15%
 * - Career Status: 10%
 * - College or Current Company: 15%
 * - Branch or Current Role: 10%
 * - Graduation Year: 5%
 * - LinkedIn URL: 10%
 * - GitHub URL: 10%
 */
export const calculateCompletionPercentage = (profile) => {
  if (!profile) return 0;
  let score = 0;
  
  // 1. Name: 15%
  if (profile.name || profile.fullName) score += 15;
  
  // 2. Headline: 10%
  if (profile.headline) score += 10;
  
  // 3. Bio: 15%
  if (profile.bio) score += 15;
  
  // 4. Career Status: 10%
  if (profile.careerStatus) score += 10;
  
  // 5. College or Current Company: 15%
  const status = profile.careerStatus || 'STUDENT';
  if (status === 'STUDENT' || status === 'FRESHER') {
    if (profile.college) score += 15;
  } else {
    if (profile.currentCompany || profile.currentCompanyId) score += 15;
  }
  
  // 6. Branch or Current Role: 10%
  if (status === 'STUDENT' || status === 'FRESHER') {
    if (profile.branch) score += 10;
  } else {
    if (profile.currentRole) score += 10;
  }
  
  // 7. Graduation Year: 5%
  if (profile.graduationYear) score += 5;
  
  // 8. LinkedIn: 10%
  if (profile.linkedinUrl) score += 10;
  
  // 9. GitHub: 10%
  if (profile.githubUrl) score += 10;
  
  return score;
};
