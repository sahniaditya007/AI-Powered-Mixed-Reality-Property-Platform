import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Animated,
  ScrollView,
  Modal,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import {
  Scan,
  ArrowLeft,
  Wrench,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  MapPin,
  ChevronDown,
  X,
  Zap,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Issue } from '../data/properties';

const { width, height } = Dimensions.get('window');

// Simulated AI detection results
const DETECTION_SCENARIOS: Omit<Issue, 'id' | 'vendorAssigned'>[] = [
  {
    type: 'Water Leak',
    severity: 'High',
    description: 'Active moisture detected. Water staining visible on surface with potential structural seepage.',
    fixSuggestion: 'Seal the source immediately. Inspect supply lines and P-trap. Check for mold growth behind wall.',
    estimatedCost: '$150–$350',
    location: 'Detected Area',
    detectedAt: 'Just now',
  },
  {
    type: 'Wall Crack',
    severity: 'Medium',
    description: 'Hairline fracture detected. Pattern suggests thermal expansion or minor foundation settling.',
    fixSuggestion: 'Apply epoxy filler and repaint. Monitor for expansion over 30 days. Check adjacent walls.',
    estimatedCost: '$80–$200',
    location: 'Detected Area',
    detectedAt: 'Just now',
  },
  {
    type: 'Broken Appliance',
    severity: 'Medium',
    description: 'Appliance anomaly detected. Visible wear, misalignment, or damage to component housing.',
    fixSuggestion: 'Inspect internal components. Replace worn parts or schedule full unit service.',
    estimatedCost: '$100–$400',
    location: 'Detected Area',
    detectedAt: 'Just now',
  },
  {
    type: 'Mold Growth',
    severity: 'Critical',
    description: 'Organic growth pattern detected. Likely mold or mildew — health hazard for occupants.',
    fixSuggestion: 'Immediate remediation required. Use antifungal treatment and improve ventilation.',
    estimatedCost: '$300–$800',
    location: 'Detected Area',
    detectedAt: 'Just now',
  },
];

const SEVERITY_CONFIG = {
  Low: { color: '#34D399', bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)' },
  Medium: { color: '#FBBF24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)' },
  High: { color: '#F87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)' },
  Critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.2)', border: 'rgba(239,68,68,0.4)' },
};

const VENDORS = ['FixIt Pro Services', 'QuickRepair Co.', 'HomeCare Experts', 'ProTech Maintenance'];

