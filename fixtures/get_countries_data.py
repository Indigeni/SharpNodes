#!/usr/bin/env python
"""
This script gathers and aggregate data from different sources for eaach country and print
a related json report.
"""

import fileinput, re, time, datetime

herdict_report = "reports.csv"

country_codes_dictionary = {"BD": {"name": "Bangladesh", "reports": 0}, "FR": {"name": "France", "reports": 0}, "KG": {"name": "Kyrgyzstan", "reports": 0}, "DK": {"name": "Denmark", "reports": 0}, "HR": {"name": "Croatia", "reports": 0}, "DE": {"name": "Germany", "reports": 0}, "BH": {"name": "Bahrain", "reports": 0}, "HU": {"name": "Hungary", "reports": 0}, "JO": {"name": "Jordan", "reports": 0}, "DZ": {"name": "Algeria", "reports": 0}, "FI": {"name": "Finland", "reports": 0}, "BY": {"name": "Belarus", "reports": 0}, "CN": {"name": "China", "reports": 0}, "PS": {"name": "Gaza and the West Bank", "reports": 0}, "AZ": {"name": "Azerbaijan", "reports": 0}, "LB": {"name": "Lebanon", "reports": 0}, "LA": {"name": "Laos", "reports": 0}, "AF": {"name": "Afghanistan", "reports": 0}, "TR": {"name": "Turkey", "reports": 0}, "LK": {"name": "Sri Lanka", "reports": 0}, "NG": {"name": "Nigeria", "reports": 0}, "LV": {"name": "Latvia", "reports": 0}, "TM": {"name": "Turkmenistan", "reports": 0}, "TJ": {"name": "Tajikistan", "reports": 0}, "OM": {"name": "Oman", "reports": 0}, "TH": {"name": "Thailand", "reports": 0}, "PE": {"name": "Peru", "reports": 0}, "NP": {"name": "Nepal", "reports": 0}, "PK": {"name": "Pakistan", "reports": 0}, "PH": {"name": "Philippines", "reports": 0}, "RO": {"name": "Romania", "reports": 0}, "AE": {"name": "United Arab Emirates", "reports": 0}, "CA": {"name": "Canada", "reports": 0}, "LY": {"name": "Libya", "reports": 0}, "GT": {"name": "Guatemala", "reports": 0}, "CO": {"name": "Colombia", "reports": 0}, "VE": {"name": "Venezuela", "reports": 0}, "RU": {"name": "Russia", "reports": 0}, "IQ": {"name": "Iraq", "reports": 0}, "YE": {"name": "Yemen", "reports": 0}, "EG": {"name": "Egypt", "reports": 0}, "IR": {"name": "Iran", "reports": 0}, "AM": {"name": "Armenia", "reports": 0}, "IT": {"name": "Italy", "reports": 0}, "VN": {"name": "Vietnam", "reports": 0}, "GE": {"name": "Georgia", "reports": 0}, "AU": {"name": "Australia", "reports": 0}, "GB": {"name": "United Kingdom", "reports": 0}, "IN": {"name": "India", "reports": 0}, "ET": {"name": "Ethiopia", "reports": 0}, "ZW": {"name": "Zimbabwe", "reports": 0}, "ID": {"name": "Indonesia", "reports": 0}, "SA": {"name": "Saudi Arabia", "reports": 0}, "MD": {"name": "Moldova", "reports": 0}, "SY": {"name": "Syria", "reports": 0}, "TN": {"name": "Tunisia", "reports": 0}, "MA": {"name": "Morocco", "reports": 0}, "UZ": {"name": "Uzbekistan", "reports": 0}, "MM": {"name": "Burma (Myanmar)", "reports": 0}, "SG": {"name": "Singapore", "reports": 0}, "IL": {"name": "Israel", "reports": 0}, "NO": {"name": "Norway", "reports": 0}, "MY": {"name": "Malaysia", "reports": 0}, "US": {"name": "United States", "reports": 0}, "QA": {"name": "Qatar", "reports": 0}, "KR": {"name": "South Korea", "reports": 0}, "KW": {"name": "Kuwait", "reports": 0}, "MR": {"name": "Mauritania", "reports": 0}, "KZ": {"name": "Kazakhstan", "reports": 0}, "UG": {"name": "Uganda", "reports": 0}, "UA": {"name": "Ukraine", "reports": 0}, "MX": {"name": "Mexico", "reports": 0}, "SE": {"name": "Sweden", "reports": 0}, "SD": {"name": "Sudan", "reports": 0}}

