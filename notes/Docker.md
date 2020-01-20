# Docker

_Docker_ comprises a CLI, a daemon and a set of remote services to build, ship and run programs inside of containers. In comparison to _virtual machines_, containers interface with a host system's OS kernel and therefore use less resources and have significantly lower startup times than a VM. Docker uses so-called _images_ to create a container. Note that Docker itself does not provide any container technology, but instead wraps around several different existing features to make containerization easy and accessible.  
Docker containers live completely in user space and can only access memory and resources scoped to that specific container.

Docker helps providing a consistent environment for applications to run in, with all dependencies and other required resources made available inside the container. Containers also help improve security by effectively jailing an application inside of a container (with a few caveats, of course).

## Using Docker

Running `docker help` lists all available commands to the Docker CLI, with `docker help <COMMAND>` giving a more in-depth explanation for each of the commands.

_Images_ are at the core of a Docker container: they are a collection of files and instructions needed to run an application. Using `docker run <IMAGE>` creates a Docker container and executes whatever instructions were provided within the image. If an image is not present on the local machine, Docker will query _Docker Hub_ (a central repository of Docker images provided by Docker Inc.) and download the image before running it.

_Detached containers_ are containers that are not attached to any input or output stream. So, to run a detached NGINX container, all that's necessary is:

```
docker run --detach \
--name web nginx:latest
```

This command returns a unique 1024-bit identifier for the container. A detached container then just runs in the background. To save the container id for use later, it can be saved in a shell variable like this:

```
CID=$(docker create nginx:latest)
echo $CID // -> outputs the container id
```

`docker create` works just like `docker run` but initializes a stopped container.

To run interactive containers, the `--interactive` (or `-i`) flag keeps `stdin` open for the container and `--tty` (or `-t`) allocates a virtual console to it. A basic interative Docker container with a shell would be run like this:

```
docker run --interactive --tty \
--name test \
busybox:1.29 /bin/sh
```

Ctrl + P and Ctrl + Q can detach the terminal from an interactive container.

To see a list of active containers, `docker ps` returns ids, image and container  names, uptime, ports in use by the container as well as currently running commands in each container.

Logfiles for a container can be fetched with `docker logs <CONTAINER-NAME>`. This basically prints everything from the container's `stdout` and `stderr` without any truncation, so this output can get pretty large over time. For actively monitoring the logs of a container, `docker logs` can be run with the `--follow flag` (or `-f`), providing a stream of all log messages.

Containers can be stopped by running `docker stop <CONTAINER-NAME>` or restarted with `docker restart <CONTAINER-NAME>`.

To execute commands inside of a container, `docker exec <CONTAINER-NAME> <COMMAND>` can be used.

To keep containers separated, Docker by default creates a _process id namespace_ for each one. PIDs are used by a Linux system to identify processes. Since each container has its own namespace, they can each have their own PIDs (with PID `1` potentially identifying a different process in each container).  
To run a container without a separate namespace, `docker run --pid host` would use the host OS's namespace, so that the container can access all processes on the host system, if necessary.

When running a varying amount of Docker containers and dynamically creating or tearing down some, naming the with the `--name` flag is no longer viable.  
In that case, their unique ids can either be used in combination with shell  scripts (like described above) or a CID (container id) file can be leveraged. Both `docker run` and `docker create` can take a `--cidfile <PATH-TO-FILE>` flag to automatically write their ids to a file.  
Another alternative would be using `docker ps` with the `--latest` (or `-l`) flag for outputting only the last created container and `--quiet` (or `-q`) to only output the container id.  
Another helpful feature is Docker's auto-naming: every container receives a human-readable name in the form of `<adjective>_<inventor_name>` (like `festive_tesla`) that can be read through `docker ps -a`.