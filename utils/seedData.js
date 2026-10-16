const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const Movie = require("../models/movieModel");
const ShowTime = require("../models/showTimeModel");
const Review = require("../models/reviewModel");
const User = require("../models/userModel");

dotenv.config();

const realData = [
  // ═══════════════════════════════════════════════════
  // ─── LATEST MOVIES (2025–2026 Cinema Releases) ───
  // ═══════════════════════════════════════════════════
  {
    title: "Street Fighter",
    genre: "Action, Adventure, Comedy, Thriller",
    duration: "2h 18m",
    rating: "9.2",
    votes: "98.4K",
    certification: "UA16+",
    type: "Movie",
    format: "2D, IMAX 2D, 4DX, MX4D, ICE, Dolby Cinema 2D, ScreenX",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    tagline: "The World Warrior Tournament Begins",
    releaseDate: new Date("2026-10-16"),
    posterImage: "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?auto=format&fit=crop&w=800&q=85",
    backdropImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80",
    description:
      "Set in 1993, estranged Street Fighters Ryu and Ken Masters are thrown back into combat when the mysterious Chun-Li recruits them for the next World Warrior Tournament—a brutal clash of fists, fate, and fury. Behind this high-stakes battle royale lies a deadly conspiracy led by M. Bison that forces them to face off against each other and confront the dark demons of their past.",
    cast: [
      { name: "Noah Centineo", role: "as Ken Masters" },
      { name: "Andrew Koji", role: "as Ryu" },
      { name: "Callina Liang", role: "as Chun-Li" },
      { name: "Jason Momoa", role: "as Blanka" },
      { name: "Vidyut Jammwal", role: "as Dhalsim" },
      { name: "David Dastmalchian", role: "as M. Bison" },
      { name: "Joe 'Roman Reigns' Anoa'i", role: "as Akuma" },
      { name: "Curtis '50 Cent' Jackson", role: "as Balrog" },
    ],
    crew: [
      { name: "Kitao Sakurai", role: "Director" },
      { name: "Dalan Musson", role: "Writer" },
      { name: "Mary Parent", role: "Producer" },
      { name: "Capcom & Legendary", role: "Producer" },
    ],
  },
  {
    title: "Pushpa 2: The Rule",
    genre: "Action, Crime, Thriller",
    duration: "3h 20m",
    rating: "9.1",
    votes: "412.5K",
    certification: "UA",
    type: "Movie",
    format: "2D, IMAX 2D, 4DX, Dolby Atmos",
    languages: ["Hindi", "Telugu", "Tamil", "Kannada", "Malayalam"],
    tagline: "The Rule Begins Across the Seas",
    releaseDate: new Date("2025-12-05"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/1/11/Pushpa_2-_The_Rule.jpg",
    backdropImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80",
    description:
      "Pushpa Raj expands his red sanders syndicate globally while clashing with his ruthless nemesis SP Bhanwar Singh Shekhawat in a high-voltage battle for supremacy and honour.",
    cast: [
      { name: "Allu Arjun", role: "Pushpa Raj" },
      { name: "Rashmika Mandanna", role: "Srivalli" },
      { name: "Fahadh Faasil", role: "SP Bhanwar Singh Shekhawat" },
      { name: "Rao Ramesh", role: "MP Bhumireddy Siddappa Naidu" },
      { name: "Sunil", role: "Mangalam Srinu" },
      { name: "Jagapathi Babu", role: "Central Minister Kogatam" },
    ],
    crew: [
      { name: "Sukumar", role: "Director & Writer" },
      { name: "Devi Sri Prasad", role: "Music Director" },
      { name: "Naveen Yerneni", role: "Producer" },
      { name: "Miroslaw Kuba Brozek", role: "Cinematographer" },
    ],
  },
  {
    title: "Chhaava",
    genre: "Action, Historical, Drama",
    duration: "2h 41m",
    rating: "9.3",
    votes: "285.4K",
    certification: "UA",
    type: "Movie",
    format: "2D, IMAX 2D, ICE",
    languages: ["Hindi", "Marathi", "Telugu"],
    tagline: "The Lion Cub of Swarajya",
    releaseDate: new Date("2026-02-14"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/7/75/Chhaava_film_poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
    description:
      "An epic historical saga chronicling the fearless reign, military genius, and ultimate sacrifice of Chhatrapati Sambhaji Maharaj as he defends Hindavi Swarajya against the mighty Mughal empire.",
    cast: [
      { name: "Vicky Kaushal", role: "Chhatrapati Sambhaji Maharaj" },
      { name: "Rashmika Mandanna", role: "Maharani Yesubai" },
      { name: "Akshaye Khanna", role: "Aurangzeb" },
      { name: "Ashutosh Rana", role: "Sarsenapati Hambirrao Mohite" },
      { name: "Divya Dutta", role: "Rajmata Soyarabai" },
    ],
    crew: [
      { name: "Laxman Utekar", role: "Director" },
      { name: "A. R. Rahman", role: "Music Director" },
      { name: "Dinesh Vijan", role: "Producer (Maddock Films)" },
      { name: "Saurabh Goswami", role: "Cinematographer" },
    ],
  },
  {
    title: "Kantara: Chapter 1",
    genre: "Action, Thriller, Drama",
    duration: "2h 49m",
    rating: "9.4",
    votes: "389.1K",
    certification: "UA",
    type: "Movie",
    format: "2D, IMAX 2D, Dolby Atmos, 4DX",
    languages: ["Kannada", "Hindi", "Telugu", "Tamil", "Malayalam"],
    tagline: "A Legend Was Born Before the Roar",
    releaseDate: new Date("2026-10-02"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/8/84/Kantara_poster.jpeg",
    backdropImage: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80",
    description:
      "Set during the reign of the Kadamba dynasty in coastal Karnataka, explore the sacred origins of Panjurli Daiva, Guliga, and the ancestral covenant between humanity and nature.",
    cast: [
      { name: "Rishab Shetty", role: "Berme / Kaadubettu Shiva" },
      { name: "Rukmini Vasanth", role: "Princess Kanakavathi" },
      { name: "Jayaram", role: "King Rajashekhara" },
      { name: "Gulshan Devaiah", role: "Kulashekhara" },
      { name: "Pramod Shetty", role: "Sudhakara" },
    ],
    crew: [
      { name: "Rishab Shetty", role: "Director & Writer" },
      { name: "B. Ajaneesh Loknath", role: "Music Director" },
      { name: "Vijay Kiragandur", role: "Producer (Hombale Films)" },
      { name: "Arvind S. Kashyap", role: "Cinematographer" },
    ],
  },
  {
    title: "War 2",
    genre: "Action, Adventure, Thriller",
    duration: "2h 48m",
    rating: "8.8",
    votes: "310.8K",
    certification: "UA",
    type: "Movie",
    format: "2D, IMAX 2D, 4DX, ICE",
    languages: ["Hindi", "Telugu", "Tamil"],
    tagline: "Two Titans. One Global War.",
    releaseDate: new Date("2026-08-14"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/6/6f/War_official_poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
    description:
      "Major Kabir Dhaliwal faces his most lethal adversary yet when an elite operative from across the shadows forces him into a globe-trotting espionage showdown across six countries.",
    cast: [
      { name: "Hrithik Roshan", role: "Major Kabir Dhaliwal" },
      { name: "Jr. NTR", role: "Agent Vikramaditya" },
      { name: "Kiara Advani", role: "Captain Kavya Luthra" },
      { name: "Anil Kapoor", role: "RAW Chief Vikrant Kaul" },
      { name: "Ashutosh Rana", role: "Colonel Sunil Luthra" },
    ],
    crew: [
      { name: "Ayan Mukerji", role: "Director" },
      { name: "Pritam", role: "Music Director" },
      { name: "Aditya Chopra", role: "Producer (YRF)" },
      { name: "Benjamin Jasper", role: "Cinematographer" },
    ],
  },
  {
    title: "Stree 2: Sarkate Ka Aatank",
    genre: "Comedy, Horror",
    duration: "2h 29m",
    rating: "8.9",
    votes: "490.2K",
    certification: "UA",
    type: "Movie",
    format: "2D, 4DX",
    languages: ["Hindi"],
    tagline: "O Stree Raksha Karna!",
    releaseDate: new Date("2025-08-15"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/a/a1/Stree_2.jpg",
    backdropImage: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=1600&q=80",
    description:
      "The town of Chanderi lives in fear again as a headless terror named Sarkata abducts progressive women, forcing Vicky, Bittu, Jana, and Rudra to reunite with the mysterious woman to save their town.",
    cast: [
      { name: "Rajkummar Rao", role: "Vicky" },
      { name: "Shraddha Kapoor", role: "She" },
      { name: "Pankaj Tripathi", role: "Rudra Bhaiya" },
      { name: "Abhishek Banerjee", role: "Jana" },
      { name: "Aparshakti Khurana", role: "Bittu" },
    ],
    crew: [
      { name: "Amar Kaushik", role: "Director" },
      { name: "Sachin-Jigar", role: "Music Director" },
      { name: "Dinesh Vijan", role: "Producer" },
      { name: "Niren Bhatt", role: "Writer" },
    ],
  },
  {
    title: "Kalki 2898 AD",
    genre: "Sci-Fi, Action, Thriller",
    duration: "3h 01m",
    rating: "8.7",
    votes: "462.0K",
    certification: "UA",
    type: "Movie",
    format: "3D, IMAX 3D, 4DX 3D, 2D",
    languages: ["Telugu", "Hindi", "Tamil", "English", "Kannada"],
    tagline: "The Future Unfolds in Kashi",
    releaseDate: new Date("2025-06-27"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg",
    backdropImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
    description:
      "In a post-apocalyptic 2898 AD inside the last city of Kashi, immortal warrior Ashwatthama vows to protect SUM-80 and her unborn child from bounty hunter Bhairava and Supreme Yaskin's totalitarian Complex.",
    cast: [
      { name: "Prabhas", role: "Bhairava / Karna" },
      { name: "Amitabh Bachchan", role: "Ashwatthama" },
      { name: "Deepika Padukone", role: "SUM-80 (Sumathi)" },
      { name: "Kamal Haasan", role: "Supreme Yaskin" },
      { name: "Disha Patani", role: "Roxie" },
    ],
    crew: [
      { name: "Nag Ashwin", role: "Director & Writer" },
      { name: "Santhosh Narayanan", role: "Music Director" },
      { name: "C. Aswani Dutt", role: "Producer (Vyjayanthi Movies)" },
      { name: "Djordje Stojiljkovic", role: "Cinematographer" },
    ],
  },
  {
    title: "Dune: Part Two",
    genre: "Sci-Fi, Adventure, Drama",
    duration: "2h 46m",
    rating: "9.2",
    votes: "342.1K",
    certification: "UA",
    type: "Movie",
    format: "IMAX 2D, 4DX, Dolby Atmos, 2D",
    languages: ["English", "Hindi"],
    tagline: "Long Live the Fighters",
    releaseDate: new Date("2025-03-01"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg",
    backdropImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=80",
    description:
      "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family, facing a choice between the love of his life and the fate of the universe.",
    cast: [
      { name: "Timothée Chalamet", role: "Paul Atreides" },
      { name: "Zendaya", role: "Chani" },
      { name: "Rebecca Ferguson", role: "Lady Jessica" },
      { name: "Javier Bardem", role: "Stilgar" },
      { name: "Austin Butler", role: "Feyd-Rautha" },
    ],
    crew: [
      { name: "Denis Villeneuve", role: "Director" },
      { name: "Hans Zimmer", role: "Music Director" },
      { name: "Mary Parent", role: "Producer" },
      { name: "Greig Fraser", role: "Cinematographer" },
    ],
  },
  {
    title: "Deadpool & Wolverine",
    genre: "Action, Comedy, Sci-Fi",
    duration: "2h 08m",
    rating: "8.8",
    votes: "378.5K",
    certification: "A",
    type: "Movie",
    format: "3D, IMAX 3D, 4DX 3D, 2D",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    tagline: "Come Together",
    releaseDate: new Date("2025-07-26"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=1600&q=80",
    description:
      "The Time Variance Authority pulls Wade Wilson from his quiet life and sets him on a multiverse-shattering mission alongside a reluctant Wolverine that will change the history of the MCU.",
    cast: [
      { name: "Ryan Reynolds", role: "Wade Wilson / Deadpool" },
      { name: "Hugh Jackman", role: "Logan / Wolverine" },
      { name: "Emma Corrin", role: "Cassandra Nova" },
      { name: "Matthew Macfadyen", role: "Mr. Paradox" },
      { name: "Dafne Keen", role: "Laura / X-23" },
    ],
    crew: [
      { name: "Shawn Levy", role: "Director" },
      { name: "Rob Simonsen", role: "Music Director" },
      { name: "Kevin Feige", role: "Producer" },
      { name: "George Richmond", role: "Cinematographer" },
    ],
  },
  {
    title: "Mission: Impossible – Final Reckoning",
    genre: "Action, Adventure, Thriller",
    duration: "2h 55m",
    rating: "9.0",
    votes: "240.6K",
    certification: "UA",
    type: "Movie",
    format: "IMAX 2D, 4DX, 2D, Dolby Atmos",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    tagline: "Our Lives Are the Sum of Our Choices",
    releaseDate: new Date("2026-05-23"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/f/f0/Mission_Impossible_Dead_Reckoning_Part_One_poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80",
    description:
      "Ethan Hunt and his IMF team embark on their most perilous mission yet to locate the sunken Sevastopol submarine and destroy the rogue AI Entity before it triggers global catastrophe.",
    cast: [
      { name: "Tom Cruise", role: "Ethan Hunt" },
      { name: "Hayley Atwell", role: "Grace" },
      { name: "Ving Rhames", role: "Luther Stickell" },
      { name: "Simon Pegg", role: "Benji Dunn" },
      { name: "Vanessa Kirby", role: "Alanna Mitsopolis" },
    ],
    crew: [
      { name: "Christopher McQuarrie", role: "Director" },
      { name: "Lorne Balfe", role: "Music Director" },
      { name: "Tom Cruise", role: "Producer" },
      { name: "Fraser Taggart", role: "Cinematographer" },
    ],
  },
  {
    title: "Bhool Bhulaiyaa 3",
    genre: "Comedy, Horror",
    duration: "2h 38m",
    rating: "8.3",
    votes: "265.7K",
    certification: "UA",
    type: "Movie",
    format: "2D, 4DX",
    languages: ["Hindi"],
    tagline: "The Royal Palace Opens Its Doors Again",
    releaseDate: new Date("2025-11-01"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/6/6f/Bhool_Bhulaiyaa_3_poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=1600&q=80",
    description:
      "Rooh Baba enters a haunted ancestral palace in Rakhtghat where two vengeful spirits claiming to be Manjulika turn a royal family reunion into a hilarious and spine-chilling mystery.",
    cast: [
      { name: "Kartik Aaryan", role: "Rooh Baba / Debendranath" },
      { name: "Vidya Balan", role: "Mallika / Manjulika" },
      { name: "Madhuri Dixit", role: "Mandira / Anjulika" },
      { name: "Triptii Dimri", role: "Princess Meera" },
      { name: "Rajpal Yadav", role: "Chhote Pandit" },
    ],
    crew: [
      { name: "Anees Bazmee", role: "Director" },
      { name: "Pritam", role: "Music Director" },
      { name: "Bhushan Kumar", role: "Producer (T-Series)" },
      { name: "Manu Anand", role: "Cinematographer" },
    ],
  },
  {
    title: "Singham Again",
    genre: "Action, Drama",
    duration: "2h 24m",
    rating: "8.2",
    votes: "218.4K",
    certification: "UA",
    type: "Movie",
    format: "2D, IMAX 2D, 4DX",
    languages: ["Hindi"],
    tagline: "Justice Roars Louder Than Ever",
    releaseDate: new Date("2025-11-01"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/3/3e/Singham_Again_poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80",
    description:
      "DCP Bajirao Singham assembles the entire Cop Universe force including Simmba, Sooryavanshi, Shakti Shetty, and Satya on a high-stakes rescue mission inspired by the Ramayana.",
    cast: [
      { name: "Ajay Devgn", role: "DCP Bajirao Singham" },
      { name: "Kareena Kapoor Khan", role: "Avni Kamat Singham" },
      { name: "Ranveer Singh", role: "ACP Sangram Bhalerao (Simmba)" },
      { name: "Akshay Kumar", role: "DCP Veer Sooryavanshi" },
      { name: "Deepika Padukone", role: "DCP Shakti Shetty" },
      { name: "Arjun Kapoor", role: "Danger Lanka" },
    ],
    crew: [
      { name: "Rohit Shetty", role: "Director" },
      { name: "Ravi Basrur", role: "Music Director" },
      { name: "Ajay Devgn", role: "Producer" },
      { name: "Girish Kant", role: "Cinematographer" },
    ],
  },
  {
    title: "Oppenheimer",
    genre: "Biography, Drama, History",
    duration: "3h 00m",
    rating: "9.3",
    votes: "415.0K",
    certification: "UA",
    type: "Movie",
    format: "IMAX 2D, 70mm, 2D",
    languages: ["English", "Hindi"],
    tagline: "The World Forever Changes",
    releaseDate: new Date("2025-07-21"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg",
    backdropImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    description:
      "The story of American theoretical physicist J. Robert Oppenheimer and his pivotal role in heading the Manhattan Project to develop the first nuclear weapons during World War II.",
    cast: [
      { name: "Cillian Murphy", role: "J. Robert Oppenheimer" },
      { name: "Emily Blunt", role: "Kitty Oppenheimer" },
      { name: "Robert Downey Jr.", role: "Lewis Strauss" },
      { name: "Matt Damon", role: "Gen. Leslie Groves" },
      { name: "Florence Pugh", role: "Jean Tatlock" },
    ],
    crew: [
      { name: "Christopher Nolan", role: "Director & Writer" },
      { name: "Ludwig Göransson", role: "Music Director" },
      { name: "Emma Thomas", role: "Producer" },
      { name: "Hoyte van Hoytema", role: "Cinematographer" },
    ],
  },

  // ═══════════════════════════════════════════════════
  // ─── STREAMS (BookMyShow Stream Premieres) ───
  // ═══════════════════════════════════════════════════
  {
    title: "Spider-Man: Across the Spider-Verse",
    genre: "Animation, Action, Sci-Fi",
    duration: "2h 20m",
    rating: "9.3",
    votes: "275.8K",
    certification: "U",
    type: "Stream",
    format: "4K UHD, Dolby Vision",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    releaseDate: new Date("2025-06-02"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/b/b4/Spider-Man-_Across_the_Spider-Verse_poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=1600&q=80",
    description:
      "Miles Morales catapults across the Multiverse, where he encounters the Spider-Society, a team of Spider-People charged with protecting its very existence.",
    cast: [
      { name: "Shameik Moore", role: "Miles Morales" },
      { name: "Hailee Steinfeld", role: "Gwen Stacy" },
      { name: "Oscar Isaac", role: "Miguel O'Hara" },
      { name: "Karan Soni", role: "Pavitr Prabhakar" },
    ],
    crew: [
      { name: "Joaquim Dos Santos", role: "Director" },
      { name: "Daniel Pemberton", role: "Music Director" },
      { name: "Phil Lord", role: "Producer" },
    ],
  },
  {
    title: "Avatar: The Way of Water",
    genre: "Sci-Fi, Adventure, Action",
    duration: "3h 12m",
    rating: "8.9",
    votes: "312.4K",
    certification: "UA",
    type: "Stream",
    format: "4K UHD, IMAX Enhanced",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    releaseDate: new Date("2025-04-16"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/5/54/Avatar_The_Way_of_Water_poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=80",
    description:
      "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. When a familiar threat returns, Jake must work with Neytiri and the Metkayina clan to protect their home.",
    cast: [
      { name: "Sam Worthington", role: "Jake Sully" },
      { name: "Zoe Saldaña", role: "Neytiri" },
      { name: "Sigourney Weaver", role: "Kiri" },
      { name: "Stephen Lang", role: "Colonel Miles Quaritch" },
    ],
    crew: [
      { name: "James Cameron", role: "Director" },
      { name: "Simon Franglen", role: "Music Director" },
      { name: "Jon Landau", role: "Producer" },
    ],
  },
  {
    title: "John Wick: Chapter 4",
    genre: "Action, Thriller, Crime",
    duration: "2h 49m",
    rating: "9.0",
    votes: "228.5K",
    certification: "A",
    type: "Stream",
    format: "4K UHD, Dolby Atmos",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2025-03-24"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/3/33/John_Wick_Chapter_4_poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=1600&q=80",
    description:
      "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.",
    cast: [
      { name: "Keanu Reeves", role: "John Wick" },
      { name: "Donnie Yen", role: "Caine" },
      { name: "Bill Skarsgård", role: "Marquis Vincent Bisset de Gramont" },
      { name: "Ian McShane", role: "Winston" },
    ],
    crew: [
      { name: "Chad Stahelski", role: "Director" },
      { name: "Tyler Bates", role: "Music Director" },
      { name: "Basil Iwanyk", role: "Producer" },
    ],
  },
  {
    title: "Black Panther: Wakanda Forever",
    genre: "Action, Adventure, Sci-Fi",
    duration: "2h 41m",
    rating: "8.4",
    votes: "184.2K",
    certification: "UA",
    type: "Stream",
    format: "4K UHD, Dolby Vision",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    releaseDate: new Date("2025-02-11"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/3/3b/Black_Panther_Wakanda_Forever_poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80",
    description:
      "The people of Wakanda fight to protect their home from intervening world powers as they mourn the death of King T'Challa and face the underwater nation of Talokan.",
    cast: [
      { name: "Letitia Wright", role: "Shuri / Black Panther" },
      { name: "Tenoch Huerta", role: "Namor" },
      { name: "Angela Bassett", role: "Queen Ramonda" },
      { name: "Danai Gurira", role: "Okoye" },
    ],
    crew: [
      { name: "Ryan Coogler", role: "Director" },
      { name: "Ludwig Göransson", role: "Music Director" },
      { name: "Kevin Feige", role: "Producer" },
    ],
  },
  {
    title: "The Super Mario Bros. Movie",
    genre: "Animation, Adventure, Comedy",
    duration: "1h 32m",
    rating: "8.6",
    votes: "152.9K",
    certification: "U",
    type: "Stream",
    format: "4K UHD",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2025-05-10"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/4/44/The_Super_Mario_Bros._Movie_poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80",
    description:
      "Brooklyn plumbers Mario and Luigi are transported down a mysterious pipe into a magical new world. When the brothers are separated, Mario embarks on an epic quest to find Luigi.",
    cast: [
      { name: "Chris Pratt", role: "Mario (Voice)" },
      { name: "Anya Taylor-Joy", role: "Princess Peach (Voice)" },
      { name: "Charlie Day", role: "Luigi (Voice)" },
      { name: "Jack Black", role: "Bowser (Voice)" },
    ],
    crew: [
      { name: "Aaron Horvath", role: "Director" },
      { name: "Brian Tyler", role: "Music Director" },
      { name: "Chris Meledandri", role: "Producer" },
    ],
  },
  {
    title: "Barbie",
    genre: "Comedy, Adventure, Fantasy",
    duration: "1h 54m",
    rating: "8.3",
    votes: "198.0K",
    certification: "UA",
    type: "Stream",
    format: "4K UHD",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2025-07-21"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/0/0b/Barbie_2023_poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1600&q=80",
    description:
      "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they discover its joys and perils.",
    cast: [
      { name: "Margot Robbie", role: "Barbie" },
      { name: "Ryan Gosling", role: "Ken" },
      { name: "America Ferrera", role: "Gloria" },
      { name: "Simu Liu", role: "Tourist Ken" },
    ],
    crew: [
      { name: "Greta Gerwig", role: "Director" },
      { name: "Mark Ronson", role: "Music Director" },
      { name: "David Heyman", role: "Producer" },
    ],
  },

  // ═══════════════════════════════════════════════════
  // ─── LIVE EVENTS (Concerts, Comedy, Festivals) ───
  // ═══════════════════════════════════════════════════
  {
    title: "Coldplay: Music of the Spheres Tour",
    genre: "Music Shows, Concert, Live Music",
    duration: "3h 30m",
    rating: "9.7",
    votes: "520.4K",
    certification: "U",
    type: "Event",
    format: "Live Stadium Concert",
    languages: ["English"],
    releaseDate: new Date("2026-11-15"),
    posterImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80",
    description:
      "Experience Coldplay live with LED Xylobands, fireworks, confetti storms, and stadium-shaking anthems including Yellow, Fix You, Viva La Vida, and A Sky Full of Stars.",
    cast: [
      { name: "Chris Martin", role: "Lead Vocals & Piano" },
      { name: "Jonny Buckland", role: "Lead Guitar" },
      { name: "Guy Berryman", role: "Bass Guitar" },
      { name: "Will Champion", role: "Drums & Backing Vocals" },
    ],
    crew: [
      { name: "BookMyShow Live", role: "Event Producer" },
      { name: "Phil Harvey", role: "Creative Director" },
    ],
  },
  {
    title: "Diljit Dosanjh: Dil-Luminati Tour",
    genre: "Music Shows, Concert, Festivals",
    duration: "3h 00m",
    rating: "9.5",
    votes: "380.2K",
    certification: "U",
    type: "Event",
    format: "Live Arena Concert",
    languages: ["Hindi", "English"],
    releaseDate: new Date("2026-10-26"),
    posterImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80",
    description:
      "Global icon Diljit Dosanjh brings the electrifying Dil-Luminati experience with chartbusters Born to Shine, Lover, G.O.A.T., Naina, and Hass Hass.",
    cast: [
      { name: "Diljit Dosanjh", role: "Headliner" },
    ],
    crew: [
      { name: "Saregama Live", role: "Tour Producer" },
      { name: "Ripple Effect Studios", role: "Stage Design" },
    ],
  },
  {
    title: "Zakir Khan Live – Tathastu & Beyond",
    genre: "Comedy Shows, Stand-up Comedy, Laughter",
    duration: "2h 00m",
    rating: "9.3",
    votes: "162.8K",
    certification: "UA",
    type: "Event",
    format: "Live Stand-up Special",
    languages: ["Hindi"],
    releaseDate: new Date("2026-10-20"),
    posterImage: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1600&q=80",
    description:
      "The Sakht Launda himself returns with a brand new two-hour storytelling and stand-up comedy special filled with nostalgia, family anecdotes, and heartfelt poetry.",
    cast: [
      { name: "Zakir Khan", role: "Stand-up Comedian" },
    ],
    crew: [
      { name: "OML Entertainment", role: "Producer" },
    ],
  },
  {
    title: "Arijit Singh Live in Concert",
    genre: "Music Shows, Concert, Live Music",
    duration: "3h 00m",
    rating: "9.4",
    votes: "295.6K",
    certification: "U",
    type: "Event",
    format: "Live Symphony Concert",
    languages: ["Hindi"],
    releaseDate: new Date("2026-11-08"),
    posterImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80",
    description:
      "Witness the voice of a generation perform timeless Bollywood ballads and high-energy hits backed by a 60-piece international grand symphony orchestra.",
    cast: [
      { name: "Arijit Singh", role: "Lead Vocalist" },
    ],
    crew: [
      { name: "Insider & BMS Live", role: "Event Organiser" },
    ],
  },
  {
    title: "Abhishek Upmanyu – Toxic Live",
    genre: "Comedy Shows, Stand-up Comedy, Laughter",
    duration: "1h 30m",
    rating: "9.2",
    votes: "128.9K",
    certification: "UA",
    type: "Event",
    format: "Live Stand-up Tour",
    languages: ["Hindi", "English"],
    releaseDate: new Date("2026-10-25"),
    posterImage: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1600&q=80",
    description:
      "Fast-paced, razor-sharp observational comedy from Abhishek Upmanyu tackling modern relationships, corporate life, and everyday Indian absurdities.",
    cast: [
      { name: "Abhishek Upmanyu", role: "Comedian" },
    ],
    crew: [
      { name: "Laugh Club India", role: "Producer" },
    ],
  },
  {
    title: "Sunburn Festival 2026 ft. Martin Garrix",
    genre: "Music Shows, Festivals, DJ Nights",
    duration: "5h 00m",
    rating: "9.0",
    votes: "184.5K",
    certification: "UA",
    type: "Event",
    format: "EDM Festival",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-12-28"),
    posterImage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1600&q=80",
    description:
      "Asia's premier electronic dance music festival returns with world #1 DJ Martin Garrix, massive pyrotechnics, laser shows, and immersive festival stages.",
    cast: [
      { name: "Martin Garrix", role: "Headliner DJ" },
      { name: "Nucleya", role: "Special Act" },
    ],
    crew: [
      { name: "Percept Live", role: "Festival Producer" },
    ],
  },

  // ═══════════════════════════════════════════════════
  // ─── PLAYS (Theatre & Broadway Musicals) ───
  // ═══════════════════════════════════════════════════
  {
    title: "Mughal-e-Azam: The Musical",
    genre: "Musical, Drama, Theater",
    duration: "2h 30m",
    rating: "9.4",
    votes: "64.2K",
    certification: "U",
    type: "Play",
    format: "Grand Broadway Musical",
    languages: ["Hindi"],
    releaseDate: new Date("2026-10-18"),
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
    title: "Hamilton – West End & Broadway Tour",
    genre: "Musical, Drama, Classic",
    duration: "2h 45m",
    rating: "9.5",
    votes: "82.1K",
    certification: "UA",
    type: "Play",
    format: "Live Stage Musical",
    languages: ["English"],
    releaseDate: new Date("2026-11-02"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/8/83/Hamilton-poster.jpg",
    backdropImage: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1600&q=80",
    description:
      "The Tony, Grammy, Olivier, and Pulitzer Prize-winning musical blending hip-hop, jazz, R&B, and Broadway to tell the story of Founding Father Alexander Hamilton.",
    cast: [
      { name: "Lin-Manuel Miranda", role: "Alexander Hamilton" },
      { name: "Leslie Odom Jr.", role: "Aaron Burr" },
      { name: "Phillipa Soo", role: "Eliza Hamilton" },
    ],
    crew: [
      { name: "Thomas Kail", role: "Director" },
      { name: "Lin-Manuel Miranda", role: "Composer & Lyricist" },
    ],
  },
  {
    title: "12 Angry Men – Stage Adaptation",
    genre: "Drama, Classic, Theater",
    duration: "1h 50m",
    rating: "9.1",
    votes: "38.4K",
    certification: "UA",
    type: "Play",
    format: "Courtroom Stage Drama",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-10-22"),
    posterImage: "https://upload.wikimedia.org/wikipedia/en/9/91/12_angry_men.jpg",
    backdropImage: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1600&q=80",
    description:
      "Twelve jurors locked in a sweltering deliberation room must decide the fate of a teenager accused of murder, as Juror #8 plants a seed of reasonable doubt.",
    cast: [
      { name: "Rajit Kapur", role: "Juror 8" },
      { name: "Atul Kumar", role: "Juror 3" },
      { name: "deven Khote", role: "Juror 4" },
    ],
    crew: [
      { name: "NCPA Theatre", role: "Production House" },
    ],
  },
  {
    title: "The Lion King: Live Stage Musical",
    genre: "Musical, Classic, Kids Theatre",
    duration: "2h 30m",
    rating: "9.3",
    votes: "71.5K",
    certification: "U",
    type: "Play",
    format: "Family Stage Musical",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-10-29"),
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

  // ═══════════════════════════════════════════════════
  // ─── SPORTS (Cricket, Football, F1, Kabaddi) ───
  // ═══════════════════════════════════════════════════
  {
    title: "TATA IPL: Mumbai Indians vs CSK",
    genre: "Cricket, Live Matches, Tournaments",
    duration: "3h 45m",
    rating: "9.6",
    votes: "480.0K",
    certification: "U",
    type: "Sport",
    format: "Live Stadium Match",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-10-24"),
    posterImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1600&q=80",
    description:
      "Cricket's biggest El Clasico! Witness five-time champions Mumbai Indians take on Chennai Super Kings under the floodlights in an electric stadium atmosphere.",
    cast: [
      { name: "Hardik Pandya", role: "Mumbai Indians Captain" },
      { name: "MS Dhoni", role: "CSK Legend" },
      { name: "Rohit Sharma", role: "Opening Batsman" },
      { name: "Jasprit Bumrah", role: "Pace Spearhead" },
    ],
    crew: [
      { name: "BCCI / IPL", role: "Tournament Organiser" },
    ],
  },
  {
    title: "IND vs AUS – T20 International Series",
    genre: "Cricket, Live Matches",
    duration: "3h 30m",
    rating: "9.5",
    votes: "390.2K",
    certification: "U",
    type: "Sport",
    format: "International T20",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-11-05"),
    posterImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1600&q=80",
    description:
      "Team India takes on Australia in a high-scoring T20I thriller. Book your stadium stands and hospitality boxes for an unforgettable night of sixes and wickets.",
    cast: [
      { name: "Suryakumar Yadav", role: "India T20I Captain" },
      { name: "Travis Head", role: "Australia Opener" },
    ],
    crew: [
      { name: "BCCI", role: "Host Board" },
    ],
  },
  {
    title: "ISL Grand Final: Mohun Bagan vs Mumbai City",
    genre: "Football, Tournaments, Live Matches",
    duration: "2h 15m",
    rating: "8.9",
    votes: "112.4K",
    certification: "U",
    type: "Sport",
    format: "Championship Final",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-10-30"),
    posterImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80",
    description:
      "Indian football's fiercest rivalry reaches its climax in the Indian Super League Grand Final. 90 minutes of relentless football for the coveted trophy.",
    cast: [
      { name: "Lallianzuala Chhangte", role: "Mumbai City FC" },
      { name: "Dimitri Petratos", role: "Mohun Bagan SG" },
    ],
    crew: [
      { name: "AIFF & FSDL", role: "League Organiser" },
    ],
  },
  {
    title: "Formula 1 Grand Prix Fan Park Live",
    genre: "Racing, Fan Zones, Sports Meetups",
    duration: "2h 30m",
    rating: "9.1",
    votes: "76.5K",
    certification: "U",
    type: "Sport",
    format: "Giant Screen & Simulators",
    languages: ["English"],
    releaseDate: new Date("2026-10-25"),
    posterImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80",
    description:
      "Lights out and away we go! Watch the Formula 1 Grand Prix on a 50-foot LED wall with F1 racing simulators, pit-stop challenges, and live DJ music.",
    cast: [
      { name: "Max Verstappen", role: "Red Bull Racing" },
      { name: "Lewis Hamilton", role: "Scuderia Ferrari" },
      { name: "Lando Norris", role: "McLaren F1" },
    ],
    crew: [
      { name: "F1 Fan Zone India", role: "Organiser" },
    ],
  },

  // ═══════════════════════════════════════════════════
  // ─── ACTIVITIES (Theme Parks, Comedy, Workshops) ───
  // ═══════════════════════════════════════════════════
  {
    title: "Worlds of Wonder (WOW) Amusement & Water Park",
    genre: "Amusement Parks, Water Parks, Adventure",
    duration: "7h 00m",
    rating: "8.8",
    votes: "68.4K",
    certification: "U",
    type: "Activity",
    format: "All-Day Unlimited Pass",
    languages: ["Hindi", "English"],
    releaseDate: new Date("2026-10-16"),
    posterImage: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1600&q=80",
    description:
      "Beat the thrill with 20+ world-class TUV-certified rides, wave pools, lazy rivers, and go-karting right in the heart of Sector 38A, Noida.",
    cast: [
      { name: "Mega Disco & Feedback", role: "Thrill Rides" },
      { name: "Wave Pool & Rapid Racer", role: "Water Slides" },
    ],
    crew: [
      { name: "Entertainment City Noida", role: "Venue Partner" },
    ],
  },
  {
    title: "The Habitat Late Night Stand-up & Improv Jam",
    genre: "Comedy, Improv, Storytelling",
    duration: "1h 45m",
    rating: "9.0",
    votes: "44.2K",
    certification: "UA",
    type: "Activity",
    format: "Intimate Comedy Club",
    languages: ["Hindi", "English"],
    releaseDate: new Date("2026-10-18"),
    posterImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80",
    description:
      "A curated lineup of 5 top stand-up comedians testing their sharpest new material alongside spontaneous crowd-work and improv games.",
    cast: [
      { name: "Surprise Lineup", role: "Top Indian Comics" },
    ],
    crew: [
      { name: "Comedy Canvas", role: "Curator" },
    ],
  },
  {
    title: "Clay & Sip: Wheel Pottery & Art Jamming",
    genre: "Art & Craft, Workshop, Storytelling",
    duration: "2h 00m",
    rating: "9.1",
    votes: "31.8K",
    certification: "U",
    type: "Activity",
    format: "Guided Studio Session",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-10-19"),
    posterImage: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80",
    description:
      "Unwind over artisanal coffee while learning hand-building and potter's wheel techniques from master ceramic artists. Take home your handcrafted ceramic piece!",
    cast: [
      { name: "Studio Terracotta", role: "Master Potters" },
    ],
    crew: [
      { name: "Artisan Collective", role: "Host" },
    ],
  },
  {
    title: "Formula Karting – Pro Go-Karting Experience",
    genre: "Go-Karting, Adventure, Racing",
    duration: "1h 00m",
    rating: "9.2",
    votes: "49.7K",
    certification: "UA",
    type: "Activity",
    format: "Timed Lap Session",
    languages: ["English", "Hindi"],
    releaseDate: new Date("2026-10-17"),
    posterImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    backdropImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1600&q=80",
    description:
      "Race Sodi RT8 pro karts on India's fastest floodlit multi-turn circuit with live telemetry lap timing, FIA-grade barriers, and podium trophies.",
    cast: [
      { name: "Sodi RT8 270cc Karts", role: "Pro Fleet" },
    ],
    crew: [
      { name: "Snow World & Formula Karting", role: "Track Operator" },
    ],
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

    // 2. Insert Latest Movies, Streams, Events, Plays, Sports, Activities
    const moviesWithIds = realData.map((item) => ({
      ...item,
      _id: new mongoose.Types.ObjectId(),
      showtimes: [],
    }));

    await Movie.insertMany(moviesWithIds);
    console.log(`Successfully seeded ${moviesWithIds.length} latest titles across all categories`);

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

    // 4. Generate Realistic BookMyShow Reviews (1–10 Rating Scale)
    const reviewDocs = [];
    const comments = [
      "Goosebumps throughout! The interval block and climax are pure cinema magic. A must-watch in IMAX!",
      "Phenomenal background score and stellar performances by the entire cast. Worth every penny.",
      "Visual spectacle on the big screen! Direction, cinematography, and sound design are top-notch.",
      "Watched the evening show with family — thoroughly entertaining from start to finish!",
      "One of the finest theatrical experiences of the year. Don't miss the Dolby Atmos mix!",
      "Brilliant writing and powerhouse acting. The second half takes it to another level altogether.",
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
