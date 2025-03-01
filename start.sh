#!/bin/sh
# Start Memcached in background
memcached -d -u root

# Start Node.js app
npm start