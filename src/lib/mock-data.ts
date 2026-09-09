import { Issue, Article, NewsItem, Author, Category, Media, SiteSettings } from '@/types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    slug: 'law',
    nameTamil: 'சட்டம்',
    nameEnglish: 'Law',
    description: 'உச்ச நீதிமன்றம், சென்னை உயர் நீதிமன்றம் மற்றும் முக்கிய சட்டத் தீர்ப்புகள், சட்டத் திருத்தங்கள்.',
    order: 1,
  },
  {
    id: 'cat-2',
    slug: 'politics',
    nameTamil: 'அரசியல்',
    nameEnglish: 'Politics',
    description: 'தமிழக மற்றும் தேசிய அரசியல் நகர்வுகள், நாடாளுமன்ற விவாதங்கள், தேர்தல் கள நிலவரங்கள்.',
    order: 2,
  },
  {
    id: 'cat-3',
    slug: 'tamil-nadu',
    nameTamil: 'தமிழ்நாடு',
    nameEnglish: 'Tamil Nadu',
    description: 'தமிழக அரசின் கொள்கை முடிவுகள், மாவட்டச் செய்திகள், மக்கள் நலத் திட்டங்கள்.',
    order: 3,
  },
  {
    id: 'cat-4',
    slug: 'india',
    nameTamil: 'இந்தியா',
    nameEnglish: 'India',
    description: 'தேசிய அளவிலான முக்கிய நிகழ்வுகள், ஒன்றிய அரசு அறிவிப்புகள், மாநிலங்களிடையேயான உறவுகள்.',
    order: 4,
  },
  {
    id: 'cat-5',
    slug: 'special-article',
    nameTamil: 'சிறப்புக் கட்டுரை',
    nameEnglish: 'Special Articles',
    description: 'ஆழமான சட்ட ஆய்வுக் கட்டுரைகள், தலையங்கங்கள் மற்றும் நேர்காணல்கள்.',
    order: 5,
  },
];

export const INITIAL_AUTHORS: Author[] = [
  {
    id: 'auth-1',
    name: 'வழக்கறிஞர் கே. எஸ். இளங்கோவன்',
    role: 'முதன்மை ஆசிரியர் (Chief Editor)',
    bio: 'உயர் நீதிமன்ற மூத்த வழக்கறிஞர் மற்றும் அரசியல் சாசன சட்ட நிபுணர். 25 ஆண்டுகளுக்கும் மேலாக சட்ட இதழியலில் பங்களிப்பு.',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    articlesCount: 42,
  },
  {
    id: 'auth-2',
    name: 'முனைவர் இரா. தமிழ்ச்செல்வி',
    role: 'சட்டப் பிரிவு ஆசிரியர்',
    bio: 'சென்னை அம்பேத்கர் சட்டப் பல்கலைக்கழக முன்னாள் பேராசிரியர். உரிமையியல் மற்றும் மனித உரிமை வழக்குகளில் ஆய்வாளர்.',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    articlesCount: 28,
  },
  {
    id: 'auth-3',
    name: 'சு. வெங்கடேசன்',
    role: 'அரசியல் ஆய்வாளர்',
    bio: 'மூத்த நாடாளுமன்ற செய்தியாளர். தமிழக அரசியல் மற்றும் கூட்டாட்சி தத்துவம் குறித்த தொடர் பத்தியாளர்.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    articlesCount: 35,
  },
  {
    id: 'auth-4',
    name: 'அட்வகேட் மா. சக்திவேல்',
    role: 'குற்றவியல் சட்ட ஆலோசகர்',
    bio: 'புதிய பாரதிய நியாய சன்ஹிதா (BNS) சட்டங்கள் மற்றும் குற்றவியல் நடைமுறைச் சட்டங்கள் குறித்த கள ஆய்வாளர்.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    articlesCount: 19,
  },
];

