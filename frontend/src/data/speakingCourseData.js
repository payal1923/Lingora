// speakingCourseData.js
// --------------------------------------------------
// Lingora AI Speaking Course — 3 levels × 15 lessons = 45 lessons.
// Each lesson contains:
//   - 5 vocabulary words (word, pronunciation, meaning, part of speech,
//     difficulty, category, example)
//   - 5 practice sentences
//   - 1 AI conversation scenario (greeting + system context)
//
// This is the single source of truth for the speaking course on the
// frontend. The backend mirrors the lesson titles/levels for progress
// tracking via the lesson_key format: "beginner-1" ... "advanced-15".
// --------------------------------------------------

export const SPEAKING_LEVELS = [
    {
        id: "beginner",
        name: "Beginner",
        color: "emerald",
        gradient: "from-emerald-500 via-teal-500 to-green-500",
        ring: "ring-emerald-300",
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        emoji: "🟢",
        description: "Build your foundation with everyday English.",
    },
    {
        id: "intermediate",
        name: "Intermediate",
        color: "amber",
        gradient: "from-amber-500 via-orange-500 to-yellow-500",
        ring: "ring-amber-300",
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        emoji: "🟡",
        description: "Handle real-world situations with confidence.",
    },
    {
        id: "advanced",
        name: "Advanced",
        color: "rose",
        gradient: "from-rose-500 via-pink-500 to-red-500",
        ring: "ring-rose-300",
        text: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-200",
        emoji: "🔴",
        description: "Master professional and fluent English.",
    },
];

// Helper to build a vocabulary word object.
const v = (word, pronunciation, meaning, partOfSpeech, difficulty, category, example) => ({
    word,
    pronunciation,
    meaning,
    part_of_speech: partOfSpeech,
    difficulty,
    category,
    example,
});

// Helper to build a lesson.
const lesson = (title, vocabulary, sentences, conversation) => ({
    title,
    vocabulary,
    sentences,
    conversation,
});

// Helper to build a conversation scenario.
const convo = (greeting, scenario, systemPrompt) => ({
    greeting,
    scenario,
    systemPrompt,
});

