const HERO_VIDEO_URL =
  "https://firebasestorage.googleapis.com/v0/b/codigo-abierto-effc8.firebasestorage.app/o/videoFCA.mp4?alt=media&token=7acf55f4-68eb-4d16-8700-49cf6d42123b";

export function ConocenosHero() {
  return (
    <header className="w-full bg-black">
      <h1 className="sr-only">Conócenos — Costa Digital</h1>
      <div className="mx-auto flex w-full justify-center px-4">
        <div className="relative w-[58%] min-w-0 max-w-full sm:w-3/5 md:w-[62%]">
          <video
            src={HERO_VIDEO_URL}
            className="block aspect-video w-full rounded-md object-cover object-center"
            autoPlay
            loop
            playsInline
            muted
            aria-label="Video institucional sobre el ecosistema tech del Caribe"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[22%] min-w-[2rem] rounded-l-md bg-gradient-to-r from-black to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[22%] min-w-[2rem] rounded-r-md bg-gradient-to-l from-black to-transparent"
          />
        </div>
      </div>
    </header>
  );
}
