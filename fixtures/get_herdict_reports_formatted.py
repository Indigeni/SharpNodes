#!/usr/bin/env python
"""
This script parses an herdict csv file containing crowd-sourced reports,
and returns a set of json objects declarations which represents them.

(BTW, it's kind of an extension of get_herdict_reported_domains.py)

NB: Herdict reports are not verified. 
E.g., 600+ fake records have been removed for domain palestine-info.co.uk (identified by random 8-length strings as ISPs)
"""

import fileinput, re, time, datetime

herdict_report = 'reports.csv'

# Dotted TLDs have been... well... taken fromt the registration page from godaddy.com
allow_lvl2_sub_for_dom = [ ".blogspot.com",".wordpress.com",
                           ".co.cc",".com.ag",".net.ag",".org.ag",
                           ".com.br",".net.br",".com.bz",".net.bz",
                           ".com.co",".net.co",".nom.co",".com.es",
                           ".nom.es",".org.es",".co.in",".firm.in",".gen.in",
                           ".ind.in",".net.in",".org.in",".com.mx",".co.nz",
                           ".net.nz",".org.nz",".com.tw",".idv.tw",".co.uk",
                           ".me.uk",".org.uk" ]

# These are country codes for countries considered in the report provided by opennet
country_codes_considered_by_opennet = [ "AE", "AF", "AM", "AU", "AZ", "BD", "BH", "BY", "CA", "CN", "CO", "DE", "DK", "DZ", "EG", "ET", "FI", "FR", "GB", "GE", "GT", "HR", "HU", "ID", "IL", "IN", "IQ", "IR", "IT", "JO", "KG", "KR", "KW", "KZ", "LA", "LB", "LK", "LV", "LY", "MA", "MD", "MM", "MR", "MX", "MY", "NG", "NO", "NP", "OM", "PE", "PH", "PK", "PS", "QA", "RO", "RU", "SA", "SD", "SE", "SG", "SY", "TH", "TJ", "TM", "TN", "TR", "UA", "UG", "US", "UZ", "VE", "VN", "YE", "ZW" ]

country_codes_dictionary={}
country_codes_dictionary = { "AE": "United Arab Emirates", "AF": "Afghanistan", "AM": "Armenia", "AU": "Australia", "AZ": "Azerbaijan", "BD": "Bangladesh", "BH": "Bahrain", "BY": "Belarus", "CA": "Canada", "CN": "China", "CO": "Colombia", "DE": "Germany", "DK": "Denmark", "DZ": "Algeria", "EG": "Egypt", "ET": "Ethiopia", "FI": "Finland", "FR": "France", "GB": "United Kingdom", "GE": "Georgia", "GT": "Guatemala", "HR": "Croatia", "HU": "Hungary", "ID": "Indonesia", "IL": "Israel", "IN": "India", "IQ": "Iraq", "IR": "Iran", "IT": "Italy", "JO": "Jordan", "KG": "Kyrgyzstan", "KR": "South Korea", "KW": "Kuwait", "KZ": "Kazakhstan", "LA": "Laos", "LB": "Lebanon", "LK": "Sri Lanka", "LV": "Latvia", "LY": "Libya", "MA": "Morocco", "MD": "Moldova", "MM": "Burma (Myanmar)", "MR": "Mauritania", "MX": "Mexico", "MY": "Malaysia", "NG": "Nigeria", "NO": "Norway", "NP": "Nepal", "OM": "Oman", "PE": "Peru", "PH": "Philippines", "PK": "Pakistan", "PS": "Gaza and the West Bank", "QA": "Qatar", "RO": "Romania", "RU": "Russia", "SA": "Saudi Arabia", "SD": "Sudan", "SE": "Sweden", "SG": "Singapore", "SY": "Syria", "TH": "Thailand", "TJ": "Tajikistan", "TM": "Turkmenistan", "TN": "Tunisia", "TR": "Turkey", "UA": "Ukraine", "UG": "Uganda", "US": "United States", "UZ": "Uzbekistan", "VE": "Venezuela", "VN": "Vietnam", "YE": "Yemen", "ZW": "Zimbabwe" }

to_be_removed_prefixes = ['http://', 'https://', 'www.']

for line in fileinput.input([herdict_report]):
    line = line.split(',')
    countrycode = line[4]
    countrycode = countrycode[1:-1]
    if countrycode not in country_codes_considered_by_opennet:
        continue # we skip reports in countries not considered by opennet
    ISP = line[5]
    ISP = ISP[1:-1]
    if ISP == "": ISP = "null"
    reportType = line[2]
    if reportType != '"0"': continue                          # Consider only negative reports
    url = line[3]
    url = url.lower()                                         # Make it lowercase
    url = url[1:-1]                                           # Remove separators
    for prefix in to_be_removed_prefixes:                     
        if url.startswith(prefix): url = url[len(prefix):]    # Remove prefixes
    if '/' in url: url = url[:url.find('/')]                  # Remove parameters if any
    regex = "[0-9]*\.[0-9]*\.[0-9]*\.[0-9]"                   # Skip IPs
    if re.search(regex, url) != None: continue
    lvl2_sub_allowed = False                                  # Guess if tlds is dotted or of interest
    for dom in allow_lvl2_sub_for_dom:
       if url.endswith(dom): lvl2_sub_allowed = True
    regex = '[^\.]*\.[^\.]*$'
    if lvl2_sub_allowed: regex = '[^\.]*\.[^\.]*\.[^\.]*$'
    else:                regex = '[^\.]*\.[^\.]*$'
    result = re.search(regex, url)
    if result != None: url = result.group()                   # Remove subdomains
    if url == "palestine-info.co.uk" and len(ISP) == 8: continue # Skip a bunch (600+) of fake reports
    date = line[1]
    date = date[1:-1]
    date = date[:10]
    year = int(date[:4])
    date = date[5:]
    month = int(date[:2])
    date = date[3:]
    day = int(date[:2])
    timestamp = int(time.mktime(datetime.datetime(year,month,day).timetuple()))
    countryname = country_codes_dictionary.get(countrycode,'null')

    print '{"domain": "%s", "ISP": "%s", "CountryCode": "%s", "CountryName": "%s", "timestamp": "%s" }' % (url, ISP, countrycode, countryname, timestamp)

