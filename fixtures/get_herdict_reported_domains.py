#!/usr/bin/env python
"""
This script parses an herdict csv file containing crowd-sourced reports,
and just print the domains for the reported urls.
Only domains and TLDs are considered, except for blogs on blogspot.com and wordpress.com.

Please note that printed domains are not unique.
The output of this script has been parsed with a shell, i.e.,

$ cat output | sort | uniq -c | sort -rn

and only the domains with more than <threshold> reports have been considered as
a base for the websites data.
"""

import fileinput
import re

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

to_be_removed_prefixes = ['http://', 'https://', 'www.']

for line in fileinput.input([herdict_report]):
    line = line.split(',')
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
    print url

