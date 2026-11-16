/** The filter kinds. The kind of a field sets its operators and the control of its selector. */
export type FilterKind = 'text' | 'number' | 'date' | 'boolean' | 'choice' | 'media';

/** One value of a `choice` field: the stored value and the label in the UI language. */
export type FilterFieldOption = {
    value: string;
    label: string;
};

/**
 * A field that a user can filter on. This type is public: modules build fields of this shape.
 *
 * `key` uses the `std:` and `prop:` prefixes of the export columns, such as `std:lastModified` or `prop:jcr:title`.
 */
export type FilterField = {
    key: string;
    label: string;
    kind: FilterKind;
    property: string;
    multiple?: boolean;
    options?: FilterFieldOption[];
    looseSeparators?: boolean;
};

/** One filter: a field, an operator and a value. An operator with no value has no `value`. */
export type Filter = {
    field: string;
    operator: string;
    value?: string | string[];
};

/** The `InputGqlJcrNodeConstraintInput` of the `nodesByCriteria` query. */
export type NodeConstraint = {
    all?: NodeConstraint[];
    any?: NodeConstraint[];
    none?: NodeConstraint[];
    property?: string;
    contains?: string;
    like?: string;
    function?: 'LOWER_CASE' | 'UPPER_CASE' | 'NODE_NAME' | 'NODE_LOCAL_NAME';
    equals?: string;
    notEquals?: string;
    gt?: string;
    gte?: string;
    lt?: string;
    lte?: string;
    exists?: boolean;
    lastDays?: number;
};
