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
    },

    updateArticleSuccess(toast: Toaster) {
        toast({
            title: 'Artikel gespeichert',
            description: 'Deine Änderungen an diesem Artikel wurden gespeichert',
            status: 'success'
        });
    },

    updateArticleFailed(toast: Toaster) {
        toast({
            title: 'Fehler beim Speichern',
            description: 'Deine Änderungen an diesem Artikel konnten leider nicht gespeichert werden',
            status: 'error'
        });
    },
};

export default ToastService;
