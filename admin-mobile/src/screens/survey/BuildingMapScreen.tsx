import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { surveyApi, MapMarkerItem, DuplicateCheckResponse } from '../../api/surveyApi';
import { BuildingItem } from '../../types/survey';
import { surveyOffline } from '../../utils/surveyOffline';

const PAVAGADA_CENTER = { lat: 14.1025, lng: 77.2798 };

export const BuildingMapScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const webViewRef = useRef<WebView>(null);

  const [markers, setMarkers] = useState<MapMarkerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingDraftsCount, setPendingDraftsCount] = useState<number>(0);

  // Selected building from map click
  const [selectedBuilding, setSelectedBuilding] = useState<MapMarkerItem | BuildingItem | null>(null);

  // Dropped pin for new building
  const [droppedPin, setDroppedPin] = useState<{ lat: number; lng: number } | null>(null);
  const [proximityResult, setProximityResult] = useState<DuplicateCheckResponse | null>(null);
  const [checkingProximity, setCheckingProximity] = useState<boolean>(false);

  useEffect(() => {
    loadMarkers();
    checkPendingDrafts();
  }, [selectedType]);

  const checkPendingDrafts = async () => {
    const count = await surveyOffline.getPendingSyncCount();
    setPendingDraftsCount(count);
  };

  const loadMarkers = async () => {
    try {
      setLoading(true);
      const data = await surveyApi.getBuildingMarkers(selectedType, searchQuery);
      setMarkers(data);
      injectMarkersToMap(data);
    } catch (err: any) {
      console.warn('Failed to load map markers:', err);
    } finally {
      setLoading(false);
    }
  };

  const injectMarkersToMap = (markerList: MapMarkerItem[]) => {
    const script = `
      if (window.renderBuildingMarkers) {
        window.renderBuildingMarkers(${JSON.stringify(markerList)});
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  const handleMapMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MARKER_CLICK') {
        const bld = markers.find((m) => m.id === data.buildingId) || data.building;
        setSelectedBuilding(bld);
        setDroppedPin(null);
        setProximityResult(null);
      } else if (data.type === 'MAP_CLICK') {
        const { lat, lng } = data;
        setDroppedPin({ lat, lng });
        setSelectedBuilding(null);
        checkProximity(lat, lng);
      }
    } catch (e) {
      // ignore
    }
  };

  const checkProximity = async (lat: number, lng: number) => {
    try {
      setCheckingProximity(true);
      const result = await surveyApi.checkDuplicateBuilding({
        latitude: lat,
        longitude: lng,
        radiusMeters: 50,
      });
      setProximityResult(result);
    } catch (err) {
      // ignore
    } finally {
      setCheckingProximity(false);
    }
  };

  const handleSyncDrafts = async () => {
    setLoading(true);
    const res = await surveyOffline.syncAllPendingDrafts();
    setLoading(false);
    if (res.success) {
      Alert.alert(
        'Sync Complete',
        `Successfully synced ${res.syncedBuildings} buildings and ${res.syncedBusinesses} businesses to cloud!`
      );
      checkPendingDrafts();
      loadMarkers();
    } else {
      Alert.alert('Sync Result', `Synced with warnings. Errors: ${res.errors.join(', ')}`);
      checkPendingDrafts();
    }
  };

  const handleLocateMe = () => {
    const script = `
      if (window.panToCoordinates) {
        window.panToCoordinates(${PAVAGADA_CENTER.lat}, ${PAVAGADA_CENTER.lng}, 16);
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  // Generate Leaflet OpenStreetMap HTML
  const leafletHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #F8FAFC; }
        .custom-pin {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 16px;
          color: white;
          font-weight: bold;
          font-size: 13px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          border: 2px solid white;
        }
        .dropped-pin {
          background: #EF4444;
          width: 36px;
          height: 36px;
          border-radius: 18px;
          animation: bounce 0.6s infinite alternate;
        }
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-8px); }
        }
        .leaflet-control-attribution { font-size: 9px !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${PAVAGADA_CENTER.lat}, ${PAVAGADA_CENTER.lng}], 15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        var markersLayer = L.layerGroup().addTo(map);
        var droppedMarker = null;

        function getColorForType(type) {
          if (type === 'Commercial') return '#C65D3A';
          if (type === 'Residential') return '#10B981';
          if (type === 'Mixed-use') return '#6366F1';
          if (type === 'Government' || type === 'Institutional') return '#1E293B';
          if (type === 'Religious') return '#D97706';
          return '#64748B';
        }

        window.renderBuildingMarkers = function(list) {
          markersLayer.clearLayers();
          list.forEach(function(b) {
            var color = getColorForType(b.buildingType);
            var iconHtml = '<div class="custom-pin" style="background:' + color + '">🏢</div>';
            var customIcon = L.divIcon({
              html: iconHtml,
              className: '',
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });

            var m = L.marker([b.latitude, b.longitude], { icon: customIcon });
            m.on('click', function(e) {
              L.DomEvent.stopPropagation(e);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'MARKER_CLICK',
                buildingId: b.id,
                building: b
              }));
            });
            markersLayer.addLayer(m);
          });
        };

        map.on('click', function(e) {
          var lat = e.latlng.lat;
          var lng = e.latlng.lng;
          if (droppedMarker) {
            map.removeLayer(droppedMarker);
          }
          var dropHtml = '<div class="custom-pin dropped-pin">📍</div>';
          var dropIcon = L.divIcon({
            html: dropHtml,
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });
          droppedMarker = L.marker([lat, lng], { icon: dropIcon }).addTo(map);

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MAP_CLICK',
            lat: lat,
            lng: lng
          }));
        });

        window.panToCoordinates = function(lat, lng, zoom) {
          map.setView([lat, lng], zoom || 16, { animate: true });
        };
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Search & Filter Strip */}
      <View style={styles.topBar}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search building or locality in Pavagada..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={loadMarkers}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={loadMarkers}>
            <Text style={styles.searchBtnText}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['ALL', 'Commercial', 'Mixed-use', 'Residential', 'Institutional'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterPill, selectedType === type && styles.filterPillActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.filterPillText, selectedType === type && styles.filterPillTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sync Banner if pending */}
      {pendingDraftsCount > 0 && (
        <TouchableOpacity style={styles.syncBanner} onPress={handleSyncDrafts}>
          <Text style={styles.syncBannerText}>
            ☁️ {pendingDraftsCount} offline drafts ready. <Text style={styles.syncUnderline}>Tap to sync</Text>
          </Text>
        </TouchableOpacity>
      )}

      {/* Map WebView */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: leafletHtml }}
          style={styles.webView}
          onMessage={handleMapMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onLoadEnd={() => injectMarkersToMap(markers)}
        />

        {/* GPS Locate Button */}
        <TouchableOpacity style={styles.locateBtn} onPress={handleLocateMe} activeOpacity={0.8}>
          <Text style={styles.locateIcon}>🎯</Text>
        </TouchableOpacity>

        {/* Dashboard Shortcut Floating Button */}
        <TouchableOpacity
          style={styles.dashShortcutBtn}
          onPress={() => navigation.navigate('SurveyDashboard')}
          activeOpacity={0.8}
        >
          <Text style={styles.dashShortcutIcon}>📊</Text>
          <Text style={styles.dashShortcutText}>Survey Stats</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Drawer: Selected Existing Building */}
      {selectedBuilding && (
        <View style={styles.drawer}>
          <View style={styles.drawerHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeBadgeText}>{selectedBuilding.code}</Text>
                <Text style={styles.typeTag}>● {selectedBuilding.buildingType}</Text>
              </View>
              <Text style={styles.buildingTitle}>{selectedBuilding.name}</Text>
              {selectedBuilding.kannadaName && (
                <Text style={styles.buildingKannada}>{selectedBuilding.kannadaName}</Text>
              )}
              <Text style={styles.buildingAddress} numberOfLines={2}>
                📍 {selectedBuilding.address}
              </Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedBuilding(null)}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsStrip}>
            <Text style={styles.statItem}>🏬 {selectedBuilding.unitsCount || 0} Registered Units</Text>
            <Text style={styles.statItem}>🏢 {selectedBuilding.totalFloors || 1} Floors</Text>
            <Text style={styles.statItem}>
              🏷️ {(selectedBuilding as any).condition || (selectedBuilding as any).buildingCondition || 'Good'}
            </Text>
          </View>

          <View style={styles.drawerActions}>
            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => {
                const bId = selectedBuilding.id;
                setSelectedBuilding(null);
                navigation.navigate('BuildingDetail', { buildingId: bId });
              }}
            >
              <Text style={styles.actionBtnSecondaryText}>Explore Building</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() => {
                const bId = selectedBuilding.id;
                setSelectedBuilding(null);
                navigation.navigate('BusinessWizard', { buildingId: bId });
              }}
            >
              <Text style={styles.actionBtnPrimaryText}>+ Add Shop Here</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Drawer: Dropped Pin to Add New Building */}
      {droppedPin && !selectedBuilding && (
        <View style={styles.drawer}>
          <View style={styles.drawerHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.newPinTitle}>📍 Selected Coordinates</Text>
              <Text style={styles.coordsText}>
                {droppedPin.lat.toFixed(6)}° N, {droppedPin.lng.toFixed(6)}° E
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setDroppedPin(null);
                setProximityResult(null);
              }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Proximity / Duplicate Warning Banner */}
          {checkingProximity ? (
            <View style={styles.checkingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.checkingText}>Checking proximity for duplicates...</Text>
            </View>
          ) : proximityResult && proximityResult.isDuplicateSuspected ? (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>
                ⚠️ {proximityResult.matchCount} Building(s) Found Nearby (&lt;50m):
              </Text>
              {proximityResult.nearbyBuildings.slice(0, 2).map((nb) => (
                <TouchableOpacity
                  key={nb.id}
                  style={styles.existingMatchCard}
                  onPress={() => {
                    setSelectedBuilding(nb);
                    setDroppedPin(null);
                    setProximityResult(null);
                  }}
                >
                  <Text style={styles.matchName}>
                    {nb.name} ({nb.distanceMeters}m away)
                  </Text>
                  <Text style={styles.matchAddress} numberOfLines={1}>
                    {nb.address}
                  </Text>
                  <Text style={styles.matchAction}>Tap to view this building instead →</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.clearProximityBox}>
              <Text style={styles.clearProximityText}>
                ✓ No duplicate buildings detected within 50 meters. Ready to survey.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => {
              const coords = { ...droppedPin };
              setDroppedPin(null);
              setProximityResult(null);
              navigation.navigate('BuildingWizard', {
                initialLat: coords.lat,
                initialLng: coords.lng,
              });
            }}
          >
            <Text style={styles.actionBtnPrimaryText}>+ Map New Building Here</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 3,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  searchBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    fontSize: 16,
  },
  filterScroll: {
    marginTop: 8,
    flexDirection: 'row',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    marginRight: 6,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  syncBanner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  syncBannerText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  syncUnderline: {
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  locateBtn: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  locateIcon: {
    fontSize: 22,
  },
  dashShortcutBtn: {
    position: 'absolute',
    left: 16,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  dashShortcutIcon: {
    fontSize: 16,
  },
  dashShortcutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  drawer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  codeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: 'rgba(198, 93, 58, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  buildingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  buildingKannada: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  buildingAddress: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  statsStrip: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  statItem: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  drawerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSecondaryText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 13,
  },
  newPinTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  coordsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#64748B',
    marginTop: 2,
  },
  checkingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  checkingText: {
    fontSize: 11,
    color: '#64748B',
  },
  warningBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 6,
  },
  existingMatchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  matchName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  matchAddress: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  matchAction: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  clearProximityBox: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  clearProximityText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
  },
});
