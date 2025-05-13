import crypto from "crypto";

export interface RsaKeyPair {
    publicKey: string;
    privateKey: string;
}

export const generateCryptoKeys = (): RsaKeyPair => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    return { publicKey, privateKey };
};

export const encryptRSA = (publicKey: string, plainText: string): string => {
    const buffer = Buffer.from(plainText, "utf8");
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString("base64");
};

export const decryptRSA = (privateKey: string, cipherText: string): string => {
    const buffer = Buffer.from(cipherText, "base64");
    const decrypted = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        buffer
    );
    return decrypted.toString("utf8");
};
