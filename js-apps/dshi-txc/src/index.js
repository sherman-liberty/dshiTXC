import LCC from 'lightning-container';

window.addEventListener('load', (event) => {
    let customElementRegistry = window.customElements;
    customElementRegistry.define("dshi-txl", dshiTXL);
	customElementRegistry.define("dshi-txc", dshiTXC);

	LCC.sendMessage({ name:"startIt", value: "start it up!" });
});

// Register for messages sent by hosting component
LCC.addMessageHandler(function(message) {

	if (message.name == 'Vitals') {
		let triObj = message.value;
		let startObject = new Object();

		// required fields
		startObject['gender'] = (triObj.gender == 'Male' || triObj.gender == 'M') ? 'M' : (triObj.gender == 'Female' || triObj.gender == 'F') ? 'F' : undefined;
		startObject['dob'] = new Date(triObj.date_of_Birth);
		// vitals
		objBuilder(startObject, 'height',triObj.height);
		objBuilder(startObject, 'weight',triObj.weight);
		objBuilder(startObject, 'systolicBloodPressure',triObj.systolic_Blood_Pressure);
		objBuilder(startObject, 'diastolicBloodPressure',triObj.diastolic_Blood_Pressure);
		objBuilder(startObject, 'temperature',triObj.temperature);
		objBuilder(startObject, 'serumGlucose',triObj.serum_Glucose);
		objBuilder(startObject, 'respiratoryRate',triObj.respiratory_Rate);
		objBuilder(startObject, 'o2',triObj.pulse_Oximetry);
		objBuilder(startObject, 'pulse',triObj.pulse);

		let x = document.getElementById("txc");
		x.start(startObject);
	}
});

function objBuilder(obj, field, val) {
	// TODO what about using if(val) {} ... test against various null/empty values
	if (val == undefined) {
		return obj;
	} else {
		obj[field] = val;
		return obj;
	}
};

document.getElementById("txc").addEventListener("complete", function(event) {
	let dispositionObject = event.detail;
	LCC.sendMessage({ name:"completeIt", value: dispositionObject });
});

document.getElementById('txc').addEventListener("abort", function (event) {
	console.log('it has been aborted');
});

document.getElementById('txc').addEventListener("error", function(event) {
    var errorMsg = event.detail;
    console.log('there has been an error: '+errorMsg);
});

