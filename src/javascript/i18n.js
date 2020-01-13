import {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';

export const useI18nCMMNamespace = () => {
    const {i18n} = useTranslation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        i18n.loadNamespaces('content-media-manager')
            .then(() => setLoading(false));
    }, [i18n]);

    return {loading};
};
