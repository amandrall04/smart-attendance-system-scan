// attendance-mobile/app/(tabs)/index.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import {
  getStudents,
  getUntrainedStudents,
  markStudentTrained,
} from "../../constants/api";

type Student = {
  id: string;
  name: string;
  email?: string;
  is_trained?: boolean;
};

export default function StudentsTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [untrained, setUntrained] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [all, untrainedList] = await Promise.all([
        getStudents(),
        getUntrainedStudents(),
      ]);

      setStudents(all);
      setUntrained(untrainedList);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMarkTrained = async (student: Student) => {
    try {
      await markStudentTrained(student.id);
      Alert.alert("Success", `${student.name} marked as trained`);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to mark trained");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading students…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Untrained students section */}
      <Text style={styles.sectionTitle}>Untrained Students</Text>
      {untrained.length === 0 ? (
        <Text style={styles.infoText}>🎉 All students are trained!</Text>
      ) : (
        <FlatList
          data={untrained}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              {item.email ? <Text style={styles.email}>{item.email}</Text> : null}
              <Button
                title="Mark as Trained (manual)"
                onPress={() => handleMarkTrained(item)}
              />
            </View>
          )}
        />
      )}

      {/* All students section */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>All Students</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            {item.email ? <Text style={styles.email}>{item.email}</Text> : null}
            <Text style={styles.tag}>
              {item.is_trained ? "✅ Trained" : "⭕ Not trained"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, paddingBottom: 0 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    marginBottom: 12,
  },
  card: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  name: { fontSize: 16, fontWeight: "bold" },
  email: { fontSize: 14, color: "#555" },
  tag: { marginTop: 4, fontSize: 12 },
});
