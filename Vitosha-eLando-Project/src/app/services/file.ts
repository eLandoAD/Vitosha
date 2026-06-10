import { Service, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Crypto } from './crypto';
import { Auth } from './auth';

@Service()
export class File {

    private http = inject(HttpClient);
    private auth = inject(Auth);
    private crypto = inject(Crypto);

    public getFiles() {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.auth.getToken() });
        return this.http.get('http://localhost:8080/api/files', { headers });
    }

    async upload(file: Blob) {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.auth.getToken() });
        const dek = this.auth.getDek();
        const arrayBuffer = await file.arrayBuffer();
        const { encrypted, iv } = await this.crypto.encryptFile(arrayBuffer, dek!);
        const ivB64 = btoa(String.fromCharCode(...new Uint8Array(iv)));
        const encryptedBlob = new Blob([encrypted]);
        const formData = new FormData();
        formData.append('file', encryptedBlob);
        formData.append('iv', ivB64);
        return this.http.post('http://localhost:8080/api/files/upload', formData, { headers });
    }

    async download(fileId: number, fileName: string) {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.auth.getToken() });
        const dek = this.auth.getDek();
        const response = await fetch('http://localhost:8080/api/files/' + fileId, { headers: { 'Authorization': 'Bearer ' + this.auth.getToken() } });
        const encryptedBuffer = await response.arrayBuffer();
        const ivB64 = response.headers.get('X-File-IV')!;
        const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
        const decrypted = await this.crypto.decryptFile(encryptedBuffer, dek!, iv);
        const blob = new Blob([decrypted]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

    public delete(fileId: number) {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.auth.getToken() });
        return this.http.delete('http://localhost:8080/api/files/' + fileId, { headers });
    }
}