import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useLazyFetchActiveAnnouncementsQuery, useLogAnnouncementEventsMutation } from '../../../services/api';
import { COLORS } from '../../../constants/colors';
import { trackAnnouncementViewed } from '../../../utils/activityTracker';

const { width: windowWidth } = Dimensions.get('window');
const CARD_WIDTH = windowWidth - 40;
const CARD_HEIGHT = CARD_WIDTH * 9 / 18;

const SLIDE_DISTANCE = 12;
const EXIT_DURATION  = 150;
const ENTER_DURATION = 190;

// ─────────────────────────────────────────────────────────────────────────────
// Hook de animação do footer
// Separa "índice exibido" do "índice ativo do carousel":
//   1. Animação de SAÍDA roda com o conteúdo ANTIGO ainda visível
//   2. onSwap() é chamado no meio: troca o conteúdo (setState)
//   3. Animação de ENTRADA roda com o conteúdo NOVO
// ─────────────────────────────────────────────────────────────────────────────
function useFooterAnimation() {
  const logoY    = useRef(new Animated.Value(0)).current;
  const logoO    = useRef(new Animated.Value(1)).current;
  const nameY    = useRef(new Animated.Value(0)).current;
  const nameO    = useRef(new Animated.Value(1)).current;
  const branchY  = useRef(new Animated.Value(0)).current;
  const branchO  = useRef(new Animated.Value(1)).current;

  const runningAnim = useRef(null);

  /**
   * @param {1|-1} direction  1 = avançar, -1 = voltar
   * @param {() => void} onSwap  chamado entre saída e entrada para trocar o conteúdo
   */
  const animate = useCallback((direction, onSwap) => {
    if (runningAnim.current) {
      runningAnim.current.stop();
      runningAnim.current = null;
    }

    const exitY  = direction * -SLIDE_DISTANCE;
    const enterY = direction *  SLIDE_DISTANCE;

    // ── Fase 1: saída (conteúdo ANTIGO sobe/desce e some) ──
    const exitAnim = Animated.parallel([
      Animated.timing(logoY,   { toValue: exitY, duration: EXIT_DURATION, useNativeDriver: true }),
      Animated.timing(logoO,   { toValue: 0,     duration: EXIT_DURATION, useNativeDriver: true }),
      Animated.timing(nameY,   { toValue: exitY, duration: EXIT_DURATION, useNativeDriver: true }),
      Animated.timing(nameO,   { toValue: 0,     duration: EXIT_DURATION - 20, useNativeDriver: true }),
      Animated.timing(branchY, { toValue: exitY, duration: EXIT_DURATION, useNativeDriver: true }),
      Animated.timing(branchO, { toValue: 0,     duration: EXIT_DURATION - 20, useNativeDriver: true }),
    ]);

    runningAnim.current = exitAnim;

    exitAnim.start(({ finished }) => {
      if (!finished) return;

      // ── Troca o conteúdo enquanto está invisível ──
      onSwap();

      // Posiciona na direção de entrada (fora da área, mas invisível)
      logoY.setValue(enterY);
      nameY.setValue(enterY);
      branchY.setValue(enterY);

      // ── Fase 2: entrada (conteúdo NOVO sobe para posição zero) ──
      const enterAnim = Animated.parallel([
        Animated.timing(logoY,   { toValue: 0, duration: ENTER_DURATION, useNativeDriver: true }),
        Animated.timing(logoO,   { toValue: 1, duration: ENTER_DURATION, useNativeDriver: true }),
        Animated.timing(nameY,   { toValue: 0, duration: ENTER_DURATION, useNativeDriver: true }),
        Animated.timing(nameO,   { toValue: 1, duration: ENTER_DURATION, useNativeDriver: true }),
        Animated.timing(branchY, { toValue: 0, duration: ENTER_DURATION, useNativeDriver: true }),
        Animated.timing(branchO, { toValue: 1, duration: ENTER_DURATION, useNativeDriver: true }),
      ]);

      runningAnim.current = enterAnim;
      enterAnim.start(() => { runningAnim.current = null; });
    });
  }, []);

  return { logoY, logoO, nameY, nameO, branchY, branchO, animate };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AnnouncementsCarousel() {
  const userCoords = useSelector((state) => state.location.coords);
  const [trigger, { data: response, isLoading }] = useLazyFetchActiveAnnouncementsQuery();
  const hasFetchedRef = useRef(null);

  useEffect(() => {
    const lat = userCoords?.latitude;
    const lng = userCoords?.longitude;
    if (!hasFetchedRef.current || (lat && !hasFetchedRef.current.hadCoords)) {
      trigger({ lat, lng });
      hasFetchedRef.current = { fetched: true, hadCoords: !!lat };
    }
  }, [userCoords, trigger]);

  const announcements = useMemo(() => response?.data || [], [response?.data]);

  // activeIndexRef  → índice real do carousel (para o auto-play, sem stale closure)
  // displayedIndex  → índice do conteúdo visível no footer (muda só no meio da animação)
  const activeIndexRef   = useRef(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);

  const [logAnnouncementEvents] = useLogAnnouncementEventsMutation();

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      const activeItem = announcements[displayedIndex];
      if (activeItem && trackAnnouncementViewed(activeItem.id)) {
        logAnnouncementEvents({
          events: [
            {
              announcement_id: activeItem.id,
              event: 'viewed',
              message: `Aviso "${activeItem.title}" visualizado no app móvel.`
            }
          ]
        }).unwrap().catch(err => {
          console.error("Erro ao enviar log de visualização de aviso:", err);
        });
      }
    }
  }, [displayedIndex, announcements, logAnnouncementEvents]);

  const flatListRef   = useRef(null);
  const autoPlayRef   = useRef(null);
  const isDraggingRef = useRef(false);

  const { logoY, logoO, nameY, nameO, branchY, branchO, animate } = useFooterAnimation();

  // Troca de slide: anima o footer passando o swap como callback do meio
  const changeIndex = useCallback((newIndex, direction) => {
    if (newIndex < 0 || newIndex >= announcements.length) return;
    activeIndexRef.current = newIndex;

    animate(direction, () => {
      // Executado entre saída e entrada, com o footer ainda invisível
      setDisplayedIndex(newIndex);
    });
  }, [announcements.length, animate]);

  // ── Auto-play ──
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (announcements.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      if (isDraggingRef.current) return;
      const next = (activeIndexRef.current + 1) % announcements.length;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      changeIndex(next, 1);
    }, 5000);
  }, [announcements.length, changeIndex]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [announcements.length]);

  // Toque nos logos da fila
  const scrollToIndex = useCallback((index) => {
    if (index < 0 || index >= announcements.length) return;
    const direction = index > activeIndexRef.current ? 1 : -1;
    flatListRef.current?.scrollToIndex({ index, animated: true });
    changeIndex(index, direction);
    startAutoPlay();
  }, [announcements.length, changeIndex, startAutoPlay]);

  // Arrasto manual
  const lastScrollX = useRef(0);
  const handleScroll = useCallback((event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index   = Math.round(scrollX / CARD_WIDTH);
    if (index !== activeIndexRef.current && index >= 0 && index < announcements.length) {
      const direction = scrollX > lastScrollX.current ? 1 : -1;
      lastScrollX.current = scrollX;
      changeIndex(index, direction);
    } else {
      lastScrollX.current = scrollX;
    }
  }, [announcements.length, changeIndex]);

  const handleScrollBeginDrag = useCallback(() => { isDraggingRef.current = true; }, []);
  const handleScrollEndDrag   = useCallback(() => {
    isDraggingRef.current = false;
    startAutoPlay();
  }, [startAutoPlay]);

  // ── Early returns ──
  if (isLoading && announcements.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary || '#F97316'} />
      </View>
    );
  }

  if (announcements.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="check-circle" size={18} color="#22C55E" style={styles.emptyIcon} />
        <View style={styles.emptyTextContainer}>
          <Text style={styles.emptyTitle}>Sem avisos</Text>
          <Text style={styles.emptySubtitle}>
            Operações ocorrendo normalmente. Qualquer aviso aparecerá aqui.
          </Text>
        </View>
      </View>
    );
  }

  // Footer usa displayedIndex (conteúdo antigo durante a saída, novo durante a entrada)
  const displayedAnn = announcements[displayedIndex];

  // Fila de próximos baseada no displayedIndex para consistência visual
  const nextLogos = [];
  if (announcements.length > 1) {
    for (let offset = 1; offset <= 3; offset++) {
      const nextIdx = (displayedIndex + offset) % announcements.length;
      const nextAnn = announcements[nextIdx];
      if (nextIdx !== displayedIndex && !nextLogos.some((l) => l.id === nextAnn.id)) {
        nextLogos.push({
          id: nextAnn.id,
          logoUrl: nextAnn.company_logo_url,
          name: nextAnn.company_name,
          index: nextIdx,
        });
      }
    }
  }

  return (
    <View style={styles.container}>
      {/* Carousel */}
      <View style={styles.carouselWrapper}>
        <FlatList
          ref={flatListRef}
          data={announcements}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          snapToInterval={CARD_WIDTH}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          scrollEventThrottle={16}
          renderItem={({ item }) => {
            const yOffset   = item.image_position?.y ?? 50;
            const topOffset = -(yOffset / 100) * (CARD_HEIGHT * 0.8);

            return (
              <View style={styles.cardContainer}>
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={[styles.cardImage, { top: topOffset }]}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.fallbackImage}>
                    <Icon name="image" size={32} color="#cbd5e1" />
                  </View>
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.85)']}
                  locations={[0, 0.4, 1.0]}
                  style={styles.gradient}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  {item.subtitle   ? <Text style={styles.cardSubtitle}   numberOfLines={1}>{item.subtitle}</Text>   : null}
                  {item.description? <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>: null}
                </View>
              </View>
            );
          }}
        />
      </View>

      {/* Footer animado */}
      {displayedAnn && (
        <View style={styles.footer}>
          <View style={styles.activeCompany}>

            {/* Logo: slide + fade */}
            <View style={styles.logoClip}>
              <Animated.View
                style={[styles.logoWrapper, { opacity: logoO, transform: [{ translateY: logoY }] }]}
              >
                {displayedAnn.company_logo_url ? (
                  <Image source={{ uri: displayedAnn.company_logo_url }} style={styles.companyLogo} />
                ) : (
                  <View style={styles.placeholderLogo}>
                    <Text style={styles.placeholderLogoText}>
                      {displayedAnn.company_name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                )}
              </Animated.View>
            </View>

            {/* Textos: slide + fade individuais */}
            <View style={styles.companyTextContainer}>
              <View style={styles.textLineClip}>
                <Animated.Text
                  style={[styles.companyName, { opacity: nameO, transform: [{ translateY: nameY }] }]}
                  numberOfLines={1}
                >
                  {displayedAnn.company_name}
                </Animated.Text>
              </View>

              {displayedAnn.company_branch_name ? (
                <View style={styles.textLineClip}>
                  <Animated.Text
                    style={[styles.companyBranch, { opacity: branchO, transform: [{ translateY: branchY }] }]}
                    numberOfLines={1}
                  >
                    {displayedAnn.company_branch_name}
                  </Animated.Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Fila de próximos */}
          {nextLogos.length > 0 && (
            <View style={styles.logosRow}>
              {nextLogos.map((next, idx) => (
                <Pressable
                  key={next.id}
                  onPress={() => scrollToIndex(next.index)}
                  style={[styles.queueLogoWrapper, { zIndex: 10 - idx, marginLeft: idx > 0 ? -8 : 0 }]}
                >
                  {next.logoUrl ? (
                    <Image source={{ uri: next.logoUrl }} style={styles.queueLogo} />
                  ) : (
                    <View style={styles.queuePlaceholderLogo}>
                      <Text style={styles.queuePlaceholderText}>
                        {next.name.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}

              {announcements.length > 4 && (
                <View style={[styles.queueLogoWrapper, { zIndex: 5, marginLeft: -8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#cbd5e1' }]}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#64748b', lineHeight: 9 }}>...</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 8,
  },
  loadingContainer: {
    height: CARD_HEIGHT + 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
  },
  cardImage: {
    position: 'absolute',
    width: '100%',
    height: '180%',
  },
  fallbackImage: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: '80%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e2e8f0',
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 10.5,
    fontWeight: '400',
    color: '#cbd5e1',
    marginTop: 4,
    lineHeight: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  activeCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  logoClip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  companyLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderLogoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
  },
  companyTextContainer: {
    marginLeft: 8,
    flex: 1,
    overflow: 'hidden',
  },
  textLineClip: {
    overflow: 'hidden',
  },
  companyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  companyBranch: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 1,
  },
  logosRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueLogoWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  queueLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  queuePlaceholderLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  queuePlaceholderText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#64748b',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
  emptyIcon: {
    marginRight: 10,
  },
  emptyTextContainer: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
});