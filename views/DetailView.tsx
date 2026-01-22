import React, { useState, useEffect } from 'react';
import { PokemonEntry, BinderEntry, FilterSettings } from '../types';
import { getDefaultImage } from '../utils';
import { 
    IconArrowLeft, IconChart, IconExchange, IconSave, IconPlus, IconTrash, 
    IconZoom, IconImage, IconPound, IconClipboard, IconX, IconMinimize, 
    IconMaximize, IconSparkles, IconStar, IconPalette 
} from '../components/Icons';
import { ImagePreviewModal } from '../components/UI';

interface DetailViewProps {
    entry: PokemonEntry;
    binderEntry?: BinderEntry;
    onSave: (key: string, data: Partial<BinderEntry>) => void;
    onToggleOwned: (key: string) => void;
    onBack: () => void;
    onAddSlot: (entry: PokemonEntry) => void;
    onRemoveSlot: (entry: PokemonEntry) => void;
    onDeletePokemon: (entry: PokemonEntry) => void;
    onSwapSlot: (entry: PokemonEntry) => void;
    filterSettings: FilterSettings;
}

export const DetailView: React.FC<DetailViewProps> = ({ 
    entry, binderEntry, onSave, onToggleOwned, onBack, onAddSlot, onRemoveSlot, onDeletePokemon, onSwapSlot, filterSettings 
}) => {
    const [manualUrl, setManualUrl] = useState(binderEntry?.url || "");
    const [fanArtUrl, setFanArtUrl] = useState(binderEntry?.fanArtUrl || ""); 
    const [dreamUrl, setDreamUrl] = useState(binderEntry?.dreamUrl || ""); 
    const [idealUrl, setIdealUrl] = useState(binderEntry?.idealUrl || ""); 
    const [manualName, setManualName] = useState(binderEntry?.name || entry.name);
    const [manualValue, setManualValue] = useState(binderEntry?.value || "");
    const [selectedRarity, setSelectedRarity] = useState(binderEntry?.cardType || "standard");
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [showExtraUrls, setShowExtraUrls] = useState(false);

    useEffect(() => {
        setManualUrl(binderEntry?.url || "");
        setFanArtUrl(binderEntry?.fanArtUrl || "");
        setDreamUrl(binderEntry?.dreamUrl || "");
        setIdealUrl(binderEntry?.idealUrl || "");
        setManualName(binderEntry?.name || entry.name);
        setManualValue(binderEntry?.value || "");
        setSelectedRarity(binderEntry?.cardType || "standard");
        
        if (binderEntry?.fanArtUrl || binderEntry?.dreamUrl || binderEntry?.idealUrl) {
            setShowExtraUrls(true);
        }
    }, [binderEntry, entry.name]);

    const handleManualSave = () => {
        onSave(entry.key, { 
            url: manualUrl, 
            fanArtUrl: fanArtUrl, 
            dreamUrl: dreamUrl, 
            idealUrl: idealUrl, 
            name: manualName, 
            owned: binderEntry?.owned || false, 
            value: manualValue, 
            cardType: selectedRarity 
        });
        onBack();
    };

    const handleMarketSearch = () => {
        const queryName = manualName || entry.name;
        const queryId = binderEntry?.value || entry.displayId;
        const query = `site:pricecharting.com "${queryName}" "${queryId}" pokemon card`;
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
        const w = window.innerWidth * 0.9;
        const h = window.innerHeight * 0.9;
        const left = (window.innerWidth - w) / 2;
        const top = (window.innerHeight - h) / 2;
        window.open(searchUrl, 'pricecharting_popup', `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes`);
    };

    const handlePaste = async (setter: React.Dispatch<React.SetStateAction<string>>) => {
        try { const text = await navigator.clipboard.readText(); setter(text); } catch (err) { console.error("Paste failed", err); }
    };

    const isOwned = binderEntry?.owned || false;
    let displayImage = getDefaultImage(entry);
    let showingFanArt = false;
    let showingDream = false;
    let showingIdeal = false;

    if (idealUrl && filterSettings.showIdeal) {
        displayImage = idealUrl;
        showingIdeal = true;
    } else if (dreamUrl && filterSettings.showDream) {
        displayImage = dreamUrl;
        showingDream = true;
    } else if (fanArtUrl && filterSettings.showClown) { 
        displayImage = fanArtUrl; 
        showingFanArt = true; 
    } else if (manualUrl) {
        displayImage = manualUrl; 
    } else {
         if (idealUrl) { displayImage = idealUrl; showingIdeal = true; }
         else if (dreamUrl) { displayImage = dreamUrl; showingDream = true; }
         else if (fanArtUrl) { displayImage = fanArtUrl; showingFanArt = true; }
    }

    return (
        <div>
            {showImagePreview && <ImagePreviewModal src={displayImage} onClose={() => setShowImagePreview(false)} />}
            
            <div className="sticky top-[58px] z-30 bg-slate-900/95 backdrop-blur border-b border-slate-700 py-2 mb-4 -mx-4 px-4 shadow-lg flex flex-wrap gap-2 justify-between items-center">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-bold text-sm"><IconArrowLeft /> Back</button>
                
                <div className="flex gap-2">
                    <button onClick={handleMarketSearch} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg">
                        <IconChart /> Market
                    </button>
                    
                    {entry.isCustom && (
                        <button onClick={() => onSwapSlot(entry)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg">
                            <IconExchange /> Promote
                        </button>
                    )}

                    <button 
                        onClick={handleManualSave} 
                        disabled={!manualUrl && !fanArtUrl && !dreamUrl && !idealUrl && selectedRarity === 'standard'}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg ${!manualUrl && !fanArtUrl && !dreamUrl && !idealUrl && selectedRarity === 'standard' ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                    >
                        <IconSave /> Save
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 bg-slate-800 p-3 rounded-xl border border-slate-700 gap-3 shadow-md">
                <div className="w-full">
                    <div className="flex justify-between items-start">
                         <h2 className="text-lg md:text-xl font-bold flex flex-wrap items-center gap-2 leading-tight">
                            {entry.name.replace(" (Slot)", "")} 
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${entry.isMega ? 'bg-purple-900 text-purple-200' : entry.isTrainer ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-700 text-slate-400'}`}>{entry.isMega ? 'MEGA' : entry.isTrainer ? 'TRAINER' : '#' + entry.displayId}</span>
                            {entry.isCustom && <span className="text-[10px] bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded">EXTRA</span>}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isOwned ? "text-green-400" : binderEntry ? "text-indigo-400" : "text-slate-500"}`}>{isOwned ? "OWNED" : binderEntry ? "HUNTING" : "EMPTY"}</span>
                        {binderEntry?.value && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 border border-green-900/50 bg-green-900/20 px-1.5 py-px rounded">£{binderEntry.value}</span>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center justify-between w-full md:w-auto gap-4 border-t border-slate-700 pt-2 md:pt-0 md:border-0">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-bold uppercase md:hidden">Collected</span>
                        <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 left-0" checked={isOwned} onChange={() => onToggleOwned(entry.key)} />
                            <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-300 ${isOwned ? 'bg-green-400' : 'bg-slate-600'}`}></label>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {!entry.isCustom ? (
                            <button onClick={() => onAddSlot(entry)} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors whitespace-nowrap"><IconPlus /> Slot</button>
                        ) : (
                            <button onClick={() => onRemoveSlot(entry)} className="flex items-center gap-1 bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors whitespace-nowrap"><IconTrash /> Slot</button>
                        )}
                        
                        {!entry.isCustom && !entry.isBase && (
                            <button onClick={() => onDeletePokemon(entry)} className="flex items-center gap-1 bg-red-900/50 hover:bg-red-900 border border-red-800 px-2 py-1 rounded text-[10px] font-bold text-red-200 transition-colors whitespace-nowrap"><IconTrash /> Entry</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 flex flex-col items-center">
                    <div className={`p-1.5 rounded-xl border relative group cursor-pointer overflow-hidden transition-all duration-300 ${selectedRarity === "MEGA" ? "rarity-mega bg-slate-800" : selectedRarity === "EX" ? "rarity-ex bg-slate-800" : selectedRarity === "GX" ? "rarity-gx bg-slate-800" : selectedRarity === "V" ? "rarity-v bg-slate-800" : selectedRarity === "VMAX" ? "rarity-vmax bg-slate-800" : selectedRarity === "VSTAR" ? "rarity-vstar bg-slate-800" : "border-slate-700 bg-slate-800 shadow-2xl"}`} onClick={() => setShowImagePreview(true)}>
                        <img src={displayImage} alt={entry.name} className="w-full rounded-lg object-contain transition-transform duration-300 group-hover:scale-[1.02]" style={{ maxHeight: '450px' }} onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg"; }} />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"><div className="bg-white/20 p-3 rounded-full backdrop-blur-sm text-white"><IconZoom /></div></div>
                        {showingFanArt && <div className="absolute top-4 left-4 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg font-bold fan-art-badge z-10"><IconPalette /> FAN ART</div>}
                        {showingDream && <div className="absolute top-4 left-4 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg font-bold dream-badge z-10"><IconStar /> DREAM</div>}
                        {showingIdeal && <div className="absolute top-4 left-4 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg font-bold ideal-badge z-10"><IconSparkles /> IDEAL</div>}
                        {binderEntry && <div className={`absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-lg border z-10 ${isOwned ? 'bg-green-600 text-white border-green-400' : 'bg-indigo-600 text-white border-indigo-400'}`}>{isOwned ? "IN COLLECTION" : "TARGET"}</div>}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><IconZoom /> Tap image to enlarge</p>
                </div>

                <div className="w-full md:w-2/3">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-slate-300 uppercase tracking-wider"><IconImage /> Card Details</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                            <div className="sm:col-span-2">
                                <label className="block text-[10px] text-slate-400 mb-1 font-bold">CARD NAME</label>
                                <input type="text" className="w-full glass-input rounded px-3 py-2 text-white text-base md:text-sm" value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="e.g. Charizard..." />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-400 mb-1 font-bold">VALUE (£)</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-2.5 text-slate-500 text-xs"><IconPound /></div>
                                    <input type="text" className="w-full glass-input rounded pl-8 pr-3 py-2 text-white font-mono text-base md:text-sm" value={manualValue} onChange={(e) => setManualValue(e.target.value)} placeholder="0.00" />
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="block text-[10px] text-slate-400 mb-2 font-bold">BADGE TYPE</label>
                            <div className="flex flex-wrap gap-2">
                                {["standard", "EX", "GX", "V", "VMAX", "VSTAR", "MEGA"].map(r => (
                                    <button key={r} onClick={() => setSelectedRarity(r)} className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${selectedRarity === r ? `bg-slate-600 border-${r === 'standard' ? 'slate' : 'emerald'}-400 shadow-lg` : "bg-slate-800 text-slate-500 border-slate-700"}`}>{r.toUpperCase()}</button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] text-slate-400 mb-1 font-bold">REAL CARD IMAGE</label>
                                <div className="flex gap-2">
                                    <input type="text" className="w-full glass-input rounded px-3 py-2 text-white font-mono text-base md:text-xs" value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} placeholder="Paste REAL card link..." />
                                    <button onClick={() => handlePaste(setManualUrl)} className="bg-slate-700 hover:bg-slate-600 px-2 rounded text-slate-300"><IconClipboard /></button>
                                    <button onClick={() => setManualUrl('')} className="bg-slate-700 hover:bg-slate-600 px-2 rounded text-slate-300"><IconX /></button>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowExtraUrls(!showExtraUrls)} 
                                className="w-full py-2 bg-slate-900/50 hover:bg-slate-900 rounded-lg text-xs font-bold text-indigo-300 transition-colors border border-slate-800 flex items-center justify-center gap-2"
                            >
                                {showExtraUrls ? <IconMinimize /> : <IconMaximize />} {showExtraUrls ? "Hide" : "Show"} Advanced Image Options
                            </button>
                            
                            {showExtraUrls && (
                                <div className="space-y-3 animate-zoom bg-slate-900/30 p-3 rounded-lg border border-slate-800">
                                    <div>
                                        <label className="block text-[10px] text-cyan-400 mb-1 font-bold flex items-center gap-1"><IconSparkles size={10} /> IDEAL / ART URL</label>
                                        <div className="flex gap-2">
                                            <input type="text" className="w-full glass-input rounded px-3 py-2 text-white font-mono text-base md:text-xs border-cyan-900/30 focus:border-cyan-500" value={idealUrl} onChange={(e) => setIdealUrl(e.target.value)} placeholder="Paste ART link..." />
                                            <button onClick={() => handlePaste(setIdealUrl)} className="bg-slate-700 hover:bg-slate-600 px-2 rounded text-slate-300"><IconClipboard /></button>
                                            <button onClick={() => setIdealUrl('')} className="bg-slate-700 hover:bg-slate-600 px-2 rounded text-slate-300"><IconX /></button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] text-amber-400 mb-1 font-bold flex items-center gap-1"><IconStar size={10} /> DREAM / CHASE URL</label>
                                        <div className="flex gap-2">
                                            <input type="text" className="w-full glass-input rounded px-3 py-2 text-white font-mono text-base md:text-xs border-amber-900/30 focus:border-amber-500" value={dreamUrl} onChange={(e) => setDreamUrl(e.target.value)} placeholder="Paste CHASE link..." />
                                            <button onClick={() => handlePaste(setDreamUrl)} className="bg-slate-700 hover:bg-slate-600 px-2 rounded text-slate-300"><IconClipboard /></button>
                                            <button onClick={() => setDreamUrl('')} className="bg-slate-700 hover:bg-slate-600 px-2 rounded text-slate-300"><IconX /></button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] text-pink-400 mb-1 font-bold flex items-center gap-1"><IconPalette size={10} /> FAN ART URL</label>
                                        <div className="flex gap-2">
                                            <input type="text" className="w-full glass-input rounded px-3 py-2 text-white font-mono text-base md:text-xs border-pink-900/30 focus:border-pink-500" value={fanArtUrl} onChange={(e) => setFanArtUrl(e.target.value)} placeholder="Paste FAN ART link..." />
                                            <button onClick={() => handlePaste(setFanArtUrl)} className="bg-slate-700 hover:bg-slate-600 px-2 rounded text-slate-300"><IconClipboard /></button>
                                            <button onClick={() => setFanArtUrl('')} className="bg-slate-700 hover:bg-slate-600 px-2 rounded text-slate-300"><IconX /></button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 p-3 border border-slate-700 rounded-xl bg-slate-900/50 flex flex-wrap gap-2 items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-400">Search Images:</h4>
                        <div className="flex gap-2 text-[10px] font-bold">
                            <a href={`https://www.google.com/search?tbm=isch&q=${entry.name}+pokemon+card`} target="_blank" rel="noreferrer" className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-indigo-300 transition-colors">Google</a>
                            <a href={`https://www.tcgplayer.com/search/pokemon/product?productLineName=pokemon&q=${entry.name}&view=grid`} target="_blank" rel="noreferrer" className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-indigo-300 transition-colors">TCGPlayer</a>
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleManualSave} 
                className={`w-full mt-4 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 text-sm uppercase tracking-widest transition-all ${manualUrl || fanArtUrl || dreamUrl || idealUrl || selectedRarity !== 'standard' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-700'}`} 
                disabled={!manualUrl && !fanArtUrl && !dreamUrl && !idealUrl && selectedRarity === 'standard'}
            >
                <IconSave /> Save Entry
            </button>
        </div>
    );
};