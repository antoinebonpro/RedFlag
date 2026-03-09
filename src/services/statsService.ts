import {
  Genre,
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
  Alcool,
  Tatouage,
  Vehicule,
  Ville,
} from '../types';

// ============================================================
//  POPULATION PAR VILLE — INSEE 2023 (18-64 ans)
// ============================================================

// Populations 18-64 ans par aire d'attraction — INSEE RP 2021
// France : 40,1 M adultes 18-64 (H 19,5 M / F 20,6 M) — corr. depuis total pop.
// Villes  : part 18-64 ≈ 60 % de la population de l'aire d'attraction
const POPULATION_VILLE: Record<Ville, Record<Genre, number>> = {
  france:      { homme: 19_500_000, femme: 20_600_000 }, // INSEE RP 2021 — 18-64 ans
  paris:       { homme: 3_600_000,  femme: 3_900_000  }, // Île-de-France 18-64 — INSEE 2021
  lyon:        { homme: 400_000,    femme: 430_000    }, // Métropole Lyon 18-64 — INSEE 2021
  marseille:   { homme: 540_000,    femme: 560_000    }, // Aix-Marseille-Prov. 18-64
  toulouse:    { homme: 415_000,    femme: 435_000    }, // Toulouse aire att. 18-64
  bordeaux:    { homme: 370_000,    femme: 390_000    }, // Bordeaux métro 18-64
  nantes:      { homme: 295_000,    femme: 315_000    }, // Nantes métro 18-64
  lille:       { homme: 350_000,    femme: 370_000    }, // Métropole Lille 18-64
  nice:        { homme: 178_000,    femme: 192_000    }, // Nice Côte d'Azur 18-64
  strasbourg:  { homme: 145_000,    femme: 155_000    }, // Eurométropole Stras. 18-64
};

export function getPopulationVille(ville: Ville, genre: Genre): number {
  return POPULATION_VILLE[ville][genre];
}

// ============================================================
//  ÂGE — INSEE Pyramide des âges 2024
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
    sans_diplome:   0.12,
    brevet:         0.06,
    cap_bep:        0.22,
    bac:            0.16,
    bac_plus_2:     0.13,
    bac_plus_3_4:   0.13,
    bac_plus_5_plus:0.18,
  },
  femme: {
    sans_diplome:   0.11,
    brevet:         0.06,
    cap_bep:        0.17,
    bac:            0.17,
    bac_plus_2:     0.13,
    bac_plus_3_4:   0.16,
    bac_plus_5_plus:0.20,
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
    brun:      0.25,
    chatain:   0.30,
    blond:     0.15,
    roux:      0.04,
    noir:      0.12,
    gris_blanc:0.14,
  },
  femme: {
    brun:      0.22,
    chatain:   0.32,
    blond:     0.20,
    roux:      0.05,
    noir:      0.11,
    gris_blanc:0.10,
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
    marron:  0.58,
    bleu:    0.22,
    vert:    0.09,
    noisette:0.07,
    gris:    0.04,
  },
  femme: {
    marron:  0.61,
    bleu:    0.19,
    vert:    0.11,
    noisette:0.06,
    gris:    0.03,
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
    en_couple:   0.15,
    marie:       0.40,
    divorce:     0.07,
  },
  femme: {
    celibataire: 0.30,
    en_couple:   0.15,
    marie:       0.42,
    divorce:     0.13,
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
    jamais:     0.28,
    occasionnel:0.25,
    regulier:   0.30,
    intensif:   0.17,
  },
  femme: {
    jamais:     0.35,
    occasionnel:0.28,
    regulier:   0.27,
    intensif:   0.10,
  },
};

export function getProbabiliteSport(
  genre: Genre,
  sport: FrequenceSport,
): number {
  return SPORT_DISTRIBUTION[genre][sport];
}

// ============================================================
//  ENFANTS — INSEE 2021 (adultes 18-64 ans)
// ============================================================

const ENFANTS_DISTRIBUTION: Record<Genre, Record<Enfants, number>> = {
  homme: {
    aucun: 0.40,
    en_a:  0.60,
  },
  femme: {
    aucun: 0.35,
    en_a:  0.65,
  },
};

export function getProbabiliteEnfants(genre: Genre, enfants: Enfants): number {
  return ENFANTS_DISTRIBUTION[genre][enfants];
}

// ============================================================
//  LOGEMENT — INSEE 2023 (adultes 18-64 ans)
// ============================================================

const LOGEMENT_DISTRIBUTION: Record<Genre, Record<Logement, number>> = {
  homme: {
    proprietaire: 0.43,
    locataire:    0.41,
    chez_parents: 0.11,
    colocation:   0.05,
  },
  femme: {
    proprietaire: 0.41,
    locataire:    0.44,
    chez_parents: 0.09,
    colocation:   0.06,
  },
};

export function getProbabiliteLogement(genre: Genre, logement: Logement): number {
  return LOGEMENT_DISTRIBUTION[genre][logement];
}

// ============================================================
//  ANIMAUX — FACCO / GfK 2023
// ============================================================

const ANIMAUX_DISTRIBUTION: Record<Genre, Record<Animaux, number>> = {
  homme: {
    chien: 0.20,
    chat:  0.28,
    aucun: 0.52,
  },
  femme: {
    chien: 0.22,
    chat:  0.33,
    aucun: 0.45,
  },
};

export function getProbabiliteAnimaux(genre: Genre, animaux: Animaux): number {
  return ANIMAUX_DISTRIBUTION[genre][animaux];
}

// ============================================================
//  ALCOOL — SPF Baromètre santé 2023
// ============================================================

const ALCOOL_DISTRIBUTION: Record<Genre, Record<Alcool, number>> = {
  homme: {
    jamais:      0.15,
    occasionnel: 0.55,
    regulier:    0.30,
  },
  femme: {
    jamais:      0.27,
    occasionnel: 0.56,
    regulier:    0.17,
  },
};

export function getProbabiliteAlcool(genre: Genre, alcool: Alcool): number {
  return ALCOOL_DISTRIBUTION[genre][alcool];
}

// ============================================================
//  TATOUAGE — IFOP 2023 (18-64 ans)
//  ~33% des 18-35 ans, ~18% global adulte
// ============================================================

const TATOUAGE_DISTRIBUTION: Record<Genre, Record<Tatouage, number>> = {
  homme: {
    aucun: 0.80,
    en_a:  0.20,
  },
  femme: {
    aucun: 0.74,
    en_a:  0.26,
  },
};

export function getProbabiliteTatouage(genre: Genre, tatouage: Tatouage): number {
  return TATOUAGE_DISTRIBUTION[genre][tatouage];
}

// ============================================================
//  PERMIS / VÉHICULE — SDES / INSEE 2022
//  81% des adultes ont le permis, 77% ont un véhicule
// ============================================================

const VEHICULE_DISTRIBUTION: Record<Genre, Record<Vehicule, number>> = {
  homme: {
    sans_permis:          0.12,
    permis_sans_vehicule: 0.07,
    avec_vehicule:        0.81,
  },
  femme: {
    sans_permis:          0.20,
    permis_sans_vehicule: 0.10,
    avec_vehicule:        0.70,
  },
};

export function getProbabiliteVehicule(genre: Genre, vehicule: Vehicule): number {
  return VEHICULE_DISTRIBUTION[genre][vehicule];
}
