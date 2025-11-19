import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useRole } from '@/contexts/AuthContext';
import { Class } from '@/types';
import apiService from '@/services/api';
import ClassCard from '@/components/ui/ClassCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

export default function HomeScreen() {
  const { user } = useAuth();
  const { isTeacher, isStudent, isDirectivo } = useRole();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Estado para crear clase
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Estado para unirse a clase
  const [classCode, setClassCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      // Si es directivo, obtener TODAS las clases del sistema
      const response = isDirectivo
        ? await apiService.getAllClasses()
        : await apiService.getClasses();

      if (response.success && response.data) {
        setClasses(response.data);
      } else {
        setAlertMessage({
          type: 'error',
          message: response.error || 'Error al cargar las clases',
        });
      }
    } catch (error) {
      setAlertMessage({
        type: 'error',
        message: 'Error de conexión',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadClasses();
  }, []);

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      setAlertMessage({
        type: 'error',
        message: 'El nombre de la clase es requerido',
      });
      return;
    }

    setCreateLoading(true);

    try {
      const response = await apiService.createClass({
        name: newClassName.trim(),
        description: newClassDescription.trim(),
        subject: newClassSubject.trim(),
      });

      if (response.success && response.data) {
        setClasses([response.data, ...classes]);
        setShowCreateModal(false);
        setNewClassName('');
        setNewClassDescription('');
        setNewClassSubject('');
        setAlertMessage({
          type: 'success',
          message: '¡Clase creada exitosamente!',
        });
      } else {
        setAlertMessage({
          type: 'error',
          message: response.error || 'Error al crear la clase',
        });
      }
    } catch (error) {
      setAlertMessage({
        type: 'error',
        message: 'Error de conexión',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      setAlertMessage({
        type: 'error',
        message: 'El código de clase es requerido',
      });
      return;
    }

    setJoinLoading(true);

    try {
      const response = await apiService.joinClass(classCode.trim());

      if (response.success && response.data) {
        setClasses([response.data, ...classes]);
        setShowJoinModal(false);
        setClassCode('');
        setAlertMessage({
          type: 'success',
          message: '¡Te has unido a la clase exitosamente!',
        });
      } else {
        setAlertMessage({
          type: 'error',
          message: response.error || 'Código inválido o clase no encontrada',
        });
      }
    } catch (error) {
      setAlertMessage({
        type: 'error',
        message: 'Error de conexión',
      });
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Cargando clases..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hola, {user?.name?.split(' ')[0]} 👋
          </Text>
          <Text style={styles.subtitle}>
            {isDirectivo ? 'Todas las clases del sistema' : isTeacher ? 'Tus clases' : 'Mis clases'}
          </Text>
        </View>

        {isTeacher && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        )}

        {isStudent && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowJoinModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {alertMessage && (
        <View style={styles.alertContainer}>
          <Alert
            type={alertMessage.type}
            message={alertMessage.message}
            onClose={() => setAlertMessage(null)}
          />
        </View>
      )}

      {/* Lista de clases */}
      {classes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="school-outline" size={64} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>
            {isDirectivo ? 'No hay clases en el sistema' : 'No tienes clases aún'}
          </Text>
          <Text style={styles.emptyText}>
            {isDirectivo
              ? 'No hay clases creadas en el sistema'
              : isTeacher
                ? 'Crea tu primera clase para empezar'
                : 'Únete a una clase con un código'}
          </Text>
          {isTeacher && (
            <Button
              title="Crear clase"
              onPress={() => setShowCreateModal(true)}
              style={styles.emptyButton}
            />
          )}
          {isStudent && (
            <Button
              title="Unirse a clase"
              onPress={() => setShowJoinModal(true)}
              style={styles.emptyButton}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClassCard
              classData={item}
              onPress={() => router.push(`/class/${item.id}` as any)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Modal: Crear clase */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear nueva clase</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Input
              label="Nombre de la clase *"
              placeholder="Ej: Matemáticas Avanzadas"
              value={newClassName}
              onChangeText={setNewClassName}
              icon="book-outline"
            />

            <Input
              label="Materia"
              placeholder="Ej: Matemáticas"
              value={newClassSubject}
              onChangeText={setNewClassSubject}
              icon="bookmark-outline"
            />

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Descripción de la clase..."
                value={newClassDescription}
                onChangeText={setNewClassDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <Button
              title="Crear clase"
              onPress={handleCreateClass}
              loading={createLoading}
              fullWidth
            />
          </View>
        </View>
      </Modal>

      {/* Modal: Unirse a clase */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Unirse a una clase</Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Pide el código de clase a tu profesor y escríbelo a continuación
            </Text>

            <Input
              label="Código de clase"
              placeholder="Ej: ABC123"
              value={classCode}
              onChangeText={(text) => setClassCode(text.toUpperCase())}
              icon="key-outline"
              autoCapitalize="characters"
            />

            <Button
              title="Unirse"
              onPress={handleJoinClass}
              loading={joinLoading}
              fullWidth
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  alertContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  listContent: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
  },
});
