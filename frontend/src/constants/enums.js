export const InterviewTypes = [
  { label: "Online", value: "ONLINE" },
  { label: "Offline", value: "OFFLINE" },
  { label: "Hybrid", value: "HYBRID" }
];

export const ExperienceLevels = [
  { label: "Fresher", value: "FRESHER" },
  { label: "Experienced", value: "EXPERIENCED" },
  { label: "Internship", value: "INTERNSHIP" }
];

export const InterviewResults = [
  { label: "Selected", value: "SELECTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Pending", value: "PENDING" },
  { label: "Withdrawn", value: "WITHDRAWN" }
];

export const Difficulties = [
  { label: "Easy", value: "EASY" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Hard", value: "HARD" }
];

export const RoundTypes = [
  { label: "Online Assessment", value: "ONLINE_ASSESSMENT" },
  { label: "Coding", value: "CODING" },
  { label: "Technical", value: "TECHNICAL" },
  { label: "System Design", value: "SYSTEM_DESIGN" },
  { label: "Machine Coding", value: "MACHINE_CODING" },
  { label: "Pair Programming", value: "PAIR_PROGRAMMING" },
  { label: "Managerial", value: "MANAGERIAL" },
  { label: "Behavioral", value: "BEHAVIORAL" },
  { label: "HR", value: "HR" }
];

// Helper functions to get display labels for enum values
export const getInterviewTypeLabel = (value) => 
  InterviewTypes.find(item => item.value === value)?.label || value || 'Online';

export const getExperienceLevelLabel = (value) => 
  ExperienceLevels.find(item => item.value === value)?.label || value || 'Fresher';

export const getInterviewResultLabel = (value) => 
  InterviewResults.find(item => item.value === value)?.label || value || 'Selected';

export const getDifficultyLabel = (value) => 
  Difficulties.find(item => item.value === value)?.label || value || 'Medium';

export const getRoundTypeLabel = (value) => 
  RoundTypes.find(item => item.value === value)?.label || value || 'Technical';

export const getStatusBadgeClass = (result) => {
  const r = String(result || 'SELECTED').toUpperCase();
  if (r === 'SELECTED') {
    return 'bg-green-500/10 text-green-500 border-green-500/20';
  }
  if (r === 'PENDING' || r === 'WAITLISTED' || r === 'NO_RESPONSE') {
    return 'bg-[rgba(212,164,76,0.12)] text-[#d4a44c] border-[rgba(212,164,76,0.2)]';
  }
  if (r === 'WITHDRAWN') {
    return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  }
  return 'bg-[rgba(196,123,123,0.12)] text-[#c47b7b] border-[rgba(196,123,123,0.2)]';
};

export const CareerStatuses = [
  { label: "Student", value: "STUDENT" },
  { label: "Intern", value: "INTERN" },
  { label: "Employee", value: "EMPLOYEE" },
  { label: "Freelancer", value: "FREELANCER" },
  { label: "Open to Work", value: "OPEN_TO_WORK" }
];

export const getCareerStatusLabel = (value) => 
  CareerStatuses.find(item => item.value === value)?.label || value || 'Student';

