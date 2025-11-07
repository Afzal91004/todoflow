import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const TodoItem = ({ todo, onToggleComplete, onEdit, onDelete }) => {
  const formatDate = timestamp => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View
      style={[styles.container, todo.completed && styles.completedContainer]}
    >
      {/* Left Border Indicator */}
      <View
        style={[
          styles.leftBorder,
          { backgroundColor: todo.completed ? COLORS.success : COLORS.primary },
        ]}
      />

      {/* Checkbox */}
      <TouchableOpacity
        onPress={() => onToggleComplete(todo.id, todo.completed)}
        style={styles.checkboxContainer}
      >
        <View
          style={[styles.checkbox, todo.completed && styles.checkboxCompleted]}
        >
          {todo.completed && (
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>

      {/* Content */}
      <TouchableOpacity
        style={styles.content}
        onPress={() => onEdit(todo)}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.title, todo.completed && styles.completedTitle]}
          numberOfLines={2}
        >
          {todo.title}
        </Text>
        {todo.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {todo.description}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color={COLORS.textLight} />
            <Text style={styles.timestamp}>{formatDate(todo.createdAt)}</Text>
          </View>
          {todo.completed && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>Completed</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onEdit(todo)}
          style={[styles.actionButton, styles.editButton]}
        >
          <Ionicons name="pencil" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(todo.id)}
          style={[styles.actionButton, styles.deleteButton]}
        >
          <Ionicons name="trash" size={18} color={COLORS.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  completedContainer: {
    opacity: 0.7,
  },
  leftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  checkboxContainer: {
    marginRight: 12,
    marginLeft: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  completedBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedBadgeText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'column',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: COLORS.primary + '15',
  },
  deleteButton: {
    backgroundColor: COLORS.accent + '15',
  },
});

export default TodoItem;
