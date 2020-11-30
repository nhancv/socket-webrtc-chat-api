# Deploy

## Server
```
ssh root@104.248.90.40
```

## Setup git
```
sudo apt install git -y
```

## Setup nodejs
```
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pm2
sudo npm install pm2 -g
pm2 install pm2-logrotate
```

## Install MongoDB
```
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list

sudo apt-get update
sudo apt-get install -y build-essential
sudo apt-get install -y mongodb-org
sudo systemctl enable mongod
sudo service mongod start
```

- Controls
```
- Start: sudo service mongod start
- Verify status: sudo cat /var/log/mongodb/mongod.log or sudo systemctl status mongod
- Stop: sudo service mongod stop
- Restart: sudo service mongod restart
- Status: sudo systemctl status mongod
```

- Setup db auth
```
mongo
> use admin;
> db.createUser({
      user: "admin",
      pwd: "ADMIN_PASSWORD_HERE",
      roles: [
                { role: "userAdminAnyDatabase", db: "admin" },
                { role: "readWriteAnyDatabase", db: "admin" },
                { role: "dbAdminAnyDatabase",   db: "admin" }
             ]
  });

> use freehang;
> db.createUser({
      user: "u_freehang",
      pwd: "DB_PASSWORD_HERE",
      roles: [
                { role: "userAdmin", db: "freehang" },
                { role: "dbAdmin",   db: "freehang" },
                { role: "readWrite", db: "freehang" }
             ]
  });
```

- Public db
```
$ sudo nano /etc/mongod.conf

# network interfaces
net:
  port: 27017
  bindIp: 0.0.0.0

#security:
security:
  authorization: 'enabled'
```

- Restart db
```
sudo service mongod restart

# Check status to make sure db config is correct
sudo service mongod status
```

- Test connection
```
mongo -u u_freehang -p DB_PASSWORD_HERE 127.0.0.1/freehang
```

## Prepare source
- Clone source 
```
git clone https://github.com/brianpattaya/freehang-api.git
cd freehang-api
```

- Create .env
```
# env: dev, prod
ENV=prod
MONGODB_URL=mongodb://u_freehang:DB_PASSWORD_HERE@localhost:27017/freehang
# Secret key to gen jwt token
SECRET_KEY=key
# Token expires
EXPIRES_IN=30d
# Guest token expires in MINUTES
GUEST_EXPIRES_MINUTE=5
# Max connection for guest
GUEST_CONNECTION_LIMIT=3
# Guest block time in MINUTES when reach max connection
GUEST_BLOCKING_TIME=5
# Folder update file
MULTER_DEST=upload
# AWS
AWS_BUCKET=freehang
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

- Update firebase admin sdk
```
mkdir secret
cd secret
nano firebase-adminsdk.json
```

## Run app
- In the first time
```
# Install dep
npm i
pm2 start npm --name freehang-prod -- run start
```
- Reload app
```
pm2 reload freehang-prod
```
- View logs
```
pm2 logs freehang-prod
```

## Api endpoint

```
DEV:
dev.freehang.com
- http://104.248.90.40:3002/

api.dev.freehang.com
- http://104.248.90.40:3001/api
- http://104.248.90.40:3001/docs

Prod: 
freehang.com
- http://104.248.90.40:3002/

api.freehang.com
- http://37.139.0.10:3000/api
```

## Start demo

### Install tmux
```
sudo apt install tmux
```

#### tmux basic command
```
# New session
tmux

# Inside current session
## Create another session
Ctrl + B + :new<CR>
## View and select session on list
Ctrl + B + s

# Kill session (can not attach anymore)
Ctrl + D

# Detach session (can be attach again)
Ctrl + B + D

# Attach session
tmux a
tmux a -t sessionId

# View list of session
tmux ls
```

### Install local https server
```
npm i -g local-web-server
```

### Start demo
```
# new/attach tmux section
tmux a

# start client
cd freehang-api/client
ws --http2

# detach tmux
Ctrl + B + D
```

- Demo endpoint
https://104.248.90.40:8000/

# Install nginx
```
sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```