class dshiTXC extends HTMLElement {
	constructor() {
		var dobMin, dobMax, lnmpMin, lnmpMax;

		super();
		if (typeof String.prototype.startsWith != 'function') {
			String.prototype.startsWith = function(str) {
				return this.slice(0, str.length).toLowerCase() == str.toLowerCase();
			};
		}
		let shadowDom = this.attachShadow({
			mode: 'open'
		});
		let template = document.createElement('template');
		template.innerHTML = this.controlTemplate();
		let templateHTML = template.content;
		shadowDom.appendChild(templateHTML);
		setTimeout(this.setupWidget.bind(this), 0);
		this.requiredProperties = ['dob', 'g'];
		this.requiredPropertiesInstructions = ['dob', 'g'];
		this.valuesAndMeasuresToNote = ['height', 'weight', 'systolicBloodPressure', 'diastolicBloodPressure', 'temperature', 'serumGlucose', 'pefrBaseline', 'pefrCurrent', 'lnmp', 'respiratoryRate', 'pulse', 'gestationalAge', 'bmi', 'peakFlowPctBest', 'painscale', 'durationOfComplaint_rem', 'o2', 'meanArterialPressure', 'pulsePressure', 'modifiedShockIndex'];
		this.valuesAndMeasuresToNoteSupplmental = {
			'modifiedShockIndex': '(> 0.93 associated with greater risk in setting of shock or STEMI)'
		};
		this.valuesAndMeasuresToShow = ['height', 'weight', 'systolicbloodpressure', 'diastolicbloodpressure', 'temperature', 'serumglucose', 'pefrbaseline', 'pefrcurrent', 'lnmp', 'respiratoryrate', 'pulse', 'gestationalage', 'bmi', 'peakflowpctbest', 'painscale', 'durationofcomplaint', 'Ox', 'meanarterialpressure', 'pulsepressure', 'modifiedshockindex'];
		this.valuesAndMeasuresTitles = ['Height', 'Weight', 'SBP', 'DBP', 'Temperature', 'Serum glucose', 'PEFR Best', 'PEFR Current', 'LNMP', 'Respiratory Rate', 'Pulse', 'Gestational age', 'BMI', 'PEFR Percent Best', 'Painscale', 'Duration of CC', 'O2 Sat', 'MAP', 'PP', 'MSI'];
		this.valuesAndMeasuresTitlesNote = ['Height', 'Weight', 'SBP', 'DBP', 'Temperature', 'Serum glucose', 'PEFR Best', 'PEFR Current', 'LNMP', 'Respiratory Rate', 'Pulse', 'Gestational age', 'BMI', 'PEFR Percent Best', 'Painscale', 'Duration of CC', 'O2 Sat', 'Mean Arterial Pressure', 'Pulse Pressure', 'Modified Shock Index'];
		this.valuesAndMeasuresUnits = {
			'Ox': '%',
			'diseaseControlScore': '%',
			'patientEffortScore': '%',
		};
		this.valuesAndMeasuresToNoteCM = ['diseaseControlScore', 'patientEffortScore', 'symptomControl', 'height', 'weight', 'systolicBloodPressure', 'diastolicBloodPressure', 'temperature', 'serumGlucose', 'pefrBaseline', 'pefrCurrent', 'lnmp', 'respiratoryRate', 'pulse', 'gestationalAge', 'bmi', 'peakFlowPctBest', 'painscale', 'durationofcomplaint', 'o2', 'meanArterialPressure', 'pulsePressure', 'modifiedShockIndex'];
		this.valuesAndMeasuresTitlesNoteCM = ['Disease Control Score', 'Patient Effort Score', 'Symptom Control Score', 'Height', 'Weight', 'SBP', 'DBP', 'Temperature', 'Serum glucose', 'PEFR Best', 'PEFR Current', 'LNMP', 'Respiratory Rate', 'Pulse', 'Gestational age', 'BMI', 'PEFR Percent Best', 'Painscale', 'Duration of CC', 'O2 Sat', 'Mean Arterial Pressure', 'Pulse Pressure', 'Modified Shock Index'];
		this.demographicsToShow = ['cc', 'gender', 'age', 'dob'];
		this.demographicsTitles = ['CC', 'Gender', 'Age', 'Born'];
		this.skipProperties = ['value', 'units', 'type'];
		dobMin = new Date();
		dobMax = new Date(dobMin);
		dobMin.setFullYear(dobMin.getFullYear() - 120);
		dobMax.setFullYear(dobMax.getFullYear() - 16);
		lnmpMin = new Date();
		lnmpMax = new Date(lnmpMin);
		lnmpMin.setFullYear(lnmpMin.getFullYear() - 1);
		this.startProperties = {
			"gender": {
				"type": "string",
				"name": "g",
				"values": ["M", "F"]
			},
			"dob": {
				"type": "date",
				"name": "dob",
				"min": dobMin,
				"max": dobMax
			},
			"cc": {
				"type": "string",
				"name": "c"
			},
			"height": {
				"type": "string",
				"name": "h",
				"min": "4'0\"",
				"max": "7'4\"",
				"units": "Feet/Inches"
			},
			"weight": {
				"type": "number",
				"name": "w",
				"min": 60,
				"max": 600,
				"units": "Lbs"
			},
			"systolicBloodPressure": {
				"type": "number",
				"name": "s",
				"min": 70,
				"max": 250
			},
			"diastolicBloodPressure": {
				"type": "number",
				"name": "d",
				"min": 50,
				"max": 140
			},
			"temperature": {
				"type": "number",
				"name": "t",
				"min": 95.0,
				"max": 105.7,
				"units": "F"
			},
			"serumGlucose": {
				"type": "number",
				"name": "gl",
				"min": 20,
				"max": 600
			},
			"pefrBaseline": {
				"type": "number",
				"min": 50,
				"max": 600
			},
			"pefrCurrent": {
				"type": "number",
				"min": 50,
				"max": 600
			},
			"lnmp": {
				"type": "date",
				"name": "ln",
				"min": lnmpMin,
				"max": lnmpMax
			},
			"respiratoryRate": {
				"type": "number",
				"name": "r",
				"min": 10,
				"max": 80
			},
			"o2": {
				"type": "number",
				"name": "o",
				"min": 70,
				"max": 100
			},
			"pulse": {
				"type": "number",
				"name": "p",
				"min": 40,
				"max": 220
			},
			"durationofchiefcomplaint": {
				"type": "number",
				"name": "103",
				"min": 1,
				"max": 100
			}
		};
	}
	start(startData) {
		return this.doStart.bind(this)(startData);
	}
	abort() {
		return this.doAbort();
	}
	parseValue(value, unitsArray, defaultUnits) {
		var results;
		var firstChar = value.charAt(0);
		var regexGroups = value.match(/(\d*\.?\d+)\s+(.*)/);
		if (firstChar >= '0' && firstChar <= '9') {
			if (regexGroups.length < 1) {
				return null;
			}
			if (regexGroups.length > 2) {
				return null;
			}
			if (!regexGroups[1] && defaultUnits) {
				results = {};
				results.value = regexGroups[0];
				results.units = defaultUnits;
				return results;
			} else {
				if (!unitsArray.contains(regexGroups[1])) {
					return null;
				}
			}
			results = {};
			results.value = regexGroups[0];
			results.units = regexGroups[1];
		}
	}
	doAbort(event) {
		var e;
		event.cancelBubble = true;
		var cAbort = confirm("Pressing OK will abort (cancel) the session; any collected information or results will be lost.\n\n Do you wish to abort?");
		if (cAbort) {
			this.doResetComponent();
			e = new CustomEvent('abort', {
				detail: 'Aborted'
			});
			this.dispatchEvent(e);
			event.preventDefault();
			return;
		}
		event.preventDefault();
	}
	instructions(values) {
		var val, sI, e, i, propertyName;
		var startObject = {};
		this.ec.doneInstructionsLink.style.display = 'inline';
		for (propertyName in values) {
			if (values.hasOwnProperty(propertyName) && this.startProperties.hasOwnProperty(propertyName)) {
				val = values[propertyName];
				sI = this.startProperties[propertyName];
				if (sI.type === 'number') {
					if (typeof val != sI.type) {
						e = new CustomEvent('error', {
							detail: 'Expected ' + sI.type + ' found ' + (typeof val) + ': ' + propertyName
						});
						this.dispatchEvent(e);
						return;
					}
					if (sI.min && sI.max) {
						if ((val < sI.min) || (val > sI.max)) {
							e = new CustomEvent('error', {
								detail: propertyName + ' must be from ' + sI.min + ' to ' + sI.max + ': ' + val
							});
							this.dispatchEvent(e);
							return;
						}
					}
				} else if (sI.type == 'string') {
					if (typeof val != sI.type) {
						e = new CustomEvent('error', {
							detail: 'Expected ' + sI.type + ' found ' + (typeof val) + ': ' + propertyName
						});
						this.dispatchEvent(e);
						return;
					}
					if ((sI.values) && (sI.values.indexOf(val) < 0)) {
						e = new CustomEvent('error', {
							detail: propertyName + ' value is invalid should be one of [' + sI.values.join(',') + ']: ' + val
						});
						this.dispatchEvent(e);
						return;
					}
				} else if (sI.type == 'date') {
					if (typeof val.getMonth != 'function') {
						e = new CustomEvent('error', {
							detail: 'Expected ' + sI.type + ' found ' + (typeof val) + ': ' + propertyName
						});
						this.dispatchEvent(e);
						return;
					}
					if (sI.min && sI.max) {
						if ((val < sI.min) || (val > sI.max)) {
							e = new CustomEvent('error', {
								detail: propertyName + ' must be from ' + sI.min + ' to ' + sI.max + ': ' + val
							});
							this.dispatchEvent(e);
							return;
						}
					}
				}
				if (sI.units) {
					startObject[sI.name] = val + ' ' + sI.units;
				} else {
					startObject[sI.name] = val;
				}
			}
		}
		for (i = 0; i < this.requiredPropertiesInstructions.length; i++) {
			propertyName = this.requiredPropertiesInstructions[i];
			if (!startObject[propertyName]) {
				e = new CustomEvent('error', {
					detail: 'Missing required instruction property: ' + propertyName
				});
				this.dispatchEvent(e);
				return;
			}
		}
		if (startObject.hasOwnProperty('ln') && (startObject.g != 'F')) {
			e = new CustomEvent('error', {
				detail: 'LNMP is only valid for Females'
			});
			this.dispatchEvent(e);
			return;
		}
		this.values = startObject;
		this.dob = this.values.dob;
		this.gender = this.values.g;
		this.age = this.calculateAgeYM(this.dob);
		this.ageRange = this.getAgeRange(this.age);
		this.startTime = new Date();
		this.ec.qAndA.disabled = true;
		this.ec.qAndA.style.opacity = 0.25;
		this.ec.library.disabled = false;
		this.ec.library.style.opacity = 1.0;
		this.ec.results.disabled = true;
		this.ec.results.style.opacity = 0.25;
		this.openTab.bind(this)(null, 'instructions');
	}
	doStart(values) {
		var val, sI, e, i, propertyName;
		var startObject = {};
		this.ec.doneInstructionsLink.style.display = 'none';
		for (propertyName in values) {
			if (values.hasOwnProperty(propertyName) && this.startProperties.hasOwnProperty(propertyName)) {
				val = values[propertyName];
				sI = this.startProperties[propertyName];
				if (sI.type === 'number') {
					if (typeof val != sI.type) {
						e = new CustomEvent('error', {
							detail: 'Expected ' + sI.type + ' found ' + (typeof val) + ': ' + propertyName
						});
						this.dispatchEvent(e);
						return;
					}
					if (sI.min && sI.max) {
						if ((val < sI.min) || (val > sI.max)) {
							e = new CustomEvent('error', {
								detail: propertyName + ' must be from ' + sI.min + ' to ' + sI.max + ': ' + val
							});
							this.dispatchEvent(e);
							return;
						}
					}
				} else if (sI.type == 'string') {
					if (typeof val != sI.type) {
						e = new CustomEvent('error', {
							detail: 'Expected ' + sI.type + ' found ' + (typeof val) + ': ' + propertyName
						});
						this.dispatchEvent(e);
						return;
					}
					if ((sI.values) && (sI.values.indexOf(val) < 0)) {
						e = new CustomEvent('error', {
							detail: propertyName + ' value is invalid should be one of [' + sI.values.join(',') + ']: ' + val
						});
						this.dispatchEvent(e);
						return;
					}
				} else if (sI.type == 'date') {
					if (typeof val.getMonth != 'function') {
						e = new CustomEvent('error', {
							detail: 'Expected ' + sI.type + ' found ' + (typeof val) + ': ' + propertyName
						});
						this.dispatchEvent(e);
						return;
					}
					if (sI.min && sI.max) {
						if ((val < sI.min) || (val > sI.max)) {
							e = new CustomEvent('error', {
								detail: propertyName + ' must be from ' + sI.min + ' to ' + sI.max + ': ' + val
							});
							this.dispatchEvent(e);
							return;
						}
					}
				}
				if (sI.units) {
					startObject[sI.name] = val + ' ' + sI.units;
				} else {
					startObject[sI.name] = val;
				}
			}
		}
		for (i = 0; i < this.requiredProperties.length; i++) {
			propertyName = this.requiredProperties[i];
			if (!startObject[propertyName]) {
				e = new CustomEvent('error', {
					detail: 'Missing required start property: ' + propertyName
				});
				this.dispatchEvent(e);
				return;
			}
		}
		if (startObject.hasOwnProperty('ln') && (startObject.g != 'F')) {
			e = new CustomEvent('error', {
				detail: 'LNMP is only valid for Females'
			});
			this.dispatchEvent(e);
			return;
		}
		this.values = startObject;
		this.dob = this.values.dob;
		this.gender = this.values.g;
		this.age = this.calculateAgeYM(this.dob);
		this.ageRange = this.getAgeRange(this.age);
		this.startTime = new Date();
		if (this.values.c) {
			this.ec.mmContent.style.display = 'none';
			this.cc = this.values.c;
			delete this.values.g;
			delete this.values.dob;
			delete this.values.c;
			delete this.values.starttime;
			this.tXe.start(this.cc, this.dob, this.gender, this.values);
			this.ec.qAndA.disabled = false;
			this.ec.qAndA.style.opacity = 1;
			this.ec.library.disabled = true;
			this.ec.library.style.opacity = 0.25;
			this.ec.results.disabled = false;
			this.ec.results.style.opacity = 1;
			return;
		}
		this.ec.mmInput.style.display = 'inherit';
		this.ec.qAndA.disabled = false;
		this.ec.qAndA.style.opacity = 1;
		this.ec.library.disabled = true;
		this.ec.library.style.opacity = 0.25;
		this.ec.results.disabled = false;
		this.ec.results.style.opacity = 1.0;
	}
	calculateAgeYM(dob) {
		var date;
		if (typeof dob === 'string') date = new Date(dob);
		else if (typeof dob.getMonth === 'function') date = dob;
		else throw new Error('Invalid type for date variable passed to calculateAge');
		var today = new Date();
		var months;
		months = (today.getFullYear() - date.getFullYear()) * 12;
		months += today.getMonth();
		months -= date.getMonth();
		months = (months > 0) ? months : 1;
		if (months < 36) {
			return months + ' Months';
		}
		var years = Math.floor(months / 12);
		return years + ' Years';
	}
	startWithMatch(text, searchString) {
		return (text.toLowerCase().startsWith(searchString.toLowerCase()));
	}
	handleOpenTab(e) {
		this.openTab.bind(this)(event, e.target.id);
	}
	setupWidget() {
		this.ec = {};
		this.ec.controlContainer = this.shadowRoot.getElementById('controlContainer');
		this.ec.controlContainer.addEventListener('click', this.onCtlCtrClick.bind(this));
		this.ec.mmInput = this.shadowRoot.getElementById('mmInput');
		this.ec.mmInput.addEventListener('input', this.mmChange.bind(this));
		this.ec.mmList = this.shadowRoot.getElementById('mmList');
		this.ec.warningContent = this.shadowRoot.getElementById('warningContent');
		this.ec.closenotebtn = this.shadowRoot.getElementById('closenotebtn');
		this.ec.closenotebtn.addEventListener('click', this.doViewResults.bind(this));
		this.ec.notedonebtn = this.shadowRoot.getElementById('notedonebtn');
		this.ec.notedonebtn.addEventListener('click', this.doNoteDone.bind(this));
		this.ec.resultsabortbtn = this.shadowRoot.getElementById('resultsabortbtn');
		this.ec.resultsabortbtn.addEventListener('click', this.doAbort.bind(this));
		this.ec.noteabortbtn = this.shadowRoot.getElementById('noteabortbtn');
		this.ec.noteabortbtn.addEventListener('click', this.doAbort.bind(this));
		this.ec.educationLog = this.shadowRoot.getElementById('educationlog');
		this.tXe = new tXengine({
			'appId': 'cmgplus',
			'url': 'https://expert-test.dshisystems.net/txnet20wse/'
		}, this);
		this.tXe.addListener('atQuestion', this.tXeAtQuestion.bind(this));
		this.tXe.addListener('atDataPoint', this.tXeAtDataPoint.bind(this));
		this.tXe.addListener('atReport', this.tXeAtReport.bind(this));
		this.tXe.addListener('onError', this.tXeOnError.bind(this));
		this.ec.qanextbtn = this.shadowRoot.getElementById('qanextbtn');
		this.ec.qanextbtn.addEventListener('click', this.doNext.bind(this));
		this.ec.qayesbtn = this.shadowRoot.getElementById('qayesbtn');
		this.ec.qayesbtn.addEventListener('click', this.doYes.bind(this));
		this.ec.qanobtn = this.shadowRoot.getElementById('qanobtn');
		this.ec.qanobtn.addEventListener('click', this.doNo.bind(this));
		this.ec.qabackbtn = this.shadowRoot.getElementById('qabackbtn');
		this.ec.qabackbtn.addEventListener('click', this.doBack.bind(this));
		this.ec.demobtn = this.shadowRoot.getElementById('demobtn');
		this.ec.demobtn.addEventListener("click", this.demoClick.bind(this));
		this.ec.valuebtn = this.shadowRoot.getElementById('valuebtn');
		this.ec.valuebtn.addEventListener("click", this.demoClick.bind(this));
		this.ec.findingsbtn = this.shadowRoot.getElementById('findingsbtn');
		this.ec.findingsbtn.addEventListener("click", this.demoClick.bind(this));
		this.ec.notebtn = this.shadowRoot.getElementById('notebtn');
		this.ec.notebtn.addEventListener("click", this.doNote.bind(this));
		this.ec.qAndA = this.shadowRoot.getElementById('qAndA');
		this.ec.qAndA.addEventListener("click", this.handleOpenTab.bind(this));
		this.ec.library = this.shadowRoot.getElementById('instructions');
		this.ec.library.addEventListener("click", this.handleOpenTab.bind(this));
		this.ec.results = this.shadowRoot.getElementById('results');
		this.ec.results.addEventListener("click", this.handleOpenTab.bind(this));
		this.shadowRoot.onclick = function() {
			var ddt = this.shadowRoot.querySelector('.ddtable');
			if (ddt) {
				for (var i = 0; i < ddt.length; i++) {
					ddt[i].style.display = 'none';
				}
			}
		};
		this.ec.notebody = this.shadowRoot.getElementById('notebody');
		//        autosize(this.ec.notebody);
		this.ec.educationlog = this.shadowRoot.getElementById('educationlog');
		//        autosize(this.ec.educationlog);
		this.ec.qaControlPanel = this.shadowRoot.getElementById('qaContentPanel');
		this.ec.rsltContent = this.shadowRoot.getElementById('rsltContent');
		this.ec.libraryContentPanel = this.shadowRoot.getElementById('libraryContentPanel');
		this.ec.qasessiondatalist = this.shadowRoot.getElementById('qasessiondatalist');
		this.ec.findingsdatalist = this.shadowRoot.getElementById('findingsdatalist');
		this.ec.valuedatalist = this.shadowRoot.getElementById('valuedatalist');
		this.ec.democontainer = this.shadowRoot.getElementById('democontainer');
		this.ec.findingscontainer = this.shadowRoot.getElementById('findingscontainer');
		this.ec.valuecontainer = this.shadowRoot.getElementById('valuecontainer');
		this.ec.mmContent = this.shadowRoot.getElementById('mmContent');
		this.ec.library = this.shadowRoot.getElementById('instructions');
		this.ec.rsltwhere = this.shadowRoot.getElementById('rsltwhere');
		this.ec.rsltwhen = this.shadowRoot.getElementById('rsltwhen');
		this.ec.piinclude = this.shadowRoot.getElementById('piinclude');
		this.ec.sessionResults = this.shadowRoot.getElementById('sessionResults');
		this.ec.sessionNote = this.shadowRoot.getElementById('sessionNote');
		this.ec.piinformation = this.shadowRoot.getElementById('piinformation');
		this.ec.sysconcern = this.shadowRoot.getElementById('sysconcern');
		this.ec.sysconcerncontainer = this.shadowRoot.getElementById('sysconcerncontainer');
		this.ec.predicteresourcescontainer = this.shadowRoot.getElementById('predicteresourcescontainer');
		this.ec.piList = this.shadowRoot.getElementById('piList');
		this.ec.picontainer = this.shadowRoot.getElementById('picontainer');
		this.ec.qAndA = this.shadowRoot.getElementById('qAndA');
		this.ec.qaContent = this.shadowRoot.getElementById('qaContent');
		this.ec.notebtn = this.shadowRoot.getElementById('notebtn');
		this.ec.cvc = this.shadowRoot.getElementById('cvc');
		this.ec.piclcontainer = this.shadowRoot.getElementById('piclcontainer');
		this.ec.picltable = this.shadowRoot.getElementById('picltable');
		this.ec.qadatapoint = this.shadowRoot.getElementById('qadatapoint');
		this.ec.qaNumeric = this.shadowRoot.getElementById('qaNumeric');
		this.ec.qaNumber = this.shadowRoot.getElementById('qaNumber');
		this.ec.qaNumericList = this.shadowRoot.getElementById(this.ec.qaNumber.getAttribute('list'));
		this.ec.qaNumber.addEventListener('keypress', this.onNumberKeypress.bind(this));
		this.ec.qaList = this.shadowRoot.getElementById('qaList');
		this.ec.qaSelect = this.shadowRoot.getElementById('qaSelect');
		this.ec.qaSelectInput = this.shadowRoot.getElementById('qaSelectInput');
		this.ec.qaListInput = this.shadowRoot.getElementById('qaListInput');
		this.ec.qaListList = this.shadowRoot.getElementById(this.ec.qaListInput.getAttribute('list'));
		this.ec.qaListInput.addEventListener('keypress', this.onHeightKeypress.bind(this));
		this.ec.qaDate = this.shadowRoot.getElementById('qaDate');
		this.ec.qaDateInput = this.shadowRoot.getElementById('qaDateInput');
		this.ec.qaDateInput.addEventListener('keypress', this.onDateKeypress.bind(this));
		this.ec.qaDateList = this.shadowRoot.getElementById(this.ec.qaDateInput.getAttribute('list'));
		this.ec.qaUnitSelection = this.shadowRoot.getElementById('qaUnitSelection');
		this.ec.qaUnitSelection.addEventListener('change', this.onUnitSelectionChange.bind(this));
		this.ec.qaUnitText = this.shadowRoot.getElementById('qaUnitText');
		this.ec.qaUnits = this.shadowRoot.getElementById('qaUnits');
		this.ec.qareasoning = this.shadowRoot.getElementById('qareasoning');
		this.ec.qaprompt = this.shadowRoot.getElementById('qaprompt');
		this.ec.qaassisttext = this.shadowRoot.getElementById('qaassisttext');
		this.ec.qapositivehdr = this.shadowRoot.getElementById('qapositivehdr');
		this.ec.qaPositiveFindings = this.shadowRoot.getElementById('qaPositiveFindings');
		this.ec.qanegativehdr = this.shadowRoot.getElementById('qanegativehdr');
		this.ec.qaNegativeFindings = this.shadowRoot.getElementById('qaNegativeFindings');
		this.ec.qaContentPanel = this.shadowRoot.getElementById('qaContentPanel');
		this.ec.txResultsCM = this.shadowRoot.getElementById('txResultsCM');
		this.ec.txResultsCMEducation = this.shadowRoot.getElementById('txResultsCMEducation');
		this.ec.txResultsCMRecTcVal = this.shadowRoot.getElementById('txResultsCMRecTcVal');
		this.ec.txResultsCMRecVc = this.shadowRoot.getElementById('txResultsCMRecVc');
		this.ec.txResultsCmScs = this.shadowRoot.getElementById('txResultsCMScs');
		this.ec.txResultsCmDcs = this.shadowRoot.getElementById('txResultsCMDcs');
		this.ec.txResultsCmPes = this.shadowRoot.getElementById('txResultsCMPes');
		this.ec.txResultsCmScsValue = this.shadowRoot.getElementById('txResultsCMScsValue');
		this.ec.txResultsCmDcsValue = this.shadowRoot.getElementById('txResultsCMDcsValue');
		this.ec.txResultsCmPesValue = this.shadowRoot.getElementById('txResultsCMPesValue');
		this.ec.txResultsCMEducationTbl = this.shadowRoot.getElementById('txResultsCMEducationTbl');
		this.ec.txResultsCMEcpLink = this.shadowRoot.getElementById('txResultsCMEcpLink');
		this.ec.txResultsCMEcp = this.shadowRoot.getElementById('txResultsCMEcp');
		this.ec.tab = this.shadowRoot.getElementById('tab');
		this.ec.tabContent = this.shadowRoot.getElementById('tabContent');
		this.ec.txResultsSYM = this.shadowRoot.getElementById('txResultsSym');
		this.ec.txResultsSymSysConcern = this.shadowRoot.getElementById('txResultsSymSysConcern');
		this.ec.txResultsSymSysConcernVal = this.shadowRoot.getElementById('txResultsSymSysConcernVal');
		this.ec.txResultsSymPr = this.shadowRoot.getElementById('txResultsSymPr');
		this.ec.txResultsSymPrLst = this.shadowRoot.getElementById('txResultsSymPrLst');
		this.ec.txResultsSymRecTcVal = this.shadowRoot.getElementById('txResultsSymRecTcVal');
		this.ec.txResultsSymRecVc = this.shadowRoot.getElementById('txResultsSymRecVc');
		this.ec.txResultsSymDir = this.shadowRoot.getElementById('txResultsSymDir');
		this.ec.txResultsSymDirLst = this.shadowRoot.getElementById('txResultsSymDirLst');
		this.ec.tctImageThumbs = this.shadowRoot.getElementById('tctImageThumbs');
		this.ec.tctImage = this.shadowRoot.getElementById('tctImage');
		this.ec.tctImagePopup = this.shadowRoot.getElementById('tctImagePopup');
		this.ec.tctImageBack = this.shadowRoot.getElementById('tctImageBack');
		this.ec.tctImageBack.onclick = this.doImageBack.bind(this);
		this.ec.txcRsltsDSHelpPopup = this.shadowRoot.getElementById('txcRsltsDSHelpPopup');
		this.ec.txcRsltsDSHelpBack = this.shadowRoot.getElementById('txcRsltsDSHelpBack');
		this.ec.txcRsltsDSHelpBack.onclick = this.doDSHelpBack.bind(this);
		this.ec.txcRsltsDSHelpShow = this.shadowRoot.getElementById('txcRsltsDSHelpShow');
		this.ec.txcRsltsDSHelpShow.onclick = this.txcRsltsShowDSHelpPop.bind(this);
		this.ec.tctLibraryBack = this.shadowRoot.getElementById('tctLibraryBack');
		this.ec.tctLibraryBack.onclick = this.doLibraryBack.bind(this);
		this.ec.tctLibraryPopup = this.shadowRoot.getElementById('tctLibraryPopup');
		this.ec.instructionList = this.shadowRoot.getElementById('instructionList');
		this.ec.instructionList.addEventListener('click', this.txlInstructionListClick.bind(this));
		this.ec.copyInstructionsLink = this.shadowRoot.getElementById('copyInstructionsLink');
		this.ec.copyInstructionsLink.addEventListener('click', this.txlCopyInstructionsLink.bind(this));
		this.ec.visitInstructionsLink = this.shadowRoot.getElementById('visitInstructionsLink');
		this.ec.visitInstructionsLink.addEventListener('click', this.txlVisitInstructionsLink.bind(this));
		this.ec.doneInstructionsLink = this.shadowRoot.getElementById('doneInstructionsLink');
		this.ec.doneInstructionsLink.addEventListener('click', this.txlDoneInstructionsLink.bind(this));
		this.ec.instructionLinkSection = this.shadowRoot.getElementById('instructionLinkSection');
		this.ec.tctTXL = this.shadowRoot.getElementById('tctTXL');
		this.ec.insTXL = this.shadowRoot.getElementById('insTXL');
		this.ec.insTXL.addEventListener('instructions', this.txlInstructions.bind(this));
		this.ec.insTXL.addEventListener('articleLoading', this.txlArticleLoading.bind(this));
		this.ec.library.disabled = true;
		this.ec.library.style.opacity = 0.25;
		this.ec.qAndA.disabled = true;
		this.ec.qAndA.style.opacity = 0.25;
		this.ec.results.disabled = true;
		this.ec.results.style.opacity = 0.25;
		this.ec.mmInput.style.display = 'none';
		this.vCenter = this.offsetHeight / 2;
		this.hCenter = this.offsetWidth / 2;
		this.setupPopupListener();
	}
	txlDoneInstructionsLink(ev) {
		var e;
		var wTopics = [];
		var ecpLink;
		var ul = this.ec.instructionList;
		for (var liIndex = 0; liIndex < ul.children.length; liIndex++) {
			wTopics.push(ul.children[liIndex].dataset.articleTitle);
		}
		ecpLink = this.generateCoachKey(wTopics, this.age, this.gender, null);
		this.ec.instructionList.innerHTML = '';
		this.ec.instructionLinkSection.style.display = 'none';
		this.ec.insTXL.resetWidget();
		this.doResetComponent.bind(this)();
		e = new CustomEvent('instructions', {
			detail: {
				articles: wTopics,
				link: ecpLink
			}
		});
		this.dispatchEvent(e);
	}
	txlCopyInstructionsLink(ev) {
		var wTopics = [];
		var ecpLink;
		var ul = this.ec.instructionList;
		for (var liIndex = 0; liIndex < ul.children.length; liIndex++) {
			wTopics.push(ul.children[liIndex].dataset.articleTitle + " Home Care Veteran");
		}
		if (wTopics.length > 0) {
			var age = this.age.replace(' Years', '').replace(' Months', '');
			ecpLink = this.generateCoachKey(wTopics, age, this.gender, null);
			var dummy = document.createElement("input");
			document.body.appendChild(dummy);
			dummy.setAttribute("id", "dummy_id");
			document.getElementById("dummy_id").value = ecpLink;
			dummy.select();
			document.execCommand("copy");
			document.body.removeChild(dummy);
			alert('Patient Instructions Link copied to clipboard:\n\n' + ecpLink);
		}
	}
	txlVisitInstructionsLink(ev) {
		var wTopics = [];
		var ecpLink;
		var ul = this.ec.instructionList;
		for (var liIndex = 0; liIndex < ul.children.length; liIndex++) {
			wTopics.push(ul.children[liIndex].dataset.articleTitle + " Home Care Veteran");
		}
		if (wTopics.length > 0) {
			var age = this.age.replace(' Years', '').replace(' Months', '');
			ecpLink = this.generateCoachKey(wTopics, age, this.gender, null);
			window.open(ecpLink, "_blank");
		}
	}
	txlInstructionListClick(ev) {
		if (ev.target && ev.target.matches("li")) {
			this.ec.insTXL.showArticle(ev.target.innerText);
		}
	}
	txlArticleLoading(ev) {
		var rTitle = ev.detail.title.replace('Home Care Veteran');
		var ul = this.ec.instructionList;
		for (var liIndex = 0; liIndex < ul.children.length; liIndex++) {
			if (ul.children[liIndex].innerText == rTitle) {
				this.ec.insTXL.webInstruction(true);
				break;
			}
		}
	}
	txlInstructions(ev) {
		if (ev.detail.checked) {
			var li = document.createElement("li");
			li.appendChild(document.createTextNode(ev.detail.title.replace('Home Care Veteran', 'Home Care')));
			li.dataset.articleId = ev.detail.id;
			li.dataset.articleTitle = ev.detail.title;
			this.ec.instructionList.appendChild(li);
			this.ec.instructionLinkSection.style.display = 'inherit';
		} else {
			var rTitle = ev.detail.title.replace('Home Care Veteran', 'Home Care');
			var ul = this.ec.instructionList;
			for (var liIndex = 0; liIndex < ul.children.length; liIndex++) {
				if (ul.children[liIndex].innerText == rTitle) {
					ul.removeChild(ul.children[liIndex]);
					if (ul.children.length <= 0) {
						this.ec.instructionLinkSection.style.display = 'none';
					}
					break;
				}
			}
		}
	}
	onUnitSelectionChange(ev) {
		var newOption = ev.target.value;
		var inputControl = this.ec.qanextbtn.inputControl;
		inputControl.unit = newOption;
		inputControl.value = this.ec.qaNumber.value;
		var dataPoint = inputControl.dataPoint;
		this.setupDataPoint(dataPoint, newOption);
	}
	onCtlCtrClick(ev) {
		var ddTable = this.ec.controlContainer.getElementsByClassName('ddtable');
		for (var i = 0; i < ddTable.length; i++) {
			ddTable[i].style.display = 'none';
		}
		var doSearchClose = true;
		for (var evpi = 0; evpi < ev.path.length; evpi++) {
			if ((ev.path[evpi].id == 'txSearchHeader') || (ev.path[evpi].id == 'txLibrarySearchBtn')) {
				doSearchClose = false;
				break;
			}
		}
		if (doSearchClose) {
			if (this.ec.insTXL.ec.txLibArticle.style.display == 'block') {
				this.ec.insTXL.ec.txSearchHeader.style.display = 'none';
			}
		}

	}
	demoClick(event) {
		var qasdl;
		if (event.target.id == 'demobtn') {
			qasdl = 'qasessiondatalist';
		} else if (event.target.id == 'valuebtn') {
			qasdl = 'valuedatalist';
		} else if (event.target.id == 'findingsbtn') qasdl = 'findingsdatalist';
		if (this.shadowRoot.getElementById(qasdl).style.display != 'block') {
			var ddt = this.shadowRoot.querySelectorAll('.ddtable');
			if (ddt) {
				for (var i = 0; i < ddt.length; i++) {
					if (ddt[i].id == qasdl) {
						ddt[i].style.display = 'block';
						var newLeft = event.target.offsetLeft - 5;
						var newTop = event.target.offsetTop + event.target.offsetHeight + 5;
						ddt[i].style.left = newLeft + 'px';
						ddt[i].style.top = newTop + 'px';
					} else {
						ddt[i].style.display = 'none';
					}
				}
			}
		} else {
			this.shadowRoot.getElementById(qasdl).style.display = 'none';
		}
		event.stopPropagation();
	}
	rdemoClick(event) {
		var qasdl;
		if (event.target.id == 'rdemobtn') {
			qasdl = 'rsessiondatalist';
		} else if (event.target.id == 'rvaluebtn') {
			qasdl = 'rvaluedatalist';
		} else if (event.target.id == 'rfindingsbtn') qasdl = 'rfindingsdatalist';
		if (this.shadowRoot.getElementById(qasdl).style.display != 'block') {
			var ddt = this.shadowRoot.querySelectorAll('.ddtable');
			if (ddt) {
				for (var i = 0; i < ddt.length; i++) {
					if (ddt[i].id == qasdl) {
						ddt[i].style.display = 'block';
						var newLeft = event.target.offsetLeft - 5;
						var newTop = event.target.offsetTop + event.target.offsetHeight + 5;
						ddt[i].style.left = newLeft + 'px';
						ddt[i].style.top = newTop + 'px';
					} else {
						ddt[i].style.display = 'none';
					}
				}
			}
		} else {
			this.shadowRoot.getElementById(qasdl).style.display = 'none';
		}
		event.stopPropagation();
	}
	isHidden(el) {
		var style = window.getComputedStyle(el);
		return (style.visibility === 'hidden');
	}
	openTab(event, tab) {
		var clickedTab = this.shadowRoot.getElementById(tab);
		if (clickedTab.classList.contains('active')) {
			return;
		}
		if (clickedTab.classList.contains('disabled')) {
			return;
		}
		var activeTab = this.shadowRoot.querySelectorAll(".active")[0];
		activeTab.classList.remove("active");
		this.shadowRoot.getElementById(tab).classList.add("active");
		if (tab == 'qAndA') {
			this.ec.qaContentPanel.style.display = "block";
			this.ec.rsltContent.style.display = "none";
			this.ec.libraryContentPanel.style.display = "none";
		} else if (tab == 'instructions') {
			this.ec.libraryContentPanel.style.display = "block";
			this.ec.qaContentPanel.style.display = "none";
			this.ec.rsltContent.style.display = "none";
		} else if (tab == 'results') {
			this.ec.qaContentPanel.style.display = "none";
			this.ec.rsltContent.style.display = "block";
			this.ec.libraryContentPanel.style.display = "none";
		}
	}
	getAgeRange(age) {
		var ia = parseInt(age);
		if (isNaN(ia)) {
			return 'A';
		}
		if (age.toLowerCase().indexOf(' months') <= 0) {
			ia *= 12;
		}
		if (ia < 30) {
			return 'I';
		}
		if (ia < 204) {
			return 'C';
		}
		return 'A';
	}
	mmChange(event) {
		var iIndex;
		var value = event.target.value;
		var html = "";
		var matchCount;
		this.ec.mmList.innerHTML = html;
		if (value && (value.length >= 1)) {
			var ageGender = this.ageRange + this.gender;
			for (iIndex = 0, matchCount = 0;
				((iIndex < this.sym[ageGender].length) && (matchCount < 10)); iIndex++) {
				if (this.startWithMatch(this.sym[ageGender][iIndex], value)) {
					var vcaIndicator = '';
					if (this.sym.conditions.indexOf(this.sym[ageGender][iIndex]) >= 0) {
						vcaIndicator = "<div style=\"float:right;\" title=\"Condition Management\">\u058E</div>";
					}
					html += "<li class=\"ui-btn ui-ccbtn\" tabindex=\"0\"><div style=\"float:left;\">" + this.sym[ageGender][iIndex] + "</div>" + vcaIndicator + "<div style=\"clear:both;\"></div></li>";
					matchCount++;
				}
			}
		}
		if (html.length > 0) {
			this.ec.mmList.innerHTML = html;
			var mmEntries = this.shadowRoot.querySelectorAll('.ui-ccbtn');
			for (iIndex = 0; iIndex < mmEntries.length; iIndex++) {
				mmEntries[iIndex].onclick = this.ccSelect.bind(this);
			}
			this.ec.mmList.style.display = 'inline-block';
		} else {
			this.ec.mmList.style.display = 'none';
		}
	}
	ccSelect(event) {
		var rsp;
		if ((!this.gender) || (!this.dob)) {
			alert('Gender and DOB are required');
			return;
		}
		this.ec.mmContent.style.display = 'none';
		this.cc = event.currentTarget.childNodes[0].innerText;
		this.dob = this.values.dob;
		this.gender = this.values.g;
		delete this.values.g;
		delete this.values.dob;
		delete this.values.starttime;
		this.ec.library.disabled = true;
		this.ec.library.style.opacity = 0.25;
		this.ec.qAndA.disabled = false;
		this.ec.qAndA.style.opacity = 1.0;
		this.ec.results.disabled = false;
		this.ec.results.style.opacity = 1.0;
		if (this.sym.conditions.indexOf(this.cc) >= 0) {
			rsp = {
				dataPoint: {
					na: {
						type: "Select",
						"list": ["COMPREHENSIVE: Triage Parameters and Disease Parameters", "QUICK: Triage Parameters"]
					},
					value: "Comprehensive: Triage Parameters and Disease Parameters",
					units: "na",
				},
				locationType: "Data Point",
				navigationMethods: ["Next"],
				session: "sess",
				prompt: "Select evaluation type",
				demographics: {
					dob: this.dob,
					age: this.age,
					gender: this.gender
				},
				hint: 'Triage Parameters include Triage Class, Symptom Control Score, and Fitness for Virtual Care.  Disease Parameters include Disease Control Score, Patient Effort Score, Targeted Education, and Targeted Education Online for patient.',
			};
			this.nextState = "StartComp";
			this.tXeAtDataPoint(rsp);
		} else {
			rsp = {
				dataPoint: {
					Minutes: {
						type: "Number",
						min: 1,
						max: 59,
						step: 1.0,
						integral: true
					},
					Hours: {
						type: "Number",
						min: 1,
						max: 23,
						step: 1.0,
						integral: true
					},
					Days: {
						type: "Number",
						min: 1,
						max: 31,
						step: 1.0,
						integral: true
					},
					Weeks: {
						type: "Number",
						min: 1,
						max: 4,
						step: 1.0,
						integral: true
					},
					Months: {
						type: "Number",
						min: 1,
						max: 12,
						step: 1.0,
						integral: true
					},
					name: "durationofchiefcomplaint",
					descriptor: 103,
					units: "Hours",
					unitsList: ["Minutes", "Hours", "Days", "Weeks", "Months"]
				},
				locationType: "Data Point",
				navigationMethods: ["Next"],
				session: "sess",
				prompt: "Select duration of " + this.cc + ":",
				demographics: {
					dob: this.dob,
					age: this.age,
					gender: this.gender
				},
				hint: '',
			};
			this.nextState = "StartDur";
			this.tXeAtDataPoint(rsp);
		}
	}
	isValidDatalistValue(idDataList, inputValue) {
		var selector = "#" + idDataList + " option[value='" + inputValue.replace('\'', '\\\'') + "']";
		var option = this.shadowRoot.querySelector(selector);
		if (option !== null) {
			return option.value.length > 0;
		}
		return false;
	}
	doNext(event) {
		var value, idx, unit;
		if (event.target.inputControl) {
			var icType = event.target.inputControl.dataPoint[event.target.inputControl.dataPoint.units].type;
			if (icType == 'Number') {
				value = event.target.inputControl.value;
				if (!this.isValidDatalistValue('qaNumericList', value)) {
					alert('Number must be between ' + event.target.inputControl.min + ' and ' + event.target.inputControl.max);
					return;
				}
			}
			if (icType == 'Date') {
				value = event.target.inputControl.value;
				if (!this.isValidDatalistValue('qaDateList', value)) {
					alert('Date must be between ' + event.target.inputControl.minDate + ' and ' + event.target.inputControl.maxDate);
					return;
				}
			}
			if (icType == 'List') {
				value = event.target.inputControl.value;
				if (!this.isValidDatalistValue('qaListList', value)) {
					alert('Height must be between ' + event.target.inputControl.minList + ' and ' + event.target.inputControl.maxList);
					return;
				}
			}
			if (icType == 'Select') {
				value = event.target.inputControl.value;
				if (!value) {
					alert('An evaluation type must be selected.');
				}
			}
			if (event.target.inputControl.unit != 'na') {
				unit = event.target.inputControl.unit;
			}
			if (this.nextState == "StartDur") {
				this.nextState = "";
				this.values.durationofchiefcomplaint = {
					value: value + " " + unit
				};
				this.tXe.start(this.cc, this.dob, this.gender, this.values);
				return;
			} else {
				if (this.nextState == "StartComp") {
					this.nextState = "";
					idx = value.indexOf(':');
					if (idx > 0) {
						value = value.substring(0, idx);
					}
					this.values[2210] = {
						value: value
					};
					if (value.toUpperCase() == "COMPREHENSIVE")
						this.comprehensive = true;
					else
						this.comprehensive = false;
					this.isFirstQuestion = true;
					this.tXe.start(this.cc, this.dob, this.gender, this.values);
					return;
				}
			}
		}
		if (this.nextState == "Start") {
			this.nextState = "";
			this.values.durationofchiefcomplaint = value + " " + unit;
			this.tXe.start(this.cc, this.dob, this.gender, this.values);
		} else {
			this.tXe.next(value, unit);
		}
	}
	doNo() {
		this.tXe.no();
	}
	doYes() {
		this.tXe.yes();
	}
	doBack() {
		this.tXe.previous();
	}
	generateInstructionList() {
		var li, title, wid, i, instructions;
		var vtopics = [];
		var wtopics = [];
		var checkedList = this.ec.picltable.querySelectorAll('input:checked');
		for (i = 0; i < checkedList.length; i++) {
			wid = checkedList[i].id;
			if (wid.substr(0, 2) === 'wi') {
				li = wid.replace('wi', 'll');
				title = this.shadowRoot.getElementById(li).innerText;
				wtopics.push(title);
			} else if (wid.substr(0, 2) === 'vi') {
				li = wid.replace('vi', 'll');
				title = this.shadowRoot.getElementById(li).innerText;
				vtopics.push(title);
			}
		}
		instructions = [];
		if (vtopics.length > 0) {
			instructions.verbaltopics = vtopics;
		}
		if (wtopics.length > 0) {
			instructions.webtopics = wtopics;
		}
		return instructions;
	}
	b64encode(number, length) {
		var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var s = '';
		var n = 0;
		for (n = number; n > 0; n >>>= 6) {
			s = _keyStr[n & 0x3F] + s;
		}
		s = 'A'.repeat(length - s.length) + s;
		return s;
	}
	hash(str) {
		var i, l,
			hval = 0x811c9dc5;
		for (i = 0, l = str.length; i < l; i++) {
			hval ^= str.charCodeAt(i);
			hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
		}
		return hval >>> 0;
	}
	generateCoachKey(wtopics, strAge, strGender, strCcid) {
		if (wtopics.length > 0) {
			var age = 0;
			if (strAge)
				age = parseInt(strAge);

			var gender = "";
			if (strGender)
				gender = strGender.substr(0, 1);
			var ccid = -1;
			if (strCcid) ccid = parseInt(strCcid);
			var date = new Date().getTime() / 1000;
			var sDomain = window.location.hostname;
			var k = this.b64encode(date, 6);
			k += this.b64encode(ccid, 6);
			k += this.b64encode(this.hash(sDomain), 6);
			var ag = age + ((gender.toLowerCase() === 'm') ? 128 : 0);
			k += this.b64encode(ag, 2);
			for (var i = 0; i < wtopics.length; i++) {
				k += this.b64encode(this.hash(wtopics[i].toLowerCase().replace(' overview', '')), 6);
			}
			return 'https://vha-pip.dshisystems.net/pi.htm?k=TEA' + k;
		}
		return null;
	}
	doNote(event) {
		var rsp;
		if (!event.target.rsp) {
			rsp = {};
			if (this.values) {
				rsp.values = this.values;
				if (!rsp.values.starttime) {
					rsp.values.starttime = this.startTime;
				}
			} else {
				rsp.values.starttime = this.startTime;
			}
			if (this.demographics) {
				rsp.demographics = this.demographics;
			} else {
				rsp.demographics = {};
				rsp.demographics.age = this.age;
				rsp.demographics.gender = this.gender;
				rsp.demographics.dob = this.dob;
			}
			if (this.positiveFindings) {
				rsp.positiveFindings = this.positiveFindings;
			}
			if (this.negativeFindings) {
				rsp.negativeFindings = this.negativeFindings;
			}
		} else {
			rsp = event.target.rsp;
		}
		var cRsp;
		if (!rsp.isCondition) {
			cRsp = this.generateRspSym(rsp);
		} else {
			cRsp = this.generateRspCondition(rsp);
		}
		this.ec.sessionResults.style.display = 'none';
		var note;
		if (!rsp.isCondition) {
			note = this.generateNoteSym(cRsp);
		} else {
			note = this.generateNoteCondition(cRsp);
		}
		var noteBody = this.ec.notebody;
		noteBody.value = note;
		noteBody.cRsp = cRsp;
		this.ec.sessionNote.style.display = 'block';
		noteBody.style.height = 'auto';
		noteBody.style.height = noteBody.scrollHeight + 'px';
		//        autosize.update(noteBody);

	}
	generateNoteSym(nData) {
		var i, vm, tctList;
		var note = 'Symptom Triage Note\n';
		if (nData.startTime) note += nData.startTime + '\n';
		note += '\nDemographics' + '\n';
		note += '\t' + nData.age.replace('Years', 'y/o').replace('Months', 'm/o') + ' ' + nData.gender + '\n';
		if (nData.cc) {
			note += '\nResults\n';
		}
		if (nData.cc) {
			note += '\tCC: ' + nData.cc;
		}
		if (nData.durationOfComplaint) {
			note += ' | Duration ' + nData.durationOfComplaint;
		}
		if ((nData.cc) || (nData.durationOfComplaint)) {
			note += '\n';
		}
		if (nData.painlevel) {
			note += '\t' + nData.painlevel + '\n';
		}
		if (nData.nurseEsi) {
			note += '\tNurse assigned 5-level Triage Class: ' + nData.nurseEsi;
			if (nData.referToVirtualCare) {
				note += ' | Refer to virtual care';
			}
			note += '\n';
		}
		if (nData.systemEsi) {
			note += '\tSystem suggested 5-level Triage Class: ' + nData.systemEsi;
			if (nData.eTreatable) {
				note += ' | Refer to virtual care';
			}
			note += '\n';
		}
		vm = '';
		for (i = 0; i < this.valuesAndMeasuresToNote.length; i++) {
			var property = this.valuesAndMeasuresToNote[i];
			if (nData.hasOwnProperty(property)) {
				if (property == 'lnmp') vm += '\t' + this.valuesAndMeasuresTitlesNote[i] + ': ' + this.dateToString(nData[property]);
				else
				if (this.valuesAndMeasuresUnits.hasOwnProperty(property))
					vm += '\t' + this.valuesAndMeasuresTitlesNote[i] + ': ' + nData[property] + ' ' + this.valuesAndMeasuresUnits[property];
				else
					vm += '\t' + this.valuesAndMeasuresTitlesNote[i] + ': ' + nData[property];
				if (this.valuesAndMeasuresToNoteSupplmental[property]) {
					vm += ' ' + this.valuesAndMeasuresToNoteSupplmental[property];
				}
				vm += '\n';
			}
		}
		tctList = this.shadowRoot.querySelectorAll('.tctInput');
		if (tctList) {
			for (i = 0; i < tctList.length; i++) {
				if (tctList[i].type == 'radio') {
					if (tctList[i].checked) {
						vm += '\t' + tctList[i].name + ': ' + tctList[i].value + '\n';
					}
				} else if (tctList[i].value !== '') {
					vm += '\t' + tctList[i].name + ': ' + tctList[i].value;
					if (tctList[i].dataset.units) {
						vm += ' ' + tctList[i].dataset.units;
					}
					vm += '\n';
				}
			}
		}
		if (vm.length > 0) {
			note += '\nValues and Measures\n';
			note += vm;
		}
		if ((nData.positiveFindings) && (nData.positiveFindings.length > 0)) {
			note += '\nPositive Responses\n';
			note += '\t' + nData.positiveFindings.join('\n\t') + '\n';
		}
		if ((nData.negativeFindings) && (nData.negativeFindings.length > 0)) {
			note += '\nNegative Responses\n';
			note += '\tDenies: ' + nData.negativeFindings.join('\n\tDenies: ') + '\n';
		}
		if (this.ec.instructionList.children.length > 0) {
			var instructions = '\nProvided instructions:\n';
			var wTopics = [];
			var ul = this.ec.instructionList;
			for (var liIndex = 0; liIndex < ul.children.length; liIndex++) {
				wTopics.push(ul.children[liIndex].dataset.articleTitle);
				instructions += '\t' + ul.children[liIndex].dataset.articleTitle + '\n';
			}
			if (this.ecpLink) {
				instructions += '\n\tLink: ' + this.ecpLink;
			}
			note += instructions;
		}
		return note;
	}
	generateNoteCondition(nData) {
		var vm, i, tctList;
		var note = 'Condition Triage Note\n';
		if (nData.startTime) note += nData.startTime + '\n';
		note += '\nDemographics' + '\n';
		note += '\t' + nData.age.replace('Years', 'y/o').replace('Months', 'm/o') + ' ' + nData.gender + '\n';
		if (nData.cc) {
			note += '\nResults\n';
		}
		if (nData.cc) {
			note += '\tCC: ' + nData.cc;
			if (this.comprehensive) {
				note += ' (Comprehensive)';
			} else {
				note += ' (Quick)';
			}
			note += '\n';
		}
		if (nData.durationofcc) {
			note += '\t' + nData.durationofcc + '\n';
		}
		if (nData.painlevel) {
			note += '\t' + nData.painlevel + '\n';
		}
		if (nData.nurseEsi) {
			note += '\tNurse assigned 5-Level Triage Class: ' + nData.nurseEsi;
			if (nData.referToVirtualCare) {
				note += ' | Refer to virtual care';
			}
			note += '\n';
		}
		if (nData.systemEsi) {
			note += '\tSystem suggested 5-Level Triage Class: ' + nData.systemEsi;
			if (nData.eTreatable) {
				note += ' | Refer to virtual care';
			}
			note += '\n';
		}
		if (nData.patientEffortScore || nData.symptomControl || nData.diseaseControlScore) {
			note += '\nDisease Status\n';
			if (nData.symptomControl) {
				note += '\tSymptom Control Score: ' + nData.symptomControl + ' [1-7 scale | 7 = best control]\n';
			}
			if (this.comprehensive) {
				if (nData.diseaseControlScore) {
					note += '\tDisease Control Score: ' + nData.diseaseControlScore + '% [100% = perfect control]\n';
				}
				if (nData.patientEffortScore) {
					note += '\tPatient Effort Score: ' + nData.patientEffortScore + '% [100% = perfect adherence]\n';
				}
			}
		}
		vm = '';
		for (i = 0; i < this.valuesAndMeasuresToNote.length; i++) {
			var property = this.valuesAndMeasuresToNote[i];
			if (nData.hasOwnProperty(property)) {
				if (property == 'lnmp') vm += '\t' + this.valuesAndMeasuresTitlesNote[i] + ': ' + this.dateToString(nData[property]);
				else
				if (this.valuesAndMeasuresUnits.hasOwnProperty(property))
					vm += '\t' + this.valuesAndMeasuresTitlesNote[i] + ': ' + nData[property] + ' ' + this.valuesAndMeasuresUnits[property];
				else
					vm += '\t' + this.valuesAndMeasuresTitlesNote[i] + ': ' + nData[property];
				if (this.valuesAndMeasuresToNoteSupplmental[property]) {
					vm += ' ' + this.valuesAndMeasuresToNoteSupplmental[property];
				}
				if (this.valuesAndMeasuresToNoteSupplmental[property]) {
					vm += ' ' + this.valuesAndMeasuresToNoteSupplmental[property];
				}
				vm += '\n';
			}
		}
		tctList = this.shadowRoot.querySelectorAll('.tctInput');
		if (tctList) {
			for (i = 0; i < tctList.length; i++) {
				if (tctList[i].type == 'radio') {
					if (tctList[i].checked) {
						vm += '\t' + tctList[i].name + ': ' + tctList[i].value + '\n';
					}
				} else if (tctList[i].value !== '') {
					vm += '\t' + tctList[i].name + ': ' + tctList[i].value;
					if (tctList[i].dataset.units) {
						vm += ' ' + tctList[i].dataset.units;
					}
					vm += '\n';
				}
			}
		}
		if (vm.length > 0) {
			note += '\nValues and Measures\n';
			note += vm;
		}
		if ((nData.positiveFindings) && (nData.positiveFindings.length > 0)) {
			note += '\nFindings That May Require Action\n';
			note += '\t' + nData.positiveFindings.join('\n\t') + '\n';
		}
		if ((nData.negativeFindings) && (nData.negativeFindings.length > 0)) {
			note += '\nNegative Responses\n';
			note += '\tDenies: ' + nData.negativeFindings.join('\n\tDenies: ') + '\n';
		}
		var edLog = this.ec.educationLog.value.replace('\n', '\n\t');
		var verbalEducation = "";
		var checked = this.ec.txResultsCMEducationTbl.querySelectorAll('input:checked');
		for (i = 0; i < checked.length; i++) {
			verbalEducation += '\t' + checked[i].description + "\n\n";
		}
		if ((edLog.length > 0) || (verbalEducation.length > 0)) {
			note += '\nVerbal Education Performed\n';
		}
		if (edLog.length > 0) {
			note += '\t' + edLog + '\n\n';
		}
		if (verbalEducation.length > 0) {
			note += verbalEducation;
		}
		//            var ecpLink;
		//            var wTopics = [];
		//            for (i = 0; i < nData.careLinks.length; i++) {
		//                wTopics.push(nData.careLinks[i].title);
		//            }
		//            if (wTopics.length > 0) {
		//                ecpLink = this.generateCoachKey(wTopics, nData.age, nData.gender, nData.ccid);
		if (this.ecpLink) {
			note += '\nTargeted Education Online\n\t' + this.ecpLink + '\n';
		}
		return note;
	}
	walkNodes(domEntry, text, indent) {
		var i;
		switch (domEntry.nodeName) {
			case '#text':
				text += indent + domEntry.textContent;
				break;
			case 'BR':
				text += '\n';
				break;
			case 'UL':
				indent += '\t';
				for (i = 0; i < domEntry.childNodes.length; i++) text = this.walkNodes(domEntry.childNodes[i], text, indent);
				indent = indent.substr(0, indent.length - 1);
				break;
			case 'DIV':
				for (i = 0; i < domEntry.childNodes.length; i++) text = this.walkNodes(domEntry.childNodes[i], text, indent);
				text += '\n';
				break;
			case 'LI':
				for (i = 0; i < domEntry.childNodes.length; i++) text = this.walkNodes(domEntry.childNodes[i], text, indent);
				text += '\n';
				break;
			default:
				for (i = 0; i < domEntry.childNodes.length; i++) text = this.walkNodes(domEntry.childNodes[i], text, indent);
				break;
		}
		return text;
	}
	getPatientInformationText() {
		var piiHTML = this.ec.piinformation;
		return this.walkNodes(piiHTML, '', '\t\t').replace(/\s+$/, '');
	}
	doViewResults() {
		this.ec.sessionNote.style.display = 'none';
		this.ec.sessionResults.style.display = 'block';
	}
	doResetComponent() {
		var i, tci, opt;
		delete this.cc;
		delete this.dob;
		delete this.gender;
		delete this.values;
		delete this.positiveFindings;
		delete this.negativeFindings;
		delete this.demographics;
		delete this.starttime;
		delete this.ec.notebtn.rsp;
		this.ec.library.disabled = true;
		this.ec.library.style.opacity = 0.25;
		this.ec.qAndA.disabled = true;
		this.ec.qAndA.style.opacity = 0.25;
		this.ec.results.disabled = true;
		this.ec.results.style.opacity = 0.25;
		this.ec.qareasoning.innerText = '';
		this.ec.sessionResults.style.display = 'inline-block';
		this.ec.mmInput.style.display = 'none';
		this.ec.txResultsSymSysConcernVal.innerText = '';
		this.ec.txResultsSymSysConcern.style.display = 'none';
		var wSelect = this.ec.txResultsSymRecTcVal;
		for (i = 0; i < wSelect.options.length; i++) {
			wSelect.options[i].innerText = wSelect.options[i].value;
		}
		wSelect.value = 1;
		var checked = this.ec.txResultsCMEducationTbl.querySelectorAll('input:checked');
		for (i = 0; i < checked.length; i++) {
			checked[i].checked = false;
		}
		this.ec.txResultsSymRecVc.checked = false;
		this.ec.txResultsSymDir.style.display = 'none';
		this.ec.txResultsSymPr.style.display = 'none';
		this.openTab.bind(this)(null, 'qAndA');
		this.ec.library.disabled = true;
		this.ec.library.style.opacity = 0.25;
		this.ec.qAndA.disabled = true;
		this.ec.qAndA.style.opacity = 0.25;
		this.ec.qaContent.style.display = 'none';
		this.ec.mmContent.style.display = 'block';
		this.ec.mmList.innerHTML = "";
		this.ec.mmInput.value = '';
		this.ec.sessionNote.style.display = 'none';
		this.ec.notebody.value = '';
		this.ec.txResultsSymRecTcVal.options.length = 0;
		this.ec.txResultsCMRecTcVal.options.length = 0;
		for (tci = 1; tci <= 5; tci++) {
			opt = document.createElement('option');
			opt.label = '' + tci;
			opt.value = opt.label;
			this.ec.txResultsSymRecTcVal.appendChild(opt);
			opt = document.createElement('option');
			opt.label = '' + tci;
			opt.value = opt.label;
			this.ec.txResultsCMRecTcVal.appendChild(opt);
		}
		this.ec.insTXL.resetWidget();
		this.ec.instructionList.innerHTML = '';
		this.ec.instructionLinkSection.style.display = 'none';
	}
	doNoteDone() {
		var e;
		var note = this.ec.notebody.value;
		var cRsp = this.ec.notebody.cRsp;
		cRsp.triageNote = note;
		this.doResetComponent.bind(this)();
		e = new CustomEvent('complete', {
			detail: cRsp
		});
		this.dispatchEvent(e);
	}
	gernateRspCondition(rsp) {
		var tctList, i, esi;
		var cRsp = {};
		if (rsp.demographics.gender) {
			cRsp.gender = rsp.demographics.gender;
		}
		if (rsp.demographics.dob) {
			cRsp.dob = new Date(rsp.demographics.dob);
		}
		if (rsp.demographics.cc) {
			cRsp.cc = rsp.demographics.cc;
		}
		if (rsp.demographics.age) {
			cRsp.age = rsp.demographics.age;
		}
		if (rsp.values) {
			if (rsp.values.starttime) {
				cRsp.startTime = rsp.values.starttime;
			}
			if (rsp.values.duration) {
				cRsp.duration = parseInt(rsp.values.duration) * 1000;
			}
			if (rsp.values.height) {
				cRsp.height = rsp.values.height;
			}
			if (rsp.values.weight) {
				cRsp.weight = rsp.values.weight;
			}
			if (rsp.values.systolicbloodpressure) {
				cRsp.systolicBloodPressure = rsp.values.systolicbloodpressure;
			}
			if (rsp.values.diastolicbloodpressure) {
				cRsp.diastolicBloodPressure = rsp.values.diastolicbloodpressure;
			}
			if (rsp.values.temperature) {
				cRsp.temperature = rsp.values.temperature;
			}
			if (rsp.values.serumglucose) {
				cRsp.serumGlucose = rsp.values.serumglucose;
			}
			if (rsp.values.pefrbaseline) {
				cRsp.pefrBaseline = rsp.values.pefrbaseline;
			}
			if (rsp.values.pefrcurrent) {
				cRsp.pefrCurrent = rsp.values.pefrcurrent;
			}
			if (rsp.values.lnmp) {
				cRsp.lnmp = this.stringToDate(rsp.values.lnmp);
			}
			if (rsp.values.respiratoryrate) {
				cRsp.respiratoryRate = rsp.values.respiratoryrate;
			}
			if (rsp.values.ox) {
				cRsp.o2 = rsp.values.ox;
			}
			if (rsp.values.pulse) {
				cRsp.pulse = rsp.values.pulse;
			}
			if (rsp.values.durationofcomplaint) {
				cRsp.durationOfComplaint = rsp.values.durationofcomplaint;
			}
			if (rsp.values.gestationalage) {
				cRsp.gestationalAge = rsp.values.gestationalage;
			}
			if (rsp.values.bmi) {
				cRsp.bmi = rsp.values.bmi;
			}
			if (rsp.values.peakflowpctbest) {
				cRsp.peakFlowPctBest = rsp.values.peakflowpctbest;
			}
			if (rsp.values.meanarterialpressure) {
				cRsp.meanArterialPressure = rsp.values.meanarterialpressure;
			}
			if (rsp.values.modifiedshockindex) {
				cRsp.modifiedShockIndex = rsp.values.modifiedshockindex;
			}
			if (rsp.values.pulsepressure) {
				cRsp.pulsePressure = rsp.values.pulsepressure;
			}
			if (rsp.hrs) {
				cRsp.diseaseControlScore = rsp.hrs;
			}
			if (rsp.pes) {
				cRsp.patientEffortScore = rsp.pes;
			}
			if (rsp.symptomControl) {
				cRsp.symptomControlScore = rsp.symptomControl;
			}
		}
		if (rsp.negativeFindings) {
			cRsp.negativeFindings = rsp.negativeFindings;
		}
		if (rsp.positiveFindings) {
			cRsp.positiveFindings = rsp.positiveFindings;
		}
		if (rsp.predictedResources) {
			cRsp.predictedResources = rsp.predictedResources;
		}
		if (rsp.systemConcern) {
			cRsp.systemConcern = rsp.systemConcern;
		}
		if (this.ec.txResultsSymRecTcVal.value) {
			esi = this.ec.txResultsSymRecTcVal.value;
			cRsp.nurseEsi = esi;
			cRsp.systemEsi = rsp.esi;
		}
		if ((rsp.etreatable) && (rsp.etreatable === true)) {
			cRsp.eTreatable = true;
		}
		if (this.ec.txResultsSymRecVc.checked) {
			cRsp.referToVirtualCare = true;
		}
		tctList = this.shadowRoot.querySelectorAll('.tctInput');
		if (tctList) {
			for (i = 0; i < tctList.length; i++) {
				if (tctList[i].type == 'radio') {
					if (tctList[i].checked) {
						cRsp[this.camelize(tctList[i].name)] = tctList[i].value;
					}
				} else if (tctList[i].value !== '') {
					cRsp[this.camelize(tctList[i].name)] = tctList[i].value;
					if (tctList[i].dataset.units) {
						cRsp[this.camelize(tctList[i].name)] += ' ' + tctList[i].dataset.units;
					}
				}
			}
			if (rsp.notifications) {
				for (i = 0; i < rsp.notifications.length; i++) {
					if (rsp.notifications[i].role == 'TCT') {
						if (!cRsp.directives) {
							cRsp.directives = [];
						}
						cRsp.directives.push(rsp.notifications[i].text.trim());
					}
				}
			}
			return cRsp;
		}
	}
	generateRspCondition(rsp) {
		var tctList, i, esi;
		var cRsp = {};
		if (rsp.demographics.gender) {
			cRsp.gender = rsp.demographics.gender;
		}
		if (rsp.demographics.dob) {
			cRsp.dob = new Date(rsp.demographics.dob);
		}
		if (rsp.demographics.cc) {
			cRsp.cc = rsp.demographics.cc;
		}
		if (rsp.demographics.age) {
			cRsp.age = rsp.demographics.age;
		}
		if (rsp.careLinks) {
			cRsp.careLinks = rsp.careLinks;
			cRsp.ccid = rsp.ccid;
		}
		if (rsp.values) {
			if (rsp.values.starttime) {
				cRsp.startTime = rsp.values.starttime;
			}
			if (rsp.values.duration) {
				cRsp.duration = parseInt(rsp.values.duration) * 1000;
			}
			if (rsp.values.height) {
				cRsp.height = rsp.values.height;
			}
			if (rsp.values.weight) {
				cRsp.weight = rsp.values.weight;
			}
			if (rsp.values.systolicbloodpressure) {
				cRsp.systolicBloodPressure = rsp.values.systolicbloodpressure;
			}
			if (rsp.values.diastolicbloodpressure) {
				cRsp.diastolicBloodPressure = rsp.values.diastolicbloodpressure;
			}
			if (rsp.values.temperature) {
				cRsp.temperature = rsp.values.temperature;
			}
			if (rsp.values.serumglucose) {
				cRsp.serumGlucose = rsp.values.serumglucose;
			}
			if (rsp.values.pefrbaseline) {
				cRsp.pefrBaseline = rsp.values.pefrbaseline;
			}
			if (rsp.values.pefrcurrent) {
				cRsp.pefrCurrent = rsp.values.pefrcurrent;
			}
			if (rsp.values.lnmp) {
				cRsp.lnmp = this.stringToDate(rsp.values.lnmp);
			}
			if (rsp.values.respiratoryrate) {
				cRsp.respiratoryRate = rsp.values.respiratoryrate;
			}
			if (rsp.values.ox) {
				cRsp.o2 = rsp.values.ox;
			}
			if (rsp.values.pulse) {
				cRsp.pulse = rsp.values.pulse;
			}
			if (rsp.values.durationofcomplaint) {
				cRsp.durationOfComplaint = rsp.values.durationofcomplaint;
			}
			if (rsp.values.gestationalage) {
				cRsp.gestationalAge = rsp.values.gestationalage;
			}
			if (rsp.values.bmi) {
				cRsp.bmi = rsp.values.bmi;
			}
			if (rsp.values.peakflowpctbest) {
				cRsp.peakFlowPctBest = rsp.values.peakflowpctbest;
			}
			if (rsp.values.meanarterialpressure) {
				cRsp.meanArterialPressure = rsp.values.meanarterialpressure;
			}
			if (rsp.values.modifiedshockindex) {
				cRsp.modifiedShockIndex = rsp.values.modifiedshockindex;
			}
			if (rsp.values.pulsepressure) {
				cRsp.pulsePressure = rsp.values.pulsepressure;
			}
		}
		if (rsp.symptomControl) {
			cRsp.symptomControl = rsp.symptomControl;
		}
		if (rsp.diseaseControlScore) {
			cRsp.diseaseControlScore = rsp.diseaseControlScore;
		}
		if (rsp.patientEffortScore) {
			cRsp.patientEffortScore = rsp.patientEffortScore;
		}
		if (rsp.negativeFindings) {
			cRsp.negativeFindings = rsp.negativeFindings;
		}
		if (rsp.positiveFindings) {
			cRsp.positiveFindings = rsp.positiveFindings;
		}
		if (rsp.predictedResources) {
			cRsp.predictedResources = rsp.predictedResources;
		}
		if (rsp.systemConcern) {
			cRsp.systemConcern = rsp.systemConcern;
		}
		if (this.ec.txResultsCMRecTcVal.value) {
			esi = this.ec.txResultsCMRecTcVal.value;
			cRsp.nurseEsi = esi;
			cRsp.systemEsi = rsp.esi;
		}
		if ((rsp.etreatable) && (rsp.etreatable === true)) {
			cRsp.eTreatable = true;
		}
		if (this.ec.txResultsCMRecVc.checked) {
			cRsp.referToVirtualCare = true;
		}
		tctList = this.shadowRoot.querySelectorAll('.tctInput');
		if (tctList) {
			for (i = 0; i < tctList.length; i++) {
				if (tctList[i].type == 'radio') {
					if (tctList[i].checked) {
						cRsp[this.camelize(tctList[i].name)] = tctList[i].value;
					}
				} else if (tctList[i].value !== '') {
					cRsp[this.camelize(tctList[i].name)] = tctList[i].value;
					if (tctList[i].dataset.units) {
						cRsp[this.camelize(tctList[i].name)] += ' ' + tctList[i].dataset.units;
					}
				}
			}
			if (rsp.notifications) {
				for (i = 0; i < rsp.notifications.length; i++) {
					if (rsp.notifications[i].role == 'TCT') {
						if (!cRsp.directives) {
							cRsp.directives = [];
						}
						cRsp.directives.push(rsp.notifications[i].text.trim());
					}
				}
			}
			return cRsp;
		}
	}
	generateRspSym(rsp) {
		var tctList, i, esi;
		var cRsp = {};
		if (rsp.demographics.gender) {
			cRsp.gender = rsp.demographics.gender;
		}
		if (rsp.demographics.dob) {
			cRsp.dob = new Date(rsp.demographics.dob);
		}
		if (rsp.demographics.cc) {
			cRsp.cc = rsp.demographics.cc;
		}
		if (rsp.demographics.age) {
			cRsp.age = rsp.demographics.age;
		}
		if (rsp.values) {
			if (rsp.values.starttime) {
				cRsp.startTime = rsp.values.starttime;
			}
			if (rsp.values.duration) {
				cRsp.duration = parseInt(rsp.values.duration) * 1000;
			}
			if (rsp.values.height) {
				cRsp.height = rsp.values.height;
			}
			if (rsp.values.weight) {
				cRsp.weight = rsp.values.weight;
			}
			if (rsp.values.systolicbloodpressure) {
				cRsp.systolicBloodPressure = rsp.values.systolicbloodpressure;
			}
			if (rsp.values.diastolicbloodpressure) {
				cRsp.diastolicBloodPressure = rsp.values.diastolicbloodpressure;
			}
			if (rsp.values.temperature) {
				cRsp.temperature = rsp.values.temperature;
			}
			if (rsp.values.serumglucose) {
				cRsp.serumGlucose = rsp.values.serumglucose;
			}
			if (rsp.values.pefrbaseline) {
				cRsp.pefrBaseline = rsp.values.pefrbaseline;
			}
			if (rsp.values.pefrcurrent) {
				cRsp.pefrCurrent = rsp.values.pefrcurrent;
			}
			if (rsp.values.lnmp) {
				cRsp.lnmp = this.stringToDate(rsp.values.lnmp);
			}
			if (rsp.values.respiratoryrate) {
				cRsp.respiratoryRate = rsp.values.respiratoryrate;
			}
			if (rsp.values.ox) {
				cRsp.o2 = rsp.values.ox;
			}
			if (rsp.values.pulse) {
				cRsp.pulse = rsp.values.pulse;
			}
			if (rsp.values.durationofcomplaint) {
				cRsp.durationOfComplaint = rsp.values.durationofcomplaint;
			}
			if (rsp.values.gestationalage) {
				cRsp.gestationalAge = rsp.values.gestationalage;
			}
			if (rsp.values.bmi) {
				cRsp.bmi = rsp.values.bmi;
			}
			if (rsp.values.peakflowpctbest) {
				cRsp.peakFlowPctBest = rsp.values.peakflowpctbest;
			}
			if (rsp.values.meanarterialpressure) {
				cRsp.meanArterialPressure = rsp.values.meanarterialpressure;
			}
			if (rsp.values.modifiedshockindex) {
				cRsp.modifiedShockIndex = rsp.values.modifiedshockindex;
			}
			if (rsp.values.pulsepressure) {
				cRsp.pulsePressure = rsp.values.pulsepressure;
			}
		}
		if (rsp.negativeFindings) {
			cRsp.negativeFindings = rsp.negativeFindings;
		}
		if (rsp.positiveFindings) {
			cRsp.positiveFindings = rsp.positiveFindings;
		}
		if (rsp.predictedResources) {
			cRsp.predictedResources = rsp.predictedResources;
		}
		if (rsp.systemConcern) {
			cRsp.systemConcern = rsp.systemConcern;
		}
		if (this.ec.txResultsSymRecTcVal.value) {
			esi = this.ec.txResultsSymRecTcVal.value;
			cRsp.nurseEsi = esi;
			cRsp.systemEsi = rsp.esi;
		}
		if ((rsp.etreatable) && (rsp.etreatable === true)) {
			cRsp.eTreatable = true;
		}
		if (this.ec.txResultsSymRecVc.checked) {
			cRsp.referToVirtualCare = true;
		}
		tctList = this.shadowRoot.querySelectorAll('.tctInput');
		if (tctList) {
			for (i = 0; i < tctList.length; i++) {
				if (tctList[i].type == 'radio') {
					if (tctList[i].checked) {
						cRsp[this.camelize(tctList[i].name)] = tctList[i].value;
					}
				} else if (tctList[i].value !== '') {
					cRsp[this.camelize(tctList[i].name)] = tctList[i].value;
					if (tctList[i].dataset.units) {
						cRsp[this.camelize(tctList[i].name)] += ' ' + tctList[i].dataset.units;
					}
				}
			}
			if (rsp.notifications) {
				for (i = 0; i < rsp.notifications.length; i++) {
					if (rsp.notifications[i].role == 'TCT') {
						if (!cRsp.directives) {
							cRsp.directives = [];
						}
						cRsp.directives.push(rsp.notifications[i].text.trim());
					}
				}
			}
			return cRsp;
		}
	}
	camelize(str) {
		return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
			if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
			return index === 0 ? match.toLowerCase() : match.toUpperCase();
		});
	}
	generateNote(nData) {
		var i, vm;
		var note = 'Clinic Triage\n';
		if (nData.startTime) note += nData.startTime + '\n';
		note += '\nDemographics' + '\n';
		note += '\t' + nData.age.replace('Years', 'y/o').replace('Months', 'm/o') + ' ' + nData.gender + '\n';
		note += '\tBorn: ' + this.dateToString(nData.dob) + '\n';
		if ((nData.lastname) || (nData.firstname)) {
			note += '\t';
			if (nData.lastname) {
				note += nData.lastname;
				if (nData.firstname) {
					note += ', ';
				}
			}
			if (nData.firstname) {
				note += nData.firstname;
			}
			note += '\n';
		}
		if (nData.cc) {
			note += '\nResults\n';
		}
		if (nData.cc) {
			note += '\tCC: ' + nData.cc + '\n';
		}
		if (nData.durationofcc) {
			note += '\t' + nData.durationofcc + '\n';
		}
		if (nData.painlevel) {
			note += '\t' + nData.painlevel + '\n';
		}
		if (nData.nurseRfi) {
			note += '\tNurse Recommendation: ' + nData.nurseRfi + '\n';
		}
		if (nData.systemRfi) {
			note += '\tSoftware Suggestion: ' + nData.systemRfi + '\n';
		}
		if (nData.nurseRfl) {
			note += '\tNurse Recommended Follow-up Location: ' + nData.nurseRfl;
			if ((nData.nurseconsidervirtualcare) && (nData.nurseconsidervirtualcare === true)) {
				note += ', consider virtual care';
			}
			note += '\n';
			if (nData.systemRfl) {
				note += '\tSofware Suggested Follow-up Location: ' + nData.systemRfl;
				if ((nData.eTreatable) && (nData.eTreatable === true)) {
					note += ', consider virtual care';
				}
				note += '\n';
			}
		}
		vm = '';
		for (i = 0; i < this.valuesAndMeasuresToNote.length; i++) {
			var property = this.valuesAndMeasuresToNote[i];
			if (nData.hasOwnProperty(property)) {
				if (property == 'lnmp') vm += '\t' + this.valuesAndMeasuresTitlesNote[i] + ': ' + this.dateToString(nData[property]) + '\n';
				else
				if (this.valuesAndMeasuresUnits.hasOwnProperty(property))
					vm += '\t' + this.valuesAndMeasuresTitlesNote[i] + ': ' + nData[property] + ' ' + this.valuesAndMeasuresUnits[property] + '\n';
				else
					vm += '\t' + this.valuesAndMeasuresTitlesNote[i] + ': ' + nData[property] + '\n';
			}
		}
		if (vm.length > 0) {
			note += '\nValues and Measures\n';
			note += vm;
		}
		if ((nData.positiveFindings) && (nData.positiveFindings.length > 0)) {
			note += '\nFindings That May Require Action\n';
			note += '\t' + nData.positiveFindings.join('\n\t') + '\n';
		}
		if ((nData.negativeFindings) && (nData.negativeFindings.length > 0)) {
			note += '\nNegative Responses\n';
			note += '\tDenies: ' + nData.negativeFindings.join('\n\tDenies: ') + '\n';
		}
		if ((nData.verbalInstructions) || (nData.patientInstructionsText) || (nData.webInstructions)) {
			note += '\nVeteran Education';
			if ((nData.verbalInstructions) && (nData.verbalInstructions.length > 0)) {
				note += '\n\tVerbal Education Provided for:\n';
				for (i = 0; i < nData.verbalInstructions.length; i++) {
					note += '\t\t' + nData.verbalInstructions[i] + '\n';
				}
			}
			if (nData.patientInstructionsText) {
				note += '\n\tVerbal Education Provided:\n';
				note += nData.patientInstructionsText + '\n';
			}
			if (nData.webInstructions) {
				note += '\t' + nData.webInstructions + '\n';
			}
		}
		if (nData.educationLog) {
			note += '\nEducation Log\n\t' + nData.educationLog.replace(/\n/g, '\n\t');
		}
		return note;
	}
	tXeAtReport(rsp) {
		var isCM = rsp.isCondition;
		this.ec.notebtn.rsp = rsp;
		this.ec.qAndA.disabled = true;
		this.ec.qAndA.style.opacity = 0.25;
		this.ec.txResultsCM.style.display = 'none';
		this.ec.txResultsSYM.style.display = 'none';
		if (isCM) {
			this.setupResultsCM(rsp);
		} else {
			this.setupResultsSYM(rsp);
		}
		this.openTab.bind(this)(null, 'results');
	}
	setupResultsSYM(rsp) {
		var i, selector, esiOption, rt, pi, pis, pes, pmpt, tctI, tctS, tctP, showingTCT, hml, iElems;
		if (rsp.systemConcern) {
			var sysConcern = rsp.systemConcern.join(', ');
			this.ec.txResultsSymSysConcernVal.innerHTML = sysConcern;
			this.ec.txResultsSymSysConcern.style.display = 'block';
		} else {
			this.ec.txResultsSymSysConcern.style.display = 'none';
		}
		if (rsp.predictedResources) {
			var piList = this.ec.txResultsSymPrLst;
			piList.innerHTML = "";
			for (i = 0; i < rsp.predictedResources.length; i++) {
				var li = document.createElement('li');
				li.innerHTML = rsp.predictedResources[i];
				piList.appendChild(li);
			}
			this.ec.txResultsSymPr.style.display = 'block';
		} else {
			this.ec.txResultsSymPr.style.display = 'none';
		}
		if (rsp.esi) {
			selector = '#txResultsSymRecTcVal option[value="' + rsp.esi + '"]';
			esiOption = this.shadowRoot.querySelector(selector);
			esiOption.label = esiOption.label + " (System)";
			esiOption.selected = true;
		}
		if (rsp.etreatable) {
			this.ec.txResultsSymRecVc.checked = rsp.etreatable;
		} else {
			this.ec.txResultsSymRecVc.checked = false;
		}
		var prompts = ['URINE PREGNANCY TEST', 'GLUCOSE FINGERSTICK', 'CIRCUMFERENCE IN LEGS AT MID-CALF', 'CIRCUMFERENCE IN ARMS AT MID-FOREARM', 'ORTHOSTATIC BP READINGS', 'BP READINGS BOTH ARMS', 'BEDSIDE HEMOGLOBIN', 'BEDSIDE INR IF TAKING COUMADIN', 'DIP URINE', 'O2 SAT MEASUREMENT', 'VISUAL ACUITY TESTING', 'MEASURE ABDOMINAL GIRTH', 'BEDSIDE HEMOGLOBIN A1C', 'URINE HCG IN FEMALES < 49', 'MEASURE LACERATION LENGTH', 'MEASURE SKIN ULCER DIAMETER'];
		var promptHTML = [
			'[%is]Urine Pregnancy test[%ie]&nbsp;&nbsp;<input type="radio" name="Urine pregnancy test" value="positive" class="tctInput">pos<input type="radio" name="Urine pregnancy test" value="negative" class="tctInput">neg',
			'[%is]Glucose fingerstick[%ie]&nbsp&nbsp;<input type="text" class="tctInput" name="Glucose fingerstick" maxlength=5 style="display: inline-block;" data-mini="true" data-units="mg/dl"> mg/dl',
			'[%is]Circumference in legs at mid-calf[%ie]&nbsp&nbsp;RIGHT <input type="text" class="tctInput" name="Calf circumference right" maxlength=5 data-mini="true" data-units="cm" style="display: inline-block;"> cm&nbsp;&nbsp;LEFT <input type="text" class="tctInput" name="Calf circumference left" size=4 maxlength=5 data-mini="true" data-units="cm" style="display: inline-block;"> cm',
			'[%is]Circumference in arms at mid-forearm[%ie]&nbsp&nbsp;RIGHT <input type="text" class="tctInput" name="Arm circumference right" maxlength=5 data-mini="true" data-units="cm" style="display: inline-block;"> cm&nbsp;&nbsp;LEFT <input type="text" class="tctInput" name="Arm circumference left" size=4 maxlength=5 data-mini="true" data-units="cm" style="display: inline-block;"> cm',
			'[%is]Orthostatic BP readings[%ie]&nbsp&nbsp;SUPINE SBP <input type="text" class="tctInput" name="Supine SBP" maxlength=5 data-mini="true" data-units="" style="display: inline-block;">&nbsp;&nbsp;SUPINE DBP <input type="text" class="tctInput" name="Supine DBP" maxlength=5 data-mini="true" data-units="" style="display: inline-block;">&nbsp;&nbsp;STAND SBP <input type="text" class="tctInput" name="Standing SBP" maxlength=5 data-mini="true" data-units="" style="display: inline-block;">&nbsp;&nbsp;STAND DBP <input type="text" class="tctInput" name="Standing DBP" maxlength=5 data-mini="true" data-units="" style="display: inline-block;">',
			'[%is]BP readings both arms[%ie]&nbsp&nbsp;RSBP<input type="text" class="tctInput" name="Right SBP" maxlength=5 style="display: inline-block;" data-mini="true" data-units=""> RDBP<input type="text" class="tctInput" name="Right DBP" maxlength=5 style="display: inline-block;" data-mini="true" data-units=""> LSBP<input type="text" class="tctInput" name="Left SBP" maxlength=5 style="display: inline-block;" data-mini="true" data-units=""> LDBP<input type="text" class="tctInput" name="Left DBP" maxlength=5 style="display: inline-block;" data-mini="true" data-units="">',
			'[%is]Bedside Hemoglobin[%ie]&nbsp&nbsp;<input type="text" class="tctInput" name="Bedside Hemoglobin" maxlength=5 style="display: inline-block;" data-mini="true" data-units="g/dl"> g/dl',
			'[%is]Bedside INR if taking Coumadin[%ie]&nbsp&nbsp;<input type="text" class="tctInput" name="Bedside INR" maxlength=5 style="display: inline-block;" data-mini="true" data-units="">',
			'[%is]Dip urine[%ie]&nbsp&nbsp;glu <input type="text" class="tctInput" name="Dip Urine Glucose" maxlength=5 data-mini="true" data-units="" style="display: inline-block;">&nbsp;&nbsp;ket <input type="text" class="tctInput" name="Ketones" maxlength=5 data-mini="true" data-units="" style="display: inline-block;">&nbsp;&nbsp;leuko <input type="text" class="tctInput" name="Leukocyte" maxlength=5 data-mini="true" data-units="" style="display: inline-block;">&nbsp;&nbsp;nit <input type="text" class="tctInput" name="Nitrate" maxlength=5 data-mini="true" data-units="" style="display: inline-block;">&nbsp;&nbsp;prot <input type="text" class="tctInput" name="Protein" maxlength=5 data-mini="true" data-units="" style="display: inline-block;">&nbsp;&nbsp;heme <input type="text" class="tctInput" name="Hemoglobin" maxlength=5 data-mini="true" data-units="" style="display: inline-block;">',
			'[%is]O2 Sat measurement[%ie]&nbsp&nbsp;<input type="text" class="tctInput" name="O2 saturation" maxlength=5 style="display: inline-block;" data-mini="true" data-units="%">%',
			'[%is]Visual acuity[%ie]&nbsp&nbsp;OD 20/<input type="text" class="tctInput" name="Visual acuity OD" maxlength=5 style="display: inline-block;" data-mini="true" data-units=""> OS 20/<input type="text" class="tctInput" name="Visual Acuity OS" maxlength=5 style="display: inline-block;" data-mini="true" data-units=""> OU 20/<input type="text" class="tctInput" name="Visual Acuity OU" maxlength=5 style="display: inline-block;" data-mini="true" data-units="">',
			'[%is]Measure abdominal girth[%ie]&nbsp&nbsp;<input type="text" class="tctInput" name="Abdominal girth" maxlength=5 style="display: inline-block;" data-mini="true" data-units="cm"> cm',
			'[%is]Bedside Hemoglobin A1C[%ie]&nbsp&nbsp;<input type="text" class="tctInput" name="Bedside Hemoglobin A1C" maxlength=5 style="display: inline-block;" data-mini="true" data-units="%"> %',
			'[%is]Urine Pregnancy test[%ie]&nbsp;&nbsp;<input type="radio" name="Urine pregnancy test" value="positive" class="tctInput"><span class="prbc">pos</span><input type="radio" name="Urine pregnancy test" value="negative" class="tctInput"><span class="prbc">neg</span>',
			'[%is]Measure laceration length[%ie]&nbsp&nbsp;<input type="text" class="tctInput" name="Laceration length" maxlength=5 style="display: inline-block;" data-mini="true" data-units="cm"> cm',
			'[%is]Measure skin ulcer diameter[%ie]&nbsp&nbsp;<input type="text" class="tctInput" name="Skin ulcer diameter" maxlength=5 style="display: inline-block;" data-mini="true" data-units="cm"> cm'
		];
		showingTCT = false;
		if ((rsp.notifications) && (rsp.notifications.length > 0)) {
			tctS = [];
			tctI = [];
			tctP = [];
			for (i = 0; i < rsp.notifications.length; i++) {
				if (rsp.notifications[i].role == 'TCT') {
					rt = rsp.notifications[i].text.trim();
					if (rt.substr(0, 6).toUpperCase() == 'IMAGE ') {
						if (tctI.indexOf(rt) < 0) {
							if (rsp.notifications[i].hasOwnProperty('images')) {
								tctI.push('<div class="tctImage"><a href="#" class="tctImages" data-images="' + rsp.notifications[i].images.join(";") + '">' + rt + '</a></div>');
							} else
								tctI.push('<div class="tctImage">' + rt + '</div>');
						}
					} else {
						pi = prompts.indexOf(rt.toUpperCase());
						if (pi >= 0) {
							pis = '';
							pes = '';
							pmpt = promptHTML[pi];
							if (rsp.notifications[i].hasOwnProperty('images')) {
								pis = '<div class="tctImage"><a href="#" class="tctImages" data-images="' + rsp.notifications[i].images.join(";") + '">';
								pes = '</a></div>';
							}
							pmpt = promptHTML[pi].replace('[%is]', pis).replace('[%ie]', pes);
							if (tctP.indexOf(pmpt) < 0) {
								tctP.push(pmpt);
							}
						} else {
							pmpt = rt;
							if (rsp.notifications[i].hasOwnProperty('images')) {
								pmpt = '<div class="tctImage"><a href="#" class="tctImages" data-images="' + rsp.notifications[i].images.join(";") + '">' + rt + '</a></div>';
							}
							if (tctS.indexOf(pmpt) < 0) {
								tctS.push(pmpt);
							}
						}
					}
				}
			}
			tctS.sort();
			tctI.sort();
			tctP.sort();
			this.ec.txResultsSymDirLst.innerHTML = '';
			hml = '';
			for (i = 0; i < tctS.length; i++) {
				hml += '<li>' + tctS[i] + '</li>';
			}
			for (i = 0; i < tctI.length; i++) {
				hml += '<li>' + tctI[i] + '</li>';
			}
			for (i = 0; i < tctP.length; i++) {
				hml += '<li>' + tctP[i] + '</li>';
			}
			this.ec.txResultsSymDirLst.innerHTML = hml;
			iElems = this.shadowRoot.querySelectorAll('.tctImages');
			if (iElems) {
				for (i = 0; i < iElems.length; i++) {
					iElems[i].addEventListener('click', this.txResultsShowImgPop.bind(this));
				}
			}
			showingTCT = ((tctS.length + tctI.length + tctP.length) > 0);
		}
		this.ec.txResultsSymDir.style.display = showingTCT ? 'inherit' : 'none';
		this.ec.txResultsSYM.style.display = 'inherit';
	}
	centerPopup(popup) {
		var pLeft = (this.offsetParent.offsetWidth / 2) - popup.offsetWidth;
		if (pLeft < 0) pLeft = 0;
		var pTop = (this.offsetParent.offsetHeight / 2) - popup.offsetHeight;
		if (pTop < 0) pTop = 0;
		this.ec.tctImagePopup.style.position = 'absolute';
		this.ec.tctImagePopup.style.top = pTop + 'px';
		this.ec.tctImagePopup.style.left = pLeft + 'px';
	}
	txResultsShowImgPop(ev) {
		var iList = ev.target.dataset.images.split(';');
		this.buildTctImages(iList);
		this.ec.tctImage.src = 'https://library.dshisystems.net/TCT-Images/' + iList[0];
		this.ec.tctImagePopup.classList.add('open');
		ev.preventDefault();
		return null;
	}
	buildTctImages(images) {
		var imgCode = '';
		if (images.length > 1) {
			for (var i = 0; i < images.length; i++) {
				imgCode += '<div class="tctImageThumbWrapper"><IMG class="tctImageThumb" src="https://library.dshisystems.net/TCT-Images/' + images[i] + '"></div>';
			}
			this.ec.tctImageThumbs.innerHTML = imgCode;
			this.ec.tctImageThumbs.style.display = 'inherit';
			var iElems = this.shadowRoot.querySelectorAll('.tctImageThumb');
			for (i = 0; i < iElems.length; i++) {
				iElems[i].addEventListener('click', this.tctImageThumbClick.bind(this));
			}
		} else {
			this.ec.tctImageThumbs.innerHTML = '';
			this.ec.tctImageThumbs.style.display = 'none';
		}
	}
	tctImageThumbClick(ev) {
		var iPath = ev.currentTarget.src;
		this.ec.tctImage.src = iPath;
	}
	doImageBack() {
		var modal = this.shadowRoot.querySelector('[class="modal open"]');
		modal.classList.remove('open');
	}
	txcRsltsShowDSHelpPop(ev) {
		this.ec.txcRsltsDSHelpPopup.classList.add('open');
		ev.preventDefault();
		return null;
	}
	doDSHelpBack() {
		var modal = this.shadowRoot.querySelector('[class="modal open"]');
		modal.classList.remove('open');
	}
	doLibraryBack() {
		this.ec.tab.style.display = 'inline-block';
		this.ec.tabContent.style.display = 'inline-block';
		this.ec.tctLibraryPopup.style.display = 'none';
	}
	setupResultsCM(rsp) {
		var i;
		if (rsp.esi) {
			var selector = '#txResultsCMRecTcVal option[value="' + rsp.esi + '"]';
			var esiOption = this.shadowRoot.querySelector(selector);
			esiOption.label = esiOption.label + " (System)";
			esiOption.selected = true;
		}
		if (rsp.etreatable) {
			this.ec.txResultsCMRecVc.checked = rsp.etreatable;
		} else {
			this.ec.txResultsCMRecVc.checked = false;
		}
		if (this.comprehensive) {
			this.ec.txResultsCmDcsValue.innerText = rsp.diseaseControlScore;
			this.ec.txResultsCmPesValue.innerText = rsp.patientEffortScore;
			this.ec.txResultsCmDcs.style.display = 'inherit';
			this.ec.txResultsCmPes.style.display = 'inherit';
		} else {
			this.ec.txResultsCmDcs.style.display = 'none';
			this.ec.txResultsCmPes.style.display = 'none';
		}
		this.ec.txResultsCmScsValue.innerText = rsp.symptomControl;
		if (this.comprehensive) {
			var BMI = null;
			if (rsp.values.bmi) {
				BMI = parseFloat(rsp.values.bmi);
			}
			var cpRow;
			var cpCellVerbal;
			var cpCellVerbalCbx;
			var cpCellVerbalCbxLbl;
			var cpCellInfo;
			var cpCellInfoLink;
			var cpCellVerbalContainer;
			var cpCellInfoContainer;
			this.ec.txResultsCMEducationTbl.innerHTML = '';
			var cmTopics = [];
			if (rsp.carePlan) {
				for (i = 0; i < rsp.carePlan.length; i++) {
					if ((rsp.carePlan[i][3] === 'a') ||
						(this.isInPositiveList(rsp.positiveFindings, rsp.carePlan[i][0])) ||
						((BMI) && (BMI > 30.0) && (rsp.carePlan[i][0].toUpperCase() == 'PREVENT: WEIGHT MANAGEMENT')) ||
						((BMI) && (BMI < 19.0) && (rsp.carePlan[i][0].toUpperCase() == 'PREVENT: UNDERWEIGHT MANAGEMENT'))) {
						cpRow = document.createElement('DIV');
						cpRow.className = 'trow';
						cpCellVerbal = document.createElement('DIV');
						cpCellVerbal.classList.add('tcell');
						cpCellVerbalContainer = document.createElement('DIV');
						cpCellVerbalContainer.classList.add('txCMVerbal');
						cpCellVerbalCbx = document.createElement('INPUT');
						cpCellVerbalCbx.type = 'checkbox';
						cpCellVerbalCbx.id = 'cp' + i;
						cpCellVerbalCbx.article = rsp.carePlan[i][1];
						cpCellVerbalCbx.description = rsp.carePlan[i][2];
						cpCellVerbalCbx.rs = rsp.carePlan[i][0];
						cpCellVerbalCbxLbl = document.createElement('LABEL');
						cpCellVerbalCbxLbl.htmlFor = 'cp' + i;
						cpCellVerbalCbxLbl.appendChild(document.createTextNode('Verbal'));
						cpCellInfo = document.createElement('DIV');
						cpCellInfo.classList.add('tcell');
						cpCellInfoContainer = document.createElement('DIV');
						cpCellInfoLink = document.createElement('DIV');
						cpCellInfoLink.classList.add('cpLink');
						cpCellInfoContainer.classList.add('txCMDescription');
						cpCellInfoLink.appendChild(document.createTextNode(rsp.carePlan[i][2]));
						cpCellInfoLink.article = rsp.carePlan[i][1];
						cpCellInfoLink.addEventListener('click', this.onCPInfoClick.bind(this));
						cpCellInfoContainer.appendChild(cpCellInfoLink);
						cpCellInfo.appendChild(cpCellInfoContainer);
						cpCellVerbalContainer.appendChild(cpCellVerbalCbx);
						cpCellVerbalContainer.appendChild(cpCellVerbalCbxLbl);
						cpCellVerbal.appendChild(cpCellVerbalContainer);
						cpRow.appendChild(cpCellVerbal);
						cpRow.appendChild(cpCellInfo);
						this.ec.txResultsCMEducationTbl.appendChild(cpRow);
						if (!cmTopics.includes(rsp.carePlan[i][1]))
							cmTopics.push(rsp.carePlan[i][1]);
					}
				}
			}
			var ecpLink;
			var wTopics = [];
			if (rsp.isCondition) {
				wTopics = cmTopics;
			} else {
				for (i = 0; i < rsp.careLinks.length; i++) {
					wTopics.push(rsp.careLinks[i].title);
				}
			}
			if (wTopics.length > 0) {
				ecpLink = this.generateCoachKey(wTopics, rsp.demographics.age, rsp.demographics.gender, rsp.ccid);
			}
			if (ecpLink) {
				this.ecpLink = ecpLink;
				this.ec.txResultsCMEcpLink.href = ecpLink;
				this.ec.txResultsCMEcpLink.innerText = ecpLink;
				this.ec.txResultsCMEcp.style.display = 'inherit';
			} else {
				this.ec.txResultsCMEcp.style.display = 'none';
				if (this.ecpLink)
					delete this.ecpLink;
			}
			this.ec.txResultsCMEducation.style.display = 'inherit';
		} else {
			this.ec.txResultsCMEcp.style.display = 'none';
			this.ec.txResultsCMEducation.style.display = 'none';
		}
		this.ec.txResultsCM.style.display = 'inherit';
	}
	isInPositiveList(positiveList, item) {
		var i;
		if (positiveList) {
			for (i = 0; i < positiveList.length; i++) {
				if (positiveList[i].toUpperCase() === item.toUpperCase())
					return true;
			}
		}
		return false;
	}
	setupPopupListener() {
		this.shadowRoot.addEventListener('click', this.onPopClick.bind(this), false);
	}
	onPopClick(e) {
		var target = e.target;
		var m_ID, modal;
		if (target.hasAttribute('data-toggle') && target.getAttribute('data-toggle') == 'modal') {
			if (target.hasAttribute('data-target')) {
				m_ID = target.getAttribute('data-target');
				document.getElementById(m_ID).classList.add('open');
				e.preventDefault();
			}
		}
		if ((target.hasAttribute('data-dismiss') && target.getAttribute('data-dismiss') == 'modal') || target.classList.contains('modal')) {
			modal = this.shadowRoot.querySelector('[class="modal open"]');
			modal.classList.remove('open');
			e.preventDefault();
		}
	}
	onCPInfoClick(ev) {
		this.ec.tctTXL.showArticle(ev.currentTarget.article);
		this.ec.tctLibraryPopup.style.display = 'inherit'; // newlib
		this.ec.tab.style.display = 'none';
		this.ec.tabContent.style.display = 'none';
		ev.preventDefault();
		return null;
	}

	round(value, precision) {
		var multiplier = Math.pow(10, precision || 0);
		return Math.round(value * multiplier) / multiplier;
	}
	tXeAtDataPoint(rsp) {
		var uIdx, input, isIntegral, dl, precision, n, x, s, i, option, currentDate, y, m, d, ms, ds, vList, dStr2;
		this.ec.qaSelect.style.display = 'none';
		rsp.isDataPoint = true;
		this.tXeAtQuestion(rsp);
		if (this.ec.qanextbtn.inputControl) {
			this.ec.qanextbtn.inputControl = undefined;
		}
		this.ec.qaUnits.style.display = 'none';
		if ((rsp.dataPoint.unitsList) && (rsp.dataPoint.unitsList.length > 1)) {
			this.ec.qaUnitSelection.options.length = 0;
			for (uIdx = 0; uIdx < rsp.dataPoint.unitsList.length; uIdx++) {
				var opt = document.createElement('option');
				opt.label = rsp.dataPoint.unitsList[uIdx];
				opt.value = rsp.dataPoint.unitsList[uIdx];
				if (rsp.dataPoint.units == rsp.dataPoint.unitsList[uIdx]) {
					opt.selected = true;
				}
				this.ec.qaUnitSelection.appendChild(opt);
			}
			this.ec.qaUnitSelection.style.display = 'inherit';
			this.ec.qaUnitText.style.display = 'none';
			this.ec.qaUnits.style.display = 'inline-block';
		} else {
			this.ec.qaUnitSelection.style.display = 'none';
			if (rsp.dataPoint.units) {
				this.ec.qaUnitText.style.display = 'inherit';
				this.ec.qaUnitText.innerText = rsp.dataPoint.units;
				if (rsp.dataPoint.units != 'na')
					this.ec.qaUnits.style.display = 'inline-block';
			} else {
				this.ec.qaUnitText.style.display = 'none';
			}
		}
		if (rsp.dataPoint[rsp.dataPoint.units].type == 'Number') {
			input = this.ec.qaNumber;
			isIntegral = false;
			input.dataPoint = rsp.dataPoint;
			input.min = input.dataPoint[input.dataPoint.units].min;
			input.max = input.dataPoint[input.dataPoint.units].max;
			input.step = input.dataPoint[input.dataPoint.units].step;
			if (input.dataPoint.value)
				input.value = input.dataPoint.value;
			else
				input.value = '';
			input.unit = rsp.dataPoint.units;
			if (input.dataPoint[input.dataPoint.units].integral) {
				isIntegral = true;
			}
			dl = this.ec.qaNumericList;
			dl.innerHTML = '';
			precision = 0;
			if (input.step == 0.1) {
				precision = 1;
			}
			n = parseFloat(input.min);
			x = parseFloat(input.max);
			s = parseFloat(input.step);
			for (i = n;
				(i <= x); i += s) {
				option = document.createElement('option');
				option.value = this.round(i, precision);
				dl.appendChild(option);
				if (!isIntegral) {
					if (option.value.indexOf('.') < 0) {
						option = document.createElement('option');
						option.value = this.round(i, precision) + '.0';
						dl.appendChild(option);
					}
				}
			}
			this.ec.qadatapoint.style.display = 'block';
			this.ec.qaNumeric.style.display = 'inline-block';
			this.ec.qaList.style.display = 'none';
			this.ec.qaDate.style.display = 'none';
			this.ec.qanextbtn.inputControl = input;
		} else {
			if (rsp.dataPoint[rsp.dataPoint.units].type == 'Date') {
				input = this.ec.qaDateInput;
				input.dataPoint = rsp.dataPoint;
				input.minDate = new Date(rsp.dataPoint[rsp.dataPoint.units].min);
				input.maxDate = new Date(rsp.dataPoint[rsp.dataPoint.units].max);
				if (rsp.dataPoint.value) {
					input.value = rsp.dataPoint.value;
				}
				dl = this.ec.qaDateList;
				dl.innerHTML = '';
				currentDate = input.minDate;
				while (currentDate.getTime() < input.maxDate.getTime()) {
					y = currentDate.getFullYear();
					m = currentDate.getMonth() + 1;
					d = currentDate.getDate();
					ms = (m < 10) ? '0' + m : '' + m;
					ds = (d < 10) ? '0' + d : '' + d;
					dStr2 = ms + '/' + ds + '/' + y;
					option = document.createElement('option');
					option.value = dStr2;
					option.text = dStr2;
					dl.appendChild(option);
					currentDate = currentDate.addDays(1);
				}
				this.ec.qadatapoint.style.display = 'block';
				this.ec.qaNumeric.style.display = 'none';
				this.ec.qaList.style.display = 'none';
				this.ec.qaSelect.style.display = 'none';
				this.ec.qaDate.style.display = 'inline-block';
				this.ec.qaUnits.style.display = 'none';
				this.ec.qanextbtn.inputControl = input;
			} else {
				if (rsp.dataPoint[rsp.dataPoint.units].type == 'List') {
					input = this.ec.qaListInput;
					input.dataPoint = rsp.dataPoint;
					if (rsp.dataPoint.value) {
						input.value = rsp.dataPoint.value;
					}
					input.unit = rsp.dataPoint.units;
					dl = this.ec.qaListList;
					dl.innerHTML = '';
					vList = input.dataPoint[input.dataPoint.units].list;
					for (i = 0; i < vList.length; i++) {
						option = document.createElement('option');
						option.value = vList[i];
						option.text = vList[i];
						dl.appendChild(option);
					}
					this.ec.qadatapoint.style.display = 'block';
					this.ec.qaNumeric.style.display = 'none';
					this.ec.qaList.style.display = 'inline-block';
					this.ec.qaSelect.style.display = 'none';
					this.ec.qaDate.style.display = 'none';
					this.ec.qaUnits.style.display = 'none';
					this.ec.qanextbtn.inputControl = input;
				} else {
					if (rsp.dataPoint[rsp.dataPoint.units].type == 'Select') {
						input = this.ec.qaSelectInput;
						input.dataPoint = rsp.dataPoint;
						if (rsp.dataPoint.value) {
							input.value = rsp.dataPoint.value;
						}
						input.unit = rsp.dataPoint.units;
						dl = input;
						dl.innerHTML = '';
						vList = input.dataPoint[input.dataPoint.units].list;
						for (i = 0; i < vList.length; i++) {
							option = document.createElement('option');
							option.value = vList[i];
							option.text = vList[i];
							dl.appendChild(option);
						}
						this.ec.qadatapoint.style.display = 'block';
						this.ec.qaNumeric.style.display = 'none';
						this.ec.qaList.style.display = 'none';
						this.ec.qaSelect.style.display = 'inline-block';
						this.ec.qaDate.style.display = 'none';
						this.ec.qaUnits.style.display = 'none';
						this.ec.qanextbtn.inputControl = input;
					} else {
						alert('Data Input is not implemented');
					}
				}
			}
		}
	}
	setupDataPoint(dataPoint, units, newValue) {
		var input, isIntegral, dl, precision, n, x, s, i, option, currentDate, y, m, d, ms, ds, vList, dStr2, valueMaps;
		if (dataPoint[units].type == 'Number') {
			input = this.ec.qaNumber;
			isIntegral = false;
			input.dataPoint = dataPoint;
			input.min = input.dataPoint[units].min;
			input.max = input.dataPoint[units].max;
			input.step = input.dataPoint[units].step;
			input.unit = units;
			if (input.dataPoint[units].integral) {
				isIntegral = true;
			}
			if (!input.value) {
				if (input.dataPoint.value)
					input.value = input.dataPoint.value;
				else
					input.value = '';
			}
			dl = this.ec.qaNumericList;
			dl.innerHTML = '';
			precision = 0;
			if (input.step == 0.1) {
				precision = 1;
			}
			n = parseFloat(input.min);
			x = parseFloat(input.max);
			s = parseFloat(input.step);
			valueMaps = false;
			for (i = n;
				(i <= x); i += s) {
				option = document.createElement('option');
				option.value = this.round(i, precision);
				if (option.value == input.value)
					valueMaps = true;
				dl.appendChild(option);
				if (!isIntegral) {
					if (option.value.indexOf('.') < 0) {
						option = document.createElement('option');
						option.value = this.round(i, precision) + '.0';
						if (option.value == input.value)
							valueMaps = true;
						dl.appendChild(option);
					}
				}
			}
			if (!valueMaps)
				this.ec.qaNumber.value = '';
			this.ec.qanextbtn.inputControl = input;
			this.ec.qadatapoint.style.display = 'block';
			this.ec.qaNumeric.style.display = 'inline-block';
			this.ec.qaList.style.display = 'none';
			this.ec.qaDate.style.display = 'none';
		} else {
			if (dataPoint[dataPoint.units].type == 'Date') {
				input = this.ec.qaDateInput;
				input.dataPoint = dataPoint;
				input.minDate = new Date(dataPoint[units].min);
				input.maxDate = new Date(dataPoint[units].max);
				if (dataPoint.value) {
					input.value = dataPoint.value;
				}
				dl = this.ec.qaDateList;
				dl.innerHTML = '';
				currentDate = input.minDate;
				while (currentDate.getTime() < input.maxDate.getTime()) {
					y = currentDate.getFullYear();
					m = currentDate.getMonth() + 1;
					d = currentDate.getDate();
					ms = (m < 10) ? '0' + m : '' + m;
					ds = (d < 10) ? '0' + d : '' + d;
					dStr2 = ms + '/' + ds + '/' + y;
					option = document.createElement('option');
					option.value = dStr2;
					option.text = dStr2;
					dl.appendChild(option);
					currentDate = currentDate.addDays(1);
				}
				this.ec.qadatapoint.style.display = 'block';
				this.ec.qaNumeric.style.display = 'none';
				this.ec.qaList.style.display = 'none';
				this.ec.qaDate.style.display = 'inline-block';
				this.ec.qaUnits.style.display = 'none';
				this.ec.qanextbtn.inputControl = input;
			} else {
				if (dataPoint[dataPoint.units].type == 'List') {
					input = this.ec.qaListInput;
					input.dataPoint = dataPoint;
					if (dataPoint.value) {
						input.value = dataPoint.value;
					}
					input.unit = dataPoint.units;
					dl = this.ec.qaListList;
					dl.innerHTML = '';
					vList = input.dataPoint[units].list;
					for (i = 0; i < vList.length; i++) {
						option = document.createElement('option');
						option.value = vList[i];
						option.text = vList[i];
						dl.appendChild(option);
					}
					this.ec.qadatapoint.style.display = 'block';
					this.ec.qaNumeric.style.display = 'none';
					this.ec.qaList.style.display = 'inline-block';
					this.ec.qaDate.style.display = 'none';
					this.ec.qaUnits.style.display = 'none';
					this.ec.qanextbtn.inputControl = input;
				} else {
					alert('Data Input is not implemented');
				}
			}
		}
	}
	tXeAtQuestion(rsp) {
		var valueDataList, vm, vc, i, title, row, pf, node, textnode;
		if (this.ec.qanextbtn.inputControl) {
			this.ec.qanextbtn.inputControl = undefined;
		}
		this.ec.qadatapoint.style.display = 'none';
		this.ec.qaContent.style.display = 'inline-block';
		if (rsp.rationale) {
			this.ec.qareasoning.innerText = rsp.rationale;
		} else {
			this.ec.qareasoning.innerText = '';
		}
		if (rsp.prompt) {
			this.ec.qaprompt.innerText = rsp.prompt;
		} else {
			this.ec.qaprompt.innerText = '';
		}
		if (rsp.hint) {
			this.ec.qaassisttext.innerText = rsp.hint;
		} else {
			this.ec.qaassisttext.innerText = '';
		}
		if (rsp.navigationMethods.includes('Next')) {
			this.ec.qanextbtn.style.display = 'inline-block';
		} else {
			this.ec.qanextbtn.style.display = 'none';
		}
		if (rsp.navigationMethods.includes('Yes')) {
			this.ec.qayesbtn.style.display = 'inline-block';
		} else {
			this.ec.qayesbtn.style.display = 'none';
		}
		if (rsp.navigationMethods.includes('No')) {
			this.ec.qanobtn.style.display = 'inline-block';
		} else {
			this.ec.qanobtn.style.display = 'none';
		}
		if ((rsp.navigationMethods.includes('Previous')) && (!this.isFirstQuestion)) {
			this.ec.qabackbtn.style.display = 'inline-block';
		} else {
			this.isFirstQuestion = false;
			this.ec.qabackbtn.style.display = 'none';
		}
		if (rsp.demographics) {
			this.demographics = rsp.demographics;
			valueDataList = this.ec.qasessiondatalist;
			valueDataList.innerHTML = "";
			vm = '';
			vc = 0;
			for (i = 0; i < this.demographicsToShow.length; i++) {
				if (rsp.demographics.hasOwnProperty(this.demographicsToShow[i])) {
					title = this.demographicsTitles[i];
					vm = rsp.demographics[this.demographicsToShow[i]];
					if (this.demographicsToShow[i] == 'dob') {
						vm = this.dateToString(new Date(vm));
					}
					row = valueDataList.insertRow(-1);
					row.insertCell(0).innerHTML = title;
					row.insertCell(1).innerHTML = vm;
					vc++;
				}
			}
		}
		if (rsp.positiveFindings) {
			this.positiveFindings = rsp.positiveFindings;
			pf = this.ec.qaPositiveFindings;
			pf.innerHTML = "";
			for (i = 0; i < rsp.positiveFindings.length; i++) {
				node = document.createElement("LI");
				textnode = document.createTextNode(rsp.positiveFindings[i]);
				node.appendChild(textnode);
				pf.appendChild(node);
			}
			this.ec.qapositivehdr.style.display = 'block';
			pf.style.display = 'block';
		} else {
			this.ec.qapositivehdr.style.display = 'none';
			this.ec.qaPositiveFindings.style.display = 'none';
		}
		if (rsp.negativeFindings) {
			this.positiveFindings = rsp.negativeFindings;
			pf = this.ec.qaNegativeFindings;
			pf.innerHTML = "";
			for (i = 0; i < rsp.negativeFindings.length; i++) {
				node = document.createElement("LI");
				textnode = document.createTextNode(rsp.negativeFindings[i]);
				node.appendChild(textnode);
				pf.appendChild(node);
			}
			this.ec.qanegativehdr.style.display = 'block';
			pf.style.display = 'block';
		} else {
			this.ec.qanegativehdr.style.display = 'none';
			this.ec.qaNegativeFindings.style.display = 'none';
		}
		if ((rsp.positiveFindings) || (rsp.negativeFindings)) {
			this.ec.findingscontainer.style.visibility = 'visible';
		} else {
			this.ec.findingscontainer.style.visibility = 'hidden';
		}
		if (rsp.values) {
			this.values = rsp.values;
			valueDataList = this.ec.valuedatalist;
			valueDataList.innerHTML = "";
			vm = '';
			vc = 0;
			for (i = 0; i < this.valuesAndMeasuresToShow.length; i++) {
				if (rsp.values.hasOwnProperty(this.valuesAndMeasuresToShow[i])) {
					title = this.valuesAndMeasuresTitles[i];
					if (this.valuesAndMeasuresUnits.hasOwnProperty(this.valuesAndMeasuresToShow[i]))
						vm = rsp.values[this.valuesAndMeasuresToShow[i]] + ' ' + this.valuesAndMeasuresUnits[this.valuesAndMeasuresToShow[i]];
					else
						vm = rsp.values[this.valuesAndMeasuresToShow[i]];
					if (typeof rsp.values[this.valuesAndMeasuresToShow[i]].getMonth === 'function')
						vm = this.dateToString(vm);
					row = valueDataList.insertRow(-1);
					row.insertCell(0).innerHTML = title;
					row.insertCell(1).innerHTML = vm;
					vc++;
				}
			}
			if (vc > 0) {
				this.ec.valuecontainer.style.visibility = 'visible';
			} else {
				this.ec.valuecontainer.style.visibility = 'hidden';
			}

		} else {
			this.ec.valuecontainer.style.visibility = 'hidden';
		}
	}
	handleLibraryClick(event) {
		alert('library is not implemented yet: ' + event.currentTarget.topic);
	}
	tXeOnError(rsp) {
		console.log('alert error', 'Error: ' + JSON.stringify(rsp, null, 2));
		alert('Error: ' + JSON.stringify(rsp, null, 2));
	}
	onDateKeypress(e) {
		var input = e.target;
		var pressedKey = String.fromCharCode(e.which);
		var iv = input.value + pressedKey;
		var listId = e.target.attributes.list.value;
		if (!this.isValidDataListPartialValue(listId, iv)) {
			e.preventDefault();
			return;
		}
		return;
	}
	onHeightKeypress(e) {
		var input = e.target;
		var pressedKey = String.fromCharCode(e.which);
		var parsedVal = parseInt(pressedKey);
		var nan = isNaN(parsedVal);
		var iv = input.value;
		var il = input.value.length;
		var validValues = input.attributes.list.value;
		if (il === 0) {
			if (nan) {
				e.preventDefault();
				return;
			}
			if (!this.isValidDataListPartialValue(validValues, pressedKey)) {
				e.preventDefault();
				return;
			}
			return;
		} else if (il == 1) {
			if ((pressedKey == "'") || (pressedKey == " ")) {
				input.value = input.value + "'";
				e.preventDefault();
				return;
			}
			if (nan) {
				e.preventDefault();
				return;
			}
			iv = iv + "'" + pressedKey;
			if (!this.isValidDataListPartialValue(validValues, iv)) {
				e.preventDefault();
				return;
			}
			input.value = iv;
			e.preventDefault();
			return;
		} else if ((il == 2) || (il == 3)) {
			if (nan) {
				e.preventDefault();
				return;
			}
			iv = iv + pressedKey;
			if (!this.isValidDataListPartialValue(validValues, iv)) {
				e.preventDefault();
				return;
			}
			input.value = iv;
			e.preventDefault();
			return;
		}
		e.preventDefault();
		return;
	}
	onNumberKeypress(e) {
		var input = e.target;
		var pressedKey = String.fromCharCode(e.which);
		if ((pressedKey === '.') && (input.step >= 1)) {
			e.preventDefault();
			return;
		}
		if (pressedKey != '.') {
			var parsedVal = parseInt(pressedKey);
			var nan = isNaN(parsedVal);
			if (nan) {
				e.preventDefault();
				return;
			}
		}
		var iv;
		if (input.selectionStart == input.selectionEnd) {
			iv = input.value + pressedKey;
		} else {
			iv = input.value.substring(input.selectionEnd) + pressedKey;
		}
		var listId = e.target.attributes.list.value;
		if (!this.isValidDataListPartialValue(listId, iv)) {
			e.preventDefault();
			return;
		}
		return;
	}
	isValidDataListPartialValue(listId, value) {
		var listElement = this.shadowRoot.getElementById(listId);
		for (var i = 0; i < listElement.options.length; i++) {
			var oVal = listElement.options[i].value;
			if (oVal.startsWith(value)) {
				return true;
			}
		}
		return false;
	}
	stringToDate(s) {
		var m = s.substring(0, 2);
		var d = s.substring(3, 5);
		var y = s.substring(6, 10);
		return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
	}
	dateToString(d) {
		if (!(d instanceof Date))
			return '';
		var m = (d.getMonth() + 1).toString();
		if (m.length < 2)
			m = '0' + m;
		var dy = d.getDate().toString();
		if (dy.length < 2)
			dy = '0' + dy;
		var y = (d.getYear() + 1900).toString();
		return m + '/' + dy + '/' + y;
	}
	controlTemplate() {
		return '<style>' +
			'#doneInstructionsLink { ' +
			'border-radius: 5px; ' +
			'}' +
			'#doneInstructionsLink:hover { ' +
			'background-color: azure;' +
			'cursor: hand;' +
			'}' +
			'#instructionLinkSection {' +
			'display: none;' +
			'}' +
			'#visitInstructionsLink { ' +
			'border-radius: 5px; ' +
			'}' +
			'#visitInstructionsLink:hover { ' +
			'background-color: azure;' +
			'cursor: hand;' +
			'}' +
			'#instructionLinkSection { ' +
			'margin-bottom: 10px; ' +
			'border-radius: round; ' +
			'}' +
			'#copyInstructionsLink:hover { ' +
			'background-color: azure;' +
			'cursor: hand;' +
			'}' +
			'#copyInstructionsLink { ' +
			'margin-top: 10px; ' +
			'border-radius: 5px; ' +
			'}' +
			'#instructionList { ' +
			'  list-style-type: none;' +
			'  border-style: solid;' +
			'  border-width: 1px;' +
			'  border-color: black;' +
			'  padding: 0px;' +
			'  margin: 4px;' +
			'  border-radius: 8px;' +
			'}' +
			'ul#instructionList li {' +
			'  padding: 4px; ' +
			'}' +
			'ul#instructionList li:first-child {' +
			'  border-top-left-radius: 8px;' +
			'  border-top-right-radius: 8px;' +
			'}' +
			'ul#instructionList li:last-child {' +
			'  border-bottom-left-radius: 8px;' +
			'  border-bottom-right-radius: 8px;' +
			'}' +
			'ul#instructionList :nth-child(odd) { ' +
			'  background-color: whitesmoke;' +
			'}' +
			'ul#instructionList :nth-child(even) { ' +
			'  background-color: gainsboro;' +
			'}' +
			'ul#instructionList li:hover { ' +
			'  background-color: azure;' +
			'  cursor: pointer;' +
			'}' +
			'#txcRsltsDSHelpPopup { ' +
			'  font-family: Helvetica, Arial, sans-serif;' +
			'}' +
			'#txcRsltsDSHelpTitle {' +
			'background: lightgray;' +
			'border-radius: 10px;' +
			'padding: 10px;' +
			'font-size: larger;' +
			'text-align: center;' +
			'margin-bottom: 10px;' +
			'}' +
			'#txcRsltsDSHelpBack {' +
			'border-radius: 10px;' +
			'float: right;' +
			'border-style: none;' +
			'cursor: pointer;' +
			'}' +
			'.txcRsltDSSubTitle {' +
			'font-weight: bold;' +
			'}' +
			'#txResultsCMEcp {' +
			'margin-bottom: 10px;' +
			'}' +
			'#txResultsCMEcpLink {' +
			'font-size: small;' +
			'margin-left: 10px;' +
			'}' +
			'.modal {' +
			'    position: fixed;' +
			'    top: 0;' +
			'    left: 0;' +
			'    bottom: 0;' +
			'    right: 0;' +
			'    display: none;' +
			'    overflow: auto;' +
			'    background-color: #000000;' +
			'    background-color: rgba(0, 0, 0, 0.7);' +
			'    z-index: 9999;' +
			'}' +
			'.modal-window {' +
			'    position: relative;' +
			'    background-color: #FFFFFF;' +
			'    width: fit-content;' +
			'    margin: 10% auto;' +
			'    padding: 20px;' +
			'    border-radius: 10px;' +
			'}' +
			'.modal-window.small {' +
			'    width: 30%;' +
			'}' +
			'.modal-window.large {' +
			'    width: 75%;' +
			'}' +
			'.close {' +
			'    position: absolute;' +
			'    top: 0;' +
			'    right: 0;' +
			'    color: rgba(0,0,0,0.3);' +
			'    height: 30px;' +
			'    width: 30px;' +
			'    font-size: 30px;' +
			'    line-height: 30px;' +
			'    text-align: center;' +
			'}' +
			'.close:hover,' +
			'.close:focus {' +
			'    color: #000000;' +
			'    cursor: pointer;' +
			'}' +
			'.open {' +
			'    display: block;' +
			'}' +
			'.cpLink:hover {' +
			'cursor: default;' +
			'}' +
			'.txCMVerbal:hover {' +
			'  background-color: #DEF;' +
			'}' +
			'.tctInput {' +
			'width: 60px;' +
			'}' +
			'#controlContainer.wait, #controlContainer.wait *{' +
			'cursor: wait !important;' +
			'}' +
			'#txResultsCMScsValue {' +
			'font-weight: bold;' +
			'}' + '#txResultsCMDcsValue {' +
			'font-weight: bold;' +
			'}' + '#txResultsCMPesValue {' +
			'font-weight: bold;' +
			'}' +
			'.txCMDescription:hover {' +
			'  background-color: #DEF;' +
			'}' +
			'.txCMVerbal input {' +
			'cursor: pointer;' +
			'}' +
			'.txCMVerbal label {' +
			'cursor: pointer;' +
			'}' +
			'.txCMVerbal {' +
			'border-radius: 10px;' +
			'background-color: #F0F0F0;' +
			'width: 75px;' +
			'margin: 5px;' +
			'padding: 5px;' +
			'}' +
			'.txCMDescription {' +
			'border-radius: 10px;' +
			'background-color: #F0F0F0;' +
			'margin: 5px;' +
			'padding: 5px;' +
			'border: 2px solid transparent;' +
			'}' +
			'#txResultsCM {' +
			'display: none;' +
			'}' +
			'#tctLibraryPopup {' +
			'display: none;' +
			'width: fit-content;' +
			'position: absolute;' +
			'padding: 10px;' +
			'background-color: #F0F0F0;' +
			'border-radius: 10px;' +
			'}' +
			'#tctImgCtr {' +
			'width: unset;' +
			'}' +
			'#tctImageContainer {' +
			'}' +
			'#tctImageBack {' +
			'position: absolute;' +
			'top:5px;' +
			'right:5px;' +
			'}' +
			'#tctlist {' +
			'   list-style-type: disc;' +
			'   margin-left: 40px;' +
			'   margin-top: 5px;' +
			'}' +
			'#tctImage {' +
			'   margin-bottom: 2px;' +
			'   margin-top: 2px;' +
			'   text-align: center;' +
			'   max-width: 480px;' +
			'}' +
			'.tctImages {' +
			'   font-weight: normal !important;' +
			'   cursor: pointer;' +
			'   text-decoration: none;' +
			'}' +
			'.tctImages:hover {' +
			'   text-decoration: underline;' +
			'}' +
			'#tctImageThumbs {' +
			'   text-align: center;' +
			'margin-left: 3px;' +
			'margin-top: 3px;' +
			'}' +
			'.tctImageThumb {' +
			'   width: 64px;' +
			'   padding: 1px;' +
			'   border-width: 1px;' +
			'   cursor: pointer;' +
			'}' +
			'.tctImageThumbWrapper {' +
			'   display: inline-block;' +
			'}' +
			'#tctLibraryBack {' +
			'position: absolute;' +
			'top:15px;' +
			'right:15px;' +
			'border-radius: 10px;' +
			'border-width: 1px;' +
			'}' +
			'.tctColumn {' +
			'   float: left;' +
			'   padding: 1px;' +
			'}' +
			'.tctLeft {' +
			'   width: 70px;' +
			'}' +
			'.tctRight {' +
			'   width: 480px;' +
			'   vertical-align: middle;' +
			'   text-align: center;' +
			'}' +
			'.tctRow {' +
			'   background-color: lightgray;' +
			'}' +
			'.tctRow:after {' +
			'   content: "";' +
			'   display: table;' +
			'   clear: both;' +
			'}' +
			'.tctImageThumb:hover {' +
			'   background-color: blue;' +
			'}' +
			'#txResultsSymDir {' +
			'display: none;' +
			'}' +
			'#txResultsSymSysConcern {' +
			'display: none;' +
			'}' +
			'#txResultsSymPr {' +
			'display: none;' +
			'}' +
			'a.tctImages:visited {' +
			'color: #38c;' +
			'}' +
			'a.tctImages {' +
			'color: #38c;' +
			'text-decoration: none;' +
			'}' +
			'.tctList {' +
			'list-style-type: disc;' +
			'margin-left: 40px;' +
			'margin-top: 5px;' +
			'margin-bottom: 5px;' +
			'}' +
			'#txResultsCMRecTcLbl {' +
			'display: inline-block;' +
			'margin-right: 10px;' +
			'margin-bottom: 10px;' +
			'}' +
			'#txResultsSymRecTcLbl {' +
			'display: inline-block;' +
			'margin-right: 10px;' +
			'margin-bottom: 10px;' +
			'}' +
			'#txResultsSymRecVcCtr {' +
			'border-radius: 10px;' +
			'background-color: #FAFAFA;' +
			'vertical-align: middle;' +
			'width: fit-content;' +
			'padding:10px;' +
			'}' +
			'#txResultsSymRecVcIns {' +
			'font-style: italic;' +
			'margin-left: 20px;' +
			'font-size: smaller;' +
			'}' +
			'#txResultsCMVcIns {' +
			'font-style: italic;' +
			'margin-left: 20px;' +
			'font-size: smaller;' +
			'}' +
			'#txResulstSym {' +
			'width: 100%;' +
			'}' +
			'#cvc {' +
			'display: none;' +
			'}' +
			'#rdemobtn {' +
			'display: none;' +
			'}' +
			'#rfindingsbtn {' +
			'display: none;' +
			'}' +
			'#rvaluebtn {' +
			'display: none;' +
			'}' + '.loader {' +
			'  border: 16px solid #f3f3f3; /* Light grey */' +
			'  border-top: 16px solid #3498db; /* Blue */' +
			'  border-radius: 50%;' +
			'  width: 120px;' +
			'  height: 120px;' +
			'  animation: spin 2s linear infinite;' +
			'}' +
			'@keyframes spin {' +
			'  0% { transform: rotate(0deg); }' +
			'  100% { transform: rotate(360deg); }' +
			'}' +
			'.rtbtn {' +
			'cursor: pointer;' +
			'}' +
			'.rtbtn:hover {' +
			'background-color: azure;' +
			'}' +
			'.rsltlist {' +
			'cursor: pointer;' +
			'font-size: .9em !important;' +
			'}' +
			'.rsltlist:hover {' +
			'background-color: azure;' +
			'}' +
			'.pibtn:hover {' +
			'  background-color: azure;' +
			'}' +
			'.ui-ccbtn {' +
			'cursor: pointer;' +
			'}' +
			'.ui-ccbtn:hover {' +
			'background-color: azure;' +
			'}' +
			'.warningIcon {' +
			'padding: 5px;' +
			'float: left;' +
			'vertical-align:middle;' +
			'display: inline-block;' +
			'width :59px;' +
			'height :50px;' +
			'background-repeat : no-repeat;' +
			'background-image : url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAyCAIAAABtSDQsAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAbfSURBVGhDzZldTFRHGIYHEqN4YwLGxKRY9cooamKqbS+srUaNiUmrbbxRBOIFjRITLxpqqq0t2lqkwSBqA9QVJWl1waZEgcpPqSLlZ1FBlv3fBRG34AIV1JSEdvvunm91mZmze3bZJrx5Y2Bmzvc9zJnvnDMj63nQE0ObrY7OOy0lKSvzGCtOSels+gMt3JhpOqbERrO1t/8EY98ydsr/73HGrK6HaOdHTsOxJHYMDpdt3PQNY5hgxfj58rvvOYeGuZHTccyIzRaHoarmK//sviTGz2gxXK+O4dqIGbFr5Gl+QkJuEK5itOTPno1ebnzUjg2xrW+gKvswVjCHqxjtVZ9k2x4OcFdF51gQG80WqwNFFrwego32HMbMFrupx8JfG7ljQOz0jOrWvXlSAA02ei+8sRYjuWuj8HSJzTZni76CKzjRSgm2XNFjPBchUk+X2OUZzYuLEwtOtDIG47kIkXpaxLb+x5UHstQKTvTXjP3y8X7bIzcXJyJHT6yUEUoq9HoItlKCPV3d0ynB6Ildw0+Ll6+QFhzm8pj/X64dxqu7aNkyXMtF0+4oiS12V9OFUhQTBwRjFqvT0194PDUZGfiZ64XRePuHCxZ7LxdTo6Mi7jY5Bz2oJLHgMOVnk5K8AZ1dsEC8CbgKM40IiMNH1uBoiO0Df1bsTRNvOpbpEcbGBwaI1+t95najRVzouLZ8T6p9YJCLrMURE5tM1u72u9IHMF57VampAB0fHzcajQp0VVoa2rmRuBYRHrQZEI2LH9YRE7tGx84vWoTbykHgXoMMiO9s2MAC2puWhhY8/sT1gwjnXktGNC5+WEdGbHH2NRYUik80/PoFYw+vX2++e5dgA7pRX/+ouhq94j1BnN9OFyAmlyW0IyHuNtkfD6KSxNxoLFq8GNOp1+uJNKCcnBy0Fy9dKpYg4uCTH1URUQlGQOxwD13ZsTN4i/EyMcrr77ExkNXX1xNpQAUFBWifGB+XliCi/fT+Bw73Ey5XCGslNplt9281qRVcXVYWsKCOjg4iDUin0yld9QcPio9nREPM+423EJ/LqGatxL2jY2fmz5cWHOZJYYL6+vqINKCKigrq83oxUlqCZxKTtJegJmKrq7/2xEnxIQV/zlhvbS0Reb3Pnz8n0oAaGhqoz+vtravDeC4CjMg3c05gH87llVoDsdFs63uEZ750FV5ctYpwAiLSgLBOqMOv0tWrpZWAJ6ANxBrOCcITOwY9ZZs3S9Ngwv6ZnCSWgIg0IIfDQR1+/Ts5iaukf3zZxk2OwfDnBGGIsTnrqKn9UpYDFdN05AiBBIlIAxoZGaGOgJqOHsW1XDTERxZD1a/IyDFwDkPsGhk7PXeutFyQgxCmas6cOQTrF7VOFa6VFnF+QkLYc4JQxFi+1Yc/E7cYyHeUMXdrK+WfquTkZIL1i1qnyt3WhgjiffOdE2R/ausLdU6gTow9vc2JKhbjogp/XL+ekgtas2YNwfpFrYIQQfr1h4y+AySj6iZFldj5ZPTiW29LX634SKC0Mm3bto1g/aJWmaQfG8ioW7cuxDmBnBh79Nbyn6VvONRH+6lTlFOmffv2ESxjWNPUKlN7Xh6icfGREXlbrlaonRPIiV2ev76Lj5cWXH5ICOj4cdxY0sKFC6lVRYgmLcG8uDi1cwIJsW9Pn3VQWnD4mhk2mymbinp6eoiXsUOHDlGrihBN+oWE7JX7D9j6JecEPLFvX95tEr+AlSjXtm+nVCF16dKlxMTEzMxM+j2kEFM6O2AgnqmEPDH25SUpKdKCw5qjJLGW9A0FhuLly8XH8xRi7OnvlF4WX0jwMcY6i4spQzhNTEzk5uaWlJTQ7+HUWVSE+FxG2Pda1ZWCKhgyiBh7+qFhrHqx4PDnBu/pQ8tgMNAq9otaw6kwKUm8sQqM7z8lgjYpr4ixe7mWnqFlTx9as2bNIli/srOzqSOkEF9aguCpSE3z7aw4Yt+e3nBP+gBGWdzYs4cCaxCRBrRr1y7qCKcbu3dLSxBUD9o7Xp4TEDG+eL5fskR8NOICRKGQ2pSenk6wftXV1VGHBiGXOGWgOr/odRC+Isb++/fCc+ImDPat6fh4iqdZGZmZYE2YN69Mr6cmbVI7igZbY0Ghck7AsKgdKnt6xVhJ5Vu32isrLXq9FlvLyz0NDS9aWp41Nz+uqeF61Yz4+i1bxCpSDDYQ+k69uk3M7h66+uFH4hYj2OjFYvq/HZbhyo6dDvcQ62ppw2i1CZ45BiE4u5pbmW7tWrHgZqbBqXtjra+2Zv4EKwYnaFlJykrxZTMzDc6SFSnMeK9LWSL4qp3JBiGgQcvwLsGL+17jbUP1TUNN7Qx19U0QOodGTCbrf71os5yvURy/AAAAAElFTkSuQmCC)' +
			'}' +
			'#warningContent {' +
			'  margin-top: 10px;' +
			'  margin-bottom: 5px;' +
			'  padding: 5px;' +
			'  font-weight: bold;' +
			'  background-color: #D6D3D6; ' +
			'  text-shadow: none;' +
			'  min-height: 50px;' +
			'  border-radius: 10px;' +
			'}' +
			'.warningText {' +
			'}' +
			'.vcimage {' +
			'vertical-align: text-bottom;' +
			'display: inline-block;' +
			'width :20px;' +
			'height :20px;' +
			'margin-right: 5px;' +
			'background-repeat : no-repeat;' +
			'background-image : url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAFGUlEQVQ4T3WVb0xTVxyG32vvvb0tLS20vdS2KKVWwAEqIggjCDJLNl0yMxcX0Q8So5NIMuMHBeMKTIaKMVEnSrIwjSFhW4h/SozTaNwYBpsg2hJdIMORFaVQaGvpH0pvu9wandPtd76dnPPk5Jzf+xwC/110dnb22oKCgvV5eXmZKpVKyS+bnJz02Gy2Ybvdfufp06e3nU6n/+3txNsTer2+tKam5kBlZeU6hULBRKNRzM3NIRKJIBaLYX5+Hl6vl7NarfcuXrzYarPZLG8y/gUsLy/f1draejQ9PT0pEAhgbGwMdrsdz58/jwPlcjnS0tKg0WggEAjgdrtDbW1tRywWy1EAHA9+DSwrK9vZ3t7exrIs5XA40NnZiWvXrmF8fAzz4XksEJBgGBFYlkVh4RpUVlZCpVKB4zicOXPGbLFYml4DjUZj6aVLl3qMRqN0ZGQEdXV1uHv3LgjEwIgkIKlERCIhkCRACfiDENCnL0F1dTX0ej38fv98Q0PDtqGhoR/5EzItLS1Xq6urTS6XC/v27cOtWzchokUwFnwOqXY9fC/cmPizHyHPGIKeEUiZMERiITSaVOzZ8wVSUlIwMDDw8PDhwxWEXq83dXV19Wg0GqqjowNNjY0gFpAwn+uAbPmnONf8A9wOO8LBSXAhH7jwLMK+cSQxHkgkQhQWFmPz5s0IhUI4fvz4DqKqquqE2Wze7/F4UFNTg8HBAWgMJnz29XlY7/wC280eENwsEIuCYKRYIKDBhQOIzDyBVhVFUlIytm3fDq1Wi8uXL3cSTU1Nlq1bt260Wq34snYvfIEgln/4Ldz+OTie/IwEEQ0IxYiCQjQwDVIsh4BKQHB6GHJiFCqlHBUVHyA/Px8PHjzoJ06fPt1nMpmKr1+/jsbGBnAxEpqVe+HzueCbHAYtUYDN+wjyVB3cjx8hPDUJMjEF0ZAHnOMKtAsZrFixGiUl72N0dPQxcfLkyTjwxo0baPnmCELhGIRsGTh+hIOgxQpoSz5B7sclmBn8C7MOL2ISNYhgAFP9dVAnR5GTuwpFRWteAg8ePGjZsmXLxsHBQZjNX+HFCx844RLEyAQIKAYkJYJMm4XF75VAt2gRvDERxCoN3I/6MdV7CCybgNUFRcjJyeFfup/YsGHDifr6+v2zs7NoaDBjZPh3+IMkIDGAFidCJE+DSKKBQpsNVXYucktSoWMZdNUfAjn9K5KVKpSVl0OtVqO7u7uTYFnWdPbs2R6tVktduXIVHR3fgaYoTPtpUJJ0yLV5kKRkQ5m+GotXLsHa4hhGLD/hXvf3UKgkSE1djKKiIoTDYTQ3N++IN/bu3buvVlVVmXw+Hx8jDA3ZIBCQ8PgIEAkGyBaugHJRPiSyGCJTfcD0ENSsHIxYiuLi4nhj9/b2Pjx16lRFPMtyubz02LFjPRkZGdJnz57hwoULGB39AzRNIcrFECNI0BQDmgRkiWJI5UmQSBOxKi8v3n9utzsevYmJiXj04rV06dKd9fX1bTqdjnLPzOC3vj7YbDYEgwFQFAmKJCFkGIjFEuh0OmRmZsblwN89L4eBgYF/5PAKajAYdtXW1h7NyspK4i3CZ3t8fBx8ingXSqVSKJVKKBUK0EIhHA5HqL29/YjNZntXX6+gDMOUbtq06UBpaek6tVrN0DQNXrI8kCCIuBedTid3//79exaLpdXlcv2/YN8wLy2TydYuW7ZsvcFgyFAoFMkEQRBer9c78rLuOJ3O2wDe+QL+BgTFFZTcqBu6AAAAAElFTkSuQmCC)' +
			'}' +
			'' +
			'#sessionNote {' +
			'  display: none;' +
			'}' +
			'body, input, select, txtarea, button {' +
			'  font-size: 1em !important;' +
			'  font-family: Helvetica, Arial, sans-serif !important;' +
			'}' +
			'#educationlog {' +
			'width: 100%;' +
			'height: 75px;' +
			'}' +
			'#notebody {' +
			'  width: 100%;' +
			'  overflow: hidden visible;' +
			'  overflow-wrap: break-word;' +
			'  resize: none;' +
			'  overflow-y: auto;' +
			'  font-size: .95em !important;' +
			'  font-family: Helvetica, Arial, sans-serif !important;' +
			'  border-radius: 10px;' +
			'  border-style: solid;' +
			'}' +
			'.pibtn {' +
			'  width: 100%;' +
			'  text-align: left;' +
			'    white-space: nowrap;' +
			'    border-radius: 5px;' +
			'    border-style: solid;' +
			'    font-size: 12pt;' +
			'    padding: 5px;    ' +
			'    cursor: pointer;' +
			'}' +
			'' +
			'#picltable {' +
			'    display: table;' +
			'    width: 100%;' +
			'    border-collapse: separate;' +
			'    border-spacing: .5em;' +
			'}' +
			'.trow {' +
			'    display: table-row;' +
			'    width: 100%;' +
			'}' +
			'.tcb {' +
			'    cursor: pointer;' +
			'}' +
			'.tcb input {' +
			'    cursor: pointer;' +
			'}' +
			'.tcb:hover {' +
			'background-color: azure;' +
			'}' +
			'.tcb input:hover {' +
			'background-color: azure;' +
			'}' +
			'.tcb label:hover {' +
			'background-color: azure;' +
			'}' + '.tcb label {' +
			'    cursor: pointer;' +
			'}' +
			'.tcb {' +
			'    white-space: nowrap;' +
			'    border-radius: 10px;' +
			'    background-color: #f6f6f6;' +
			'}' +
			'.tcell {' +
			'    display: table-cell;' +
			'}' +
			'.tab ul {' +
			'  list-style-type: none;' +
			'  margin: 0;' +
			'  padding: 0;' +
			'}' +
			'#sysconcerncontainer {' +
			'  display: none;' +
			'}' +
			'#recommendationscontainer {' +
			'  display: none;' +
			'}' +
			'#predicteresourcescontainer {' +
			'  display: none;' +
			'}' +
			'#picontainer {' +
			'  display: none;' +
			'}' +
			'#piclcontainer {' +
			'  display: none;' +
			'}' +
			'.tab button:hover {' +
			'  background-color: #ededed;' +
			'}' +
			'.tab .active {' +
			'  background-color: #38c;' +
			'  color: white;' +
			'}' +
			'.tab .disabled {' +
			'  background-color: inherit;' +
			'  color: #333;' +
			'  cursor: inherit;' +
			'  opacity: .3;' +
			'}' +
			'.tab button {' +
			'  background-color: #f6f6f6;' +
			'  color: black;' +
			'  padding: 10px;' +
			'  width: 100%;' +
			'  border: none;' +
			'  outline: none;' +
			'  text-align: Left;' +
			'  cursor: pointer;' +
			'  font-size: 16px;' +
			'  font-weight: bold;' +
			'  display: inline-block;' +
			'}' +
			'.tab .buttonTop {' +
			'  border-top-left-radius: 10px;' +
			'  border-bottom: 1px solid gray;' +
			'}' +
			'.tab .buttonBottom {' +
			'  border-bottom-left-radius: 10px;' +
			'  border-top: 1px solid gray;' +
			'}' +
			'.content {' +
			'  vertical-align: top;' +
			'  display: inline-block;' +
			'  width: 80%;' +
			'  font-family: Helvetica, Arial, sans-serif;' +
			'}' +
			'.tab {' +
			'  display: inline-block;' +
			'}' +
			'.contentPanel {' +
			'  vertical-align: top;' +
			'  width: 100%;' +
			'  margin-left: 10px;' +
			'}' +
			'.contentPanel#mmContent input {' +
			'  width: 100%;' +
			'' +
			'}' +
			'.mmDisplayList ul {' +
			'}' +
			'#mmList {' +
			'  display: none;' +
			'  list-style: none;' +
			'  border-radius: 10px;' +
			'  box-shadow: 0 0 1px 1px white;' +
			'  padding-left: 0;' +
			'  width: 100%;' +
			'  font-family: sans-serif;' +
			'  font-weight: 700;' +
			'  font-size: 14px;' +
			'  white-space: nowrap;' +
			'  background-clip: padding-box;' +
			'  background-color: #f6f6f6;' +
			'}' +
			'#mmList li {' +
			' border-bottom: 1px solid #ddd;' +
			' padding-left: 16px;' +
			' padding-right: 16px;' +
			' padding-top: 6px;' +
			' padding-bottom: 6px;' +
			'}' +
			'#mmlist li:hover {' +
			'  background-color: #e8e8e8;' +
			'  cursor: pointer;' +
			'}' +
			'#mmList li:last-child {' +
			' border-bottom: none;' +
			'}' +
			'#mmInput {' +
			'  font-size: 16px;' +
			'  padding-left: 32px;' +
			'  height: 30px;' +
			'  border-radius: 10px;' +
			'  background: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIzMnB4IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMycHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48dGl0bGUvPjxkZXNjLz48ZGVmcy8+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSI+PGcgZmlsbD0iIzkyOTI5MiIgaWQ9Imljb24tMTExLXNlYXJjaCI+PHBhdGggZD0iTTE5LjQyNzExNjQsMjAuNDI3MTE2NCBDMTguMDM3MjQ5NSwyMS40MTc0ODAzIDE2LjMzNjY1MjIsMjIgMTQuNSwyMiBDOS44MDU1NzkzOSwyMiA2LDE4LjE5NDQyMDYgNiwxMy41IEM2LDguODA1NTc5MzkgOS44MDU1NzkzOSw1IDE0LjUsNSBDMTkuMTk0NDIwNiw1IDIzLDguODA1NTc5MzkgMjMsMTMuNSBDMjMsMTUuODQ3MjEwMyAyMi4wNDg2MDUyLDE3Ljk3MjIxMDMgMjAuNTEwNDA3NywxOS41MTA0MDc3IEwyNi41MDc3NzM2LDI1LjUwNzc3MzYgQzI2Ljc4MjgyOCwyNS43ODI4MjggMjYuNzc2MTQyNCwyNi4yMjM4NTc2IDI2LjUsMjYuNSBDMjYuMjIxOTMyNCwyNi43NzgwNjc2IDI1Ljc3OTYyMjcsMjYuNzc5NjIyNyAyNS41MDc3NzM2LDI2LjUwNzc3MzYgTDE5LjQyNzExNjQsMjAuNDI3MTE2NCBMMTkuNDI3MTE2NCwyMC40MjcxMTY0IFogTTE0LjUsMjEgQzE4LjY0MjEzNTgsMjEgMjIsMTcuNjQyMTM1OCAyMiwxMy41IEMyMiw5LjM1Nzg2NDE3IDE4LjY0MjEzNTgsNiAxNC41LDYgQzEwLjM1Nzg2NDIsNiA3LDkuMzU3ODY0MTcgNywxMy41IEM3LDE3LjY0MjEzNTggMTAuMzU3ODY0MiwyMSAxNC41LDIxIEwxNC41LDIxIFoiIGlkPSJzZWFyY2giLz48L2c+PC9nPjwvc3ZnPg==") no-repeat left center;' +
			'}' +
			'input[type=text], textarea {' +
			'  -webkit-transition: all 0.30s ease-in-out;' +
			'  -moz-transition: all 0.30s ease-in-out;' +
			'  -ms-transition: all 0.30s ease-in-out;' +
			'  -o-transition: all 0.30s ease-in-out;' +
			'  outline: none;' +
			'  padding: 3px 0px 3px 3px;' +
			'  margin: 5px 1px 3px 0px;' +
			'  border: 1px solid #DDDDDD;' +
			'}' +
			' ' +
			'input[type=text]:focus, textarea:focus {' +
			'  box-shadow: 0 0 5px rgba(81, 203, 238, 1);' +
			'  padding: 3px 0px 3px 3px;' +
			'  margin: 5px 1px 3px 0px;' +
			'  border: 1px solid rgba(81, 203, 238, 1);' +
			'}' +
			'' +
			'#qaContent {' +
			'  display: none;' +
			'  font-size: .95em;' +
			'}' +
			'.qaDataPoint {' +
			'  text-align: center;' +
			'  margin-bottom: 20px;' +
			'}' +
			'#qaNumeric {' +
			'  display: none;' +
			'}' +
			'#qaNumber {' +
			'  min-width: 100px;' +
			'}' +
			'#qaDate {' +
			'  display: none;' +
			'}' +
			'#qaList {' +
			'  display: inline-block;' +
			'}' +
			'#qaUnits {' +
			'  display: none;' +
			'}' +
			'' +
			'#qaassisttext {' +
			'  display: table;' +
			'  margin: 10px auto;' +
			'  padding: 5px 15px;' +
			'  font-size: 14pt;' +
			'  text-shadow: none;' +
			'  font-family: Helvetica, Arial, sans-serif;' +
			'  line-height: 115%;' +
			'  max-width: 400px;' +
			'  font-style: italic;' +
			'}' +
			'' +
			'.qabtns {' +
			'  text-align: center;' +
			'}' +
			'.qabtn:hover {' +
			'  background-color: #F0F0F0;' +
			'}' +
			'.qabtn {' +
			'  text-align: center;' +
			'  border-radius: 10px;' +
			'  font-size: 12pt;' +
			'  font-weight: 600;' +
			'  box-shadow: none;' +
			'  border-style: none;' +
			'  padding: 12px 8px 12px 8px;' +
			'  cursor: pointer;' +
			'  background-color: #FAFAFA;' +
			'  min-width: 80px;' +
			'  border-width: 1px;' +
			'  border-style: solid;' +
			'  border-color: #E8E8E8;' +
			'  margin-left: 10px;' +
			'}' +
			'.qatext {' +
			'  font-size: larger;' +
			'  font-family: Hevetica, Arial, sans-serif;' +
			'  text-align: center;' +
			'  margin-top: 10px;' +
			'  margin-bottom: 10px;' +
			'  min-height: 84px;' +
			'}' +
			'#qareasoning {' +
			'  font-size: 14pt;' +
			'  text-shadow: none;' +
			'  display: block;' +
			'  padding: 7px;' +
			'}' +
			'.findings {' +
			'  list-style-type: none;' +
			'  padding-inline-start: 0;' +
			'  padding-left: 0;' +
			'  margin: 0 0 5px 0;' +
			'}' +
			'.findings li:nth-child(odd) { background: inherit; }' +
			'.findings li:nth-child(even) { background: #eee; }' +
			'' +
			'.findingshdr {' +
			'  background: #ddd;' +
			'  text-align: center;' +
			'  border-radius: 10px;' +
			'  font-size: 16px;' +
			'}' +
			'.rtbtn {' +
			'  border-radius: 10px;' +
			'  box-shadow: none;' +
			'  border-style: none;' +
			'  padding: 8px;' +
			'  margin-left: 10px;' +
			'}' +
			'#libraryContentPanel {' +
			'  display: none;' +
			'  position: relative;' +
			'}' +
			'#rsltContent {' +
			'  display: none;' +
			'  position: relative;' +
			'}' +
			'.rsltheader {' +
			'  background-color: lightgray;' +
			'  width: 100%;' +
			'  font-family: Hevetica, Arial, sans-serif;' +
			'  border-radius: 10px;' +
			'  padding: 5px;' +
			'  margin-top: 10px;' +
			'  margin-bottom: 5px;' +
			'  font-weight: bold;' +
			'}' +
			'.rslthdrright {' +
			'  float: right;' +
			'}' +
			'.rslthdr {' +
			'  margin-bottom: 10px;' +
			'}' +
			'#notehdr {' +
			'  margin-bottom: 10px;' +
			'}' +
			'.rslttitle {' +
			'  font-weight: bold;' +
			'  font-size: 18pt;' +
			'}' +
			'.rsltrectitle {' +
			'  display: inline-block;' +
			'}' +
			'.rsltlist {' +
			'  display: inline-block;' +
			'}' +
			'.rsltitem {' +
			'  margin-left: 10px;' +
			'  margin-bottom: 10px;' +
			'}' +
			'#piincludebox {' +
			'  border-radius: 10px;' +
			'  border-width: 1px;' +
			'  border-color: black;' +
			'  border-style: solid;' +
			'  display: inline-block;' +
			'  padding: 5px;' +
			'}' +
			'#predicteresourcescontainer {' +
			'}' +
			'.qaheader {' +
			'  background-color: lightgray;' +
			'  width: 100%;' +
			'  margin-left: 10px;' +
			'  font-family: Hevetica, Arial, sans-serif;' +
			'  border-radius: 10px;' +
			'}' +
			'.ddcontrol {' +
			'  display: inline-block;' +
			'  padding: 0px 4px 4px 4px;' +
			'}' +
			'#piincludebox checkbox {' +
			'  cursor: pointer;' +
			'}' +
			'#piincludebox label {' +
			'  cursor: pointer;' +
			'}' +
			'#piincludebox checkbox:hover {' +
			'  background-color: azure;' +
			'}' +
			'#piincludebox label:hover {' +
			'  background-color: azure;' +
			'}' +
			'#notebtn {' +
			'  cursor: pointer;' +
			'}' +
			'#resultsabortbtn {' +
			'  cursor: pointer;' +
			'}' +
			'#notebtn:hover {' +
			'  background-color: azure;' +
			'}' +
			'#resultsabortbtn:hover {' +
			'  background-color: azure;' +
			'}' +
			'.ddbutton {' +
			'  background-clip: padding-box;' +
			'  box-shadow: none;' +
			'  border-style: none;' +
			'  padding: 8px 24px 8px 8px;' +
			'  background-color: #f0f0f0;' +
			'  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMyIDMyIiBoZWlnaHQ9IjMycHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMycHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxwYXRoIGQ9Ik0yNC4yOTEsMTQuMjc2TDE0LjcwNSw0LjY5Yy0wLjg3OC0wLjg3OC0yLjMxNy0wLjg3OC0zLjE5NSwwbC0wLjgsMC44Yy0wLjg3OCwwLjg3Ny0wLjg3OCwyLjMxNiwwLDMuMTk0ICBMMTguMDI0LDE2bC03LjMxNSw3LjMxNWMtMC44NzgsMC44NzgtMC44NzgsMi4zMTcsMCwzLjE5NGwwLjgsMC44YzAuODc4LDAuODc5LDIuMzE3LDAuODc5LDMuMTk1LDBsOS41ODYtOS41ODcgIGMwLjQ3Mi0wLjQ3MSwwLjY4Mi0xLjEwMywwLjY0Ny0xLjcyM0MyNC45NzMsMTUuMzgsMjQuNzYzLDE0Ljc0OCwyNC4yOTEsMTQuMjc2eiIgZmlsbD0iIzUxNTE1MSIvPjwvc3ZnPg==);' +
			'  background-repeat: no-repeat;' +
			'  background-position: 95% 50%;' +
			'  background-size: 16px 16px;' +
			'  border-radius: 10px;' +
			'  cursor: pointer;' +
			'}' +
			'.ddbutton:hover {' +
			'background-color: azure;' +
			'}' +
			'.ddtable {' +
			'  display: none;' +
			'  z-index: 1000;' +
			'  position: absolute;' +
			'  border-radius: 10px;' +
			'  border-width: 1px;' +
			'  border-style: solid;' +
			'  border-spacing: 0;' +
			'  border-collapse: collapse;' +
			'  background-color: white;' +
			'  font-size: .95em;' +
			'  padding: 5px;' +
			'}' +
			'.ddtable td {' +
			'  padding: 5px 3px 5px 3px;' +
			'}' +
			'' +
			'.ddtable tr:nth-child(odd) {' +
			'  background: inherit;' +
			'}' +
			'.ddtable tr:nth-child(even) {' +
			'  background: #EEE;' +
			'}' +
			'' +
			'</style>' +
			'<div id="controlContainer">' +
			'<div class="tab" id="tab">' +
			'	<ul>' +
			'		<li>' +
			'			<button class="tablinks buttonTop active" id="qAndA">Q&A</button>' +
			'		</li>' +
			'		<li>' +
			'			<button class="tablinks" id="instructions">Instructions</button>' +
			'		</li>' +
			'		<li>' +
			'			<button class="tablinks buttonBottom" id="results">Results</button>' +
			'		</li>' +
			'	</ul>' +
			'</div>' +
			'<div class="content" id="tabContent">' +
			'	<div id="qaContentPanel">' +
			'		<div class="contentPanel" id="mmContent">' +
			'			<input type="text" id="mmInput" placeholder="Begin typing to select a symptom or condition...">' +
			'				<div class="contentPanel" id="warningContent" style="display: none;">' +
			'					<div class="warningIcon"></div>' +
			'					<span class="warningText">The VA software license for TriageXpert Call Center is restricted to the performance of telephone triage services. Use of TriageXpert Call Center to support triage via chat, triage at point-of-care in the clinic, or triage in the emergency room is strictly prohibited.</span>' +
			'				</div>' +
			'				<ul id="mmList" class="mmDisplayList"></ul>' +
			'			</div>' +
			'			<div class="contentPanel" id="qaContent">' +
			'				<div class="qaheader">' +
			'					<span id="qareasoning"></span>' +
			'					<div class="ddcontrol" id="democontainer">' +
			'						<button class="ddbutton" id="demobtn">Demographics</button>' +
			'						<table class="ddtable" id="qasessiondatalist" style="white-space: nowrap;">' +
			'							<tbody id="qaDemoTable"></tbody>' +
			'						</table>' +
			'						<div class="ddcontrol" id="findingscontainer">' +
			'							<button class="ddbutton" id="findingsbtn">Findings</button>' +
			'						</div>' +
			'						<table class="ddtable" id="findingsdatalist" style="white-space: nowrap;">' +
			'							<tbody>' +
			'								<tr>' +
			'									<td>' +
			'										<div class="findingshdr" id="qapositivehdr">Positive</div>' +
			'										<ul class="findings" id="qaPositiveFindings"></ul>' +
			'										<div class="findingshdr" id="qanegativehdr">Negative</div>' +
			'										<ul class="findings" id="qaNegativeFindings"></ul>' +
			'									</td>' +
			'								</tr>' +
			'							</tbody>' +
			'						</table>' +
			'					</div>' +
			'					<div class="ddcontrol" id="valuecontainer">' +
			'						<button class="ddbutton" id="valuebtn">Values</button>' +
			'					</div>' +
			'					<table class="ddtable" id="valuedatalist" style="white-space: nowrap;">' +
			'						<tbody id="qaValueTable"></tbody>' +
			'					</table>' +
			'				</div>' +
			'				<div class="qabox" id="qapromptbox">' +
			'					<div class="qatext" id="qaprompt"></div>' +
			'					<div class="qaDataPoint" id="qadatapoint">' +
			'						<div id="qaNumeric">' +
			'							<input id="qaNumber" list="qaNumericList">' +
			'								<datalist id="qaNumericList"></datalist>' +
			'							</div>' +
			'							<div id="qaDate">' +
			'								<input id="qaDateInput" list="qaDateList">' +
			'                                                                <datalist id="qaDateList"></datalist>' +
			'								</div>' +
			'								<div id="qaList">' +
			'									<input id="qaListInput" list="qaListList">' +
			'                                                                        <datalist id="qaListList"></datalist>' +
			'								</div>' +
			'								<div id="qaSelect">' +
			'									<select id="qaSelectInput"></select>' +
			'								</div>' +
			'								<div id="qaUnits">' +
			'									<select id="qaUnitSelection"></select>' +
			'									<div id="qaUnitText"></div>' +
			'								</div>' +
			'							</div>' +
			'						</div>' +
			'						<div class="qabtns">' +
			'							<button class="qabtn" id="qabackbtn">Back</button>' +
			'							<button class="qabtn" id="qayesbtn">Yes</button>' +
			'							<button class="qabtn" id="qanobtn">No</button>' +
			'							<button class="qabtn" id="qanextbtn">Next</button>' +
			'						</div>' +
			'						<div id="qaassisttext"></div>' +
			'					</div>' +
			'				</div>' +
			'   <div id="libraryContentPanel" class="content">' +
			'   <fieldset id="instructionLinkSection">' +
			'   <legend>Selected Instructions</legend>' +
			'   <ul id="instructionList">' +
			'   </ul>' +
			'   <button id="copyInstructionsLink">Copy Instruction Link</button>' +
			'   <button id="visitInstructionsLink">Visit Instruction Page</button>' +
			'   <button id="doneInstructionsLink">Done</button>' +
			'   </fieldset>' +
			'		<dshi-TXL id="insTXL" data-instructions="true"></dshi-TXL>' +
			'   </div>' +
			'				<div class="contentPanel" id="rsltContent">' +
			'					<div id="sessionNote">' +
			'						<div class="rsltheader">' +
			'							<div class="rslthdr">' +
			'								<span class="rslttitle">Note</span>' +
			'								<span class="rslthdrright">' +
			'									<button id="closenotebtn" class="rtbtn">View Results</button>' +
			'								</span>' +
			'							</div>' +
			'						</div>' +
			'						<div class="notehdr">' +
			'							<span class="rslthdrright">' +
			'								<button id="notedonebtn" class="rtbtn">Done</button>' +
			'								<button id="noteabortbtn" class="rtbtn">Abort</button>' +
			'							</span>' +
			'						</div>' +
			'						<textarea readonly id="notebody"></textarea>' +
			'					</div>' +

			'   <div id="sessionResults" class="content">' +
			'       <div class="rsltheader">' +
			'           <div class="rslthdr">' +
			'               <span class="rslttitle">Results</span>' +
			'               <span class="rslthdrright">' +
			'   	        <button id="notebtn" class="rtbtn">Note</button>' +
			'                   <button id="resultsabortbtn" class="rtbtn">Abort</button>' +
			'               </span>' +
			'           </div>' +
			'       </div>' +
			'       <div id="txResultsCM">' +
			'           <div id="txResultsCMRec">' +
			'               <div id="txResultsCMRecHdr" class="rsltheader">Recommendations</div>' +
			'               <div id="txResultsCMRecTc">' +
			'                   <div id="txResultsCMRecTcLbl">Triage Class</div>' +
			'                   <select id="txResultsCMRecTcVal">' +
			'                       <option value="1">1</option>' +
			'                       <option value="2">2</option>' +
			'                       <option value="3">3</option>' +
			'                       <option value="4">4</option>' +
			'                       <option value="5">5</option>' +
			'                   </select>' +
			'                   <div id="txResultsCMRecVcCtr">' +
			'                       <input type="checkbox" id="txResultsCMRecVc">' +
			'                       <label for="txResultsCMRecVc">Refer to virtual care</label>' +
			'                   </div>' +
			'                   <div id="txResultsCMVcIns">Uncheck if no referral to virtual care</div>' +
			'               </div>' +
			'               <div id="txResultsCMDs">' +
			'                   <div id="txResultsCMDsHdr" class="rsltheader">Disease Status<span id="txcRsltsDSHelpShow" style="float:right; color: blue; cursor: pointer; margin-right: 5px; font-weight: normal;" title="Explain Disease Status">&#128712;</span></div>' +
			'                   <div id="txResultsCMScs">&#x1F4C8;&nbsp;Symptom Control Score:&nbsp;<span id="txResultsCMScsValue"></span>&nbsp;&nbsp;[1-7 scale | 7 = best control]</div>' +
			'                   <div id="txResultsCMDcs">&#x1F4C8;&nbsp;Disease Control Score:&nbsp;<span id="txResultsCMDcsValue"></span>%&nbsp;&nbsp;[100% = perfect control]</div>' +
			'                   <div id="txResultsCMPes">&#x1F4C8;&nbsp;Patient Effort Score:&nbsp;<span id="txResultsCMPesValue"></span>%&nbsp;&nbsp;[100% = perfect adherence]</div>' +
			'               </div>' +
			'               <div id="txResultsCMEducation">' +
			'                   <div id="txResultsCMEducationHdr" class="rsltheader">Targeted Education</div>' +
			'                   <div id="txResultsCMEducationTbl"></div>' +
			'                   <div id="txResultsCMEducationLogLbl" style="display: none;">Nurse Education Notes:</div>' +
			'                   <textarea id="educationlog" class="rsltitem" style="overflow: hidden visible; overflow-wrap: break-word; resize: horizontal; display: none;"></textarea>' +
			'               </div>' +
			'		<div id="txResultsCMEcp">' +
			'			<div id="txResultsCMEcpHdr" class="rsltheader">Targeted Education Online</div>' +
			'			<a href="https://" id="txResultsCMEcpLink" target="_blank">Link</a>' +
			'		</div>' +
			'           </div>' +
			'       </div>' +
			'       <div id="txResultsSym">' +
			'           <div id="txResultsSymSysConcern">' +
			'               <div id="txResultsSymSysConcernHdr" class="rsltheader">System Concern</div>' +
			'               <div id="txResultsSymSysConcernVal"></div>' +
			'           </div>' +
			'           <div id="txResultsSymRec">' +
			'               <div id="txResultsSymRecHdr" class="rsltheader">Recommendations</div>' +
			'               <div id="txResultsSymRecTc">' +
			'                   <div id="txResultsSymRecTcLbl">Triage Class</div>' +
			'                   <select id="txResultsSymRecTcVal">' +
			'                       <option value="1">1</option>' +
			'                       <option value="2">2</option>' +
			'                       <option value="3">3</option>' +
			'                       <option value="4">4</option>' +
			'                       <option value="5">5</option>' +
			'                   </select>' +
			'                   <div id="txResultsSymRecVcCtr">  ' +
			'                   <input type="checkbox" id="txResultsSymRecVc">' +
			'                   <label for="txResultsSymRecVc">Refer to Virtual Care</label>' +
			'                   </div>  ' +
			'                   <div id="txResultsSymRecVcIns">Uncheck if no referral to virtual care</div>' +
			'               </div>' +
			'               <div id="txResultsSymDir">' +
			'                   <div id="txResultsSymDirHdr" class="rsltheader">Virtual Care Directives</div>' +
			'                   <ul id="txResultsSymDirLst"></ul>' +
			'               </div>' +
			'               <div id="txResultsSymPr">' +
			'                   <div id="txResultsSymPrHdr" class="rsltheader">Predicted Resources</div>' +
			'                   <div id="txResultsSymPrTtl">This patient is at higher risk for requiring:</div>' +
			'                   <ul id="txResultsSymPrLst"></ul>' +
			'               </div>' +
			'           </div>' +
			'       </div>' +
			'  </div>  ' +
			'   <div id="tctImagePopup" class="modal">' +
			'	<div class="modal-window">' +
			'       <div id="tctImgCtr" class="tctRow">' +
			'           <div id="tctImageThumbs" class="tctColumn tctLeft">' +
			'           </div>' +
			'           <div id="tctImageContainer" class="tctColumn tctRight ">' +
			'              <button id="tctImageBack">back</button>' +
			'		<img id="tctImage">' +
			'           </div>' +
			'       </div>' +
			'       </div>' +
			'  </div>' +
			'</div>' +
			'<div style="text-align: right;"><span style="font-weight: bold">TXCW</span>&nbsp;&copy; 1990-2020 DSHI Systems, Inc.</div>' +
			'                            </div>' +
			'   <div id="tctLibraryPopup">' +
			'       	<button id="tctLibraryBack">Back to Results</button>' +
			'		<dshi-TXL id="tctTXL" data-popup="true"></dshi-TXL>' +
			'  </div>' +
			'<div id="txcRsltsDSHelpPopup" class="modal">' +
			'<div class="modal-window">' +
			'<div id="txcRsltsDSHelpTitle">Disease Status<button id="txcRsltsDSHelpBack" style="float: right;">back</button></div>' +
			'<div class="txcRsltDSSubTitle">&#x1F4C8;&nbsp;Symptom Control Score</div>' +
			'<ul class="txcRsltsDSList">' +
			'<li>7- level scale</li>' +
			'<li>7 = perfect symptom control</li>' +
			'<li>Calculated using only symptoms, biometric, and critical comorbidity data</li>' +
			'<li>Detect <b>acute decompensation</b></li>' +
			'</ul>' +
			'<div class="txcRsltDSSubTitle">&#x1F4C8;&nbsp;Disease Control Score</div>' +
			'<ul class="txcRsltsDSList">' +
			'<li>100% = perfect disease control</li>' +
			'<li>Calculated using all available data: symptoms, biometrics, comorbidities, non-adherence, social factors, and medical gaps in care</li>' +
			'<li>Variables are weighted based on relative negative impact on disease</li>' +
			'<li>Detect <b>subacute decompensation</b></li>' +
			'</ul>' +
			'<div class="txcRsltDSSubTitle">&#x1F4C8;&nbsp;Patient Effort Score</div>' +
			'<ul class="txcRsltsDSList">' +
			'<li>100% = perfect adherence</li>' +
			'<li>Calculated using only variables in the patient\'s control</li>' +
			'<li>Variables are weighted based on relative negative impact on disease</li>' +
			'<li>Detect <b>adherence issues</b> and need for education</li>' +
			'</ul>' +
			'</div>' +
			'</div>';
	}
}
/* txEngine 1.0.0
 */
