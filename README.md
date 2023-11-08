In order to run the app locally, go to Apache24/conf

Find this in httpd.conf:
<IfModule alias_module>
Within the IfModule add the following:

Alias /connect4 "path/name/to/html/folder/for/dailyBugle"
Find this in httpd.conf:
<Directory />
    AllowOverride none
    Require all denied
</Directory>
Type the following under it:

<Directory "path/name/to/html/folder/for/dailyBugle" >
    AllowOverride none
    Require all granted
</Directory>
Scroll to the bottom of proxy-html.conf and add the following:
ProxyPass /api/login http://127.0.0.1:3003

**We will add it to Docker after dev is complete
