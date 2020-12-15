public with sharing class TXCController {
    public TXCController() {

    }

    @AuraEnabled(cacheable=true)
    public static StartObjWrap getTriage(String recordId) {
        system.debug('getTriage recordId: '+recordId);
        StartObjWrap startObj;
        List<Triage__c> triList = [SELECT Id, Name, Pulse__c, Gender__c FROM Triage__c WHERE Id = 'a1F3S0000004CFzUAM' LIMIT 1];

        if (!triList.isEmpty()) {
            Triage__c tri = triList[0];
            startObj = new StartObjWrap(tri.Pulse__c, tri.Gender__c);

        }
        system.debug('startObj: '+startObj);
        return startObj;
    }

    public class StartObjWrap {
        @AuraEnabled
        public Decimal pulse {get; set;}
        @AuraEnabled
        public String gender {get; set;}

        //This is the contructor method. When we create a new wrapAccount object we pass a Account that is set to the acc property. We also set the selected value to false
        public StartObjWrap(Decimal pulse, String gender) {
            this.pulse = pulse;
            this.gender = gender;
        }
    }
}
