import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  CriteriaState,
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
  Genre,
} from '../types';
import {
  AGE_LABELS,
  AGE_KEYS,
  DIPLOME_LABELS,
  DIPLOME_KEYS,
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
  TRANCHES_TAILLE,
  TRANCHES_SALAIRE,
} from '../constants/labels';
import { C } from '../constants/theme';
import { GenreSelector } from './GenreSelector';
import { ChipSelector } from './ChipSelector';
import { DualSlider } from './DualSlider';
import { MultiChipSelector } from './MultiChipSelector';
import { Section } from './Section';

// ── Pre-built label arrays for DualSlider ───────────────────────
const TAILLE_LABELS  = TRANCHES_TAILLE.map((t) => t.label);
const SALAIRE_LABELS = TRANCHES_SALAIRE.map((s) => s.label);
const AGE_SLIDER_LABELS    = AGE_KEYS.map((k) => AGE_LABELS[k]);
const DIPLOME_SLIDER_LABELS = DIPLOME_KEYS.map((k) => DIPLOME_LABELS[k]);

// ── Multi-chip option arrays ─────────────────────────────────────
const toOpts = <T extends string>(labels: Record<T, string>) =>
  (Object.entries(labels) as [T, string][]).map(([value, label]) => ({
    value,
    label,
  }));

const CHEVEUX_OPTIONS  = toOpts(CHEVEUX_LABELS);
const YEUX_OPTIONS     = toOpts(YEUX_LABELS);
const FUMEUR_OPTIONS   = toOpts(FUMEUR_LABELS);
const SITUATION_OPTIONS = toOpts(SITUATION_LABELS);
const SPORT_OPTIONS    = toOpts(SPORT_LABELS);
const ENFANTS_OPTIONS  = toOpts(ENFANTS_LABELS);
const LOGEMENT_OPTIONS = toOpts(LOGEMENT_LABELS);
const ANIMAUX_OPTIONS  = toOpts(ANIMAUX_LABELS);
const ALCOOL_OPTIONS   = toOpts(ALCOOL_LABELS);
const TATOUAGE_OPTIONS = toOpts(TATOUAGE_LABELS);
const VEHICULE_OPTIONS = toOpts(VEHICULE_LABELS);

// ── rangeLabel helpers ───────────────────────────────────────────

/** "18–24 ans" + "35–44 ans" → "18–44 ans" */
function agePillLabel(a: string, b: string): string {
  if (a === b) return a;
  const start = a.split('–')[0] ?? a;           // "18"
  const endFull = b.split('–')[1] ?? b;          // "44 ans"
  return `${start}–${endFull}`;
}

function arrowLabel(a: string, b: string): string {
  return a === b ? a : `${a} → ${b}`;
}

// ────────────────────────────────────────────────────────────────

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
        {/* ── Apparence ── */}
        <Section
          icon="👤"
          title="Apparence"
          badge={countFor(criteria.tailleRange, criteria.cheveux, criteria.yeux)}
          defaultOpen={defaultOpenAll || !isProfilMode}
        >
          <CriteriaBlock label="Taille">
            <DualSlider
              count={TRANCHES_TAILLE.length}
              range={criteria.tailleRange}
              onRange={(r) => onChange({ tailleRange: r })}
              labels={TAILLE_LABELS}
              rangeLabel={arrowLabel}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Cheveux">
            <MultiChipSelector
              options={CHEVEUX_OPTIONS}
              selected={criteria.cheveux}
              onSelect={(v) => onChange({ cheveux: v as CouleurCheveux[] | null })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Yeux">
            <MultiChipSelector
              options={YEUX_OPTIONS}
              selected={criteria.yeux}
              onSelect={(v) => onChange({ yeux: v as CouleurYeux[] | null })}
            />
          </CriteriaBlock>
        </Section>

        {/* ── Profil ── */}
        <Section
          icon="🎓"
          title="Profil"
          badge={countFor(criteria.ageRange, criteria.diplomeRange, criteria.salaireRange)}
          defaultOpen={defaultOpenAll}
        >
          <CriteriaBlock label="Âge">
            <DualSlider
              count={AGE_KEYS.length}
              range={criteria.ageRange}
              onRange={(r) => onChange({ ageRange: r })}
              labels={AGE_SLIDER_LABELS}
              rangeLabel={agePillLabel}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Diplôme">
            <DualSlider
              count={DIPLOME_KEYS.length}
              range={criteria.diplomeRange}
              onRange={(r) => onChange({ diplomeRange: r })}
              labels={DIPLOME_SLIDER_LABELS}
              rangeLabel={arrowLabel}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Salaire net / mois">
            <DualSlider
              count={TRANCHES_SALAIRE.length}
              range={criteria.salaireRange}
              onRange={(r) => onChange({ salaireRange: r })}
              labels={SALAIRE_LABELS}
              rangeLabel={arrowLabel}
            />
          </CriteriaBlock>
        </Section>

        {/* ── Mode de vie ── */}
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
            criteria.alcool,
            criteria.tatouage,
            criteria.vehicule,
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
            <MultiChipSelector
              options={SITUATION_OPTIONS}
              selected={criteria.situation}
              onSelect={(v) => onChange({ situation: v as Situation[] | null })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Sport">
            <MultiChipSelector
              options={SPORT_OPTIONS}
              selected={criteria.sport}
              onSelect={(v) => onChange({ sport: v as FrequenceSport[] | null })}
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
            <MultiChipSelector
              options={LOGEMENT_OPTIONS}
              selected={criteria.logement}
              onSelect={(v) => onChange({ logement: v as Logement[] | null })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Animaux">
            <MultiChipSelector
              options={ANIMAUX_OPTIONS}
              selected={criteria.animaux}
              onSelect={(v) => onChange({ animaux: v as Animaux[] | null })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Alcool">
            <ChipSelector
              options={ALCOOL_OPTIONS}
              selected={criteria.alcool}
              onSelect={(v: Alcool | null) => onChange({ alcool: v })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Tatouage">
            <ChipSelector
              options={TATOUAGE_OPTIONS}
              selected={criteria.tatouage}
              onSelect={(v: Tatouage | null) => onChange({ tatouage: v })}
            />
          </CriteriaBlock>
          <CriteriaBlock label="Véhicule / Permis">
            <MultiChipSelector
              options={VEHICULE_OPTIONS}
              selected={criteria.vehicule}
              onSelect={(v) => onChange({ vehicule: v as Vehicule[] | null })}
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
