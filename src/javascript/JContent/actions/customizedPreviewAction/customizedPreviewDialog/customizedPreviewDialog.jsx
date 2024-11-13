import React from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {Button} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import rison from 'rison';
import {useDispatch, useSelector} from 'react-redux';
import {cmGoto} from '~/JContent/redux/JContent.redux';
import {CustomizedPreviewContextProvider, useCustomizedPreviewContext} from './customizedPreview.context';

/**
 * @return an onclick() function handler to handle window redirection to the customized preview with the given params
 */
const useDialogHandler = ({user, date, channel, variant = ''}) => {
    const dispatch = useDispatch();
    const params = useSelector(state => state.jcontent.params || {});
    const loadCustomizedPreview = () => {
        const openDialog = {
            key: 'customizedPreview',
            params: {user, date: date.valueOf(), channel, variant}
        };

        // Check if customized preview is already open
        const isDialogOpen = params.openDialog?.key === 'customizedPreview';
        if (isDialogOpen) {
            openDialog.params.channel = 'generic'; // TODO FIXME only for testing
            openDialog.params.variant = ''; // TODO FIXME only for testing
            dispatch(cmGoto({params: {openDialog}}));
        } else {
            const urlWithoutAnchors = window.location.href.split(/[?#]/)[0];
            const encodedParams = rison.encode_uri({openDialog});
            window.open(`${urlWithoutAnchors}?params=${encodedParams}`, '_blank');
        }
    };

    return {loadCustomizedPreview};
};

const CustomizedPreviewDialogContainer = props => (
    <CustomizedPreviewContextProvider>
        <CustomizedPreviewDialog {...props}/>
    </CustomizedPreviewContextProvider>
);

const CustomizedPreviewDialog = ({path, isOpen, onClose, onExited}) => {
    const {t} = useTranslation('jcontent');
    const {user, date, channel, variant} = useCustomizedPreviewContext();
    const {loadCustomizedPreview} = useDialogHandler({user, date, channel, variant});

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
                <div>
                    Date: {date.format()}<br/>
                    Channel: {channel}<br/>
                    Variant: {variant}<br/>
                    User: {user}<br/>
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    size="big"
                    data-sel-role="show-preview-confirm"
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

export {CustomizedPreviewDialogContainer as CustomizedPreviewDialog};

CustomizedPreviewDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    onExited: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    path: PropTypes.string.isRequired
};
