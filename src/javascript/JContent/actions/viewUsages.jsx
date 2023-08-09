import React, {useContext} from 'react';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {Button} from '@jahia/moonstone';
import {UsagesTable} from '~/UsagesTable';
import {useSelector} from 'react-redux';

const UsagesDialog = ({isOpen, onExited, onClose, path, language, name}) => {
    const {t} = useTranslation('jcontent');

    return (
        <Dialog fullWidth
                maxWidth="xl"
                open={isOpen}
                aria-labelledby="form-dialog-title"
                data-cm-role="export-options"
                onExited={onExited}
                onClose={onClose}
        >
            <DialogTitle>
                {t('jcontent:label.contentManager.viewUsages.title', {name})}
            </DialogTitle>
            <DialogContent>
                <UsagesTable path={path} language={language}/>
            </DialogContent>
            <DialogActions>
                <Button size="big"
                        label={t('jcontent:label.contentEditor.close')}
                        onClick={onClose}/>
            </DialogActions>
        </Dialog>

    );
};

UsagesDialog.propTypes = {
    path: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    name: PropTypes.string,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onExited: PropTypes.func.isRequired
};

export const ViewUsagesComponent = ({path, render: Render, loading: Loading, usagesCount, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const res = useNodeChecks({path}, {getDisplayName: true, ...others});

    const {t} = useTranslation('jcontent');
    const language = useSelector(state => state.language);

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    if (!usagesCount) {
        // Resolve usage count if not set
    }

    const label = t('jcontent:label.contentManager.viewUsages.usage', {count: usagesCount});

    return (
        <Render
            {...others}
            buttonLabel={label}
            isVisible={res.checksResult}
            onClick={() => {
                componentRenderer.render('usagesDialog', UsagesDialog, {
                        isOpen: true,
                        path: res.node.path,
                        name: res.node.displayName,
                        language,
                        onClose: () => {
                            componentRenderer.setProperties('usagesDialog', {isOpen: false});
                        },
                        onExited: () => {
                            componentRenderer.destroy('usagesDialog');
                        }
                    }
                );
            }}
        />
    );
};

ViewUsagesComponent.propTypes = {
    path: PropTypes.string,
    usagesCount: PropTypes.number,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
