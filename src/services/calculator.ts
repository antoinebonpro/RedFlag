import { CriteriaSelection, ResultatCalcul, DetailCritere, Ville } from '../types';
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
} from './statsService';

// Traits considérés comme "red flags" dans le mode profil
const RED_FLAG_KEYS = new Set(['fumeur_oui', 'situation_marie']);

// Génère un label lisible pour une plage de taille
function buildTailleLabel(min: number, max: number): string {
  if (min <= 0) return `< ${max + 1} cm`;
  if (max >= 999) return `> ${min} cm`;
  return `${min}–${max} cm`;
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

  const population = getPopulationVille(ville, genre);
  const nombre = Math.round(population * probabiliteTotale);

  return {
    pourcentage: probabiliteTotale * 100,
    nombre,
    details,
  };
}
