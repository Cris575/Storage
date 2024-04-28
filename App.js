import * as FileSystem from "expo-file-system";
import React, { useState, useEffect } from "react";
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert } from "react-native";

const App = () => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const filePath = FileSystem.documentDirectory + "tasks.json";

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const info = await FileSystem.getInfoAsync(filePath);
        if (info.exists) {
          const storedTasks = await FileSystem.readAsStringAsync(filePath);
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error("Error al recuperar tareas", error);
      }
    };
    fetchTasks();
  }, []);

  const addTask = async () => {
    try {
      if (editMode) {
        // Edit existing task
        const updatedTasks = tasks.map((task) =>
          task.id === editTaskId ? { ...task, name, lastName, email, password } : task
        );
        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(updatedTasks));
        setTasks(updatedTasks);
        setEditMode(false);
        setEditTaskId(null);
      } else {
        // Add new task
        const newTask = { id: Date.now(), name, lastName, email, password };
        const updatedTasks = [...tasks, newTask];
        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(updatedTasks));
        setTasks(updatedTasks);
      }
      setName("");
      setLastName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error al agregar tarea", error);
    }
  };

  const editTask = (id) => {
    const taskToEdit = tasks.find((task) => task.id === id);
    setName(taskToEdit.name);
    setLastName(taskToEdit.lastName);
    setEmail(taskToEdit.email);
    setPassword(taskToEdit.password);
    setEditMode(true);
    setEditTaskId(id);
  };

  const deleteTask = async (id) => {
    try {
      const updatedTasks = tasks.filter((item) => item.id !== id);
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error al borrar tarea", error);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Confirmar",
      "¿Estás seguro de que quieres borrar esta tarea?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Borrar", onPress: () => deleteTask(id) },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <TaskForm
        name={name}
        setName={setName}
        lastName={lastName}
        setLastName={setLastName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        addTask={addTask}
        editMode={editMode}
      />
      <FlatList
        data={tasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <Text style={styles.taskText}>Nombre: {item.name}</Text>
            <Text style={styles.taskText}>Apellido: {item.lastName}</Text>
            <Text style={styles.taskText}>Correo: {item.email}</Text>
            <Text style={styles.taskText}>Contraseña: {item.password}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Editar" onPress={() => editTask(item.id)} />
              <Button title="Borrar" onPress={() => confirmDelete(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const TaskForm = ({
  name,
  setName,
  lastName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  addTask,
  editMode,
}) => {
  return (
    <View style={styles.formContainer}>
      <TextInput style={styles.input} placeholder="Nombre" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput style={styles.input} placeholder="Correo" value={email} onChangeText={setEmail} />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <Button title={editMode ? "Guardar" : "Agregar"} onPress={addTask} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 60,
  },
  formContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
  },
  taskContainer: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 5,
    padding: 10,
  },
  taskText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default App;