for line in fileinput.input([herdict_report]):
    line = line.split(",")
    countrycode = line[4]
    countrycode = countrycode[1:-1]
    if countrycode not in country_codes_dictionary.keys():
        continue # we skip reports in countries not considered by opennet
    else: 
        country_codes_dictionary[countrycode]["reports"] += 1 

for ccode in country_codes_dictionary.keys():
    country_codes_dictionary[ccode]["flag"] = "flags/%s.png" % ccode.lower()

opennet_csv_schema = "code,name,political_score,political_description,social_score,social_description,tools_score,tools_description,conflict/security_score,conflict_security_description,transparency,consistency,testing_date,url"
opennet_csv_schema = opennet_csv_schema.split(",")

opennet_report = "oni_country_data_nov_2.csv"

for line in fileinput.input([opennet_report]):
    opennet_data = {}
    line = line.split(",")
    ccode = line[0]
    for field in range(2,len(line)):
        field_name = opennet_csv_schema[field]
        opennet_data[field_name] = line[field].rstrip()
    country_codes_dictionary[ccode]["opennetData"] = opennet_data

user_data_requests_report = "google-user-data-requests.csv"
for ccode in country_codes_dictionary.keys():
    record = None
    for line in fileinput.input([user_data_requests_report]):
        line = line.split(",")
	if line[2] != ccode: continue
	else: record = line
    if record != None:
        record[3] = record[3].rstrip()
        record[4] = record[4].rstrip()
        record[5] = record[5].rstrip()
	if record[3] == '<10': record[3] = 0
	if record[4] == '<10': record[4] = 0
	if record[5] == '<10': record[5] = 0
	country_codes_dictionary[ccode]["googleUsersDataRequests"] = {}
	if record[3] != "": country_codes_dictionary[ccode]["googleUsersDataRequests"]["usersDataRequests"] = record[3]
	if record[4] != "": country_codes_dictionary[ccode]["googleUsersDataRequests"]["usersDataRequestsPercFulfilled"] = record[4]
	if record[5] != "": country_codes_dictionary[ccode]["googleUsersDataRequests"]["usersAccountsSpecified"] = record[5]

content_removal_requests_report = "google-content-removal-requests.csv"
for ccode in country_codes_dictionary.keys():
    record = None
    for line in fileinput.input([content_removal_requests_report]):
        line = line.split(",")
	if line[2] != ccode: continue
	else: record = line
    if record != None:
        record[3] = record[3].rstrip()
        record[4] = record[4].rstrip()
        record[5] = record[5].rstrip()
	country_codes_dictionary[ccode]["googleContentRemovalRequests"] = {}

        if record[3] != "" :
	    if record[3] == "<10" : contentRemovalRequests = "0"
	    else:                   contentRemovalRequests = record[3]
	    country_codes_dictionary[ccode]["googleContentRemovalRequests"]["contentRemovalRequests"]= contentRemovalRequests

        if record[4] == "" :
	    if record[4] == "<10" : contentRemovalPercFulfilled = "0"
	    else:                   contentRemovalPercFulfilled = record[4]
	    country_codes_dictionary[ccode]["googleContentRemovalRequests"]["contentRemovalPercFulfilled"]= contentRemovalPercFulfilled

        if record[5] == "" :
	    if record[5] == "<10" :   itemsRequestedForRemoval = "0"
	    else:                     itemsRequestedForRemoval = record[5]
	    country_codes_dictionary[ccode]["googleContentRemovalRequests"]["itemsRequestedForRemoval"]= itemsRequestedForRemoval

struct = repr(country_codes_dictionary)
struct = struct.replace('\'','"')
print struct

