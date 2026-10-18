import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { PlaceStatus, VerificationStatus } from '../../types';
import { colors } from '../../theme/colors';

export interface AppBadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant,
  size = 'md',
  backgroundColor,
  textColor,
  borderColor,
  style,
  textStyle,
  icon,
}) => {
  let bg = backgroundColor || colors.surfaceSubtle;
  let text = textColor || colors.textMain;
  let border = borderColor;

  if (variant) {
    switch (variant) {
      case 'primary':
        bg = colors.primaryLight;
        text = colors.primaryDark;
        break;
      case 'secondary':
        bg = colors.secondaryLight;
        text = colors.secondary;
        break;
      case 'success':
        bg = colors.successLight;
        text = colors.success;
        break;
      case 'warning':
        bg = colors.warningLight;
        text = colors.warningDark;
        break;
      case 'danger':
        bg = colors.dangerLight;
        text = colors.dangerDark;
        break;
      case 'info':
        bg = '#eff6ff';
        text = '#1d4ed8';
        border = '#bfdbfe';
        break;
      case 'neutral':
      default:
        bg = colors.surfaceSubtle;
        text = colors.textMuted;
        break;
    }
  }

  const isSmall = size === 'sm' || size === 'small';

  return (
    <View
      style={[
        styles.badge,
        isSmall && styles.badgeSmall,
        { backgroundColor: bg },
        border ? { borderColor: border, borderWidth: 1 } : undefined,
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          styles.badgeText,
          isSmall && styles.badgeTextSmall,
          { color: text },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

export const StatusBadge: React.FC<{ status: PlaceStatus; style?: ViewStyle }> = ({
  status,
  style,
}) => {
  let bg = colors.surfaceSubtle;
  let text = colors.textMuted;
  let label: string = status;

  switch (status) {
    case 'PUBLISHED':
    case 'ACTIVE':
      bg = colors.primaryLight;
      text = colors.primaryDark;
      label = 'Published';
      break;
    case 'DRAFT':
      bg = colors.warningLight;
      text = colors.warningDark;
      label = 'Draft';
      break;
    case 'TEMP_CLOSED':
      bg = '#ffedd5';
      text = '#9a3412';
      label = 'Temp Closed';
      break;
    case 'INACTIVE':
      bg = '#f1f5f9';
      text = '#475569';
      label = 'Inactive';
      break;
    case 'ARCHIVED':
      bg = '#f8fafc';
      text = '#64748b';
      label = 'Archived';
      break;
  }

  return <AppBadge label={label} backgroundColor={bg} textColor={text} style={style} />;
};

export const VerificationBadge: React.FC<{
  status?: VerificationStatus;
  isFresh?: boolean;
  style?: ViewStyle;
}> = ({ status = 'NOT_VERIFIED', isFresh, style }) => {
  let bg = colors.surfaceSubtle;
  let text = colors.textMuted;
  let label = 'Not Verified';

  switch (status) {
    case 'VERIFIED':
      if (isFresh === false) {
        bg = colors.dangerLight;
        text = colors.dangerDark;
        label = 'Needs Reverification (>6m)';
      } else {
        bg = '#dcfce7';
        text = '#15803d';
        label = 'Verified';
      }
      break;
    case 'PENDING':
      bg = colors.warningLight;
      text = colors.warningDark;
      label = 'Pending Verification';
      break;
    case 'NEEDS_REVERIFICATION':
      bg = colors.dangerLight;
      text = colors.dangerDark;
      label = 'Needs Reverification';
      break;
    case 'NOT_VERIFIED':
    default:
      bg = '#f1f5f9';
      text = '#64748b';
      label = 'Not Verified';
      break;
  }

  return <AppBadge label={label} backgroundColor={bg} textColor={text} style={style} />;
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  badgeSmall: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  badgeTextSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
});
