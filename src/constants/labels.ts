import {
  TrancheAge,
  NiveauDiplome,
  CouleurCheveux,
  CouleurYeux,
  Fumeur,
  Situation,
  FrequenceSport,
  Enfants,
  Logement,
  Animaux,
  Ville,
} from '../types';

export const AGE_LABELS: Record<TrancheAge, string> = {
  '18_24': '18–24 ans',
  '25_34': '25–34 ans',
  '35_44': '35–44 ans',
  '45_54': '45–54 ans',
  '55_64': '55–64 ans',
};

export const DIPLOME_LABELS: Record<NiveauDiplome, string> = {
  sans_diplome: 'Sans diplôme',
  brevet: 'Brevet',
  cap_bep: 'CAP / BEP',
  bac: 'Bac',
  bac_plus_2: 'Bac +2',
  bac_plus_3_4: 'Bac +3/4',
  bac_plus_5_plus: 'Bac +5+',
};

export const CHEVEUX_LABELS: Record<CouleurCheveux, string> = {
  brun: 'Brun',
  chatain: 'Châtain',
  blond: 'Blond',
  roux: 'Roux',
  noir: 'Noir',
  gris_blanc: 'Gris / Blanc',
};

export const YEUX_LABELS: Record<CouleurYeux, string> = {
  marron: 'Marron',
  bleu: 'Bleu',
  vert: 'Vert',
  noisette: 'Noisette',
  gris: 'Gris',
};

export const FUMEUR_LABELS: Record<Fumeur, string> = {
  oui: 'Fumeur',
  non: 'Non-fumeur',
};

export const SITUATION_LABELS: Record<Situation, string> = {
  celibataire: 'Célibataire',
  en_couple: 'En couple',
  marie: 'Marié(e)',
  divorce: 'Divorcé(e)',
};

export const SPORT_LABELS: Record<FrequenceSport, string> = {
  jamais: 'Jamais',
  occasionnel: 'Occasionnel',
  regulier: 'Régulier',
  intensif: 'Intensif',
};

export const ENFANTS_LABELS: Record<Enfants, string> = {
  aucun: 'Sans enfant',
  en_a: 'A des enfants',
};

export const LOGEMENT_LABELS: Record<Logement, string> = {
  locataire: 'Locataire',
  proprietaire: 'Propriétaire',
  chez_parents: 'Chez ses parents',
  colocation: 'En colocation',
};

export const ANIMAUX_LABELS: Record<Animaux, string> = {
  chien: '🐕 Chien',
  chat: '🐈 Chat',
  aucun: 'Sans animal',
};

export const VILLE_LABELS: Record<Ville, string> = {
  france: '🇫🇷 France entière',
  paris: '🗼 Paris',
  lyon: '🦁 Lyon',
  marseille: '☀️ Marseille',
  toulouse: '🌸 Toulouse',
  bordeaux: '🍷 Bordeaux',
  nantes: '🐘 Nantes',
  lille: '🌻 Lille',
  nice: '🌊 Nice',
  strasbourg: '🎄 Strasbourg',
};

export const TRANCHES_TAILLE = [
  { label: '< 160 cm', min: 0, max: 159 },
  { label: '160–165', min: 160, max: 165 },
  { label: '165–170', min: 165, max: 170 },
  { label: '170–175', min: 170, max: 175 },
  { label: '175–180', min: 175, max: 180 },
  { label: '180–185', min: 180, max: 185 },
  { label: '185–190', min: 185, max: 190 },
  { label: '> 190 cm', min: 190, max: 999 },
] as const;

export const TRANCHES_SALAIRE = [
  { label: '< 1 500 €', min: 0, max: 1500 },
  { label: '1 500–2 000 €', min: 1500, max: 2000 },
  { label: '2 000–2 500 €', min: 2000, max: 2500 },
  { label: '2 500–3 000 €', min: 2500, max: 3000 },
  { label: '3 000–4 000 €', min: 3000, max: 4000 },
  { label: '4 000–5 000 €', min: 4000, max: 5000 },
  { label: '> 5 000 €', min: 5000, max: 999999 },
] as const;
