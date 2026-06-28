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

// --- DEFAULT SUGGESTIONS (Used for seeding the database table if empty) ---
const DEFAULT_SITES = ["Site Principal (Paris)", "Technopole (Lyon)", "Annexe Est (Strasbourg)"];
const DEFAULT_BUILDINGS = ["Bâtiment A - Administration", "Bâtiment B - R&D", "Bâtiment C - Logistique"];
const DEFAULT_FLOORS = ["RDC", "Étage 1", "Étage 2", "Étage 3"];
const DEFAULT_LOCATIONS = ["Bureau 101", "Bureau 102", "Salle Réunion", "Local Technique", "Accueil"];

function App() {
  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('isLoggedIn') === 'true');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Main navigation
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard', 'add', 'report'

  // Database records loaded from Supabase
  const [climatiseurs, setClimatiseurs] = useState([]);
  const [locaux, setLocaux] = useState([]);
  
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
  const [isCompressing, setIsCompressing] = useState(false);
  const [showAddFormOverride, setShowAddFormOverride] = useState(false); 

  // Search queries for selection workflow steps
  const [searchSiteQuery, setSearchSiteQuery] = useState('');
  const [searchBuildingQuery, setSearchBuildingQuery] = useState('');
  const [searchFloorQuery, setSearchFloorQuery] = useState('');
  const [searchLocationQuery, setSearchLocationQuery] = useState('');
  const [showEntryModal, setShowEntryModal] = useState(false);

  // Filter/Search states in reports
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterType, setFilterType] = useState('');

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
      // 1. Fetch climatiseurs
      const { data: climsData, error: climsError } = await supabase
        .from('climatiseurs')
        .select('*');
      
      if (climsError) {
        if (climsError.message && (climsError.message.includes('relation') || climsError.message.includes('does not exist'))) {
          throw new Error("La table 'climatiseurs' n'existe pas dans votre projet Supabase. Veuillez l'ajouter en exécutant le script SQL fourni dans le guide.");
        }
        throw climsError;
      }
      setClimatiseurs(climsData || []);

      // 2. Fetch locations hierarchy (locaux)
      const { data: locauxData, error: locauxError } = await supabase
        .from('locaux')
        .select('*');

      if (locauxError) {
        if (locauxError.message && (locauxError.message.includes('relation') || locauxError.message.includes('does not exist'))) {
          throw new Error("La table 'locaux' n'existe pas dans votre projet Supabase. Veuillez l'ajouter en exécutant le script SQL fourni dans le guide.");
        }
        throw locauxError;
      }

      // Seed default locations if the database table is brand new and empty
      if (!locauxData || locauxData.length === 0) {
        await seedDefaultLocaux();
      } else {
        setLocaux(locauxData);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données Supabase:", err);
      let msg = err.message || "Erreur de connexion. Vérifiez vos tables PostgreSQL et vos clés API.";
      if (err.status === 404 || (err.message && err.message.includes('404')) || (err.message && err.message.includes('relation') && err.message.includes('not found'))) {
        msg = "Erreur 404 de l'API Supabase. Les tables SQL 'locaux' ou 'climatiseurs' n'ont pas été trouvées. Veuillez vous connecter à votre console Supabase, ouvrir l'onglet 'SQL Editor' et exécuter le script de création de tables fourni dans le guide walkthrough.md.";
      }
      setSupabaseError(msg);
    }
  };

  // Pre-populate Supabase table with sample locations
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
      if (data) {
        setLocaux(data);
      }
    } catch (err) {
      console.error("Erreur de peuplement initial de la table locaux:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (usernameInput.trim().toLowerCase() === 'admin' && passwordInput === 'admin') {
      setIsLoggedIn(true);
      sessionStorage.setItem('isLoggedIn', 'true');
      setAuthError('');
    } else {
      setAuthError('Identifiants incorrects. Essayer "admin" / "admin".');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('isLoggedIn');
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
    setSearchSiteQuery('');
    setSearchBuildingQuery('');
    setSearchFloorQuery('');
    setSearchLocationQuery('');
    setShowEntryModal(false);
    clearForm();
  };

  const clearForm = () => {
    setClimNumber('');
    setClimType('monobloc');
    setClimPower('');
    setClimDate(new Date().toISOString().split('T')[0]);
    setClimPhoto(null);
    setShowAddFormOverride(false);
  };

  // Select option in workflow
  const selectSite = (site) => {
    setSelectedSite(site);
    setCurrentStep(1);
    setSearchSiteQuery('');
  };

  const selectBuilding = (building) => {
    setSelectedBuilding(building);
    setCurrentStep(2);
    setSearchBuildingQuery('');
  };

  const selectFloor = (floor) => {
    setSelectedFloor(floor);
    setCurrentStep(3);
    setSearchFloorQuery('');
  };

  const selectLocation = (loc) => {
    setSelectedLocation(loc);
    clearForm();
    setShowEntryModal(true);
    setSearchLocationQuery('');
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

      // 2. Add location to locaux DB table if it does not exist yet (custom text input)
      const locExists = locaux.some(l => 
        l.site === selectedSite &&
        l.batiment === selectedBuilding &&
        l.etage === selectedFloor &&
        l.localisation === selectedLocation
      );

      if (!locExists) {
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
        if (newLocData) {
          setLocaux(prev => [...prev, ...newLocData]);
        }
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

  // Dynamic lists suggestions built directly from the `locaux` table records
  const getSitesSuggestions = () => {
    const list = locaux.map(l => l.site);
    return Array.from(new Set(list)).filter(s => s);
  };

  const getBuildingsSuggestions = () => {
    const list = locaux.filter(l => l.site === selectedSite).map(l => l.batiment);
    return Array.from(new Set(list)).filter(b => b);
  };

  const getFloorsSuggestions = () => {
    const list = locaux.filter(l => l.site === selectedSite && l.batiment === selectedBuilding).map(l => l.etage);
    return Array.from(new Set(list)).filter(f => f);
  };

  const getLocationsSuggestions = () => {
    const list = locaux.filter(l => 
      l.site === selectedSite && 
      l.batiment === selectedBuilding && 
      l.etage === selectedFloor
    ).map(l => l.localisation);
    return Array.from(new Set(list)).filter(loc => loc);
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

    const headers = [["Site", "Bâtiment", "Niveau", "Localisation", "N° Climatiseur", "Type", "Puissance", "Date de Pose"]];
    const rows = sortedData.map(c => [
      c.site,
      c.batiment,
      c.etage,
      c.localisation,
      c.numero,
      c.type.toUpperCase(),
      c.puissance ? `${c.puissance} W` : '-',
      formatDateFR(c.date_pose)
    ]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 40,
      theme: 'striped',
      headStyles: {
        fillColor: [2, 132, 199], 
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [30, 41, 59] 
      },
      columnStyles: {
        0: { cellWidth: 32 }, 
        1: { cellWidth: 32 }, 
        2: { cellWidth: 15 }, 
        3: { cellWidth: 28 }, 
        4: { cellWidth: 28 }, 
        5: { cellWidth: 20 }, 
        6: { cellWidth: 20 }, 
        7: { cellWidth: 20 }  
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
    <div className="app-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <IconCheck />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* --- ENTRY MODAL POPUP --- */}
      {showEntryModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-icon-wrapper">
                <IconWind />
              </div>
              <h3 className="modal-title">🚪 Accès au local</h3>
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

            <button type="submit" className="btn btn-primary btn-full mt-lg" style={{ padding: '0.75rem' }}>
              Se connecter
            </button>

            <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', background: '#f8fafc', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              Accès démo : <strong style={{ color: 'var(--text-secondary)' }}>admin</strong> / <strong style={{ color: 'var(--text-secondary)' }}>admin</strong>
            </div>
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
              <IconDashboard />
              <span>Accueil</span>
            </div>
            <div 
              className={`bottom-nav-item ${currentTab === 'add' ? 'active' : ''}`}
              onClick={() => { setCurrentTab('add'); resetStepFlow(); }}
            >
              <IconPlus />
              <span>Recenser</span>
            </div>
            <div 
              className={`bottom-nav-item ${currentTab === 'report' ? 'active' : ''}`}
              onClick={() => setCurrentTab('report')}
            >
              <IconList />
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
                  <div className="stat-card">
                    <div className="stat-icon-box">
                      <IconWind />
                    </div>
                    <div className="stat-data">
                      <span className="stat-number">{climatiseurs.length}</span>
                      <span className="stat-label">Total climatiseurs</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      <IconCheck />
                    </div>
                    <div className="stat-data">
                      <span className="stat-number">
                        {climatiseurs.filter(c => c.type === 'monobloc').length}
                      </span>
                      <span className="stat-label">Monoblocs</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                      <IconList />
                    </div>
                    <div className="stat-data">
                      <span className="stat-number">
                        {climatiseurs.filter(c => c.type === 'split').length}
                      </span>
                      <span className="stat-label">Splits</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                      <IconMapPin />
                    </div>
                    <div className="stat-data">
                      <span className="stat-number">
                        {Array.from(new Set(climatiseurs.map(c => `${c.site}-${c.batiment}-${c.etage}-${c.localisation}`))).length}
                      </span>
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
                      {climatiseurs.length > 0 ? (
                        <div className="activity-list">
                          {[...climatiseurs]
                            .sort((a, b) => b.created_at ? new Date(b.created_at) - new Date(a.created_at) : b.id - a.id)
                            .slice(0, 5)
                            .map((clim) => (
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

                    <div className="card">
                      <div className="card-header">
                        <h2 className="card-title">Guide rapide d'inventaire</h2>
                      </div>
                      <div className="card-body" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.5rem' }}>
                          <strong>1. Recensement :</strong> Allez sur le menu "Recenser", renseignez le chemin hiérarchique, puis validez.
                        </p>
                        <p style={{ marginBottom: '0.5rem' }}>
                          <strong>2. Fiche Technique :</strong> Si le local est équipé, la fiche apparaîtra et vous pourrez ajouter d'autres appareils si nécessaire.
                        </p>
                        <p>
                          <strong>3. Rapports :</strong> La section "Inventaire" vous permet de filtrer, chercher et exporter en PDF.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. RECENSER / SEARCH STEP FLOW VIEW */}
            {currentTab === 'add' && (
              <div className="step-container">
                <div className="step-header">
                  <h2 className="step-title">Enregistrement d'équipement</h2>
                  <div className="step-indicator">
                    {[0, 1, 2, 3, 4].map(idx => (
                      <span 
                        key={idx} 
                        className={`step-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Breadcrumbs path selection history */}
                {(selectedSite || selectedBuilding || selectedFloor || selectedLocation) && (
                  <div className="hierarchy-breadcrumbs">
                    <span style={{ fontWeight: 'bold', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Chemin :</span>
                    <div className="breadcrumb-item">
                      <span 
                        style={{ cursor: 'pointer', textDecoration: selectedSite ? 'underline' : 'none' }} 
                        onClick={() => { setCurrentStep(0); setSelectedSite(''); setSelectedBuilding(''); setSelectedFloor(''); setSelectedLocation(''); }}
                      >
                        Sites
                      </span>
                      {selectedSite && <span className="breadcrumb-separator"><IconChevronRight /></span>}
                    </div>
                    {selectedSite && (
                      <div className="breadcrumb-item">
                        <span 
                          style={{ cursor: 'pointer', textDecoration: selectedBuilding ? 'underline' : 'none' }}
                          onClick={() => { setCurrentStep(1); setSelectedBuilding(''); setSelectedFloor(''); setSelectedLocation(''); }}
                        >
                          {selectedSite}
                        </span>
                        {selectedBuilding && <span className="breadcrumb-separator"><IconChevronRight /></span>}
                      </div>
                    )}
                    {selectedBuilding && (
                      <div className="breadcrumb-item">
                        <span 
                          style={{ cursor: 'pointer', textDecoration: selectedFloor ? 'underline' : 'none' }}
                          onClick={() => { setCurrentStep(2); setSelectedFloor(''); setSelectedLocation(''); }}
                        >
                          {selectedBuilding}
                        </span>
                        {selectedFloor && <span className="breadcrumb-separator"><IconChevronRight /></span>}
                      </div>
                    )}
                    {selectedFloor && (
                      <div className="breadcrumb-item">
                        <span 
                          style={{ cursor: 'pointer', textDecoration: selectedLocation ? 'underline' : 'none' }}
                          onClick={() => { setCurrentStep(3); setSelectedLocation(''); }}
                        >
                          {selectedFloor}
                        </span>
                        {selectedLocation && <span className="breadcrumb-separator"><IconChevronRight /></span>}
                      </div>
                    )}
                    {selectedLocation && (
                      <div className="breadcrumb-item">
                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{selectedLocation}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 0: Site selection */}
                {currentStep === 0 && (
                  <div>
                    <h3 className="mb-lg" style={{ fontSize: '0.95rem', fontWeight: '700' }}>1. Sélectionner ou saisir un site</h3>
                    <div className="input-wrapper mb-lg" style={{ maxWidth: '400px' }}>
                      <span className="input-icon"><IconSearch /></span>
                      <input 
                        type="text" 
                        className="input-control" 
                        placeholder="Rechercher ou saisir un site..." 
                        value={searchSiteQuery}
                        onChange={(e) => setSearchSiteQuery(e.target.value)}
                      />
                    </div>
                    <div className="options-grid">
                      {getSitesSuggestions()
                        .filter(site => site.toLowerCase().includes(searchSiteQuery.toLowerCase()))
                        .map((site, i) => (
                          <div key={i} className="option-card" onClick={() => selectSite(site)}>
                            {site}
                          </div>
                      ))}
                      
                      {searchSiteQuery.trim() && !getSitesSuggestions().some(s => s.toLowerCase() === searchSiteQuery.trim().toLowerCase()) && (
                        <div 
                          className="option-card selected" 
                          style={{ borderStyle: 'dashed', background: '#f0f9ff' }}
                          onClick={() => selectSite(searchSiteQuery.trim())}
                        >
                          <span>➕ Créer : <strong>{searchSiteQuery.trim()}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 1: Building selection */}
                {currentStep === 1 && (
                  <div>
                    <h3 className="mb-lg" style={{ fontSize: '0.95rem', fontWeight: '700' }}>2. Sélectionner ou saisir un bâtiment</h3>
                    <div className="input-wrapper mb-lg" style={{ maxWidth: '400px' }}>
                      <span className="input-icon"><IconSearch /></span>
                      <input 
                        type="text" 
                        className="input-control" 
                        placeholder="Rechercher ou saisir un bâtiment..." 
                        value={searchBuildingQuery}
                        onChange={(e) => setSearchBuildingQuery(e.target.value)}
                      />
                    </div>
                    <div className="options-grid">
                      {getBuildingsSuggestions()
                        .filter(b => b.toLowerCase().includes(searchBuildingQuery.toLowerCase()))
                        .map((building, i) => (
                          <div key={i} className="option-card" onClick={() => selectBuilding(building)}>
                            {building}
                          </div>
                      ))}
                      
                      {searchBuildingQuery.trim() && !getBuildingsSuggestions().some(b => b.toLowerCase() === searchBuildingQuery.trim().toLowerCase()) && (
                        <div 
                          className="option-card selected" 
                          style={{ borderStyle: 'dashed', background: '#f0f9ff' }}
                          onClick={() => selectBuilding(searchBuildingQuery.trim())}
                        >
                          <span>➕ Créer : <strong>{searchBuildingQuery.trim()}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: Floor selection */}
                {currentStep === 2 && (
                  <div>
                    <h3 className="mb-lg" style={{ fontSize: '0.95rem', fontWeight: '700' }}>3. Sélectionner ou saisir un étage</h3>
                    <div className="input-wrapper mb-lg" style={{ maxWidth: '400px' }}>
                      <span className="input-icon"><IconSearch /></span>
                      <input 
                        type="text" 
                        className="input-control" 
                        placeholder="Rechercher ou saisir un étage..." 
                        value={searchFloorQuery}
                        onChange={(e) => setSearchFloorQuery(e.target.value)}
                      />
                    </div>
                    <div className="options-grid">
                      {getFloorsSuggestions()
                        .filter(f => f.toLowerCase().includes(searchFloorQuery.toLowerCase()))
                        .map((floor, i) => (
                          <div key={i} className="option-card" onClick={() => selectFloor(floor)}>
                            {floor}
                          </div>
                      ))}
                      
                      {searchFloorQuery.trim() && !getFloorsSuggestions().some(f => f.toLowerCase() === searchFloorQuery.trim().toLowerCase()) && (
                        <div 
                          className="option-card selected" 
                          style={{ borderStyle: 'dashed', background: '#f0f9ff' }}
                          onClick={() => selectFloor(searchFloorQuery.trim())}
                        >
                          <span>➕ Créer : <strong>{searchFloorQuery.trim()}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: Location selection */}
                {currentStep === 3 && (
                  <div>
                    <h3 className="mb-lg" style={{ fontSize: '0.95rem', fontWeight: '700' }}>4. Sélectionner ou saisir la localisation (salle, local)</h3>
                    <div className="input-wrapper mb-lg" style={{ maxWidth: '400px' }}>
                      <span className="input-icon"><IconSearch /></span>
                      <input 
                        type="text" 
                        className="input-control" 
                        placeholder="Rechercher ou saisir un local..." 
                        value={searchLocationQuery}
                        onChange={(e) => setSearchLocationQuery(e.target.value)}
                      />
                    </div>
                    <div className="options-grid">
                      {getLocationsSuggestions()
                        .filter(loc => loc.toLowerCase().includes(searchLocationQuery.toLowerCase()))
                        .map((loc, i) => (
                          <div key={i} className="option-card" onClick={() => selectLocation(loc)}>
                            {loc}
                          </div>
                      ))}
                      
                      {searchLocationQuery.trim() && !getLocationsSuggestions().some(l => l.toLowerCase() === searchLocationQuery.trim().toLowerCase()) && (
                        <div 
                          className="option-card selected" 
                          style={{ borderStyle: 'dashed', background: '#f0f9ff' }}
                          onClick={() => selectLocation(searchLocationQuery.trim())}
                        >
                          <span>➕ Créer local : <strong>{searchLocationQuery.trim()}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: Technical Sheets / Register Form */}
                {currentStep === 4 && (
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

                        {getClimsInSelectedLocation().map((clim) => (
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
                                <span className="detail-label">Ajouté le</span>
                                <span className="detail-value">{formatDateFR(clim.date_ajout)}</span>
                              </div>
                              <div className="detail-item" style={{ justifyContent: 'center' }}>
                                <button className="btn btn-danger" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={() => handleDelete(clim.id)}>
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
                        ))}

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

                          </div>

                          <div className="form-group">
                            <label>Photo de l'appareil</label>
                            
                            {!climPhoto ? (
                              <label className="upload-area">
                                <span className="upload-icon">
                                  {isCompressing ? "..." : <IconCamera />}
                                </span>
                                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                                  {isCompressing ? "Compression en cours..." : "Prendre une photo (Appareil photo) ou choisir un fichier"}
                                </span>
                                <input 
                                  type="file" 
                                  accept="image/*;capture=camera" 
                                  capture="environment"
                                  style={{ display: 'none' }} 
                                  onChange={handlePhotoUpload}
                                  disabled={isCompressing}
                                />
                              </label>
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

                {/* Inventory Table */}
                {getSortedClimatiseurs().length > 0 ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Site</th>
                          <th>Bâtiment</th>
                          <th>Niveau</th>
                          <th>Localisation</th>
                          <th>N° Climatiseur</th>
                          <th>Type</th>
                          <th>Puissance</th>
                          <th>Date de Pose</th>
                          <th style={{ width: '60px', textAlign: 'center' }}>Suppr.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedClimatiseurs().map((clim) => (
                          <tr key={clim.id}>
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
                            <td data-label="Date de Pose">{formatDateFR(clim.date_pose)}</td>
                            <td data-label="Actions" style={{ textAlign: 'center' }}>
                              <button 
                                className="btn btn-danger" 
                                style={{ width: '28px', height: '28px', padding: 0 }}
                                onClick={() => handleDelete(clim.id)}
                              >
                                <IconTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
    </div>
  );
}

export default App;
