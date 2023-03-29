import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Typography} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import styles from './Info.scss';

export const Info = ({isOpen, onClose}) => {
    const {t} = useTranslation('jcontent');
    return (
        <Dialog open={isOpen}
                onClose={onClose}
        >
            <DialogTitle>
                <Typography variant="heading">
                    {t('jcontent:label.contentManager.deleteAction.info.title')}
                </Typography>
            </DialogTitle>
            <DialogContent className={styles.content}>
                <Typography>
                    {t('jcontent:label.contentManager.deleteAction.info.text1')}
                    <ol>
                        <li>
                            {t('jcontent:label.contentManager.deleteAction.info.text1-1')}
                            <ul>
                                <li>{t('jcontent:label.contentManager.deleteAction.info.text1-1-1')}</li>
                            </ul>
                        </li>
                        <li>
                            {t('jcontent:label.contentManager.deleteAction.info.text1-2')}
                            <ul>
                                <li>{t('jcontent:label.contentManager.deleteAction.info.text1-2-1')}</li>
                                <li>{t('jcontent:label.contentManager.deleteAction.info.text1-2-2')}</li>
                                <li>{t('jcontent:label.contentManager.deleteAction.info.text1-2-3')}</li>
                            </ul>
                        </li>
                    </ol>
                </Typography>
                <Typography>
                    {t('jcontent:label.contentManager.deleteAction.info.text2')}
                </Typography>
                <Typography>
                    {t('jcontent:label.contentManager.deleteAction.info.text3')}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button size="big"
                        label={t('jcontent:label.contentManager.editImage.close')}
                        onClick={onClose}/>
            </DialogActions>
        </Dialog>
    );
};

Info.propTypes = {
    isOpen: PropTypes.bool.isRequired,

    onClose: PropTypes.func.isRequired
};
