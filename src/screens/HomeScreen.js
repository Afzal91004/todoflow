import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import authService from '../services/authService';
import todoService from '../services/todoService';
import TodoItem from '../components/TodoItem';
import EmptyState from '../components/EmptyState';

const HomeScreen = ({ navigation }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStickyProgress, setShowStickyProgress] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const unsubscribe = todoService.subscribeTodos(result => {
      if (result.success) {
        setTodos(result.data);
      } else {
        Alert.alert('Error', result.error);
      }
      setLoading(false);
      setRefreshing(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [refreshKey, fadeAnim]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          const result = await authService.signOut();
          if (!result.success) {
            Alert.alert('Error', result.error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleToggleComplete = async (todoId, currentStatus) => {
    const result = await todoService.toggleTodoComplete(todoId, currentStatus);
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  const handleDeleteTodo = todoId => {
    Alert.alert('Delete Todo', 'Are you sure you want to delete this todo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          const result = await todoService.deleteTodo(todoId);
          if (!result.success) {
            Alert.alert('Error', result.error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleEditTodo = todo => {
    navigation.navigate('AddEditTodo', { mode: 'edit', todo });
  };

  const handleAddTodo = () => {
    navigation.navigate('AddEditTodo', { mode: 'add' });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: event => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowStickyProgress(offsetY > 360);
      },
    },
  );

  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = todos.filter(t => !t.completed).length;
  const completionRate =
    todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667EEA" />

      {showStickyProgress && todos.length > 0 && (
        <View style={styles.stickyProgressContainer}>
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.stickyProgressBar}
          >
            <View style={styles.stickyProgressContent}>
              <Text style={styles.stickyProgressText}>Progress</Text>
              <Text style={styles.stickyProgressPercent}>
                {completionRate}%
              </Text>
            </View>
            <View style={styles.stickyBarBg}>
              <View
                style={[styles.stickyBarFill, { width: `${completionRate}%` }]}
              />
            </View>
          </LinearGradient>
        </View>
      )}

      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667EEA']}
            tintColor="#667EEA"
          />
        }
      >
        <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>
                {currentUser?.displayName?.split(' ')[0] || 'User'}
              </Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={[styles.statIcon, { backgroundColor: '#E8EAF6' }]}>
                <Ionicons name="list" size={18} color="#667EEA" />
              </View>
              <Text style={styles.statNum}>{todos.length}</Text>
              <Text style={styles.statText}>Total</Text>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="checkmark-done" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.statNum}>{completedCount}</Text>
              <Text style={styles.statText}>Done</Text>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="time" size={18} color="#FF9800" />
              </View>
              <Text style={styles.statNum}>{pendingCount}</Text>
              <Text style={styles.statText}>Pending</Text>
            </View>
          </View>

          {todos.length > 0 && (
            <View style={styles.progressBox}>
              <View style={styles.progressTop}>
                <Text style={styles.progressText}>Progress</Text>
                <Text style={styles.progressPercent}>{completionRate}%</Text>
              </View>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: `${completionRate}%`, opacity: fadeAnim },
                  ]}
                />
              </View>
            </View>
          )}
        </LinearGradient>

        <View style={styles.listSection}>
          <View style={styles.listTop}>
            <Text style={styles.sectionTitle}>My Tasks</Text>
            {todos.length > 0 && (
              <Text style={styles.taskCount}>{pendingCount} left</Text>
            )}
          </View>

          {todos.length === 0 ? (
            <EmptyState onAddTodo={handleAddTodo} />
          ) : (
            <View style={styles.tasksList}>
              {todos.map(item => (
                <TodoItem
                  key={item.id}
                  todo={item}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEditTodo}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </View>
          )}

          <View style={styles.bottomSpace} />
        </View>
      </Animated.ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddTodo}>
        <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.fabInner}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#636E72',
    fontWeight: '500',
  },
  stickyProgressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  stickyProgressBar: {
    paddingTop: 5,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  stickyProgressContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stickyProgressText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  stickyProgressPercent: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  stickyBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  stickyBarFill: {
    height: '100%',
    backgroundColor: '#FFD93D',
    borderRadius: 3,
  },
  header: {
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 2,
  },
  statText: {
    fontSize: 11,
    color: '#636E72',
    fontWeight: '500',
  },
  progressBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    padding: 14,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  progressPercent: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD93D',
    borderRadius: 4,
  },
  listSection: {
    paddingBottom: 20,
  },
  listTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  taskCount: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '500',
  },
  tasksList: {
    paddingHorizontal: 20,
  },
  bottomSpace: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
