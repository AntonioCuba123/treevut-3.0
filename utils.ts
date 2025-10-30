/**
 * Extracts a JSON code block from a Markdown string and parses it.
 * @param {string} markdown - The string containing the Markdown.
 * @returns {T | null} The parsed JSON object or null if parsing fails.
 */
export function parseJsonFromMarkdown<T>(markdown: string): T | null {
  try {
    // Regex to find a JSON code block
    const jsonBlockRegex = /```(json)?\s*([\s\S]*?)\s*```/;
    const match = markdown.match(jsonBlockRegex);

    if (match && match[2]) {
      // If a code block is found, parse its content
      return JSON.parse(match[2]) as T;
    } else {
      // If no block is found, try to parse the whole string as a fallback
      // This handles cases where the API returns raw JSON without the markdown wrapper
      return JSON.parse(markdown.trim()) as T;
    }
  } catch (error) {
    console.error("Failed to parse JSON from string:", markdown, error);
    return null;
  }
}

/**
 * Formats a number as currency in Peruvian Soles (PEN).
 * @param {number} amount - The amount to format.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);
};

/**
 * Generates a simple, unique-enough ID for client-side rendering.
 * @returns {string} A unique string ID.
 */
export const generateUniqueId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};


/**
 * Converts a file (like a PDF) to a Base64 encoded data URL.
 * Does not perform compression.
 * @param {File} file The file to convert.
 * @returns {Promise<{ base64: string; url: string; mimeType: string }>}
 */
export const fileToDataUrl = (file: File): Promise<{ base64: string; url: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const url = reader.result as string;
            const base64 = url.split(',')[1];
            resolve({ base64, url, mimeType: file.type });
        };
        reader.onerror = error => reject(error);
    });
};

/**
 * Compresses an image file before converting it to a Base64 encoded data URL.
 * @param {File} file The image file to compress.
 * @param {number} maxWidth The maximum width of the output image.
 * @param {number} quality The quality of the output JPEG image (0 to 1).
 * @returns {Promise<{ base64: string; url: string; mimeType: string }>}
 */
export const compressImage = (file: File, maxWidth: number = 1280, quality: number = 0.8): Promise<{ base64: string; url: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = maxWidth / img.width;
            const width = scale < 1 ? maxWidth : img.width;
            const height = scale < 1 ? img.height * scale : img.height;
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            
            const url = canvas.toDataURL('image/jpeg', quality);
            const base64 = url.split(',')[1];
            
            URL.revokeObjectURL(img.src);
            resolve({ base64, url, mimeType: 'image/jpeg' });
        };
        img.onerror = (error) => {
            URL.revokeObjectURL(img.src);
            reject(error);
        };
    });
};
