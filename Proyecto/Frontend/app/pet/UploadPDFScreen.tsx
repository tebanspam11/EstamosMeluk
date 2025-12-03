import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";

export default function UploadPDFScreen({ navigation, route }: any) {
  const { id_mascota } = route.params; 
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFileChangeWeb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      Alert.alert("Error", "Solo se permiten archivos PDF");
      return;
    }
    setSelectedFile(file);
  };


  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert("Error", "Selecciona un archivo primero");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("id_mascota", id_mascota); 
      formData.append("tipo", "documento");
      formData.append("titulo", selectedFile.name);
      formData.append("descripcion", "PDF subido desde web");

      const response = await fetch("http://localhost:4000/api/documentos/uploads", {
        method: "POST",
        body: formData, 
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Error desconocido");
      }

      await response.json().catch(() => ({}));

      Alert.alert("Éxito", "PDF subido correctamente");
      setSelectedFile(null);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subir PDF</Text>

      {/* Input oculto */}
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChangeWeb}
      />

      {/* Botón de selección */}
      <TouchableOpacity
        style={styles.selectBtn}
        onPress={() => fileInputRef.current?.click()}
      >
        <Text style={styles.selectText}>
          {selectedFile ? "Cambiar archivo" : "Seleccionar PDF"}
        </Text>
      </TouchableOpacity>

      {selectedFile && <Text style={{ marginBottom: 10 }}>📄 {selectedFile.name}</Text>}

      {/* Botón de subida */}
      <TouchableOpacity
        style={[styles.uploadBtn, (!selectedFile || uploading) && { backgroundColor: "#ccc" }]}
        disabled={!selectedFile || uploading}
        onPress={handleUpload}
      >
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.uploadText}>Subir PDF</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30 },
  selectBtn: { padding: 15, backgroundColor: "#6c757d", borderRadius: 10, marginBottom: 20, minWidth: 200 },
  selectText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  uploadBtn: { padding: 15, backgroundColor: "#4A90E2", borderRadius: 10, minWidth: 200 },
  uploadText: { color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 16 },
});
