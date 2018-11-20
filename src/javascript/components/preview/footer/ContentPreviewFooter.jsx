import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import {buttonRenderer, iconButtonRenderer, DisplayActions} from '@jahia/react-material';

import ShareMenu from './ShareMenu';
import PublicationInfo from './PublicationStatus';
import {ellipsizeText} from "../../utils.js";

const ellipsisText = (text) => ellipsizeText(text, 50);

const ContentPreviewFooter = ({
  classes,
  previewMode,
  selection,
  t,
  handleFullScreen,
  screenModeButtons,
  downloadButton,
  imageControlElementId
}) => {
  let selectedItem = selection[0];

  switch (previewMode) {
      case 'live':
          return (
            <Grid container spacing={0} className={classes.footerGrid}>
              <Grid container spacing={0}>
                  <Grid container item xs={8} className={classes.titleBar}>
                      <div className={classes.contentTitle}>
                          {ellipsisText(selectedItem.displayName ? selectedItem.displayName : selectedItem.name)}
                      </div>
                  </Grid>
                  <Grid container item xs={4} justify={'flex-end'} className={classes.footerButton}>
                      {selectedItem.type === 'File' && downloadButton(selectedItem, 'live')}
                      <ShareMenu/>
                      {screenModeButtons(handleFullScreen, classes)}
                  </Grid>
              </Grid>
              <Grid container item xs={12}>
                  <div className={classes.contentSubTitle}>
                      <PublicationInfo/>
                  </div>
              </Grid>
              <Grid container item xs={12}>
                  {/*Element that will contain image controls if an image is the document being previewed*/}
                  <div id={imageControlElementId} style={{background: 'transparent'}}/>
              </Grid>

              <Grid item xs={4} className={classes.lockButton}>
                  <IconButton className={classes.lockButtonLive}>
                  </IconButton>
              </Grid>
              <Grid item xs={8} container={true} justify={"flex-end"}>
                  <DisplayActions target={"livePreviewBar"} context={{path: selectedItem.path}} render={buttonRenderer({variant:'contained', color:'primary'})}/>
              </Grid>

          </Grid>
        );
      case 'edit':
          return (
            <Grid container spacing={0} className={classes.footerGrid}>
              <Grid container spacing={0}>
                  <Grid container item xs={8} className={classes.titleBar}>
                      <div className={classes.contentTitle}>
                          {ellipsisText(selectedItem.displayName ? selectedItem.displayName : selectedItem.name)}
                      </div>
                  </Grid>
                  <Grid container item xs={4} justify={'flex-end'} className={classes.footerButton}>
                      {selectedItem.type === 'File' && downloadButton(selectedItem, 'default')}
                      <ShareMenu/>
                      {screenModeButtons(handleFullScreen, classes)}
                  </Grid>
              </Grid>
              <Grid container item xs={12}>
                  <div className={classes.contentSubTitle}>
                  <PublicationInfo/>
                  </div>
              </Grid>
              <Grid item xs={12}>
                  {/*Element that will contain image controls if an image is the document being previewed*/}
                  <div id={imageControlElementId} style={{background: 'transparent'}}/>
              </Grid>
              <Grid item xs={4} className={classes.lockButton}>
                  <DisplayActions target={"previewFooterActions"} context={{path: selectedItem.path}} render={iconButtonRenderer({className: classes.lockIcon})}/>
              </Grid>
              <Grid item xs={8} container={true} justify={"flex-end"}>
                  <DisplayActions target={"editPreviewBar"} context={{path: selectedItem.path}} render={buttonRenderer({variant:'contained', color:'primary'})}/>
                  <DisplayActions target={"editAdditionalMenu"} context={{path: selectedItem.path}} render={iconButtonRenderer({className: classes.lockIcon})}/>
              </Grid>
          </Grid>
        );
  }
}

ContentPreviewFooter.defaultProps = {
  classes: {}
}

ContentPreviewFooter.propTypes = {
  classes: PropTypes.object,
  previewMode: PropTypes.string.isRequired,
  selection: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired
  })).isRequired,
  imageControlElementId: PropTypes.string.isRequired,

  t: PropTypes.func.isRequired,
  handleFullScreen: PropTypes.func.isRequired,
  screenModeButtons: PropTypes.func.isRequired,
  downloadButton: PropTypes.func.isRequired
}

export default ContentPreviewFooter;
