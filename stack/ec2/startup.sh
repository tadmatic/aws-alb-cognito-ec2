#!/bin/bash

# Install Nginx - using Amazon Linux Extras repo
amazon-linux-extras install nginx1 -y

# Setup home page
echo "Hello World" > /usr/share/nginx/html/index.html

# start nginx service
systemctl start nginx

# ensure nginx starts on boot
systemctl enable nginx
