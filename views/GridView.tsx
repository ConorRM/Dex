import React, { useMemo } from 'react';
import { PokemonEntry, BinderState, FilterSettings } from '../types';
import { getDefaultImage } from '../utils';
import { WOTC_BASE_MAP } from '../constants';
import { IconCheck, IconPalette, IconPlus, IconSparkles, IconStar } from '../components/Icons';

interface GridViewProps {
    entries: PokemonEntry[];
    searchQuery: string;
    binder: BinderState;
    gridColumns: number;
    filterSettings: FilterSettings;
    onSelect: (entry: PokemonEntry) => void;
    onToggleOwned: (key: string) => void;
    onOpenAddModal: () => void;
}

export const GridView: React.FC<GridViewProps> = ({ entries, searchQuery, binder, gridColumns, onSelect, onOpenAddModal, filterSettings, onToggleOwned }) => {
    const filteredList = useMemo(() => {
        return entries.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.displayId.includes(searchQuery);
            if (!matchesSearch) return false;
            
            const cardData = binder[p.key];
            const isOwned = cardData?.owned || false;

            if (isOwned && !filterSettings.showOwned) return false;
            if (!isOwned && !filterSettings.showNotOwned) return false;

            if (p.isBase) return true;
            
            const rarity = cardData?.cardType || "standard";
            
            if (rarity === "MEGA") return filterSettings.showMEGA;
            if (rarity === "EX") return filterSettings.showEX;
            if (rarity === "GX") return filterSettings.showGX;
            if (rarity === "V") return filterSettings.showV;
            if (rarity === "VMAX") return filterSettings.showVMAX;
            if (rarity === "VSTAR") return filterSettings.showVSTAR;
            if (rarity === "standard") return filterSettings.showStandard;
            
            return true;
        });
    }, [searchQuery, entries, binder, filterSettings]);

    return (
        <div className={`grid ${gridColumns === 0 ? 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : `grid-cols-${gridColumns}`} gap-3 md:gap-6`}>
            {filteredList.map((entry, index) => {
                const customCard = binder[entry.key];
                const isOwned = customCard && customCard.owned;
                let imageSrc = getDefaultImage(entry);
                const hasRealUrl = customCard && customCard.url;
                
                const prevEntry = filteredList[index - 1];
                const nextEntry = filteredList[index + 1];

                const isTrainerBlockStart = entry.isTrainer && (!prevEntry || !prevEntry.isTrainer);
                const isTrainerBlockEnd = entry.isTrainer && (!nextEntry || !nextEntry.isTrainer);

                const hasFanArt = customCard && customCard.fanArtUrl;
                const hasDream = customCard && customCard.dreamUrl;
                const hasIdeal = customCard && customCard.idealUrl;
                
                let showingFanArt = false;
                let showingDream = false;
                let showingIdeal = false;
                
                if (filterSettings.show1999 && WOTC_BASE_MAP[entry.apiId]) {
                    imageSrc = `https://images.pokemontcg.io/base1/${WOTC_BASE_MAP[entry.apiId]}_hires.png`;
                } else if (filterSettings.showBase151 && entry.isBase && entry.apiId <= 151) {
                    imageSrc = `https://images.pokemontcg.io/sv3pt5/${entry.apiId}_hires.png`;
                } else {
                    if (hasIdeal && filterSettings.showIdeal) {
                        imageSrc = customCard.idealUrl;
                        showingIdeal = true;
                    } else if (hasDream && filterSettings.showDream) {
                        imageSrc = customCard.dreamUrl;
                        showingDream = true;
                    } else if (hasFanArt && filterSettings.showClown) { 
                        imageSrc = customCard.fanArtUrl; 
                        showingFanArt = true; 
                    } else if (hasRealUrl) {
                        imageSrc = customCard.url;
                    } else {
                        if (hasIdeal) { imageSrc = customCard.idealUrl; showingIdeal = true; }
                        else if (hasDream) { imageSrc = customCard.dreamUrl; showingDream = true; }
                        else if (hasFanArt) { imageSrc = customCard.fanArtUrl; showingFanArt = true; }
                    }
                }

                if (entry.isCustom && !isOwned && !imageSrc.startsWith("http")) imageSrc = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTQwIiBmaWxsPSIjMWUxZTFlIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI1MCIgeT0iNzAiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM1NTUiIHN0eWxlPSJmb250LXNpemU6MTJweCI+RW1wdHkgU2xvdDwvdGV4dD48L3N2Zz4=';
               
                const rarity = customCard?.cardType || "standard";
                let cardBorderClass = "border-slate-700";
                let badgeClass = "bg-black/60 text-yellow-400";
                let badgeText = '#' + entry.displayId;

                if (rarity === "MEGA") { cardBorderClass = "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"; badgeClass = "bg-gradient-to-br from-purple-800 to-purple-500 text-white"; badgeText = "MEGA"; } 
                else if (rarity === "EX") { cardBorderClass = "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"; badgeClass = "bg-gradient-to-br from-emerald-800 to-emerald-500 text-white"; badgeText = "EX"; } 
                else if (rarity === "GX") { cardBorderClass = "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]"; badgeClass = "bg-gradient-to-br from-cyan-800 to-cyan-500 text-white"; badgeText = "GX"; } 
                else if (rarity === "V") { cardBorderClass = "border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.4)]"; badgeClass = "bg-gradient-to-br from-slate-700 to-slate-400 text-white"; badgeText = "V"; } 
                else if (rarity === "VMAX") { cardBorderClass = "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"; badgeClass = "bg-gradient-to-br from-rose-800 to-rose-500 text-white"; badgeText = "VMAX"; } 
                else if (rarity === "VSTAR") { cardBorderClass = "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]"; badgeClass = "bg-gradient-to-br from-yellow-800 to-yellow-500 text-white shadow-sm"; badgeText = "VSTAR"; } 
                else if (entry.isMega) { cardBorderClass = "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"; badgeClass = "bg-purple-600 text-white"; badgeText = "MEGA"; }
                else if (entry.isTrainer) { badgeClass = "bg-indigo-900 text-indigo-200"; badgeText = "TRAINER"; cardBorderClass = "border-indigo-900"; }

                if (isOwned && rarity === "standard" && !entry.isMega) cardBorderClass = "border-green-500";
                else if (entry.isCustom && rarity === "standard") cardBorderClass = "border-dashed border-blue-400";

                return (
                    <React.Fragment key={entry.key}>
                        {isTrainerBlockStart && (
                            <div className="col-span-full flex items-center justify-center opacity-50 my-4">
                                <div className="w-full h-px bg-[repeating-linear-gradient(90deg,#6366f1_0,#6366f1_4px,transparent_4px,transparent_12px)]"></div>
                            </div>
                        )}

                        <div id={`poke-card-${entry.key}`} onClick={() => onSelect(entry)} className={`group relative bg-slate-800 rounded-lg overflow-hidden cursor-pointer border hover:-translate-y-1 transition-all duration-200 ${cardBorderClass}`}>
                            <div className={`absolute top-1 left-1 z-10 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${badgeClass}`}>{badgeText}</div>
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); onToggleOwned(entry.key); }}
                                className={`absolute top-1 right-1 z-20 rounded-full p-1.5 transition-colors shadow-lg border border-transparent ${isOwned ? "bg-green-600 text-white" : "bg-slate-900/80 text-slate-500 hover:text-white hover:bg-slate-700"}`}
                            >
                                <IconCheck />
                            </button>

                            {!isOwned && entry.isCustom && <div className="absolute top-8 right-2 z-10 text-slate-500 text-[10px] font-bold">EXTRA</div>}
                            
                            {showingFanArt && !filterSettings.showBase151 && !filterSettings.show1999 && <div className="absolute bottom-1 right-1 z-10 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg font-bold bg-gradient-to-br from-pink-500 to-pink-700 animate-pulse"><IconPalette size={10} /> ART</div>}
                            {showingDream && !filterSettings.showBase151 && !filterSettings.show1999 && <div className="absolute bottom-1 right-1 z-10 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg font-bold bg-gradient-to-br from-amber-500 to-amber-700 animate-pulse"><IconStar size={10} /> DREAM</div>}
                            {showingIdeal && !filterSettings.showBase151 && !filterSettings.show1999 && <div className="absolute bottom-1 right-1 z-10 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg font-bold bg-gradient-to-br from-cyan-500 to-cyan-700 animate-pulse"><IconSparkles size={10} /> IDEAL</div>}

                            <div className="aspect-[2.5/3.5] bg-slate-900 relative">
                                <img 
                                    src={imageSrc} 
                                    alt={entry.name} 
                                    className="w-full h-full object-contain p-1" 
                                    loading="lazy" 
                                    onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg"; }} 
                                />
                            </div>
                            <div className={`p-2 text-center ${entry.isMega || rarity !== "standard" ? 'bg-gradient-to-t from-slate-900 to-slate-800' : 'bg-slate-800'}`}>
                                <h3 className={`font-bold text-xs md:text-sm truncate ${entry.isMega ? 'text-purple-300' : rarity !== "standard" ? 'text-white' : 'text-white'}`}>
                                    {entry.name.replace(" (Slot)", "")}
                                    {entry.isCustom && <span className="text-blue-400 ml-1 text-[10px] uppercase"></span>}
                                </h3>
                            </div>
                        </div>

                        {isTrainerBlockEnd && (
                            <div className="col-span-full flex items-center justify-center opacity-50 my-4">
                                <div className="w-full h-px bg-[repeating-linear-gradient(90deg,#6366f1_0,#6366f1_4px,transparent_4px,transparent_12px)]"></div>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}

            {!searchQuery && (
                <div onClick={onOpenAddModal} className="group relative bg-slate-800/50 rounded-lg overflow-hidden cursor-pointer border border-dashed border-green-400 flex flex-col items-center justify-center text-green-400 gap-2 aspect-[2.5/3.5] hover:bg-slate-800 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all"><IconPlus /></div>
                    <span className="text-sm font-bold text-center px-4">Add Entry</span>
                </div>
            )}
        </div>
    );
};