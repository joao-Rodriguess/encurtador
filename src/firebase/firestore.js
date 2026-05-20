import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc, deleteDoc, onSnapshot, setDoc, getDoc, increment } from 'firebase/firestore';
import { app } from './config';

export const db = getFirestore(app);

// --- PROJECTS ---

// Auxiliar para desmarcar projetos em destaque de um usuário
const unsetFeaturedProjects = async (userId) => {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('userId', '==', userId), where('isFeatured', '==', true));
    const snap = await getDocs(q);
    const promises = snap.docs.map((d) => {
      return updateDoc(doc(db, 'projects', d.id), { isFeatured: false });
    });
    await Promise.all(promises);
  } catch (error) {
    console.error("Erro ao limpar destaques anteriores:", error);
  }
};

export const createProject = async (userId, projectData) => {
  if (projectData.isFeatured) {
    await unsetFeaturedProjects(userId);
  }
  const docRef = await addDoc(collection(db, 'projects'), {
    userId,
    ...projectData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateProject = async (docId, projectData) => {
  if (projectData.isFeatured) {
    const projectRef = doc(db, 'projects', docId);
    const snap = await getDoc(projectRef);
    if (snap.exists()) {
      const userId = snap.data().userId;
      await unsetFeaturedProjects(userId);
    }
  }
  const projectRef = doc(db, 'projects', docId);
  await updateDoc(projectRef, projectData);
};

export const deleteProject = async (docId) => {
  await deleteDoc(doc(db, 'projects', docId));
};

export const subscribeToProjects = (callback) => {
  const projectsRef = collection(db, 'projects');
  // Buscar todos os projetos, afinal é o portfólio
  const q = query(projectsRef);
  
  return onSnapshot(q, (snapshot) => {
    const projects = [];
    snapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenar localmente
    projects.sort((a, b) => {
      const timeA = a.createdAt ? a.createdAt.toMillis() : Date.now();
      const timeB = b.createdAt ? b.createdAt.toMillis() : Date.now();
      return timeB - timeA;
    });
    
    callback(projects);
  }, (error) => {
    console.error("Erro ao buscar projetos:", error);
  });
};

// --- PROFILE / SETTINGS ---

export const getProfile = async (userId) => {
  const profileRef = doc(db, 'profiles', userId);
  const snap = await getDoc(profileRef);
  if (snap.exists()) {
    return snap.data();
  }
  return { bgImageUrl: '' };
};

export const updateProfile = async (userId, data) => {
  const profileRef = doc(db, 'profiles', userId);
  await setDoc(profileRef, data, { merge: true });
};

export const subscribeToProfile = (userId, callback) => {
  const profileRef = doc(db, 'profiles', userId);
  return onSnapshot(profileRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      callback({ bgImageUrl: '' });
    }
  });
};

export const getHubSettings = async () => {
  const q = query(collection(db, 'profiles'));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return snap.docs[0].data();
  }
  return { bgImageUrl: '' };
};

// --- ANNOUNCEMENTS (BANNERS) ---

