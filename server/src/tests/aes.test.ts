import { expect } from "chai";
import {
    generateSecretKey,
    encrypt,
    decrypt,
    AesKey,
} from "../services/aes.service";

describe("aes.service", () => {
    let aesKey: AesKey;

    before(() => {
        aesKey = generateSecretKey();
    });

    it("should generate a valid AES key and IV", () => {
        expect(aesKey).to.have.property("key");
        expect(aesKey).to.have.property("iv");
        expect(aesKey.key).to.be.a("string");
        expect(aesKey.iv).to.be.a("string");
    });

    it("should encrypt and decrypt text correctly", () => {
        const plainText = "Hello, AES!";
        const encryptedText = encrypt(aesKey, plainText);
        const decryptedText = decrypt(aesKey, encryptedText);

        expect(encryptedText).to.be.a("string");
        expect(encryptedText).to.not.equal(plainText);
        expect(decryptedText).to.equal(plainText);
    });
});
