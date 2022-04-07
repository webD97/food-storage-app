import type { useToast } from '@chakra-ui/react';

type Toaster = ReturnType<typeof useToast>;

const ToastService = {
    takeItemSuccess(toast: Toaster) {
        toast({
            title: 'Entnahme erfolgreich',
            description: 'Deine Entnahme wurde gespeichert.',
            status: 'success'
        });
    },

    takeItemFailed(toast: Toaster) {
        toast({
            title: 'Entnahme fehlgeschlagen',
            description: 'Deine Entnahme konnte nicht gespeichert werden.',
            status: 'error'
        });
    }
};

export default ToastService;
