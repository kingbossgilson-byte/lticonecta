// substitua pelo seu App ID da Agora
const APP_ID = "b627e9c0c19545aa8f5aee3a548830f0";

const CHANNEL = "teste";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

async function start() {

  await client.join(APP_ID, CHANNEL, null, null);

  const [audioTrack, videoTrack] =
    await AgoraRTC.createMicrophoneAndCameraTracks();

  videoTrack.play("local-video");

  await client.publish([audioTrack, videoTrack]);

  client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    if (mediaType === "video") {
      user.videoTrack.play("remote-video");
    }

    if (mediaType === "audio") {
      user.audioTrack.play();
    }
  });

  console.log("Conectado com sucesso!");
}

start();