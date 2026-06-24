'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'

const TONE_COLORS = {
  begin: { solid: 'hsl(170 55% 36%)', soft: 'hsl(170 55% 36% / 0.12)' },
  inter: { solid: 'hsl(195 85% 32%)', soft: 'hsl(195 85% 32% / 0.12)' },
  adv: { solid: 'hsl(22 88% 46%)', soft: 'hsl(22 88% 46% / 0.13)' },
  spec: { solid: 'hsl(200 30% 24%)', soft: 'hsl(200 30% 24% / 0.12)' },
} as const

type Tone = keyof typeof TONE_COLORS

interface DiveSite {
  id: string
  num: number
  name: string
  type: string
  tone: Tone
  difficulty: string
  signature: string
  depthLabel: string
  maxDepth: number
  currents: string
  location: string
  pos: { x: string; y: string }
  description: string
  image?: string
}

const SITES: DiveSite[] = [
  { id: 'barracuda-point', num: 1, name: 'Barracuda Point', type: 'Wall + channel drift', tone: 'adv', difficulty: 'Advanced', signature: 'The barracuda tornado', depthLabel: 'To ~40m', maxDepth: 40, currents: 'Currents: strong', location: 'Northeast of the island', pos: { x: '68%', y: '30%' }, description: "Sipadan's signature dive. Descend a sheer wall watching the blue for pelagics, then drift into the channel where resident barracuda coil into a spinning vortex thousands strong. Grey reef sharks rest on the channel floor; the dive finishes in a shallow coral garden, often with dozing turtles.", image: '/images/dive-sites/barracuda-point.webp' },
  { id: 'south-point', num: 2, name: 'South Point', type: 'Steep wall, drift', tone: 'adv', difficulty: 'Advanced', signature: 'Hammerheads & big pelagics', depthLabel: 'To ~40m', maxDepth: 40, currents: 'Currents: mod–strong', location: 'Southern tip', pos: { x: '50%', y: '82%' }, description: "The site for big-animal encounters. A dramatic coral wall drops into the blue and stronger currents draw in the pelagics — Sipadan's best chance at scalloped hammerheads on an early-morning deep dive, plus eagle rays, trevally, and the occasional manta or whale shark.", image: '/images/dive-sites/drop-off.webp' },
  { id: 'the-drop-off', num: 3, name: 'The Drop Off', type: 'Wall (from shore)', tone: 'inter', difficulty: 'Intermediate', signature: '600m vertical wall', depthLabel: 'Wall 600m+', maxDepth: 40, currents: 'Currents: can be strong', location: 'By the jetty, north point', pos: { x: '49%', y: '19%' }, description: "Once regularly voted the best shore dive on the planet. Metres from the old jetty the reef wall plunges more than 600m straight down — a vertical face of corals and overhangs patrolled by white-tip reef sharks, with the entrance to the famous Turtle Cavern along its length." },
  { id: 'turtle-cavern', num: 4, name: 'Turtle Cavern & Tomb', type: 'Cavern / cave', tone: 'spec', difficulty: 'Specialist only', signature: 'Turtle skeletons', depthLabel: 'Entrance ~18m', maxDepth: 30, currents: 'Calm inside', location: 'East of the jetty', pos: { x: '63%', y: '27%' }, description: "Sipadan's most haunting feature. The entrance opens at ~18m into a bell-shaped tunnel descending to the Turtle Tomb, a chamber layered with the remains of turtles that never found their way out. Full penetration is for trained cave divers only; the gorgonian-draped wall outside is a superb dive in its own right.", image: '/images/dive-sites/turtle-cave.webp' },
  { id: 'hanging-gardens', num: 5, name: 'Hanging Gardens', type: 'Wall with overhangs', tone: 'inter', difficulty: 'Intermediate', signature: 'Cascading soft corals', depthLabel: 'To ~40m', maxDepth: 40, currents: 'Currents: mild–mod', location: 'Southern side', pos: { x: '40%', y: '77%' }, description: "The most beautiful wall at Sipadan, named for the curtains of soft coral cascading from its overhangs. Pastel tree corals, gorgonians and sponges blanket the face, while frogfish, nudibranchs and reef fish reward those who look closely." },
  { id: 'coral-garden', num: 6, name: 'Coral Garden', type: 'Coral slope', tone: 'begin', difficulty: 'Beginner-friendly', signature: 'Pristine hard & soft coral', depthLabel: 'Shallow ~12m', maxDepth: 12, currents: 'Currents: gentle', location: 'North area, by Barracuda Pt', pos: { x: '39%', y: '22%' }, description: "Calm, shallow and luminous — Sipadan's most relaxed dive, ideal for long bottom times, photography and snorkellers. A dense carpet of hard and soft coral home to clownfish, sweetlips and turtles grazing in the shallows." },
  { id: 'white-tip-avenue', num: 7, name: 'White Tip Avenue', type: 'Reef edge / plateau', tone: 'begin', difficulty: 'Beginner-friendly', signature: 'Resting reef sharks', depthLabel: 'Plateau ~18m', maxDepth: 18, currents: 'Currents: gentle–mod', location: 'Reef edge on a drop-off', pos: { x: '66%', y: '40%' }, description: "A gap in the reef along a drop-off, named for the white-tip reef sharks resting on its sandy plateaus — shy and easy to approach slowly. Grey reef sharks share the ledges, with bumphead parrotfish and bigeye trevally schooling past." },
  { id: 'turtle-patch', num: 8, name: 'Turtle Patch', type: 'Coral garden', tone: 'begin', difficulty: 'Beginner-friendly', signature: 'Turtles & table corals', depthLabel: 'Moderate ~22m', maxDepth: 22, currents: 'Currents: gentle', location: 'East side', pos: { x: '73%', y: '48%' }, description: "Exactly what the name promises: a coral garden alive with green and hawksbill turtles, white-tip sharks, parrotfish and big table corals. An excellent morning dive — ride the current all the way toward Barracuda Point." },
  { id: 'mid-reef', num: 9, name: 'Mid Reef', type: 'Reef / wall', tone: 'inter', difficulty: 'Intermediate', signature: 'Eagle rays, schooling fish', depthLabel: 'Mod–deep ~30m', maxDepth: 30, currents: 'Currents: variable', location: 'East side, between the points', pos: { x: '71%', y: '62%' }, description: "Often overshadowed by the headline sites but a consistent performer. Healthy coral and dense reef fish with frequent eagle and devil ray encounters — and schooling baby grey reef sharks, sometimes fifty or more at once.", image: '/images/dive-sites/mid-reef.webp' },
  { id: 'staghorn-crest', num: 10, name: 'Staghorn Crest', type: 'Coral garden + wall', tone: 'inter', difficulty: 'Intermediate', signature: 'Staghorn coral fields', depthLabel: 'Crest to ~25m', maxDepth: 25, currents: 'Currents: moderate', location: 'Just north of South Point', pos: { x: '55%', y: '73%' }, description: "A shallow coral garden of staghorn fields giving way to a dropping wall — macro-rich shallows and pelagic-watching depth in one dive. Its proximity to South Point means big animals occasionally drift through." },
  { id: 'lobster-lair', num: 11, name: 'Lobster Lair', type: 'Reef wall', tone: 'inter', difficulty: 'Intermediate', signature: 'Lobsters in the crevices', depthLabel: 'Moderate ~25m', maxDepth: 25, currents: 'Currents: moderate', location: 'Along the reef wall', pos: { x: '64%', y: '70%' }, description: "Named for the lobsters tucked into the cracks and crevices of the reef wall. A site for slowing down and peering into the reef structure, with the usual Sipadan cast of turtles, reef fish and passing sharks." },
  { id: 'west-ridge', num: 12, name: 'West Ridge', type: 'Sloping reef', tone: 'begin', difficulty: 'Beginner-friendly', signature: 'Black coral & afternoon light', depthLabel: 'Sloping ~30m', maxDepth: 30, currents: 'Currents: gentle', location: 'Western side (deepest flank)', pos: { x: '26%', y: '50%' }, description: "The west side falls away to the deepest water around Sipadan. A gentle sloping reef dominated by large black coral bushes and abundant reef fish — a lovely afternoon dive when the light comes round, with fine snorkelling in the shallows." },
]

