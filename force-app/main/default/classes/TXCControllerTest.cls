@isTest public with sharing class TXCControllerTest {

    @testSetup static void setup() {

        // create Triage record
        Triage__c tri = new Triage__c(
            Gender__c           = 'Male',
            Date_of_Birth__c    = System.today()-(365*25)
        );
        insert tri;
    }

    @isTest
    public static void getVitalsObjTest() {

        Triage__c[] triList = [SELECT Id, Gender__c, Date_of_Birth__c, Height__c, Weight__c, Systolic_Blood_Pressure__c, Diastolic_Blood_Pressure__c,
                                    Temperature__c, Serum_Glucose__c, Respiratory_Rate__c, Pulse_Oximetry__c, Pulse__c, Triage_Status__c
                                    FROM Triage__c LIMIT 1];
        if (!triList.isEmpty()) {
            TXCController.triageVitalsObj obj = TXCController.getVitalsObj(triList[0]);
            System.assert(obj != null);
        }
    }

    @isTest
    public static void updateTriageRecordTest() {

        Triage__c[] triList = [SELECT Id FROM Triage__c LIMIT 1];
        if (!triList.isEmpty()) {
            String nurseNote = 'Nurse note';
            TXCController.updateTriageRecord(triList[0], nurseNote);
            // System.assertEquals('TXC Complete', tri.Triage_Status__c);
            // System.assertEquals(nurseNote, tri.Nurse_Notes__c);
        }
    }
}
