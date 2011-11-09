#! /bin/sh

(cat ./sites ; echo) | ./import_sites.coffee

(cat ./reports ; echo) | ./import_reports.coffee

./import_countries.coffee ./countries
