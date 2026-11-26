import React from 'react';
import {Loader} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';

export const TransparentLoaderOverlay = () => {
    const {t} = useTranslation('jcontent');
    return (
        <div style={{position: 'absolute', width: '100%', height: '100%', zIndex: 9999, backgroundColor: 'var(--color-light40)'}}
             className="flexCol_center alignCenter"
        >
            <Loader size="big" i18n={{loadingLabel: t('jcontent:label.loading')}}/>
        </div>
    );
};
