import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string | null;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const AppTextInput: React.FC<AppTextInputProps> = ({
  label,
  required,
  helperText,
  error,
  containerStyle,
  inputStyle,
  leftElement,
  rightElement,
  multiline,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.requiredAsterisk}> *</Text>}
        </View>
      )}

      <View
        style={[
          styles.inputWrapper,
          multiline && styles.multilineWrapper,
          isFocused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
        ]}
      >
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
        <TextInput
          placeholderTextColor={colors.textSubtle}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          multiline={multiline}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
  },
  requiredAsterisk: {
    color: colors.danger,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  multilineWrapper: {
    minHeight: 88,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputWrapperFocused: {
    borderColor: colors.borderFocused,
    backgroundColor: '#ffffff',
  },
  inputWrapperError: {
    borderColor: colors.danger,
    backgroundColor: '#fff5f5',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textMain,
    paddingVertical: 8,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  leftElement: {
    marginRight: 8,
  },
  rightElement: {
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    fontWeight: '500',
  },
});
