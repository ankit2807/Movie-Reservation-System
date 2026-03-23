const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Movie = require("../models/movieModel");

dotenv.config();

const realData = [
    // --- MOVIES ---
    {
        title: "Animal",
        genre: "Action, Drama",
        duration: "3:21",
        rating: "R",
        type: "Movie",
        cast: [{ name: "Ranbir Kapoor" }, { name: "Rashmika Mandanna" }],
        description: "A son's obsessive love for his father leads to a dark path of bloodshed and vengeance.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/9/90/Animal_%282023_film%29_poster.jpg"
    },
    {
        title: "Dunki",
        genre: "Comedy, Drama",
        duration: "2:41",
        rating: "PG-13",
        type: "Movie",
        cast: [{ name: "Shah Rukh Khan" }, { name: "Taapsee Pannu" }],
        description: "Four friends from a village in Punjab share a common dream: to go to England.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/8/82/Dunki_poster.jpg"
    },
    {
        title: "Salaar",
        genre: "Action, Thriller",
        duration: "2:55",
        rating: "R",
        type: "Movie",
        cast: [{ name: "Prabhas" }, { name: "Prithviraj Sukumaran" }],
        description: "A gang leader makes a promise to a dying friend and takes on other criminal gangs.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/f/f7/Salaar_Part_1_–_Ceasefire_poster.jpg"
    },
    {
        title: "Sam Bahadur",
        genre: "Biography, War",
        duration: "2:30",
        rating: "PG-13",
        type: "Movie",
        cast: [{ name: "Vicky Kaushal" }, { name: "Sanya Malhotra" }],
        description: "Based on the life of Sam Manekshaw, who was the Chief of the Army Staff of the Indian Army.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/Sam_Bahadur_poster.jpg/220px-Sam_Bahadur_poster.jpg"
    },
    {
        title: "Tiger 3",
        genre: "Action, Thriller",
        duration: "2:36",
        rating: "PG-13",
        type: "Movie",
        cast: [{ name: "Salman Khan" }, { name: "Katrina Kaif" }],
        description: "Tiger and Zoya are back - to save the country and their family.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/0/07/Tiger_3_poster.jpg"
    },
    {
        title: "Jawan",
        genre: "Action, Thriller",
        duration: "2:49",
        rating: "PG-13",
        type: "Movie",
        cast: [{ name: "Shah Rukh Khan" }, { name: "Nayanthara" }],
        description: "A high-octane action thriller which outlines the emotional journey of a man.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Jawan_poster.jpg/220px-Jawan_poster.jpg"
    },
    {
        title: "Gadar 2",
        genre: "Action, Drama",
        duration: "2:50",
        rating: "PG-13",
        type: "Movie",
        cast: [{ name: "Sunny Deol" }, { name: "Ameesha Patel" }],
        description: "Tara Singh returns to Pakistan to rescue his son Charanjeet Singh.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/6/62/Gadar_2_film_poster.jpg"
    },
    {
        title: "Rocky Aur Rani",
        genre: "Comedy, Romance",
        duration: "2:48",
        rating: "PG-13",
        type: "Movie",
        cast: [{ name: "Ranveer Singh" }, { name: "Alia Bhatt" }],
        description: "Flamboyant Rocky and intellectual Rani fall in love.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/6/65/Rocky_Aur_Rani_Kii_Prem_Kahaani_poster.jpg"
    },
    {
        title: "Oppenheimer",
        genre: "Biography, Drama",
        duration: "3:00",
        rating: "R",
        type: "Movie",
        cast: [{ name: "Cillian Murphy" }, { name: "Emily Blunt" }],
        description: "The story of American scientist J. Robert Oppenheimer and the atomic bomb.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg"
    },
    {
        title: "Barbie",
        genre: "Adventure, Comedy",
        duration: "1:54",
        rating: "PG-13",
        type: "Movie",
        cast: [{ name: "Margot Robbie" }, { name: "Ryan Gosling" }],
        description: "Barbie suffers a crisis that leads her to question her world.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/0/0b/Barbie_2023_poster.jpg"
    },
    {
        title: "MI7: Dead Reckoning",
        genre: "Action, Adventure",
        duration: "2:43",
        rating: "PG-13",
        type: "Movie",
        cast: [{ name: "Tom Cruise" }],
        description: "Ethan Hunt and his IMF team track down a dangerous new weapon.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/f/f0/Mission_Impossible_Dead_Reckoning_Part_One_poster.jpg"
    },
    {
        title: "Spider-Man: ATSV",
        genre: "Animation, Action",
        duration: "2:20",
        rating: "PG",
        type: "Movie",
        cast: [{ name: "Shameik Moore" }],
        description: "Miles Morales catapults across the Multiverse.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/b/b4/Spider-Man-_Across_the_Spider-Verse_poster.jpg"
    },
    {
        title: "OMG 2",
        genre: "Comedy, Drama",
        duration: "2:36",
        rating: "PG-13",
        type: "Movie",
        cast: [{ name: "Akshay Kumar" }, { name: "Pankaj Tripathi" }],
        description: "An unhappy civilian decides to take the legal route to teach a lesson on sex education.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/9/90/OMG_2_poster.jpg"
    },
    {
        title: "John Wick 4",
        genre: "Action, Thriller",
        duration: "2:49",
        rating: "R",
        type: "Movie",
        cast: [{ name: "Keanu Reeves" }],
        description: "John Wick uncovers a path to defeating The High Table.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/3/33/John_Wick_Chapter_4_poster.jpg"
    },
    {
        title: "Fast X",
        genre: "Action, Adventure",
        duration: "2:21",
        rating: "PG-13",
        type: "Movie",
        cast: [{ name: "Vin Diesel" }, { name: "Jason Momoa" }],
        description: "Dom Toretto faces a new enemy linked to his past.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/1/13/Fast_X_poster.jpg"
    },
    {
        title: "Super Mario Bros",
        genre: "Animation, Adventure",
        duration: "1:32",
        rating: "G",
        type: "Movie",
        cast: [{ name: "Chris Pratt" }],
        description: "Mario journeys through the Mushroom Kingdom.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/4/44/The_Super_Mario_Bros._Movie_poster.jpg"
    },
    {
        title: "Pathaan",
        genre: "Action, Thriller",
        duration: "2:26",
        rating: "PG-13",
        type: "Movie",
        cast: [{ name: "Shah Rukh Khan" }, { name: "Deepika Padukone" }],
        description: "An Indian agent races against a doomsday clock.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/c/c3/Pathaan_film_poster.jpg"
    },
    {
        title: "Tu Jhoothi Main Makkaar",
        genre: "Comedy, Romance",
        duration: "2:39",
        rating: "PG-13",
        type: "Movie",
        cast: [{ name: "Ranbir Kapoor" }, { name: "Shraddha Kapoor" }],
        description: "A player in romantic relationships finds a worthy opponent.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/b/b6/Tu_Jhoothi_Main_Makkaar_poster.jpg"
    },
    {
        title: "Leo",
        genre: "Action, Crime",
        duration: "2:44",
        rating: "R",
        type: "Movie",
        cast: [{ name: "Vijay" }, { name: "Trisha" }],
        description: "A cafe owner in Kashmir fends off a gang of thugs.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/1/1b/Leo_2023_film_poster.jpg"
    },
    {
        title: "Jailer",
        genre: "Action, Comedy",
        duration: "2:48",
        rating: "PG-13",
        type: "Movie",
        cast: [{ name: "Rajinikanth" }],
        description: "A retired jailer goes on a manhunt to find his son's killers.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/c/cb/Jailer_2023_Tamil_film_poster.jpg"
    },

    // --- STREAMS ---
    {
        title: "Avatar: Way of Water",
        genre: "Sci-Fi, Adventure",
        duration: "3:12",
        rating: "PG-13",
        type: "Stream",
        cast: [{ name: "Sam Worthington" }],
        description: "Jake Sully lives with his newfound family on Pandora.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/5/54/Avatar_The_Way_of_Water_poster.jpg"
    },
    {
        title: "Wakanda Forever",
        genre: "Action, Adventure",
        duration: "2:41",
        rating: "PG-13",
        type: "Stream",
        cast: [{ name: "Letitia Wright" }],
        description: "Wakanda fights to protect their home from world powers.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/3/3b/Black_Panther_Wakanda_Forever_poster.jpg"
    },
    {
        title: "Ant-Man: Quantumania",
        genre: "Action, Adventure",
        duration: "2:04",
        rating: "PG-13",
        type: "Stream",
        cast: [{ name: "Paul Rudd" }],
        description: "Scott Lang explores the Quantum Realm.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/3/30/Ant-Man_and_the_Wasp_Quantumania_poster.jpg"
    },
    {
        title: "The Flash",
        genre: "Action, Adventure",
        duration: "2:24",
        rating: "PG-13",
        type: "Stream",
        cast: [{ name: "Ezra Miller" }],
        description: "Barry Allen uses his super speed to change the past.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/e/ed/The_Flash_%28film%29_poster.jpg"
    },
    {
        title: "Blue Beetle",
        genre: "Action, Adventure",
        duration: "2:07",
        rating: "PG-13",
        type: "Stream",
        cast: [{ name: "Xolo Maridueña" }],
        description: "An alien scarab chooses Jaime Reyes.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/1/1c/Blue_Beetle_%28film%29_poster.jpg"
    },
    {
        title: "Shazam 2",
        genre: "Action, Comedy",
        duration: "2:10",
        rating: "PG-13",
        type: "Stream",
        cast: [{ name: "Zachary Levi" }],
        description: "Billy Batson continues his superhero life.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/3/3c/Shazam%21_Fury_of_the_Gods_poster.jpg"
    },
    {
        title: "Evil Dead Rise",
        genre: "Horror",
        duration: "1:36",
        rating: "R",
        type: "Stream",
        cast: [{ name: "Lily Sullivan" }],
        description: "A twisted tale of two estranged sisters.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/e/eb/Evil_Dead_Rise_poster.jpg"
    },
    {
        title: "The Nun II",
        genre: "Horror, Mystery",
        duration: "1:50",
        rating: "R",
        type: "Stream",
        cast: [{ name: "Taissa Farmiga" }],
        description: "A priest is murdered. An evil is spreading.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/b/b3/The_Nun_II_poster.jpg"
    },
    {
        title: "Insidious: Red Door",
        genre: "Horror, Mystery",
        duration: "1:47",
        rating: "PG-13",
        type: "Stream",
        cast: [{ name: "Patrick Wilson" }],
        description: "The Lamberts go deeper into The Further.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/7/77/Insidious_The_Red_Door_poster.jpg"
    },
    {
        title: "Saw X",
        genre: "Horror, Thriller",
        duration: "1:58",
        rating: "R",
        type: "Stream",
        cast: [{ name: "Tobin Bell" }],
        description: "John Kramer travels to Mexico for a procedure.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/7/7b/Saw_X_poster.jpg"
    },

    // --- EVENTS ---
    {
        title: "Sunburn Goa",
        genre: "Music Festival",
        duration: "4:00",
        rating: "PG-13",
        type: "Event",
        cast: [{ name: "Martin Garrix" }],
        description: "Asia's biggest electronic dance music festival.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/c/c2/Sunburn_Festival_Logo.jpg"
    },
    {
        title: "Lollapalooza India",
        genre: "Music Festival",
        duration: "8:00",
        rating: "PG-13",
        type: "Event",
        cast: [{ name: "Imagine Dragons" }],
        description: "The multi-genre music festival takes over Mumbai.",
        posterImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Lollapalooza_logo.svg/1200px-Lollapalooza_logo.svg.png"
    },
    {
        title: "NH7 Weekender",
        genre: "Music, Comedy",
        duration: "6:00",
        rating: "PG-13",
        type: "Event",
        cast: [{ name: "Various" }],
        description: "The happiest music festival with exciting lineups.",
        posterImage: "https://placehold.co/222x333/FF00FF/FFFFFF?text=NH7+Weekender"
    },
    {
        title: "Comic Con Mumbai",
        genre: "Exhibition",
        duration: "8:00",
        rating: "G",
        type: "Event",
        cast: [{ name: "Cosplayers" }],
        description: "The biggest pop culture event in India.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/4/4e/Comic_Con_India_logo.png"
    },
    {
        title: "Jaipur Lit Fest",
        genre: "Literature",
        duration: "8:00",
        rating: "G",
        type: "Event",
        cast: [{ name: "Authors" }],
        description: "The greatest literary show on Earth.",
        posterImage: "https://placehold.co/222x333/000000/FFFFFF?text=JLF"
    },
    {
        title: "Arijit Singh Live",
        genre: "Concert",
        duration: "3:00",
        rating: "G",
        type: "Event",
        cast: [{ name: "Arijit Singh" }],
        description: "Experience the soulful voice of Arijit Singh.",
        posterImage: "https://placehold.co/222x333/333333/FFFFFF?text=Arijit+Live"
    },
    {
        title: "Horn OK Please",
        genre: "Food Festival",
        duration: "6:00",
        rating: "G",
        type: "Event",
        cast: [{ name: "Foodies" }],
        description: "Delhi's happiest food festival.",
        posterImage: "https://placehold.co/222x333/FFA500/FFFFFF?text=Horn+OK+Please"
    },
    {
        title: "Zomaland",
        genre: "Food Carnival",
        duration: "7:00",
        rating: "G",
        type: "Event",
        cast: [{ name: "Chefs" }],
        description: "Grandest carnival with food, music and games.",
        posterImage: "https://placehold.co/222x333/FF0000/FFFFFF?text=Zomaland"
    },
    {
        title: "Nykaaland",
        genre: "Beauty Festival",
        duration: "6:00",
        rating: "PG-13",
        type: "Event",
        cast: [{ name: "Influencers" }],
        description: "India's first beauty and lifestyle festival.",
        posterImage: "https://placehold.co/222x333/FF69B4/FFFFFF?text=Nykaaland"
    },
    {
        title: "Mahindra Blues",
        genre: "Music",
        duration: "5:00",
        rating: "PG-13",
        type: "Event",
        cast: [{ name: "Blues Artists" }],
        description: "Asia's largest Blues festival.",
        posterImage: "https://placehold.co/222x333/0000FF/FFFFFF?text=Mahindra+Blues"
    },

    // --- PLAYS ---
    {
        title: "Mughal-e-Azam",
        genre: "Musical",
        duration: "2:30",
        rating: "G",
        type: "Play",
        cast: [{ name: "Nissar Khan" }],
        description: "A grand musical based on the timeless love story.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/f/f9/Mughal-e-Azam.jpg"
    },
    {
        title: "Hamilton",
        genre: "Musical",
        duration: "2:45",
        rating: "PG-13",
        type: "Play",
        cast: [{ name: "Lin-Manuel Miranda" }],
        description: "The story of American Founding Father Alexander Hamilton.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/8/83/Hamilton-poster.jpg"
    },
    {
        title: "The Lion King",
        genre: "Musical",
        duration: "2:30",
        rating: "G",
        type: "Play",
        cast: [{ name: "Simba" }],
        description: "Disney's award-winning musical comes to life.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/3/3d/The_Lion_King_poster.jpg"
    },
    {
        title: "Macbeth",
        genre: "Tragedy",
        duration: "2:00",
        rating: "PG-13",
        type: "Play",
        cast: [{ name: "Shakespeare" }],
        description: "The tragedy of Macbeth performance.",
        posterImage: "https://placehold.co/222x333/333333/FFFFFF?text=Macbeth"
    },
    {
        title: "Romeo & Juliet",
        genre: "Romance",
        duration: "2:15",
        rating: "PG-13",
        type: "Play",
        cast: [{ name: "Actors" }],
        description: "The classic tale of star-crossed lovers.",
        posterImage: "https://placehold.co/222x333/FF0000/FFFFFF?text=Romeo+%26+Juliet"
    },
    {
        title: "12 Angry Men",
        genre: "Drama",
        duration: "1:45",
        rating: "PG-13",
        type: "Play",
        cast: [{ name: "Jury" }],
        description: "A jury holdout attempts to prevent a miscarriage of justice.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/9/91/12_angry_men.jpg"
    },
    {
        title: "Broken Images",
        genre: "Drama",
        duration: "1:15",
        rating: "PG-13",
        type: "Play",
        cast: [{ name: "Shabana Azmi" }],
        description: "A psychological thriller about two sisters.",
        posterImage: "https://placehold.co/222x333/000000/FFFFFF?text=Broken+Images"
    },
    {
        title: "Vicina Monologues",
        genre: "Drama",
        duration: "1:30",
        rating: "R",
        type: "Play",
        cast: [{ name: "Various" }],
        description: "An episodic play by Eve Ensler.",
        posterImage: "https://placehold.co/222x333/555555/FFFFFF?text=Vagina+Monologues"
    },

    // --- SPORTS ---
    {
        title: "IPL 2024: MI vs CSK",
        genre: "Cricket",
        duration: "3:30",
        rating: "G",
        type: "Sport",
        cast: [{ name: "MS Dhoni" }],
        description: "Mumbai Indians take on Chennai Super Kings.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Indian_Premier_League_Official_Logo.svg/1200px-Indian_Premier_League_Official_Logo.svg.png"
    },
    {
        title: "WC Final",
        genre: "Cricket",
        duration: "8:00",
        rating: "G",
        type: "Sport",
        cast: [{ name: "India" }],
        description: "The final showdown for the world cup trophy.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Cricket_World_Cup_Logo.svg/1200px-Cricket_World_Cup_Logo.svg.png"
    },
    {
        title: "Pro Kabaddi",
        genre: "Kabaddi",
        duration: "1:00",
        rating: "G",
        type: "Sport",
        cast: [{ name: "Raiders" }],
        description: "Action packed kabaddi matches.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/thumb/1/18/Pro_Kabaddi_League_logo.svg/1200px-Pro_Kabaddi_League_logo.svg.png"
    },
    {
        title: "ISL Final",
        genre: "Football",
        duration: "2:00",
        rating: "G",
        type: "Sport",
        cast: [{ name: "Sunil Chhetri" }],
        description: "The grand finale of Indian Super League.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/Indian_Super_League_logo.svg/1200px-Indian_Super_League_logo.svg.png"
    },
    {
        title: "F1 Bahrain GP",
        genre: "Racing",
        duration: "2:00",
        rating: "G",
        type: "Sport",
        cast: [{ name: "Max Verstappen" }],
        description: "Lights out and away we go for the new season.",
        posterImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/F1.svg/1200px-F1.svg.png"
    },
    {
        title: "Wimbledon Final",
        genre: "Tennis",
        duration: "4:00",
        rating: "G",
        type: "Sport",
        cast: [{ name: "Djokovic" }],
        description: "The most prestigious tennis tournament.",
        posterImage: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Wimbledon.svg/1200px-Wimbledon.svg.png"
    },

    // --- ACTIVITIES ---
    {
        title: "Pottery Workshop",
        genre: "Workshop",
        duration: "2:00",
        rating: "G",
        type: "Activity",
        cast: [{ name: "Instructor" }],
        description: "Learn the art of pottery making.",
        posterImage: "https://placehold.co/222x333/8B4513/FFFFFF?text=Pottery"
    },
    {
        title: "Comedy Open Mic",
        genre: "Comedy",
        duration: "1:30",
        rating: "R",
        type: "Activity",
        cast: [{ name: "Comedians" }],
        description: "Laugh your heart out at this open mic night.",
        posterImage: "https://placehold.co/222x333/000000/FFFF00?text=Comedy+Mic"
    },
    {
        title: "Salsa Social",
        genre: "Dance",
        duration: "3:00",
        rating: "G",
        type: "Activity",
        cast: [{ name: "Dancers" }],
        description: "Dance the night away with Salsa and Bachata.",
        posterImage: "https://placehold.co/222x333/FF0000/FFFFFF?text=Salsa"
    },
    {
        title: "Painting Party",
        genre: "Art",
        duration: "2:30",
        rating: "G",
        type: "Activity",
        cast: [{ name: "Artist" }],
        description: "Guided painting session for beginners.",
        posterImage: "https://placehold.co/222x333/ADD8E6/000000?text=Painting"
    },
    {
        title: "Wine Tasting",
        genre: "Lifestyle",
        duration: "4:00",
        rating: "R",
        type: "Activity",
        cast: [{ name: "Sommelier" }],
        description: "Taste exclusive wines and tour the vineyards.",
        posterImage: "https://placehold.co/222x333/800080/FFFFFF?text=Wine+Tasting"
    },
    {
        title: "Midnight Cycling",
        genre: "Adventure",
        duration: "5:00",
        rating: "PG-13",
        type: "Activity",
        cast: [{ name: "Cyclists" }],
        description: "Explore the city streets at night on a bicycle.",
        posterImage: "https://placehold.co/222x333/111111/FFFFFF?text=Cycling"
    }
];

