export interface BinderEntry {
  name: string;
  owned: boolean;
  value: string;
  url: string;
  fanArtUrl: string;
  dreamUrl: string;
  idealUrl: string;
  cardType: string;
}

export interface BinderState {
  [key: string]: BinderEntry;
}

export interface CustomSlotsState {
  [key: string]: string[];
}

export interface PokemonEntry {
  name: string;
  apiId: number;
  key: string;
  displayId: string;
  cardImage?: string;
  isMega: boolean;
  isBase: boolean;
  isTrainer: boolean;
  isCustom?: boolean;
  _sortWeight?: number;
}

export interface FilterSettings {
  showOwned: boolean;
  showNotOwned: boolean;
  showGen1Only: boolean;
  showBase151: boolean;
  show1999: boolean;
  showSlots: boolean;
  showClown: boolean;
  showDream: boolean;
  showIdeal: boolean;
  showTrainers: boolean;
  showStandard: boolean;
  showEX: boolean;
  showGX: boolean;
  showV: boolean;
  showVMAX: boolean;
  showVSTAR: boolean;
  showMEGA: boolean;
}

export interface GenListEntry {
  id: number;
  name: string;
}