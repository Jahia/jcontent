import React, {useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {useQuery} from '@apollo/client';
import {displayName, useTreeEntries} from '@jahia/data-helper';
import {Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {PickerItemsFragment} from '~/JContent/ContentTree/ContentTree.gql-fragments';
import {GetSelectedEntries} from './choiceTree.gql-queries';
import {choiceTreeAdapter} from './choiceTree.adapter';

const getOption = (field, name) => field.selectorOptions?.find(option => option.name === name)?.value;

export const ChoiceTree = ({field, value, id, editorContext, onChange, onBlur}) => {
    const {t} = useTranslation('jcontent');

    const types = useMemo(
        () => getOption(field, 'types')?.split(',').map(type => type.trim()) || [],
        [field]
    );
    const rootPath = useMemo(
        () => getOption(field, 'rootPath')?.replace('{site}', editorContext.site),
        [field, editorContext.site]
    );

    // The field stores uuids; normalise single/multiple into a uuid array.
    const selectedValues = useMemo(() => {
        if (field.multiple) {
            return value || [];
        }

        return value ? [value] : [];
    }, [field.multiple, value]);

    // Branches that have been opened. Seeded with the root so its first level is
    // fetched; grows as the user expands nodes (and when a selection is resolved).
    const [openPaths, setOpenPaths] = useState([rootPath]);

    // Resolve the stored uuids to their ancestor paths, so the branches leading to
    // a current selection are pre-opened (and therefore fetched) without loading
    // the whole tree.
    const {data: selectedData} = useQuery(GetSelectedEntries, {
        skip: selectedValues.length === 0 || !rootPath,
        variables: {uuids: selectedValues, rootPath}
    });

    const selectedNodes = useMemo(() => selectedData?.jcr?.nodesById || [], [selectedData]);

    useEffect(() => {
        const ancestorPaths = selectedNodes.flatMap(node => node.ancestors.map(ancestor => ancestor.path));
        if (ancestorPaths.length > 0) {
            setOpenPaths(prev => [...new Set([...prev, ...ancestorPaths])]);
        }
    }, [selectedNodes]);

    // Lazy, per-level fetching. Only the root's children plus the children of each
    // open path are loaded — the same mechanism JContent's ContentTree uses.
    const {treeEntries, error, loading} = useTreeEntries({
        fragments: [displayName, PickerItemsFragment.primaryNodeType],
        rootPaths: [rootPath],
        openPaths,
        selectedPaths: selectedNodes.map(node => node.path),
        openableTypes: types,
        selectableTypes: types,
        queryVariables: {language: editorContext.lang},
        hideRoot: true,
        sortBy: {fieldName: 'displayName', sortType: 'ASC'}
    }, {errorPolicy: 'all'});

    // Keep the last non-empty result so a refetch (triggered when a branch is
    // opened) does not momentarily blank the tree. Same approach as ContentTree.
    const dataRef = useRef(null);
    if (treeEntries.length > 0 || dataRef.current === null) {
        dataRef.current = treeEntries;
    }

    const entries = dataRef.current;

    if (error) {
        const message = t('jcontent:label.contentEditor.error.queryingContent', {details: `${rootPath} in ${editorContext.lang}`});
        console.warn('unable to resolve choice tree configuration from selector options', field.selectorOptions, error);
        return <>{message}</>;
    }

    if (loading && entries.length === 0) {
        return <LoaderOverlay/>;
    }

    const tree = choiceTreeAdapter({treeEntries: entries, openPaths, loading});

    const handleClear = () => onChange(field.multiple ? [] : null);

    const handleChange = (_, selectedValue) => {
        if (field.multiple) {
            const prev = value || [];
            onChange(prev.includes(selectedValue.value) ? prev.filter(v => v !== selectedValue.value) : [...prev, selectedValue.value]);
        } else {
            onChange(selectedValue.value);
        }
    };

    const handleOpenItem = node => setOpenPaths(prev => [...new Set([...prev, node.id])]);
    const handleCloseItem = node => setOpenPaths(prev => prev.filter(path => path !== node.id && !path.startsWith(node.id + '/')));

    const singleValue = field.multiple ? undefined : (value || undefined);
    const multipleValue = field.multiple ? (value || []) : undefined;

    return (
        <Dropdown
            hasSearch
            data-sel-role="choice-tree"
            id={id}
            className="flexFluid"
            treeData={tree}
            variant="outlined"
            size="medium"
            placeholder={t('jcontent:label.contentEditor.selectorTypes.choiceTree.placeholder')}
            value={singleValue}
            values={multipleValue}
            isDisabled={field.readOnly}
            openedItems={openPaths}
            onOpenItem={handleOpenItem}
            onCloseItem={handleCloseItem}
            onClear={handleClear}
            onChange={handleChange}
            onBlur={onBlur}
        />
    );
};

ChoiceTree.propTypes = {
    field: FieldPropTypes.isRequired,
    id: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    editorContext: PropTypes.shape({
        lang: PropTypes.string.isRequired,
        site: PropTypes.string.isRequired
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired
};
