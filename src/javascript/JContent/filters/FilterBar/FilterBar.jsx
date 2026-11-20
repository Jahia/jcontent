import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';
import {Button, Filter as FilterIcon} from '@jahia/moonstone';
// LOCAL TEST ONLY: CollectionBar from a bundled Moonstone 2.22.0, and its CSS. See webpack.config.js
// eslint-disable-next-line import/no-unresolved
import {CollectionBar} from 'local-moonstone-2.22';
import './collectionBarLocalStyles';
import {defaultOperator, filterToConstraint} from '../filterConstraint';
import {setFilterIn} from '../filterParams';
import {collectionBarLabels, filterValueLabel} from './filterLabels';
import {FilterSelector} from './FilterSelector';
import {useFitsToolbar} from './useFitsToolbar';
import styles from './FilterBar.scss';

const LABELS = 'jcontent:label.contentManager.filters';

const sameFilter = (a, b) => JSON.stringify(a || null) === JSON.stringify(b || null);

const draftOf = (field, filter) => (filter ?
    {operator: filter.operator, ...(filter.value !== undefined && {value: filter.value})} :
    {operator: defaultOperator(field.kind)});

/** The CollectionBar of the filters. It holds a draft for each open selector, and applies it when the selector closes. */
const FilterCollectionBar = ({fields, filters, onChange, defaultFields, isDisabled, columns, visibleColumns, onVisibleColumnsChange, onOpenFilterChange, ...props}) => {
    const {t} = useTranslation('jcontent');
    const [drafts, setDrafts] = useState({});
    const draftsRef = useRef(drafts);
    draftsRef.current = drafts;

    const fieldKeys = useMemo(() => new Set(fields.map(field => field.key)), [fields]);
    // A filter from the URL is data: a change keeps the filters of the field list only
    const knownFilters = useMemo(() => filters.filter(filter => fieldKeys.has(filter.field)), [filters, fieldKeys]);

    const setDraft = useCallback((key, draft) => {
        setDrafts(previous => ({...previous, [key]: draft}));
    }, []);

    const dropDraft = key => setDrafts(previous => {
        const {[key]: dropped, ...rest} = previous;
        return rest;
    });

    const apply = field => {
        const current = knownFilters.find(filter => filter.field === field.key);
        const draft = draftsRef.current[field.key];
        dropDraft(field.key);
        if (!draft) {
            return;
        }

        const candidate = {field: field.key, operator: draft.operator, ...(draft.value !== undefined && {value: draft.value})};
        if (filterToConstraint(field, candidate)) {
            if (!sameFilter(candidate, current)) {
                onChange(setFilterIn(knownFilters, candidate));
            }
        } else if (current) {
            // A selector closed with no value removes the filter
            onChange(knownFilters.filter(filter => filter.field !== field.key));
        }
    };

    const collectionFilters = fields.map(field => {
        const filter = knownFilters.find(candidate => candidate.field === field.key);
        return {
            key: field.key,
            label: field.label,
            valueLabel: filterToConstraint(field, filter) ? filterValueLabel(t, field, filter) : '',
            isDisplayedByDefault: defaultFields.includes(field.key),
            selector: ({close}) => (
                <FilterSelector
                    field={field}
                    draft={drafts[field.key] || draftOf(field, filter)}
                    onDraftChange={draft => setDraft(field.key, draft)}
                    onApply={close}
                />
            ),
            onClear: () => {
                dropDraft(field.key);
                onChange(knownFilters.filter(candidate => candidate.field !== field.key));
            },
            onClose: ({reason}) => {
                if (reason === 'escape') {
                    dropDraft(field.key);
                } else {
                    apply(field);
                }
            }
        };
    });

    const columnProps = columns ? {columns, visibleColumns, onVisibleColumnsChange} : {};

    return (
        <CollectionBar
            {...props}
            {...columnProps}
            className={clsx(styles.collectionBar, props.className)}
            filters={collectionFilters}
            isDisabled={isDisabled}
            i18n={collectionBarLabels(t)}
            onClearAll={() => {
                setDrafts({});
                onChange([]);
            }}
            onOpenFilterChange={key => {
                if (key) {
                    const field = fields.find(candidate => candidate.key === key);
                    const filter = knownFilters.find(candidate => candidate.field === key);
                    if (field) {
                        setDraft(key, draftOf(field, filter));
                    }
                }

                onOpenFilterChange?.(key);
            }}
        />
    );
};

FilterCollectionBar.propTypes = {
    fields: PropTypes.array.isRequired,
    filters: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    defaultFields: PropTypes.arrayOf(PropTypes.string).isRequired,
    isDisabled: PropTypes.bool,
    columns: PropTypes.array,
    visibleColumns: PropTypes.arrayOf(PropTypes.string),
    onVisibleColumnsChange: PropTypes.func,
    onOpenFilterChange: PropTypes.func,
    className: PropTypes.string
};

