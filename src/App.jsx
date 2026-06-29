import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { compressImage, formatDateFR } from './utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- INLINE SVG ICONS ---
const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
const IconLock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5v14"/></svg>;
const IconFileText = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg>;
const IconChevronRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const IconCamera = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>;
const IconCheck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
const IconInfo = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const IconMapPin = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconWind = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>;
const IconDashboard = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>;
const IconList = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconMonobloc = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="3" width="12" height="17" rx="2" />
    <line x1="9" y1="7" x2="15" y2="7" />
    <line x1="9" y1="10" x2="15" y2="10" />
    <rect x="10" y="5" width="4" height="1" rx="0.5" fill="currentColor" />
    <circle cx="9" cy="21" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="21" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const IconSplit = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="7" rx="1.5" />
    <circle cx="18" cy="9.5" r="0.75" fill="currentColor" stroke="none" />
    <path d="M5 16c.5 1.5 2 1.5 2.5 0s2-1.5 2.5 0" />
    <path d="M14 16c.5 1.5 2 1.5 2.5 0s2-1.5 2.5 0" />
  </svg>
);

const IconSite = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: 'var(--primary)' }}>
    <path d="M3 21h18" />
    <path d="M19 21V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14" />
    <path d="M9 5V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M12 12v4" />
    <path d="M8 12v4" />
    <path d="M16 12v4" />
  </svg>
);

const IconBuilding = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: 'var(--text-secondary)' }}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="16" />
    <line x1="15" y1="22" x2="15" y2="16" />
    <line x1="9" y1="16" x2="15" y2="16" />
    <path d="M8 6h.01M16 6h.01M8 11h.01M16 11h.01" />
  </svg>
);

const IconFloor = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: 'var(--text-muted)' }}>
    <path d="M2 17h20M2 12h20M2 7h20" />
    <path d="M5 7v10M19 7v10" />
  </svg>
);

const IconRoom = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: 'var(--primary)' }}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// --- DEFAULT SUGGESTIONS (Used for seeding the database table if empty) ---
const DEFAULT_SITES = ["Site Principal (Paris)", "Technopole (Lyon)", "Annexe Est (Strasbourg)"];
const DEFAULT_BUILDINGS = ["Bâtiment A - Administration", "Bâtiment B - R&D", "Bâtiment C - Logistique"];
const DEFAULT_FLOORS = ["RDC", "Étage 1", "Étage 2", "Étage 3"];
const DEFAULT_LOCATIONS = ["Bureau 101", "Bureau 102", "Salle Réunion", "Local Technique", "Accueil"];

