# harmony-magentatv-bridge

`harmony-magentatv-bridge` is a little service that pretends to be a Roku server and forwards actions it receives to the Telekom MagentaTV box. It's meant to be an easy to setup alternative to using the more powerful [harmony-span](https://github.com/AShifter/harmony-span) and [iobroker.magentatv](https://github.com/h3llh0und/iobroker.magentatv) which this is based on.

# Getting started


```bash
git clone https://github.com/dschmidt/harmony-magentatv-bridge
cd harmony-magentatv-bridge
# Copy .env.dist to .env and make sure at least `EXTERNAL_IP`, `MAGENTATV_IP` and `USER_ID` are correctly set in .env
cp .env.dist .env
npm ci
npm start
```

## Based on

Thanks and kudos to the respective authors for doing the heavy lifting of reverse engineering the protocols and/or implementing them in JavaScript.

Roku emulation is based on:
https://github.com/AShifter/harmony-span

MagentaTV interaction is based on:
https://github.com/h3llh0und/iobroker.magentatv