export default function ARReporter({ navigation, route }: any) {
  const { propertyId } = route.params || {};
  const { properties, addIssue } = useApp();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedIssue, setDetectedIssue] = useState<Omit<Issue, 'id' | 'vendorAssigned'> | null>(null);
  const [taskAssigned, setTaskAssigned] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(propertyId || properties[0]?.id || '1');
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cornerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startScanAnimation = () => {
    // Scan line sweep
    scanLineAnim.setValue(0);
    Animated.loop(
      Animated.timing(scanLineAnim, { toValue: 1, duration: 1800, useNativeDriver: true })
    ).start();

    // Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopScanAnimation = () => {
    scanLineAnim.stopAnimation();
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const showDetectionOverlay = () => {
    Animated.timing(overlayOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    Animated.spring(cornerAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();
  };

  const handleScan = () => {
    setIsScanning(true);
    setDetectedIssue(null);
    setTaskAssigned(false);
    overlayOpacity.setValue(0);
    cornerAnim.setValue(0);
    startScanAnimation();

    setTimeout(() => {
      stopScanAnimation();
      setIsScanning(false);
      const scenario = DETECTION_SCENARIOS[scanCount % DETECTION_SCENARIOS.length];
      setDetectedIssue(scenario);
      setScanCount(c => c + 1);
      showDetectionOverlay();
    }, 2800);
  };

  const handleAssignVendor = (vendor: string) => {
    if (!detectedIssue) return;
    setShowVendorModal(false);

    const newIssue: Issue = {
      ...detectedIssue,
      id: `issue_${Date.now()}`,
      vendorAssigned: true,
      vendorName: vendor,
    };

    addIssue(selectedProperty, newIssue);
    setTaskAssigned(true);

    Alert.alert(
      '✅ Task Assigned',
      `${vendor} has been notified.\n\nIssue logged to ${properties.find(p => p.id === selectedProperty)?.name || 'property'} dashboard.`,
      [{ text: 'View Dashboard', onPress: () => navigation.navigate('Dashboard') }, { text: 'Scan Again', onPress: resetScan }]
    );
  };

  const resetScan = () => {
    setDetectedIssue(null);
    setTaskAssigned(false);
    overlayOpacity.setValue(0);
    cornerAnim.setValue(0);
  };

  const selectedProp = properties.find(p => p.id === selectedProperty);
  const sev = detectedIssue ? SEVERITY_CONFIG[detectedIssue.severity] : null;

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-height * 0.5, height * 0.5],
  });

  const cornerScale = cornerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permText}>Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noPermContainer}>
          <AlertTriangle color="#F87171" size={48} />
          <Text style={styles.noPermTitle}>Camera Access Required</Text>
          <Text style={styles.noPermText}>
            HoloStay needs camera access to detect property issues using AR.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#F8FAFC" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AR Issue Scanner</Text>
        <View style={styles.aiBadge}>
          <Zap color="#A78BFA" size={12} />
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      </View>

      {/* Property Selector */}
      <TouchableOpacity
        style={styles.propertySelector}
        onPress={() => setShowPropertyPicker(true)}
      >
        <MapPin color="#A78BFA" size={14} />
        <Text style={styles.propertySelectorText} numberOfLines={1}>
          {selectedProp?.name || 'Select Property'}
        </Text>
        <ChevronDown color="#64748B" size={14} />
      </TouchableOpacity>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing="back">

          {/* Scanning overlay */}
          {isScanning && (
            <View style={styles.scanningOverlay}>
              {/* Scan line */}
              <Animated.View
                style={[styles.scanLine, { transform: [{ translateY: scanLineTranslate }] }]}
              />

              {/* Corner brackets */}
              <View style={styles.corners}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>

              {/* Scanning label */}
              <Animated.View style={[styles.scanLabel, { transform: [{ scale: pulseAnim }] }]}>
                <Scan color="#34D399" size={22} />
                <Text style={styles.scanLabelText}>AI Analyzing...</Text>
              </Animated.View>
            </View>
          )}

          {/* Detection result overlay */}
          {detectedIssue && !taskAssigned && sev && (
            <Animated.View style={[styles.detectionOverlay, { opacity: overlayOpacity }]}>
              {/* Bounding box */}
              <Animated.View
                style={[
                  styles.boundingBox,
                  { borderColor: sev.color, transform: [{ scale: cornerScale }] },
                ]}
              >
                {/* Corner accents */}
                <View style={[styles.boxCornerTL, { borderColor: sev.color }]} />
                <View style={[styles.boxCornerTR, { borderColor: sev.color }]} />
                <View style={[styles.boxCornerBL, { borderColor: sev.color }]} />
                <View style={[styles.boxCornerBR, { borderColor: sev.color }]} />

                {/* Issue label above box */}
                <View style={[styles.issueLabel, { backgroundColor: 'rgba(8,15,30,0.92)', borderColor: sev.color }]}>
                  <View style={styles.issueLabelTop}>
                    <AlertTriangle color={sev.color} size={13} />
                    <Text style={[styles.issueLabelType, { color: sev.color }]}>{detectedIssue.type}</Text>
                    <View style={[styles.severityBadge, { backgroundColor: sev.bg }]}>
                      <Text style={[styles.severityText, { color: sev.color }]}>{detectedIssue.severity}</Text>
                    </View>
                  </View>
                  <View style={styles.issueLabelCost}>
                    <DollarSign color="#34D399" size={11} />
                    <Text style={styles.issueLabelCostText}>Est. {detectedIssue.estimatedCost}</Text>
                  </View>
                </View>
              </Animated.View>
            </Animated.View>
          )}

        </CameraView>
      </View>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {detectedIssue && !taskAssigned ? (
          <ScrollView style={styles.issuePanel} showsVerticalScrollIndicator={false}>
            <View style={[styles.issuePanelHeader, { borderLeftColor: sev?.color }]}>
              <View style={styles.issuePanelTop}>
                <Text style={styles.issuePanelType}>{detectedIssue.type}</Text>
                <View style={[styles.severityBadgeLarge, { backgroundColor: sev?.bg }]}>
                  <Text style={[styles.severityTextLarge, { color: sev?.color }]}>
                    {detectedIssue.severity}
                  </Text>
                </View>
              </View>
              <Text style={styles.issuePanelDesc}>{detectedIssue.description}</Text>
            </View>

            <View style={styles.fixBox}>
              <Text style={styles.fixLabel}>Fix Suggestion</Text>
              <Text style={styles.fixText}>{detectedIssue.fixSuggestion}</Text>
              <View style={styles.costRow}>
                <DollarSign color="#34D399" size={13} />
                <Text style={styles.costText}>Estimated: {detectedIssue.estimatedCost}</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.assignBtn} onPress={() => setShowVendorModal(true)}>
                <Wrench color="#FFF" size={16} />
                <Text style={styles.assignBtnText}>Assign Vendor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rescanBtn} onPress={resetScan}>
                <X color="#94A3B8" size={16} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <TouchableOpacity
            style={[styles.scanBtn, isScanning && styles.scanBtnDisabled]}
            onPress={handleScan}
            disabled={isScanning}
          >
            <Scan color="#FFF" size={20} />
            <Text style={styles.scanBtnText}>
              {isScanning ? 'Scanning...' : 'Scan for Issues'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Property Picker Modal */}
      <Modal visible={showPropertyPicker} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setShowPropertyPicker(false)}
          activeOpacity={1}
        >
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Select Property</Text>
            {properties.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.pickerItem, selectedProperty === p.id && styles.pickerItemActive]}
                onPress={() => { setSelectedProperty(p.id); setShowPropertyPicker(false); }}
              >
                <MapPin color={selectedProperty === p.id ? '#A78BFA' : '#475569'} size={14} />
                <Text style={[styles.pickerItemText, selectedProperty === p.id && { color: '#A78BFA' }]}>
                  {p.name}
                </Text>
                {selectedProperty === p.id && <CheckCircle color="#A78BFA" size={16} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Vendor Picker Modal */}
      <Modal visible={showVendorModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setShowVendorModal(false)}
          activeOpacity={1}
        >
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Assign Vendor</Text>
            <Text style={styles.pickerSubtitle}>
              Issue: {detectedIssue?.type} · {detectedIssue?.severity} severity
            </Text>
            {VENDORS.map(vendor => (
              <TouchableOpacity
                key={vendor}
                style={styles.vendorItem}
                onPress={() => handleAssignVendor(vendor)}
              >
                <View style={styles.vendorIcon}>
                  <Wrench color="#A78BFA" size={14} />
                </View>
                <Text style={styles.vendorName}>{vendor}</Text>
                <ChevronDown color="#475569" size={14} style={{ transform: [{ rotate: '-90deg' }] }} />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080F1E' },
  permText: { color: '#F8FAFC', textAlign: 'center', marginTop: 50 },
  noPermContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 16 },
  noPermTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  noPermText: { color: '#64748B', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: { padding: 6 },
  headerTitle: { color: '#F8FAFC', fontSize: 17, fontWeight: '700' },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  aiBadgeText: { color: '#A78BFA', fontSize: 11, fontWeight: '700' },
  propertySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(30,41,59,0.7)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  propertySelectorText: { color: '#CBD5E1', fontSize: 13, fontWeight: '600', flex: 1 },
  cameraContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 0,
  },
  camera: { flex: 1 },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#34D399',
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  corners: {
    ...StyleSheet.absoluteFillObject,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#34D399',
  },
  cornerTL: { top: 20, left: 20, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 20, right: 20, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 20, left: 20, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 20, right: 20, borderBottomWidth: 3, borderRightWidth: 3 },
  scanLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8,15,30,0.85)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  scanLabelText: { color: '#34D399', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  detectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boundingBox: {
    width: width * 0.62,
    height: height * 0.32,
    borderWidth: 1.5,
    backgroundColor: 'rgba(248,113,113,0.06)',
    position: 'relative',
  },
  boxCornerTL: { position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTopWidth: 3, borderLeftWidth: 3 },
  boxCornerTR: { position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTopWidth: 3, borderRightWidth: 3 },
  boxCornerBL: { position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottomWidth: 3, borderLeftWidth: 3 },
  boxCornerBR: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottomWidth: 3, borderRightWidth: 3 },
  issueLabel: {
    position: 'absolute',
    top: -68,
    left: -8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 200,
  },
  issueLabelTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  issueLabelType: { fontWeight: '700', fontSize: 13, flex: 1 },
  severityBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  severityText: { fontSize: 10, fontWeight: '700' },
  issueLabelCost: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  issueLabelCostText: { color: '#34D399', fontSize: 11, fontWeight: '600' },
  bottomPanel: {
    backgroundColor: 'rgba(8,15,30,0.97)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    maxHeight: height * 0.38,
  },
  issuePanel: { flex: 1 },
  issuePanelHeader: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginBottom: 12,
  },
  issuePanelTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  issuePanelType: { color: '#F1F5F9', fontSize: 16, fontWeight: '800', flex: 1 },
  severityBadgeLarge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  severityTextLarge: { fontSize: 12, fontWeight: '700' },
  issuePanelDesc: { color: '#94A3B8', fontSize: 13, lineHeight: 18 },
  fixBox: {
    backgroundColor: 'rgba(30,41,59,0.6)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  fixLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fixText: { color: '#CBD5E1', fontSize: 12, lineHeight: 17, marginBottom: 6 },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  costText: { color: '#34D399', fontSize: 12, fontWeight: '600' },
  actionButtons: { flexDirection: 'row', gap: 10 },
  assignBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  assignBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  rescanBtn: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,41,59,0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  scanBtnDisabled: { backgroundColor: '#1E3A5F', shadowOpacity: 0 },
  scanBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pickerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  pickerSubtitle: { color: '#475569', fontSize: 13, marginBottom: 16 },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 4,
  },
  pickerItemActive: { backgroundColor: 'rgba(139,92,246,0.1)' },
  pickerItemText: { color: '#CBD5E1', fontSize: 14, fontWeight: '600', flex: 1 },
  vendorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 4,
    backgroundColor: 'rgba(30,41,59,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  vendorIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(139,92,246,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorName: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', flex: 1 },
});
