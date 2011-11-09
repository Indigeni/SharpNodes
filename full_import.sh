#! /bin/sh

(cat $1; echo) | ./import_sites.coffee

(cat $2; echo) | ./import_reports.coffee
