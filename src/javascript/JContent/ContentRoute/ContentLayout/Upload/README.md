# File Upload

This implementation is selfcontained and was designed to be easily portable to other areas of DX and React DX environments
in general. All that's required from receiving environment is to be able to provide/create a batchable Redux store. As result this
folder can be easily converted into a repository at which point only ```./Upload.redux-reducer.js```, ```./Upload.redux-actions.js```
and ```./Upload.jsx``` need to be exported.

## How to use

In order to use file upload  you need to do 2 things:

- Import ```Upload``` reducer function from ```./Upload.redux-reducer.js``` and add it to your Redux store. It is important that your store
can support batched actions. For more info on supporting batched actions see this repository: https://github.com/tshelburne/redux-batched-actions.

    When you add your reducer function you can name it ```Upload``` which is the default name or you can create a custom name in
which case you will need to specify it as a property ```statePartName``` in step two.

- Once you have your reducer setup you can add file upload component from ```./upload.jsx``` to your page. This component
can take two parameters.

    ```statePartName``` parameter which you would use if you named your reducer function something other than ```Upload```. This parameter is optional.
    ```acceptedFileTypes``` parameter which takes an array of allowed extensions, for example ```[".jpg", ".png"]```. This parameter is optional, all file types will be allowed if it is ignored.

Now file upload is setup and ready for use.

To open the upload panel you need to dispatch a batch of two actions.

* ```setPath(<your_path>)``` to indicate where files will be stored
* ```setPanelState('VISIBLE')``` to indicate that the panel should open

## Important notes on configuration

You can specify how many simultaneous uploads to have in the ```./JContent.constants.js``` file as ```NUMBER_OF_SIMULTANEOUS_UPLOADS``` constant. The default is set to one.

You can also specify renaming strategy in the same file. You have a choice of ```AUTOMATIC``` when the file name is changed by the system or ```MANUAL``` when user has to enter desired name in a dialog.

It may be worthwhile to allow clients to change these options via parameters of the upload component in the future.