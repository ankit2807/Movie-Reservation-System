const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const Movie = require("../models/movieModel");
const ShowTime = require("../models/showTimeModel");
const Review = require("../models/reviewModel");
const User = require("../models/userModel");

dotenv.config();

const TMDB_POSTER = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP = "https://image.tmdb.org/t/p/original";

const realData = [
  // ═══════════════════════════════════════════════════════════════════
  // ─── LATEST MOVIES (Late 2026 Now Playing & Holiday Advance Booking) ───
  // ═══════════════════════════════════════════════════════════════════
  {
    title: "Ramayana: Rise of a Legend",
    genre: "Action, Adventure, Fantasy, Historical",
    duration: "3h 15m",
    rating: "9.4",
    votes: "485.2K",
    certification: "UA",
    type: "Movie",
    format: "IMAX 2D, IMAX 3D, 3D, 4DX, Dolby Atmos, 2D",
    languages: ["Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "English"],
    tagline: "Our truth. Our history.",
    releaseDate: new Date("2026-11-05"),
    posterImage: `${TMDB_POSTER}/vBQ7wks68OhJKlb3RnXSl2yXBXK.jpg`,
    backdropImage: `${TMDB_BACKDROP}/yHVZncPRZr63mezRX20IyKLrSkv.jpg`,
    description:
      "An ancient epic follows Prince Rama and Princess Sita whose sacred union and fourteen-year exile into the Dandaka forest mark the beginning of a legendary journey of dharma, devotion, and destiny against the mighty Demon King Ravana.",
    cast: [
      { name: "Ranbir Kapoor", role: "Prince Rama", image: `${TMDB_POSTER}/ymYNHV9luwgyrw17NXHqbOWTQkg.jpg` },
      { name: "Yash", role: "Dashanan Ravana", image: `${TMDB_POSTER}/es8St0vl9otL1XAAZJKYmNpL3Wy.jpg` },
      { name: "Sai Pallavi", role: "Sita", image: `${TMDB_POSTER}/qAPdGKUIUEzLibdgVCey7oKvvME.jpg` },
      { name: "Ravi Dubey", role: "Lakshmana", image: `${TMDB_POSTER}/dUhZ0E8nchBkjYV0okWfj4BLxy2.jpg` },
      { name: "Sunny Deol", role: "Lord Hanuman", image: `${TMDB_POSTER}/w9RenJriQVys2k5fa9ojkXpYMwO.jpg` },
      { name: "Arun Govil", role: "King Dashrath", image: `${TMDB_POSTER}/xgefRNWurCiwyLSlpnDGgfMIF7H.jpg` },
    ],
    crew: [
      { name: "Nitesh Tiwari", role: "Director", image: `${TMDB_POSTER}/h80yPI8rDKlUk29dWFFl6Is8J0P.jpg` },
      { name: "Hans Zimmer", role: "Music Director", image: `${TMDB_POSTER}/tpQnDeHY15szIXvpnhlprufz4d.jpg` },
      { name: "A. R. Rahman", role: "Music Director", image: `${TMDB_POSTER}/3po8IwdtONY72BuXr7ZhZZ0ugxQ.jpg` },
      { name: "Namit Malhotra", role: "Producer", image: `${TMDB_POSTER}/uAMUDrZlkSruuSnXcdO9K5Mf6xU.jpg` },
    ],
  },
  {
    title: "The Hunger Games: Sunrise on the Reaping",
    genre: "Sci-Fi, Action, Adventure, Thriller",
    duration: "2h 39m",
    rating: "8.8",
    votes: "194.6K",
    certification: "UA16+",
    type: "Movie",
    format: "IMAX 2D, 4DX, ICE, Dolby Atmos, 2D",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    tagline: "Welcome to the Second Quarter Quell.",
    releaseDate: new Date("2026-11-18"),
    posterImage: `${TMDB_POSTER}/jNcZH8yplxttRlf0wwqfGGMKHxX.jpg`,
    backdropImage: `${TMDB_BACKDROP}/aqFZcr2dxSZ2UwWSo1WC6C0rwDf.jpg`,
    description:
      "Return to Panem twenty-four years before Katniss Everdeen volunteers as tribute, commencing on the morning of the reaping for the 50th Hunger Games—the lethal Second Quarter Quell where twice as many tributes are forced into the Capitol's arena.",
    cast: [
      { name: "Joseph Zada", role: "Haymitch Abernathy", image: `${TMDB_POSTER}/7CUBF2zZpk9iFetHPfGFj9kOIx2.jpg` },
      { name: "Ralph Fiennes", role: "President Snow", image: `${TMDB_POSTER}/tJr9GcmGNHhLVVEH3i7QYbj6hBi.jpg` },
      { name: "Jesse Plemons", role: "Plutarch Heavensbee", image: `${TMDB_POSTER}/v6WBJbm02mfzLhs8zeUzFRDtoly.jpg` },
      { name: "Glenn Close", role: "Drusilla Sickle", image: `${TMDB_POSTER}/4VHZ1GfLwN7MUgApy0LCBzdDF9L.jpg` },
      { name: "Mckenna Grace", role: "Maysilee Donner", image: `${TMDB_POSTER}/sK0CVa56IIpFhCDrcXSTqPWxNbx.jpg` },
      { name: "Whitney Peak", role: "Lenore Dove", image: `${TMDB_POSTER}/2TuyybZPFBJzIV4ctUzxo4w3O0X.jpg` },
    ],
    crew: [
      { name: "Francis Lawrence", role: "Director", image: `${TMDB_POSTER}/pyGWo5mAwZ2Koe6leB2RjKd7vmc.jpg` },
      { name: "Nina Jacobson", role: "Producer", image: `${TMDB_POSTER}/sfgag0cl150pHNjnqCUoq81NnRs.jpg` },
      { name: "Billy Ray", role: "Screenplay", image: `${TMDB_POSTER}/AuDx9rBNUqRosFqePSHjVkVZNzK.jpg` },
      { name: "James Newton Howard", role: "Music Director", image: `${TMDB_POSTER}/qB4JgzCXCjr7NwW7UNrgBrWZDlo.jpg` },
    ],
  },
  {
    title: "O.M: Operation Mole",
    genre: "Action, Crime, Thriller",
    duration: "2h 58m",
    rating: "8.9",
    votes: "118.4K",
    certification: "UA16+",
    type: "Movie",
    format: "2D, IMAX 2D, Dolby Atmos, 4DX",
    languages: ["Tamil", "Hindi", "Telugu", "Malayalam", "Kannada"],
    tagline: "Crime Against Nature.",
    releaseDate: new Date("2026-11-19"),
    posterImage: `${TMDB_POSTER}/vFnFLqXjf7RQfkNxrrys43BZKxJ.jpg`,
    backdropImage: `${TMDB_BACKDROP}/gJqVeWZF537IUfjHlA7apBAJBBR.jpg`,
    description:
      "Set across the dense forest corridors of Tirupati and Tiruvannamalai, an elite undercover operative infiltrates a sprawling transnational red sanders syndicate as a covert task force launches Operation Mole to dismantle the cartel from within.",
    cast: [
      { name: "Dhanush", role: "Pazhanivel / Thirukumaran", image: `${TMDB_POSTER}/xnGKntkTDURY5mJ0sOVRI3VIDsY.jpg` },
      { name: "Mammootty", role: "Burma 'Siya' Karthikeyan", image: `${TMDB_POSTER}/c5ewp9XtDIOwK5QWhwA7TD0GzqO.jpg` },
      { name: "Sai Pallavi", role: "Nithya Reddy", image: `${TMDB_POSTER}/qAPdGKUIUEzLibdgVCey7oKvvME.jpg` },
      { name: "Sreeleela", role: "Roja", image: `${TMDB_POSTER}/fHrQFHy9GPII2rGsImbpBg83N3p.jpg` },
      { name: "Naseeruddin Shah", role: "Abdul Hameed", image: `${TMDB_POSTER}/iaRC8eqliA5clpsQ50sITYoNQGG.jpg` },
      { name: "Indrans", role: "Shanmugam", image: `${TMDB_POSTER}/vs5Acy2hJ4dWoM3xRGdnFKdVXzw.jpg` },
    ],
    crew: [
      { name: "Rajkumar Periasamy", role: "Director & Writer", image: `${TMDB_POSTER}/sQfHZ8FMGfdUbVNrLuE44Nff63b.jpg` },
      { name: "Sai Abhyankkar", role: "Music Director", image: `${TMDB_POSTER}/qcFxJm7fKOdcpcBpjHwVTP6hGq2.jpg` },
      { name: "Dhanush", role: "Producer", image: `${TMDB_POSTER}/xnGKntkTDURY5mJ0sOVRI3VIDsY.jpg` },
    ],
  },
  {
    title: "Godzilla Minus Zero",
    genre: "Sci-Fi, Action, Thriller",
    duration: "2h 15m",
    rating: "9.1",
    votes: "215.8K",
    certification: "UA13+",
    type: "Movie",
    format: "IMAX 2D, 4DX, MX4D, Dolby Atmos, 2D",
    languages: ["English", "Hindi", "Japanese"],
    tagline: "There is no third time. Everything ends here.",
    releaseDate: new Date("2026-11-03"),
    posterImage: `${TMDB_POSTER}/hSmIJluOJmTWvJs4d7kHRxjc8s8.jpg`,
    backdropImage: `${TMDB_BACKDROP}/oqrYIDH4tvfEzPe1yqT4jzmAWHQ.jpg`,
    description:
      "Two years after postwar Japan survived devastation, humanity clings to a hard-won recovery—until an evolved atomic terror rises from the Pacific trenches, forcing Kōichi Shikishima into one final stand for survival.",
    cast: [
      { name: "Ryunosuke Kamiki", role: "Kōichi Shikishima", image: `${TMDB_POSTER}/ut7ewXjdgUmgkhJ1EtbOo9tbc7s.jpg` },
      { name: "Minami Hamabe", role: "Noriko Shikishima", image: `${TMDB_POSTER}/eQN8N2chINckvQDiNqzDXI0v9vN.jpg` },
      { name: "Hidetaka Yoshioka", role: "Kenji Noda", image: `${TMDB_POSTER}/xWNS6qStVthhWoxmKDfNS729BjJ.jpg` },
      { name: "Masami Nagasawa", role: "Makoto Aoyama", image: `${TMDB_POSTER}/yvHhfDOral1DeyBRSzpxsoHz60t.jpg` },
      { name: "Yuki Yamada", role: "Shiro Mizushima", image: `${TMDB_POSTER}/1oRe8UYddBYzyqAjlSwMTIFgg4K.jpg` },
    ],
    crew: [
      { name: "Takashi Yamazaki", role: "Director & VFX", image: `${TMDB_POSTER}/uMBvVGGHRupMpnkdveXdWA0oZwC.jpg` },
      { name: "Naoki Sato", role: "Music Director" },
      { name: "Kazuaki Kishida", role: "Producer" },
    ],
  },
  {
    title: "Avengers: Doomsday",
    genre: "Sci-Fi, Action, Adventure",
    duration: "2h 45m",
    rating: "9.5",
    votes: "610.0K",
    certification: "UA13+",
    type: "Movie",
    format: "IMAX 3D, IMAX 2D, 4DX, ICE, 2D SCREEN X, 2D",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    tagline: "Meet your doom.",
    releaseDate: new Date("2026-12-16"),
    posterImage: `${TMDB_POSTER}/1zqWkLwC1zLBBBtIWzmkmWeMWnT.jpg`,
    backdropImage: `${TMDB_BACKDROP}/tXNt66khUBZcusc22INKCeGRr4l.jpg`,
    description:
      "Earth's Mightiest Heroes, the Fantastic Four, and allies from across three colliding universes face an existential incursion engineered by Victor von Doom in Marvel Studios' biggest theatrical event.",
    cast: [
      { name: "Robert Downey Jr.", role: "Victor von Doom / Doctor Doom", image: `${TMDB_POSTER}/f9toX5MahujsDZTJoKIa5kzdhAE.jpg` },
      { name: "Pedro Pascal", role: "Reed Richards / Mister Fantastic", image: `${TMDB_POSTER}/oKcMbVn0NJTNzQt0ClKKvVXkm60.jpg` },
      { name: "Chris Evans", role: "Steve Rogers", image: `${TMDB_POSTER}/3bOGNsHlrswhyW79uvIHH1V43JI.jpg` },
      { name: "Chris Hemsworth", role: "Thor", image: `${TMDB_POSTER}/piQGdoIQOF3C1EI5cbYZLAW1gfj.jpg` },
      { name: "Anthony Mackie", role: "Sam Wilson / Captain America", image: `${TMDB_POSTER}/vecvTm7SimizluJkyIwBxeLbvRm.jpg` },
      { name: "Paul Rudd", role: "Scott Lang / Ant-Man", image: `${TMDB_POSTER}/6jtwNOLKy0LdsRAKwZqgYMAfd5n.jpg` },
    ],
    crew: [
      { name: "Anthony Russo", role: "Director", image: `${TMDB_POSTER}/xbINBnWn28YygYWUJ1aSAw0xPRv.jpg` },
      { name: "Joe Russo", role: "Director", image: `${TMDB_POSTER}/o0OXjFzL10jCy89iAs7UzzSbyoK.jpg` },
      { name: "Kevin Feige", role: "Producer", image: `${TMDB_POSTER}/cQJJ24S5gAIC21ewye4Zu1oJsIi.jpg` },
      { name: "Alan Silvestri", role: "Music Director", image: `${TMDB_POSTER}/feUZ0Oc1MGJJbUronBbkHTmJzgy.jpg` },
    ],
  },
  {
    title: "King",
    genre: "Action, Thriller, Crime",
    duration: "2h 42m",
    rating: "9.3",
    votes: "440.5K",
    certification: "UA16+",
    type: "Movie",
    format: "IMAX 2D, 4DX, ICE, Dolby Atmos, 2D",
    languages: ["Hindi", "Tamil", "Telugu"],
    tagline: "The Crown Belongs to the Fearless.",
    releaseDate: new Date("2026-12-24"),
    posterImage: `${TMDB_POSTER}/Aq5J3pzesN7WJLIzEkWD2b4FqV9.jpg`,
    backdropImage: `${TMDB_BACKDROP}/mjiDUz5idO9LrJC40JphKmSqjfF.jpg`,
    description:
      "A battle-hardened underworld kingpin becomes a reluctant mentor to a young survivor after her family is targeted by a ruthless crime syndicate, sparking a relentless cross-continental war.",
    cast: [
      { name: "Shah Rukh Khan", role: "The King", image: `${TMDB_POSTER}/tKeQhSyXyzlzxNtxFq24iIvzXrC.jpg` },
      { name: "Suhana Khan", role: "Pupil", image: `${TMDB_POSTER}/iOwA7DenXjNqF9CpUnPoKeAZrRm.jpg` },
      { name: "Deepika Padukone", role: "Special Appearance", image: `${TMDB_POSTER}/rzvvBQ0r6oiqDdzcsdTRB7jN4Rx.jpg` },
      { name: "Abhishek Bachchan", role: "Antagonist", image: `${TMDB_POSTER}/cALtfAvfUtS0Luf8MZaSiLfFRwd.jpg` },
      { name: "Anil Kapoor", role: "Handler", image: `${TMDB_POSTER}/dwvnpiwg9m2zj0VHzlgzEotFl0G.jpg` },
      { name: "Jackie Shroff", role: "Syndicate Boss", image: `${TMDB_POSTER}/sVqe6VioM37LQwgQLd8wnC5vapK.jpg` },
    ],
    crew: [
      { name: "Siddharth Anand", role: "Director", image: `${TMDB_POSTER}/9hQ4sX2XgOWvfJFv39z4uYrisqs.jpg` },
      { name: "Gauri Khan", role: "Producer", image: `${TMDB_POSTER}/k3VBuerXy0GixEQflLgZgQKq8rF.jpg` },
      { name: "Anirudh Ravichander", role: "Music Director", image: `${TMDB_POSTER}/xKvlrZpRaXkm2K2ZiXpqgrEedUU.jpg` },
    ],
  },
  {
    title: "Dune: Part Three",
    genre: "Sci-Fi, Adventure, Drama",
    duration: "2h 30m",
    rating: "9.4",
    votes: "395.0K",
    certification: "UA13+",
    type: "Movie",
    format: "IMAX 2D, 4DX, ICE, Dolby Atmos, 2D",
    languages: ["English", "Hindi"],
    tagline: "The epic conclusion.",
    releaseDate: new Date("2026-12-15"),
    posterImage: `${TMDB_POSTER}/gknAq4pAuToh1Aq5CJfVkGQkExT.jpg`,
    backdropImage: `${TMDB_BACKDROP}/i5E9H7Ik0u61ylDDTbmUpTL3Yw.jpg`,
    description:
      "Twelve years after ascending the Golden Lion Throne as Emperor, Paul Muad'Dib Atreides confronts the devastating consequences of his holy war across the Imperium while a shadowy conspiracy closes in around Arrakis and Chani.",
    cast: [
      { name: "Timothée Chalamet", role: "Paul Atreides", image: `${TMDB_POSTER}/dFxpwRpmzpVfP1zjluH68DeQhyj.jpg` },
      { name: "Zendaya", role: "Chani", image: `${TMDB_POSTER}/1qup8tSt95HLbcy2c2xrx4iJNxv.jpg` },
      { name: "Florence Pugh", role: "Princess Irulan", image: `${TMDB_POSTER}/qqDsryavx9rwSMhDAxW6OC7oNQg.jpg` },
      { name: "Rebecca Ferguson", role: "Lady Jessica", image: `${TMDB_POSTER}/lJloTOheuQSirSLXNA3JHsrMNfH.jpg` },
      { name: "Jason Momoa", role: "Hayt / Duncan Idaho", image: `${TMDB_POSTER}/3troAR6QbSb6nUFMDu61YCCWLKa.jpg` },
    ],
    crew: [
      { name: "Denis Villeneuve", role: "Director & Writer", image: `${TMDB_POSTER}/xzQYqb4nR8xT7Zdw5itbEL9K3fd.jpg` },
      { name: "Hans Zimmer", role: "Music Director", image: `${TMDB_POSTER}/tpQnDeHY15szIXvpnhlprufz4d.jpg` },
      { name: "Mary Parent", role: "Producer", image: `${TMDB_POSTER}/jTh9ngfGF8DQvKwGM8rXSmfbQTj.jpg` },
    ],
  },
  {
    title: "How to Rob a Bank",
    genre: "Action, Comedy, Thriller",
    duration: "2h 02m",
    rating: "8.2",
    votes: "86.5K",
    certification: "UA16+",
    type: "Movie",
    format: "2D, IMAX 2D, 4DX, Dolby Atmos",
    languages: ["English", "Hindi"],
    tagline: "Who's robbing who?",
    releaseDate: new Date("2026-11-10"),
    posterImage: `${TMDB_POSTER}/ifYDZkr2qkHFz87TNVvlxajOxl5.jpg`,
    backdropImage: `${TMDB_BACKDROP}/u38hNQbxvIicUdfrHpqa9puBnA9.jpg`,
    description:
      "A crew of social-media-savvy bank robbers livestreams its daring heists across America, putting them directly in the crosshairs of a veteran FBI agent and a brilliant software engineer before their riskiest score yet.",
    cast: [
      { name: "Nicholas Hoult", role: "Ryan", image: `${TMDB_POSTER}/pXm8GWTm9eIA8pUGOjvmYjlxamu.jpg` },
      { name: "Zoë Kravitz", role: "Reagan Gardner", image: `${TMDB_POSTER}/n0mhAgmY6eJQmA7kaugsTZEJgHo.jpg` },
      { name: "Pete Davidson", role: "Vince", image: `${TMDB_POSTER}/f3kubnZu3KgMniExcq9nJy8RwjW.jpg` },
      { name: "John C. Reilly", role: "Agent West", image: `${TMDB_POSTER}/iDQ8w4qcxU3le5ZWoCKpHs1QNok.jpg` },
      { name: "Anna Sawai", role: "Emi", image: `${TMDB_POSTER}/6uFaCOupDTPRnTiedveTUvjOikC.jpg` },
    ],
    crew: [
      { name: "David Leitch", role: "Director" },
      { name: "Kelly McCormick", role: "Producer" },
    ],
  },
  {
    title: "Ebenezer",
    genre: "Fantasy, Drama, Thriller",
    duration: "1h 55m",
    rating: "8.4",
    votes: "92.3K",
    certification: "UA13+",
    type: "Movie",
    format: "2D, IMAX 2D, 4DX, Dolby Atmos",
    languages: ["English", "Hindi"],
    tagline: "Before he was Scrooge, he was...",
    releaseDate: new Date("2026-11-11"),
    posterImage: `${TMDB_POSTER}/6H2N59jJW1hZEzn2ZdrMvJw5vNI.jpg`,
    backdropImage: `${TMDB_BACKDROP}/274ahmbkJSzdmcWrWSTu9DFv5rp.jpg`,
    description:
      "In atmospheric Victorian London, notorious miser Ebenezer Scrooge is pulled into a haunting supernatural reckoning when the ghost of Jacob Marley and three spectral visitors force him to confront the darkness of his past.",
    cast: [
      { name: "Johnny Depp", role: "Ebenezer Scrooge", image: `${TMDB_POSTER}/k2xt6EUxQDwYRKIyI4IBdZxfs8n.jpg` },
      { name: "Ian McKellen", role: "Jacob Marley", image: `${TMDB_POSTER}/5cnnnpnJG6TiYUSS7qgJheUZgnv.jpg` },
      { name: "Daisy Ridley", role: "Clara", image: `${TMDB_POSTER}/9XO1HIKhefHCn7t1D568XcAlHyS.jpg` },
      { name: "Rupert Grint", role: "Bob Cratchit", image: `${TMDB_POSTER}/hYSX3RIxe2nA6A9EBfEDYZ36mYF.jpg` },
      { name: "Sam Claflin", role: "Fred", image: `${TMDB_POSTER}/e5CU4tjCNZFfm7ITmZfzjZse2Bb.jpg` },
    ],
    crew: [
      { name: "Ti West", role: "Director", image: `${TMDB_POSTER}/deib6etOMNLn1lhHEENYsRdcVGk.jpg` },
      { name: "Emma Watts", role: "Producer", image: `${TMDB_POSTER}/reX8zAoytlFK7fdUlWO4LFJ3mkl.jpg` },
      { name: "Tyler Bates", role: "Music Director", image: `${TMDB_POSTER}/vZiif8NFGpzCw5TWbagXIWygQM1.jpg` },
    ],
  },
  {
    title: "Drishyam: The Conclusion",
    genre: "Thriller, Drama, Mystery",
    duration: "2h 28m",
    rating: "8.9",
    votes: "268.4K",
    certification: "UA13+",
    type: "Movie",
    format: "2D, IMAX 2D, Dolby Atmos",
    languages: ["Hindi"],
    tagline: "The Final Chapter of Truth and Deception.",
    releaseDate: new Date("2026-10-02"),
    posterImage: `${TMDB_POSTER}/67FsF2kpgEZ1T5Qos4adgqm9dLf.jpg`,
    backdropImage: `${TMDB_BACKDROP}/nq73eRdEooripf3k0XHLtX14zyC.jpg`,
    description:
      "Years after outsmarting the police twice, Vijay Salgaonkar's carefully constructed alibi faces its ultimate test when forensic breakthroughs and a relentless new investigator reopen the case in Goa.",
    cast: [
      { name: "Ajay Devgn", role: "Vijay Salgaonkar", image: `${TMDB_POSTER}/vnHQQFzTjJ0sv14DGMIoKa3qTxN.jpg` },
      { name: "Tabu", role: "Meera Deshmukh", image: `${TMDB_POSTER}/cvt5nvCHr1ICf5u8A2mlzLQ8LsV.jpg` },
      { name: "Jaideep Ahlawat", role: "SP Rajveer Singh Tomar", image: `${TMDB_POSTER}/uILn4y8EWbMdeu71laMsh8zHY0M.jpg` },
      { name: "Shriya Saran", role: "Nandini Salgaonkar", image: `${TMDB_POSTER}/ioOgKBSCJhOdKoZpg86ld7zANbf.jpg` },
      { name: "Prakash Raj", role: "Prosecutor Indrajith Shetty", image: `${TMDB_POSTER}/dJvFZOXmZdkYCOUcKTXQAhBcAoH.jpg` },
    ],
    crew: [
      { name: "Abhishek Pathak", role: "Director", image: `${TMDB_POSTER}/ymvu4mglmm93DYvdaCAsdGlPU1m.jpg` },
      { name: "Kumar Mangat Pathak", role: "Producer", image: `${TMDB_POSTER}/TQokIwYhZesbeMrSTfXZJ8BlM1.jpg` },
      { name: "Devi Sri Prasad", role: "Music Director" },
    ],
  },
  {
    title: "Jailer 2",
    genre: "Action, Comedy, Thriller",
    duration: "2h 45m",
    rating: "8.6",
    votes: "242.0K",
    certification: "UA16+",
    type: "Movie",
    format: "2D, IMAX 2D, 4DX, Dolby Atmos",
    languages: ["Tamil", "Hindi", "Telugu", "Kannada", "Malayalam"],
    tagline: "Hukum Reloaded — Tiger's New Hunt.",
    releaseDate: new Date("2026-10-14"),
    posterImage: `${TMDB_POSTER}/upwdEyhhYZ7pT2hD535fr2MGfpx.jpg`,
    backdropImage: `${TMDB_BACKDROP}/uxGoKyTnXylK5M4z1hyyaWbmBV7.jpg`,
    description:
      "When a ruthless international syndicate targets his family, retired jailer 'Tiger' Muthuvel Pandian steps back into the shadows, unleashing his nationwide network of allies to settle the score.",
    cast: [
      { name: "Rajinikanth", role: "Muthuvel 'Tiger' Pandian", image: `${TMDB_POSTER}/cQBcrXqcQPfXOQfNfgO3slJM2xi.jpg` },
      { name: "S. J. Suryah", role: "Bodhi Kalpak", image: `${TMDB_POSTER}/7Q8510XwxPU1193cteaFQsiq2rv.jpg` },
      { name: "Vidya Balan", role: "Kantha Kalpak", image: `${TMDB_POSTER}/m4bnX5VQs2DfvQsLmfbKbBxUkC9.jpg` },
      { name: "Ramya Krishnan", role: "Viji Pandian", image: `${TMDB_POSTER}/7C1bj7z3XhqxjDIGoCs6MFJdSVa.jpg` },
      { name: "Suraj Venjaramoodu", role: "Dileep", image: `${TMDB_POSTER}/2FUs0wmR3eHBd8g4GVbCmhkUzeI.jpg` },
    ],
    crew: [
      { name: "Nelson Dilipkumar", role: "Director & Writer", image: `${TMDB_POSTER}/n0T7BQnWXPr4yhezpVzoqklxwTe.jpg` },
      { name: "Anirudh Ravichander", role: "Music Director", image: `${TMDB_POSTER}/xKvlrZpRaXkm2K2ZiXpqgrEedUU.jpg` },
      { name: "Kalanithi Maran", role: "Producer (Sun Pictures)", image: `${TMDB_POSTER}/7zMuusP8W6lEL94C0rqwOGCnd5.jpg` },
    ],
  },
  {
    title: "Jumanji: Open World",
    genre: "Adventure, Comedy, Fantasy, Action",
    duration: "2h 06m",
    rating: "8.7",
    votes: "175.2K",
    certification: "UA",
    type: "Movie",
    format: "3D, IMAX 3D, 4DX, 2D",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    tagline: "Two worlds collide. One final game.",
    releaseDate: new Date("2026-12-23"),
    posterImage: `${TMDB_POSTER}/ntjF2gemedf3ZcWzARGt6cuZlnJ.jpg`,
    backdropImage: `${TMDB_BACKDROP}/vaYfhMuwFwsMqyMnu9amtS9hUHE.jpg`,
    description:
      "Our heroes have escaped the ever-changing jungles of Jumanji before, but this holiday season the game shatters free of its console—unleashing stampedes, sky-pirates, and avatar chaos directly into the real world.",
    cast: [
      { name: "Dwayne Johnson", role: "Dr. Smolder Bravestone", image: `${TMDB_POSTER}/5QApZVV8FUFlVxQpIK3Ew6cqotq.jpg` },
      { name: "Kevin Hart", role: "Mouse Finbar", image: `${TMDB_POSTER}/byiNydUlM6oP8diA7WMvYbNM7a1.jpg` },
      { name: "Jack Black", role: "Professor Shelly Oberon", image: `${TMDB_POSTER}/rtCx0fiYxJVhzXXdwZE2XRTfIKE.jpg` },
      { name: "Karen Gillan", role: "Ruby Roundhouse", image: `${TMDB_POSTER}/rWx8u4F4aYIqmjJDeMK78ysPsu0.jpg` },
      { name: "Alex Wolff", role: "Spencer Gilpin", image: `${TMDB_POSTER}/7PMu5zFOEH7PqFDzrKThgKD4Ndf.jpg` },
    ],
    crew: [
      { name: "Jake Kasdan", role: "Director & Producer", image: `${TMDB_POSTER}/6nRHjTSi2ZP0P1xZr5HA3GlzXmn.jpg` },
      { name: "Matt Tolmach", role: "Producer", image: `${TMDB_POSTER}/8mniHJVwoJdVpwxW278yJwz8c1T.jpg` },
    ],
  },
  {
    title: "The Cat in the Hat",
    genre: "Animation, Comedy, Adventure, Family",
    duration: "1h 38m",
    rating: "8.1",
    votes: "74.2K",
    certification: "U",
    type: "Movie",
    format: "3D, 4DX, 2D",
    languages: ["English", "Hindi"],
    tagline: "The cat's out of the bag.",
    releaseDate: new Date("2026-10-31"),
    posterImage: `${TMDB_POSTER}/mWN6knIVJ2o7eGwSm7mOgSCwNUc.jpg`,
    backdropImage: `${TMDB_BACKDROP}/56Bepb58k71UUTVwKN1SxHmfzPK.jpg`,
    description:
      "Assigned his toughest mission yet by the Institute for the Institution of Imagination and Inspiration, the mischievous Cat must cheer up siblings Gabby and Sebastian in their new town—or risk losing his magical striped hat forever.",
    cast: [
      { name: "Bill Hader", role: "The Cat in the Hat (Voice)", image: `${TMDB_POSTER}/qyT50vQ9PQIEctE1IxDTEsBKstU.jpg` },
      { name: "Xochitl Gomez", role: "Gabby (Voice)", image: `${TMDB_POSTER}/q39DOx44YHrGF1h88R9HxRNZS3.jpg` },
      { name: "Matt Berry", role: "Waffles (Voice)", image: `${TMDB_POSTER}/1UCAuXgzQfeANlLnZFVSuq0OFhR.jpg` },
      { name: "Quinta Brunson", role: "Sherrie (Voice)", image: `${TMDB_POSTER}/1oEdBc88XAN3Z9n2pdNvH1XIT71.jpg` },
      { name: "Bowen Yang", role: "Gary (Voice)", image: `${TMDB_POSTER}/qzjyaEe7jjLaKSmzQ2dmtcjyCpe.jpg` },
    ],
    crew: [
      { name: "Alessandro Carloni", role: "Director", image: `${TMDB_POSTER}/igd5EphyUtZKveyeLYe4eLTztxd.jpg` },
      { name: "Erica Rivinoja", role: "Director", image: `${TMDB_POSTER}/nOqOMSWIpFkFytBFGzuysk08wxG.jpg` },
    ],
  },
  {
    title: "Madden",
    genre: "Drama, Historical, Comedy",
    duration: "1h 52m",
    rating: "7.9",
    votes: "52.8K",
    certification: "UA13+",
    type: "Movie",
    format: "2D, Dolby Atmos",
    languages: ["English"],
    tagline: "From the Sidelines to Gaming History.",
    releaseDate: new Date("2026-11-18"),
    posterImage: `${TMDB_POSTER}/bRa83oPFFPqaAF3wrpVWPqqfFel.jpg`,
    backdropImage: `${TMDB_BACKDROP}/lRsapglJZIyMfGl8oQyNASlZqDC.jpg`,
    description:
      "Chronicles John Madden's larger-than-life journey alongside Raiders maverick Al Davis—from Super Bowl glory to revolutionizing sports broadcasting and creating the global Madden NFL gaming phenomenon.",
    cast: [
      { name: "Nicolas Cage", role: "John Madden", image: `${TMDB_POSTER}/y1RtezurZYveYkVNRht7CwEgSYY.jpg` },
      { name: "Christian Bale", role: "Al Davis", image: `${TMDB_POSTER}/7Pxez9J8fuPd2Mn9kex13YALrCQ.jpg` },
      { name: "Kathryn Hahn", role: "Virginia Madden", image: `${TMDB_POSTER}/9sVllAKfEls3SJD3GoPm2JEZoa5.jpg` },
      { name: "Sienna Miller", role: "Carol Davis", image: `${TMDB_POSTER}/lq2mEeDbL98bSz0H7xcHA3F2Rrb.jpg` },
      { name: "John Mulaney", role: "Trip Hawkins", image: `${TMDB_POSTER}/i3dGv3WoIONVLSlOpW4NIaT8Fs2.jpg` },
    ],
    crew: [
      { name: "David O. Russell", role: "Director", image: `${TMDB_POSTER}/ve5hLHeUc3bi3yT25VKuPejfrMg.jpg` },
      { name: "Todd Black", role: "Producer", image: `${TMDB_POSTER}/9FlceLtsRtPZRgTjzEMxGuVkVXq.jpg` },
    ],
  },
  {
    title: "Street Fighter",
    genre: "Action, Adventure, Comedy, Thriller",
    duration: "1h 59m",
    rating: "7.8",
    votes: "64.5K",
    certification: "UA16+",
    type: "Movie",
    format: "2D, MX4D, ICE, 2D SCREEN X, 4DX, IMAX 2D",
    languages: ["English", "Hindi"],
    tagline: "The World Warrior Tournament Begins",
    releaseDate: new Date("2026-10-16"),
    posterImage: "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/street-fighter-et00481645-1784792998.jpg",
    backdropImage: "https://assets-in.bmscdn.com/iedb/movies/images/mobile/listing/xxlarge/street-fighter-et00481645-1784792998.jpg",
    description:
      "Once inseparable fighters, Ryu and Ken are drawn out of their fractured lives when a covert force pulls them into the next World Warrior Tournament.\n\nWhat appears to be a contest of strength soon reveals a far more dangerous agenda, pushing them into a relentless battle not only against ruthless opponents, but against each other, and the unresolved shadows of their shared past.",
    cast: [
      {
        name: "Noah Centineo",
        role: "Ken Masters",
        image: "https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/noah-centineo-2004274-11-11-2019-01-01-40.jpg",
      },
      {
        name: "Callina Liang",
        role: "Chun-Li",
        image: "https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/callina-liang-2054117-1768300197.jpg",
      },
      {
        name: "Andrew Koji",
        role: "Ryu",
        image: "https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/andrew-koji-2014466-23-09-2021-11-35-16.jpg",
      },
      {
        name: "Vidyut Jammwal",
        role: "Dhalsim",
        image: "https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/vidyut-jamwal-30657-24-03-2017-13-55-31.jpg",
      },
      {
        name: "Jason Momoa",
        role: "Blanka",
        image: "https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/jason-momoa-25617-24-03-2017-17-39-52.jpg",
      },
    ],
    crew: [
      {
        name: "Kitao Sakurai",
        role: "Director",
        image: "https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/kitao-sakurai-2009823-1768299674.jpg",
      },
      {
        name: "Mary Parent",
        role: "Producer",
        image: "https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/mary-parent-1052739-07-05-2019-02-00-32.jpg",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ─── STREAMS (2026 Blockbusters Now on MovieBook Stream Premiere) ───
  // ═══════════════════════════════════════════════════════════════════
  {
    title: "Spider-Man: Brand New Day",
    genre: "Sci-Fi, Action, Adventure",
    duration: "2h 25m",
    rating: "9.1",
    votes: "520.4K",
    certification: "UA13+",
    type: "Stream",
    format: "4K UHD, IMAX Enhanced, Dolby Atmos",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    tagline: "A brand new day starts now.",
    releaseDate: new Date("2026-07-29"),
    posterImage: `${TMDB_POSTER}/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg`,
    backdropImage: `${TMDB_BACKDROP}/subj7knTn4DeS6KS7qI66EQKe9i.jpg`,
    description:
      "Fighting street-level crime full-time in a New York that no longer remembers Peter Parker, Spider-Man crosses paths with Frank Castle while confronting an unseen threat that pushes him beyond his limits.",
    cast: [
      { name: "Tom Holland", role: "Peter Parker / Spider-Man", image: `${TMDB_POSTER}/xKBAaPIa1c7tzZD3Y0MhBLv4hPE.jpg` },
      { name: "Zendaya", role: "MJ", image: `${TMDB_POSTER}/1qup8tSt95HLbcy2c2xrx4iJNxv.jpg` },
      { name: "Sadie Sink", role: "Jean Grey", image: `${TMDB_POSTER}/m9OyHAyOx56Pm3JruEBqh4p9XeX.jpg` },
      { name: "Jon Bernthal", role: "Frank Castle / Punisher", image: `${TMDB_POSTER}/bjcglF1IpDcZNs1HwFxakGpzBo6.jpg` },
      { name: "Jacob Batalon", role: "Ned Leeds", image: `${TMDB_POSTER}/53YhaL4xw4Sb1ssoHkeSSBaO29c.jpg` },
    ],
    crew: [
      { name: "Destin Daniel Cretton", role: "Director", image: `${TMDB_POSTER}/wtA2EtkvCyxu4oWECzqAF7G8IZH.jpg` },
      { name: "Kevin Feige", role: "Producer", image: `${TMDB_POSTER}/cQJJ24S5gAIC21ewye4Zu1oJsIi.jpg` },
      { name: "Amy Pascal", role: "Producer", image: `${TMDB_POSTER}/texxoBV4naFHyuSii6jyxlfuEvK.jpg` },
    ],
  },
  {
    title: "The Odyssey",
    genre: "Adventure, Action, Historical",
    duration: "2h 53m",
    rating: "9.2",
    votes: "485.0K",
    certification: "UA16+",
    type: "Stream",
    format: "4K UHD, IMAX Enhanced, Dolby Vision",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    tagline: "Defy the gods.",
    releaseDate: new Date("2026-07-15"),
    posterImage: `${TMDB_POSTER}/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg`,
    backdropImage: `${TMDB_BACKDROP}/c7btGYblBnfAaw713WvFM0Kimc7.jpg`,
    description:
      "Christopher Nolan's mythic epic follows Odysseus, King of Ithaca, on his perilous ten-year voyage home after the fall of Troy—braving vengeful gods, sirens, and monsters to reunite with Penelope and Telemachus.",
    cast: [
      { name: "Matt Damon", role: "Odysseus", image: `${TMDB_POSTER}/aCvBXTAR9B1qRjIRzMBYhhbm1fR.jpg` },
      { name: "Tom Holland", role: "Telemachus", image: `${TMDB_POSTER}/xKBAaPIa1c7tzZD3Y0MhBLv4hPE.jpg` },
      { name: "Anne Hathaway", role: "Penelope", image: `${TMDB_POSTER}/s6tflSD20MGz04ZR2R1lZvhmC4Y.jpg` },
      { name: "Robert Pattinson", role: "Antinous", image: `${TMDB_POSTER}/3qZ09UE7lN6AtorfXFRYpEtSY93.jpg` },
      { name: "Charlize Theron", role: "Calypso", image: `${TMDB_POSTER}/gd7ShD0yt4bsR2STeQ19KQ6hvXL.jpg` },
    ],
    crew: [
      { name: "Christopher Nolan", role: "Director & Writer", image: `${TMDB_POSTER}/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg` },
      { name: "Emma Thomas", role: "Producer", image: `${TMDB_POSTER}/utc1PS6WVWR5tknzTJqXtnD0kBp.jpg` },
      { name: "Ludwig Göransson", role: "Music Director", image: `${TMDB_POSTER}/3phYwmonUBcDXZ1DY5kHYjYYoor.jpg` },
    ],
  },
  {
    title: "Project Hail Mary",
    genre: "Sci-Fi, Adventure, Drama",
    duration: "2h 37m",
    rating: "9.3",
    votes: "448.2K",
    certification: "UA13+",
    type: "Stream",
    format: "4K UHD, Dolby Vision, Dolby Atmos",
    languages: ["English", "Hindi"],
    tagline: "Believe in the Hail Mary.",
    releaseDate: new Date("2026-03-15"),
    posterImage: `${TMDB_POSTER}/iOb2fjXLbpJgyQXe46n1WtGCnaa.jpg`,
    backdropImage: `${TMDB_BACKDROP}/2I1OFQJ0L9T0dpU6FobKFWV2PxX.jpg`,
    description:
      "Middle-school science teacher Ryland Grace awakens alone aboard an interstellar spacecraft light-years from Earth with amnesia—and discovers he is humanity's last hope to stop a cosmic organism from extinguishing the Sun.",
    cast: [
      { name: "Ryan Gosling", role: "Ryland Grace", image: `${TMDB_POSTER}/lyUyVARQKhGxaxy0FbPJCQRpiaW.jpg` },
      { name: "Sandra Hüller", role: "Eva Stratt", image: `${TMDB_POSTER}/gDiFGzVbpjFU44QJGKsEVk8WuVw.jpg` },
      { name: "Milana Vayntrub", role: "Olesya Ilyukhina", image: `${TMDB_POSTER}/i5Cou9ExwTZvRRtl79V75CsI7oC.jpg` },
      { name: "Ken Leung", role: "Yao", image: `${TMDB_POSTER}/hpatUP6u74gkpDRmn9voNY9V43O.jpg` },
    ],
    crew: [
      { name: "Phil Lord", role: "Director", image: `${TMDB_POSTER}/2MagibFHZxky3FmMubyABUnf4lw.jpg` },
      { name: "Christopher Miller", role: "Director", image: `${TMDB_POSTER}/dr2yCgYtmNmO5vzjk9KNbjTpbzO.jpg` },
      { name: "Greig Fraser", role: "Cinematographer", image: `${TMDB_POSTER}/cwj0aValmr7TGQ2OOQk5CAy1PWf.jpg` },
    ],
  },
  {
    title: "Dhurandhar: The Revenge",
    genre: "Action, Crime, Thriller",
    duration: "3h 55m",
    rating: "8.8",
    votes: "312.6K",
    certification: "A",
    type: "Stream",
    format: "4K UHD, Dolby Atmos",
    languages: ["Hindi", "Tamil", "Telugu"],
    tagline: "The Story of the Unknown Men Unfolds.",
    releaseDate: new Date("2026-03-18"),
    posterImage: `${TMDB_POSTER}/ov8vrRLZGoXHpYjSY9Vpv1tHJX7.jpg`,
    backdropImage: `${TMDB_BACKDROP}/br4Ra4dRpvR0R7a1zPPkOwGkcky.jpg`,
    description:
      "As rival cartels, intelligence operatives, and Major Iqbal close in, deep-cover Indian agent Hamza's covert mission spirals into an all-out personal war where patriotism and vengeance collide.",
    cast: [
      { name: "Ranveer Singh", role: "Hamza / Jaskirat Singh Rangi", image: `${TMDB_POSTER}/sRiwLmhduFghJo8U2coUafnDD4C.jpg` },
      { name: "R. Madhavan", role: "Ajay Sanyal", image: `${TMDB_POSTER}/gaDrAdXxIrbBRCd9cX8YvJDEuLb.jpg` },
      { name: "Arjun Rampal", role: "Major Iqbal", image: `${TMDB_POSTER}/1F81WNcVV5cW9O4D5Otk1Y2WHV9.jpg` },
      { name: "Sara Arjun", role: "Yalina Jamali", image: `${TMDB_POSTER}/uyZIlCL6xwWlor6JYSmIYUiPE7M.jpg` },
    ],
    crew: [
      { name: "Aditya Dhar", role: "Director & Producer", image: `${TMDB_POSTER}/dIZs80xvNgA7VZClECVXIHdaATb.jpg` },
      { name: "Jyoti Deshpande", role: "Producer", image: `${TMDB_POSTER}/fpbj5f3Uny0xdyPU8Qt5dMbi1PT.jpg` },
    ],
  },
  {
    title: "Toxic",
    genre: "Action, Crime, Drama",
    duration: "3h 12m",
    rating: "8.7",
    votes: "294.1K",
    certification: "A",
    type: "Stream",
    format: "4K UHD, Dolby Atmos",
    languages: ["Kannada", "Hindi", "English", "Tamil", "Telugu", "Malayalam"],
    tagline: "A fairy tale for grown-ups.",
    releaseDate: new Date("2026-08-26"),
    posterImage: `${TMDB_POSTER}/5RTd3YCLWbEhbe9OXRuNX3pbT5U.jpg`,
    backdropImage: `${TMDB_BACKDROP}/tBRSSfgqOAq7YlG8udcoJIBm2FG.jpg`,
    description:
      "Behind a sun-drenched coastal paradise, a ruthless coastal drug empire ignites a violent power struggle between syndicates and empires.",
    cast: [
      { name: "Yash", role: "Raya / Ticket", image: `${TMDB_POSTER}/es8St0vl9otL1XAAZJKYmNpL3Wy.jpg` },
      { name: "Kiara Advani", role: "Nadia", image: `${TMDB_POSTER}/2xmU03a6kTWUvuTPMdofiFLxdAw.jpg` },
      { name: "Nayanthara", role: "Ganga", image: `${TMDB_POSTER}/sYUzvjsSsqeOgBblSzda6ZwwbEa.jpg` },
      { name: "Huma Qureshi", role: "Elizabeth", image: `${TMDB_POSTER}/nJWauZQdRjMJxwY3UP4SXrqh9CM.jpg` },
      { name: "Rukmini Vasanth", role: "Mellisa", image: `${TMDB_POSTER}/tNK06M8gRSMSiaeD2rYc855YbvF.jpg` },
    ],
    crew: [
      { name: "Geetu Mohandas", role: "Director & Writer", image: `${TMDB_POSTER}/6lhzUi7jmEkkUw3BrD6Pqyel00L.jpg` },
      { name: "Venkat K Narayana", role: "Producer", image: `${TMDB_POSTER}/6oYkELlw7tlnJPoFLHhjK0L52IJ.jpg` },
    ],
  },
  {
    title: "Toy Story 5",
    genre: "Animation, Adventure, Comedy, Family",
    duration: "1h 42m",
    rating: "8.6",
    votes: "265.0K",
    certification: "U",
    type: "Stream",
    format: "4K UHD, Dolby Vision",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    tagline: "It's on.",
    releaseDate: new Date("2026-06-17"),
    posterImage: `${TMDB_POSTER}/sfQtVlIHljToOwYjhe21KPGzZWK.jpg`,
    backdropImage: `${TMDB_BACKDROP}/qjTqY5coNiz6sVtPng40IzltsoN.jpg`,
    description:
      "When Bonnie receives a high-tech Lilypad smart tablet and forgets her classic toys, Woody, Buzz, Jessie, and the gang reunite to take on the biggest existential threat to playtime yet.",
    cast: [
      { name: "Tom Hanks", role: "Woody (Voice)", image: `${TMDB_POSTER}/oFvZoKI6lvU03n4YoNGAll9rkas.jpg` },
      { name: "Tim Allen", role: "Buzz Lightyear (Voice)", image: `${TMDB_POSTER}/k8XPNHBO459FaqkqqM4tfX5GMKk.jpg` },
      { name: "Joan Cusack", role: "Jessie (Voice)", image: `${TMDB_POSTER}/59UIeHZFYrKyP20lXqijtfTXglO.jpg` },
      { name: "Conan O'Brien", role: "Smarty Pants (Voice)", image: `${TMDB_POSTER}/deRbViPut0t80miscBpP2DhBJU5.jpg` },
      { name: "Greta Lee", role: "Lilypad (Voice)", image: `${TMDB_POSTER}/6SydTis4XUcovlwIGskT59JowLX.jpg` },
    ],
    crew: [
      { name: "Andrew Stanton", role: "Director", image: `${TMDB_POSTER}/fo6ePCWEVB0L1sccrvB99Iaoqcg.jpg` },
      { name: "Randy Newman", role: "Music Director", image: `${TMDB_POSTER}/4tdkQXQEHY4B9V3RobHqpfQAKSg.jpg` },
    ],
  },
  {
    title: "The Super Mario Galaxy Movie",
    genre: "Animation, Adventure, Comedy, Fantasy",
    duration: "1h 38m",
    rating: "8.5",
    votes: "310.4K",
    certification: "U",
    type: "Stream",
    format: "4K UHD, Dolby Vision",
    languages: ["English", "Hindi"],
    tagline: "The galaxy awaits.",
    releaseDate: new Date("2026-04-01"),
    posterImage: `${TMDB_POSTER}/eJGWx219ZcEMVQJhAgMiqo8tYY.jpg`,
    backdropImage: `${TMDB_BACKDROP}/kxQiIJ4gVcD3K6o14MJ72p5yRcE.jpg`,
    description:
      "Mario, Luigi, Princess Peach, and Toad blast into deep space across dazzling cosmic galaxies to stop Bowser Jr.'s intergalactic crusade to free his father.",
    cast: [
      { name: "Chris Pratt", role: "Mario (Voice)", image: `${TMDB_POSTER}/cRH6HPAQ98PlOwwEvhYO4CM9lwu.jpg` },
      { name: "Anya Taylor-Joy", role: "Princess Peach (Voice)", image: `${TMDB_POSTER}/qYNofOjlRke2MlJVihmJmEdQI4v.jpg` },
      { name: "Charlie Day", role: "Luigi (Voice)", image: `${TMDB_POSTER}/c0HNhjChGybnHa4eoLyqO4dDu1j.jpg` },
      { name: "Jack Black", role: "Bowser (Voice)", image: `${TMDB_POSTER}/rtCx0fiYxJVhzXXdwZE2XRTfIKE.jpg` },
    ],
    crew: [
      { name: "Aaron Horvath", role: "Director", image: `${TMDB_POSTER}/6AOmWzdJas3xh0xJOk1mHPstNs2.jpg` },
      { name: "Shigeru Miyamoto", role: "Producer", image: `${TMDB_POSTER}/kQ5pDmiPCf0muBmvHOrBXa2icYu.jpg` },
    ],
  },
  {
    title: "Disclosure Day",
    genre: "Sci-Fi, Thriller, Drama",
    duration: "2h 26m",
    rating: "8.3",
    votes: "218.9K",
    certification: "UA13+",
    type: "Stream",
    format: "4K UHD, Dolby Atmos",
    languages: ["English", "Hindi"],
    tagline: "We deserve to know.",
    releaseDate: new Date("2026-06-10"),
    posterImage: `${TMDB_POSTER}/AnJ8IQJI23hNpYXVNaythu061Ru.jpg`,
    backdropImage: `${TMDB_BACKDROP}/1e0KDRYKRPHiVNj8yQKYuU2jVyQ.jpg`,
    description:
      "Steven Spielberg's gripping sci-fi thriller follows a cybersecurity whistleblower and a meteorologist racing a powerful syndicate to broadcast undeniable proof of extraterrestrial intelligence.",
    cast: [
      { name: "Emily Blunt", role: "Margaret Fairchild", image: `${TMDB_POSTER}/5nCSG5TL1bP1geD8aaBfaLnLLCD.jpg` },
      { name: "Josh O'Connor", role: "Dr. Daniel Kellner", image: `${TMDB_POSTER}/pVv0zCvpNyuWoJcABq8RrM90FsK.jpg` },
      { name: "Colin Firth", role: "Noah Scanlon", image: `${TMDB_POSTER}/z6wxnkqSTnzO1tcBui0ss7ehdm9.jpg` },
      { name: "Colman Domingo", role: "Hugo Wakefield", image: `${TMDB_POSTER}/t0cgfvtA7Thxnrtj5baRi656zlc.jpg` },
    ],
    crew: [
      { name: "Steven Spielberg", role: "Director & Producer", image: `${TMDB_POSTER}/tZxcg19YQ3e8fJ0pOs7hjlnmmr6.jpg` },
      { name: "David Koepp", role: "Screenplay", image: `${TMDB_POSTER}/is3t4k8OMX0KNCD3EilDWOucYZG.jpg` },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ─── LIVE EVENTS (Late Nov–Dec 2026 Concerts, Comedy & Festivals) ───
  // ═══════════════════════════════════════════════════════════════════
  {
    title: "Coldplay: Music of the Spheres World Tour",
    genre: "Music Shows, Concert, Live Music",
    duration: "3h 30m",
    rating: "9.7",
    votes: "540.8K",
    certification: "U",
    type: "Event",
    format: "Live Stadium Concert",
    languages: ["English"],
    releaseDate: new Date("2026-12-05"),
    posterImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80",
    description:
      "Experience Coldplay live under the stars with synchronized LED Xylobands, fireworks, confetti storms, and stadium-shaking anthems including Yellow, Fix You, Viva La Vida, and A Sky Full of Stars.",
    cast: [
      { name: "Chris Martin", role: "Lead Vocals & Piano" },
      { name: "Jonny Buckland", role: "Lead Guitar" },
      { name: "Guy Berryman", role: "Bass Guitar" },
      { name: "Will Champion", role: "Drums & Backing Vocals" },
    ],
    crew: [
      { name: "MovieBook Live", role: "Event Producer" },
      { name: "Phil Harvey", role: "Creative Director" },
    ],
  },
  {
    title: "Diljit Dosanjh: Dil-Luminati Finale Tour",
    genre: "Music Shows, Concert, Festivals",
    duration: "3h 00m",
    rating: "9.6",
    votes: "412.4K",
    certification: "U",
    type: "Event",
    format: "Live Arena Concert",
    languages: ["Hindi", "English"],
    releaseDate: new Date("2026-11-29"),
    posterImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80",
    description:
      "Global icon Diljit Dosanjh brings the grand winter leg of the Dil-Luminati Arena Tour with chartbusters Born to Shine, Lover, G.O.A.T., Naina, and Hass Hass.",
    cast: [{ name: "Diljit Dosanjh", role: "Headliner" }],
    crew: [
      { name: "Saregama Live", role: "Tour Producer" },
      { name: "Ripple Effect Studios", role: "Stage Design" },
    ],
  },
  {
    title: "Zakir Khan Live – Papa Yaar India Tour",
    genre: "Comedy Shows, Stand-up Comedy, Laughter",
    duration: "2h 00m",
    rating: "9.4",
    votes: "184.2K",
    certification: "UA",
    type: "Event",
    format: "Live Stand-up Special",
    languages: ["Hindi"],
    releaseDate: new Date("2026-11-28"),
    posterImage: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1600&q=80",
    description:
      "Zakir Khan returns with his brand-new winter storytelling and stand-up comedy tour Papa Yaar—filled with nostalgia, Indian father-son anecdotes, and signature poetry.",
    cast: [{ name: "Zakir Khan", role: "Stand-up Comedian" }],
    crew: [{ name: "OML Entertainment", role: "Producer" }],
  },
  {
    title: "Arijit Singh Live Symphony Tour",
    genre: "Music Shows, Concert, Live Music",
    duration: "3h 00m",
    rating: "9.5",
    votes: "320.6K",
    certification: "U",
    type: "Event",
    format: "Live Symphony Concert",
    languages: ["Hindi"],
    releaseDate: new Date("2026-12-12"),
    posterImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80",
    description:
      "Witness the voice of a generation perform timeless Bollywood ballads and chart-topping anthems backed by a 60-piece international grand symphony orchestra.",
    cast: [{ name: "Arijit Singh", role: "Lead Vocalist" }],
    crew: [{ name: "MovieBook Live", role: "Event Organiser" }],
  },
  {
    title: "Samay Raina – Unfiltered India Tour",
    genre: "Comedy Shows, Stand-up Comedy, Laughter",
    duration: "1h 45m",
    rating: "9.3",
    votes: "165.4K",
    certification: "A",
    type: "Event",
    format: "Live Stand-up Tour",
    languages: ["Hindi", "English"],
    releaseDate: new Date("2026-12-06"),
    posterImage: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1600&q=80",
    description:
      "Razor-sharp crowd work, chess stories, and unfiltered observational stand-up comedy in Samay Raina's sold-out winter arena tour.",
    cast: [{ name: "Samay Raina", role: "Stand-up Comedian" }],
    crew: [{ name: "Laugh Club India", role: "Producer" }],
  },
  {
    title: "Sunburn Festival 2026 ft. Martin Garrix",
    genre: "Music Shows, Festivals, DJ Nights",
    duration: "5h 00m",
    rating: "9.1",
    votes: "198.5K",
    certification: "UA",
    type: "Event",
    format: "EDM Year-End Festival",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-12-28"),
    posterImage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1600&q=80",
    description:
      "Asia's premier year-end electronic dance music festival returns this December with Martin Garrix, massive pyrotechnics, laser shows, and immersive stages.",
    cast: [
      { name: "Martin Garrix", role: "Headliner DJ" },
      { name: "Nucleya", role: "Special Act" },
    ],
    crew: [{ name: "Percept Live", role: "Festival Producer" }],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ─── PLAYS (Winter 2026 Theatre & Broadway Musicals) ───
  // ═══════════════════════════════════════════════════════════════════
  {
    title: "Mughal-e-Azam: The Musical",
    genre: "Musical, Drama, Theater",
    duration: "2h 30m",
    rating: "9.4",
    votes: "68.2K",
    certification: "U",
    type: "Play",
    format: "Grand Broadway Musical",
    languages: ["Hindi"],
    releaseDate: new Date("2026-11-29"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/f/f9/Mughal-e-Azam.jpg",
    backdropImage: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1600&q=80",
    description:
      "Feroz Abbas Khan's critically acclaimed Broadway-style musical featuring Manish Malhotra couture, Kathak choreography, and live classical singing of Pyar Kiya To Darna Kya.",
    cast: [
      { name: "Neha Sargam", role: "Anarkali" },
      { name: "Nissar Khan", role: "Emperor Akbar" },
      { name: "Dhanveer Singh", role: "Prince Salim" },
    ],
    crew: [
      { name: "Feroz Abbas Khan", role: "Director" },
      { name: "Manish Malhotra", role: "Costume Designer" },
      { name: "Shapoorji Pallonji", role: "Producer" },
    ],
  },
  {
    title: "Hamilton – International Stage Tour",
    genre: "Musical, Drama, Historical, Theater",
    duration: "2h 45m",
    rating: "9.5",
    votes: "88.4K",
    certification: "UA",
    type: "Play",
    format: "Live Stage Musical",
    languages: ["English"],
    releaseDate: new Date("2026-12-04"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/8/83/Hamilton-poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1600&q=80",
    description:
      "The Tony, Grammy, Olivier, and Pulitzer Prize-winning musical blending hip-hop, jazz, R&B, and Broadway to chronicle Founding Father Alexander Hamilton.",
    cast: [
      { name: "Lin-Manuel Miranda", role: "Creator & Original Cast" },
      { name: "International Touring Company", role: "Principal Cast" },
    ],
    crew: [
      { name: "Thomas Kail", role: "Director" },
      { name: "Lin-Manuel Miranda", role: "Composer & Lyricist" },
    ],
  },
  {
    title: "12 Angry Men – Courtroom Stage Drama",
    genre: "Drama, Thriller, Theater",
    duration: "1h 50m",
    rating: "9.1",
    votes: "41.6K",
    certification: "UA",
    type: "Play",
    format: "Courtroom Stage Drama",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-12-11"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/9/91/12_angry_men.jpg",
    backdropImage: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1600&q=80",
    description:
      "Twelve jurors locked in a tense deliberation room must decide the fate of a teenager accused of murder, as Juror #8 plants a seed of reasonable doubt.",
    cast: [
      { name: "Rajit Kapur", role: "Juror 8" },
      { name: "Atul Kumar", role: "Juror 3" },
      { name: "Deven Khote", role: "Juror 4" },
    ],
    crew: [{ name: "NCPA Theatre", role: "Production House" }],
  },
  {
    title: "The Lion King: Live Stage Musical",
    genre: "Musical, Adventure, Theater",
    duration: "2h 30m",
    rating: "9.3",
    votes: "76.9K",
    certification: "U",
    type: "Play",
    format: "Family Stage Musical",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-12-19"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/3/3d/The_Lion_King_poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=1600&q=80",
    description:
      "Julie Taymor's breathtaking stage musical brings the Serengeti to life with life-size puppetry, masks, and Elton John & Hans Zimmer's iconic score.",
    cast: [
      { name: "Dashaun Young", role: "Simba" },
      { name: "Tshidi Manye", role: "Rafiki" },
    ],
    crew: [
      { name: "Julie Taymor", role: "Director" },
      { name: "Elton John & Tim Rice", role: "Music & Lyrics" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ─── SPORTS (Late Nov–Dec 2026 Cricket, Football, F1 & Kabaddi) ───
  // ═══════════════════════════════════════════════════════════════════
  {
    title: "IND vs SA – T20 International Decider",
    genre: "Cricket, Live Matches, Tournaments",
    duration: "3h 30m",
    rating: "9.6",
    votes: "425.0K",
    certification: "U",
    type: "Sport",
    format: "International T20",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-12-02"),
    posterImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1600&q=80",
    description:
      "World Champions Team India take on South Africa under floodlights in a high-voltage winter T20I clash. Book stadium stands and hospitality lounges now.",
    cast: [
      { name: "Suryakumar Yadav", role: "India T20I Captain" },
      { name: "Hardik Pandya", role: "All-Rounder" },
      { name: "Jasprit Bumrah", role: "Pace Spearhead" },
      { name: "Aiden Markram", role: "South Africa Captain" },
    ],
    crew: [{ name: "BCCI", role: "Host Board" }],
  },
  {
    title: "IND vs AUS – Test Series Fan Screening & Hospitality",
    genre: "Cricket, Live Matches",
    duration: "4h 00m",
    rating: "9.5",
    votes: "392.4K",
    certification: "U",
    type: "Sport",
    format: "Stadium & Fan Park",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-12-14"),
    posterImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1600&q=80",
    description:
      "Experience cricket's fiercest rivalry as India battles Australia in the winter Test showdown with giant LED screens, commentary zones, and fan hospitality.",
    cast: [
      { name: "Jasprit Bumrah", role: "India Vice-Captain" },
      { name: "Yashasvi Jaiswal", role: "Opening Batsman" },
      { name: "Pat Cummins", role: "Australia Captain" },
    ],
    crew: [{ name: "BCCI", role: "Series Organiser" }],
  },
  {
    title: "ISL 2026–27: Mohun Bagan SG vs Mumbai City FC",
    genre: "Football, Tournaments, Live Matches",
    duration: "2h 15m",
    rating: "9.0",
    votes: "124.8K",
    certification: "U",
    type: "Sport",
    format: "Indian Super League",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-12-08"),
    posterImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80",
    description:
      "Indian football's marquee clash returns this December as defending shield winners Mohun Bagan SG battle Mumbai City FC under floodlights.",
    cast: [
      { name: "Lallianzuala Chhangte", role: "Mumbai City FC" },
      { name: "Dimitri Petratos", role: "Mohun Bagan SG" },
    ],
    crew: [{ name: "AIFF & FSDL", role: "League Organiser" }],
  },
  {
    title: "Formula 1 Abu Dhabi Championship Finale Fan Park",
    genre: "Racing, Fan Zones, Adventure",
    duration: "2h 30m",
    rating: "9.2",
    votes: "89.5K",
    certification: "U",
    type: "Sport",
    format: "Giant Screen & Simulators",
    languages: ["English"],
    releaseDate: new Date("2026-12-06"),
    posterImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80",
    description:
      "Lights out for the 2026 Formula 1 season finale! Watch the twilight race on a 50-foot LED wall with pro F1 racing simulators, pit-stop challenges, and live DJ sets.",
    cast: [
      { name: "Max Verstappen", role: "Red Bull Racing" },
      { name: "Lewis Hamilton", role: "Scuderia Ferrari" },
      { name: "Lando Norris", role: "McLaren F1" },
    ],
    crew: [{ name: "F1 Fan Zone India", role: "Organiser" }],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ─── ACTIVITIES (Theme Parks, Comedy Clubs, Workshops & Karting) ───
  // ═══════════════════════════════════════════════════════════════════
  {
    title: "Worlds of Wonder (WOW) Winter Carnival & Amusement Park",
    genre: "Amusement Parks, Adventure",
    duration: "7h 00m",
    rating: "8.9",
    votes: "72.4K",
    certification: "U",
    type: "Activity",
    format: "All-Day Unlimited Pass",
    languages: ["Hindi", "English"],
    releaseDate: new Date("2026-11-28"),
    posterImage: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1600&q=80",
    description:
      "Experience 20+ world-class TUV-certified thrill rides, winter carnival parades, food pop-ups, and go-karting right in Sector 38A, Noida.",
    cast: [
      { name: "Mega Disco & Feedback", role: "Thrill Rides" },
      { name: "Winter Carnival Parade", role: "Live Attraction" },
    ],
    crew: [{ name: "Entertainment City Noida", role: "Venue Partner" }],
  },
  {
    title: "The Habitat Late Night Stand-up & Improv Jam",
    genre: "Comedy, Improv, Comedy Shows",
    duration: "1h 45m",
    rating: "9.0",
    votes: "48.6K",
    certification: "UA",
    type: "Activity",
    format: "Intimate Comedy Club",
    languages: ["Hindi", "English"],
    releaseDate: new Date("2026-11-27"),
    posterImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80",
    description:
      "A curated weekend lineup of 5 top Indian stand-up comedians testing their sharpest new material alongside spontaneous crowd-work and improv games.",
    cast: [{ name: "Surprise Lineup", role: "Top Indian Comics" }],
    crew: [{ name: "Comedy Canvas", role: "Curator" }],
  },
  {
    title: "Clay & Sip: Winter Wheel Pottery & Art Jamming",
    genre: "Art & Craft, Workshop",
    duration: "2h 00m",
    rating: "9.1",
    votes: "35.2K",
    certification: "U",
    type: "Activity",
    format: "Guided Studio Session",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-11-29"),
    posterImage: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80",
    description:
      "Unwind over artisanal hot chocolate and coffee while learning potter's wheel and glazing techniques from master ceramic artists. Take home your handcrafted ceramic piece!",
    cast: [{ name: "Studio Terracotta", role: "Master Potters" }],
    crew: [{ name: "Artisan Collective", role: "Host" }],
  },
  {
    title: "Formula Karting – Pro Floodlit Go-Karting",
    genre: "Go-Karting, Adventure, Racing",
    duration: "1h 00m",
    rating: "9.2",
    votes: "53.9K",
    certification: "UA",
    type: "Activity",
    format: "Timed Lap Session",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-11-28"),
    posterImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1600&q=80",
    description:
      "Race Sodi RT8 270cc pro karts on India's fastest floodlit multi-turn circuit with live telemetry lap timing, FIA-grade barriers, and podium trophies.",
    cast: [{ name: "Sodi RT8 270cc Karts", role: "Pro Fleet" }],
    crew: [{ name: "Snow World & Formula Karting", role: "Track Operator" }],
  },
];

const SHOWTIME_SLOTS = [
  { startAt: "10:15 AM", format: "2D", price: 190, theatre: "PVR: Logix City Centre Mall, Noida", screen: "AUDI 01" },
  { startAt: "01:30 PM", format: "4K Dolby Atmos", price: 260, theatre: "PVR: Logix City Centre Mall, Noida", screen: "AUDI 03" },
  { startAt: "04:45 PM", format: "IMAX 2D", price: 420, theatre: "INOX: Gardens Galleria, Noida", screen: "IMAX AUDI" },
  { startAt: "07:15 PM", format: "2D", price: 290, theatre: "INOX: Gardens Galleria, Noida", screen: "AUDI 02" },
  { startAt: "09:30 PM", format: "4DX", price: 480, theatre: "Cinepolis: DLF Mall of India, Noida", screen: "4DX AUDI" },
  { startAt: "10:45 PM", format: "2D", price: 220, theatre: "Wave Cinemas: Sector 18, Noida", screen: "AUDI 04" },
];

const seedDB = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.DB_URI || process.env.MONGO_URI);
      console.log("Connected to DB");
    }

    await Movie.deleteMany({});
    await ShowTime.deleteMany({});
    await Review.deleteMany({});
    console.log("Cleared existing movies, showtimes, and reviews");

    // 1. Ensure Demo Users exist (with hashed passwords)
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash("password123", salt);

    const usersData = [
      { name: "Aditi Rao", email: "aditi@example.com", password: defaultPassword, phone: "9876543210" },
      { name: "Rahul Verma", email: "rahul@example.com", password: defaultPassword, phone: "9876543211" },
      { name: "Sneha Gupta", email: "sneha@example.com", password: defaultPassword, phone: "9876543212" },
      { name: "Vikram Singh", email: "vikram@example.com", password: defaultPassword, phone: "9876543213" },
      { name: "Priya Sharma", email: "priya@example.com", password: defaultPassword, phone: "9876543214" },
    ];

    const users = [];
    for (const u of usersData) {
      const doc = await User.findOneAndUpdate(
        { email: u.email },
        { $setOnInsert: u },
        { upsert: true, new: true }
      );
      users.push(doc);
    }
    console.log(`Ensured ${users.length} users`);

    // 2. Insert Latest Late-2026 Movies, Streams, Events, Plays, Sports, Activities
    const moviesWithIds = realData.map((item) => ({
      ...item,
      _id: new mongoose.Types.ObjectId(),
      showtimes: [],
    }));

    await Movie.insertMany(moviesWithIds);
    console.log(`Successfully seeded ${moviesWithIds.length} latest late-2026 titles across all categories`);

    // 3. Generate ShowTimes valid from 7 days ago through 60 days in the future
    const showTimeDocs = [];
    const startRange = new Date(Date.now() - 7 * 86400000);
    const endRange = new Date(Date.now() + 60 * 86400000);

    moviesWithIds.forEach((movie) => {
      SHOWTIME_SLOTS.forEach((slot) => {
        showTimeDocs.push({
          startAt: slot.startAt,
          format: slot.format,
          price: slot.price,
          theatre: slot.theatre,
          screen: slot.screen,
          startDate: startRange,
          endDate: endRange,
          movieId: movie._id,
        });
      });
    });

    await ShowTime.insertMany(showTimeDocs);
    console.log(`Successfully seeded ${showTimeDocs.length} showtimes`);

    // 4. Generate Realistic MovieBook Reviews (1–10 Rating Scale)
    const reviewDocs = [];
    const comments = [
      "#Blockbuster #SuperDirection — Goosebumps throughout! The interval block and climax are pure cinema magic. A must-watch in IMAX!",
      "#WowMusic #GreatActing — Phenomenal background score and stellar performances by the entire cast. Worth every penny.",
      "#Wellmade #Rocking — Visual spectacle on the big screen! Direction, cinematography, and sound design are top-notch.",
      "#AwesomeStory #Inspiring — Watched the evening show with family — thoroughly entertaining from start to finish!",
      "#Blockbuster #Wellmade — One of the finest theatrical experiences of 2026. Don't miss the Dolby Atmos mix!",
      "#SuperDirection #GreatActing — Brilliant writing and powerhouse acting. The second half takes it to another level altogether.",
    ];

    moviesWithIds.forEach((movie) => {
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, 4);
      shuffledUsers.forEach((user, idx) => {
        reviewDocs.push({
          movieId: String(movie._id),
          user: user._id,
          rating: [10, 9, 9, 8][idx % 4],
          comment: comments[(idx + movie.title.length) % comments.length],
        });
      });
    });

    await Review.insertMany(reviewDocs);
    console.log(`Successfully seeded ${reviewDocs.length} reviews`);

    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error("Seed error:", err);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = { realData, seedDB };
