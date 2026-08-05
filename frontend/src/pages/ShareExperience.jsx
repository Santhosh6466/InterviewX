import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import companyService from '../services/companyService';
import experienceService from '../services/experienceService';
import interviewRoundService from '../services/interviewRoundService';
import { InterviewTypes, ExperienceLevels, InterviewResults, Difficulties, RoundTypes } from '../constants/enums';
import { toast } from 'react-hot-toast';

export default function ShareExperience() {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Experience form state
  const [companyId, setCompanyId] = useState('');
  const [role, setRole] = useState('');
  const [interviewType, setInterviewType] = useState('ONLINE');
  const [result, setResult] = useState('SELECTED');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [experienceLevel, setExperienceLevel] = useState('FRESHER');
  const [location, setLocation] = useState('Remote');
  const [interviewDate, setInterviewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [overallExperience, setOverallExperience] = useState('');

  // Dynamic rounds state
  const [rounds, setRounds] = useState([
    { title: '', roundType: 'TECHNICAL', description: '', duration: 60, difficulty: 'MEDIUM' }
  ]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const data = await companyService.getAllCompanies();
      if (Array.isArray(data) && data.length > 0) {
        setCompanies(data);
      } else {
        setCompanies([
          { id: '1', name: 'Google' },
          { id: '2', name: 'Amazon' },
          { id: '3', name: 'Microsoft' }
        ]);
      }
    } catch (err) {
      console.warn('[ShareExperience] Error fetching companies:', err);
      setCompanies([
        { id: '1', name: 'Google' },
        { id: '2', name: 'Amazon' },
        { id: '3', name: 'Microsoft' }
      ]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleAddRound = () => {
    setRounds((prev) => [
      ...prev,
      { title: '', roundType: 'TECHNICAL', description: '', duration: 60, difficulty: 'MEDIUM' }
    ]);
  };

  const handleRoundChange = (index, field, value) => {
    setRounds((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveRound = (index) => {
    if (rounds.length <= 1) return;
    setRounds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!role.trim()) {
      setError('Role is required');
      return;
    }

    setSubmitting(true);

    try {
      const expData = {
        title: title.trim() || `${role} Interview Experience`,
        overallExperience: overallExperience.trim(),
        companyId: companyId || (companies[0]?.id || companies[0]?._id || '1'),
        role: role.trim(),
        interviewType: String(interviewType || 'ONLINE').toUpperCase(),
        experienceLevel: String(experienceLevel || 'FRESHER').toUpperCase(),
        location: location,
        interviewDate: interviewDate,
        result: String(result || 'SELECTED').toUpperCase(),
        difficulty: String(difficulty || 'MEDIUM').toUpperCase()
      };

      const createdExp = await experienceService.createExperience(expData);
      const expId = createdExp.id || createdExp._id || createdExp.experienceId;

      // Submit rounds if createdExp has id
      if (expId) {
        for (let i = 0; i < rounds.length; i++) {
          const round = rounds[i];
          if (round.title.trim() || round.description.trim()) {
            await interviewRoundService.createRound({
              experienceId: expId,
              roundNumber: i + 1,
              roundType: String(round.roundType || 'TECHNICAL').toUpperCase(),
              title: round.title.trim() || `Round ${i + 1}`,
              description: round.description.trim(),
              duration: parseInt(round.duration, 10) || 60,
              difficulty: String(round.difficulty || 'MEDIUM').toUpperCase()
            });
          }
        }
      }

      toast.success('Interview experience shared successfully!');
      window.location.hash = '#/profile';
    } catch (err) {
      console.error('[ShareExperience] Error creating experience:', err);
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to submit experience';
      setError(typeof msg === 'string' ? msg : 'Failed to submit experience');
      toast.error('Failed to submit experience');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout activeTab="My Contributions">
      <div className="flex flex-col gap-8 max-w-[800px] mx-auto w-full fade-in-up">

        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Share Interview Experience</h1>
          <p className="text-theme-muted text-sm">Help others by sharing your interview experience.</p>
        </div>

        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>

          {/* Basic Details Box */}
          <div className="premium-card flex flex-col gap-6">
            <h2 className="text-lg font-bold pb-4 border-b border-theme-border">Basic Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Company <span className="text-red-500">*</span></label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select company</option>
                  {companies.map((c) => (
                    <option key={c.id || c._id || c.name} value={c.id || c._id || c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Role <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer Intern"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Interview Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="input-field"
                >
                  {InterviewTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Result</label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="input-field"
                >
                  {InterviewResults.map((res) => (
                    <option key={res.value} value={res.value}>{res.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-theme-text">Overall Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="input-field"
                >
                  {Difficulties.map((diff) => (
                    <option key={diff.value} value={diff.value}>{diff.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-theme-text">Overall Experience Description</label>
              <textarea
                rows="3"
                placeholder="Share an overview of your overall interview process..."
                value={overallExperience}
                onChange={(e) => setOverallExperience(e.target.value)}
                className="input-field resize-none"
              ></textarea>
            </div>
          </div>

          {/* Rounds Box */}
          <div className="premium-card flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-theme-border">
              <h2 className="text-lg font-bold">Rounds</h2>
            </div>

            {rounds.map((round, index) => (
              <div key={index} className="flex flex-col gap-6 bg-theme-main p-6 rounded-sm border border-theme-border relative">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-theme-hover text-theme-muted text-[10px] font-bold rounded-sm">Round {index + 1}</span>
                  {rounds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRound(index)}
                      className="text-xs font-bold text-red-500 hover:opacity-80 transition-opacity"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-theme-text">Round Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Online Assessment"
                      value={round.title}
                      onChange={(e) => handleRoundChange(index, 'title', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-theme-text">Round Type</label>
                    <select
                      value={round.roundType}
                      onChange={(e) => handleRoundChange(index, 'roundType', e.target.value)}
                      className="input-field"
                    >
                      {RoundTypes.map((rt) => (
                        <option key={rt.value} value={rt.value}>{rt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-theme-text">Questions & Process Details</label>
                  <textarea
                    rows="3"
                    placeholder="Describe the questions asked..."
                    value={round.description}
                    onChange={(e) => handleRoundChange(index, 'description', e.target.value)}
                    className="input-field resize-none"
                  ></textarea>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddRound}
              className="py-3 border border-dashed border-theme-border-inverted hover:border-theme-inverted/40 hover:bg-theme-hover rounded-sm text-sm font-bold text-theme-muted hover:text-theme-text transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <iconify-icon icon="lucide:plus"></iconify-icon> Add Another Round
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-medium text-center">{error}</p>
          )}

          <div className="flex justify-end gap-4">
            <a href="#/dashboard" className="px-6 py-3 bg-transparent border border-theme-border hover:bg-theme-hover rounded-sm text-sm font-bold text-theme-text transition-all">Cancel</a>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-theme-inverted text-theme-inverted-text rounded-sm text-sm font-bold hover:opacity-80 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Experience'}
            </button>
          </div>

        </form>

      </div>
    </DashboardLayout>
  );
}
