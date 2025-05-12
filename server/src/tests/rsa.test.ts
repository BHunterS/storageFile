import { expect } from "chai";
import {
    generateCryptoKeys,
    encrypt,
    decrypt,
    RsaKeyPair,
} from "../services/rsa.service";

describe("RsaService", () => {
    let keys: RsaKeyPair;

    before(() => {
        keys = generateCryptoKeys();
    });

    it("should encrypt and decrypt data correctly", () => {
        const plainText = "Hello, World!";
        const encryptedText = encrypt(keys.publicKey, plainText);
        const decryptedText = decrypt(keys.privateKey, encryptedText);
        expect(decryptedText).to.equal(plainText);
    });
});
