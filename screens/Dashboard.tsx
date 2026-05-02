import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Home,
  AlertTriangle,
  ShieldCheck,
  Camera,
  TrendingUp,
  Users,
  Zap,
  ChevronRight,
  MapPin,
  DollarSign,
  Star,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Property } from '../data/properties';

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
  good: { color: '#34D399', bg: 'rgba(52, 211, 153, 0.12)', icon: ShieldCheck, label: 'Healthy' },
  warning: { color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)', icon: AlertTriangle, label: 'Warning' },
  alert: { color: '#F87171', bg: 'rgba(248, 113, 113, 0.12)', icon: AlertTriangle, label: 'Alert' },
};

const NOISE_COLOR = { Low: '#34D399', Moderate: '#FBBF24', High: '#F87171' };

function PropertyCard({ property, onPress }: { property: Property; onPress: () => void }) {
  const cfg = STATUS_CONFIG[property.status];
  const StatusIcon = cfg.icon;
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, styles.cardWrapper]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.card}
      >
        {/* Status strip */}
        <View style={[styles.statusStrip, { backgroundColor: cfg.color }]} />

        <View style={styles.cardInner}>
          {/* Top row */}
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(167,139,250,0.15)' }]}>
              <Home color="#A78BFA" size={16} />
            </View>
            <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
              <StatusIcon color={cfg.color} size={11} />
              <Text style={[styles.statusPillText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>

          {/* Name */}
          <Text style={styles.cardTitle} numberOfLines={2}>{property.name}</Text>

          {/* Address */}
          <View style={styles.addressRow}>
            <MapPin color="#64748B" size={11} />
            <Text style={styles.addressText} numberOfLines={1}>{property.address}</Text>
          </View>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Users color="#64748B" size={12} />
              <Text style={styles.statText}>{property.occupancy}</Text>
            </View>
            <View style={styles.statItem}>
              <AlertTriangle color={property.issues.length > 0 ? '#F87171' : '#64748B'} size={12} />
              <Text style={[styles.statText, property.issues.length > 0 && { color: '#F87171' }]}>
                {property.issues.length} {property.issues.length === 1 ? 'Issue' : 'Issues'}
              </Text>
            </View>
          </View>

          {/* Revenue */}
          <View style={styles.revenueRow}>
            <DollarSign color="#34D399" size={12} />
            <Text style={styles.revenueText}>{property.monthlyRevenue}/mo</Text>
            <View style={styles.ratingBadge}>
              <Star color="#FBBF24" size={10} fill="#FBBF24" />
              <Text style={styles.ratingText}>{property.rating}</Text>
            </View>
          </View>
        </View>

        {/* Tap hint */}
        <View style={styles.tapHint}>
          <ChevronRight color="#334155" size={16} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function SummaryBar({ properties }: { properties: Property[] }) {
  const total = properties.length;
  const occupied = properties.filter(p => p.occupancy === 'Occupied').length;
  const alerts = properties.filter(p => p.status === 'alert').length;
  const totalIssues = properties.reduce((s, p) => s + p.issues.length, 0);

  return (
    <View style={styles.summaryBar}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{total}</Text>
        <Text style={styles.summaryLabel}>Properties</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: '#34D399' }]}>{occupied}</Text>
        <Text style={styles.summaryLabel}>Occupied</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: '#FBBF24' }]}>{totalIssues}</Text>
        <Text style={styles.summaryLabel}>Issues</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: alerts > 0 ? '#F87171' : '#34D399' }]}>{alerts}</Text>
        <Text style={styles.summaryLabel}>Alerts</Text>
      </View>
    </View>
  );
}

export default function Dashboard({ navigation }: any) {
  const { properties } = useApp();
  const alertProp = properties.find(p => p.status === 'alert');
  const warningProp = !alertProp ? properties.find(p => p.status === 'warning') : undefined;
  const insightProp = alertProp || warningProp;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.logoRow}>
              <View style={styles.logoDot} />
              <Text style={styles.headerTitle}>HoloStay</Text>
            </View>
            <Text style={styles.headerSubtitle}>AI Property Manager</Text>
          </View>
          <TouchableOpacity
            style={styles.arFabInline}
            onPress={() => navigation.navigate('AR Reporter', {})}
          >
            <Camera color="#FFF" size={20} />
            <Text style={styles.arFabText}>AR Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Bar */}
        <SummaryBar properties={properties} />

        {/* AI Insight Banner */}
        {insightProp && (
          <TouchableOpacity
            style={[
              styles.insightBanner,
              insightProp.status === 'alert' ? styles.insightAlert : styles.insightWarning,
            ]}
            onPress={() => navigation.navigate('Property Detail', { propertyId: insightProp.id })}
            activeOpacity={0.85}
          >
            <View style={styles.insightLeft}>
              <View style={styles.insightIconWrap}>
                <Zap color={insightProp.status === 'alert' ? '#F87171' : '#FBBF24'} size={18} />
              </View>
              <View style={styles.insightTextWrap}>
                <Text style={styles.insightLabel}>AI Insight</Text>
                <Text style={styles.insightText}>{insightProp.aiInsight}</Text>
              </View>
            </View>
            <ChevronRight color="#64748B" size={18} />
          </TouchableOpacity>
        )}

        {/* Properties Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Properties</Text>
          <View style={styles.sectionBadge}>
            <TrendingUp color="#A78BFA" size={14} />
            <Text style={styles.sectionBadgeText}>Live</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {properties.map(prop => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onPress={() => navigation.navigate('Property Detail', { propertyId: prop.id })}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigation.navigate('AR Reporter', {})}
          >
            <Camera color="#3B82F6" size={22} />
            <Text style={styles.quickBtnText}>Scan Issue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigation.navigate('VR Guest', { propertyId: '1' })}
          >
            <View style={styles.vrIcon}>
              <Text style={styles.vrIconText}>VR</Text>
            </View>
            <Text style={styles.quickBtnText}>VR Tour</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080F1E',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
    marginLeft: 18,
  },
  arFabInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  arFabText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  insightBanner: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightAlert: {
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderColor: 'rgba(248, 113, 113, 0.25)',
  },
  insightWarning: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  insightLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  insightIconWrap: {
    marginRight: 12,
    marginTop: 2,
  },
  insightTextWrap: {
    flex: 1,
  },
  insightLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  insightText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 19,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 14,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  sectionBadgeText: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardWrapper: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  statusStrip: {
    height: 3,
    width: '100%',
  },
  cardInner: {
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardTitle: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 19,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 10,
  },
  addressText: {
    color: '#475569',
    fontSize: 11,
    flex: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  revenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  revenueText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '600',
  },
  tapHint: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 8,
  },
  quickBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  vrIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vrIconText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
