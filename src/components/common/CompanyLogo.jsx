import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { isPlaceholderUrl } from '../../utils/tools';
import { getCachedCompanyLogo, syncCompanyLogoCache } from '../../utils/companyLogoCache';

/**
 * Extrai iniciais (até 2 letras) de um nome de empresa ou texto fallback.
 * Exemplos:
 * - "Terminal Santos" -> "TS"
 * - "Santos Brasil" -> "SB"
 * - "BTP" -> "BT"
 * - "A" -> "A"
 */
export const getCompanyInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const cleanName = name.trim();
  if (!cleanName) return '?';

  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  if (cleanName.length <= 2) {
    return cleanName.toUpperCase();
  }
  return cleanName.substring(0, 2).toUpperCase();
};

/**
 * Verifica se a URL informada é um arquivo SVG ou Data URI de SVG.
 */
export const isSvgUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const lower = url.trim().toLowerCase();
  if (lower.startsWith('data:image/svg+xml')) return true;
  const cleanPath = lower.split('?')[0].split('#')[0];
  return cleanPath.endsWith('.svg');
};

export default function CompanyLogo({
  logoUrl,
  imageUrl,
  uri,
  name,
  companyName,
  title,
  initials,
  companyId,
  company_id,
  size = 40,
  fontSize,
  backgroundColor = '#F1F5F9',
  textColor = '#475569',
  showBorder = true,
  borderWidth = 1,
  borderColor = '#E2E8F0',
  style,
  textStyle,
  imageStyle,
}) {
  const [imageError, setImageError] = useState(false);
  const [cachedUrl, setCachedUrl] = useState(null);

  const rawName = name || companyName || title;
  const id = companyId || company_id;
  const directUrl = logoUrl || imageUrl || uri;

  // Reseta erro quando a URL da logo mudar (importante para reciclagem no FlatList)
  useEffect(() => {
    setImageError(false);
  }, [directUrl]);

  // 1. Tenta recuperar do cache local via ID ou Nome
  useEffect(() => {
    let isMounted = true;
    if (id || rawName) {
      getCachedCompanyLogo(id, rawName).then((localUri) => {
        if (isMounted && localUri) {
          setCachedUrl(localUri);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [id, rawName, directUrl]);

  // 2. Se temos uma URL remota HTTP e ainda não está em cache local, salva no cache em background
  useEffect(() => {
    if (directUrl && typeof directUrl === 'string' && directUrl.startsWith('http') && id && rawName && !cachedUrl) {
      try {
        if (typeof syncCompanyLogoCache === 'function') {
          syncCompanyLogoCache([{ id, name: rawName, logo_url: directUrl }]).then((res) => {
            if (res && res[0]?.logo_url && res[0].logo_url.startsWith('data:image')) {
              setCachedUrl(res[0].logo_url);
            }
          }).catch(() => {});
        }
      } catch {
        // ignore background cache sync errors
      }
    }
  }, [directUrl, id, rawName, cachedUrl]);

  // Dá prioridade absoluta para a imagem salva no cache local do dispositivo (Base64 data:image)
  const rawUrl = cachedUrl || directUrl;

  const hasValidUrl =
    typeof rawUrl === 'string' &&
    rawUrl.trim().length > 0 &&
    !imageError &&
    !isPlaceholderUrl(rawUrl);

  const calculatedInitials = initials || getCompanyInitials(rawName);
  const calculatedFontSize = fontSize ?? Math.max(10, Math.round(size * 0.4));
  const borderRadius = Math.round(size / 2);

  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
      borderRadius,
      backgroundColor: hasValidUrl ? '#FFFFFF' : backgroundColor,
      ...(showBorder ? { borderWidth, borderColor } : {}),
    },
    style,
  ];

  if (hasValidUrl) {
    const isSvg = isSvgUrl(rawUrl);
    const innerSize = Math.round(size * 0.75);

    if (isSvg) {
      return (
        <View style={containerStyle}>
          <View style={[styles.svgWrapper, { width: size, height: size, borderRadius }, imageStyle]}>
            <SvgUri
              width={innerSize}
              height={innerSize}
              uri={rawUrl}
              onError={() => setImageError(true)}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: rawUrl }}
          style={[styles.image, { width: size, height: size, borderRadius }, imageStyle]}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Text
        style={[
          styles.initialsText,
          {
            fontSize: calculatedFontSize,
            color: textColor,
          },
          textStyle,
        ]}
      >
        {calculatedInitials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    overflow: 'hidden',
  },
  initialsText: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
