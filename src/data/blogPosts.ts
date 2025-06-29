export interface BlogCategory {
  id: number;
  name: {
    az: string;
    en: string;
    tr: string;
  };
}

export interface BlogPost {
  id: number;
  slug: string;
  title: {
    az: string;
    en: string;
    tr: string;
  };
  excerpt: {
    az: string;
    en: string;
    tr: string;
  };
  content: {
    az: string;
    en: string;
    tr: string;
  };
  image: string;
  author: string;
  date: string;
  readTime: number;
  category: BlogCategory;
}

export const categories: BlogCategory[] = [
  {
    id: 1,
    name: {
      az: "Ortopediya",
      en: "Orthopedics",
      tr: "Ortopedi"
    }
  },
  {
    id: 2,
    name: {
      az: "Pediatrik Ortopediya",
      en: "Pediatric Orthopedics",
      tr: "Pediatrik Ortopedi"
    }
  },
  {
    id: 3,
    name: {
      az: "İdman Zədələri",
      en: "Sports Injuries",
      tr: "Spor Yaralanmaları"
    }
  },
  {
    id: 4,
    name: {
      az: "Cərrahiyyə",
      en: "Surgery",
      tr: "Cerrahi"
    }
  }
];

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "knee-replacement-surgery-guide",
    title: {
      az: "Diz Əvəzlənməsi Cərrahiyyəsi: Tam Bələdçi",
      en: "Knee Replacement Surgery: Complete Guide",
      tr: "Diz Protezi Cerrahisi: Kapsamlı Rehber"
    },
    excerpt: {
      az: "Diz əvəzlənməsi cərrahiyyəsi haqqında bilməli olduğunuz hər şey: prosedur, bərpa və gözlənilən nəticələr.",
      en: "Everything you need to know about knee replacement surgery: procedure, recovery, and expected outcomes.",
      tr: "Diz protezi cerrahisi hakkında bilmeniz gereken her şey: prosedür, iyileşme ve beklenen sonuçlar."
    },
    content: {
      az: "Diz əvəzlənməsi cərrahiyyəsi, zədələnmiş və ya xəstə diz oynağının süni implantla əvəz edilməsi prosedurdur. Bu cərrahiyyə adətən artrit, travma və ya digər diz problemləri səbəbindən şiddetli ağrı və hərəkət məhdudiyyəti yaşayan xəstələr üçün tövsiyə edilir.\n\n## Cərrahiyyə Proseduru\n\nDiz əvəzlənməsi cərrahiyyəsi adətən 1-2 saat çəkir və ümumi anesteziya altında həyata keçirilir. Cərrah zədələnmiş qığırdaq və sümük toxumasını çıxarır və onları metal, plastik və ya keramik komponentlərlə əvəz edir.\n\n## Bərpa Prosesi\n\nCərrahiyyədən sonra bərpa prosesi adətən 3-6 ay çəkir. İlk günlərdə fiziki terapiya başlayır və tədricən intensivlik artırılır. Xəstələr adətən 6-8 həftə sonra normal fəaliyyətlərinə qayıda bilərlər.\n\n## Gözlənilən Nəticələr\n\nDiz əvəzlənməsi cərrahiyyəsi çox uğurlu bir prosedurdur. Xəstələrin 95%-i ağrılarında əhəmiyyətli azalma və hərəkətlilikdə yaxşılaşma yaşayır. Modern implantlar 15-20 il və ya daha çox müddət davam edə bilər.",
      en: "Knee replacement surgery is a procedure where a damaged or diseased knee joint is replaced with an artificial implant. This surgery is typically recommended for patients experiencing severe pain and mobility limitations due to arthritis, trauma, or other knee problems.\n\n## Surgical Procedure\n\nKnee replacement surgery typically takes 1-2 hours and is performed under general anesthesia. The surgeon removes damaged cartilage and bone tissue and replaces them with metal, plastic, or ceramic components.\n\n## Recovery Process\n\nThe recovery process after surgery typically takes 3-6 months. Physical therapy begins in the first days and intensity is gradually increased. Patients can usually return to normal activities after 6-8 weeks.\n\n## Expected Outcomes\n\nKnee replacement surgery is a very successful procedure. 95% of patients experience significant pain reduction and improved mobility. Modern implants can last 15-20 years or more.",
      tr: "Diz protezi cerrahisi, hasarlı veya hastalıklı diz ekleminin yapay bir implantla değiştirildiği bir prosedürdür. Bu cerrahi genellikle artrit, travma veya diğer diz problemleri nedeniyle şiddetli ağrı ve hareket kısıtlılığı yaşayan hastalar için önerilir.\n\n## Cerrahi Prosedür\n\nDiz protezi cerrahisi genellikle 1-2 saat sürer ve genel anestezi altında gerçekleştirilir. Cerrah hasarlı kıkırdak ve kemik dokusunu çıkarır ve bunları metal, plastik veya seramik bileşenlerle değiştirir.\n\n## İyileşme Süreci\n\nCerrahi sonrası iyileşme süreci genellikle 3-6 ay sürer. İlk günlerde fizik tedavi başlar ve yoğunluk kademeli olarak artırılır. Hastalar genellikle 6-8 hafta sonra normal aktivitelerine dönebilirler.\n\n## Beklenen Sonuçlar\n\nDiz protezi cerrahisi çok başarılı bir prosedürdür. Hastaların %95'i ağrılarında önemli azalma ve hareket kabiliyetinde iyileşme yaşar. Modern implantlar 15-20 yıl veya daha fazla süre dayanabilir."
    },
    image: "https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    author: "Op. Dr. Gürkan Eryanılmaz",
    date: "2024-03-15",
    readTime: 8,
    category: categories[0]
  },
  {
    id: 2,
    slug: "pediatric-clubfoot-treatment",
    title: {
      az: "Uşaqlarda Əyripəncə Müalicəsi: Ponseti Metodu",
      en: "Pediatric Clubfoot Treatment: The Ponseti Method",
      tr: "Çocuklarda Çarpık Ayak Tedavisi: Ponseti Yöntemi"
    },
    excerpt: {
      az: "Əyripəncə deformasiyasının müalicəsində qızıl standart olan Ponseti metodunun üstünlükləri və tətbiq prosesi.",
      en: "The advantages and application process of the Ponseti method, the gold standard in clubfoot deformity treatment.",
      tr: "Çarpık ayak deformitesi tedavisinde altın standart olan Ponseti yönteminin avantajları ve uygulama süreci."
    },
    content: {
      az: "Əyripəncə (talipes equinovarus) yenidoğanlarda ən çox rast gəlinən ayaq deformasiyasıdır. Bu vəziyyət ayağın içəriyə və aşağıya doğru bükülməsi ilə xarakterizə olunur.\n\n## Ponseti Metodu\n\nPonseti metodu 1950-ci illərdə Dr. Ignacio Ponseti tərəfindən inkişaf etdirilmişdir. Bu metod tədricən düzəltmə, alçı və tenotomiya kombinasiyasını istifadə edir.\n\n### Müalicə Mərhələləri:\n\n1. **Alçı Mərhələsi**: 6-8 həftə ərzində həftəlik alçı dəyişikliyi\n2. **Tenotomiya**: Kiçik cərrahi prosedur\n3. **Dəstək Mərhələsi**: 4-5 il ərzində gecə dəstəyi\n\n## Nəticələr\n\nPonseti metodu ilə müalicə edilən uşaqların 95%-i normal və ya normal yaxın ayaq funksiyasına malik olur. Bu metod cərrahi müdaxilənin ehtiyacını əhəmiyyətli dərəcədə azaldır.",
      en: "Clubfoot (talipes equinovarus) is the most common foot deformity in newborns. This condition is characterized by the foot being bent inward and downward.\n\n## The Ponseti Method\n\nThe Ponseti method was developed by Dr. Ignacio Ponseti in the 1950s. This method uses a combination of gradual correction, casting, and tenotomy.\n\n### Treatment Stages:\n\n1. **Casting Phase**: Weekly cast changes for 6-8 weeks\n2. **Tenotomy**: Minor surgical procedure\n3. **Bracing Phase**: Night bracing for 4-5 years\n\n## Results\n\n95% of children treated with the Ponseti method achieve normal or near-normal foot function. This method significantly reduces the need for surgical intervention.",
      tr: "Çarpık ayak (talipes equinovarus) yenidoğanlarda en sık görülen ayak deformitesidir. Bu durum ayağın içe ve aşağıya doğru bükülmesi ile karakterizedir.\n\n## Ponseti Yöntemi\n\nPonseti yöntemi 1950'lerde Dr. Ignacio Ponseti tarafından geliştirilmiştir. Bu yöntem kademeli düzeltme, alçılama ve tenotomi kombinasyonunu kullanır.\n\n### Tedavi Aşamaları:\n\n1. **Alçılama Aşaması**: 6-8 hafta boyunca haftalık alçı değişimi\n2. **Tenotomi**: Küçük cerrahi prosedür\n3. **Destekleme Aşaması**: 4-5 yıl boyunca gece desteği\n\n## Sonuçlar\n\nPonseti yöntemi ile tedavi edilen çocukların %95'i normal veya normale yakın ayak fonksiyonuna sahip olur. Bu yöntem cerrahi müdahale ihtiyacını önemli ölçüde azaltır."
    },
    image: "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    author: "Op. Dr. Gürkan Eryanılmaz",
    date: "2024-03-10",
    readTime: 6,
    category: categories[1]
  },
  {
    id: 3,
    slug: "acl-injury-prevention-athletes",
    title: {
      az: "İdmançılarda ACL Zədələrinin Qarşısının Alınması",
      en: "ACL Injury Prevention in Athletes",
      tr: "Sporcularda ACL Yaralanmalarının Önlenmesi"
    },
    excerpt: {
      az: "İdmançılarda ön çarpaz bağ (ACL) zədələrinin qarşısının alınması üçün effektiv strategiyalar və məşq proqramları.",
      en: "Effective strategies and training programs for preventing anterior cruciate ligament (ACL) injuries in athletes.",
      tr: "Sporcularda ön çapraz bağ (ACL) yaralanmalarının önlenmesi için etkili stratejiler ve antrenman programları."
    },
    content: {
      az: "ACL zədələri idmançılar arasında ən çox rast gəlinən və ən ciddi zədələrdən biridir. Bu zədələrin qarşısının alınması üçün düzgün məşq və hazırlıq çox vacibdir.\n\n## Risk Faktorları\n\n- Qadın idmançılarda daha yüksək risk\n- Əvvəlki zədələr\n- Zəif əzələ balansı\n- Düzgün olmayan eniş texnikası\n\n## Qarşısının Alınması Strategiyaları\n\n### 1. Gücləndirilmə Məşqləri\n- Quadriceps və hamstring əzələlərinin balansı\n- Core stabilizasiyası\n- Gluteal əzələlərin gücləndirilməsi\n\n### 2. Plyometric Məşqlər\n- Düzgün eniş texnikası\n- Diz valgusunun azaldılması\n- Reaktiv güc inkişafı\n\n### 3. Proprioseptiv Məşqlər\n- Balans və koordinasiya\n- Oynaq pozisiya hissi\n- Reaktiv stabilizasiya\n\n## FIFA 11+ Proqramı\n\nFIFA 11+ proqramı ACL zədələrinin qarşısının alınmasında sübut edilmiş effektivliyə malikdir. Bu proqram 15-20 dəqiqəlik istilik məşqləri, gücləndirilmə və balans məşqlərini əhatə edir.",
      en: "ACL injuries are among the most common and serious injuries in athletes. Proper training and preparation are crucial for preventing these injuries.\n\n## Risk Factors\n\n- Higher risk in female athletes\n- Previous injuries\n- Poor muscle balance\n- Improper landing technique\n\n## Prevention Strategies\n\n### 1. Strengthening Exercises\n- Balance of quadriceps and hamstring muscles\n- Core stabilization\n- Gluteal muscle strengthening\n\n### 2. Plyometric Training\n- Proper landing technique\n- Reduction of knee valgus\n- Reactive strength development\n\n### 3. Proprioceptive Training\n- Balance and coordination\n- Joint position sense\n- Reactive stabilization\n\n## FIFA 11+ Program\n\nThe FIFA 11+ program has proven effectiveness in preventing ACL injuries. This program includes 15-20 minutes of warm-up exercises, strengthening and balance training.",
      tr: "ACL yaralanmaları sporcular arasında en sık görülen ve en ciddi yaralanmalardan biridir. Bu yaralanmaların önlenmesi için doğru antrenman ve hazırlık çok önemlidir.\n\n## Risk Faktörleri\n\n- Kadın sporcularda daha yüksek risk\n- Önceki yaralanmalar\n- Zayıf kas dengesi\n- Yanlış iniş tekniği\n\n## Önleme Stratejileri\n\n### 1. Güçlendirme Egzersizleri\n- Quadriceps ve hamstring kaslarının dengesi\n- Core stabilizasyonu\n- Gluteal kasların güçlendirilmesi\n\n### 2. Pliometrik Antrenman\n- Doğru iniş tekniği\n- Diz valgusunun azaltılması\n- Reaktif güç gelişimi\n\n### 3. Proprioseptif Antrenman\n- Denge ve koordinasyon\n- Eklem pozisyon hissi\n- Reaktif stabilizasyon\n\n## FIFA 11+ Programı\n\nFIFA 11+ programı ACL yaralanmalarının önlenmesinde kanıtlanmış etkinliğe sahiptir. Bu program 15-20 dakikalık ısınma egzersizleri, güçlendirme ve denge antrenmanını içerir."
    },
    image: "https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    author: "Op. Dr. Gürkan Eryanılmaz",
    date: "2024-03-05",
    readTime: 7,
    category: categories[2]
  },
  {
    id: 4,
    slug: "arthroscopic-shoulder-surgery-benefits",
    title: {
      az: "Artroskopik Çiyin Cərrahiyyəsinin Üstünlükləri",
      en: "Benefits of Arthroscopic Shoulder Surgery",
      tr: "Artroskopik Omuz Cerrahisinin Avantajları"
    },
    excerpt: {
      az: "Artroskopik çiyin cərrahiyyəsinin ənənəvi açıq cərrahiyyəyə nisbətən üstünlükləri və tətbiq sahələri.",
      en: "Advantages of arthroscopic shoulder surgery compared to traditional open surgery and its applications.",
      tr: "Artroskopik omuz cerrahisinin geleneksel açık cerrahiye göre avantajları ve uygulama alanları."
    },
    content: {
      az: "Artroskopik cərrahiyyə minimal invaziv bir texnikadır ki, bu da kiçik kəsiklər vasitəsilə çiyin oynağının müayinəsi və müalicəsini təmin edir.\n\n## Artroskopik Cərrahiyyənin Üstünlükləri\n\n### 1. Minimal İnvaziv Yanaşma\n- Kiçik kəsiklər (5-10mm)\n- Az toxuma zədəsi\n- Kosmetik üstünlük\n\n### 2. Sürətli Bərpa\n- Qısa xəstəxana qalma müddəti\n- Erkən mobilizasiya\n- İş fəaliyyətinə tez qayıdış\n\n### 3. Az Ağrı\n- Postoperativ ağrının azalması\n- Az ağrı kəsici ehtiyacı\n- Komfort artımı\n\n## Tətbiq Sahələri\n\n- Rotator manşet cırıqları\n- Çiyin sıxılması sindromu\n- Labral cırıqlar\n- Çiyin qeyri-sabitliyi\n- Donmuş çiyin\n\n## Prosedur\n\nArtroskopik cərrahiyyə ümumi anesteziya altında həyata keçirilir. Cərrah 2-4 kiçik kəsik edir və artroskop (kiçik kamera) vasitəsilə oynağı müayinə edir və lazımi təmiri aparır.",
      en: "Arthroscopic surgery is a minimally invasive technique that allows examination and treatment of the shoulder joint through small incisions.\n\n## Advantages of Arthroscopic Surgery\n\n### 1. Minimally Invasive Approach\n- Small incisions (5-10mm)\n- Less tissue damage\n- Cosmetic advantage\n\n### 2. Faster Recovery\n- Short hospital stay\n- Early mobilization\n- Quick return to work\n\n### 3. Less Pain\n- Reduced postoperative pain\n- Less need for pain medication\n- Increased comfort\n\n## Applications\n\n- Rotator cuff tears\n- Shoulder impingement syndrome\n- Labral tears\n- Shoulder instability\n- Frozen shoulder\n\n## Procedure\n\nArthroscopic surgery is performed under general anesthesia. The surgeon makes 2-4 small incisions and uses an arthroscope (small camera) to examine the joint and perform necessary repairs.",
      tr: "Artroskopik cerrahi, küçük kesiler yoluyla omuz ekleminin muayene ve tedavisini sağlayan minimal invaziv bir tekniktir.\n\n## Artroskopik Cerrahinin Avantajları\n\n### 1. Minimal İnvaziv Yaklaşım\n- Küçük kesiler (5-10mm)\n- Az doku hasarı\n- Kozmetik avantaj\n\n### 2. Hızlı İyileşme\n- Kısa hastane kalış süresi\n- Erken mobilizasyon\n- İş hayatına hızlı dönüş\n\n### 3. Az Ağrı\n- Postoperatif ağrının azalması\n- Az ağrı kesici ihtiyacı\n- Konfor artışı\n\n## Uygulama Alanları\n\n- Rotator manşet yırtıkları\n- Omuz sıkışma sendromu\n- Labral yırtıklar\n- Omuz instabilitesi\n- Donuk omuz\n\n## Prosedür\n\nArtroskopik cerrahi genel anestezi altında gerçekleştirilir. Cerrah 2-4 küçük kesi yapar ve artroskop (küçük kamera) yardımıyla eklemi muayene eder ve gerekli onarımı yapar."
    },
    image: "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    author: "Op. Dr. Gürkan Eryanılmaz",
    date: "2024-02-28",
    readTime: 5,
    category: categories[3]
  },
  {
    id: 5,
    slug: "hip-dysplasia-early-detection",
    title: {
      az: "Bud Displaziyasının Erkən Aşkarlanması",
      en: "Early Detection of Hip Dysplasia",
      tr: "Kalça Displazisinin Erken Tespiti"
    },
    excerpt: {
      az: "Yenidoğanlarda bud displaziyasının erkən aşkarlanması və müalicəsinin əhəmiyyəti.",
      en: "The importance of early detection and treatment of hip dysplasia in newborns.",
      tr: "Yenidoğanlarda kalça displazisinin erken tespiti ve tedavisinin önemi."
    },
    content: {
      az: "İnkişaf bud displaziyası (DDH) yenidoğanlarda ən çox rast gəlinən ortopedik problemlərdən biridir. Erkən aşkarlama və müalicə uzunmüddətli problemlərin qarşısını alır.\n\n## Risk Faktorları\n\n- Ailə tarixçəsi\n- Qız uşaqlar (4:1 nisbəti)\n- Breech təqdimat\n- İlk doğuş\n- Oligohidramnios\n\n## Klinik Müayinə\n\n### Ortolani Testi\nÇıxmış budun yerinə qaytarılması\n\n### Barlow Testi\nSabit budun çıxarılması\n\n### Asimmetriya Əlamətləri\n- Qıvrım asimmetriyası\n- Ayaq uzunluğu fərqi\n- Məhdud abduksiya\n\n## Görüntüləmə\n\n- **0-4 ay**: Ultrasonoqrafiya\n- **4+ ay**: Rentgen\n\n## Müalicə\n\n### Erkən Müalicə (0-6 ay)\n- Pavlik koşum sistemi\n- Uğur dərəcəsi: 85-95%\n\n### Gec Müalicə (6+ ay)\n- Kapalı reduksiya + spica cast\n- Açıq reduksiya (lazım olduqda)\n\nErkən müalicə ilə uşaqların əksəriyyəti normal bud inkişafına malik olur.",
      en: "Developmental hip dysplasia (DDH) is one of the most common orthopedic problems in newborns. Early detection and treatment prevents long-term problems.\n\n## Risk Factors\n\n- Family history\n- Female gender (4:1 ratio)\n- Breech presentation\n- First birth\n- Oligohydramnios\n\n## Clinical Examination\n\n### Ortolani Test\nReduction of dislocated hip\n\n### Barlow Test\nDislocation of stable hip\n\n### Asymmetry Signs\n- Fold asymmetry\n- Leg length difference\n- Limited abduction\n\n## Imaging\n\n- **0-4 months**: Ultrasonography\n- **4+ months**: X-ray\n\n## Treatment\n\n### Early Treatment (0-6 months)\n- Pavlik harness\n- Success rate: 85-95%\n\n### Late Treatment (6+ months)\n- Closed reduction + spica cast\n- Open reduction (if necessary)\n\nWith early treatment, most children achieve normal hip development.",
      tr: "Gelişimsel kalça displazisi (GKD) yenidoğanlarda en sık görülen ortopedik problemlerden biridir. Erken tespit ve tedavi uzun vadeli sorunları önler.\n\n## Risk Faktörleri\n\n- Aile öyküsü\n- Kız cinsiyet (4:1 oranı)\n- Makat geliş\n- İlk doğum\n- Oligohidramnios\n\n## Klinik Muayene\n\n### Ortolani Testi\nÇıkık kalçanın yerine konması\n\n### Barlow Testi\nStabil kalçanın çıkarılması\n\n### Asimetri Belirtileri\n- Kıvrım asimetrisi\n- Bacak uzunluğu farkı\n- Sınırlı abdüksiyon\n\n## Görüntüleme\n\n- **0-4 ay**: Ultrasonografi\n- **4+ ay**: Röntgen\n\n## Tedavi\n\n### Erken Tedavi (0-6 ay)\n- Pavlik koşum takımı\n- Başarı oranı: %85-95\n\n### Geç Tedavi (6+ ay)\n- Kapalı redüksiyon + spica alçı\n- Açık redüksiyon (gerekirse)\n\nErken tedavi ile çocukların çoğu normal kalça gelişimine sahip olur."
    },
    image: "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    author: "Op. Dr. Gürkan Eryanılmaz",
    date: "2024-02-20",
    readTime: 6,
    category: categories[1]
  }
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getRecentBlogPosts = (count: number = 3): BlogPost[] => {
  return blogPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
};

export const getBlogPostsByCategory = (categoryId: number): BlogPost[] => {
  return blogPosts.filter(post => post.category.id === categoryId);
};