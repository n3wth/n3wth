---
draft: true
title: "Removed Docker Containers Nov 2024"
---

# Removed Docker Containers Nov 2024

```
version: "3.8"
services:
  scrypted:
    image: koush/scrypted:latest
    container_name: scrypted
    restart: unless-stopped
    network_mode: host
    volumes:
      - /volume3/docker/scrypted_new:/server/volume
    environment:
      - TZ=America/Los_Angeles # Adjust timezone if needed
```

```
  bazarr:
    image: lscr.io/linuxserver/bazarr:latest
    container_name: cineplex-bazarr
    environment:
      - PUID=1032
      - PGID=100
      - TZ=America/Los_Angeles
    volumes:
      - /volume3/docker/bazaar/config:/config:rw
      - /volume2/Data:/Data:rw
    ports:
      - 6767:6767
    networks:
      - mediaNet
    restart: unless-stopped
    mem_limit: 512m
  audiobookshelf:
    image: ghcr.io/advplyr/audiobookshelf:latest
    container_name: cineplex-audiobookshelf
    environment:
      - PUID=1032
      - PGID=100
      - TZ=America/Los_Angeles
    ports:
      - 13378:80
    volumes:
      - /volume3/docker/audiobookshelf/audiobooks:/audiobooks:rw
      - /volume3/docker/audiobookshelf/podcasts:/podcasts:rw
      - /volume3/docker/audiobookshelf/metadata:/metadata:rw
      - /volume3/docker/audiobookshelf/config:/config:rw
      - /volume2/Data:/Data:ro
    restart: unless-stopped
    networks:
      - mediaNet
    mem_limit: 512m
  calibre:
    image: ghcr.io/linuxserver/calibre:latest
    container_name: cineplex-calibre
    environment:
      - PUID=1032
      - PGID=100
      - TZ=America/Los_Angeles
    volumes:
      - /volume3/docker/calibre/config:/config:rw
      - /volume3/docker/calibre/upload:/uploads:rw
      - /volume3/docker/calibre/plugins:/plugins:rw
      - /volume2/Data/eBooks/Calibre_Library:/Data/eBooks/Calibre_Library:rw
    ports:
      - 9080:8080
      - 9081:8081
    restart: unless-stopped
    networks:
      - mediaNet
  calibre-web:
    image: ghcr.io/linuxserver/calibre-web
    container_name: cineplex-calibre-web
    environment:
      - PUID=1032
      - PGID=100
      - TZ=America/Los_Angeles
    volumes:
      - /volume3/docker/calibre-web/config:/config:rw
      - /volume2/Data/eBooks/Calibre_Library:/Data/eBooks/Calibre_Library:ro
    restart: unless-stopped
    depends_on:
      - calibre
    ports:
      - 9083:8083
    networks:
      - mediaNet

```

```
  glances:
    image: nicolargo/glances:latest-full
    container_name: glances
    ports:
      - 61208:61208
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      - GLANCES_OPT=-w
      - PUID=0
      - PGID=0
    restart: always
    pid: host
    networks:
      - mediaNet
    mem_limit: 512m
    cpuset: "0"
    cpu_shares: 2
```
