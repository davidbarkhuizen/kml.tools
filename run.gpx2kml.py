#!/usr/bin/python3
import sys, os
print('python version ', sys.version)
# ----------------------------------------------------------------------

from http.server import HTTPServer, CGIHTTPRequestHandler

port = 8080
host = "localhost"

os.chdir('gpx2kml')

httpd = HTTPServer((host, port), CGIHTTPRequestHandler)

print('running server @ http://{0}:{1}'.format(host, port))
print("to quit, press <ctrl-c>...")

httpd.serve_forever()