const ShowTime = require("../models/showtimeModel");
const Review = require("../models/reviewModel");
const User = require("../models/userModel");

// ... existing code ...

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI || process.env.MONGO_URI);
        console.log("Connected to DB");

        await Movie.deleteMany({});
        await ShowTime.deleteMany({}); // Clear existing showtimes
        await Review.deleteMany({});
        await User.deleteMany({});
        console.log("Cleared existing data");

        // 1. Create Users
        const usersData = [
            { name: "Aditi Rao", email: "aditi@example.com", password: "secretUser1", phone: "9876543210" },
            { name: "Rahul Verma", email: "rahul@example.com", password: "secretUser2", phone: "9876543211" },
            { name: "Sneha Gupta", email: "sneha@example.com", password: "secretUser3", phone: "9876543212" },
            { name: "Vikram Singh", email: "vikram@example.com", password: "secretUser4", phone: "9876543213" },
            { name: "Priya Sharma", email: "priya@example.com", password: "secretUser5", phone: "9876543214" }
        ];
        const users = await User.insertMany(usersData);
        console.log(`Successfully seeded ${users.length} users`);

        // 2. Create Movies (Map data to schema)
        const timestamp = Date.now();
        const moviesWithIds = realData.map((item) => ({
            ...item,
            _id: new mongoose.Types.ObjectId(), // Create ID manually to reference it
            certification: item.rating === "G" ? "U" : item.rating === "PG-13" ? "UA" : "A",
            releaseDate: new Date(timestamp - Math.floor(Math.random() * 10000000000)),
            // We can keep the embedded one for reference if needed, but ShowTime model is key
            showtimes: [],
            languages: ["Hindi", "English", "Tamil", "Telugu", "Kannada", "Malayalam"].filter(() => Math.random() > 0.5)
                .concat(item.type === 'Movie' ? (['Hindi', 'English']) : ['English'])
                .slice(0, 3)
        }));

        await Movie.insertMany(moviesWithIds);
        console.log(`Successfully seeded ${moviesWithIds.length} movies`);

        // 3. Generate ShowTimes
        const showTimeDocs = [];
        const days = 7;
        const slots = [10, 13, 16, 19, 22]; // Hours

        moviesWithIds.forEach(movie => {
            for (let i = 0; i < days; i++) {
                const date = new Date(timestamp + i * 86400000); // Next 7 days

                slots.forEach(h => {
                    const startRaw = new Date(date);
                    startRaw.setHours(h, 0, 0, 0);

                    const endRaw = new Date(startRaw);
                    endRaw.setHours(h + 3, 0, 0, 0); // Assume 3 hour duration

                    showTimeDocs.push({
                        startAt: `${h}:00`,
                        startDate: startRaw,
                        endDate: endRaw,
                        movieId: movie._id
                    });
                });
            }
        });

        await ShowTime.insertMany(showTimeDocs);
        console.log(`Successfully seeded ${showTimeDocs.length} showtimes`);

        // 4. Generate Reviews
        const reviewDocs = [];
        const comments = [
            "Absolutely loved it! A must-watch.",
            "Great performances, but the plot was a bit weak.",
            "Visual masterpiece. Highly recommended.",
            "Good one time watch.",
            "Not my cup of tea, but production quality was high.",
            "Incredible storyline and direction!",
            "Just amazing. Will watch again.",
            "A bit too long, but worth it."
        ];

        moviesWithIds.forEach(movie => {
            // Pick 1 to 4 random users to review this movie
            const reviewers = users.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1);

            reviewers.forEach(user => {
                reviewDocs.push({
                    movieId: movie._id,
                    user: user._id,
                    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars mostly
                    comment: comments[Math.floor(Math.random() * comments.length)]
                });
            });
        });

        await Review.insertMany(reviewDocs);
        console.log(`Successfully seeded ${reviewDocs.length} reviews`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
