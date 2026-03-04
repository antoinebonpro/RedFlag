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

  if (age) {
    addDetail(AGE_LABELS[age], getProbabiliteAge(genre, age), 'INSEE 2024');
  }

  if (taille) {
    const p = getProbabiliteTaille(genre, taille.min, taille.max);
    addDetail(`${taille.min}–${taille.max} cm`, p, 'DREES 2023');
  }

  if (diplome) {
    addDetail(
      DIPLOME_LABELS[diplome],
      getProbabiliteDiplome(genre, diplome),
      'INSEE 2021',
      `diplome_${diplome}`,
    );
  }

  if (couleurCheveux) {
    addDetail(
      `Cheveux ${CHEVEUX_LABELS[couleurCheveux].toLowerCase()}`,
      getProbabiliteCheveux(genre, couleurCheveux),
      'Études anthro. 2019',
    );
  }

  if (couleurYeux) {
    addDetail(
      `Yeux ${YEUX_LABELS[couleurYeux].toLowerCase()}`,
      getProbabiliteYeux(genre, couleurYeux),
      'INED 2020',
    );
  }

  if (salaire) {
    const p = getProbabiliteSalaire(genre, salaire.min, salaire.max);
    const salaireLabel =
      salaire.max >= 999999
        ? `> ${salaire.min.toLocaleString('fr-FR')} €`
        : `${salaire.min.toLocaleString('fr-FR')}–${salaire.max.toLocaleString('fr-FR')} €`;
    addDetail(salaireLabel, p, 'INSEE 2022', `salaire_${salaire.min}`);
  }

  if (fumeur) {
    addDetail(
      FUMEUR_LABELS[fumeur],
      getProbabiliteFumeur(genre, fumeur),
      'SPF 2023',
      `fumeur_${fumeur}`,
    );
  }

  if (situation) {
    addDetail(
      SITUATION_LABELS[situation],
      getProbabiliteSituation(genre, situation),
      'INSEE 2021',
      `situation_${situation}`,
    );
  }

  if (sport) {
    addDetail(
      SPORT_LABELS[sport],
      getProbabiliteSport(genre, sport),
      'INJEP 2022',
    );
  }

  if (enfants) {
    addDetail(
      ENFANTS_LABELS[enfants],
      getProbabiliteEnfants(genre, enfants),
      'INSEE 2021',
    );
  }

  if (logement) {
    addDetail(
      LOGEMENT_LABELS[logement],
      getProbabiliteLogement(genre, logement),
      'INSEE 2023',
      `logement_${logement}`,
    );
  }

  if (animaux) {
    addDetail(
      ANIMAUX_LABELS[animaux],
      getProbabiliteAnimaux(genre, animaux),
      'FACCO 2023',
    );
  }

  const population = getPopulationVille(ville, genre);
  const nombre = Math.round(population * probabiliteTotale);

  return {
    pourcentage: probabiliteTotale * 100,
    nombre,
    details,
  };
}
