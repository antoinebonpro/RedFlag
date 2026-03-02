import {
  Genre,
  TrancheAge,
  NiveauDiplome,
  CouleurCheveux,
  CouleurYeux,
  Fumeur,
  Situation,
  FrequenceSport,
} from '../types';

// ============================================================
//  POPULATION — INSEE Bilan démographique 2024
// ============================================================

const POPULATION_HOMMES = 33_200_000;
const POPULATION_FEMMES = 35_200_000;

export function getPopulationGenre(genre: Genre): number {
  return genre === 'homme' ? POPULATION_HOMMES : POPULATION_FEMMES;
}

// ============================================================
//  ÂGE — INSEE Pyramide des âges 2024
//  Part de chaque tranche parmi les 18-64 ans, par sexe
// ============================================================

const AGE_DISTRIBUTION: Record<Genre, Record<TrancheAge, number>> = {
  homme: {
    '18_24': 0.14,
    '25_34': 0.20,
    '35_44': 0.21,
    '45_54': 0.22,
    '55_64': 0.23,
  },
  femme: {
    '18_24': 0.13,
    '25_34': 0.19,
    '35_44': 0.21,
    '45_54': 0.23,
    '55_64': 0.24,
  },
};

export function getProbabiliteAge(genre: Genre, tranche: TrancheAge): number {
  return AGE_DISTRIBUTION[genre][tranche];
}

// ============================================================
//  TAILLE — DREES 2023
//  Distribution normale : H μ=176 σ=7 | F μ=163 σ=6.5
// ============================================================

const TAILLE_STATS: Record<Genre, { moyenne: number; ecartType: number }> = {
  homme: { moyenne: 176, ecartType: 7 },
  femme: { moyenne: 163, ecartType: 6.5 },
};

function cumulativeNormal(x: number, mean: number, std: number): number {
  const z = (x - mean) / std;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327;
  const p =
    d *
    Math.exp((-z * z) / 2) *
    (t *
      (0.31938153 +
        t *
          (-0.356563782 +
            t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))));
  return z > 0 ? 1 - p : p;
}

export function getProbabiliteTaille(
  genre: Genre,
  min: number,
  max: number,
): number {
  const { moyenne, ecartType } = TAILLE_STATS[genre];
  const pMin = min <= 100 ? 0 : cumulativeNormal(min, moyenne, ecartType);
  const pMax = max >= 250 ? 1 : cumulativeNormal(max, moyenne, ecartType);
  return Math.max(0, pMax - pMin);
}

// ============================================================
//  DIPLÔME — INSEE 2021 (population 25-64 ans par sexe)
// ============================================================

const DIPLOME_DISTRIBUTION: Record<Genre, Record<NiveauDiplome, number>> = {
  homme: {
    sans_diplome: 0.12,
    brevet: 0.06,
    cap_bep: 0.22,
    bac: 0.16,
    bac_plus_2: 0.13,
    bac_plus_3_4: 0.13,
    bac_plus_5_plus: 0.18,
  },
  femme: {
    sans_diplome: 0.11,
    brevet: 0.06,
    cap_bep: 0.17,
    bac: 0.17,
    bac_plus_2: 0.13,
    bac_plus_3_4: 0.16,
    bac_plus_5_plus: 0.20,
  },
};

export function getProbabiliteDiplome(
  genre: Genre,
  diplome: NiveauDiplome,
): number {
  return DIPLOME_DISTRIBUTION[genre][diplome];
}

// ============================================================
//  COULEUR DE CHEVEUX — Études anthropologiques européennes 2019
// ============================================================

const CHEVEUX_DISTRIBUTION: Record<Genre, Record<CouleurCheveux, number>> = {
  homme: {
    brun: 0.25,
    chatain: 0.30,
    blond: 0.15,
    roux: 0.04,
    noir: 0.12,
    gris_blanc: 0.14,
  },
  femme: {
    brun: 0.22,
    chatain: 0.32,
    blond: 0.20,
    roux: 0.05,
    noir: 0.11,
    gris_blanc: 0.10,
  },
};

export function getProbabiliteCheveux(
  genre: Genre,
  couleur: CouleurCheveux,
): number {
  return CHEVEUX_DISTRIBUTION[genre][couleur];
}

// ============================================================
//  COULEUR DES YEUX — INED 2020
// ============================================================

const YEUX_DISTRIBUTION: Record<Genre, Record<CouleurYeux, number>> = {
  homme: {
    marron: 0.58,
    bleu: 0.22,
    vert: 0.09,
    noisette: 0.07,
    gris: 0.04,
  },
  femme: {
    marron: 0.61,
    bleu: 0.19,
    vert: 0.11,
    noisette: 0.06,
    gris: 0.03,
  },
};

export function getProbabiliteYeux(
  genre: Genre,
  couleur: CouleurYeux,
): number {
  return YEUX_DISTRIBUTION[genre][couleur];
}

// ============================================================
//  SALAIRE NET MENSUEL — INSEE 2022
//  Distribution log-normale : H médiane=2100 | F médiane=1800
// ============================================================

const SALAIRE_STATS: Record<Genre, { mediane: number; ecartType: number }> = {
  homme: { mediane: 2100, ecartType: 0.55 },
  femme: { mediane: 1800, ecartType: 0.50 },
};

export function getProbabiliteSalaire(
  genre: Genre,
  min: number,
  max: number,
): number {
  const { mediane, ecartType } = SALAIRE_STATS[genre];
  const mu = Math.log(mediane);
  const logMin = min <= 0 ? -Infinity : Math.log(min);
  const logMax = max >= 999999 ? Infinity : Math.log(max);
  const pMin =
    logMin === -Infinity ? 0 : cumulativeNormal(logMin, mu, ecartType);
  const pMax =
    logMax === Infinity ? 1 : cumulativeNormal(logMax, mu, ecartType);
  return Math.max(0, pMax - pMin);
}

// ============================================================
//  TABAC — Santé publique France, Baromètre santé 2023
// ============================================================

const FUMEUR_DISTRIBUTION: Record<Genre, Record<Fumeur, number>> = {
  homme: { oui: 0.28, non: 0.72 },
  femme: { oui: 0.23, non: 0.77 },
};

export function getProbabiliteFumeur(genre: Genre, fumeur: Fumeur): number {
  return FUMEUR_DISTRIBUTION[genre][fumeur];
}

// ============================================================
//  SITUATION CONJUGALE — INSEE 2021 (18-64 ans)
// ============================================================

const SITUATION_DISTRIBUTION: Record<Genre, Record<Situation, number>> = {
  homme: {
    celibataire: 0.38,
    en_couple: 0.15,
    marie: 0.40,
    divorce: 0.07,
  },
  femme: {
    celibataire: 0.30,
    en_couple: 0.15,
    marie: 0.42,
    divorce: 0.13,
  },
};

export function getProbabiliteSituation(
  genre: Genre,
  situation: Situation,
): number {
  return SITUATION_DISTRIBUTION[genre][situation];
}

// ============================================================
//  PRATIQUE SPORTIVE — INJEP 2022
// ============================================================

const SPORT_DISTRIBUTION: Record<Genre, Record<FrequenceSport, number>> = {
  homme: {
    jamais: 0.28,
    occasionnel: 0.25,
    regulier: 0.30,
    intensif: 0.17,
  },
  femme: {
    jamais: 0.35,
    occasionnel: 0.28,
    regulier: 0.27,
    intensif: 0.10,
  },
};

export function getProbabiliteSport(
  genre: Genre,
  sport: FrequenceSport,
): number {
  return SPORT_DISTRIBUTION[genre][sport];
}
