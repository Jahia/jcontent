import {useSubscription, useQuery} from '@apollo/client';
import {SubscribeToPublicationData} from './PublicationNotification.gql-subscription';
import {GetUserQuery} from './PublicationNotification.gql-query';
import {enqueueSnackbar} from 'notistack';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useSelector} from 'react-redux';
import {useSiteInfo} from '@jahia/data-helper';
import {useState} from 'react';

export const usePublicationNotification = () => {
    const {t} = useTranslation('jcontent');
    const {siteKey, language} = useSelector(state => ({
        siteKey: state.site,
        language: state.language
    }), shallowEqual);
    const [notificationData, setNotificationData] = useState(undefined);
    const {siteInfo, loading: siteInfoLoading, error: siteInfoError} = useSiteInfo({siteKey, displayLanguage: language});
    const {data: getUserData, loading: getUserLoading, error: getUserError} = useQuery(GetUserQuery);
    const {loading, error} = useSubscription(SubscribeToPublicationData, {
        variables: {
            userKeys: [getUserData?.currentUser?.node?.path]
        },
        fetchPolicy: 'network-only',
        skip: !getUserData || getUserLoading || getUserError || siteInfoLoading || siteInfoError,
        onData: ({data}) => {
            setNotificationData(data.data);
        }
    });

    const e = siteInfoError || getUserError || error;

    if (e) {
        console.log(e);
    }

    const optionsNotiStack = {autoHideDuration: 5000, preventDuplicate: true, onClose: () => {
        setNotificationData(undefined);
    }};
    if (!e && !loading && notificationData !== undefined && window.location.pathname.indexOf('/jahia/workflow') === -1) {
        const language = notificationData.backgroundJobSubscription.publicationJob.language;
        const state = notificationData.backgroundJobSubscription.publicationJob.jobState;

        let notifSuffix = '';

        if (siteInfo.languages.length <= 1 || language === null) {
            notifSuffix = 'NoLang';
        }

        if (state === 'STARTED') {
            enqueueSnackbar(t(`jcontent:label.contentManager.publicationStatus.notification.publishing${notifSuffix}`, {language: language}), optionsNotiStack);
        } else if (state === 'FINISHED') {
            enqueueSnackbar(t(`jcontent:label.contentManager.publicationStatus.notification.published${notifSuffix}`, {language: language}), optionsNotiStack);
        }
    }
};
