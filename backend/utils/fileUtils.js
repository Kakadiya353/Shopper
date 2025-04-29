const fs = require('fs');
const path = require('path');

/**
 * Safely delete a file from the filesystem
 * @param {string} filePath - The full path to the file
 * @param {string} entityType - The type of entity (user, product, offer) for logging
 * @returns {boolean} - Whether the deletion was successful
 */
const deleteFile = (filePath, entityType) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Successfully deleted ${entityType} image: ${filePath}`);
      return true;
    } else {
      console.warn(`${entityType} image file not found: ${filePath}`);
      return false;
    }
  } catch (err) {
    console.error(`Failed to delete ${entityType} image: ${err.message}`);
    return false;
  }
};

/**
 * Delete an image file based on the image URI and directory
 * @param {string} imagePath - The image URI from the database
 * @param {string} folder - The directory where images are stored (e.g., 'profilepic', 'products')
 * @param {string} type - The type of entity (user, product, offer) for logging
 * @returns {boolean} - Whether the deletion was successful
 */
const deleteImageFile = (imagePath, folder, type) => {
    try {
        console.log(`Attempting to delete ${type} image: ${imagePath}`);
        
        // Ensure the path is properly formatted
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        const fullPath = path.join(__dirname, '..', 'public', cleanPath);
        
        console.log(`Full path to delete: ${fullPath}`);
        
        // Check if file exists before attempting to delete
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`Successfully deleted ${type} image: ${fullPath}`);
            return true;
        } else {
            console.log(`File not found: ${fullPath}`);
            return false;
        }
    } catch (error) {
        console.error(`Error deleting ${type} image:`, error);
        // Don't throw the error, just log it and return false
        return false;
    }
};

module.exports = {
  deleteFile,
  deleteImageFile
}; 