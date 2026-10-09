import React from 'react';
import {Chip, Warning} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useFormikContext} from 'formik';
import {useContentEditorContext} from '~/ContentEditor/contexts';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {getFilenameMimeTypeMismatch} from './filenameMimeType';
import styles from './Field.scss';

/**
 * Warns, beside the system name label of a file, that the name no longer matches what the file
 * actually is.
 *
 * Reads the name being edited rather than the stored one, so fixing the extension clears the warning
 * as it is typed instead of only after saving.
 *
 * Renders nothing for anything that is not a file, or whose name and mime type agree - which is the
 * normal case, since an upload derives the mime type from the name.
 */
export const FilenameMimeTypeBadge = ({field}) => {
    const {t} = useTranslation('jcontent');
    const {values} = useFormikContext();
    const {nodeData} = useContentEditorContext();

    if (!field.name.endsWith('_' + Constants.systemName.propertyName)) {
        return null;
    }

    // Only files carry a jcr:content with a mime type, so its absence also rules out other content.
    const storedMimeType = nodeData?.content?.mimeType?.value;
    const fileName = values[field.name] === undefined ? nodeData?.name : values[field.name];
    const mismatch = getFilenameMimeTypeMismatch(fileName, storedMimeType);
    if (!mismatch) {
        return null;
    }

    const label = mismatch.expectedExtension ?
        t('label.contentEditor.edit.filenameMimeType.badge', {extension: mismatch.expectedExtension}) :
        t('label.contentEditor.edit.filenameMimeType.badgeUnknownExtension');

    return (
        <span title={t('label.contentEditor.edit.filenameMimeType.tooltip', {mimeType: mismatch.storedMimeType})}>
            <Chip
                className={styles.badge}
                data-sel-role="filename-mimetype-mismatch"
                icon={<Warning/>}
                label={label}
                color="warning"
            />
        </span>
    );
};

FilenameMimeTypeBadge.propTypes = {
    field: FieldPropTypes.isRequired
};
