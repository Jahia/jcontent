import {useSubscription, useQuery} from '@apollo/client';
import {SubscribeToPublicationData} from './PublicationNotification.gql-subscription';
import {GetUserQuery} from './PublicationNotification.gql-query';
import {enqueueSnackbar} from 'notistack';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useSelector} from 'react-redux';
import {useSiteInfo} from '@jahia/data-helper';

export const usePublicationNotification = () => {
    const {t} = useTranslation('jcontent');
    const {siteKey, language} = useSelector(state => ({
        siteKey: state.site,
        language: state.language
    }), shallowEqual);
    const {siteInfo, loading: siteInfoLoading, error: siteInfoError} = useSiteInfo({siteKey, displayLanguage: language});
    const {data: getUserData, loading: getUserLoading, error: getUserError} = useQuery(GetUserQuery);
    const {data, loading, error} = useSubscription(SubscribeToPublicationData, {
        variables: {
            userKeys: [getUserData?.currentUser?.node?.path]
        },
        fetchPolicy: 'network-only',
        skip: !getUserData || getUserLoading || getUserError || siteInfoLoading || siteInfoError
    });

    const e = siteInfoError || getUserError || error;

    if (e) {
        console.log(e);
    }

    if (!e && !loading && data?.backgroundJobSubscription?.publicationJob) {
        const language = data.backgroundJobSubscription.publicationJob.language;
        const state = data.backgroundJobSubscription.publicationJob.jobState;

        let notifSuffix = '';

        if (siteInfo.languages.length <= 1 || language === null) {
            notifSuffix = 'NoLang';
        }

        if (state === 'STARTED') {
            enqueueSnackbar(t(`jcontent:label.contentManager.publicationStatus.notification.publishing${notifSuffix}`, {language: language}), {autoHideDuration: 5000});
        } else if (state === 'FINISHED') {
            enqueueSnackbar(t(`jcontent:label.contentManager.publicationStatus.notification.published${notifSuffix}`, {language: language}), {autoHideDuration: 5000});
        }
    }
};
