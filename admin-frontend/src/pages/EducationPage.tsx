import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Edit2, Loader2, BookOpen } from 'lucide-react';
import { adminApi } from '../services/api';
import { EducationalInstitution } from '../types';

export const EducationPage: React.FC = () => {
  const [institutions, setInstitutions] = useState<EducationalInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<EducationalInstitution | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    kannadaName: '',
    institutionType: 'COLLEGE' as 'SCHOOL' | 'COLLEGE' | 'POLYTECHNIC' | 'PU_COLLEGE',
    description: '',
    address: 'Pavagada, Karnataka 561202',
    phone: '',
    website: '',
    coursesStr: '',
    facilitiesStr: '',
    openingHours: '09:30 AM – 04:30 PM (Mon–Sat)',
    affiliation: 'Tumkur University',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schools, colleges] = await Promise.all([
        adminApi.getSchools(),
        adminApi.getColleges(),
      ]);
      setInstitutions([...(schools || []), ...(colleges || [])]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingInst(null);
    setFormData({
      name: '',
      kannadaName: '',
      institutionType: 'COLLEGE',
      description: '',
      address: 'Pavagada Town, Karnataka 561202',
      phone: '',
      website: '',
      coursesStr: 'B.A., B.Com., B.Sc.',
      facilitiesStr: 'Library, Science Labs, Computer Center, Sports Ground',
      openingHours: '09:30 AM – 04:30 PM (Mon–Sat)',
      affiliation: 'Tumkur University',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inst: EducationalInstitution) => {
    setEditingInst(inst);
    setFormData({
      name: inst.name,
      kannadaName: inst.kannadaName || '',
      institutionType: inst.institutionType,
      description: inst.description || '',
      address: inst.address,
      phone: inst.phone || '',
      website: inst.website || '',
      coursesStr: (inst.courses || []).join(', '),
      facilitiesStr: (inst.facilities || []).join(', '),
      openingHours: inst.openingHours || '',
      affiliation: inst.affiliation || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      kannadaName: formData.kannadaName,
      institutionType: formData.institutionType,
      description: formData.description,
      address: formData.address,
      phone: formData.phone,
      website: formData.website,
      courses: formData.coursesStr.split(',').map((s) => s.trim()).filter(Boolean),
      facilities: formData.facilitiesStr.split(',').map((s) => s.trim()).filter(Boolean),
      openingHours: formData.openingHours,
      affiliation: formData.affiliation,
      status: 'ACTIVE',
    };

    try {
      if (editingInst) {
        await adminApi.updateInstitution(editingInst.id, payload);
      } else {
        await adminApi.createInstitution(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Save failed.');
    }
  };

  const filtered = filterType === 'ALL'
    ? institutions
    : institutions.filter((i) => i.institutionType === filterType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <GraduationCap size={18} className="text-teal-400" />
            <span>Schools & Colleges Directory</span>
          </h3>
          <p className="text-xs text-slate-400">
            Government first grade colleges, composite PU campuses, and schools in Pavagada taluk.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300"
          >
            <option value="ALL">All Institutions</option>
            <option value="COLLEGE">Colleges</option>
            <option value="PU_COLLEGE">PU Colleges</option>
            <option value="SCHOOL">Schools</option>
            <option value="POLYTECHNIC">Polytechnic</option>
          </select>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-forest/30"
          >
            <Plus size={16} />
            <span>Add Institution</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-teal-400" />
            <span>Loading educational institutions...</span>
          </div>
        ) : (
          filtered.map((inst) => (
            <div key={inst.id} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                      {inst.institutionType}
                    </span>
                    {inst.affiliation && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Affiliation: {inst.affiliation}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">{inst.name}</h4>
                  {inst.kannadaName && <p className="text-xs text-slate-400 mt-0.5">{inst.kannadaName}</p>}
                </div>
                <button
                  onClick={() => handleOpenEdit(inst)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <Edit2 size={14} />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{inst.description}</p>

              {inst.courses && inst.courses.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Offered Courses / Streams</span>
                  <div className="flex flex-wrap gap-1.5">
                    {inst.courses.map((c, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-3">
                <span>{inst.address}</span>
                {inst.phone && <span className="font-mono text-slate-300">{inst.phone}</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingInst ? `Edit ${editingInst.name}` : 'New Educational Institution'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kannada Name</label>
                  <input
                    type="text"
                    value={formData.kannadaName}
                    onChange={(e) => setFormData({ ...formData, kannadaName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={formData.institutionType}
                    onChange={(e) => setFormData({ ...formData, institutionType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="COLLEGE">Degree College</option>
                    <option value="PU_COLLEGE">Pre-University (PU)</option>
                    <option value="SCHOOL">School</option>
                    <option value="POLYTECHNIC">Polytechnic</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Courses (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.coursesStr}
                  onChange={(e) => setFormData({ ...formData, coursesStr: e.target.value })}
                  placeholder="B.A., B.Com., B.Sc."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Facilities</label>
                <input
                  type="text"
                  value={formData.facilitiesStr}
                  onChange={(e) => setFormData({ ...formData, facilitiesStr: e.target.value })}
                  placeholder="Library, Science Labs, Playground"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Affiliation</label>
                  <input
                    type="text"
                    value={formData.affiliation}
                    onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                    placeholder="e.g. Tumkur University"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08136-244510"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest text-white rounded-xl text-xs font-bold"
                >
                  Save Institution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
