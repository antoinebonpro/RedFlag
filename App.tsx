import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  AppMode,
  CriteriaState,
  CriteriaSelection,
  ResultatCalcul,
  Ville,
  SavedSearch,
  defaultCriteria,
} from './src/types';
import {
  VILLE_LABELS,
  TRANCHES_TAILLE,
  TRANCHES_SALAIRE,
  AGE_KEYS,
  DIPLOME_KEYS,
} from './src/constants/labels';
import { C, S } from './src/constants/theme';
import { ChipSelector } from './src/components/ChipSelector';
import { CriteriaForm } from './src/components/CriteriaForm';
import { ResultCard, formatPourcentage } from './src/components/ResultCard';
import { SourcesPanel } from './src/components/SourcesPanel';
import { HistoriquePanel } from './src/components/HistoriquePanel';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AdBanner } from './src/components/AdBanner';
import { calculerResultat } from './src/services/calculator';
import { saveSearch, getHistory } from './src/services/history';

// ─── Constants (module-level to avoid recreation on render) ──

type Screen = 'app' | 'sources';

const VILLE_OPTIONS = (Object.entries(VILLE_LABELS) as [Ville, string][]).map(
  ([value, label]) => ({ value, label }),
);

const SCROLL_DELAY_MS = 200;

// ─── Helpers ──────────────────────────────────────────────────

function stateToSelection(c: CriteriaState): CriteriaSelection {
  return {
    genre: c.genre,
    age: c.ageRange !== null
      ? AGE_KEYS.slice(c.ageRange[0], c.ageRange[1] + 1)
      : null,
    taille: c.tailleRange !== null
      ? { min: TRANCHES_TAILLE[c.tailleRange[0]].min, max: TRANCHES_TAILLE[c.tailleRange[1]].max }
      : null,
    diplome: c.diplomeRange !== null
      ? DIPLOME_KEYS.slice(c.diplomeRange[0], c.diplomeRange[1] + 1)
      : null,
    couleurCheveux: c.cheveux,
    couleurYeux: c.yeux,
    salaire: c.salaireRange !== null
      ? { min: TRANCHES_SALAIRE[c.salaireRange[0]].min, max: TRANCHES_SALAIRE[c.salaireRange[1]].max }
      : null,
    fumeur: c.fumeur,
    situation: c.situation,
    sport: c.sport,
    enfants: c.enfants,
    logement: c.logement,
    animaux: c.animaux,
    alcool: c.alcool,
    tatouage: c.tatouage,
    vehicule: c.vehicule,
  };
}

function countCriteria(c: CriteriaState): number {
  return [
    c.ageRange, c.tailleRange, c.diplomeRange, c.cheveux, c.yeux, c.salaireRange,
    c.fumeur, c.situation, c.sport, c.enfants, c.logement, c.animaux,
    c.alcool, c.tatouage, c.vehicule,
  ].filter((v) => v !== null).length;
}

function buildShareText(
  resultat: ResultatCalcul,
  criteria: CriteriaState,
  ville: Ville,
  mode: 'recherche' | 'profil',
): string {
  const genreLabel = criteria.genre === 'homme' ? 'hommes' : 'femmes';
  const villeLabel =
    ville === 'france'
      ? 'en France'
      : `à ${VILLE_LABELS[ville].replace(/^[^\s]+\s/, '')}`;
  const traitsText = resultat.details.map((d) => d.label).join(', ');
  const modeText = mode === 'profil' ? 'Mon profil' : 'Mes critères';
  return (
    `🚩 RedFlag\n` +
    `${modeText} : ${traitsText}\n` +
    `→ ${formatPourcentage(resultat.pourcentage)} des ${genreLabel} ${villeLabel} correspondent\n\n` +
    `Teste tes critères sur redflag.app`
  );
}