export const INITIAL_ISSUES: Issue[] = [
  {
    id: 'issue-48',
    title: 'அரசியல் சாசனத்தின் 75 ஆண்டுகள்: ஜனநாயகத்தின் வலிமையும் எதிர்காலமும்',
    issueNumber: 48,
    slug: 'issue-48-september-2026',
    month: 'செப்டம்பர்',
    year: 2026,
    description: 'இந்திய அரசியலமைப்புச் சாசனத்தின் 75-வது ஆண்டை முன்னிட்டு, அடிப்படை உரிமைகள், கூட்டாட்சி கட்டமைப்பு மற்றும் நீதித்துறையின் சுதந்திரம் குறித்த விரிவான சிறப்பிதழ்.',
    coverUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    pdfUrl: '/magazine-sample.pdf',
    publicationDate: '2026-09-01',
    status: 'published',
    pageCount: 64,
    tableOfContents: [
      { page: 3, title: 'தலையங்கம்: சட்டத்தின் முன் அனைவரும் சமமே', author: 'கே. எஸ். இளங்கோவன்', category: 'தலையங்கம்' },
      { page: 8, title: 'அடிப்படை உரிமைகள்: 75 ஆண்டுகால பரிணாம வளர்ச்சி', author: 'முனைவர் இரா. தமிழ்ச்செல்வி', category: 'சட்டம்' },
      { page: 18, title: 'மாநில சுயாட்சியும் நிதிப் பகிர்வும் - கூட்டாட்சி எதிர்நோக்கும் சோதனைகள்', author: 'சு. வெங்கடேசன்', category: 'அரசியல்' },
      { page: 26, title: 'பாரதிய நியாய சன்ஹிதா: நடைமுறைச் சவால்களும் நீதிமன்ற வழிகாட்டுதல்களும்', author: 'அட்வகேட் மா. சக்திவேல்', category: 'சட்டம்' },
      { page: 36, title: 'டிஜிட்டல் தனிநபர் தரவுப் பாதுகாப்புச் சட்டம் - பொதுமக்களுக்கான கையேடு', author: 'தொழில்நுட்ப சட்டப் பிரிவு', category: 'விழிப்புணர்வு' },
      { page: 48, title: 'சென்னை உயர் நீதிமன்றத்தின் வரலாற்று சிறப்புமிக்க 10 தீர்ப்புகள்', author: 'சட்டவிளக்கு ஆசிரியர் குழு', category: 'வரலாறு' },
    ],
    createdAt: '2026-08-28T10:00:00Z',
  },
  {
    id: 'issue-47',
    title: 'சுற்றுச்சூழல் நீதியும் காலநிலை மாற்ற வழக்குகளும்',
    issueNumber: 47,
    slug: 'issue-47-august-2026',
    month: 'ஆகஸ்ட்',
    year: 2026,
    description: 'பசுமைத் தீர்ப்பாயத்தின் முக்கிய உத்தரவுகள், நீர்நிலைகள் ஆக்கிரமிப்பு தடுப்பு மற்றும் தமிழகத்தின் கடலோர மண்டலப் பாதுகாப்பு விதிகள்.',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    pdfUrl: '/magazine-sample.pdf',
    publicationDate: '2026-08-01',
    status: 'published',
    pageCount: 60,
    tableOfContents: [
      { page: 4, title: 'தலையங்கம்: நீதியைத் தேடும் பூமி', author: 'கே. எஸ். இளங்கோவன்', category: 'தலையங்கம்' },
      { page: 12, title: 'மேற்குத் தொடர்ச்சி மலை பாதுகாப்பு வழக்குகளின் போக்கு', author: 'முனைவர் இரா. தமிழ்ச்செல்வி', category: 'சுற்றுச்சூழல்' },
      { page: 24, title: 'நீர்நிலைப் பாதுகாப்புச் சட்டம் 2007: முழுமையான நடைமுறை ஆய்வு', author: 'அட்வகேட் மா. சக்திவேல்', category: 'சட்டம்' },
    ],
    createdAt: '2026-07-28T10:00:00Z',
  },
  {
    id: 'issue-46',
    title: 'தொழிலாளர் சட்டச் சீர்திருத்தங்கள் - உரிமைகளும் விதிகளும்',
    issueNumber: 46,
    slug: 'issue-46-july-2026',
    month: 'ஜூலை',
    year: 2026,
    description: 'புதிய தொழிலாளர் நல சட்டக் குறியீடுகள் (Labour Codes) மற்றும் அமைப்புசாரா தொழிலாளர்களின் சமூகப் பாதுகாப்பு குறித்த நேரடி கள ஆய்வு.',
    coverUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80',
    pdfUrl: '/magazine-sample.pdf',
    publicationDate: '2026-07-01',
    status: 'published',
    pageCount: 56,
    tableOfContents: [
      { page: 3, title: 'தலையங்கம்: உழைப்பின் மேன்மைக்கு சட்டப் பாதுகாப்பு', author: 'கே. எஸ். இளங்கோவன்', category: 'தலையங்கம்' },
      { page: 14, title: 'கிக் தொழிலாளர்களுக்கான (Gig Workers) சட்ட உரிமைகள்', author: 'சு. வெங்கடேசன்', category: 'சட்டம்' },
    ],
    createdAt: '2026-06-27T10:00:00Z',
  },
  {
    id: 'issue-45',
    title: 'தேர்தல் நடைமுறைகளும் மக்கள் பிரதிநிதித்துவச் சட்டமும்',
    issueNumber: 45,
    slug: 'issue-45-june-2026',
    month: 'ஜூன்',
    year: 2026,
    description: 'தேர்தல் பத்திரங்கள் ரத்து செய்யப்பட்ட பின்னணியில் தேர்தல் நிதி வெளிப்படைத்தன்மையும் தேர்தல் ஆணையத்தின் அதிகார வரம்புகளும்.',
    coverUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80',
    pdfUrl: '/magazine-sample.pdf',
    publicationDate: '2026-06-01',
    status: 'published',
    pageCount: 64,
    tableOfContents: [
      { page: 3, title: 'தலையங்கம்: தேர்தல் களமும் மக்கள் தீர்ப்பும்', author: 'கே. எஸ். இளங்கோவன்', category: 'தலையங்கம்' },
      { page: 10, title: 'மக்கள் பிரதிநிதித்துவச் சட்டம் 1951: சீர்திருத்தக் குரல்கள்', author: 'முனைவர் இரா. தமிழ்ச்செல்வி', category: 'அரசியல்' },
    ],
    createdAt: '2026-05-28T10:00:00Z',
  },
  {
    id: 'issue-44',
    title: 'பெண்களுக்கான சொத்துரிமை: உச்ச நீதிமன்ற தீர்ப்புகளின் வரலாறு',
    issueNumber: 44,
    slug: 'issue-44-may-2026',
    month: 'மே',
    year: 2026,
    description: 'இந்து வாரிசு உரிமைத் திருத்தச் சட்டம் மற்றும் திருமணச் சொத்துப் பங்கீட்டு உரிமைகள் குறித்த தீர்ப்புகளின் முழு தொகுப்பு.',
    coverUrl: 'https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?w=800&auto=format&fit=crop&q=80',
    pdfUrl: '/magazine-sample.pdf',
    publicationDate: '2026-05-01',
    status: 'published',
    pageCount: 52,
    tableOfContents: [
      { page: 4, title: 'தலையங்கம்: பாலியல் சமத்துவமும் சட்டக் கண்ணோட்டமும்', author: 'கே. எஸ். இளங்கோவன்', category: 'தலையங்கம்' },
      { page: 12, title: 'பெண்களின் பூர்வீகச் சொத்துரிமை: தெளிவுபடுத்திய உச்ச நீதிமன்றம்', author: 'முனைவர் இரா. தமிழ்ச்செல்வி', category: 'சட்டம்' },
    ],
    createdAt: '2026-04-26T10:00:00Z',
  },
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    issueId: 'issue-48',
    issueTitle: 'இதழ் 48 (செப்டம்பர் 2026)',
    pdfPage: 8,
    title: 'அரசியலமைப்புச் சாசனத்தின் 75 ஆண்டுகள்: அடிப்படை உரிமைகள் எதிர்நோக்கும் சமகாலச் சவால்கள்',
    slug: 'constitution-75-years-fundamental-rights-contemporary-challenges',
    excerpt: 'இந்திய அரசியல் சாசனம் இயற்றப்பட்டு 75 ஆண்டுகள் கடந்துள்ள நிலையில், குடிமக்களின் பேச்சுரிமை, தனிமனித சுதந்திரம் மற்றும் சமத்துவக் கோட்பாடுகள் நீதிமன்றங்களால் எவ்வாறு பாதுகாக்கப்படுகின்றன என்பதன் ஆழமான அலசல்.',
    content: `## முன்னுரை

இந்திய ஜனநாயகத்தின் மாபெரும் கலங்கரை விளக்கமாக விளங்குவது நமது அரசியல் சாசனம். டாக்டர் பி.ஆர். அம்பேத்கர் தலைமையிலான வரைவுக்குழு அளித்த இந்த உன்னத ஆவணம், சுதந்திரம் பெற்ற நாளில் இருந்து இன்று வரை கோடிக்கணக்கான மக்களின் அடிப்படை உரிமைகளுக்கு அரணாக திகழ்கிறது.

சட்டத்தின் ஆட்சி (Rule of Law) என்பது ஆட்சியாளர்களின் விருப்பத்திற்கு அப்பாற்பட்டது என்பதை இந்திய அரசியல் சாசனத்தின் பிரிவு 14, 19 மற்றும் 21 ஆகியவை அசைக்க முடியாத வகையில் உறுதி செய்துள்ளன.

---

## பிரிவு 21: வாழ்வுரிமையின் புதிய எல்லைகள்

உச்ச நீதிமன்றத்தின் மேனகா காந்தி வழக்குத் தீர்ப்பிற்குப் பிறகு, பிரிவு 21-ல் கூறப்பட்டுள்ள "தனிமனித சுதந்திரம்" என்பது வெறுமனே உயிருடன் இருப்பதைக் குறிக்காமல், கண்ணியமான வாழ்வுரிமையைக் குறிக்கும் என்று விரிவுபடுத்தப்பட்டது.

> "சட்டம் இயற்றுவது நாடாளுமன்றத்தின் உரிமை; ஆனால் அந்தச் சட்டம் அரசியல் சாசனத்தின் அடிப்படைக் கோட்பாடுகளுக்கு விரோதமாக அமையாமல் இருப்பதை உறுதிசெய்வது நீதிமன்றங்களின் கடமை."
> — கேசவானந்த பாரதி வழக்கு தீர்ப்பு

அண்மைக்காலங்களில்:
1. **தனிநபர் அந்தரங்க உரிமை (Right to Privacy - புட்டசுவாமி வழக்கு):** டிஜிட்டல் யுகத்தில் குடிமக்களின் தரவுகளும் தொலைபேசி உரையாடல்களும் பாதுகாப்பானவை என்பதை அரசியல் சாசன அமர்வு திட்டவட்டமாக உறுதிப்படுத்தியது.
2. **சுத்தமான காற்று மற்றும் சுற்றுச்சூழல் உரிமை:** காலநிலை மாற்றத்தால் பாதிக்கப்படாமல் வாழும் உரிமையும் வாழ்வுரிமையின் பிரிக்க முடியாத அங்கமே என அண்மையில் உச்ச நீதிமன்றம் தீர்ப்பளித்துள்ளது.

---

## கூட்டாட்சி தத்துவமும் மாநிலங்களின் உரிமைகளும்

அரசியல் சாசனத்தின் பிரிவு 1 "இந்தியா என்பது மாநிலங்களின் ஒன்றியம்" (Union of States) என்பதைத் தெளிவாக வரையறுக்கிறது. 

மாநிலங்களுக்கான நிதிப் பகிர்வு, ஆளுநர்களின் அதிகார வரம்பு மற்றும் பொதுப்பட்டியலில் உள்ள துறைகளில் ஒன்றிய அரசு இயற்றும் சட்டங்கள் ஆகியவை குறித்து மாநிலங்கள் எழுப்பும் சட்டப் போராட்டங்கள் அரசியல் சாசனத்தின் கூட்டாட்சித் தத்துவத்தை மறுபரிசீலனைக்கு உட்படுத்தியுள்ளன.

### முக்கிய சவால்கள்:
* **ஆளுநர்களின் மசோதா ஒப்புதல் காலம்:** மாநில சட்டப்பேரவைகள் நிறைவேற்றும் மசோதாக்களைக் காலவரையின்றி நிறுத்தி வைக்க ஆளுநர்களுக்கு அதிகாரம் இல்லை என்று உச்ச நீதிமன்றம் வழங்கிய வழிகாட்டுதல் கூட்டாட்சியின் வெற்றியாகும்.
* **நிதி ஆணையப் பங்கீடு:** மாநிலங்களின் வரி வருவாயில் நியாயமான பங்கீட்டை வழங்குவது குறித்த விவாதங்கள் மேலும் தீவிரமடைந்துள்ளன.

---

## முடிவுரை: எதிர்காலத்திற்கான சட்டப்பாதை

75 ஆண்டுகளைக் கடந்த இந்த பயணம் எளிதானதல்ல. அவசரநிலைக் காலத்தின் இருண்ட நாட்களையும், பல்வேறு அரசியல் நெருக்கடிகளையும் தாங்கி நின்ற சாசனம் இது. 

டிஜிட்டல் ஆளுகை, செயற்கை நுண்ணறிவு பயன்பாடு, இணையக் குற்றங்கள் பெருக்கம் போன்ற புதிய காலச் சவால்களை எதிர்கொள்ளும் வகையில் அரசியல் சாசனக் கோட்பாடுகளை இளைய தலைமுறை வழக்கறிஞர்களும் நீதிபதிகளும் பாதுகாக்க வேண்டியது காலத்தின் கட்டாயமாகும்.`,
    heroImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    category: 'law',
    categoryNameTamil: 'சட்டம்',
    author: INITIAL_AUTHORS[0],
    tags: ['அரசியல் சாசனம்', 'உச்ச நீதிமன்றம்', 'அடிப்படை உரிமைகள்', 'நீதித்துறை', '75 ஆண்டுகள்'],
    status: 'published',
    featured: true,
    isEditorial: true,
    publishedAt: '2026-09-02T09:00:00Z',
    readTimeMinutes: 7,
    views: 3420,
  },
  {
    id: 'art-2',
    issueId: 'issue-48',
    issueTitle: 'இதழ் 48 (செப்டம்பர் 2026)',
    pdfPage: 18,
    title: 'மாநில சுயாட்சியும் நிதிப் பகிர்வும்: 16-வது நிதி ஆணையத்திற்கு முன் உள்ள தமிழகத்தின் கோரிக்கைகள்',
    slug: 'state-autonomy-and-financial-distribution-tamil-nadu-demands',
    excerpt: 'நாட்டின் பொருளாதார வளர்ச்சிக்கு பெரும் பங்களிக்கும் தமிழ்நாடு போன்ற முன்னோடி மாநிலங்கள் எதிர்கொள்ளும் நிதிப் பகிர்வு முரண்பாடுகளும், கூட்டாட்சி நிதி உறவுகளில் தேவையான மாற்றங்களும்.',
    content: `## நிதி கூட்டாட்சியின் யதார்த்த நிலை

இந்தியாவில் மாநிலங்களின் செலவினப் பொறுப்புகள் மிக அதிகமாகவும், அதே வேளையில் வரி வசூலிக்கும் அதிகாரங்கள் ஒன்றிய அரசிடம் குவிந்தும் காணப்படும் சூழலில் நிதி ஆணையத்தின் பங்கு மிக முக்கியமானதாக மாறுகிறது.

தமிழ்நாடு தனது மொத்த உள்நாட்டு உற்பத்தியில் பெரும்பகுதியை தேசிய வளர்ச்சிக்கு பங்களிக்கிறது. எனினும், ஒன்றிய அரசிடமிருந்து மாநிலத்திற்குத் திரும்பப் பெறப்படும் நிதி ஒதுக்கீடுகளில் தொடர்ந்து முரண்பாடுகள் நீடிப்பதாக பொருளாதார வல்லுநர்கள் சுட்டிக்காட்டுகின்றனர்.

### முக்கிய விவாதப் புள்ளிகள்:
* **செஸ் மற்றும் சர்சார்ஜ் முறைகள்:** ஒன்றிய அரசு விதிக்கும் கூடுதல் வரிகள் மற்றும் செஸ் தொகைகள் மாநிலங்களுடன் பகிரப்படாமல் இருப்பது கூட்டாட்சி நெறிமுறைகளுக்கு விரோதமானது.
* **மக்கள் தொகை கணக்கீட்டு வரம்பு:** மக்கள் தொகைக் கட்டுப்பாட்டை வெற்றிகரமாகச் செயல்படுத்திய தென்மாநிலங்கள் நிதி ஒதுக்கீட்டில் தண்டிக்கப்படக் கூடாது என்ற வாதம் வலுப்பெற்றுள்ளது.

நீதிமன்றங்களும் பொருளாதாரக் குழுக்களும் இந்த விவகாரத்தில் நியாயமான ஒரு சமநிலையை உருவாக்க வேண்டிய தருணம் இது.`,
    heroImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80',
    category: 'politics',
    categoryNameTamil: 'அரசியல்',
    author: INITIAL_AUTHORS[2],
    tags: ['நிதி ஆணையம்', 'மாநில சுயாட்சி', 'தமிழ்நாடு', 'கூட்டாட்சி', 'பொருளாதாரம்'],
    status: 'published',
    featured: true,
    publishedAt: '2026-09-03T11:30:00Z',
    readTimeMinutes: 6,
    views: 2150,
  },
  {
    id: 'art-3',
    issueId: 'issue-48',
    issueTitle: 'இதழ் 48 (செப்டம்பர் 2026)',
    pdfPage: 26,
    title: 'பாரதிய நியாய சன்ஹிதா: குற்றவியல் விசாரணைகளில் வீடியோ பதிவு கட்டாயமும் சவால்களும்',
    slug: 'bharatiya-nyaya-sanhita-mandatory-videography-criminal-trials',
    excerpt: 'புதிய குற்றவியல் சட்டங்களின் கீழ் சோதனைகள் மற்றும் சாட்சி விசாரணைகளில் ஆடியோ-வீடியோ பதிவுகள் கட்டாயமாக்கப்பட்டுள்ள சூழலில், காவல் நிலையங்களின் உள்கட்டமைப்பு மற்றும் சட்ட அமலாக்கச் சவால்கள்.',
    content: `## புதிய சட்ட விதிமுறைகள்

இந்திய குற்றவியல் நடைமுறைச் சட்டங்களில் கொண்டுவரப்பட்டுள்ள புதிய பாரதிய நியாய சன்ஹிதா மற்றும் பாரதிய குடிமக்கள் பாதுகாப்பு சன்ஹிதா சட்டங்களின்படி, குற்றச் சம்பவ இடங்களில் செய்யப்படும் கைப்பற்றல்கள் மற்றும் சாட்சிய வாக்குமூலங்கள் டிஜிட்டல் முறையில் பதிவு செய்யப்படுவது கட்டாயமாக்கப்பட்டுள்ளது.

### சட்டத்தின் நோக்கம்:
போலி கைதுகள் மற்றும் கட்டாயக் கைப்பற்றல்களைத் தடுத்து, நீதிமன்ற விசாரணையில் நம்பகமான டிஜிட்டல் ஆதாரங்களை உருவாக்குவதே இதன் தலையாய நோக்கமாகும்.

### கள நிலவரம்:
1. பல காவல் நிலையங்களில் போதிய கேமரா வசதிகள் மற்றும் கிளவுட் டேட்டா சேமிப்பு கட்டமைப்பு இன்னும் முழுமை பெறவில்லை.
2. நீதிமன்றத்தில் டிஜிட்டல் சான்றுகளின் நம்பகத்தன்மையை உறுதிப்படுத்தும் பிரிவு 63B சான்றிதழ் சமர்ப்பிப்பதில் உள்ள நடைமுறைச் சிக்கல்கள்.

வழக்கறிஞர்களும் காவல் துறையினரும் நவீன தொழில்நுட்பங்களுக்கு ஏற்றவாறு தங்களை விரைவாகத் தகவமைத்துக் கொள்வது அவசியமாகிறது.`,
    heroImage: 'https://images.unsplash.com/photo-1453733197783-64ac7ded824a?w=1200&auto=format&fit=crop&q=80',
    category: 'law',
    categoryNameTamil: 'சட்டம்',
    author: INITIAL_AUTHORS[3],
    tags: ['BNS', 'குற்றவியல் சட்டம்', 'டிஜிட்டல் ஆதாரம்', 'நீதித்துறை', 'காவல்துறை'],
    status: 'published',
    featured: false,
    publishedAt: '2026-09-04T14:15:00Z',
    readTimeMinutes: 5,
    views: 1890,
  },
  {
    id: 'art-4',
    title: 'சென்னை உயர் நீதிமன்றத்தின் தனித்துவமான பாரம்பரியமும் சமூக நீதிக்கான தீர்ப்புகளும்',
    slug: 'madras-high-court-heritage-and-social-justice-verdicts',
    excerpt: '160 ஆண்டுகளுக்கும் மேலான வரலாற்றைக் கொண்ட சென்னை உயர் நீதிமன்றம், இடஒதுக்கீடு, ஆலயப் பிரவேசம், உழவர் உரிமைகள் மற்றும் சமத்துவக் கொள்கைகளில் ஆற்றியுள்ள வரலாற்றுப் பங்களிப்பு.',
    content: `## வரலாற்றுச் சிறப்புமிக்க சிவப்பு செங்கற்கட்டடம்

1862-ம் ஆண்டு தோற்றுவிக்கப்பட்ட சென்னை உயர் நீதிமன்றம், தெற்காசியாவிலேயே மிக கம்பீரமான இந்தோ-சாரசெனிக் கட்டிடக்கலைக்குச் சான்றாகத் திகழ்கிறது. ஆனால் அதன் பெருமை வெறும் கட்டடக் கலையில் மட்டுமல்ல; அது வழங்கிய முற்போக்கான தீர்ப்புகளில்தான் மிளிர்கிறது.

### சமூக நீதியின் நாற்றங்கால்:
சாதி, மத பேதமின்றி அனைத்துக் குடிமக்களுக்கும் கல்வி மற்றும் வேலைவாய்ப்புகளில் சமஉரிமை வழங்கும் வகுப்புவாரி பிரதிநிதித்துவத்தை ஆதரித்த வரலாற்று சிறப்புமிக்க தீர்ப்புகளை சென்னை உயர் நீதிமன்றம் வழங்கியுள்ளது.

அனைத்து சாதியினரும் அர்ச்சகராகலாம் என்ற தமிழக அரசின் சட்டமுயற்சியை ஆதரித்த தீர்ப்பு முதல், நலிவடைந்த பிரிவினரின் உரிமைகளைப் பாதுகாப்பது வரை சென்னை உயர் நீதிமன்றத்தின் குரல் எப்போதும் சமூக நீதியின் பக்கமே நின்றிருக்கிறது.`,
    heroImage: 'https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=1200&auto=format&fit=crop&q=80',
    category: 'tamil-nadu',
    categoryNameTamil: 'தமிழ்நாடு',
    author: INITIAL_AUTHORS[1],
    tags: ['சென்னை உயர் நீதிமன்றம்', 'சமூக நீதி', 'வரலாறு', 'தமிழ்நாடு', 'தீர்ப்புகள்'],
    status: 'published',
    featured: false,
    publishedAt: '2026-09-05T10:00:00Z',
    readTimeMinutes: 6,
    views: 2670,
  },
  {
    id: 'art-5',
    title: 'தேர்தல் ஆணையத்தின் நியமன நடைமுறைகளும் வெளிப்படைத்தன்மையும்: புதிய சட்டத்தின் மீதான மறுஆய்வு',
    slug: 'election-commission-appointment-process-transparency-review',
    excerpt: 'தலைமைத் தேர்தல் ஆணையர் மற்றும் பிற தேர்தல் ஆணையர்களைத் தேர்வு செய்யும் குழுவில் இருந்து உச்ச நீதிமன்றத் தலைமை நீதிபதி நீக்கப்பட்டதன் சட்டப்பூர்வ விளைவுகளும் அரசியலமைப்பு வாதங்களும்.',
    content: `## தேர்தல் ஆணையத்தின் சுதந்திரம்

ஜனநாயகத்தின் அடித்தளமே நேர்மையான மற்றும் சுதந்திரமான தேர்தல்களில்தான் தங்கியுள்ளது. தேர்தல் ஆணையர்கள் சுதந்திரமாகச் செயல்படுவதை உறுதிசெய்ய, அவர்களது நியமன நடைமுறையில் நடுநிலைமை காக்கப்பட வேண்டும் என்று அனூப் பரன்வால் வழக்கில் உச்ச நீதிமன்ற அரசியல் சாசன அமர்வு வரலாற்றுத் தீர்ப்பை வழங்கியது.

பின்னர் நாடாளுமன்றத்தால் இயற்றப்பட்ட புதிய சட்டத்தில், தேர்வு குழுவில் பிரதமர், ஒரு மத்திய அமைச்சர் மற்றும் எதிர்க்கட்சித் தலைவர் மட்டுமே இடம்பெற்றுள்ளனர். 

இந்த நடைமுறை குறித்து எழுந்துள்ள பொதுநல வழக்குகளில், உச்ச நீதிமன்றம் தொடர்ந்து எழுப்பி வரும் கேள்விகள் இந்திய ஜனநாயகத்தின் சமநிலை காக்கும் சக்தியாக விளங்குகின்றன.`,
    heroImage: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200&auto=format&fit=crop&q=80',
    category: 'india',
    categoryNameTamil: 'இந்தியா',
    author: INITIAL_AUTHORS[0],
    tags: ['தேர்தல் ஆணையம்', 'உச்ச நீதிமன்றம்', 'ஜனநாயகம்', 'இந்தியா', 'அரசியல் சட்டம்'],
    status: 'published',
    featured: false,
    publishedAt: '2026-09-06T16:00:00Z',
    readTimeMinutes: 6,
    views: 1940,
  },
  {
    id: 'art-6',
    title: 'ஆன்லைன் ரம்மி மற்றும் சூதாட்டத் தடுப்புச் சட்டம்: சென்னை உயர் நீதிமன்றத்தின் இறுதி வழிகாட்டுதல்கள்',
    slug: 'online-rummy-gambling-prohibition-act-madras-high-court-guidelines',
    excerpt: 'திறமைக்கான விளையாட்டுக்கும் அதிர்ஷ்டத்திற்கான விளையாட்டுக்கும் உள்ள வேறுபாடுகளை ஆராய்ந்து தமிழக அரசின் ஒழுங்குமுறை அதிகாரங்களை உறுதி செய்த தீர்ப்பின் முக்கிய அம்சங்கள்.',
    content: `## தமிழக அரசின் சட்டம் மற்றும் நீதிமன்ற ஆய்வு

இளைஞர்களின் உயிரைப் பறிக்கும் ஆன்லைன் சூதாட்டங்களை முற்றிலும் தடை செய்ய தமிழ்நாடு அரசு கொண்டு வந்த சட்டத்தின் மீது பல்வேறு ஆன்லைன் விளையாட்டு நிறுவனங்கள் தொடர்ந்த வழக்கில், சென்னை உயர் நீதிமன்ற அமர்வு முக்கிய வழிகாட்டுதல்களை வழங்கியுள்ளது.

விளையாட்டு நிறுவனங்கள் தங்களது இயங்குதளங்களில் நேரக் கட்டுப்பாடு மற்றும் பணக் கட்டுப்பாட்டு விதிகளை நடைமுறைப்படுத்த வேண்டும் என்றும், தமிழ்நாடு ஆன்லைன் விளையாட்டு ஆணையம் உரிய கண்காணிப்பை மேற்கொள்ள வேண்டும் என்றும் நீதிமன்றம் உத்தரவிட்டது.`,
    heroImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
    category: 'law',
    categoryNameTamil: 'சட்டம்',
    author: INITIAL_AUTHORS[3],
    tags: ['சென்னை உயர் நீதிமன்றம்', 'சட்டம்', 'தமிழ்நாடு', 'இணைய சூதாட்டம்', 'தீர்ப்பு'],
    status: 'published',
    featured: false,
    publishedAt: '2026-09-07T12:00:00Z',
    readTimeMinutes: 4,
    views: 1530,
  },
];

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    source: 'சென்னை உயர் நீதிமன்ற பதிவுத் துறை',
    sourceUrl: 'https://hcmadras.tn.gov.in',
    originalHeadline: 'Madras HC directs strict action against illegal water body encroachments across Tamil Nadu',
    originalContent: 'The First Bench of the Madras High Court on Monday issued stern directions to the Revenue Department and District Collectors to conduct survey and remove all encroachments on lake beds and water catchment areas within three months, submitting comprehensive status reports.',
    headline: 'நீர்நிலைகள் மீதான ஆக்கிரமிப்புகளை 3 மாதங்களில் அகற்ற வேண்டும்: சென்னை உயர் நீதிமன்றம் அதிரடி உத்தரவு',
    summary: 'தமிழகம் முழுவதும் உள்ள ஏரிகள் மற்றும் நீர்நிலைப் பகுதிகளில் உள்ள ஆக்கிரமிப்புகளை மூன்று மாதங்களுக்குள் கணக்கெடுத்து அகற்ற அனைத்து மாவட்ட ஆட்சியர்களுக்கும் சென்னை உயர் நீதிமன்ற முதன்மை அமர்வு உத்தரவிட்டுள்ளது.',
    content: `தமிழகம் முழுவதும் உள்ள பொது நீர்நிலைகள் மற்றும் ஏரிப் படுகைகளில் ஏற்பட்டுள்ள ஆக்கிரமிப்புகளை அகற்றக் கோரி தாக்கல் செய்யப்பட்ட பொதுநல வழக்குகளை விசாரித்த சென்னை உயர் நீதிமன்ற முதன்மை அமர்வு, மிகக் கடுமையான உத்தரவை பிறப்பித்துள்ளது.

நீதிமன்றத்தின் முக்கிய உத்தரவுகள்:
1. அனைத்து மாவட்டங்களிலும் வருவாய்த்துறை மற்றும் உள்ளாட்சி அமைப்புகள் உடனடியாக கூட்டு ஆய்வு நடத்த வேண்டும்.
2. வணிக ரீதியிலான கட்டிடங்கள் மற்றும் அரசியல் செல்வாக்கு கொண்ட ஆக்கிரமிப்புகள் தயவுதாட்சண்யமின்றி உடனடியாக இடிக்கப்பட வேண்டும்.
3. மேற்கொள்ளப்பட்ட நடவடிக்கைகள் குறித்த விரிவான அறிக்கையை வரும் நவம்பர் மாதத்திற்குள் தாக்கல் செய்ய வேண்டும்.

நீர்நிலைகளைப் பாதுகாப்பது எதிர்காலத் தலைமுறையினரின் அடிப்படை வாழ்வுரிமையாகும் என நீதிபதிகள் தங்களது உத்தரவில் சுட்டிக்காட்டினர்.`,
    category: 'law',
    categoryNameTamil: 'சட்டம்',
    tags: ['சென்னை உயர் நீதிமன்றம்', 'நீர்நிலைகள்', 'தீர்ப்பு', 'தமிழக அரசு'],
    publishedAt: '2026-09-09T07:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
    status: 'published',
    relevanceScore: 98,
    isBreaking: true,
  },
  {
    id: 'news-2',
    source: 'உச்ச நீதிமன்ற தகவல் மையம்',
    sourceUrl: 'https://main.sci.gov.in',
    originalHeadline: 'Supreme Court constitution bench to hear plea on marital rape exception',
    originalContent: 'A five-judge Constitution Bench of the Supreme Court of India is scheduled to commence final hearings on the validity of Exception 2 to Section 375 of the IPC / BNS regarding marital rape exemption.',
    headline: 'திருமண பலாத்கார விதிவிலக்கு வழக்கு: உச்ச நீதிமன்ற அரசியல் சாசன அமர்வு விரைவில் இறுதி விசாரணை',
    summary: 'கணவன்-மனைவி இடையேயான பாலியல் வன்முறை விதிவிலக்கு குறித்த சட்டப்பிரிவின் செல்லுபடித்தன்மையை ஆய்வு செய்ய உச்ச நீதிமன்றத்தின் 5 நீதிபதிகள் கொண்ட அரசியல் சாசன அமர்வு இறுதி விசாரணையைத் தொடங்குகிறது.',
    content: `இந்திய தண்டனைச் சட்டத்தில் உள்ள விதிவிலக்கு பிரிவு பெண்களின் சமத்துவ உரிமை மற்றும் உடலுரிமைக்கு முரணானது என்று தொடரப்பட்ட வழக்குகளை உச்ச நீதிமன்ற அரசியல் சாசன அமர்வு விசாரிக்க உள்ளது.

மத்திய அரசு மற்றும் பல்வேறு மகளிர் அமைப்புகள் தங்களது எழுத்துப்பூர்வ வாதங்களை ஏற்கனவே சமர்ப்பித்துள்ள நிலையில், இந்த வழக்கின் தீர்ப்பு நாட்டின் சமூக அமைப்பில் பெரும் தாக்கத்தை ஏற்படுத்தும் என எதிர்பார்க்கப்படுகிறது.`,
    category: 'law',
    categoryNameTamil: 'சட்டம்',
    tags: ['உச்ச நீதிமன்றம்', 'அரசியல் சாசன அமர்வு', 'மகளிர் உரிமை', 'சட்டம்'],
    publishedAt: '2026-09-09T06:15:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    status: 'published',
    relevanceScore: 95,
    isBreaking: true,
  },
  {
    id: 'news-3',
    source: 'தலைமைச் செயலகம் செய்திக்குறிப்பு',
    sourceUrl: 'https://tn.gov.in',
    originalHeadline: 'Tamil Nadu Cabinet approves new welfare policy for gig workers and social security fund',
    originalContent: 'The Tamil Nadu Cabinet chaired by the Chief Minister has cleared a groundbreaking Bill to create a dedicated Gig Workers Welfare Board with seed funding of Rs 100 crore and mandatory contribution from platform aggregators.',
    headline: 'கிக் தொழிலாளர்களுக்கு சமூகப் பாதுகாப்பு வாரியம்: தமிழக அமைச்சரவை வரலாற்று ஒப்புதல்',
    summary: 'உணவு விநியோகம் மற்றும் சவாரி சேவை வழங்கும் ஆன்லைன் கிக் தொழிலாளர்களின் நலனைப் பாதுகாக்க பிரத்யேக நல வாரியம் மற்றும் ₹100 கோடி நிதி ஒதுக்கீட்டிற்கு தமிழக அமைச்சரவை ஒப்புதல் அளித்துள்ளது.',
    content: `ஆன்லைன் இயங்குதளங்களில் பணிபுரியும் டெலிவரி ஊழியர்கள் மற்றும் ஓட்டுநர்களின் பணிப் பாதுகாப்பை உறுதி செய்யும் வகையில் வரலாற்றுச் சிறப்புமிக்க முடிவை தமிழக அரசு எடுத்துள்ளது.

இதன் மூலம்:
- விபத்துக் காப்பீடு மற்றும் மருத்துவக் காப்பீடு வசதிகள்
- ஓய்வூதியம் மற்றும் அவசர நிதி உதவிகள்
- இயங்குதள நிறுவனங்களின் நியாயமற்ற அபராதங்களை விசாரிக்கும் குறைதீர்ப்பு மன்றம்
ஆகியவை அமைக்கப்படும். இதற்கான சட்ட மசோதா நடப்பு சட்டப்பேரவைக் கூட்டத்தொடரில் தாக்கல் செய்யப்படுகிறது.`,
    category: 'tamil-nadu',
    categoryNameTamil: 'தமிழ்நாடு',
    tags: ['தமிழக அரசு', 'அமைச்சரவை', 'தொழிலாளர் நலன்', 'முக்கிய அறிவிப்பு'],
    publishedAt: '2026-09-09T05:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
    status: 'published',
    relevanceScore: 92,
    isBreaking: false,
  },
  {
    id: 'news-4',
    source: 'நாடாளுமன்ற செய்திப் பிரிவு',
    sourceUrl: 'https://sansad.in',
    originalHeadline: 'Parliament Standing Committee reviews Digital Personal Data Protection Rules',
    originalContent: 'The Parliamentary Standing Committee on Communications and IT questioned tech executives and ministry officials regarding consent managers and parental consent verification mechanisms under DPDP rules.',
    headline: 'டிஜிட்டல் தனிநபர் தரவுப் பாதுகாப்பு விதிகள்: நாடாளுமன்ற நிலைக்குழு தீவிர ஆய்வு',
    summary: 'டிஜிட்டல் தனிநபர் தரவுப் பாதுகாப்புச் சட்டத்தின் கீழ் வரையறுக்கப்பட்டுள்ள விதிகள் குறித்து தொழில்நுட்ப நிறுவனங்களின் பிரதிநிதிகள் மற்றும் அமைச்சக அதிகாரிகளுடன் நாடாளுமன்ற நிலைக்குழு ஆலோசனைகளை நடத்தியது.',
    content: `குழந்தைகளின் இணையப் பாதுகாப்பு, தரவு வர்த்தகத் தடுப்பு மற்றும் பயனர்களின் ஒப்புதல் மேலாண்மை விதிகள் குறித்த விரிவான ஆய்வை நாடாளுமன்றக் குழு மேற்கொண்டு வருகிறது. பொதுமக்கள் மற்றும் சட்ட வல்லுநர்களிடம் இருந்து கருத்துக்களைக் கோரவும் முடிவு செய்யப்பட்டுள்ளது.`,
    category: 'india',
    categoryNameTamil: 'இந்தியா',
    tags: ['நாடாளுமன்றம்', 'டிஜிட்டல் சட்டம்', 'தரவுப் பாதுகாப்பு', 'இந்தியா'],
    publishedAt: '2026-09-08T18:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    status: 'published',
    relevanceScore: 88,
    isBreaking: false,
  },
  {
    id: 'news-5',
    source: 'தமிழக தலைமைத் தேர்தல் அதிகாரி அலுவலகம்',
    sourceUrl: 'https://elections.tn.gov.in',
    originalHeadline: 'Special summary revision of voter rolls begins across 234 constituencies in Tamil Nadu',
    originalContent: 'Chief Electoral Officer announced the commencement of special camp dates for voter list enrollment, Aadhaar linking, and address changes across all polling stations in the state.',
    headline: 'தமிழகத்தில் வாக்காளர் பட்டியல் சிறப்பு தீவிர திருத்தப் பணிகள் தொடக்கம்',
    summary: '234 சட்டமன்றத் தொகுதிகளிலும் புதிய வாக்காளர்களைச் சேர்க்கவும், முகவரி மாற்றம் செய்யவும் சிறப்பு முகாம்களுக்கான தேதிகளை தலைமைத் தேர்தல் அதிகாரி அறிவித்துள்ளார்.',
    content: `18 வயது நிரம்பிய இளைஞர்கள் வாக்காளர் பட்டியலில் பெயர் சேர்க்கவும், இறந்தவர்கள் மற்றும் இடம்பெயர்ந்தோரின் பெயர்களை நீக்கவும் அக்டோபர் மாதம் முழுவதும் அனைத்து வாக்குச்சாவடி மையங்களிலும் சிறப்பு முகாம்கள் நடைபெறும் என அறிவிக்கப்பட்டுள்ளது.`,
    category: 'politics',
    categoryNameTamil: 'அரசியல்',
    tags: ['தேர்தல்', 'வாக்காளர் பட்டியல்', 'தமிழ்நாடு', 'அரசியல்'],
    publishedAt: '2026-09-08T14:20:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1494178270175-e96de2971df9?w=800&auto=format&fit=crop&q=80',
    status: 'published',
    relevanceScore: 85,
    isBreaking: false,
  },
  {
    id: 'news-6',
    source: 'காவிரி மேலாண்மை ஆணையம்',
    sourceUrl: 'https://cwc.gov.in',
    originalHeadline: 'Cauvery Water Management Authority directs release of stipulated water quota for Tamil Nadu',
    originalContent: 'CWMA meeting in New Delhi directed Karnataka to release the allocated monthly quota of water at Biligundlu gauging station as per Supreme Court modified award.',
    headline: 'தமிழகத்திற்கு உரிய காவிரி நீரை பிலிகுண்டுலுவில் திறக்க காவிரி மேலாண்மை ஆணையம் உத்தரவு',
    summary: 'உச்ச நீதிமன்றத்தின் தீர்ப்பின்படி தமிழகத்திற்கு கிடைக்க வேண்டிய செப்டம்பர் மாதத்திற்கான பங்கை உடனடியாகத் திறந்துவிட கர்நாடக அரசுக்கு காவிரி மேலாண்மை ஆணையம் அறிவுறுத்தியுள்ளது.',
    content: `புதுடெல்லியில் நடைபெற்ற காவிரி மேலாண்மை ஆணைய கூட்டத்தில் இரு மாநில அதிகாரிகளின் வாதங்களைக் கேட்டறிந்த தலைவர், டெல்டா விவசாயிகளின் குறுவை மற்றும் சம்பா பாசன தேவைகளை கருத்தில் கொண்டு உரிய நீர் பங்கீட்டை உறுதி செய்யுமாறு உத்தரவிட்டார்.`,
    category: 'tamil-nadu',
    categoryNameTamil: 'தமிழ்நாடு',
    tags: ['காவிரி', 'விவசாயம்', 'தமிழ்நாடு', 'உத்தரவு'],
    publishedAt: '2026-09-08T11:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
    status: 'published',
    relevanceScore: 90,
    isBreaking: false,
  },
];

