import React from 'react';
import PropTypes from 'prop-types';
import {compose} from '~/utils';
import {withTranslation} from 'react-i18next';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormHelperText} from '@material-ui/core';
import {Button, Checkbox, Dropdown, Typography} from '@jahia/moonstone';
import {FormControlLabel} from '@jahia/design-system-kit';
import styles from './Export.scss';

export class Export extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workspace: 'default',
            xml: false
        };
        this.onWorkspaceChange = this.onWorkspaceChange.bind(this);
        this.onXmlChange = this.onXmlChange.bind(this);
    }

    onWorkspaceChange(event, item) {
        let wsp = item.value;
        this.setState(Object.assign({workspace: wsp}, (wsp === 'live') ? {xml: false} : {}));
    }

    onXmlChange(event) {
        this.setState({
            xml: event.target.checked
        });
    }

    triggerExport(path) {
        let contextPath = window.contextJsParameters.contextPath;
        let format = (this.state.xml ? 'xml' : 'zip');
        let live = (this.state.workspace === 'live');
        window.open(`${contextPath}/cms/export/default${path}.${format}?exportformat=${format}&live=${live}`);
    }

    render() {
        let {t, onClose, onExited, path, isOpen} = this.props;
        let live = (this.state.workspace === 'live');
        return (
            <Dialog fullWidth open={isOpen} aria-labelledby="form-dialog-title" data-cm-role="export-options" onExited={onExited} onClose={onClose}>
                <DialogTitle>
                    {t('jcontent:label.contentManager.export.dialogTitle')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className={styles.margins}>
                        {t('jcontent:label.contentManager.export.selectWorkspace')}
                    </DialogContentText>
                    <Dropdown
                        data={[
                            {label: t('jcontent:label.contentManager.export.stagingOnlyOption'), value: 'default', attributes: {'data-cm-role': 'default-workspace'}},
                            {label: t('jcontent:label.contentManager.export.stagingAndLiveOption'), value: 'live', attributes: {'data-cm-role': 'live-workspace'}}
                        ]}
                        label={this.state.workspace === 'live' ? t('jcontent:label.contentManager.export.stagingAndLiveOption') : t('jcontent:label.contentManager.export.stagingOnlyOption')}
                        value={this.state.workspace}
                        variant="outlined"
                        size="medium"
                        data-cm-role="select-workspace"
                        onChange={this.onWorkspaceChange}
                    />
                    <FormHelperText>
                        {t('jcontent:label.contentManager.export.exportDetails')}
                    </FormHelperText>
                    <div className={styles.checkboxContainer}>
                        <FormControlLabel
                            classes={{root: styles.checkboxLabel}}
                            value="xml"
                            label={
                                <Typography className={styles.checkboxTypo}>
                                    {t('jcontent:label.contentManager.export.asXml')}
                                </Typography>
                            }
                            checked={this.state.xml}
                            disabled={live}
                            control={<Checkbox color="primary"/>}
                            data-cm-role="export-as-xml"
                            onChange={e => this.onXmlChange(e)}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button size="big" label={t('jcontent:label.contentManager.fileUpload.dialogRenameCancel')} onClick={onClose}/>
                    <Button
                        size="big"
                        color="accent"
                        data-cm-role="export-button"
                        label={t('jcontent:label.contentManager.export.actionLabel')}
                        onClick={() => {
                            this.triggerExport(path);
                            onClose();
                        }}
                    />
                </DialogActions>
            </Dialog>
        );
    }
}

Export.propTypes = {
    onClose: PropTypes.func.isRequired,
    onExited: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    path: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired
};

export default compose(
    withTranslation()
)(Export);