// ─── App ──────────────────────────────────────────────────────

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [screen, setScreen] = useState<Screen>('app');
  const [mode, setMode] = useState<AppMode>('recherche');
  const [ville, setVille] = useState<Ville>('france');

  // Single-form modes (recherche / profil)
  const [criteria, setCriteria] = useState<CriteriaState>(defaultCriteria('homme'));
  const [resultat, setResultat] = useState<ResultatCalcul | null>(null);
  const resultAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  // Couple mode
  const [coupleA, setCoupleA] = useState<CriteriaState>(defaultCriteria('homme'));
  const [coupleB, setCoupleB] = useState<CriteriaState>(defaultCriteria('femme'));
  const [coupleResultA, setCoupleResultA] = useState<ResultatCalcul | null>(null);
  const [coupleResultB, setCoupleResultB] = useState<ResultatCalcul | null>(null);
  const [coupleTab, setCoupleTab] = useState<'a' | 'b'>('a');
  const coupleAnim = useRef(new Animated.Value(0)).current;

  // History
  const [history, setHistory] = useState<SavedSearch[]>([]);

  const refreshHistory = useCallback(async () => {
    const h = await getHistory();
    setHistory(h);
  }, []);

  useEffect(() => {
    if (mode === 'historique') refreshHistory();
  }, [mode, refreshHistory]);

  // Derived counts
  const criteresActifs = useMemo(() => countCriteria(criteria), [criteria]);
  const coupleCriteresA = useMemo(() => countCriteria(coupleA), [coupleA]);
  const coupleCriteresB = useMemo(() => countCriteria(coupleB), [coupleB]);

  // Share text — memoised to avoid rebuilding on every render
  const shareText = useMemo(
    () =>
      resultat
        ? buildShareText(
            resultat,
            criteria,
            ville,
            mode === 'profil' ? 'profil' : 'recherche',
          )
        : undefined,
    [resultat, criteria, ville, mode],
  );

  // ─── Handlers ─────────────────────────────────────────────

  const triggerResultAnim = useCallback(
    (anim: Animated.Value) => {
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), SCROLL_DELAY_MS);
    },
    [],
  );

  const handleCalculer = useCallback(async () => {
    const sel = stateToSelection(criteria);
    const res = calculerResultat(sel, ville);
    setResultat(res);
    triggerResultAnim(resultAnim);

    const currentMode = mode === 'profil' ? 'profil' : 'recherche';
    await saveSearch({
      id: Date.now().toString(),
      timestamp: Date.now(),
      mode: currentMode,
      criteria,
      ville,
      resultat: res,
    });
    await refreshHistory();
  }, [criteria, ville, mode, resultAnim, triggerResultAnim, refreshHistory]);

  const handleReset = useCallback(() => {
    setCriteria(defaultCriteria(criteria.genre));
    setResultat(null);
  }, [criteria.genre]);

  const handleCalculerCouple = useCallback(() => {
    setCoupleResultA(calculerResultat(stateToSelection(coupleA), ville));
    setCoupleResultB(calculerResultat(stateToSelection(coupleB), ville));
    triggerResultAnim(coupleAnim);
  }, [coupleA, coupleB, ville, coupleAnim, triggerResultAnim]);

  const handleRestoreHistory = useCallback(
    (c: CriteriaState, v: Ville, m: 'recherche' | 'profil') => {
      setCriteria(c);
      setVille(v);
      setMode(m);
      setResultat(null);
    },
    [],
  );

  const handleModeChange = useCallback((m: AppMode) => {
    setMode(m);
    setResultat(null);
  }, []);

  // ─── Sources screen ───────────────────────────────────────

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
            onPress={() => setScreen('app')}
            activeOpacity={0.6}
            accessibilityLabel="Retour aux critères"
            accessibilityRole="button"
          >
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
          <SourcesPanel />
          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Main app ─────────────────────────────────────────────

  const isSearchMode = mode === 'recherche' || mode === 'profil';
  const isProfilMode = mode === 'profil';

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.logo} accessibilityRole="header">
                  🚩 RedFlag
                </Text>
                <Text style={styles.tagline}>Tes critères sont-ils réalistes ?</Text>
              </View>
              <TouchableOpacity
                style={styles.sourcesBtn}
                onPress={() => setScreen('sources')}
                activeOpacity={0.6}
                accessibilityLabel="Voir les sources"
                accessibilityRole="button"
              >
                <Text style={styles.sourcesBtnText}>📊</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Mode tabs ── */}
          <View
            style={styles.modeTabs}
            accessibilityRole="tablist"
            accessibilityLabel="Modes de l'application"
          >
            <ModeTab icon="🔍" label="Recherche" active={mode === 'recherche'} onPress={() => handleModeChange('recherche')} />
            <ModeTab icon="👤" label="Mon profil" active={mode === 'profil'}   onPress={() => handleModeChange('profil')} />
            <ModeTab icon="💑" label="Couple"     active={mode === 'couple'}   onPress={() => handleModeChange('couple')} />
            <ModeTab icon="🕑" label="Historique" active={mode === 'historique'} onPress={() => handleModeChange('historique')} />
          </View>

          {/* ── Ville selector ── */}
          {mode !== 'historique' && (
            <View style={styles.villeWrap}>
              <Text style={styles.sectionLabel}>📍 Ville / Région</Text>
              <ChipSelector
                options={VILLE_OPTIONS}
                selected={ville}
                onSelect={(v) => { if (v) setVille(v); }}
              />
            </View>
          )}

          {/* ══ RECHERCHE / PROFIL ══ */}
          {isSearchMode && (
            <>
              {criteresActifs > 0 && (
                <View style={styles.statusBar}>
                  <View style={styles.statusPill}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>
                      {criteresActifs} critère{criteresActifs > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleReset}
                    activeOpacity={0.6}
                    accessibilityLabel="Effacer tous les critères"
                    accessibilityRole="button"
                  >
                    <Text style={styles.clearText}>Effacer tout</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isProfilMode && (
                <View style={styles.profilBanner}>
                  <Text style={styles.profilBannerText}>
                    👤 Entre tes propres caractéristiques pour voir à quel point tu es rare et découvrir tes 🚩 red flags
                  </Text>
                </View>
              )}

              <CriteriaForm
                criteria={criteria}
                onChange={(update) => {
                  setCriteria((prev) => ({ ...prev, ...update }));
                  setResultat(null);
                }}
                isProfilMode={isProfilMode}
              />

              <TouchableOpacity
                style={[styles.calcBtn, criteresActifs > 0 && S.redBtn, criteresActifs === 0 && styles.calcBtnOff]}
                onPress={handleCalculer}
                disabled={criteresActifs === 0}
                activeOpacity={0.8}
                accessibilityLabel={
                  criteresActifs === 0
                    ? 'Sélectionne au moins un critère pour calculer'
                    : isProfilMode ? 'Analyser mon profil' : 'Calculer'
                }
                accessibilityRole="button"
                accessibilityState={{ disabled: criteresActifs === 0 }}
              >
                <Text style={[styles.calcBtnText, criteresActifs === 0 && styles.calcBtnTextOff]}>
                  {criteresActifs === 0
                    ? 'Sélectionne au moins 1 critère'
                    : isProfilMode ? 'Analyser mon profil 👤' : 'Calculer 🚩'}
                </Text>
              </TouchableOpacity>

              {resultat && (
                <Animated.View
                  style={[
                    styles.resultWrap,
                    {
                      opacity: resultAnim,
                      transform: [{
                        translateY: resultAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }),
                      }],
                    },
                  ]}
                >
                  <ResultCard
                    resultat={resultat}
                    genre={criteria.genre}
                    ville={ville}
                    mode={isProfilMode ? 'profil' : 'recherche'}
                    shareText={shareText}
                  />
                  {/* ── Publicité après résultat ── */}
                  <AdBanner placement="afterResult" />
                </Animated.View>
              )}
            </>
          )}

          {/* ══ COUPLE ══ */}
          {mode === 'couple' && (
            <>
              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>
                  💑 Chaque partenaire entre son propre profil pour comparer vos résultats
                </Text>
              </View>

              <View style={styles.coupleTabs}>
                <TouchableOpacity
                  style={[styles.coupleTab, coupleTab === 'a' && styles.coupleTabActive]}
                  onPress={() => setCoupleTab('a')}
                  activeOpacity={0.7}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: coupleTab === 'a' }}
                >
                  <Text style={[styles.coupleTabText, coupleTab === 'a' && styles.coupleTabTextActive]}>
                    👤 Moi {coupleCriteresA > 0 ? `(${coupleCriteresA})` : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.coupleTab, coupleTab === 'b' && styles.coupleTabActive]}
                  onPress={() => setCoupleTab('b')}
                  activeOpacity={0.7}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: coupleTab === 'b' }}
                >
                  <Text style={[styles.coupleTabText, coupleTab === 'b' && styles.coupleTabTextActive]}>
                    👤 Partenaire {coupleCriteresB > 0 ? `(${coupleCriteresB})` : ''}
                  </Text>
                </TouchableOpacity>
              </View>

              {coupleTab === 'a' ? (
                <CriteriaForm
                  criteria={coupleA}
                  onChange={(update) => {
                    setCoupleA((prev) => ({ ...prev, ...update }));
                    setCoupleResultA(null);
                    setCoupleResultB(null);
                  }}
                  isProfilMode
                />
              ) : (
                <CriteriaForm
                  criteria={coupleB}
                  onChange={(update) => {
                    setCoupleB((prev) => ({ ...prev, ...update }));
                    setCoupleResultA(null);
                    setCoupleResultB(null);
                  }}
                  isProfilMode
                />
              )}

              <TouchableOpacity
                style={[
                  styles.calcBtn,
                  coupleCriteresA + coupleCriteresB > 0 && S.redBtn,
                  coupleCriteresA + coupleCriteresB === 0 && styles.calcBtnOff,
                ]}
                onPress={handleCalculerCouple}
                disabled={coupleCriteresA + coupleCriteresB === 0}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Comparer les deux profils"
                accessibilityState={{ disabled: coupleCriteresA + coupleCriteresB === 0 }}
              >
                <Text style={[
                  styles.calcBtnText,
                  coupleCriteresA + coupleCriteresB === 0 && styles.calcBtnTextOff,
                ]}>
                  Comparer les deux profils 💑
                </Text>
              </TouchableOpacity>

              {(coupleResultA || coupleResultB) && (
                <Animated.View
                  style={{
                    opacity: coupleAnim,
                    transform: [{
                      translateY: coupleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    }],
                  }}
                >
                  <View style={styles.coupleResults}>
                    <Text style={styles.sectionLabel}>Résultats comparés</Text>
                    {coupleResultA && (
                      <View style={styles.coupleResultItem}>
                        <Text style={styles.coupleResultItemLabel}>👤 Moi</Text>
                        <ResultCard resultat={coupleResultA} genre={coupleA.genre} ville={ville} mode="profil" />
                      </View>
                    )}
                    {coupleResultB && (
                      <View style={styles.coupleResultItem}>
                        <Text style={styles.coupleResultItemLabel}>👤 Partenaire</Text>
                        <ResultCard resultat={coupleResultB} genre={coupleB.genre} ville={ville} mode="profil" />
                      </View>
                    )}
                  </View>
                </Animated.View>
              )}
            </>
          )}

          {/* ══ HISTORIQUE ══ */}
          {mode === 'historique' && (
            <>
              <HistoriquePanel
                history={history}
                onRestore={handleRestoreHistory}
                onHistoryChange={refreshHistory}
              />
              {history.length > 0 && (
                <AdBanner placement="inHistorique" />
              )}
            </>
          )}

          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