export const INITIAL_NEWS_REVIEW: NewsItem[] = [
  {
    id: 'review-1',
    source: 'LiveLaw India',
    sourceUrl: 'https://www.livelaw.in/top-stories/supreme-court-bail-orders-liberty-delays-bns-2026',
    originalHeadline: 'Supreme Court warns lower courts against mechanical rejection of bail applications in routine cases',
    originalContent: `A Bench comprising Justices B.R. Gavai and K.V. Viswanathan observed that personal liberty guaranteed under Article 21 cannot be rendered illusory by trial courts and Sessions judges. 

The Court noted: "Bail is the rule and jail is the exception. Incarceration before trial without compelling reasons is a violation of human rights. Magistrates must scrutinize remand applications with utmost care."`,
    headline: 'வழக்கமான வழக்குகளில் இயந்திரத்தனமாக ஜாமீன் மனுக்களை நிராகரிக்கக் கூடாது: கீழமை நீதிமன்றங்களுக்கு உச்ச நீதிமன்றம் கடும் எச்சரிக்கை',
    summary: 'விசாரணைக் கால கைதிகளின் தனிமனித சுதந்திரத்தை பறிக்கும் வகையில் முன்யோசனையின்றி ஜாமீன் மனுக்களை தள்ளுபடி செய்யும் கீழமை நீதிமன்றங்களின் போக்கிற்கு உச்ச நீதிமன்றம் கண்டனம் தெரிவித்துள்ளது.',
    content: `அரசியலமைப்புச் சாசனத்தின் பிரிவு 21 வழங்கும் தனிமனித சுதந்திரம் என்பது வெறும் காகித வார்த்தை அல்ல என்று உச்ச நீதிமன்றம் மீண்டும் வலியுறுத்தியுள்ளது.

நீதிபதிகள் அமர்வு தெரிவித்த கருத்துகள்:
1. "ஜாமீன் என்பதே பொது விதி; சிறை என்பது விதிவிலக்கு" என்ற சட்டக் கோட்பாட்டை மாஜிஸ்திரேட்டுகளும் அமர்வு நீதிமன்ற நீதிபதிகளும் கண்டிப்பாகப் பின்பற்ற வேண்டும்.
2. போதிய முகாந்திரம் இன்றி தொடர் சிறைவாசத்தில் வைப்பது மனித உரிமை மீறலாகும்.
3. காவல் துறை கேட்கும் காவல் நீட்டிப்பு மனுக்களை கண்மூடித்தனமாக அனுமதிக்காமல், தீவிர ஆய்வு செய்ய வேண்டும்.`,
    category: 'law',
    categoryNameTamil: 'சட்டம்',
    tags: ['உச்ச நீதிமன்றம்', 'ஜாமீன் சட்டம்', 'தனிமனித சுதந்திரம்', 'நீதித்துறை'],
    publishedAt: '2026-09-09T08:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    status: 'review',
    relevanceScore: 99,
    isBreaking: false,
    aiProcessingNotes: 'Gemini News Pipeline: Translated from English legal press release. Legal terminology verified against SC precedent (Article 21, Bail Jurisprudence). Recommended for editorial approval.',
  },
  {
    id: 'review-2',
    source: 'Bar and Bench',
    sourceUrl: 'https://www.barandbench.com/news/litigation/madras-high-court-quashes-defamation-case-free-speech',
    originalHeadline: 'Madras High Court quashes criminal defamation against investigative journalist, emphasizes public interest',
    originalContent: `Justice Anand Venkatesh of the Madras High Court quashed criminal defamation proceedings against a senior Tamil investigative journalist, ruling that factual reporting on public procurement irregularities does not constitute malicious defamation. The Court reaffirmed that journalists play the vital role of the Fourth Pillar of democracy.`,
    headline: 'விசாரணை இதழியலாளர் மீதான அவதூறு வழக்கை ரத்து செய்தது சென்னை உயர் நீதிமன்றம்: கருத்து சுதந்திரத்திற்கு பாதுகாப்பு',
    summary: 'அரசு ஒப்பந்தங்களில் நடந்த முறைகேடுகள் குறித்து உண்மை நிலவரங்களை வெளியிட்ட மூத்த செய்தியாளர் மீதான குற்றவியல் அவதூறு வழக்கை சென்னை உயர் நீதிமன்றம் ரத்து செய்துள்ளது.',
    content: `பொது நலன் சார்ந்த விடயங்களில் ஆதாரங்களுடன் செய்தி வெளியிடும் ஊடகவியலாளர்கள் மீது அவதூறு வழக்குகளை அச்சுறுத்தல் ஆயுதமாகப் பயன்படுத்தக் கூடாது என்று சென்னை உயர் நீதிமன்றம் தீர்ப்பளித்துள்ளது.

ஜனநாயகத்தின் நான்காவது தூணாக விளங்கும் பத்திரிகையாளர்களின் சுதந்திரத்தை நசுக்க நினைப்பது அரசியல் சாசனத்திற்கு எதிரானது என நீதிபதி தனது தீர்ப்பில் கோடிட்டுக் காட்டியுள்ளார்.`,
    category: 'law',
    categoryNameTamil: 'சட்டம்',
    tags: ['சென்னை உயர் நீதிமன்றம்', 'பத்திரிகை சுதந்திரம்', 'அவதூறு வழக்கு', 'தீர்ப்பு'],
    publishedAt: '2026-09-09T07:45:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80',
    status: 'review',
    relevanceScore: 97,
    isBreaking: false,
    aiProcessingNotes: 'Gemini News Pipeline: Processed from Madras HC order. High public interest. Requires Editor signature before publishing.',
  },
  {
    id: 'review-3',
    source: 'The Hindu Tamil Thisai',
    sourceUrl: 'https://www.hindutamil.in/news/tamilnadu/law-academy-madurai-bench-inauguration.html',
    originalHeadline: 'New State Judicial Academy regional center inaugurated near Madurai Bench',
    originalContent: 'Honourable Chief Justice of Madras High Court along with Senior Judges inaugurated the state-of-the-art judicial training complex in Madurai designed for continuous judicial education of subordinate judges.',
    headline: 'மதுரையில் தமிழ்நாடு மாநில நீதித்துறை அகாடமியின் மண்டல மையம் திறப்பு',
    summary: 'தென் மாவட்டங்களின் நீதித்துறை அதிகாரிகளுக்கு தொடர் சட்டப் பயிற்சிகள் வழங்கும் வகையில் நவீன வசதிகளுடன் கூடிய நீதித்துறை அகாடமி மதுரை உயர் நீதிமன்றக் கிளை அருகே திறக்கப்பட்டது.',
    content: `கீழமை நீதிமன்ற நீதிபதிகளுக்கு நவீன குற்றவியல் சட்டங்கள் மற்றும் இணையதள குற்றத் தீர்வுகள் குறித்து தொடர் பயிற்சி அளிக்க இந்த மையம் பெரும் பங்காற்றும் என தலைமை நீதிபதி குறிப்பிட்டார்.`,
    category: 'tamil-nadu',
    categoryNameTamil: 'தமிழ்நாடு',
    tags: ['மதுரை', 'சென்னை உயர் நீதிமன்றம்', 'நீதித்துறை பயிற்சி', 'தமிழ்நாடு'],
    publishedAt: '2026-09-09T06:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=800&auto=format&fit=crop&q=80',
    status: 'review',
    relevanceScore: 84,
    isBreaking: false,
    aiProcessingNotes: 'Gemini News Pipeline: Regional judicial infrastructure update. Good regional coverage.',
  },
];

