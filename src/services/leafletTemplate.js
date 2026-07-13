export const generateLeafletHTML = (LEAFLET_CSS, LEAFLET_JS_BASE64) => `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    
    <style>
        ${LEAFLET_CSS}
    </style>
    
    <style>
        body { margin: 0; padding: 0; background: #f5f5f5; }
        #map { height: 100vh; width: 100vw; }
        
        /* Controles e UI */
        .leaflet-control-zoom { display: none; }
        .leaflet-control-attribution { font-size: 8px; opacity: 0.6; }
        
        /* Estilo da Rota */
        .route-line {
            stroke: #2563EB;
            stroke-width: 5;
            stroke-opacity: 0.8;
            fill: none;
        }
        
        /* Marcador de Destino */
        .destination-marker {
            width: 24px;
            height: 24px;
            background: #ffffff;
            border-radius: 50%;
            border: 3px solid #2563EB;
            box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .destination-marker::after {
            content: '';
            width: 8px;
            height: 8px;
            background: #2563EB;
            border-radius: 50%;
        }
        
        /* Marcador do Usuário - Compacto e Preciso */
        .user-marker-container {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
        }
        
        /* Círculo de Fundo Azul (Menor) */
        .marker-circle {
            position: absolute;
            width: 36px;
            height: 36px;
            background: #2563EB;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Ponteiro Alongado (Seta Direcional) */
        .direction-pointer-svg {
            width: 18px;
            height: 18px;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25));
        }

        /* Marcador de Empresa/Terminal */
        .company-marker-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
        }
        
        .company-logo-badge {
            width: 36px;
            height: 36px;
            background: #F1F5F9;
            border-radius: 50%;
            border: 1px solid #E2E8F0;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .company-logo-text {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 15px;
            font-weight: 700;
            color: #475569;
        }
        
        .company-logo-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    </style>
</head>
<body>
    <div id="map"></div>

    <script src="data:text/javascript;base64,${LEAFLET_JS_BASE64}"></script>

    <script>
        // Inicia o mapa com configurações otimizadas de drag
        var map = L.map('map', { 
            zoomControl: false,
            dragging: true,
            touchZoom: true,
            doubleClickZoom: true,
            scrollWheelZoom: true,
            boxZoom: true,
            keyboard: true,
            tap: true,
            tapTolerance: 15,
            inertia: true,
            inertiaDeceleration: 3000,
            inertiaMaxSpeed: Infinity,
            worldCopyJump: false
        }).setView([0, 0], 16);
        
        window.map = map;

        // Camada do Mapa: CartoDB Light
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            subdomains: 'abcd',
            attribution: '© OSM, © Carto'
        }).addTo(map);

        // Cria ícone compacto estilo navegação (36px)
        var userIcon = L.divIcon({
            className: 'user-marker-container',
            html: '<div class="marker-circle"><svg class="direction-pointer-svg" viewBox="0 0 24 24"><path fill="#ffffff" d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" /></svg></div>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        var userMarker = L.marker([0, 0], {icon: userIcon}).addTo(map);
        userMarker.setZIndexOffset(1000);

        // Variáveis para rota
        var currentRoute = null;
        var alternativeRoute = null;
        var destinationMarker = null;
        var currentRouteCoords = null;
        var alternativeRouteCoords = null;
        var routeStartIndex = 0;
        var activeRouteIndex = 0; 
        var mainRouteStats = null;
        var alternativeRouteStats = null;

        // Detecta quando usuário arrasta o mapa manualmente
        map.on('dragstart', function() {
            if (Date.now() - mapLoadTime < 2000) {
                // console.log('DRAG IGNORED - Still initializing');
                return;
            }
            isCurrentlyDragging = true; 
            isFollowingUserLocal = false;
            window.ReactNativeWebView.postMessage('USER_DRAGGED_MAP');
        });
        
        map.on('dragend', function() {
            isCurrentlyDragging = false; 
        });
        
        map.on('zoomstart', function() {
            if (Date.now() - mapLoadTime < 2000) {
                return;
            }
            isFollowingUserLocal = false;
            window.ReactNativeWebView.postMessage('USER_DRAGGED_MAP');
        });

        // EVENTO DE CLIQUE NO MAPA - Traça Rota
        map.on('click', function(e) {
            var destLat = e.latlng.lat;
            var destLng = e.latlng.lng;
            drawRoute(destLat, destLng, false);
        });

        // Função para calcular distância
        function getDistance(lat1, lng1, lat2, lng2) {
            var R = 6371000;
            var dLat = (lat2 - lat1) * Math.PI / 180;
            var dLng = (lng2 - lng1) * Math.PI / 180;
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLng/2) * Math.sin(dLng/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }

        function findClosestPointOnRoute(userPos) {
            if (!currentRouteCoords || currentRouteCoords.length === 0) return 0;
            var minDist = Infinity;
            var closestIndex = routeStartIndex;
            for (var i = routeStartIndex; i < currentRouteCoords.length; i++) {
                var dist = getDistance(userPos.lat, userPos.lng, currentRouteCoords[i][0], currentRouteCoords[i][1]);
                if (dist < minDist) {
                    minDist = dist;
                    closestIndex = i;
                }
                if (dist > minDist + 50) break;
            }
            return closestIndex;
        }

        function updateRouteProgress(userPos) {
            var closestIndex = findClosestPointOnRoute(userPos);
            var distFromStart = getDistance(
                userPos.lat, userPos.lng,
                currentRouteCoords[routeStartIndex][0],
                currentRouteCoords[routeStartIndex][1]
            );
            
            if (distFromStart > 10 && closestIndex > routeStartIndex) {
                routeStartIndex = closestIndex;
                var remainingCoords = currentRouteCoords.slice(routeStartIndex);
                if (remainingCoords.length > 1) {
                    map.removeLayer(currentRoute);
                    currentRoute = L.polyline(remainingCoords, {
                        color: '#2563EB', weight: 8, opacity: 0.9, lineJoin: 'round', lineCap: 'round', interactive: false
                    }).addTo(map);
                } else {
                    window.clearRoute();
                }
            }
        }

        // --- AQUI ESTÁ A CORREÇÃO PRINCIPAL ---
        async function drawRoute(destLat, destLng, hideDestIcon) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ROUTE_CALCULATION_STARTED' }));
            }
            var userPos = userMarker.getLatLng();
            var url = 'https://router.project-osrm.org/route/v1/driving/' + 
                      userPos.lng + ',' + userPos.lat + ';' + 
                      destLng + ',' + destLat + 
                      '?overview=full&geometries=geojson&alternatives=true';
            
            try {
                var response = await fetch(url);
                var data = await response.json();
                
                if (data.routes && data.routes.length > 0) {
                    if (currentRoute) map.removeLayer(currentRoute);
                    if (alternativeRoute) map.removeLayer(alternativeRoute);
                    if (destinationMarker) map.removeLayer(destinationMarker);
                    
                    var mainRoute = data.routes[0];
                    var mainCoords = mainRoute.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
                    currentRouteCoords = mainCoords;
                    routeStartIndex = 0;
                    activeRouteIndex = 0;
                    
                    currentRoute = L.polyline(mainCoords, {
                        color: '#2563EB', weight: 8, opacity: 0.9, lineJoin: 'round', lineCap: 'round', interactive: false
                    }).addTo(map);
                    
                    if (data.routes.length > 1) {
                        var altRoute = data.routes[1];
                        var altCoords = altRoute.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
                        alternativeRouteCoords = altCoords;
                        
                        alternativeRoute = L.polyline(altCoords, {
                            color: '#9CA3AF', weight: 6, opacity: 0.7, lineJoin: 'round', lineCap: 'round', interactive: true
                        }).addTo(map);
                        
                        var alternativeRouteClickArea = L.polyline(altCoords, {
                            color: 'transparent', weight: 20, opacity: 0, interactive: true
                        }).addTo(map);
                        
                        alternativeRouteClickArea.on('click', function(e) {
                            L.DomEvent.stopPropagation(e);
                            switchToAlternativeRoute();
                        });
                        
                        alternativeRoute._clickArea = alternativeRouteClickArea;
                    }
                    
                    if (!hideDestIcon) {
                        var destIcon = L.divIcon({
                            className: 'destination-marker', iconSize: [24, 24], iconAnchor: [12, 12]
                        });
                        
                        destinationMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(map);
                    }
                    
                    // PREPARANDO DADOS PARA O REACT NATIVE
                    var mainDistanceKm = (mainRoute.distance / 1000).toFixed(2);
                    // Multiplica por 1.5 para estimativa de caminhão/tráfego realista
                    var mainDurationMin = Math.round((mainRoute.duration * 1.5) / 60);
                    
                    mainRouteStats = {
                        distance: mainDistanceKm + ' km',
                        duration: mainDurationMin + ' min'
                    };
                    
                    var routeInfoData = {
                        main: {
                            distance: mainDistanceKm + ' km',
                            duration: mainDurationMin + ' min'
                        },
                        // --- CORREÇÃO: ADICIONANDO COORDENADAS DO DESTINO ---
                        destination: {
                            latitude: destLat,
                            longitude: destLng
                        }
                    };
                    
                    if (data.routes.length > 1) {
                        var altDistanceKm = (data.routes[1].distance / 1000).toFixed(2);
                        // Multiplica por 1.5 para estimativa de caminhão/tráfego realista
                        var altDurationMin = Math.round((data.routes[1].duration * 1.5) / 60);
                        routeInfoData.alternative = {
                            distance: altDistanceKm + ' km',
                            duration: altDurationMin + ' min'
                        };
                        alternativeRouteStats = {
                            distance: altDistanceKm + ' km',
                            duration: altDurationMin + ' min'
                        };
                    } else {
                        alternativeRouteStats = null;
                    }
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'ROUTE_INFO',
                        data: routeInfoData
                    }));
                    
                    window.ReactNativeWebView.postMessage('USER_DRAGGED_MAP');
                    
                    var bounds = currentRoute.getBounds();
                    if (alternativeRoute) {
                        bounds.extend(alternativeRoute.getBounds());
                    }
                    map.fitBounds(bounds, {
                        paddingTopLeft: [50, 50],
                        paddingBottomRight: [50, 220]
                    });
                }
            } catch (error) {
                console.error('Erro ao traçar rota:', error);
            }
        }
        window.drawRoute = drawRoute;
        
        function switchToAlternativeRoute() {
            if (!alternativeRoute || !alternativeRouteCoords) return;
            if (alternativeRoute._clickArea) map.removeLayer(alternativeRoute._clickArea);
            
            currentRoute.setStyle({ color: '#9CA3AF', weight: 6, opacity: 0.7 });
            currentRoute.options.interactive = false; 
            
            alternativeRoute.setStyle({ color: '#2563EB', weight: 8, opacity: 0.9 });
            alternativeRoute.options.interactive = false; 
            
            var tempCoords = currentRouteCoords;
            currentRouteCoords = alternativeRouteCoords;
            alternativeRouteCoords = tempCoords;
            
            var tempRoute = currentRoute;
            currentRoute = alternativeRoute;
            alternativeRoute = tempRoute;
            
            var newClickArea = L.polyline(alternativeRouteCoords, {
                color: 'transparent', weight: 20, opacity: 0, interactive: true
            }).addTo(map);
            
            newClickArea.on('click', function(e) {
                L.DomEvent.stopPropagation(e);
                switchToAlternativeRoute();
            });
            
            alternativeRoute._clickArea = newClickArea;
            routeStartIndex = 0;
            activeRouteIndex = activeRouteIndex === 0 ? 1 : 0;
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ROUTE_SWITCHED',
                activeIndex: activeRouteIndex,
                distance: activeRouteIndex === 0 ? mainRouteStats.distance : alternativeRouteStats.distance,
                duration: activeRouteIndex === 0 ? mainRouteStats.duration : alternativeRouteStats.duration
            }));
        }
        
        window.clearRoute = function() {
            if (currentRoute) { map.removeLayer(currentRoute); currentRoute = null; }
            if (alternativeRoute) {
                if (alternativeRoute._clickArea) map.removeLayer(alternativeRoute._clickArea);
                map.removeLayer(alternativeRoute); alternativeRoute = null;
            }
            if (destinationMarker) { map.removeLayer(destinationMarker); destinationMarker = null; }
            currentRouteCoords = null; alternativeRouteCoords = null;
            routeStartIndex = 0;
            
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ROUTE_CLEARED' }));
        };

        var currentRotation = null;
        var targetRotation = 0;
        var isFollowingUserLocal = true;
        var isCurrentlyDragging = false; 
        var hasInitializedPosition = false; 
        var mapLoadTime = Date.now(); 
        
        function getShortestDelta(target, current) {
            var delta = target - current;
            while (delta > 180) delta -= 360;
            while (delta < -180) delta += 360;
            return delta;
        }

        window.updateMapState = function(lat, lng, heading, followUser, accuracy) {
            map.invalidateSize(); 
            var newLatLng = new L.LatLng(lat, lng);
            userMarker.setLatLng(newLatLng);
            
            if (currentRotation === null) currentRotation = heading - 90;
            targetRotation = heading - 90;
            isFollowingUserLocal = followUser;
            
            if (currentRoute && currentRouteCoords) {
                updateRouteProgress(newLatLng);
            }
            
            if (!hasInitializedPosition) {
                map.setView(newLatLng, 17, { animate: false });
                hasInitializedPosition = true;
                return;
            }
            
            if (isFollowingUserLocal && !isCurrentlyDragging) {
                var distance = map.getCenter().distanceTo(newLatLng);
                if (distance > 5) {
                    map.setView(newLatLng, map.getZoom(), { animate: true, duration: 0.25 });
                }
            }
        };
        
        function animateRotation() {
            var iconElement = userMarker.getElement();
            if (iconElement && currentRotation !== null) {
                var circle = iconElement.querySelector('.marker-circle');
                if (circle) {
                    var delta = getShortestDelta(targetRotation, currentRotation);
                    if (Math.abs(delta) > 0.05) {
                        currentRotation += delta * 0.3;
                        currentRotation = (currentRotation + 360) % 360;
                    } else {
                        currentRotation = targetRotation;
                    }
                    circle.style.transform = 'rotate(' + currentRotation + 'deg)';
                }
            }
            requestAnimationFrame(animateRotation);
        }
        
        var companyMarkers = {};
        var companyGeofences = {};
        var companyGeofenceDots = {};
        var companyLinks = {};

        window.updateCompanyMarkers = function(terminals) {
            // Remove markers que não estão mais na lista
            var terminalIds = terminals.map(function(t) { return t.id; });
            Object.keys(companyMarkers).forEach(function(id) {
                if (terminalIds.indexOf(id) === -1) {
                    map.removeLayer(companyMarkers[id]);
                    delete companyMarkers[id];
                }
            });
            Object.keys(companyGeofences).forEach(function(id) {
                if (terminalIds.indexOf(id) === -1) {
                    map.removeLayer(companyGeofences[id]);
                    delete companyGeofences[id];
                }
            });
            Object.keys(companyGeofenceDots).forEach(function(id) {
                if (terminalIds.indexOf(id) === -1) {
                    map.removeLayer(companyGeofenceDots[id]);
                    delete companyGeofenceDots[id];
                }
            });
            Object.keys(companyLinks).forEach(function(id) {
                if (terminalIds.indexOf(id) === -1) {
                    map.removeLayer(companyLinks[id]);
                    delete companyLinks[id];
                }
            });

            // Adiciona ou atualiza marcadores
            terminals.forEach(function(terminal) {
                var addressLat = terminal.addressLat;
                var addressLng = terminal.addressLng;
                var geofenceLat = terminal.geofenceLat;
                var geofenceLng = terminal.geofenceLng;
                var radius = terminal.geofenceRadius;
                var logoUrl = terminal.logo_url;
                var name = terminal.name || 'Terminal';
                var initials = name.substring(0, 2).toUpperCase();

                var logoHtml = '';
                if (logoUrl) {
                    logoHtml = '<img class="company-logo-img" src="' + logoUrl + '" alt="' + name + '" />';
                } else {
                    logoHtml = '<span class="company-logo-text">' + initials + '</span>';
                }

                var htmlContent = '<div class="company-logo-badge">' + logoHtml + '</div>';

                var companyIcon = L.divIcon({
                    className: 'company-marker-container',
                    html: htmlContent,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                });

                // 1. Desenha/atualiza o marcador principal no endereço físico
                if (companyMarkers[terminal.id]) {
                    companyMarkers[terminal.id].setLatLng([addressLat, addressLng]);
                    companyMarkers[terminal.id].setIcon(companyIcon);
                } else {
                    companyMarkers[terminal.id] = L.marker([addressLat, addressLng], { icon: companyIcon }).addTo(map);
                    
                    companyMarkers[terminal.id].on('click', function(e) {
                        L.DomEvent.stopPropagation(e);
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'COMPANY_SELECTED',
                            companyId: terminal.id
                        }));
                    });
                }

                // 2. Desenha a geocerca (círculo) ao redor do centro da geofence com preenchimento mais transparente
                if (radius > 0) {
                    if (companyGeofences[terminal.id]) {
                        companyGeofences[terminal.id].setLatLng([geofenceLat, geofenceLng]);
                        companyGeofences[terminal.id].setRadius(radius);
                    } else {
                        companyGeofences[terminal.id] = L.circle([geofenceLat, geofenceLng], {
                            color: '#f97316',
                            fillColor: '#f97316',
                            fillOpacity: 0.03,
                            radius: radius,
                            weight: 1.5,
                            dashArray: '5, 5',
                            interactive: false
                        }).addTo(map);
                    }
                } else {
                    if (companyGeofences[terminal.id]) {
                        map.removeLayer(companyGeofences[terminal.id]);
                        delete companyGeofences[terminal.id];
                    }
                }

                // 3. Desenha um ponto (circleMarker) no centro da geofence
                if (companyGeofenceDots[terminal.id]) {
                    companyGeofenceDots[terminal.id].setLatLng([geofenceLat, geofenceLng]);
                } else {
                    companyGeofenceDots[terminal.id] = L.circleMarker([geofenceLat, geofenceLng], {
                        radius: 5,
                        color: '#f97316',
                        fillColor: '#f97316',
                        fillOpacity: 0.8,
                        weight: 1,
                        interactive: false
                    }).addTo(map);
                }

                // 4. Desenha a linha ligando o endereço ao geofence center
                var lineCoords = [[addressLat, addressLng], [geofenceLat, geofenceLng]];
                if (companyLinks[terminal.id]) {
                    companyLinks[terminal.id].setLatLngs(lineCoords);
                } else {
                    companyLinks[terminal.id] = L.polyline(lineCoords, {
                        color: '#f97316',
                        weight: 2,
                        dashArray: '3, 6',
                        opacity: 0.6,
                        interactive: false
                    }).addTo(map);
                }
            });
        };

        animateRotation();

        // Avisa o React Native que o mapa e os scripts estão carregados e prontos
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_INITIALIZED' }));
        } else {
            var checkInterval = setInterval(function() {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_INITIALIZED' }));
                    clearInterval(checkInterval);
                }
            }, 50);
        }
    </script>
</body>
</html>
`;
