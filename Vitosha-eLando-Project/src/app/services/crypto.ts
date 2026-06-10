import { Service } from '@angular/core';

@Service()
export class Crypto {
    async deriveKEK(password: string, salt: BufferSource) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['wrapKey', 'unwrapKey']
    );
}

async generateDEK() {
    return window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

async wrapDEK(dek: CryptoKey, kek: CryptoKey) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const wrappedDek = await window.crypto.subtle.wrapKey(
        'raw',
        dek,
        kek,
        { name: 'AES-GCM', iv: iv }
    );
    return { wrappedDek, iv };
}

async unwrapDEK(wrappedDek: ArrayBuffer, kek: CryptoKey, iv: BufferSource) {
    return window.crypto.subtle.unwrapKey(
        'raw',
        wrappedDek,
        kek,
        { name: 'AES-GCM', iv: iv },
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

async encryptFile(file: ArrayBuffer, dek: CryptoKey) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        dek,
        file
    );
    return { encrypted, iv };
}

async decryptFile(encryptedData: ArrayBuffer, dek: CryptoKey, iv: BufferSource) {
    return window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        dek,
        encryptedData
    );
}
}
