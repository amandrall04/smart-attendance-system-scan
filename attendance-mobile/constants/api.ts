// attendance-mobile/constants/api.ts

// IMPORTANT:
// For REAL ANDROID PHONE → use your PC's Wi-Fi IP + port where server runs.
// Example: if backend logs "http://localhost:5001", and PC IP is 192.168.1.7:
//   API_BASE_URL = "http://192.168.1.7:5001/api";
//
// For ANDROID EMULATOR → use "http://10.0.2.2:5001/api";

const API_BASE_URL = "http://192.168.1.7:5001/api"; // 🔁 CHANGE THIS

console.log("🔧 Mobile API Base URL:", API_BASE_URL);

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    console.log(`📡 API Request: ${options.method || "GET"} ${endpoint}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ API Error (${response.status}):`, data);
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    console.log("✅ API Success:", data);
    return data;
  } catch (error) {
    console.error("❌ API Request failed:", error);
    throw error;
  }
}

// === Same functions as your web api.js, just in TS/JS for RN ===

// Get all students
export const getStudents = () => apiRequest("/students");

// Get untrained students
export const getUntrainedStudents = () => apiRequest("/students/untrained");

// Save face descriptor (NOTE: RN still needs a way to COMPUTE descriptor!)
export const saveFaceDescriptor = (
  studentId: string,
  descriptor: number[],
  photoNumber: number
) => {
  console.log(
    `💾 Saving face descriptor for ${studentId}, photo #${photoNumber}`
  );

  return apiRequest("/face-descriptors", {
    method: "POST",
    body: JSON.stringify({
      student_id: studentId,
      descriptor,
      photo_number: photoNumber,
    }),
  });
};

// Mark student as trained
export const markStudentTrained = (studentId: string) => {
  console.log(`✅ Marking student ${studentId} as trained`);

  return apiRequest(`/students/${studentId}/trained`, {
    method: "POST",
  });
};

// Get all face descriptors
export const getAllFaceDescriptors = () => apiRequest("/face-descriptors");

// Confirm attendance (same shape as web)
export const confirmAttendance = (attendanceData: {
  student_id: string;
  student_name: string;
  room_id: string;
  confidence?: number;
}) => {
  console.log("📝 Confirming attendance for:", attendanceData);

  return apiRequest("/attendance/confirm", {
    method: "POST",
    body: JSON.stringify(attendanceData),
  });
};

// Get attendance records
export const getAttendance = (filters: {
  student_id?: string;
  room_id?: string;
  date?: string;
} = {}) => {
  const queryParams = new URLSearchParams();

  if (filters.student_id) queryParams.append("student_id", filters.student_id);
  if (filters.room_id) queryParams.append("room_id", filters.room_id);
  if (filters.date) queryParams.append("date", filters.date);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/attendance?${queryString}` : "/attendance";

  return apiRequest(endpoint);
};

// Health check
export const checkHealth = () => apiRequest("/health");