function tXengine(options, THIS) {
	this.sym = loadSymMenu("https://expert.dshisystems.net/txcmenu.json", THIS);
	this.scope = THIS;
	this.localDemographics = {};
	this.demographicList = ['cc', 'gender', 'age', 'dob'];
	this.valueList = ['height', 'weight', 'systolicbloodpressure', 'diastolicbloodpressure', 'temperature', 'serumglucose', 'pefrbaseline', 'pefrcurrent', 'lnmp', 'respiratoryrate', 'pulse', 'gestationalage', 'bmi', 'peakflowpctbest', 'painscale', 'durationofcomplaint', 'starttime', 'duration', 'ox', 'meanarterialpressure', 'modifiedshockindex', 'pulsepressure', 'duration'];
	this.whereMap = {
		"Emergency Room": "Emergency department",
		"Doctor Office": "Clinic | Office",
		"Doctor eVisit": "Virtual Care",
		"Urgent Care": "Urgent care center",
		"Dentist Office": "Dentist Office"
	};
	this.whenMap = {
		"911 emergency": "Now, 911",
		"Immediate": "Now",
		"1-2 weeks": "Within 2 Weeks",
		"Self-care": "Self-care",
		"2-3 days": "Within 3 Days",
		"2-8 hours": "Within 8 Hours",
		"12-24 hours": "Within 24 Hours"
	};
	if ((!options.appId) || (options.appId === '')) {
		throw ('Required Application Id (appID) is not provided.');
	}
	this.appId = options.appId;
	if ((options.url) && (options.url !== '')) {
		this.url = options.url;
	} else {
		if (!window.location.origin) {
			this.url = window.location.protocol + '//' + window.location.host;
		} else {
			this.url = window.location.origin;
		}
	}
	if (options.timeout) {
		this.timeout = options.timeout;
	} else {
		this.timeout = 10000;
	}
	if (!_isSetup(this)) {
		throw ('Missing Required Options');
	}

	function _isSetup(THIS) {
		if ((!THIS.url) || (THIS.url === '')) {
			return false;
		}
		if ((!THIS.appId) || (THIS.appId === '')) {
			return false;
		}
		return true;
	}

	function loadSymMenu(req, THIS) {
		var i;
		fetch(req).then(function(response) {
			if (!response.ok) {
				console.error('tX: Response: ' + response.status + ' ' + response.statusText);
				if ((this.listeners) && (this.listeners.onError)) {
					for (i = 0; i < this.listeners.onError.length; i++) {
						this.listeners.onError[i](response);
					}
				}
				return;
			}
			return response.json();
		}.bind(THIS)).then(function(symJson) {
			this.sym = symJson;
		}.bind(THIS));
	}

	function _calculateAgeYM(dob) {
		var date;
		if (typeof dob === 'string') {
			date = new Date(dob);
		} else {
			if (typeof dob === 'object') {
				date = dob;
			} else {
				throw new Error('Invalid type for date variable passed to calculateAge');
			}
		}
		var today = new Date();
		var months;
		months = (today.getFullYear() - date.getFullYear()) * 12;
		months += today.getMonth();
		months -= date.getMonth();
		months = (months > 0) ? months : 1;
		if (months < 36) {
			return months + ' Months';
		}
		var years = Math.floor(months / 12);
		return years + ' Years';
	}
	this.start = function(chiefComplaint, dob, gender, values) {
		var property, pText, vl, vu, sp;
		var req = this.url + '?m=Start&appID=' + this.appId + '&d=1&v=' + gender + '&d=300&v=' + _calculateAgeYM(dob).replace(' ', '&u=') + '&d=200&v=' + chiefComplaint;
		if (values) {
			for (property in values) {
				if (values[property].value) {
					pText = property;
					if (pText.substr(0, 2) == 'D_') {
						pText = pText.substr(2);
					}
					if (pText.toLowerCase() == 'durationofchiefcomplaint') {
						pText = '103';
					}
					req += '&d=' + pText + '&v=' + values[property].value;
					if (values[property].units) {
						req += '&u=' + values[property].units;
					}
				} else {
					vl = values[property];
					vu = null;
					if (typeof vl === 'string') {
						sp = vl.indexOf(' ');
						if (sp >= 0) {
							vu = vl.substring(sp + 1);
							vl = vl.substring(0, sp);
						}
						vl = vl.replace('%', '%25');
					}
					if ((property == 'ln') || (property == 'dob')) {
						vl = dateToString(vl).replace('/', '%2f');
					}
					req += '&d=' + property.toLowerCase() + '&v=' + vl;
					if (vu) {
						req += '&u=' + vu.replace('%', '%25');
					}
				}
			}
		}
		this.localDemographics.dob = dob;
		_processRequest(req, this);
	};
	this.yes = function() {
		if (!this.sessionId) {
			console.trace("undefined session trace:");
			var err = new Error();
			alert('Undefined SessonId:\n' + err.stack);
			return;
		}
		var req = this.url + '?m=Walk&session=' + this.sessionId + '&navigationMethod=yes';
		_processRequest(req, this);
	};
	this.no = function() {
		if (!this.sessionId) {
			console.trace("undefined session trace:");
			var err = new Error();
			alert('Undefined SessonId:\n' + err.stack);
			return;
		}
		var req = this.url + '?m=Walk&session=' + this.sessionId + '&navigationMethod=no';
		_processRequest(req, this);
	};
	this.next = function(value, units) {
		if (!this.sessionId) {
			console.trace("undefined session trace:");
			var err = new Error();
			alert('Undefined SessonId:\n' + err.stack);
			return;
		}
		var req = this.url + '?m=Walk&session=' + this.sessionId + '&navigationMethod=next';
		if (value) {
			req += '&value=' + value;
		}
		if (units) {
			req += '&units=' + units;
		}
		_processRequest(req, this);
	};
	this.previous = function() {
		if (!this.sessionId) {
			console.trace("undefined session trace:");
			var err = new Error();
			alert('Undefined SessonId:\n' + err.stack);
			return;
		}
		var req = this.url + '?m=Walk&session=' + this.sessionId + '&navigationMethod=previous';
		_processRequest(req, this);
	};
	this.abort = function(reason) {
		var req, err;
		if (!this.sessionId) {
			console.trace("undefined session trace:");
			err = new Error();
			alert('Undefined SessonId:\n' + err.stack);
			return;
		}
		req = this.url + '?m=abort';
		if (reason) {
			req += '&reason=' + reason;
		}
		_processRequest(req, this);
	};

	function _setBtnDisabled(element, selector, state) {
		THIS.ec.qanobtn.disabled = state;
		THIS.ec.qayesbtn.disabled = state;
		THIS.ec.qanextbtn.disabled = state;
		THIS.ec.qabackbtn.disabled = state;
	}

	function _processRequest(req, THIS) {
		var unitObject, entry, demographics, values, eName, eValue, eUnits, careLink, cpe, isCM;
		_setBtnDisabled(THIS.scope.shadowRoot, '.qabtn', true);
		THIS.scope.ec.controlContainer.classList.add('wait');
		fetch(req).then(function(response) {
			var i;
			if (!response.ok) {
				THIS.scope.ec.controlContainer.classList.remove('wait');
				_setBtnDisabled(THIS.scope.shadowRoot, '.qabtn', false);
				console.error('tX: Response: ' + response.status + ' ' + response.statusText);
				if ((this.listeners) && (this.listeners.onError)) {
					for (i = 0; i < this.listeners.onError.length; i++) {
						this.listeners.onError[i](response);
					}
				}
				return;
			}
			return response.json();
		}.bind(THIS)).then(function(rspJSON) {
			if ((rspJSON.rsp.status) && (rspJSON.rsp.status != 'OK')) {
				THIS.scope.ec.controlContainer.classList.remove('wait');
				_setBtnDisabled(THIS.scope.shadowRoot, '.qabtn', false);
				if ((this.listeners) && (this.listeners.onError)) {
					for (i = 0; i < this.listeners.onError.length; i++) {
						this.listeners.onError[i](rspJSON);
					}
				}
				return;
			}
			this.sessionId = rspJSON.rsp.session;
			var rspObject = {};
			var i;
			if ((rspJSON.rsp.locationType == 'Prompt') || (rspJSON.rsp.locationType == 'Data Point')) {
				rspObject.prompt = _stripHTML(rspJSON.rsp.text);
				if ((rspJSON.rsp.helptext) && (rspJSON.rsp.helptext !== '')) {
					rspObject.hint = rspJSON.rsp.helptext;
				}
				rspObject.navigationMethods = rspJSON.rsp.navigationMethods;
				rspObject.rationale = rspJSON.rsp.rationale;
				if (rspJSON.rsp.pertinentPositives) {
					rspObject.positiveFindings = [];
					for (entry = 0; entry < rspJSON.rsp.pertinentPositives.length; entry++) {
						rspObject.positiveFindings.push(_stripHTML(rspJSON.rsp.pertinentPositives[entry]));
					}
					if (rspJSON.rsp.pertinentPositives.length != rspObject.positiveFindings.length) {
						alert("findings mismatch!");
					}
				}
				if (rspJSON.rsp.pertinentNegatives) {
					rspObject.negativeFindings = [];
					for (entry = 0; entry < rspJSON.rsp.pertinentNegatives.length; entry++) {
						rspObject.negativeFindings.push(_stripHTML(rspJSON.rsp.pertinentNegatives[entry]));
					}
					if (rspJSON.rsp.pertinentNegatives.length != rspObject.negativeFindings.length) {
						alert("findings mismatch!");
					}
				}
				demographics = {};
				values = {};
				Object.keys(this.localDemographics).forEach(function(key, index) {
					demographics[key] = this.localDemographics[key];
				}.bind(this));
				if (rspJSON.rsp.history) {
					for (i = 0; i < rspJSON.rsp.history.length; i++) {
						entry = rspJSON.rsp.history[i];
						eName = entry[0];
						eValue = entry[1];
						if (this.demographicList.indexOf(eName.toLowerCase()) >= 0) {
							demographics[eName] = eValue;
						} else if (this.valueList.indexOf(eName.toLowerCase()) >= 0) {
							values[eName] = eValue;
						} else {
							console.log('no match for ' + eName);
						}
					}
				}
				if (Object.keys(demographics).length > 0) {
					rspObject.demographics = demographics;
				}
				if (Object.keys(values).length > 0) {
					rspObject.values = values;
				}
				if (rspJSON.rsp.locationType == 'Data Point') {
					rspObject.dataPoint = {};
					rspObject.dataPoint.value = rspJSON.rsp.dataPoint.value;
					if (rspJSON.rsp.dataPoint.units) {
						rspObject.dataPoint.units = rspJSON.rsp.dataPoint.units;
					} else {
						rspObject.dataPoint.units = 'na';
					}
					for (i = 0; i < rspJSON.rsp.dataPoint.validationRules.length; i++) {
						var ruleParts = rspJSON.rsp.dataPoint.validationRules[i].split(':');
						var rangeParts = ruleParts[1].split(' ');
						unitObject = {};
						unitObject.type = rangeParts[0];
						if (rangeParts[0] == 'Number') {
							unitObject.min = parseFloat(rangeParts[1]);
							unitObject.max = parseFloat(rangeParts[3]);
							if (rangeParts.length == 6) {
								unitObject.step = parseFloat(rangeParts[5]);
							}
						} else if (rangeParts[0] == 'List') {
							unitObject.list = rangeParts[1].split('|');
						} else if (rangeParts[0] == 'Date') {
							unitObject.min = parseDate(rangeParts[1]);
							unitObject.max = parseDate(rangeParts[3]);
						} else {
							alert('invalid validation value type: ' + rangeParts[0]);
						}
						var units = ruleParts[0];
						if ((!units) || (units.length === 0)) {
							units = 'na';
						}
						rspObject.dataPoint[units] = unitObject;
					}
					THIS.scope.ec.controlContainer.classList.remove('wait');
					_setBtnDisabled(THIS.scope.shadowRoot, '.qabtn', false);
					if ((this.listeners) && (this.listeners.atDataPoint)) {
						for (i = 0; i < this.listeners.atDataPoint.length; i++) {
							this.listeners.atDataPoint[i](rspObject);
						}
					}
				} else {
					THIS.scope.ec.controlContainer.classList.remove('wait');
					_setBtnDisabled(THIS.scope.shadowRoot, '.qabtn', false);
					if ((this.listeners) && (this.listeners.atQuestion)) {
						for (i = 0; i < this.listeners.atQuestion.length; i++) {
							this.listeners.atQuestion[i].bind(this.scope)(rspObject);
						}
					}
				}
			} else if (rspJSON.rsp.locationType == 'Report') {
				if (rspJSON.rsp.report.ccid) {
					rspObject.ccid = rspJSON.rsp.report.ccid;
				}
				if (rspJSON.rsp.report.diffDx) {
					rspObject.systemConcern = [];
					for (i = 0; i < rspJSON.rsp.report.diffDx.length; i++) {
						rspObject.systemConcern.push(rspJSON.rsp.report.diffDx[i].text);
					}
				}
				if (rspJSON.rsp.report.rfi) {
					if (!this.whenMap.hasOwnProperty(rspJSON.rsp.report.rfi))
						alert('missing whenMap entry: [' + rspJSON.rsp.report.rfi + ']');
					rspObject.when = this.whenMap[rspJSON.rsp.report.rfi];
				}
				if (rspJSON.rsp.report.pos) {
					rspObject.where = [];
					for (i = 0; i < rspJSON.rsp.report.pos.length; i++) {
						if (!this.whereMap.hasOwnProperty(rspJSON.rsp.report.pos[i].text))
							alert('missing whereMap enrty: ' + rspJSON.rsp.report.pos[i].text);
						if (rspJSON.rsp.report.pos[i].text == 'Doctor eVisit') {
							rspObject.etreatable = true;
						}
						rspObject.where.push(this.whereMap[rspJSON.rsp.report.pos[i].text]);
					}
				} else {
					if (rspJSON.rsp.report.canVirtualCare) {
						rspObject.etreatable = rspJSON.rsp.report.canVirtualCare;
					}
					rspObject.where = [];
					rspObject.where.push("Home");
				}
				if (rspJSON.rsp.report.tests) {
					rspObject.predictedResources = [];
					for (i = 0; i < rspJSON.rsp.report.tests.length; i++) {
						rspObject.predictedResources.push(rspJSON.rsp.report.tests[i].text);
					}
				}
				if (rspJSON.rsp.report.termText) {
					rspObject.patientInstructions = rspJSON.rsp.report.termText;
				}
				if (rspJSON.rsp.report.positiveList) {
					rspObject.positiveFindings = [];
					for (i = 0; i < rspJSON.rsp.report.positiveList.length; i++) {
						rspObject.positiveFindings.push(_stripHTML(rspJSON.rsp.report.positiveList[i].reportSyntax));
					}
					rspObject.positiveFindings.sort(rsCompare);
				}
				if (rspJSON.rsp.report.negativeList) {
					rspObject.negativeFindings = [];
					for (i = 0; i < rspJSON.rsp.report.negativeList.length; i++) {
						rspObject.negativeFindings.push(_stripHTML(rspJSON.rsp.report.negativeList[i].reportSyntax));
					}
					rspObject.negativeFindings.sort(rsCompare);
				}
				demographics = {};
				values = {};
				Object.keys(this.localDemographics).forEach(function(key, index) {
					demographics[key] = this.localDemographics[key];
				}.bind(this));
				for (i = 0; i < rspJSON.rsp.report.historyList.length; i++) {
					entry = rspJSON.rsp.report.historyList[i];
					eName = entry.name;
					eValue = entry.value;
					eUnits = '';
					if (entry.units) {
						eUnits = ' ' + entry.units;
					}
					if (this.demographicList.indexOf(eName.toLowerCase()) >= 0) {
						demographics[eName.toLowerCase()] = eValue + eUnits;
					} else if (this.valueList.indexOf(eName.toLowerCase()) >= 0) {
						values[eName.toLowerCase()] = eValue + eUnits;
					}
				}
				if (Object.keys(demographics).length > 0) {
					rspObject.demographics = demographics;
				}
				if (Object.keys(values).length > 0) {
					rspObject.values = values;
				}
				if (rspJSON.rsp.report.carelinks) {
					rspObject.careLinks = [];
					for (i = 0; i < rspJSON.rsp.report.carelinks.length; i++) {
						careLink = {};
						careLink.title = rspJSON.rsp.report.carelinks[i].Title;
						careLink.topic = 'cid~' + rspJSON.rsp.report.carelinks[i].Topic + '~' + rspJSON.rsp.report.carelinks[i].Section;
						rspObject.careLinks.push(careLink);
					}
				}
				if (rspJSON.rsp.report.carePlan) {
					rspObject.carePlan = [];
					for (i = 0; i < rspJSON.rsp.report.carePlan.length; i++) {
						cpe = [];
						cpe.push(rspJSON.rsp.report.carePlan[i][0]);
						cpe.push(rspJSON.rsp.report.carePlan[i][2]);
						cpe.push(rspJSON.rsp.report.carePlan[i][5]);
						cpe.push(rspJSON.rsp.report.carePlan[i][4]);
						rspObject.carePlan.push(cpe);
					}
				}
				if (rspJSON.rsp.report.esi) {
					rspObject.esi = rspJSON.rsp.report.esi;
				}
				if (rspJSON.rsp.report.notifications) {
					rspObject.notifications = rspJSON.rsp.report.notifications;
				}
				isCM = 0;
				if (rspJSON.rsp.report.symptomControl) {
					rspObject.symptomControl = rspJSON.rsp.report.symptomControl;
					isCM += parseInt(rspJSON.rsp.report.symptomControl);
				}
				if (rspJSON.rsp.report.hrs) {
					rspObject.diseaseControlScore = rspJSON.rsp.report.hrs;
					isCM += parseInt(rspJSON.rsp.report.hrs);
				}
				if (rspJSON.rsp.report.pes) {
					rspObject.patientEffortScore = rspJSON.rsp.report.pes;
					isCM += parseInt(rspJSON.rsp.report.pes);
				}
				if (isCM) {
					rspObject.etreatable = (rspObject.esi >= 4);
				}
				rspObject.isCondition = (isCM !== 0);
				this.localDemographics = {};
				delete this.sessionId;
				THIS.scope.ec.controlContainer.classList.remove('wait');
				_setBtnDisabled(THIS.scope.shadowRoot, '.qabtn', false);
				if ((this.listeners) && (this.listeners.atReport)) {
					for (i = 0; i < this.listeners.atReport.length; i++) {
						this.listeners.atReport[i](rspObject);
					}
				}
			} else {
				THIS.scope.ec.controlContainer.classList.remove('wait');
				_setBtnDisabled(THIS.scope.shadowRoot, '.qabtn', false);
				if ((this.listeners) && (this.listeners.onError)) {
					for (i = 0; i < this.listeners.onError.length; i++) {
						this.listeners.onError[i](rspObject);
					}
				}
			}
			THIS.scope.ec.controlContainer.classList.remove('wait');
			_setBtnDisabled(THIS.scope.shadowRoot, '.qabtn', false);
		}.bind(THIS));
	}

	function rsCompare(a, b) {
		var prefixOrder = ['HPI', 'EXAM', 'MEDS', 'PMH', 'PSH', 'FH', 'DIET', 'SOC', 'PREVENT', 'MONITOR', 'ACTIVITY', 'MOBILITY', 'ADL', 'EDUCATE', 'COUNSEL'];
		var ac = a.indexOf(':');
		var ap = a.substr(a, ac).toUpperCase();
		var ai = prefixOrder.indexOf(ap);
		var bc = b.indexOf(':');
		var bp = b.substr(b, bc).toUpperCase();
		var bi = prefixOrder.indexOf(bp);
		if (ai < bi) return -1;
		else if (ai > bi) return 1;
		ap = a.substr(ap + 1).replace(/^\s+|\s+$/gm, '');
		bp = b.substr(bp + 1).replace(/^\s+|\s+$/gm, '');
		if (ap < bp) return -1;
		else if (ap > bp) return 1;
		else return 0;
	}

	function dateToString(d) {
		if (!(d instanceof Date))
			return '';
		var m = (d.getMonth() + 1).toString();
		if (m.length < 2)
			m = '0' + m;
		var dy = d.getDate().toString();
		if (dy.length < 2)
			dy = '0' + dy;
		var y = (d.getYear() + 1900).toString();
		return m + '/' + dy + '/' + y;
	}

	function parseDate(dateStr) {
		var month = parseInt(dateStr.substring(4, 6));
		var day = parseInt(dateStr.substring(6, 8));
		var year = parseInt(dateStr.substring(0, 4));
		return new Date(year, month - 1, day);
	}

	function _stripHTML(content) {
		var container = document.createElement('div');
		container.innerHTML = content;
		return container.textContent || container.innerText;
	}
	this.addListener = function(event, listener) {
		if (!this.listeners) {
			this.listeners = {};
		}
		if (!this.listeners.hasOwnProperty(event)) {
			this.listeners[event] = [listener];
		} else {
			if (this.listeners[event].indexOf(listener) < 0) {
				this.listeners[event].push(listener);
			}
		}
	};
}
class dshiTXL extends HTMLElement {
	constructor() {
		super();
		let shadowDom = this.attachShadow({
			mode: 'open'
		});
		let template = document.createElement('template');
		template.innerHTML = this.controlTemplate();
		let templateHTML = template.content;
		shadowDom.appendChild(templateHTML);
		setTimeout(this.setupWidget.bind(this), 0);
	}
	webInstruction(checked) {
		this.ec.txLibWebInstructions.checked = checked;
	}
	txLibMenuClickHandler(ev) {
		this.txLibEngine.load(ev.currentTarget.txLibReference);
		ev.preventDefault();
	}
	txLibWebInstructionsClickHandler(ev) {
		var evData = {
			checked: ev.currentTarget.checked,
			title: this.ec.txLibWebInstructions.articleData.title,
			id: this.ec.txLibWebInstructions.articleData.id
		};
		var e = new CustomEvent('instructions', {
			detail: evData
		});
		this.dispatchEvent(e);

	}
	resetWidget() {
		this.ec.txLibArticle.style.display = 'none';
		this.ec.txLibraryInput.value = '';
		this.ec.txLibraryList.style.display = 'none';
		this.ec.txSearchHeader.style.display = 'inherit';
	}
	setupWidget() {
		var options = {
			url: "https://expert-test.dshisystems.net",
			appId: "cmgplus",
			timeout: "10000",
			onMenuLoaded: this.onMenuLoaded.bind(this),
			onArticleLoaded: this.displayArticle.bind(this),
			maxPrefetch: 256,
			maxMenuLength: 10
		};
		this.ec = {
			txLibrarySearchBtn: this.shadowRoot.getElementById('txLibrarySearchBtn'),
			txLibTitleText: this.shadowRoot.getElementById('txLibTitleText'),
			txLibArticleNavBtn: this.shadowRoot.getElementById('txLibArticleNavBtn'),
			txLibrarySectionList: this.shadowRoot.getElementById('txLibrarySectionList'),
			txLibraryInput: this.shadowRoot.getElementById('txLibraryInput'),
			txLibArticle: this.shadowRoot.getElementById('txLibraryArticle'),
			txLibArticleBody: this.shadowRoot.getElementById('txLibArticleBody'),
			txLibraryList: this.shadowRoot.getElementById('txLibraryList'),
			txLibPatientInformation: this.shadowRoot.getElementById('txLibPatientInformation'),
			txSearchHeader: this.shadowRoot.getElementById('txSearchHeader'),
			txLibVIBox: this.shadowRoot.getElementById('txLibVIBox'),
			txLibWebInstructions: this.shadowRoot.getElementById('txLibWebInstructions'),
			txLibWebInstructionsLabel: this.shadowRoot.getElementById('txLibWebInstructionsLabel')
		};
		this.ec.txLibArticleNavBtn.addEventListener('click', this.onNavBtnClick.bind(this));
		this.ec.txLibrarySearchBtn.addEventListener('click', this.doShowLibSearchBar.bind(this));
		this.ec.txLibWebInstructions.addEventListener('click', this.txLibWebInstructionsClickHandler.bind(this));
		this.ec.txLibrarySectionList.style.display = 'none';
		//        this.ec.txLibraryInput.style.disabled = true;
		this.ec.txLibraryInput.addEventListener('input', this.txLibraryInput.bind(this));
		this.txLibEngine = new txLibraryEngine(options);
		this.tlookup = {
			T: "TST",
			C: "CID",
			D: "DRG"
		};
		if (this.getAttribute('data-popup')) {
			this.isPopup = (this.getAttribute('data-popup').toLowerCase() == 'true');
			this.ec.txLibraryList.style.display = 'none';
			this.ec.txLibPatientInformation.style.display = 'none';
			this.ec.txLibrarySearchBtn.style.display = 'none';
			this.ec.txLibArticleNavBtn.style.display = 'none';
			this.ec.txSearchHeader.style.display = 'none';
		}
		if (this.getAttribute('data-instructions')) {
			this.isInstructions = true;
			this.ec.txLibraryList.style.display = 'none';
			this.ec.txLibArticleNavBtn.style.display = 'none';
			this.ec.txLibVIBox.style.display = 'none';
			this.ec.txLibWebInstructionsLabel.style.display = 'none';
			//	    this.ec.txLibPatientInformation.style.float = 'inherit';
			this.ec.txLibPatientInformation.style.display = 'block';
			this.ec.txLibArticleBody.style.marginTop = '30px';
		}
	}
	txLibraryInput(ev) {
		while (this.ec.txLibraryList.firstChild) {
			this.ec.txLibraryList.removeChild(this.ec.txLibraryList.firstChild);
		}
		var value = ev.target.value;
		if (value && value.length >= 1) {
			value = value.toLowerCase();
			if (this.txLibEngine.menuLib[value]) {
				for (var i = 0; i < this.txLibEngine.menuLib[value].length; i++) {
					var eName = this.txLibEngine.menuLib[value][i];
					var aTitle = document.createElement('span');
					aTitle.classList.add('txLibMenuText');
					var aTitleText = document.createTextNode(eName);
					aTitle.appendChild(aTitleText);
					var aIcon = document.createElement('span');
					aIcon.classList.add('txLibMenuIcon');
					aIcon.classList.add('txLibMenuIcon_' + this.txLibEngine.menuLibs[eName]);
					var aItem = document.createElement('li');
					aItem.classList.add('txLibMenuEntry');
					if (this.txLibEngine.masterMap[eName])
						aItem.txLibReference = this.txLibEngine.masterMap[eName];
					else
						aItem.txLibReference = this.tlookup[this.txLibEngine.menuLibs[eName]] + "~" + eName;
					aItem.appendChild(aTitle);
					aItem.appendChild(aIcon);
					aItem.setAttribute('tabindex', 0);
					aItem.addEventListener('click', this.txLibMenuClickHandler.bind(this));
					this.ec.txLibraryList.appendChild(aItem);
				}
			}
		}
		this.ec.txLibraryList.style.display = (this.ec.txLibraryList.firstChild) ? "block" : "none";
	}
	showArticle(article) {
		this.txLibEngine.load(article);
	}
	onNavBtnClick() {
		this.ec.txLibrarySectionList.style.display = (this.ec.txLibrarySectionList.style.display == 'none') ? this.ec.txLibrarySectionList.style.display = 'inherit' : this.ec.txLibrarySectionList.style.display = 'none';
	}
	doLibraryClick(ev) {
		var article = ev.target.hash.substring(1);
		this.txLibEngine.load(article);
	}
	onMenuLoaded() {
		this.ec.txLibraryInput.disabled = false;
		this.ec.txLibraryInput.style.cursor = 'text';
	}
	doShowLibSearchBar() {
		this.ec.txSearchHeader.style.display = 'block';
	}
	txLibSectionClickHandler(ev) {
		this.txLibEngine.load(ev.currentTarget.txLibSectionRef);
		this.ec.txLibrarySectionList.style.display = 'none';
		this.ec.txLibArticleNavBtn.textContent = ev.currentTarget.textContent;
		ev.preventDefault();
	}
	generateSectionMenu(sections, library, topic) {
		while (this.ec.txLibrarySectionList.firstChild) {
			this.ec.txLibrarySectionList.removeChild(this.ec.txLibrarySectionList.firstChild);
		}
		for (var idx = 0; idx < sections.directory.length; idx++) {
			var section = sections.directory[idx];
			var data = sections.entries[section];
			var title = data.title;
			var indentLevel = data.indentLevel;
			var aTitle = document.createElement('span');
			aTitle.classList.add('txLibSectionListEntry');
			aTitle.classList.add('txLibOvl' + indentLevel);
			var aText = document.createTextNode(title);
			aTitle.appendChild(aText);
			var aItem = document.createElement('li');
			aItem.appendChild(aTitle);
			aItem.classList.add('txLibSectionEntry');
			aItem.txLibSectionRef = library + '~' + topic + '~' + section;
			aItem.setAttribute('title', title);
			aItem.setAttribute('library', data.library);
			aItem.setAttribute('tabindex', 0);
			aItem.addEventListener('click', this.txLibSectionClickHandler.bind(this));
			this.ec.txLibrarySectionList.appendChild(aItem);
		}
		return false;
	}
	displayArticle(article) {
		this.ec.txLibWebInstructions.checked = false;
		var aData = {
			id: article.library.toLowerCase() + '~' + article.topic.toLowerCase().replace(/ /g, '-') + '~' + article.fullTitle.toLowerCase().replace(/ /g, '-'),
			title: article.topic
		};
		var e = new CustomEvent('articleLoading', {
			detail: aData
		});
		this.dispatchEvent(e);

		this.ec.txLibWebInstructions.articleData = aData;
		this.ec.txSearchHeader.style.display = 'none';
		this.ec.txLibArticleBody.innerHTML = article.body;
		var articleLinks = this.ec.txLibArticleBody.querySelectorAll("a");
		for (var i = 0; i < articleLinks.length; i++) {
			if ((this.isPopup) || (this.isInstructions)) {
				var span = document.createElement('span');
				span.innerHTML = articleLinks[i].innerHTML;
				articleLinks[i].parentNode.replaceChild(span, articleLinks[i]);
			} else {
				articleLinks[i].addEventListener('click', this.doLibraryClick.bind(this));
			}
		}
		this.generateSectionMenu(article.sections, article.library, article.topic);
		if ((this.isInstructions) || (article.title.toLowerCase() == 'overview')) {
			this.ec.txLibTitleText.innerHTML = article.topic;
		} else {
			this.ec.txLibTitleText.innerHTML = article.topic + ' ' + article.title.replace('Veteran', 'Home Care');
		}

		this.ec.txLibArticle.style.display = 'block';
		this.ec.txLibArticleNavBtn.textContent = article.title;
	}
	controlTemplate() {
		return '<STYLE>' +
			'#txSearchLine {' +
			'  position: relative;' +
			'  display: block;' +
			'}' +
			'#txSearchLine span {' +
			'  position: absolute;' +
			'  bottom: -3px;' +
			'  right: 2px;' +
			'}' +
			'#txLibUp {' +
			'  margin: 0;' +
			'  padding: 0;' +
			'  width: 32px;' +
			'  height: 32px;' +
			'  cursor: pointer;' +
			'  background-size: 28px 28px;' +
			'  background-repeat: no-repeat;' +
			'  background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfkBAkSJBg0rxSQAAADcElEQVRIx33VXYhVVRgG4GevvR01o9GgH5GozDILSQhNs7yKEkqMoEJHnYuSjLoKpNJGE0aI6aJACg0qjhr9gHShghF5o6NhQzrd+RvRvxT2Y+gcz9m7i732GT2e2hebtdbe77vW933re99Eh6d3dJigqCa1Dv8m/wENgkKuQCJI5PJONEkHeJBoxqUMjThOKddrnQh6q3mQK9zsEfNN1Y2/feuAXY4jjadqkSSXwZvutN4i49qCrdvjVYfbKdLy66wSnsit8bGZMoVTBu3zte8Fk2SmW2mcvdW2w6Mn6K1Gqe2eVGj6xFuG1OPuY8yySo8uid0ed06iKM+QXJS63AeW4rheByUKaSxjU6Iwy1YzsdPiqrg1oZXh3IuW4oB7HJTFWuSxfEHmiHk+xyIbFVXwIb6b7tCHYxY7I9PQVAgxM4mmhsw/HnMYq83RLLGhFf9qE+Se9ZssVj6TW2+bXCJBQ+asZ4zIvFRVL8T9b/Aodth7EbxhjXWWqF1C8ZVtWOh2uSAS8ICJeDcmJ5FpWGujuhErbG1R5Hgf4y0skVUS5+EHXyKXSDWs1a8u06VueYsix5BjmFtuFiLrLTjpz3gbGl7R77wuA1bqMmK57XKJIKg7iqklMosE3TiNoNCwzgbnjfOml5HZbESPRE9M7WlcJdOQZG2NlWjqi/A3vCAVbMFmI5Yq9I6qw+g9CDiDa9Ewxwb1Fjx3wRhbrDLWiB7LNHE9/tCQKCqCE7jVJBzyvC6vR3hBpHjKWJvUMN50nCqRVQiDVplsvl1Sb/vGEFXb4oLUe446AmabhsEy6BBV5gu/4+kY1n71qt+icDQFg84ZE/8667My/QGF1M92YLGHNaVRlSI4UuSC1AULLMEuJwR51c5Bbpoh3b4z34+t66zmIqHNNFxtvxnOm2tYkFftnEud0Icb7TZZQyYryWOzpRG+0wz0G5aWKl1d5aZgk3dwl0MearVzKo0C33C/Q+7FRzYKlW6nDJeKSLDTFHe70jKznfGrEYVCYYIFBrxmksSHVlTVqbWpcqnJzxlwhULiF0edVrjGbaYoJOr6DAiK0RR3kvWbrPGEbkXLNQqJsz7V71i7rLcbS2Ud13nQfaaZiL+cdMAeP7Vsx2XGcglJy9pql66nijLzHa2t7RyJlJYih9bY/5rrZTRtTyd7/xensTx0tQ2+BgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMC0wNC0wOVQxODozNjoyNC0wNzowMJabuVkAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjAtMDQtMDlUMTg6MzY6MjQtMDc6MDDnxgHlAAAAAElFTkSuQmCC\')' +
			'' +
			'}' +
			'#txLibUp: hover{' +
			'  background-color: #DEF;' +
			'}' +
			'' +
			'.txLibCopyright {' +
			'  margin-top: 8px;' +
			'  font-size: small;' +
			'}' +
			'' +
			'#txLibTitleText {' +
			'  line-height: 32px;' +
			'  cursor: default;' +
			'}' +
			'' +
			'#txLibrarySectionList {' +
			'  display: none;' +
			'  width: fit-content;' +
			'  margin-top: 0px;' +
			'  }' +
			'' +
			'.txLibSectionEntry {' +
			'  cursor: pointer;' +
			'  border-bottom: 1px solid #ddd;' +
			'  padding-left: 16px;' +
			'  padding-right: 16px;' +
			'  padding-top: 6px;' +
			'  padding-bottom: 6px;' +
			'}' +
			'' +
			'.txLibSectionListEntry {' +
			'}' +
			'' +
			'.txLibSectionEntry:hover {' +
			'  background-color: #DEF;' +
			'}' +
			'.txLibOvl0 {' +
			'  margin-left: 0px;' +
			'}' +
			'.txLibOvl1 {' +
			'  margin-left: 10px;' +
			'}' +
			'.txLibOvl2 {' +
			'  margin-left: 20px;' +
			'}' +
			'.txLibOvl3 {' +
			'  margin-left: 30px;' +
			'}' +
			'' +
			'.txLibMenuEntry {' +
			'  border-bottom: 1px solid #ddd;' +
			'  padding-left: 16px;' +
			'  padding-right: 16px;' +
			'  padding-top: 6px;' +
			'  padding-bottom: 6px;' +
			'  cursor: pointer;' +
			'' +
			'}' +
			'' +
			'.txLibMenuEntry:hover {' +
			'  background-color: #DEF;' +
			'}' +
			'' +
			'.txDisplayList {' +
			'  display: none;' +
			'  list-style: none;' +
			'  font-family: sans-serif;' +
			'  font-weight: 700;' +
			'  font-size: 14px;' +
			'  white-space: nowrap;' +
			'  border-radius: 10px;' +
			'  padding-left: 0px;' +
			'  background-color: #f6f6f6;' +
			'}' +
			'' +
			'.txLibMenuText {' +
			'}' +
			'' +
			'.txLibLink {' +
			'  text-decoration: none;' +
			'  color: black;' +
			'}' +
			'' +
			'.txLibMenuIcon_C {' +
			'width: 20px;' +
			'height: 20px;' +
			'float: right;' +
			'background-repeat: no-repeat;' +
			'background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAFSUlEQVR42mJkYGhjYGD4L+DnJ9uopMAV/v4PO7Owqjwrz9/fH2f05eZ/fK17++/fd9/+/Ft9nwEFqANxIhBfB+LtQPwKLAoQQCwMDH8ZnZykmuPjRXLOnLz08wuXEsNXHTV2aUl2fqFdSXOqo4zZuLnZvmSn3i/8+eHMSgYCACCAGLi4uvWWLTv839Q0+iYDA6MPA4OAPYd53XahyOXP2aULLqfPu/+/+vj//8GtZ/8pyFhnAfUwIVzYAcTxQCwGNw8ggBisrBZmrVt36D8jI28ikj0gTXJALMIoYJnJoBy3NSRl6tP1a0785+bWiofqBOI+II5DMRAggJg0NEXE79x5zvD//+dzSAb+A+JHQPzm/4fj0xnuLvJfN6cl7MHjHwy6uloxQHFWBgY9IPUHaPFfZgaGn3CNAAHE8vXnXxFRRWkGRiZ+tv//PuIIGLY//xg+nrxy5cUbfn5WEQYGCWZxCd3UoHjBSBYWIcaNy5gOPrq/Buj/758BAojZhVOpOYH7oeQNTgPJW3eObgbq/gV2AAMwOBksgNgIiJ0YWFgcpVNTdSq2bt14XErU0bB+pk6LewSzvJOzspyLr7nt67f81revXDoAEEBMin9eaH7omczgZOPlY2FdOAUYMZwMDL+BhigBsSYQawGxILeHl16hjCwD8707Xx/kp1qm86rfY3z+/CPDnaePGDgE3jCk1xvbyarqJwMEAFEArv8E5Qsf+QQOBgmIio/FZXBtXRMQFRXAwK6P9fX83QAA/gsgIA0tRUQdaIKAOT52fI/b/gAG3hn39QrX7+AA/vTfABURIADk9PsACQUOABkjCicCAFEArv8E4/b51BRAQjwEqrrJiIfZk1pYbIxjY3y74ODv/AsMBPwPGAgBXQrkB/hfZwCpw9a5AADvq+aivYIfORITyu/dAE3aFwC+JOsA9g/8APDt9v8CiEGGxzTzUXrB/04O4w8MDNJmIC+zccp6CovrJ7EK6Kd5ycWd+ayo8X8Cg9R3BgZ2T1AUSTAYFc9wDfu/b2Xx//Op3v+bN0b8d06J/8HMIhgDEEBAaX6pTOP0hz+83P93MKg8U2Awr2JlCHDmYohOTmVw2PNVSOrfcSaZ/wIMGiuAirkhsc7IKMygUDLHJf/HAz29/7pKVreA4ZwDlGAHCCBI2mGUtqtxzH3/IT35/y0Zjf/HeNX/X+dV+v9DWuH/bkmb/2pMuvuAaV0JahgQc4AiS6DDpuLzFQGV/wwMPDGwBAYQQCwg4s//p4da9i92O/8qZPokbVXjtXd+ffzEyXT35vsvj4+9e3H8z7+7QNf9ewjREgrE+gxsrH8NPARvc9/8zfIXKHcHZiBAALEgEu+H07tuP130XF7S+OndY09WMNwJAFr1GCHPB8TAIGYwBZVODLryzDb6TO8YZ3z9Dyxm/r2AqQIIICbk/PD714mlu/8KvKw0ldYWYVCIgngPBCSBOAGcwCG5kpE9WPBBwIO95xlWMAhcYGD48QxmBkAAMaNmsR/fb79hEwh0tbTzfP/S8dB79tefGP7dAyby75AEDkzzjMxC9nLvJzX+2eHV/4L7xwGGm3VAp1yGmQAQQIyY+ZaDV5THcWqXs2as1dPjDAcvv3p05Cf70asMxs8FGf4KejKcc4rmeyE//7PU38r/n1oYGJ60gKIBphsggBixFwYs7CxMukVRhtY1SWJvuFR/fmR4f+k6A9vPLwy/xOUYJrwS+rHo09W+XwzPQYZ9R9YJEECM+ItfIVN2NhkHVVEBbSHmv9w/f/39e+vrj/vvvzw8wPD//X5IQYIKAAIMAIvv2zO141I1AAAAAElFTkSuQmCC\');' +
			'}' +
			'' +
			'.txLibMenuIcon_D {' +
			'width: 20px;' +
			'height: 20px;' +
			'float: right;' +
			'background-repeat: no-repeat;' +
			'background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAF00lEQVR42mIU1eu05+Bkb3KwUdYXEuRk+P//PwMMgJjPX3xmePP265t7ty8ffv7w8pF/327t+fv97kMGHAAggBikTPpuzVp/5f/b3//+v/jx9//z73/g+BkQ333//f/1V1//77/27n/phJP/NR377jFzafriMg8ggBhtwhd/WTgjlPv5l58MX3/9ZWAECjIzMzEwAfH/f/8ZQBCEWIF8NjZmhpevfzDMmHT4/47FNSn/v1+Zh24gQACxMDIx/fn47RfDiy+/GH7++cfAxMjI8PH9N4ZvX/8zcPNyAjELAyvLf4Zfv/8ysDAxMrBzsDIEJVky3rzokXfv5JV1QDM+IBsIEEAsP//+Y/j08y/Dc6CBP37/Y2AFumLH6gsMh1fNO8rC/PGKiLyxfmxOgoWmkTTDw7dfGZiA6lhZ2Rik1TU1751kNmRg+Lsf2UCAAGL5BTTww48/DE8//WT4DnIFKyvD+y/fGb6+OLKYmUNo5sf33D6XLj7baG+vyHTo7lsGFmZGBmbWfwzf//5jAernR/cyQACxAOOC4cPPPwyPP0LCkJnlDwMTDyeDknV2IhuvjCWbIJ+robUC0+lHHxkefPjJwMHOwvAX6KOX94GmM/x9xMjEzsDMxsfw58drsIEAAcTy689/ho/ffzM8+fCD4fPP3+AwFDGSZ5CxVDP/9++vORcnM8O5b38YHl16AXQZC8O/d38Y3uw8w/D83NL5jExs54RV0xi+vTsHNxAggFj+//vH8Afost/AiPn9/RcDGyszww9gVN97+Rkcs+CkAMT/3n1j+Pno5e93Z3fe/Hhr+womFsaJgsrZVozsSoGsXN++M7PdmPP319tHAAEEtPI/w99ffxj+ff3J8Pf7H4Y/jL8YtPnZGXSUhBgOXHsFkgYmI0aGXy+/Mnw+f/3Tx5tbK9l4JA9wSoe1SGqqZSmrC7E+eiHL8PyiXMS76zNjAQKIWVDJt8LIWIbj2sP3DD9//Gb4A4zFc9uuMciI8zMYqwkz3H/ygeH7118M7AIcDOziUlzM/1TMGVhUI7RsDAMDo/SYXwAtfMvKyMD4T0D42+PbvwECCJR6Gf4Ck8vfb7/BmAEY0wyfP/zaNH/nl4fX3zIEGEsziLAzM3wFJhlGdgYGLm01ZS0HQ2MHVyWGrcceMly+9pLhz1tgGn79lOH3jydPAAIIGIb/Gf/9/sPwF+iKf8Dkw/AfZMfnr19uzyreMv9dxnVTOzMPTxWGq4/eM1y89YaBHRjL//jYGLYevs/wGegA5t+MDG8vH/747tbyKX++P50OEEAsX7/8ZXn5+isDFzCcPgIj5f9/UPJiZvv7++3Frw/met39/XXe6g92fqFhugzCnKwMB04/ZngBtJwJFF/fgGn41vm3b65NSAHGxAZQBAIEENPPN5dW7N/1gOHHe2DEfP7P8Bto+Pc3564xMrLc45P152dgFWAQ4mFlePvmK8Or558YGIC++PvtJ8MfkI/+/mFg5RPn4BKzVmAAJjiQgQABAFEArv8D+fHSvvPr6ALy6ekE+uzf6/PhusL16r95Dx5TDAUTPrk6QC83Ki0WAMLG4QDf4e4ABwIDADMrGADz8fcA9fT4AAUMDgYIDi5IAf8GFvrz3MACiBEp1/AAMRsQv+eRdBPjlgq4aGMnKy4lzcewadt1hl9/QIUDK8PPj2/+KyjKMGroSjKcOPOQ4RMwh7GysTD8/8XM8Pb67GKAAGJGMvAXEH/nENRl4JMNNQGWQjlOjkoMe/fdZngPTNSszBwMP9/c/Pzu1vTcV8+eXvz+V87O3FSB4ffPXwwfQIUGEwfD788PvgMEEDNmCcnE8OPDxXdMrIImz9/wKP/7xwRMn38Zfrw+/fzDvSXlf3+9n/P3+8P9Xz59YXz7WcKBj18A6PV/wFz2juHL8x3LAQKIEVfJy8zKI8kmYFrKxMwh++/Xyyff319YBUxPx5GtZuNRC2HmlPdkZmHi/fnx2qnf3x7PAwgwADJaphiAASYgAAAAAElFTkSuQmCC\');' +
			'}' +
			'' +
			'.txLibMenuIcon_T {' +
			'width: 20px;' +
			'height: 20px;' +
			'float: right;' +
			'background-repeat: no-repeat;' +
			'background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAEvklEQVR42mI0c5nOgA7+/PkvqqwkccxYX0r0w8cfDIyMDEDMCKYF+TmAHAaGX7/+MXz+9IfhxetfDEcPr1506+LsCgaGv98AAojl75/vGAZ+/fqbx8bcVD4vzYT1x49/DMzMjGDMxISq7u3bPwyPH39lsLGQyZ0wmU3y6tl5eQABxMKAHfwHol9//zCw/v8HZDJBRBj+M4JdBwPCwiwMf/9wMPz5Lc7QWFMXUlb+5A1AALGgqADq+g9j/Yfgn7/+Mvz8zcDAAnIhMyOK90GAT4CZQZ6Rg4GDixkYHLxiAAHEwsrGDTUCouL/3x9AQ//8YmBkAnqTgeHZiy8M74HhyMYKNIQJZiADmABR/4A+UJATYFBUZGFgY2f8CxBAKC78x8TGwPz3HwcXw1fFnz++Mz3/8J+BiYWFgYOdGew6UBjCXAfT9Q/oDZA4JycDOJwBAoiFhRXiwn/AgOL48d4rQuFJh7H6ZwWeZ82ct/sMGM6LuDHIqSkycHMwIbkOYiAoSEAGCgtyMfDyQMIZIIBY7lyeAzGQkZlBlJnXXvLnI13t3x8YWLUkGOSl2RjOPPjE8PcfIlzhgcOIiD6Qof/+QeINIIBY/v79BffyB2bh5S/kzfOvyDIysoqosgqcPsloaOXOIKoqzPD/z2+g14DehrkQGiugVMDJzsrw5y/EQIAAYlHWToBIABV8//CeiYv3+X9+N89vbHwSfBLPbzBf/Pqbgf0z0NK/QANB4QcKR6ifYZHCzweMZQ6IFwACCJ5U/wO9zP33W6IY518O9md3/7O/uMfIIMDPwPDyMcNfJlawIeAIYUCNFJAYyNDfvyHeBwggJgZoEvj966+2vfDjWGMP3X8cjK/ZuVk/MHJ4ujEIvL7IcP/CbQZmVlawRkhEQJM+lP33Lyi7QrwMEEAsIPIPIwujzJtjE2OaXPk/y0i//swrxyAkrsTFKyfOYBjLxvBw1RmG63zCDByMv6GuQkTKP2gYcnDwAC34zwAQQCz/mZgZ/n16ZxFkzWkvLMPy5c2lbd9ZGRnZGN+cA2Z1bQZecSkGNdZ7DNe/fGIwddBg+PPzFzy3wPIWOyszw48fENcDBBDL77//efU4nrYHFSey8HJ/5RL/LcLN+OoiI8OD8wwMp4B+CepiML6xhuHRxdcMz/WnMsgLswGT0X+UDAsCIG+DbAIIIBb+t7djonWf2rO9ecLw79Y1JmbmDwwM34D4739QsQMOHNaoYgbbyzcZVq7dxsAW6sPA+Pc3imGgnPL9JxD/+M8OEEAsGv8f1elb6jBcK85m0OV8zsCsIsrAIANM9lLiDAxONgwMQlwMDKbpDJKONxjkq5f+j0k6dJGd+d8XRkgZhJTSWZge3T17CiCAWF6y8L44dfymhP6bBwysYkDxT5+BLgRm8d/fgJkT6I+Pd4Cu1AG6+A/DtZ9fP9w+NyUWqOoWAwOGr0EW/AIIIOaHn1+fvv2C21xGVkFC1VSPgZkTmLf5gFhQkIGBX5bhN7csw4UrHxhaJ+z9MHnViom/f31aByrUQcGGhkFi/wECCGILM6cor4iGl7KsnLYYP6ckHxczO8O/XwxffjH+e/X+y8c79+7f+vTu5lFgIjkLVP2bAQ8ACDAA9FitRQYvNAUAAAAASUVORK5CYII=\');' +
			'}' +
			'' +
			'#txLibraryPanel {' +
			'  width: 100%;' +
			'  font-family: Helvetica, Arial, sans-serif;' +
			'  font-size: 1em;' +
			'}' +
			'#txSearchHeader {' +
			'  border-radius: 10px;' +
			'  padding: 10px;' +
			'  outline: none;' +
			'  background-color: #F0F0F0;' +
			'}' +
			'#txLibraryInput {' +
			'  cursor: wait;' +
			'  font-size: 12pt;' +
			'  display: block;' +
			'  width: calc(100% - 38px);' +
			'  padding-left: 32px;' +
			'  height: 30px;' +
			'  border-radius: 10px;' +
			'  background:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIzMnB4IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMycHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48dGl0bGUvPjxkZXNjLz48ZGVmcy8+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSI+PGcgZmlsbD0iIzkyOTI5MiIgaWQ9Imljb24tMTExLXNlYXJjaCI+PHBhdGggZD0iTTE5LjQyNzExNjQsMjAuNDI3MTE2NCBDMTguMDM3MjQ5NSwyMS40MTc0ODAzIDE2LjMzNjY1MjIsMjIgMTQuNSwyMiBDOS44MDU1NzkzOSwyMiA2LDE4LjE5NDQyMDYgNiwxMy41IEM2LDguODA1NTc5MzkgOS44MDU1NzkzOSw1IDE0LjUsNSBDMTkuMTk0NDIwNiw1IDIzLDguODA1NTc5MzkgMjMsMTMuNSBDMjMsMTUuODQ3MjEwMyAyMi4wNDg2MDUyLDE3Ljk3MjIxMDMgMjAuNTEwNDA3NywxOS41MTA0MDc3IEwyNi41MDc3NzM2LDI1LjUwNzc3MzYgQzI2Ljc4MjgyOCwyNS43ODI4MjggMjYuNzc2MTQyNCwyNi4yMjM4NTc2IDI2LjUsMjYuNSBDMjYuMjIxOTMyNCwyNi43NzgwNjc2IDI1Ljc3OTYyMjcsMjYuNzc5NjIyNyAyNS41MDc3NzM2LDI2LjUwNzc3MzYgTDE5LjQyNzExNjQsMjAuNDI3MTE2NCBMMTkuNDI3MTE2NCwyMC40MjcxMTY0IFogTTE0LjUsMjEgQzE4LjY0MjEzNTgsMjEgMjIsMTcuNjQyMTM1OCAyMiwxMy41IEMyMiw5LjM1Nzg2NDE3IDE4LjY0MjEzNTgsNiAxNC41LDYgQzEwLjM1Nzg2NDIsNiA3LDkuMzU3ODY0MTcgNywxMy41IEM3LDE3LjY0MjEzNTggMTAuMzU3ODY0MiwyMSAxNC41LDIxIEwxNC41LDIxIFoiIGlkPSJzZWFyY2giLz48L2c+PC9nPjwvc3ZnPg==) no-repeat left center;' +
			'}' +
			'#txLibraryTitle {' +
			'  border-radius: 10px;' +
			'  background-color: lightgray;' +
			'  padding-left: 10px;' +
			'  padding-right: 10px;' +
			'}' +
			'#txLibraryArticle {' +
			'  display: none;' +
			'  with: 100%;' +
			'}' +
			'#txLibraryArticleTitle {' +
			'  width: 100%;' +
			'  text-align: center;' +
			'}' +
			'#txLibrarySearchBtn {' +
			'  cursor: pointer;' +
			'  float: right;' +
			'  width: 32px;' +
			'  height: 32px;' +
			'  background:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIzMnB4IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMycHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48dGl0bGUvPjxkZXNjLz48ZGVmcy8+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSI+PGcgZmlsbD0iIzkyOTI5MiIgaWQ9Imljb24tMTExLXNlYXJjaCI+PHBhdGggZD0iTTE5LjQyNzExNjQsMjAuNDI3MTE2NCBDMTguMDM3MjQ5NSwyMS40MTc0ODAzIDE2LjMzNjY1MjIsMjIgMTQuNSwyMiBDOS44MDU1NzkzOSwyMiA2LDE4LjE5NDQyMDYgNiwxMy41IEM2LDguODA1NTc5MzkgOS44MDU1NzkzOSw1IDE0LjUsNSBDMTkuMTk0NDIwNiw1IDIzLDguODA1NTc5MzkgMjMsMTMuNSBDMjMsMTUuODQ3MjEwMyAyMi4wNDg2MDUyLDE3Ljk3MjIxMDMgMjAuNTEwNDA3NywxOS41MTA0MDc3IEwyNi41MDc3NzM2LDI1LjUwNzc3MzYgQzI2Ljc4MjgyOCwyNS43ODI4MjggMjYuNzc2MTQyNCwyNi4yMjM4NTc2IDI2LjUsMjYuNSBDMjYuMjIxOTMyNCwyNi43NzgwNjc2IDI1Ljc3OTYyMjcsMjYuNzc5NjIyNyAyNS41MDc3NzM2LDI2LjUwNzc3MzYgTDE5LjQyNzExNjQsMjAuNDI3MTE2NCBMMTkuNDI3MTE2NCwyMC40MjcxMTY0IFogTTE0LjUsMjEgQzE4LjY0MjEzNTgsMjEgMjIsMTcuNjQyMTM1OCAyMiwxMy41IEMyMiw5LjM1Nzg2NDE3IDE4LjY0MjEzNTgsNiAxNC41LDYgQzEwLjM1Nzg2NDIsNiA3LDkuMzU3ODY0MTcgNywxMy41IEM3LDE3LjY0MjEzNTggMTAuMzU3ODY0MiwyMSAxNC41LDIxIEwxNC41LDIxIFoiIGlkPSJzZWFyY2giLz48L2c+PC9nPjwvc3ZnPg==) no-repeat left center;' +
			'}' +
			'#txLibrarySearchBtn:hover {' +
			'  background-color: #DEF;' +
			'}' +
			'#txLibArticleMenu {' +
			'  width: 100%;' +
			'}' +
			'#txLibArticleNavBtn {' +
			'  cursor: pointer;' +
			'  display: inline-block;' +
			'  border-radius: 10px;' +
			'  padding: 5px;' +
			'  border-style: none;' +
			'  margin-top: 5px;' +
			'  margin-bottom: 5px;' +
			'}' +
			'#txLibArticleNavBtn:hover {' +
			'  background-color: #DEF;' +
			'}' +
			'#txLibPatientInformation {' +
			'  padding: 7px;' +
			'  display: inline-block;' +
			'  float: right;' +
			'}' +
			'#txLibWebInstructions {' +
			'}' +
			'#txLibWIBox {' +
			'  cursor: pointer;' +
			'  border-radius: 10px;' +
			'  background-color: #f6f6f6;' +
			'  padding: 5px;' +
			'  display: inline;' +
			'}' +
			'#txLibWIBox label {' +
			'  cursor: inherit;' +
			'}' +
			'#txLibWIBox input {' +
			'  cursor: inherit;' +
			'}' +
			'#txLibWIBox:hover {' +
			'  background-color: #DEF;' +
			'}' +
			'#txLibVIBox {' +
			'  cursor: pointer;' +
			'  border-radius: 10px;' +
			'  background-color: #f6f6f6;' +
			'  display: inline;' +
			'  padding: 5px;' +
			'}' +
			'#txLibVIBox label {' +
			'  cursor: inherit;' +
			'}' +
			'#txLibVIBox input {' +
			'  cursor: inherit;' +
			'}' +
			'#txLibVIBox:hover {' +
			'  background-color: #DEF;' +
			'}' +
			'#txLibArticleBody {' +
			'  margin-top: 5px;' +
			'  padding: 5px;' +
			'}' +
			'#txLibArticleBody a {' +
			'  text-decoration: none;' +
			'}' +
			'</STYLE>' +
			'<div id="txLibraryPanel">' +
			'<div id="txSearchHeader">' +
			'<div id="txSearchLine">' +
			'<form action="javascript:void(0);" autocomplete="off">' +
			'<input type="text" name="txLibraryInput" id="txLibraryInput" placeholder="Begin typing to select topic..." autocomplete="off" readonly onfocus="this.removeAttribute(\'readonly\');">' +
			'</form>' +
			'</div>' +
			'<ul id="txLibraryList" class="txDisplayList"></ul>' +
			'</div>' +
			'<div id="txLibraryArticle">' +
			'<div id="txLibraryTitle">' +
			'<div id="txLibraryArticleTitle"><span id="txLibTitleText">Chest Pain</span><span id="txLibrarySearchBtn"></span></div>' +
			'</div>' +
			'<div id="txLibArticleMenu">' +
			'<button id="txLibArticleNavBtn">Overview</button>' +
			'<div id="txLibPatientInformation">Instructions: <div id="txLibWIBox"><label for="txLibWebInstructions" id="txLibWebInstructionsLabel">Web</label><input type="checkbox" id="txLibWebInstructions"></div><div id="txLibVIBox"><label for="txLibVerbalInstructions">Verbal</label><input type="checkbox" id="txLibVerbalInstructions"></div></div>' +
			'<ul id="txLibrarySectionList" class="txDisplayList"></ul>' +
			'</div>' +
			'<div id="txLibArticleBody">' +
			'<b>What is pregnancy?</b><br>A woman who is pregnant has a fertilized egg growing inside the uterus. Pregnancy ends in delivery of a baby, which occurs normally in about 9 months. Pregnancy is divided into 3 equal parts, known as trimesters. Each trimester is about 12 weeks long. <br><br><b>What are the symptoms of pregnancy?</b><br>Symptoms of early pregnancy may include <a href="#cid~nausea~overview">nausea</a>, <a href="#cid~dizziness~overview">dizziness</a>, <a href="#cid~breast-tenderness~overview">breast tenderness</a>, <a href="#cid~weakness-or-fatigue~overview">fatigue</a>, <a href="#cid~urinary-frequency~overview">frequent urination</a>, <a href="#cid~lower-back-pain~overview">low back pain</a>, <a href="#cid~irritability~overview">irritability</a>, <a href="#cid~mood-swings~overview">mood swings</a>, and <a href="#cid~weight-gain~overview">weight gain</a>. As pregnancy progresses, additional symptoms include a progressive increase in the size of the uterus, <a href="#cid~nipple-discharge~overview">nipple discharge</a>, <a href="#cid~constipation~overview">constipation</a>, <a href="#cid~heartburn~overview">heartburn</a>, <a href="#cid~lower-abdominal-pain~overview">lower abdominal pain</a>, <a href="#cid~leg-swelling~overview">leg swelling</a>, and additional weight gain.<br><br><b>How does the doctor treat pregnancy?</b><br>General treatment for pregnancy includes <a href="#cid~mens-health~prevention-exercise">exercise</a>, a healthy diet, regular visits to the <a href="#cid~doctor~overview">doctor</a>, prenatal vitamins, and avoiding exposure to smoke, alcohol and drugs.' +
			'</div>' +
			'</div>' +
			'</div>';
	}
}
/* txLibraryEngine 1.0.0
 */
