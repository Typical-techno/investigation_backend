import cloudinary from '../config/cloudinaryConfig';
import formatDate from './formatDate';
import { UploadApiResponse } from 'cloudinary';

/**
 * Uploads a file to Cloudinary from a buffer.
 * @param {Express.Multer.File} file - The file to upload.
 * @param {string} folder - The Cloudinary folder to store the file.
 * @returns {Promise<string>} - The URL of the uploaded file.
 */

export const uploadToCloudinary = async (file: Express.Multer.File, folder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: `${formatDate()}_${file.fieldname}`,
                resource_type: 'auto' // Ensures Cloudinary auto-detects file type
            },
            (error, result: UploadApiResponse | undefined) => {
                if (error || !result) {
                    console.error('Cloudinary upload error:', error);
                    return reject(new Error('File upload failed'));
                }
                resolve(result.secure_url);
            }
        );

        uploadStream.end(file.buffer); // Send the file buffer to Cloudinary
    });
};