function App() {
  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [loggedInUser, setLoggedInUser] = useState(() => localStorage.getItem('loggedInUser') || '');
  const [allowedSites, setAllowedSites] = useState(() => {
    const saved = localStorage.getItem('allowedSites');
    return saved ? JSON.parse(saved) : [];
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const isAllSitesAllowed = loggedInUser === 'admin' || allowedSites.includes('*') || allowedSites.length === 0;

  // Main navigation
  const [currentTab, setCurrentTab] = useState(() => localStorage.getItem('currentTab') || 'dashboard'); // 'dashboard', 'add', 'report'

  useEffect(() => {
    localStorage.setItem('currentTab', currentTab);
  }, [currentTab]);

  // Database records loaded from Supabase
  const [climatiseurs, setClimatiseurs] = useState([]);
  
  // Dashboard states (optimized counters)
  const [stats, setStats] = useState({ total: 0, monobloc: 0, split: 0, equippedRooms: 0 });
  const [recentClimatiseurs, setRecentClimatiseurs] = useState([]);

  // Lazy Loaded Tree states
  const [sites, setSites] = useState([]);
  const [buildingsBySite, setBuildingsBySite] = useState({});
  const [floorsByBuilding, setFloorsByBuilding] = useState({});
  const [roomsByFloor, setRoomsByFloor] = useState({});
  
  // Step Flow states for adding a Climatiseur
  const [currentStep, setCurrentStep] = useState(0); 
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Form states for registering a new climatiseur
  const [climNumber, setClimNumber] = useState('');
  const [climType, setClimType] = useState('monobloc');
  const [climPower, setClimPower] = useState('');
  const [climDate, setClimDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [climPhoto, setClimPhoto] = useState(null); // base64 string
  const [climIsLocation, setClimIsLocation] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showAddFormOverride, setShowAddFormOverride] = useState(false); 

  // Directory Tree View states
  const [expandedNodes, setExpandedNodes] = useState({});
  const [addingNode, setAddingNode] = useState(null); // { parentKey, type, site, batiment, etage }
  const [newNodeValue, setNewNodeValue] = useState('');
  const [treeSearchQuery, setTreeSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);

  // Filter/Search states in reports
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterType, setFilterType] = useState('');

  // Editing Climatiseur states
  const [editingClimId, setEditingClimId] = useState(null);
  const [editClimNumber, setEditClimNumber] = useState('');
  const [editClimType, setEditClimType] = useState('monobloc');
  const [editClimPower, setEditClimPower] = useState('');
  const [editClimDate, setEditClimDate] = useState('');
  const [editClimPhoto, setEditClimPhoto] = useState(null);
  const [editClimIsLocation, setEditClimIsLocation] = useState(false);
  const [showInventoryEditModal, setShowInventoryEditModal] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState('');
  const [supabaseError, setSupabaseError] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Convert Base64 string to Blob for Supabase Storage uploads
  const base64ToBlob = (base64, mimeType = 'image/jpeg') => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  // Fetch data from Supabase
  const loadData = async () => {
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
    if (isPlaceholder) {
      setSupabaseError("Les variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY ne sont pas configurées. Veuillez créer et configurer le fichier .env.local.");
      return;
    }

    try {
      setSupabaseError(null);

      // 1. Fetch counts (efficiently without downloading all rows)
      let totalQuery = supabase.from('climatiseurs').select('*', { count: 'exact', head: true });
      if (!isAllSitesAllowed) {
        totalQuery = totalQuery.in('site', allowedSites);
      }
      const { count: total, error: errTotal } = await totalQuery;
      if (errTotal) throw errTotal;

      let monoQuery = supabase.from('climatiseurs').select('*', { count: 'exact', head: true }).eq('type', 'monobloc');
      if (!isAllSitesAllowed) {
        monoQuery = monoQuery.in('site', allowedSites);
      }
      const { count: monobloc, error: errMono } = await monoQuery;
      if (errMono) throw errMono;

      let splitQuery = supabase.from('climatiseurs').select('*', { count: 'exact', head: true }).eq('type', 'split');
      if (!isAllSitesAllowed) {
        splitQuery = splitQuery.in('site', allowedSites);
      }
      const { count: split, error: errSplit } = await splitQuery;
      if (errSplit) throw errSplit;

      // Equipped rooms count (we download just the location fields of climatiseurs, which is tiny)
      let locsQuery = supabase.from('climatiseurs').select('site,batiment,etage,localisation');
      if (!isAllSitesAllowed) {
        locsQuery = locsQuery.in('site', allowedSites);
      }
      const { data: climLocs, error: errLocs } = await locsQuery;
      if (errLocs) throw errLocs;

      const uniqueEquipped = Array.from(new Set(
        (climLocs || []).map(c => `${c.site}|${c.batiment}|${c.etage}|${c.localisation}`)
      )).length;

      setStats({
        total: total || 0,
        monobloc: monobloc || 0,
        split: split || 0,
        equippedRooms: uniqueEquipped
      });

      // 2. Fetch the 5 most recent installations
      let recentsQuery = supabase.from('climatiseurs').select('*').order('created_at', { ascending: false }).limit(5);
      if (!isAllSitesAllowed) {
        recentsQuery = recentsQuery.in('site', allowedSites);
      }
      const { data: recents, error: errRecents } = await recentsQuery;
      if (errRecents) throw errRecents;
      setRecentClimatiseurs(recents || []);

      // 3. Fetch all climatiseurs paginated (for inventory PDF report)
      await loadAllClimatiseurs();

      // 4. Fetch unique sites from the view
      let sitesQuery = supabase.from('view_sites').select('site');
      if (!isAllSitesAllowed) {
        sitesQuery = sitesQuery.in('site', allowedSites);
      }
      const { data: sitesData, error: errSites } = await sitesQuery;

      if (errSites) {
        if (errSites.message && (errSites.message.includes('relation') || errSites.message.includes('does not exist'))) {
          throw new Error("Les vues SQL requises n'ont pas été trouvées. Veuillez exécuter le script de création de vues fourni dans le guide walkthrough.md dans l'onglet SQL Editor de Supabase.");
        }
        throw errSites;
      }

      if (!sitesData || sitesData.length === 0) {
        // Table is empty, seed it! (Only for users with full sites access)
        if (isAllSitesAllowed) {
          await seedDefaultLocaux();
        } else {
          setSites([]);
        }
      } else {
        setSites(sitesData.map(s => s.site));
      }

    } catch (err) {
      console.error("Erreur de chargement Supabase:", err);
      let msg = err.message || "Erreur de connexion. Vérifiez vos tables PostgreSQL et vos clés API.";
      if (err.status === 404 || (err.message && err.message.includes('404')) || (err.message && err.message.includes('relation') && err.message.includes('not found'))) {
        msg = "Erreur de liaison Supabase. Veuillez vous connecter à votre console Supabase, ouvrir l'onglet 'SQL Editor' et exécuter le script de création de tables et de vues SQL fourni dans le guide walkthrough.md.";
      }
      setSupabaseError(msg);
    }
  };

  // Helper to fetch all climatiseurs using page pagination (bypasses 1000 limit)
  const loadAllClimatiseurs = async () => {
    try {
      let all = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        let query = supabase.from('climatiseurs').select('*').range(page * pageSize, (page + 1) * pageSize - 1);
        if (!isAllSitesAllowed) {
          query = query.in('site', allowedSites);
        }
        const { data, error } = await query;

        if (error) throw error;
        if (data && data.length > 0) {
          all = [...all, ...data];
          hasMore = data.length === pageSize;
          page++;
        } else {
          hasMore = false;
        }
      }
      setClimatiseurs(all);
    } catch (err) {
      console.error("Error loading all climatiseurs:", err);
    }
  };

  const seedDefaultLocaux = async () => {
    const seeds = [
      { site: "Site Principal (Paris)", batiment: "Bâtiment A - Administration", etage: "RDC", localisation: "Accueil" },
      { site: "Site Principal (Paris)", batiment: "Bâtiment A - Administration", etage: "Étage 1", localisation: "Bureau 101" },
      { site: "Site Principal (Paris)", batiment: "Bâtiment A - Administration", etage: "Étage 1", localisation: "Bureau 102" },
      { site: "Site Principal (Paris)", batiment: "Bâtiment B - R&D", etage: "RDC", localisation: "Local Technique" },
      { site: "Site Principal (Paris)", batiment: "Bâtiment B - R&D", etage: "Étage 2", localisation: "Salle Réunion" },
      { site: "Technopole (Lyon)", batiment: "Bâtiment B - R&D", etage: "RDC", localisation: "Bureau 101" },
      { site: "Technopole (Lyon)", batiment: "Bâtiment B - R&D", etage: "Étage 1", localisation: "Local Technique" },
      { site: "Annexe Est (Strasbourg)", batiment: "Bâtiment C - Logistique", etage: "RDC", localisation: "Accueil" },
    ];

    try {
      const { data, error } = await supabase
        .from('locaux')
        .insert(seeds)
        .select();

      if (error) throw error;
      
      // Reload sites list from view after seeding
      const { data: sitesData } = await supabase
        .from('view_sites')
        .select('site');
      if (sitesData) {
        setSites(sitesData.map(s => s.site));
      }
    } catch (err) {
      console.error("Erreur de peuplement initial de la table locaux:", err);
    }
  };

  // Lazy node toggle loader
  const toggleNode = async (key, type, params = {}) => {
    const isExpanded = !!expandedNodes[key];
    
    // Toggle expand state
    setExpandedNodes(prev => ({
      ...prev,
      [key]: !isExpanded
    }));

    // Lazy load children on demand when expanding
    if (!isExpanded) {
      try {
        if (type === 'site') {
          const { site } = params;
          if (!buildingsBySite[site]) {
            const { data, error } = await supabase
              .from('view_batiments')
              .select('batiment')
              .eq('site', site);
            if (error) throw error;
            setBuildingsBySite(prev => ({
              ...prev,
              [site]: data ? data.map(b => b.batiment) : []
            }));
          }
        } else if (type === 'batiment') {
          const { site, batiment } = params;
          const parentKey = `${site}|${batiment}`;
          if (!floorsByBuilding[parentKey]) {
            const { data, error } = await supabase
              .from('view_etages')
              .select('etage')
              .eq('site', site)
              .eq('batiment', batiment);
            if (error) throw error;
            setFloorsByBuilding(prev => ({
              ...prev,
              [parentKey]: data ? data.map(f => f.etage) : []
            }));
          }
        } else if (type === 'etage') {
          const { site, batiment, etage } = params;
          const parentKey = `${site}|${batiment}|${etage}`;
          if (!roomsByFloor[parentKey]) {
            const { data, error } = await supabase
              .from('locaux')
              .select('localisation')
              .eq('site', site)
              .eq('batiment', batiment)
              .eq('etage', etage)
              .limit(1000); // safety cap
            if (error) throw error;
            setRoomsByFloor(prev => ({
              ...prev,
              [parentKey]: data ? data.map(r => r.localisation) : []
            }));
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des sous-nœuds:", err);
      }
    }
  };

  // Server-side debounced search for large amounts of records
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      performTreeSearch();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [treeSearchQuery]);

  const performTreeSearch = async () => {
    const q = treeSearchQuery.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }

    try {
      let query = supabase.from('locaux').select('*');
      if (!isAllSitesAllowed) {
        query = query.in('site', allowedSites);
      }
      const { data, error } = await query
        .or(`site.ilike.%${q}%,batiment.ilike.%${q}%,etage.ilike.%${q}%,localisation.ilike.%${q}%`)
        .limit(100); // cap to 100 results for layout ergonomics and speed

      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) {
      console.error("Erreur lors de la recherche serveur:", err);
    }
  };

  const handleAddNodeConfirm = async (e) => {
    e.preventDefault();
    if (!newNodeValue.trim()) return;

    const val = newNodeValue.trim();
    let record = {};

    if (addingNode.type === 'localisation') {
      record = {
        site: addingNode.site,
        batiment: addingNode.batiment,
        etage: addingNode.etage,
        localisation: val
      };
    } else if (addingNode.type === 'etage') {
      record = {
        site: addingNode.site,
        batiment: addingNode.batiment,
        etage: val,
        localisation: 'Accueil'
      };
    } else if (addingNode.type === 'batiment') {
      record = {
        site: addingNode.site,
        batiment: val,
        etage: 'RDC',
        localisation: 'Accueil'
      };
    } else if (addingNode.type === 'site') {
      record = {
        site: val,
        batiment: 'Bâtiment A - Administration',
        etage: 'RDC',
        localisation: 'Accueil'
      };
    }

    try {
      const { data, error } = await supabase
        .from('locaux')
        .insert(record)
        .select();

      if (error) throw error;
      if (data && data[0]) {
        // Dynamically append the created node to our lazy loading states so it displays instantly!
        if (addingNode.type === 'site') {
          setSites(prev => {
            const next = [...prev];
            if (!next.includes(val)) next.push(val);
            return next.sort();
          });
        } else if (addingNode.type === 'batiment') {
          const { site } = addingNode;
          setBuildingsBySite(prev => ({
            ...prev,
            [site]: [...(prev[site] || []), val].sort()
          }));
        } else if (addingNode.type === 'etage') {
          const { site, batiment } = addingNode;
          const key = `${site}|${batiment}`;
          setFloorsByBuilding(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), val].sort()
          }));
        } else if (addingNode.type === 'localisation') {
          const { site, batiment, etage } = addingNode;
          const key = `${site}|${batiment}|${etage}`;
          setRoomsByFloor(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), val].sort()
          }));
        }

        // Auto-expand the parent node so they see the new item
        setExpandedNodes(prev => ({
          ...prev,
          [addingNode.parentKey]: true
        }));

        triggerToast(`Nouveau lieu "${val}" enregistré !`);
      }
    } catch (err) {
      console.error("Erreur de création de lieu:", err);
      alert("Erreur lors de l'enregistrement du lieu.");
    } finally {
      setAddingNode(null);
      setNewNodeValue('');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const user = usernameInput.trim().toLowerCase();
    const pass = passwordInput;
    if (!user || !pass) {
      setAuthError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('username', user)
        .eq('password', pass)
        .maybeSingle();

      if (error) {
        if (error.code === '42P01') {
          throw new Error("La table 'utilisateurs' n'existe pas dans Supabase. Veuillez vous connecter à votre console Supabase, ouvrir l'onglet 'SQL Editor' et exécuter le script SQL fourni dans le guide d'implémentation.");
        }
        throw error;
      }

      if (data) {
        const sites = data.sites_autorises || [];
        setIsLoggedIn(true);
        setLoggedInUser(user);
        setAllowedSites(sites);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loggedInUser', user);
        localStorage.setItem('allowedSites', JSON.stringify(sites));
        setAuthError('');
      } else {
        setAuthError('Identifiants incorrects. Veuillez vérifier.');
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setAuthError(err.message || "Erreur de liaison avec la base de données.");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser('');
    setAllowedSites([]);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('allowedSites');
    localStorage.removeItem('currentTab');
    setCurrentTab('dashboard');
    resetStepFlow();
  };

  // Reset Step Flow
  const resetStepFlow = () => {
    setCurrentStep(0);
    setSelectedSite('');
    setSelectedBuilding('');
    setSelectedFloor('');
    setSelectedLocation('');
    setAddingNode(null);
    setNewNodeValue('');
    setTreeSearchQuery('');
    setShowEntryModal(false);
    clearForm();
  };

  const clearForm = () => {
    setClimNumber('');
    setClimType('monobloc');
    setClimPower('');
    setClimDate(new Date().toISOString().split('T')[0]);
    setClimPhoto(null);
    setClimIsLocation(false);
    setShowAddFormOverride(false);
  };

  // Filter climatiseurs matching selected location
  const getClimsInSelectedLocation = () => {
    return climatiseurs.filter(c => 
      c.site === selectedSite &&
      c.batiment === selectedBuilding &&
      c.etage === selectedFloor &&
      c.localisation === selectedLocation
    );
  };

  // Handle Image Selection and Local Resize Compression
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressedBase64 = await compressImage(file);
      setClimPhoto(compressedBase64);
      triggerToast("Photo chargée et optimisée avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la compression de la photo.");
    } finally {
      setIsCompressing(false);
    }
  };

  // Add a new climatiseur to Supabase DB and upload image to Supabase Storage
  const handleRegisterClim = async (e) => {
    e.preventDefault();
    if (!climNumber.trim()) {
      alert("Veuillez saisir un numéro de climatiseur.");
      return;
    }

    try {
      let photoUrl = null;

      // 1. Upload photo to Supabase storage bucket if selected
      if (climPhoto) {
        setIsCompressing(true); // show loader
        const blob = base64ToBlob(climPhoto);
        const fileName = `clim_${climNumber.trim()}_${Date.now()}.jpg`;

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('climatiseur-photos')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: publicUrlData } = supabase
          .storage
          .from('climatiseur-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrlData.publicUrl;
      }

      // 2. Add location to locaux DB table if it does not exist yet (database check)
      const { data: existingLoc, error: checkErr } = await supabase
        .from('locaux')
        .select('id')
        .eq('site', selectedSite)
        .eq('batiment', selectedBuilding)
        .eq('etage', selectedFloor)
        .eq('localisation', selectedLocation)
        .limit(1);

      if (checkErr) throw checkErr;

      if (!existingLoc || existingLoc.length === 0) {
        const { data: newLocData, error: newLocError } = await supabase
          .from('locaux')
          .insert({
            site: selectedSite,
            batiment: selectedBuilding,
            etage: selectedFloor,
            localisation: selectedLocation
          })
          .select();

        if (newLocError) throw newLocError;
        
        // Dynamically add to local lazy tree cache if needed
        const key = `${selectedSite}|${selectedBuilding}|${selectedFloor}`;
        setRoomsByFloor(prev => ({
          ...prev,
          [key]: [...(prev[key] || []), selectedLocation].sort()
        }));
      }

      // 3. Add climatiseur record to database
      const newClim = {
        site: selectedSite,
        batiment: selectedBuilding,
        etage: selectedFloor,
        localisation: selectedLocation,
        numero: climNumber.trim(),
        type: climType,
        puissance: climPower ? Number(climPower) : null,
        date_pose: climDate,
        photo_url: photoUrl,
        is_location: climIsLocation,
        enregistre_par: loggedInUser || 'admin',
        date_ajout: new Date().toISOString().split('T')[0]
      };

      const { error: insertError } = await supabase
        .from('climatiseurs')
        .insert(newClim);

      if (insertError) {
        throw insertError;
      }

      triggerToast("Installation validée et enregistrée !");
      await loadData();
      clearForm();
      setShowAddFormOverride(false);
    } catch (err) {
      console.error("Migration insert error:", err);
      alert("Erreur lors de l'enregistrement. Vérifiez que le numéro de série n'existe pas déjà.");
    } finally {
      setIsCompressing(false);
    }
  };

  // Delete climatiseur from Supabase DB
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette installation ?")) {
      try {
        const { error: deleteError } = await supabase
          .from('climatiseurs')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        triggerToast("Installation supprimée.");
        await loadData();
      } catch (err) {
        console.error("Delete error:", err);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  // Start editing mode for a specific AC unit
  const startEditing = (clim) => {
    setEditingClimId(clim.id);
    setEditClimNumber(clim.numero);
    setEditClimType(clim.type);
    setEditClimPower(clim.puissance || '');
    setEditClimDate(clim.date_pose);
    setEditClimPhoto(clim.photo_url || null);
    setEditClimIsLocation(!!clim.is_location);
  };

  // Handle edit form photo upload & compression
  const handleEditPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const compressedBase64 = await compressImage(event.target.result);
        setEditClimPhoto(compressedBase64);
      } catch (err) {
        console.error("Image compression error:", err);
        setEditClimPhoto(event.target.result);
      } finally {
        setIsCompressing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit AC unit modifications to Supabase
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editClimNumber.trim() || !editClimDate) {
      alert("Veuillez remplir les champs obligatoires (*)");
      return;
    }

    try {
      setIsCompressing(true);
      let photoUrl = editClimPhoto;

      // If photo changed to a new base64 image (not already a URL)
      if (editClimPhoto && editClimPhoto.startsWith('data:image')) {
        const fileBlob = base64ToBlob(editClimPhoto);
        const fileName = `clim_${editClimNumber.trim().replace(/\s+/g, '_')}_${Date.now()}.jpg`;

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('climatiseur-photos')
          .upload(fileName, fileBlob, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase
          .storage
          .from('climatiseur-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrlData.publicUrl;
      }

      // Update in Supabase
      const { error } = await supabase
        .from('climatiseurs')
        .update({
          numero: editClimNumber.trim(),
          type: editClimType,
          puissance: editClimPower ? parseInt(editClimPower, 10) : null,
          date_pose: editClimDate,
          photo_url: photoUrl,
          is_location: editClimIsLocation,
          enregistre_par: loggedInUser || 'admin'
        })
        .eq('id', editingClimId);

      if (error) throw error;

      triggerToast("Fiche technique mise à jour !");
      setEditingClimId(null);
      await loadData();
    } catch (err) {
      console.error("Error editing climatiseur:", err);
      alert("Erreur lors de la mise à jour.");
    } finally {
      setIsCompressing(false);
    }
  };

  // Dynamic site filter suggestions built from the registered climatiseurs
  const getSitesSuggestions = () => {
    const list = climatiseurs.map(c => c.site);
    return Array.from(new Set(list)).filter(s => s).sort();
  };

  // Sort and filter list for reports
  const getSortedClimatiseurs = () => {
    let list = [...climatiseurs];

    if (filterSite) {
      list = list.filter(c => c.site === filterSite);
    }
    if (filterType) {
      list = list.filter(c => c.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => 
        c.numero.toLowerCase().includes(q) ||
        c.localisation.toLowerCase().includes(q) ||
        c.batiment.toLowerCase().includes(q) ||
        c.site.toLowerCase().includes(q)
      );
    }

    // Sort location hierarchy
    return list.sort((a, b) => {
      const siteCompare = a.site.localeCompare(b.site);
      if (siteCompare !== 0) return siteCompare;
      
      const batCompare = a.batiment.localeCompare(b.batiment);
      if (batCompare !== 0) return batCompare;
      
      const floorCompare = a.etage.localeCompare(b.etage);
      if (floorCompare !== 0) return floorCompare;
      
      return a.localisation.localeCompare(b.localisation);
    });
  };

  // Generate PDF Report Client-side
  const generatePDF = () => {
    const sortedData = getSortedClimatiseurs();
    if (sortedData.length === 0) {
      alert("Aucun climatiseur à exporter.");
      return;
    }

    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('fr-FR');

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); 
    doc.text("RAPPORT D'INVENTAIRE - CLIMATISEURS MOBILES", 14, 20);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); 
    doc.text(`Généré par le Service Technique le : ${currentDate}`, 14, 26);
    doc.text(`Nombre total d'équipements recensés : ${sortedData.length}`, 14, 31);
    
    doc.setDrawColor(226, 232, 240); 
    doc.line(14, 36, 196, 36);

    const headers = [["Site", "Bâtiment", "Niveau", "Localisation", "N° Climatiseur", "Type", "Puissance", "Location", "Date de Pose", "Opérateur"]];
    const rows = sortedData.map(c => [
      c.site,
      c.batiment,
      c.etage,
      c.localisation,
      c.numero,
      c.type.toUpperCase(),
      c.puissance ? `${c.puissance} W` : '-',
      c.is_location ? 'OUI' : 'NON',
      formatDateFR(c.date_pose),
      c.enregistre_par || '-'
    ]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 40,
      theme: 'striped',
      headStyles: {
        fillColor: [2, 132, 199], 
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59] 
      },
      columnStyles: {
        0: { cellWidth: 22 }, 
        1: { cellWidth: 22 }, 
        2: { cellWidth: 12 }, 
        3: { cellWidth: 22 }, 
        4: { cellWidth: 22 }, 
        5: { cellWidth: 15 }, 
        6: { cellWidth: 15 }, 
        7: { cellWidth: 15 },
        8: { cellWidth: 18 },
        9: { cellWidth: 19 }
      },
      margin: { top: 40, left: 14, right: 14 },
      didDrawPage: (data) => {
        const str = "Page " + doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(str, 196 - 15, doc.internal.pageSize.height - 10, { align: 'right' });
      }
    });

    doc.save(`rapport_climatiseurs_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <IconCheck />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* --- ENTRY MODAL POPUP --- */}
      {showEntryModal && (
        <div className="modal-backdrop" onClick={() => { setShowEntryModal(false); setSelectedLocation(''); setCurrentStep(3); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="brand-icon" style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)' }}>
                <IconWind />
              </div>
              <h3 className="modal-title" style={{ fontSize: '1.05rem' }}>🚪 Accès au local</h3>
            </div>
            
            <div className="modal-body">
              <div className="modal-path">
                <span className="path-label">Localisation validée :</span>
                <div className="path-value">
                  <strong>{selectedSite}</strong>
                  <span className="path-arrow"><IconChevronRight /></span>
                  <strong>{selectedBuilding}</strong>
                  <span className="path-arrow"><IconChevronRight /></span>
                  <strong>{selectedFloor}</strong>
                  <span className="path-arrow"><IconChevronRight /></span>
                  <span className="path-highlight">{selectedLocation}</span>
                </div>
              </div>

              {/* Status information */}
              {(() => {
                const count = getClimsInSelectedLocation().length;
                if (count > 0) {
                  return (
                    <div className="modal-status equipped">
                      <span className="status-dot green"></span>
                      <div>
                        <strong>{count} climatiseur(s) recensé(s)</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          Des fiches techniques d'inventaire existent pour cette salle.
                        </p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="modal-status empty">
                      <span className="status-dot grey"></span>
                      <div>
                        <strong>Local vide (0 climatiseur)</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          Aucun équipement enregistré dans la base pour ce local.
                        </p>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>

            <div className="modal-footer">
              {getClimsInSelectedLocation().length > 0 ? (
                <>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowEntryModal(false);
                      setCurrentStep(4);
                      setShowAddFormOverride(false);
                    }}
                  >
                    🔍 Voir les fiches ({getClimsInSelectedLocation().length})
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEntryModal(false);
                      setCurrentStep(4);
                      setShowAddFormOverride(true);
                    }}
                  >
                    ➕ Ajouter un climatiseur
                  </button>
                </>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowEntryModal(false);
                    setCurrentStep(4);
                    setShowAddFormOverride(true);
                  }}
                >
                  ➕ Enregistrer une installation
                </button>
              )}

              <button 
                className="btn btn-danger"
                onClick={() => {
                  setShowEntryModal(false);
                  setSelectedLocation('');
                  setCurrentStep(3); // stay on step 3
                }}
              >
                Changer de local
              </button>
            </div>
          </div>
        </div>
      )}

      {!isLoggedIn ? (
        /* --- LOGIN VIEW --- */
        <div className="login-container">
          <form className="login-card" onSubmit={handleLogin}>
            <div className="login-header">
              <div className="login-logo">
                <IconWind />
              </div>
              <h1 className="login-title">ClimTrack</h1>
              <p className="login-subtitle">Gestion technique et recensement d'inventaire</p>
            </div>

            {authError && (
              <div className="login-error">
                <IconInfo />
                <span>{authError}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Identifiant</label>
              <div className="input-wrapper">
                <span className="input-icon"><IconUser /></span>
                <input 
                  type="text" 
                  id="username" 
                  className="input-control" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Entrez votre identifiant" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-wrapper">
                <span className="input-icon"><IconLock /></span>
                <input 
                  type="password" 
                  id="password" 
                  className="input-control" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Entrez votre mot de passe" 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full mt-lg" style={{ padding: '0.75rem', marginBottom: '0.5rem' }}>
              Se connecter
            </button>
          </form>
        </div>
      ) : (
        /* --- MAIN SYSTEM LAYOUT --- */
        <>
          {/* --- DESKTOP SIDEBAR --- */}
          <aside className="sidebar">
            <div className="sidebar-brand">
              <div className="brand-icon">
                <IconWind />
              </div>
              <span className="brand-name">ClimTrack</span>
            </div>
            
            <nav className="sidebar-nav">
              <div 
                className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentTab('dashboard')}
              >
                <IconDashboard />
                <span>Tableau de bord</span>
              </div>
              <div 
                className={`nav-link ${currentTab === 'add' ? 'active' : ''}`}
                onClick={() => { setCurrentTab('add'); resetStepFlow(); }}
              >
                <IconPlus />
                <span>Recenser</span>
              </div>
              <div 
                className={`nav-link ${currentTab === 'report' ? 'active' : ''}`}
                onClick={() => setCurrentTab('report')}
              >
                <IconList />
                <span>Inventaire & Rapports</span>
              </div>
            </nav>

            <div className="sidebar-footer">
              <div className="user-badge">
                <IconUser />
                <span>Technicien Connecté</span>
              </div>
              <button className="btn btn-secondary btn-full" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={handleLogout}>
                <IconLogout />
                <span>Déconnexion</span>
              </button>
            </div>
          </aside>

          {/* --- MOBILE TOP HEADER --- */}
          <div className="mobile-header">
            <div className="logo-section">
              <div className="brand-icon" style={{ width: '28px', height: '28px' }}>
                <IconWind />
              </div>
              <span className="brand-name" style={{ fontSize: '1rem' }}>ClimTrack</span>
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={handleLogout}>
              <IconLogout />
            </button>
          </div>

          {/* --- MOBILE BOTTOM NAV BAR --- */}
          <nav className="bottom-nav">
            <div 
              className={`bottom-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentTab('dashboard')}
            >
              <span className="bottom-nav-icon">
                <IconDashboard />
              </span>
              <span>Accueil</span>
            </div>
            <div 
              className={`bottom-nav-item ${currentTab === 'add' ? 'active' : ''}`}
              onClick={() => { setCurrentTab('add'); resetStepFlow(); }}
            >
              <span className="bottom-nav-icon">
                <IconPlus />
              </span>
              <span>Recenser</span>
            </div>
            <div 
              className={`bottom-nav-item ${currentTab === 'report' ? 'active' : ''}`}
              onClick={() => setCurrentTab('report')}
            >
              <span className="bottom-nav-icon">
                <IconList />
              </span>
              <span>Inventaire</span>
            </div>
          </nav>

          {/* --- VIEWPORT CONTAINER --- */}
          <main className="main-content">
            {supabaseError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⚠️ Problème de liaison Supabase :</strong>
                <p style={{ marginTop: '0.25rem', lineHeight: '1.4' }}>{supabaseError}</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Consultez le guide <strong style={{ color: 'var(--text-primary)' }}>walkthrough.md</strong> à la racine pour les instructions de création de tables SQL et de configuration.
                </p>
              </div>
            )}
            
            {/* 1. TABLEAU DE BORD VIEW */}
            {currentTab === 'dashboard' && (
              <div>
                <h1 className="dashboard-title">Tableau de bord</h1>
                <p className="dashboard-subtitle">Vue d'ensemble du parc technique de climatiseurs.</p>

                {/* KPI Metrics */}
                <div className="stats-grid">
                  <div className="stat-card" onClick={() => {
                    setCurrentTab('report');
                    setFilterSite('');
                    setFilterType('');
                    setSearchQuery('');
                  }}>
                    <div className="stat-icon-box">
                      <IconWind />
                    </div>
                    <div className="stat-data">
                      <span className="stat-number">{stats.total}</span>
                      <span className="stat-label">Total climatiseurs</span>
                    </div>
                  </div>

                  <div className="stat-card" onClick={() => {
                    setCurrentTab('report');
                    setFilterSite('');
                    setFilterType('monobloc');
                    setSearchQuery('');
                  }}>
                    <div className="stat-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      <IconMonobloc />
                    </div>
                    <div className="stat-data">
                      <span className="stat-number">{stats.monobloc}</span>
                      <span className="stat-label">Monoblocs</span>
                    </div>
                  </div>

                  <div className="stat-card" onClick={() => {
                    setCurrentTab('report');
                    setFilterSite('');
                    setFilterType('split');
                    setSearchQuery('');
                  }}>
                    <div className="stat-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                      <IconSplit />
                    </div>
                    <div className="stat-data">
                      <span className="stat-number">{stats.split}</span>
                      <span className="stat-label">Splits</span>
                    </div>
                  </div>

                  <div className="stat-card" onClick={() => {
                    setCurrentTab('report');
                    setFilterSite('');
                    setFilterType('');
                    setSearchQuery('');
                  }}>
                    <div className="stat-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                      <IconMapPin />
                    </div>
                    <div className="stat-data">
                      <span className="stat-number">{stats.equippedRooms}</span>
                      <span className="stat-label">Locaux équipés</span>
                    </div>
                  </div>
                </div>

                <div className="dashboard-sections">
                  {/* Left Section: Recent activity log */}
                  <div className="card">
                    <div className="card-header">
                      <h2 className="card-title">Derniers recensements enregistrés</h2>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Historique récent</span>
                    </div>
                    <div className="card-body">
                      {recentClimatiseurs.length > 0 ? (
                        <div className="activity-list">
                          {recentClimatiseurs.map((clim) => (
                            <div key={clim.id} className="activity-item">
                              <div className="activity-meta">
                                <span className="activity-title">
                                  N° Clim : {clim.numero} ({clim.type === 'monobloc' ? 'Monobloc' : 'Split'})
                                </span>
                                <span className="activity-desc">
                                  {clim.site} • {clim.batiment} • {clim.etage} • {clim.localisation}
                                </span>
                              </div>
                              <div className="activity-date">
                                <span>{formatDateFR(clim.date_pose)}</span>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Date de pose</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
                          <IconInfo style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }} />
                          <p>Aucun appareil recensé pour l'instant.</p>
                          <button 
                            className="btn btn-primary mt-lg"
                            onClick={() => { setCurrentTab('add'); resetStepFlow(); }}
                          >
                            Commencer l'inventaire
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section: Quick access & instructions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="card">
                      <div className="card-header">
                        <h2 className="card-title">Opérations rapides</h2>
                      </div>
                      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button 
                          className="btn btn-primary btn-full"
                          onClick={() => { setCurrentTab('add'); resetStepFlow(); }}
                        >
                          <IconPlus /> Nouveau recensement
                        </button>
                        <button 
                          className="btn btn-secondary btn-full"
                          onClick={generatePDF}
                          disabled={climatiseurs.length === 0}
                        >
                          <IconFileText /> Télécharger le rapport (PDF)
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* 2. RECENSER / SEARCH STEP FLOW VIEW */}
            {currentTab === 'add' && (
              <div className="tree-container">
                {currentStep < 4 ? (
                  <>
                    <h2 className="mb-md" style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                      Hiérarchie des locaux
                    </h2>

                    <div className="tree-header" style={{ marginBottom: '1rem' }}>
                      <div className="input-wrapper tree-search-bar">
                        <span className="input-icon"><IconSearch /></span>
                        <input 
                          type="text" 
                          className="input-control" 
                          placeholder="Rechercher un site, bâtiment, niveau, pièce..." 
                          value={treeSearchQuery}
                          onChange={(e) => setTreeSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Tree List */}
                    {/* Tree List or Search Results */}
                    <div className="tree-list">
                      {searchResults !== null ? (
                        /* SEARCH RESULTS VIEW */
                        <div>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                            Résultats de la recherche ({searchResults.length}) :
                          </h4>
                          {searchResults.length === 0 ? (
                            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              Aucun local ne correspond à votre recherche.
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {searchResults.map((res) => (
                                <div 
                                  key={res.id} 
                                  className="tree-node"
                                  style={{ border: '1px solid var(--border-light)', background: '#f8fafc', padding: '0.75rem' }}
                                  onClick={() => {
                                    setSelectedSite(res.site);
                                    setSelectedBuilding(res.batiment);
                                    setSelectedFloor(res.etage);
                                    setSelectedLocation(res.localisation);
                                    clearForm();
                                    setShowEntryModal(true);
                                  }}
                                >
                                  <span className="tree-node-label" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                    Site : {res.site} ➔ Bât. : {res.batiment} ➔ Niv. : {res.etage} ➔ <span style={{ color: 'var(--primary)' }}>Local : {res.localisation}</span>
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Entrer ➔
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* LAZY LOADED TREE VIEW */
                        sites.map((site) => {
                          const siteKey = `site:${site}`;
                          const isSiteExpanded = !!expandedNodes[siteKey];
                          const buildings = buildingsBySite[site] || [];

                          return (
                            <div key={siteKey} className="tree-node-wrapper">
                              {/* Site Row */}
                              <div className="tree-node" onClick={() => toggleNode(siteKey, 'site', { site })}>
                                <span className="tree-node-label site">
                                  <span style={{ transform: isSiteExpanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform 0.1s' }}>
                                    <IconChevronRight />
                                  </span>
                                  <IconSite /> {site}
                                </span>
                              </div>

                              {/* Site children */}
                              {isSiteExpanded && (
                                <div className="tree-children">
                                  {buildings.length === 0 ? (
                                    <div style={{ padding: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                      Chargement...
                                    </div>
                                  ) : (
                                    buildings.map((bat) => {
                                      const batKey = `site:${site}|bat:${bat}`;
                                      const isBatExpanded = !!expandedNodes[batKey];
                                      const batParentKey = `${site}|${bat}`;
                                      const floors = floorsByBuilding[batParentKey] || [];

                                      return (
                                        <div key={batKey} className="tree-node-wrapper">
                                          {/* Building Row */}
                                          <div className="tree-node" onClick={() => toggleNode(batKey, 'batiment', { site, batiment: bat })}>
                                            <span className="tree-node-label batiment">
                                              <span style={{ transform: isBatExpanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform 0.1s' }}>
                                                <IconChevronRight />
                                              </span>
                                              <IconBuilding /> {bat}
                                            </span>
                                            <div className="tree-node-actions" onClick={(e) => e.stopPropagation()}>
                                              <button 
                                                className="tree-node-action-btn"
                                                onClick={() => {
                                                  setAddingNode({ parentKey: batKey, type: 'etage', site, batiment: bat });
                                                  setNewNodeValue('');
                                                }}
                                              >
                                                + Niveau
                                              </button>
                                            </div>
                                          </div>

                                          {/* Building children */}
                                          {isBatExpanded && (
                                            <div className="tree-children">
                                              {/* Add Floor Inline Input */}
                                              {addingNode && addingNode.parentKey === batKey && addingNode.type === 'etage' && (
                                                <div className="tree-node-input">
                                                  <input 
                                                    type="text" 
                                                    className="input-control" 
                                                    placeholder="Nom du niveau (ex: RDC, Étage 1)..."
                                                    value={newNodeValue}
                                                    onChange={(e) => setNewNodeValue(e.target.value)}
                                                    autoFocus
                                                  />
                                                  <button className="btn btn-primary btn-sm" onClick={handleAddNodeConfirm}>✓</button>
                                                  <button className="btn btn-secondary btn-sm" onClick={() => setAddingNode(null)}>✗</button>
                                                </div>
                                              )}

                                              {floors.length === 0 ? (
                                                <div style={{ padding: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                                  Chargement...
                                                </div>
                                              ) : (
                                                floors.map((floor) => {
                                                  const floorKey = `site:${site}|bat:${bat}|floor:${floor}`;
                                                  const isFloorExpanded = !!expandedNodes[floorKey];
                                                  const floorParentKey = `${site}|${bat}|${floor}`;
                                                  const locations = roomsByFloor[floorParentKey] || [];

                                                  return (
                                                    <div key={floorKey} className="tree-node-wrapper">
                                                      {/* Floor Row */}
                                                      <div className="tree-node" onClick={() => toggleNode(floorKey, 'etage', { site, batiment: bat, etage: floor })}>
                                                        <span className="tree-node-label etage">
                                                          <span style={{ transform: isFloorExpanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform 0.1s' }}>
                                                            <IconChevronRight />
                                                          </span>
                                                          <IconFloor /> Niveau : {floor}
                                                        </span>
                                                        <div className="tree-node-actions" onClick={(e) => e.stopPropagation()}>
                                                          <button 
                                                            className="tree-node-action-btn"
                                                            onClick={() => {
                                                              setAddingNode({ parentKey: floorKey, type: 'localisation', site, batiment: bat, etage: floor });
                                                              setNewNodeValue('');
                                                            }}
                                                          >
                                                            + Local
                                                          </button>
                                                        </div>
                                                      </div>

                                                      {/* Floor children */}
                                                      {isFloorExpanded && (
                                                        <div className="tree-children">
                                                          {/* Add Location Inline Input */}
                                                          {addingNode && addingNode.parentKey === floorKey && addingNode.type === 'localisation' && (
                                                            <div className="tree-node-input">
                                                              <input 
                                                                type="text" 
                                                                className="input-control" 
                                                                placeholder="Nom du local (ex: Bureau 104)..."
                                                                value={newNodeValue}
                                                                onChange={(e) => setNewNodeValue(e.target.value)}
                                                                autoFocus
                                                              />
                                                              <button className="btn btn-primary btn-sm" onClick={handleAddNodeConfirm}>✓</button>
                                                              <button className="btn btn-secondary btn-sm" onClick={() => setAddingNode(null)}>✗</button>
                                                            </div>
                                                          )}

                                                          {locations.length === 0 ? (
                                                            <div style={{ padding: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                                              Chargement...
                                                            </div>
                                                          ) : (
                                                            locations.map((loc) => {
                                                              const locKey = `site:${site}|bat:${bat}|floor:${floor}|loc:${loc}`;
                                                              return (
                                                                <div 
                                                                  key={locKey} 
                                                                  className="tree-node"
                                                                  onClick={() => {
                                                                    setSelectedSite(site);
                                                                    setSelectedBuilding(bat);
                                                                    setSelectedFloor(floor);
                                                                    setSelectedLocation(loc);
                                                                    clearForm();
                                                                    setShowEntryModal(true);
                                                                  }}
                                                                >
                                                                  <span className="tree-node-label localisation">
                                                                    <IconRoom /> {loc}
                                                                  </span>
                                                                </div>
                                                              );
                                                            })
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                })
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    {/* View existing ACs */}
                    {getClimsInSelectedLocation().length > 0 && !showAddFormOverride ? (
                      <div>
                        <div className="fiche-header">
                          <IconMapPin />
                          <span>Fiche(s) technique(s) - {selectedLocation}</span>
                        </div>
                        
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                          Appareil(s) actuellement installé(s) dans ce local :
                        </p>

                        {getClimsInSelectedLocation().map((clim) => {
                          if (editingClimId === clim.id) {
                            return (
                              <form key={clim.id} onSubmit={handleSaveEdit} className="edit-card-form">
                                <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                                  ✏️ Modifier la fiche climatiseur
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                  <div className="form-group">
                                    <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>Numéro du climatiseur *</label>
                                    <input 
                                      type="text" 
                                      className="input-control no-icon"
                                      value={editClimNumber}
                                      onChange={(e) => setEditClimNumber(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>Type de climatiseur</label>
                                    <select 
                                      className="input-control no-icon"
                                      value={editClimType}
                                      onChange={(e) => setEditClimType(e.target.value)}
                                    >
                                      <option value="monobloc">Monobloc</option>
                                      <option value="split">Split</option>
                                    </select>
                                  </div>
                                  <div className="form-group">
                                    <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>Puissance (Watts)</label>
                                    <input 
                                      type="number" 
                                      className="input-control no-icon"
                                      value={editClimPower}
                                      onChange={(e) => setEditClimPower(e.target.value)}
                                      placeholder="Ex: 3500"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>Date de pose *</label>
                                    <input 
                                      type="date" 
                                      className="input-control no-icon"
                                      value={editClimDate}
                                      onChange={(e) => setEditClimDate(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>Matériel de location ?</label>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', height: 'var(--input-height)', alignItems: 'center' }}>
                                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                        <input 
                                          type="radio" 
                                          name={`edit-inline-location-${clim.id}`}
                                          checked={editClimIsLocation === true}
                                          onChange={() => setEditClimIsLocation(true)}
                                          style={{ accentColor: 'var(--primary)', width: '15px', height: '15px' }}
                                        />
                                        Oui
                                      </label>
                                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                        <input 
                                          type="radio" 
                                          name={`edit-inline-location-${clim.id}`}
                                          checked={editClimIsLocation === false}
                                          onChange={() => setEditClimIsLocation(false)}
                                          style={{ accentColor: 'var(--primary)', width: '15px', height: '15px' }}
                                        />
                                        Non
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                <div className="form-group" style={{ marginTop: '0.25rem' }}>
                                  <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>Photo de l'appareil</label>
                                  {editClimPhoto ? (
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                                      <div className="upload-preview" style={{ width: '80px', height: '80px', margin: 0 }}>
                                        <img src={editClimPhoto} alt="Prévisualisation" />
                                      </div>
                                      <button 
                                        type="button" 
                                        className="btn btn-danger btn-sm"
                                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', height: 'fit-content' }}
                                        onClick={() => setEditClimPhoto(null)}
                                      >
                                        Supprimer la photo
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                      <label htmlFor={`edit-inline-cam-${clim.id}`} className="upload-area" style={{ flex: 1, padding: '0.75rem', borderStyle: 'dashed' }}>
                                        <span className="upload-icon" style={{ fontSize: '1.1rem' }}>
                                          <IconCamera />
                                        </span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Prendre photo</span>
                                      </label>
                                      <input 
                                        id={`edit-inline-cam-${clim.id}`}
                                        type="file" 
                                        accept="image/*" 
                                        capture="environment"
                                        style={{ display: 'none' }} 
                                        onChange={handleEditPhotoUpload}
                                        disabled={isCompressing}
                                      />

                                      <label htmlFor={`edit-inline-gal-${clim.id}`} className="upload-area" style={{ flex: 1, padding: '0.75rem', borderStyle: 'dashed' }}>
                                        <span className="upload-icon" style={{ fontSize: '1.1rem', color: '#10b981' }}>
                                          📁
                                        </span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Galerie / Fichier</span>
                                      </label>
                                      <input 
                                        id={`edit-inline-gal-${clim.id}`}
                                        type="file" 
                                        accept="image/*" 
                                        style={{ display: 'none' }} 
                                        onChange={handleEditPhotoUpload}
                                        disabled={isCompressing}
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="btn-group" style={{ justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                  <button type="submit" className="btn btn-primary btn-sm" disabled={isCompressing}>
                                    Sauvegarder
                                  </button>
                                  <button 
                                    type="button" 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setEditingClimId(null)}
                                    disabled={isCompressing}
                                  >
                                    Annuler
                                  </button>
                                </div>
                              </form>
                            );
                          }

                          return (
                            <div key={clim.id} className="fiche-grid">
                              <div className="fiche-details">
                                <div className="detail-item">
                                  <span className="detail-label">N° Climatiseur</span>
                                  <span className="detail-value text-highlight">{clim.numero}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Type</span>
                                  <span className="detail-value">
                                    <span className={`fiche-badge ${clim.type}`}>
                                      {clim.type === 'monobloc' ? 'Monobloc' : 'Split'}
                                    </span>
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Puissance</span>
                                  <span className="detail-value">{clim.puissance ? `${clim.puissance} W` : '-'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Date de pose</span>
                                  <span className="detail-value">{formatDateFR(clim.date_pose)}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Location ?</span>
                                  <span className="detail-value">{clim.is_location ? 'Oui' : 'Non'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Enregistré par</span>
                                  <span className="detail-value" style={{ textTransform: 'capitalize' }}>{clim.enregistre_par || '-'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Ajouté le</span>
                                  <span className="detail-value">{formatDateFR(clim.date_ajout)}</span>
                                </div>
                                <div className="detail-item" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginTop: '0.75rem' }}>
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                                    onClick={() => startEditing(clim)}
                                  >
                                    ✏️ Modifier
                                  </button>
                                  <button 
                                    className="btn btn-danger" 
                                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} 
                                    onClick={() => handleDelete(clim.id)}
                                  >
                                    <IconTrash /> Supprimer
                                  </button>
                                </div>
                              </div>
                              
                              <div className="fiche-photo">
                                {clim.photo_url ? (
                                  <img src={clim.photo_url} alt={`Climatiseur ${clim.numero}`} />
                                ) : (
                                  <div className="fiche-no-photo">
                                    <IconCamera />
                                    <span>Aucune photo</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        <div className="btn-group">
                          <button 
                            className="btn btn-primary"
                            onClick={() => setShowAddFormOverride(true)}
                          >
                            <IconPlus /> Ajouter un autre climatiseur
                          </button>
                          <button 
                            className="btn btn-secondary"
                            onClick={resetStepFlow}
                          >
                            Fermer
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Creation Form */
                      <div>
                        <div className="fiche-header">
                          <IconPlus />
                          <span>Saisie d'installation d'équipement</span>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                          Local : <strong>{selectedSite} • {selectedBuilding} • {selectedFloor} • {selectedLocation}</strong>
                        </p>

                        <form onSubmit={handleRegisterClim} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            
                            <div className="form-group">
                              <label htmlFor="clim-num">Numéro du climatiseur *</label>
                              <input 
                                type="text" 
                                id="clim-num" 
                                className="input-control no-icon"
                                value={climNumber}
                                onChange={(e) => setClimNumber(e.target.value)}
                                placeholder="Numéro de série ou ID unique"
                                required 
                              />
                            </div>

                            <div className="form-group">
                              <label htmlFor="clim-type">Type de climatiseur</label>
                              <select 
                                id="clim-type" 
                                className="input-control no-icon"
                                value={climType}
                                onChange={(e) => setClimType(e.target.value)}
                              >
                                <option value="monobloc">Monobloc</option>
                                <option value="split">Split</option>
                              </select>
                            </div>

                            <div className="form-group">
                              <label htmlFor="clim-power">Puissance (Watts)</label>
                              <input 
                                type="number" 
                                id="clim-power" 
                                className="input-control no-icon"
                                value={climPower}
                                onChange={(e) => setClimPower(e.target.value)}
                                placeholder="Ex: 3500" 
                              />
                            </div>

                            <div className="form-group">
                              <label htmlFor="clim-date">Date de pose *</label>
                              <input 
                                type="date" 
                                id="clim-date" 
                                className="input-control no-icon"
                                value={climDate}
                                onChange={(e) => setClimDate(e.target.value)}
                                required 
                              />
                            </div>

                            <div className="form-group">
                              <label style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Matériel de location ?</label>
                              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.4rem', height: 'var(--input-height)', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                  <input 
                                    type="radio" 
                                    name="climIsLocation"
                                    checked={climIsLocation === true}
                                    onChange={() => setClimIsLocation(true)}
                                    style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                                  />
                                  Oui
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                  <input 
                                    type="radio" 
                                    name="climIsLocation"
                                    checked={climIsLocation === false}
                                    onChange={() => setClimIsLocation(false)}
                                    style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                                  />
                                  Non (Achat)
                                </label>
                              </div>
                            </div>

                          </div>

                          <div className="form-group">
                            <label>Photo de l'appareil</label>
                            
                            {!climPhoto ? (
                               <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                                 <label htmlFor="add-camera-input" className="upload-area" style={{ flex: 1, padding: '1.25rem', cursor: 'pointer' }}>
                                   <span className="upload-icon">
                                     <IconCamera />
                                   </span>
                                   <span style={{ fontWeight: '600', fontSize: '0.8rem' }}>Prendre photo</span>
                                 </label>
                                 <input 
                                   id="add-camera-input"
                                   type="file" 
                                   accept="image/*" 
                                   capture="environment"
                                   style={{ display: 'none' }} 
                                   onChange={handlePhotoUpload}
                                   disabled={isCompressing}
                                 />

                                 <label htmlFor="add-gallery-input" className="upload-area" style={{ flex: 1, padding: '1.25rem', cursor: 'pointer' }}>
                                   <span className="upload-icon" style={{ color: '#10b981' }}>
                                     📁
                                   </span>
                                   <span style={{ fontWeight: '600', fontSize: '0.8rem' }}>Galerie / Fichier</span>
                                 </label>
                                 <input 
                                   id="add-gallery-input"
                                   type="file" 
                                   accept="image/*" 
                                   style={{ display: 'none' }} 
                                   onChange={handlePhotoUpload}
                                   disabled={isCompressing}
                                 />
                               </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div className="upload-preview">
                                  <img src={climPhoto} alt="Prévisualisation" />
                                  <button 
                                    type="button" 
                                    className="upload-preview-remove" 
                                    onClick={() => setClimPhoto(null)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="btn-group">
                            <button type="submit" className="btn btn-primary" disabled={isCompressing}>
                              Valider l'installation
                            </button>
                            
                            {getClimsInSelectedLocation().length > 0 ? (
                              <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => setShowAddFormOverride(false)}
                              >
                                Annuler
                              </button>
                            ) : (
                              <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={resetStepFlow}
                              >
                                Choisir un autre local
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. INVENTAIRE / RAPPORT TABLE VIEW */}
            {currentTab === 'report' && (
              <div>
                <h1 className="dashboard-title">Inventaire général</h1>
                <p className="dashboard-subtitle">Liste ordonnée de tous les climatiseurs recensés.</p>

                {/* Filters Row */}
                <div className="report-header-controls">
                  <div className="filter-section">
                    <div className="input-wrapper" style={{ flex: '1 1 200px' }}>
                      <span className="input-icon"><IconSearch /></span>
                      <input 
                        type="text" 
                        className="input-control" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Chercher par N°, local, bâtiment..." 
                      />
                    </div>

                    <select 
                      className="filter-select"
                      value={filterSite}
                      onChange={(e) => setFilterSite(e.target.value)}
                    >
                      <option value="">Tous les sites</option>
                      {getSitesSuggestions().map((site, i) => (
                        <option key={i} value={site}>{site}</option>
                      ))}
                    </select>

                    <select 
                      className="filter-select"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="">Tous les types</option>
                      <option value="monobloc">Monobloc</option>
                      <option value="split">Split</option>
                    </select>
                  </div>

                  <button className="btn btn-primary" onClick={generatePDF} disabled={getSortedClimatiseurs().length === 0}>
                    <IconFileText /> Télécharger PDF
                  </button>
                </div>

                {/* Inventory View: Desktop Table & Mobile Cards */}
                {getSortedClimatiseurs().length > 0 ? (
                  <>
                    {/* Desktop table */}
                    <div className="table-container desktop-only">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Photo</th>
                            <th>Site</th>
                            <th>Bâtiment</th>
                            <th>Niveau</th>
                            <th>Localisation</th>
                            <th>N° Climatiseur</th>
                            <th>Type</th>
                            <th>Puissance</th>
                            <th>Location</th>
                            <th>Opérateur</th>
                            <th>Date de Pose</th>
                            <th style={{ width: '60px', textAlign: 'center' }}>Suppr.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getSortedClimatiseurs().map((clim) => (
                            <tr key={clim.id}>
                              <td data-label="Photo">
                                {clim.photo_url ? (
                                  <img 
                                    src={clim.photo_url} 
                                    className="table-thumb" 
                                    alt="Miniature" 
                                    onClick={() => window.open(clim.photo_url, '_blank')} 
                                  />
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Aucune</span>
                                )}
                              </td>
                              <td data-label="Site">{clim.site}</td>
                              <td data-label="Bâtiment">{clim.batiment}</td>
                              <td data-label="Niveau">{clim.etage}</td>
                              <td data-label="Localisation" className="text-highlight">{clim.localisation}</td>
                              <td data-label="N° Climatiseur" className="text-highlight">{clim.numero}</td>
                              <td data-label="Type">
                                <span className={`fiche-badge ${clim.type}`}>
                                  {clim.type === 'monobloc' ? 'Monobloc' : 'Split'}
                                </span>
                              </td>
                              <td data-label="Puissance">{clim.puissance ? `${clim.puissance} W` : '-'}</td>
                              <td data-label="Location">{clim.is_location ? 'Oui' : 'Non'}</td>
                              <td data-label="Opérateur" style={{ textTransform: 'capitalize' }}>{clim.enregistre_par || '-'}</td>
                              <td data-label="Date de Pose">{formatDateFR(clim.date_pose)}</td>
                              <td data-label="Actions" style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ width: '28px', height: '28px', padding: 0, borderRadius: 'var(--radius-sm)' }}
                                    onClick={() => {
                                      startEditing(clim);
                                      setShowInventoryEditModal(true);
                                    }}
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    className="btn btn-danger" 
                                    style={{ width: '28px', height: '28px', padding: 0, borderRadius: 'var(--radius-sm)' }}
                                    onClick={() => handleDelete(clim.id)}
                                  >
                                    <IconTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards layout */}
                    <div className="mobile-only report-cards-grid">
                      {getSortedClimatiseurs().map((clim) => (
                        <div key={clim.id} className="report-card">
                          {clim.photo_url && (
                            <div 
                              className="report-card-image" 
                              style={{ backgroundImage: `url(${clim.photo_url})`, cursor: 'pointer' }}
                              onClick={() => window.open(clim.photo_url, '_blank')}
                            />
                          )}
                          <div className="report-card-content">
                            <div className="report-card-header">
                              <span className="report-card-num">N° {clim.numero}</span>
                              <span className={`fiche-badge ${clim.type}`}>
                                {clim.type === 'monobloc' ? 'Monobloc' : 'Split'}
                              </span>
                            </div>
                            
                            <div className="report-card-body">
                              <div className="report-card-row">
                                <span className="report-card-label">📍 Emplacement</span>
                                <span className="report-card-value">
                                  {clim.site} • {clim.batiment} ({clim.etage}) • {clim.localisation}
                                </span>
                              </div>
                              <div className="report-card-row">
                                <span className="report-card-label">⚡ Puissance</span>
                                <span className="report-card-value">{clim.puissance ? `${clim.puissance} W` : '-'}</span>
                              </div>
                              <div className="report-card-row">
                                <span className="report-card-label">📅 Date de pose</span>
                                <span className="report-card-value">{formatDateFR(clim.date_pose)}</span>
                              </div>
                              <div className="report-card-row">
                                <span className="report-card-label">🔑 Location ?</span>
                                <span className="report-card-value">{clim.is_location ? 'Oui' : 'Non'}</span>
                              </div>
                              <div className="report-card-row">
                                <span className="report-card-label">👤 Enregistré par</span>
                                <span className="report-card-value" style={{ textTransform: 'capitalize' }}>{clim.enregistre_par || '-'}</span>
                              </div>
                            </div>

                            <div className="report-card-footer">
                              <button 
                                className="btn btn-secondary btn-sm" 
                                style={{ flex: '1' }}
                                onClick={() => {
                                  startEditing(clim);
                                  setShowInventoryEditModal(true);
                                }}
                              >
                                ✏️ Modifier
                              </button>
                              <button 
                                className="btn btn-danger btn-sm" 
                                style={{ flex: '1' }}
                                onClick={() => handleDelete(clim.id)}
                              >
                                <IconTrash /> Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <IconInfo />
                    </div>
                    <div className="empty-title">Aucun équipement correspondant</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Ajustez vos filtres ou lancez un recensement pour enregistrer un climatiseur.
                    </p>
                  </div>
                )}
              </div>
            )}
          </main>
        </>
      )}
          {/* --- EDIT INVENTORY MODAL (Material 3 Dialog) --- */}
          {showInventoryEditModal && (
            <div className="modal-backdrop" onClick={() => setShowInventoryEditModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">
                    ✏️ Modifier l'équipement
                  </h2>
                  <button 
                    className="btn btn-secondary" 
                    style={{ width: '32px', height: '32px', padding: 0, borderRadius: 'var(--radius-full)' }} 
                    onClick={() => setShowInventoryEditModal(false)}
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={async (e) => {
                  await handleSaveEdit(e);
                  setShowInventoryEditModal(false);
                }}>
                  <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    <div className="form-group">
                      <label htmlFor="edit-inv-num">Numéro du climatiseur *</label>
                      <input 
                        type="text" 
                        id="edit-inv-num" 
                        className="input-control no-icon"
                        value={editClimNumber}
                        onChange={(e) => setEditClimNumber(e.target.value)}
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-inv-type">Type de climatiseur</label>
                      <select 
                        id="edit-inv-type" 
                        className="input-control no-icon"
                        value={editClimType}
                        onChange={(e) => setEditClimType(e.target.value)}
                      >
                        <option value="monobloc">Monobloc</option>
                        <option value="split">Split</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-inv-power">Puissance (Watts)</label>
                      <input 
                        type="number" 
                        id="edit-inv-power" 
                        className="input-control no-icon"
                        value={editClimPower}
                        onChange={(e) => setEditClimPower(e.target.value)}
                        placeholder="Ex: 3500" 
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-inv-date">Date de pose *</label>
                      <input 
                        type="date" 
                        id="edit-inv-date" 
                        className="input-control no-icon"
                        value={editClimDate}
                        onChange={(e) => setEditClimDate(e.target.value)}
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Matériel de location ?</label>
                      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.4rem', height: 'var(--input-height)', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          <input 
                            type="radio" 
                            name="editInvIsLocation"
                            checked={editClimIsLocation === true}
                            onChange={() => setEditClimIsLocation(true)}
                            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                          />
                          Oui
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          <input 
                            type="radio" 
                            name="editInvIsLocation"
                            checked={editClimIsLocation === false}
                            onChange={() => setEditClimIsLocation(false)}
                            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                          />
                          Non
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Photo de l'appareil</label>
                      {editClimPhoto ? (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--background)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                          <div className="upload-preview" style={{ width: '80px', height: '80px', margin: 0 }}>
                            <img src={editClimPhoto} alt="Prévisualisation" />
                          </div>
                          <button 
                            type="button" 
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', height: 'fit-content' }}
                            onClick={() => setEditClimPhoto(null)}
                          >
                            Supprimer la photo
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                          <label htmlFor="edit-modal-camera-input" className="upload-area" style={{ flex: 1, padding: '1.25rem', borderStyle: 'dashed', cursor: 'pointer' }}>
                            <span className="upload-icon">
                              <IconCamera />
                            </span>
                            <span style={{ fontWeight: '600', fontSize: '0.8rem' }}>Prendre photo</span>
                          </label>
                          <input 
                            id="edit-modal-camera-input"
                            type="file" 
                            accept="image/*" 
                            capture="environment"
                            style={{ display: 'none' }} 
                            onChange={handleEditPhotoUpload}
                            disabled={isCompressing}
                          />

                          <label htmlFor="edit-modal-gallery-input" className="upload-area" style={{ flex: 1, padding: '1.25rem', borderStyle: 'dashed', cursor: 'pointer' }}>
                            <span className="upload-icon" style={{ color: '#10b981' }}>
                              📁
                            </span>
                            <span style={{ fontWeight: '600', fontSize: '0.8rem' }}>Galerie / Fichier</span>
                          </label>
                          <input 
                            id="edit-modal-gallery-input"
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={handleEditPhotoUpload}
                            disabled={isCompressing}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary" disabled={isCompressing}>
                      Sauvegarder
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowInventoryEditModal(false)}
                      disabled={isCompressing}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
  );
}

export default App;
