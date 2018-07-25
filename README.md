# Content Manager

Content Manager Module for DX

## Getting Started

Compile and deploy the module. 

## Recompiling only Javascript

    yarn build

## Watching Javascript changes

    yarn watch

## Configuration

Currently the configuration is a javascript object that provided by the `template.content-manager.jsp` view but 
should be move to an external file.

### Actions

Actions are configured within the `actions` array in the `config` entry of the application context.

An Action configuration describe how the action should work and what it does.

Example:

     {
        id: "edit",
        priority: 1,
        action: "action",
        call: (path, name) => window.parent.editContent(path, name, ['jnt:content'], ['nt:base']),
        icon: "Edit",
        target:["previewBar", "tableActions"],
        requiredPermission:"",
        labelKey: 'label.contentManager.contentPreview.edit'
    }

- `id` is a unique identifier 
- `priority` defines in a list of action the order to display actions
- `action` is the registered action to use  
- `call` is the function to execute when the action is triggered 
- `icon` is the icon for the action (not implemented yet)
- `target` is the location id where this action should be displayed
- `requiredPermission` set the required permission to display the action   
- `labelKey` is the key to use to display the label

These properties are available either for the action and its display (the button / item ..). As soon as an 
action needs it, you can add your custom configurable property (like nodeTypes, enable, etc ..)
    
Available registered Actions:
- `Action` A simple action that execute the `call` function set on the action
- `MenuAction` An action that opens a menu containing all entries matching `menuId` as target

To register an action, add it in the `actionComponents` object in `ContentManager.jsx`
    
    const actionComponents = {
        action: Action,
        menuAction: MenuAction
    }

## Development

### URL management

use the `CmRouter` Render prop Component to read or update the URL.

### Routing

The main route contains the site key and the language of the content.

#### Existing routes

##### browse

It uses the `ContentLayout` component with the `browsing` type content source

##### search

It uses the `ContentLayout` component with the `browsing` type content source

##### sql2Search

It uses the `ContentLayout` component with the `sql2Search` type content source