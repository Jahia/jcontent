import React from 'react';
import {DisplayAction, DisplayActions} from '@jahia/ui-extender';
import {Separator} from '@jahia/moonstone';
import {ButtonRenderer, ButtonRendererNoLabel} from '~/utils/getButtonRenderer';
import {shallowEqual, useSelector} from 'react-redux';
import PropTypes from 'prop-types';

export const BrowseControlBar = ({isShowingActions}) => {
    const {path, siteKey, selection} = useSelector(state => ({
        path: state.jcontent.path,
        siteKey: state.site,
        selection: state.jcontent.selection
    }), shallowEqual);

    const isRootNode = (path === ('/sites/' + siteKey));
    const editPath = selection && selection.length === 1 ? selection[0] : path;

    return isShowingActions && !isRootNode && (
        <>
            <div className="flexRow">
                <DisplayActions hidePasteOnPage
                                target="headerPrimaryActions"
                                path={editPath}
                                render={ButtonRenderer}
                                buttonProps={{size: 'default', variant: 'ghost'}}
                                loading={() => false}/>
            </div>
            <div className="flexRow">
                <Separator variant="vertical" invisible="onlyChild"/>
                <DisplayAction isMenuPreload
                               actionKey="browseControlBarMenu"
                               path={editPath}
                               buttonProps={{size: 'default', variant: 'ghost'}}
                               render={ButtonRendererNoLabel}
                               loading={() => false}
                />
            </div>
        </>
    );
};

BrowseControlBar.propTypes = {
    isShowingActions: PropTypes.bool
};

BrowseControlBar.defaultProps = {
    isShowingActions: true
};

export default BrowseControlBar;
