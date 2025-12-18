import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/AuthService';
import { useMessage } from '@/hooks/useMessage';
import { useNavigate } from 'react-router-dom';

export const useProfile = () => {
    const { user, updateUser, logout } = useAuth();
    const { setAppMessage } = useMessage();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);


    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setSurname(user.surname || '');
            setPhone(user.phone || '');
            setAddress(user.address || '');
            setBirthDate(user.birthDate ? String(user.birthDate).split('T')[0] : '');
        }
    }, [user]);

    const resetForm = () => {
        if (user) {
            setName(user.name || '');
            setSurname(user.surname || '');
            setPhone(user.phone || '');
            setAddress(user.address || '');
            setBirthDate(user.birthDate ? String(user.birthDate).split('T')[0] : '');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updateData: any = { name };
            if (user?.role === 'company') {
                updateData.phone = phone;
                updateData.address = address;
            } else {
                updateData.surname = surname;
                updateData.birthDate = birthDate;
            }

            await AuthService.updateUser(updateData);
            updateUser(updateData);

            setAppMessage('Perfil actualizado correctamente', 'success');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setAppMessage('Error al actualizar el perfil', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await AuthService.deleteAccount();
            logout();
            setAppMessage('Tu cuenta ha sido eliminada.', 'success');
            navigate('/');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al eliminar la cuenta.';
            setAppMessage(msg, 'error');
            setIsDeleteModalOpen(false);
        }
    };

    return {
        user,
        loading,
        isEditing,
        setIsEditing,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
        formState: {
            name, setName,
            surname, setSurname,
            birthDate, setBirthDate,
            phone, setPhone,
            address, setAddress
        },
        handleSubmit,
        handleDeleteAccount,
        resetForm
    };
};
