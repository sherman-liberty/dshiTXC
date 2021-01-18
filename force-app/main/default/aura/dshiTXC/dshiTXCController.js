({

    handleMessage: function (component, event, helper) {

        var message = event.getParams();
        var messagePayload = message.payload;
        var messagePayloadName = message.payload.name;
        var messagePayloadValue = message.payload.value;

        if (messagePayloadName == 'startIt') {

            // get Triage record
            var action = component.get("c.getVitalsObj");
            action.setParams({ "tri": component.get("v.triageRecord") });
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (component.isValid() && response !== null && response.getState() == 'SUCCESS') {
                    var message = {
                        name: "Vitals",
                        value: response.getReturnValue()
                    };
                    component.find("jsApp").message(message);
                }
            });
            $A.enqueueAction(action);

            // turn off spinner
            component.set("v.isSpinning", false);
        }

        else if (messagePayloadName == 'completeIt') {

            // update Triage record Status
            var action2 = component.get("c.updateTriageRecord");
            action2.setParams({ "triageRecord": component.get("v.triageRecord"), "note": messagePayloadValue.triageNote });
            action2.setCallback(this, function(response) {
                console.log('response!',response);
                if (component.isValid() && response !== null && response.getState() == 'SUCCESS') {
                    component.set('v.showModal', false);
                }
            });
            $A.enqueueAction(action2);

            // reload window to avoid long callback wait
            window.location.reload();
        }
    },

    handleError: function (component, event, helper) {
        var error = event.getParams();
        console.log(error);
    }
})