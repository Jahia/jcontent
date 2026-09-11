# Retiring the legacy `tags` module — analysis (no code changes)

Status: **analysis only, for CTO office review**. This branch/PR intentionally contains no
implementation. It exists to get a decision on scope before any code is written.

## Why this is being looked at

jContent's new Tag Manager (#2265, merged into `smo-tagManager`) reimplements, on top of the
GraphQL `admin.jahia.tagManager` API, the same administrative capability the legacy `tags` module
(`Jahia/tags`, `<artifactId>tags</artifactId>`) has provided since Jahia 7/8: an admin screen to
list, rename and delete tags across a site, and to see/edit which content a tag is applied to.

With that overlap now real, the question is whether — and how — to retire `tags`, following the
precedent set by [#2752](https://github.com/Jahia/jcontent/pull/2752), which retired the
`visibility`/`advanced-visibility` modules from inside jContent's own OSGi activator once jContent
took over their node types.

## What `#2752` established as the retirement pattern

`ContentEditorActivator.start()` calls a `*Retirement.retireSources(context)` helper **before**
`Migrator.migrate()` runs and before Declarative Services activates jContent's own components for
the node types being taken over. The helper:

- finds specific bundles by symbolic name that are still installed on **this node**,
- calls `Bundle.stop()` then `Bundle.uninstall()` directly (not through `ModuleManager`), which is
  local-only and therefore doesn't need a cluster-wide operation — the property that makes it safe
  to run from inside a bundle activator, where a clustered uninstall would deadlock Karaf Cellar's
  single-threaded event dispatcher,
- runs unconditionally on every start, with no "already migrated" flag (a flag would have to be
  cluster-shared, and a node that was down during the migration would read it, skip, and stay
  behind), and logs at WARN rather than INFO because removing a module an operator may have
  installed on purpose should never be silent,
- is paired with a patch-script that migrates the JCR node-type ownership itself, run separately
  in the resolved phase.

The PR's own validation and reviewer notes are explicit that this pattern is safe **because**
`visibility`'s condition node types had no consumers outside jContent — nothing else in the
ecosystem declared a hard dependency on `visibility`/`advanced-visibility` or called into them
directly.

## What retiring `tags` would actually involve

`tags` is a materially larger surface than `visibility`. It ships:

- 5 node types: `jnt:tagsManager`, `jnt:tagCloud`, `jnt:tagging`, `jnt:displayTags`,
  `jnt:relatedTagging`, plus the `jmix:tagsContent` mixin they extend.
- A permission, `tagManager`, applied at `site-admin` — already reused by our new Tag Manager
  (same permission name, registered by `graphql-dxm-provider`/jContent instead of `tags`).
- A `site-settings` template registration (`tagsManager` view, in both the base and
  Bootstrap3/Google-Material skins) that renders the *legacy* admin flow
  (`jnt_tagsManager/html/tagsManager.flow`) — this is the piece our Tag Manager actually replaces.
- 4 Spring-bean HTTP actions: `AddTag`, `RemoveTag`, `MatchingTags`, `TransformTag`
  (`.addTag.do`, `.matchingTags.do`, etc.) — REST-ish endpoints, unrelated to GraphQL, used
  directly by front-end JS elsewhere (see below).
- JSPs/CSS for content-facing widgets: tag cloud, tagging, display-tags, related-tagging. These
  render tags **on a page**, not in an admin screen, and have no equivalent anywhere in jContent.

Our new Tag Manager only replaces the **admin management UI** (`jnt:tagsManager` + the
`tagManager` permission wiring). It does not reimplement tag cloud, tagging, display-tags,
related-tagging, or the four HTTP actions.

## Consumers found outside `Jahia/tags` itself

A GitHub code search across the `Jahia` org for the module's node types, actions and asset paths
found:

| Consumer | What it uses | Nature of dependency |
|---|---|---|
| `Jahia/jexperience` | `dx.service.js` calls `.matchingTags.do` directly for a tag-autocomplete widget; `pom.xml` declares `jahia-depends=default,tags,jcontent=3.7.0` | **Hard, declared runtime dependency** |
| `Jahia/templates-system` (installed on our test instance) | declares `j:dependencies` including `tags` | Declared, but **not enforced at runtime** — verified live (see below) |
| `Jahia/jahia-security-scan`, `Jahia/jcustomer-perf`, `Jahia/external-provider` | reference the node type names | Appear to be scanning/test/reference material, not runtime consumers — not independently verified beyond the search hit |

**Verified live** on the Jahia 8.2.3.2 test instance (`digitall` site, `templates-system` and
`tags` both installed): stopping the `tags` bundle via the module-manager REST API did **not**
stop or break `templates-system`, which stayed `ACTIVE`/`STARTED` throughout — the same
soft-dependency behavior our own `graphql-dxm-provider` version gate relies on for
`jahia-depends`. No content on the test site uses any of the 5 legacy node types (queried via
GraphQL, `totalCount: 0` for each).

`jexperience` itself was not installed on the test instance, so its dependency could not be
exercised live; the hard `jahia-depends=…,tags,…` declaration and the direct `.matchingTags.do`
call were confirmed by reading its source, not by a runtime test.

## Why this is not a drop-in repeat of `#2752`

The `visibility` retirement was safe specifically because nothing outside jContent had a real
runtime dependency on the node types being retired. That is not the case here:

1. **`jexperience` hard-depends on `tags`.** If a customer with jExperience installed upgraded
   jContent to a version that silently retires `tags` (following the `#2752` pattern exactly),
   jExperience would fail to load as soon as `tags` is uninstalled — this is precisely the failure
   mode the `#2752` reviewer notes warn about for a module *with* real dependents, a case that
   didn't arise for `visibility`.
2. **Content-facing widgets have no jContent equivalent.** Tag cloud, tagging, display-tags and
   related-tagging render tags on live pages. Retiring `tags` wholesale would remove working,
   possibly in-use rendering components with nothing to replace them, which is a different kind of
   regression than an admin screen being superseded.
3. **The four HTTP actions are a separate integration surface** (non-GraphQL, used at least by
   jExperience) that the new Tag Manager doesn't touch at all.

## A fourth option: unregister the legacy admin route from the UI only

None of A/B/C touch the actual complaint driving this analysis, which is narrower than "retire the
module": today, with both `tags` and the new Tag Manager installed, a site admin sees **two**
"Tags" entries in the menu — the old iframe-based one and the new one — because `tags` registers
its own client-side admin route independently of anything jContent does.

`tags` registers that entry from a plain JS asset,
[`tagmanager.js`](https://github.com/Jahia/tags/blob/main/src/main/resources/javascript/apps/tagmanager.js):

```javascript
window.jahia.uiExtender.registry.add('adminRoute', 'tagsmanager', {
    targets: ['jcontent:50'],
    label: 'tags:label.title',
    icon: window.jahia.moonstone.toIconComponent('CollectionsBookmark'),
    isSelectable: true,
    requiredPermission: 'tagManager',
    requireModuleInstalledOnSite: 'tags',
    iframeUrl: window.contextJsParameters.contextPath + '/cms/editframe/default/$lang/sites/$site-key.tagsManager.html'
});
```

`@jahia/ui-extender`'s registry is a plain client-side key/value store
([`registry.ts`](https://github.com/Jahia/javascript-components/blob/main/packages/ui-extender/src/registry/registry.ts))
and exposes a first-class `remove(type, key)` alongside `add`. There is an existing production
precedent for one module removing another's registry entries this way: `remotepublish`'s
[`init.js`](https://github.com/Jahia/remotepublish/blob/main/war/src/javascript/init.js) registers
a `callback` targeting `jahiaApp-init:9999` — a very late priority on the app's own init event —
whose body calls `registry.remove(...)` on `adminRoute`/`primary-nav-item` entries it wants gone.
The high priority is what makes the ordering safe: every module's top-level script (including
`tags`'s `tagmanager.js`, which calls `registry.add` unconditionally at load time, not inside a
callback) has already run by the time `jahiaApp-init` fires, so a callback registered against it
is guaranteed to execute after every other module's registration, however that module orders its
own asset relative to jContent's.

The same pattern in jContent:

```javascript
registry.add('callback', 'hideLegacyTagsManagerRoute', {
    targets: ['jahiaApp-init:9999'],
    callback: () => registry.remove('adminRoute', 'tagsmanager')
});
```

This removes only the menu entry and its iframe. Everything else about `tags` is untouched: the
bundle stays installed and `ACTIVE`, its 5 node types and the `jmix:tagsContent` mixin stay
registered, its 4 Spring-bean HTTP actions (`AddTag`/`RemoveTag`/`MatchingTags`/`TransformTag`,
the ones `jexperience` calls directly) keep working exactly as today, and the content-facing
widgets (tag cloud, tagging, display-tags, related-tagging) keep rendering. Nothing server-side
changes, so the `jexperience` hard-dependency problem that rules out option A as scoped does not
arise here at all — this is a client-only registry operation, not an OSGi lifecycle one.

The tradeoff: this solves the "two Tags entries in the menu" duplication and lets the new Tag
Manager be the sole admin entry point, but it does not touch the question A/B were meant to
answer — whether to stop shipping/maintaining `tags` at all. `tags` still installs, still needs a
`jahia-depends` from anything that wants it, and still carries its own upkeep cost; retiring it
later (as B, or A once `jexperience` is addressed) remains a separate decision this option leaves
open rather than forecloses.

## Options for the CTO office to weigh in on

- **A — Full retirement**, following `#2752` exactly (activator-level `stop()`/`uninstall()` of
  `tags` on every jContent start). Requires coordinating a `jexperience` change first (drop or
  rework its `tags` dependency and its `.matchingTags.do` call), and accepting the loss of the
  content-facing widgets with no replacement, or building replacements for them first.
- **B — Narrow retirement**, limited to what our Tag Manager actually supersedes: remove/retire
  only the `jnt:tagsManager` node type, its `site-settings` template registration and the legacy
  `tagsManager.flow` UI, following the same activator pattern but scoped to just that one node
  type. Leave `jnt:tagCloud`, `jnt:tagging`, `jnt:displayTags`, `jnt:relatedTagging`,
  `jmix:tagsContent` and the four HTTP actions in `tags` untouched, so `jexperience` and any
  content using the widgets keep working. `tags` stays installed, just without its own admin
  screen competing with ours (or the admin screen removed but the rest of the module unaffected,
  since node-type ownership is what actually matters for `#2752`-style retirement).
- **C — No retirement now.** Ship the new Tag Manager alongside the legacy one (as today via the
  `graphql-dxm-provider` version gate), revisit `tags` retirement as a separate, later effort once
  `jexperience`'s dependency is addressed and/or the content-facing widgets have a plan.
- **D — UI-only unregistration**, described above: hide the legacy `tagsmanager` admin route from
  jContent's own JS, leave the `tags` module itself entirely untouched. Compatible with, and not
  exclusive of, doing B or A later — D just stops the duplicate menu entry from confusing admins
  in the meantime, with none of A's or B's risk.

This document takes no position between B, C and D beyond flagging that **A is not safe as
scoped** without first addressing `jexperience`. No code has been written; the next step is
direction from the CTO office on which option (or which combination) to implement.
