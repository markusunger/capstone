# Setting Up A Server for 200 OK

- provision a cloud server from Hetzner at https://console.hetzner.cloud/ running Ubuntu 18.04
- set up root password and user account (`useradd <name>`)
- configure new user as a sudoer (`usermod -aG sudo <name>`)

## General Server Setup
(following https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-18-04)

- allow OpenSSH incoming traffic in `ufw` firewall (`ufw allow OpenSSH`)
- enable firewall (`ufw enable` then check with `ufw status`)
- install Node.js 12.x
  - ```
    curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```
  - check with `node -v`

## NGINX setup and SSL certs with Let's Encrypt

- get wildcard SSL cert for 200ok.app with `certbot`
  - install `certbot`
    ```
    sudo add-apt-repository ppa:certbot/certbot
    sudo apt-get update
    sudo apt-get install certbot python-certbot-nginx
    ```
  - issue cert `sudo certbot -d 200ok.app -d *.200ok.app --manual certonly` 

- add server block configuration to `/etc/nginx/sites-available/200ok.app`
  ```
  server {
    listen 80;
    listen [::]:80;
    server_name *.200ok.app;
    return 301 https://$host$request_uri;
  }

  server {
    listen 443 ssl;
    server_name 200ok.app www.200ok.app;

    ssl_certificate /etc/letsencrypt/live/200ok.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/200ok.app/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/200ok.app;
    index index.html;
    location / {
            try_files $uri $uri/ =404;
    }
  }
  ```
- symlink that config to the `sites-enabled` folder with `ln -s`
- restart nginx (`sudo systemctl restart nginx`), or check config with `sudo nginx -t`
