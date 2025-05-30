import React from 'react';
import {usePublicationInfoContext} from '~/ContentEditor/contexts';
import {useTranslation} from 'react-i18next';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {getTooltip} from './PublicationInfoBadge.tooltip';
import {useSelector} from 'react-redux';
import Status from '../../../../JContent/ContentRoute/ContentStatuses/Status';
import {setPublicationStatus} from '~/utils/contentStatus';

export const PublicationInfoBadge = () => {
    const {t} = useTranslation('jcontent');
    const publicationInfoContext = usePublicationInfoContext();
    const {publicationStatus, existsInLive, publicationInfoPolling} = publicationInfoContext;
    const uilang = useSelector(state => state.uilang);

    const statuses = {
        modified: false,
        published: false,
        warning: false
    };
    setPublicationStatus(statuses, publicationStatus, existsInLive);

    const supportedUiLang = Constants.supportedLocales.includes(uilang) ? uilang : Constants.defaultLocale;
    const renderStatus = type => (
        <Status type={type} tooltip={getTooltip(type, publicationInfoContext, supportedUiLang, t)}/>
    );
    return (
        <>
            {!publicationInfoPolling &&
            <>
                {statuses.modified && renderStatus('modified')}
                {!statuses.warning && renderStatus(statuses.published ? 'published' : 'notPublished')}
                {statuses.warning && renderStatus('warning')}
            </>}
        </>
    );
};
