import crypto from "crypto";

export interface AesKey {
    key: string;
    iv: string;
}

export const generateSecretKey = (): AesKey => {
    const key = crypto.randomBytes(32).toString("base64");
    const iv = crypto.randomBytes(16).toString("base64");
    return { key, iv };
};

export const encryptAES = (aesKey: AesKey, plainText: string): string => {
    const key = Buffer.from(aesKey.key, "base64");
    const iv = Buffer.from(aesKey.iv, "base64");
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    let encrypted = cipher.update(plainText, "utf8", "base64");
    encrypted += cipher.final("base64");

    return encrypted;
};

export const decryptAES = (aesKey: AesKey, cipherText: string): string => {
    const key = Buffer.from(aesKey.key, "base64");
    const iv = Buffer.from(aesKey.iv, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    let decrypted = decipher.update(cipherText, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
};
