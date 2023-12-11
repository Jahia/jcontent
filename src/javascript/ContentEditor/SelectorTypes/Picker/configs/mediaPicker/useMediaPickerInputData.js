import {useQuery} from '@apollo/client';
import {MediaPickerFilledQuery} from './MediaPicker.gql-queries';
import {encodeJCRPath} from '~/ContentEditor/utils';
import {useContentEditorContext} from '~/ContentEditor/contexts';

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
        const sizeInfo = (imageData.height && imageData.width) ? ` - ${parseInt(imageData.height.value, 10)}x${parseInt(imageData.width.value, 10)}px` : '';
        return {
            uuid: imageData.uuid,
            url: imageData.thumbnailUrl,
            name: imageData.displayName,
            path: imageData.path,
            info: `${imageData.content && imageData.content?.mimeType?.value}${sizeInfo}`
        };
    });

    return {fieldData, error, loading};
};