export const SPEAKING_COURSE = {
    beginner: [
        lesson(
            "Greetings",
            [
                v("hello", "/həˈloʊ/", "A common greeting", "interjection", "Beginner", "Greetings", "Hello! How are you today?"),
                v("goodbye", "/ˌɡʊdˈbaɪ/", "A way of saying farewell", "interjection", "Beginner", "Greetings", "Goodbye! See you tomorrow."),
                v("welcome", "/ˈwɛlkəm/", "A greeting to someone who arrives", "interjection", "Beginner", "Greetings", "Welcome to our home!"),
                v("thanks", "/θæŋks/", "A short way of saying thank you", "interjection", "Beginner", "Greetings", "Thanks for your help."),
                v("please", "/pliːz/", "Used to make a polite request", "adverb", "Beginner", "Greetings", "Please pass the salt."),
            ],
            ["Hello, how are you?", "Good morning, everyone.", "Nice to meet you.", "See you later.", "Thank you very much."],
            convo(
                "Hello! 👋 I'm Lingora AI. Let's practice greetings. How do you say hello to a new friend?",
                "Meeting a new friend for the first time.",
                "Practice greetings. Keep it warm and friendly. Ask one question at a time."
            )
        ),
        lesson(
            "Introducing Yourself",
            [
                v("name", "/neɪm/", "The word that identifies a person", "noun", "Beginner", "Personal", "My name is Alex."),
                v("from", "/frɒm/", "Indicates origin or source", "preposition", "Beginner", "Personal", "I am from India."),
                v("student", "/ˈstuːdənt/", "A person who studies", "noun", "Beginner", "Personal", "I am a student."),
                v("live", "/lɪv/", "To reside in a place", "verb", "Beginner", "Personal", "I live in Mumbai."),
                v("years", "/jɪrz/", "Units of age or time", "noun", "Beginner", "Personal", "I am twenty years old."),
            ],
            ["My name is Alex.", "I am from India.", "I am a student.", "I live in Mumbai.", "I am twenty years old."],
            convo(
                "Hi there! 👋 Let's practice introductions. Can you introduce yourself to me?",
                "Introducing yourself to a new classmate.",
                "Help the learner introduce themselves. Ask about name, country, job, and age one at a time."
            )
        ),
        lesson(
            "Family",
            [
                v("mother", "/ˈmʌðər/", "A female parent", "noun", "Beginner", "Family", "My mother is a teacher."),
                v("father", "/ˈfɑːðər/", "A male parent", "noun", "Beginner", "Family", "My father works hard."),
                v("brother", "/ˈbrʌðər/", "A male sibling", "noun", "Beginner", "Family", "My brother is older than me."),
                v("sister", "/ˈsɪstər/", "A female sibling", "noun", "Beginner", "Family", "My sister loves music."),
                v("parents", "/ˈpɛrənts/", "Mother and father together", "noun", "Beginner", "Family", "My parents are kind."),
            ],
            ["This is my mother.", "My father is a doctor.", "I have one brother.", "My sister is younger.", "I love my parents."],
            convo(
                "Hello! 👋 Let's talk about family. Tell me about your family.",
                "Talking about your family with a new friend.",
                "Ask about family members one at a time. Be warm and encouraging."
            )
        ),
        lesson(
            "Daily Routine",
            [
                v("morning", "/ˈmɔːrnɪŋ/", "The early part of the day", "noun", "Beginner", "Routine", "I wake up in the morning."),
                v("breakfast", "/ˈbrɛkfəst/", "The first meal of the day", "noun", "Beginner", "Routine", "I eat breakfast at eight."),
                v("work", "/wɜːrk/", "A job or activity", "noun", "Beginner", "Routine", "I go to work by bus."),
                v("evening", "/ˈiːvnɪŋ/", "The later part of the day", "noun", "Beginner", "Routine", "I relax in the evening."),
                v("sleep", "/sliːp/", "To rest with eyes closed", "verb", "Beginner", "Routine", "I sleep at ten o'clock."),
            ],
            ["I wake up at seven.", "I eat breakfast every day.", "I go to work by bus.", "I relax in the evening.", "I sleep at ten o'clock."],
            convo(
                "Good morning! ☀️ Let's talk about your daily routine. What do you do first in the morning?",
                "Describing your daily routine to a friend.",
                "Ask about morning, meals, work, evening, and sleep one at a time."
            )
        ),
        lesson(
            "Food",
            [
                v("rice", "/raɪs/", "A common grain food", "noun", "Beginner", "Food", "I eat rice every day."),
                v("water", "/ˈwɔːtər/", "A clear drink", "noun", "Beginner", "Food", "I drink water often."),
                v("fruit", "/fruːt/", "Food from plants like apples", "noun", "Beginner", "Food", "Fruit is healthy."),
                v("delicious", "/dɪˈlɪʃəs/", "Tasting very good", "adjective", "Beginner", "Food", "This food is delicious."),
                v("hungry", "/ˈhʌŋɡri/", "Wanting to eat", "adjective", "Beginner", "Food", "I am very hungry."),
            ],
            ["I like rice.", "I drink water every day.", "Fruit is healthy.", "This food is delicious.", "I am very hungry now."],
            convo(
                "Hi! 🍎 Let's talk about food. What is your favorite food?",
                "Talking about food with a friend.",
                "Ask about favorite foods, drinks, and meals one at a time."
            )
        ),
        lesson(
            "Restaurant",
            [
                v("menu", "/ˈmɛnjuː/", "A list of food and drinks", "noun", "Beginner", "Restaurant", "Can I see the menu?"),
                v("waiter", "/ˈweɪtər/", "A person who serves food", "noun", "Beginner", "Restaurant", "The waiter is polite."),
                v("order", "/ˈɔːrdər/", "To ask for food", "verb", "Beginner", "Restaurant", "I would like to order pasta."),
                v("bill", "/bɪl/", "The paper showing the price", "noun", "Beginner", "Restaurant", "Can I have the bill?"),
                v("reservation", "/ˌrɛzərˈveɪʃən/", "A saved table at a restaurant", "noun", "Beginner", "Restaurant", "I have a reservation."),
            ],
            ["Can I see the menu?", "I'd like a table for two.", "The waiter is very polite.", "I would like to order pasta.", "Can I have the bill?"],
            convo(
                "Welcome to Lingora Restaurant! 🍝 How many people are in your party today?",
                "Ordering food at a restaurant with a waiter.",
                "Act as a friendly waiter. Ask about table size, drinks, order, and the bill one at a time."
            )
        ),
        lesson(
            "Shopping",
            [
                v("buy", "/baɪ/", "To get something with money", "verb", "Beginner", "Shopping", "I want to buy a shirt."),
                v("price", "/praɪs/", "The cost of something", "noun", "Beginner", "Shopping", "What is the price?"),
                v("cheap", "/tʃiːp/", "Low in cost", "adjective", "Beginner", "Shopping", "This bag is cheap."),
                v("expensive", "/ɪkˈspɛnsɪv/", "High in cost", "adjective", "Beginner", "Shopping", "That watch is expensive."),
                v("size", "/saɪz/", "How big or small something is", "noun", "Beginner", "Shopping", "Do you have a smaller size?"),
            ],
            ["I want to buy a shirt.", "What is the price?", "This is too expensive.", "Do you have a smaller size?", "I will take this one."],
            convo(
                "Hello! Welcome to our store. 🛍️ What are you looking for today?",
                "Shopping for clothes at a store with a shop assistant.",
                "Act as a shop assistant. Ask what the customer wants, size, color, and price one at a time."
            )
        ),
        lesson(
            "Travel",
            [
                v("ticket", "/ˈtɪkɪt/", "A paper to travel", "noun", "Beginner", "Travel", "I bought a train ticket."),
                v("airport", "/ˈɛrpɔːrt/", "A place where planes fly", "noun", "Beginner", "Travel", "The airport is busy."),
                v("passport", "/ˈpæspɔːrt/", "A book for travel between countries", "noun", "Beginner", "Travel", "Show me your passport."),
                v("luggage", "/ˈlʌɡɪdʒ/", "Bags for travel", "noun", "Beginner", "Travel", "My luggage is heavy."),
                v("arrive", "/əˈraɪv/", "To reach a place", "verb", "Beginner", "Travel", "We arrive at noon."),
            ],
            ["I need a ticket.", "Where is the airport?", "Here is my passport.", "My luggage is heavy.", "We arrive at noon."],
            convo(
                "Hello! ✈️ Welcome to the airport. Where are you flying today?",
                "Checking in at the airport for a flight.",
                "Act as an airport check-in agent. Ask about destination, passport, luggage, and seat one at a time."
            )
        ),
        lesson(
            "School",
            [
                v("teacher", "/ˈtiːtʃər/", "A person who teaches", "noun", "Beginner", "School", "My teacher is kind."),
                v("class", "/klæs/", "A group learning together", "noun", "Beginner", "School", "I have English class today."),
                v("book", "/bʊk/", "Pages with words to read", "noun", "Beginner", "School", "Open your book."),
                v("homework", "/ˈhoʊmwɜːrk/", "Work to do at home", "noun", "Beginner", "School", "I finished my homework."),
                v("learn", "/lɜːrn/", "To get knowledge", "verb", "Beginner", "School", "I learn English every day."),
            ],
            ["My teacher is kind.", "I have English class today.", "Open your book.", "I finished my homework.", "I learn English every day."],
            convo(
                "Hi! 📚 Let's talk about school. What is your favorite subject?",
                "Talking about school with a classmate.",
                "Ask about subjects, teachers, homework, and books one at a time."
            )
        ),
        lesson(
            "Friends",
            [
                v("friend", "/frɛnd/", "A person you like and know well", "noun", "Beginner", "Friends", "She is my best friend."),
                v("play", "/pleɪ/", "To do something fun", "verb", "Beginner", "Friends", "We play football."),
                v("happy", "/ˈhæpi/", "Feeling good", "adjective", "Beginner", "Friends", "I am happy today."),
                v("together", "/təˈɡɛðər/", "With each other", "adverb", "Beginner", "Friends", "We walk together."),
                v("fun", "/fʌn/", "Something enjoyable", "noun", "Beginner", "Friends", "We had a lot of fun."),
            ],
            ["She is my best friend.", "We play football.", "I am happy today.", "We walk together.", "We had a lot of fun."],
            convo(
                "Hey! 👋 Let's talk about friends. Tell me about your best friend.",
                "Talking about your friends with a new classmate.",
                "Ask about friends, activities, and fun times one at a time."
            )
        ),
        lesson(
            "Weather",
            [
                v("sunny", "/ˈsʌni/", "Bright with sun", "adjective", "Beginner", "Weather", "It is sunny today."),
                v("rainy", "/ˈreɪni/", "With rain falling", "adjective", "Beginner", "Weather", "It is rainy outside."),
                v("cold", "/koʊld/", "Low in temperature", "adjective", "Beginner", "Weather", "It is cold in winter."),
                v("hot", "/hɒt/", "High in temperature", "adjective", "Beginner", "Weather", "It is hot today."),
                v("windy", "/ˈwɪndi/", "With strong wind", "adjective", "Beginner", "Weather", "It is windy this morning."),
            ],
            ["It is sunny today.", "It is rainy outside.", "It is cold in winter.", "It is hot today.", "It is windy this morning."],
            convo(
                "Hello! ☀️ Let's talk about the weather. What is the weather like today?",
                "Talking about the weather with a friend.",
                "Ask about today's weather, favorite weather, and seasons one at a time."
            )
        ),
        lesson(
            "Health",
            [
                v("doctor", "/ˈdɒktər/", "A person who treats sick people", "noun", "Beginner", "Health", "I will see a doctor."),
                v("sick", "/sɪk/", "Not feeling well", "adjective", "Beginner", "Health", "I feel sick today."),
                v("medicine", "/ˈmɛdsən/", "Something to help you get better", "noun", "Beginner", "Health", "Take your medicine."),
                v("rest", "/rɛst/", "To relax and not work", "verb", "Beginner", "Health", "You need to rest."),
                v("healthy", "/ˈhɛlθi/", "In good health", "adjective", "Beginner", "Health", "I want to stay healthy."),
            ],
            ["I will see a doctor.", "I feel sick today.", "Take your medicine.", "You need to rest.", "I want to stay healthy."],
            convo(
                "Hello! 🩺 How are you feeling today? Are you well?",
                "Visiting a doctor and describing how you feel.",
                "Act as a friendly doctor. Ask about symptoms, rest, and medicine one at a time."
            )
        ),
        lesson(
            "Hobbies",
            [
                v("hobby", "/ˈhɒbi/", "An activity for fun", "noun", "Beginner", "Hobbies", "My hobby is reading."),
                v("read", "/riːd/", "To look at words in a book", "verb", "Beginner", "Hobbies", "I read every night."),
                v("music", "/ˈmjuːzɪk/", "Sounds that are pleasant", "noun", "Beginner", "Hobbies", "I love music."),
                v("draw", "/drɔː/", "To make pictures with a pen", "verb", "Beginner", "Hobbies", "I like to draw."),
                v("sport", "/spɔːrt/", "A game like football", "noun", "Beginner", "Hobbies", "My favorite sport is cricket."),
            ],
            ["My hobby is reading.", "I read every night.", "I love music.", "I like to draw.", "My favorite sport is cricket."],
            convo(
                "Hi! 🎨 Let's talk about hobbies. What do you like to do for fun?",
                "Talking about hobbies with a new friend.",
                "Ask about hobbies, music, sports, and free time one at a time."
            )
        ),
        lesson(
            "Technology",
            [
                v("phone", "/foʊn/", "A device to call people", "noun", "Beginner", "Technology", "My phone is new."),
                v("computer", "/kəmˈpjuːtər/", "A machine for work and games", "noun", "Beginner", "Technology", "I use a computer daily."),
                v("internet", "/ˈɪntərnɛt/", "The world wide web", "noun", "Beginner", "Technology", "The internet is fast."),
                v("app", "/æp/", "A program on a phone", "noun", "Beginner", "Technology", "This app is useful."),
                v("email", "/ˈiːmeɪl/", "A message sent online", "noun", "Beginner", "Technology", "I will send an email."),
            ],
            ["My phone is new.", "I use a computer daily.", "The internet is fast.", "This app is useful.", "I will send an email."],
            convo(
                "Hello! 📱 Let's talk about technology. What device do you use the most?",
                "Talking about technology with a friend.",
                "Ask about phones, computers, apps, and the internet one at a time."
            )
        ),
        lesson(
            "Daily Conversation",
            [
                v("today", "/təˈdeɪ/", "This day", "adverb", "Beginner", "Conversation", "Today is a good day."),
                v("tomorrow", "/təˈmɒroʊ/", "The day after today", "adverb", "Beginner", "Conversation", "See you tomorrow."),
                v("sorry", "/ˈsɒri/", "A word to apologize", "interjection", "Beginner", "Conversation", "I am sorry."),
                v("okay", "/oʊˈkeɪ/", "Fine or good", "adjective", "Beginner", "Conversation", "That is okay."),
                v("really", "/ˈrɪəli/", "Truly or in fact", "adverb", "Beginner", "Conversation", "Really? That is great."),
            ],
            ["Today is a good day.", "See you tomorrow.", "I am sorry.", "That is okay.", "Really? That is great."],
            convo(
                "Hi! 😊 Let's have a friendly chat. How is your day going?",
                "A friendly daily conversation with a neighbor.",
                "Have a natural, friendly chat. Ask about today, plans, and feelings one at a time."
            )
        ),
    ],

    intermediate: [
        lesson(
            "Travel Problems",
            [
                v("delay", "/dɪˈleɪ/", "When something is late", "noun", "Intermediate", "Travel", "There is a long delay."),
                v("lost", "/lɒst/", "Unable to find the way", "adjective", "Intermediate", "Travel", "I am lost in the city."),
                v("cancel", "/ˈkænsəl/", "To stop a plan", "verb", "Intermediate", "Travel", "They cancelled my flight."),
                v("miss", "/mɪs/", "To fail to catch", "verb", "Intermediate", "Travel", "I missed the train."),
                v("help", "/hɛlp/", "To assist someone", "verb", "Intermediate", "Travel", "Can you help me?"),
            ],
            ["My flight is delayed.", "I think I am lost.", "They cancelled my flight.", "I missed the train.", "Can you help me, please?"],
            convo(
                "Oh no! 😟 I heard your flight was delayed. What happened?",
                "Dealing with travel problems at an airport help desk.",
                "Act as a helpful airport staff member. Ask about the problem, documents, and next steps one at a time."
            )
        ),
        lesson(
            "Phone Calls",
            [
                v("call", "/kɔːl/", "To phone someone", "verb", "Intermediate", "Phone", "I will call you later."),
                v("message", "/ˈmɛsɪdʒ/", "A short piece of information", "noun", "Intermediate", "Phone", "Leave a message."),
                v("hold", "/hoʊld/", "To wait on the phone", "verb", "Intermediate", "Phone", "Please hold the line."),
                v("contact", "/ˈkɒntækt/", "To reach someone", "verb", "Intermediate", "Phone", "How can I contact you?"),
                v("available", "/əˈveɪləbəl/", "Free to talk", "adjective", "Intermediate", "Phone", "Are you available now?"),
            ],
            ["I will call you later.", "Can I leave a message?", "Please hold the line.", "How can I contact you?", "Are you available now?"],
            convo(
                "Hello, this is Lingora Office. 📞 How can I help you today?",
                "Making a phone call to an office.",
                "Act as a receptionist. Ask who they want to speak to, the message, and contact details one at a time."
            )
        ),
        lesson(
            "Office Communication",
            [
                v("meeting", "/ˈmiːtɪŋ/", "A group discussion", "noun", "Intermediate", "Office", "The meeting starts at ten."),
                v("report", "/rɪˈpɔːrt/", "A written summary of work", "noun", "Intermediate", "Office", "I finished the report."),
                v("deadline", "/ˈdɛdlaɪn/", "The time something must be done", "noun", "Intermediate", "Office", "The deadline is Friday."),
                v("colleague", "/ˈkɒliːɡ/", "A person you work with", "noun", "Intermediate", "Office", "My colleague is helpful."),
                v("schedule", "/ˈʃɛdʒuːl/", "A plan of times", "noun", "Intermediate", "Office", "Check the schedule."),
            ],
            ["The meeting starts at ten.", "I finished the report.", "The deadline is Friday.", "My colleague is helpful.", "Check the schedule."],
            convo(
                "Good morning! 💼 Welcome to the office. Did you finish the report?",
                "Talking with a colleague about office work.",
                "Act as a colleague. Ask about reports, meetings, deadlines, and schedules one at a time."
            )
        ),
        lesson(
            "Business English",
            [
                v("client", "/ˈklaɪənt/", "A customer for a business", "noun", "Intermediate", "Business", "The client is happy."),
                v("project", "/ˈprɒdʒɛkt/", "A piece of work", "noun", "Intermediate", "Business", "Our project is on track."),
                v("budget", "/ˈbʌdʒɪt/", "Money planned for spending", "noun", "Intermediate", "Business", "We are under budget."),
                v("profit", "/ˈprɒfɪt/", "Money earned after costs", "noun", "Intermediate", "Business", "Profit increased this year."),
                v("strategy", "/ˈstrætədʒi/", "A plan to reach a goal", "noun", "Intermediate", "Business", "Our strategy is clear."),
            ],
            ["The client is happy.", "Our project is on track.", "We are under budget.", "Profit increased this year.", "Our strategy is clear."],
            convo(
                "Hello! 📊 Let's talk about business. How is your project going?",
                "Discussing a business project with a manager.",
                "Act as a manager. Ask about projects, clients, budget, and strategy one at a time."
            )
        ),
        lesson(
            "Giving Opinions",
            [
                v("think", "/θɪŋk/", "To have an idea or opinion", "verb", "Intermediate", "Opinions", "I think this is a good idea."),
                v("believe", "/bɪˈliːv/", "To feel sure about something", "verb", "Intermediate", "Opinions", "I believe we can do it."),
                v("agree", "/əˈɡriː/", "To share the same view", "verb", "Intermediate", "Opinions", "I agree with you."),
                v("disagree", "/ˌdɪsəˈɡriː/", "To have a different view", "verb", "Intermediate", "Opinions", "I disagree politely."),
                v("opinion", "/əˈpɪnjən/", "What someone thinks", "noun", "Intermediate", "Opinions", "What is your opinion?"),
            ],
            ["I think this is a good idea.", "I believe we can do it.", "I agree with you.", "I disagree politely.", "What is your opinion?"],
            convo(
                "Hi! 💭 Let's share opinions. What do you think about working from home?",
                "Discussing opinions about a topic with a friend.",
                "Ask for opinions, agree or disagree politely, and share your view one at a time."
            )
        ),
        lesson(
            "Storytelling",
            [
                v("story", "/ˈstɔːri/", "A told or written tale", "noun", "Intermediate", "Storytelling", "Tell me a story."),
                v("begin", "/bɪˈɡɪn/", "To start", "verb", "Intermediate", "Storytelling", "Let's begin the story."),
                v("suddenly", "/ˈsʌdənli/", "Quickly and unexpectedly", "adverb", "Intermediate", "Storytelling", "Suddenly, it rained."),
                v("finally", "/ˈfaɪnəli/", "At the end", "adverb", "Intermediate", "Storytelling", "Finally, they won."),
                v("remember", "/rɪˈmɛmbər/", "To keep in mind", "verb", "Intermediate", "Storytelling", "I remember that day."),
            ],
            ["Tell me a story.", "Let's begin the story.", "Suddenly, it rained.", "Finally, they won.", "I remember that day."],
            convo(
                "Hello! 📖 I love stories. Can you tell me a short story about your day?",
                "Telling a short story to a friend.",
                "Encourage the learner to tell a story. Ask about the beginning, middle, and end one at a time."
            )
        ),
        lesson(
            "Directions",
            [
                v("left", "/lɛft/", "The opposite of right", "noun", "Intermediate", "Directions", "Turn left at the corner."),
                v("right", "/raɪt/", "The opposite of left", "noun", "Intermediate", "Directions", "Go right at the light."),
                v("straight", "/streɪt/", "Directly ahead", "adverb", "Intermediate", "Directions", "Go straight ahead."),
                v("near", "/nɪr/", "Close to", "preposition", "Intermediate", "Directions", "The bank is near here."),
                v("far", "/fɑːr/", "A long distance away", "adjective", "Intermediate", "Directions", "The station is far."),
            ],
            ["Turn left at the corner.", "Go right at the light.", "Go straight ahead.", "The bank is near here.", "The station is far."],
            convo(
                "Excuse me! 🗺️ Can you help me? How do I get to the train station?",
                "Asking for and giving directions on the street.",
                "Act as a friendly local. Ask where the learner wants to go and give directions one step at a time."
            )
        ),
        lesson(
            "Hotel",
            [
                v("check-in", "/tʃɛk ɪn/", "To register at a hotel", "noun", "Intermediate", "Hotel", "Check-in is at two o'clock."),
                v("room", "/ruːm/", "A place to sleep in a hotel", "noun", "Intermediate", "Hotel", "My room is on the third floor."),
                v("key", "/kiː/", "Used to open a door", "noun", "Intermediate", "Hotel", "Here is your room key."),
                v("breakfast", "/ˈbrɛkfəst/", "Morning meal at a hotel", "noun", "Intermediate", "Hotel", "Breakfast is included."),
                v("checkout", "/tʃɛk aʊt/", "To leave a hotel", "noun", "Intermediate", "Hotel", "Checkout is at eleven."),
            ],
            ["Check-in is at two o'clock.", "My room is on the third floor.", "Here is your room key.", "Breakfast is included.", "Checkout is at eleven."],
            convo(
                "Welcome to Grand Hotel! 🏨 Do you have a reservation with us?",
                "Checking in at a hotel reception.",
                "Act as a hotel receptionist. Ask about reservation, room type, breakfast, and checkout one at a time."
            )
        ),
        lesson(
            "Airport",
            [
                v("boarding", "/ˈbɔːrdɪŋ/", "Getting on a plane", "noun", "Intermediate", "Airport", "Boarding starts now."),
                v("gate", "/ɡeɪt/", "The door to a plane", "noun", "Intermediate", "Airport", "My gate is number five."),
                v("security", "/sɪˈkjʊərəti/", "Safety checks at airport", "noun", "Intermediate", "Airport", "Go through security first."),
                v("departure", "/dɪˈpɑːrtʃər/", "Leaving on a flight", "noun", "Intermediate", "Airport", "Departure is on time."),
                v("arrival", "/əˈraɪvəl/", "Reaching a destination", "noun", "Intermediate", "Airport", "The arrival was smooth."),
            ],
            ["Boarding starts now.", "My gate is number five.", "Go through security first.", "Departure is on time.", "The arrival was smooth."],
            convo(
                "Welcome to the airport! ✈️ May I see your passport and ticket, please?",
                "Going through airport security and boarding.",
                "Act as airport staff. Ask about passport, gate, security, and boarding one at a time."
            )
        ),
        lesson(
            "Meeting People",
            [
                v("introduce", "/ˌɪntrəˈduːs/", "To present someone", "verb", "Intermediate", "Meeting", "Let me introduce my friend."),
                v("pleased", "/pliːzd/", "Happy to meet someone", "adjective", "Intermediate", "Meeting", "Pleased to meet you."),
                v("join", "/dʒɔɪn/", "To come together with", "verb", "Intermediate", "Meeting", "Can I join you?"),
                v("nice", "/naɪs/", "Pleasant or kind", "adjective", "Intermediate", "Meeting", "It is nice to meet you."),
                v("acquaintance", "/əˈkweɪntəns/", "A person you know a little", "noun", "Intermediate", "Meeting", "He is an acquaintance."),
            ],
            ["Let me introduce my friend.", "Pleased to meet you.", "Can I join you?", "It is nice to meet you.", "He is an old acquaintance."],
            convo(
                "Hi! 👋 I don't think we've met. I'm Alex. What's your name?",
                "Meeting new people at a social event.",
                "Act as a friendly stranger. Ask about names, jobs, and interests one at a time."
            )
        ),
        lesson(
            "Problem Solving",
            [
                v("problem", "/ˈprɒbləm/", "A difficulty to solve", "noun", "Intermediate", "Problem Solving", "We have a problem."),
                v("solution", "/səˈluːʃən/", "A way to fix a problem", "noun", "Intermediate", "Problem Solving", "I have a solution."),
                v("fix", "/fɪks/", "To repair something", "verb", "Intermediate", "Problem Solving", "Can you fix this?"),
                v("try", "/traɪ/", "To attempt something", "verb", "Intermediate", "Problem Solving", "Let's try again."),
                v("decide", "/dɪˈsaɪd/", "To make a choice", "verb", "Intermediate", "Problem Solving", "We must decide now."),
            ],
            ["We have a problem.", "I have a solution.", "Can you fix this?", "Let's try again.", "We must decide now."],
            convo(
                "Hmm, we have a problem. 🤔 The printer is not working. What should we do?",
                "Solving a problem with a coworker.",
                "Act as a coworker. Discuss the problem, suggest solutions, and decide together one at a time."
            )
        ),
        lesson(
            "Job Interview",
            [
                v("experience", "/ɪkˈspɪəriəns/", "Work you have done before", "noun", "Intermediate", "Interview", "I have three years of experience."),
                v("strength", "/strɛŋθ/", "Something you are good at", "noun", "Intermediate", "Interview", "My strength is teamwork."),
                v("weakness", "/ˈwiːknəs/", "Something to improve", "noun", "Intermediate", "Interview", "My weakness is public speaking."),
                v("salary", "/ˈsæləri/", "Money paid for work", "noun", "Intermediate", "Interview", "What is the salary?"),
                v("hire", "/ˈhaɪər/", "To give someone a job", "verb", "Intermediate", "Interview", "When can you hire me?"),
            ],
            ["I have three years of experience.", "My strength is teamwork.", "My weakness is public speaking.", "What is the salary?", "When can you start?"],
            convo(
                "Good morning! 📋 Welcome to the interview. Please tell me about yourself.",
                "A job interview with an HR manager.",
                "Act as an HR interviewer. Ask about experience, strengths, weaknesses, and salary one at a time."
            )
        ),
        lesson(
            "Public Speaking",
            [
                v("audience", "/ˈɔːdiəns/", "People listening to a talk", "noun", "Intermediate", "Speaking", "The audience is large."),
                v("speech", "/spiːtʃ/", "A talk to many people", "noun", "Intermediate", "Speaking", "I gave a short speech."),
                v("confident", "/ˈkɒnfɪdənt/", "Sure of yourself", "adjective", "Intermediate", "Speaking", "I feel confident today."),
                v("clear", "/klɪr/", "Easy to understand", "adjective", "Intermediate", "Speaking", "Speak clearly."),
                v("prepare", "/prɪˈpɛər/", "To get ready", "verb", "Intermediate", "Speaking", "I prepare my speech."),
            ],
            ["The audience is large.", "I gave a short speech.", "I feel confident today.", "Speak clearly and slowly.", "I prepare my speech well."],
            convo(
                "Hello! 🎤 Let's practice public speaking. What will your speech be about?",
                "Preparing and practicing a short speech.",
                "Act as a speaking coach. Ask about the topic, audience, and key points one at a time."
            )
        ),
        lesson(
            "Debate",
            [
                v("argue", "/ˈɑːrɡjuː/", "To give reasons for a view", "verb", "Intermediate", "Debate", "I will argue my point."),
                v("evidence", "/ˈɛvɪdəns/", "Proof to support a view", "noun", "Intermediate", "Debate", "Show me the evidence."),
                v("point", "/pɔɪnt/", "An idea in an argument", "noun", "Intermediate", "Debate", "That is a good point."),
                v("counter", "/ˈkaʊntər/", "To oppose an argument", "verb", "Intermediate", "Debate", "I will counter that."),
                v("convince", "/kənˈvɪns/", "To make someone agree", "verb", "Intermediate", "Debate", "Can you convince me?"),
            ],
            ["I will argue my point.", "Show me the evidence.", "That is a good point.", "I will counter that.", "Can you convince me?"],
            convo(
                "Welcome to our debate! 🗣️ The topic is: should students wear uniforms? What is your view?",
                "A friendly debate on a topic.",
                "Act as a debate partner. Ask for points, evidence, and counter-arguments one at a time."
            )
        ),
        lesson(
            "Conversation Practice",
            [
                v("discuss", "/dɪˈskʌs/", "To talk about something", "verb", "Intermediate", "Conversation", "Let's discuss the plan."),
                v("suggest", "/səˈdʒɛst/", "To offer an idea", "verb", "Intermediate", "Conversation", "I suggest we leave early."),
                v("explain", "/ɪkˈspleɪn/", "To make something clear", "verb", "Intermediate", "Conversation", "Can you explain again?"),
                v("understand", "/ˌʌndərˈstænd/", "To know the meaning", "verb", "Intermediate", "Conversation", "I understand now."),
                v("interesting", "/ˈɪntrəstɪŋ/", "Holding attention", "adjective", "Intermediate", "Conversation", "That is interesting."),
            ],
            ["Let's discuss the plan.", "I suggest we leave early.", "Can you explain again?", "I understand now.", "That is very interesting."],
            convo(
                "Hi! 😊 Let's have a conversation. What would you like to discuss today?",
                "A free conversation practice with a friend.",
                "Have a natural conversation. Ask about topics, suggestions, and explanations one at a time."
            )
        ),
    ],

    advanced: [
        lesson(
            "Negotiation",
            [
                v("negotiate", "/nɪˈɡoʊʃieɪt/", "To discuss to reach an agreement", "verb", "Advanced", "Negotiation", "We need to negotiate the price."),
                v("offer", "/ˈɒfər/", "To present for acceptance", "verb", "Advanced", "Negotiation", "I can offer a discount."),
                v("compromise", "/ˈkɒmprəmaɪz/", "A middle-ground agreement", "noun", "Advanced", "Negotiation", "Let's find a compromise."),
                v("terms", "/tɜːrmz/", "Conditions of an agreement", "noun", "Advanced", "Negotiation", "The terms are fair."),
                v("agreement", "/əˈɡriːmənt/", "A shared decision", "noun", "Advanced", "Negotiation", "We reached an agreement."),
            ],
            ["We need to negotiate the price.", "I can offer a ten percent discount.", "Let's find a compromise.", "The terms are fair.", "We reached an agreement."],
            convo(
                "Good afternoon. 🤝 Let's negotiate. Our price is higher than your offer. What can you suggest?",
                "Negotiating a business deal with a partner.",
                "Act as a business partner. Discuss price, terms, offers, and compromise one at a time."
            )
        ),
        lesson(
            "Leadership",
            [
                v("lead", "/liːd/", "To guide a group", "verb", "Advanced", "Leadership", "I lead the team."),
                v("vision", "/ˈvɪʒən/", "A clear idea of the future", "noun", "Advanced", "Leadership", "Our vision is clear."),
                v("motivate", "/ˈmoʊtɪveɪt/", "To inspire effort", "verb", "Advanced", "Leadership", "I motivate my team."),
                v("delegate", "/ˈdɛlɪɡeɪt/", "To give tasks to others", "verb", "Advanced", "Leadership", "I delegate tasks fairly."),
                v("decision", "/dɪˈsɪʒən/", "A choice made", "noun", "Advanced", "Leadership", "I made a tough decision."),
            ],
            ["I lead the team with confidence.", "Our vision is clear.", "I motivate my team daily.", "I delegate tasks fairly.", "I made a tough decision."],
            convo(
                "Hello! 👔 As a leader, how do you motivate your team when a project is behind schedule?",
                "Discussing leadership challenges with a mentor.",
                "Act as a leadership mentor. Ask about vision, motivation, delegation, and decisions one at a time."
            )
        ),
        lesson(
            "Presentation",
            [
                v("present", "/prɪˈzɛnt/", "To show information to others", "verb", "Advanced", "Presentation", "I will present the results."),
                v("slide", "/slaɪd/", "A page in a presentation", "noun", "Advanced", "Presentation", "The next slide shows data."),
                v("data", "/ˈdeɪtə/", "Facts and numbers", "noun", "Advanced", "Presentation", "The data is clear."),
                v("summary", "/ˈsʌməri/", "A short overview", "noun", "Advanced", "Presentation", "Here is a quick summary."),
                v("question", "/ˈkwɛstʃən/", "Something asked", "noun", "Advanced", "Presentation", "Any questions so far?"),
            ],
            ["I will present the results.", "The next slide shows the data.", "The data is clear.", "Here is a quick summary.", "Are there any questions?"],
            convo(
                "Welcome! 📊 Let's practice your presentation. Please start with your opening.",
                "Giving a professional presentation and answering questions.",
                "Act as an audience member. Ask for the opening, data, summary, and questions one at a time."
            )
        ),
        lesson(
            "Customer Communication",
            [
                v("customer", "/ˈkʌstəmər/", "A person who buys", "noun", "Advanced", "Customer", "The customer is happy."),
                v("service", "/ˈsɜːrvɪs/", "Help given to customers", "noun", "Advanced", "Customer", "Our service is fast."),
                v("complaint", "/kəmˈpleɪnt/", "A problem reported", "noun", "Advanced", "Customer", "I handled the complaint."),
                v("refund", "/ˈriːfʌnd/", "Money returned", "noun", "Advanced", "Customer", "We issued a refund."),
                v("satisfaction", "/ˌsætɪsˈfækʃən/", "Feeling happy with service", "noun", "Advanced", "Customer", "Customer satisfaction is high."),
            ],
            ["The customer is happy.", "Our service is fast.", "I handled the complaint.", "We issued a refund.", "Customer satisfaction is high."],
            convo(
                "Hello, customer service. 🎧 I'm calling about a problem with my order. Can you help?",
                "Handling a customer service call.",
                "Act as a customer with a complaint. Ask about the problem, solution, refund, and satisfaction one at a time."
            )
        ),
        lesson(
            "Professional Meetings",
            [
                v("agenda", "/əˈdʒɛndə/", "A list of topics to discuss", "noun", "Advanced", "Meetings", "Let's review the agenda."),
                v("minutes", "/ˈmɪnɪts/", "Notes from a meeting", "noun", "Advanced", "Meetings", "I will take the minutes."),
                v("action", "/ˈækʃən/", "Something to do", "noun", "Advanced", "Meetings", "What is the next action?"),
                v("follow-up", "/ˈfɒloʊ ʌp/", "A later check on progress", "noun", "Advanced", "Meetings", "We need a follow-up."),
                v("consensus", "/kənˈsɛnsəs/", "General agreement", "noun", "Advanced", "Meetings", "We reached consensus."),
            ],
            ["Let's review the agenda.", "I will take the minutes.", "What is the next action?", "We need a follow-up.", "We reached consensus."],
            convo(
                "Good morning, team. 📅 Let's start the meeting. Has everyone reviewed the agenda?",
                "Running a professional team meeting.",
                "Act as a team member. Discuss agenda, minutes, actions, and follow-up one at a time."
            )
        ),
        lesson(
            "Networking",
            [
                v("connect", "/kəˈnɛkt/", "To build a relationship", "verb", "Advanced", "Networking", "Let's connect on LinkedIn."),
                v("network", "/ˈnɛtwɜːrk/", "A group of contacts", "noun", "Advanced", "Networking", "Build your network."),
                v("introduce", "/ˌɪntrəˈduːs/", "To present someone", "verb", "Advanced", "Networking", "Let me introduce myself."),
                v("opportunity", "/ˌɒpərˈtuːnəti/", "A chance to do something", "noun", "Advanced", "Networking", "This is a great opportunity."),
                v("contact", "/ˈkɒntækt/", "A person you know", "noun", "Advanced", "Networking", "He is a useful contact."),
            ],
            ["Let's connect on LinkedIn.", "Build your network over time.", "Let me introduce myself.", "This is a great opportunity.", "He is a useful contact."],
            convo(
                "Hi! 🤝 Great event, isn't it? I work in marketing. What do you do?",
                "Networking at a professional event.",
                "Act as a professional at an event. Ask about jobs, connections, and opportunities one at a time."
            )
        ),
        lesson(
            "Conflict Resolution",
            [
                v("conflict", "/ˈkɒnflɪkt/", "A disagreement", "noun", "Advanced", "Conflict", "We have a conflict."),
                v("resolve", "/rɪˈzɒlv/", "To solve a problem", "verb", "Advanced", "Conflict", "Let's resolve this calmly."),
                v("listen", "/ˈlɪsən/", "To hear and understand", "verb", "Advanced", "Conflict", "I will listen to you."),
                v("respect", "/rɪˈspɛkt/", "To value someone", "verb", "Advanced", "Conflict", "I respect your view."),
                v("mediate", "/ˈmiːdieɪt/", "To help two sides agree", "verb", "Advanced", "Conflict", "I can mediate the dispute."),
            ],
            ["We have a conflict to resolve.", "Let's resolve this calmly.", "I will listen to you.", "I respect your view.", "I can mediate the dispute."],
            convo(
                "I understand we have a conflict. 🕊️ Can you tell me your side of the story?",
                "Resolving a conflict between two coworkers.",
                "Act as a mediator. Ask about each side, listen, and find common ground one at a time."
            )
        ),
        lesson(
            "Advanced Interviews",
            [
                v("qualify", "/ˈkwɒlɪfaɪ/", "To meet the requirements", "verb", "Advanced", "Interview", "I qualify for this role."),
                v("achieve", "/əˈtʃiːv/", "To reach a goal", "verb", "Advanced", "Interview", "I achieved my targets."),
                v("challenge", "/ˈtʃælɪndʒ/", "A difficult task", "noun", "Advanced", "Interview", "I enjoy a challenge."),
                v("contribute", "/kənˈtrɪbjuːt/", "To add value", "verb", "Advanced", "Interview", "I can contribute to growth."),
                v("goal", "/ɡoʊl/", "Something you aim for", "noun", "Advanced", "Interview", "My goal is to lead a team."),
            ],
            ["I qualify for this role.", "I achieved my targets last year.", "I enjoy a challenge.", "I can contribute to growth.", "My goal is to lead a team."],
            convo(
                "Welcome to the advanced interview. 🎯 Tell me about a challenge you faced and how you handled it.",
                "An advanced job interview with a senior manager.",
                "Act as a senior interviewer. Ask about challenges, achievements, contributions, and goals one at a time."
            )
        ),
        lesson(
            "Business Pitch",
            [
                v("pitch", "/pɪtʃ/", "A short persuasive talk", "noun", "Advanced", "Pitch", "I will give my pitch."),
                v("market", "/ˈmɑːrkɪt/", "Buyers for a product", "noun", "Advanced", "Pitch", "The market is growing."),
                v("revenue", "/ˈrɛvənuː/", "Money from sales", "noun", "Advanced", "Pitch", "Our revenue is rising."),
                v("invest", "/ɪnˈvɛst/", "To put money into something", "verb", "Advanced", "Pitch", "We invite you to invest."),
                v("growth", "/ɡroʊθ/", "Increase in size", "noun", "Advanced", "Pitch", "Our growth is strong."),
            ],
            ["I will give my pitch now.", "The market is growing fast.", "Our revenue is rising.", "We invite you to invest.", "Our growth is strong."],
            convo(
                "Hello! 💼 I'm an investor. You have two minutes. Please pitch your business.",
                "Pitching a business idea to an investor.",
                "Act as an investor. Ask about the product, market, revenue, and growth one at a time."
            )
        ),
        lesson(
            "Academic Discussion",
            [
                v("research", "/rɪˈsɜːrtʃ/", "Study to find new facts", "noun", "Advanced", "Academic", "My research is detailed."),
                v("theory", "/ˈθɪəri/", "An idea explaining something", "noun", "Advanced", "Academic", "This theory is interesting."),
                v("analyze", "/ˈænəlaɪz/", "To study carefully", "verb", "Advanced", "Academic", "Let's analyze the data."),
                v("conclude", "/kənˈkluːd/", "To reach a decision", "verb", "Advanced", "Academic", "I conclude that it works."),
                v("evidence", "/ˈɛvɪdəns/", "Proof for a claim", "noun", "Advanced", "Academic", "The evidence is strong."),
            ],
            ["My research is detailed.", "This theory is interesting.", "Let's analyze the data.", "I conclude that it works.", "The evidence is strong."],
            convo(
                "Welcome to our academic discussion. 🎓 What does your research focus on?",
                "An academic discussion with a professor.",
                "Act as a professor. Ask about research, theory, analysis, and evidence one at a time."
            )
        ),
        lesson(
            "Critical Thinking",
            [
                v("evaluate", "/ɪˈvæljueɪt/", "To judge the value", "verb", "Advanced", "Thinking", "I will evaluate the options."),
                v("assume", "/əˈsuːm/", "To take as true without proof", "verb", "Advanced", "Thinking", "Don't assume too much."),
                v("reason", "/ˈriːzən/", "To think logically", "verb", "Advanced", "Thinking", "Let's reason this out."),
                v("perspective", "/pərˈspɛktɪv/", "A point of view", "noun", "Advanced", "Thinking", "That is a new perspective."),
                v("bias", "/ˈbaɪəs/", "Unfair preference", "noun", "Advanced", "Thinking", "Watch out for bias."),
            ],
            ["I will evaluate the options.", "Don't assume too much.", "Let's reason this out.", "That is a new perspective.", "Watch out for bias."],
            convo(
                "Let's think critically. 🧠 What are the strengths and weaknesses of this argument?",
                "A critical thinking discussion with a mentor.",
                "Act as a mentor. Ask about evaluation, assumptions, reasoning, and bias one at a time."
            )
        ),
        lesson(
            "Fluent Conversation",
            [
                v("fluent", "/ˈfluːənt/", "Speaking smoothly and easily", "adjective", "Advanced", "Fluency", "She is fluent in English."),
                v("express", "/ɪkˈsprɛs/", "To show thoughts or feelings", "verb", "Advanced", "Fluency", "I express my ideas clearly."),
                v("flow", "/floʊ/", "Smooth movement of speech", "noun", "Advanced", "Fluency", "Her speech has good flow."),
                v("nuance", "/ˈnjuːɑːns/", "A small difference in meaning", "noun", "Advanced", "Fluency", "I understand the nuance."),
                v("articulate", "/ɑːrˈtɪkjələt/", "To speak clearly", "verb", "Advanced", "Fluency", "He articulates well."),
            ],
            ["She is fluent in English.", "I express my ideas clearly.", "Her speech has good flow.", "I understand the nuance.", "He articulates his thoughts well."],
            convo(
                "Hi! 🌟 Let's have a fluent conversation. What's something you feel strongly about?",
                "A free-flowing conversation on any topic.",
                "Have a natural, fluent conversation. Ask open questions and follow up one at a time."
            )
        ),
        lesson(
            "Idioms",
            [
                v("piece of cake", "/piːs əv keɪk/", "Something very easy", "idiom", "Advanced", "Idioms", "That test was a piece of cake."),
                v("break the ice", "/breɪk ði aɪs/", "To start a conversation", "idiom", "Advanced", "Idioms", "He told a joke to break the ice."),
                v("hit the books", "/hɪt ðə bʊks/", "To study hard", "idiom", "Advanced", "Idioms", "I need to hit the books."),
                v("under the weather", "/ˈʌndər ðə ˈwɛðər/", "Feeling slightly ill", "idiom", "Advanced", "Idioms", "I feel under the weather."),
                v("cost an arm and a leg", "/kɒst ən ɑːrm ənd ə lɛɡ/", "Very expensive", "idiom", "Advanced", "Idioms", "That car cost an arm and a leg."),
            ],
            ["That test was a piece of cake.", "He told a joke to break the ice.", "I need to hit the books tonight.", "I feel under the weather today.", "That car cost an arm and a leg."],
            convo(
                "Hi! 🗣️ Let's practice idioms. Can you use 'a piece of cake' in a sentence?",
                "Practicing English idioms in conversation.",
                "Ask the learner to use idioms in sentences one at a time. Explain meanings if needed."
            )
        ),
        lesson(
            "Natural English",
            [
                v("gonna", "/ˈɡənə/", "Going to (informal)", "auxiliary", "Advanced", "Natural", "I'm gonna leave soon."),
                v("wanna", "/ˈwɒnə/", "Want to (informal)", "auxiliary", "Advanced", "Natural", "I wanna go home."),
                v("kinda", "/ˈkaɪndə/", "Kind of (informal)", "adverb", "Advanced", "Natural", "It's kinda cold today."),
                v("hang out", "/hæŋ aʊt/", "To spend time with", "phrasal verb", "Advanced", "Natural", "Let's hang out later."),
                v("catch up", "/kætʃ ʌp/", "To update each other", "phrasal verb", "Advanced", "Natural", "Let's catch up soon."),
            ],
            ["I'm gonna leave soon.", "I wanna go home now.", "It's kinda cold today.", "Let's hang out later.", "Let's catch up soon."],
            convo(
                "Hey! 😎 Let's practice natural, casual English. What are you gonna do this weekend?",
                "A casual conversation using natural spoken English.",
                "Use natural, casual English. Ask about plans, hangouts, and catching up one at a time."
            )
        ),
        lesson(
            "Free AI Conversation",
            [
                v("topic", "/ˈtɒpɪk/", "A subject of discussion", "noun", "Advanced", "Conversation", "Choose any topic."),
                v("discuss", "/dɪˈskʌs/", "To talk about", "verb", "Advanced", "Conversation", "We can discuss anything."),
                v("share", "/ʃɛər/", "To tell others", "verb", "Advanced", "Conversation", "Share your thoughts."),
                v("explore", "/ɪkˈsplɔːr/", "To look into deeply", "verb", "Advanced", "Conversation", "Let's explore new ideas."),
                v("reflect", "/rɪˈflɛkt/", "To think deeply", "verb", "Advanced", "Conversation", "Take time to reflect."),
            ],
            ["Choose any topic you like.", "We can discuss anything.", "Share your thoughts freely.", "Let's explore new ideas.", "Take time to reflect."],
            convo(
                "Hello! 🌟 This is your free AI conversation. What would you like to talk about today?",
                "A free, open conversation on any topic.",
                "Have a fully open conversation. Let the learner lead. Ask follow-up questions one at a time."
            )
        ),
    ],
};

// Flatten all lessons into a single ordered list with keys.
export const ALL_SPEAKING_LESSONS = (() => {
    const list = [];
    for (const level of SPEAKING_LEVELS) {
        const lessons = SPEAKING_COURSE[level.id] || [];
        lessons.forEach((l, idx) => {
            list.push({
                key: `${level.id}-${idx + 1}`,
                level: level.name,
                levelId: level.id,
                lessonIndex: idx + 1,
                title: l.title,
                vocabulary: l.vocabulary,
                sentences: l.sentences,
                conversation: l.conversation,
            });
        });
    }
    return list;
})();

export const TOTAL_SPEAKING_LESSONS = ALL_SPEAKING_LESSONS.length; // 45

export function getLessonByKey(key) {
    return ALL_SPEAKING_LESSONS.find((l) => l.key === key);
}

export function getLevelById(levelId) {
    return SPEAKING_LEVELS.find((l) => l.id === levelId);
}
