public with sharing class TXCController {

    @AuraEnabled(cacheable=true)
    public static triageVitalsObj getVitalsObj(Triage__c tri) {

        triageVitalsObj startObj = new triageVitalsObj(tri.Gender__c, tri.Date_of_Birth__c, tri.Height__c, tri.Weight__c, tri.Systolic_Blood_Pressure__c, tri.Diastolic_Blood_Pressure__c, tri.Temperature__c, tri.Serum_Glucose__c, tri.Respiratory_Rate__c, tri.Pulse_Oximetry__c, tri.Pulse__c);
        return startObj;
    }

    public class triageVitalsObj {
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

        public triageVitalsObj(String gender, Date date_of_Birth, String height, Decimal weight, Decimal systolic_Blood_Pressure, Decimal diastolic_Blood_Pressure, Decimal temperature, Decimal serum_Glucose, Decimal respiratory_Rate, Decimal pulse_Oximetry, Decimal pulse) {
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

    @AuraEnabled
    public static void updateTriageRecord (Triage__c triageRecord, String note) {

        triageRecord.Triage_Status__c = 'TXC Complete';
        triageRecord.TXC_Results__c = note;

        update triageRecord;
    }
}
