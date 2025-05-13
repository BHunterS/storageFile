import CryptoJS from "crypto-js";

export interface AesKey {
    key: string;
    iv: string;
}

export const generateSecretKey = (): AesKey => {
    const key = CryptoJS.lib.WordArray.random(32);
    const iv = CryptoJS.lib.WordArray.random(16);

    return {
        key: CryptoJS.enc.Base64.stringify(key),
        iv: CryptoJS.enc.Base64.stringify(iv),
    };
};

export const encryptAES = (aesKey: AesKey, plainText: string): string => {
    const key = CryptoJS.enc.Base64.parse(aesKey.key);
    const iv = CryptoJS.enc.Base64.parse(aesKey.iv);

    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
};

export const importPublicKey = async (pem: string): Promise<CryptoKey> => {
    const b64 = pem
        .replace(/-----BEGIN PUBLIC KEY-----/, "")
        .replace(/-----END PUBLIC KEY-----/, "")
        .replace(/\s/g, "");
    const binaryDer = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer.buffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        false,
        ["encrypt"]
    );
};

export const encryptRSA = async (
    pemPublicKey: string,
    plainText: string
): Promise<string> => {
    const publicKey = await importPublicKey(pemPublicKey);
    const encoded = new TextEncoder().encode(plainText);
    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        encoded
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted))); // base64
};
