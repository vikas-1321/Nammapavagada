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
  Image,
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
      // 1. Fetch remote markers (safely returns [] if not reachable or not migrated)
      let serverMarkers: MapMarkerItem[] = [];
      try {
        serverMarkers = await surveyApi.getBuildingMarkers(selectedType, searchQuery);
      } catch {
        serverMarkers = [];
      }

      // 2. Fetch local offline building drafts and map them to markers
      let draftMarkers: MapMarkerItem[] = [];
      try {
        const drafts = await surveyOffline.getDrafts();
        draftMarkers = drafts
          .filter((d) => d.type === 'BUILDING' && d.data && d.data.latitude && d.data.longitude)
          .map((d) => ({
            id: d.id,
            code: d.data.code || 'DRAFT',
            name: `${d.data.name || 'Untitled Building'} (Offline Draft)`,
            kannadaName: d.data.kannadaName,
            latitude: Number(d.data.latitude),
            longitude: Number(d.data.longitude),
            buildingType: d.data.buildingType || 'COMMERCIAL',
            commercialSubtype: d.data.commercialSubtype,
            address: d.data.address || 'Local draft building',
            area: d.data.area,
            condition: d.data.condition,
            unitsCount: d.data.unitsCount || (d.data.units ? d.data.units.length : 0),
            totalFloors: d.data.totalFloors || 1,
          }));
      } catch {
        draftMarkers = [];
      }

      // 3. Merge server markers with local draft markers (deduplicate strictly by point)
      const existingIds = new Set(serverMarkers.map((m) => m.id));
      const isPointOccupiedByServer = (lat: number, lng: number) => {
        return serverMarkers.some(
          (sm) => Math.abs(sm.latitude - lat) < 0.00005 && Math.abs(sm.longitude - lng) < 0.00005
        );
      };

      const seenPoints = new Set<string>();
      const validDraftMarkers: MapMarkerItem[] = [];

      for (const dm of draftMarkers) {
        if (existingIds.has(dm.id)) continue;
        if (isPointOccupiedByServer(dm.latitude, dm.longitude)) {
          // If server already has a building at this point, delete stale draft
          surveyOffline.deleteDraft(dm.id);
          continue;
        }

        const ptKey = `${dm.latitude.toFixed(5)}_${dm.longitude.toFixed(5)}`;
        if (seenPoints.has(ptKey)) {
          // Duplicate draft for same point: remove redundant draft
          surveyOffline.deleteDraft(dm.id);
          continue;
        }
        seenPoints.add(ptKey);
        validDraftMarkers.push(dm);
      }

      const allMarkers = [...serverMarkers, ...validDraftMarkers];

      setMarkers(allMarkers);
      injectMarkersToMap(allMarkers);
    } catch {
      setMarkers([]);
      injectMarkersToMap([]);
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

  const handleCloseDrawer = () => {
    setSelectedBuilding(null);
    webViewRef.current?.injectJavaScript('window.clearSelectedMarker && window.clearSelectedMarker(); true;');
  };

  const handleDeleteBuilding = (bld: MapMarkerItem | BuildingItem) => {
    const bizCount = bld.businessesCount || 0;
    const unitsCount = bld.unitsCount || 0;
    const floorsCount = bld.totalFloors || (bld as any).floorsCount || 1;

    let warningMsg = `Are you sure you want to delete / archive "${bld.name}"?\n\nFloors: ${floorsCount} • Units: ${unitsCount} • Registered Businesses: ${bizCount}`;
    if (bizCount > 0) {
      warningMsg += `\n\n⚠️ Note: This building has ${bizCount} registered business(es). The building will be safely archived to preserve all business and research data.`;
    }

    Alert.alert(
      'Delete Building?',
      warningMsg,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive Building',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const res = await surveyApi.deleteBuilding(bld.id, true);
              if (res.archived || res.deleted) {
                Alert.alert(
                  'Building Archived',
                  `"${bld.name}" was successfully archived.${
                    res.businessesPreserved ? ` ${res.businessesPreserved} business records preserved.` : ''
                  }`
                );
                const updated = markers.filter((m) => m.id !== bld.id);
                setMarkers(updated);
                setSelectedBuilding(null);
                injectMarkersToMap(updated);
                webViewRef.current?.injectJavaScript('window.clearSelectedMarker && window.clearSelectedMarker(); true;');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to archive building');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Generate Leaflet OpenStreetMap / Google Maps Inspired HTML
  const leafletHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #F8FAFC; overflow: hidden; }

        /* Minimal GIS Circular Dot Marker */
        .gis-dot-wrapper {
          position: relative;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .gis-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          border: 1.5px solid #FFFFFF;
          box-shadow: 0 1px 4px rgba(0,0,0,0.32);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .gis-dot:hover {
          transform: scale(1.25);
        }

        /* Selected Building Glowing Ring / Halo */
        .gis-dot-wrapper.selected .gis-dot {
          width: 13px;
          height: 13px;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 0 4px rgba(198, 93, 58, 0.45), 0 2px 8px rgba(0, 0, 0, 0.4);
          transform: scale(1.15);
        }

        /* Dynamic Zoom-Aware Building Label */
        .gis-label {
          position: absolute;
          left: 17px;
          top: 50%;
          transform: translateY(-50%);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-weight: 700;
          color: #1E293B;
          background: rgba(255, 255, 255, 0.95);
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid rgba(203, 213, 225, 0.9);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
          pointer-events: none;
          display: none;
        }
        .gis-dot-wrapper.selected .gis-label {
          background: #1E293B;
          color: #FFFFFF;
          border-color: #0F172A;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
          z-index: 9999;
        }

        /* Professional Cluster Badges (Real building count at low zoom) */
        .gis-cluster-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gis-cluster-circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #1E293B;
          color: #FFFFFF;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: -0.2px;
          cursor: pointer;
        }
        .gis-cluster-circle.cluster-large {
          background: #C65D3A;
        }

        /* Dropped Pin */
        .dropped-pin {
          background: #EF4444;
          width: 24px;
          height: 24px;
          border-radius: 12px;
          border: 2px solid white;
          box-shadow: 0 3px 8px rgba(239, 68, 68, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 13px;
          animation: bounce 0.6s infinite alternate;
        }
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-7px); }
        }
        .leaflet-control-attribution { font-size: 9px !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize Map centered on Pavagada
        var map = L.map('map', { zoomControl: false }).setView([${PAVAGADA_CENTER.lat}, ${PAVAGADA_CENTER.lng}], 15);

        // Professional Clean Street Tile Layer (Carto Voyager clean pastel with OSM fallback)
        var primaryTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          subdomains: 'abcd',
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        });
        primaryTiles.addTo(map);

        // Marker layer / Cluster group
        var hasClusterLib = (typeof L.markerClusterGroup === 'function');
        var markersGroup = hasClusterLib
          ? L.markerClusterGroup({
              maxClusterRadius: 36,
              disableClusteringAtZoom: 15,
              spiderfyOnMaxZoom: false,
              showCoverageOnHover: false,
              zoomToBoundsOnClick: true,
              iconCreateFunction: function(cluster) {
                var count = cluster.getChildCount();
                var size = count < 10 ? 28 : count < 50 ? 32 : 38;
                var cls = count >= 20 ? 'gis-cluster-circle cluster-large' : 'gis-cluster-circle';
                return L.divIcon({
                  html: '<div class="' + cls + '"><span>' + count + '</span></div>',
                  className: 'gis-cluster-wrap',
                  iconSize: [size, size],
                  iconAnchor: [size / 2, size / 2]
                });
              }
            })
          : L.layerGroup();

        map.addLayer(markersGroup);

        var droppedMarker = null;
        var markersList = [];
        var currentSelectedId = null;

        function getColorForType(type) {
          if (type === 'Commercial') return '#C65D3A';
          if (type === 'Residential') return '#10B981';
          if (type === 'Mixed-use') return '#6366F1';
          if (type === 'Religious') return '#D97706';
          if (type === 'Institutional' || type === 'Educational') return '#0284C7';
          if (type === 'Government') return '#1E293B';
          if (type === 'Healthcare') return '#EC4899';
          return '#64748B';
        }

        function escapeHtml(str) {
          if (!str) return '';
          return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        }

        var updateScheduled = false;
        function scheduleUpdateLabels() {
          if (!updateScheduled) {
            updateScheduled = true;
            requestAnimationFrame(function() {
              updateScheduled = false;
              updateLabels();
            });
          }
        }

        function updateLabels() {
          var zoom = map.getZoom();
          var bounds = map.getBounds();

          // Low zoom (< 15): clusters or small dots ONLY. No labels unless selected.
          if (zoom < 15) {
            markersList.forEach(function(item) {
              if (item.labelEl) {
                if (item.id === currentSelectedId && zoom >= 14) {
                  item.labelEl.style.display = 'block';
                  item.labelEl.style.fontSize = '10px';
                  item.labelEl.style.maxWidth = '100px';
                } else {
                  item.labelEl.style.display = 'none';
                }
              }
            });
            return;
          }

          // Adaptive font size & max-width based on zoom level
          var fontSize = '10px';
          var maxWidth = '110px';
          if (zoom >= 18) {
            fontSize = '11.5px';
            maxWidth = '160px';
          } else if (zoom >= 17) {
            fontSize = '11px';
            maxWidth = '135px';
          }

          var placedBoxes = [];

          // Visible markers in viewport
          var visible = markersList.filter(function(item) {
            return bounds.contains(L.latLng(item.lat, item.lng));
          });

          // Selected marker gets highest priority #1
          visible.sort(function(a, b) {
            if (a.id === currentSelectedId) return -1;
            if (b.id === currentSelectedId) return 1;
            return 0;
          });

          visible.forEach(function(item) {
            var labelEl = item.labelEl;
            if (!labelEl) return;

            labelEl.style.fontSize = fontSize;
            labelEl.style.maxWidth = maxWidth;

            var pt = map.latLngToContainerPoint([item.lat, item.lng]);

            var dotBox = {
              x1: pt.x - 8,
              y1: pt.y - 8,
              x2: pt.x + 8,
              y2: pt.y + 8
            };

            var approxCharWidth = (zoom >= 18 ? 6.8 : zoom >= 17 ? 6.2 : 5.6);
            var approxW = Math.min(parseInt(maxWidth, 10), item.name.length * approxCharWidth + 14);
            var approxH = (zoom >= 18 ? 20 : zoom >= 17 ? 18 : 16);
            var labelBox = {
              x1: pt.x + 12,
              y1: pt.y - approxH / 2,
              x2: pt.x + 12 + approxW,
              y2: pt.y + approxH / 2
            };

            // Selected building: ALWAYS visible
            if (item.id === currentSelectedId) {
              labelEl.style.display = 'block';
              placedBoxes.push(dotBox);
              placedBoxes.push(labelBox);
              return;
            }

            // Collision check against already placed dots and labels
            var collides = false;
            for (var i = 0; i < placedBoxes.length; i++) {
              var pb = placedBoxes[i];
              if (labelBox.x1 - 4 < pb.x2 && labelBox.x2 + 4 > pb.x1 &&
                  labelBox.y1 - 2 < pb.y2 && labelBox.y2 + 2 > pb.y1) {
                collides = true;
                break;
              }
            }

            if (collides) {
              labelEl.style.display = 'none';
              placedBoxes.push(dotBox);
            } else {
              labelEl.style.display = 'block';
              placedBoxes.push(dotBox);
              placedBoxes.push(labelBox);
            }
          });

          // Hide markers out of viewport
          markersList.forEach(function(item) {
            if (!bounds.contains(L.latLng(item.lat, item.lng)) && item.labelEl) {
              item.labelEl.style.display = 'none';
            }
          });
        }

        map.on('moveend zoomend', scheduleUpdateLabels);

        window.renderBuildingMarkers = function(list) {
          markersGroup.clearLayers();
          markersList = [];

          list.forEach(function(b) {
            var color = getColorForType(b.buildingType);
            var isSelected = (b.id === currentSelectedId);
            var html = '<div class="gis-dot-wrapper' + (isSelected ? ' selected' : '') + '" id="wrap-' + b.id + '">' +
                       '  <div class="gis-dot" style="background-color: ' + color + ';"></div>' +
                       '  <div class="gis-label" id="label-' + b.id + '">' + escapeHtml(b.name) + '</div>' +
                       '</div>';

            var customIcon = L.divIcon({
              html: html,
              className: '',
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            });

            var m = L.marker([b.latitude, b.longitude], { icon: customIcon });
            m.on('click', function(e) {
              L.DomEvent.stopPropagation(e);
              selectMarker(b.id);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'MARKER_CLICK',
                buildingId: b.id,
                building: b
              }));
            });
            markersGroup.addLayer(m);

            markersList.push({
              id: b.id,
              name: b.name,
              buildingType: b.buildingType,
              lat: b.latitude,
              lng: b.longitude,
              marker: m,
              el: null,
              labelEl: null
            });
          });

          setTimeout(function() {
            markersList.forEach(function(item) {
              item.el = document.getElementById('wrap-' + item.id);
              item.labelEl = document.getElementById('label-' + item.id);
            });
            updateLabels();
          }, 80);
        };

        function selectMarker(buildingId) {
          currentSelectedId = buildingId;
          markersList.forEach(function(item) {
            if (item.el) {
              if (item.id === buildingId) {
                item.el.classList.add('selected');
              } else {
                item.el.classList.remove('selected');
              }
            }
          });
          scheduleUpdateLabels();
        }

        window.clearSelectedMarker = function() {
          currentSelectedId = null;
          markersList.forEach(function(item) {
            if (item.el) {
              item.el.classList.remove('selected');
            }
          });
          scheduleUpdateLabels();
        };

        map.on('click', function(e) {
          var lat = e.latlng.lat;
          var lng = e.latlng.lng;
          if (droppedMarker) {
            map.removeLayer(droppedMarker);
          }
          var dropHtml = '<div class="dropped-pin">📍</div>';
          var dropIcon = L.divIcon({
            html: dropHtml,
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
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
          {['ALL', 'Commercial', 'Mixed-use', 'Residential', 'Religious', 'Institutional'].map((type) => (
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
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeBadgeText}>{selectedBuilding.code}</Text>
                <Text style={styles.typeTag}>● {selectedBuilding.buildingType}</Text>
                {Boolean((selectedBuilding as any).verificationStatus || (selectedBuilding as any).locationVerificationStatus) && (
                  <View
                    style={[
                      styles.verifyBadge,
                      ((selectedBuilding as any).verificationStatus || (selectedBuilding as any).locationVerificationStatus) === 'VERIFIED'
                        ? styles.verifyBadgeGreen
                        : styles.verifyBadgeAmber,
                    ]}
                  >
                    <Text
                      style={[
                        styles.verifyBadgeText,
                        ((selectedBuilding as any).verificationStatus || (selectedBuilding as any).locationVerificationStatus) === 'VERIFIED'
                          ? styles.verifyTextGreen
                          : styles.verifyTextAmber,
                      ]}
                    >
                      {(selectedBuilding as any).verificationStatus || (selectedBuilding as any).locationVerificationStatus}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.buildingTitle}>{selectedBuilding.name}</Text>
              {selectedBuilding.kannadaName && (
                <Text style={styles.buildingKannada}>{selectedBuilding.kannadaName}</Text>
              )}
              <Text style={styles.buildingAddress} numberOfLines={2}>
                📍 {selectedBuilding.address}
                {selectedBuilding.area ? `, ${selectedBuilding.area}` : ''}
              </Text>
            </View>

            <View style={styles.drawerRightCol}>
              <TouchableOpacity style={styles.closeBtn} onPress={handleCloseDrawer}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
              {selectedBuilding.primaryPhotoUrl ? (
                <Image
                  source={{ uri: selectedBuilding.primaryPhotoUrl }}
                  style={styles.buildingThumb}
                  resizeMode="cover"
                />
              ) : null}
            </View>
          </View>

          <View style={styles.statsStrip}>
            <Text style={styles.statItem}>🏢 {selectedBuilding.totalFloors || 1} Floors</Text>
            <Text style={styles.statItem}>🏬 {selectedBuilding.unitsCount || 0} Units</Text>
            <Text style={styles.statItem}>🛍️ {selectedBuilding.businessesCount || 0} Shops</Text>
            <Text style={styles.statItem}>
              🏷️ {(selectedBuilding as any).condition || (selectedBuilding as any).buildingCondition || 'Good'}
            </Text>
          </View>

          {/* 3 Clear Primary Actions: View Details, Edit Building, Delete Building */}
          <View style={styles.drawerActions}>
            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => {
                const bId = selectedBuilding.id;
                handleCloseDrawer();
                navigation.navigate('BuildingDetail', { buildingId: bId });
              }}
            >
              <Text style={styles.actionBtnSecondaryText}>👁️ View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => {
                const bId = selectedBuilding.id;
                handleCloseDrawer();
                navigation.navigate('BuildingWizard', { buildingId: bId });
              }}
            >
              <Text style={styles.actionBtnSecondaryText}>✏️ Edit Building</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnDanger}
              onPress={() => handleDeleteBuilding(selectedBuilding)}
            >
              <Text style={styles.actionBtnDangerText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>

          {/* Quick shortcut to add a business */}
          <TouchableOpacity
            style={styles.addShopShortcutBtn}
            onPress={() => {
              const bId = selectedBuilding.id;
              handleCloseDrawer();
              navigation.navigate('BusinessWizard', { buildingId: bId });
            }}
          >
            <Text style={styles.addShopShortcutText}>+ Register Shop in this Building</Text>
          </TouchableOpacity>
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
  drawerRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  buildingThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  verifyBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  verifyBadgeGreen: {
    backgroundColor: '#DCFCE7',
  },
  verifyBadgeAmber: {
    backgroundColor: '#FEF3C7',
  },
  verifyBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  verifyTextGreen: {
    color: '#166534',
  },
  verifyTextAmber: {
    color: '#B45309',
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
    gap: 8,
    marginTop: 12,
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSecondaryText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 12,
  },
  actionBtnDanger: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDangerText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
  },
  addShopShortcutBtn: {
    marginTop: 8,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: 'rgba(198, 93, 58, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(198, 93, 58, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addShopShortcutText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
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
