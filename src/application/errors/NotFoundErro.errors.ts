export class NotFoundErro extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}