export const INITIAL_MEDIA: Media[] = [
  {
    id: 'med-1',
    name: 'issue-48-cover.jpg',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    type: 'image',
    size: '1.2 MB',
    category: 'cover',
    altText: 'சட்டவிளக்கு இதழ் 48 அட்டைப்படம் - இந்திய அரசியல் சாசனம் 75 ஆண்டுகள்',
    createdAt: '2026-08-28T10:00:00Z',
  },
  {
    id: 'med-2',
    name: 'supreme-court-india.jpg',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    type: 'image',
    size: '2.4 MB',
    category: 'article',
    altText: 'இந்திய உச்ச நீதிமன்ற வளாகம் மற்றும் தராசு சின்னம்',
    createdAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'med-3',
    name: 'madras-high-court.jpg',
    url: 'https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=1200&auto=format&fit=crop&q=80',
    type: 'image',
    size: '3.1 MB',
    category: 'article',
    altText: 'சென்னை உயர் நீதிமன்ற பாரம்பரிய சிவப்பு செங்கல் கட்டடம்',
    createdAt: '2026-09-02T11:00:00Z',
  },
  {
    id: 'med-4',
    name: 'editor-ilangovan.jpg',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    type: 'image',
    size: '640 KB',
    category: 'author',
    altText: 'முதன்மை ஆசிரியர் கே. எஸ். இளங்கோவன்',
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'med-5',
    name: 'sattavilakku-emblem.svg',
    url: '/sattavilakku-emblem.svg',
    type: 'image',
    size: '48 KB',
    category: 'site',
    altText: 'சட்டவிளக்கு அதிகாரப்பூர்வ முத்திரை',
    createdAt: '2026-08-01T08:00:00Z',
  },
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  siteNameTamil: 'சட்டவிளக்கு',
  siteNameEnglish: 'Sattavilakku',
  taglineTamil: 'நீதி, அரசியல், சமூகம் - நடுநிலையான தமிழ்ச் சட்ட இதழ்',
  descriptionTamil: 'சட்டவிளக்கு என்பது சட்டம், அரசியல், தமிழ்நாடு மற்றும் இந்திய நடப்புகள் குறித்த நம்பகமான, நடுநிலையான ஆய்வுகளையும் நாளிதழ் செய்திகளையும் தாங்கி வரும் முன்னணி தமிழ் டிஜிட்டல் இதழ்.',
  rniNumber: 'TN-TAM/2022/84920',
  editorInChief: 'வழக்கறிஞர் கே. எஸ். இளங்கோவன்',
  officeAddress: 'சட்டவிளக்கு இதழ் அலுவலகம், 42, உயர் நீதிமன்ற வணிக வளாகம், பாரிமுனை, சென்னை - 600 104, தமிழ்நாடு.',
  contactEmail: 'editor@sattavilakku.com',
  contactPhone: '+91 44 2534 8890',
  socialLinks: {
    facebook: 'https://facebook.com/sattavilakku',
    twitter: 'https://x.com/sattavilakku',
    whatsapp: 'https://chat.whatsapp.com/sattavilakku',
    telegram: 'https://t.me/sattavilakku',
    youtube: 'https://youtube.com/@sattavilakku',
  },
};
