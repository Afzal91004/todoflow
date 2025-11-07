import { getApp } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Try to load modular helpers if available (v22+). Use require so we can safely
// fall back if the installed version doesn't export them.
const _modularFirestore = require('@react-native-firebase/firestore') || {};
const mCollection = _modularFirestore.collection;
const mDoc = _modularFirestore.doc;
const mServerTimestamp = _modularFirestore.serverTimestamp;
const mAddDoc = _modularFirestore.addDoc;
const mGetDocs = _modularFirestore.getDocs;
const mQuery = _modularFirestore.query;
const mOrderBy = _modularFirestore.orderBy;
const mOnSnapshot = _modularFirestore.onSnapshot;
const mUpdateDoc = _modularFirestore.updateDoc;
const mDeleteDoc = _modularFirestore.deleteDoc;

class TodoService {
  constructor() {
    const app = getApp();
    this.app = app;
    // use the app-scoped firestore instance to reduce namespaced API usage
    this.db = firestore(app);
    // prefer modular collection() if available
    if (typeof mCollection === 'function') {
      try {
        this.todosCollection = mCollection(this.db, 'users');
      } catch (e) {
        // fallback to namespaced API
        this.todosCollection = this.db.collection('users');
      }
    } else {
      this.todosCollection = this.db.collection('users');
    }
  }

  // Get user's todos collection reference
  getUserTodosRef() {
    const userId = auth(this.app).currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    // If modular helpers exist, use collection(doc(...), 'todos') to avoid namespaced API
    if (typeof mDoc === 'function' && typeof mCollection === 'function') {
      try {
        const userDoc = mDoc(this.db, 'users', userId);
        return mCollection(userDoc, 'todos');
      } catch (e) {
        // fallback to namespaced API
        return this.db.collection('users').doc(userId).collection('todos');
      }
    }
    return this.db.collection('users').doc(userId).collection('todos');
  }

  // Get all todos for current user
  async getTodos() {
    try {
      const todos = [];
      const userTodosRef = this.getUserTodosRef();

      if (
        typeof mGetDocs === 'function' &&
        typeof mQuery === 'function' &&
        typeof mOrderBy === 'function'
      ) {
        const q = mQuery(userTodosRef, mOrderBy('createdAt', 'desc'));
        const snapshot = await mGetDocs(q);
        snapshot.forEach(doc => {
          todos.push({ id: doc.id, ...doc.data() });
        });
      } else {
        const snapshot = await userTodosRef.orderBy('createdAt', 'desc').get();
        snapshot.forEach(doc => {
          todos.push({ id: doc.id, ...doc.data() });
        });
      }

      return { success: true, data: todos };
    } catch (error) {
      console.error('Get Todos Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Listen to todos in real-time
  subscribeTodos(callback) {
    try {
      const userTodosRef = this.getUserTodosRef();
      if (
        typeof mOnSnapshot === 'function' &&
        typeof mQuery === 'function' &&
        typeof mOrderBy === 'function'
      ) {
        const q = mQuery(userTodosRef, mOrderBy('createdAt', 'desc'));
        return mOnSnapshot(
          q,
          snapshot => {
            const todos = [];
            snapshot.forEach(doc => {
              todos.push({ id: doc.id, ...doc.data() });
            });
            callback({ success: true, data: todos });
          },
          error => {
            console.error('Subscribe Todos Error:', error);
            callback({ success: false, error: error.message });
          },
        );
      }

      // fallback to namespaced API
      return userTodosRef.orderBy('createdAt', 'desc').onSnapshot(
        snapshot => {
          const todos = [];
          snapshot.forEach(doc => {
            todos.push({ id: doc.id, ...doc.data() });
          });
          callback({ success: true, data: todos });
        },
        error => {
          console.error('Subscribe Todos Error:', error);
          callback({ success: false, error: error.message });
        },
      );
    } catch (error) {
      console.error('Subscribe Todos Error:', error);
      return null;
    }
  }

  // Add a new todo
  async addTodo(title, description = '') {
    try {
      const todo = {
        title: title.trim(),
        description: description.trim(),
        completed: false,
        // get FieldValue/serverTimestamp from modular helper if available
        createdAt:
          typeof mServerTimestamp === 'function'
            ? mServerTimestamp()
            : this.db.FieldValue.serverTimestamp(),
        updatedAt:
          typeof mServerTimestamp === 'function'
            ? mServerTimestamp()
            : this.db.FieldValue.serverTimestamp(),
      };

      const userTodosRef = this.getUserTodosRef();
      let docRef;
      if (typeof mAddDoc === 'function') {
        // modular addDoc
        docRef = await mAddDoc(userTodosRef, todo);
      } else {
        docRef = await userTodosRef.add(todo);
      }

      return {
        success: true,
        data: {
          id: docRef.id,
          ...todo,
        },
      };
    } catch (error) {
      console.error('Add Todo Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Update a todo
  async updateTodo(todoId, updates) {
    try {
      // attempt modular doc/update if helpers available; otherwise use namespaced API
      if (typeof mDoc === 'function' && typeof mCollection === 'function') {
        try {
          const userTodos = this.getUserTodosRef();
          // userTodos may be a modular CollectionReference or namespaced one; try namespaced update path
          if (userTodos && typeof userTodos.doc === 'function') {
            await userTodos.doc(todoId).update({
              ...updates,
              updatedAt:
                typeof mServerTimestamp === 'function'
                  ? mServerTimestamp()
                  : this.db.FieldValue.serverTimestamp(),
            });
          } else {
            // fallback: use namespaced path
            await this.db
              .collection('users')
              .doc(auth(this.app).currentUser.uid)
              .collection('todos')
              .doc(todoId)
              .update({
                ...updates,
                updatedAt:
                  typeof mServerTimestamp === 'function'
                    ? mServerTimestamp()
                    : this.db.FieldValue.serverTimestamp(),
              });
          }
        } catch (e) {
          // fallback to namespaced API
          await this.getUserTodosRef()
            .doc(todoId)
            .update({
              ...updates,
              updatedAt: this.db.FieldValue.serverTimestamp(),
            });
        }
      } else {
        await this.getUserTodosRef()
          .doc(todoId)
          .update({
            ...updates,
            updatedAt: this.db.FieldValue.serverTimestamp(),
          });
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Update Todo Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete a todo
  async deleteTodo(todoId) {
    try {
      const userTodosRef = this.getUserTodosRef();
      if (typeof mDeleteDoc === 'function' && typeof mDoc === 'function') {
        const r = mDoc(
          this.db,
          'users',
          auth(this.app).currentUser.uid,
          'todos',
          todoId,
        );
        await mDeleteDoc(r);
      } else {
        await this.getUserTodosRef().doc(todoId).delete();
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Delete Todo Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Toggle todo completion status
  async toggleTodoComplete(todoId, currentStatus) {
    try {
      const updatedAtValue =
        typeof mServerTimestamp === 'function'
          ? mServerTimestamp()
          : this.db.FieldValue.serverTimestamp();
      if (typeof mUpdateDoc === 'function' && typeof mDoc === 'function') {
        const r = mDoc(
          this.db,
          'users',
          auth(this.app).currentUser.uid,
          'todos',
          todoId,
        );
        await mUpdateDoc(r, {
          completed: !currentStatus,
          updatedAt: updatedAtValue,
        });
      } else {
        await this.getUserTodosRef().doc(todoId).update({
          completed: !currentStatus,
          updatedAt: updatedAtValue,
        });
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Toggle Todo Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new TodoService();
