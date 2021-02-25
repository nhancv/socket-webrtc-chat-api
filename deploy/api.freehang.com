
sudo ln -s /root/wordspaces/api.freehang.com/dist /var/www/api.freehang.com
sudo nano /etc/nginx/sites-available/api.freehang.com
server {
    listen 80;
    listen [::]:80;

    root /var/www/api.freehang.com;
    index index.html index.htm index.nginx-debian.html;

    server_name api.freehang.com;

    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
sudo ln -s /etc/nginx/sites-available/api.freehang.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo service nginx reload
