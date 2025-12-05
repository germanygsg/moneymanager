/**
 * Client-side image compression utility using Canvas API
 * Compresses images to a smaller size while maintaining reasonable quality
 */

export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0-1, where 1 is highest quality
    outputFormat?: 'image/jpeg' | 'image/webp';
}

const DEFAULT_OPTIONS: CompressionOptions = {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.7,
    outputFormat: 'image/jpeg',
};

/**
 * Compress an image file to a smaller size
 * @param file The image file to compress
 * @param options Compression options
 * @returns A promise that resolves to the compressed image as a base64 data URL
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<string> {
    const { maxWidth, maxHeight, quality, outputFormat } = {
        ...DEFAULT_OPTIONS,
        ...options,
    };

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = img;

                if (width > maxWidth! || height > maxHeight!) {
                    const aspectRatio = width / height;

                    if (width > height) {
                        width = maxWidth!;
                        height = Math.round(width / aspectRatio);
                    } else {
                        height = maxHeight!;
                        width = Math.round(height * aspectRatio);
                    }

                    // Ensure we don't exceed either dimension
                    if (width > maxWidth!) {
                        width = maxWidth!;
                        height = Math.round(width / aspectRatio);
                    }
                    if (height > maxHeight!) {
                        height = maxHeight!;
                        width = Math.round(height * aspectRatio);
                    }
                }

                // Create canvas and draw the resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Use higher quality image smoothing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw the image
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed format
                const compressedDataUrl = canvas.toDataURL(outputFormat, quality);
                resolve(compressedDataUrl);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
    });
}

/**
 * Get the file size of a base64 data URL in bytes
 * @param dataUrl The base64 data URL
 * @returns Size in bytes
 */
export function getBase64Size(dataUrl: string): number {
    // Remove the data URL prefix
    const base64 = dataUrl.split(',')[1];
    if (!base64) return 0;

    // Calculate the byte size
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    return (base64.length * 3) / 4 - padding;
}

/**
 * Format file size in human-readable format
 * @param bytes Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate if a file is an acceptable image type
 * @param file The file to validate
 * @returns Whether the file is a valid image
 */
export function isValidImageFile(file: File): boolean {
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    return acceptedTypes.includes(file.type.toLowerCase());
}
