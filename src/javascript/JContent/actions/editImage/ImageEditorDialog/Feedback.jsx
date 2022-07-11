import React from 'react';
import {Snackbar} from '@material-ui/core';
import {Check, Typography} from '@jahia/moonstone';
import PropTypes from 'prop-types';

import styles from './Feedback.scss';
import {useTranslation} from 'react-i18next';

export const Feedback = ({isOpen, messageKey, onClose}) => {
    const {t} = useTranslation();
    return (
        <Snackbar open={isOpen}
                  className={styles.feedback}
                  autoHideDuration={2000}
                  anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center'
                  }}
                  message={
                      <div className={styles.feedbackContent}>
                          <Check className={styles.feedbackIcon}/>
                          <Typography>
                              {messageKey && t(messageKey.key ? messageKey.key : messageKey, messageKey.params)}
                          </Typography>
                      </div>
                  }
                  onClose={onClose}
        />
    );
};

Feedback.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    messageKey: PropTypes.string,
    onClose: PropTypes.func
};

export default Feedback;
