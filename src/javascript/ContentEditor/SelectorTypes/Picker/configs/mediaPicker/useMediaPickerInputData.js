import {useQuery} from '@apollo/client';
import bytes from 'bytes';
import {MediaPickerFilledQuery} from './MediaPicker.gql-queries';
import {useContentEditorContext} from '~/ContentEditor/contexts';
import {getMimeType} from '~/JContent/ContentRoute/ContentLayout/ContentLayout.utils';
import {getIconFromMimeType} from '~/utils';

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
        const sizeInfo = (imageData.height && imageData.width) ? `${parseInt(imageData.width.value, 10)} x ${parseInt(imageData.height.value, 10)}` : '';
        const mimeType = getMimeType(imageData) || '';
        const thumbnail = imageData.thumbnailUrl ? imageData.thumbnailUrl + (imageData.thumbnailUrl.indexOf('?') > 0 ? '&' : '?') + 'lastModified=' + imageData.lastModified?.value : getIconFromMimeType(mimeType);
        const size = imageData.content.data.size && bytes(imageData.content.data.size, {unitSeparator: ' '});

        return {
            uuid: imageData.uuid,
            thumbnail,
            displayName: imageData.name,
            path: imageData.path,
            type: `${mimeType}`,
            info: sizeInfo ? `${sizeInfo} - ${size}` : size
        };
    });

    return {fieldData, error, loading};
};
