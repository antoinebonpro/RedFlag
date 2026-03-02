import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Genre,
  TrancheAge,
  NiveauDiplome,
  CouleurCheveux,
  CouleurYeux,
  Fumeur,
  Situation,
  FrequenceSport,
  CriteriaSelection,
  ResultatCalcul,
} from './src/types';
import {
  AGE_LABELS,
  DIPLOME_LABELS,
  CHEVEUX_LABELS,
  YEUX_LABELS,
  FUMEUR_LABELS,
  SITUATION_LABELS,
  SPORT_LABELS,
  TRANCHES_TAILLE,
  TRANCHES_SALAIRE,
} from './src/constants/labels';
import { C } from './src/constants/theme';
import { GenreSelector } from './src/components/GenreSelector';
import { ChipSelector } from './src/components/ChipSelector';
import { Section } from './src/components/Section';
import { ResultCard } from './src/components/ResultCard';
import { SourcesPanel } from './src/components/SourcesPanel';
import { calculerResultat } from './src/services/calculator';

// --- Options ---
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
const TAILLE_OPTIONS = TRANCHES_TAILLE.map((t, i) => ({
  value: String(i),
  label: t.label,
}));
const SALAIRE_OPTIONS = TRANCHES_SALAIRE.map((s, i) => ({
  value: String(i),
  label: s.label,
}));

type Screen = 'criteria' | 'sources';

