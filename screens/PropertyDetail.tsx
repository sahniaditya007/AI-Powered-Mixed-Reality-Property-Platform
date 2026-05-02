import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Clock,
  Wrench,
  Eye,
  Camera,
  Zap,
  CheckCircle,
  MapPin,
  DollarSign,
  Star,
  ChevronRight,
  Activity,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Issue } from '../data/properties';

const { width } = Dimensions.get('window');

const SEVERITY_CONFIG = {
  Low: { color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
  Medium: { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  High: { color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
  Critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.18)' },
};

const BOOKING_STATUS_COLOR = {
  confirmed: '#34D399',
  pending: '#FBBF24',
  completed: '#64748B',
};

function IssueCard({
  issue,
  propertyId,
  onAssign,
}: {
  issue: Issue;
  propertyId: string;
  onAssign: (issueId: string) => void;
}) {
  const sev = SEVERITY_CONFIG[issue.severity];
  return (
    <View style={[styles.issueCard, { borderLeftColor: sev.color }]}>
      <View style={styles.issueHeader}>
        <View style={styles.issueLeft}>
          <AlertTriangle color={sev.color} size={16} />
          <Text style={styles.issueType}>{issue.type}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: sev.bg }]}>
          <Text style={[styles.severityText, { color: sev.color }]}>{issue.severity}</Text>
        </View>
      </View>

      <Text style={styles.issueDesc}>{issue.description}</Text>

      <View style={styles.issueMetaRow}>
        <View style={styles.issueMeta}>
          <MapPin color="#475569" size={12} />
          <Text style={styles.issueMetaText}>{issue.location}</Text>
        </View>
        <View style={styles.issueMeta}>
          <Clock color="#475569" size={12} />
          <Text style={styles.issueMetaText}>{issue.detectedAt}</Text>
        </View>
      </View>

      <View style={styles.fixBox}>
        <Text style={styles.fixLabel}>Fix Suggestion</Text>
        <Text style={styles.fixText}>{issue.fixSuggestion}</Text>
        <View style={styles.costRow}>
          <DollarSign color="#34D399" size={13} />
          <Text style={styles.costText}>Est. {issue.estimatedCost}</Text>
        </View>
      </View>

      {issue.vendorAssigned ? (
        <View style={styles.assignedBadge}>
          <CheckCircle color="#34D399" size={14} />
          <Text style={styles.assignedText}>Assigned to {issue.vendorName}</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.assignBtn} onPress={() => onAssign(issue.id)}>
          <Wrench color="#FFF" size={14} />
          <Text style={styles.assignBtnText}>Assign Vendor</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function PropertyDetail({ navigation, route }: any) {
  const { propertyId } = route.params;
  const { getPropertyById, assignVendor } = useApp();
  const property = getPropertyById(propertyId);
  const [activeTab, setActiveTab] = useState<'issues' | 'bookings' | 'activity'>('issues');

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Property not found.</Text>
      </SafeAreaView>
    );
  }

  const handleAssign = (issueId: string) => {
    Alert.alert(
      'Assign Vendor',
      'Select a vendor to assign this issue to:',
      [
        { text: 'FixIt Pro Services', onPress: () => assignVendor(property.id, issueId, 'FixIt Pro Services') },
        { text: 'QuickRepair Co.', onPress: () => assignVendor(property.id, issueId, 'QuickRepair Co.') },
        { text: 'HomeCare Experts', onPress: () => assignVendor(property.id, issueId, 'HomeCare Experts') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const statusCfg = {
    good: { color: '#34D399', label: 'Healthy' },
    warning: { color: '#FBBF24', label: 'Warning' },
    alert: { color: '#F87171', label: 'Alert' },
  }[property.status];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#F8FAFC" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{property.name}</Text>
        <TouchableOpacity
          style={styles.vrBtn}
          onPress={() => navigation.navigate('VR Guest', { propertyId: property.id })}
        >
          <Eye color="#A78BFA" size={18} />
          <Text style={styles.vrBtnText}>VR</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroName}>{property.name}</Text>
              <View style={styles.heroAddress}>
                <MapPin color="#475569" size={13} />
                <Text style={styles.heroAddressText}>{property.address}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusCfg.color}20` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
              <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
            </View>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <DollarSign color="#34D399" size={16} />
              <Text style={styles.heroStatValue}>{property.monthlyRevenue}</Text>
              <Text style={styles.heroStatLabel}>Monthly</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Star color="#FBBF24" size={16} fill="#FBBF24" />
              <Text style={styles.heroStatValue}>{property.rating}</Text>
              <Text style={styles.heroStatLabel}>Rating</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <AlertTriangle color={property.issues.length > 0 ? '#F87171' : '#34D399'} size={16} />
              <Text style={[styles.heroStatValue, { color: property.issues.length > 0 ? '#F87171' : '#34D399' }]}>
                {property.issues.length}
              </Text>
              <Text style={styles.heroStatLabel}>Issues</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Calendar color="#A78BFA" size={16} />
              <Text style={styles.heroStatValue}>{property.bookings.length}</Text>
              <Text style={styles.heroStatLabel}>Bookings</Text>
            </View>
          </View>
        </View>

        {/* AI Insight */}
        <View style={styles.aiInsightCard}>
          <View style={styles.aiInsightHeader}>
            <Zap color="#A78BFA" size={16} />
            <Text style={styles.aiInsightTitle}>AI Insight</Text>
          </View>
          <Text style={styles.aiInsightText}>{property.aiInsight}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('VR Guest', { propertyId: property.id })}
          >
            <Eye color="#A78BFA" size={18} />
            <Text style={styles.actionBtnText}>VR Tour</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnBlue]}
            onPress={() => navigation.navigate('AR Reporter', { propertyId: property.id })}
          >
            <Camera color="#FFF" size={18} />
            <Text style={[styles.actionBtnText, { color: '#FFF' }]}>AR Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['issues', 'bookings', 'activity'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'issues' && property.issues.length > 0 ? ` (${property.issues.length})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'issues' && (
            <>
              {property.issues.length === 0 ? (
                <View style={styles.emptyState}>
                  <ShieldCheck color="#34D399" size={40} />
                  <Text style={styles.emptyTitle}>No Issues Detected</Text>
                  <Text style={styles.emptySubtitle}>This property is in great shape.</Text>
                </View>
              ) : (
                property.issues.map(issue => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    propertyId={property.id}
                    onAssign={handleAssign}
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'bookings' && (
            <>
              {property.bookings.map(booking => (
                <View key={booking.id} style={styles.bookingCard}>
                  <View style={styles.bookingLeft}>
                    <Text style={styles.bookingGuest}>{booking.guestName}</Text>
                    <View style={styles.bookingDates}>
                      <Calendar color="#475569" size={12} />
                      <Text style={styles.bookingDateText}>{booking.checkIn} → {booking.checkOut}</Text>
                    </View>
                  </View>
                  <View style={[styles.bookingStatus, { backgroundColor: `${BOOKING_STATUS_COLOR[booking.status]}20` }]}>
                    <Text style={[styles.bookingStatusText, { color: BOOKING_STATUS_COLOR[booking.status] }]}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {activeTab === 'activity' && (
            <>
              {property.activity.map((entry, idx) => {
                const iconColor = entry.type === 'issue' ? '#F87171' : entry.type === 'ai' ? '#A78BFA' : entry.type === 'booking' ? '#34D399' : '#FBBF24';
                return (
                  <View key={entry.id} style={styles.activityItem}>
                    <View style={[styles.activityDot, { backgroundColor: iconColor }]} />
                    {idx < property.activity.length - 1 && <View style={styles.activityLine} />}
                    <View style={styles.activityContent}>
                      <Text style={styles.activityEvent}>{entry.event}</Text>
                      <Text style={styles.activityTime}>{entry.time}</Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080F1E' },
  errorText: { color: '#F8FAFC', textAlign: 'center', marginTop: 50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  backBtn: { padding: 8 },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  vrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },
  vrBtnText: { color: '#A78BFA', fontWeight: '700', fontSize: 13 },
  heroCard: {
    margin: 16,
    marginTop: 4,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroName: { color: '#F8FAFC', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  heroAddress: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroAddressText: { color: '#475569', fontSize: 12 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  heroStat: { alignItems: 'center', gap: 3 },
  heroStatValue: { color: '#F8FAFC', fontSize: 16, fontWeight: '800' },
  heroStatLabel: { color: '#475569', fontSize: 10, fontWeight: '500' },
  heroStatDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.06)' },
  aiInsightCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  aiInsightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  aiInsightTitle: { color: '#A78BFA', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  aiInsightText: { color: '#CBD5E1', fontSize: 13, lineHeight: 19 },
  actionRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,41,59,0.8)',
    borderRadius: 14,
    paddingVertical: 13,
    gap: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  actionBtnBlue: {
    backgroundColor: '#3B82F6',
    borderColor: 'transparent',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionBtnText: { color: '#A78BFA', fontWeight: '700', fontSize: 14 },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: 'rgba(15,23,42,0.8)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: { backgroundColor: 'rgba(139,92,246,0.2)' },
  tabText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#A78BFA' },
  tabContent: { paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  emptySubtitle: { color: '#475569', fontSize: 13 },
  issueCard: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderLeftWidth: 3,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  issueType: { color: '#F1F5F9', fontWeight: '700', fontSize: 14 },
  severityBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  severityText: { fontSize: 11, fontWeight: '700' },
  issueDesc: { color: '#94A3B8', fontSize: 13, lineHeight: 18, marginBottom: 10 },
  issueMetaRow: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  issueMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  issueMetaText: { color: '#475569', fontSize: 12 },
  fixBox: {
    backgroundColor: 'rgba(30,41,59,0.6)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  fixLabel: { color: '#64748B', fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  fixText: { color: '#CBD5E1', fontSize: 12, lineHeight: 17, marginBottom: 6 },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  costText: { color: '#34D399', fontSize: 12, fontWeight: '600' },
  assignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52,211,153,0.1)',
    padding: 10,
    borderRadius: 10,
  },
  assignedText: { color: '#34D399', fontSize: 13, fontWeight: '600' },
  assignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 11,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  assignBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  bookingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  bookingLeft: { gap: 5 },
  bookingGuest: { color: '#F1F5F9', fontWeight: '700', fontSize: 14 },
  bookingDates: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bookingDateText: { color: '#475569', fontSize: 12 },
  bookingStatus: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  bookingStatusText: { fontSize: 12, fontWeight: '700' },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    position: 'relative',
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 12,
    zIndex: 1,
  },
  activityLine: {
    position: 'absolute',
    left: 4,
    top: 14,
    width: 2,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  activityContent: { flex: 1 },
  activityEvent: { color: '#CBD5E1', fontSize: 13, fontWeight: '500', marginBottom: 2 },
  activityTime: { color: '#475569', fontSize: 11 },
});
