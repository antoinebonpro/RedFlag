import { CriteriaSelection, ResultatCalcul, DetailCritere } from '../types';
import {
  AGE_LABELS,
  DIPLOME_LABELS,
  CHEVEUX_LABELS,
  YEUX_LABELS,
  FUMEUR_LABELS,
  SITUATION_LABELS,
  SPORT_LABELS,
} from '../constants/labels';
import {
  getPopulationGenre,
  getProbabiliteAge,
  getProbabiliteTaille,
  getProbabiliteDiplome,
  getProbabiliteCheveux,
  getProbabiliteYeux,
  getProbabiliteSalaire,
  getProbabiliteFumeur,
  getProbabiliteSituation,
  getProbabiliteSport,
} from './statsService';

export function calculerResultat(criteria: CriteriaSelection): ResultatCalcul {
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
  } = criteria;

  const details: DetailCritere[] = [];
  let probabiliteTotale = 1;

  // Âge
  if (age) {
    const p = getProbabiliteAge(genre, age);
    probabiliteTotale *= p;
    details.push({
      label: AGE_LABELS[age],
      pourcentage: p * 100,
      source: 'INSEE 2024',
    });
  }

  // Taille
  if (taille) {
    const p = getProbabiliteTaille(genre, taille.min, taille.max);
    probabiliteTotale *= p;
    details.push({
      label: `${taille.min}–${taille.max} cm`,
      pourcentage: p * 100,
      source: 'DREES 2023',
    });
  }

  // Diplôme
  if (diplome) {
    const p = getProbabiliteDiplome(genre, diplome);
    probabiliteTotale *= p;
    details.push({
      label: DIPLOME_LABELS[diplome],
      pourcentage: p * 100,
      source: 'INSEE 2021',
    });
  }

  // Cheveux
  if (couleurCheveux) {
    const p = getProbabiliteCheveux(genre, couleurCheveux);
    probabiliteTotale *= p;
    details.push({
      label: `Cheveux ${CHEVEUX_LABELS[couleurCheveux].toLowerCase()}`,
      pourcentage: p * 100,
      source: 'Études anthro. 2019',
    });
  }

  // Yeux
  if (couleurYeux) {
    const p = getProbabiliteYeux(genre, couleurYeux);
    probabiliteTotale *= p;
    details.push({
      label: `Yeux ${YEUX_LABELS[couleurYeux].toLowerCase()}`,
      pourcentage: p * 100,
      source: 'INED 2020',
    });
  }

  // Salaire
  if (salaire) {
    const p = getProbabiliteSalaire(genre, salaire.min, salaire.max);
    probabiliteTotale *= p;
    const salaireLabel =
      salaire.max >= 999999
        ? `> ${salaire.min.toLocaleString('fr-FR')} €`
        : `${salaire.min.toLocaleString('fr-FR')}–${salaire.max.toLocaleString('fr-FR')} €`;
    details.push({
      label: salaireLabel,
      pourcentage: p * 100,
      source: 'INSEE 2022',
    });
  }

  // Tabac
  if (fumeur) {
    const p = getProbabiliteFumeur(genre, fumeur);
    probabiliteTotale *= p;
    details.push({
      label: FUMEUR_LABELS[fumeur],
      pourcentage: p * 100,
      source: 'SPF 2023',
    });
  }

  // Situation
  if (situation) {
    const p = getProbabiliteSituation(genre, situation);
    probabiliteTotale *= p;
    details.push({
      label: SITUATION_LABELS[situation],
      pourcentage: p * 100,
      source: 'INSEE 2021',
    });
  }

  // Sport
  if (sport) {
    const p = getProbabiliteSport(genre, sport);
    probabiliteTotale *= p;
    details.push({
      label: SPORT_LABELS[sport],
      pourcentage: p * 100,
      source: 'INJEP 2022',
    });
  }

  const populationGenre = getPopulationGenre(genre);
  const nombre = Math.round(populationGenre * probabiliteTotale);

  return {
    pourcentage: probabiliteTotale * 100,
    nombre,
    details,
  };
}
