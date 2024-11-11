import React from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {Button} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useQuery} from '@apollo/client';
import rison from 'rison';
import {OpenInActionQuery} from '~/JContent/actions/openInAction/openInAction.gql-queries';
import {useDispatch, useSelector} from 'react-redux';
import {cmGoto} from '~/JContent/redux/JContent.redux';


const useDialogHandler = ({path}) => {
    const dispatch = useDispatch();
    const [language, params] = useSelector(state => [
        state.language,
        state.jcontent.params || {},
    ]);

    const loadCustomizedPreview = () => {
        // check if customized preview is already open
        const isDialogOpen = params.openDialog?.key === 'customizedPreview';
        const openDialog = {
            key: 'customizedPreview',
            params: {
                user: 'root',
                date: '2021-09-01',
                channel : 'default'
            }
        };
        if (isDialogOpen) {
            openDialog.params.channel = 'newChannel';
            dispatch(cmGoto({params: {openDialog}}));
        } else {
            const urlWithoutAnchors = window.location.href.split(/[?#]/)[0];
            const encodedParams = rison.encode_uri({openDialog});
            window.open(`${urlWithoutAnchors}?params=${encodedParams}`, '_blank');
        }
    };

    return {loadCustomizedPreview};
}

export const CustomizedPreviewDialog = ({path, isOpen, onClose, onExited, ...others}) => {
    const {t} = useTranslation('jcontent');
    const {loadCustomizedPreview} = useDialogHandler({path, ...others});

    return (
        <Dialog
            fullWidth
            open={isOpen}
            data-cm-role="customized-preview-options-dialog"
            onExited={onExited}
            onClose={onClose}
        >
            <DialogTitle>
                {t('jcontent:label.contentManager.actions.customizedPreview.label')}
            </DialogTitle>
            <DialogContent>
                "Well hello there"
            </DialogContent>
            <DialogActions>
                <Button
                    size="big"
                    data-sel-role="close"
                    label={t('jcontent:label.contentManager.actions.customizedPreview.showPreview')}
                    onClick={() => {
                        loadCustomizedPreview();
                        onClose();
                    }}
                />
            </DialogActions>
        </Dialog>
    );
};

CustomizedPreviewDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    onExited: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    path: PropTypes.string.isRequired
};