function txLibraryEngine(options) {
	if (options.onMenuLoaded)
		this.onMenuLoaded = options.onMenuLoaded;
	if (options.onArticleLoaded)
		this.onArticleLoaded = options.onArticleLoaded;
	if (options.maxPrefetch)
		this.maxprefetch = options.maxPrefetch;
	else
		this.maxprefetch = 256;
	if (options.maxMenuLength)
		this.maxmenulength = options.maxMenuLength;
	else
		this.maxmenulength = 8;
	this.appId = options.appId;
	if ((options.url) && (options.url !== '')) {
		this.url = options.url;
	} else {
		if (!window.location.origin) {
			this.url = window.location.protocol + '//' + window.location.host;
		} else {
			this.url = window.location.origin;
		}
	}
	if (options.timeout) {
		this.timeout = options.timeout;
	} else {
		this.timeout = 10000;
	}
	if (!_isSetup(this)) {
		throw ('Missing Required Options');
	}
	this.lib = loadLibraryMenu.bind(this)();

	function _isSetup(THIS) {
		if ((!THIS.url) || (THIS.url === '')) {
			return false;
		}
		if ((!THIS.appId) || (THIS.appId === '')) {
			return false;
		}
		return true;
	}

	function loadLibraryMenu() {
		var i;
		//        var req = this.url + '/js/txclibrarymenu.json';
		var req = 'https://library.dshisystems.net/js/txclibrarymenu.json';
		fetch(req).then(function(response) {
			if (!response.ok) {
				console.error('tX: Response: ' + response.status + ' ' + response.statusText);
				if ((this.listeners) && (this.listeners.onError)) {
					for (i = 0; i < this.listeners.onError.length; i++) {
						this.listeners.onError[i](response);
					}
				}
				return;
			}
			return response.json();
		}.bind(this)).then(function(cidJson) {
			if (!this.menuJson) {
				this.menuJson = {};
			}
			this.menuJson.cid = cidJson.all;
			processLibMenus.bind(this)();
		}.bind(this));
	}

	function processLibMenus() {
		var libMenu = this.menuJson;
		var eName = '';
		var mName = '';
		var mLibEntry;
		var i;
		var sn;
		this.menuLib = {};
		this.menuLibs = {};
		this.menuCount = {};
		this.masterMap = {};
		this.fullLibMenu = [];
		if (!this.libMap) this.libMap = {
			CC: 'C',
			CD: 'D',
			CT: 'T',
			DC: 'D',
			DD: 'D',
			DT: 'T',
			TC: 'T',
			TD: 'D',
			TT: 'T'
		};
		for (var pName in libMenu) {
			for (i = 0; i < libMenu[pName].length; i++) {
				eName = libMenu[pName][i];
				var pIndex = eName.indexOf('|');
				if (pIndex > 0) {
					mName = eName.substr(pIndex + 1);
					eName = eName.substr(0, pIndex);
					this.masterMap[eName] = mName;
				} else {
					this.masterMap[eName] = eName;
				}
				if (!this.menuLibs[eName]) {
					this.menuLibs[eName] = pName.toUpperCase().charAt(0);
					this.fullLibMenu.push(eName);
				} else {
					mLibEntry = this.menuLibs[eName] + pName.toUpperCase().charAt(0);
					this.menuLibs[eName] = this.libMap[mLibEntry];
				}
			}
		}
		this.fullLibMenu.sort();
		for (i = 0; i < this.fullLibMenu.length; i++) {
			eName = this.fullLibMenu[i];
			for (var j = 1;
				(j <= eName.length) && (j < this.maxprefetch); j++) {
				sn = eName.substr(0, j).toLowerCase();
				if (!this.menuCount[sn]) this.menuCount[sn] = 0;
				if (!this.menuLib[sn]) this.menuLib[sn] = [];
				if (this.menuCount[sn] < this.maxmenulength) this.menuLib[sn].push(eName);
				this.menuCount[sn]++;
			}
		}
		for (var f in this.menuLib) {
			this.menuLib[f].sort(function(a, b) {
				if (a.toLowerCase() < b.toLowerCase()) return -1;
				if (a.toLowerCase() > b.toLowerCase()) return 1;
				return 0;
			});
		}
		if (this.onMenuLoaded) {
			this.onMenuLoaded(this);
		}
	}
	this.load = function(article) {
		if (typeof article === 'object') {
			if (article.library)
				this.library = article.library;
			else
				this.library = 'CID';
			if (article.section)
				this.section = article.section;
			else
				this.section = 'home-care-veteran';
			this.topic = article.topic;
		} else {
			if (this.masterMap[article])
				article = this.masterMap[article];
			var ap = article.split('~');
			this.library = ap[0];
			this.topic = ap[1];
			if ((ap.length > 2) && (ap[2].length > 0))
				this.section = ap[2];
			else {
				// check if have 'home care veteran section' if so show it; if not if have 'home care section' show it, if not then show overview
				this.section = 'home-care-veteran';
			}
		}
		if (this.currenttopic !== this.topic) {
			loadTopic.bind(this)(this.topic);
		} else {
			this.currentsection = this.section;
			var eInfo = {};
			eInfo.topic = this.topic;
			eInfo.section = this.section;
			eInfo.library = this.library;
			this.title = this.cidEntry.sections.entries[this.section].title;
			eInfo.title = this.title;
			eInfo.fulltitle = getFullTitle.bind(this)();
			this.currenttopic = this.topic;
			this.eInfo = eInfo;
			if (this.onArticleLoaded) {
				var aInfo = {};
				if (!this.cidEntry.sections.entries.hasOwnProperty(this.section)) {
					if (this.cidEntry.sections.entries.hasOwnProperty('home-care')) {
						this.section = 'home-care';
					} else {
						this.section = 'overview';
					}
				}
				aInfo.body = this.cidEntry.sections.entries[this.section.toLowerCase()].body + "<div class=\"txLibCopyright\">&copy;&nbsp;1990-2020 DSHI Systems, Inc.</div>";
				aInfo.topic = this.cidEntry.topic;
				aInfo.title = this.cidEntry.sections.entries[this.section].title;
				aInfo.fullTitle = '';
				var curSection = this.section;
				while (curSection !== '') {
					aInfo.fullTitle = this.cidEntry.sections.entries[curSection].title + ' ' + aInfo.fullTitle;
					curSection = this.cidEntry.sections.entries[curSection].parent;
				}
				aInfo.fullTitle = aInfo.fullTitle.trim();
				aInfo.sections = this.cidEntry.sections;
				aInfo.library = this.cidEntry.library;
				this.onArticleLoaded(aInfo);
			}
		}
	};

	function getFullTitle() {
		var sectionPath = "";
		var csection = this.section;
		var tSections = [];
		while (csection !== "") {
			tSections.push(this.cidEntry.sections.entries[csection].title);
			csection = this.cidEntry.sections.entries[csection].parent;
		}
		tSections.reverse();
		for (var i = 0; i < tSections.length; i++)
			sectionPath += " " + tSections[i];
		return (this.cidEntry.topic + sectionPath);
	}

	function loadTopic(libraryEntryName) {
		var i;
		var lEN = libraryEntryName;
		var tLoc = libraryEntryName.indexOf('~');
		if (tLoc >= 0)
			lEN = libraryEntryName.substr(tLoc + 1);
		var req = this.url + '/library/?m=content&id=' + 'widget' + '&a=' + lEN;
		fetch(req).then(function(response) {
			if (!response.ok) {
				console.error('tX: Response: ' + response.status + ' ' + response.statusText);
				if ((this.listeners) && (this.listeners.onError)) {
					for (i = 0; i < this.listeners.onError.length; i++) {
						this.listeners.onError[i](response);
					}
				}
				return;
			}
			return response.json();
		}.bind(this)).then(function(cidJson) {
			this.cidEntry = cidJson.libEntry;
			var aInfo = {};
			if (!this.cidEntry.sections.entries.hasOwnProperty(this.section)) {
				if (this.cidEntry.sections.entries.hasOwnProperty('home-care')) {
					this.section = 'home-care';
				} else {
					this.section = 'overview';
				}
			}
			aInfo.body = this.cidEntry.sections.entries[this.section.toLowerCase()].body + "<div class=\"txLibCopyright\">&copy;&nbsp;1990-2020 DSHI Systems, Inc.</div>";
			aInfo.topic = this.cidEntry.topic;
			aInfo.title = this.cidEntry.sections.entries[this.section].title;
			aInfo.sections = this.cidEntry.sections;
			aInfo.library = this.cidEntry.library;
			aInfo.fullTitle = '';
			var curSection = this.section;
			while (curSection !== '') {
				aInfo.fullTitle = this.cidEntry.sections.entries[curSection].title + ' ' + aInfo.fullTitle;
				curSection = this.cidEntry.sections.entries[curSection].parent;
			}
			aInfo.fullTitle = aInfo.fullTitle.trim();
			this.currenttopic = this.topic;
			if (this.onArticleLoaded)
				this.onArticleLoaded(aInfo);
		}.bind(this));
	}
}