const MARINE = [
  { title: 'Turtles, everywhere', body: "Green and hawksbill turtles gather to feed and mate — it's common to see twenty or more on a single dive, often close up, grazing on sponges or resting under ledges." },
  { title: 'Sharks as a near-guarantee', body: 'White-tips cruise the walls, grey reef sharks school on the deeper plateaus, and black-tips patrol the shallows. For the lucky, scalloped hammerheads rise from the deep at South Point.' },
  { title: 'The big schools', body: "Sipadan's calling card is sheer biomass: thousands-strong barracuda tornadoes, walls of bigeye trevally, herds of bumphead parrotfish at dawn, and shimmering clouds of jacks." },
  { title: 'Rare pelagics', body: 'Eagle and devil rays are common; manta rays appear when currents bring plankton; and during migration season, whale sharks occasionally pass through the blue.' },
  { title: 'Macro treasures', body: 'Between the big stuff: garden eels, nudibranchs, frogfish, scorpionfish, mantis shrimp, pipefish and leaf scorpionfish — especially at Hanging Gardens and Coral Garden.' },
]

const SEASONS = [
  { tag: 'The best window', months: 'March – October', color: 'hsl(170 55% 36%)', body: 'Dry season. Calmest seas, warmest water, and visibility that can reach 30–40 metres or more.' },
  { tag: 'The sweet spot', months: 'April – June', color: 'hsl(195 85% 32%)', body: 'Widely considered the prime window for hammerhead sightings at South Point, on early-morning deep dives.' },
  { tag: 'Still excellent', months: 'July – August', color: 'hsl(45 80% 45%)', body: 'Great diving continues, though occasionally choppier seas and slightly reduced visibility.' },
  { tag: 'More variable', months: 'December – February', color: 'hsl(22 88% 46%)', body: 'Some rain and rougher days, but plenty of great diving still happens through these months.' },
]

