## Filters

A filter narrows a jContent list by the value of a field. A filter is a field, an operator and a value:

```js
{field: 'std:lastModified', operator: 'after', value: '2026-11-01'}
{field: 'prop:options', operator: 'is', value: ['garage', 'pool']}
{field: 'std:lastPublished', operator: 'empty'}
```

The server applies the filters: jContent turns them into one node constraint of the `nodesByCriteria` query. The page count, the total count and the selection then describe the filtered set.

The filters show in the toolbar row of the header, on the right, before the other controls. When the row is too narrow, they collapse into one **Filters** chip with the count of active filters. This chip opens the full bar in a popover.

### Fields

A field has this shape:

| Key | Use |
|---|---|
| `key` | `std:<name>` for a standard field, `prop:<property name>` for a property of a content type |
| `label` | The name of the field, in the UI language |
| `kind` | `text`, `number`, `date`, `boolean`, `choice` or `media`. The kind sets the operators (`FILTER_OPERATORS`) and the control of the selector |
| `property` | The JCR property that the constraint names |
| `multiple` | The property holds several values. A `choice` on such a property reads "contains" |
| `options` | The values of a `choice`, as `{value, label}` |
| `looseSeparators` | A space in the value matches any separator. Use it for a field that shows a node name |

`useFilterFields({nodeType})` returns the standard fields, and the properties of `nodeType` when the list holds one type. A module can add its own fields to the list.

A filter on a field that is not in the field list is ignored. The property name always comes from the field list, never from the URL.

### Turn on the filter bar for an accordion

Set `tableConfig.filters` on the accordion. The query handler of the accordion must apply the filters: it declares `supportsFilters(options)`, and it reads the constraint in `options.nodeConstraint`.

```js
registry.add('accordionItem', 'my-accordion', {
    tableConfig: {
        queryHandler: MyQueryHandler,
        filters: {
            // The chips that the bar shows with no value
            defaultFields: ['std:lastModified', 'std:createdBy'],
            // Optional: the keys of the fields to offer, or a function of the options of the view
            fields: ['std:lastModified', 'std:createdBy', 'std:tags']
        }
    }
});

const MyQueryHandler = {
    ...BaseQueryHandler,
    supportsFilters: () => true,
    getQueryVariables: options => ({
        ...BaseQueryHandler.getQueryVariables(options),
        nodeConstraint: options.nodeConstraint
    })
};
```

jContent turns on the bar for the search results, the content folders and the media.

### Show the filter bar in a module route

A module that renders its own `Header` puts `FilterBar` in `toolbarRight`, before its other controls. It does not add a row below the toolbar.

```jsx
import {FilterBar, useFilterFields, useFilters} from '@jahia/jcontent';

const MyRoute = ({contentType}) => {
    const {fields} = useFilterFields({nodeType: contentType});
    const {filters, setFilters} = useFilters();

    return (
        <Header
            title="My list"
            toolbarRight={(
                <>
                    {FilterBar && (
                        <FilterBar fields={fields}
                                   filters={filters}
                                   defaultFields={['std:lastModified']}
                                   onChange={setFilters}/>
                    )}
                    <MyColumnPicker/>
                </>
            )}
        />
    );
};
```

`FilterBar` is controlled. `useFilters` keeps the filters in the jContent URL, in `params.filters`: a filtered list is then a link, and the back button removes the last change. A change goes back to page 1 and clears the selection. A module can also keep the filters in its own state.

The props of `FilterBar`:

| Prop | Use |
|---|---|
| `fields` | The field list |
| `filters` | The active filters |
| `onChange` | Called with the new list of filters |
| `defaultFields` | The keys of the chips displayed by default |
| `isDisabled` | Disables the bar |
| `isCollapsed` | Shows the collapsed **Filters** chip. With no value, the bar collapses when the toolbar row is too narrow |
| `columns`, `visibleColumns`, `onVisibleColumnsChange` | Given to `CollectionBar`, for the column choice next to the filters |

A module checks that `FilterBar` exists, so it still loads on a jContent version without it.

### Send the filters to a module query

`filtersToNodeConstraint(filters, fields, viewConstraint)` returns the constraint of the filters, or `null` when no filter applies. The filters combine with `all`. A constraint of the view, such as a search, is the third argument and the first member of the same `all`.

```js
import {filtersToNodeConstraint} from '@jahia/jcontent';

const nodeConstraint = filtersToNodeConstraint(filters, fields, searchConstraint);

useQuery(MyQuery, {variables: {path, type: contentType, nodeConstraint}});
```

```graphql
query MyQuery($path: String!, $type: String!, $nodeConstraint: InputGqlJcrNodeConstraintInput) {
    jcr {
        nodesByCriteria(criteria: {paths: [$path], nodeType: $type, nodeConstraint: $nodeConstraint}, offset: 0, limit: 25) {
            pageInfo { totalCount }
            nodes { uuid workspace path displayName }
        }
    }
}
```

Send the constraint in a GraphQL variable, never inside the query text.
