import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  BackHandler,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
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
// FIX: App Store 2023+ — account/data deletion + privacy policy link required
import { PrivacyPanel } from './src/components/PrivacyPanel';
import { calculerResultat } from './src/services/calculator';
import { saveSearch, getHistory } from './src/services/history';
import { bootstrapAdsAndConsent } from './src/services/consent';

// ─── Constants (module-level to avoid recreation on render) ──

type Screen = 'app' | 'sources' | 'privacy'; // FIX: add privacy screen

const VILLE_OPTIONS = (Object.entries(VILLE_LABELS) as [Ville, string][]).map(
  ([value, label]) => ({ value, label }),
);

const SCROLL_DELAY_MS = 200;
const TABLET_MAX_WIDTH = 600;
// Below this width (Galaxy Fold inner, iPhone SE 1st gen, etc.) the default
// 20px padding/gap eats too much horizontal space — collapse to 12px.
const COMPACT_WIDTH = 360;

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
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const [screen, setScreen] = useState<Screen>('app');
  const [mode, setMode] = useState<AppMode>('recherche');
  const [ville, setVille] = useState<Ville>('france');

  // Single-form modes (recherche / profil)
  const [criteria, setCriteria] = useState<CriteriaState>(defaultCriteria('homme'));
  const [resultat, setResultat] = useState<ResultatCalcul | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const resultAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Couple mode
  const [coupleA, setCoupleA] = useState<CriteriaState>(defaultCriteria('homme'));
  const [coupleB, setCoupleB] = useState<CriteriaState>(defaultCriteria('femme'));
  const [coupleResultA, setCoupleResultA] = useState<ResultatCalcul | null>(null);
  const [coupleResultB, setCoupleResultB] = useState<ResultatCalcul | null>(null);
  const [coupleTab, setCoupleTab] = useState<'a' | 'b'>('a');
  const coupleAnim = useRef(new Animated.Value(0)).current;

  // History
  const [history, setHistory] = useState<SavedSearch[]>([]);

  // Request ATT + UMP consent + initialize AdMob (no-op on web)
  useEffect(() => {
    bootstrapAdsAndConsent();
  }, []);

  // Cleanup pending scroll timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  // ─── Android hardware back button ────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBackPress = () => {
      // FIX: handle both sub-screens (sources + privacy)
      if (screen === 'sources' || screen === 'privacy') {
        setScreen('app');
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [screen]);

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

  // Share text
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
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(
        () => scrollRef.current?.scrollToEnd({ animated: true }),
        SCROLL_DELAY_MS,
      );
    },
    [],
  );

  const handleCalculer = useCallback(async () => {
    if (isCalculating) return;
    setIsCalculating(true);
    try {
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
    } finally {
      setIsCalculating(false);
    }
  }, [criteria, ville, mode, resultAnim, triggerResultAnim, refreshHistory, isCalculating]);

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

  // ─── Layout helpers ──────────────────────────────────────
  // Tablet: cap content width and center
  const isTablet = windowWidth >= 768;
  const isCompact = windowWidth < COMPACT_WIDTH;

  const contentExtraStyle = isTablet
    ? { maxWidth: TABLET_MAX_WIDTH, alignSelf: 'center' as const, width: '100%' as const }
    : null;

  // Compact override: 12/12 instead of 20/20 to avoid horizontal overflow on
  // Galaxy Fold (280px usable) and very small Android devices.
  const compactOverride = isCompact ? { padding: 12, gap: 12 } : null;

  const contentStyle = useMemo(
    () => [
      styles.content,
      compactOverride,
      { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      contentExtraStyle,
    ],
    [insets.top, insets.bottom, contentExtraStyle, compactOverride],
  );

  // ─── Sources screen ───────────────────────────────────────

  if (screen === 'sources') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setScreen('app')}
            activeOpacity={0.6}
            accessible
            accessibilityLabel="Retour aux critères"
            accessibilityRole="button"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backText} allowFontScaling>
              ← Retour
            </Text>
          </TouchableOpacity>
          <SourcesPanel />
          {/* FIX: footer link to privacy panel from Sources for discoverability */}
          <TouchableOpacity
            style={styles.footerLinkBtn}
            onPress={() => setScreen('privacy')}
            activeOpacity={0.6}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Confidentialité et gestion des données"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.footerLinkText} allowFontScaling>
              🔒 Confidentialité & données →
            </Text>
          </TouchableOpacity>
          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Privacy screen ───────────────────────────────────────

  if (screen === 'privacy') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setScreen('app')}
            activeOpacity={0.6}
            accessible
            accessibilityLabel="Retour aux critères"
            accessibilityRole="button"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backText} allowFontScaling>
              ← Retour
            </Text>
          </TouchableOpacity>
          <PrivacyPanel
            onDataCleared={() => {
              // FIX: reset UI state after data wipe
              setHistory([]);
              setResultat(null);
              setCriteria(defaultCriteria(criteria.genre));
            }}
          />
          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Main app ─────────────────────────────────────────────

  const isSearchMode = mode === 'recherche' || mode === 'profil';
  const isProfilMode = mode === 'profil';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text
                style={styles.logo}
                accessibilityRole="header"
                allowFontScaling
                maxFontSizeMultiplier={1.4}
              >
                🚩 RedFlag
              </Text>
              <Text style={styles.tagline} allowFontScaling>
                Tes critères sont-ils réalistes ?
              </Text>
            </View>
            <TouchableOpacity
              style={styles.sourcesBtn}
              onPress={() => setScreen('sources')}
              activeOpacity={0.6}
              accessible
              accessibilityLabel="Voir les sources"
              accessibilityRole="button"
            >
              <Text style={styles.sourcesBtnText} allowFontScaling={false}>
                📊
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Mode tabs ── */}
        <View
          style={styles.modeTabs}
          accessibilityRole="tablist"
          accessibilityLabel="Modes de l'application"
        >
          <ModeTab
            icon="🔍"
            label="Recherche"
            active={mode === 'recherche'}
            onPress={handleModeChange}
            modeKey="recherche"
          />
          <ModeTab
            icon="👤"
            label="Mon profil"
            active={mode === 'profil'}
            onPress={handleModeChange}
            modeKey="profil"
          />
          <ModeTab
            icon="💑"
            label="Couple"
            active={mode === 'couple'}
            onPress={handleModeChange}
            modeKey="couple"
          />
          <ModeTab
            icon="🕑"
            label="Historique"
            active={mode === 'historique'}
            onPress={handleModeChange}
            modeKey="historique"
          />
        </View>

        {/* ── Ville selector ── */}
        {mode !== 'historique' && (
          <View style={styles.villeWrap}>
            <Text style={styles.sectionLabel} allowFontScaling>
              📍 Ville / Région
            </Text>
            <ChipSelector
              options={VILLE_OPTIONS}
              selected={ville}
              onSelect={(v) => {
                if (v) setVille(v);
              }}
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
                  <Text style={styles.statusText} allowFontScaling>
                    {criteresActifs} critère{criteresActifs > 1 ? 's' : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleReset}
                  activeOpacity={0.6}
                  accessible
                  accessibilityLabel="Effacer tous les critères"
                  accessibilityRole="button"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.clearBtnTouch}
                >
                  <Text style={styles.clearText} allowFontScaling>
                    Effacer tout
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {isProfilMode && (
              <View style={styles.profilBanner}>
                <Text style={styles.profilBannerText} allowFontScaling>
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
              style={[
                styles.calcBtn,
                criteresActifs > 0 && S.redBtn,
                criteresActifs === 0 && styles.calcBtnOff,
              ]}
              onPress={handleCalculer}
              disabled={criteresActifs === 0 || isCalculating}
              activeOpacity={0.8}
              accessible
              accessibilityLabel={
                criteresActifs === 0
                  ? 'Sélectionne au moins un critère pour calculer'
                  : isProfilMode
                  ? 'Analyser mon profil'
                  : 'Calculer'
              }
              accessibilityRole="button"
              accessibilityState={{
                disabled: criteresActifs === 0 || isCalculating,
                busy: isCalculating,
              }}
            >
              <Text
                style={[
                  styles.calcBtnText,
                  criteresActifs === 0 && styles.calcBtnTextOff,
                ]}
                allowFontScaling
              >
                {isCalculating
                  ? '…'
                  : criteresActifs === 0
                  ? 'Sélectionne au moins 1 critère'
                  : isProfilMode
                  ? 'Analyser mon profil 👤'
                  : 'Calculer 🚩'}
              </Text>
            </TouchableOpacity>

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
                <ResultCard
                  resultat={resultat}
                  genre={criteria.genre}
                  ville={ville}
                  mode={isProfilMode ? 'profil' : 'recherche'}
                  shareText={shareText}
                />
                <AdBanner placement="afterResult" />
              </Animated.View>
            )}
          </>
        )}

        {/* ══ COUPLE ══ */}
        {mode === 'couple' && (
          <>
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerText} allowFontScaling>
                💑 Chaque partenaire entre son propre profil pour comparer vos résultats
              </Text>
            </View>

            <View style={styles.coupleTabs}>
              <TouchableOpacity
                style={[styles.coupleTab, coupleTab === 'a' && styles.coupleTabActive]}
                onPress={() => setCoupleTab('a')}
                activeOpacity={0.7}
                accessible
                accessibilityRole="tab"
                accessibilityLabel={`Onglet Moi, ${coupleCriteresA} critères`}
                accessibilityState={{ selected: coupleTab === 'a' }}
              >
                <Text
                  style={[
                    styles.coupleTabText,
                    coupleTab === 'a' && styles.coupleTabTextActive,
                  ]}
                  allowFontScaling
                >
                  👤 Moi {coupleCriteresA > 0 ? `(${coupleCriteresA})` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.coupleTab, coupleTab === 'b' && styles.coupleTabActive]}
                onPress={() => setCoupleTab('b')}
                activeOpacity={0.7}
                accessible
                accessibilityRole="tab"
                accessibilityLabel={`Onglet Partenaire, ${coupleCriteresB} critères`}
                accessibilityState={{ selected: coupleTab === 'b' }}
              >
                <Text
                  style={[
                    styles.coupleTabText,
                    coupleTab === 'b' && styles.coupleTabTextActive,
                  ]}
                  allowFontScaling
                >
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
              accessible
              accessibilityRole="button"
              accessibilityLabel="Comparer les deux profils"
              accessibilityState={{
                disabled: coupleCriteresA + coupleCriteresB === 0,
              }}
            >
              <Text
                style={[
                  styles.calcBtnText,
                  coupleCriteresA + coupleCriteresB === 0 && styles.calcBtnTextOff,
                ]}
                allowFontScaling
              >
                Comparer les deux profils 💑
              </Text>
            </TouchableOpacity>

            {(coupleResultA || coupleResultB) && (
              <Animated.View
                style={{
                  opacity: coupleAnim,
                  transform: [
                    {
                      translateY: coupleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                }}
              >
                <View style={styles.coupleResults}>
                  <Text
                    style={styles.sectionLabel}
                    accessibilityRole="header"
                    allowFontScaling
                  >
                    Résultats comparés
                  </Text>
                  {coupleResultA && (
                    <View style={styles.coupleResultItem}>
                      <Text style={styles.coupleResultItemLabel} allowFontScaling>
                        👤 Moi
                      </Text>
                      <ResultCard
                        resultat={coupleResultA}
                        genre={coupleA.genre}
                        ville={ville}
                        mode="profil"
                      />
                    </View>
                  )}
                  {coupleResultB && (
                    <View style={styles.coupleResultItem}>
                      <Text style={styles.coupleResultItemLabel} allowFontScaling>
                        👤 Partenaire
                      </Text>
                      <ResultCard
                        resultat={coupleResultB}
                        genre={coupleB.genre}
                        ville={ville}
                        mode="profil"
                      />
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
            {history.length > 0 && <AdBanner placement="inHistorique" />}
          </>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ModeTab component ────────────────────────────────────────

interface ModeTabProps {
  icon: string;
  label: string;
  active: boolean;
  modeKey: AppMode;
  onPress: (m: AppMode) => void;
}

const ModeTab = React.memo(function ModeTab({
  icon,
  label,
  active,
  modeKey,
  onPress,
}: ModeTabProps) {
  const handlePress = useCallback(() => onPress(modeKey), [onPress, modeKey]);

  return (
    <TouchableOpacity
      style={[styles.modeTab, active && styles.modeTabActive, active && S.tab]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessible
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Text style={styles.modeTabIcon} allowFontScaling={false}>
        {icon}
      </Text>
      <Text
        style={[styles.modeTabLabel, active && styles.modeTabLabelActive]}
        numberOfLines={1}
        allowFontScaling
        maxFontSizeMultiplier={1.2}
      >
        {label}
      </Text>
      {active && <View style={styles.modeTabDot} />}
    </TouchableOpacity>
  );
});

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgCard },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 20 },

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
    paddingVertical: 12,
    minHeight: 56,
    justifyContent: 'center',
    borderRadius: C.r12,
    gap: 2,
  },
  modeTabActive: {
    backgroundColor: C.bgCard,
  },
  modeTabIcon: { fontSize: 18 },
  modeTabLabel: {
    fontSize: 12,
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
  clearBtnTouch: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
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
  profilBannerText: {
    fontSize: 13,
    color: C.indigo,
    fontWeight: '500',
    lineHeight: 19,
  },
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
    paddingVertical: 14,
    minHeight: 44,
    borderRadius: C.r8,
    alignItems: 'center',
    justifyContent: 'center',
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
    minHeight: 56,
    justifyContent: 'center',
    borderRadius: C.r16,
    alignItems: 'center',
  },
  calcBtnOff: { backgroundColor: C.bgChip },
  calcBtnText: { fontSize: 16, fontWeight: '800', color: C.textOnRed },
  calcBtnTextOff: { color: C.textTertiary },

  // Result
  resultWrap: {},

  // Back button
  backBtn: {
    marginBottom: 20,
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  backText: { fontSize: 15, color: C.indigo, fontWeight: '600' },

  // FIX: footer link style for privacy screen entry point
  footerLinkBtn: {
    marginTop: 24,
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  footerLinkText: {
    fontSize: 14,
    color: C.indigo,
    fontWeight: '700',
  },

  spacer: { height: 24 },
});
