({
    sendToJSApp: function (component, event, helper) {

        var msgValue;
        var message;

        var action = component.get("c.getTriage");
        action.setParams({ "recordId": component.get("v.recordId") });

        action.setCallback(this, function(response){
            var state = response.getState();
            console.log('callback state', state);
            if (state === "SUCCESS") {
                console.log('respnse.getReturnValue',response.getReturnValue());
                msgValue = response.getReturnValue()
                // value: component.get("v.messageToJSApp")
                message = {
                    name: "General",
                    value: msgValue
                };
                console.log('message',message);

                console.log('mgsValue END',msgValue);
                console.log('message END', message);
                component.find("jsApp").message(message);
            }
        });
        $A.enqueueAction(action);


    },

    handleMessage: function (component, event, helper) {
        var message = event.getParams();
        component.set('v.messageFromJSApp', message.payload);
    },

    handleError: function (component, event, helper) {
        var error = event.getParams();
        console.log(error);
    }
})