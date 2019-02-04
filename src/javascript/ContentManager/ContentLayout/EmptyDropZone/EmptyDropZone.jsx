import UploadTransformComponent from '../UploadTransformComponent';
import {Grid, Typography, TableRow, TableBody, withStyles} from '@material-ui/core';
import {CloudUpload} from '@material-ui/icons';
import React from 'react';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';

const styles = theme => ({
    gridEmpty: {
        overflowY: 'scroll',
        overflowX: 'scroll',
        height: 'calc(100vh - ' + (theme.layout.topBarHeight + theme.contentManager.toolbarHeight) + 'px)',
        maxHeight: 'calc(100vh - ' + (theme.layout.topBarHeight + theme.contentManager.toolbarHeight) + 'px)',
        margin: '0!important',
        backgroundColor: theme.palette.background.default
    },
    dragZoneRoot: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: theme.spacing.unit * 4
    },
    dropZone: {
        border: '2px dashed ' + theme.palette.border.main,
        color: theme.palette.text.disabled,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'inherit',
        height: 'inherit',
        boxSizing: 'border-box',
        transitionDuration: '.1s'
    },
    dragZoneContentList: {
        position: 'absolute',
        height: '57vh',
        width: '100%',
        padding: theme.spacing.unit * 4
    }
});

export class EmptyDropZone extends React.Component {
    render() {
        let {classes, contentList, path, t} = this.props;
        return (
            <React.Fragment>
                {(!contentList ?
                    <UploadTransformComponent uploadTargetComponent={Grid} uploadPath={path}>
                        <Grid container className={classes.gridEmpty} data-cm-role="grid-content-list">
                            <div className={classes.dragZoneRoot}>
                                <div className={classes.dropZone}>
                                    <Typography variant="h6"
                                                color="inherit"
                                    >{t('label.contentManager.fileUpload.dropMessage')}
                                    </Typography>
                                    <CloudUpload/>
                                </div>
                            </div>
                        </Grid>
                    </UploadTransformComponent> :
                    <TableBody>
                        <UploadTransformComponent uploadTargetComponent={TableRow}
                                                  uploadPath={path}
                                                  className={classes.dragZoneContentList}
                        >
                            <td className={classes.dropZone}>
                                <Typography variant="h6" color="inherit">{t('label.contentManager.fileUpload.dropMessage')}</Typography>
                                <CloudUpload/>
                            </td>
                        </UploadTransformComponent>
                    </TableBody>

                )}

            </React.Fragment>
        );
    }
}

export default compose(
    translate(),
    withStyles(styles, {withTheme: true}),
)(EmptyDropZone);
