import {registry} from '@jahia/ui-extender';
import {useNodeChecks} from '@jahia/data-helper';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';

const collect = (tabs, key) => [...new Set(tabs.flatMap(tab => tab[key] || []))];

const hasDeclaredPermission = tab => Boolean(tab.requiredPermission || tab.requiredSitePermission);

/**
 * Resolves the Content Editor header tabs (target `editHeaderTabsActions`) the current user
 * is allowed to see. Each tab may declare `requiredPermission` (node permissions) and/or
 * `requiredSitePermission` (site permissions) alongside its synchronous `isDisplayable(ctx)`
 * predicate, mirroring the convention used by the shared SidePanel tabs and other actions.
 *
 * Permission checks are async (GraphQL), so rather than one hook per tab (which the dynamic,
 * registry-driven tab set forbids) we run a single `useNodeChecks` over the union of every
 * declared permission and read each result back off the returned node
 * (`node[perm]` / `node.site[perm]`). Within a single tab, a permission array is satisfied when
 * the user holds ANY of the listed permissions, matching `useNodeChecks` semantics.
 *
 * @returns {{tabs: object[], allTabs: object[], loading: boolean}} the displayable+permitted
 * tabs, the full registered set, and whether the permission check is still resolving.
 */
export const useEditHeaderTabs = () => {
    const ctx = useContentEditorContext();
    const allTabs = registry.find({target: 'editHeaderTabsActions'});

    const requiredPermission = collect(allTabs, 'requiredPermission');
    const requiredSitePermission = collect(allTabs, 'requiredSitePermission');
    const needsCheck = requiredPermission.length > 0 || requiredSitePermission.length > 0;

    const {node, loading} = useNodeChecks(
        {path: ctx.path},
        {
            requiredPermission: requiredPermission.length > 0 ? requiredPermission : undefined,
            requiredSitePermission: requiredSitePermission.length > 0 ? requiredSitePermission : undefined,
            skip: !needsCheck || !ctx.path
        }
    );

    // Until the check resolves (still loading, or node unreadable) we can't know which gated tabs
    // are allowed. Decide that once here rather than per tab: surface only permission-free tabs.
    if (needsCheck && (loading || !node)) {
        return {
            tabs: allTabs.filter(tab => tab.isDisplayable(ctx) && !hasDeclaredPermission(tab)),
            allTabs,
            loading
        };
    }

    const isAllowed = tab => {
        const nodeOk = !tab.requiredPermission || tab.requiredPermission.some(permission => node[permission]);
        const siteOk = !tab.requiredSitePermission || tab.requiredSitePermission.some(permission => node.site?.[permission]);
        return nodeOk && siteOk;
    };

    const tabs = allTabs.filter(tab => tab.isDisplayable(ctx) && isAllowed(tab));

    return {tabs, allTabs, loading: false};
};
