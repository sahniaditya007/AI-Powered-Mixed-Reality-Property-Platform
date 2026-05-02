import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Moon,
  Sun,
  Volume2,
  ArrowLeft,
  VolumeX,
  Mic,
  Wind,
  Lightbulb,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { AI_NARRATIONS } from '../data/properties';

const { width, height } = Dimensions.get('window');

const NOISE_ICON_COLOR = { Low: '#34D399', Moderate: '#FBBF24', High: '#F87171' };

// 360° panorama images (equirectangular)
const VR_IMAGES = {
  day: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=2000&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=2000&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=2000&q=80',
  ],
  night: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2000&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000&q=80',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=2000&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=2000&q=80',
  ],
};

function buildAFrameHTML(imageUrl: string, isNight: boolean): string {
  const brightness = isNight ? 0.35 : 1.0;
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #000; overflow: hidden; width: 100vw; height: 100vh; }
      canvas { display: block; }
    </style>
  </head>
  <body>
    <a-scene
      embedded
      vr-mode-ui="enabled: false"
      renderer="colorManagement: true; physicallyCorrectLights: true"
      loading-screen="dotsColor: #8B5CF6; backgroundColor: #080F1E"
    >
      <a-assets>
        <img id="sky" src="${imageUrl}" crossorigin="anonymous">
      </a-assets>

      <a-sky
        src="#sky"
        rotation="0 -130 0"
        material="shader: flat; color: #${isNight ? '334466' : 'ffffff'}; opacity: 1"
        animation="property: material.color; to: #${isNight ? '223355' : 'ffffff'}; dur: 1500; easing: easeInOutQuad"
      ></a-sky>

      <a-entity
        light="type: ambient; color: #${isNight ? '1a2a4a' : 'ffffff'}; intensity: ${brightness}"
      ></a-entity>

      <a-camera
        look-controls="reverseMouseDrag: false; touchEnabled: true; magicWindowTrackingEnabled: true"
        wasd-controls="enabled: false"
        position="0 1.6 0"
      ></a-camera>
    </a-scene>
  </body>
</html>
`;
}

export default function VRGuest({ navigation, route }: any) {
  const { propertyId } = route.params || {};
  const { getPropertyById } = useApp();
  const property = getPropertyById(propertyId || '1');

  const propIndex = propertyId ? parseInt(propertyId) - 1 : 0;
  const dayImage = VR_IMAGES.day[propIndex] || VR_IMAGES.day[0];
  const nightImage = VR_IMAGES.night[propIndex] || VR_IMAGES.night[0];

  const [isNight, setIsNight] = useState(false);
  const [narration, setNarration] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showNoise, setShowNoise] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const narrationOpacity = useRef(new Animated.Value(0)).current;
  const panelHeight = useRef(new Animated.Value(0)).current;
  const transitionOpacity = useRef(new Animated.Value(1)).current;

  const currentImage = isNight ? nightImage : dayImage;
  const narrations = AI_NARRATIONS[propertyId || '1'] || AI_NARRATIONS['1'];

  const showNarration = (text: string) => {
    setNarration(text);
    Animated.sequence([
      Animated.timing(narrationOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(5000),
      Animated.timing(narrationOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  };

  const toggleDayNight = () => {
    setIsTransitioning(true);
    Animated.sequence([
      Animated.timing(transitionOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.delay(100),
      Animated.timing(transitionOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start(() => setIsTransitioning(false));

    const next = !isNight;
    setIsNight(next);
    showNarration(next ? narrations.night : narrations.day);
  };

  const handleAskAI = () => {
    showNarration(isNight ? narrations.night : narrations.day);
  };

  const togglePanel = () => {
    const toValue = panelExpanded ? 0 : 1;
    Animated.spring(panelHeight, { toValue, useNativeDriver: false, tension: 80, friction: 12 }).start();
    setPanelExpanded(!panelExpanded);
  };

  const noiseColor = NOISE_ICON_COLOR[property?.noiseLevel || 'Low'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#F8FAFC" size={22} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{property?.name || 'VR Walkthrough'}</Text>
          <View style={styles.vrBadge}>
            <Text style={styles.vrBadgeText}>360° VR</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.muteBtn} onPress={() => setIsMuted(!isMuted)}>
          {isMuted ? <VolumeX color="#64748B" size={20} /> : <Volume2 color="#A78BFA" size={20} />}
        </TouchableOpacity>
      </View>

      {/* VR Viewer */}
      <Animated.View style={[styles.vrContainer, { opacity: transitionOpacity }]}>
        <WebView
          originWhitelist={['*']}
          source={{ html: buildAFrameHTML(currentImage, isNight) }}
          style={styles.webview}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />

        {/* Day/Night overlay tint */}
        {isNight && (
          <View style={styles.nightTint} pointerEvents="none" />
        )}

        {/* Mode indicator */}
        <View style={styles.modeIndicator}>
          {isNight ? (
            <Moon color="#A78BFA" size={14} />
          ) : (
            <Sun color="#FBBF24" size={14} />
          )}
          <Text style={styles.modeText}>{isNight ? 'Night Mode' : 'Day Mode'}</Text>
        </View>

        {/* Gyroscope hint */}
        <View style={styles.gyroHint}>
          <Text style={styles.gyroHintText}>↔ Swipe or tilt to look around</Text>
        </View>
      </Animated.View>

      {/* Narration Bubble */}
      <Animated.View style={[styles.narrationBubble, { opacity: narrationOpacity }]}>
        <View style={styles.narrationInner}>
          <View style={styles.narrationIcon}>
            <Mic color="#A78BFA" size={14} />
          </View>
          <Text style={styles.narrationText}>{narration}</Text>
        </View>
      </Animated.View>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {/* Expand toggle */}
        <TouchableOpacity style={styles.expandToggle} onPress={togglePanel}>
          {panelExpanded ? (
            <ChevronDown color="#64748B" size={18} />
          ) : (
            <ChevronUp color="#64748B" size={18} />
          )}
        </TouchableOpacity>

        {/* Expandable info */}
        <Animated.View
          style={[
            styles.expandableInfo,
            {
              maxHeight: panelHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 160],
              }),
              opacity: panelHeight,
            },
          ]}
        >
          <View style={styles.infoRow}>
            <Lightbulb color="#FBBF24" size={14} />
            <Text style={styles.infoLabel}>Sunlight</Text>
            <Text style={styles.infoValue}>{property?.sunlightInfo || '—'}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Wind color={noiseColor} size={14} />
            <Text style={styles.infoLabel}>Noise</Text>
            <Text style={styles.infoValue}>{property?.noiseInfo || '—'}</Text>
          </View>
          <View style={styles.noiseLevelRow}>
            <Text style={styles.noiseLevelLabel}>Noise Level:</Text>
            <View style={[styles.noiseLevelBadge, { backgroundColor: `${noiseColor}20` }]}>
              <Text style={[styles.noiseLevelText, { color: noiseColor }]}>
                {property?.noiseLevel || 'Low'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlBtn, isNight && styles.controlBtnActive]}
            onPress={toggleDayNight}
            disabled={isTransitioning}
          >
            {isNight ? (
              <Sun color="#FBBF24" size={20} />
            ) : (
              <Moon color="#94A3B8" size={20} />
            )}
            <Text style={[styles.controlText, isNight && { color: '#FBBF24' }]}>
              {isNight ? 'Switch Day' : 'Switch Night'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.aiBtn} onPress={handleAskAI}>
            <View style={styles.aiBtnGlow} />
            <Text style={styles.aiBtnText}>✦ Ask AI</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(8,15,30,0.9)',
    zIndex: 10,
  },
  backBtn: { padding: 6 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  vrBadge: {
    backgroundColor: 'rgba(139,92,246,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  vrBadgeText: { color: '#A78BFA', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  muteBtn: { padding: 6 },
  vrContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  webview: { flex: 1, backgroundColor: 'transparent' },
  nightTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 40, 0.35)',
  },
  modeIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8,15,30,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modeText: { color: '#CBD5E1', fontSize: 11, fontWeight: '600' },
  gyroHint: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(8,15,30,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  gyroHintText: { color: '#475569', fontSize: 11 },
  narrationBubble: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 200,
    zIndex: 20,
  },
  narrationInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(8,15,30,0.92)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    gap: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  narrationIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(139,92,246,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  narrationText: {
    color: '#E2E8F0',
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  bottomPanel: {
    backgroundColor: 'rgba(8,15,30,0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  expandToggle: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  expandableInfo: {
    overflow: 'hidden',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    width: 55,
    marginTop: 1,
  },
  infoValue: {
    color: '#94A3B8',
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  infoDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 2,
  },
  noiseLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
  },
  noiseLevelLabel: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  noiseLevelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  noiseLevelText: { fontSize: 11, fontWeight: '700' },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,41,59,0.8)',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  controlBtnActive: {
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderColor: 'rgba(251,191,36,0.2)',
  },
  controlText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  },
  aiBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  aiBtnGlow: {
    position: 'absolute',
    top: -20,
    left: '20%',
    width: '60%',
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  aiBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
