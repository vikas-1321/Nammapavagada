import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { AppTextInput } from '../../components/common/AppTextInput';
import { AppButton } from '../../components/common/AppButton';
import { apiClient } from '../../api/client';
import { storage } from '../../utils/storage';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@nammapavagada.com');
  const [password, setPassword] = useState('PavagadaAdmin@2026');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Server URL Configuration Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [serverUrl, setServerUrl] = useState(apiClient.getBaseUrl());
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setServerUrl(apiClient.getBaseUrl());
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = () => {
    setEmail('admin@nammapavagada.com');
    setPassword('PavagadaAdmin@2026');
    setErrorMessage(null);
  };

  const handleTestConnection = async () => {
    try {
      setIsTestingUrl(true);
      setTestStatus(null);

      const target = serverUrl.trim();
      const testEndpoint = `${target.endsWith('/') ? target.slice(0, -1) : target}/health`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(testEndpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        setTestStatus({
          success: true,
          message: 'Connected successfully to Namma Pavagada Backend!',
        });
      } else {
        setTestStatus({
          success: false,
          message: `Server reachable but returned HTTP ${response.status}`,
        });
      }
    } catch (err: any) {
      setTestStatus({
        success: false,
        message: err.message || 'Could not connect. Verify your phone and PC are on the same Wi-Fi, or check IP/port.',
      });
    } finally {
      setIsTestingUrl(false);
    }
  };

  const handleSaveServerUrl = async () => {
    try {
      const cleanUrl = serverUrl.trim();
      apiClient.setBaseUrl(cleanUrl);
      await storage.setItem('npweb_custom_api_url', cleanUrl);
      setShowConfigModal(false);
      setTestStatus(null);
      setErrorMessage(null);
      Alert.alert('Server Updated', `Active API endpoint set to:\n${cleanUrl}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save server URL.');
    }
  };

  const currentHost = apiClient.getBaseUrl();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>NP</Text>
          </View>
          <Text style={styles.appTitle}>Namma Pavagada</Text>
          <Text style={styles.appSubtitle}>Admin CMS & Field Data Collection</Text>
          <View style={styles.divider} />
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Administrator Sign In</Text>
          <Text style={styles.cardSubtitle}>
            Authorized taluk editors and field officers access only.
          </Text>

          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.errorText}>{errorMessage}</Text>
                <TouchableOpacity
                  onPress={() => setShowConfigModal(true)}
                  style={styles.changeServerLink}
                >
                  <Text style={styles.changeServerLinkText}>⚙️ Tap to Change Server IP / URL →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <AppTextInput
            label="Admin Email"
            required
            placeholder="admin@nammapavagada.com"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setErrorMessage(null);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <AppTextInput
            label="Password"
            required
            placeholder="••••••••••••"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setErrorMessage(null);
            }}
            secureTextEntry
          />

          <AppButton
            title="Sign In to CMS"
            size="large"
            loading={loading}
            onPress={handleLogin}
            style={styles.loginBtn}
          />

          {/* Development Quick Fill */}
          <TouchableOpacity onPress={fillQuickCredentials} style={styles.quickFillBtn}>
            <Text style={styles.quickFillText}>
              💡 Fill Default Super Admin Credentials
            </Text>
          </TouchableOpacity>

          {/* Server URL Config Trigger */}
          <TouchableOpacity
            onPress={() => setShowConfigModal(true)}
            style={styles.serverInfoBtn}
          >
            <Text style={styles.serverInfoLabel}>🌐 Server Endpoint:</Text>
            <Text style={styles.serverInfoValue} numberOfLines={1}>
              {currentHost}
            </Text>
            <Text style={styles.serverInfoChange}>⚙️ Edit</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Pavagada Taluk Civic Data Platform • Secured by JWT & Audit Logging
        </Text>
      </ScrollView>

      {/* Server Config Modal */}
      <Modal visible={showConfigModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚙️ Backend Server Connection</Text>
              <TouchableOpacity onPress={() => setShowConfigModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDesc}>
                Connect this mobile app to your Local Development PC, AWS Cloud, or Custom Server.
              </Text>

              <AppTextInput
                label="API Base URL"
                value={serverUrl}
                onChangeText={(t) => {
                  setServerUrl(t);
                  setTestStatus(null);
                }}
                placeholder="https://3-6-201-177.sslip.io/api"
                helperText="Must include https:// or http:// and /api suffix"
              />

              {/* Quick Presets */}
              <Text style={styles.presetsLabel}>Quick Presets:</Text>
              <View style={styles.presetsWrap}>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => {
                    setServerUrl('https://3-6-201-177.sslip.io/api');
                    setTestStatus(null);
                  }}
                >
                  <Text style={styles.presetChipText}>🌐 AWS Cloud (HTTPS SSL)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => {
                    setServerUrl('http://10.119.131.75:5000/api');
                    setTestStatus(null);
                  }}
                >
                  <Text style={styles.presetChipText}>💻 Local PC Wi-Fi (10.119.131.75)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => {
                    setServerUrl('http://10.0.2.2:5000/api');
                    setTestStatus(null);
                  }}
                >
                  <Text style={styles.presetChipText}>📱 PC Emulator (10.0.2.2)</Text>
                </TouchableOpacity>
              </View>

              {/* Status Banner */}
              {testStatus && (
                <View
                  style={[
                    styles.testStatusBanner,
                    testStatus.success ? styles.testStatusSuccess : styles.testStatusError,
                  ]}
                >
                  <Text
                    style={[
                      styles.testStatusText,
                      testStatus.success ? styles.testStatusTextSuccess : styles.testStatusTextError,
                    ]}
                  >
                    {testStatus.success ? '✓ ' : '✕ '}
                    {testStatus.message}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <AppButton
                title={isTestingUrl ? 'Testing...' : 'Test Connection'}
                variant="outline"
                size="sm"
                loading={isTestingUrl}
                onPress={handleTestConnection}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton
                title="Apply & Save"
                variant="primary"
                size="sm"
                onPress={handleSaveServerUrl}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textMain,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  errorText: {
    fontSize: 13,
    color: colors.dangerDark,
    fontWeight: '600',
    lineHeight: 18,
  },
  changeServerLink: {
    marginTop: 6,
  },
  changeServerLinkText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  loginBtn: {
    marginTop: 8,
  },
  quickFillBtn: {
    marginTop: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  quickFillText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  serverInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 14,
  },
  serverInfoLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginRight: 4,
  },
  serverInfoValue: {
    flex: 1,
    fontSize: 11,
    color: colors.textMain,
    fontWeight: '700',
  },
  serverInfoChange: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 6,
  },
  footerText: {
    fontSize: 11,
    color: colors.textSubtle,
    textAlign: 'center',
    marginTop: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
  },
  modalBody: {
    padding: 16,
  },
  modalDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 18,
  },
  presetsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 6,
  },
  presetsWrap: {
    gap: 6,
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  presetChipText: {
    fontSize: 11,
    color: colors.textMain,
    fontWeight: '600',
  },
  testStatusBanner: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  testStatusSuccess: {
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.success,
  },
  testStatusError: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  testStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  testStatusTextSuccess: {
    color: colors.success,
  },
  testStatusTextError: {
    color: colors.dangerDark,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
