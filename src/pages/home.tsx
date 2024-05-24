import React, { useState, useEffect, useRef } from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonTextarea,
  IonTitle,
  IonToolbar,
  IonItemDivider,
  useIonToast,
  IonAlert
} from '@ionic/react';
import { trashOutline, pencilOutline } from 'ionicons/icons';
import './home.css'; // Assuming you have a separate CSS file for styling

// Firebase
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useHistory } from 'react-router-dom';
import { signOut } from 'firebase/auth';

interface ToDoItem {
  id: string;
  title: string;
  description: string;
  dateAdded: string;
  completed: boolean;
}

const Todos: React.FC = () => {
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const inputRefTitle = useRef<HTMLIonInputElement>(null);
  const inputRefDescription = useRef<HTMLIonTextareaElement>(null);
  const [present] = useIonToast();
  const [showLogoutAlert, setShowLogoutAlert] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const history = useHistory();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        history.push('/login');
      } else {
        fetchToDos(user.uid);
        fetchUserName(user.uid);
      }
    });

    return unsubscribe;
  }, [history]);

  const fetchToDos = async (userId: string) => {
    const q = query(collection(db, 'todos'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todosList: ToDoItem[] = [];
      querySnapshot.forEach((doc) => {
        todosList.push({
          id: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          dateAdded: doc.data().dateAdded,
          completed: doc.data().completed
        });
      });
      setTodos(todosList);
    });
    return unsubscribe;
  };

  const fetchUserName = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserName(userData.name);
      }
    } catch (error) {
      console.error('Error fetching user name: ', error);
    }
  };

  const clearInput = () => {
    setNewTitle('');
    setNewDescription('');
    if (inputRefTitle.current && inputRefDescription.current) {
      inputRefTitle.current.setFocus();
    }
  };

  const addTodoToast = (position: 'middle') => {
    present({
      message: 'Added new Todo',
      duration: 1500,
      position: position,
    });
  };

  const editTodoToast = (position: 'middle') => {
    present({
      message: 'Changes Saved',
      duration: 1500,
      position: position,
    });
  };

  const deleteTodoToast = (position: 'middle') => {
    present({
      message: 'Todo deleted',
      duration: 1500,
      position: position,
    });
  };

  const addTodo = async () => {
    if (newTitle.trim() !== '') {
      const currentDate = new Date().toISOString();
      addTodoToast('middle');
      await addDoc(collection(db, 'todos'), {
        title: newTitle,
        description: newDescription,
        dateAdded: currentDate,
        completed: false,
        userId: auth.currentUser?.uid
      });
      clearInput();
    }
  };

  const editTodo = (index: number) => {
    setEditIndex(index);
    const editedTodo = todos[index];
    setNewTitle(editedTodo.title);
    setNewDescription(editedTodo.description);
  };

  const updateTodo = async () => {
    if (editIndex !== null) {
      editTodoToast('middle');
      const todoToUpdate = todos[editIndex];
      await updateDoc(doc(db, 'todos', todoToUpdate.id), {
        title: newTitle,
        description: newDescription,
      });
      clearInput();
      setEditIndex(null);
    }
  };

  const cancelEdit = () => {
    clearInput();
    setEditIndex(null);
  };

  const deleteTodo = async (index: number) => {
    deleteTodoToast('middle');
    const todoToDelete = todos[index];
    await deleteDoc(doc(db, 'todos', todoToDelete.id));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      history.push('/login');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/home" />
          </IonButtons>
          <IonTitle>Todos</IonTitle>
          <IonButton slot="end" onClick={() => setShowLogoutAlert(true)} fill='clear'>Logout</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonInput
                placeholder="Enter task"
                label="Add Todo"
                labelPlacement="floating"
                value={newTitle}
                onIonInput={(e) => setNewTitle(e.detail.value!)}
                ref={inputRefTitle}
              ></IonInput>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonRow>
              <IonCol>
                <IonButton expand="block" onClick={editIndex !== null ? updateTodo : addTodo}>
                  {editIndex !== null ? 'Update' : 'Add'}
                </IonButton>
              </IonCol>
              <IonCol>
                <IonButton expand="block" fill="clear" onClick={editIndex !== null ? cancelEdit : clearInput}>
                  {editIndex !== null ? 'Cancel' : 'Clear'}
                </IonButton>
              </IonCol>
            </IonRow>
          </IonCardContent>
        </IonCard>

        <br></br>
        <IonItemDivider color="light">
          <IonLabel>Todos</IonLabel>
        </IonItemDivider>
        <IonList>
          {todos
            .slice()
            .sort((a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime())
            .map((todo, index) => (
              <IonItem key={index}>
                <IonLabel>
                  <h2>{todo.title}</h2>
                  <p>{todo.description}</p>
                  <p>{new Date(todo.dateAdded).toLocaleString()}</p>
                </IonLabel>
                <IonButton fill="clear" onClick={() => editTodo(index)}>
                  <IonIcon icon={pencilOutline} />
                </IonButton>
                <IonButton fill="clear" onClick={() => deleteTodo(index)}>
                  <IonIcon icon={trashOutline} />
                </IonButton>
              </IonItem>
            ))}
        </IonList>
      </IonContent>
      <IonAlert
        isOpen={showLogoutAlert}
        onDidDismiss={() => setShowLogoutAlert(false)}
        header={`Confirm Logout`}
        message={`Are you sure you want to logout, ${userName}?`}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              setShowLogoutAlert(false);
            }
          },
          {
            text: 'Logout',
            handler: handleLogout,
            cssClass: 'custom-button-blue'
          }
        ]}
      />
    </IonPage>
  );
};

export default Todos;
