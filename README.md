# harmony-magentatv-bridge

`harmony-magentatv-bridge` is a little service that pretends to be a Roku server which can be controlled by a Logitech Harmony Remote and forwards actions it receives to the Telekom MagentaTV box. It's meant to be an easy to setup alternative to using the more powerful [harmony-span](https://github.com/AShifter/harmony-span) and [iobroker.magentatv](https://github.com/h3llh0und/iobroker.magentatv) which this is based on.

## Limitations

The Roku integration in Harmony is rather rudimentary, the biggest shortcoming is that it does not provide number keys. Even if it did, it's not possible to assign arbitrary devices/keys to the number keys on the touch screen. So this basically makes more or less all the hardware keys work, but you cannot jump to a specific channel by number or use channel icons to access them.

This needs to be solved by Logitech and Telekom in proper direct integration ... but as nothing happened in that regard over the last year, this project was created.

Assigning keys on the hardware remote does not (!) change the assigned keys in the action in your mobile app, you always need to select the Roku device and cannot use the activity for switching channels.

## Getting started

There are multiple steps involved in getting this to work in your home network.

### Retrieve your Telekom Magenta User Id

Unfortunately the first step is already the most complicated and (not automated) task: you need to figure out your Magenta User Id.
For that you need to:

- go to https://web.magentatv.de/login
- open your browser's developer tools / network inspector
- maybe you need to enable a "preserve log" setting there
- login
- filter the request urls for `DTAuthenticate`
- choose a request and find the`userID` key
- copy the value

This value needs to be later used as `USER_ID` setting or can be hashed via `require('crypto').createHash('md5').update(env.USER_ID).digest("hex").toUpperCase()` in `Node` and then be supplied to the service as `USER_HASH`.

### Start the service
You have multiple options to run this service:

1. Run it from source (needs nodejs installed)

```bash
git clone https://github.com/dschmidt/harmony-magentatv-bridge
cd harmony-magentatv-bridge
# Copy .env.dist to .env and make sure at least `EXTERNAL_IP`, `MAGENTATV_IP` and `USER_ID` / `USER_HASH` are correctly set in .env
cp .env.dist .env
npm ci
npm start
```

2. Run it from source (but in docker)
```bash
git clone https://github.com/dschmidt/harmony-magentatv-bridge
cd harmony-magentatv-bridge
# Copy .env.dist to .env and make sure at least `EXTERNAL_IP`, `MAGENTATV_IP` and `USER_ID` are correctly set in .env
cp .env.dist .env
docker-compose up
```

### Add Roku device to Harmony Hub

Open your Harmony app on your mobile and search for new devices on the network. A `Roku Streaming Stick+` should be found.
If not it might help to restart your Harmony Hub.
## Mapping

When the Hub successfully recognized the Roku server, it can be added to activities - most importantly to your TV activity.

This table is a recommendation for a mapping to create in the Harmony configuration app.
`Harmony Key` is the key or action which you can to specify a `Harmony Roku Command Name` for.
`Roku Command` and `MagentaTV` code are more of an implementation detail, which you usually should not need to care about.

| Harmony Key  | Harmony Roku Command Name | Roku Command  | MagentaTV Code |
|--------------|---------------------------|---------------|----------------|
| Up/ChUp      | DirectionUp               | Up            | Up             |
| Down/ChDown  | DirectionDown             | Down          | Down           |
| Left         | DirectionLeft             | Left          | Left           |
| Right        | DirectionRight            | Right         | Right          |
| OK           | OK                        | Select        | Ok             |
| Back         | Back                      | Back          | Back           |
| Play         | Play / Pause              | Play          | PausePlay      |
| Pause        | Play / Pause              | Play          | PausePlay      |
| Rewind       | Rewind                    | Rev           | Rewind         |
| Forward      | Forward                   | Fwd           | Forward        |
|              | Search                    | Search        | Search         |
| StartUp-Seq. | Sleep                     | PowerOff      | Power          |
| ShutDown-Seq.| Sleep                     | PowerOff      | Power          |
| Record       | Info / Options*           | Info          | Record         |
| Menu         | Home / Exit               | Home          | Home           |
| Exit         | Exit                      | InstantReplay | Exit           |

Some keys are shown as separate commands in the Harmony configuration but in reality they send the same command to the roku device, that's why multiple command names can be seen in the table above for one key.

Of course you are free to use the keys completely differently, especially if your Remote looks different than the Elite that was used to set this project up initially.
PRs for making this more configurable are also very welcome.

## Based on

Thanks and kudos to the respective authors for doing the heavy lifting of reverse engineering the protocols and/or implementing them in JavaScript.

Roku emulation is based on:
https://github.com/AShifter/harmony-span

MagentaTV interaction is based on:
https://github.com/h3llh0und/iobroker.magentatv
