import {useDrag, useDragLayer} from 'react-dnd';
import styles from '~/JContent/ContentTree/ContentTree.scss';
import {useEffect} from 'react';
import {getEmptyImage} from 'react-dnd-html5-backend';
import {shallowEqual, useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import {PATH_CONTENTS_ITSELF, PATH_FILES_ITSELF} from '~/JContent/actions/actions.constants';
import {JahiaAreasUtil} from '../JContent.utils';
import {PATH_CATEGORIES_ITSELF} from '../actions/actions.constants';

export function useNodeDrag({dragSource}) {
    const {selection, language, displayLanguage} = useSelector(state => ({
        selection: state.jcontent.selection,
        language: state.language,
        displayLanguage: state.uilang
    }), shallowEqual);
    const isAnythingDragging = useDragLayer(monitor => monitor.isDragging());

    const res = useNodeChecks(
        {...(selection.length > 0 ? {paths: selection} : {path: dragSource?.path}), language, displayLanguage},
        {
            getPrimaryNodeType: true,
            requiredPermission: ['jcr:removeNode'],
            hideOnNodeTypes: ['jnt:virtualsite', 'jmix:hideDeleteAction', 'jmix:blockUiMove'],
            hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF, PATH_CATEGORIES_ITSELF],
            getLockInfo: true
        }
    );

    const isDraggable = Boolean(res.checksResult) && !JahiaAreasUtil.isJahiaArea(dragSource?.path);
    const [props, drag, dragPreview] = useDrag(() => selection.length === 0 ? ({
        type: 'node',
        item: dragSource,
        isDraggable,
        canDrag: () => isDraggable && !res.node?.lockOwner,
        collect: monitor => ({
            dragging: monitor.isDragging(),
            isDraggable,
            isCanDrag: isDraggable && !res.node?.lockOwner
        })
    }) : ({
        type: 'nodes',
        item: res.nodes,
        canDrag: () => res.checksResult && !JahiaAreasUtil.isJahiaArea(dragSource?.path) && !res.nodes?.some(n => n.lockOwner) && selection.indexOf(dragSource.path) > -1,
        collect: monitor => ({
            dragClasses: monitor.isDragging() ? [styles.drag] : []
        })
    }), [dragSource, selection, res]);

    useEffect(() => {
        dragPreview(getEmptyImage(), {captureDraggingState: true});
    }, [dragPreview]);

    const enhancedProps = (isAnythingDragging && selection.indexOf(dragSource?.path) > -1 && props.dragClasses.length === 0) ? {
        ...props,
        isAnythingDragging,
        dragClasses: styles.drag
    } : {...props, isAnythingDragging};

    return [enhancedProps, drag];
}
