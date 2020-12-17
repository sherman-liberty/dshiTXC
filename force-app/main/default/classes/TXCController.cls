public with sharing class TXCController {

    @AuraEnabled(cacheable=true)
    public static TriageObjWrap getTriage(String recordId) {
        system.debug('getTriage recordId: '+recordId);
        // recordId = 'a1F3S0000004CFzUAM';
        TriageObjWrap startObj;
        List<Triage__c> triList = [SELECT Id, Gender__c, Date_of_Birth__c, Height__c, Weight__c, Systolic_Blood_Pressure__c, Diastolic_Blood_Pressure__c,
                                    Temperature__c, Serum_Glucose__c, Respiratory_Rate__c, Pulse_Oximetry__c, Pulse__c
                                    FROM Triage__c WHERE Id = :recordId LIMIT 1];

        if (!triList.isEmpty()) {
            Triage__c tri = triList[0];
            startObj = new TriageObjWrap(tri.Gender__c, tri.Date_of_Birth__c, tri.Height__c, tri.Weight__c, tri.Systolic_Blood_Pressure__c, tri.Diastolic_Blood_Pressure__c, tri.Temperature__c, tri.Serum_Glucose__c, tri.Respiratory_Rate__c, tri.Pulse_Oximetry__c, tri.Pulse__c);

            // tri.Gender__c, tri.Date_of_Birth__c, tri.Height__c, tri.Weight__c, tri.Systolic_Blood_Pressure__c, tri.Diastolic_Blood_Pressure__c, tri.Temperature__c, tri.Serum_Glucose__c, tri.Respiratory_Rate__c, tri.Pulse_Oximetry__c, tri.Pulse__c

            // Gender__c, Date_of_Birth__c, Height__c, Weight__c, Systolic_Blood_Pressure__c, Diastolic_Blood_Pressure__c, Temperature__c, Serum_Glucose__c, Respiratory_Rate__c, Pulse_Oximetry__c, Pulse__c

            // Gender__c
            // Date_of_Birth__c
            // Height__c
            // Weight__c
            // Systolic_Blood_Pressure__c
            // Diastolic_Blood_Pressure__c
            // Temperature__c
            // Serum_Glucose__c
            // Respiratory_Rate__c
            // Pulse_Oximetry__c
            // Pulse__c

            // String gender, String date_of_Birth, String height, String weight, String systolic_Blood_Pressure, String diastolic_Blood_Pressure, String temperature, String serum_Glucose, String respiratory_Rate, String pulse_Oximetry, String pulse
        }
        system.debug('startObj: '+startObj);
        return startObj;
    }

    public class TriageObjWrap {
        @AuraEnabled
        public String gender {get; set;}
        @AuraEnabled
        public Date date_of_Birth {get; set;}
        @AuraEnabled
        public String height {get; set;}
        @AuraEnabled
        public Decimal weight {get; set;}
        @AuraEnabled
        public Decimal systolic_Blood_Pressure {get; set;}
        @AuraEnabled
        public Decimal diastolic_Blood_Pressure {get; set;}
        @AuraEnabled
        public Decimal temperature {get; set;}
        @AuraEnabled
        public Decimal serum_Glucose {get; set;}
        @AuraEnabled
        public Decimal respiratory_Rate {get; set;}
        @AuraEnabled
        public Decimal pulse_Oximetry {get; set;}
        @AuraEnabled
        public Decimal pulse {get; set;}

        public TriageObjWrap(String gender, Date date_of_Birth, String height, Decimal weight, Decimal systolic_Blood_Pressure, Decimal diastolic_Blood_Pressure, Decimal temperature, Decimal serum_Glucose, Decimal respiratory_Rate, Decimal pulse_Oximetry, Decimal pulse) {
            this.gender = gender;
            this.date_of_Birth = date_of_Birth;
            this.height = height;
            this.weight = weight;
            this.systolic_Blood_Pressure = systolic_Blood_Pressure;
            this.diastolic_Blood_Pressure = diastolic_Blood_Pressure;
            this.temperature = temperature;
            this.serum_Glucose = serum_Glucose;
            this.respiratory_Rate = respiratory_Rate;
            this.pulse_Oximetry = pulse_Oximetry;
            this.pulse = pulse;
        }
    }
}