/** The collapsed form: one Filters chip with the count of active filters, which opens the full bar in a popover. */
const CollapsedFilterBar = React.forwardRef(({count, isDisabled, children}, ref) => {
    const {t} = useTranslation('jcontent');
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState(null);
    const [openSelector, setOpenSelector] = useState(null);
    const buttonRef = useRef();
    const popoverRef = useRef();

    const close = () => {
        setIsOpen(false);
        buttonRef.current?.focus();
    };

    const open = () => {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({top: rect.bottom + 4, right: Math.max(8, window.innerWidth - rect.right)});
        setIsOpen(true);
    };

    useEffect(() => {
        if (isOpen) {
            popoverRef.current?.querySelector('button:not([disabled]), [tabindex="0"]')?.focus();
        }
    }, [isOpen]);

    const label = count > 0 ? t(`${LABELS}.collapsedCount`, {count}) : t(`${LABELS}.collapsed`);

    return (
        <span ref={ref} className={styles.collapsed}>
            <Button
                ref={buttonRef}
                className={clsx(styles.collapsedChip, {[styles.collapsedChipActive]: count > 0})}
                variant="outlined"
                icon={<FilterIcon/>}
                label={label}
                isDisabled={isDisabled}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                data-sel-role="filters-collapsed"
                onClick={() => (isOpen ? close() : open())}
            />
            {isOpen && position && (
                <>
                    <div className={styles.popoverOverlay} aria-hidden="true" onClick={close}/>
                    <div
                        ref={popoverRef}
                        className={styles.popover}
                        role="dialog"
                        aria-label={t(`${LABELS}.toolbarLabel`)}
                        style={{top: position.top, right: position.right}}
                        onKeyDown={event => {
                            // An open selector handles its own Escape
                            if (event.key === 'Escape' && !openSelector) {
                                event.stopPropagation();
                                close();
                            }
                        }}
                    >
                        {children(setOpenSelector)}
                    </div>
                </>
            )}
        </span>
    );
});

CollapsedFilterBar.displayName = 'CollapsedFilterBar';

CollapsedFilterBar.propTypes = {
    count: PropTypes.number.isRequired,
    isDisabled: PropTypes.bool,
    children: PropTypes.func.isRequired
};

/**
 * The filter chips for a toolbar row, on Moonstone CollectionBar. It goes inline in `toolbarRight` of a Moonstone Header.
 * When the row is too narrow, or with `isCollapsed`, it shows one Filters chip that opens the full bar in a popover.
 * The bar is controlled: `filters` holds the active filters, and `onChange` gets the new list.
 */
export const FilterBar = ({
    fields,
    filters = [],
    onChange,
    defaultFields = [],
    isDisabled = false,
    isCollapsed,
    columns,
    visibleColumns,
    onVisibleColumnsChange,
    ...props
}) => {
    const rootRef = useRef();
    const measureRef = useRef();
    const activeCount = useMemo(() => filters.filter(filter => filterToConstraint(fields.find(field => field.key === filter.field), filter)).length, [filters, fields]);
    const fits = useFitsToolbar(rootRef, measureRef, [fields, filters, defaultFields, isCollapsed]);
    const collapsed = isCollapsed === undefined ? !fits : isCollapsed;

    const barProps = {fields, filters, onChange, defaultFields, isDisabled, columns, visibleColumns, onVisibleColumnsChange, ...props};

    return (
        <>
            {collapsed ? (
                <CollapsedFilterBar ref={rootRef} count={activeCount} isDisabled={isDisabled}>
                    {setOpenSelector => <FilterCollectionBar {...barProps} onOpenFilterChange={setOpenSelector}/>}
                </CollapsedFilterBar>
            ) : (
                <span ref={rootRef} className={styles.inline}>
                    <FilterCollectionBar {...barProps}/>
                </span>
            )}
            {isCollapsed === undefined && collapsed && (
                // A hidden copy of the full bar gives its width, so that the collapsed chip knows when the bar fits again
                <span ref={measureRef} className={styles.measure} aria-hidden="true">
                    <FilterCollectionBar {...barProps} isDisabled data-sel-role="filter-bar-measure"/>
                </span>
            )}
        </>
    );
};

FilterBar.propTypes = {
    fields: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        kind: PropTypes.oneOf(['text', 'number', 'date', 'boolean', 'choice', 'media']).isRequired,
        property: PropTypes.string.isRequired,
        multiple: PropTypes.bool,
        options: PropTypes.arrayOf(PropTypes.shape({value: PropTypes.string, label: PropTypes.string})),
        looseSeparators: PropTypes.bool
    })).isRequired,
    filters: PropTypes.arrayOf(PropTypes.shape({
        field: PropTypes.string.isRequired,
        operator: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
    })),
    onChange: PropTypes.func.isRequired,
    defaultFields: PropTypes.arrayOf(PropTypes.string),
    isDisabled: PropTypes.bool,
    isCollapsed: PropTypes.bool,
    columns: PropTypes.arrayOf(PropTypes.shape({key: PropTypes.string, label: PropTypes.string})),
    visibleColumns: PropTypes.arrayOf(PropTypes.string),
    onVisibleColumnsChange: PropTypes.func
};
