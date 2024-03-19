import {useSubscription, useQuery, useApolloClient} from '@apollo/client';
import {SubscribeToPublicationData} from './PublicationNotification.gql-subscription';
import {GetUserQuery} from './PublicationNotification.gql-query';
import {enqueueSnackbar} from 'notistack';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useSelector} from 'react-redux';
import {useSiteInfo} from '@jahia/data-helper';
import {useState} from 'react';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';

export const usePublicationNotification = () => {
    const {t} = useTranslation('jcontent');
    const {siteKey, language} = useSelector(state => ({
        siteKey: state.site,
        language: state.language
    }), shallowEqual);
    const [notificationData, setNotificationData] = useState(undefined);
    const client = useApolloClient();
    const {siteInfo, loading: siteInfoLoading, error: siteInfoError} = useSiteInfo({siteKey, displayLanguage: language});
    const {data: getUserData, loading: getUserLoading, error: getUserError} = useQuery(GetUserQuery);
    const {loading, error} = useSubscription(SubscribeToPublicationData, {
        variables: {
            userKeys: [/[^/]*$/.exec(getUserData?.currentUser?.node?.path)[0]]
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
        const language = notificationData.subscribeToPublicationJob.language;
        const state = notificationData.subscribeToPublicationJob.state;

        let notifSuffix = '';

        if (siteInfo.languages.length <= 1 || language === null) {
            notifSuffix = 'NoLang';
        }

        if (state === 'STARTED') {
            enqueueSnackbar(t(`jcontent:label.contentManager.publicationStatus.notification.publishing${notifSuffix}`, {language: language}), optionsNotiStack);
        } else if (state === 'FINISHED') {
            enqueueSnackbar(t(`jcontent:label.contentManager.publicationStatus.notification.published${notifSuffix}`, {language: language}), optionsNotiStack);
            notificationData.subscribeToPublicationJob.paths.forEach(path => {
                client.cache.flushNodeEntryByPath(path);
            });
            client.reFetchObservableQueries();
            triggerRefetchAll();
        } else if (state === 'UNPUBLISHED') {
            enqueueSnackbar(t(`jcontent:label.contentManager.publicationStatus.notification.unpublished${notifSuffix}`, {language: language}), optionsNotiStack);
            client.reFetchObservableQueries();
            triggerRefetchAll();
        }
    }
};
