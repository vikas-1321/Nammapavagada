import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { adminApi } from '../services/api';
import { Hospital } from '../types';

export const HospitalsPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHosp, setEditingHosp] = useState<Hospital | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    kannadaName: '',
    description: '',
    address: 'Hospital Road, Pavagada 561202',
    latitude: 14.1030,
    longitude: 77.2745,
    phone: '',
    emergencyPhone: '108 / 08136-244240',
    openingHours: '24/7 Casualty & Inpatient',
    servicesStr: '',
    departmentsStr: '',
    website: '',
  });

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getHospitals();
      setHospitals(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleOpenAdd = () => {
    setEditingHosp(null);
    setFormData({
      name: '',
      kannadaName: '',
      description: '',
      address: 'Hospital Road, Pavagada 561202',
      latitude: 14.1030,
      longitude: 77.2745,
      phone: '',
      emergencyPhone: '108 / 08136-244240',
      openingHours: '24/7 Casualty & Inpatient',
      servicesStr: 'Emergency Trauma Care, Arogya Kavacha 108, Maternity Suite, Diagnostics Lab',
      departmentsStr: 'General Medicine, Casualty & Triage, Obstetrics, Pediatrics',
      website: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: Hospital) => {
    setEditingHosp(h);
    setFormData({
      name: h.name,
      kannadaName: h.kannadaName || '',
      description: h.description || '',
      address: h.address,
      latitude: h.latitude || 14.1030,
      longitude: h.longitude || 77.2745,
      phone: h.phone || '',
      emergencyPhone: h.emergencyPhone || '',
      openingHours: h.openingHours || '',
      servicesStr: (h.services || []).join(', '),
      departmentsStr: (h.departments || []).join(', '),
      website: h.website || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      kannadaName: formData.kannadaName,
      description: formData.description,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      phone: formData.phone,
      emergencyPhone: formData.emergencyPhone,
      openingHours: formData.openingHours,
      services: formData.servicesStr.split(',').map((s) => s.trim()).filter(Boolean),
      departments: formData.departmentsStr.split(',').map((s) => s.trim()).filter(Boolean),
      website: formData.website,
    };

    try {
      if (editingHosp) {
        await adminApi.updateHospital(editingHosp.id, payload);
      } else {
        await adminApi.createHospital(payload);
      }
      setIsModalOpen(false);
      fetchHospitals();
    } catch (err: any) {
      alert(err.message || 'Save failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 size={18} className="text-rose-400" />
            <span>Hospital & Healthcare Registry</span>
          </h3>
          <p className="text-xs text-slate-400">
            Emergency helpline numbers, 24/7 casualty desks, and official hospital services.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-forest/30"
        >
          <Plus size={16} />
          <span>Add Hospital</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-rose-400" />
            <span>Loading hospitals...</span>
          </div>
        ) : (
          hospitals.map((h) => (
            <div key={h.id} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-white">{h.name}</h4>
                  {h.kannadaName && <p className="text-xs text-slate-400 mt-0.5">{h.kannadaName}</p>}
                </div>
                <button
                  onClick={() => handleOpenEdit(h)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <Edit2 size={14} />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{h.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Emergency Phone</span>
                  <span className="font-mono font-bold text-rose-400">{h.emergencyPhone || '108'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Operating Hours</span>
                  <span className="font-medium text-slate-200">{h.openingHours || '24/7 Casualty'}</span>
                </div>
              </div>

              {h.services && h.services.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Key Services</span>
                  <div className="flex flex-wrap gap-1.5">
                    {h.services.map((srv, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-medium">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingHosp ? `Edit ${editingHosp.name}` : 'New Hospital Record'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hospital Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kannada Name</label>
                <input
                  type="text"
                  value={formData.kannadaName}
                  onChange={(e) => setFormData({ ...formData, kannadaName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Landline / Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08136-244240"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    placeholder="108 / 08136-244240"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Services (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.servicesStr}
                  onChange={(e) => setFormData({ ...formData, servicesStr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Departments (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.departmentsStr}
                  onChange={(e) => setFormData({ ...formData, departmentsStr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
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
                  Save Hospital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
