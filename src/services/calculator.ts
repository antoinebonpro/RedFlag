import { CriteriaSelection, ResultatCalcul, DetailCritere, Ville, TrancheRarete, Genre } from '../types';
import {
  AGE_LABELS,
  DIPLOME_LABELS,
  CHEVEUX_LABELS,
  YEUX_LABELS,
  FUMEUR_LABELS,
  SITUATION_LABELS,
  SPORT_LABELS,
  ENFANTS_LABELS,
  LOGEMENT_LABELS,
  ANIMAUX_LABELS,
  ALCOOL_LABELS,
  TATOUAGE_LABELS,
  VEHICULE_LABELS,
} from '../constants/labels';
import {
  getPopulationVille,
  getProbabiliteAge,
  getProbabiliteTaille,
  getProbabiliteDiplome,
  getProbabiliteCheveux,
  getProbabiliteYeux,
  getProbabiliteSalaire,
  getProbabiliteFumeur,
  getProbabiliteSituation,
  getProbabiliteSport,
  getProbabiliteEnfants,
  getProbabiliteLogement,
  getProbabiliteAnimaux,
  getProbabiliteAlcool,
  getProbabiliteTatouage,
  getProbabiliteVehicule,
} from './statsService';

// Traits considérés comme "red flags" dans le mode profil
const RED_FLAG_KEYS = new Set(['fumeur_oui', 'situation_marie']);

// Génère un label lisible pour une plage de taille
function buildTailleLabel(min: number, max: number): string {
  if (min <= 0) return `< ${max + 1} cm`;
  if (max >= 999) return `> ${min} cm`;
  return `${min}–${max} cm`;
}

// Détermine la tranche de rareté en fonction du pourcentage
function getTranche(pourcentage: number): TrancheRarete {
  if (pourcentage >= 30) return 'commun';
  if (pourcentage >= 10) return 'accessible';
  if (pourcentage >= 3)  return 'selectif';
  if (pourcentage >= 0.5) return 'rare';
  if (pourcentage >= 0.05) return 'licorne';
  if (pourcentage >= 0.005) return 'legendaire';
  if (pourcentage >= 0.0005) return 'extraterrestre';
  return 'hors_galaxie';
}

// Calcule la probabilité totale pour un genre donné (sans détails)
function calculerProbabiliteGenre(
  criteria: CriteriaSelection,
  genre: Genre,
  ville: Ville,
): { probabilite: number; nombre: number } {
  const sel = { ...criteria, genre };
  let prob = 1;

  if (sel.age && sel.age.length > 0) {
    prob *= Math.min(sel.age.reduce((s, t) => s + getProbabiliteAge(genre, t), 0), 1);
  }
  if (sel.taille) {
    prob *= getProbabiliteTaille(genre, sel.taille.min, sel.taille.max);
  }
  if (sel.diplome && sel.diplome.length > 0) {
    prob *= Math.min(sel.diplome.reduce((s, d) => s + getProbabiliteDiplome(genre, d), 0), 1);
  }
  if (sel.couleurCheveux && sel.couleurCheveux.length > 0) {
    prob *= Math.min(sel.couleurCheveux.reduce((s, c) => s + getProbabiliteCheveux(genre, c), 0), 1);
  }
  if (sel.couleurYeux && sel.couleurYeux.length > 0) {
    prob *= Math.min(sel.couleurYeux.reduce((s, c) => s + getProbabiliteYeux(genre, c), 0), 1);
  }
  if (sel.salaire) {
    prob *= getProbabiliteSalaire(genre, sel.salaire.min, sel.salaire.max);
  }
  if (sel.fumeur) {
    prob *= getProbabiliteFumeur(genre, sel.fumeur);
  }
  if (sel.situation && sel.situation.length > 0) {
    prob *= Math.min(sel.situation.reduce((s, sit) => s + getProbabiliteSituation(genre, sit), 0), 1);
  }
  if (sel.sport && sel.sport.length > 0) {
    prob *= Math.min(sel.sport.reduce((s, sp) => s + getProbabiliteSport(genre, sp), 0), 1);
  }
  if (sel.enfants) {
    prob *= getProbabiliteEnfants(genre, sel.enfants);
  }
  if (sel.logement && sel.logement.length > 0) {
    prob *= Math.min(sel.logement.reduce((s, l) => s + getProbabiliteLogement(genre, l), 0), 1);
  }
  if (sel.animaux && sel.animaux.length > 0) {
    prob *= Math.min(sel.animaux.reduce((s, a) => s + getProbabiliteAnimaux(genre, a), 0), 1);
  }
  if (sel.alcool) {
    prob *= getProbabiliteAlcool(genre, sel.alcool);
  }
  if (sel.tatouage) {
    prob *= getProbabiliteTatouage(genre, sel.tatouage);
  }
  if (sel.vehicule && sel.vehicule.length > 0) {
    prob *= Math.min(sel.vehicule.reduce((s, v) => s + getProbabiliteVehicule(genre, v), 0), 1);
  }

  const population = getPopulationVille(ville, genre);
  return { probabilite: prob, nombre: Math.round(population * prob) };
}

