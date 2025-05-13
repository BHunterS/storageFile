import { expect } from "chai";
import {
    generateCryptoKeys,
    encryptRSA,
    decryptRSA,
    RsaKeyPair,
} from "../services/rsa.service";

describe("RsaService", () => {
    let keys: RsaKeyPair;

    before(() => {
        keys = generateCryptoKeys();
    });

    it("should encrypt and decrypt data correctly", () => {
        const plainText = "Hello, World!";
        const encryptedText = encryptRSA(keys.publicKey, plainText);
        const decryptedText = decryptRSA(keys.privateKey, encryptedText);
        expect(decryptedText).to.equal(plainText);
    });
});
