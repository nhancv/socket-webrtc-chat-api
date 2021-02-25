
sudo nano /etc/nginx/sites-available/api.dev.freehang.com
server {
    listen 80;
    listen [::]:80;

    server_name api.dev.freehang.com;

    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
sudo ln -s /etc/nginx/sites-available/api.dev.freehang.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo service nginx reload
