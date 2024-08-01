import {useQuery} from '@apollo/client';
import {MediaPickerFilledQuery} from './MediaPicker.gql-queries';
import {useContentEditorContext} from '~/ContentEditor/contexts';
import {getMimeType} from '~/JContent/ContentRoute/ContentLayout/ContentLayout.utils';

export const useMediaPickerInputData = uuids => {
    const {lang} = useContentEditorContext();

    const {data, error, loading} = useQuery(MediaPickerFilledQuery, {
        variables: {
            uuids: uuids || [],
            language: lang
        },
        skip: !uuids,
        errorPolicy: 'ignore',
        fetchPolicy: 'network-only'
    });

    if (loading || error || !data || !data.jcr || !uuids || (data.jcr.result.length === 0 && uuids.length > 0)) {
        return {error, loading, notFound: Boolean(uuids)};
    }

    const fieldData = data.jcr.result.map(imageData => {
        const sizeInfo = (imageData.height && imageData.width) ? ` - ${parseInt(imageData.width.value, 10)}x${parseInt(imageData.height.value, 10)}px` : '';
        const url = imageData.thumbnailUrl + (imageData.thumbnailUrl.indexOf('?') > 0 ? '&' : '?') + 'lastModified=' + imageData.lastModified?.value;
        const mimeType = getMimeType(imageData) || '';

        return {
            uuid: imageData.uuid,
            url,
            name: imageData.displayName,
            path: imageData.path,
            info: `${mimeType}${sizeInfo}`
        };
    });

    return {fieldData, error, loading};
};