export const createAnnouncement = async (announcementData) => {
  const docRef = await addDoc(collection(db, 'announcements'), {
    ...announcementData,
    isActive: announcementData.isActive || false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateAnnouncement = async (docId, announcementData) => {
  const ref = doc(db, 'announcements', docId);
  await updateDoc(ref, announcementData);
};

export const deleteAnnouncement = async (docId) => {
  await deleteDoc(doc(db, 'announcements', docId));
};

export const subscribeToAnnouncements = (callback) => {
  const q = query(collection(db, 'announcements'));
  return onSnapshot(q, (snapshot) => {
    const data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenar localmente por data de criação descrescente
    data.sort((a, b) => {
      const timeA = a.createdAt ? a.createdAt.toMillis() : Date.now();
      const timeB = b.createdAt ? b.createdAt.toMillis() : Date.now();
      return timeB - timeA;
    });
    
    callback(data);
  }, (error) => {
    console.error("Erro ao buscar anúncios:", error);
  });
};

export const activateAnnouncement = async (docId) => {
  // Desativa todos e ativa apenas o escolhido
  const q = query(collection(db, 'announcements'));
  const snap = await getDocs(q);
  const promises = snap.docs.map((d) => {
    const ref = doc(db, 'announcements', d.id);
    return updateDoc(ref, { isActive: d.id === docId });
  });
  await Promise.all(promises);
};

export const deactivateAnnouncement = async (docId) => {
  const ref = doc(db, 'announcements', docId);
  await updateDoc(ref, { isActive: false });
};

// --- VISITOR LOGS (ANALYTICS) ---

export const logVisitor = async (visitorData) => {
  try {
    const docRef = await addDoc(collection(db, 'visitor_logs'), {
      ...visitorData,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao registrar visitante:", error);
    return null;
  }
};

export const subscribeToVisitorLogs = (callback) => {
  const q = query(collection(db, 'visitor_logs'));
  return onSnapshot(q, (snapshot) => {
    const logs = [];
    snapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    // Ordenar por timestamp decrescente
    logs.sort((a, b) => {
      const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
      const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
      return timeB - timeA;
    });
    callback(logs);
  }, (error) => {
    console.error("Erro ao escutar logs de visitantes:", error);
  });
};

// --- CHAT COMMENTS ---

export const sendComment = async (commentData) => {
  try {
    const docRef = await addDoc(collection(db, 'comments'), {
      ...commentData,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao enviar comentário:", error);
    return null;
  }
};

export const subscribeToComments = (callback) => {
  const q = query(collection(db, 'comments'));
  return onSnapshot(q, (snapshot) => {
    const comments = [];
    snapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    // Ordenar por timestamp crescente para o fluxo de chat
    comments.sort((a, b) => {
      const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
      const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
      return timeA - timeB;
    });
    callback(comments);
  }, (error) => {
    console.error("Erro ao escutar comentários:", error);
  });
};

export const deleteComment = async (docId) => {
  try {
    await deleteDoc(doc(db, 'comments', docId));
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    throw error;
  }
};

// --- PROJECT LIKES & COMMENTS ---

export const toggleProjectLike = async (projectId, isLiked) => {
  try {
    const ref = doc(db, 'projects', projectId);
    await updateDoc(ref, {
      likesCount: increment(isLiked ? -1 : 1)
    });
  } catch (error) {
    console.error("Erro ao alternar curtida do projeto:", error);
    throw error;
  }
};

export const sendProjectComment = async (projectId, projectTitle, commentData) => {
  try {
    const docRef = await addDoc(collection(db, 'project_comments'), {
      projectId,
      projectTitle,
      ...commentData,
      timestamp: serverTimestamp()
    });
    
    // Incrementar o contador no projeto
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      commentsCount: increment(1)
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Erro ao enviar comentário do projeto:", error);
    return null;
  }
};

export const subscribeToProjectComments = (projectId, callback) => {
  const q = query(
    collection(db, 'project_comments'),
    where('projectId', '==', projectId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const comments = [];
    snapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenar por data crescente
    comments.sort((a, b) => {
      const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
      const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
      return timeA - timeB;
    });
    
    callback(comments);
  }, (error) => {
    console.error("Erro ao escutar comentários do projeto:", error);
  });
};

export const subscribeToAllProjectComments = (callback) => {
  const q = query(collection(db, 'project_comments'));
  
  return onSnapshot(q, (snapshot) => {
    const comments = [];
    snapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenar por data decrescente para a moderação
    comments.sort((a, b) => {
      const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
      const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
      return timeB - timeA;
    });
    
    callback(comments);
  }, (error) => {
    console.error("Erro ao escutar todos os comentários dos projetos:", error);
  });
};

export const deleteProjectComment = async (commentId, projectId) => {
  try {
    await deleteDoc(doc(db, 'project_comments', commentId));
    
    // Decrementar o contador no projeto se projectId for fornecido
    if (projectId) {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        commentsCount: increment(-1)
      });
    }
  } catch (error) {
    console.error("Erro ao deletar comentário do projeto:", error);
    throw error;
  }
};



