import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";

interface PDFFile {
  uri: string;
  name: string;
  type: string;
}

export default function UploadPDFScreen({ navigation }: any) {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        setPdfFile({
          uri: file.uri,
          name: file.name ?? "documento.pdf",
          type: file.mimeType ?? "application/pdf",
        });
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  };

  const uploadPDF = async () => {
    if (!pdfFile) {
      Alert.alert("Error", "Selecciona un archivo PDF antes de subirlo");
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: pdfFile.uri,
      name: pdfFile.name,
      type: pdfFile.type,
    } as any);

    formData.append("id", "1");
    formData.append("mascotaId", "1");
    formData.append("tipo", "documento");
    formData.append("titulo", pdfFile.name);
    formData.append("descripcion", "Documento subido desde la app");

    setUploading(true);

    try {
      await axios.post(
        "http://localhost:4000/api/documentos/uploads",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploading(false);
      Alert.alert("Éxito", "PDF subido correctamente");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      setUploading(false);
      Alert.alert("Error", "No se pudo subir el archivo");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subir PDF</Text>

      <TouchableOpacity style={styles.pickBtn} onPress={pickPDF}>
        <Text style={styles.pickText}>
          {pdfFile ? pdfFile.name : "Seleccionar PDF"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadBtn} onPress={uploadPDF}>
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.uploadText}>Subir PDF</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  pickBtn: {
    padding: 15,
    backgroundColor: "#EEE",
    borderRadius: 10,
    marginBottom: 20,
  },
  pickText: { textAlign: "center", fontSize: 16 },
  uploadBtn: {
    padding: 15,
    backgroundColor: "#4A90E2",
    borderRadius: 10,
  },
  uploadText: {
    textAlign: "center",
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
});
