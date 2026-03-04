export type Genre = 'homme' | 'femme';
export type AppMode = 'recherche' | 'profil' | 'couple' | 'historique';
export type Ville =
  | 'france'
  | 'paris'
  | 'lyon'
  | 'marseille'
  | 'toulouse'
  | 'bordeaux'
  | 'nantes'
  | 'lille'
  | 'nice'
  | 'strasbourg';

export interface CriteriaState {
  genre: Genre;
  age: TrancheAge | null;
  tailleIdx: string | null;
  diplome: NiveauDiplome | null;
  cheveux: CouleurCheveux | null;
  yeux: CouleurYeux | null;
  salaireIdx: string | null;
  fumeur: Fumeur | null;
  situation: Situation | null;
  sport: FrequenceSport | null;
  enfants: Enfants | null;
  logement: Logement | null;
  animaux: Animaux | null;
}

export interface CriteriaSelection {
  genre: Genre;
  age: TrancheAge | null;
  taille: { min: number; max: number } | null;
  diplome: NiveauDiplome | null;
  couleurCheveux: CouleurCheveux | null;
  couleurYeux: CouleurYeux | null;
  salaire: { min: number; max: number } | null;
  fumeur: Fumeur | null;
  situation: Situation | null;
  sport: FrequenceSport | null;
  enfants: Enfants | null;
  logement: Logement | null;
  animaux: Animaux | null;
}

export type TrancheAge = '18_24' | '25_34' | '35_44' | '45_54' | '55_64';

export type NiveauDiplome =
  | 'sans_diplome'
  | 'brevet'
  | 'cap_bep'
  | 'bac'
  | 'bac_plus_2'
  | 'bac_plus_3_4'
  | 'bac_plus_5_plus';

export type CouleurCheveux =
  | 'brun'
  | 'chatain'
  | 'blond'
  | 'roux'
  | 'noir'
  | 'gris_blanc';

export type CouleurYeux = 'marron' | 'bleu' | 'vert' | 'noisette' | 'gris';
export type Fumeur = 'oui' | 'non';
export type Situation = 'celibataire' | 'en_couple' | 'marie' | 'divorce';
export type FrequenceSport = 'jamais' | 'occasionnel' | 'regulier' | 'intensif';
export type Enfants = 'aucun' | 'en_a';
export type Logement = 'locataire' | 'proprietaire' | 'chez_parents' | 'colocation';
export type Animaux = 'chien' | 'chat' | 'aucun';

export interface ResultatCalcul {
  pourcentage: number;
  nombre: number;
  details: DetailCritere[];
}

export interface DetailCritere {
  label: string;
  pourcentage: number;
  source: string;
  isRedFlag?: boolean;
}

export interface SourceStat {
  critere: string;
  source: string;
  annee: string;
  url: string;
  note: string;
}

export interface SavedSearch {
  id: string;
  timestamp: number;
  mode: 'recherche' | 'profil';
  criteria: CriteriaState;
  ville: Ville;
  resultat: ResultatCalcul;
}

export const defaultCriteria = (genre: Genre = 'homme'): CriteriaState => ({
  genre,
  age: null,
  tailleIdx: null,
  diplome: null,
  cheveux: null,
  yeux: null,
  salaireIdx: null,
  fumeur: null,
  situation: null,
  sport: null,
  enfants: null,
  logement: null,
  animaux: null,
});
