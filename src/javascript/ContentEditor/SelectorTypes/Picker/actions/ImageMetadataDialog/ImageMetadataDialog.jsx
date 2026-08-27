import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogContent, DialogTitle} from '@material-ui/core';
import {Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {DetailRow} from '~/JContent/SidePanel/ContentDetails';
import {useNodeFileMetadata} from '~/JContent/SidePanel/ContentDetails/useFileMetadata';
import styles from './ImageMetadataDialog.scss';

/**
 * The EXIF and XMP/IPTC of the picked image, to be read and taken from. Copying a value closes the
 * dialog in the same gesture: the editor asked for that value in order to paste it into the field
 * behind, so keeping the dialog in the way would only cost them a second click.
 */
export const ImageMetadataDialog = ({uuid, lang, displayName, onExit}) => {
    const {t} = useTranslation('jcontent');
    const [open, setOpen] = useState(true);
    const groups = useNodeFileMetadata({uuid, lang});

    return (
        <Dialog
            fullWidth
            open={open}
            maxWidth="sm"
            data-sel-role="image-metadata-dialog"
            onExited={onExit}
            onClose={() => setOpen(false)}
        >
            <DialogTitle>
                {t('jcontent:label.contentEditor.edit.fields.actions.imageMetadata.title', {name: displayName})}
            </DialogTitle>
            <DialogContent className={styles.content}>
                {groups.length === 0 ? (
                    <Typography variant="body" className={styles.empty} data-sel-role="image-metadata-empty">
                        {t('jcontent:label.contentEditor.edit.fields.actions.imageMetadata.none')}
                    </Typography>
                ) : groups.map(group => (
                    <div key={group.name} className={styles.group} data-sel-content={group.name}>
                        <Typography variant="subheading" className={styles.groupTitle}>
                            {group.displayName}
                        </Typography>
                        {group.entries.map(entry => (
                            <DetailRow
                                key={entry.label}
                                label={entry.label}
                                value={entry.value}
                                onCopied={() => setOpen(false)}
                            />
                        ))}
                    </div>
                ))}
            </DialogContent>
        </Dialog>
    );
};

ImageMetadataDialog.propTypes = {
    uuid: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    onExit: PropTypes.func.isRequired
};

export default ImageMetadataDialog;
