import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc, increment, deleteDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { app } from './config';

export const db = getFirestore(app);

export const createShortLink = async (userId, originalUrl) => {
  // Generate 6 chars random code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortCode = '';
  let isUnique = false;

  while (!isUnique) {
    shortCode = ''; // Reseta para garantir que tenha sempre exatamente 6 caracteres
    for (let i = 0; i < 6; i++) {
      shortCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Check collision
    const linksRef = collection(db, 'links');
    const q = query(linksRef, where('shortCode', '==', shortCode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      isUnique = true;
    } else {
      shortCode = ''; // try again
    }
  }

  // Save to firestore
  const docRef = await addDoc(collection(db, 'links'), {
    userId,
    originalUrl,
    shortCode,
    createdAt: serverTimestamp(),
    clicks: 0
  });

  return shortCode;
};

export const getLinkByCode = async (shortCode) => {
  const linksRef = collection(db, 'links');
  const q = query(linksRef, where('shortCode', '==', shortCode));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const incrementClicks = async (docId) => {
  const linkRef = doc(db, 'links', docId);
  await updateDoc(linkRef, {
    clicks: increment(1)
  });
};

export const updateFullLink = async (docId, newUrl, newShortCode, currentShortCode) => {
  /* Comentado para teste de permissão
  if (newShortCode !== currentShortCode) {
    const linksRef = collection(db, 'links');
    const q = query(linksRef, where('shortCode', '==', newShortCode));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Este código já está em uso. Escolha outro!');
    }
  }
  */

  const linkRef = doc(db, 'links', docId);
  await updateDoc(linkRef, {
    originalUrl: newUrl,
    shortCode: newShortCode
  });
};

export const deleteLink = async (docId) => {
  await deleteDoc(doc(db, 'links', docId));
};

export const subscribeToUserLinks = (userId, callback) => {
  const linksRef = collection(db, 'links');
  // Removemos o orderBy('createdAt', 'desc') da query do Firestore para não exigir um índice composto
  const q = query(linksRef, where('userId', '==', userId));
  
  return onSnapshot(q, (snapshot) => {
    const links = [];
    snapshot.forEach((doc) => {
      links.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenamos localmente de forma decrescente pela data de criação
    links.sort((a, b) => {
      const timeA = a.createdAt ? a.createdAt.toMillis() : Date.now();
      const timeB = b.createdAt ? b.createdAt.toMillis() : Date.now();
      return timeB - timeA;
    });
    
    callback(links);
  }, (error) => {
    console.error("Erro ao buscar links:", error);
  });
};
