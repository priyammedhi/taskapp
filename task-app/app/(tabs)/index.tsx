import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  useColorScheme,
  RefreshControl,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "../../constants.ts";

type Task = {
  id: number;
  title: string;
  status: string;
};

export default function App(): JSX.Element {
  const [screen, setScreen] = useState<"login" | "tasks">("login");
  const [email, setEmail] = useState<string>("test@example.com");
  const [password, setPassword] = useState<string>("password123");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<string>("");

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    background: isDark ? "#121212" : "#f5f5f5",
    card: isDark ? "#1e1e1e" : "#fff",
    text: isDark ? "#fff" : "#000",
    subtext: isDark ? "#aaa" : "#666",
    accent: "#007AFF",
    danger: "#E53935",
  };

  const login = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      if (res.status === 200) {
        await AsyncStorage.setItem("user", JSON.stringify({ email }));
        setScreen("tasks");
      }
    } catch {
      Alert.alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Task[]>(`${API_BASE}/tasks`);
      setTasks(res.data || []);
    } catch {
      Alert.alert("Error loading tasks");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/tasks`, {
        title: newTask,
        status: "pending",
      });
      setTasks([...tasks, res.data]);
      setNewTask("");
    } catch {
      Alert.alert("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      const updated = {
        ...task,
        status: task.status === "done" ? "pending" : "done",
      };
      await axios.put(`${API_BASE}/tasks/${task.id}`, updated);
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch {
      Alert.alert("Failed to update task");
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await axios.delete(`${API_BASE}/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch {
      Alert.alert("Failed to delete task");
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    setScreen("login");
  };

  useEffect(() => {
    if (screen === "tasks") loadTasks();
  }, [screen]);

  // ---------------- LOGIN SCREEN ----------------
  if (screen === "login") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerBox}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome Back 👋</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Please log in to continue
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Email"
            placeholderTextColor={colors.subtext}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Password"
            placeholderTextColor={colors.subtext}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]} onPress={login}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---------------- TASKS SCREEN ----------------
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Tasks ✅</Text>
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.danger }]} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Add Task Input */}
      <View style={styles.addTaskRow}>
        <TextInput
          style={[styles.input, { flex: 1, backgroundColor: colors.card, color: colors.text }]}
          placeholder="Add a new task..."
          placeholderTextColor={colors.subtext}
          value={newTask}
          onChangeText={setNewTask}
        />
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.accent }]} onPress={addTask}>
          <Text style={{ color: "#fff", fontSize: 20 }}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList<Task>
          data={tasks}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTasks} />}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card }]}
              onPress={() => toggleTask(item)}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {item.status === "done" ? "✅ " : ""}{item.title}
                </Text>
                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                  <Text style={{ color: colors.danger, fontSize: 16 }}>🗑</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  centerBox: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 14, marginBottom: 14, fontSize: 16 },
  button: { paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  addTaskRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 12 },
  addButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 50, justifyContent: "center", alignItems: "center" },
  card: { padding: 18, borderRadius: 12, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 3 }, shadowRadius: 5, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: "600" },
  logoutButton: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  logoutText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