export function calculerResultat(
  criteria: CriteriaSelection,
  ville: Ville = 'france',
): ResultatCalcul {
  const {
    genre,
    age,
    taille,
    diplome,
    couleurCheveux,
    couleurYeux,
    salaire,
    fumeur,
    situation,
    sport,
    enfants,
    logement,
    animaux,
    alcool,
    tatouage,
    vehicule,
  } = criteria;

  const details: DetailCritere[] = [];
  let probabiliteTotale = 1;

  function addDetail(
    label: string,
    p: number,
    source: string,
    flagKey?: string,
  ) {
    probabiliteTotale *= p;
    details.push({
      label,
      pourcentage: p * 100,
      source,
      isRedFlag: flagKey ? RED_FLAG_KEYS.has(flagKey) || p < 0.08 : false,
    });
  }

  // ── Âge : somme sur les tranches sélectionnées ─────────────
  if (age && age.length > 0) {
    const p = Math.min(
      age.reduce((s, t) => s + getProbabiliteAge(genre, t), 0),
      1,
    );
    const label =
      age.length === 1
        ? AGE_LABELS[age[0]]
        : `${AGE_LABELS[age[0]].split('–')[0]}–${
            AGE_LABELS[age[age.length - 1]].split('–')[1] ?? AGE_LABELS[age[age.length - 1]]
          }`;
    addDetail(label, p, 'INSEE 2024');
  }

  // ── Taille : plage continue ─────────────────────────────────
  if (taille) {
    const p = getProbabiliteTaille(genre, taille.min, taille.max);
    addDetail(buildTailleLabel(taille.min, taille.max), p, 'DREES 2023');
  }

  // ── Diplôme : somme sur les niveaux sélectionnés ───────────
  if (diplome && diplome.length > 0) {
    const p = Math.min(
      diplome.reduce((s, d) => s + getProbabiliteDiplome(genre, d), 0),
      1,
    );
    const label =
      diplome.length === 1
        ? DIPLOME_LABELS[diplome[0]]
        : `${DIPLOME_LABELS[diplome[0]]} → ${DIPLOME_LABELS[diplome[diplome.length - 1]]}`;
    addDetail(
      label,
      p,
      'INSEE 2021',
      diplome.length === 1 ? `diplome_${diplome[0]}` : undefined,
    );
  }

  // ── Cheveux (multi) ─────────────────────────────────────────
  if (couleurCheveux && couleurCheveux.length > 0) {
    const p = Math.min(
      couleurCheveux.reduce((s, c) => s + getProbabiliteCheveux(genre, c), 0),
      1,
    );
    const label =
      couleurCheveux.length === 1
        ? `Cheveux ${CHEVEUX_LABELS[couleurCheveux[0]].toLowerCase()}`
        : `Cheveux ${couleurCheveux
            .map((c) => CHEVEUX_LABELS[c].toLowerCase())
            .join(', ')}`;
    addDetail(label, p, 'Études anthro. 2019');
  }

  // ── Yeux (multi) ────────────────────────────────────────────
  if (couleurYeux && couleurYeux.length > 0) {
    const p = Math.min(
      couleurYeux.reduce((s, c) => s + getProbabiliteYeux(genre, c), 0),
      1,
    );
    const label =
      couleurYeux.length === 1
        ? `Yeux ${YEUX_LABELS[couleurYeux[0]].toLowerCase()}`
        : `Yeux ${couleurYeux.map((c) => YEUX_LABELS[c].toLowerCase()).join(', ')}`;
    addDetail(label, p, 'INED 2020');
  }

  // ── Salaire : plage continue ────────────────────────────────
  if (salaire) {
    const p = getProbabiliteSalaire(genre, salaire.min, salaire.max);
    const salaireLabel =
      salaire.max >= 999999
        ? `> ${salaire.min.toLocaleString('fr-FR')} €`
        : `${salaire.min.toLocaleString('fr-FR')}–${salaire.max.toLocaleString('fr-FR')} €`;
    addDetail(salaireLabel, p, 'INSEE 2022', `salaire_${salaire.min}`);
  }

  // ── Fumeur (unique) ─────────────────────────────────────────
  if (fumeur) {
    addDetail(
      FUMEUR_LABELS[fumeur],
      getProbabiliteFumeur(genre, fumeur),
      'SPF 2023',
      `fumeur_${fumeur}`,
    );
  }

  // ── Situation (multi) ───────────────────────────────────────
  if (situation && situation.length > 0) {
    const p = Math.min(
      situation.reduce((s, sit) => s + getProbabiliteSituation(genre, sit), 0),
      1,
    );
    const label =
      situation.length === 1
        ? SITUATION_LABELS[situation[0]]
        : situation.map((s) => SITUATION_LABELS[s]).join(', ');
    addDetail(
      label,
      p,
      'INSEE 2021',
      situation.length === 1 ? `situation_${situation[0]}` : undefined,
    );
  }

  // ── Sport (multi) ───────────────────────────────────────────
  if (sport && sport.length > 0) {
    const p = Math.min(
      sport.reduce((s, sp) => s + getProbabiliteSport(genre, sp), 0),
      1,
    );
    const label =
      sport.length === 1
        ? SPORT_LABELS[sport[0]]
        : sport.map((s) => SPORT_LABELS[s]).join(', ');
    addDetail(label, p, 'INJEP 2022');
  }

  // ── Enfants (unique) ────────────────────────────────────────
  if (enfants) {
    addDetail(
      ENFANTS_LABELS[enfants],
      getProbabiliteEnfants(genre, enfants),
      'INSEE 2021',
    );
  }

  // ── Logement (multi) ────────────────────────────────────────
  if (logement && logement.length > 0) {
    const p = Math.min(
      logement.reduce((s, l) => s + getProbabiliteLogement(genre, l), 0),
      1,
    );
    const label =
      logement.length === 1
        ? LOGEMENT_LABELS[logement[0]]
        : logement.map((l) => LOGEMENT_LABELS[l]).join(', ');
    addDetail(
      label,
      p,
      'INSEE 2023',
      logement.length === 1 ? `logement_${logement[0]}` : undefined,
    );
  }

  // ── Animaux (multi) ─────────────────────────────────────────
  if (animaux && animaux.length > 0) {
    const p = Math.min(
      animaux.reduce((s, a) => s + getProbabiliteAnimaux(genre, a), 0),
      1,
    );
    const label =
      animaux.length === 1
        ? ANIMAUX_LABELS[animaux[0]]
        : animaux.map((a) => ANIMAUX_LABELS[a]).join(', ');
    addDetail(label, p, 'FACCO 2023');
  }

  // ── Alcool (unique) ─────────────────────────────────────────
  if (alcool) {
    addDetail(
      `Alcool : ${ALCOOL_LABELS[alcool].toLowerCase()}`,
      getProbabiliteAlcool(genre, alcool),
      'SPF 2023',
    );
  }

  // ── Tatouage (unique) ───────────────────────────────────────
  if (tatouage) {
    addDetail(
      TATOUAGE_LABELS[tatouage],
      getProbabiliteTatouage(genre, tatouage),
      'IFOP 2023',
    );
  }

  // ── Véhicule (multi) ───────────────────────────────────────
  if (vehicule && vehicule.length > 0) {
    const p = Math.min(
      vehicule.reduce((s, v) => s + getProbabiliteVehicule(genre, v), 0),
      1,
    );
    const label =
      vehicule.length === 1
        ? VEHICULE_LABELS[vehicule[0]]
        : vehicule.map((v) => VEHICULE_LABELS[v]).join(', ');
    addDetail(label, p, 'SDES 2022');
  }

  const population = getPopulationVille(ville, genre);
  const nombre = Math.round(population * probabiliteTotale);

  // Calcul pour les deux genres
  const resultatHomme = calculerProbabiliteGenre(criteria, 'homme', ville);
  const resultatFemme = calculerProbabiliteGenre(criteria, 'femme', ville);

  const pourcentageFinal = probabiliteTotale * 100;

  return {
    pourcentage: pourcentageFinal,
    nombre,
    details,
    pourcentageHomme: resultatHomme.probabilite * 100,
    pourcentageFemme: resultatFemme.probabilite * 100,
    nombreHomme: resultatHomme.nombre,
    nombreFemme: resultatFemme.nombre,
    tranche: getTranche(pourcentageFinal),
  };
}
