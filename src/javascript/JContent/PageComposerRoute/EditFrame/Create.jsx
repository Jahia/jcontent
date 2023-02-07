import React, {useEffect} from 'react';

import styles from './Create.scss';
import PropTypes from 'prop-types';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import clsx from 'clsx';
import {useNodeDrop} from '~/JContent/dnd/useNodeDrop';
import {useNodeInfo} from '@jahia/data-helper';
import editStyles from './EditFrame.scss';
import {useDragLayer} from 'react-dnd';
import {useSelector} from 'react-redux';

const ButtonRenderer = getButtonRenderer({defaultButtonProps: {color: 'default'}});

export const Create = React.memo(({element, onMouseOver, onMouseOut, onSaved}) => {
    const rect = element.getBoundingClientRect();
    const scrollLeft = element.ownerDocument.documentElement.scrollLeft;
    const scrollTop = element.ownerDocument.documentElement.scrollTop;

    let parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
    if (!parent) {
        parent = element.parentElement;
        while (parent.getAttribute('jahiatype') !== 'module') {
            parent = parent.parentElement;
        }

        element.dataset.jahiaParent = parent.id;
    }

    useEffect(() => {
        element.style.height = '28px';
    });

    const parentPath = parent.getAttribute('path');

    const {node} = useNodeInfo({path: parentPath}, {
        getPrimaryNodeType: true
    });

    const [{isCanDrop}, drop] = useNodeDrop({dropTarget: parent && node, onSaved});

    const {anyDragging} = useDragLayer(monitor => ({
        anyDragging: monitor.isDragging()
    }));

    const copyPaste = useSelector(state => state.jcontent.copyPaste);

    const currentOffset = {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: 25
    };

    const sizers = [];
    Array(10).fill(0).forEach((_, i) => {
        if (rect.width < (i * 150)) {
            sizers.push('sizer' + i);
        }
    });

    const nodePath = element.getAttribute('path') === '*' ? null : element.getAttribute('path');
    const nodetypes = element.getAttribute('nodetypes') ? element.getAttribute('nodetypes').split(' ') : null;
    const {nodes} = copyPaste;

    useEffect(() => {
        if (isCanDrop) {
            element.classList.add(styles.dropTarget);
        }

        return () => {
            element.classList.remove(styles.dropTarget);
        };
    }, [isCanDrop, element]);

    return !anyDragging && (
        <div ref={drop}
             jahiatype="createbuttons" // eslint-disable-line react/no-unknown-property
             data-jahia-id={element.getAttribute('id')}
             className={clsx(styles.root, editStyles.enablePointerEvents, sizers)}
             style={currentOffset}
             data-jahia-parent={parent.getAttribute('id')}
             onMouseOver={onMouseOver}
             onMouseOut={onMouseOut}
        >
            {nodes.length === 0 && (<DisplayAction actionKey="createContent" path={parentPath} name={nodePath} nodeTypes={nodetypes} loading={() => false} render={ButtonRenderer}/>)}
            <DisplayAction actionKey="paste" path={parentPath} loading={() => false} render={ButtonRenderer}/>
        </div>
    );
});

Create.propTypes = {
    element: PropTypes.any,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    onSaved: PropTypes.func
};
