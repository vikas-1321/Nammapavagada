import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: colors.secondaryLight, borderColor: colors.secondary, borderWidth: 1 };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: colors.borderStrong, borderWidth: 1 };
      case 'danger':
        return { backgroundColor: colors.danger };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      case 'primary':
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'secondary':
        return { color: colors.secondary };
      case 'outline':
        return { color: colors.textMain };
      case 'danger':
        return { color: colors.textInverted };
      case 'ghost':
        return { color: colors.primary };
      case 'primary':
      default:
        return { color: colors.textInverted };
    }
  };

  const getSizeStyle = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
      case 'small':
        return {
          container: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
          text: { fontSize: 13, fontWeight: '600' },
        };
      case 'lg':
      case 'large':
        return {
          container: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10 },
          text: { fontSize: 16, fontWeight: '700' },
        };
      case 'md':
      case 'medium':
      default:
        return {
          container: { paddingVertical: 11, paddingHorizontal: 16, borderRadius: 8 },
          text: { fontSize: 14, fontWeight: '600' },
        };
    }
  };

  const sizeStyle = getSizeStyle();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        getContainerStyle(),
        sizeStyle.container,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textInverted}
        />
      ) : (
        <>
          {icon}
          <Text style={[styles.textBase, getTextStyle(), sizeStyle.text, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  textBase: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
