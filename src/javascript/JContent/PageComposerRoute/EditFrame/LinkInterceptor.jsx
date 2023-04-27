import React, {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {Button, Typography} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import styles from './LinkInterceptor.scss';

const absoluteRegex = /^(?:[a-zA-Z+]+:)?\/\//;
const jahiaRegex = /\/cms\/editframe\/default\/([a-zA-Z0-9_-]+)\/(sites\/([^/]+))?\/(.*)/;

function intercept(doc, site, setModal) {
    doc.addEventListener('click', e => {
        const target = e.target.tagName === 'A' ? e.target : e.target.closest('a');
        if (target) {
            const url = target.getAttribute('href');
            if (url.match(absoluteRegex)) {
                setModal({isOpen: true, isExternal: true, url});
                e.preventDefault();
            } else {
                const jahiaMatch = url.match(jahiaRegex);
                if (jahiaMatch) {
                    const newSite = jahiaMatch[3];
                    if (newSite && newSite !== site) {
                        setModal({isOpen: true, isJahiaPage: true, url, site: newSite, path: '/' + jahiaMatch[4]});
                        e.preventDefault();
                    }
                }
            }
        }
    });
}

export const LinkInterceptor = ({document}) => {
    const site = useSelector(state => state.site);
    const {t} = useTranslation('jcontent');
    const [modal, setModal] = useState({isOpen: false});

    useEffect(() => {
        if (document) {
            intercept(document, site, setModal);
        }
    }, [document, site, setModal]);

    const handleClose = useCallback(() => {
        setModal({...modal, isOpen: false});
    }, [setModal]);

    const openLink = () => {
        if (modal.isExternal) {
            window.open(modal.url, '_blank');
        } else if (modal.isJahiaPage) {
            window.open(modal.url.replace('/cms/editframe/', '/cms/render/'), '_blank');
        }

        handleClose();
    };

    return (
        <Dialog open={modal.isOpen}
                onClose={handleClose}
        >
            <DialogTitle>{modal.isExternal ? t('label.contentManager.links.external.title') : t('label.contentManager.links.internal.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Typography>
                        {modal.isExternal ? t('label.contentManager.links.external.content') : t('label.contentManager.links.internal.content', {site: modal.site})}
                    </Typography>
                    <Typography className={styles.url}>
                        {modal.url}
                    </Typography>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="default"
                        color="default"
                        size="big"
                        label={t('label.cancel')}
                        data-sel-role="cancel"
                        onClick={handleClose}/>
                <Button variant="default"
                        color="accent"
                        size="big"
                        label={t('label.contentManager.links.open')}
                        data-sel-role="open"
                        onClick={openLink}/>
            </DialogActions>
        </Dialog>
    );
};

LinkInterceptor.propTypes = {
    document: PropTypes.object.isRequired
};

