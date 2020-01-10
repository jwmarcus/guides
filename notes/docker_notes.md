# Learning docker notes:

New way of running commands is `docker command subcommand`

Versions are based on YY.MM release

Releases are supported for 3 months (+1 for transition) for CE, 1 year for EE

(Image/Container) An image is the application and all source code / deps, a container is an instance of that image running as a process

You can have many containers running off the same image.

When running `docker container run --publish 80:80 --detach nginx` it does:

- Download the image `nginx` from Docker Hub
- Start a new _container_ from that image
- Bind the host port 80 to the container port 80
- `--detach` sends to background
- It will return your container ID

When stopping a container, `docker container stop XYZ`:

- Only need to type enough digits to be unique
- `docker container run` starts a **new** container
- Use `docker container start` to start an existing container
- You can see stopped containers with `docker container ls -a`
- You can name your containers with `--name container_name` otherwise it gets a name from an OS list of scientists

Other handy mangement commands:

- `docker container top XYZ` -- get the processes of that container
- `docker container rm XYZ` -- delete container, you cna also use `-f` for force
- `docker ps` -- list all containers
- `docker container inspect` -- json on how the container was started
- `docker container stats` -- real-time stream of all the containers you're running

Docker container run does:

- Looks for one locally
- Looks for one on Docker Hub if nothing local found
- Uses `:latest` by default
- Starts the command in `CMD`

More neat management controls:

- `container run -it` -- interactive, and give a psudotty
- `container run -it bash` -- run this command (bash) on the tty
  - When you exit the shell, it stops the containers
- `container start -ai XYZ` resume a container
- `container exec -it XYZ bash` will let you jump into containers

Networking for containers

- Using -p will connect it to your physical network (host:container)
- Create new virtual network for each app (back-end/db combo)
- Apps attached to the same network can talk to each other
- Separate virtual networks create app isolation
- Can attach containers to multiple virtual networks (or none)
- Skip virtual networks and use host IP `--net=host`
- Docker drivers allow for more advanced functions
- The container doesn't use the host's ip address
- To get container IP, use format: `docker container inspect --format "{{ .NetworkSettings.IPAddress }}" webhost`

More networking

- `-p` creates a default bridge network, `docker0`
- It maps ports like `host_post:container_port`
- It then connects that bridge to your interface like `eth0`
- `docker container port XYZ` shows what ports are being used for that container

CLI for network management

- `docker network (ls|inspect|etc)` all work
- `docker network create --driver` for creating new networks
- `docker network connect image network` -- attach them to a specific network

IP addresses are too dynamic, stop using them

- Use container names for host name
- Automatic container resolution for containers running on the same virtual network
- WARNING: the default virtual network docker0 bridge does not have DNS discovery by default
- You can link them, but you can just create a new virtual network and leverage default DNS services

Using --format

- Uses Golang templates to output information from inspect


"Batteries included, but removable"

- Most defaults work in many cases, but easy enough to swap out parts

Other fun commands

- `--rm` will kill the container after it's done running

DNS Round Robin example, poor man's load balancing

```
docker network create dudenet
docker container run --detach --net dudenet --net-alias search elasticsearch:2
docker container run --detach --net dudenet --net-alias search elasticsearch:2

# check
docker container run --rm --net dudenet alpine nslookup search
```

What's in a container: 

- Kernel comes from the server
- Can be big or small

How a container is built:

- `docker history nginx:latest` -- shows how that image was built
- These are called image layers
- `docker image inspect nginx:latest` -- shows, in JSON, what it expects to run, including ports

Building Docker files

- if you `ln -sf /dev/stdout /var/log/nginx/access.log` then docker will pick up on `/dev/stdout` within its own logging
- If you have commands on separate lines, it will create separate layers
  - Generally screw readability if it saves a layer, it seems
- CMD inherits from parent images

Working with Volumes

- Generally named, and do not have a slash leading the name (vs the bind-mount below)
- Created as part of the `container run` command if not found
- Persist after container shuts down
- Can be connected to multiple containers
- Example: `-v psql:/var/lib/postgresql/data postgres:9.6.1`
  - Would create a psql colume that persists

Working with bind-mounts

- Bindmounts are a type of volume that directly maps to the host FS
- Paths always begin a slash to signify it is a bind-mount and not a volume
- Great for development work on static files
  - ex: `docker container run --detach --name nginx --publish 80:80 --volume $(pwd):/usr/share/nginx/html nginx`
- Example static site generator


Watching contianers

- `docker container logs -f psql` will get the logs posted as per above

Docker compose

- Separate binary, not designed for production grade stuff
- Spins everything up and tears it down for us
- It has versions, and it can be used with swarm
- Either use `docker-compose.yml` or use the `-f` parameter to specify otherwise
- Compose understands that `.` is pwd
- If there is only one option, it is in KW pairs
- If there are multiple options, it's in list formats in KW pairs 

Compose cli

- `docker compose up` does all the work
- You can tear down and remove networks and volumes via `docker-compose down -v`
- If the image exists, compose won't rebuild if there is an existing version
- You can use `docker-compose build` or `docker-compose up --build` to get a fresh build
- You can add build instructions in the docker-compose.yml under the `build` directive
- `docker-compose down --rmi local` will take out the images that are built along the way too
- If you `build`, then the `image` will become the name of the built image, otherwise it's the public image name

Docker swarm notes

- There is a ton of stuff in here
- There are worker nodes and manager nodes
- To get it going, `docker swarm init`
- To see what's going on `docker info`, look for swarm data
- To see what nodes are attached `docker node ls`
  - Manager status of leader means it holds the config?
- You can promote workers to managers and vice versa

Docker service replaces docker run

- `docker service ls` shows services in the swarm, similar to a container or set of containers
- `docker service ps XYZ` shows the mode and replicas involved
- You can still use `docker container ls` and get information from that

Using docker-machine to control vms

- `docker-machine` is a binary just like docker-compose
- `docker-machine ls` will show you all nodes available
- `docker-machine env nodeXYZ` will switch you over to that node
- Swap nodes with `eval $(docker-machine env nodeXYZ)`
- When setting up actual servers like in DigitalOcean, you can use `docker swarm init -- advertise-addr MYADDR`
- After, you can have each server join the swarm, they will need manager keys if you want them to manage too
- Then you can spin up containers across the swarm using the `--replicas 3` and it will spread them out
  - `docker service update serviceXYZ --replicas 3`
- You can promote using `docker node update --role`

Networking in swarm

- `--driver overlay` helps with inter-node communication
- `docker network create --driver overlay networkXYZ`
- 
