import React from 'react';
import {Snackbar, withStyles} from '@material-ui/core';
import {Typography, Check} from '@jahia/moonstone';
import {compose} from '~/utils';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';

let styles = theme => ({
    feedback: {
        padding: theme.spacing.unit * 2
    },
    feedbackContent: {
        display: 'flex'
    },
    feedbackIcon: {
        marginRight: theme.spacing.unit
    }
});

export const Feedback = ({isOpen, messageKey, classes, onClose, t}) => (
    <Snackbar open={isOpen}
              className={classes.feedback}
              autoHideDuration={2000}
              anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center'
              }}
              message={
                  <div className={classes.feedbackContent}>
                      <Check className={classes.feedbackIcon}/>
                      <Typography>
                          {messageKey && t(messageKey.key ? messageKey.key : messageKey, messageKey.params)}
                      </Typography>
                  </div>
              }
              onClose={onClose}
            />
);

Feedback.propTypes = {
    classes: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    messageKey: PropTypes.string,
    onClose: PropTypes.func
};

export default compose(
    withTranslation(),
    withStyles(styles)
)(Feedback);
