export interface Message {
    idMessage: number;
    title: string;
    state: 'unread' | 'answered' | 'rejected';
    date: string;
    description: string;
    senderEmail: string;
    response?: string;
}
