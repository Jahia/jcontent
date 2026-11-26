import React from 'react';
import {Loader} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';

export const LoaderOverlay = () => {
    const {t} = useTranslation('jcontent');
    return (
        <div className="flexFluid flexCol_center alignCenter" style={{backgroundColor: 'var(--color-light)'}}>
            <Loader size="big" i18n={{loadingLabel: t('jcontent:label.loading')}}/>
        </div>
    );
};
