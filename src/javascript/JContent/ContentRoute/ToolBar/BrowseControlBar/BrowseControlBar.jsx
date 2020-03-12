import React from 'react';
import {DisplayActions} from '@jahia/ui-extender';
import FileModeSelector from '../FileModeSelector';
import JContentConstants from '../../../JContent.constants';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';

const ButtonRenderer = getButtonRenderer({size: 'default', variant: 'ghost'});

export const BrowseControlBar = ({showActions}) => {
    const {path, mode, siteKey} = useSelector(state => ({
        path: state.jcontent.path,
        mode: state.jcontent.mode,
        siteKey: state.site
    }));

    const isRootNode = (path === ('/sites/' + siteKey));

    return (
        <React.Fragment>
            {showActions && !isRootNode &&
            <React.Fragment>
                <DisplayActions target="headerPrimaryActions" context={{path: path}} render={ButtonRenderer} loading={() => false}/>
            </React.Fragment>}
            <div className="flexFluid"/>
            {showActions && mode === JContentConstants.mode.MEDIA &&
            <FileModeSelector/>}
        </React.Fragment>
    );
};

BrowseControlBar.propTypes = {
    showActions: PropTypes.bool.isRequired
};

export default BrowseControlBar;
