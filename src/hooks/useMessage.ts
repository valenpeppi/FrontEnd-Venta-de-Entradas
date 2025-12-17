import { useContext } from 'react';
import { MessageContext } from '@/shared/context/MessageContext';

export const useMessage = () => {
    const context = useContext(MessageContext);
    if (context === undefined) {
        throw new Error('useMessage debe ser usado dentro de un MessageProvider');
    }
    return context;
};
