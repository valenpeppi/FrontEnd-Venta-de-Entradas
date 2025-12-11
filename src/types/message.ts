export interface Message {
    idMessage: number;
    title: string;
    description: string;
    senderEmail: string;
    date: string | Date;
    state: 'unread' | 'answered' | 'rejected' | 'discarded';
    response?: string;
}
