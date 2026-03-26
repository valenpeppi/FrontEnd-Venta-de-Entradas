export interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    isAdmin: boolean;
    isLoggedIn: boolean;
    handleLogout: () => void;
}
