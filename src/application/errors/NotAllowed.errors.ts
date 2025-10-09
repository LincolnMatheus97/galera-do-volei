export class NotAllowed extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PermissionError';
    }
}