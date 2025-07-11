import styles from '../copyLanguage/CopyLanguageDialog.scss';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {Button, Dropdown, Typography, Warning} from '@jahia/moonstone';
import React from 'react';

export const TranslateDialog = () => {
  return (
      <Dialog fullWidth
              aria-labelledby="alert-dialog-slide-title"
              open={isOpen}
              maxWidth="sm"
              classes={{paper: styles.dialog_overflowYVisible}}
              onClose={onCloseDialog}
      >
          <DialogTitle id="dialog-language-title">
              Suuup
          </DialogTitle>
          <DialogContent className={styles.dialogContent} classes={{root: styles.dialogContent_overflowYVisible}}>
              My Content
          </DialogContent>
          <DialogActions>
              <Typography className={styles.warningText}>
                  <Warning
                      className={styles.warningIcon}/> {t('jcontent:label.contentEditor.edit.action.copyLanguage.bottomText')}
              </Typography>
              <Button
                  size="big"
                  color="default"
                  label={t('jcontent:label.contentEditor.edit.action.copyLanguage.btnCancel')}
                  onClick={handleCancel}
              />
              <Button
                  size="big"
                  color="accent"
                  label={t('jcontent:label.contentEditor.edit.action.copyLanguage.btnApply')}
                  disabled={isApplyDisabled}
                  onClick={handleApply}
              />
          </DialogActions>
      </Dialog>
  );
};
