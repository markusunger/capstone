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

- install yarn
  - ```
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

    sudo apt update && sudo apt install yarn
    ```

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
  upstream apibackend {
          server localhost:1337;
  }

  upstream cfgbackend {
          server localhost:3333;
  }

  server {
          listen 80;
          listen [::]:80;
          server_name .200ok.app;
          return 301 https://$server_name$request_uri;
  }

  server {
          listen 443 ssl;
          server_name 200ok.app www.200ok.app;

          ssl_certificate /etc/letsencrypt/live/200ok.app/fullchain.pem;
          ssl_certificate_key /etc/letsencrypt/live/200ok.app/privkey.pem;
          include /etc/letsencrypt/options-ssl-nginx.conf;
          ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

          location / {
                  proxy_pass http://cfgbackend;
                  proxy_set_header X-Real-IP $remote_addr;
                  proxy_set_header Host $host;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          }
  }

  server {
          listen 443 ssl;
          server_name ~.*.200ok.app;

          ssl_certificate /etc/letsencrypt/live/200ok.app/fullchain.pem;
          ssl_certificate_key /etc/letsencrypt/live/200ok.app/privkey.pem;
          include /etc/letsencrypt/options-ssl-nginx.conf;
          ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

          location / {
                  proxy_pass http://apibackend;
                  proxy_set_header X-Real-IP $remote_addr;
                  proxy_set_header Host $host;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          }
  }
  ```
- symlink that config to the `sites-enabled` folder with `ln -s`
- restart nginx (`sudo systemctl restart nginx`), or check config with `sudo nginx -t`

## Mongo Installation and Security

- get Mongo public key (`wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -`)
- add source repository (`echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list`)
- update apt and install (`sudo apt-get update && sudo apt-get install -y mongodb-org`)
- enable Mongo daemon (`sudo systemctl enable mongod`) and start \o/

## Deploying 200 OK

- `git clone` both repositories locally and `yarn install`
- set up `.env` file
- install `pms2` (`yarn add --global pm2`)
- use `pm2 start yarn run --name <whatever-backend>` to start process