import axios, { AxiosHeaders } from "axios";

import {
    generateSecretKey,
    encryptAES,
    encryptRSA,
    AesKey,
} from "@/utils/cipher";

import { SERVER_URL } from "@/constants";

const axiosInstance = axios.create({
    baseURL: `${SERVER_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const publicKey = localStorage.getItem("publicKey");

        if (
            config.headers["X-Skip-Interceptor"] !== "true" &&
            config.data &&
            publicKey &&
            ["post", "put", "patch"].includes(config.method || "")
        ) {
            const aesKey: AesKey = generateSecretKey();
            const encryptedData = encryptAES(
                aesKey,
                JSON.stringify(config.data)
            );
            const encryptedAesKey = await encryptRSA(
                publicKey,
                JSON.stringify(aesKey)
            );

            if (config.headers instanceof AxiosHeaders) {
                config.headers.set("X-Encrypted-Key", encryptedAesKey);
            } else {
                config.headers = new AxiosHeaders({
                    ...(config.headers as Record<string, string>),
                    "X-Encrypted-Key": encryptedAesKey,
                });
            }

            config.data = { encryptedData };
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response, request, message } = error;

        if (response) {
            const { status, data } = response;
            const errorMessage = data?.message || "Unknown error";

            switch (status) {
                case 401:
                    console.warn("401 Unauthorized:", errorMessage);
                    break;
                case 403:
                    console.warn("403 Forbidden:", errorMessage);
                    break;
                default:
                    console.error(`Error ${status}:`, errorMessage);
                    break;
            }

            return Promise.reject({ status, message: errorMessage });
        }

        if (request) {
            console.error("Server not answering...");
            return Promise.reject({
                status: 0,
                message: "No response from server.",
            });
        }

        console.error("Error request:", message);
        return Promise.reject({ status: 0, message: message });
    }
);

export default axiosInstance;

/* 
Клієнт (React):

Отримує відкритий ключ сервера (RSA). Done

Генерує AES-ключ та IV.

Шифрує дані через AES.

Шифрує AES-ключ через RSA (публічним ключем).

Надсилає на сервер:

зашифрований AES-ключ

IV

зашифровані дані

Сервер (Express):

Має свій приватний RSA-ключ.

Розшифровує AES-ключ.

Використовує його та IV для дешифрування даних.
*/
