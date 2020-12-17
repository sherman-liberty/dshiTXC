({
    // onRender: function(component) {

    //     console.log('recordId',component.get("v.recordId"));
    //     var action = component.get("c.getTriage");
    //     action.setParams({ "recordId": component.get("v.recordId") });

    //     action.setCallback(this, function(response){
    //         var state = response.getState();
    //         console.log('callback state', state);
    //         if (state === "SUCCESS") {

    //             var message = {
    //                 name: "General",
    //                 value: response.getReturnValue()
    //             };

    //             console.log('message END', message);
    //             // component.set("v.showTXC", true);
    //             component.find("jsApp").message(message);
    //         }
    //     });
    //     $A.enqueueAction(action);

    // },

    // sendToJSApp
    callChildMethod: function (component, event, helper) {

        console.log('recordId',component.get("v.recordId"));
        var action = component.get("c.getTriage");
        action.setParams({ "recordId": component.get("v.recordId") });

        action.setCallback(this, function(response){
            var state = response.getState();
            console.log('callback state', state);
            if (state === "SUCCESS") {

                var message = {
                    name: "General",
                    value: response.getReturnValue()
                };

                console.log('message END', message);
                // component.set("v.showTXC", true);
                component.find("jsApp").message(message);
            }
        });
        $A.enqueueAction(action);
    },

    handleMessage: function (component, event, helper) {
        // VERIFY message is the "TXC complete" event

        // set boolean attribute to true/false
        //Get the event using registerEvent name.
       
        var message = event.getParams();
        console.log('message.payload',message.payload);
        component.set('v.messageFromJSApp', message.payload);

        var cmpEvent = component.getEvent("cmpEvent");
        cmpEvent.setParams({"message" : "Triage process complete."});
        cmpEvent.fire();
        console.log('cmpEvent fired maybe', cmpEvent);
    },

    handleError: function (component, event, helper) {
        var error = event.getParams();
        console.log(error);
    }
})