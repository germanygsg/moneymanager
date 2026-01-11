import {
    getBase64Size,
    formatFileSize,
    isValidImageFile,
} from '../imageCompression';

describe('getBase64Size', () => {
    it('should calculate size for valid base64 without padding', () => {
        // "hello" in base64 is "aGVsbG8="
        const dataUrl = 'data:text/plain;base64,aGVsbG8=';
        const result = getBase64Size(dataUrl);
        // "aGVsbG8=" is 8 chars, 1 padding = (8 * 3 / 4) - 1 = 5 bytes
        expect(result).toBe(5);
    });

    it('should calculate size for base64 with double padding', () => {
        // "hi" in base64 is "aGk="
        const dataUrl = 'data:text/plain;base64,aGk=';
        const result = getBase64Size(dataUrl);
        // "aGk=" is 4 chars, 1 padding = (4 * 3 / 4) - 1 = 2 bytes
        expect(result).toBe(2);
    });

    it('should return 0 for empty data url', () => {
        const result = getBase64Size('');
        expect(result).toBe(0);
    });

    it('should return 0 for data url without base64 content', () => {
        const result = getBase64Size('data:text/plain;base64,');
        expect(result).toBe(0);
    });
});

describe('formatFileSize', () => {
    it('should format zero bytes', () => {
        expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes', () => {
        expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
        expect(formatFileSize(1024)).toBe('1 KB');
        expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
        expect(formatFileSize(1048576)).toBe('1 MB');
        expect(formatFileSize(2621440)).toBe('2.5 MB');
    });

    it('should format gigabytes', () => {
        expect(formatFileSize(1073741824)).toBe('1 GB');
    });
});

describe('isValidImageFile', () => {
    const createMockFile = (type: string): File => {
        return new File([''], 'test', { type });
    };

    it('should accept JPEG files', () => {
        expect(isValidImageFile(createMockFile('image/jpeg'))).toBe(true);
        expect(isValidImageFile(createMockFile('image/jpg'))).toBe(true);
    });

    it('should accept PNG files', () => {
        expect(isValidImageFile(createMockFile('image/png'))).toBe(true);
    });

    it('should accept WebP files', () => {
        expect(isValidImageFile(createMockFile('image/webp'))).toBe(true);
    });

    it('should accept HEIC files', () => {
        expect(isValidImageFile(createMockFile('image/heic'))).toBe(true);
        expect(isValidImageFile(createMockFile('image/heif'))).toBe(true);
    });

    it('should reject non-image files', () => {
        expect(isValidImageFile(createMockFile('application/pdf'))).toBe(false);
        expect(isValidImageFile(createMockFile('text/plain'))).toBe(false);
        expect(isValidImageFile(createMockFile('video/mp4'))).toBe(false);
    });

    it('should reject unsupported image formats', () => {
        expect(isValidImageFile(createMockFile('image/gif'))).toBe(false);
        expect(isValidImageFile(createMockFile('image/bmp'))).toBe(false);
        expect(isValidImageFile(createMockFile('image/svg+xml'))).toBe(false);
    });
});
