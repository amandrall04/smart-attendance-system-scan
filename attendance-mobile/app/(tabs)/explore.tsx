// attendance-mobile/app/(tabs)/explore.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getAttendance } from "../../constants/api";

type Attendance = {
  id: string;
  student_id: string;
  student_name: string;
  room_id: string;
  confidence?: number;
  timestamp: string;
};

export default function AttendanceTab() {
  const [studentId, setStudentId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState(""); // yyyy-mm-dd
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (studentId.trim()) filters.student_id = studentId.trim();
      if (roomId.trim()) filters.room_id = roomId.trim();
      if (date.trim()) filters.date = date.trim();

      const data = await getAttendance(filters);
      setRecords(data);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load today's by default (no filters)
    loadAttendance();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Records</Text>

      {/* Filters */}
      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="Student ID (optional)"
          value={studentId}
          onChangeText={setStudentId}
        />
        <TextInput
          style={styles.input}
          placeholder="Room ID (optional)"
          value={roomId}
          onChangeText={setRoomId}
        />
        <TextInput
          style={styles.input}
          placeholder="Date YYYY-MM-DD (optional)"
          value={date}
          onChangeText={setDate}
        />
        <Button
          title={loading ? "Loading..." : "Apply Filters"}
          onPress={loadAttendance}
          disabled={loading}
        />
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text>Loading attendance…</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={
            <Text style={{ marginTop: 16 }}>No records found.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.student_name}</Text>
              <Text>Student ID: {item.student_id}</Text>
              <Text>Room: {item.room_id}</Text>
              {item.confidence != null && (
                <Text>Confidence: {item.confidence}%</Text>
              )}
              <Text>
                Time: {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingBottom: 0 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  filters: { marginBottom: 12, gap: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  name: { fontSize: 16, fontWeight: "bold" },
});
