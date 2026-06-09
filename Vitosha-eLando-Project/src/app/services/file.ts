import { Service, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from './auth';

@Service()
export class File {

    private http = inject(HttpClient);
    private auth = inject(Auth);

    public getFiles() {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.auth.getToken() });
        return this.http.get('http://localhost:8080/api/files', { headers });
    }

    public upload(file: Blob) {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.auth.getToken() });
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post('http://localhost:8080/api/files/upload', formData, { headers });
    }

    public delete(fileId: number) {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.auth.getToken() });
        return this.http.delete('http://localhost:8080/api/files/' + fileId, { headers });
    }
}