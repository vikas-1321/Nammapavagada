import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { storage } from '../../utils/storage';
import { AppButton } from '../../components/common/AppButton';
import { AppTextInput } from '../../components/common/AppTextInput';
import { AppCard } from '../../components/common/AppCard';
import { AppBadge } from '../../components/common/AppBadge';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [apiUrl, setApiUrl] = useState<string>(apiClient.getBaseUrl());
  const [isTestingUrl, setIsTestingUrl] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const [savingUrl, setSavingUrl] = useState<boolean>(false);

  const handleTestConnection = async () => {
    try {
      setIsTestingUrl(true);
      setConnectionStatus({ status: 'idle', message: '' });

      // Save temporarily to test
      const prevUrl = apiClient.getBaseUrl();
      apiClient.setBaseUrl(apiUrl.trim());

      // Attempt ping to backend
      const res = await apiClient.request('/tags/grouped');
      if (res) {
        setConnectionStatus({
          status: 'success',
          message: 'Connected to Namma Pavagada Backend successfully!',
        });
      }
    } catch (err: any) {
      setConnectionStatus({
        status: 'error',
        message: err.message || 'Could not connect to backend server. Check IP and port.',
      });
    } finally {
      setIsTestingUrl(false);
    }
  };

  const handleSaveApiUrl = async () => {
    try {
      setSavingAction(true);
      const cleanUrl = apiUrl.trim();
      apiClient.setBaseUrl(cleanUrl);
      await storage.setItem('npweb_custom_api_url', cleanUrl);
      Alert.alert('Settings Saved', `Active API endpoint set to: ${cleanUrl}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to persist API URL');
    } finally {
      setSavingAction(false);
    }
  };

  const [savingAction, setSavingAction] = useState(false);

  const handlePresetSelect = (preset: string) => {
    setApiUrl(preset);
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Local Cache',
      'This will remove cached taxonomy metadata and locally drafted items. Authenticated credentials will remain intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            try {
              await storage.removeItem('npweb_draft_place');
              Alert.alert('Cache Cleared', 'Local offline data reset.');
            } catch {
              Alert.alert('Notice', 'Cache already clean.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Confirm Sign Out', 'Are you sure you want to log out of the Admin CMS?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Profile & Settings</Text>
        <Text style={styles.headerSubtitle}>
          Namma Pavagada Ground-Truth Data Collection
        </Text>
      </View>

      <View style={styles.content}>
        {/* Administrator Profile Card */}
        <AppCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.adminName}>{user?.fullName || user?.name || 'Administrator'}</Text>
              <Text style={styles.adminEmail}>{user?.email || 'admin@nammapavagada.in'}</Text>
              <View style={styles.badgeRow}>
                <AppBadge label={user?.role?.toUpperCase() || 'SUPER_ADMIN'} variant="success" size="sm" />
                <AppBadge label="Pavagada HQ" variant="neutral" size="sm" />
              </View>
            </View>
          </View>
        </AppCard>

        {/* Backend API Configuration */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.cardTitle}>🌐 Backend Connection Config</Text>
          <Text style={styles.cardDesc}>
            Configure the host URL for the existing Python/Flask REST API (Port 5000).
          </Text>

          <AppTextInput
            label="API Base URL"
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="http://10.0.2.2:5000/api"
            helperText="Include http:// or https:// and /api suffix"
          />

          {/* Quick Presets */}
          <Text style={styles.presetLabel}>Quick Host Presets:</Text>
          <View style={styles.presetRow}>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handlePresetSelect('http://10.0.2.2:5000/api')}
            >
              <Text style={styles.presetChipText}>Android Emulator (10.0.2.2)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handlePresetSelect('http://localhost:5000/api')}
            >
              <Text style={styles.presetChipText}>Localhost / iOS (5000)</Text>
            </TouchableOpacity>
          </View>

          {/* Connection Test Status Banner */}
          {connectionStatus.message ? (
            <View
              style={[
                styles.statusBanner,
                connectionStatus.status === 'success'
                  ? styles.statusSuccess
                  : styles.statusError,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  connectionStatus.status === 'success'
                    ? styles.statusTextSuccess
                    : styles.statusTextError,
                ]}
              >
                {connectionStatus.status === 'success' ? '✓ ' : '✕ '}
                {connectionStatus.message}
              </Text>
            </View>
          ) : null}

          <View style={styles.apiButtonRow}>
            <AppButton
              title={isTestingUrl ? 'Testing...' : 'Test Connection'}
              variant="outline"
              size="sm"
              loading={isTestingUrl}
              onPress={handleTestConnection}
              style={{ flex: 1, marginRight: 8 }}
            />
            <AppButton
              title="Apply URL"
              variant="primary"
              size="sm"
              loading={savingAction}
              onPress={handleSaveApiUrl}
              style={{ flex: 1 }}
            />
          </View>
        </AppCard>

        {/* System & Architecture Info */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.cardTitle}>ℹ️ System Specifications</Text>

          <View style={styles.specRow}>
            <Text style={styles.specKey}>Application</Text>
            <Text style={styles.specVal}>Namma Pavagada Admin Mobile CMS</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Framework</Text>
            <Text style={styles.specVal}>React Native 0.76 + TypeScript</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Architecture</Text>
            <Text style={styles.specVal}>Frontend Only (Zero Duplicate APIs)</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Backend Engine</Text>
            <Text style={styles.specVal}>Python / Flask REST (Existing Port 5000)</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Re-verification Cycle</Text>
            <Text style={styles.specVal}>180 Days (Freshness Barometer)</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Jurisdiction</Text>
            <Text style={styles.specVal}>Pavagada Taluk, Tumakuru District, KA</Text>
          </View>
        </AppCard>

        {/* Data & Cache Actions */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.cardTitle}>🧹 Data & Cache</Text>
          <Text style={styles.cardDesc}>
            Clear temporary drafts and offline session storage if experiencing stale data.
          </Text>
          <AppButton
            title="Reset Local Cache"
            variant="outline"
            size="sm"
            onPress={handleClearCache}
          />
        </AppCard>

        {/* Logout Button */}
        <View style={styles.logoutWrapper}>
          <AppButton
            title="Sign Out of Admin Console"
            variant="danger"
            onPress={handleLogout}
          />
        </View>

        <Text style={styles.footerNote}>
          Namma Pavagada Platform • Authorized Administrator Tool
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  content: {
    padding: 14,
  },
  profileCard: {
    marginBottom: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  adminEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sectionCard: {
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 6,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  presetChipText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  apiButtonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  statusBanner: {
    padding: 10,
    borderRadius: 6,
    marginVertical: 8,
  },
  statusSuccess: {
    backgroundColor: colors.success + '15',
    borderWidth: 1,
    borderColor: colors.success,
  },
  statusError: {
    backgroundColor: colors.danger + '15',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextSuccess: {
    color: colors.success,
  },
  statusTextError: {
    color: colors.danger,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  specKey: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  specVal: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  logoutWrapper: {
    marginTop: 10,
    marginBottom: 16,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 24,
  },
});
