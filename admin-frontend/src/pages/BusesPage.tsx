import React, { useState, useEffect } from 'react';
import {
  Bus,
  Plus,
  ArrowUpDown,
  Clock,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  MapPin,
  Pencil,
  CheckCircle,
  AlertTriangle,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { adminApi } from '../services/api';
import { BusRoute, BusStop, BusTiming, RouteStop } from '../types';

export const BusesPage: React.FC = () => {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [stops, setStops] = useState<BusStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);

  // Search & Filters for Routes
  const [routeSearch, setRouteSearch] = useState('');
  const [operatorFilter, setOperatorFilter] = useState<string>('ALL');

  // Modals
  const [isCreateRouteModalOpen, setIsCreateRouteModalOpen] = useState(false);
  const [isEditRouteModalOpen, setIsEditRouteModalOpen] = useState(false);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [isEditingStopModalOpen, setIsEditingStopModalOpen] = useState(false);
  const [isTimingModalOpen, setIsTimingModalOpen] = useState(false);
  const [isAddStopToRouteOpen, setIsAddStopToRouteOpen] = useState(false);
  const [isEditRouteStopModalOpen, setIsEditRouteStopModalOpen] = useState(false);

  // Active items for editing
  const [editingRoute, setEditingRoute] = useState<BusRoute | null>(null);
  const [editingStop, setEditingStop] = useState<BusStop | null>(null);
  const [editingRouteStop, setEditingRouteStop] = useState<RouteStop | null>(null);

  // Form states
  const [routeForm, setRouteForm] = useState({
    routeCode: '',
    source: '',
    destination: '',
    viaStr: '',
    operator: 'KSRTC',
    frequencyNote: '',
    statusNote: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED',
    isTimetableLive: false,
  });

  const [stopForm, setStopForm] = useState({
    stopName: '',
    kannadaName: '',
    locationArea: 'Pavagada Taluk',
    latitude: 14.1025,
    longitude: 77.2798,
    description: '',
  });

  const [timingForm, setTimingForm] = useState({
    departureTime: '07:00 AM',
    arrivalTime: '09:30 AM',
    dayType: 'DAILY' as 'DAILY' | 'MON_SAT' | 'MON_FRI' | 'SUNDAY' | 'HOLIDAY',
    busType: 'EXPRESS',
    remarks: 'Regular scheduled service',
  });

  const [linkStopForm, setLinkStopForm] = useState({
    stopId: '',
    isMajorStop: false,
    arrivalEstimateMinutes: 0,
  });

  const [editRouteStopForm, setEditRouteStopForm] = useState({
    isMajorStop: false,
    arrivalEstimateMinutes: 0,
    sequence: 1,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, sRes] = await Promise.all([
        adminApi.getBusRoutes(),
        adminApi.getBusStops(),
      ]);
      const fetchedRoutes = rRes.items || [];
      setRoutes(fetchedRoutes);
      setStops(sRes || []);

      if (fetchedRoutes.length > 0) {
        if (!selectedRoute) {
          setSelectedRoute(fetchedRoutes[0]);
        } else {
          const refreshed = fetchedRoutes.find((r) => r.id === selectedRoute.id);
          setSelectedRoute(refreshed || fetchedRoutes[0]);
        }
      } else {
        setSelectedRoute(null);
      }
    } catch (err) {
      console.error('Error fetching bus data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -------------------------------------------------------------
  // ROUTE ACTIONS: Create, Edit, Delete
  // -------------------------------------------------------------
  const handleOpenCreateRoute = () => {
    setRouteForm({
      routeCode: '',
      source: '',
      destination: '',
      viaStr: '',
      operator: 'KSRTC',
      frequencyNote: 'Every 30 mins',
      statusNote: '',
      status: 'ACTIVE',
      isTimetableLive: true,
    });
    setIsCreateRouteModalOpen(true);
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const via = routeForm.viaStr.split(',').map((s) => s.trim()).filter(Boolean);
      const newRoute = await adminApi.createBusRoute({
        routeCode: routeForm.routeCode,
        source: routeForm.source,
        destination: routeForm.destination,
        via,
        operator: routeForm.operator,
        frequencyNote: routeForm.frequencyNote,
        statusNote: routeForm.statusNote,
        status: routeForm.status,
        isTimetableLive: routeForm.isTimetableLive,
      });
      setIsCreateRouteModalOpen(false);
      await fetchData();
      setSelectedRoute(newRoute);
    } catch (err: any) {
      alert(err.message || 'Failed to create route.');
    }
  };

  const handleOpenEditRoute = (route: BusRoute) => {
    setEditingRoute(route);
    setRouteForm({
      routeCode: route.routeCode,
      source: route.source,
      destination: route.destination,
      viaStr: (route.via || []).join(', '),
      operator: route.operator || 'KSRTC',
      frequencyNote: route.frequencyNote || '',
      statusNote: route.statusNote || '',
      status: route.status || 'ACTIVE',
      isTimetableLive: route.isTimetableLive || false,
    });
    setIsEditRouteModalOpen(true);
  };

  const handleUpdateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute) return;
    try {
      const via = routeForm.viaStr.split(',').map((s) => s.trim()).filter(Boolean);
      const updated = await adminApi.updateBusRoute(editingRoute.id, {
        routeCode: routeForm.routeCode,
        source: routeForm.source,
        destination: routeForm.destination,
        via,
        operator: routeForm.operator,
        frequencyNote: routeForm.frequencyNote,
        statusNote: routeForm.statusNote,
        status: routeForm.status,
        isTimetableLive: routeForm.isTimetableLive,
      });
      setIsEditRouteModalOpen(false);
      setEditingRoute(null);
      await fetchData();
      if (selectedRoute?.id === updated.id) {
        setSelectedRoute(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update route.');
    }
  };

  const handleDeleteRoute = async (route: BusRoute) => {
    const confirmMsg = `Are you sure you want to delete route "${route.routeCode} (${route.source} → ${route.destination})"?\n\nThis will remove all associated corridor stops and scheduled timetables. This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await adminApi.deleteBusRoute(route.id);
      if (selectedRoute?.id === route.id) {
        setSelectedRoute(null);
      }
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete route.');
    }
  };

  // -------------------------------------------------------------
  // STOP CATALOG ACTIONS: Create, Edit
  // -------------------------------------------------------------
  const handleOpenCreateStop = () => {
    setStopForm({
      stopName: '',
      kannadaName: '',
      locationArea: 'Pavagada Taluk',
      latitude: 14.1025,
      longitude: 77.2798,
      description: '',
    });
    setIsStopModalOpen(true);
  };

  const handleCreateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createBusStop(stopForm);
      setIsStopModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create stop.');
    }
  };

  const handleOpenEditStopCatalog = (stop: BusStop) => {
    setEditingStop(stop);
    setStopForm({
      stopName: stop.stopName,
      kannadaName: stop.kannadaName || '',
      locationArea: stop.locationArea || 'Pavagada Taluk',
      latitude: stop.latitude || 14.1025,
      longitude: stop.longitude || 77.2798,
      description: stop.description || '',
    });
    setIsEditingStopModalOpen(true);
  };

  const handleUpdateStopCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStop) return;
    try {
      await adminApi.updateBusStop(editingStop.id, stopForm);
      setIsEditingStopModalOpen(false);
      setEditingStop(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update stop.');
    }
  };

  // -------------------------------------------------------------
  // ROUTE STOPS & SEQUENCE ACTIONS: Link, Remove, Reorder, Edit
  // -------------------------------------------------------------
  const handleOpenLinkStop = () => {
    // Pick the first available stop that is not yet linked to this route
    const currentLinkedIds = new Set((selectedRoute?.stops || []).map((s) => s.stopId));
    const firstAvailable = stops.find((s) => !currentLinkedIds.has(s.id));

    setLinkStopForm({
      stopId: firstAvailable ? firstAvailable.id : '',
      isMajorStop: false,
      arrivalEstimateMinutes: ((selectedRoute?.stops?.length || 0) + 1) * 20,
    });
    setIsAddStopToRouteOpen(true);
  };

  const handleAddStopToRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute || !linkStopForm.stopId) return;
    try {
      const nextSequence = (selectedRoute.stops?.length || 0) + 1;
      await adminApi.addStopToRoute(
        selectedRoute.id,
        linkStopForm.stopId,
        nextSequence,
        linkStopForm.isMajorStop,
        linkStopForm.arrivalEstimateMinutes
      );
      setIsAddStopToRouteOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add stop to route.');
    }
  };

  const handleRemoveStopFromRoute = async (rs: RouteStop) => {
    if (!selectedRoute) return;
    const confirmMsg = `Remove stop "${rs.stopName}" from this route corridor (${selectedRoute.routeCode})?\n\nThe remaining stops will automatically be re-sequenced.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const updatedRoute = await adminApi.removeStopFromRoute(selectedRoute.id, rs.stopId);
      setSelectedRoute(updatedRoute);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove stop from route.');
    }
  };

  const handleMoveStop = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!selectedRoute || !selectedRoute.stops) return;
    const currentStops = [...selectedRoute.stops];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentStops.length) return;

    // Swap positions
    const temp = currentStops[index];
    currentStops[index] = currentStops[targetIndex];
    currentStops[targetIndex] = temp;

    const stopIdsInOrder = currentStops.map((s) => s.stopId);
    try {
      const updatedRoute = await adminApi.reorderRouteStops(selectedRoute.id, stopIdsInOrder);
      setSelectedRoute(updatedRoute);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to reorder stops.');
    }
  };

  const handleToggleMajorStop = async (rs: RouteStop) => {
    if (!selectedRoute) return;
    try {
      const updatedRoute = await adminApi.updateRouteStop(selectedRoute.id, rs.stopId, {
        isMajorStop: !rs.isMajorStop,
      });
      setSelectedRoute(updatedRoute);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle major hub status.');
    }
  };

  const handleOpenEditRouteStop = (rs: RouteStop) => {
    setEditingRouteStop(rs);
    setEditRouteStopForm({
      isMajorStop: rs.isMajorStop,
      arrivalEstimateMinutes: rs.arrivalEstimateMinutes || 0,
      sequence: rs.sequence,
    });
    setIsEditRouteStopModalOpen(true);
  };

  const handleUpdateRouteStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute || !editingRouteStop) return;
    try {
      const updatedRoute = await adminApi.updateRouteStop(selectedRoute.id, editingRouteStop.stopId, {
        isMajorStop: editRouteStopForm.isMajorStop,
        sequence: editRouteStopForm.sequence,
        arrivalEstimateMinutes: editRouteStopForm.arrivalEstimateMinutes,
      });
      setIsEditRouteStopModalOpen(false);
      setEditingRouteStop(null);
      setSelectedRoute(updatedRoute);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update route stop.');
    }
  };

  // -------------------------------------------------------------
  // TIMINGS ACTIONS: Add, Delete
  // -------------------------------------------------------------
  const handleAddTiming = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;
    try {
      await adminApi.addBusTiming(selectedRoute.id, timingForm);
      setIsTimingModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add timing.');
    }
  };

  const handleDeleteTiming = async (timingId: number) => {
    if (!window.confirm('Delete this scheduled bus departure?')) return;
    try {
      await adminApi.deleteBusTiming(timingId);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete timing.');
    }
  };

  // Filtered routes list based on search and operator
  const filteredRoutes = routes.filter((r) => {
    const matchesOperator = operatorFilter === 'ALL' || r.operator === operatorFilter;
    const q = routeSearch.toLowerCase().trim();
    if (!q) return matchesOperator;

    const matchesSearch =
      r.routeCode.toLowerCase().includes(q) ||
      r.source.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q) ||
      (r.via && r.via.some((v) => v.toLowerCase().includes(q))) ||
      (r.operator && r.operator.toLowerCase().includes(q));

    return matchesOperator && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bus size={18} className="text-blue-400" />
            <span>Bus Routes & Intercity Timetable CMS</span>
          </h3>
          <p className="text-xs text-slate-400">
            Edit and delete corridor routes, reorder sequence stops, and configure verified schedules.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenCreateStop}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MapPin size={14} className="text-emerald-400" />
            <span>New Bus Stop</span>
          </button>
          <button
            onClick={handleOpenCreateRoute}
            className="px-4 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-forest/30 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Route</span>
          </button>
        </div>
      </div>

      {/* Two Column Workspace: Routes Browser on Left | Full Route & Stops Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: Routes Browser */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Corridor Routes ({filteredRoutes.length})
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">
              Total: {routes.length}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={routeSearch}
              onChange={(e) => setRouteSearch(e.target.value)}
              placeholder="Filter by code, origin, destination..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Operator Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
            {['ALL', 'KSRTC', 'APSRTC', 'PRIVATE'].map((op) => (
              <button
                key={op}
                onClick={() => setOperatorFilter(op)}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  operatorFilter === op
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {op}
              </button>
            ))}
          </div>

          {/* Routes Scrollable List */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 size={24} className="animate-spin mx-auto text-blue-400 mb-2" />
                <span className="text-xs">Loading corridors...</span>
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No routes found matching filter.
              </div>
            ) : (
              filteredRoutes.map((r) => {
                const isSelected = selectedRoute?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoute(r)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-600 shadow-md ring-1 ring-blue-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] font-bold text-emerald-400">
                        {r.routeCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                          {r.operator}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            r.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          title={`Status: ${r.status}`}
                        />
                      </div>
                    </div>

                    <p className="text-xs font-bold text-white leading-snug">
                      {r.source} → {r.destination}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span className="truncate pr-2">
                        Via: {r.via?.join(', ') || 'Direct'}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 shrink-0">
                        {r.stops?.length || 0} stops
                      </span>
                    </div>

                    {/* Quick action buttons on card hover */}
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditRoute(r);
                        }}
                        className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                        title="Edit route details"
                      >
                        <Pencil size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoute(r);
                        }}
                        className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                        title="Delete route"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Route Details, Stops Ordering, & Timings CMS */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRoute ? (
            <>
              {/* 1. Route Summary Banner with Action Controls */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {selectedRoute.routeCode}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          selectedRoute.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {selectedRoute.status}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        {selectedRoute.operator}
                      </span>
                      {selectedRoute.isTimetableLive && (
                        <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-1">
                          <CheckCircle size={10} /> Live
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-white mt-1">
                      {selectedRoute.source} → {selectedRoute.destination}
                    </h3>
                  </div>

                  {/* Route Edit & Delete Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditRoute(selectedRoute)}
                      className="px-3 py-1.5 bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Pencil size={13} />
                      <span>Edit Route</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoute(selectedRoute)}
                      className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Delete Route</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Via Corridor: </span>
                    <span className="text-white font-medium">
                      {selectedRoute.via && selectedRoute.via.length > 0
                        ? selectedRoute.via.join(' • ')
                        : 'Direct Non-Stop Express'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Frequency: </span>
                    <span className="text-white font-medium">
                      {selectedRoute.frequencyNote || 'Standard service'}
                    </span>
                  </div>
                  {selectedRoute.statusNote && (
                    <div className="col-span-full text-amber-300/90 text-[11px] bg-amber-950/30 p-2 rounded-lg border border-amber-900/40">
                      ℹ️ {selectedRoute.statusNote}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Route Stops & Travel Order Sequence CMS */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ArrowUpDown size={16} className="text-emerald-400" />
                      <span>Route Stops Sequence (In Travel Order)</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Arrange stops in the exact sequence the bus travels. Move up/down, toggle major hubs, or remove stops.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenLinkStop}
                      className="px-3 py-1.5 bg-forest hover:bg-forest-light text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Plus size={14} />
                      <span>Link Stop</span>
                    </button>
                  </div>
                </div>

                {/* Stops Sequenced List */}
                <div className="space-y-2">
                  {selectedRoute.stops && selectedRoute.stops.length > 0 ? (
                    selectedRoute.stops.map((rs, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === (selectedRoute.stops?.length ?? 0) - 1;

                      return (
                        <div
                          key={rs.id || `${rs.stopId}-${idx}`}
                          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 transition-colors hover:border-slate-700"
                        >
                          {/* Sequence index & stop details */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-mono text-xs font-bold text-emerald-400 shrink-0 border border-slate-700">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-bold text-white truncate">
                                  {rs.stopName}
                                </p>
                                {rs.kannadaName && (
                                  <span className="text-[11px] text-slate-400 font-sans">
                                    ({rs.kannadaName})
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleToggleMajorStop(rs)}
                                  title="Click to toggle Major Hub / Junction status"
                                  className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                                    rs.isMajorStop
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {rs.isMajorStop ? '★ Major Hub' : 'Regular Stop'}
                                </button>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                                {rs.arrivalEstimateMinutes !== undefined && rs.arrivalEstimateMinutes !== null && (
                                  <span className="font-mono text-blue-400">
                                    ⏱ ~{rs.arrivalEstimateMinutes}m from departure
                                  </span>
                                )}
                                {rs.latitude && rs.longitude && (
                                  <span className="text-slate-500 font-mono">
                                    ({rs.latitude.toFixed(3)}, {rs.longitude.toFixed(3)})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Controls: Move Up, Move Down, Edit, Remove */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Move Up */}
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => handleMoveStop(idx, 'UP')}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                              title="Move Stop Up (Earlier in travel order)"
                            >
                              <ChevronUp size={14} />
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => handleMoveStop(idx, 'DOWN')}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                              title="Move Stop Down (Later in travel order)"
                            >
                              <ChevronDown size={14} />
                            </button>

                            {/* Edit Stop Sequence / Time */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditRouteStop(rs)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-blue-400 cursor-pointer transition-colors"
                              title="Edit sequence / estimated minutes"
                            >
                              <Pencil size={13} />
                            </button>

                            {/* Delete Stop from Route */}
                            <button
                              type="button"
                              onClick={() => handleRemoveStopFromRoute(rs)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 cursor-pointer transition-colors"
                              title="Delete stop from this route"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                      No stops mapped to this corridor yet. Click <strong>"Link Stop"</strong> above to add boarding points.
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Verified Bus Timings & Departures */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock size={16} className="text-amber-400" />
                      <span>Verified Bus Schedules & Timings</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Daily and weekend scheduled services from origin to destination.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTimingModalOpen(true)}
                    className="px-3 py-1.5 bg-forest hover:bg-forest-light text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Timing Run</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                        <th className="py-2.5 px-3">Departure</th>
                        <th className="py-2.5 px-3">Est. Arrival</th>
                        <th className="py-2.5 px-3">Day Type</th>
                        <th className="py-2.5 px-3">Bus Type</th>
                        <th className="py-2.5 px-3">Remarks</th>
                        <th className="py-2.5 px-3 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {selectedRoute.timings && selectedRoute.timings.length > 0 ? (
                        selectedRoute.timings.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-mono font-bold text-white">
                              {t.departureTime}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-300">
                              {t.arrivalTime || '—'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                                {t.dayType}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-emerald-400 font-medium">
                              {t.busType}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                              {t.remarks || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteTiming(t.id)}
                                className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete this timing"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-500">
                            No timings scheduled for this route yet. Click "Add Timing Run" above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 border border-slate-800">
              <Bus size={32} className="mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">No Bus Route Selected</p>
              <p className="text-xs text-slate-500 mt-1">
                Select a corridor route from the left list or create a new route to manage stops and timings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================= */}
      {/* MODAL: CREATE BUS ROUTE                                      */}
      {/* ============================================================= */}
      {isCreateRouteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus size={18} className="text-emerald-400" />
              <span>Create New Bus Route</span>
            </h3>
            <form onSubmit={handleCreateRoute} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Route Code * (e.g. PVG-BLR-05)
                </label>
                <input
                  type="text"
                  required
                  value={routeForm.routeCode}
                  onChange={(e) => setRouteForm({ ...routeForm, routeCode: e.target.value })}
                  placeholder="PVG-BLR-05"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Starting Point *
                  </label>
                  <input
                    type="text"
                    required
                    value={routeForm.source}
                    onChange={(e) => setRouteForm({ ...routeForm, source: e.target.value })}
                    placeholder="Pavagada Bus Stand"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Destination *
                  </label>
                  <input
                    type="text"
                    required
                    value={routeForm.destination}
                    onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                    placeholder="Bengaluru Majestic"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Via Points (Comma-separated)
                </label>
                <input
                  type="text"
                  value={routeForm.viaStr}
                  onChange={(e) => setRouteForm({ ...routeForm, viaStr: e.target.value })}
                  placeholder="Madhugiri, Koratagere, Tumakuru"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Operator</label>
                  <select
                    value={routeForm.operator}
                    onChange={(e) => setRouteForm({ ...routeForm, operator: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="KSRTC">KSRTC</option>
                    <option value="APSRTC">APSRTC</option>
                    <option value="PRIVATE">Private Express</option>
                    <option value="INDIAN_RAILWAYS">Indian Railways</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Frequency</label>
                  <input
                    type="text"
                    value={routeForm.frequencyNote}
                    onChange={(e) => setRouteForm({ ...routeForm, frequencyNote: e.target.value })}
                    placeholder="Every 30 mins"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateRouteModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Create Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: EDIT EXISTING BUS ROUTE                               */}
      {/* ============================================================= */}
      {isEditRouteModalOpen && editingRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pencil size={18} className="text-blue-400" />
                <span>Edit Bus Route ({editingRoute.routeCode})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditRouteModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateRoute} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Route Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={routeForm.routeCode}
                    onChange={(e) => setRouteForm({ ...routeForm, routeCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={routeForm.status}
                    onChange={(e) => setRouteForm({ ...routeForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Starting Point *
                  </label>
                  <input
                    type="text"
                    required
                    value={routeForm.source}
                    onChange={(e) => setRouteForm({ ...routeForm, source: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Destination *
                  </label>
                  <input
                    type="text"
                    required
                    value={routeForm.destination}
                    onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Via Corridor (Comma-separated points)
                </label>
                <input
                  type="text"
                  value={routeForm.viaStr}
                  onChange={(e) => setRouteForm({ ...routeForm, viaStr: e.target.value })}
                  placeholder="Madhugiri, Koratagere, Tumakuru"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Operator</label>
                  <select
                    value={routeForm.operator}
                    onChange={(e) => setRouteForm({ ...routeForm, operator: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="KSRTC">KSRTC</option>
                    <option value="APSRTC">APSRTC</option>
                    <option value="PRIVATE">Private Express</option>
                    <option value="INDIAN_RAILWAYS">Indian Railways</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Frequency</label>
                  <input
                    type="text"
                    value={routeForm.frequencyNote}
                    onChange={(e) => setRouteForm({ ...routeForm, frequencyNote: e.target.value })}
                    placeholder="e.g. Every 20 minutes"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status Note / Advisory (Optional)
                </label>
                <input
                  type="text"
                  value={routeForm.statusNote}
                  onChange={(e) => setRouteForm({ ...routeForm, statusNote: e.target.value })}
                  placeholder="e.g. Peak hour frequency runs via bypass"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsTimetableLive"
                  checked={routeForm.isTimetableLive}
                  onChange={(e) => setRouteForm({ ...routeForm, isTimetableLive: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-blue-500"
                />
                <label htmlFor="editIsTimetableLive" className="text-xs text-slate-300 select-none cursor-pointer">
                  Display verified live departures publicly
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditRouteModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Route Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: LINK STOP TO ROUTE                                    */}
      {/* ============================================================= */}
      {isAddStopToRouteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus size={16} className="text-emerald-400" />
              <span>Link Stop to Corridor</span>
            </h3>
            <form onSubmit={handleAddStopToRoute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Choose Stop from Catalog *
                </label>
                <select
                  required
                  value={linkStopForm.stopId}
                  onChange={(e) => setLinkStopForm({ ...linkStopForm, stopId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="">-- Choose Stop --</option>
                  {stops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.stopName} {s.kannadaName ? `(${s.kannadaName})` : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddStopToRouteOpen(false);
                    handleOpenCreateStop();
                  }}
                  className="text-[11px] text-blue-400 hover:underline mt-1.5 inline-block cursor-pointer"
                >
                  + Stop not listed? Create new bus stop
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Est. Minutes from Origin
                </label>
                <input
                  type="number"
                  min="0"
                  value={linkStopForm.arrivalEstimateMinutes}
                  onChange={(e) =>
                    setLinkStopForm({
                      ...linkStopForm,
                      arrivalEstimateMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                  placeholder="30"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="linkIsMajor"
                  checked={linkStopForm.isMajorStop}
                  onChange={(e) =>
                    setLinkStopForm({ ...linkStopForm, isMajorStop: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500"
                />
                <label htmlFor="linkIsMajor" className="text-xs text-slate-300 select-none cursor-pointer">
                  Mark as Major Terminal / Transfer Junction
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStopToRouteOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!linkStopForm.stopId}
                  className="px-5 py-2 bg-forest text-white rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  Link Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: EDIT ROUTE STOP DETAILS (Sequence & Minutes)          */}
      {/* ============================================================= */}
      {isEditRouteStopModalOpen && editingRouteStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Pencil size={16} className="text-blue-400" />
              <span>Configure Stop on Route</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-bold text-emerald-400">
              {editingRouteStop.stopName}
            </p>

            <form onSubmit={handleUpdateRouteStop} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sequence Position (Travel Order)
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedRoute?.stops?.length || 50}
                  value={editRouteStopForm.sequence}
                  onChange={(e) =>
                    setEditRouteStopForm({
                      ...editRouteStopForm,
                      sequence: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Est. Minutes from Route Start
                </label>
                <input
                  type="number"
                  min="0"
                  value={editRouteStopForm.arrivalEstimateMinutes}
                  onChange={(e) =>
                    setEditRouteStopForm({
                      ...editRouteStopForm,
                      arrivalEstimateMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editRouteStopIsMajor"
                  checked={editRouteStopForm.isMajorStop}
                  onChange={(e) =>
                    setEditRouteStopForm({
                      ...editRouteStopForm,
                      isMajorStop: e.target.checked,
                    })
                  }
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500"
                />
                <label htmlFor="editRouteStopIsMajor" className="text-xs text-slate-300 select-none cursor-pointer">
                  Major Hub / Terminal
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditRouteStopModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: CREATE BUS STOP CATALOG ENTRY                         */}
      {/* ============================================================= */}
      {isStopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-emerald-400" />
              <span>Create New Bus Stop</span>
            </h3>
            <form onSubmit={handleCreateStop} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Stop Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={stopForm.stopName}
                  onChange={(e) => setStopForm({ ...stopForm, stopName: e.target.value })}
                  placeholder="e.g. Y.N. Hosakote Cross"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kannada Name
                  </label>
                  <input
                    type="text"
                    value={stopForm.kannadaName}
                    onChange={(e) => setStopForm({ ...stopForm, kannadaName: e.target.value })}
                    placeholder="ವೈ.ಎನ್. ಹೊಸಕೋಟೆ"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-kannada"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Area / Location
                  </label>
                  <input
                    type="text"
                    value={stopForm.locationArea}
                    onChange={(e) => setStopForm({ ...stopForm, locationArea: e.target.value })}
                    placeholder="Pavagada Taluk"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={stopForm.latitude}
                    onChange={(e) => setStopForm({ ...stopForm, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={stopForm.longitude}
                    onChange={(e) => setStopForm({ ...stopForm, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={stopForm.description}
                  onChange={(e) => setStopForm({ ...stopForm, description: e.target.value })}
                  placeholder="Key road junction with passenger shelter"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsStopModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: ADD BUS TIMING RUN                                    */}
      {/* ============================================================= */}
      {isTimingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              <span>Add Bus Timing Run</span>
            </h3>
            <form onSubmit={handleAddTiming} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Departure Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={timingForm.departureTime}
                    onChange={(e) => setTimingForm({ ...timingForm, departureTime: e.target.value })}
                    placeholder="06:30 AM"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="text"
                    value={timingForm.arrivalTime}
                    onChange={(e) => setTimingForm({ ...timingForm, arrivalTime: e.target.value })}
                    placeholder="10:30 AM"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Day Type *</label>
                  <select
                    value={timingForm.dayType}
                    onChange={(e) => setTimingForm({ ...timingForm, dayType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="MON_SAT">Monday–Saturday</option>
                    <option value="MON_FRI">Monday–Friday</option>
                    <option value="SUNDAY">Sunday Only</option>
                    <option value="HOLIDAY">Holidays Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bus Type</label>
                  <select
                    value={timingForm.busType}
                    onChange={(e) => setTimingForm({ ...timingForm, busType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="EXPRESS">Express</option>
                    <option value="ORDINARY">Ordinary / Gramantara</option>
                    <option value="RAJAHAMSA">Rajahamsa Executive</option>
                    <option value="SLEEPER">Non-AC Sleeper</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Remarks</label>
                <input
                  type="text"
                  value={timingForm.remarks}
                  onChange={(e) => setTimingForm({ ...timingForm, remarks: e.target.value })}
                  placeholder="Morning commuter express"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTimingModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Add Timing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
