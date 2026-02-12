// CLIENT-SIDE ENCRYPTION ENGINE
// This runs in the browser. The server NEVER sees the key.

// Generate a random encryption key
export async function generateKey() {
    return await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

// Export key to a string 
export async function exportKey(key) {
    const exported = await window.crypto.subtle.exportKey("jwk", key);
    return JSON.stringify(exported); 
}

// Import key from string
export async function importKey(str) {
    const jwk = JSON.parse(str);
    return await window.crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

// Encrypt Data
export async function encryptData(text, key) {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(text);
    
    // Random initialization vector (IV)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encoded
    );

    // Combine IV + Encrypted Data -> Base64 String
    const buffer = new Uint8Array(iv.byteLength + encrypted.byteLength);
    buffer.set(iv, 0);
    buffer.set(new Uint8Array(encrypted), iv.byteLength);
    
    return btoa(String.fromCharCode(...buffer));
}

// Decrypt Data
export async function decryptData(encryptedBase64, key) {
    const binaryStr = atob(encryptedBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }

    // Extract IV (first 12 bytes) and Data
    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}