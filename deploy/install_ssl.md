
## setup ssl https

```
sudo apt update
sudo apt install software-properties-common -y
sudo add-apt-repository universe
sudo add-apt-repository ppa:certbot/certbot
sudo apt update
sudo apt install certbot python-certbot-nginx  -y
sudo certbot --nginx

* Select redirect all request to HTTPS, nginx will update domain config automatically

```
