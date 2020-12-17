({
    HideMe: function(component, event, helper) {
        component.set("v.ShowModule", false);
    },

    callChild: function(component, event, helper) {
        component.set("v.ShowModule", true);

        var childComp = component.find('childComp');
        childComp.callChild();
    },

    handleComponentEvent : function(cmp, event) {
        console.log('handleComponentEvent FIRING');
        var message = event.getParam("message");
        console.log('handleComponentEvent message',message);
        // set the handler attributes based on event data
        cmp.set("v.messageFromEvent", message);

        // close module after TXC complete
        cmp.set("v.ShowModule", false);
    }
})