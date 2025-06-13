import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Storage } from '../firebase/firebase';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} folder - The folder path in Storage (e.g. 'products', 'categories')
 * @returns {Promise<string>} The download URL of the uploaded file
 */
export const uploadFile = async (file, folder = 'products') => {
  try {
    // Create unique filename
    const fileName = `${folder}/image-${Date.now()}-${file.name}`;
    const storageRef = ref(Storage, fileName);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload successfully!');

    // Get download URL
    const url = await getDownloadURL(snapshot.ref);
    console.log('Get URL successfully');
    
    return { url, fileName };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload multiple files to Firebase Storage
 * @param {File[]} files - Array of files to upload
 * @param {string} folder - The folder path in Storage
 * @returns {Promise<string[]>} Array of download URLs
 */
export const uploadMultipleFiles = async (files, folder = 'products') => {
  try {
    const uploadPromises = Array.from(files).map(file => uploadFile(file, folder));
    const results = await Promise.all(uploadPromises);
    return results.map(result => result.url);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};