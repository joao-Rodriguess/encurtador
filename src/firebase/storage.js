import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './config';

export const storage = getStorage(app);

/**
 * Faz upload de um arquivo para o Firebase Storage
 * @param {File} file - O arquivo a ser enviado
 * @param {string} path - O caminho/pasta no storage (ex: 'projects' ou 'backgrounds')
 * @returns {Promise<string>} - A URL de download do arquivo
 */
export const uploadImage = async (file, path) => {
  if (!file) return null;
  
  const fileName = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `${path}/${fileName}`);
  
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Erro no upload da imagem:", error);
    throw error;
  }
};
