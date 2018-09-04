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

#### Configuration
Actions are configured in the `Actions/defaultActions.js` file.

Actions configurations can be override within the `actions` array in the `config` entry of the application context.

An Action configuration describe how the action should work and what it does.

Example:

     edit: {
         priority: 2.5,
         component: "callAction",
         call: (path, name) => window.parent.editContent(path, name, ['jnt:content'], ['nt:base']),
         icon: "Edit",
         target: ["previewBar", "tableActions"],
         requiredPermission: "",
         labelKey: 'label.contentManager.contentPreview.edit'
     }

- `priority` defines in a list of action the order to display actions
- `component` is the registered component to use  
- `call` is the function to execute when the action is triggered 
- `icon` is the icon for the action (not implemented yet)
- `target` is the location id where this action should be displayed
- `requiredPermission` set the required permission to display the action   
- `labelKey` is the key to use to display the label
- `requiredAllowedChildNodeType` defines the required allowed child type to make that action being displayed
- `hideOnNodeTypes` defines a list of types on which the action should not be displayed
- `shownNodeTypes` defines a list of types on which the action should be displayed

These properties are available either for the action and its display (the button / item ..). As soon as an 
action needs it, you can add your custom configurable property (like nodeTypes, enable, etc ..)
    
Available registered Actions:
- `CallAction` A simple action that execute the `call` function set on the action
- `MenuAction` An action that opens a menu containing all entries matching `menuId` as target

To register an action, add it in the `actionComponents` object in `ContentManager.jsx`
    
    const actionComponents = {
        callAction: CallAction,
        menuAction: MenuAction
    }
Depending of the requirement, existing Action may not be enough and you might need to create your own. For example
to execute a GraphQL query or change the state of a component. 
An Action component is a render prop component that takes all action properties and context as props, then do operations
 or provide to its children the operations to execute
 
Example:

    class CallAction extends React.Component {    
        render() {
            const {call, children, context, ...rest} = this.props;
            return children({...rest, onClick: () => call(context)})
        }
    }
    
    export default CallAction; 
#### Usage
With the `Actions` render props component, you can specify where your actions should be displayed.
This component has 2 required properties:
- `menuId` is referenced by the `target` in action configuration.
- `context` defines a context that will be used while executing the action. Depending of the action component, 
it can be enhanced in the action rendering chain. 
   
As a render props component, it provides all the configuration to the display of the action. This display has to be
set as a children of the `Actions` component.

Example:

    <Actions menuId={"tableActions"} context={{path: n.path, displayName: n.name}}>
        {(props) => <CmIconButton {...props}/>}
     </Actions>

In this example, this actions placeholder will display all action that have its `target` set to `tableActions`. 
`props` provides all the action configuration properties.
## Development

### Add event handlers 

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