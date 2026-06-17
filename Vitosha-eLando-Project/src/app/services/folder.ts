import { Service, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from './auth';

@Service()
export class Folder {

    private auth = inject(Auth);
    private http = inject(HttpClient);

    private getHeaders() {
        return new HttpHeaders({ 'Authorization': 'Bearer ' + this.auth.getToken() });
    }

    public getFolders(parentId: number | null) {
        const url = parentId !== null
            ? `/api/folders?parentId=${parentId}`
            : `/api/folders`;
        return this.http.get(url, { headers: this.getHeaders() });
    }

    public createFolder(name: string, parentId: number | null) {
        return this.http.post('/api/folders', { name, parentId }, { headers: this.getHeaders() });
    }

    public renameFolder(folderId: number, name: string) {
        return this.http.put(`/api/folders/${folderId}`, { name }, { headers: this.getHeaders() });
    }

    public deleteFolder(folderId: number) {
        return this.http.delete(`/api/folders/${folderId}`, { headers: this.getHeaders() });
    }

    public moveFile(fileId: number, folderId: number | null) {
        return this.http.put(`/api/files/${fileId}/move`, { folderId }, { headers: this.getHeaders() });
    }

}

