import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BinderEntry, BinderState, CustomSlotsState, FilterSettings, PokemonEntry, GenListEntry } from './types';
import { RAW_POKEMON, GEN_2_POKEMON, GEN_3_POKEMON } from './constants';
import { parseCSVRow } from './utils';

import { IconCheck, IconDna, IconDownload, IconEye, IconFilter, IconGraph, IconMenu, IconSave, IconSearch, IconSort, IconSparkles, IconStar, IconTrash, IconUpload, IconX, IconArrowDown } from './components/Icons';
import { Toast, ConfirmDialog } from './components/UI';
import { StatsBar } from './components/StatsBar';
import { AddPokemonModal } from './components/AddPokemonModal';
import { GridView } from './views/GridView';
import { DetailView } from './views/DetailView';
import { DexJumpSidebar } from './components/DexJumpSidebar';

const App = () => {
    const [view, setView] = useState<'grid' | 'detail'>('grid');
    const [selectedEntry, setSelectedEntry] = useState<PokemonEntry | null>(null);
    const [binder, setBinder] = useState<BinderState>({});
    const [customSlots, setCustomSlots] = useState<CustomSlotsState>({}); 
    const [extraPokemon, setExtraPokemon] = useState<PokemonEntry[]>([]); 
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [confirmConfig, setConfirmConfig] = useState<{ msg: string, action: () => void } | null>(null);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showSaveMenu, setShowSaveMenu] = useState(false);
    const [showViewMenu, setShowViewMenu] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [sortMode, setSortMode] = useState<'dex' | 'value-high' | 'value-low'>('dex');
    
    const [showFilters, setShowFilters] = useState(false);
    const [showStats, setShowStats] = useState(false); 
    const [filterSettings, setFilterSettings] = useState<FilterSettings>({
        showOwned: true, 
        showNotOwned: true,
        showGen1Only: false, 
        showBase151: false, 
        show1999: false, 
        showSlots: true,
        showClown: false,
        showDream: false,
        showIdeal: false,
        showTrainers: true, 
        showStandard: true,
        showEX: true, showGX: true, showV: true, showVMAX: true, showVSTAR: true, showMEGA: true,
    });
    
    const [gridColumns, setGridColumns] = useState(0); // 0 = Auto
    const [savedScroll, setSavedScroll] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedBinder = localStorage.getItem('project151_binder');
        const savedSlots = localStorage.getItem('project151_slots');
        const savedExtras = localStorage.getItem('project151_extras');
        const savedColumns = localStorage.getItem('project151_gridColumns');
        
        if (savedBinder) setBinder(JSON.parse(savedBinder));
        if (savedSlots) setCustomSlots(JSON.parse(savedSlots));
        if (savedExtras) setExtraPokemon(JSON.parse(savedExtras));
        if (savedColumns) setGridColumns(parseInt(savedColumns));
    }, []);

    useEffect(() => {
        if (view === 'detail') {
            window.scrollTo(0, 0);
        } else {
            const timer = setTimeout(() => {
                window.scrollTo(0, savedScroll);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [view, savedScroll]);

    const fullEntries = useMemo(() => {
        let currentDex = 1;
        let result: PokemonEntry[] = [];
        
        // Process Base 1-151
        RAW_POKEMON.forEach(raw => {
            let entry: PokemonEntry;
            if (typeof raw === 'string') {
                entry = { name: raw, apiId: currentDex, key: currentDex.toString(), isMega: false, displayId: currentDex.toString().padStart(3, '0'), isBase: true, isTrainer: false };
                currentDex++;
                result.push(entry);
            } else {
                entry = { ...raw, apiId: currentDex, key: currentDex.toString(), isMega: false, displayId: currentDex.toString().padStart(3, '0'), isBase: true, isTrainer: false };
                currentDex++;
                result.push(entry);
            }
        });

        // Gen 2 & 3
        const processGen = (list: GenListEntry[]) => {
            list.forEach(p => {
                result.push({
                    name: p.name,
                    apiId: p.id,
                    key: p.id.toString(),
                    isMega: false,
                    displayId: p.id.toString().padStart(3, '0'),
                    isBase: false,
                    isTrainer: false
                });
            });
        };
        processGen(GEN_2_POKEMON);
        processGen(GEN_3_POKEMON);

        // Merge Extras
        result = [...result, ...extraPokemon];

        // Custom Slots expansion
        if (filterSettings.showSlots) {
            let expanded: PokemonEntry[] = [];
            result.forEach(p => {
                expanded.push(p);
                if (customSlots[p.key]) {
                    customSlots[p.key].forEach((slotId, idx) => {
                        expanded.push({
                            ...p,
                            key: `${p.key}_slot_${slotId}`,
                            name: `${p.name} (Slot)`,
                            isCustom: true,
                            _sortWeight: idx + 1
                        });
                    });
                }
            });
            result = expanded;
        }

        // Sorting
        if (sortMode === 'dex') {
            result.sort((a, b) => a.apiId - b.apiId);
        } else {
             result.sort((a, b) => {
                const valA = parseFloat(binder[a.key]?.value?.replace(/[^0-9.]/g, '') || '0');
                const valB = parseFloat(binder[b.key]?.value?.replace(/[^0-9.]/g, '') || '0');
                return sortMode === 'value-high' ? valB - valA : valA - valB;
             });
        }
        
        return result;
    }, [binder, customSlots, extraPokemon, filterSettings.showSlots, sortMode]);

    const handleSaveEntry = (key: string, data: Partial<BinderEntry>) => {
        const newBinder = { ...binder, [key]: { ...(binder[key] || {}), ...data } };
        setBinder(newBinder);
        localStorage.setItem('project151_binder', JSON.stringify(newBinder));
        setToastMsg("Entry Saved!");
    };

    const handleToggleOwned = (key: string) => {
        const entry = binder[key];
        const newOwned = !entry?.owned;
        handleSaveEntry(key, { owned: newOwned });
    };

    const handleAddSlot = (entry: PokemonEntry) => {
        const slots = customSlots[entry.key] || [];
        const newId = Date.now().toString();
        const newSlots = { ...customSlots, [entry.key]: [...slots, newId] };
        setCustomSlots(newSlots);
        localStorage.setItem('project151_slots', JSON.stringify(newSlots));
        setToastMsg("Slot Added!");
    };

    const handleRemoveSlot = (entry: PokemonEntry) => {
        // key format: originalKey_slot_slotId
        const parts = entry.key.split('_slot_');
        if (parts.length < 2) return;
        const baseKey = parts[0];
        const slotId = parts[1];
        
        setConfirmConfig({
            msg: `Remove slot for ${entry.name}? This cannot be undone.`,
            action: () => {
                const slots = customSlots[baseKey] || [];
                const newSlots = { ...customSlots, [baseKey]: slots.filter(s => s !== slotId) };
                setCustomSlots(newSlots);
                localStorage.setItem('project151_slots', JSON.stringify(newSlots));
                
                // Clean up binder data for this slot
                const newBinder = { ...binder };
                delete newBinder[entry.key];
                setBinder(newBinder);
                localStorage.setItem('project151_binder', JSON.stringify(newBinder));
                
                if (selectedEntry?.key === entry.key) onBack();
                setToastMsg("Slot Removed");
            }
        });
    };

    const handleDeletePokemon = (entry: PokemonEntry) => {
         setConfirmConfig({
            msg: `Delete ${entry.name} from database?`,
            action: () => {
                const newExtras = extraPokemon.filter(p => p.key !== entry.key);
                setExtraPokemon(newExtras);
                localStorage.setItem('project151_extras', JSON.stringify(newExtras));
                if (selectedEntry?.key === entry.key) onBack();
                setToastMsg("Entry Deleted");
            }
         });
    };

    const handleSwapSlot = (entry: PokemonEntry) => {
        const parts = entry.key.split('_slot_');
        if (parts.length < 2) return;
        const baseKey = parts[0];
        
        const slotData = binder[entry.key];
        const baseData = binder[baseKey];
        
        const newBinder = { ...binder };
        if (slotData) newBinder[baseKey] = { ...slotData };
        else delete newBinder[baseKey];
        
        if (baseData) newBinder[entry.key] = { ...baseData };
        else delete newBinder[entry.key];
        
        setBinder(newBinder);
        localStorage.setItem('project151_binder', JSON.stringify(newBinder));
        setToastMsg("Swapped with Main!");
    };
    
    const onBack = () => {
        setView('grid');
        setSelectedEntry(null);
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(binder);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'project151_backup.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        if (e.target.files && e.target.files[0]) {
            fileReader.readAsText(e.target.files[0], "UTF-8");
            fileReader.onload = (event) => {
                try {
                    if (event.target?.result) {
                        const parsed = JSON.parse(event.target.result as string);
                        setBinder(parsed);
                        localStorage.setItem('project151_binder', JSON.stringify(parsed));
                        setToastMsg("Data Imported Successfully!");
                    }
                } catch (err) {
                    setToastMsg("Invalid File Format");
                }
            };
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                           <IconDna />
                        </div>
                        <h1 className="font-bold text-lg tracking-tight hidden md:block">Project<span className="text-indigo-400">151</span></h1>
                    </div>

                    <div className={`flex-1 max-w-md relative transition-all duration-300 ${showMobileSearch ? 'absolute inset-x-4 z-50' : 'hidden md:block'}`}>
                        <div className="relative">
                            <div className="absolute left-3 top-2.5 text-slate-500"><IconSearch /></div>
                            <input 
                                type="text" 
                                placeholder="Search Pokemon..." 
                                className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus={showMobileSearch}
                                onBlur={() => setShowMobileSearch(false)}
                            />
                            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white"><IconX size={16} /></button>}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2">
                         <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"><IconSearch /></button>
                         <button onClick={() => setShowStats(!showStats)} className={`p-2 rounded-lg transition-colors ${showStats ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><IconGraph /></button>
                         <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><IconFilter /></button>
                         
                         <div className="relative">
                            <button onClick={() => setShowSortMenu(!showSortMenu)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"><IconSort /></button>
                            {showSortMenu && (
                                <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                                    <button onClick={() => { setSortMode('dex'); setShowSortMenu(false); }} className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center justify-between ${sortMode === 'dex' ? 'bg-indigo-900/30 text-indigo-300' : 'text-slate-300 hover:bg-slate-700'}`}>Pokedex Order {sortMode === 'dex' && <IconCheck />}</button>
                                    <button onClick={() => { setSortMode('value-high'); setShowSortMenu(false); }} className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center justify-between ${sortMode === 'value-high' ? 'bg-indigo-900/30 text-indigo-300' : 'text-slate-300 hover:bg-slate-700'}`}>Value: High to Low {sortMode === 'value-high' && <IconCheck />}</button>
                                    <button onClick={() => { setSortMode('value-low'); setShowSortMenu(false); }} className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center justify-between ${sortMode === 'value-low' ? 'bg-indigo-900/30 text-indigo-300' : 'text-slate-300 hover:bg-slate-700'}`}>Value: Low to High {sortMode === 'value-low' && <IconCheck />}</button>
                                </div>
                                </>
                            )}
                         </div>

                         <div className="relative">
                            <button onClick={() => setShowSaveMenu(!showSaveMenu)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"><IconMenu /></button>
                            {showSaveMenu && (
                                <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowSaveMenu(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                                    <button onClick={handleExport} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 flex items-center gap-2"><IconDownload /> Export Backup</button>
                                    <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 flex items-center gap-2"><IconUpload /> Import Backup</button>
                                    <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                                </div>
                                </>
                            )}
                         </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-slate-800 border-t border-slate-700 p-4 animate-slide-down">
                        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Collection</h4>
                                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer"><input type="checkbox" checked={filterSettings.showOwned} onChange={() => setFilterSettings(s => ({...s, showOwned: !s.showOwned}))} className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-offset-slate-800" /> Show Owned</label>
                                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer mt-1"><input type="checkbox" checked={filterSettings.showNotOwned} onChange={() => setFilterSettings(s => ({...s, showNotOwned: !s.showNotOwned}))} className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-offset-slate-800" /> Show Missing</label>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Display</h4>
                                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer"><input type="checkbox" checked={filterSettings.showSlots} onChange={() => setFilterSettings(s => ({...s, showSlots: !s.showSlots}))} className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-offset-slate-800" /> Show Custom Slots</label>
                                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer mt-1"><input type="checkbox" checked={filterSettings.showTrainers} onChange={() => setFilterSettings(s => ({...s, showTrainers: !s.showTrainers}))} className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-offset-slate-800" /> Show Trainers</label>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Card Types</h4>
                                <div className="grid grid-cols-2 gap-1">
                                    <label className="flex items-center gap-1 text-xs text-slate-300"><input type="checkbox" checked={filterSettings.showStandard} onChange={() => setFilterSettings(s => ({...s, showStandard: !s.showStandard}))} /> Standard</label>
                                    <label className="flex items-center gap-1 text-xs text-slate-300"><input type="checkbox" checked={filterSettings.showEX} onChange={() => setFilterSettings(s => ({...s, showEX: !s.showEX}))} /> EX</label>
                                    <label className="flex items-center gap-1 text-xs text-slate-300"><input type="checkbox" checked={filterSettings.showGX} onChange={() => setFilterSettings(s => ({...s, showGX: !s.showGX}))} /> GX</label>
                                    <label className="flex items-center gap-1 text-xs text-slate-300"><input type="checkbox" checked={filterSettings.showV} onChange={() => setFilterSettings(s => ({...s, showV: !s.showV}))} /> V</label>
                                    <label className="flex items-center gap-1 text-xs text-slate-300"><input type="checkbox" checked={filterSettings.showVMAX} onChange={() => setFilterSettings(s => ({...s, showVMAX: !s.showVMAX}))} /> VMAX</label>
                                    <label className="flex items-center gap-1 text-xs text-slate-300"><input type="checkbox" checked={filterSettings.showVSTAR} onChange={() => setFilterSettings(s => ({...s, showVSTAR: !s.showVSTAR}))} /> VSTAR</label>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Art Styles</h4>
                                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer"><input type="checkbox" checked={filterSettings.showBase151} onChange={() => setFilterSettings(s => ({...s, showBase151: !s.showBase151}))} className="rounded border-slate-600 bg-slate-700 text-indigo-500" /> Force SV 151 Art</label>
                                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer mt-1"><input type="checkbox" checked={filterSettings.showIdeal} onChange={() => setFilterSettings(s => ({...s, showIdeal: !s.showIdeal}))} className="rounded border-slate-600 bg-slate-700 text-indigo-500" /> Prefer Ideal Art</label>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Stats */}
            {showStats && (
                <StatsBar 
                    binder={binder} 
                    totalCards={fullEntries.length} 
                    ownedCards={fullEntries.filter(e => binder[e.key]?.owned).length} 
                />
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-4 pb-24">
                {view === 'grid' ? (
                    <>
                        <GridView 
                            entries={fullEntries} 
                            searchQuery={searchQuery} 
                            binder={binder} 
                            gridColumns={gridColumns}
                            filterSettings={filterSettings}
                            onSelect={(entry) => {
                                setSavedScroll(window.scrollY);
                                setSelectedEntry(entry);
                                setView('detail');
                            }}
                            onToggleOwned={handleToggleOwned}
                            onOpenAddModal={() => setShowAddModal(true)}
                        />
                        <DexJumpSidebar entries={fullEntries} />
                    </>
                ) : (
                    selectedEntry && (
                        <DetailView 
                            entry={selectedEntry} 
                            binderEntry={binder[selectedEntry.key]}
                            onSave={handleSaveEntry}
                            onToggleOwned={handleToggleOwned}
                            onBack={onBack}
                            onAddSlot={handleAddSlot}
                            onRemoveSlot={handleRemoveSlot}
                            onDeletePokemon={handleDeletePokemon}
                            onSwapSlot={handleSwapSlot}
                            filterSettings={filterSettings}
                        />
                    )
                )}
            </main>

            {/* Modals */}
            <Toast msg={toastMsg} onClose={() => setToastMsg(null)} />
            <ConfirmDialog config={confirmConfig} onCancel={() => setConfirmConfig(null)} />
            {showAddModal && <AddPokemonModal onClose={() => setShowAddModal(false)} onAdd={(poke) => {
                setExtraPokemon([...extraPokemon, poke]);
                localStorage.setItem('project151_extras', JSON.stringify([...extraPokemon, poke]));
                setShowAddModal(false);
                setToastMsg("Added to list!");
            }} />}
        </div>
    );
};

export default App;