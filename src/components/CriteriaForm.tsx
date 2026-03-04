import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  CriteriaState,
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
  Genre,
} from '../types';
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
  TRANCHES_TAILLE,
  TRANCHES_SALAIRE,
} from '../constants/labels';
import { C } from '../constants/theme';
import { GenreSelector } from './GenreSelector';
import { ChipSelector } from './ChipSelector';
import { Section } from './Section';

const toOpts = <T extends string>(labels: Record<T, string>) =>
  (Object.entries(labels) as [T, string][]).map(([value, label]) => ({
    value,
    label,
  }));

const AGE_OPTIONS = toOpts(AGE_LABELS);
const DIPLOME_OPTIONS = toOpts(DIPLOME_LABELS);
const CHEVEUX_OPTIONS = toOpts(CHEVEUX_LABELS);
const YEUX_OPTIONS = toOpts(YEUX_LABELS);
const FUMEUR_OPTIONS = toOpts(FUMEUR_LABELS);
const SITUATION_OPTIONS = toOpts(SITUATION_LABELS);
const SPORT_OPTIONS = toOpts(SPORT_LABELS);
const ENFANTS_OPTIONS = toOpts(ENFANTS_LABELS);
const LOGEMENT_OPTIONS = toOpts(LOGEMENT_LABELS);
const ANIMAUX_OPTIONS = toOpts(ANIMAUX_LABELS);

const TAILLE_OPTIONS = TRANCHES_TAILLE.map((t, i) => ({
  value: String(i),
  label: t.label,
}));
const SALAIRE_OPTIONS = TRANCHES_SALAIRE.map((s, i) => ({
  value: String(i),
  label: s.label,
}));

interface CriteriaFormProps {
  criteria: CriteriaState;
  onChange: (update: Partial<CriteriaState>) => void;
  isProfilMode?: boolean;
  defaultOpenAll?: boolean;
}

export function CriteriaForm({
  criteria,
  onChange,
  isProfilMode = false,
  defaultOpenAll = false,
}: CriteriaFormProps) {
  const countFor = (...vals: (unknown | null)[]) => {
    const n = vals.filter((v) => v !== null).length;
    return n > 0 ? String(n) : null;
  };

  const genreLabel = isProfilMode ? 'Je suis' : 'Je recherche';

  return (
    <View style={styles.container}>
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>{genreLabel}</Text>
        <GenreSelector
          selected={criteria.genre}
          onSelect={(g: Genre) => onChange({ genre: g })}
        />
      </View>

      <View style={styles.sections}>
        <Section
          icon="👤"
          title="Apparence"
          badge={countFor(criteria.tailleIdx, criteria.cheveux, criteria.yeux)}
          defaultOpen={defaultOpenAll || !isProfilMode}
        >
          <CriteriaBlock label="Taille">
            <ChipSelector
              options={TAILLE_OPTIONS}
              selected={criteria.tailleIdx}
              onSelect={(v) => onChange({ tailleIdx: v })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Cheveux">
            <ChipSelector
              options={CHEVEUX_OPTIONS}
              selected={criteria.cheveux}
              onSelect={(v: CouleurCheveux | null) => onChange({ cheveux: v })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Yeux">
            <ChipSelector
              options={YEUX_OPTIONS}
              selected={criteria.yeux}
              onSelect={(v: CouleurYeux | null) => onChange({ yeux: v })}
            />
          </CriteriaBlock>
        </Section>

        <Section
          icon="🎓"
          title="Profil"
          badge={countFor(criteria.age, criteria.diplome, criteria.salaireIdx)}
          defaultOpen={defaultOpenAll}
        >
          <CriteriaBlock label="Âge">
            <ChipSelector
              options={AGE_OPTIONS}
              selected={criteria.age}
              onSelect={(v: TrancheAge | null) => onChange({ age: v })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Diplôme">
            <ChipSelector
              options={DIPLOME_OPTIONS}
              selected={criteria.diplome}
              onSelect={(v: NiveauDiplome | null) => onChange({ diplome: v })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Salaire net / mois">
            <ChipSelector
              options={SALAIRE_OPTIONS}
              selected={criteria.salaireIdx}
              onSelect={(v) => onChange({ salaireIdx: v })}
            />
          </CriteriaBlock>
        </Section>

        <Section
          icon="💪"
          title="Mode de vie"
          badge={countFor(
            criteria.fumeur,
            criteria.situation,
            criteria.sport,
            criteria.enfants,
            criteria.logement,
            criteria.animaux,
          )}
          defaultOpen={defaultOpenAll}
        >
          <CriteriaBlock label="Tabac">
            <ChipSelector
              options={FUMEUR_OPTIONS}
              selected={criteria.fumeur}
              onSelect={(v: Fumeur | null) => onChange({ fumeur: v })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Situation">
            <ChipSelector
              options={SITUATION_OPTIONS}
              selected={criteria.situation}
              onSelect={(v: Situation | null) => onChange({ situation: v })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Sport">
            <ChipSelector
              options={SPORT_OPTIONS}
              selected={criteria.sport}
              onSelect={(v: FrequenceSport | null) => onChange({ sport: v })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Enfants">
            <ChipSelector
              options={ENFANTS_OPTIONS}
              selected={criteria.enfants}
              onSelect={(v: Enfants | null) => onChange({ enfants: v })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Logement">
            <ChipSelector
              options={LOGEMENT_OPTIONS}
              selected={criteria.logement}
              onSelect={(v: Logement | null) => onChange({ logement: v })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Animaux">
            <ChipSelector
              options={ANIMAUX_OPTIONS}
              selected={criteria.animaux}
              onSelect={(v: Animaux | null) => onChange({ animaux: v })}
            />
          </CriteriaBlock>
        </Section>
      </View>
    </View>
  );
}

function CriteriaBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.criteriaBlock}>
      <Text style={styles.criteriaLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  sectionWrap: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sections: {
    gap: 12,
  },
  criteriaBlock: {
    marginBottom: 16,
  },
  criteriaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
