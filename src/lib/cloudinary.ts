import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary server-side instance
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export { cloudinary };

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Upload an image buffer directly to Cloudinary using upload_stream.
 * Server-only execution.
 */
export async function uploadImageBufferToCloudinary(
  buffer: Buffer,
  options?: {
    folder?: string;
    publicId?: string;
    tags?: string[];
  }
): Promise<CloudinaryUploadResult> {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary environment credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing.');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder || 'sattavilakku',
        public_id: options?.publicId,
        tags: options?.tags || ['sattavilakku', 'media'],
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload stream returned no result.'));
        } else {
          resolve({
            url: result.url,
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete an asset from Cloudinary by public ID.
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!cloudName || !apiKey || !apiSecret || !publicId) return false;
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch (err) {
    console.warn('Cloudinary delete error:', err);
    return false;
  }
}
