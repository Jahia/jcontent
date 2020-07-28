import React, {useMemo} from 'react';
import {DisplayAction, DisplayActions, registry} from '@jahia/ui-extender';
import {Separator} from '@jahia/moonstone';
import FileModeSelector from '../FileModeSelector';
import JContentConstants from '../../../JContent.constants';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';

const ButtonRenderer = getButtonRenderer({size: 'default', variant: 'ghost'});
const ButtonRendererNoLabel = getButtonRenderer({labelStyle: 'none', size: 'default', variant: 'ghost'});

const excludedActions = ['pageComposer', 'subContents', 'edit', 'publishMenu', 'cut', 'deletePermanently', 'publishDeletion', 'copy', 'paste', 'createFolder', 'createContentFolder', 'createContent', 'fileUpload'];

export const BrowseControlBar = ({showActions}) => {
    const {path, mode, siteKey} = useSelector(state => ({
        path: state.jcontent.path,
        mode: state.jcontent.mode,
        siteKey: state.site
    }));

    const contentActions = useMemo(() => [
        ...registry.find({type: 'action', target: 'headerPrimaryActions'}).map(action => action.key),
        ...excludedActions
    ], []);
    const isRootNode = (path === ('/sites/' + siteKey));

    return (
        <React.Fragment>
            {showActions && !isRootNode && (
                <>
                    <div className="flexRow">
                        <DisplayActions target="headerPrimaryActions"
                                        path={path}
                                        render={ButtonRenderer}
                                        loading={() => false}/>
                    </div>
                    <div className="flexRow">
                        <Separator variant="vertical" invisible="onlyChild"/>
                        <DisplayAction menuPreload
                                       actionKey="contentMenu"
                                       path={path}
                                       menuFilter={action => contentActions.indexOf(action.key) === -1}
                                       render={ButtonRendererNoLabel}
                                       loading={() => false}
                        />
                    </div>
                </>
            )}
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
