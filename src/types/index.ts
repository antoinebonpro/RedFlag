export type Genre = 'homme' | 'femme';

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
}

export type TrancheAge =
  | '18_24'
  | '25_34'
  | '35_44'
  | '45_54'
  | '55_64';

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

export type CouleurYeux =
  | 'marron'
  | 'bleu'
  | 'vert'
  | 'noisette'
  | 'gris';

export type Fumeur = 'oui' | 'non';

export type Situation =
  | 'celibataire'
  | 'en_couple'
  | 'marie'
  | 'divorce';

export type FrequenceSport =
  | 'jamais'
  | 'occasionnel'
  | 'regulier'
  | 'intensif';

export interface ResultatCalcul {
  pourcentage: number;
  nombre: number;
  details: DetailCritere[];
}

export interface DetailCritere {
  label: string;
  pourcentage: number;
  source: string;
}

export interface SourceStat {
  critere: string;
  source: string;
  annee: string;
  url: string;
  note: string;
}
