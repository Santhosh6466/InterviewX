import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import profileService from '../services/profileService';
import companyService from '../services/companyService';
import CompanyLogo from '../components/CompanyLogo';
import { CareerStatuses } from '../constants/enums';
import { toast } from 'react-hot-toast';
import Avatar from '../components/Avatar';

const PRESET_AVATARS = [
  'default-avatar',
  ...Array.from({ length: 50 }, (_, i) => `avatar-${i + 1}`)
];

export default function CompleteProfile() {
  const { user, setUser, fetchProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});

  // Form Fields
  const [name, setName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('default-avatar');
  const [careerStatus, setCareerStatus] = useState('STUDENT');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [currentCompanyId, setCurrentCompanyId] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null); 
  const [currentRole, setCurrentRole] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Suggestions state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarSeed(user.avatarSeed || 'default-avatar');
    }
  }, [user]);

  // Company Search Suggestion effect
  useEffect(() => {
    if (!searchQuery.trim() || (currentCompany && currentCompany.name === searchQuery)) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const res = await companyService.searchCompanies(searchQuery, 0, 5);
        const list = Array.isArray(res.content) ? res.content : (Array.isArray(res) ? res : []);
        setSuggestions(list);
      } catch (err) {
        console.error('[CompleteProfile] Company search error:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, currentCompany]);

  const handleSelectCompany = (company) => {
    setCurrentCompany(company);
    setCurrentCompanyId(company.id || company._id);
    setSearchQuery(company.name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleClearCompany = () => {
    setCurrentCompany(null);
    setCurrentCompanyId(null);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleRandomizeAvatar = () => {
    const randomSeed = 'avatar-' + Math.random().toString(36).substring(2, 9);
    setAvatarSeed(randomSeed);
  };

  const handleSkip = () => {
    sessionStorage.setItem('onboardingSkipped', 'true');
    localStorage.setItem('onboardingSkipped', 'true');
    sessionStorage.removeItem('justRegistered');
    window.location.hash = '#/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setErrors({});
    
    // Validations
    const validationErrors = {};
    if (!name.trim()) {
      validationErrors.name = 'Name is required';
    }
    if (!careerStatus) {
      validationErrors.careerStatus = 'Career Status is required';
    }
    if (graduationYear && isNaN(Number(graduationYear))) {
      validationErrors.graduationYear = 'Graduation Year must be numeric';
    }

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    if (linkedinUrl && !urlPattern.test(linkedinUrl)) {
      validationErrors.linkedinUrl = 'LinkedIn URL must be valid';
    }
    if (githubUrl && !urlPattern.test(githubUrl)) {
      validationErrors.githubUrl = 'GitHub URL must be valid';
    }
    if (leetcodeUrl && !urlPattern.test(leetcodeUrl)) {
      validationErrors.leetcodeUrl = 'LeetCode URL must be valid';
    }
    if (portfolioUrl && !urlPattern.test(portfolioUrl)) {
      validationErrors.portfolioUrl = 'Portfolio URL must be valid';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setGlobalError('Please fix the validation errors below before submitting.');
      toast.error('Please correct the validation errors');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        college: college.trim(),
        branch: branch.trim(),
        graduationYear: graduationYear ? parseInt(graduationYear, 10) : null,
        careerStatus,
        currentCompanyId: currentCompanyId || null,
        currentRole: currentRole.trim(),
        linkedinUrl: linkedinUrl.trim(),
        githubUrl: githubUrl.trim(),
        leetcodeUrl: leetcodeUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        // New fields requested
        experience: experience.trim(),
        skills: skills.trim(),
        location: location.trim(),
        avatarSeed
      };

      await profileService.updateProfile(payload);
      
      if (user && payload.name) {
        const updatedUser = { ...user, name: payload.name, avatarSeed: payload.avatarSeed };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      await fetchProfile();
      
      sessionStorage.setItem('onboardingSkipped', 'true');
      localStorage.setItem('onboardingSkipped', 'true');
      sessionStorage.removeItem('justRegistered');
      toast.success('Profile completed successfully!');
      window.location.hash = '#/dashboard';
    } catch (err) {
      console.error('[CompleteProfile] Save failed:', err);
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to update profile';
      setGlobalError(typeof msg === 'string' ? msg : 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-main py-12 px-4 selection:bg-theme-hover">
      <div className="flex flex-col gap-8 max-w-[800px] mx-auto w-full fade-in-up">
        {/* Header */}
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-theme-text">
            Complete Your Profile
          </h1>
          <p className="text-theme-muted text-sm">
            Help others know you better. You can also skip this and complete it later.
          </p>
        </div>

        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          
          {/* Card 1: Basic Information */}
          <div className="premium-card flex flex-col gap-6">
            <h2 className="text-lg font-bold pb-4 border-b border-theme-border text-theme-text">Basic Information</h2>
            
            {/* Avatar Selection */}
            <div className="flex flex-col gap-4 border-b border-theme-border pb-6">
              <label className="text-xs font-bold text-theme-text">Select Profile Avatar</label>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Current Selected Preview */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <Avatar seed={avatarSeed} size="w-20 h-20" />
                  <span className="text-[10px] text-theme-muted font-bold">Selected Preview</span>
                </div>
                
                {/* Options List */}
                <div className="flex-1 flex flex-col gap-3 w-full min-w-0">
                  <div className="flex items-center gap-4 overflow-x-auto py-5 px-3 flex-nowrap scrollbar-thin scrollbar-thumb-theme-border min-h-[85px] w-full">
                    {PRESET_AVATARS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAvatarSeed(preset)}
                        className={`rounded-full overflow-hidden border-2 transition-all duration-300 ease-out p-0.5 hover:scale-[1.4] hover:-translate-y-2 active:scale-95 cursor-pointer flex-shrink-0 z-0 hover:z-10 ${
                          avatarSeed === preset ? 'border-[#a78b71]' : 'border-transparent hover:border-theme-border'
                        }`}
                      >
                        <Avatar seed={preset} size="w-10 h-10" />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRandomizeAvatar}
                      className="px-4 py-2 bg-theme-hover hover:bg-theme-border border border-theme-border rounded-sm text-xs font-bold text-theme-text transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <iconify-icon icon="lucide:refresh-cw" className="text-xs"></iconify-icon>
                      Randomize Avatar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-theme-main border rounded-sm px-4 py-3 text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-theme-border-inverted transition-colors shadow-inner ${errors.name ? 'border-red-500' : 'border-theme-border'}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs font-semibold mt-1 flex items-center gap-1">
                    <iconify-icon icon="lucide:alert-circle" className="text-sm"></iconify-icon>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Career Status <span className="text-red-500">*</span></label>
                <select
                  value={careerStatus}
                  onChange={(e) => setCareerStatus(e.target.value)}
                  className="input-field"
                >
                  {CareerStatuses.map((cs) => (
                    <option key={cs.value} value={cs.value}>{cs.label}</option>
                  ))}
                </select>
                {errors.careerStatus && (
                  <p className="text-red-500 text-xs font-semibold mt-1 flex items-center gap-1">
                    <iconify-icon icon="lucide:alert-circle" className="text-sm"></iconify-icon>
                    {errors.careerStatus}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-theme-text">Headline</label>
              <input
                type="text"
                placeholder="e.g. Software Engineer Intern at Google | CS Student"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-theme-text">Bio</label>
              <textarea
                rows="4"
                placeholder="Tell us about yourself, your career interests, and background..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-field resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Skills</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Python"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Education & Career */}
          <div className="premium-card flex flex-col gap-6">
            <h2 className="text-lg font-bold pb-4 border-b border-theme-border text-theme-text">Education & Career</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-bold text-theme-text">College</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Graduation Year</label>
                <input
                  type="number"
                  placeholder="e.g. 2026"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className={`w-full bg-theme-main border rounded-sm px-4 py-3 text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-theme-border-inverted transition-colors shadow-inner ${errors.graduationYear ? 'border-red-500' : 'border-theme-border'}`}
                />
                {errors.graduationYear && (
                  <p className="text-red-500 text-xs font-semibold mt-1 flex items-center gap-1">
                    <iconify-icon icon="lucide:alert-circle" className="text-sm"></iconify-icon>
                    {errors.graduationYear}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Branch / Major</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science and Engineering"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Experience</label>
                <input
                  type="text"
                  placeholder="e.g. 2 Years"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-theme-border pt-6 mt-2">
              
              {/* Company search suggestions input */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-xs font-bold text-theme-text">Current Company</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={handleBlur}
                    className="input-field"
                  />
                  {currentCompany && (
                    <button
                      type="button"
                      onClick={handleClearCompany}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-red-500 transition-colors flex items-center justify-center"
                      title="Clear company"
                    >
                      <iconify-icon icon="lucide:x" className="text-base"></iconify-icon>
                    </button>
                  )}
                </div>

                {/* Suggestions List Dropdown */}
                {showSuggestions && (searchQuery.trim() !== '') && (
                  <div className="absolute left-0 right-0 top-full mt-1 premium-card shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {loadingSuggestions && (
                      <div className="p-4 text-xs text-theme-muted text-center">Loading suggestions...</div>
                    )}
                    {!loadingSuggestions && suggestions.length === 0 && (
                      <div className="p-4 text-xs text-theme-muted text-center">No companies found</div>
                    )}
                    {!loadingSuggestions && suggestions.map((company) => (
                      <button
                        key={company.id || company._id}
                        type="button"
                        onClick={() => handleSelectCompany(company)}
                        className="w-full text-left px-4 py-3 hover:bg-theme-hover flex items-center gap-3 transition-colors text-sm text-theme-text border-b border-theme-border last:border-0"
                      >
                        <CompanyLogo
                          company={company}
                          className="w-6 h-6 rounded bg-theme-main flex items-center justify-center border border-theme-border flex-shrink-0"
                        />
                        <span className="font-medium truncate">{company.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Company Visual Display */}
                {currentCompany && (
                  <div className="flex items-center gap-3 mt-2 bg-theme-main border border-theme-border rounded-sm p-3 w-fit">
                    <CompanyLogo
                      company={currentCompany}
                      className="w-8 h-8 rounded-sm bg-theme-card flex items-center justify-center border border-theme-border flex-shrink-0"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-theme-text">{currentCompany.name}</span>
                      <span className="text-[10px] text-theme-muted">Selected</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Current Role</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Social & Coding Profiles */}
          <div className="premium-card flex flex-col gap-6">
            <h2 className="text-lg font-bold pb-4 border-b border-theme-border text-theme-text">Social & Coding Profiles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">LinkedIn URL</label>
                <input
                  type="text"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className={`w-full bg-theme-main border rounded-sm px-4 py-3 text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-theme-border-inverted transition-colors shadow-inner ${errors.linkedinUrl ? 'border-red-500' : 'border-theme-border'}`}
                />
                {errors.linkedinUrl && (
                  <p className="text-red-500 text-xs font-semibold mt-1 flex items-center gap-1">
                    <iconify-icon icon="lucide:alert-circle" className="text-sm"></iconify-icon>
                    {errors.linkedinUrl}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">GitHub URL</label>
                <input
                  type="text"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className={`w-full bg-theme-main border rounded-sm px-4 py-3 text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-theme-border-inverted transition-colors shadow-inner ${errors.githubUrl ? 'border-red-500' : 'border-theme-border'}`}
                />
                {errors.githubUrl && (
                  <p className="text-red-500 text-xs font-semibold mt-1 flex items-center gap-1">
                    <iconify-icon icon="lucide:alert-circle" className="text-sm"></iconify-icon>
                    {errors.githubUrl}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">LeetCode URL</label>
                <input
                  type="text"
                  placeholder="https://leetcode.com/username"
                  value={leetcodeUrl}
                  onChange={(e) => setLeetcodeUrl(e.target.value)}
                  className={`w-full bg-theme-main border rounded-sm px-4 py-3 text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-theme-border-inverted transition-colors shadow-inner ${errors.leetcodeUrl ? 'border-red-500' : 'border-theme-border'}`}
                />
                {errors.leetcodeUrl && (
                  <p className="text-red-500 text-xs font-semibold mt-1 flex items-center gap-1">
                    <iconify-icon icon="lucide:alert-circle" className="text-sm"></iconify-icon>
                    {errors.leetcodeUrl}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Portfolio URL</label>
                <input
                  type="text"
                  placeholder="https://yourportfolio.com"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className={`w-full bg-theme-main border rounded-sm px-4 py-3 text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-theme-border-inverted transition-colors shadow-inner ${errors.portfolioUrl ? 'border-red-500' : 'border-theme-border'}`}
                />
                {errors.portfolioUrl && (
                  <p className="text-red-500 text-xs font-semibold mt-1 flex items-center gap-1">
                    <iconify-icon icon="lucide:alert-circle" className="text-sm"></iconify-icon>
                    {errors.portfolioUrl}
                  </p>
                )}
              </div>
            </div>
          </div>

          {globalError && (
            <p className="text-red-500 text-xs font-medium text-center">{globalError}</p>
          )}

          <div className="flex justify-between items-center gap-4">
            <button 
              type="button"
              onClick={handleSkip}
              className="px-6 py-3 bg-transparent border border-theme-border hover:bg-theme-hover rounded-sm text-sm font-bold text-theme-text transition-all cursor-pointer"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-theme-inverted text-theme-inverted-text rounded-sm text-sm font-bold hover:opacity-80 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
