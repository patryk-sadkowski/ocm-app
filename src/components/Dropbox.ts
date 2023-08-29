import axios from "axios";

export class DropboxCLI {

    private static BASE_URL = "https://content.dropboxapi.com/2/files/upload";
    private readonly accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    public async connectionTest() {
        try {
            const response = await axios.post("https://api.dropboxapi.com/2/files/list_folder", {
                path: "/Aplikacje/IR-Backup",
            }, {
                headers: this.getTestHeaders()
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to connect to Dropbox. Error: ${error}`);
        }
    }

    private getTestHeaders() {
        return {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        };
    }

    private getHeaders(path: string) {
        return {
            'Authorization': `Bearer ${this.accessToken}`,
            'Dropbox-API-Arg': JSON.stringify({
                path: `/Aplikacje/IR-Backup/${path}`,
                mode: 'add',
                autorename: true,
                mute: false
            }),
            'Content-Type': 'application/octet-stream',
        };
    }

    async uploadFile(file: File, path: string) {
        try {
            const response = await axios.post(DropboxCLI.BASE_URL, file, {
                headers: this.getHeaders(path),
                onUploadProgress: (progressEvent: any) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        console.log(`Upload progress: ${percentCompleted}%`);
                    }
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to upload the file. Error: ${error}`);
        }
    }

    async logChange(metadata: { user: string, location: string, timestamp: Date }, changeFile: File) {
        const logPath = '/logs/logbook.txt';
        const changePath = `/backups/${metadata.user}-${metadata.timestamp.toISOString()}.backup`;

        // Create log entry
        const logEntry = `${metadata.timestamp.toISOString()}: User: ${metadata.user}, Location: ${metadata.location}\n`;
        const logBlob = new Blob([logEntry], {type: 'text/plain'});

        try {
            // Append log entry to logbook
            await this.uploadFile(logBlob as any, logPath);
            console.log("Log entry saved to Dropbox.");

            // Upload backup file
            await this.uploadFile(changeFile, changePath);
            console.log("Backup saved to Dropbox.");
        } catch (error) {
            console.error("Failed to save log entry or backup to Dropbox.", error);
        }
    }
}
