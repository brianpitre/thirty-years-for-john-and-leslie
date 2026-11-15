/* ============================================================
   THIRTY YEARS · FOR JOHN & LESLIE — the book's words, photos and links.

   This is the only file to edit for a quote, a name, a link or the
   front-matter copy. js/book.js turns it into pages.

   · *stars* around words set them in the italic accent.
   · Quotes are word for word from "Thirty Years - For John and Leslie
     - beats.md" (fillers like "um" and a repeated word dropped, nothing
     reworded; an ellipsis marks words skipped). After changing one, run
     tools/john_leslie_book_check.py.
   · A couple's photo is always the two of them together.
   · Wherever John and Leslie are named in the book's own words, they are
     "Pastors John and Leslie" (Brian, 13 Nov). What people SAY in their
     quotes is left exactly as they said it.
   · After any change here, the artifact copy has to be rebuilt and
     republished (README: "The artifact copy").
   ============================================================ */
window.BOOK = {

  /* THE FILM: one video for the whole book. Paste its link here (Vimeo,
     YouTube, or a path to an .mp4). The button on page 44 plays it from
     the top; each person's button plays the same film from their `start`.
     (Brian, 15 Nov: "30th Anniversary - For Pastors John & Leslie" on YouTube,
     1:14:56, with a time marker for each person in its description. Each
     `start` below is that person's marker.) */
  filmUrl: 'https://youtu.be/KA8xyKF62Do',

  /* How a Watch link plays the film:
       'over'  in a player over the book (an ordinary website)
       'tab'   as a plain link that opens the film itself, at that person's time, in a new tab
       'link'  the same link, left to whatever shows the page to open: the artifact copy
     The artifact copy is always 'link', whatever this says: an artifact may not show another
     site inside itself, nor open a tab of its own (tools/john_leslie_book_artifact.py sets it). */
  filmOpens: 'over',

  /* false hides the small "Watch" button on every person's page. */
  pageLinks: true,

  /* The picture's shape, width / height. The documentary's frame is 2:1
     (4096x2048); use 16 / 9 if the film is exported that way. */
  videoAspect: 2 / 1,

  /* Which cover:
       'title'  CHOSEN (Brian, 13 Nov): olive, set like the back of the Nov 15 card.
                The "30 years" mark, The Life Church, 1996–2026, and nothing else.
       'names'  the anniversary key art: sage, the names in rows, the badge, the flourish
       'box'    the first pass: orange, the title on a sheet of paper
     To look at another without editing this file, add ?cover=names to the link. */
  cover: 'title',

  /* true puts a small "Cover 1/3" button under the closed book that shows the next cover.
     Off now that the cover is chosen. */
  coverPicker: false,

  /* ---- front and back matter (Brian's edits of 13 Nov are in) ---- */
  copy: {
    kicker: 'The Life Church · 1996–2026',
    title: 'Thirty *Years*',
    flourish: 'for Pastors John & Leslie',     /* page 1 */
    subtitle: 'Fifteen answers to one question\nand one last word',     /* no punctuation (Brian, 14 Nov); the break before "and" is his too (15 Nov) */

    /* the cover: two lines under the "30 years" mark */
    coverChurch: 'The Life Church',
    coverDates: '1996–2026',

    /* The rows of words on the inside of the cover and on the last page. Left out, they are the
       first names of everyone in the book. The anniversary art's own rows would be:
       ['Memphis', 'Nashville', 'New York', 'Massachusetts', 'DC Metro', 'Santiago', 'Italy', 'South Africa'] */
    coverWords: null,

    /* page 2: no punctuation on either line (Brian, 14 Nov) */
    dedicationLead: 'Celebrating 30 years of *The Life Church*',
    dedication: 'To Pastors John and Leslie Siebeling',

    /* page 3 */
    questionKicker: 'The question',
    question: 'What influence have Pastors John and Leslie had on you, both in ministry and on a *personal level?*',
    questionBody: [
      'This question was asked in fifteen of the interviews filmed for the 30th anniversary.',
      'What follows is one line from each answer and a last word from Pastor Don Matheny.'   /* no comma (Brian, 15 Nov) */
    ],

    /* page 44: the closing page, with the button that plays the film */
    closingKicker: 'The film',
    closing: 'Every answer, whole.',
    closingBody: 'One interview at a time with minimal edits.',     /* (Brian's words, 15 Nov) */
    watchLabel: 'Watch the film',
    watchSoon: 'Film link coming soon',

    /* only the two covers that are not in use ('names', 'box') show this */
    coverFlourish: 'for Pastors John & Leslie'
  },

  /* ---- the four parts (each opens on two pages of its colour: its number and title on the left,
          its people listed at the foot of the right) ----
     An optional  lede: '...'  puts a line under the part's title. */
  chapters: [
    { id: 'friends',   part: 'Part One',   title: 'Old Friends',      nav: 'Old Friends',   colour: 'mustard' },
    { id: 'memphis',   part: 'Part Two',   title: 'The Memphis Team', nav: 'Memphis',       colour: 'orange' },   /* was sage: it was followed by a sage quote (Brian, 14 Nov: "Swap them") */
    { id: 'locations', part: 'Part Three', title: 'The Locations',    nav: 'Locations',     colour: 'coffee' },   /* was olive: the cover's green is not a page's colour (Brian, 14 Nov) */
    { id: 'last-word', part: 'Part Four',  title: 'The Last Word',    nav: 'The Last Word', colour: 'sage' }      /* was orange: it followed an orange quote */
  ],

  /* ---- two pages each, in the order they come in the book: on the left their line, alone, in the
          colours of their title in the film; on the right their photo, name and button ----
     name   as it reads on the photo and in the part's list
     since  the small line under the name in the part's list
     photo  images/people/<photo>.jpg (cut by tools/john_leslie_book_images.py)
     focus  the photo shows 3:2 of that 2:1 picture: where the window sits across it,
            0 = the picture's left edge, 100 = its right edge (leave out for the middle)
     by     who says the line, for a couple. It stands under the quote. (One person: leave it
            out, and their first name stands there, "Pastor Don" for Pastor Don Matheny.)
     start  where this person begins in the film: '12:34' or '1:02:16' (or seconds).
            '0:00' is a real time; leave it '' until it is known and the button
            reads "Video coming soon".
     combo  (optional) 1-5: the film title's colour combination for this person, if the film's
            order ever differs from this one. Left out, the five are dealt in turn down this
            list, the way the film's titles deal them: 1 paper (the page's cream, in the book),
            2 olive (dark brown, in the book), 3 mustard, 4 sage, 5 orange, then 1 again.   */
  people: [
    { id: 'sciacchetano', chapter: 'friends', name: 'Pete & Kristi Sciacchetano',
      since: 'Lifelong friends',
      photo: 'sciacchetano', focus: 62, by: 'Pete', start: '0:00',
      quote: 'We would not be the people we are today if it wasn’t for *John and Leslie.*' },

    { id: 'anzivino', chapter: 'friends', name: 'Matt Anzivino',
      since: 'Met Pastor John in Baton Rouge 40 years ago',
      photo: 'anzivino', focus: 90, start: '3:39',
      quote: 'The thing that inspires me the most is his *kindness.*' },

    { id: 'carter', chapter: 'friends', name: 'Rob Carter',
      since: 'Since the Home Builders days',
      photo: 'carter', focus: 0, start: '6:57',
      quote: 'There was no question who the leader was. The leader was *Pastor John.*' },

    { id: 'meneses', chapter: 'memphis', name: 'Mundo Meneses',
      since: '23 years',
      photo: 'meneses', focus: 100, start: '8:30',
      quote: 'I have seen how they have never asked people to do something that they’re *not willing to do themselves.*' },

    { id: 'lord', chapter: 'memphis', name: 'Dan Lord',
      since: '13 years on the team',
      photo: 'lord', focus: 0, start: '13:22',
      quote: 'He instilled a permission in our hearts to *dream big* and believe God.' },

    { id: 'hill', chapter: 'memphis', name: 'Johnny Hill',
      since: '21 years',
      photo: 'hill', focus: 50, start: '18:00',
      quote: 'I’m just thankful for a vision that’s big enough that I can *dream inside of it.*' },

    { id: 'bartlett', chapter: 'memphis', name: 'Adam Bartlett',
      since: '19 years',
      photo: 'bartlett', focus: 0, start: '23:02',
      quote: 'I’ve always been a person. I’ve always been *Adam Bartlett.* He’s always cared about me.' },

    { id: 'vanblaricom', chapter: 'memphis', name: 'Parker VanBlaricom',
      since: 'Grew up in the church',
      photo: 'vanblaricom', focus: 100, start: '25:20',
      quote: 'They know all my kids’ names. I got *four of them.* That’s hard to keep up with.' },

    { id: 'fuentes', chapter: 'locations', name: 'Josh & Jessica Fuentes',
      since: 'The Life Church Santiago',
      photo: 'fuentes', focus: 64, by: 'Josh', start: '27:32',
      quote: 'There isn’t a *public* Pastor John and Pastor Leslie and a *private* Pastor John and Pastor Leslie.' },

    { id: 'francis', chapter: 'locations', name: 'Wayne & Classy Francis',
      since: 'The Life Church New York',
      photo: 'francis', focus: 82, by: 'Wayne', start: '32:41',
      quote: 'Our lives are *bigger, better, brighter.* You saw all the B’s? Bigger, better, brighter, because of the Siebelings.' },

    { id: 'vazquez', chapter: 'locations', name: 'Emy Vazquez',
      since: 'The Life Church Massachusetts',
      photo: 'vazquez', focus: 30, start: '41:00',
      quote: 'I got their back. For me, it’s *covenant.* And I know they got mine.' },

    { id: 'geraci', chapter: 'locations', name: 'Marco & Tiina Geraci',
      since: 'The Life Church Italy',            /* (not "Florence": Brian, 15 Nov) */
      photo: 'geraci', focus: 44, by: 'Marco', start: '57:37',
      quote: 'I love our pastors. They’re like our *heroes.*' },

    { id: 'nunley', chapter: 'locations', name: 'Andreas & Jerrica Nunley',
      since: 'The Life Church DC Metro',         /* (not "Washington, DC": Brian, 15 Nov) */
      photo: 'nunley', focus: 100, by: 'Andreas', start: '1:00:11',
      quote: 'He singled me out and he said my name … I didn’t even know he *knew my name* at that point.' },

    { id: 'wright', chapter: 'locations', name: 'Adrian & Leigh Wright',
      since: 'The Life Church South Africa',
      photo: 'wright', focus: 18, by: 'Adrian', start: '1:02:56',
      quote: 'I sent him a note and I just said to him, ‘Thank you for being *the pastor that I always needed.*’' },

    { id: 'hunter', chapter: 'locations', name: 'Shaston & Kendal Hunter',
      since: 'The Life Church Nashville',
      photo: 'hunter', focus: 8, by: 'Shaston', start: '1:09:34',
      quote: 'They are just *Team Hunter.* They’re always loving on us, always checking on us.' },

    { id: 'matheny', chapter: 'last-word', name: 'Pastor Don Matheny',
      since: 'Nairobi Lighthouse Church',
      photo: 'matheny', focus: 94, start: '1:12:33', watchLabel: 'Watch the full message',
      quote: 'From the time that we began together here in Africa, up to this present day of 30 years of celebration, *your heart has never changed.*' }
  ]
};
