({
    doInit: function(component, event, helper) {
        let lccStaticResName = component.get("v.lccStaticResName");
        let lccStaticResPath = component.get("v.lccStaticResPath");
        let lccSrc = $A.get('$Resource.'+lccStaticResName) + lccStaticResPath;
        component.set("v.lccSrc", lccSrc);
    },

    startTriage: function(component, event, helper) {
        component.set("v.showModal", true);
        component.set("v.isSpinning", true);
    },

    hideMe: function(component, event, helper) {
        // forcing reload to prevent TXC Component start issues.
        window.location.reload();
    },
})