export default function App() {
  const [screen, setScreen] = useState<Screen>('criteria');
  const scrollRef = useRef<ScrollView>(null);
  const resultAnim = useRef(new Animated.Value(0)).current;

  // State
  const [genre, setGenre] = useState<Genre>('homme');
  const [age, setAge] = useState<TrancheAge | null>(null);
  const [tailleIdx, setTailleIdx] = useState<string | null>(null);
  const [diplome, setDiplome] = useState<NiveauDiplome | null>(null);
  const [cheveux, setCheveux] = useState<CouleurCheveux | null>(null);
  const [yeux, setYeux] = useState<CouleurYeux | null>(null);
  const [salaireIdx, setSalaireIdx] = useState<string | null>(null);
  const [fumeur, setFumeur] = useState<Fumeur | null>(null);
  const [situation, setSituation] = useState<Situation | null>(null);
  const [sport, setSport] = useState<FrequenceSport | null>(null);
  const [resultat, setResultat] = useState<ResultatCalcul | null>(null);

  const criteresActifs = useMemo(() => {
    return [age, tailleIdx, diplome, cheveux, yeux, salaireIdx, fumeur, situation, sport]
      .filter((v) => v !== null)
      .length;
  }, [age, tailleIdx, diplome, cheveux, yeux, salaireIdx, fumeur, situation, sport]);

  const handleCalculer = useCallback(() => {
    const criteria: CriteriaSelection = {
      genre,
      age,
      taille: tailleIdx !== null ? TRANCHES_TAILLE[Number(tailleIdx)] : null,
      diplome,
      couleurCheveux: cheveux,
      couleurYeux: yeux,
      salaire: salaireIdx !== null ? TRANCHES_SALAIRE[Number(salaireIdx)] : null,
      fumeur,
      situation,
      sport,
    };

    resultAnim.setValue(0);
    setResultat(calculerResultat(criteria));
    Animated.spring(resultAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [genre, age, tailleIdx, diplome, cheveux, yeux, salaireIdx, fumeur, situation, sport, resultAnim]);

  const handleReset = useCallback(() => {
    setAge(null);
    setTailleIdx(null);
    setDiplome(null);
    setCheveux(null);
    setYeux(null);
    setSalaireIdx(null);
    setFumeur(null);
    setSituation(null);
    setSport(null);
    setResultat(null);
  }, []);

  const countFor = (...vals: (unknown | null)[]) => {
    const n = vals.filter((v) => v !== null).length;
    return n > 0 ? String(n) : null;
  };

  // ===================== SOURCES =====================
  if (screen === 'sources') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setScreen('criteria')}
            activeOpacity={0.6}
          >
            <Text style={styles.backText}>← Retour aux critères</Text>
          </TouchableOpacity>
          <SourcesPanel />
          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ===================== CRITÈRES =====================
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.logo}>🚩 RedFlag</Text>
              <Text style={styles.tagline}>Tes critères sont-ils réalistes ?</Text>
            </View>
            <TouchableOpacity
              style={styles.sourcesBtn}
              onPress={() => setScreen('sources')}
              activeOpacity={0.6}
            >
              <Text style={styles.sourcesBtnText}>📊</Text>
            </TouchableOpacity>
          </View>

          {criteresActifs > 0 && (
            <View style={styles.statusBar}>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {criteresActifs} critère{criteresActifs > 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={handleReset} activeOpacity={0.6}>
                <Text style={styles.clearText}>Effacer tout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Genre ── */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Je recherche</Text>
          <GenreSelector selected={genre} onSelect={setGenre} />
        </View>

        {/* ── Critères ── */}
        <View style={styles.sections}>
          <Section
            icon="👤"
            title="Apparence"
            badge={countFor(tailleIdx, cheveux, yeux)}
            defaultOpen
          >
            <CriteriaBlock label="Taille">
              <ChipSelector options={TAILLE_OPTIONS} selected={tailleIdx} onSelect={setTailleIdx} />
            </CriteriaBlock>
            <CriteriaBlock label="Cheveux">
              <ChipSelector options={CHEVEUX_OPTIONS} selected={cheveux} onSelect={setCheveux} />
            </CriteriaBlock>
            <CriteriaBlock label="Yeux">
              <ChipSelector options={YEUX_OPTIONS} selected={yeux} onSelect={setYeux} />
            </CriteriaBlock>
          </Section>

          <Section
            icon="🎓"
            title="Profil"
            badge={countFor(age, diplome, salaireIdx)}
          >
            <CriteriaBlock label="Âge">
              <ChipSelector options={AGE_OPTIONS} selected={age} onSelect={setAge} />
            </CriteriaBlock>
            <CriteriaBlock label="Diplôme">
              <ChipSelector options={DIPLOME_OPTIONS} selected={diplome} onSelect={setDiplome} />
            </CriteriaBlock>
            <CriteriaBlock label="Salaire net / mois">
              <ChipSelector options={SALAIRE_OPTIONS} selected={salaireIdx} onSelect={setSalaireIdx} />
            </CriteriaBlock>
          </Section>

          <Section
            icon="💪"
            title="Mode de vie"
            badge={countFor(fumeur, situation, sport)}
          >
            <CriteriaBlock label="Tabac">
              <ChipSelector options={FUMEUR_OPTIONS} selected={fumeur} onSelect={setFumeur} />
            </CriteriaBlock>
            <CriteriaBlock label="Situation">
              <ChipSelector options={SITUATION_OPTIONS} selected={situation} onSelect={setSituation} />
            </CriteriaBlock>
            <CriteriaBlock label="Sport">
              <ChipSelector options={SPORT_OPTIONS} selected={sport} onSelect={setSport} />
            </CriteriaBlock>
          </Section>
        </View>

        {/* ── Bouton ── */}
        <TouchableOpacity
          style={[styles.calcBtn, criteresActifs === 0 && styles.calcBtnOff]}
          onPress={handleCalculer}
          disabled={criteresActifs === 0}
          activeOpacity={0.8}
        >
          <Text style={[styles.calcBtnText, criteresActifs === 0 && styles.calcBtnTextOff]}>
            {criteresActifs === 0
              ? 'Sélectionne au moins 1 critère'
              : `Calculer 🚩`}
          </Text>
        </TouchableOpacity>

        {/* ── Résultat ── */}
        {resultat && (
          <Animated.View
            style={[
              styles.resultWrap,
              {
                opacity: resultAnim,
                transform: [
                  {
                    translateY: resultAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <ResultCard resultat={resultat} genre={genre} />
          </Animated.View>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Petit wrapper label + enfant ──
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

// ===================== STYLES =====================
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bgCard,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 56,
  },

  // Header
  header: {
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logo: {
    fontSize: 30,
    fontWeight: '900',
    color: C.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: C.textTertiary,
    marginTop: 2,
  },
  sourcesBtn: {
    width: 44,
    height: 44,
    borderRadius: C.r12,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  sourcesBtnText: {
    fontSize: 20,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    backgroundColor: C.bg,
    borderRadius: C.r12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.red,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
  },
  clearText: {
    fontSize: 13,
    color: C.textTertiary,
    fontWeight: '500',
  },

  // Genre section
  sectionWrap: {
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Sections
  sections: {
    gap: 12,
  },

  // Criteria
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

  // Button
  calcBtn: {
    backgroundColor: C.red,
    paddingVertical: 18,
    borderRadius: C.r16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: C.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  calcBtnOff: {
    backgroundColor: C.bgChip,
    shadowOpacity: 0,
    elevation: 0,
  },
  calcBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.textOnRed,
  },
  calcBtnTextOff: {
    color: C.textTertiary,
  },

  // Result
  resultWrap: {
    marginTop: 24,
  },

  // Back
  backBtn: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 15,
    color: C.indigo,
    fontWeight: '600',
  },

  spacer: {
    height: 40,
  },
});
