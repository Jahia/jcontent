import React from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {Button, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import rison from 'rison';
import {useDispatch, useSelector} from 'react-redux';
import {cmGoto} from '~/JContent/redux/JContent.redux';
import {CustomizedPreviewContextProvider, useCustomizedPreviewContext} from '../customizedPreview.context';
import {DateSelector} from './dateSelector';
import {ChannelSelector} from './channelSelector';

/**
 * @return an onclick() function handler to handle window redirection to the customized preview with the given params
 */
const useDialogHandler = () => {
    const dispatch = useDispatch();
    const params = useSelector(state => state.jcontent.params || {});
    const loadCustomizedPreview = ({user, date, channel, variant}) => {
        const openDialog = {
            key: 'customizedPreview',
            params: {}
        };

        // do not include param if not defined
        const setParam = (key, val) => val && (openDialog.params[key] = val);
        setParam('user', user);
        setParam('date', date?.valueOf());
        setParam('channel', channel);
        setParam('variant', variant);


        // Check if customized preview is already open
        const isDialogOpen = params.openDialog?.key === 'customizedPreview';
        if (isDialogOpen) {
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
    const {user, date, channelContext: {channel, variant}, clearAll} = useCustomizedPreviewContext();
    const {loadCustomizedPreview} = useDialogHandler();

    return (
        <Dialog
            fullWidth
            open={isOpen}
            data-sel-role="customized-preview-dialog"
            onExited={onExited}
            onClose={onClose}
        >
            <DialogTitle>
                {t('jcontent:label.contentManager.actions.customizedPreview.label')}
            </DialogTitle>
            <DialogContent>
                {/*<div>*/}
                {/*    For debug display purposes only<br/>*/}
                {/*    User: {user || 'defaults to root (TODO)'}<br/>*/}
                {/*    Date: {date?.format()|| 'no date selected'}<br/>*/}
                {/*    Channel: {channel || 'no channel selected'}<br/>*/}
                {/*    Variant: {variant || 'no variant selected'}<br/>*/}
                {/*</div>*/}
                <ChannelSelector/>
                <DateSelector/>
            </DialogContent>
            <DialogActions>
                <Button
                    size="big"
                    data-sel-role="clear-all"
                    label={t('jcontent:label.contentManager.actions.customizedPreview.clearAll')}
                    onClick={clearAll}
                />
                <Button
                    size="big"
                    data-sel-role="show-preview-confirm"
                    label={t('jcontent:label.contentManager.actions.customizedPreview.showPreview')}
                    onClick={() => {
                        loadCustomizedPreview({user, date, channel, variant});
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