// ─── ModeTab component ────────────────────────────────────────

function ModeTab({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.modeTab, active && styles.modeTabActive, active && S.tab]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Text style={styles.modeTabIcon}>{icon}</Text>
      <Text style={[styles.modeTabLabel, active && styles.modeTabLabelActive]}>
        {label}
      </Text>
      {active && <View style={styles.modeTabDot} />}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgCard },
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 56, gap: 20 },

  // Header
  header: {},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logo: { fontSize: 30, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: C.textTertiary, marginTop: 2 },
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
  sourcesBtnText: { fontSize: 20 },

  // Mode tabs
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    borderRadius: C.r16,
    padding: 4,
    borderWidth: 1,
    borderColor: C.border,
    gap: 2,
  },
  modeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: C.r12,
    gap: 2,
  },
  modeTabActive: {
    backgroundColor: C.bgCard,
  },
  modeTabIcon: { fontSize: 16 },
  modeTabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: C.textTertiary,
    textAlign: 'center',
  },
  modeTabLabelActive: { color: C.text, fontWeight: '700' },
  modeTabDot: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: C.red,
    marginTop: 2,
  },

  // Shared label
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Ville
  villeWrap: { gap: 10 },

  // Status bar
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.bg,
    borderRadius: C.r12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.red },
  statusText: { fontSize: 13, fontWeight: '700', color: C.text },
  clearText: { fontSize: 13, color: C.textTertiary, fontWeight: '500' },

  // Banners
  profilBanner: {
    backgroundColor: C.indigoLight,
    borderRadius: C.r12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: C.indigoBorder,
  },
  profilBannerText: { fontSize: 13, color: C.indigo, fontWeight: '500', lineHeight: 19 },
  infoBanner: {
    backgroundColor: C.bgCard,
    borderRadius: C.r12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoBannerText: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 19,
    textAlign: 'center',
  },

  // Couple
  coupleTabs: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    borderRadius: C.r12,
    padding: 4,
    borderWidth: 1,
    borderColor: C.border,
    gap: 4,
  },
  coupleTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: C.r8,
    alignItems: 'center',
  },
  coupleTabActive: { backgroundColor: C.red },
  coupleTabText: { fontSize: 14, fontWeight: '600', color: C.textSecondary },
  coupleTabTextActive: { color: C.textOnRed, fontWeight: '700' },
  coupleResults: { gap: 16 },
  coupleResultItem: { gap: 8 },
  coupleResultItemLabel: { fontSize: 15, fontWeight: '700', color: C.text },

  // Buttons
  calcBtn: {
    backgroundColor: C.red,
    paddingVertical: 18,
    borderRadius: C.r16,
    alignItems: 'center',
  },
  calcBtnOff: { backgroundColor: C.bgChip },
  calcBtnText: { fontSize: 16, fontWeight: '800', color: C.textOnRed },
  calcBtnTextOff: { color: C.textTertiary },

  // Result
  resultWrap: {},

  // Back button
  backBtn: { marginBottom: 20, alignSelf: 'flex-start' },
  backText: { fontSize: 15, color: C.indigo, fontWeight: '600' },

  spacer: { height: 40 },
});
