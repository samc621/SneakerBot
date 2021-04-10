FROM node:12

# Install dependencies for running Chrome, an X server, and VNC server
RUN apt-get update &&\
    apt-get install -yq net-tools gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
    libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils \
    xvfb x11vnc x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps 

# Install latest version of google-chrome-stable
RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

# Use dumb-init to kill zombie processes
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_x86_64 /usr/local/bin/dumb-init

RUN chmod +x /usr/local/bin/dumb-init

ENTRYPOINT ["dumb-init", "--"]  

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"

# Puppeteer is packaged with Chromium, but we can skip the download since we are using google-chrome-stable
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN mkdir ~/.vnc

# Set password on VNC server
RUN x11vnc -storepasswd 1234 ~/.vnc/passwd

# Expose default port for VNC server
EXPOSE 5900

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .   

ARG NODE_ENV

ENV NODE_ENV=$NODE_ENV

RUN chmod +x ./container_start.sh

EXPOSE 8000

CMD /bin/sh './container_start.sh'