const STATS = [
  { value: '12', label: 'named dive sites' },
  { value: '600m', label: 'vertical wall' },
  { value: '30–40m', label: 'peak visibility' },
  { value: '26–31°C', label: 'water, year-round' },
  { value: 'AOW', label: 'minimum cert' },
]

export default function DiveSitesContent() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeSite = SITES.find((s) => s.id === activeId) || null

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden text-white water-pattern">
        <div className="relative max-w-[1180px] mx-auto px-5 py-[clamp(64px,12vw,128px)] text-center">
          <p className="uppercase tracking-[.3em] text-[13px] text-amber-100 mb-4">
            MV Celebes Explorer &middot; Sipadan, Borneo
          </p>
          <h1 className="text-[clamp(2.3rem,6vw,4.4rem)] font-extrabold leading-[1.04] max-w-[14ch] mx-auto">
            The jewel of the Celebes Sea
          </h1>
          <p className="text-[clamp(1.02rem,1.6vw,1.25rem)] text-white/80 max-w-[62ch] mx-auto mt-5 mb-8 leading-relaxed">
            Malaysia&apos;s only oceanic island — a coral-crowned pinnacle rising 600 metres straight from the seabed, in the heart of the Coral Triangle. Twelve world-class dive sites, one boat with daily Sipadan permits.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="#sites" className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3.5 rounded-xl font-bold text-[15px] shadow-[0_8px_24px_hsl(25_90%_40%/0.4)] hover:brightness-110 transition">
              Explore the dive sites
            </a>
            <Link href="/book" className="inline-flex items-center gap-2 bg-white/10 border-[1.5px] border-white/50 text-white px-6 py-3.5 rounded-xl font-bold text-[15px] backdrop-blur-sm hover:bg-white/20 transition">
              Book your trip
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5 mt-8">
            {['Top-5 dive destination, for decades', 'Reef sharks & turtles near-guaranteed', 'Permit-protected, strictly limited access'].map((badge) => (
              <span key={badge} className="text-[13px] text-white/80 bg-white/10 border border-white/[0.18] px-3.5 py-[7px] rounded-full">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-background py-[clamp(56px,8vw,90px)]">
        <div className="max-w-[880px] mx-auto px-5">
          <AnimateOnScroll animation="fade-in">
            <p className="text-accent font-bold uppercase tracking-[.18em] text-[13px]">Diving Sipadan</p>
            <h2 className="text-[clamp(1.7rem,3.5vw,2.5rem)] font-extrabold leading-[1.12] mt-2.5 mb-5">
              Walls that fall into the deep blue
            </h2>
            <div className="flex flex-col gap-4 text-[clamp(1rem,1.4vw,1.12rem)] leading-[1.72] text-[hsl(200_12%_32%)]">
              <p>Sipadan sits where the reef meets the abyss. Walls drop vertically into the deep, nutrient-rich currents sweep past the coral, and pelagic life gathers in numbers that have kept the island on the world&apos;s top-five dive lists for decades. That single fact — an oceanic pinnacle in the most biodiverse marine region on Earth — shapes every dive here.</p>
              <p>On a typical day you&apos;ll lose count of green and hawksbill turtles, see reef sharks as a near-certainty rather than a highlight, and drift past schools of barracuda and bigeye trevally that gather into slow, spiralling tornadoes. On a lucky day, scalloped hammerheads rise from the depths, eagle and devil rays pass overhead, and the occasional manta or whale shark glides through on the current.</p>
              <p>Access is strictly controlled. Sabah Parks limits the number of divers permitted at Sipadan each day — which is exactly why the reefs remain so healthy after decades of fame.</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Stat Band */}
      <section className="tropical-divider text-white py-[clamp(40px,6vw,60px)]">
        <div className="max-w-[1180px] mx-auto px-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-7 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-none">{stat.value}</div>
              <div className="text-white/[0.78] text-sm mt-1.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* At a Glance */}
      <section className="bg-white py-[clamp(56px,8vw,90px)]">
        <div className="max-w-[1180px] mx-auto px-5">
          <AnimateOnScroll animation="fade-in">
            <div className="text-center mb-3.5">
              <p className="text-accent font-bold uppercase tracking-[.18em] text-[13px]">At a glance</p>
              <h2 className="text-[clamp(1.7rem,3.5vw,2.5rem)] font-extrabold leading-[1.12] mt-2">All twelve sites, sized up</h2>
            </div>
            <p className="text-center text-muted-foreground max-w-[60ch] mx-auto mb-9 text-[15px] leading-relaxed">
              Every Sipadan site needs Advanced Open Water as a baseline — &ldquo;difficulty&rdquo; below is relative to that. Tap a site for the full picture, or find it on the map.
            </p>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {SITES.map((site) => {
              const tone = TONE_COLORS[site.tone]
              return (
                <a
                  key={site.id}
                  href={`#site-${site.id}`}
                  onMouseEnter={() => setActiveId(site.id)}
                  className="flex gap-3 items-start no-underline bg-background border border-border rounded-[14px] p-4 hover:border-primary/50 hover:bg-primary/[0.04] transition-colors"
                >
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-lg text-white font-bold text-[13px] flex items-center justify-center"
                    style={{ background: tone.solid }}
                  >
                    {site.num}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-[15px] text-foreground">{site.name}</span>
                    <span className="block text-[12.5px] text-muted-foreground mt-0.5 mb-2">{site.type}</span>
                    <span
                      className="inline-block text-[11px] font-bold px-2.5 py-[3px] rounded-full"
                      style={{ color: tone.solid, background: tone.soft }}
                    >
                      {site.difficulty}
                    </span>
                    <span className="block text-[12.5px] text-[hsl(200_15%_38%)] mt-2 italic">{site.signature}</span>
                  </span>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="bg-background py-[clamp(56px,8vw,90px)]">
        <div className="max-w-[1180px] mx-auto px-5">
          <AnimateOnScroll animation="fade-in">
            <div className="text-center mb-8">
              <p className="text-accent font-bold uppercase tracking-[.18em] text-[13px]">The layout</p>
              <h2 className="text-[clamp(1.7rem,3.5vw,2.5rem)] font-extrabold leading-[1.12] mt-2">Where the sites sit around the island</h2>
            </div>
          </AnimateOnScroll>

          <div className="relative w-full max-w-[660px] aspect-square mx-auto rounded-3xl overflow-hidden shadow-[inset_0_0_60px_hsl(206_90%_14%/0.5)]" style={{ background: 'radial-gradient(circle at 32% 30%, hsl(193 70% 52%), hsl(200 78% 36%) 55%, hsl(206 82% 24%))' }}>
            {/* Wave pattern overlay */}
            <div className="absolute inset-0 water-pattern opacity-20" />
            {/* Island */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[42%] h-[52%] rounded-[48%_52%_44%_56%/56%_46%_58%_42%] shadow-[0_0_0_9px_hsl(168_62%_56%/0.4),0_0_0_20px_hsl(168_62%_56%/0.16)] flex items-center justify-center" style={{ background: 'linear-gradient(158deg, hsl(46 62% 88%), hsl(38 46% 70%))' }}>
              <span className="text-[11px] font-extrabold tracking-[.18em] text-[hsl(35_40%_38%)] uppercase text-center leading-snug">
                Sipadan<br /><span className="font-semibold text-[9px] tracking-[.1em]">island</span>
              </span>
            </div>
            {/* Compass */}
            <div className="absolute top-3.5 left-4 flex flex-col items-center text-white opacity-85">
              <span className="text-sm leading-none">&#9650;</span>
              <span className="text-xs font-extrabold tracking-[.05em]">N</span>
            </div>
            {/* Celebes Sea label */}
            <span className="absolute bottom-3.5 right-4 text-[10px] font-semibold tracking-[.22em] text-white/55 uppercase">Celebes Sea</span>
            {/* Site markers */}
            {SITES.map((site) => {
              const tone = TONE_COLORS[site.tone]
              const isActive = site.id === activeId
              return (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => setActiveId(activeId === site.id ? null : site.id)}
                  onMouseEnter={() => setActiveId(site.id)}
                  title={site.name}
                  className="absolute w-8 h-8 rounded-full border-[3px] border-white text-white font-bold text-[13px] flex items-center justify-center cursor-pointer p-0 transition-transform duration-150"
                  style={{
                    left: site.pos.x,
                    top: site.pos.y,
                    transform: `translate(-50%, -50%)${isActive ? ' scale(1.28)' : ''}`,
                    background: tone.solid,
                    boxShadow: `0 3px 10px rgba(0,0,0,0.3)${isActive ? `, 0 0 0 5px ${tone.soft}` : ''}`,
                    zIndex: isActive ? 7 : 4,
                  }}
                  aria-label={`${site.name} — ${site.difficulty}`}
                >
                  {site.num}
                </button>
              )
            })}
          </div>

          {/* Info strip below map */}
          <div className="max-w-[660px] mx-auto mt-4 min-h-24">
            {activeSite ? (
              <div className="flex flex-wrap gap-4 items-center bg-white border border-border rounded-2xl p-4 shadow-md">
                <span
                  className="flex-shrink-0 w-[42px] h-[42px] rounded-[11px] text-white font-extrabold text-[17px] flex items-center justify-center"
                  style={{ background: TONE_COLORS[activeSite.tone].solid }}
                >
                  {activeSite.num}
                </span>
                <div className="flex-1 min-w-[180px]">
                  <div className="font-extrabold text-lg">{activeSite.name}</div>
                  <div className="text-[13px] text-muted-foreground mt-0.5">{activeSite.location}</div>
                </div>
                <div className="flex flex-col gap-1.5 items-start">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ color: TONE_COLORS[activeSite.tone].solid, background: TONE_COLORS[activeSite.tone].soft }}
                  >
                    {activeSite.difficulty}
                  </span>
                  <span className="text-[13px] text-[hsl(200_15%_35%)] italic">{activeSite.signature}</span>
                </div>
                <a
                  href={`#site-${activeSite.id}`}
                  className="flex-shrink-0 bg-primary text-white px-4 py-2.5 rounded-[10px] font-bold text-sm no-underline hover:bg-primary/90 transition"
                >
                  View details &rarr;
                </a>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 items-center text-center text-muted-foreground text-[13px] pt-1.5">
                <span className="font-semibold text-[hsl(200_15%_35%)]">Tap a marker to see the site</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[hsl(170_55%_36%)]" />Beginner-friendly</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[hsl(195_85%_32%)]" />Intermediate</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[hsl(22_88%_46%)]" />Advanced</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[hsl(200_30%_24%)]" />Specialist</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dive Site Cards */}
      <section id="sites" className="bg-white py-[clamp(56px,8vw,90px)] scroll-mt-[74px]">
        <div className="max-w-[1180px] mx-auto px-5">
          <AnimateOnScroll animation="fade-in">
            <div className="text-center mb-10">
              <p className="text-accent font-bold uppercase tracking-[.18em] text-[13px]">The dive sites</p>
              <h2 className="text-[clamp(1.7rem,3.5vw,2.5rem)] font-extrabold leading-[1.12] mt-2">Twelve dives, each its own world</h2>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SITES.map((site) => {
              const tone = TONE_COLORS[site.tone]
              const pct = Math.max(14, Math.round((site.maxDepth / 40) * 100))
              const isActive = site.id === activeId
              return (
                <article
                  key={site.id}
                  id={`site-${site.id}`}
                  onMouseEnter={() => setActiveId(site.id)}
                  className={`relative flex flex-col bg-white border rounded-[18px] overflow-hidden scroll-mt-[86px] shadow-sm transition-shadow hover:shadow-md ${isActive ? 'border-accent ring-2 ring-accent/30' : 'border-border'}`}
                >
                  {/* Image area */}
                  <div className="relative h-[188px] bg-[repeating-linear-gradient(135deg,hsl(195_40%_90%),hsl(195_40%_90%)_11px,hsl(195_35%_86%)_11px,hsl(195_35%_86%)_22px)] flex items-center justify-center">
                    {site.image ? (
                      <Image
                        src={site.image}
                        alt={`Underwater view of ${site.name} dive site at Sipadan Island showing ${site.signature.toLowerCase()}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <span className="font-mono text-[11px] tracking-wide text-[hsl(200_25%_45%)] bg-white/70 px-2.5 py-1 rounded-md">
                        photo: {site.id}.webp
                      </span>
                    )}
                    <span
                      className="absolute top-3 left-3 w-8 h-8 rounded-[9px] text-white font-extrabold text-[15px] flex items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.25)] z-[1]"
                      style={{ background: tone.solid }}
                    >
                      {site.num}
                    </span>
                    <span
                      className="absolute top-3 right-3 text-[11.5px] font-bold bg-white/[0.92] px-2.5 py-1 rounded-full z-[1]"
                      style={{ color: tone.solid }}
                    >
                      {site.difficulty}
                    </span>
                  </div>
                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-[1.28rem] font-extrabold leading-[1.15] mb-0.5">{site.name}</h3>
                    <p className="text-[13px] text-muted-foreground mb-3.5">{site.type}</p>
                    {/* Signature */}
                    <div className="flex gap-2.5 items-center bg-secondary/10 rounded-[10px] px-3 py-2.5 mb-3.5">
                      <span className="text-[10px] font-extrabold tracking-[.1em] uppercase text-[hsl(170_60%_30%)] flex-shrink-0">Signature</span>
                      <span className="text-[13.5px] font-semibold text-[hsl(195_60%_22%)]">{site.signature}</span>
                    </div>
                    {/* Depth bar */}
                    <div className="mb-3.5">
                      <div className="flex justify-between text-[11.5px] text-muted-foreground mb-1">
                        <span>{site.depthLabel}</span>
                        <span>{site.currents}</span>
                      </div>
                      <div className="h-[7px] bg-muted rounded-full overflow-hidden">
                        <div className="h-full ocean-gradient rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-[hsl(200_12%_34%)] flex-1 mb-4">{site.description}</p>
                    <div className="flex gap-2 items-center text-[12.5px] text-muted-foreground border-t border-border pt-3">
                      <span className="text-primary font-bold">&#9677;</span>
                      <span>{site.location}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Marine Life */}
      <section className="bg-background py-[clamp(56px,8vw,90px)]">
        <div className="max-w-[1180px] mx-auto px-5">
          <AnimateOnScroll animation="fade-in">
            <div className="text-center mb-10">
              <p className="text-accent font-bold uppercase tracking-[.18em] text-[13px]">Marine life</p>
              <h2 className="text-[clamp(1.7rem,3.5vw,2.5rem)] font-extrabold leading-[1.12] mt-2">What you&apos;ll see at Sipadan</h2>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MARINE.map((m) => (
              <div key={m.title} className="bg-white border border-border rounded-2xl p-6">
                <h3 className="text-[1.18rem] font-extrabold text-primary mb-2.5">{m.title}</h3>
                <p className="text-[14.5px] leading-relaxed text-[hsl(200_12%_34%)]">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Time */}
      <section className="bg-white py-[clamp(56px,8vw,90px)]">
        <div className="max-w-[1180px] mx-auto px-5">
          <AnimateOnScroll animation="fade-in">
            <div className="text-center mb-10">
              <p className="text-accent font-bold uppercase tracking-[.18em] text-[13px]">When to come</p>
              <h2 className="text-[clamp(1.7rem,3.5vw,2.5rem)] font-extrabold leading-[1.12] mt-2">Best time to dive Sipadan</h2>
              <p className="text-muted-foreground max-w-[60ch] mx-auto mt-3.5 text-[15px] leading-relaxed">
                Diveable year-round, with comfortable 26–31°C water in every season. Conditions still shift through the year.
              </p>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SEASONS.map((s) => (
              <div key={s.months} className="bg-background border border-border rounded-2xl p-5" style={{ borderTopWidth: 4, borderTopColor: s.color }}>
                <p className="text-[11px] font-extrabold tracking-[.1em] uppercase mb-0.5" style={{ color: s.color }}>{s.tag}</p>
                <h3 className="text-[1.1rem] font-extrabold mb-2">{s.months}</h3>
                <p className="text-sm leading-relaxed text-[hsl(200_12%_36%)]">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3.5 bg-primary/[0.06] border border-primary/[0.22] border-l-4 border-l-primary rounded-xl p-4">
            <div className="flex-1">
              <p className="text-[11px] font-extrabold tracking-[.12em] uppercase text-primary mb-1">Important — Sipadan closes every November</p>
              <p className="text-[15px] leading-relaxed text-[hsl(200_15%_28%)]">
                The whole island closes for the month of November so the marine environment can recover. Plan for December through October. East-side sites — Turtle Patch, Mid Reef and Barracuda Point — dive best in the morning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Dive + Permits */}
      <section className="bg-background py-[clamp(56px,8vw,90px)]">
        <div className="max-w-[1180px] mx-auto px-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-border rounded-[18px] p-7">
            <p className="text-accent font-bold uppercase tracking-[.18em] text-xs">Requirements</p>
            <h2 className="text-[1.55rem] font-extrabold mt-2 mb-4">Who can dive Sipadan?</h2>
            <div className="flex flex-col gap-3.5">
              {[
                <><strong>Advanced Open Water (minimum).</strong> We also ask for 20+ logged dives and valid dive insurance.</>,
                <>Walls, depth and current make Sipadan better suited to experienced divers. Newer divers can build skills on the calmer house and training reefs first.</>,
                <>A Sabah Parks permit is required for every diver, every day. Independent diving isn&apos;t permitted — you must dive with a licensed operator.</>,
              ].map((text, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-accent mt-[7px]" />
                  <p className="text-[14.5px] leading-relaxed text-[hsl(200_12%_34%)]">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[18px] p-7 text-white" style={{ background: 'linear-gradient(160deg, hsl(195 85% 30%), hsl(200 70% 18%))' }}>
            <p className="text-amber-100 font-bold uppercase tracking-[.18em] text-xs">The permit system</p>
            <h2 className="text-[1.55rem] font-extrabold mt-2 mb-4">Why booking with us beats the lottery</h2>
            <p className="text-[14.5px] leading-[1.68] text-white/85 mb-4">
              Sabah Parks issues a strictly limited number of permits per day, split among licensed operators — which is precisely why Sipadan&apos;s reefs still thrive. Permits can&apos;t be bought independently, and in peak season demand far outstrips supply.
            </p>
            <p className="text-sm text-white/80">
              As the only liveaboard licensed to dive Sipadan every day, booking with us removes the permit lottery that land-based guests face. To maximise your Sipadan days, book early — especially for the April-to-August peak.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden tropical-divider text-white py-[clamp(64px,10vw,100px)] text-center scroll-mt-16">
        <div className="relative max-w-[760px] mx-auto px-5">
          <span className="inline-flex w-[52px] h-[52px] rounded-[14px] bg-white/15 items-center justify-center text-[22px] mb-4">&#9875;</span>
          <h2 className="text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.08] mb-3.5">Ready to dive Sipadan?</h2>
          <p className="text-[clamp(1rem,1.6vw,1.2rem)] text-white/85 max-w-[54ch] mx-auto mb-7 leading-relaxed">
            Choose your trip and we&apos;ll handle the permits, the guiding, and getting you to the right site at the right time. Limited spots each day.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/diving-packages" className="bg-accent text-white px-7 py-4 rounded-xl font-bold text-[15px] no-underline shadow-[0_8px_24px_hsl(25_90%_35%/0.4)] hover:brightness-110 transition">
              View packages
            </Link>
            <Link href="/book" className="bg-white text-primary px-7 py-4 rounded-xl font-bold text-[15px] no-underline hover:bg-white/90 transition">
              Book your dive trip
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(200_25%_15%/0.97)] backdrop-blur border-t border-white/10">
        <div className="max-w-[1180px] mx-auto px-4 py-2.5 flex items-center gap-3.5">
          <span className="text-white/85 text-[13.5px] font-semibold flex-1 min-w-0">
            Daily Sipadan permits — strictly limited. Reserve your spot.
          </span>
          <Link href="/diving-packages" className="flex-shrink-0 bg-primary text-white px-4 py-2 rounded-[9px] font-bold text-[13.5px] no-underline whitespace-nowrap hover:bg-primary/90 transition">
            Packages
          </Link>
          <Link href="/book" className="flex-shrink-0 bg-accent text-white px-4 py-2 rounded-[9px] font-bold text-[13.5px] no-underline whitespace-nowrap hover:brightness-110 transition">
            Book now
          </Link>
        </div>
      </div>
    </div>
  )
}
