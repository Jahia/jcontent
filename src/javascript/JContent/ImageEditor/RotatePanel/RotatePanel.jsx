import React from 'react';
import PropTypes from 'prop-types';
import {Tooltip, withStyles} from '@material-ui/core';
import {ArrowLeft, ArrowRight, Button, Typography} from '@jahia/moonstone';
import {compose} from '~/utils';
import {withTranslation} from 'react-i18next';

let styles = theme => ({
    icons: {
        paddingTop: theme.spacing.unit * 2
    }
});

export const RotatePanel = ({classes, t, onRotate}) => {
    return (
        <>
            <Typography variant="subheading">
                {t('jcontent:label.contentManager.editImage.rotateInfo')}
            </Typography>
            <div className={classes.icons}>
                <Tooltip title={t('jcontent:label.contentManager.editImage.rotateLeft')}>
                    <Button data-cm-role="rotate-left"
                            size="big"
                            variant="ghost"
                            icon={<ArrowLeft/>}
                            onClick={() => onRotate(-1)}/>
                </Tooltip>
                <Tooltip title={t('jcontent:label.contentManager.editImage.rotateRight')}>
                    <Button data-cm-role="rotate-right"
                            size="big"
                            variant="ghost"
                            icon={<ArrowRight/>}
                            onClick={() => onRotate(1)}/>
                </Tooltip>
            </div>
        </>
    );
};

RotatePanel.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    onRotate: PropTypes.func.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles)
)(RotatePanel);
