import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { 
  Camera, 
  useCameraDevice, 
  useCameraPermission, 
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import { useRunOnJS } from 'react-native-worklets-core';

export default function ScanFaceScreen() {
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Scanning for face...");
  const cameraRef = useRef<Camera>(null);

  // 1. Configure the Face Detector
  const { detectFaces } = useFaceDetector({
    performanceMode: 'fast',
    contourMode: 'none',
    landmarkMode: 'none',
    classificationMode: 'none'
  });

  useEffect(() => {
    requestPermission();
  }, []);

  // 2. Define the Javascript function to handle detection
  const handleFaceDetected = async () => {
    // If already processing or camera isn't ready, exit
    if (isProcessing || !cameraRef.current) return;
    
    setIsProcessing(true);
    setStatusMessage("Face detected! Verifying...");

    try {
      // Take photo: prioritize speed
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        enableShutterSound: false 
      });

      console.log("Photo taken at:", photo.path);
      
      // TODO: Upload 'photo.path' to your backend here
      // const result = await uploadFace(photo.path);

      // Simulating network request delay
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      Alert.alert("Success", "Attendance Marked!", [
        { text: "OK", onPress: () => setIsProcessing(false) }
      ]);
      setStatusMessage("Attendance marked.");

    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to verify. Try again.");
      setIsProcessing(false);
    }
  };

  // 3. Create a thread-safe wrapper for the JS function
  // 'useRunOnJS' fixes the "Type 'never'" error by correctly typing the worklet
  const workletSafeHandler = useRunOnJS(handleFaceDetected, [isProcessing]);

  // 4. Create the Frame Processor (Runs on UI Thread)
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    // Check 'isProcessing' to stop scanning while we handle a result
    if (isProcessing) return;

    const faces = detectFaces(frame);
    
    // If a face is found, call the JS handler
    if (faces.length > 0) {
      workletSafeHandler();
    }
  }, [isProcessing, detectFaces, workletSafeHandler]);

  if (!hasPermission) return <Text>Requesting permission...</Text>;
  if (device == null) return <Text>No camera device found</Text>;

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true} 
        // Important: prioritizes capture speed over high-res quality
        photoQualityBalance="speed"
        frameProcessor={frameProcessor}
        // YUV format is required for efficient frame processing
        pixelFormat="yuv" 
      />
      
      <View style={styles.overlay}>
        <View style={styles.statusBox}>
          {isProcessing && <ActivityIndicator color="#000" style={{marginBottom: 5}} />}
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  }
});