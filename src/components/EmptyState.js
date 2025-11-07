import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const EmptyState = ({ onAddTodo }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="clipboard-outline"
          size={100}
          color={COLORS.primary + '30'}
        />
      </View>

      <Text style={styles.title}>No tasks yet!</Text>
      <Text style={styles.subtitle}>
        Start your productivity journey by creating your first task
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onAddTodo}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Create Your First Task</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipTitle}>✨ Pro Tips:</Text>
        <Text style={styles.tipText}>• Keep tasks small and actionable</Text>
        <Text style={styles.tipText}>• Review your list daily</Text>
        <Text style={styles.tipText}>• Celebrate completed tasks</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    ...SHADOWS.medium,
    alignSelf: 'stretch',
    maxWidth: 420,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsContainer: {
    marginTop: 48,
    padding: 20,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 16,
    width: '100%',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },
});

export default EmptyState;
