import { useState, useEffect } from 'react';
import { useMessage } from '@/hooks/useMessage';

export const useImageUpload = (initialImage?: string | null) => {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(initialImage || null);
    const [isDragging, setIsDragging] = useState(false);
    const { setAppMessage } = useMessage();

    useEffect(() => {
        if (initialImage) {
            setPreview(initialImage);
        }
    }, [initialImage]);

    const handleImageChange = (file: File | null) => {
        setImage(file);
        if (preview && !preview.startsWith('http') && !preview.startsWith('/')) {
            URL.revokeObjectURL(preview);
        }
        if (file) {
            const newPreviewUrl = URL.createObjectURL(file);
            setPreview(newPreviewUrl);
        } else {
            setPreview(initialImage || null);
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isEntering);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        handleDragEvents(e, false);
        const file = e.dataTransfer.files?.[0] || null;
        if (file && file.type.startsWith('image/')) {
            handleImageChange(file);
        } else {
            setAppMessage('Por favor, suelta un archivo de imagen válido.', 'error');
        }
    };

    return {
        image,
        setImage,
        preview,
        setPreview,
        isDragging,
        handleImageChange,
        handleDragEvents,
        handleDrop
    };
};
