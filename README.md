# LCC Sample App
Refer to this Salesforce documentation, refer to Example 1.: https://developer.salesforce.com/blogs/2018/04/lightning-container-component-building-components-with-react-angular-and-other-libraries.html

Refer to this Github repo: https://github.com/ccoenraets/lightning-container-component-samples

## Installation Instructions

Make sure you have the latest version of the Salesforce DX CLI before proceeding. Update info [here](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_update_cli.htm).

1. Authenticate with your hub org (if not already done)
    ```
    sfdx force:auth:web:login -d -a *your_hub_org*
    ```

1. Clone the lcc-samples repository (note the url below may be different than the Salesforce documentation URL above, their documentation was out of date). This repo will serve as a reference, samples, and template you can use. It is not necessary to use this repo, but may be useful we starting out building your first LCC.
    ```
    git clone https://github.com/ccoenraets/lightning-container-component-samples
    cd lcc-samples
    ```

1. Create a scratch org and provide it with an alias (for example: lcc):
    ```
    sfdx force:org:create -s -f config/project-scratch-def.json -a lcc --setdefaultusername
    ```

1. Push the app to your scratch org:
    ```
    sfdx force:source:push
    ```

1. Assign the lcc permission set to the default user:
    ```
    sfdx force:user:permset:assign -n lcc
    ```

1. Open the scratch org:
    ```
    sfdx force:org:open
    ```

1. In App Launcher, select the **LCC Samples** app.

## Create your own JavaScript App

1. Create a new folder in the js-apps folder, name it after your JS component.
    1. Create "src" folder. Create the JS component's JavaScript file to this folder, name it "index.js".
    1. Make sure you are in the application root folder and type the following command:
        ```
        npm install lightning-container --save
        ```
    1. In your JavaScript code, import the lightning-container module as follows:
        ```
        import LCC from 'lightning-container';
        ```
    1. Create the "package.json" and "webpack.config.js" in your app folder. Use the lcc-sample-messaging app as a reference for these files, change the name and paths as necessary.
    1. Build your application using a build tool like webpack or rollup (see examples below).
        1. Install the app dependencies. Make sure you are in the application root folder and type the following command:
            ```
            npm install
            ```
        1. Build the app. Make sure you are in the application root folder and type the following command:
            ```
            npm run build
            ```
    1. Upload your JavaScript application as a static resource. Push your changes to your scratch org:
        ```
        sfdx force:source:push
        ```
    1. Create a Lightning component that wraps your JavaScript application using the lightning:container component. 
        ```<aura:component>   
            <lightning:container src="{!$Resource.my_js_app + '/index.html'}"
                    onmessage="{!c.handleMessage}"
                    onerror="{!c.handleError}"/>
        </aura:component>``` 
    1. You may have to add trsuted sites to Setup > CSP Trusted Sites.

## Building JavaScript Apps

The Lightning Container Component library is available as a JavaScript module that you can install as a dependency in your JavaScript application using npm. JavaScript modules are not yet supported consistently across all browsers. Therefore, applications using modules require a build process using a tool like webpack or rollup.

The JavaScript applications that use the Lightning Container Component as a module are located in the ```js-apps``` folder. Each application has a webpack build configuration (webpack.config.js).

Follow the steps below if you want to make changes to a sample application:

1. Make your changes in source code

2. Install the app dependencies. Make sure you are in the application root folder and type the following command:

    ```
    npm install
    ```

2. Build the app. Make sure you are in the application root folder and type the following command:

    ```
    npm run build
    ```

    Webpack automatically outputs the results (bundle.js) in the staticresources folder corresponding to your application.

3. Type the following command to push your changes to your scratch org:

    ```
    sfdx force:source:push
    ```

NOTE: You can also use the Lightning Container Component library in plain old JavaScript (ECMAScript 5) without using modules and without a build process. Check out Example 4 below to see how.
